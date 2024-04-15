<template>
  <v-row no-gutters>
    <template v-for="(item, index) in legends">
      <v-col
        cols="auto"
        :key="index"
        v-if="selectedFeatures && selectedFeatures.includes(item.type)"
        class="color-legend ml-1"
      >
        <v-row no-gutters align="center">
          <v-col class="unit">{{ item.title }}</v-col>
          <v-col cols="auto">
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
        <div v-if="item.colorLegends && item.show" class="legend">
          <div
            v-for="(colorLegend, colorLegendIndex) in item.colorLegends"
            :key="colorLegendIndex"
            class="mb-1"
          >
            <div class="unit">{{ colorLegend.title }}</div>
            <div
              v-for="(o, colorIndex) in colorLegend.colors"
              :key="colorIndex"
              class="color"
              :style="{ backgroundColor: o.color }"
            >
              {{ o.value }}
            </div>
          </div>
        </div>
        <template v-else-if="item.colors">
          <div class="legend">
            <div
              v-for="(o, colorIndex) in item.colors"
              :key="colorIndex"
              class="color"
              :style="{ backgroundColor: o.color }"
            >
              {{ o.value }}
            </div>
          </div>
        </template>
        <template v-else-if="item.url && item.show">
          <div class="legend">
            <img :src="item.url" height="30" width="40" alt="usageGuide">
          </div>
        </template>
      </v-col>
    </template>
  </v-row>
</template>

<script>
import { Feature } from "../../../../enums/Feature";
import { rootGetters } from "../../../../store/store-functions";
import _ from "lodash";

export default {
  name: "FeatureColorLegend",
  inject: {
    analysisMapData: {
      default: []
    }
  },
  data() {
    return {
      legends: [
        {
          type: Feature.SAND_WARNING_AREA,
          title: Feature.SAND_WARNING_AREA.string,
          show: true,
          colorLegends: [
            {
              title: "特別警戒区域",
              colors: [
                { color: "rgb(203,76,147)", value: "地滑り" },
                { color: "rgb(193,76,98)", value: "土石流" },
                { color: "rgb(252,104,77)", value: "急傾斜地の崩壊" }
              ]
            },
            {
              title: "警戒区域",
              colors: [
                { color: "rgb(255,183,84)", value: "地滑り" },
                { color: "rgb(238,216,118)", value: "土石流" },
                { color: "rgb(255,237,90)", value: "急傾斜地の崩壊" }
              ]
            }
          ]
        },
        {
          type: Feature.FLOOD_INUNDATED_AREA_1,
          title: "洪水浸水想定区域\n想定浸水深" + "(m)",
          show: true,
          colorLegends: [
            {
              colors: [
                { color: "rgb(220, 122, 220)", value: "20.0~" },
                { color: "rgb(242, 133, 201)", value: "10.0~20.0" },
                { color: "rgb(255, 145, 145)", value: "5.0~10.0" },
                { color: "rgb(255, 183, 183)", value: "3.0~5.0" },
                { color: "rgb(255, 216, 192)", value: "0.5~3.0" },
                { color: "rgb(247, 245, 169)", value: "~0.5" },
              ]
            },
          ]
        },
        {
          type: Feature.FLOOD_INUNDATED_AREA_2,
          title: "洪水浸水想定区域\n想定浸水深" + "(m)",
          show: true,
          colorLegends: [
            {
              colors: [
                { color: "rgb(220, 122, 220)", value: "20.0~" },
                { color: "rgb(242, 133, 201)", value: "10.0~20.0" },
                { color: "rgb(255, 145, 145)", value: "5.0~10.0" },
                { color: "rgb(255, 183, 183)", value: "3.0~5.0" },
                { color: "rgb(255, 216, 192)", value: "0.5~3.0" },
                { color: "rgb(247, 245, 169)", value: "~0.5" },
              ]
            },
          ]
        },
        {
          type: Feature.FLOOD_DURATION,
          title: Feature.FLOOD_DURATION.string,
          show: true,
          colorLegends: [
            {
              colors: [
                { color: "rgb(96, 0, 96)", value: "4週間〜" },
                { color: "rgb(180, 0, 104)", value: "2週間〜4週間" },
                { color: "rgb(255, 40, 0)", value: "1週間〜2週間" },
                { color: "rgb(255, 153, 0)", value: "3日〜1週間" },
                { color: "rgb(250, 245, 0)", value: "1日〜3日" },
                { color: "rgb(0, 65, 255)", value: "12時間〜1日" },
                { color: "rgb(160, 210, 255)", value: "~12時間" },
              ]
            },
          ]
        },
        {
          type: Feature.HOUSE_COLLAPSE_1,
          title: Feature.HOUSE_COLLAPSE_1.string,
          show: true,
          url: "https://disaportal.gsi.go.jp/hazardmap/copyright/img/kaokutoukai_hanran.png"
        },
        {
          type: Feature.HOUSE_COLLAPSE_2,
          title: Feature.HOUSE_COLLAPSE_2.string,
          show: true,
          url: "https://disaportal.gsi.go.jp/hazardmap/copyright/img/kaokutoukai_kagan.png"
        },
        {
          type: Feature.HAIRYOSYA,
          title: Feature.HAIRYOSYA.string,
          show: true,
          colorLegends: [
            {
              colors: [
                { color: "red", value: "福祉" },
                { color: "green", value: "教育" },
                { color: "blue", value: "医療" },
              ]
            },
          ]
        },
        {
          type: Feature.FLOOD_INUNDATED_DIKE_BREAK_1,
          title: Feature.FLOOD_INUNDATED_DIKE_BREAK_1.string,
          show: true,
          colorLegends: [
            {
              colors: [
                { color: "#152F67", value: "5.0~" },
                { color: "#3A70AF", value: "3.0~5.0" },
                { color: "#7DABCD", value: "1.0~3.0" },
                { color: "#CADAEE", value: "0.5~1.0" },
                { color: "#F8FAFF", value: "~0.5" },
              ]
            },
          ]
        },
        {
          type: Feature.FLOOD_INUNDATED_DIKE_BREAK_2,
          title: Feature.FLOOD_INUNDATED_DIKE_BREAK_2.string,
          show: true,
          colorLegends: [
            {
              colors: [
                { color: "#152F67", value: "5.0~" },
                { color: "#3A70AF", value: "3.0~5.0" },
                { color: "#7DABCD", value: "1.0~3.0" },
                { color: "#CADAEE", value: "0.5~1.0" },
                { color: "#F8FAFF", value: "~0.5" },
              ]
            },
          ]
        },
        {
          type: Feature.FLOOD_PREVENTION_SITE,
          title: Feature.FLOOD_PREVENTION_SITE.string,
          show: true,
          colorLegends: [
            {
              colors: [
                { color: "red", value: "堤防高_A" },
                { color: "green", value: "堤防高_B" },
                { color: "#ff4040", value: "堤防断面_A" },
                { color: "#00a000", value: "堤防断面_B" },
                { color: "#ff6060", value: "法崩れ・すべり_A" },
                { color: "#00c000", value: "法崩れ・すべり_B" },
                { color: "#ff8080", value: "漏水_A" },
                { color: "#00e000", value: "漏水_B" },
                { color: "#ffa0a0", value: "水衝_A" },
                { color: "#00ff00", value: "水衝_B" },
                { color: "#ff00ff", value: "工作物_A" },
                { color: "#aaaa00", value: "新堤防_要注" },
              ],
            },
          ],
        },
      ]
    };
  },
  computed: {
    selectedFeatures() {
      return this.$store.getters[rootGetters.SELECTED_FEATURES](
        this.analysisMapData.storeId
      );
    },
    hideMenu() {
      return this.$store.getters[rootGetters.HIDE_MENU];
    },
  },
  created() {
    _.forEach(this.legends, (o) => {
      o.show = !this.hideMenu;
    });
  }
};
</script>

<style scoped>
.color-legend {
  clear: both;
}
.legend {
  width: fit-content;
  text-align: right;
  float: right;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
  0 1px 5px 0 rgba(0, 0, 0, 0.12);
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
</style>
