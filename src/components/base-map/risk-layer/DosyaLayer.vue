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
import {
  rootGetters,
} from "@/store/store-functions";
import {rootActions} from "@/store/store-functions";
import {Risk} from "@/enums/Risk";
import _ from "lodash";
import moment from "moment";
import {LIcon, LMarker} from "vue2-leaflet";

export default {
  name: "dosyaLayer",
  inject: {
    baseMapData: {
      default: [],
    },
  },
  components: {
    "l-marker": LMarker,
    "l-icon": LIcon,
  },
  computed: {
    dosya() {
      return this.$store.getters[rootGetters.FIND_RISK](
          Risk.DOSYA, this.baseMapData.storeId
      );
    },
    selectedDate() {
      return this.$store.getters[rootGetters.SELECTED_DATE](
          this.baseMapData.storeId
      );
    },
    selectedDateRiskData() {
      return _.find(this.dosya.data.contents, (o) => {
        return this.selectedDate.isSame(moment.utc(o.date, "YYYY/MM/DD HH:mm"));
      });
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
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
          this.baseMapData.storeId
      );
    },
    slicedImages() {
      if (!this.map) {
        return [];
      }

      const imagesInfo = [];
      const bounds = this.dosya.data.bounds;
      const coordinate = {
        north: bounds[0][0],
        west: bounds[0][1],
        south: bounds[1][0],
        east: bounds[1][1],
      };
      let sliceCount = 50;

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
  methods: {
    loadData() {
      this.$store.dispatch(rootActions.LOAD_DOSYA, {
        storeId: this.baseMapData.storeId,
      });
    },
  },
};
</script>

<style scoped></style>
