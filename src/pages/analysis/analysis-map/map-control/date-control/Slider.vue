<template>
  <div v-if="selectedRisk.slider" class="slider">
    <v-slider
      v-model="position"
      ref="slider"
      class="main-slider"
      :max="selectedRiskContents.length - 1"
      :step="step"
      :tick-labels="tick.labels"
      :ticks="tick.displayOption"
      :tick-size="tick.size"
      :hide-details="hideDetails"
      :thumb-label="thumb.displayOption"
      :thumb-size="thumb.size"
    >
      <template v-slot:thumb-label="props" v-if="selectedDate">
        <div class="mm-dd">
          {{ selectedDate.local().format("MM/DD") }}
        </div>
        <div class="hh-mm">
          {{ selectedDate.local().format("HH:mm") }}
        </div>
      </template>
    </v-slider>
  </div>
</template>

<script>
import _ from "lodash";
import {
  rootGetters,
  rootMutations
} from "../../../../../store/store-functions";
import moment from "moment";
import {Risk} from "@/enums/Risk";

export default {
  name: "Slider",
  inject: {
    analysisMapData: {
      default: []
    }
  },
  data() {
    return {
      step: 1,
      hideDetails: true,
      tick: {
        size: 4,
        labels: [],
        displayOption: "always"
      },
      thumb: {
        size: 40,
        displayOption: "always"
      },
      timeLabels: [-3, -2, -1, 1, 6, 12, 24, 36],
      interval: null,
    };
  },
  watch: {
    selectedRiskBaseDate() {
      this.updateTickLabels();
    },
  },
  computed: {
    baseDate() {
      return this.$store.getters[rootGetters.BASE_DATE](
        this.analysisMapData.storeId
      );
    },
    selectedDate() {
      return this.$store.getters[rootGetters.SELECTED_DATE](
        this.analysisMapData.storeId
      );
    },
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.analysisMapData.storeId
      );
    },
    selectedRiskContents() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.analysisMapData.storeId
      ).data.contents;
    },
    selectedRiskBaseDate() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.analysisMapData.storeId
      ).data.baseDate;
    },
    position: {
      get() {
        if (!this.selectedDate) {
          return 0
        }

        return _.findIndex(this.selectedRiskContents, o => {
          return this.selectedDate.isSame(
            moment.utc(o.date, "YYYY/MM/DD HH:mm")
          );
        });
      },
      set(position) {
        const selectedData = this.selectedRiskContents[position];

        if (!selectedData) {
          return;
        }

        const storeId = this.analysisMapData.storeId;
        this.$store.commit(rootMutations.UPDATE_SELECTED_DATE, {
          storeId,
          selectedDate: moment.utc(selectedData.date, "YYYY/MM/DD HH:mm")
        });
      }
    }
  },
  methods: {
    play() {
      this.interval = setInterval(() => {
        this.next();
      }, 1000);
    },
    pause() {
      if (this.interval) {
        clearInterval(this.interval);
        this.interval = null;
      }
    },
    next() {
      if (this.position + 1 < this.selectedRiskContents.length) {
        this.position++;
      }
    },
    previous() {
      if (this.position - 1 >= 0) {
        this.position--;
      }
    },
    updateTickLabels() {
      if (this.selectedRisk.slider === false) {
        return;
      }
      if (this.selectedRiskContents.length <= 0) {
        return;
      }

      let tempTime;
      this.tick.labels = _.map(this.selectedRiskContents, o => {
        const date = moment.utc(o.date, "YYYY/MM/DD HH:mm");
        if (this.selectedRiskBaseDate.isSame(date)) {
          return "現在";
        }

        let diff = date.diff(this.selectedRiskBaseDate, "hours", true);
        if (diff <= 0) {
          diff = parseInt(diff) - 1;
        } else {
          diff = parseInt(diff);
        }

        if (tempTime === diff) {
          return null;
        }

        tempTime = diff;
        if (_.indexOf(this.timeLabels, diff) !== -1) {
          return diff > 0 ? `+${diff}h` : `${diff}h`;
        } else {
          return null;
        }
      });

      const LEFT_MAP_ID = 1111;
      const parentsMap = this.analysisMapData.storeId === LEFT_MAP_ID ? "#leftMap" : "#rightMap"
      const points = document.querySelectorAll(`${parentsMap}  #current-time-point`);
      if (points.length > 0) {
        _.forEach(points, (o) => {
          o.removeAttribute("id")
        })
      }
      this.$nextTick(() => {
        const nodes = document.querySelectorAll(`${parentsMap}  .v-slider__tick`);
        const currentNode = nodes[this.position];
        if (currentNode) {
          currentNode.id = "current-time-point"
        }
      })
    }
  }
};
</script>
<style lang="scss">
@import "../../../../../common";
#current-time-point {
  background-color: red !important;
  height: 10px !important;
  top: calc(50% - 5px) !important;
}

.slider {
  .v-slider--horizontal .v-slider__thumb-label.primary {
    cursor: ew-resize;
    background-color: $base-color-1 !important;
    -webkit-box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    color: $point-color-3;
    border-radius: 10px;
    transition: none;
    transform: translateY(50%) translateY(-40px) translateX(-50%) !important;
    width: 80px !important;
    text-align: center;

    .mm-dd {
      font-size:15px;
      line-height: 1;
    }
    .hh-mm {
      font-size: 18px;
      font-weight: bold;
      line-height: 1.2;
    }
  }

  .main-slider .v-slider--horizontal .v-slider__thumb-label.primary {
    background-color: $point-color-4 !important;
  }

  .v-slider--horizontal .v-slider__thumb-label.primary > * {
    -webkit-transform: rotate(0deg) !important;
    transform: rotate(0deg) !important;
  }

  .v-slider--horizontal .v-slider__tick .v-slider__tick-label {
    top: 15px;
    font-size: 17px;
    font-weight: bold;
    text-shadow:
        -1px -1px 0 #fff,
        1px -1px 0 #fff,
        -1px 1px 0 #fff,
        1px 1px 0 #fff;
  }

  .v-slider__tick--filled {
    background-color: rgba(0, 0, 0, 0.5);
  }

  .v-input {
    font-size: 12px;
  }

  .v-slider--horizontal .v-slider__thumb-label.primary:after {
    content: "";
    position: absolute;
    bottom: -18px;
    left: 50%;
    width: 0;
    height: 0;
    border: 10px solid transparent;
    border-top-color: $point-color-4;
    margin-left: -10px;
    margin-top: -10px;
  }

  .v-slider--horizontal .v-slider__ticks-container {
    top: 50%;
    transform: translateY(-50%);
  }
}
</style>
<style lang="scss" scoped>
.slider {
  width: 100%;
}
</style>
