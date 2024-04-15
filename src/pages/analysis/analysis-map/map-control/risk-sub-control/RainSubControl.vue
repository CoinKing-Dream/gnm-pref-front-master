<template></template>

<script>
import {
  rootGetters,
  rootMutations
} from "../../../../../store/store-functions";

export default {
  name: "RainSubControl",
  inject: {
    analysisMapData: {
      default: []
    }
  },
  mounted() {
    this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
      storeId: this.analysisMapData.storeId,
      colorLegend: {
        title: "レーダ・予測雨量\n(mm/h)",
        colors: [
          { color: "#ba206e", value: "80~" },
          { color: "#ff3700", value: "50~80" },
          { color: "#ffa021", value: "30~50" },
          { color: "#fbf43c", value: "20~30" },
          { color: "#0041FF", value: "10~20" },
          { color: "#218CFF", value: "5~10" },
          { color: "#A0D2FF", value: "1~5" },
          { color: "#99FFFF", value: "0~1" }
        ]
      }
    });
  },
  beforeDestroy() {
    this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
      storeId: this.analysisMapData.storeId,
      colorLegend: {
        title: null,
        colors: []
      }
    });
  }
};
</script>

<style scoped></style>
