<template>
  <div class="map-control">
    <v-row no-gutters>
      <v-col class="controls-area">
        <div class="main-controls">
          <div class="progress-area">
            <v-progress-circular
                v-if="observatoryOptions.isLoading"
                :size="60"
                :width="6"
                indeterminate
                color="#3a1e87"
                class="my-1"
            ></v-progress-circular>
          </div>
          <div class="controls top left">
            <realtime-data-control></realtime-data-control>
            <observatory-control></observatory-control>
            <base-tile-control></base-tile-control>
            <feature-control></feature-control>
          </div>
          <div v-if="showColorLegend" class="controls top right" >
            <observatory-color-legend></observatory-color-legend>
            <color-legend></color-legend>
            <feature-color-legend></feature-color-legend>
          </div>
          <div class="controls bottom right">
            <zoom-control></zoom-control>
          </div>
        </div>
        <div class="bottom-controls pt-6">
          <date-control
            v-if="selectedRisk && selectedRisk.timeAxis"
          ></date-control>
        </div>
      </v-col>
      <v-col
        v-if="dialog && dialog.isShowing"
        class="dialog-area"
        :cols="multiMapShow ? 12: 6"
        :class="{ 'multi-map-dialog': multiMapShow }"
      >
        <dialog-control></dialog-control>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { rootGetters } from "../../../../store/store-functions";

import BaseTileControl from "./BaseTileControl";
import RealtimeDataControl from "./RiskControl";
import FeatureControl from "./FeatureControl";
import DateControl from "./date-control/DateControl";
import DialogControl from "./dialog-control/DialogControl";
import ZoomControl from "./ZoomControl";
import ColorLegend from "./ColorLegend";

import { Risk } from "../../../../enums/Risk";
import FeatureColorLegend from "./FeatureColorLegend";
import ObservatoryControl from "@/pages/analysis/analysis-map/map-control/ObservatoryControl";
import ObservatoryColorLegend from "@/pages/analysis/analysis-map/map-control/ObservatoryColorLegend";

export default {
  name: "MapControl",
  components: {
    ObservatoryColorLegend,
    ObservatoryControl,
    FeatureColorLegend,
    ColorLegend,
    ZoomControl,
    DialogControl,
    DateControl,
    FeatureControl,
    RealtimeDataControl,
    BaseTileControl
  },
  inject: {
    analysisMapData: {
      default: []
    }
  },
  data() {
    return {
      Risk: Risk
    };
  },
  computed: {
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.analysisMapData.storeId
      );
    },
    dialog() {
      return this.$store.getters[rootGetters.DIALOG](
        this.analysisMapData.storeId
      );
    },
    cols() {
      return this.$store.getters[rootGetters.DIALOG](
        this.analysisMapData.storeId
      ).cols;
    },
    multiMapShow() {
      return this.$store.getters[rootGetters.MULTI_MAP_SHOW];
    },
    observatoryOptions() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
          this.analysisMapData.storeId
      );
    },
    showColorLegend() {
      return this.$store.getters[rootGetters.SHOW_COLOR_LEGEND](
          this.analysisMapData.storeId
      );
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../../common";
$date-control-height: 100px;
.map-control {
  > .row {
    height: 100%;
  }
  .controls-area {
    .main-controls {
      position: relative;
      height: calc(100% - #{$date-control-height + 10});

      .controls {
        position: absolute;
        > * {
          position: relative;
          clear: both;
        }
      }
      .controls > div {
        pointer-events: auto;
      }
      .top {
        top: 0;
        > * {
          margin: 5px 5px 0 5px;
        }
      }
      .left {
        left: 0;
        text-align: left;
        > * {
          float: left;
        }
      }
      .right {
        right: 0;
        text-align: right;
        > * {
          float: right;
        }
      }
      .center {
        left: 50%;
        transform: translateX(-50%);
        > * {
          float: left;
        }
      }
      .bottom {
        bottom: 0;
        > * {
          margin: 0 10px 10px 10px;
        }
      }
    }
    .bottom-controls {
      margin-top: 10px;
      height: $date-control-height;
      > * {
        pointer-events: auto;
      }
    }
  }
  .dialog-area {
    pointer-events: auto;
    background-color: $base-color-1;
    height: 100%;
    z-index: 1500;
  }

  .multi-map-dialog {
    position: absolute;
    right: 0;
  }

  .progress-area {
    position: absolute;
    top: 50%;
    left: 50%;
  }
}
</style>
