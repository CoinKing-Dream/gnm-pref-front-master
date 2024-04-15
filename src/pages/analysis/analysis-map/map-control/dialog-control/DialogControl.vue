<template>
  <v-card>
    <v-toolbar dense flat color="#aaaaaa" :height="32" class="px-2">
      <v-btn small dark icon @click="back">
        <v-icon>mdi-arrow-left</v-icon>
      </v-btn>
      <v-spacer></v-spacer>
      <v-btn small dark icon @click="closeDialog">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-toolbar>
    <div class="contents-area">
      <template v-if="contents === 'observatory-list'">
        <observatory-list1></observatory-list1>
      </template>
      <template v-else-if="contents === 'river-level-detail'">
        <river-level-detail></river-level-detail>
      </template>
      <template v-else-if="contents === 'rainfall-detail'">
        <rainfall-detail></rainfall-detail>
      </template>
      <template v-else-if="contents === 'dam-detail'">
        <dam-detail></dam-detail>
      </template>
      <template v-else-if="contents === 'camera-detail'">
        <camera-detail></camera-detail>
      </template>
      <template v-else-if="contents === 'video-detail'">
        <video-detail></video-detail>
      </template>
    </div>
  </v-card>
</template>

<script>
import {
  rootMutations,
  rootGetters
} from "../../../../../store/store-functions";
import ObservatoryList1 from "./observatory-dialogs/observatory-list/ObservatoryList1";
import RiverLevelDetail from "./observatory-dialogs/river-level-detail/RiverLevelDetail";
import RainfallDetail from "./observatory-dialogs/rainfall-detail/RainfallDetail";
import DamDetail from "./observatory-dialogs/dam-detail/DamDetail";
import CameraDetail from "./observatory-dialogs/camera-detail/CameraDetail";
import VideoDetail
  from "@/pages/analysis/analysis-map/map-control/dialog-control/observatory-dialogs/video-detail/VideoDetail";

export default {
  name: "DialogControl",
  components: {
    VideoDetail,
    CameraDetail,
    RainfallDetail,
    ObservatoryList1,
    RiverLevelDetail,
    DamDetail
  },
  inject: {
    analysisMapData: {
      default: []
    }
  },
  data() {
    return {
      previousContents: null
    };
  },
  computed: {
    title() {
      return this.$store.getters[rootGetters.DIALOG](
        this.analysisMapData.storeId
      ).title;
    },
    contents() {
      return this.$store.getters[rootGetters.DIALOG](
        this.analysisMapData.storeId
      ).contents;
    }
  },
  watch: {
    contents(after, before) {
      this.previousContents = before;
    }
  },
  methods: {
    closeDialog() {
      const storeId = this.analysisMapData.storeId;
      const dialog = {
        isShowing: false
      };
      this.$store.commit(rootMutations.UPDATE_DIALOG, { storeId, dialog });
    },
    back() {
      if (this.previousContents === null) {
        return;
      }
      const storeId = this.analysisMapData.storeId;
      const dialog = {
        contents: this.previousContents
      };
      this.$store.commit(rootMutations.UPDATE_DIALOG, { storeId, dialog });
    }
  }
};
</script>

<style lang="scss" scoped>
.v-card>.v-card__progress+:not(.v-btn):not(.v-chip), .v-card>:first-child:not(.v-btn):not(.v-chip) {
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}
.v-card {
  height: 100%;
  background-color: #f2f3f8;
  .v-toolbar__title {
    color: white;
  }
}
.contents-area {
  height: calc(100% - 33px);
}
</style>
