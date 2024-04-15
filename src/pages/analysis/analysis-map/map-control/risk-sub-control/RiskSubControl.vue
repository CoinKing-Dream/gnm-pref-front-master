<template>
  <div
    class="risk-sub-control"
    :class="{ active: panel === 0, passive: panel !== 0 }"
  >
    <v-expansion-panels v-model="panel" accordion>
      <v-expansion-panel>
        <v-expansion-panel-header>
          <div v-if="panel === 0" class="mx-1">
            options
          </div>
          <template v-slot:actions>
            <v-icon :color="'blue'">mdi-chevron-right</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content
          v-if="
            selectedRisk || (selectedFeatures && selectedFeatures.length > 0)
          "
        >
          <h6 class="mb-1">透明度</h6>
          <div class="alpha-area pa-2">
            <template v-if="selectedRisk">
              <div class="label">リスク</div>
              <v-slider
                v-model="riskOpacity"
                hide-details
                :step="0.01"
                :max="1"
                :min="0"
              >
              </v-slider>
            </template>
            <template v-if="selectedFeatures && selectedFeatures.length > 0">
              <div class="label">防災マップ</div>
              <v-slider
                v-model="featureOpacity"
                hide-details
                :step="0.01"
                :max="1"
                :min="0"
              >
              </v-slider>
            </template>
          </div>
          <div>
            <v-checkbox
                hide-details
                dense
                v-model="showColorLegend"
                label="凡例表示"
                class="mt-2"
            ></v-checkbox>
          </div>
          <div>
            <v-checkbox
              hide-details
              dense
              v-model="showGrayBackground"
              label="背景グレー"
              class="mt-1"
              style="font-size: 13px;"
            ></v-checkbox>
          </div>
          <template v-if="selectedRisk">
            <template
              v-if="Risk.SMALL_RIVER_FLOODING.key === selectedRisk.type.key"
            >
              <small-river-flooding-sub-control></small-river-flooding-sub-control>
            </template>
          </template>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import {
  rootGetters,
  rootMutations,
} from "../../../../../store/store-functions";
import { Risk } from "../../../../../enums/Risk";
import SmallRiverFloodingSubControl from "./SmallRiverFloodingSubControl";
import RainSubControl from "./RainSubControl";
import DosyaSubControl from "@/pages/analysis/analysis-map/map-control/risk-sub-control/DosyaSubControl";
import KouzuiSubControl from "@/pages/analysis/analysis-map/map-control/risk-sub-control/KouzuiSubControl";

export default {
  name: "RiskSubControl",
  components: {
    KouzuiSubControl,
    DosyaSubControl,
    RainSubControl,
    SmallRiverFloodingSubControl,
  },
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      Risk: Risk,
      panel: 0,
      subPanelList: [
        Risk.OBSERVATORY,
        Risk.SMALL_RIVER_FLOODING,
        Risk.RAIN,
        Risk.DOSYA,
      ],
    };
  },
  computed: {
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.analysisMapData.storeId
      );
    },
    selectedFeatures() {
      return this.$store.getters[rootGetters.SELECTED_FEATURES](
        this.analysisMapData.storeId
      );
    },
    riskOpacity: {
      get() {
        return this.$store.getters[rootGetters.RISK_OPACITY](
          this.analysisMapData.storeId
        );
      },
      set(riskOpacity) {
        this.$store.commit(rootMutations.UPDATE_RISK_OPACITY, {
          storeId: this.analysisMapData.storeId,
          riskOpacity: riskOpacity,
        });
      },
    },
    featureOpacity: {
      get() {
        return this.$store.getters[rootGetters.FEATURE_OPACITY](
          this.analysisMapData.storeId
        );
      },
      set(featureOpacity) {
        this.$store.commit(rootMutations.UPDATE_FEATURE_OPACITY, {
          storeId: this.analysisMapData.storeId,
          featureOpacity: featureOpacity,
        });
      },
    },
    showGrayBackground: {
      get() {
        return this.$store.getters[rootGetters.SHOW_GRAY_BACKGROUND](
          this.analysisMapData.storeId
        );
      },
      set(showGrayBackground) {
        this.$store.commit(rootMutations.UPDATE_SHOW_GRAY_BACKGROUND, {
          storeId: this.analysisMapData.storeId,
          showGrayBackground: showGrayBackground,
        });
      },
    },
    showColorLegend: {
      get() {
        return this.$store.getters[rootGetters.SHOW_COLOR_LEGEND](
          this.analysisMapData.storeId
        );
      },
      set(showColorLegend) {
        this.$store.commit(rootMutations.UPDATE_SHOW_COLOR_LEGEND, {
          storeId: this.analysisMapData.storeId,
          showColorLegend: showColorLegend,
        });
      },
    },
    hideMenu() {
      return this.$store.getters[rootGetters.HIDE_MENU];
    }
  },
  created() {
    this.panel = this.hideMenu? 1: 0;
  }
};
</script>
<style lang="scss">
.risk-sub-control {
  .theme--light.v-expansion-panels .v-expansion-panel {
    margin: 1px 0;
    border-radius: 5px;
    max-width: inherit;
  }

  .v-expansion-panel--active .v-expansion-panel-header {
    min-height: 30px;
  }

  .v-expansion-panel-header {
    padding: 5px 5px;
    min-height: 30px;
  }

  .v-expansion-panel-content__wrap {
    padding: 10px;
  }

  .v-expansion-panel-header {
    font-size: 13px;
  }

  .v-input .v-label {
    font-size: 13px;
  }
}
</style>
<style lang="scss" scoped>
.risk-sub-control {
  max-width: inherit;
}
.active {
  width: 170px;
}
.passive {
  width: 34px;
  transition-property: width;
  transition-duration: 1s;
  transition-delay: 0.3s;
}
.label {
  font-size: 12px;
  color: #555555;
}
.alpha-area {
  border: 1px solid #dddddd;
  border-radius: 5px;
}
</style>
