<template>
  <div style="height: 100vh; overflow-y: scroll;">
    <v-row no-gutters>
      <v-col v-for="(group, key) in groups" :key="key">
        <v-btn
          block
          tile
          small
          @click="changeGroup(group)"
          :color="group === current ? 'primary' : 'normal'"
          >{{ group }}</v-btn
        >
      </v-col>
    </v-row>
    <v-row class="pa-2" align="center" justify="center" no-gutters>
      <v-spacer></v-spacer>
      <v-col class="toggle-label" cols="auto">
        時間表示：
      </v-col>
      <v-col cols="auto" class="mr-2">
        <v-btn-toggle v-model="interval" color="primary" mandatory dense>
          <v-btn x-small class="text-lowercase">
            10分毎
          </v-btn>
          <v-btn x-small class="text-lowercase">
            時間毎
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col class="toggle-label" cols="auto">
        予測期間：
      </v-col>
      <v-col cols="auto">
        <v-btn-toggle v-model="range" color="primary" mandatory dense>
          <v-btn x-small class="text-lowercase">
            6時間
          </v-btn>
          <v-btn x-small class="text-lowercase">
            36時間
          </v-btn>
        </v-btn-toggle>
      </v-col>
      <v-col cols="auto">
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
          class="pl-6"
        >
          <v-btn>{{ baseDate.local().format("YYYY/MM/DD HH:mm") }}</v-btn>
        </VueCtkDateTimePicker>
      </v-col>
    </v-row>
    <v-row no-gutters v-if="!isLoading" style="background-color: whitesmoke;">
      <v-col
        cols="6"
        v-for="(observatory, i) in selectedObservatoriesView"
        :key="i"
        class="pa-4"
      >
        <v-card class="pa-2">
          <div v-if="observatory.rainLatestRealDate" class="ml-1 unit">(mm/h)</div>
          <div v-if="observatory.rainLatestRealDate" class="rain-chart-area">
            <rain-chart
                :init-rains="
                          getRange(
                            observatory,
                            interval === 0 ? 'rains' : 'rains60',
                            'rainTimes',
                            'baseDate',
                            'rainLatestRealDate'
                          )
                        "
                :init-times="
                          getRange(
                            observatory,
                            'rainTimes',
                            'rainTimes',
                            'baseDate',
                            'rainLatestRealDate'
                          )
                        "
                :base-date="observatory.baseDate"
                :latest-real-date="
                          observatory.rainLatestRealDate
                        "
                :min-date="
                          getChartMinDate(observatory.baseDate)
                        "
                :max-date="
                          getChartMaxDate(observatory.baseDate)
                        "
                :rain-type="interval === 0 ? '10分' : '時間'"
                :reverse="true"
            ></rain-chart>
          </div>
          <div class="ml-1 unit">
            {{ observatory.kind === 9 ? "(TP.m)" : "(m)" }}
          </div>
          <div class="river-level-chart-area">
            <river-level-chart
              :observatory-id="observatory._id"
              :init-river-levels="getRange(observatory, 'riverLevels')"
              :init-times="getRange(observatory, 'times')"
              :standby-level="observatory.standbyLevel"
              :warning-level="observatory.warningLevel"
              :start-stage="observatory.startStage"
              :evacuation-level="observatory.evacuationLevel"
              :dangerous-level="observatory.dangerousLevel"
              :outbreak-level="observatory.outbreakLevel"
              :landform="observatory.landform"
              :base-date="observatory.baseDate"
              :latest-real-date="observatory.latestRealDate"
              :min-date="getChartMinDate(observatory.baseDate)"
              :max-date="getChartMaxDate(observatory.baseDate)"
            >
            </river-level-chart>
          </div>
          <h3 class="text-center">
            {{ observatory._id }} {{ observatory.name }}
          </h3>
        </v-card>
      </v-col>
    </v-row>
    <div v-else>
      Loading...
    </div>
  </div>
</template>

<script>
import {
  rootActions,
  rootGetters,
  rootMutations,
} from "@/store/store-functions";
import { BaseTile } from "@/enums/BaseTile";
import { Risk } from "@/enums/Risk";
import moment from "moment";
import { Observatory } from "@/enums/Observatory";
import _ from "lodash";
import RiverLevelChart from "@/components/charts/RiverLevelChart";
import RainChart from "@/components/charts/RainChart";
import VueCtkDateTimePicker from "vue-ctk-date-time-picker";

export default {
  name: "TestChartList",
  components: { RainChart, RiverLevelChart, VueCtkDateTimePicker },
  data() {
    return {
      storeId: 1111,
      page: 1,
      itemsPerPage: 20,
      isLoading: true,
      matches: [
        {
          _id: "2561_52",
          group: 1,
        },
        {
          _id: "2561_53",
          group: 1,
        },
        {
          _id: "2561_67",
          group: 1,
        },
        {
          _id: "2561_68",
          group: 1,
        },
        {
          _id: "2561_19",
          group: 2,
        },
        {
          _id: "2561_20",
          group: 2,
        },
        {
          _id: "2561_21",
          group: 2,
        },
        {
          _id: "2561_22",
          group: 2,
        },
        {
          _id: "21289_6",
          group: 2,
        },
        {
          _id: "21289_26",
          group: 2,
        },
        {
          _id: "21289_27",
          group: 2,
        },
        {
          _id: "21289_33",
          group: 2,
        },
        {
          _id: "21289_63",
          group: 2,
        },
        {
          _id: "2561_5",
          group: 3,
        },
        {
          _id: "2561_6",
          group: 3,
        },
        {
          _id: "2561_7",
          group: 3,
        },
        {
          _id: "2561_8",
          group: 3,
        },
        {
          _id: "2561_9",
          group: 3,
        },
        {
          _id: "2561_10",
          group: 3,
        },
        {
          _id: "2561_11",
          group: 3,
        },
        {
          _id: "2561_12",
          group: 3,
        },
        {
          _id: "2561_58",
          group: 3,
        },
        {
          _id: "2561_64",
          group: 3,
        },
        {
          _id: "21259_92",
          group: 3,
        },
        {
          _id: "21289_1",
          group: 3,
        },
        {
          _id: "21289_2",
          group: 3,
        },
        {
          _id: "21289_3",
          group: 3,
        },
        {
          _id: "21289_62",
          group: 3,
        },
        {
          _id: "21289_65",
          group: 3,
        },
        {
          _id: "2561_55",
          group: 4,
        },
        {
          _id: "2561_56",
          group: 4,
        },
        {
          _id: "2561_70",
          group: 4,
        },
        {
          _id: "2561_71",
          group: 4,
        },
        {
          _id: "21259_4",
          group: 4,
        },
        {
          _id: "21259_5",
          group: 4,
        },
        {
          _id: "21259_12",
          group: 4,
        },
        {
          _id: "21259_13",
          group: 4,
        },
        {
          _id: "21259_37",
          group: 4,
        },
        {
          _id: "21259_38",
          group: 4,
        },
        {
          _id: "21260_11",
          group: 4,
        },
        {
          _id: "2561_23",
          group: 5,
        },
        {
          _id: "2561_24",
          group: 5,
        },
        {
          _id: "2561_25",
          group: 5,
        },
        {
          _id: "2561_26",
          group: 5,
        },
        {
          _id: "2561_27",
          group: 5,
        },
        {
          _id: "2561_28",
          group: 5,
        },
        {
          _id: "2561_65",
          group: 5,
        },
        {
          _id: "2561_66",
          group: 5,
        },
        {
          _id: "2561_112",
          group: 5,
        },
        {
          _id: "21289_10",
          group: 5,
        },
        {
          _id: "21289_32",
          group: 5,
        },
        {
          _id: "21289_66",
          group: 5,
        },
        {
          _id: "2561_1",
          group: 6,
        },
        {
          _id: "2561_2",
          group: 6,
        },
        {
          _id: "2561_3",
          group: 6,
        },
        {
          _id: "2561_4",
          group: 6,
        },
        {
          _id: "2561_18",
          group: 6,
        },
        {
          _id: "2561_44",
          group: 6,
        },
        {
          _id: "2561_46",
          group: 6,
        },
        {
          _id: "2561_47",
          group: 6,
        },
        {
          _id: "2561_48",
          group: 6,
        },
        {
          _id: "2561_49",
          group: 6,
        },
        {
          _id: "2561_50",
          group: 6,
        },
        {
          _id: "2561_51",
          group: 6,
        },
        {
          _id: "2561_59",
          group: 6,
        },
        {
          _id: "2561_61",
          group: 6,
        },
        {
          _id: "2561_62",
          group: 6,
        },
        {
          _id: "2561_63",
          group: 6,
        },
        {
          _id: "2561_69",
          group: 6,
        },
        {
          _id: "21259_30",
          group: 6,
        },
        {
          _id: "21259_32",
          group: 6,
        },
        {
          _id: "21259_33",
          group: 6,
        },
        {
          _id: "21259_34",
          group: "6_2",
        },
        {
          _id: "21259_67",
          group: "6_2",
        },
        {
          _id: "21259_68",
          group: "6_2",
        },
        {
          _id: "21259_69",
          group: "6_2",
        },
        {
          _id: "21259_74",
          group: "6_2",
        },
        {
          _id: "21289_12",
          group: "6_2",
        },
        {
          _id: "21289_16",
          group: "6_2",
        },
        {
          _id: "21289_19",
          group: "6_2",
        },
        {
          _id: "21289_21",
          group: "6_2",
        },
        {
          _id: "21289_31",
          group: "6_2",
        },
        {
          _id: "2561_29",
          group: 7,
        },
        {
          _id: "2561_30",
          group: 7,
        },
        {
          _id: "2561_31",
          group: 7,
        },
        {
          _id: "2561_32",
          group: 7,
        },
        {
          _id: "2561_57",
          group: 7,
        },
        {
          _id: "2561_106",
          group: 7,
        },
        {
          _id: "21289_4",
          group: 7,
        },
        {
          _id: "2561_17",
          group: 8,
        },
        {
          _id: "2561_33",
          group: 8,
        },
        {
          _id: "2561_34",
          group: 8,
        },
        {
          _id: "2561_35",
          group: 8,
        },
        {
          _id: "2561_36",
          group: 8,
        },
        {
          _id: "2561_37",
          group: 8,
        },
        {
          _id: "21289_5",
          group: 8,
        },
        {
          _id: "21289_25",
          group: 8,
        },
        {
          _id: "2561_13",
          group: 9,
        },
        {
          _id: "2561_14",
          group: 9,
        },
        {
          _id: "2561_15",
          group: 9,
        },
        {
          _id: "2561_16",
          group: 9,
        },
        {
          _id: "2561_39",
          group: 9,
        },
        {
          _id: "2561_40",
          group: 9,
        },
        {
          _id: "2561_41",
          group: 9,
        },
        {
          _id: "2561_42",
          group: 9,
        },
        {
          _id: "2561_43",
          group: 9,
        },
        {
          _id: "2561_45",
          group: 9,
        },
        {
          _id: "21289_7",
          group: 9,
        },
        {
          _id: "21289_8",
          group: 9,
        },
        {
          _id: "21289_9",
          group: 9,
        },
        {
          _id: "21289_11",
          group: 9,
        },
        {
          _id: "21289_14",
          group: 9,
        },
        {
          _id: "21289_20",
          group: 9,
        },
        {
          _id: "21289_22",
          group: 9,
        },
        {
          _id: "21289_23",
          group: 9,
        },
        {
          _id: "21289_30",
          group: 9,
        },
        {
          _id: "21289_70",
          group: 9,
        },
        {
          _id: "2561_54",
          group: 10,
        },
        {
          _id: "2561_60",
          group: 10,
        },
        {
          _id: "21259_18",
          group: 10,
        },
        {
          _id: "21260_2",
          group: 10,
        },
        {
          _id: "21260_4",
          group: 10,
        },
        {
          _id: "21260_5",
          group: 10,
        },
        {
          _id: "21260_6",
          group: 10,
        },
        {
          _id: "21260_7",
          group: 10,
        },
        {
          _id: "21260_8",
          group: 10,
        },
        {
          _id: "21260_9",
          group: 10,
        },
        {
          _id: "21260_10",
          group: 10,
        },
        {
          _id: "21260_20",
          group: 10,
        },
        {
          _id: "21289_28",
          group: 10,
        },
        {
          _id: "21259_23",
          group: 11,
        },
        {
          _id: "21259_24",
          group: 11,
        },
        {
          _id: "21259_25",
          group: 11,
        },
        {
          _id: "21259_26",
          group: 11,
        },
        {
          _id: "21259_27",
          group: 11,
        },
        {
          _id: "21259_28",
          group: 11,
        },
        {
          _id: "21259_29",
          group: 11,
        },
        {
          _id: "21259_35",
          group: 11,
        },
        {
          _id: "21259_36",
          group: 11,
        },
        {
          _id: "21259_42",
          group: 11,
        },
        {
          _id: "21259_43",
          group: 11,
        },
        {
          _id: "21260_1",
          group: 11,
        },
        {
          _id: "21260_3",
          group: 11,
        },
        {
          _id: "21260_13",
          group: 11,
        },
        {
          _id: "21260_14",
          group: "11_2",
        },
        {
          _id: "21260_15",
          group: "11_2",
        },
        {
          _id: "21260_16",
          group: "11_2",
        },
        {
          _id: "21260_21",
          group: "11_2",
        },
        {
          _id: "21260_22",
          group: "11_2",
        },
      ],
      currentDate: moment().toISOString(),
      groups: null,
      current: null,
      calendarDate: moment().format("YYYY/MM/DD HH:mm"),
      interval: 0,
      range: 0,
      selectedObservatoriesView: []
    };
  },
  computed: {
    observatories() {
      return this.$store.getters[rootGetters.FIND_RISK](
        Risk.OBSERVATORY,
        this.storeId
      ).data.contents;
    },
    riverLevelObservatories() {
      const obs = _.filter(this.observatories, {
        type: Observatory.RIVER_LEVEL,
      });
      _.some(obs);
      return _.filter(this.observatories, { type: Observatory.RIVER_LEVEL });
    },
    selectedObservatory() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
        this.storeId
      );
    },
    selectedObservatories() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORIES](
        this.storeId
      );
    },
    baseDate() {
      return this.$store.getters[rootGetters.BASE_DATE](this.storeId);
    },
  },
  watch: {
    baseDate() {
      this.currentDate = moment().toISOString();
      this.onInputPagination();
    },
    range() {
      this.updateViews();
    },
    interval() {
      this.updateViews();
    },
  },
  created() {
    this.groups = _.uniq(_.map(this.matches, "group"));
    this.current = this.groups[0];
    this.initMapData(this.storeId, {
      selectedBaseTile: BaseTile.GRAY,
      selectedRiskType: Risk.OBSERVATORY,
      baseDate: moment(),
    });
  },
  async mounted() {
    await this.loadObservatories();
    await this.loadObservatoryData();
    this.updateViews();

    this.isLoading = false;
  },
  methods: {
    updateViews() {
      this.selectedObservatoriesView = [];
      this.$nextTick(() => {
        this.selectedObservatoriesView = this.selectedObservatories;
      });
    },
    initMapData(storeId, mapData) {
      this.$store.commit(rootMutations.INIT_MAP_DATA, { storeId, mapData });
    },
    async loadObservatories() {
      return this.$store.dispatch(rootActions.LOAD_OBSERVATORY, {
        storeId: this.storeId,
        loadInfo: true,
        loadCurrentData: false,
      });
    },
    async loadObservatoryData() {
      const observatoryId =
        this.$cookies.get("observatoryId") ||
        (this.userInfo && this.userInfo.mainObservatoryId) ||
        "1000000008";

      return this.$store.dispatch(rootActions.LOAD_OBSERVATION_DATA, {
        storeId: this.storeId,
        observatoryId: observatoryId,
        type: Observatory.RIVER_LEVEL.index,
        targetIds: this.getShowingObservatoriesIds(),
        isTestPage: true,
      });
    },
    getShowingObservatoriesIds() {
      return _.join(
        _.map(_.filter(this.matches, { group: this.current }), "_id"),
        ","
      );
    },
    async onInputPagination() {
      this.isLoading = true;
      await this.loadObservatories();
      await this.loadObservatoryData();
      this.updateViews();

      this.isLoading = false;
    },
    async changeGroup(group) {
      this.current = group;
      await this.onInputPagination();
    },
    applyCalendarDate() {
      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId: this.storeId,
        baseDate: moment(this.calendarDate, "YYYY/MM/DD HH:mm"),
      });
    },
    getChartMinDate(baseDate) {
      const tempDate = baseDate.clone();
      if (this.interval === 0) {
        return tempDate.subtract(3, "hour");
      } else {
        return tempDate.subtract(24, "hour");
      }
    },
    getChartMaxDate(baseDate) {
      const tempDate = baseDate.clone();
      if (this.range === 0) {
        return tempDate.add(6, "hour");
      } else {
        return tempDate.add(36, "hour");
      }
    },
    getRange(
      observatory,
      dataKey,
      timesKey = "times",
      baseDateKey = "baseDate",
      latestRealDateKey = "latestRealDate"
    ) {
      const baseDate = observatory[baseDateKey];
      const latestRealDate = observatory[latestRealDateKey];
      const times = observatory[timesKey];
      const data = observatory[dataKey];

      let filteredTimes = _.clone(times);
      let filteredData = _.clone(data);

      if (this.range === 0) {
        const index = _.findIndex(times, (time) => {
          return (
            -(6 * 60) >
            baseDate.diff(moment.utc(time, "YYYY/MM/DD HH:mm"), "minutes")
          );
        });

        if (index !== -1) {
          filteredTimes = times.slice(0, index + 1);
          filteredData = data.slice(0, index + 1);
        }
      }

      if (this.interval === 1) {
        const temp = [];
        _.forEach(filteredTimes, (time, index) => {
          if (
            observatory.type === Observatory.RIVER_LEVEL &&
            moment.utc(time, "YYYY/MM/DD HH:mm").isAfter(latestRealDate)
          ) {
            temp.push(filteredData[index]);
          } else if (moment.utc(time, "YYYY/MM/DD HH:mm").minutes() === 0) {
            temp.push(filteredData[index]);
          }
        });

        return temp;
      } else {
        const index = _.findLastIndex(filteredTimes, (time) => {
          return (
            3 * 60 <
            baseDate.diff(moment.utc(time, "YYYY/MM/DD HH:mm"), "minutes")
          );
        });
        if (index !== -1) {
          filteredData = filteredData.slice(index + 1);
        }

        return filteredData;
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.v-input--selection-controls {
  margin-top: 0;
}
.rain-chart-area {
  position: relative;
  height: 120px;
  div {
    height: 100%;
  }
}
.river-level-chart-area {
  height: 220px;

  div {
    height: 100%;
  }
}
</style>
