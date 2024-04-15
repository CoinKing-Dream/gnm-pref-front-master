<template>
  <div v-if="!hideMarker">
    <template v-for="(observatory, i) in observatories">
      <template
        v-if="
          isVisibleType(observatory) &&
          isSelectedRiver(observatory) &&
          isSelectedRiverLevelCategory(observatory) &&
          isUsersObservatory(observatory)
        "
      >
        <l-marker
          :key="`ob-i-${i}`"
          :lat-lng="[observatory.lat, observatory.lng]"
          @click="onClickMarker(observatory)"
        >
          <l-icon
            :icon-size="getIconSize(observatory)"
            :icon-anchor="getIconAnchor(observatory)"
            :tooltipAnchor="getTooltipAnchor(observatory)"
            :icon-url="
              require(`@/assets/images/observatory-icons/${getIconUrl(
                observatory
              )}`)
            "
            :class-name="
              (isIncludedSelectedObservatories(observatory)
                ? 'shadow-blue'
                : '') +
              (isSelectedObservatory(observatory) ? ' shadow-red' : '')
            "
          >
          </l-icon>
          <template>
            <l-tooltip :options="{ direction: 'top', className: 'ob-tooltip' }">
              {{ observatory.type.string }} : {{ observatory.name }}
              {{ observatory.riverName ? `(${observatory.riverName})` : "" }}
            </l-tooltip>
          </template>
        </l-marker>
        <l-marker
          :key="`ob-name-${i}`"
          :lat-lng="[observatory.lat, observatory.lng]"
        >
          <l-icon :icon-size="[0, 0]" :icon-anchor="[0, -10]">
            <div>
              <h4
                v-if="
                  showObservatoryName && observatory.type !== Observatory.CAMERA
                "
                class="ob-name"
              >
                {{ observatory.name }}
              </h4>
            </div>
          </l-icon>
        </l-marker>
      </template>
    </template>
  </div>
</template>

<script>
import { LTooltip, LMarker, LIcon } from "vue2-leaflet";
import {
  rootActions,
  rootGetters,
  rootMutations,
} from "@/store/store-functions";
import { Risk } from "@/enums/Risk";
import _ from "lodash";
import { Observatory } from "@/enums/Observatory";

export default {
  name: "ObservatoryLayer",
  inject: {
    baseMapData: {
      default: [],
    },
  },
  components: {
    LTooltip,
    LMarker,
    LIcon,
  },
  data() {
    return {
      observatoryMarkers: [],
      Observatory: Observatory,
      markerObjects: [],
      defaultIconSize: 20,
      cameraIconSize: 16,
      hideMarker: false,
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
        this.baseMapData.storeId
      );
    },
    selectedObservatory() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
        this.baseMapData.storeId
      );
    },
    selectedObservatories() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORIES](
        this.baseMapData.storeId
      );
    },
    observatories() {
      return this.$store.getters[rootGetters.FIND_RISK](Risk.OBSERVATORY, this.baseMapData.storeId).data
        .contents;
    },
    multiMapShow() {
      return this.$store.getters[rootGetters.MULTI_MAP_SHOW];
    },
    observatoryOptions() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.baseMapData.storeId
      );
    },
    filter() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.baseMapData.storeId
      ).filter;
    },
    river() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.baseMapData.storeId
      ).river;
    },
    baseDate() {
      return this.$store.getters[rootGetters.BASE_DATE](
        this.baseMapData.storeId
      );
    },
    userInfo() {
      return this.$store.getters[rootGetters.USER_INFO];
    },
    riverLevelCategory() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.baseMapData.storeId
      ).riverLevelCategory;
    },
    onlyUsersObservatories() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.baseMapData.storeId
      ).onlyUsersObservatories;
    },
    showObservatoryName() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.baseMapData.storeId
      ).showObservatoryName;
    },
    showRainImage() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.baseMapData.storeId
      ).showRainImage;
    },
    markerDataType() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
          this.baseMapData.storeId
      ).markerDataType;
    }
  },
  watch: {
    baseDate(before, after) {
      if (before.isSame(after)) {
        return;
      }
      this.loadData();
    },
    selectedObservatory() {
      let location = `/analysis?oid=${this.selectedObservatory._id}&otype=${this.selectedObservatory.type.index}`;
      this.$router.replace(
          location,
          () => {},
          () => {}
      );
    },
  },
  created() {
    this.loadData(true);
  },
  mounted() {
    this.map.on("zoomend", this.setIconSize);
    this.map.on("zoomend", this.updateHideMarker);
  },
  beforeDestroy() {
    this.$store.commit(rootMutations.UPDATE_DIALOG, {
      storeId: this.baseMapData.storeId,
      dialog: {
        isShowing: false,
      },
    });
  },
  methods: {
    loadData(isFirstLoad = false) {
      this.setIsLoading(true);
      return this.$store
        .dispatch(rootActions.LOAD_OBSERVATORY, {
          storeId: this.baseMapData.storeId,
          loadInfo: isFirstLoad ? true : false,
          loadCurrentData: isFirstLoad ? false : true,
        })
        .then(() => {
          if (isFirstLoad) {
            const riverLevelObservatories = _.filter(
              this.observatories,
              (observatory) => {
                return (
                  this.userInfo.riverLevelObservatories.includes(
                    observatory._id
                  ) && observatory.type.index === Observatory.RIVER_LEVEL.index
                );
              }
            );

            const bounds = _.map(riverLevelObservatories, (row) => {
              return [row.lat, row.lng];
            });

            if (!this.$route.query.zoom && (!this.$route.query.lat && !this.$route.query.lng)) {
              this.map.fitBounds(bounds, { maxZoom: 13 });
            }

            this.$store
              .dispatch(rootActions.LOAD_OBSERVATORY, {
                storeId: this.baseMapData.storeId,
                loadInfo: false,
                loadCurrentData: true,
              })
              .then(() => {
                this.setIsLoading(false);
              });
          } else {
            this.setIsLoading(false);
          }

          if (_.has(this.selectedObservatory, "_id")) {
            this.loadObservatoryData();
          } else {
            this.setDefaultObservatoryByCookie();
          }
        });
    },
    async loadObservatoryData() {
      this.$store.dispatch(rootActions.LOAD_OBSERVATION_DATA, {
        storeId: this.baseMapData.storeId,
        observatoryId: this.selectedObservatory._id,
        isRiverArea: this.observatoryOptions.river.value !== -1,
        type: this.selectedObservatory.type.index,
      });
    },
    isSelectedObservatory(observatory) {
      return !!(
        this.selectedObservatory &&
        this.selectedObservatory._id === observatory._id &&
        this.selectedObservatory.type === observatory.type
      );
    },
    isIncludedSelectedObservatories(observatory) {
      return !!_.find(this.selectedObservatories, {
        _id: observatory._id,
        type: observatory.type,
      });
    },
    isVisibleType(observatory) {
      return _.findIndex(this.filter, observatory.type) !== -1;
    },
    isSelectedRiver(observatory) {
      if (this.observatoryOptions.river.value === -1) {
        return true;
      } else {
        if (
          observatory.type === Observatory.RIVER_LEVEL &&
          this.observatoryOptions.river.value === observatory.riverAreaId
        ) {
          return true;
        } else {
          return false;
        }
      }
    },
    isSelectedRiverLevelCategory(observatory) {
      if (observatory.type !== Observatory.RIVER_LEVEL) {
        return true;
      }
      if (_.findIndex(this.filter, Observatory.RIVER_LEVEL) === -1) {
        return true;
      }
      if (!observatory.kind) {
        return true;
      }

      if (this.riverLevelCategory === "0") {
        return true;
      } else if (this.riverLevelCategory === "1") {
        switch (observatory.kind) {
          case 1:
          case 2:
          case 3:
          case 4:
          case 5:
          case 6:
            return true;
          default:
            return false;
        }
      } else if (this.riverLevelCategory === "2") {
        switch (observatory.kind) {
          case 9:
            return true;
          default:
            return false;
        }
      } else if (this.riverLevelCategory === "3") {
        switch (observatory.kind) {
          case 5:
          case 6:
            return true;
          default:
            return false;
        }
      } else {
        return false;
      }
    },
    isUsersObservatory(observatory) {
      if (!this.onlyUsersObservatories) {
        return true;
      }

      if (observatory.type === Observatory.RIVER_LEVEL) {
        return this.userInfo.riverLevelObservatories.includes(observatory._id);
      } else if (observatory.type === Observatory.RAIN) {
        return this.userInfo.rainfallObservatories.includes(observatory._id);
      } else {
        return false;
      }
    },
    setDefaultObservatoryByCookie() {
      if (
        typeof this.$route.query.oid === "undefined" ||
        typeof this.$route.query.otype === "undefined"
      ) {
        return;
      }
      const observatoryId = this.$route.query.oid;
      const observatoryType = Observatory.getObservatoryFromIndex(
        parseInt(this.$route.query.otype)
      );

      const observatory = _.find(this.observatories, {
        _id: observatoryId,
        type: observatoryType,
      });

      if (observatory) {
        if (this.baseMapData.readOnly) {
          return;
        }

        this.onClickMarker(observatory);
      }
    },
    getIconUrl(observatoryInfo) {
      switch (observatoryInfo.type) {
        case Observatory.RIVER_LEVEL: {
          let icon = "stage-normal.png";
          if (
            typeof observatoryInfo.level === "undefined" ||
            observatoryInfo.level <= -998
          )
            icon = "stage-deficit.png";
          if (
            observatoryInfo.standbyLevel &&
            observatoryInfo.standbyLevel <= observatoryInfo.level
          )
            icon = "stage-standby.png";
          if (
            observatoryInfo.startStage &&
            observatoryInfo.startStage <= observatoryInfo.level
          )
            icon = "stage-start.png";
          if (
            observatoryInfo.warningLevel &&
            observatoryInfo.warningLevel <= observatoryInfo.level
          )
            icon = "stage-warning.png";
          if (
              observatoryInfo.evacuationLevel &&
              observatoryInfo.evacuationLevel <= observatoryInfo.level
          )
            icon = "stage-evacuation.png";
          if (
            observatoryInfo.dangerousLevel &&
            observatoryInfo.dangerousLevel <= observatoryInfo.level
          )
            icon = "stage-dangerous.png";
          if (
            observatoryInfo.outbreakLevel &&
            observatoryInfo.outbreakLevel <= observatoryInfo.level
          )
            icon = "stage-outbreak.png";

          return icon;
        }
        case Observatory.RAIN: {
          return this.getRainIcon(observatoryInfo)
        }
        case Observatory.DAM:
          return "dam.png";
        case Observatory.CAMERA:
          return "camera.png";
        case Observatory.VIDEO:
          return "camera-iris.png";
        default:
          return "stage-dangerous.png";
      }
    },
    getRainIcon(observatoryInfo) {
      let icon = "rain-default.png";
      switch (this.markerDataType) {
        case 0: {
          const rain = observatoryInfo.rain;
          if (
              typeof rain === "undefined" ||
              rain <= -998
          )
            icon = "rain-deficit.png";
          else if (rain < 1) icon = "rain-0.png";
          else if (rain >= 1 && rain < 5)
            icon = "rain-2.png";
          else if (rain >= 5 && rain < 10)
            icon = "rain-3.png";
          else if (rain >= 10 && rain < 20)
            icon = "rain-4.png";
          else if (rain >= 20) icon = "rain-5.png";
          return icon
        }
        case 1:
        case 2: {
          const rain = this.markerDataType === 1 ? observatoryInfo.rain60 : observatoryInfo.rainTotal;
          if (
              typeof rain === "undefined" ||
              rain <= -998
          )
            icon = "rain-deficit.png";
          else if (rain < 1) icon = "rain-0.png";
          else if (rain >= 1 && rain < 20)
            icon = "rain-1.png";
          else if (rain >= 20 && rain < 30)
            icon = "rain-2.png";
          else if (rain >= 30 && rain < 50)
            icon = "rain-3.png";
          else if (rain >= 50 && rain < 80)
            icon = "rain-4.png";
          else if (rain >= 80) icon = "rain-5.png";
          return icon
        }
      }
      return icon;
    },
    getIconSize(observatoryInfo) {
      switch (observatoryInfo.type) {
        case Observatory.CAMERA:
          return [this.cameraIconSize, this.cameraIconSize];
        default:
          return [this.defaultIconSize, this.defaultIconSize];
      }
    },
    getIconAnchor(observatoryInfo) {
      switch (observatoryInfo.type) {
        case Observatory.CAMERA: {
          const o = _.find(this.observatories, (o) => {
            return (
              o._id === observatoryInfo._id && o.type !== observatoryInfo.type
            );
          });
          return o
            ? [this.cameraIconSize / 2, this.cameraIconSize * 2]
            : [this.cameraIconSize / 2, this.cameraIconSize];
        }
        default:
          return [this.defaultIconSize / 2, this.defaultIconSize];
      }
    },
    getTooltipAnchor(observatoryInfo) {
      switch (observatoryInfo.type) {
        case Observatory.CAMERA:
          return [0, (this.cameraIconSize * 2 + 5) * -1];
        default:
          return [0, (this.defaultIconSize + 5) * -1];
      }
    },
    onClickMarker(observatory) {
      const layerPoint = this.map.latLngToLayerPoint([
        observatory.lat,
        observatory.lng,
      ]);
      if (this.multiMapShow === false) {
        layerPoint.x += window.innerWidth / 4;
      }
      this.map.panTo(this.map.layerPointToLatLng(layerPoint));
      const query = {
        storeId: this.baseMapData.storeId,
        observatoryId: observatory._id,
        isRiverArea: this.observatoryOptions.river.value !== -1,
        type: observatory.type.index,
      };
      if (
        observatory.type === Observatory.RIVER_LEVEL &&
        this.riverLevelCategory !== "0"
      ) {
        query.categoryNo = this.riverLevelCategory;
      }
      if (this.onlyUsersObservatories) {
        query.userLink = true;
      }

      this.$store
        .dispatch(rootActions.LOAD_OBSERVATION_DATA, query)
        .then(() => {
          this.$store.commit(rootMutations.UPDATE_DIALOG, {
            storeId: this.baseMapData.storeId,
            dialog: {
              isShowing: true,
              title: "観測所",
              contents: "observatory-list",
            },
          });
        });
    },
    updateHideMarker() {
      this.hideMarker = this.map.getZoom() <= 8;
    },
    setIsLoading(bool) {
      this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
        storeId: this.baseMapData.storeId,
        observatoryOptions: { isLoading: bool },
      });
    },
    setIconSize() {
      if (this.map.getZoom() > 10) {
        this.cameraIconSize = 16;
        this.defaultIconSize = 20;
      } else {
        this.cameraIconSize = 12;
        this.defaultIconSize = 14;
      }
    },
  },
};
</script>

<style>
.leaflet-tooltip-pane {
  z-index: 1000;
}
</style>
<style lang="scss">
@mixin shadow($color, $shadow-size) {
  -webkit-filter: drop-shadow(
      (-$shadow-size) (-$shadow-size) $shadow-size $color
    )
    drop-shadow($shadow-size (-$shadow-size) $shadow-size $color)
    drop-shadow((-$shadow-size) $shadow-size $shadow-size $color)
    drop-shadow($shadow-size $shadow-size $shadow-size $color);
  filter: drop-shadow((-$shadow-size) (-$shadow-size) $shadow-size $color)
    drop-shadow($shadow-size (-$shadow-size) $shadow-size $color)
    drop-shadow((-$shadow-size) $shadow-size $shadow-size $color)
    drop-shadow($shadow-size $shadow-size $shadow-size $color);
}

.shadow-blue {
  @include shadow(orange, 1px);
}

.shadow-red {
  @include shadow(#fa2d33, 4px);
}

.ob-tooltip {
  font-weight: bold;
  background-color: #2c3e50 !important;
  color: white !important;
  border: 0 !important;
}
.ob-tooltip.leaflet-tooltip-top:before {
  border-top-color: #2c3e50 !important;
}
.ob-tooltip-static {
  background-color: rgba(0, 0, 0, 0);
}

.ob-marker {
  position: relative;
}
.ob-name {
  position: absolute;
  left: 50%;
  -webkit-transform: translateX(-50%);
  transform: translateX(-50%);

  white-space: nowrap;
  line-height: 0.1;
  text-shadow: 2px 2px 0 #ffffff, -2px 2px 0 #ffffff, 2px -2px 0 #ffffff,
    -2px -2px 0 #ffffff;
}
</style>
