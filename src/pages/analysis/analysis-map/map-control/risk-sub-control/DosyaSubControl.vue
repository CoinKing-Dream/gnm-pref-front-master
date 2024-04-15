<template></template>

<script>
import {
  rootGetters,
  rootMutations,
} from "../../../../../store/store-functions";

export default {
  name: "DosyaSubControl",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  mounted() {
    this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
      storeId: this.analysisMapData.storeId,
      colorLegend: [
        {
          title: "土砂災害警戒判定値",
          colors: [
            { color: "rgba(12,0,12)", value: "災害切迫　　【5】" },
            { color: "rgba(170,0,170)", value: "危険　　　　【4】" },
            { color: "rgba(255,40,0)", value: "警戒　　　　【3】" },
            { color: "rgba(242,231,0)", value: "注意　　　　【2】" },
            { color: "#FFFFFF", value: "今後の情報等に留意" }
          ],
          text: "※【 】内は相当する警戒レベル"
        }
      ],
    });
  },
  beforeDestroy() {
    this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
      storeId: this.analysisMapData.storeId,
      colorLegend: {
        title: null,
        colors: [],
      },
    });
  },
};
</script>

<style scoped></style>
