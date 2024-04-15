<template>
  <div>
    <v-row no-gutters align="stretch" class="observatory-contents pa-4 pt-0">
      <v-col cols="4" style="position: relative;">
        <l-map
          ref="observatoryMap"
          :zoom="zoom"
          :center="center"
          :options="{
            zoomControl: false,
            fadeAnimation: false,
            zoomAnimation: false,
          }"
          :maxZoom="15"
          class="map-area"
          style="pointer-events: none;"
        >
          <l-tile-layer
            :url="url"
            :center="center"
            :zoom="zoom"
            :attribution="attribution"
          ></l-tile-layer>
          <l-tile-layer
            layer-type="overlay"
            class="tiles"
            :url="'https://s3-ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/tile/river/{z}/{x}/{y}.png'"
          ></l-tile-layer>
          <template v-for="(o, index) in rainfallItems">
            <l-marker :key="`river-${index}`" :lat-lng="o.latlng">
              <l-icon
                :icon-size="[20, 20]"
                :icon-anchor="[10, 20]"
                :tooltipAnchor="[10, -25]"
                :icon-url="
                  require(`@/assets/images/observatory-icons/${getIconUrl(o)}`)
                "
                :class-name="isSelectedObservatory(o) ? 'shadow-red' : ''"
              >
              </l-icon>
              <l-tooltip :options="{ direction: 'top' }">
                {{ o.observatory }}
              </l-tooltip>
            </l-marker>
          </template>
          <template v-for="(o, index) in riverLevelItems">
            <l-marker :key="index" :lat-lng="o.latlng">
              <l-icon
                :icon-size="[20, 20]"
                :icon-anchor="[10, 20]"
                :tooltipAnchor="[10, -25]"
                :popupAnchor="[0, -25]"
                :icon-url="
                  require(`@/assets/images/observatory-icons/${getIconUrl(o)}`)
                "
                :class-name="isSelectedObservatory(o) ? 'shadow-red' : ''"
              ></l-icon>
              <l-tooltip :options="{ direction: 'top' }">
                {{ o.observatory }}
              </l-tooltip>
            </l-marker>
          </template>
          <template v-if="!!mapObject">
            <rain-layer v-if="rainLayer" :is-simple-mode="true"></rain-layer>
            <small-river-flooding-layer
              v-if="smallRiverLayer"
            ></small-river-flooding-layer>
          </template>
        </l-map>
        <v-hover v-slot="{ hover }">
          <div class="hover-animation" @click="onClickMap">
            <v-expand-transition>
              <div
                v-if="hover"
                class="d-flex transition-fast-in-fast-out darken-2 white--text"
                style="height: 100%; background-color: rgba(0, 0, 0, 0.4);"
              >
                <v-row no-gutters align="center" justify="center">
                  <div class="text-center">
                    <v-icon color="white" size="100">
                      mdi-arrow-expand-all
                    </v-icon>
                    <div>全体画面で見る</div>
                  </div>
                </v-row>
              </div>
            </v-expand-transition>
          </div>
        </v-hover>
        <div class="map-controls pa-2">
          <v-row no-gutters align="center">
            <v-spacer></v-spacer>
            <v-col cols="auto">
              <v-btn
                dark
                small
                class="mr-1 pa-1"
                @click="changeLayer('rainLayer')"
                :color="rainLayer ? 'success' : 'disable'"
              >
                予測降雨
              </v-btn>
              <v-btn
                dark
                small
                class="pa-1"
                @click="changeLayer('smallRiverLayer')"
                :color="smallRiverLayer ? 'success' : 'disable'"
              >
                河川・内水氾濫
              </v-btn>
            </v-col>
          </v-row>
        </div>
      </v-col>
      <v-col class="pr-2 pl-6">
        <div class="river-level-contents">
          <v-row no-gutters align="end">
            <v-col cols="auto">
              <h4>
                <v-btn
                  icon
                  depressed
                  dark
                  x-small
                  color="orange"
                  class="ma-1 mr-0"
                >
                  <v-icon>
                    mdi-triangle
                  </v-icon>
                </v-btn>
                水位
                <span
                  style="font-size: 12px; font-weight: inherit; color: gray;"
                >
                  モニタリング
                </span>
                <span
                  v-if="riverLevelItems && riverLevelItems.length > 0"
                  style="font-size: 12px; font-weight: inherit;"
                >
                  ({{ riverLevelItems[0].time }})
                </span>
                <v-btn
                  depressed
                  x-small
                  dark
                  color="gray"
                  @click="openTsTable(Observatory.RIVER_LEVEL.key)"
                  class="mx-2"
                >
                  水位時系列一覧
                  <v-icon right small>mdi-arrow-right-circle-outline</v-icon>
                </v-btn>
              </h4>
            </v-col>
            <v-col>
              <div class="unit text-right">
                (水位: m)
              </div>
            </v-col>
          </v-row>
          <div class="table-container">
            <v-data-table
              dense
              :headers="riverLevelHeaders"
              :items="riverLevelItems"
              hide-default-footer
              class="river-level-table"
              :height="'calc(46.0vh - 19px - 40px)'"
              :items-per-page="-1"
              fixed-header
              @click:row="onClickObservatory"
              :no-data-text="'Loading...'"
            >
              <template v-slot:[`header.standby`]="{ header }">
                <v-icon size="16" :color="header.color">
                  mdi-stop
                </v-icon>
                {{ header.text }}
              </template>
              <template v-slot:[`header.warning`]="{ header }">
                <v-icon size="16" :color="header.color">
                  mdi-stop
                </v-icon>
                {{ header.text }}
              </template>
              <template v-slot:[`header.evacuation`]="{ header }">
                <v-icon size="16" :color="header.color">
                  mdi-stop
                </v-icon>
                {{ header.text }}
              </template>
              <template v-slot:[`header.dangerous`]="{ header }">
                <v-icon size="16" :color="header.color">
                  mdi-stop
                </v-icon>
                {{ header.text }}
              </template>
              <template v-slot:[`item.observatory`]="{ item }">
                <div
                  class="text-truncate"
                  style="max-width: 90%; cursor: pointer;"
                >
                  <v-tooltip left bottom>
                    <template v-slot:activator="{ on, attrs }">
                      <span v-bind="attrs" v-on="on" class="name-link">{{
                        item.observatory
                      }}</span>
                    </template>
                    <span>{{ item.observatory }}</span>
                  </v-tooltip>
                </div>
              </template>
              <template v-slot:[`item.standby`]="{ item }">
                {{ item.standby ? item.standby.toFixed(2) : "・" }}
              </template>
              <template v-slot:[`item.warning`]="{ item }">
                {{ item.warning ? item.warning.toFixed(2) : "・" }}
              </template>
              <template v-slot:[`item.evacuation`]="{ item }">
                {{ item.evacuation ? item.evacuation.toFixed(2) : "・" }}
              </template>
              <template v-slot:[`item.dangerous`]="{ item }">
                {{ item.dangerous ? item.dangerous.toFixed(2) : "・" }}
              </template>
              <template v-slot:[`item.riverLevel`]="{ item }">
                <v-chip
                  small
                  :color="getRiverLevelColor(item, 'riverLevel')"
                  :dark="'#ffffff' !== getRiverLevelColor(item, 'riverLevel')"
                  style="width: 100%; justify-content: flex-end; height: 18px;"
                >
                  {{
                    typeof item.riverLevel === "undefined" ||
                    item.riverLevel <= -998
                      ? "-"
                      : item.riverLevel.toFixed(2)
                  }}
                </v-chip>
              </template>
              <template v-slot:[`item.forecastMaxLevel`]="{ item }">
                <v-chip
                  small
                  :color="getRiverLevelColor(item, 'forecastMaxLevel')"
                  :dark="
                    '#ffffff' !== getRiverLevelColor(item, 'forecastMaxLevel')
                  "
                  style="width: 100%; justify-content: flex-end; height: 18px;"
                >
                  {{
                    typeof item.forecastMaxLevel === "undefined" ||
                    item.forecastMaxLevel <= -998
                      ? "-"
                      : item.forecastMaxLevel.toFixed(2)
                  }}
                </v-chip>
              </template>
              <template v-slot:[`item.graph`]="{ item }">
                <div class="graph-area">
                  <div
                    v-if="item.forecastMaxLevelPercent"
                    :style="{
                      width: item.forecastMaxLevelPercent + '%',
                      height: '20px',
                      backgroundColor: '#c2dcff',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                    }"
                  ></div>
                  <v-progress-linear
                    v-if="item.riverLevelPercent"
                    :value="item.riverLevelPercent"
                    color="#3388ff"
                    background-color="rgba(0,0,0,0)"
                    height="20"
                  ></v-progress-linear>
                  <div
                    v-if="item.standbyPercent"
                    class="level-line standby-color"
                    :style="{ left: item.standbyPercent + '%' }"
                  ></div>
                  <div
                    v-if="item.warningPercent"
                    class="level-line warning-color"
                    :style="{ left: item.warningPercent + '%' }"
                  ></div>
                  <div
                    v-if="item.evacuationPercent"
                    class="level-line evacuation-color"
                    :style="{ left: item.evacuationPercent + '%' }"
                  ></div>
                  <div
                    v-if="item.dangerousPercent"
                    class="level-line dangerous-color"
                    :style="{ left: item.dangerousPercent + '%' }"
                  ></div>
                </div>
              </template>
            </v-data-table>
          </div>
        </div>
        <div class="rainfall-contents mt-6">
          <v-row no-gutters align="end">
            <v-col>
              <h4>
                <v-btn
                  icon
                  depressed
                  dark
                  x-small
                  color="orange"
                  class="ma-1 mr-0"
                >
                  <v-icon>
                    mdi-circle
                  </v-icon>
                </v-btn>
                雨量
                <span
                  style="font-size: 12px; font-weight: inherit; color: gray;"
                >
                  モニタリング
                </span>
                <span
                  v-if="rainfallItems && rainfallItems.length > 0"
                  style="font-size: 12px; font-weight: inherit;"
                >
                  ({{ rainfallItems[0].time }})
                </span>
                <v-btn
                  depressed
                  x-small
                  dark
                  color="gray"
                  @click="openTsTable(Observatory.RAIN.key)"
                  class="mx-2"
                >
                  雨量時系列一覧
                  <v-icon right small>mdi-arrow-right-circle-outline</v-icon>
                </v-btn>
              </h4>
            </v-col>
            <v-col cols="auto">
              <div class="unit text-right">
                (雨量 : mm)
              </div>
            </v-col>
          </v-row>
          <v-data-table
            dense
            :headers="rainfallHeaders"
            :items="rainfallItems"
            hide-default-footer
            class="rainfall-table"
            :height="'calc(44.5vh - 19px - 40px)'"
            :items-per-page="-1"
            fixed-header
            @click:row="onClickObservatory"
            :no-data-text="'Loading...'"
          >
            <template v-slot:[`item.observatory`]="{ item }">
              <div
                class="text-truncate"
                style="max-width: 90%; cursor: pointer;"
              >
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <span v-bind="attrs" v-on="on" class="name-link">{{
                      item.observatory
                    }}</span>
                  </template>
                  <span>{{ item.observatory }}</span>
                </v-tooltip>
              </div>
            </template>
            <template v-slot:[`item.rain`]="{ item }">
              <v-chip
                small
                :color="getRainColor(item, 'rain')"
                :dark="'#ffffff' !== getRainColor(item, 'rain')"
                style="width: 100%; justify-content: flex-end; height: 18px;"
              >
                {{
                  typeof item.rain === "undefined" || item.rain <= -998
                    ? "-"
                    : item.rain
                }}
              </v-chip>
            </template>
            <template v-slot:[`item.rain60`]="{ item }">
              <v-chip
                small
                :color="getRainColor(item, 'rain60')"
                :dark="'#ffffff' !== getRainColor(item, 'rain60')"
                style="width: 100%; justify-content: flex-end; height: 18px;"
              >
                {{
                  typeof item.rain60 === "undefined" || item.rain60 <= -998
                    ? "-"
                    : item.rain60
                }}
              </v-chip>
            </template>
            <template v-slot:[`item.totalRain`]="{ item }">
              <v-chip
                small
                :color="getRainColor(item, 'totalRain')"
                :dark="'#ffffff' !== getRainColor(item, 'totalRain')"
                style="width: 100%; justify-content: flex-end; height: 18px;"
              >
                {{
                  typeof item.totalRain === "undefined" ||
                  item.totalRain <= -998
                    ? "-"
                    : item.totalRain
                }}
              </v-chip>
            </template>
            <template v-slot:[`item.forecastTotal`]="{ item }">
              <v-chip
                small
                :color="getRainColor(item, 'forecastTotal')"
                :dark="'#ffffff' !== getRainColor(item, 'forecastTotal')"
                style="width: 100%; justify-content: flex-end; height: 18px;"
              >
                {{
                  typeof item.forecastTotal === "undefined" ||
                  item.forecastTotal <= -998
                    ? "-"
                    : item.forecastTotal.toFixed(1)
                }}
              </v-chip>
            </template>
          </v-data-table>
        </div>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import {
  rootActions,
  rootGetters,
  rootMutations,
} from "../../store/store-functions";
import { LMap, LTileLayer, LMarker, LIcon, LTooltip } from "vue2-leaflet";
import L from "leaflet";
import _ from "lodash";
import { Risk } from "../../enums/Risk";
import { Observatory } from "../../enums/Observatory";
import RainLayer from "@/components/base-map/risk-layer/RainLayer";
import SmallRiverFloodingLayer from "@/components/base-map/risk-layer/SmallRiverFloodingLayer";
import moment from "moment";

export default {
  name: "ObservatoriesMonitor",
  props: {
    baseDate: {
      type: Object,
      require: true,
    },
    linkType: {
      type: [String, Number],
      require: true,
    },
    filterItem: {
      type: [String, Number],
      require: true,
    },
    filteredObIds: {
      type: Object,
      require: true,
    },
  },
  components: {
    SmallRiverFloodingLayer,
    RainLayer,
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LTooltip,
  },
  provide() {
    const baseMapData = {};
    Object.defineProperty(baseMapData, "storeId", {
      enumerable: true,
      get: () => this.riverLevelStoreId,
    });
    Object.defineProperty(baseMapData, "readOnly", {
      enumerable: true,
      get: () => true,
    });
    return { baseMapData };
  },
  data() {
    return {
      mapObject: null,
      Observatory: Observatory,
      selectedObservatory: null,
      riverLevelStoreId: 1111,
      rainfallStoreId: 2222,
      mapLabel: Risk.OBSERVATORY.string,
      url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
      attribution:
        '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
      zoom: 10,
      maxZoom: 15,
      center: [36.39155, 139.060447],
      riverLevelItems: [],
      riverLevelHeaders: [
        {
          text: "観測所",
          align: "left",
          sortable: false,
          width: "15%",
          value: "observatory",
          class: "data-table-header",
        },
        {
          text: "河川名",
          align: "left",
          sortable: false,
          width: "10%",
          value: "river",
          class: "data-table-header",
        },
        {
          text: "水防団待機",
          align: "right",
          sortable: false,
          value: "standby",
          width: "8%",
          class: "data-table-header",
          color: "#35a86b",
        },
        {
          text: "氾濫注意",
          align: "right",
          sortable: false,
          value: "warning",
          width: "8%",
          class: "data-table-header",
          color: "#f2e701",
        },
        {
          text: "避難判断",
          align: "right",
          sortable: false,
          value: "evacuation",
          width: "8%",
          class: "data-table-header",
          color: "#ff2800",
        },
        {
          text: "氾濫危険",
          align: "right",
          sortable: false,
          value: "dangerous",
          width: "8%",
          class: "data-table-header",
          color: "#aa00aa",
        },
        {
          text: "現在水位",
          align: "right",
          sortable: false,
          value: "riverLevel",
          width: "10%",
          class: "data-table-header",
        },
        {
          text: "予測最高水位",
          align: "right",
          sortable: false,
          value: "forecastMaxLevel",
          width: "10%",
          class: "data-table-header",
        },
        {
          text: "グラフ",
          align: "center",
          sortable: false,
          value: "graph",
          class: "data-table-header",
        },
      ],
      rainfallHeaders: [
        {
          text: "観測所",
          align: "left",
          sortable: false,
          width: "15%",
          value: "observatory",
          class: "data-table-header",
        },
        {
          text: "住所",
          align: "left",
          sortable: false,
          value: "address",
          class: "data-table-header",
        },
        {
          text: "最新時刻",
          align: "right",
          sortable: false,
          value: "time",
          width: "12%",
          class: "data-table-header",
        },
        {
          text: "10分雨量",
          align: "right",
          sortable: false,
          value: "rain",
          width: "10%",
          class: "data-table-header",
        },
        {
          text: "時間雨量",
          align: "right",
          sortable: false,
          value: "rain60",
          width: "10%",
          class: "data-table-header",
        },
        {
          text: "累加雨量",
          align: "right",
          sortable: false,
          value: "totalRain",
          width: "10%",
          class: "data-table-header",
        },
        {
          text: "予測累加雨量(36h後)",
          align: "right",
          sortable: false,
          value: "forecastTotal",
          width: "10%",
          class: "data-table-header",
        },
      ],
      rainfallItems: [],
      rainLayer: true,
      smallRiverLayer: false,
      isCurrent: false,
    };
  },
  computed: {
    observatories() {
      return this.$store.getters[rootGetters.FIND_RISK](
        Risk.OBSERVATORY,
        this.riverLevelStoreId
      ).data.contents;
    },
  },
  watch: {
    baseDate() {
      if (!this.baseDate) {
        return;
      }

      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId: this.riverLevelStoreId,
        baseDate: this.baseDate,
      });
      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId: this.rainfallStoreId,
        baseDate: this.baseDate,
      });

      const current = moment();
      const diff = current.diff(this.baseDate, "minutes");
      this.isCurrent = diff < 10;

      this.loadData();
    },
    filteredObIds() {
      this.setRiverLevelItems();
      this.setRainfallItems();
    },
  },
  async created() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });

    this.initMapData(this.riverLevelStoreId, {
      baseDate: this.baseDate,
      selectedBaseTile: this.baseTile,
      observatoryOptions: {
        river: { text: "全体", value: -1 },
        filter: [Observatory.RIVER_LEVEL],
      },
    });
    this.initMapData(this.rainfallStoreId, {
      baseDate: this.baseDate,
      selectedBaseTile: this.baseTile,
      observatoryOptions: {
        river: { text: "全体", value: -1 },
        filter: [Observatory.RAIN],
      },
    });
  },
  mounted() {
    this.mapObject = this.$refs.observatoryMap.mapObject;
    this.updateMapObject();
  },
  methods: {
    openAnalysis(o = null) {
      const target = "gnm-sub";
      const subWindow = window.open("", target, "", true);
      const pastHref = subWindow.location.href;
      let url = `${window.location.origin}/index.html#/analysis`;
      if (o) {
        url += `?oid=${o.oid}&otype=${o.otype}`;
      }
      if (!this.isCurrent) {
        url += `${o ? "&" : "?"}baseDate=${this.baseDate.format("X")}`;
      }

      if (pastHref !== "about:blank") {
        subWindow.close();
        window.open(url, target, "", true);
      } else {
        subWindow.location.href = url;
      }
    },
    openTsTable(obType) {
      const target = "gnm-sub-ts";
      const subWindow = window.open("", target, "", true);
      const pastHref = subWindow.location.href;
      let url = `${window.location.origin}/index.html#/ts-table?obType=${obType}&linkType=${this.linkType}&filterItem=${this.filterItem}`;

      if (!this.isCurrent) {
        url += `&baseDate=${this.baseDate.format("X")}`;
      }

      if (pastHref !== "about:blank") {
        subWindow.close();
        window.open(url, target, "", true);
      } else {
        subWindow.location.href = url;
      }
    },
    initMapData(storeId, mapData) {
      this.$store.commit(rootMutations.INIT_MAP_DATA, { storeId, mapData });
    },
    removeMapData(storeId) {
      this.$store.commit(rootMutations.REMOVE_MAP_DATA, storeId);
    },
    updateMapObject() {
      const storeId = this.riverLevelStoreId;
      const mapObject = this.mapObject;
      this.$store.commit(rootMutations.UPDATE_MAP_OBJECT, {
        storeId,
        mapObject,
      });
    },
    async loadData() {
      await this.$store.dispatch(rootActions.LOAD_OBSERVATORY, {
        storeId: this.riverLevelStoreId,
        loadInfo: this.observatories.length === 0,
        loadCurrentData: true,
      });

      this.setRiverLevelItems();
      this.setRainfallItems();
    },
    setRiverLevelItems() {
      let items = [];

      if (!this.filteredObIds.waterList) {
        return;
      }
      const riverObservatories = _.filter(this.observatories, (o) => {
        return (
          o.type === Observatory.RIVER_LEVEL &&
          this.filteredObIds.waterList.includes(o._id)
        );
      });

      _.forEach(riverObservatories, (observatory) => {
        const min = this.getRiverLevelMin(observatory);
        const max = this.getRiverLevelMax(observatory, min);
        const row = {
          observatoryId: observatory._id,
          observatory: observatory.name,
          river: observatory.riverName,
          type: observatory.type,
          latlng: [observatory.lat, observatory.lng],
          status: observatory.status,
          standby: observatory.standbyLevel,
          warning: observatory.warningLevel,
          evacuation: observatory.evacuationLevel,
          dangerous: observatory.dangerousLevel,
          outbreak: observatory.outbreakLevel,
          riverLevel: observatory.level,
          forecastMaxLevel: observatory.forecastMaxLevel,
          standbyPercent: this.getPercentLevel(
            observatory.standbyLevel,
            min,
            max
          ),
          warningPercent: this.getPercentLevel(
            observatory.warningLevel,
            min,
            max
          ),
          evacuationPercent: this.getPercentLevel(
            observatory.evacuationLevel,
            min,
            max
          ),
          dangerousPercent: this.getPercentLevel(
            observatory.dangerousLevel,
            min,
            max
          ),
          riverLevelPercent: this.getPercentLevel(observatory.level, min, max),
          forecastMaxLevelPercent: this.getPercentLevel(
            observatory.forecastMaxLevel,
            min,
            max
          ),
          time: moment
            .utc(observatory.levelTime, "YYYY/MM/DD HH:mm")
            .local()
            .format("MM/DD HH:mm"),
          landform: observatory.landform,
        };
        items.push(row);
      });

      if (this.linkType === "user") {
        items = _.sortBy(items, (item) => {
          return _.indexOf(this.filteredObIds.waterList, item.observatoryId);
        });
      } else {
        items = _.orderBy(
          items,
          [
            (o) => {
              return this.sortId(o.observatoryId, "2561_");
            },
            (o) => {
              return this.sortId(o.observatoryId, "21");
            },
            (o) => {
              return this.sortId(o.observatoryId, "88");
            },
            (o) => {
              return this.sortId(o.observatoryId, "100");
            },
          ],
          ["asc", "asc", "asc", "asc"]
        );
      }
      items = _.orderBy(
        items,
        [
          (o) => {
            return this.sortLevel(o.riverLevel, o.dangerous);
          },
          (o) => {
            return this.sortLevel(o.forecastMaxLevel, o.dangerous);
          },
          (o) => {
            return this.sortLevel(o.riverLevel, o.evacuation);
          },
          (o) => {
            return this.sortLevel(o.forecastMaxLevel, o.evacuation);
          },
          (o) => {
            return this.sortLevel(o.riverLevel, o.warning);
          },
          (o) => {
            return this.sortLevel(o.forecastMaxLevel, o.warning);
          },
          (o) => {
            return this.sortLevel(o.riverLevel, o.standby);
          },
          (o) => {
            return this.sortLevel(o.forecastMaxLevel, o.standby);
          },
        ],
        ["desc", "desc", "desc", "desc", "desc", "desc", "desc", "desc"]
      );

      this.riverLevelItems = items;

      const bounds = _.map(this.riverLevelItems, (row) => {
        return row.latlng;
      });
      if (bounds && bounds.length > 0) {
        this.mapObject.fitBounds(bounds);
      }
    },
    setRainfallItems() {
      let items = [];

      if (!this.filteredObIds.rainList) {
        return;
      }
      const rainObservatories = _.filter(this.observatories, (o) => {
        return (
          o.type === Observatory.RAIN &&
          this.filteredObIds.rainList.includes(o._id)
        );
      });

      _.forEach(rainObservatories, (observatory) => {
        if (observatory) {
          const time = observatory.rainTime
            ? moment
                .utc(observatory.rainTime, "YYYY/MM/DD HH:mm")
                .local()
                .format("MM/DD HH:mm")
            : "-";

          const row = {
            observatoryId: observatory._id,
            address: observatory.address,
            type: observatory.type,
            latlng: [observatory.lat, observatory.lng],
            status: observatory.status,
            observatory: observatory.name,
            rain: observatory.rain,
            rain60: observatory.rain60,
            totalRain: observatory.rainTotal,
            forecastTotal: observatory.forecastTotal,
            time: time,
          };

          items.push(row);
        }
      });

      if (this.linkType === "user") {
        items = _.sortBy(items, (item) => {
          return _.indexOf(this.filteredObIds.rainList, item.observatoryId);
        });
      }

      this.rainfallItems = items;
    },
    getIconUrl(observatory) {
      switch (observatory.type) {
        case Observatory.RIVER_LEVEL: {
          let icon = "stage-normal.png";
          if (
            typeof observatory.riverLevel === "undefined" ||
            observatory.riverLevel <= -998
          )
            icon = "stage-deficit.png";
          if (
            observatory.startStage &&
            observatory.startStage <= observatory.level
          )
            icon = "stage-start.png";
          if (
            observatory.standby &&
            observatory.standby <= observatory.riverLevel
          )
            icon = "stage-standby.png";
          if (
            observatory.warning &&
            observatory.warning <= observatory.riverLevel
          )
            icon = "stage-warning.png";
          if (
            observatory.evacuation &&
            observatory.evacuation <= observatory.riverLevel
          )
            icon = "stage-evacuation.png";
          if (
            observatory.dangerous &&
            observatory.dangerous <= observatory.riverLevel
          )
            icon = "stage-dangerous.png";
          if (
            observatory.outbreak &&
            observatory.outbreak <= observatory.riverLevel
          )
            icon = "stage-outbreak.png";

          return icon;
        }
        case Observatory.RAIN: {
          let icon = "rain-default.png";
          const rain = observatory.rain;
          if (typeof rain === "undefined" || rain <= -998)
            icon = "rain-deficit.png";
          else if (rain < 1) icon = "rain-0.png";
          else if (rain >= 1 && rain < 5) icon = "rain-2.png";
          else if (rain >= 5 && rain < 10) icon = "rain-3.png";
          else if (rain >= 10 && rain < 20) icon = "rain-4.png";
          else if (rain >= 20) icon = "rain-5.png";
          return icon;
        }
        case Observatory.DAM:
          return "dam.png";
      }
    },
    getPercentLevel(riverLevel, min, max) {
      if (riverLevel <= 0 || max === null) {
        return null;
      }

      const value = ((riverLevel - min) / max) * 100;
      return value <= 0 ? 0 : value;
    },
    getRiverLevelMin(observatory) {
      let min = 0;
      if (observatory.landform && observatory.landform.length > 0) {
        const landformMin = _.minBy(observatory.landform, (o) => {
          return o[1];
        });

        min = landformMin[1] - 0.5;
        if (min < 0) {
          min = 0;
        }
      }

      return min;
    },
    getRiverLevelMax(observatory, min) {
      let max = null;

      if (observatory.dangerousLevel) {
        max = (observatory.dangerousLevel - min) * 1.5;
      } else if (observatory.warningLevel) {
        max = (observatory.warningLevel - min) * 2;
      }

      return max;
    },
    onClickObservatory(o) {
      this.openAnalysis({ oid: o.observatoryId, otype: o.type.index });
    },
    onClickMap() {
      this.$cookies.remove("oid");
      this.openAnalysis();
    },
    isSelectedObservatory(o) {
      return !!(
        this.selectedObservatory &&
        this.selectedObservatory._id === o.observatoryId &&
        this.selectedObservatory.type === o.type
      );
    },
    changeLayer(layer) {
      this.rainLayer = false;
      this.smallRiverLayer = false;

      switch (layer) {
        case "rainLayer":
          this.rainLayer = true;
          break;
        case "smallRiverLayer":
          this.smallRiverLayer = true;
          break;
      }
    },
    getRiverLevelColor(observatory, key) {
      let color = "#ffffff";
      const level = observatory[key];

      if (typeof level === "undefined" || level <= -998) color = "#AAAAAA";
      if (observatory.standby && observatory.standby <= level)
        color = "#008000";
      if (observatory.warning && observatory.warning <= level)
        color = "#FFA500";
      if (observatory.evacuation && observatory.evacuation <= level)
        color = "#FF2800";
      if (observatory.dangerous && observatory.dangerous <= level)
        color = "#AD02AD";

      return color;
    },
    getRainColor(observatory, key) {
      let color = "#ffffff";
      const rain = observatory[key];
      if (typeof rain === "undefined" || rain <= -998) color = "#AAAAAA";
      else if (rain < 1) color = "#ffffff";
      else if (rain >= 1 && rain < 20) color = "#2a7aaa";
      else if (rain >= 20 && rain < 30) color = "#1E42AF";
      else if (rain >= 30 && rain < 50) color = "#D88100";
      else if (rain >= 50 && rain < 80) color = "#FF0000";
      else if (rain >= 80) color = "#800080";

      return color;
    },
    sortId(string, word) {
      if (_.startsWith(string, word)) {
        if (string.includes("_")) {
          const array = _.split(string, "_");
          return parseInt(array[1]);
        } else {
          return parseInt(string);
        }
      } else {
        return 9999999;
      }
    },
    sortLevel(level, warning) {
      if (warning && level > warning) {
        return level - warning;
      } else {
        return false;
      }
    },
  },
};
</script>
<style lang="scss">
.v-application .text-right.data-table-header {
  text-align: center !important;
}
.v-application .text-left.data-table-header {
  text-align: center !important;
}

.observatory-contents {
  .v-data-table {
    border-radius: 0;
  }
  ::-webkit-scrollbar {
    display: none;
  }
  table {
    table-layout: fixed !important;
  }
}

.river-level-contents {
  .data-table-header {
    padding: 1px 1px !important;
    font-size: 11px !important;
    font-weight: bold !important;
  }
  .theme--light.v-data-table thead tr th {
    color: black !important;
  }
  .theme--light.v-data-table thead tr .data-table-header:nth-child(7) {
    background-color: #3a1e87;
    color: white !important;
  }
  .theme--light.v-data-table thead tr .data-table-header:nth-child(8) {
    background-color: #3a1e87;
    color: white !important;
  }
  .theme--light.v-data-table thead tr:last-child th {
    border-bottom: 1px double black !important;
  }
  $standby: #35a86b;
  $warning: #f2e701;
  $evacuation: #ff2800;
  $dangerous: #aa00aa;

  .standby-color {
    background-color: $standby !important;
    font-size: 14px;
  }
  .warning-color {
    background-color: $warning !important;
    font-size: 10px;
  }
  .evacuation-color {
    background-color: $evacuation !important;
    font-size: 10px;
  }
  .dangerous-color {
    background-color: $dangerous !important;
    font-size: 10px;
  }

  .graph-area {
    height: 22px;
    pointer-events: none;
    position: relative;
    border: 1px solid #aaaaaa;
    border-left: none;
    .level-line {
      position: absolute;
      top: 0;
      left: 50%;
      width: 2px;
      height: 100%;
    }
    .warning-color.level-line {
      left: 25%;
    }
  }
}
.river-level-table {
  border-top: 1px solid black;
  border-bottom: 1px solid black !important;
  border-radius: 0;
  td {
    font-size: 13px !important;
    padding: 1px 4px !important;
    height: inherit !important;
  }
  tr td:first-child {
    font-weight: bold;
    font-size: 13px;
  }
  tr td:nth-child(7) {
    border-left: 1px solid #3a1e87;
  }
  tr td:nth-child(8) {
    border-right: 1px solid #3a1e87;
    border-left: 1px solid #3a1e87;
  }
  tr:last-child td:nth-child(7) {
    border-bottom: 1px solid #3a1e87;
  }
  tr:last-child td:nth-child(8) {
    border-bottom: 1px solid #3a1e87;
  }

  td:last-child {
    padding: 0 !important;
  }
}

.rainfall-contents {
  .data-table-header {
    padding: 2px 4px !important;
    font-size: 11px !important;
    font-weight: bold !important;
  }
  .theme--light.v-data-table thead tr th {
    color: black !important;
  }
  .theme--light.v-data-table thead tr:last-child th {
    border-bottom: 1px double black !important;
  }
  .theme--light.v-data-table .data-table-header:nth-child(3) {
    background-color: #3a1e87 !important;
    color: white !important;
  }
  .theme--light.v-data-table .data-table-header:nth-child(4) {
    background-color: #3a1e87 !important;
    color: white !important;
  }
  .theme--light.v-data-table .data-table-header:nth-child(5) {
    background-color: #3a1e87 !important;
    color: white !important;
  }
  .theme--light.v-data-table .data-table-header:nth-child(6) {
    background-color: #3a1e87 !important;
    color: white !important;
  }
  .theme--light.v-data-table .data-table-header:nth-child(7) {
    background-color: #3a1e87 !important;
    color: white !important;
  }
}
.rainfall-table {
  border-top: 1px solid black;
  border-bottom: 1px solid black !important;
  border-radius: 0;
  td {
    font-size: 13px !important;
    padding: 1px 4px !important;
    height: inherit !important;
  }
  tr td:first-child {
    font-weight: bold;
    font-size: 13px;
  }
  tr td:nth-child(3) {
    border-left: 1px solid #3a1e87;
  }
  tr td:nth-child(4) {
    border-left: 1px solid #3a1e87;
  }
  tr td:nth-child(5) {
    border-left: 1px solid #3a1e87;
  }
  tr td:nth-child(6) {
    border-left: 1px solid #3a1e87;
  }
  tr td:nth-child(7) {
    border-left: 1px solid #3a1e87;
    border-right: 1px solid #3a1e87;
  }

  tr:last-child td:nth-child(3) {
    border-bottom: 1px solid #3a1e87;
  }
  tr:last-child td:nth-child(4) {
    border-bottom: 1px solid #3a1e87;
  }
  tr:last-child td:nth-child(5) {
    border-bottom: 1px solid #3a1e87;
  }
  tr:last-child td:nth-child(6) {
    border-bottom: 1px solid #3a1e87;
  }
  tr:last-child td:nth-child(7) {
    border-bottom: 1px solid #3a1e87;
  }
}
</style>
<style lang="scss" scoped>
.name-link:hover {
  color: #1976d2;
  text-decoration: underline;
}
.map-area {
  border: 1px solid rgba(0, 0, 0, 0.18);
}
.map-controls {
  width: 100%;
  position: absolute;
  top: 0;
  z-index: 500;
  > .v-chip {
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
  }
}
.hover-animation {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  z-index: 500;
  cursor: pointer;
}
.unit {
  font-size: 10px;
}
.info-area {
  cursor: pointer;
  position: absolute;
  bottom: 0;
  z-index: 1500;
  width: 100%;
  padding: 5px 10px;
  background-color: rgba(0, 0, 0, 0.6);
  color: #f5f5f5;
  font-size: 1.2rem !important;
  font-family: "ヒラギノ角ゴ ProN", "Hiragino Kaku Gothic ProN", "游ゴシック",
    "游ゴシック体", YuGothic, "Yu Gothic", "メイリオ", Meiryo, "ＭＳ ゴシック",
    "MS Gothic", HiraKakuProN-W3, "TakaoExゴシック", TakaoExGothic,
    "MotoyaLCedar", "Droid Sans Japanese", sans-serif;
  .detail-button {
    font-size: 12px;
    color: orange;
    text-align: right;
    font-weight: bold;
  }
}
.legend {
  width: 100%;
  position: absolute;
  z-index: 500;
  top: 0;
  right: 0;
}
.observatory-info {
  position: absolute;
  z-index: 500;
  left: 0;
  bottom: 0;
}

@mixin shadow($color, $shadow-size) {
  -webkit-filter: drop-shadow(
      (-$shadow-size) (-$shadow-size) $shadow-size $color
    )
    drop-shadow($shadow-size (-$shadow-size) $shadow-size $color)
    drop-shadow((-$shadow-size) $shadow-size $shadow-size $color)
    drop-shadow($shadow-size $shadow-size $shadow-size $color);
  filter: drop-shadow((-$shadow-size) (-$shadow-size) $shadow-size $color)
    drop-shadow($shadow-size (-$shadow-size) $shadow-size $color)
    drop-shadow((-$shadow-size) $shadow-size $shadow-size $color)
    drop-shadow($shadow-size $shadow-size $shadow-size $color);
}

.shadow-red {
  @include shadow(#fa2d33, 4px);
}
.move-text {
  color: orange;
  font-size: 10px;
}
</style>
