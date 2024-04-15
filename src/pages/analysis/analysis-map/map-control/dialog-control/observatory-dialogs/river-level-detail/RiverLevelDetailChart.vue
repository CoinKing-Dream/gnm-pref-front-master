<template>
  <div class="dialog">
    <v-row no-gutters>
      <v-col cols="8" class="pa-2" style="border: 1px solid lightgrey;">
        <div class="charts-area">
          <div class="ml-1 unit">(mm/h)</div>
          <div class="rain-chart-area">
            <rain-chart
              :key="chartKey"
              :init-rains="
                timeSwitch
                  ? selectedObservatory.rains36hours
                  : selectedObservatory.rains
              "
              :init-times="
                timeSwitch
                  ? selectedObservatory.times36hours
                  : selectedObservatory.times
              "
              :base-date="selectedObservatory.baseDate"
              :current-date="selectedObservatory.currentDate"
              :reverse="true"
            ></rain-chart>
          </div>
          <div class="ml-4 unit">(m)</div>
          <div class="river-level-chart-area">
            <river-level-chart
              :key="chartKey"
              :observatory-id="selectedObservatory._id"
              :init-river-levels="
                timeSwitch
                  ? selectedObservatory.riverLevels36hours
                  : selectedObservatory.riverLevels
              "
              :init-times="
                timeSwitch
                  ? selectedObservatory.times36hours
                  : selectedObservatory.times
              "
              :standby-level="selectedObservatory.standbyLevel"
              :warning-level="selectedObservatory.warningLevel"
              :evacuation-level="selectedObservatory.evacuationLevel"
              :dangerous-level="selectedObservatory.dangerousLevel"
              :outbreak-level="selectedObservatory.outbreakLevel"
              :landform="selectedObservatory.landform"
              :base-date="selectedObservatory.baseDate"
              :current-date="selectedObservatory.currentDate"
            >
            </river-level-chart>
          </div>
        </div>
        <v-row no-gutters justify="end" class="mt-2">
          <v-chip
            v-for="(level, i) in warningLevels"
            :key="i"
            :color="level.color"
            class="ma-1 font-weight-bold"
            label
            :text-color="level.label === '氾濫注意' ? 'black' : 'white'"
            small
          >
            {{ level.label }} : {{ level.value }}m
          </v-chip>
        </v-row>
      </v-col>
      <v-col class="pa-2" style="background-color: #e0e0e0;">
        <v-data-table
          dense
          :headers="tableHeaders"
          :items="tableItems"
          hide-default-footer
          :height="'480px'"
          :items-per-page="-1"
          fixed-header
          ref="table"
        >
          <template v-slot:body="{ items }">
            <tbody>
              <tr
                v-for="(item, index) in items"
                ref="row"
                :key="index"
                :class="{
                  'before-base-date': !isAfterBaseDate(item.date),
                  'after-base-date': isAfterBaseDate(item.date),
                  'same-base-date': isSameBaseDate(item.date),
                }"
              >
                <td>
                  {{ item.date }}
                  <v-icon
                    v-if="isSameBaseDate(item.date)"
                    x-small
                    color="success"
                  >
                    mdi-check-circle
                  </v-icon>
                </td>
                <td class="text-right">{{ item.riverLevel }}</td>
              </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-row no-gutters justify="end" align="center" class="mt-2">
      <span class="mr-2 font-weight-bold">予測データ表示範囲：</span>
      <span class="mr-2">6H</span>
      <v-switch
        dense
        hide-details
        v-model="timeSwitch"
        @change="setTableItems"
      ></v-switch>
      <span>36H</span>
    </v-row>
  </div>
</template>

<script>
import RiverLevelChart from "../../../../../../../components/charts/RiverLevelChart";
import { rootGetters } from "../../../../../../../store/store-functions";
import RainChart from "../../../../../../../components/charts/RainChart";
import moment from "moment";
import _ from "lodash";

export default {
  name: "ObservatoryDetailChart",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  components: { RainChart, RiverLevelChart },
  data() {
    return {
      chartKey: moment().format("X"),
      timeSwitch: false,
      warningLevels: [],
      tableHeaders: [
        {
          text: "時間",
          align: "left",
          sortable: false,
          value: "date",
          class: "orange",
        },
        {
          text: "水位[m]",
          align: "right",
          sortable: false,
          value: "riverLevel",
          width: "40%",
          class: "orange",
        },
      ],
      tableItems: [],
    };
  },
  computed: {
    selectedObservatory() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
        this.analysisMapData.storeId
      );
    },
  },
  watch: {
    selectedObservatory() {
      this.chartKey = moment().format("X");
      this.setTableItems();
      this.scrollToBaseDate();
    },
  },
  mounted() {
    this.warningLevels = this.getWarningLevelsFromObservatory(
      this.selectedObservatory
    );

    this.setTableItems();
    this.scrollToBaseDate();
  },
  methods: {
    getWarningLevelsFromObservatory(observatory) {
      const levels = [];
      if (observatory.outbreakLevel) {
        levels.push({
          color: "#000000",
          label: "氾濫発生",
          value: observatory.outbreakLevel,
        });
      }
      if (observatory.dangerousLevel) {
        levels.push({
          color: "#aa00aa",
          label: "氾濫危険",
          value: observatory.dangerousLevel,
        });
      }
      if (observatory.evacuationLevel) {
        levels.push({
          color: "#ff2800",
          label: "避難判断",
          value: observatory.evacuationLevel,
        });
      }
      if (observatory.warningLevel) {
        levels.push({
          color: "#f2e701",
          label: "氾濫注意",
          value: observatory.warningLevel,
        });
      }
      if (observatory.standbyLevel) {
        levels.push({
          color: "#35a86b",
          label: "水防団待機",
          value: observatory.standbyLevel,
        });
      }

      return levels;
    },
    setTableItems() {
      const times = this.timeSwitch
        ? this.selectedObservatory.times36hours
        : this.selectedObservatory.times;
      const riverLevels = this.timeSwitch
        ? this.selectedObservatory.riverLevels36hours
        : this.selectedObservatory.riverLevels;

      this.tableItems = _.zipWith(times, riverLevels, (date, riverLevel) => {
        return {
          date: moment
            .utc(date, "YYYY/MM/DD HH:mm")
            .local()
            .format("MM/DD HH:mm"),
          riverLevel: riverLevel ? riverLevel : "-",
        };
      });

      this.tableItems = _.filter(this.tableItems, (item) => {
        return item.riverLevel !== "-";
      });
    },
    isSameBaseDate(date) {
      return moment(date, "MM/DD HH:mm").isSame(
        this.selectedObservatory.baseDate
      );
    },
    isAfterBaseDate(date) {
      return moment(date, "MM/DD HH:mm").isAfter(
        this.selectedObservatory.baseDate
      );
    },
    scrollToBaseDate() {
      this.$nextTick(() => {
        const wrapper = this.$refs["table"].$el.querySelector(
            "div.v-data-table__wrapper"
        );
        const sameBaseDate = this.$el.querySelector(".same-base-date");
        if (sameBaseDate) {
          this.$vuetify.goTo(".same-base-date", {
            container: wrapper,
            offset: 240,
          });
        }
      });
    }
  },
};
</script>
<style lang="scss">
.dialog {
  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td,
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    font-size: 0.7rem !important;
    padding: 3px 8px !important;
    height: inherit !important;
  }

  .same-base-date td {
    border-bottom: 2px dashed #3734dc !important;
  }
}
</style>
<style lang="scss" scoped>
.dialog {
  .charts-area {
    overflow-y: hidden;
    .rain-chart-area {
      position: relative;
      height: 140px;
      div {
        height: 100%;
      }
    }

    .river-level-chart-area {
      height: 310px;

      div {
        height: 100%;
      }
    }
  }

  .v-input--selection-controls {
    margin-top: 0;
    padding-top: 0;
  }

  .unit {
    font-size: 10px;
  }

  .before-base-date {
    background-color: #ffffff;
  }
  .after-base-date {
    background-color: #c5c4ff;
  }
}
</style>
