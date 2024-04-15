<template>
  <div v-if="map.getZoom() >= 13">
    <template v-for="(point, index) in points">
      <l-marker
          ref="markers"
          :key="`${index}`"
          :lat-lng="[point.lat, point.lng]"
      >
        <l-icon
            :icon-size="[24, 24]"
            :icon-anchor="[12, 24]"
            :popupAnchor="[0, -24]"
            :icon-url="require(`@/assets/images/shelter.png`)"
        >
        </l-icon>
        <l-popup
            :options="{
            closeOnClick: false,
            maxWidth: '200px',
          }"
        >
          <h3 class="mb-1">指定避難所</h3>
          <div>
            名称 : {{point.name}}
          </div>
          <div>
            住所 : {{point.address}}
          </div>
          <div v-if="point.memo">
            備考 : {{point.memo}}
          </div>
        </l-popup>
      </l-marker>
    </template>
  </div>
</template>

<script>
import { LIcon, LMarker, LPopup } from "vue2-leaflet";
import axios from "axios";
import { rootGetters } from "../../../store/store-functions";

export default {
  name: "ShelterLayer",
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
              "https://d1gpfmzkl8v4u5.cloudfront.net/static/hinanjo/points_kawamirugunma.json"
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
