<template>
  <div v-if="selectedDateRiskData">
    <template>
      <template v-for="(slicedImage, index) in slicedImages">
        <l-marker
          :key="index"
          :lat-lng="[slicedImage.markerLat, slicedImage.markerLng]"
        >
          <l-icon :icon-anchor="[0, 0]">
            <div
              :style="{
                width: slicedImage.divWidth + 'px',
                height: slicedImage.divHeight + 'px',
                overflow: 'hidden',
                'pointer-events': 'none',
              }"
            >
              <img
                class="riskImage"
                alt="rainfallImage"
                :src="selectedDateRiskData.image.src"
                :style="{
                  transform: `translate(0,${slicedImage.translateY}px)`,
                  width: slicedImage.imgWidth + 'px',
                  height: slicedImage.imgHeight + 'px',
                  'pointer-events': 'none',
                  opacity: opacity,
                }"
              />
            </div>
          </l-icon>
        </l-marker>
      </template>
    </template>
  </div>
</template>
<script>
import { LMarker, LIcon } from "vue2-leaflet";
import {
  rootActions,
  rootGetters,
} from "../../../store/store-functions";
import _ from "lodash";
import { Risk } from "../../../enums/Risk";
import moment from "moment";

export default {
  name: "RainLayer",
  inject: {
    baseMapData: {
      default: [],
    },
  },
  props: {
    isSimpleMode: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  components: {
    "l-marker": LMarker,
    "l-icon": LIcon,
  },
  data() {
    return {
      beforeZoom: this.zoom,
      beforeRainLevel: 1,
    };
  },
  computed: {
    rainRisk() {
      return this.$store.getters[rootGetters.FIND_RISK](Risk.RAIN, this.baseMapData.storeId);
    },
    selectedDate() {
      return this.$store.getters[rootGetters.SELECTED_DATE](
        this.baseMapData.storeId
      );
    },
    selectedDateRiskData() {
      if (!this.selectedDate) {
        return;
      }
      return _.find(this.rainRisk.data.contents, (o) => {
        return this.selectedDate.isSame(moment.utc(o.date, "YYYY/MM/DD HH:mm"));
      });
    },
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
        this.baseMapData.storeId
      );
    },
    baseDate() {
      return this.$store.getters[rootGetters.BASE_DATE](
        this.baseMapData.storeId
      );
    },
    opacity() {
      return this.$store.getters[rootGetters.RISK_OPACITY](
        this.baseMapData.storeId
      );
    },
    slicedImages() {
      if (!this.map) {
        return [];
      }

      const imagesInfo = [];
      const bounds = this.rainRisk.data.bounds[this.selectedDateRiskData.type];
      const coordinate = {
        north: bounds[0][0],
        west: bounds[0][1],
        south: bounds[1][0],
        east: bounds[1][1],
      };
      const height = this.rainRisk.data.imageInfo[
        this.selectedDateRiskData.type
      ].height;
      let sliceCount;
      switch (height) {
        case 1300:
          sliceCount = 50;
          break;
        case 550:
          sliceCount = 50;
          break;
        case 505:
          sliceCount = 50;
          break;
        case 1248:
          sliceCount = 48;
          break;
        case 672:
          sliceCount = 48;
          break;
        case 960:
          sliceCount = 2;
          break;
        case 240:
          sliceCount = 2;
          break;
      }

      const slicedLatHeight =
        (coordinate.north - coordinate.south) / sliceCount;

      for (let i = 0; i < sliceCount; i++) {
        const slicedImageBottomLeftPoint = this.map.project([
          coordinate.north - i * slicedLatHeight - slicedLatHeight,
          coordinate.west,
        ]);
        const slicedImageTopRightPoint = this.map.project([
          coordinate.north - i * slicedLatHeight,
          coordinate.east,
        ]);

        let slicedImageHeight =
          slicedImageBottomLeftPoint.y - slicedImageTopRightPoint.y;
        let slicedImageWidth =
          slicedImageTopRightPoint.x - slicedImageBottomLeftPoint.x;

        if (
          Math.round(slicedImageBottomLeftPoint.y) <
          Math.round(
            slicedImageBottomLeftPoint.y + Math.ceil(slicedImageHeight)
          )
        ) {
          slicedImageHeight -= -1;
        }

        const markerLat = coordinate.north - i * slicedLatHeight;
        const markerLng = coordinate.west;
        const divHeight = Math.ceil(slicedImageHeight) - 1.4;

        imagesInfo.push({
          markerLat: markerLat,
          markerLng: markerLng,
          divWidth: slicedImageWidth,
          divHeight: divHeight,
          imgWidth: slicedImageWidth,
          imgHeight: slicedImageHeight * sliceCount,
          translateY: -(i * slicedImageHeight + 1),
        });
      }

      return imagesInfo;
    },
  },
  watch: {
    baseDate() {
      this.loadData();
    },
  },
  created() {
    this.loadData();
  },
  mounted() {
    this.addZoomEndListener();
  },
  beforeDestroy() {
    this.removeZoomEndListener();
  },
  methods: {
    loadData() {
      this.$store.dispatch(rootActions.LOAD_RAIN, {
        storeId: this.baseMapData.storeId,
        level: this.beforeRainLevel,
        loadOnlyCurrent: this.isSimpleMode
      });
    },
    addZoomEndListener() {
      this.map.on("zoomend", this.loadRainImageByZoomLevel);
    },
    removeZoomEndListener() {
      if (this.map) {
        this.map.off("zoomend", this.loadRainImageByZoomLevel);
      }
    },
    loadRainImageByZoomLevel() {
      const currentZoom = this.map.getZoom();
      let rainLevel;
      if (currentZoom >= 9) {
        rainLevel = 1;
      } else if (currentZoom >= 7 && currentZoom < 9) {
        rainLevel = 2;
      } else {
        rainLevel = 3;
      }

      if (rainLevel !== this.beforeRainLevel) {
        const storeId = this.baseMapData.storeId;
        this.$store.dispatch(rootActions.LOAD_RAIN, {
          storeId,
          level: rainLevel,
          selectedDate: this.selectedDate,
          loadOnlyCurrent: this.isSimpleMode
        });
        this.beforeRainLevel = rainLevel;
      }

      this.beforeZoom = this.map.getZoom();
    },
  },
};
</script>

<style scoped></style>
