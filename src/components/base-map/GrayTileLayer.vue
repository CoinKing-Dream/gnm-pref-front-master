<template>
  <div :style="{ height: '100%', width: '100%' }">
    <div
        v-if="showGrayBackground"
        :style="{
        height: '100%',
        width: '100%',
        backgroundColor: isGunmaArea() ? 'rgba(0,0,0,0.2)' : 'none',
      }"
    ></div>
  </div>
</template>

<script>
import { rootGetters } from "@/store/store-functions";
import { Risk } from "@/enums/Risk";
import { Feature } from "@/enums/Feature";

export default {
  name: "GrayTileLayer",
  inject: {
    baseMapData: {
      default: [],
    },
  },
  props: {
    coords: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      Risk: Risk,
    };
  },
  computed: {
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.baseMapData.storeId
      );
    },
    selectedFeatures() {
      return this.$store.getters[rootGetters.SELECTED_FEATURES](
        this.baseMapData.storeId
      );
    },
    showGrayBackground() {
      return this.$store.getters[rootGetters.SHOW_GRAY_BACKGROUND](
          this.baseMapData.storeId
      );
    }
  },
  methods: {
    isGunmaArea() {
      const leftTop = { lat: 37.15967, lng: 137.8131 };
      const rightBottom = { lat: 35.4611, lng: 139.92118 };

      const leftTopCoords = this.getTileCoords(
        leftTop.lat,
        leftTop.lng,
        this.coords.z
      );
      const rightBottomCoords = this.getTileCoords(
        rightBottom.lat,
        rightBottom.lng,
        this.coords.z
      );

      if (
        leftTopCoords.x <= this.coords.x &&
        leftTopCoords.y <= this.coords.y &&
        rightBottomCoords.x >= this.coords.x &&
        rightBottomCoords.y >= this.coords.y
      ) {
        return true;
      } else {
        return false;
      }
    },
    getTileCoords(lat, lon, zoom) {
      const xTile = parseInt(Math.floor(((lon + 180) / 360) * (1 << zoom)));
      const yTile = parseInt(
        Math.floor(
          ((1 -
            Math.log(
              Math.tan((lat * Math.PI) / 180) +
                1 / Math.cos((lat * Math.PI) / 180)
            ) /
              Math.PI) /
            2) *
            (1 << zoom)
        )
      );
      return { x: xTile, y: yTile };
    },
    checkGrayFeatureTile() {
      const river = _.find(this.selectedFeatures, feature => {
        return feature.key === Feature.RIVER.key
      });

      return (
        this.selectedFeatures.length > 0 &&
        !(
          this.selectedFeatures.length === 1 && river
        )
      );
    },
  },
};
</script>

<style scoped></style>
