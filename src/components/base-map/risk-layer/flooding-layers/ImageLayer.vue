<template>
  <div>
    <template v-for="i in 5" >
    <l-image-overlay
        :key="i"
        v-if="selectedDateRiskData && selectedDateRiskData.images"
        :bounds="boundsList[i-1]"
        :url="selectedDateRiskData.images[i-1].src"
        :opacity="opacity"
    >
    </l-image-overlay>
    </template>
  </div>
</template>
<script>
import LImageOverlay from "vue2-leaflet/src/components/LImageOverlay";
import {
  rootGetters,
} from "../../../../store/store-functions";

export default {
  name: "ImageLayer",
  components: { LImageOverlay },
  inject: {
    baseMapData: {
      default: [],
    },
  },
  props: {
    selectedDateRiskData: {
      type: Object,
      require: true,
    },
    boundsList: {
      type: Array,
      require: true,
    }
  },
  data() {
    return {
      sampleBounds: [[36.166667, 139.750000],[36.416667, 138.750000]]
    }
  },
  computed: {
    type() {
      return this.$store.getters[rootGetters.SMALL_RIVER_FLOODING_OPTIONS](
          this.baseMapData.storeId
      ).type;
    },
    sample() {
      return this.$store.getters[rootGetters.SMALL_RIVER_FLOODING_OPTIONS](
          this.baseMapData.storeId
      ).sample;
    },
    opacity() {
      return this.$store.getters[rootGetters.RISK_OPACITY](
          this.baseMapData.storeId
      );
    },
  }
};
</script>

<style scoped></style>
