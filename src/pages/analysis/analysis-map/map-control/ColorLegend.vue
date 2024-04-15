<template>
  <div v-if="colorLegend">
    <div v-if="!isArray(colorLegend)">
      <template v-if="colorLegend.title !== null">
        <v-row no-gutters align="center">
          <v-col class="unit" v-if="colorLegend.title">{{
              colorLegend.title
            }}</v-col>
          <v-col>
            <v-btn icon small @click="colorLegend.show = !colorLegend.show">
              <v-icon small>
                {{
                  colorLegend.show
                      ? "mdi-arrow-up-drop-circle"
                      : "mdi-arrow-down-drop-circle"
                }}
              </v-icon>
            </v-btn>
          </v-col>
        </v-row>
        <div class="legend-area" v-if="colorLegend.show">
          <div class="legend">
            <div
                v-for="(o, index) in colorLegend.colors"
                :key="index"
                class="color"
                :style="{ backgroundColor: o.color }"
            >
              {{ o.value }}
            </div>
          </div>
        </div>
      </template>
    </div>
    <v-row v-else no-gutters>
      <template v-for="(item, index) in colorLegend">
        <v-col cols="auto" class="color-legend ml-2" :key="index">
          <v-row no-gutters align="center">
            <v-col class="unit" v-if="item.title">{{ item.title }}</v-col>
            <v-col>
              <v-btn icon small @click="item.show = !item.show">
                <v-icon small>
                  {{
                    item.show
                        ? "mdi-arrow-up-drop-circle"
                        : "mdi-arrow-down-drop-circle"
                  }}
                </v-icon>
              </v-btn>
            </v-col>
          </v-row>
          <div class="legend" v-if="item.show">
            <div
                v-for="(o, colorIndex) in item.colors"
                :key="colorIndex"
                class="color"
                :style="{ backgroundColor: o.color }"
            >
              {{ o.value }}
            </div>
          </div>
          <div class="text" v-if="item.text">{{ item.text }}</div>
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script>
import { rootGetters } from "../../../../store/store-functions";
import _ from "lodash";
import { Risk } from "../../../../enums/Risk";

export default {
  name: "ColorLegend",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      colorLegend: null,
      legends: [
        {
          type: Risk.RAIN,
          show: true,
          colorLegends: [
            {
              title: "レーダ・予測雨量\n(mm/h)",
              colors: [
                { color: "#ba206e", value: "80~" },
                { color: "#ff3700", value: "50~80" },
                { color: "#ffa021", value: "30~50" },
                { color: "#fbf43c", value: "20~30" },
                { color: "#0041FF", value: "10~20" },
                { color: "#218CFF", value: "5~10" },
                { color: "#A0D2FF", value: "1~5" },
                { color: "#99FFFF", value: "0~1" },
              ],
            },
          ],
        },
        {
          type: Risk.DOSYA,
          show: true,
          colorLegends: [
            {
              title: "土砂災害警戒判定値",
              colors: [
                { color: "rgba(12,0,12)", value: "災害切迫　　【5】" },
                { color: "rgba(170,0,170)", value: "危険　　　　【4】" },
                { color: "rgba(255,40,0)", value: "警戒　　　　【3】" },
                { color: "rgba(242,231,0)", value: "注意　　　　【2】" },
                { color: "#FFFFFF", value: "今後の情報等に留意" },
              ],
              text: "※【 】内は相当する警戒レベル",
            },
          ],
        },
        {
          type: Risk.KOUZUI,
          colorLegends: [
            {
              title: "洪水警報の危険度分布",
              show: true,
              colors: [
                { color: "rgba(12,0,12)", value: "災害切迫　　【5】" },
                { color: "rgba(170,0,170)", value: "危険　　　　【4】" },
                { color: "rgba(255,40,0)", value: "警戒　　　　【3】" },
                { color: "rgba(242,231,0)", value: "注意　　　　【2】" },
                { color: "rgba(60,255,255)", value: "今後の情報等に留意" },
              ],
              text: "※【 】内は相当する警戒レベル",
            },
            {
              title: "指定河川洪水予報",
              show: true,
              colors: [
                { color: "rgba(12,0,12)", value: "氾濫発生情報　【5】" },
                { color: "rgba(170,0,170)", value: "氾濫危険情報　【4】" },
                { color: "rgba(255,40,0)", value: "氾濫警戒情報　【3】" },
                { color: "rgba(242,231,0)", value: "氾濫注意情報　【2】" },
                { color: "rgba(60,255,255)", value: "発表なし" },
              ],
              text: "※【 】内は相当する警戒レベル",
            },
          ],
        },
        {
          type: Risk.SMALL_RIVER_FLOODING,
          colorLegends: [
            {
              title: "浸水リスク(m)",
              show: true,
              colors: [
                { color: "rgb(0,112,255)", value: "2.0 ~" },
                { color: "rgb(45,193,223)", value: "1.5 ~ 2.0" },
                { color: "rgb(115,255,222)", value: "1.0 ~ 1.5" },
                { color: "rgb(67,230,0)", value: "0.5 ~ 1.0" },
                { color: "rgb(255,255,0)", value: "0.05 ~ 0.5" },
              ],
            },
            {
              title: "河川危険度",
              show: true,
              colors: [
                { color: "black", value: "この時間で越水の恐れ" },
                { color: "red", value: "1時間以内に越水の恐れ" },
                { color: "yellow", value: "6時間以内に越水の恐れ" },
              ],
            },
          ],
        }
      ],
    };
  },
  computed: {
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
          this.analysisMapData.storeId
      );
    },
    hideMenu() {
      return this.$store.getters[rootGetters.HIDE_MENU];
    },
  },
  watch: {
    selectedRisk() {
      this.updateColorLegend();
      this.updateShow();
    },
  },
  mounted() {
    this.updateColorLegend();
    this.updateShow();
  },
  methods: {
    isArray(o) {
      return Array.isArray(o);
    },
    updateColorLegend() {
      const temp = _.find(this.legends, { type: this.selectedRisk.type });
      if (temp) {
        this.colorLegend = temp.colorLegends;
      }
    },
    updateShow() {
      if (!this.isArray(this.colorLegend)) {
        this.colorLegend.show = !this.hideMenu;
      } else {
        _.forEach(this.colorLegend, (o, i) => {
          o.show = !this.hideMenu;
        });
      }
    }
  },
};
</script>

<style scoped>
.color-legend {
  clear: both;
}
.legend {
  width: fit-content;
  text-align: right;
  margin-left: auto;
  margin-right: 0;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
  0 1px 5px 0 rgba(0, 0, 0, 0.12);
  border-radius: 5px;
}
.unit {
  font-size: 12px;
  font-weight: bold;
  white-space: pre;
  text-shadow: 2px 2px 0 #ffffff, -2px 2px 0 #ffffff, 2px -2px 0 #ffffff,
  -2px -2px 0 #ffffff;
}
.color {
  color: #ffffff;
  text-shadow: 1px 1px 0 #000000, -1px 1px 0 #000000, 1px -1px 0 #000000,
  -1px -1px 0 #000000;
  font-weight: bold;
  font-size: 12px;
  min-width: 15px;
  text-align: center;
  line-height: 1;
  padding: 2px 10px;
}
.color:first-child {
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
.color:last-child {
  border-bottom-right-radius: 4px;
  border-bottom-left-radius: 4px;
}
.text {
  font-size: 12px;
  text-shadow: 2px 2px 0 #ffffff, -2px 2px 0 #ffffff, 2px -2px 0 #ffffff,
  -2px -2px 0 #ffffff;
}
</style>
