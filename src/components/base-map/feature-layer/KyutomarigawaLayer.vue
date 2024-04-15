<template>
  <div>
    <l-geo-json
        v-if="area"
        :geojson="area"
        :options="{ style: areaStyle }"
    ></l-geo-json>
    <l-geo-json
        v-if="river"
        :geojson="river"
        :options="{ style: riverStyle }"
    ></l-geo-json>
  </div>
</template>

<script>
import axios from "axios";
import { LGeoJson } from "vue2-leaflet";

export default {
  name: "KyutomarigawaLayer",
  components: {
    LGeoJson,
  },
  data() {
    return {
      area: null,
      river: null,
      areaStyle: {
        color: 'red',
        weight: 3,
        opacity: 1,
        fillOpacity: 0.04,
      },
      riverStyle: {
        color: 'blue',
        weight: 6,
        opacity: 0.6,
        fillOpacity: 0.04,
      },
    };
  },
  async created() {
    this.area = await this.fetchGeojson("https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/geojson/kyutomarigawa.geojson");
    this.river = await this.fetchGeojson("https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/geojson/kyotomarigawa-river.geojson");
  },
  methods: {
    async fetchGeojson(url) {
      return axios
          .create({
            "Content-Type": "application/json",
            Accept: "application/json",
          })
          .get(
              url
          )
          .then((response) => {
            return response.data;
          })
          .catch((err) => {
            if (err) {
              throw new Error("load failed");
            }
          });
    },
  },
};
</script>

<style scoped></style>
