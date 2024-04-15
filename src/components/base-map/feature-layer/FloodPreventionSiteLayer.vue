<template>
  <l-geo-json
      :geojson="points"
      :options="{ style: styleFunction }"
  ></l-geo-json>
</template>

<script>
import axios from "axios";
import { LGeoJson } from "vue2-leaflet";


export default {
  name: "FloodPreventionSiteLayer",
  components: {
    LGeoJson
  },
  data() {
    return {
      points: null
    };
  },
  async created() {
    let [err, points] = await this.loadPoints();
    if (err) {
      throw new Error("load failed");
    }
    this.points = points;
  },
  methods: {
    async loadPoints() {
      return axios
          .create({
            "Content-Type": "application/json",
            "Accept": "application/json",
          })
          .get(
              "https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/flood_prevention_site/points.json"
          )
          .then((response) => {
            return [null, response.data];
          })
          .catch((err) => [err]);
    },
    styleFunction(feature) {
      return {
        weight: 3,
        color: feature.properties.color,
        opacity: 1,
        fillColor: feature.properties.color,
        fillOpacity: 0.2,
        "fill-outline-color": feature.properties.color,
        outlineColor: "blue"
      };
    },
  }
};
</script>

<style scoped></style>
