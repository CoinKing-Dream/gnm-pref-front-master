<template>
  <div v-if="map.getZoom() >= 13">
    <template v-for="(point, index) in points">
      <l-marker
          ref="markers"
          :key="`${index}`"
          :lat-lng="[point['緯度'], point['経度']]"
      >
        <l-icon
            :icon-size="[24, 24]"
            :icon-anchor="[12, 24]"
            :popupAnchor="[0, -24]"
            :icon-url="require(`@/assets/images/emergency_shelter.png`)"
        >
        </l-icon>
        <l-popup
            :options="{
            closeOnClick: false,
            maxWidth: '200px',
          }"
        >
          <h3 class="mb-1">指定緊急避難場所</h3>
          <template v-for="(el, key) in point">
            <div v-if="el && key !== '緯度' && key !== '経度'" :key="key">
              {{ key }} : {{ el }}
            </div>
          </template>
        </l-popup>
      </l-marker>
    </template>
  </div>
</template>

<script>
import { LIcon, LMarker, LPopup } from "vue2-leaflet";
import axios from "axios";
import {rootGetters} from "@/store/store-functions";

export default {
  name: "EmergencyShelterLayer",
  inject: {
    baseMapData: {
      default: [],
    },
  },
  components: {
    LMarker,
    LIcon,
    LPopup,
  },
  data() {
    return {
      rivers: null,
      points: null,
      selectedPoint: null,
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
          this.baseMapData.storeId
      );
    },
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
            responseType: "json",
          })
          .get(
              "https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/hinanjo/points.json"
          )
          .then((response) => {
            return [null, response.data];
          })
          .catch((err) => [err]);
    },
  },
};
</script>

<style>
.leaflet-popup-content {
  margin: 10px;
  width: 200px;
}
</style>
