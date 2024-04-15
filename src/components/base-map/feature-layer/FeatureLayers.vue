<template>
  <div class="tiles">
    <template v-for="(feature, index) in selectedFeatures">
      <div :key="index">
        <div v-if="Array.isArray(feature.url)" >
          <l-tile-layer
            layer-type="overlay"
            v-for="(o, key) in feature.url"
            :key="key"
            :url="o"
            :opacity="feature.group === '防災マップ'? opacity : 0.7"
          ></l-tile-layer>
        </div>
        <l-tile-layer
          layer-type="overlay"
          v-else-if="feature.url"
          class="tiles"
          :url="feature.url"
          :opacity="feature.group === '防災マップ'? opacity : 0.7"
        ></l-tile-layer>
        <hairyosya-layer
          v-else-if="feature === Feature.HAIRYOSYA"
        ></hairyosya-layer>
        <flood-inundated-dike-break-layer
          v-else-if="feature === Feature.FLOOD_INUNDATED_DIKE_BREAK_1"
          level="L1"
        ></flood-inundated-dike-break-layer>
        <flood-inundated-dike-break-layer
          v-else-if="feature === Feature.FLOOD_INUNDATED_DIKE_BREAK_2"
          level="L2"
        ></flood-inundated-dike-break-layer>
        <shelter-layer
          v-else-if="feature === Feature.SHELTER"
        ></shelter-layer>
        <emergency-shelter-layer
          v-else-if="feature === Feature.EMERGENCY_SHELTER">
        </emergency-shelter-layer>
        <flood-prevention-site-layer
          v-else-if="feature === Feature.FLOOD_PREVENTION_SITE"
        ></flood-prevention-site-layer>
        <gradual-rain-layer
          v-else-if="feature.key.includes('gradualRain')" :height="feature.height">
        </gradual-rain-layer>
        <kyutomarigawa-layer v-else-if="feature === Feature.KYUTOMARIGAWA"></kyutomarigawa-layer>
      </div>
    </template>
  </div>
</template>

<script>
import { rootGetters } from "../../../store/store-functions";
import LTileLayer from "vue2-leaflet/src/components/LTileLayer";
import HairyosyaLayer from "@/components/base-map/feature-layer/HairyosyaLayer";
import { Feature } from "@/enums/Feature";
import FloodInundatedDikeBreakLayer from "@/components/base-map/feature-layer/FloodInundatedDikeBreakLayer";
import ShelterLayer from "@/components/base-map/feature-layer/ShelterLayer";
import EmergencyShelterLayer from "@/components/base-map/feature-layer/EmergencyShelterLayer";
import FloodPreventionSiteLayer from "@/components/base-map/feature-layer/FloodPreventionSiteLayer";
import GradualRainLayer from "@/components/base-map/feature-layer/GradualRainLayer";
import KyutomarigawaLayer from "@/components/base-map/feature-layer/KyutomarigawaLayer.vue";

export default {
  name: "FeatureLayers",
  components: {
    KyutomarigawaLayer,
    GradualRainLayer,
    FloodPreventionSiteLayer,
    ShelterLayer,
    FloodInundatedDikeBreakLayer,
    HairyosyaLayer,
    LTileLayer,
    EmergencyShelterLayer
  },
  inject: {
    baseMapData: {
      default: [],
    },
  },
  data() {
    return {
      Feature: Feature,
    };
  },
  computed: {
    selectedObservatory() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
          this.baseMapData.storeId
      );
    },
    selectedFeatures() {
      return this.$store.getters[rootGetters.SELECTED_FEATURES](
        this.baseMapData.storeId
      );
    },
    opacity() {
      return this.$store.getters[rootGetters.FEATURE_OPACITY](
          this.baseMapData.storeId
      );
    },
  },
  watch: {
    selectedFeatures() {
      if (!this.selectedObservatory) {
        return
      }
      let location = `/analysis?oid=${this.selectedObservatory._id}&otype=${this.selectedObservatory.type.index}`;
      this.$router.replace(
          location,
          () => {},
          () => {}
      );
    },
  }
};
</script>

<style scoped>
.tiles {
  z-index: 5000;
}
</style>
