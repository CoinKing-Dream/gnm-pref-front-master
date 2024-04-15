<template>
  <div class="rainfall-detail pa-5">
    <v-row no-gutters>
      <v-col cols="8" class="pa-1" style="border: 1px solid lightgrey;">
        <v-row no-gutters class="unit">
          <v-col class="ml-3">(mm/10分)</v-col>
          <v-col class="mr-1 text-right">(mm)</v-col>
        </v-row>
        <rain-chart
          :key="chartKey"
          :init-rains="selectedObservatory.rains"
          :total-rains="selectedObservatory.totalRains"
          :init-times="selectedObservatory.times"
          :base-date="selectedObservatory.baseDate"
          :current-date="selectedObservatory.currentDate"
        ></rain-chart>
      </v-col>
      <v-col class="pa-2" style="background-color: #e0e0e0;">
        <v-data-table
          dense
          :headers="tableHeaders"
          :items="tableItems"
          hide-default-footer
          :height="'410px'"
          :items-per-page="-1"
          :no-data-text="'全時間欠測です。'"
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
                  'same-base-date': isSameBaseDate(item.date),
                }"
            >
              <td>
                {{ item.date }}
                <v-icon v-if="isSameBaseDate(item.date)" x-small color="success">
                  mdi-check-circle
                </v-icon>
              </td>
              <td class="text-right">{{ item.rain }}</td>
              <td class="text-right">{{ item.totalRain }}</td>
            </tr>
            </tbody>
          </template>
        </v-data-table>
      </v-col>
    </v-row>
    <v-list disabled nav>
      <v-list-item-group color="primary">
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-home-modern</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              v-text="selectedObservatory.name"
            ></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item>
          <v-list-item-icon>
            <v-icon>mdi-map-marker</v-icon>
          </v-list-item-icon>
          <v-list-item-content>
            <v-list-item-title
              v-text="`${selectedObservatory.lat},${selectedObservatory.lng}`"
            ></v-list-item-title>
            <v-list-item-subtitle
              v-text="selectedObservatory.address"
            ></v-list-item-subtitle>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
import { rootGetters } from "../../../../../../../store/store-functions";
import RainChart from "../../../../../../../components/charts/RainChart";
import moment from "moment";
import _ from "lodash";
export default {
  name: "RainfallDetail",
  components: { RainChart },
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      chartKey: moment().format("X"),
      tableHeaders: [
        {
          text: "時間",
          align: "left",
          sortable: false,
          value: "date",
          class: "orange",
        },
        {
          text: "10分雨量 [mm]",
          align: "right",
          sortable: false,
          value: "rain",
          width: "30%",
          class: "orange",
        },
        {
          text: "累計雨量 [mm]",
          align: "right",
          sortable: false,
          value: "totalRain",
          width: "30%",
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
    },
  },
  mounted() {
    this.setTableItems();
    this.$nextTick(() => {
      const wrapper = this.$refs['table'].$el.querySelector('div.v-data-table__wrapper');
      this.$vuetify.goTo('.same-base-date', {container: wrapper, offset: 240})
    });
  },
  methods: {
    setTableItems() {
      const times = this.selectedObservatory.times;
      const rains = this.selectedObservatory.rains;
      const totalRains = this.selectedObservatory.totalRains;

      this.tableItems = _.zipWith(
        times,
        rains,
        totalRains,
        (date, rain, totalRain) => {
          return {
            date: moment
              .utc(date, "YYYY/MM/DD HH:mm")
              .local()
              .format("MM/DD HH:mm"),
            rain: rain ? rain : "-",
            totalRain: totalRain ? totalRain : "-",
          };
        }
      );

      this.tableItems = _.filter(this.tableItems, (item) => {
        return item.riverLevel !== "-" || item.rain !== "-";
      });
    },
    isSameBaseDate(date) {
      return moment(date, "MM/DD HH:mm").isSame(
          this.selectedObservatory.currentDate
      );
    },
  },
};
</script>

<style lang="scss">
.rainfall-detail {
  .v-data-table > .v-data-table__wrapper > table > tbody > tr > td {
    font-size: 0.7rem !important;
    padding: 2px 4px !important;
    height: inherit !important;
  }
  .v-data-table > .v-data-table__wrapper > table > thead > tr > th {
    font-size: 0.7rem !important;
    padding: 2px 6px !important;
    height: inherit !important;
  }
}
</style>
<style lang="scss" scoped>
@import "../../../../../../../common";
.rainfall-detail {
  background-color: $base-color-1;
}
.v-list-item__title {
  font-size: 20px !important;
}
.unit {
  font-size: 10px;
}
.v-input--selection-controls {
  margin-top: 0;
}
</style>
