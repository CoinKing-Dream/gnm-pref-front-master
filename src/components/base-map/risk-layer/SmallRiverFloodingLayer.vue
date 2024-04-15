<template>
  <div>
    <image-layer
      :bounds-list="smallRiverFloodingRisk.data.boundsList"
      :selected-date-risk-data="selectedDateRiskData"
    ></image-layer>
    <geojson-layer
      v-if="smallRiverFloodingRisk.data.contents.length !== 0"
      :selected-date-risk-data="selectedDateRiskData"
    ></geojson-layer>
    <flood-inundated-dike-break :level="level" :filter="ids"></flood-inundated-dike-break>
  </div>
</template>
<script>
import { rootActions, rootGetters } from "../../../store/store-functions";
import _ from "lodash";
import { Risk } from "../../../enums/Risk";
import moment from "moment";
import ImageLayer from "@/components/base-map/risk-layer/flooding-layers/ImageLayer";
import GeojsonLayer from "@/components/base-map/risk-layer/flooding-layers/GeojsonLayer";
import FloodInundatedDikeBreak from "@/components/base-map/feature-layer/FloodInundatedDikeBreakLayer";

export default {
  name: "SmallRiverFloodingLayer",
  components: {FloodInundatedDikeBreak, GeojsonLayer, ImageLayer },
  inject: {
    baseMapData: {
      default: [],
    },
  },
  data() {
    return {
      sampleBounds: [
        [36.166667, 139.75],
        [36.416667, 138.75],
      ],
      ids: []
    };
  },
  computed: {
    smallRiverFloodingRisk() {
      return this.$store.getters[rootGetters.FIND_RISK](
        Risk.SMALL_RIVER_FLOODING, this.baseMapData.storeId
      );
    },
    selectedDate() {
      return this.$store.getters[rootGetters.SELECTED_DATE](
        this.baseMapData.storeId
      );
    },
    contents() {
      return this.smallRiverFloodingRisk.data.contents;
    },
    selectedDateRiskData() {
      const selectedDateRiskData = _.find(this.contents, (o) => {
        return this.selectedDate.isSame(moment.utc(o.date, "YYYY/MM/DD HH:mm"));
      });

      if (!selectedDateRiskData) {
        return this.contents[0];
      } else {
        return selectedDateRiskData;
      }
    },
    baseDate() {
      return this.$store.getters[rootGetters.BASE_DATE](
        this.baseMapData.storeId
      );
    },
    type() {
      return this.$store.getters[rootGetters.SMALL_RIVER_FLOODING_OPTIONS](
        this.baseMapData.storeId
      ).type;
    },
    level() {
      return this.$store.getters[rootGetters.SMALL_RIVER_FLOODING_OPTIONS](
          this.baseMapData.storeId
      ).level;
    },
  },
  watch: {
    async baseDate() {
      await this.loadData();
      this.getIds();
    },
    async type() {
      await this.loadData();
      this.getIds();
    },
  },
  async created() {
    await this.loadData();
    this.getIds();
  },
  methods: {
    async loadData() {
      await this.$store.dispatch(rootActions.LOAD_SMALL_RIVER_FLOODING, {
        storeId: this.baseMapData.storeId,
        type: this.type,
      });
    },
    getIds() {
      this.ids = _.map(this.selectedDateRiskData.lines.features, (feature) => {
        return feature.properties._id
      });
    }
  },
};
</script>

<style scoped></style>
