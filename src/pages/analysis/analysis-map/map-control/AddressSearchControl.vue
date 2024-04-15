<template>
  <div class="address-search-control">
    <v-text-field
      v-model="keyword"
      placeholder="  住所/地点検索"
      type="text"
      rounded
      dense
      background-color="white"
      @keydown.enter="search($event.keyCode)"
      append-icon="mdi-magnify"
      @click:append="search()"
      class="ma-0 pa-0"
      hide-details
    >
    </v-text-field>
    <v-dialog v-model="isShowDialog" persistent scrollable max-width="400">
      <v-card>
        <v-card-title class="subtitle-2">{{ keyword }}</v-card-title>
        <v-card-text>
          <v-list dense>
            <template v-for="(location, i) in locations">
              <v-list-item :key="i" link @click="move(location)">
                <v-list-item-icon>
                  <v-icon small>{{ location.icon }}</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title v-text="location.name"></v-list-item-title>
                </v-list-item-content>
              </v-list-item>
              <v-divider :key="`d-${i}`"></v-divider>
            </template>
          </v-list>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" text @click="isShowDialog = false">
            キャンセル
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import axios from "axios";
import L from "leaflet";
import { Observatory } from "@/enums/Observatory";
import {rootGetters} from "@/store/store-functions";

export default {
  name: "AddressSearchControl",
  props: {
    storeId: {
      type: Number,
      required: true,
    },
  },
  data() {
    return {
      keyword: "",
      isShowDialog: false,
      locations: [],
      currentLocation: null,
      currentMarker: null
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
          this.storeId
      );
    },
    dialog() {
      return this.$store.getters[rootGetters.DIALOG](
          this.storeId
      );
    },
  },
  methods: {
    async search(keyCode) {
      this.locations = [];
      // 日本語入力中のキーダウンは処理しない
      if (keyCode !== undefined && keyCode !== 13) {
        return;
      }
      if (this.keyword === "") {
        return;
      }
      const params = {
        keyword: this.keyword
      };
      const res = await axios
        .create({
          responseType: "json",
          baseURL:
            "https://gcdnaj43fi.execute-api.ap-northeast-1.amazonaws.com/prod"
        })
        .get("/location", {
          params
        });
      this.locations = res.data.locations.map(location => {
        location.icon = "mdi-map-marker";
        switch (location.type) {
          case Observatory.RAIN.index:
            location.icon = "mdi-checkbox-blank-circle";
            break;
          case Observatory.RIVER_LEVEL.index:
            location.icon = "mdi-triangle";
            break;
          case Observatory.CAMERA.index:
            location.icon = "mdi-camera";
            break;
          case Observatory.VIDEO.index:
            location.icon = "mdi-camera-iris";
            break;
          case -2:
            location.icon = "mdi-waves";
            break;
        }
        return location;
      });
      if (this.locations.length === 0) {
        this.$root.$emit("showSystemMessage", {
          message: "群馬県周辺に該当する位置情報が見つかりませんでした。",
        });
      } else {
        this.isShowDialog = true;
      }
    },
    move(location) {
      if (this.currentMarker !== null) {
        this.map.removeLayer(this.currentMarker);
      }
      this.isShowDialog = false;
      const latLng = [Number(location.lat), Number(location.lng)];

      if (this.map.getZoom() < 15) {
        this.map.setZoom(15);
      }

      if (this.dialog.isShowing) {
        const layerPoint = this.map.latLngToLayerPoint(latLng);
        layerPoint.x += window.innerWidth / 4;
        this.map.panTo(this.map.layerPointToLatLng(layerPoint));
      } else {
        this.map.panTo(latLng)
      }

      // marker
      if (location.type === undefined || location.type < 0) {
        this.currentMarker = L.marker(latLng);
        const icon = this.currentMarker.options.icon;
        this.currentMarker.setIcon(icon);
        this.currentMarker.addTo(this.map);
        this.currentMarker
          .bindTooltip(location.name, {
            direction: "top",
            className: "location-tooltip"
          })
          .openTooltip();
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.address-search-control {
  .v-text-field {
    max-width: 220px;
    font-size: 1em;
  }

}


</style>

<style lang="scss">
.location-tooltip {
  color: #396cb9 !important;
}

.address-search-control {
  .v-text-field.v-input--dense:not(.v-text-field--enclosed):not(.v-text-field--full-width) .v-input__append-inner .v-input__icon>.v-icon {
    margin-top: 0
  }
}

</style>
