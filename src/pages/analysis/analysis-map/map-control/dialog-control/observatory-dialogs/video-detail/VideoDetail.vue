<template>
  <div>
    <div class="pa-2">
      <v-card>
        <div class="video-container">
          <iframe
              width="560" height="315"
              :src="`https://www.youtube.com/embed/${selectedObservatory.youtube}?autoplay=1`"
            title="YouTube video player"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
          ></iframe>
        </div>
      </v-card>
    </div>
    <div class="px-2">
      <v-card>
        <v-list disabled nav>
          <v-list-item-group color="primary">
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-home-modern</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title
                  v-text="`${selectedObservatory.name}`"
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
            <v-list-item>
              <v-list-item-icon>
                <v-icon>mdi-map-marker</v-icon>
              </v-list-item-icon>
              <v-list-item-content>
                <v-list-item-title
                  v-text="
                    `${selectedObservatory.lat},${selectedObservatory.lng}`
                  "
                ></v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </v-list-item-group>
        </v-list>
      </v-card>
    </div>
  </div>
</template>

<script>
import { rootGetters } from "../../../../../../../store/store-functions";
import moment from "moment";
import _ from "lodash";

export default {
  name: "VideoDetail",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      currentImage: 0,
    };
  },
  computed: {
    selectedObservatory() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
        this.analysisMapData.storeId
      );
    },
    rivers() {
      return this.$store.getters[rootGetters.OBSERVATORY_RIVERS];
    },
  },
  methods: {
    getRiver(riverAreaId) {
      const river = _.find(this.rivers, { value: riverAreaId });
      if (river) {
        return `${river.text}`;
      }
    },
  },
};
</script>

<style>
.video-container {
  position: relative;
  padding-bottom: 56.25%;
  padding-top: 30px;
  height: 0;
  overflow: hidden;
}

.video-container iframe,
.video-container object,
.video-container embed {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
</style>
<style lang="scss" scoped>
.current-image-area {
  background-color: black;
  .current-image {
    width: 85%;
  }
}

.image-list {
  white-space: nowrap;

  .image-list-item {
    border-right: 1px solid rgba(0, 0, 0, 0.3);
    cursor: pointer;
    background-color: white;
    display: inline-block;
    .text {
      text-align: center;
      padding: 5px 0;
      line-height: 1.1;
      .date {
        font-size: 10px;
      }
      .time {
        font-size: 14px;
        font-weight: bold;
      }
    }
  }
  .current-image {
    color: white;
    background-color: #0d47a1;
  }
}
.v-list-item__title {
  font-size: 20px !important;
}
</style>
