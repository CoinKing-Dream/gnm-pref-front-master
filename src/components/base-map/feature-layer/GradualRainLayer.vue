<template>
  <div>
    <l-image-overlay
      v-for="(info, key) in imageInfos"
      :key="key"
      :bounds="info.bounds"
      :url="info.url"
      :opacity="opacity"
    >
    </l-image-overlay>
  </div>
</template>

<script>
import LImageOverlay from "vue2-leaflet/src/components/LImageOverlay";
import conf from "@/config";
import { Feature } from "@/enums/Feature";
import {rootGetters} from "@/store/store-functions";

export default {
  name: "GradualRainLayer",
  components: {
    LImageOverlay,
  },
  inject: {
    baseMapData: {
      default: [],
    },
  },
  props: {
    height: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      imageInfos: [],
    };
  },
  computed:{
    opacity() {
      return this.$store.getters[rootGetters.FEATURE_OPACITY](
          this.baseMapData.storeId
      );
    },
  },
  created() {
    this.imageInfos =  [
      {
        url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/gradual_rain/${this.height}/merge1.png`,
        bounds: [
          [37.04167, 138.875],
          [36.83333, 139.375],
        ],
      },
      {
        url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/gradual_rain/${this.height}/merge2.png`,
        bounds: [
          [36.83333, 138.5625],
          [36.66667, 139.375],
        ],
      },
      {
        url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/gradual_rain/${this.height}/merge3.png`,
        bounds: [
          [36.66667, 138.375],
          [36.41667, 139.4375],
        ],
      },
      {
        url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/gradual_rain/${this.height}/merge4.png`,
        bounds: [
          [36.41667, 138.625],
          [36.16667, 139.6875],
        ],
      },
      {
        url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/gradual_rain/${this.height}/merge5.png`,
        bounds: [
          [36.16667, 138.625],
          [36, 139.125],
        ],
      },
    ]
  },
};
</script>

<style scoped></style>
