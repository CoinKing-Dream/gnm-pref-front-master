<template>
  <l-geo-json
      :geojson="geojson"
      :options="{ style: styleFunction }"
  ></l-geo-json>
</template>
<script>
import {
  rootActions,
  rootGetters,
  rootMutations
} from "../../../store/store-functions";
import _ from "lodash";
import { LGeoJson } from "vue2-leaflet";

import { Risk } from "../../../enums/Risk";
import axios from "axios";
import moment from "moment";

export default {
  name: "KouzuiLayer",
  components: {
    LGeoJson
  },
  inject: {
    baseMapData: {
      default: []
    }
  },
  data() {
    return {
      geojson: null
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
          this.baseMapData.storeId
      );
    },
    selectedDate() {
      return this.$store.getters[rootGetters.SELECTED_DATE](
          this.baseMapData.storeId
      );
    },
    riverRiskDistributionRisk() {
      return this.$store.getters[rootGetters.FIND_RISK](
          Risk.KOUZUI, this.baseMapData.storeId
      );
    },
    selectedDateRiskData() {
      return _.find(this.riverRiskDistributionRisk.data.contents, o => {
        return this.selectedDate.isSame(moment.utc(o.date, "YYYY/MM/DD HH:mm"));
      });
    },
    baseDate() {
      return this.$store.getters[rootGetters.BASE_DATE](
          this.baseMapData.storeId
      );
    }
  },
  watch: {
    async selectedDateRiskData() {
      if (this.selectedDateRiskData) {
        let [err, json] = await this.loadJson(this.selectedDateRiskData.url);
        if (err) throw new Error("load failed : /river-risk");

        this.geojson = json;
      }
    },
    baseDate() {
      this.loadData();
    }
  },
  created() {
    this.loadData();
  },
  beforeDestroy() {
    //todo リセット方法改善
    this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
      storeId: this.baseMapData.storeId,
      colorLegend: {
        unit: null,
        colors: []
      }
    });
  },
  methods: {
    loadData() {
      this.$store.dispatch(
          rootActions.LOAD_KOUZUI,
          this.baseMapData.storeId
      );
    },
    styleFunction(feature) {
      const style = {
        weight: 3,
        color: "#4ffeff",
        opacity: 1,
        fillColor: "#4ffeff",
        fillOpacity: 0.2,
        "fill-outline-color": "rgba(255,255,255,0.0)",
        outlineColor: "blue"
      };

      if (feature.properties.FLOODRISK) {
        switch (parseInt(feature.properties.FLOODRISK)) {
          case 1:
            style.color = "rgba(242,231,0)";
            style.fillColor = "rgba(242,231,0)";
            break;
          case 2:
            style.color = "rgba(255,40,0)";
            style.fillColor = "rgba(255,40,0)";
            break;
          case 3:
            style.color = "rgba(170,0,170)";
            style.fillColor = "rgba(170,0,170)";
            break;
          case 4:
            style.color = "rgba(12,0,12)";
            style.fillColor = "rgba(12,0,12)";
            break;
        }
      }
      if (feature.properties.FLOODFCST) {
        style.weight = 10;
        switch (parseInt(feature.properties.FLOODFCST)) {
          case 2:
            style.color = "rgba(242,231,0)";
            style.fillColor = "rgba(242,231,0)";
            break;
          case 3:
            style.color = "rgba(255,40,0)";
            style.fillColor = "rgba(255,40,0)";
            break;
          case 4:
            style.color = "rgba(170,0,170)";
            style.fillColor = "rgba(170,0,170)";
            break;
          case 5:
            style.color = "rgba(12,0,12)";
            style.fillColor = "rgba(12,0,12)";
            break;
        }
      }
      return style;
    },
    async loadJson(url) {
      return axios
          .create({
            responseType: "json"
          })
          .get(url)
          .then(response => {
            return [null, response.data];
          })
          .catch(err => [err]);
    },

  }
};
</script>

<style scoped></style>
