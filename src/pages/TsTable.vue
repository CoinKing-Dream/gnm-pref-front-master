<template>
  <div class="ts-table">
    <div class="header">
      <v-row no-gutters align="center" justify="end">
        <div class="header-title">
          <h3>{{ obType === "rain" ? "雨量" : "水位" }}時系列一覧</h3>
        </div>
        <v-col>
          <v-btn x-small class="ma-2" text color="white" @click="close">
            <v-icon left>mdi-close</v-icon>閉じる
          </v-btn>
        </v-col>
      </v-row>
      <div class="progress-area">
        <v-progress-linear
          v-if="isLoading"
          color="orange"
          indeterminate
        ></v-progress-linear>
      </div>
    </div>
    <div class="legend pa-1">
      <v-row no-gutters align="center">
        <v-col>
          <v-chip color="white" class="mr-1" small label style="color: black;">
            実測
          </v-chip>
          <v-chip color="#f3faff" small label style="color: black;"
            >予測</v-chip
          >
        </v-col>
        <v-col cols="auto" class="toggle-label mr-4">
          間隔:
          <v-btn-toggle
            v-model="interval"
            color="primary"
            mandatory
            dense
            @change="onChangeTimes"
          >
            <v-btn small class="text-lowercase">
              10分毎
            </v-btn>
            <v-btn small class="text-lowercase">
              時間毎
            </v-btn>
          </v-btn-toggle>
        </v-col>
        <v-col cols="auto">
          表示範囲：
        </v-col>
        <v-col cols="auto">
          <link-menu
            :is-loading="isLoading"
            :init-value="{ linkType, filterItem }"
            background-color="white"
            @change="onChangeFilter"
          ></link-menu>
        </v-col>
        <v-col cols="auto" class="text-left base-date mr-2">
          <v-row no-gutters align="center" class="date-area">
            <v-col cols="auto">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    :color="isAutoUpdate() ? 'success' : 'error'"
                    @click="isAutoUpdate() ? stopAutoUpdate() : autoUpdate()"
                  >
                    {{ isAutoUpdate() ? "ON" : "OFF" }}
                  </v-btn>
                </template>
                <span>自動更新 on/off</span>
              </v-tooltip>
            </v-col>
            <v-col>
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
                <v-btn text dark small block>{{
                  baseDate.local().format("YYYY/MM/DD HH:mm")
                }}</v-btn>
              </VueCtkDateTimePicker>
            </v-col>
            <v-col cols="auto">
              <v-tooltip bottom>
                <template v-slot:activator="{ on, attrs }">
                  <v-btn
                    icon
                    small
                    v-bind="attrs"
                    v-on="on"
                    :color="'orange'"
                    @click="changeDateToCurrentDate()"
                    ><v-icon>mdi-update</v-icon></v-btn
                  >
                </template>
                <span>最新に更新する</span>
              </v-tooltip>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </div>
    <v-data-table
      v-if="tableItems"
      dense
      disable-sort
      hide-default-footer
      hide-default-header
      :headers="tableHeaders"
      :items="tableItems"
      :height="'calc(100vh - 68px - 50px)'"
      :items-per-page="-1"
      :no-data-text="'全時間欠測です。'"
      ref="table"
      class="time-series-table"
    >
      <template v-slot:header="{ headers }">
        <thead class="sub-header">
          <tr>
            <th
              v-for="(header, i) in warningTableHeader"
              :key="i"
              :style="{
                'text-align': header.align,
                width: header.width + 'px',
                'min-width': header.width + 'px',
              }"
              :class="{
                dummy: header.text === '',
              }"
            >
              <template v-if="header.value === 'subject'">
                <span> {{ header.text }}</span>
              </template>
              <template v-else>
                <span
                  style="cursor: pointer; color: #2c7be5;"
                  class="font-weight-bold"
                  @click="onClickObservatory(header.value)"
                >
                  {{ header.text }}
                </span>
                <template v-if="obType === Observatory.RAIN.key && header.text">
                  <v-row no-gutters>
                    <v-col class="rain-header pr-1">
                      {{ interval === 0 ? "10分" : "時間" }}
                    </v-col>
                    <v-col
                      class="rain-header"
                      style="border-left: solid 1px #eeeeee;"
                    >
                      累加
                    </v-col>
                  </v-row>
                </template>
              </template>
            </th>
          </tr>
          <tr v-for="(item, index) in warningTableItems" ref="row" :key="index">
            <th
              v-for="(header, headerIndex) in warningTableHeader"
              :key="headerIndex"
              :class="{
                dummy: header.text === '',
              }"
            >
              <template v-if="header.value === 'subject'">
                <v-icon
                  v-if="item[header.value] !== '河川名'"
                  size="16"
                  :color="getColor(item[header.value]) || 'white'"
                >
                  mdi-stop
                </v-icon>
                {{ item[header.value] }}
              </template>
              <template v-else>
                {{ item[header.value] }}
              </template>
            </th>
          </tr>
        </thead>
      </template>
      <template v-slot:body="{ items }">
        <tbody v-if="tableItems.length > 0">
          <tr v-for="(item, index) in items" ref="row" :key="index">
            <template v-if="obType === Observatory.RIVER_LEVEL.key">
              <td
                v-for="(header, headerIndex) in tableHeaders"
                :key="headerIndex"
                :style="{
                  'text-align': header.align,
                  width: header.width + 'px',
                  'min-width': header.width + 'px',
                  color: getRiverLevelColor(header, item[header.value]),
                }"
                :class="{
                  date: header.value === 'date',
                  'latest-real-date':
                    header.value !== 'date' &&
                    isLatestRealDate(header.tableLatestRealDate, item.date),
                  'after-latest-real-date':
                    header.value !== 'date' &&
                    isAfterLatestRealDate(
                      header.tableLatestRealDate,
                      item.date
                    ),
                  dummy: header.text === '',
                  'font-weight-bold':
                    header.value !== 'date' &&
                    getRiverLevelColor(header, item[header.value]) !==
                      '#000000',
                }"
              >
                <template v-if="header.value === 'date'">
                  {{ getMMDDHHmmFormat(item[header.value]) }}
                </template>
                <template v-else>
                  {{ item[header.value] }}
                </template>
              </td>
            </template>
            <template v-else>
              <td
                v-for="(header, headerIndex) in tableHeaders"
                :key="headerIndex"
                :style="{
                  'text-align': header.align,
                  width: header.width + 'px',
                  'min-width': header.width + 'px',
                }"
                :class="{
                  date: header.value === 'date',
                  'latest-real-date':
                    header.value !== 'date' &&
                    isLatestRealDate(header.tableLatestRealDate, item.date),
                  'after-latest-real-date':
                    header.value !== 'date' &&
                    isAfterLatestRealDate(
                      header.tableLatestRealDate,
                      item.date
                    ),
                  dummy: header.text === '',
                }"
              >
                <template v-if="header.value === 'date'">
                  {{ getMMDDHHmmFormat(item[header.value]) }}
                </template>
                <template v-else>
                  <span
                    v-if="
                      !item[header.value] ||
                      typeof item[header.value] === 'string'
                    "
                  >
                    {{ item[header.value] }}
                  </span>
                  <v-row no-gutters v-else>
                    <v-col
                      class="pr-1"
                      :style="{
                        color:
                          header.value !== 'date'
                            ? getRainColor(item[header.value].rainValue)
                            : 'white',
                      }"
                      :class="{
                        'font-weight-bold':
                          header.value !== 'date' &&
                          getRainColor(item[header.value].rainValue) !==
                            '#000000',
                      }"
                    >
                      {{ item[header.value].rainValue }}
                    </v-col>
                    <v-col
                      style="border-left: solid 1px #eeeeee;"
                      :style="{
                        color: getRainColor(item[header.value].totalRainValue),
                      }"
                      :class="{
                        'font-weight-bold':
                          header.value !== 'date' &&
                          getRainColor(item[header.value].totalRainValue) !==
                            '#000000',
                      }"
                    >
                      {{ item[header.value].totalRainValue }}
                    </v-col>
                  </v-row>
                </template>
              </td>
            </template>
          </tr>
          <tr style="height: 100px; background-color: lightgrey;">
            <td :colspan="tableHeaders.length"></td>
          </tr>
        </tbody>
        <tbody v-else>
          <tr>
            <td class="zero-data" :colspan="tableHeaders.length">
              全時刻欠測です。
            </td>
          </tr>
        </tbody>
      </template>
    </v-data-table>
    <v-row
      no-gutters
      class="text-center pagination-area"
      align="center"
      justify="center"
    >
      <v-pagination
        v-model="page"
        :length="pageLength"
        color="#3a1e87"
        @input="onInputPagination"
      ></v-pagination>
    </v-row>
  </div>
</template>

<script>
import VueCtkDateTimePicker from "vue-ctk-date-time-picker";
import {
  rootActions,
  rootGetters,
  rootMutations,
} from "@/store/store-functions";
import { Observatory } from "@/enums/Observatory";
import { Risk } from "@/enums/Risk";
import moment from "moment";
import _ from "lodash";
import LinkMenu from "@/components/LinkMenu";
import { get } from "@/axios/apiAxios";
import conf from "@/config";

export default {
  name: "TsTable",
  components: { LinkMenu, VueCtkDateTimePicker },
  data() {
    return {
      Observatory: Observatory,
      storeId: 1111,
      page: 1,
      pageLength: 0,
      itemsPerPage: 20,
      warningTableHeader: [],
      warningTableItems: [],
      tableHeaders: [],
      tableItems: null,
      isLoading: false,
      warningLevels: [
        {
          text: "水防団待機",
          class: "standby-color",
          color: "#35a86b",
          key: "standby",
        },
        {
          text: "氾濫注意",
          class: "warning-color",
          color: "#f2e701",
          key: "warning",
        },
        {
          text: "避難判断",
          class: "evacuation-color",
          color: "#ff2800",
          key: "evacuation",
        },
        {
          text: "氾濫危険",
          class: "dangerous-color",
          color: "#aa00aa",
          key: "dangerous",
        },
      ],
      targetIds: [],
      baseDate: moment(),
      linkType: null,
      filterItem: null,
      calendarDate: moment().format("YYYY/MM/DD HH:mm"),
      autoUpdateInterval: null,
      obType: null,
      interval: 0,
    };
  },
  computed: {
    observatories() {
      return this.$store.getters[rootGetters.FIND_RISK](
        Risk.OBSERVATORY,
        this.storeId
      ).data.contents;
    },
    selectedObservatories() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORIES](
        this.storeId
      );
    },
  },
  watch: {
    async baseDate() {
      if (!this.baseDate) {
        return;
      }
      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId: this.storeId,
        baseDate: this.baseDate,
      });

      await this.loadTableData();
    },
  },
  async created() {
    if (!self.opener) {
      window.name = "gnm-sub-ts";
    }
    this.initMapData(this.storeId, {
      baseDate: this.baseDate,
    });
    this.obType = this.$route.query.obType || Observatory.RIVER_LEVEL.key;
    this.linkType = this.$route.query.linkType || "user";
    this.filterItem =
      this.$route.query.filterItem || this.$cookies.get("userId");
    await this.loadTargetIds();
    await this.loadObservatories();

    if (this.$route.query.baseDate) {
      this.updateBaseDate(moment(parseInt(this.$route.query.baseDate), "X"));
    } else {
      this.changeDateToCurrentDate();
      this.autoUpdateInterval = setInterval(() => {
        this.changeDateToCurrentDate();
      }, 1000 * 60 * 5);
    }
  },
  methods: {
    initMapData(storeId, mapData) {
      this.$store.commit(rootMutations.INIT_MAP_DATA, { storeId, mapData });
    },
    removeMapData(storeId) {
      this.$store.commit(rootMutations.REMOVE_MAP_DATA, storeId);
    },
    async loadObservatories() {
      return this.$store.dispatch(rootActions.LOAD_OBSERVATORY, {
        storeId: this.storeId,
        loadInfo: true,
        loadCurrentData: false,
      });
    },
    async loadTargetIds() {
      const parameters = {};
      switch (this.linkType) {
        case "user":
          parameters.id = this.filterItem;
          break;
        case "city":
          if (this.filterItem) {
            parameters.id = this.filterItem;
          }
          break;
        case "office":
          parameters.id = this.filterItem;
          break;
      }
      const [err, response] = await get(
        conf.apiServer.url,
        `/api/${this.linkType}/observatories`,
        parameters
      );
      if (err) {
        throw new Error(
          "load failed : " + `/api/${this.linkType}/observatories`
        );
      }

      const tempIds =
        this.obType === Observatory.RAIN.key
          ? response.rainList
          : response.waterList;

      if (this.linkType === "user") {
        this.targetIds = tempIds;
      } else {
        this.targetIds = _.orderBy(
            tempIds,
            [
              (id) => {
                return this.sortId(id, "2561_");
              },
              (id) => {
                return this.sortId(id, "21");
              },
              (id) => {
                return this.sortId(id, "88");
              },
              (id) => {
                return this.sortId(id, "100");
              },
            ],
            ["asc", "asc", "asc", "asc"]
        );
      }
    },
    async loadObservatoryData() {
      const observatoryId =
        this.obType === Observatory.RAIN.key ? "2561_1" : "1000000008";

      return this.$store.dispatch(rootActions.LOAD_OBSERVATION_DATA, {
        storeId: this.storeId,
        observatoryId: observatoryId,
        type:
          this.obType === Observatory.RAIN.key
            ? Observatory.RAIN.index
            : Observatory.RIVER_LEVEL.index,
        targetIds: this.getShowingObservatoryIds(),
        linkType: this.linkType,
      });
    },
    async loadTableData() {
      this.isLoading = true;
      await this.loadObservatoryData();

      this.setWarningTableHeader();
      if (this.obType === Observatory.RIVER_LEVEL.key) {
        this.setWarningTableData();
      }

      this.setTableHeader();
      if (this.obType === Observatory.RAIN.key) {
        this.setTableRainData();
      } else if (this.obType === Observatory.RIVER_LEVEL.key) {
        this.setTableRiverLevelData();
      }

      this.setTableLatestRealDate();
      this.setTablePagination();
      this.isLoading = false;
    },
    setWarningTableHeader() {
      let headers = [];
      _.forEach(this.selectedObservatories, (observatory) => {
        headers.push({
          text: observatory.name,
          value: observatory._id,
          align: "right",
          width: 55,
          observatory: observatory,
        });
      });

      if (this.linkType !== "user") {
        headers = _.orderBy(
          headers,
          [
            (o) => {
              return this.sortId(o.value, "2561_");
            },
            (o) => {
              return this.sortId(o.value, "21");
            },
            (o) => {
              return this.sortId(o.value, "88");
            },
            (o) => {
              return this.sortId(o.value, "100");
            },
          ],
          ["asc", "asc", "asc", "asc"]
        );
      }

      headers.unshift({
        text: "観測所名",
        align: "left",
        sortable: false,
        value: "subject",
        width: 100,
      });

      this.warningTableHeader = headers;

      if (this.selectedObservatories.length < this.itemsPerPage) {
        const dummyCount =
          this.itemsPerPage - this.selectedObservatories.length;
        for (let i = 0; i < dummyCount; i++) {
          this.warningTableHeader.push({
            text: "",
            value: "",
            align: "right",
            width: 55,
            class: "dummy",
          });
        }
      }
    },
    setWarningTableData() {
      const items = [];

      const rivers = { subject: "河川名" };
      _.forEach(this.selectedObservatories, (observatory) => {
        rivers[observatory._id] = observatory.riverName;
      });
      items.push(rivers);

      _.forEach(this.warningLevels, (level) => {
        const row = { subject: level.text };
        _.forEach(this.selectedObservatories, (observatory) => {
          row[observatory._id] = observatory[level.key + "Level"]
            ? observatory[level.key + "Level"].toFixed(2)
            : "・";
        });
        items.push(row);
      });

      this.warningTableItems = items;
    },
    setTableHeader() {
      let headers = [];
      _.forEach(this.selectedObservatories, (observatory) => {
        headers.push({
          text: observatory.name,
          value: observatory._id,
          align: "right",
          baseDate: observatory.baseDate,
          latestRealDate: observatory.latestRealDate,
          standbyLevel: observatory.standbyLevel,
          warningLevel: observatory.warningLevel,
          evacuationLevel: observatory.evacuationLevel,
          dangerousLevel: observatory.dangerousLevel,
          width: 55,
        });
      });

      if (this.linkType !== "user") {
        headers = _.orderBy(
          headers,
          [
            (o) => {
              return this.sortId(o.value, "2561_");
            },
            (o) => {
              return this.sortId(o.value, "21");
            },
            (o) => {
              return this.sortId(o.value, "88");
            },
            (o) => {
              return this.sortId(o.value, "100");
            },
          ],
          ["asc", "asc", "asc", "asc"]
        );
      }

      headers.unshift({
        text: "観測所名",
        align: "left",
        sortable: false,
        value: "date",
        width: 100,
      });
      this.tableHeaders = headers;

      if (this.selectedObservatories.length < this.itemsPerPage) {
        const dummyCount =
          this.itemsPerPage - this.selectedObservatories.length;
        for (let i = 0; i < dummyCount; i++) {
          this.tableHeaders.push({
            text: "",
            value: "",
            align: "right",
            width: 55,
          });
        }
      }
    },
    setTableRiverLevelData() {
      const items = [];
      const timeObservatory = _.maxBy(this.selectedObservatories, (o) => {
        return o.times.length;
      });
      _.forEach(this.selectedObservatories, (observatory) => {
        observatory.temp = _.clone(observatory.riverLevels);
        if (observatory.times.length !== timeObservatory.times.length) {
          const riverLevels = [];
          _.forEach(timeObservatory.times, (time, key) => {
            if (time === observatory.times[key]) {
              riverLevels.push(observatory.riverLevels[key]);
            } else {
              const index = _.findIndex(observatory.times, (t) => {
                return t === time;
              });
              if (index !== -1) {
                riverLevels.push(observatory.riverLevels[index]);
              } else {
                riverLevels.push(null);
              }
            }
          });
          observatory.temp = riverLevels;
        }
      });
      const times = this.getRange(
        timeObservatory.times,
        timeObservatory.baseDate,
        timeObservatory.times,
        timeObservatory.latestRealDate
      );
      const observatories = _.map(this.selectedObservatories, (observatory) => {
        return {
          _id: observatory._id,
          riverLevels: this.getRange(
            observatory.temp,
            timeObservatory.baseDate,
            timeObservatory.times,
            timeObservatory.latestRealDate
          ),
        };
      });
      _.forEach(times, (time, key) => {
        const date = moment.utc(time, "YYYY/MM/DD HH:mm");
        const temp = {};
        _.forEach(observatories, (observatory) => {
          temp.date = date;
          if (observatory.riverLevels[key]) {
            temp[observatory._id] = _.floor(
              observatory.riverLevels[key],
              2
            ).toFixed(2);
          } else {
            temp[observatory._id] = "・";
          }
        });
        items.push(temp);
      });

      this.tableItems = items;
    },
    setTableRainData() {
      const items = [];
      const timeObservatory = _.maxBy(this.selectedObservatories, (o) => {
        return o.times.length;
      });
      _.forEach(this.selectedObservatories, (observatory) => {
        observatory.rainsTemp = _.clone(observatory.rains);
        observatory.rains60Temp = _.clone(observatory.rains60);
        observatory.totalRainsTemp = _.clone(observatory.totalRains);
        if (observatory.times.length !== timeObservatory.times.length) {
          const rains = [];
          const rains60 = [];
          const totalRains = [];
          _.forEach(timeObservatory.times, (baseTime, key) => {
            if (baseTime === observatory.times[key]) {
              rains.push(observatory.rains[key]);
              rains60.push(observatory.rains60[key]);
              totalRains.push(observatory.totalRains[key]);
            } else {
              const index = _.findIndex(observatory.times, (t) => {
                return t === baseTime;
              });
              if (index !== -1) {
                rains.push(observatory.rains[index]);
                rains60.push(observatory.rains60[index]);
                totalRains.push(observatory.totalRains[index]);
              } else {
                rains.push(null);
                rains60.push(null);
                totalRains.push(null);
              }
            }
          });
          observatory.rainsTemp = rains;
          observatory.rains60Temp = rains60;
          observatory.totalRainsTemp = totalRains;
        }
      });
      const times = this.getRange(
        timeObservatory.times,
        timeObservatory.baseDate,
        timeObservatory.times,
        timeObservatory.latestRealDate
      );
      const observatories = _.map(this.selectedObservatories, (observatory) => {
        return {
          _id: observatory._id,
          rains: this.getRange(
            observatory.rainsTemp,
            timeObservatory.baseDate,
            timeObservatory.times,
            timeObservatory.latestRealDate
          ),
          rains60: this.getRange(
            observatory.rains60Temp,
            timeObservatory.baseDate,
            timeObservatory.times,
            timeObservatory.latestRealDate
          ),
          totalRains: this.getRange(
            observatory.totalRainsTemp,
            timeObservatory.baseDate,
            timeObservatory.times,
            timeObservatory.latestRealDate
          ),
        };
      });
      _.forEach(times, (time, key) => {
        const date = moment.utc(time, "YYYY/MM/DD HH:mm");
        const temp = {};
        _.forEach(observatories, (observatory) => {
          temp.date = date;
          const rains =
            this.interval === 0 ? observatory.rains : observatory.rains60;
          const totalRains = observatory.totalRains;
          let rainValue;
          let totalRainValue;

          if (rains[key]) {
            rainValue = _.floor(rains[key], 2).toFixed(1);
          } else {
            rainValue = "・";
          }

          if (totalRains[key]) {
            totalRainValue = _.floor(totalRains[key], 2).toFixed(1);
          } else {
            totalRainValue = "・";
          }

          temp[observatory._id] = {
            rainValue,
            totalRainValue,
          };
        });
        items.push(temp);
      });

      this.tableItems = items;
    },
    setTablePagination() {
      this.pageLength = Math.ceil(this.targetIds.length / this.itemsPerPage);
    },
    isLatestRealDate(tableLatestRealDate, date) {
      return date.isSame(tableLatestRealDate);
    },
    isAfterLatestRealDate(tableLatestRealDate, date) {
      return date.isAfter(tableLatestRealDate);
    },
    setTableLatestRealDate() {
      _.forEach(this.tableHeaders, (header) => {
        if (!header.latestRealDate) {
          return;
        }
        const latestRealItem = _.findLast(this.tableItems, (item) => {
          return item.date.isSameOrBefore(header.latestRealDate);
        });
        if (latestRealItem) {
          header.tableLatestRealDate = latestRealItem.date;
        }
      });
    },
    async onInputPagination() {
      await this.loadTableData();
    },
    close() {
      window.close();
    },
    isFlooding(standard, level) {
      return standard && level !== "・" && standard < level;
    },
    getShowingObservatoryIds() {
      const startIndex = this.itemsPerPage * (this.page - 1);
      const targetIds = _.slice(
        this.targetIds,
        startIndex,
        startIndex + this.itemsPerPage
      );

      return _.join(targetIds, ",");
    },
    getColor(text) {
      const level = _.find(this.warningLevels, { text: text });
      return level && level.color;
    },
    async onChangeFilter(changed) {
      this.linkType = changed.linkType;
      this.filterItem = changed.filterItem;

      this.page = 1;
      await this.loadTargetIds();
      await this.loadTableData();
    },
    applyCalendarDate() {
      this.baseDate = moment(this.calendarDate, "YYYY/MM/DD HH:mm");
    },
    autoUpdate() {
      this.changeDateToCurrentDate();
      this.autoUpdateInterval = setInterval(() => {
        this.loadServiceStatusJson();
      }, 1000 * 60 * 5);
    },
    stopAutoUpdate() {
      clearInterval(this.autoUpdateInterval);
      this.autoUpdateInterval = null;
    },
    changeDateToCurrentDate() {
      this.updateBaseDate(moment());
    },
    updateBaseDate(date) {
      this.calendarDate = date;
      this.baseDate = date;
    },
    isAutoUpdate() {
      return !!this.autoUpdateInterval;
    },
    onClickObservatory(id) {
      this.openAnalysis({
        id,
        type:
          this.obType === Observatory.RAIN.key
            ? Observatory.RAIN.index
            : Observatory.RIVER_LEVEL.index,
      });
    },
    openAnalysis({ id, type }) {
      const target = "gnm-sub";
      const subWindow = window.open("", target, "", true);
      const pastHref = subWindow.location.href;
      let url = `${window.location.origin}/index.html#/analysis`;
      url += `?baseDate=${this.baseDate.format("X")}`;
      url += `&oid=${id}&otype=${type}`;

      if (pastHref !== "about:blank") {
        subWindow.close();
        window.open(url, target, "", true);
      } else {
        subWindow.location.href = url;
      }
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
    getRange(data, baseDate, times, latestRealDate) {
      if (this.interval === 1) {
        const temp = [];
        _.forEach(times, (time, index) => {
          if (
            this.obType === Observatory.RIVER_LEVEL.key &&
            moment.utc(time, "YYYY/MM/DD HH:mm").isAfter(latestRealDate)
          ) {
            temp.push(data[index]);
          } else if (moment.utc(time, "YYYY/MM/DD HH:mm").minutes() === 0) {
            temp.push(data[index]);
          }
        });

        return temp;
      } else {
        const index = _.findLastIndex(times, (time) => {
          return (
            3 * 60 <
            baseDate.diff(moment.utc(time, "YYYY/MM/DD HH:mm"), "minutes")
          );
        });
        if (index !== -1) {
          data = data.slice(index + 1);
        }

        return data;
      }
    },
    onChangeTimes() {
      if (this.obType === Observatory.RAIN.key) {
        this.setTableRainData();
      } else if (this.obType === Observatory.RIVER_LEVEL.key) {
        this.setTableRiverLevelData();
      }
      this.setTableLatestRealDate();
    },
    getRiverLevelColor(observatory, level) {
      if (!observatory) {
        return;
      }
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
    getMMDDHHmmFormat(date) {
      return date.local().format("MM/DD HH:mm");
    },
  },
};
</script>

<style lang="scss">
html {
  overflow-y: hidden;
}
.ts-table {
  table {
    table-layout: fixed !important;
  }
  .v-data-table__wrapper {
    -ms-overflow-style: none; /* IE 11 */
    scrollbar-width: none; /* Firefox 64 */
  }
  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    font-size: 0.7rem !important;
    padding: 2px 2px !important;
    height: inherit !important;
  }
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    border-right: thin solid rgba(0, 0, 0, 0.12);
    text-align: center !important;
  }
  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    border-right: thin solid rgba(0, 0, 0, 0.12);
  }
  .v-data-table.warning-table {
    border-bottom: 1px solid red;
    border-radius: 0;
  }

  .v-data-table > .v-data-table__wrapper > table > thead > tr > th:first-child {
    text-align: left !important;
    color: rgba(0, 0, 0, 0.87);
  }
  .v-data-table.warning-table
    > .v-data-table__wrapper
    > table
    > tbody
    > tr
    > td:first-child {
    font-weight: bold;
  }
  .dummy {
    background-color: grey !important;
  }
  .zero-data {
    font-size: 0.7rem;
    background-color: white;
    width: 100%;
    text-align: center;
    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
    padding: 5px;
    font-weight: bold;
  }
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    text-align: right !important;
    color: black;
  }
  .v-data-table > .v-data-table__wrapper > table > thead > tr:first-child > th {
    text-align: center !important;
  }
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th:first-child {
    font-weight: bold;
    text-align: left !important;
    background-color: whitesmoke;
  }

  .theme--light.v-data-table
    > .v-data-table__wrapper
    > table
    > thead
    > tr:last-child
    > th {
    border-bottom: thin solid red;
  }
}
</style>
<style lang="scss" scoped>
.ts-table {
  .legend {
    background-color: rgba(0, 0, 0, 0.2);
    font-size: 12px;
    .base-date {
      font-size: 15px;
    }
  }
  .header {
    position: relative;
    z-index: 1500;
    width: 100%;
    background-color: #3a1e87 !important;
    .progress-area {
      position: absolute;
      width: 100%;
      bottom: 0;
      left: 0;
      z-index: 1501;
    }
    .header-title {
      width: 100%;
      position: absolute;
      color: white;
      text-align: center;
    }
  }
  .latest-real-date {
    border-bottom: 2px dashed blue !important;
  }
  .after-latest-real-date {
    background-color: #f3faff;
  }
  .date {
    background-color: whitesmoke;
    border-right: 1px solid grey;
  }

  .pagination-area {
    position: absolute;
    bottom: 0;
    height: 50px;
    width: 100%;
    background-color: ghostwhite;
  }

  .date-area {
    position: relative;
    background-color: rgba(0, 0, 0, 0.4);
    border-radius: 15px;
    width: 280px;
  }

  .sub-header {
    position: -webkit-sticky;
    position: sticky;
    top: 0;
    z-index: 2;
    background-color: white;
    > tr > th {
      border-bottom: thin solid rgba(0, 0, 0, 0.12);
      text-align: right !important;
      font-weight: normal;
      color: black;
    }
  }
}
.rain-header {
  font-size: 10px;
}
</style>
