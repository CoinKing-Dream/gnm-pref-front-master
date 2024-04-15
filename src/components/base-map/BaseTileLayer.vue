<template>
  <div>
    <l-tile-layer
      layer-type="base"
      v-if="selectedBaseTile && selectedBaseTile !== BaseTile.SATELLITE"
      :url="selectedBaseTile.url"
      :options="{
        maxNativeZoom: getMaxNativeZoom(),
        updateWhenIdle: false,
      }"
      @load="
        ($e) => {
          $e.target.bringToBack();
        }
      "
      :attribution="selectedBaseTile.attribution"
    ></l-tile-layer>
  </div>
</template>

<script>
import L from "leaflet";
import "leaflet.gridlayer.googlemutant/dist/Leaflet.GoogleMutant";
import { rootGetters } from "../../store/store-functions";
import LTileLayer from "vue2-leaflet/src/components/LTileLayer";
import { BaseTile } from "../../enums/BaseTile";

export default {
  name: "BaseTile",
  components: { LTileLayer },
  inject: {
    baseMapData: {
      default: [],
    },
  },
  data() {
    return {
      maxNativeZoom: 17,
      googleMap: null,
      BaseTile: BaseTile,
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
        this.baseMapData.storeId
      );
    },
    selectedBaseTile() {
      return this.$store.getters[rootGetters.SELECTED_BASE_TILE](
        this.baseMapData.storeId
      );
    },
  },
  watch: {
    selectedBaseTile() {
      if (this.selectedBaseTile === BaseTile.SATELLITE) {
        this.map.addLayer(this.googleMap);

      } else {
        this.map.removeLayer(this.googleMap);
      }
    },
  },
  created() {
    this.googleMap = L.gridLayer.googleMutant({ type: "satellite" });
    this.googleMap.on("load",($e) => { $e.target.bringToBack() });
  },
  methods: {
    getMaxNativeZoom() {
      let maxNativeZoom;
      switch (this.selectedBaseTile) {
        case BaseTile.WHITE:
          maxNativeZoom = 14;
          break;
        case BaseTile.GRAY:
          maxNativeZoom = 20;
          break;
        default:
          maxNativeZoom = 17;
          break;
      }
      return maxNativeZoom;
    },
  },
};
</script>

<style scoped></style>
