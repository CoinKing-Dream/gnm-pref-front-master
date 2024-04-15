<template>
  <div class="observatory-list">
    <template
      v-if="
        selectedObservatory.type !== Observatory.CAMERA &&
        selectedObservatory.type !== Observatory.VIDEO
      "
    >
      <v-progress-linear
        v-if="observatoryOptions.isLoading"
        color="orange"
        indeterminate
      ></v-progress-linear>
      <div class="px-6" style="background-color: #5b2fd4; color: white;">
        <h4>観測情報</h4>
      </div>
      <v-card class="observatory-data" outlined tile>
        <div
          :style="{
            display: 'grid',
            'grid-template-columns': isCameraStation() ? '4fr 1fr' : '1fr',
            'grid-template-rows': 'fit-content(0)',
          }"
        >
          <div class="px-3 py-3">
            <v-row no-gutters>
              <v-col :class="{ 'pr-4': isCameraStation() }">
                <h5 style="background-color: whitesmoke;" class="px-2">
                  観測所情報
                </h5>
                <v-row no-gutters align="center" class="px-2">
                  <v-col>
                    <h2 style="line-height: 1.1;" class="mt-2">
                      {{ selectedObservatoryView.name }}
                      <span style="font-size: 13px;">観測所</span>
                    </h2>
                    <h2 style="font-size: 12px; color: gray;">
                      {{ selectedObservatoryView.riverName }} ・
                      <span>{{ selectedObservatoryView.address }}</span>
                    </h2>
                  </v-col>
                </v-row>
                <h5
                  style="background-color: whitesmoke;"
                  class="mt-2 px-2"
                  v-if="
                    selectedObservatoryView.type === Observatory.RIVER_LEVEL ||
                    selectedObservatoryView.type === Observatory.DAM
                  "
                >
                  基準水位
                  {{ selectedObservatoryView.kind === 9 ? "[TP.m]" : "[m]" }}
                </h5>
                <table
                  class="pa-2 flooding-levels mt-1"
                  v-if="
                    selectedObservatoryView.type === Observatory.RIVER_LEVEL ||
                    selectedObservatoryView.type === Observatory.DAM
                  "
                >
                  <tr
                    v-for="(level, i) in getWarningLevelsFromObservatory(
                      selectedObservatoryView
                    )"
                    :key="i"
                  >
                    <td style="background-color: whitesmoke; width: 50%;">
                      <v-icon small :color="level.color">
                        mdi-minus
                      </v-icon>
                      {{ level.label }}
                    </td>
                    <td :text-color="'black'">
                      {{ level.value }}
                    </td>
                  </tr>
                </table>
              </v-col>
              <v-col cols="6" v-if="isCameraStation()">
                <h5 class="text-center">
                  {{ selectedObservatoryView.name }}
                  ({{ getMMDDFormat(currentCamera.dateTime) }}
                  {{ getHHmmFormat(currentCamera.dateTime) }})
                </h5>
                <v-row
                  no-gutters
                  justify="center"
                  align="center"
                  style="background-color: black; cursor: pointer;"
                >
                  <img
                    v-if="currentCamera"
                    :src="currentCamera.url"
                    width="100%"
                    style="max-width: 268px;"
                    @click="openOverlay(currentCamera)"
                  />
                </v-row>
              </v-col>
            </v-row>
            <h5 class="my-2 px-2" style="background-color: whitesmoke;">
              <v-row no-gutters align="center">
                <v-col>観測データ</v-col>
                <v-col cols="auto" class="mr-2">
                  <v-btn
                    depressed
                    x-small
                    class="text-lowercase"
                    @click="zoomMode = !zoomMode"
                    :color="zoomMode ? 'success' : 'white'"
                    style="border: 1px solid rgba(0, 0, 0, 0.12) !important;"
                  >
                    拡大
                  </v-btn>
                </v-col>
                <v-col
                  class="toggle-label"
                  cols="auto"
                  v-if="getIntervalShow()"
                >
                  時間表示：
                </v-col>
                <v-col cols="auto" class="mr-2">
                  <v-btn-toggle
                    v-model="interval"
                    color="primary"
                    mandatory
                    dense
                  >
                    <v-btn
                      v-if="getIntervalShow()"
                      x-small
                      class="text-lowercase"
                    >
                      10分毎
                    </v-btn>
                    <v-btn
                      v-if="getIntervalShow()"
                      x-small
                      class="text-lowercase"
                    >
                      時間毎
                    </v-btn>
                  </v-btn-toggle>
                </v-col>
                <v-col class="toggle-label" cols="auto" v-if="getRangeShow()">
                  予測期間：
                </v-col>
                <v-col cols="auto">
                  <v-btn-toggle v-model="range" color="primary" mandatory dense>
                    <v-btn v-if="getRangeShow()" x-small class="text-lowercase">
                      6時間
                    </v-btn>
                    <v-btn v-if="getRangeShow()" x-small class="text-lowercase">
                      36時間
                    </v-btn>
                  </v-btn-toggle>
                </v-col>
              </v-row>
            </h5>
            <v-row no-gutters align="stretch">
              <v-col
                cols="9"
                class="charts-area-container"
                style="width: 0; overflow-x: auto;"
              >
                <div
                  class="charts-area"
                  :style="{ width: zoomMode ? '1500px' : null }"
                >
                  <template
                    v-if="
                      selectedObservatoryView.type === Observatory.RIVER_LEVEL
                    "
                  >
                    <div class="ml-1 unit">(mm/h)</div>
                    <div class="rain-chart-area">
                      <rain-chart
                        :init-rains="
                          getRange(
                            selectedObservatoryView,
                            interval === 0 ? 'rains' : 'rains60',
                            'rainTimes',
                            'baseDate',
                            'rainLatestRealDate'
                          )
                        "
                        :init-times="
                          getRange(
                            selectedObservatoryView,
                            'rainTimes',
                            'rainTimes',
                            'baseDate',
                            'rainLatestRealDate'
                          )
                        "
                        :base-date="selectedObservatoryView.baseDate"
                        :latest-real-date="
                          selectedObservatoryView.rainLatestRealDate
                        "
                        :min-date="
                          getChartMinDate(selectedObservatoryView.baseDate)
                        "
                        :max-date="
                          getChartMaxDate(selectedObservatoryView.baseDate)
                        "
                        :rain-type="interval === 0 ? '10分' : '時間'"
                        :reverse="true"
                      ></rain-chart>
                    </div>
                    <div class="ml-1 unit">
                      {{
                        selectedObservatoryView.kind === 9 ? "(TP.m)" : "(m)"
                      }}
                    </div>
                    <div class="river-level-chart-area">
                      <river-level-chart
                        :observatory-id="selectedObservatoryView._id"
                        :init-river-levels="
                          getRange(selectedObservatoryView, 'riverLevels')
                        "
                        :init-times="getRange(selectedObservatoryView, 'times')"
                        :standby-level="selectedObservatoryView.standbyLevel"
                        :warning-level="selectedObservatoryView.warningLevel"
                        :start-stage="selectedObservatoryView.startStage"
                        :evacuation-level="
                          selectedObservatoryView.evacuationLevel
                        "
                        :dangerous-level="
                          selectedObservatoryView.dangerousLevel
                        "
                        :outbreak-level="selectedObservatoryView.outbreakLevel"
                        :landform="selectedObservatoryView.landform"
                        :base-date="selectedObservatoryView.baseDate"
                        :latest-real-date="
                          selectedObservatoryView.latestRealDate
                        "
                        :min-date="
                          getChartMinDate(selectedObservatoryView.baseDate)
                        "
                        :max-date="
                          getChartMaxDate(selectedObservatoryView.baseDate)
                        "
                      >
                      </river-level-chart>
                    </div>
                  </template>
                  <template
                    v-else-if="
                      selectedObservatoryView.type === Observatory.RAIN
                    "
                  >
                    <v-row no-gutters class="unit">
                      <v-col class="ml-3"
                        >(mm/{{ interval === 0 ? "10分" : "時間" }})</v-col
                      >
                      <v-col class="mr-1 text-right">(mm)</v-col>
                    </v-row>
                    <rain-chart
                      :height="300"
                      :init-rains="
                        getRange(
                          selectedObservatoryView,
                          interval === 0 ? 'rains' : 'rains60'
                        )
                      "
                      :total-rains="
                        getRange(selectedObservatoryView, 'totalRains')
                      "
                      :init-times="getRange(selectedObservatoryView, 'times')"
                      :base-date="selectedObservatoryView.baseDate"
                      :latest-real-date="selectedObservatoryView.latestRealDate"
                      :min-date="
                        getChartMinDate(selectedObservatoryView.baseDate)
                      "
                      :max-date="
                        getChartMaxDate(selectedObservatoryView.baseDate)
                      "
                      :rain-type="interval === 0 ? '10分' : '時間'"
                    ></rain-chart>
                  </template>
                  <template
                    v-else-if="selectedObservatoryView.type === Observatory.DAM"
                  >
                    <v-row no-gutters class="unit">
                      <v-col class="ml-3">(m)</v-col>
                      <v-col class="mr-1 text-right">(m3/s)</v-col>
                    </v-row>
                    <dam-chart
                      :height="300"
                      :init-levels="getRange(selectedObservatoryView, 'levels')"
                      :qin-alls="getRange(selectedObservatoryView, 'qinAlls')"
                      :qout-alls="getRange(selectedObservatoryView, 'qoutAlls')"
                      :warning-lines="selectedObservatoryView.baselines"
                      :landform="selectedObservatoryView.landform"
                      :init-times="getRange(selectedObservatoryView, 'times')"
                      :base-date="selectedObservatoryView.baseDate"
                      :latest-real-date="selectedObservatoryView.latestRealDate"
                    ></dam-chart>
                  </template>
                </div>
              </v-col>
              <v-col>
                <div class="data-table-area">
                  <v-card tile outlined>
                    <v-data-table
                      dense
                      :headers="tableHeaders"
                      :items="tableItems"
                      hide-default-footer
                      :height="'400px'"
                      :items-per-page="-1"
                      fixed-header
                      ref="table"
                      :no-data-text="'全時間欠測です。'"
                    >
                      <template v-slot:body="{ items }">
                        <template
                          v-if="
                            selectedObservatoryView.type ===
                            Observatory.RIVER_LEVEL
                          "
                        >
                          <tbody>
                            <tr
                              v-for="(item, index) in items"
                              ref="row"
                              :key="index"
                              :class="{
                                'before-latest-real-date': isBeforeLatestRealDate(
                                  item.date
                                ),
                                'after-latest-real-date': isAfterLatestRealDate(
                                  item.date
                                ),
                              }"
                            >
                              <td class="date-text">
                                {{ getMMDDFormat(item.date) }}
                                {{ getHHmmFormat(item.date) }}
                              </td>
                              <td
                                class="text-right"
                                :style="{
                                  color: getRiverLevelColor(
                                    item.observatory,
                                    item.riverLevel
                                  ),
                                }"
                                :class="{
                                  'font-weight-bold':
                                    getRiverLevelColor(
                                      item.observatory,
                                      item.riverLevel
                                    ) !== '#000000',
                                }"
                              >
                                {{ item.riverLevel }}
                              </td>
                            </tr>
                          </tbody>
                        </template>
                        <template
                          v-else-if="
                            selectedObservatoryView.type === Observatory.RAIN
                          "
                        >
                          <tbody>
                            <tr
                              v-for="(item, index) in items"
                              ref="row"
                              :key="index"
                              :class="{
                                'before-latest-real-date': isBeforeLatestRealDate(
                                  item.date
                                ),
                                'after-latest-real-date': isAfterLatestRealDate(
                                  item.date
                                ),
                              }"
                            >
                              <td class="date-text">
                                {{ getMMDDFormat(item.date) }}
                                {{ getHHmmFormat(item.date) }}
                              </td>
                              <td
                                class="text-right"
                                :style="{
                                  color: getRainColor(item.rain),
                                }"
                                :class="{
                                  'font-weight-bold':
                                    getRainColor(item.rain) !== '#000000',
                                }"
                              >
                                {{ item.rain }}
                              </td>
                              <td
                                class="text-right"
                                :style="{
                                  color: getRainColor(item.totalRain),
                                }"
                                :class="{
                                  'font-weight-bold':
                                    getRainColor(item.totalRain) !== '#000000',
                                }"
                              >
                                {{ item.totalRain }}
                              </td>
                            </tr>
                          </tbody>
                        </template>
                        <template
                          v-else-if="
                            selectedObservatoryView.type === Observatory.DAM
                          "
                        >
                          <tbody>
                            <tr
                              v-for="(item, index) in items"
                              ref="row"
                              :key="index"
                              :class="{
                                'before-latest-real-date': isBeforeLatestRealDate(
                                  item.date
                                ),
                                'after-latest-real-date': isAfterLatestRealDate(
                                  item.date
                                ),
                              }"
                            >
                              <td class="date-text">
                                {{ getMMDDFormat(item.date) }}
                                {{ getHHmmFormat(item.date) }}
                              </td>
                              <td class="text-right">
                                {{ item.level }}
                              </td>
                            </tr>
                          </tbody>
                        </template>
                      </template>
                    </v-data-table>
                  </v-card>
                </div>
              </v-col>
            </v-row>
          </div>
          <div
            v-if="isCameraStation()"
            style="background-color: #dddddd; position: relative;"
          >
            <div
              style="
                position: absolute;
                left: 0;
                top: 0;
                right: 0;
                bottom: 25px;
                overflow-y: auto;
              "
            >
              <v-card
                class="pa-2"
                tile
                outlined
                v-for="(image, i) in selectedObservatoryView.cameraInfo.images"
                :key="i"
                @click="currentCamera = image"
                :color="currentCamera === image ? 'orange' : ''"
              >
                <img :src="image.url" width="100%" />
                <div class="text-center" style="line-height: 1;">
                  <span class="date">
                    {{ getMMDDFormat(image.dateTime) }}
                    {{ getHHmmFormat(image.dateTime) }}
                  </span>
                </div>
              </v-card>
            </div>
            <div
              style="
                position: absolute;
                bottom: 0;
                width: 100%;
                background-color: lightgrey;
                text-align: center;
              "
            >
              <v-icon>mdi-dots-horizontal</v-icon>
            </div>
          </div>
        </div>
      </v-card>
      <div class="px-6" style="background-color: #5b2fd4; color: white;">
        <h4>近隣観測所情報</h4>
      </div>
      <div style="background-color: #dddddd;">
        <v-sheet class="mx-auto">
          <v-slide-group v-model="model" active-class="success" show-arrows>
            <v-slide-item
              v-for="(observatory, index) in selectedObservatoriesView"
              :key="index"
              v-slot="{ active, toggle }"
            >
              <v-card
                :key="index"
                class="ma-2 pt-2 pb-1"
                width="150"
                @click="updateSelectedObservatory(observatory)"
              >
                <template v-if="observatory.type === Observatory.RIVER_LEVEL">
                  <river-level-chart
                    :height="100"
                    :observatory-id="observatory._id"
                    :init-river-levels="
                      getShortRange(observatory, 'riverLevels')
                    "
                    :standby-level="observatory.standbyLevel"
                    :start-stage="observatory.startStage"
                    :warning-level="observatory.warningLevel"
                    :evacuation-level="observatory.evacuationLevel"
                    :dangerous-level="observatory.dangerousLevel"
                    :outbreak-level="observatory.outbreakLevel"
                    :landform="observatory.landform"
                    :init-times="getShortRange(observatory, 'times')"
                    :base-date="observatory.baseDate"
                    :latest-real-date="observatory.latestRealDate"
                    :mini-mode="true"
                    :min-date="getChartMinDate(observatory.baseDate, true)"
                    :max-date="getChartMaxDate(observatory.baseDate, true)"
                  ></river-level-chart>
                </template>
                <template v-else-if="observatory.type === Observatory.RAIN">
                  <rain-chart
                    :height="100"
                    :mini-mode="true"
                    :init-rains="getShortRange(observatory, 'rains')"
                    :total-rains="getShortRange(observatory, 'totalRains')"
                    :init-times="getShortRange(observatory, 'times')"
                    :base-date="observatory.baseDate"
                    :latest-real-date="observatory.latestRealDate"
                    :min-date="getChartMinDate(observatory.baseDate, true)"
                    :max-date="getChartMaxDate(observatory.baseDate, true)"
                  >
                  </rain-chart>
                </template>
                <template v-else-if="observatory.type === Observatory.DAM">
                  <dam-chart
                    :height="150"
                    :mini-mode="true"
                    :init-levels="getShortRange(observatory, 'levels')"
                    :qin-alls="getShortRange(observatory, 'qinAlls')"
                    :qout-alls="getShortRange(observatory, 'qoutAlls')"
                    :warning-lines="observatory.baselines"
                    :landform="observatory.landform"
                    :init-times="getShortRange(observatory, 'times')"
                    :base-date="observatory.baseDate"
                    :latest-real-date="observatory.latestRealDate"
                  ></dam-chart>
                </template>
                <div class="text-center" style="font-size: 12px;">
                  {{ observatory.name }}
                </div>
              </v-card>
            </v-slide-item>
          </v-slide-group>
        </v-sheet>
        <v-divider></v-divider>
      </div>
    </template>
    <template v-else>
      <observatory-list></observatory-list>
    </template>
    <v-overlay :value="overlay" :opacity="0.8">
      <v-img
        v-if="overlayImage"
        :src="overlayImage.url"
        :width="'100vh'"
        v-click-outside="onClickOutside"
      ></v-img>
    </v-overlay>
  </div>
</template>

<script>
import {
  rootActions,
  rootGetters,
  rootMutations,
} from "@/store/store-functions";
import WarningLevels from "@/enums/WarningLevels";
import { Observatory } from "@/enums/Observatory";
import RiverLevelChart from "@/components/charts/RiverLevelChart";
import RainChart from "@/components/charts/RainChart";
import _ from "lodash";
import moment from "moment";
import DamChart from "@/components/charts/DamChart";
import ObservatoryList from "@/pages/analysis/analysis-map/map-control/dialog-control/observatory-dialogs/observatory-list/ObservatoryList";

export default {
  mixins: [WarningLevels],
  name: "ObservatoryList1",
  components: { ObservatoryList, DamChart, RiverLevelChart, RainChart },
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
        this.analysisMapData.storeId
      );
    },
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
    observatoryOptions() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.analysisMapData.storeId
      );
    },
    riverLevelCategory() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.analysisMapData.storeId
      ).riverLevelCategory;
    },
    onlyUsersObservatories() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.analysisMapData.storeId
      ).onlyUsersObservatories;
    },
    showRainImage() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.analysisMapData.storeId
      ).showRainImage;
    },
    rivers() {
      return this.$store.getters[rootGetters.OBSERVATORY_RIVERS];
    },
    multiMapShow() {
      return this.$store.getters[rootGetters.MULTI_MAP_SHOW];
    },
    range: {
      get() {
        return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
          this.analysisMapData.storeId
        ).range;
      },
      set(range) {
        this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
          storeId: this.analysisMapData.storeId,
          observatoryOptions: {
            range,
          },
        });
      },
    },
    interval: {
      get() {
        return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
          this.analysisMapData.storeId
        ).interval;
      },
      set(interval) {
        this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
          storeId: this.analysisMapData.storeId,
          observatoryOptions: {
            interval,
          },
        });
      },
    },
  },
  data() {
    return {
      dateTime: moment(),
      tabs: null,
      Observatory: Observatory,
      tableHeaders: [],
      tableItems: [],
      currentCamera: null,
      selectedObservatoryView: [],
      selectedObservatoriesView: [],
      isLoading: true,
      longRange: false,
      model: null,
      overlay: false,
      overlayImage: null,
      zoomMode: false,
    };
  },
  watch: {
    selectedObservatory() {
      this.updateViews();
      this.setTableItems();
      this.scrollToBaseDate();
      if (this.selectedObservatory.cameraInfo) {
        this.currentCamera = this.selectedObservatory.cameraInfo.images[0];
      }
    },
    range() {
      this.updateViews();
      this.setTableItems();
      this.scrollToBaseDate();
      if (this.selectedObservatory.cameraInfo) {
        this.currentCamera = this.selectedObservatory.cameraInfo.images[0];
      }
    },
    interval() {
      this.updateViews();
      this.setTableItems();
      this.scrollToBaseDate();
      if (this.selectedObservatory.cameraInfo) {
        this.currentCamera = this.selectedObservatory.cameraInfo.images[0];
      }
    },
  },
  mounted() {
    this.updateViews();
    this.setTableItems();
    this.$nextTick(() => {
      this.scrollToBaseDate();
    });
    if (this.selectedObservatory.cameraInfo) {
      this.currentCamera = this.selectedObservatory.cameraInfo.images[0];
    }
  },
  methods: {
    getWarningLevelsFromObservatory(observatory) {
      if (observatory.type === Observatory.RIVER_LEVEL) {
        return this.getRiverLevelsFromObservatory(observatory);
      } else if (observatory.type === Observatory.DAM) {
        return this.getDamLevelsFromObservatory(observatory);
      }
    },
    getRiverLevelsFromObservatory(observatory) {
      let levels = [
        {
          color: "#aa00aa",
          label: "氾濫危険",
          value: observatory.dangerousLevel
            ? observatory.dangerousLevel
            : " - ",
        },
        {
          color: "#ff2800",
          label: "避難判断",
          value: observatory.evacuationLevel
            ? observatory.evacuationLevel
            : " - ",
        },
        {
          color: "#f2e700",
          label: "氾濫注意",
          value: observatory.warningLevel ? observatory.warningLevel : " - ",
        },
        {
          color: "#008000",
          label: "水防団待機",
          value: observatory.standbyLevel ? observatory.standbyLevel : " - ",
        },
      ];

      if (observatory.kind === 9) {
        levels = [
          {
            color: "#000000",
            label: "氾濫発生",
            value: observatory.outbreakLevel
              ? observatory.outbreakLevel
              : " - ",
          },
          {
            color: "#aa00aa",
            label: "危険",
            value: observatory.dangerousLevel
              ? observatory.dangerousLevel
              : " - ",
          },
          {
            color: "#22b022",
            label: "観測開始",
            value: observatory.startStage ? observatory.startStage : " - ",
          },
        ];
      }

      return levels;
    },
    getRiverLevelColor(observatory, level) {
      let color = "#000000";

      if (typeof level === "undefined" || level <= -998) color = "#000000";
      if (observatory.standbyLevel && observatory.standbyLevel <= level)
        color = "#008000";
      if (observatory.warningLevel && observatory.warningLevel <= level)
        color = "#FFA500";
      if (observatory.evacuationLevel && observatory.evacuationLevel <= level)
        color = "#FF2800";
      if (observatory.dangerousLevel && observatory.dangerousLevel <= level)
        color = "#AD02AD";

      return color;
    },
    getRainColor(rain) {
      let color = "#000000";
      if (typeof rain === "undefined" || rain <= -998 || rain === "・")
        color = "#000000";
      else if (rain < 1) color = "#000000";
      else if (rain >= 1 && rain < 20) color = "#2a7aaa";
      else if (rain >= 20 && rain < 30) color = "#1E42AF";
      else if (rain >= 30 && rain < 50) color = "#D88100";
      else if (rain >= 50 && rain < 80) color = "#FF0000";
      else if (rain >= 80) color = "#800080";

      return color;
    },
    getDamLevelsFromObservatory(observatory) {
      return this.warningLevels(observatory.baselines, observatory.baseDate);
    },
    getRiverLevelHeaders() {
      return [
        {
          text: "時間",
          align: "left",
          sortable: false,
          value: "date",
          class: "header",
          width: "70%",
        },
        {
          text: "水位 [m]",
          align: "right",
          sortable: false,
          value: "riverLevel",
          width: "30%",
          class: "header",
        },
      ];
    },
    getRainHeaders() {
      return [
        {
          text: "時間",
          align: "left",
          sortable: false,
          value: "date",
          class: "header",
          width: "60%",
        },
        {
          text: `${this.interval === 0 ? "10分" : "時間"} [mm]`,
          align: "right",
          sortable: false,
          value: "rain",
          width: "20%",
          class: "header",
        },
        {
          text: "累加 [m]",
          align: "right",
          sortable: false,
          value: "totalRain",
          width: "20%",
          class: "header",
        },
      ];
    },
    getDamHeaders() {
      return [
        {
          text: "時間",
          align: "left",
          sortable: false,
          value: "date",
          class: "header",
          width: "70%",
        },
        {
          text: "水位 [m]",
          align: "right",
          sortable: false,
          value: "level",
          width: "30%",
          class: "header",
        },
      ];
    },
    setTableItems() {
      if (!this.selectedObservatory) {
        return;
      }

      if (this.selectedObservatory.type === Observatory.RIVER_LEVEL) {
        this.tableHeaders = this.getRiverLevelHeaders();
        this.tableItems = this.getRiverLevelItems();
      } else if (this.selectedObservatory.type === Observatory.RAIN) {
        this.tableHeaders = this.getRainHeaders();
        this.tableItems = this.getRainItems();
      } else if (this.selectedObservatory.type === Observatory.DAM) {
        this.tableHeaders = this.getDamHeaders();
        this.tableItems = this.getDamItems();
      }
    },
    getRiverLevelItems() {
      const times = this.getRange(this.selectedObservatory, "times");
      const riverLevels = this.getRange(
        this.selectedObservatory,
        "riverLevels"
      );

      const ts = _.zipWith(times, riverLevels, (date, o) => {
        return {
          date: moment.utc(date, "YYYY/MM/DD HH:mm"),
          riverLevel: o ? o : "-",
          observatory: this.selectedObservatory,
        };
      });

      return ts;
    },
    getRainItems() {
      const times = this.getRange(this.selectedObservatory, "times");
      const rains = this.getRange(
        this.selectedObservatory,
        this.interval === 0 ? "rains" : "rains60"
      );
      const totalRains = this.getRange(this.selectedObservatory, "totalRains");

      const ts = _.zipWith(
        times,
        rains,
        totalRains,
        (date, rain, totalRain) => {
          return {
            date: moment.utc(date, "YYYY/MM/DD HH:mm"),
            rain: rain ? rain : "-",
            totalRain: totalRain ? totalRain : "-",
          };
        }
      );

      return ts;
    },
    getDamItems() {
      const times = this.getRange(this.selectedObservatory, "times");
      const levels = this.getRange(this.selectedObservatory, "levels");

      const ts = _.zipWith(times, levels, (date, o) => {
        return {
          date: moment.utc(date, "YYYY/MM/DD HH:mm"),
          level: o ? o : "-",
        };
      });

      return ts;
    },
    isBeforeLatestRealDate(date) {
      return date.isSameOrBefore(this.selectedObservatoryView.latestRealDate);
    },
    isAfterLatestRealDate(date) {
      return date.isAfter(this.selectedObservatoryView.latestRealDate);
    },
    scrollToBaseDate() {
      this.$nextTick(() => {
        if (!this.$refs["table"]) {
          return;
        }
        const wrapper = this.$refs["table"].$el.querySelector(
          "div.v-data-table__wrapper"
        );
        this.$nextTick(() => {
          const query =
            "tr.before-latest-real-date + tr:not(.before-latest-real-date) td";
          const sameBaseDate = this.$refs["table"].$el.querySelector(query);
          if (sameBaseDate) {
            setTimeout(() => {
              this.$vuetify.goTo(query, {
                container: wrapper,
                offset: 180,
              });
            }, 1000);
          }
        });
      });
    },
    getMMDDFormat(time) {
      return moment.utc(time, "YYYY/MM/DD HH:mm").local().format("MM/DD");
    },
    getHHmmFormat(time) {
      return moment.utc(time, "YYYY/MM/DD HH:mm").local().format("HH:mm");
    },
    isCameraStation() {
      return !!this.selectedObservatoryView.cameraInfo;
    },
    updateSelectedObservatory(observatory) {
      this.updateIsLoading(true);

      const layerPoint = this.map.latLngToLayerPoint([
        observatory.lat,
        observatory.lng,
      ]);
      if (this.multiMapShow === false) {
        layerPoint.x += window.innerWidth / 4;
      }
      this.map.panTo(this.map.layerPointToLatLng(layerPoint));

      const query = {
        storeId: this.analysisMapData.storeId,
        observatoryId: observatory._id,
        isRiverArea: this.observatoryOptions.river.value !== -1,
        type: observatory.type.index,
      };
      if (observatory.type === Observatory.CAMERA) {
        query.type = Observatory.RIVER_LEVEL.index;
      }
      if (
        observatory.type === Observatory.RIVER_LEVEL &&
        this.riverLevelCategory !== "0"
      ) {
        query.categoryNo = this.riverLevelCategory;
      }
      if (this.onlyUsersObservatories) {
        query.userLink = true;
      }

      this.$store.dispatch(rootActions.LOAD_OBSERVATION_DATA, query);
    },
    updateViews() {
      this.selectedObservatoryView = [];
      this.selectedObservatoriesView = [];
      this.$nextTick(() => {
        this.selectedObservatoryView = this.selectedObservatory;
        this.selectedObservatoriesView = this.selectedObservatories;
        this.updateIsLoading(false);
      });
    },
    updateIsLoading(bool) {
      this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
        storeId: this.analysisMapData.storeId,
        observatoryOptions: { isLoading: bool },
      });
    },
    getRiver(riverAreaId) {
      const river = _.find(this.rivers, { value: riverAreaId });
      if (river) {
        return `${river.text}`;
      }
    },
    openOverlay(image) {
      this.overlayImage = image;
      this.overlay = true;
    },
    onClickOutside() {
      this.overlay = false;
      this.overlayImage = null;
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
      if (observatory.type === Observatory.DAM) {
        return filteredData;
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
    getShortRange(observatory, dataKey) {
      let times = observatory.times;
      let data = observatory[dataKey];
      const baseDate = observatory.baseDate;

      const index6 = _.findIndex(times, (time) => {
        return (
          -(6 * 60) >
          baseDate.diff(moment.utc(time, "YYYY/MM/DD HH:mm"), "minutes")
        );
      });

      if (index6 !== -1) {
        times = times.slice(0, index6 + 1);
        data = data.slice(0, index6 + 1);
      }

      const index3 = _.findLastIndex(times, (time) => {
        return (
          3 * 60 <
          baseDate.diff(moment.utc(time, "YYYY/MM/DD HH:mm"), "minutes")
        );
      });
      if (index3 !== -1) {
        data = data.slice(index3 + 1);
      }

      return data;
    },
    getRangeShow() {
      return (
        this.selectedObservatory &&
        (this.selectedObservatory.type === Observatory.RIVER_LEVEL ||
          this.selectedObservatory.type === Observatory.RAIN ||
          this.selectedObservatory.type === Observatory.DAM)
      );
    },
    getIntervalShow() {
      return (
        this.selectedObservatory &&
        (this.selectedObservatory.type === Observatory.RIVER_LEVEL ||
          this.selectedObservatory.type === Observatory.RAIN)
      );
    },
    getChartMinDate(baseDate, shortFixed = false) {
      const tempDate = baseDate.clone();
      if (this.interval === 0 || shortFixed) {
        return tempDate.subtract(3, "hour");
      } else {
        return tempDate.subtract(24, "hour");
      }
    },
    getChartMaxDate(baseDate, shortFixed = false) {
      const tempDate = baseDate.clone();
      if (this.range === 0 || shortFixed) {
        return tempDate.add(6, "hour");
      } else {
        return tempDate.add(36, "hour");
      }
    },
  },
};
</script>
<style lang="scss">
.observatory-list {
  overflow-y: auto;
  .v-input--selection-controls {
    margin-top: 0;
    padding-top: 0;
  }
  .v-label {
    font-size: 12px;
  }

  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    font-size: 0.7rem !important;
    padding: 3px 8px !important;
    height: inherit !important;
  }

  .v-slide-group__wrapper {
    background-color: #eeeeee;
  }

  .v-slide-group__prev {
    border-right: 1px solid lightgrey;
  }
  .v-slide-group__next {
    border-left: 1px solid lightgrey;
  }
}
.v-input--selection-controls__input {
  height: 20px;
}
.v-window-item.v-window-item--active > div {
  height: calc(100vh);
  overflow-y: auto;
  overflow-x: hidden;
}

.charts-area {
  height: 100%;
  overflow-y: hidden;
  overflow-x: hidden;
  padding: 20px 30px 10px 20px;
  background-color: white;
  border: 1px solid #dddddd;
  border-right: 0px;

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
}

.v-btn:not(.v-btn--round).v-size--small {
  padding: 0 5px;
}

.header {
  background-color: whitesmoke !important;
}

.data-table-area table th + th {
  border-left: 1px solid #dddddd;
}
.data-table-area table td + td {
  border-left: 1px solid #dddddd;
}

.flooding-levels {
  width: 100%;
  font-size: 12px;
  border: 1px solid #dddddd;
  border-collapse: collapse;
  th,
  td {
    border: 1px solid #dddddd;
    padding: 0 5px;
  }
}
</style>
<style lang="scss" scoped>
.observatory-list {
  height: 100%;
  background-color: whitesmoke;
  .observatory-data {
    h5 {
      font-weight: bolder;
      color: rgba(black, 0.7);
    }
    h2 {
      color: rgba(black, 0.7);
    }
  }

  /* width */
  .charts-area-container::-webkit-scrollbar {
    display: block;
    height: 10px;
  }

  /* Track */
  .charts-area-container::-webkit-scrollbar-track {
    background: #f1f1f1;
  }

  /* Handle */
  .charts-area-container::-webkit-scrollbar-thumb {
    background: #888;
  }

  /* Handle on hover */
  .charts-area-container::-webkit-scrollbar-thumb:hover {
    background: #555;
  }
}

.before-latest-real-date {
  color: black;
}
tr.before-latest-real-date + tr:not(.before-latest-real-date) td {
  border-top: 2px dashed blue !important;
}
.after-latest-real-date td {
  background-color: #f3faff;
}

.text {
  text-align: center;
  padding: 5px 0;
  line-height: 1.1;
}
.date {
  font-size: 10px;
}
.time {
  font-size: 14px;
  font-weight: bold;
}
.unit {
  font-size: 10px;
}
.toggle-label {
  font-size: 11px;
  font-weight: normal;
}
</style>
