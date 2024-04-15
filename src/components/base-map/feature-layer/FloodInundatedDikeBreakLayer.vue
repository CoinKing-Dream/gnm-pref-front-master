<template>
  <div>
    <template v-if="selectedPoint && selectedPoint.breakInfo">
      <l-image-overlay
        :bounds="selectedPoint.breakInfo.bounds"
        :url="selectedPoint.breakInfo.data[0].image"
        :opacity="opacity"
      >
      </l-image-overlay>
    </template>
    <template v-if="rivers">
      <template v-for="(river, riverIndex) in rivers">
        <template v-for="(point, index) in river.points">
        <l-marker
          v-if="!filter || (filter.length > 0 && filter.includes(point.property.node))"
          ref="markers"
          :key="`${riverIndex}.${index}`"
          :lat-lng="[point.property.lat, point.property.lon]"
          @click="onClickPoint(point)"
        >
          <l-icon
            :icon-size="[20, 20]"
            :icon-anchor="[10, 20]"
            :icon-url="
              require(`@/assets/images/pin-${
                selectedPoint &&
                selectedPoint.property &&
                selectedPoint.property.name === point.property.name &&
                selectedPoint.property.node === point.property.node
                  ? 'red'
                  : 'black'
              }.png`)
            "
          >
          </l-icon>
          <l-tooltip :options="{direction: 'top', offset: [0,-20]}">
            <div>{{ point.property.name }}</div>
            <div>{{ point.property.address }}</div>
          </l-tooltip>
        </l-marker>
        </template>
      </template>
    </template>
  </div>
</template>

<script>
import axios from "axios";
import _ from "lodash";
import { LIcon, LMarker, LTooltip, LImageOverlay } from "vue2-leaflet";
import { rootGetters } from "@/store/store-functions";

export default {
  name: "FloodInundatedDikeBreakLayer",
  props: {
    level: {
      type: String,
      required: true,
    },
    filter: {
      type: Array,
      required: false,
    }
  },
  inject: {
    baseMapData: {
      default: [],
    },
  },
  components: {
    LMarker,
    LIcon,
    LTooltip,
    LImageOverlay,
  },
  data() {
    return {
      rivers: null,
      points: null,
      selectedPoint: null,
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
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
    async level() {
      await this.loadData();
    },
    async filter() {
      await this.loadData();
    }
  },
  async created() {
    await this.loadData();
  },
  methods: {
    async loadData() {
      const [err1, rivers] = await this.loadRivers();
      if (err1) {
        return;
      }

      for (const river of rivers) {
        let points = [];
        for (const level of river.level) {
          if (this.level === level) {
            const [err2, response] = await this.loadDikeBreakPoints(
              river.id,
              level
            );
            if (err2) {
              continue;
            }
            points = _.concat(points, response.points);
          }
        }
        river.points = points;
      }

      this.rivers = rivers;
    },
    async loadRivers() {
      return await this.request(`/rivers_list.json`);
    },
    async loadDikeBreakPoints(id, level) {
      return await this.request(`/${id}_${level}/points.json`);
    },
    async request(url) {
      return axios
        .create({
          responseType: "json",
        })
        .get(
          "https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/dike_break" +
            url
        )
        .then((response) => {
          return [null, response.data];
        })
        .catch((err) => [err]);
    },
    onClickPoint(point) {
      if (this.selectedPoint === point) {
        this.selectedPoint = null;
      } else {
        this.selectedPoint = point;
      }
    },
  },
};
</script>
<style lang="scss">
.leaflet-popup-content {
  margin: 10px;
  width: 150px;
}
.big-river-flooding-options {
  padding: 0;
}
</style>
<style scoped></style>
