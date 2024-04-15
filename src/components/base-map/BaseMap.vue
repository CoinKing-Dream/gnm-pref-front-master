<template>
  <l-map
    ref="map"
    class="base-map"
    :class="{ 'read-only': readOnly }"
    :minZoom="minZoom"
    :maxZoom="maxZoom"
    :zoom="zoom"
    :center="centerPosition"
    :options="options"
    :zoomAnimation="false"
  >
    <base-tile-layer></base-tile-layer>
    <l-grid-layer v-if="!isIE" :tile-component="grayTileLayer" layer-type="overlay"></l-grid-layer>
    <feature-layers></feature-layers>
    <l-tile-layer
      layer-type="overlay"
      class="tiles"
      :url="'https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/tile/border/{z}/{x}/{y}.png'"
    ></l-tile-layer>
    <template v-if="mapObject">
      <template v-if="selectedRisk">
        <rain-layer v-if="Risk.RAIN.key === selectedRisk.type.key"></rain-layer>
        <small-river-flooding-layer
            v-if="Risk.SMALL_RIVER_FLOODING .key=== selectedRisk.type.key"
        ></small-river-flooding-layer>
        <dosya-layer v-if="Risk.DOSYA.key === selectedRisk.type.key"></dosya-layer>
        <kouzui-layer v-if="Risk.KOUZUI.key === selectedRisk.type.key"></kouzui-layer>
      </template>
      <observatory-layer v-if="!readOnly"></observatory-layer>
    </template>
    <l-control-scale
      v-if="!readOnly"
      position="topleft"
      :imperial="false"
      :metric="true"
    ></l-control-scale>
    <hazard-search-layer></hazard-search-layer>
  </l-map>
</template>

<script>
import { Risk } from "@/enums/Risk";
import {
  rootMutations,
  rootGetters,
} from "@/store/store-functions";

import {
  LMap,
  LControlScale,
  LTileLayer,
    LGridLayer
} from "vue2-leaflet";
import BaseTileLayer from "./BaseTileLayer";
import ObservatoryLayer from "./risk-layer/ObservatoryLayer";
import FeatureLayers from "./feature-layer/FeatureLayers";
import RainLayer from "./risk-layer/RainLayer";
import SmallRiverFloodingLayer from "./risk-layer/SmallRiverFloodingLayer";
import L from "leaflet";
import GrayTileLayer from "@/components/base-map/GrayTileLayer";
import DosyaLayer from "@/components/base-map/risk-layer/DosyaLayer";
import KouzuiLayer from "@/components/base-map/risk-layer/KouzuiLayer";
import HazardSearchLayer from "@/components/base-map/feature-layer/HazardSearchLayer";
import _ from "lodash";

export default {
  name: "BaseMap",
  components: {
    HazardSearchLayer,
    KouzuiLayer,
    DosyaLayer,
    SmallRiverFloodingLayer,
    RainLayer,
    FeatureLayers,
    ObservatoryLayer,
    BaseTileLayer,
    LMap,
    LControlScale,
    LTileLayer,
    LGridLayer,
  },
  props: {
    initialZoom: {
      type: Number,
      require: false,
      default: 11,
    },
    readOnly: {
      type: Boolean,
      require: false,
      default: false,
    },
    initialStoreId: {
      type: Number,
      require: false,
      default: -1,
    },
    initialCenterPosition: {
      type: Array,
      require: false,
      default: () => [36.39155, 139.060447],
    },
  },
  provide() {
    const baseMapData = {};
    Object.defineProperty(baseMapData, "storeId", {
      enumerable: true,
      get: () => this.storeId,
    });
    Object.defineProperty(baseMapData, "readOnly", {
      enumerable: true,
      get: () => this.readOnly,
    });
    return { baseMapData };
  },
  data() {
    return {
      Risk: Risk,
      centerPosition: [36.39155, 139.060447],
      zoom: 10,
      storeId: this.initialStoreId,
      options: { zoomControl: false },
      isExternalMoving: false,
      isExternalZooming: false,
      mapObject: null,
      minZoom: 6,
      maxZoom: 17,
      grayTileLayer: GrayTileLayer,
      isIE: false
    };
  },
  computed: {
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](this.storeId);
    },
    selectedFeatures() {
      return this.$store.getters[rootGetters.SELECTED_FEATURES](
          this.storeId
      );
    },
    multiMapSync() {
      return this.$store.getters[rootGetters.MULTI_MAP_SYNC];
    },
    observatoryOptions() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
          this.storeId
      );
    },
  },
  async created() {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
      iconUrl: require("leaflet/dist/images/marker-icon.png"),
      shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
    });

    this.$root.$on("externalPanTo", this.externalPanTo);
    this.$root.$on("externalUpdateZoom", this.externalUpdateZoom);

    this.isIE = /*@cc_on!@*/false || !!document.documentMode;

    if (this.$route.query.lat && this.$route.query.lng) {
      this.centerPosition = [this.$route.query.lat, this.$route.query.lng]
    } else {
      this.centerPosition = this.initialCenterPosition
    }

    if (this.$route.query.zoom) {
      this.zoom = parseInt(this.$route.query.zoom)
    } else {
      this.zoom = this.initialZoom
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.mapObject = this.$refs.map.mapObject;
      this.updateMapObject();
      this.addMoveEndListener();
      this.addZoomEndListener();
    });
  },
  beforeDestroy() {
    this.$store.commit(rootMutations.UPDATE_MAP_OBJECT, {
      storeId: this.storeId,
      mapObject: null,
    });

    this.$root.$off("externalPanTo", this.externalPanTo);
    this.$root.$off("externalUpdateZoom", this.externalUpdateZoom);
  },
  methods: {
    addMoveEndListener() {
      this.mapObject.on("moveend", () => {
        if (this.multiMapSync === false) {
          return;
        }
        if (this.isExternalMoving) {
          this.isExternalMoving = false;
          return;
        }
        this.$root.$emit(
          "externalPanTo",
          this._uid,
          this.mapObject.getCenter()
        );

        this.setQuery();
      });
    },
    addZoomEndListener() {
      this.mapObject.on("zoomend", () => {
        if (this.multiMapSync === false) {
          return;
        }
        if (this.isExternalZooming) {
          this.isExternalZooming = false;
          return;
        }
        this.$root.$emit(
          "externalUpdateZoom",
          this._uid,
          this.mapObject.getZoom()
        );
      });
    },
    updateMapObject() {
      const storeId = this.storeId;
      const mapObject = this.mapObject;
      this.$store.commit(rootMutations.UPDATE_MAP_OBJECT, {
        storeId,
        mapObject,
      });
    },
    externalPanTo(_uid, position) {
      if (
        this._uid !== _uid &&
        this.isExternalMoving === false &&
        this.isExternalZooming === false
      ) {
        this.isExternalMoving = true;
        this.panTo(position);
      }
    },
    panTo(position) {
      if (this.mapObject) {
        this.mapObject.panTo(position);
      }
    },
    externalUpdateZoom(_uid, zoom) {
      if (this._uid !== _uid && this.isExternalZooming === false) {
        this.isExternalZooming = true;
        this.isExternalMoving = true;
        this.updateZoom(zoom);
      }
    },
    updateZoom(zoom) {
      if (this.mapObject) {
        this.mapObject.setZoom(zoom);
      }
    },
    setQuery() {
      const query = _.cloneDeep(this.$route.query);
      query.lat = this.mapObject.getCenter().lat;
      query.lng = this.mapObject.getCenter().lng;
      query.zoom = this.mapObject.getZoom();

      this.$router.replace({
        query,
      });
    },
  },
};
</script>
<style lang="scss" scoped>
.base-map {
  width: 100%;
  height: 100%;
}
</style>
<style>
.leaflet-control-container,
.leaflet-top.leaflet-left {
  width: 100%;
}
.leaflet-control-scale.leaflet-control {
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);
}
</style>
<style lang="scss">
.v-application--is-ltr .v-list-item__action:first-child,
.v-application--is-ltr .v-list-item__icon:first-child {
  margin-right: 20px;
}
.leaflet-image-layer {
  /*image-rendering:-webkit-optimize-contrast;*/
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-crisp-edges;
  image-rendering: crisp-edges;
}
.riskImage {
  /*image-rendering:-webkit-optimize-contrast;*/
  image-rendering: pixelated;
  -ms-interpolation-mode: nearest-neighbor;
  image-rendering: -moz-crisp-edges;
  image-rendering: -o-crisp-edges;
  image-rendering: crisp-edges;
}
.read-only {
  pointer-events: none;
}
</style>
