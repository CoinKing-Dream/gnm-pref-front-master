<template>
  <div class="small-river-flooding-sub-control">
    <v-divider class="my-2"></v-divider>
    <h6>現在の破堤地点別浸水想定箇所</h6>
    <v-radio-group
        v-model="level"
        hide-details
    >
      <v-radio
          label="計画規模"
          value="L1"
      ></v-radio>
      <v-radio
          label="想定最大規模"
          value="L2"
      ></v-radio>
    </v-radio-group>
  </div>
</template>

<script>
import {
  rootGetters,
  rootMutations
} from "../../../../../store/store-functions";

export default {
  name: "SmallRiverFloodingSubControl",
  inject: {
    analysisMapData: {
      default: []
    }
  },
  computed: {
    type: {
      get() {
        return this.$store.getters[rootGetters.SMALL_RIVER_FLOODING_OPTIONS](
            this.analysisMapData.storeId
        ).type;
      },
      set(type) {
        this.$store.commit(rootMutations.UPDATE_SMALL_RIVER_FLOODING_OPTIONS, {
          storeId: this.analysisMapData.storeId,
          smallRiverFloodingOptions: {
            type: type
          }
        });
      }
    },
    sample: {
      get() {
        return this.$store.getters[rootGetters.SMALL_RIVER_FLOODING_OPTIONS](
            this.analysisMapData.storeId
        ).sample;
      },
      set(sample) {
        this.$store.commit(rootMutations.UPDATE_SMALL_RIVER_FLOODING_OPTIONS, {
          storeId: this.analysisMapData.storeId,
          smallRiverFloodingOptions: {
            sample: sample
          }
        });
      }
    },
    level: {
      get() {
        return this.$store.getters[rootGetters.SMALL_RIVER_FLOODING_OPTIONS](
            this.analysisMapData.storeId
        ).level;
      },
      set(level) {
        this.$store.commit(rootMutations.UPDATE_SMALL_RIVER_FLOODING_OPTIONS, {
          storeId: this.analysisMapData.storeId,
          smallRiverFloodingOptions: {
            level: level
          }
        });
      }
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
            title: "浸水リスク(m)",
            colors: [
              { color: "rgb(0,112,255)", value: "2.0 ~" },
              { color: "rgb(45,193,223)", value: "1.5 ~ 2.0" },
              { color: "rgb(115,255,222)", value: "1.0 ~ 1.5" },
              { color: "rgb(67,230,0)", value: "0.5 ~ 1.0" },
              { color: "rgb(255,255,0)", value: "0.05 ~ 0.5" }
            ]
          },
          {
            title: "河川危険度",
            colors: [
              { color: "black", value: "この時間で越水の恐れ" },
              { color: "red", value: "1時間以内に越水の恐れ" },
              { color: "yellow", value: "6時間以内に越水の恐れ" },
            ]
          }
        ]
      });
    }
  },
};
</script>

<style lang="scss" scoped>
.small-river-flooding-sub-control {
  .v-input--selection-controls {
    margin-top: 0;
  }
}
</style>
