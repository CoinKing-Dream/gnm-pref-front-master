<template>
  <div class="zoom-control" v-if="map">
    <v-btn x-small fab depressed dark color="primary" @click="zoomIn">
      <v-icon small>mdi-plus</v-icon>
    </v-btn>
    <div class="text-center" style="background-color: white; font-size: 12px">
    {{ zoom }}
    </div>
    <v-btn x-small fab depressed dark color="primary" @click="zoomOut">
      <v-icon small>mdi-minus</v-icon>
    </v-btn>
  </div>
</template>

<script>
import { rootGetters } from "../../../../store/store-functions";

export default {
  name: "ZoomControl",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
        this.analysisMapData.storeId
      );
    },
    zoom() {
      return this.map.getZoom();
    },
  },
  methods: {
    zoomIn() {
      this.map.setZoom(this.map.getZoom() + 1);
    },
    zoomOut() {
      this.map.setZoom(this.map.getZoom() - 1);
    },
  },
};
</script>
<style lang="scss" scoped>
.zoom-control {
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
  0 1px 5px 0 rgba(0, 0, 0, 0.12);

  width: 32px;
  .v-btn {
    border-radius: 0;
  }
  .v-btn:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  .v-btn:last-child {
    border-bottom-right-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .zoom-button {
    width: 100%;
  }
  .zoom {
    text-align: center;
    background-color: white;
    font-weight: bold;
  }
  .v-btn--fab.v-size--small {
    width: 100%;
  }
}
</style>
