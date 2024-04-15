<template>
  <div class="dam-detail pa-5">
    <v-row no-gutters class="unit">
      <v-col class="ml-3">(m)</v-col>
      <v-col class="mr-1 text-right">(m3/s)</v-col>
    </v-row>
    <dam-chart
      :key="chartKey"
      :init-levels="timeSwitch? selectedObservatory.levels36hours : selectedObservatory.levels"
      :qin-alls="timeSwitch? selectedObservatory.qinAlls36hours : selectedObservatory.qinAlls"
      :qout-alls="timeSwitch? selectedObservatory.qoutAlls36hours : selectedObservatory.qoutAlls"
      :warning-lines="selectedObservatory.baselines"
      :init-times="timeSwitch? selectedObservatory.times36hours : selectedObservatory.times"
      :landform="selectedObservatory.landform"
      :base-date="selectedObservatory.baseDate"
      :current-date="selectedObservatory.currentDate"
    ></dam-chart>
    <v-row no-gutters justify="end" align="center" class="mt-2">
      <span class="mr-2 font-weight-bold">予測データ表示範囲：</span>
      <span class="mr-2">6H</span>
      <v-switch dense hide-details v-model="timeSwitch"></v-switch>
      <span>36H</span>
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
import DamChart from "../../../../../../../components/charts/DamChart";
import moment from "moment";
export default {
  name: "DamDetail",
  components: { DamChart },
  inject: {
    analysisMapData: {
      default: []
    }
  },
  data() {
    return {
      chartKey: moment().format("X"),
      timeSwitch: false
    };
  },
  computed: {
    selectedObservatory() {
      const observatory = this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
      //return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
        this.analysisMapData.storeId
      );
      return observatory
    }
  },
  watch: {
    selectedObservatory() {
      this.chartKey = moment().format("X");
    }
  }
};
</script>

<style lang="scss" scoped>
@import "../../../../../../../common";
.dam-detail {
  background-color: $base-color-1;
}
.v-list-item__title {
  font-size: 20px !important;
}
.unit {
  font-size: 10px;
}
</style>
