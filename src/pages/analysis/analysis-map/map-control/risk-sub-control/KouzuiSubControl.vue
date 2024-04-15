<template>

</template>

<script>
import {rootMutations} from "@/store/store-functions";

export default {
  name: "KouzuiSubControl",
  inject: {
    analysisMapData: {
      default: []
    }
  },
  mounted() {
    this.showColorLegend();
  },
  beforeDestroy() {
    this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
      storeId: this.analysisMapData.storeId,
      colorLegend: {
        title: null,
        colors: []
      }
    });
  },
  methods: {
    showColorLegend() {
      this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
        storeId: this.analysisMapData.storeId,
        colorLegend: [
          {
            title: "洪水警報の危険度分布",
            colors: [
              { color: "rgba(12,0,12)", value: "災害切迫　　【5】" },
              { color: "rgba(170,0,170)", value: "危険　　　　【4】" },
              { color: "rgba(255,40,0)", value: "警戒　　　　【3】" },
              { color: "rgba(242,231,0)", value: "注意　　　　【2】" },
              { color: "rgba(60,255,255)", value: "今後の情報等に留意" }
            ],
            text: "※【 】内は相当する警戒レベル"
          },
          {
            title: "指定河川洪水予報",
            colors: [
              { color: "rgba(12,0,12)", value: "氾濫発生情報　【5】" },
              { color: "rgba(170,0,170)", value: "氾濫危険情報　【4】" },
              { color: "rgba(255,40,0)", value: "氾濫警戒情報　【3】" },
              { color: "rgba(242,231,0)", value: "氾濫注意情報　【2】" },
              { color: "rgba(60,255,255)", value: "発表なし" }
            ],
            text: "※【 】内は相当する警戒レベル"
          }
        ]
      });
    }
  }
}
</script>

<style scoped>

</style>