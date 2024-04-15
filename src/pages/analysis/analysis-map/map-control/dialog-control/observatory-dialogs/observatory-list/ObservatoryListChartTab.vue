<template>
  <div class="observatory-list-chart-tab">
    <v-row no-gutters class="pa-2" align="stretch">
      <template v-for="(observatory, index) in selectedObservatoriesView">
        <v-col :key="index" cols="4" class="pa-2">
          <v-card
            outlined
            tile
            class="pa-2"
            height="100%"
            :class="{
              selected: selectedObservatory._id === observatory._id,
              'around-observatories': selectedObservatory._id !== observatory._id,
            }"
          >
            <div class="observatory-name">
              <v-icon
                v-if="
                  isWarningObservatory(observatory)
                "
                small
                class="mr-1 warning-icon"
                >mdi-alert</v-icon
              >
              <div class="text-truncate text-center px-4" style="max-width: 100%;">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on"> {{ observatory.name }}</span>
                  </template>
                  <span>{{ observatory.name }}</span>
                </v-tooltip>
              </div>
            </div>
            <div @click="updateSelectedObservatory(observatory)">
              <v-row
                v-if="observatory.type === Observatory.CAMERA"
                no-gutters
                justify="center"
                align="center"
                class="camera-area"
              >
                <div
                  v-if="observatory.skip || observatory.imageInfo.length === 0"
                  class="display-3"
                >
                  調整中
                </div>
                <v-img
                  v-else
                  :src="getCurrentCameraImageUrl(observatory)"
                  height="100%"
                ></v-img>
              </v-row>
              <v-row
                  v-else-if="observatory.type === Observatory.VIDEO"
                  no-gutters
                  justify="center"
                  align="center"
                  class="camera-area"
              >
                <div
                    v-if="observatory.skip"
                    class="display-3"
                >
                  調整中
                </div>
                <v-img
                    v-else
                    :src="`https://img.youtube.com/vi/${observatory.youtube}/0.jpg?${(new Date()).getTime()}`"
                    height="100%"
                ></v-img>
              </v-row>
            </div>
            <div class="my-1">
              <v-btn
                small
                text
                block
                color="#3a1e87"
                @click="onClickShowDetailButton(observatory)"
              >
                詳細をみる
              </v-btn>
            </div>
          </v-card>
        </v-col>
        <v-responsive
          v-if="index === 2"
          :key="`width-${index}`"
          width="100%"
        ></v-responsive>
      </template>
    </v-row>
  </div>
</template>

<script>
import {
  rootGetters,
  rootMutations,
} from "../../../../../../../store/store-functions";

import { Observatory } from "../../../../../../../enums/Observatory";
import _ from "lodash";
import moment from "moment";
export default {
  name: "ObservatoryListChartTab",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      selectedObservatoriesView: [],
      Observatory: Observatory,
    };
  },
  mounted() {
    this.updateChartList();
  },
  watch: {
    selectedObservatories() {
      this.updateChartList();
    },
  },
  computed: {
    selectedObservatory() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
        this.analysisMapData.storeId
      );
    },
    selectedObservatories() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORIES](
        this.analysisMapData.storeId
      );
    },
    rivers() {
      return this.$store.getters[rootGetters.OBSERVATORY_RIVERS];
    },
  },
  methods: {
    updateSelectedObservatory(observatory) {
      const storeId = this.analysisMapData.storeId;
      this.$store.commit(rootMutations.UPDATE_SELECTED_OBSERVATORY, {
        storeId,
        selectedObservatory: observatory,
      });
    },
    moveObservatoryDetail(observatory) {
      const storeId = this.analysisMapData.storeId;
      const dialog = {};
      switch (observatory.type) {
        case Observatory.RIVER_LEVEL:
          dialog.contents = "river-level-detail";
          break;
        case Observatory.RAIN:
          dialog.contents = "rainfall-detail";
          break;
        case Observatory.DAM:
          dialog.contents = "dam-detail";
          break;
        case Observatory.CAMERA:
          dialog.contents = "camera-detail";
          break;
        case Observatory.VIDEO:
          dialog.contents = "video-detail";
          break;
        default:
          break;
      }

      this.$store.commit(rootMutations.UPDATE_DIALOG, { storeId, dialog });
    },
    onClickShowDetailButton(observatory) {
      this.updateSelectedObservatory(observatory);
      this.moveObservatoryDetail(observatory);
    },
    updateChartList() {
      this.selectedObservatoriesView = [];
      this.$nextTick(() => {
        this.selectedObservatoriesView = this.selectedObservatories;
      });
    },
    getRiver(riverAreaId) {
      const river = _.find(this.rivers, { value: riverAreaId });
      if (river) {
        return `[${river.text}]`;
      }
    },
    getCurrentCameraImageUrl(observatory) {
      return _.last(observatory.imageInfo).url;
    },
    isWarningObservatory(observatory) {
      if (observatory.type !== Observatory.RIVER_LEVEL) {
        return false
      }

      const baseDateIndex = _.findIndex(observatory.times, o => {
        return observatory.baseDate.isSame(moment.utc(o, "YYYY/MM/DD HH:mm"));
      });

      if (baseDateIndex) {
        return observatory.dangerousLevel <
            observatory.riverLevels[baseDateIndex]
      } else {
        return false
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.observatory-list-chart-tab {
  background-color: #f2f3f8;
  .theme--light.v-card {
    cursor: pointer;
  }
}
.theme--light.v-card.selected {
  border: 2px solid red;
}
.theme--light.v-card.around-observatories {
  border: 2px solid white;
}
.observatory-name {
  font-size: 14px;
}
.theme--light.v-card.warning-observatory {
  background-color: rgba(#ff3f56, 0.12);
}
.warning-icon {
  animation: pulse 1s infinite;
}
.camera-area {
  height: 137px;
  color: white;
  background-color: black;
}
.unit {
  font-size: 10px;
}

@keyframes pulse {
  0% {
    color: rgba(0, 0, 0, 0);
  }
  100% {
    color: rgba(orange, 1);
  }
}
</style>
