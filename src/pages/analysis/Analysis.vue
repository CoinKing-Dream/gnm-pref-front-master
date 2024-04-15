<template>
  <div class="analysis">
    <div class="footer">
      <div class="map-title">
        <v-row v-if="selectedRisk" no-gutters align="center" justify="center">
          <v-col cols="auto">
            {{ selectedRisk.type.string }}
          </v-col>
        </v-row>
      </div>
      <v-row no-gutters align="center" justify="end">
        <v-col>
          <v-btn x-small class="ma-2" text @click="openDashboard" color="white">
            <v-icon left>mdi-chevron-left</v-icon> TOP画面
          </v-btn>
        </v-col>
        <v-col cols="auto" class="mr-2">
          <warning-status-viewer></warning-status-viewer>
        </v-col>
        <v-col cols="auto" class="mr-4">
          <address-search-control
            :storeId="this.leftStoreId"
          ></address-search-control>
        </v-col>
      </v-row>
    </div>
    <div class="maps-area">
      <v-row no-gutters align="stretch">
        <v-col>
          <analysis-map id="leftMap" ref="leftMap" :store-id="leftStoreId"></analysis-map>
        </v-col>
        <v-col class="multiple-map-control-area" cols="auto">
          <multiple-map-control
            @change-show="toggleMultiMapShow"
            @change-sync="toggleMultiMapSync"
          ></multiple-map-control>
        </v-col>
        <v-col v-if="multiMapShow">
          <analysis-map id="rightMap" ref="rightMap" :store-id="rightStoreId"></analysis-map>
        </v-col>
      </v-row>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import { BaseTile } from "../../enums/BaseTile";
import { Risk } from "../../enums/Risk";
import { rootGetters, rootMutations } from "../../store/store-functions";

import AnalysisMap from "./analysis-map/AnalysisMap";
import MultipleMapControl from "./MultipleMapControl";
import AddressSearchControl from "@/pages/analysis/analysis-map/map-control/AddressSearchControl";
import WarningStatusViewer from "@/pages/analysis/analysis-map/map-control/WarningStatusViewer";

import _ from "lodash"

export default {
  name: "Analysis",
  components: {
    WarningStatusViewer,
    AddressSearchControl,
    MultipleMapControl,
    AnalysisMap,
  },
  data() {
    return {
      urlParameters: {
        selectedBaseTile: BaseTile.GRAY,
        selectedRiskType: Risk.RAIN,
        baseDate: moment(),
      },
      leftStoreId: 1111,
      rightStoreId: 2222,
      messages: 3,
      showMessageBox: false,
      autoUpdateInterval: null,
      notReadAlertCount: 0,
    };
  },
  computed: {
    leftMapObject() {
      return this.$store.getters[rootGetters.MAP_OBJECT](this.leftStoreId);
    },
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](this.leftStoreId);
    },
    selectedBaseTile() {
      return this.$store.getters[rootGetters.SELECTED_BASE_TILE](
        this.leftStoreId
      );
    },
    autoUpdate() {
      return this.$store.getters[rootGetters.AUTO_UPDATE](this.leftStoreId);
    },
    multiMapShow() {
      return this.$store.getters[rootGetters.MULTI_MAP_SHOW];
    },
    multiMapSync() {
      return this.$store.getters[rootGetters.MULTI_MAP_SYNC];
    },
  },
  watch: {
    autoUpdate() {
      if (this.autoUpdate) {
        this.startAutoUpdate();
      } else {
        clearInterval(this.autoUpdateInterval);
      }
    },
  },
  created() {
    if (!self.opener) {
      window.name = "gnm-sub";
    }

    if (typeof this.$route.query.baseDate !== "undefined") {
      this.urlParameters.baseDate = moment(
        parseInt(this.$route.query.baseDate),
        "X"
      );
      this.urlParameters.autoUpdate = false;
      const query = Object.assign({}, this.$route.query);
      delete query.baseDate;
      this.$router.replace({ query });
    }
    if (typeof this.$route.query.debug !== "undefined") {
      this.$store.commit(
        rootMutations.UPDATE_DEBUG,
        this.$route.query.debug === "true"
      );
    }

    this.initMapData(this.leftStoreId, this.urlParameters);
    this.initMapData(this.rightStoreId, this.urlParameters);
  },
  methods: {
    to() {
      clearInterval(this.autoUpdateInterval);
      this.resetRiskData();
      this.removeMapData(this.leftStoreId);
      this.removeMapData(this.rightStoreId);

      this.$nextTick(() => {
        this.$router.push({
          path: "dashboard",
        });
      });
    },
    openDashboard() {
      const url = `${window.location.origin}/index.html#/`;
      const target = "gnm-dashboard";
      window.open(url, target, "", true);
    },
    toggleMultiMapShow() {
      this.$store.commit(
        rootMutations.UPDATE_MULTI_MAP_SHOW,
        !this.multiMapShow
      );

      this.$nextTick(() => {
        this.leftMapObject.invalidateSize();
      });
    },
    toggleMultiMapSync() {
      this.$store.commit(
        rootMutations.UPDATE_MULTI_MAP_SYNC,
        !this.multiMapSync
      );
    },
    initMapData(storeId, mapData) {
      this.$store.commit(rootMutations.INIT_MAP_DATA, { storeId, mapData });
    },
    removeMapData(storeId) {
      this.$store.commit(rootMutations.REMOVE_MAP_DATA, storeId);
    },
    resetRiskData() {
      this.$store.commit(rootMutations.RESET_ALL_RISK_DATA);
    },
    startAutoUpdate() {
      this.autoUpdateInterval = setInterval(() => {
        const date = moment();
        this.updateBaseDate(date);
      }, 1000 * 60 * 5);
    },
    updateBaseDate(date) {
      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId: this.leftStoreId,
        baseDate: _.cloneDeep(date),
      });
      this.$store.commit(rootMutations.UPDATE_BASE_DATE, {
        storeId: this.rightStoreId,
        baseDate: _.cloneDeep(date),
      });
    },
  },
};
</script>
<style lang="scss">
.footer {
  .v-badge__badge {
    height: 16px;
    min-height: 16px;
    font-size: 10px;
  }
}
</style>
<style lang="scss" scoped>
@import "../../common";
$footer-height: 35px;

.analysis {
  width: 100vw;
  height: 100vh;

  .maps-area {
    width: 100%;
    height: calc(100% - #{$footer-height});

    > div {
      height: 100%;
    }

    .multiple-map-control-area {
      z-index: 1600;
    }
  }
  .footer {
    height: $footer-height;
    background-color: #3a1e87;
    position: relative;

    > div {
      height: 100%;

      a {
        font-size: 11px;
        font-weight: bold;
        color: $base-color-1;
        margin-left: 10px;
        margin-right: 10px;
      }
    }

    .map-title {
      position: absolute;
      color: white;
      font-size: 25px;
      font-weight: bold;
      text-align: center;
      height: 100%;
      width: 100%;

      .row {
        height: 100%;
      }
    }

    .alert-area {
      position: relative;
      .alert-warning-area {
        max-height: 90vh;
        z-index: 2000;
        position: absolute;
        background-color: white;
        top: 100%;
        right: -4px;
        margin-top: 5px;
        width: 265px;

        -webkit-box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
          0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
        box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
          0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);

        border-radius: 5px;
      }
      .alert-warning-area:after {
        content: "";
        position: absolute;
        top: -18px;
        right: 10px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-bottom-color: white;
        pointer-events: none;
      }
    }
  }
}
</style>
