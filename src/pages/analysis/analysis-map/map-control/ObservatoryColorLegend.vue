<template>
  <div>
    <v-row no-gutters>
      <template v-for="(item, index) in colorLegend">
        <v-col
          v-if="isVisibleType(item.type)"
          cols="auto"
          :key="index"
          class="color-legend ml-2"
        >
          <v-row no-gutters align="center">
            <v-col class="unit" v-if="item.title">{{ item.title }}</v-col>
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
        </v-col>
      </template>
    </v-row>
  </div>
</template>

<script>
import { rootGetters } from "@/store/store-functions";
import { Observatory } from "@/enums/Observatory";
import _ from "lodash";

export default {
  name: "ObservatoryColorLegend",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      colorLegend: [
        {
          title: "水位",
          show: true,
          type: Observatory.RIVER_LEVEL,
          colors: [
            { color: "#000000", value: "氾濫発生水位" },
            { color: "#AD02AD", value: "氾濫危険水位" },
            { color: "#FF2800", value: "避難判断水位" },
            { color: "#f2e700", value: "氾濫注意水位" },
            { color: "#008000", value: "水防団待機水位" },
            { color: "#22b022", value: "観測開始水位" },
            { color: "#ffffff", value: "平常" },
            { color: "#AAAAAA", value: "休止・欠測等" },
          ],
        },
        {
          title: "雨量",
          show: true,
          type: Observatory.RAIN,
          colors: null,
        },
      ],
    };
  },
  computed: {
    filter() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
          this.analysisMapData.storeId
      ).filter;
    },
    markerDataType() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
          this.analysisMapData.storeId
      ).markerDataType;
    },
    hideMenu() {
      return this.$store.getters[rootGetters.HIDE_MENU];
    },
  },
  watch: {
    markerDataType() {
      this.colorLegend[1].colors = this.getRainColor();
    },
  },
  created() {
    this.colorLegend[1].colors = this.getRainColor();

    _.forEach(this.colorLegend, (o) => {
      o.show = !this.hideMenu;
    });
  },
  methods: {
    isArray(o) {
      return Array.isArray(o);
    },
    isVisibleType(type) {
      return _.findIndex(this.filter, type) !== -1;
    },
    getRainColor() {
      const rain10 = [
        { color: "#800080", value: "20mm以上" },
        { color: "#FF0000", value: "10mm以上" },
        { color: "#D88100", value: "5mm以上" },
        { color: "#1E42AF", value: "1mm以上" },
        { color: "#ffffff", value: "1mm未満" },
        { color: "#AAAAAA", value: "休止・欠測等" },
      ];
      const rainTotal = [
        { color: "#800080", value: "80mm以上" },
        { color: "#FF0000", value: "50mm以上" },
        { color: "#D88100", value: "30mm以上" },
        { color: "#1E42AF", value: "20mm以上" },
        { color: "#2a7aaa", value: "1mm以上" },
        { color: "#ffffff", value: "1mm未満" },
        { color: "#AAAAAA", value: "休止・欠測等" },
      ];
      return this.markerDataType === 0 ? rain10 : rainTotal;
    },
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
  float: right;
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
