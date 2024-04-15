<template>
  <div class="date-control">
    <v-row no-gutters align="center">
      <v-col cols="auto" class="pa-2 play-control-area">
        <v-row v-if="selectedRisk.slider" no-gutters class="text-center">
          <v-col>
            <v-btn fab icon color="black" @click="previous">
              <v-icon large>mdi-skip-previous</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn v-if="playing" fab icon color="black" @click="pause">
              <v-icon x-large>mdi-pause</v-icon>
            </v-btn>
            <v-btn v-else fab icon color="black" @click="play">
              <v-icon x-large>mdi-play</v-icon>
            </v-btn>
          </v-col>
          <v-col>
            <v-btn fab icon color="black" @click="next">
              <v-icon large>mdi-skip-next</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
      <v-col class="mr-5">
        <slider ref="slider" v-if="selectedRisk.slider"></slider>
      </v-col>
      <v-col
        v-if="selectedRisk.timeAxis"
        class="date-time-select-area"
        cols="auto"
      >
        <v-row no-gutters align="center">
          <v-col class="time-picker-area">
            <VueCtkDateTimePicker
                v-model="calendarDate"
                :no-value-to-custom-elem="true"
                format="YYYY/MM/DD HH:mm"
                formatted="YYYY/MM/DD HH:mm"
                output-format="YYYY-MM-DD HH:mm"
                :overlay="true"
                :no-header="true"
                locale="ja"
                size="sm"
                right
                noLabel
                noClearButton
                no-button-now
                @validate="applyCalendarDate()"
                color="#3a1e87"
            >
              <v-btn rounded dark small color="#3a1e87" class="px-10">{{baseDate.format("YYYY/MM/DD HH:mm")}}</v-btn>
            </VueCtkDateTimePicker>
            <div class="date-control-buttons">
              <v-row no-gutters align="center" justify="center">
                <v-col class="text-right">
                  <v-tooltip top v-model="leftTooltip" z-index="10000">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                          icon
                          color="rgba(55, 55, 55, 0.72)"
                          @click="updateBaseDatePreviousDay"
                          @mouseenter="showTooltip('l')"
                          @mouseleave="hideTooltip('l')"
                      >
                        <v-icon>mdi-arrow-left-drop-circle</v-icon>
                      </v-btn>
                    </template>
                    <span>基準時刻 10分戻る</span>
                  </v-tooltip>
                </v-col>
                <v-col>
                  <v-tooltip top v-model="toCurrentTooltip" z-index="10000">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                          fab
                          class="mb-2"
                          color="rgb(255, 190, 61)"
                          @click="updateLatest()"
                          @mouseenter="showTooltip('c')"
                          @mouseleave="hideTooltip('c')"
                      >
                        <v-icon style="width: 100%;" color="white" large
                        >mdi-update</v-icon
                        >
                      </v-btn>
                    </template>
                    <template>
                      最新に更新する
                    </template>
                  </v-tooltip>
                </v-col>
                <v-col class="text-left">
                  <v-tooltip top v-model="rightTooltip" z-index="10000">
                    <template v-slot:activator="{ on, attrs }">
                      <v-btn
                          icon
                          color="rgba(55, 55, 55, 0.72)"
                          @click="updateBaseDateNextDay"
                          @mouseenter="showTooltip('r')"
                          @mouseleave="hideTooltip('r')"
                      >
                        <v-icon>mdi-arrow-right-drop-circle</v-icon>
                      </v-btn>
                    </template>
                    <span>基準時刻 10分進む</span>
                  </v-tooltip>
                </v-col>
              </v-row>
            </div>
          </v-col>
          <v-col cols="auto">
            <v-tooltip top v-model="updateTooltip" z-index="10000">
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  fab
                  width="30px"
                  height="30px"
                  @click="onClickAutoUpdate"
                  @mouseenter="showTooltip('u')"
                  @mouseleave="hideTooltip('u')"
                  :color="autoUpdate ?'success': 'error'"
                >
                  {{autoUpdate? "ON":"OFF"}}
                </v-btn>
              </template>
              <template>
                自動更新 on/off
              </template>
            </v-tooltip>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import moment from "moment";
import VueCtkDateTimePicker from "vue-ctk-date-time-picker";

import {
  rootGetters,
  rootMutations,
} from "../../../../../store/store-functions";

import Slider from "./Slider";

export default {
  name: "DateControl",
  components: {
    Slider,
    VueCtkDateTimePicker
  },
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      playing: false,
      isLatest: false,
      currentDate: moment(),
      leftTooltip: false,
      rightTooltip: false,
      toCurrentTooltip: false,
      updateTooltip: false,
      calendarDate: moment().format("YYYY/MM/DD HH:mm")
    };
  },
  computed: {
    baseDate() {
      return this.$store.getters[rootGetters.BASE_DATE](
          this.analysisMapData.storeId
      );
    },
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.analysisMapData.storeId
      );
    },
    autoUpdate() {
      return this.$store.getters[rootGetters.AUTO_UPDATE](
          this.analysisMapData.storeId
      );
    },
  },
  watch: {
    baseDate() {
      this.currentDate = moment();
    }
  },
  created() {
    if (!this.autoUpdate) {
      this.calendarDate = this.baseDate
    }
  },
  methods: {
    updateBaseDate(date) {
      const storeId = this.analysisMapData.storeId;
      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId,
        baseDate: date,
      });
    },
    updateBaseDatePreviousDay() {
      this.updateBaseDate(
        moment(this.baseDate).clone().subtract(10, "minutes")
      );
    },
    updateBaseDateNextDay() {
      this.updateBaseDate(moment(this.baseDate).clone().add(10, "minutes"));
    },
    play() {
      this.$refs.slider.play();
      this.playing = true;
    },
    pause() {
      this.$refs.slider.pause();
      this.playing = false;
    },
    previous() {
      this.$refs.slider.previous();
    },
    next() {
      this.$refs.slider.next();
    },
    updateLatest() {
      const date = moment();
      this.calendarDate = date
      this.updateBaseDate(date);
    },
    onClickAutoUpdate() {
      if (this.autoUpdate) {
        this.stopAutoUpdate();
      } else {
        this.updateLatest();
        this.startAutoUpdate();
      }
    },
    showTooltip(position) {
      if (position === "l") {
        this.leftTooltip = true;
      } else if (position === "r") {
        this.rightTooltip = true;
      } else if (position === "c") {
        this.toCurrentTooltip = true;
      } else if (position === "u") {
        this.updateTooltip = true;
      }
    },
    hideTooltip(position) {
      if (position === "l") {
        this.leftTooltip = false;
      } else if (position === "r") {
        this.rightTooltip = false;
      } else if (position === "c") {
        this.toCurrentTooltip = false;
      } else if (position === "u") {
        this.updateTooltip = false;
      }
    },
    applyCalendarDate() {
      this.stopAutoUpdate();
      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId:this.analysisMapData.storeId,
        baseDate: moment(this.calendarDate,"YYYY/MM/DD HH:mm"),
      });
    },
    startAutoUpdate() {
      this.$store.commit(rootMutations.UPDATE_AUTO_UPDATE, {
        storeId: this.analysisMapData.storeId,
        autoUpdate: true,
      });
    },
    stopAutoUpdate() {
      this.$store.commit(rootMutations.UPDATE_AUTO_UPDATE, {
        storeId: this.analysisMapData.storeId,
        autoUpdate: false
      });
    },
  },
};
</script>
<style lang="scss">
@import "../../../../../common";
.v-tooltip {
  z-index: 10000;
}
</style>
<style lang="scss" scoped>
.play-control-area {
  width: 184px;
}
.date-control {
  padding: 0 10px;
  height: 100%;
  > .row {
    height: 100%;
  }
}

.date-time-select-area {
  width: 240px;
  .time-picker-area {
    position: relative;
  }
  .date-control-buttons {
    position: absolute;
    bottom: 100%;
    text-align: center;
    width: 100%;
  }
}
</style>
