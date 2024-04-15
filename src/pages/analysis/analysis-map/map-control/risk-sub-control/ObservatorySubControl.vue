<template>
  <div class="observatory-control pa-2">
    <div>
      <v-row no-gutters align="center">
        <v-col>
          <v-checkbox
            hide-details
            dense
            v-model="enabledObservatories"
            label="水位"
            value="水位"
            @change="onChangeFilters"
          ></v-checkbox>
        </v-col>
        <v-col cols="auto"><v-icon>mdi-triangle</v-icon></v-col>
      </v-row>
      <div class="river-level-sub mx-1 mb-1">
        <v-menu offset-y class="river-level-sub">
          <template v-slot:activator="{ on, attrs }">
            <v-btn v-bind="attrs" v-on="on" x-small block depressed>
              {{ riverLevelCategories.selectedItem.label }}
            </v-btn>
          </template>
          <v-list dense>
            <v-list-item
              v-for="(item, index) in riverLevelCategories.items"
              :key="index"
              @click="onChangeRiverLevelCategory(item)"
              class="category-item"
              :style="{
                backgroundColor:
                  riverLevelCategories.selectedItem.label === item.label
                    ? '#0d47a1!important'
                    : '',
                    color:
                  riverLevelCategories.selectedItem.label === item.label
                    ? 'white!important'
                    : '',
              }"
            >
              <v-list-item-title>{{ item.label }}</v-list-item-title>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>
      <v-row no-gutters align="center">
        <v-col>
          <v-checkbox
            hide-details
            dense
            v-model="enabledObservatories"
            label="雨量"
            value="雨量"
            :disabled="selectedRiverId !== -1"
            @change="onChangeFilters"
          ></v-checkbox>
        </v-col>
        <v-col cols="auto"><v-icon>mdi-checkbox-blank-circle</v-icon></v-col>
      </v-row>
      <div class="text-center">
        <v-btn-toggle v-model="markerDataType" color="primary" mandatory dense>
          <v-btn
              x-small
              class="text-lowercase"
          >
            10分
          </v-btn>
          <v-btn
              x-small
              class="text-lowercase"
          >
            時間
          </v-btn>
          <v-btn
              x-small
              class="text-lowercase"
          >
            累加
          </v-btn>
        </v-btn-toggle>
      </div>
      <v-row no-gutters align="center">
        <v-col>
          <v-checkbox
            dense
            hide-details
            v-model="enabledObservatories"
            :label="'ライブカメラ\n（静止画）'"
            value="ライブカメラ（静止画）"
            :disabled="selectedRiverId !== -1"
            @change="onChangeFilters"
          ></v-checkbox>
        </v-col>
        <v-col cols="auto"> <v-icon>mdi-camera</v-icon></v-col>
      </v-row>
      <v-row no-gutters align="center">
        <v-col>
          <v-checkbox
            dense
            hide-details
            v-model="enabledObservatories"
            :label="'ライブカメラ\n（動画）'"
            value="ライブカメラ（動画）"
            :disabled="selectedRiverId !== -1"
            @change="onChangeFilters"
          ></v-checkbox>
        </v-col>
        <v-col cols="auto"> <v-icon>mdi-camera-iris</v-icon></v-col>
      </v-row>
      <v-row no-gutters align="center">
        <v-col>
          <v-checkbox
            hide-details
            dense
            v-model="enabledObservatories"
            label="ダム"
            value="ダム"
            :disabled="selectedRiverId !== -1"
            @change="onChangeFilters"
          ></v-checkbox>
        </v-col>
        <v-col cols="auto"> <v-icon>mdi-car-windshield</v-icon></v-col>
      </v-row>
      <v-btn
        v-if="enabledObservatories.length === 0"
        block
        x-small
        depressed
        height="20px"
        @click="onClickResetMarkers(false)"
        color="success"
        class="mt-2"
      >
        全体選択
      </v-btn>
      <v-btn
        v-else
        block
        x-small
        depressed
        height="20px"
        @click="onClickResetMarkers(true)"
        class="mt-2"
      >
        選択解除
      </v-btn>
      <v-divider class="my-1"></v-divider>
      <div>
        <v-checkbox
          hide-details
          dense
          v-model="onlyUsersObservatories"
          label="登録観測所のみ"
          @change="onChangeOnlyUsersObservatories"
        ></v-checkbox>
      </div>
      <v-checkbox
        hide-details
        dense
        v-model="showObservatoryName"
        label="観測所名表示"
        @change="onChangeShowObservatoryName"
      ></v-checkbox>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import {
  rootActions,
  rootGetters,
  rootMutations,
} from "@/store/store-functions";
import { Observatory } from "@/enums/Observatory";

export default {
  name: "ObservatorySubControl",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data: () => ({
    selectedRiverId: -1,
    enabledObservatories: [
      "水位",
      "雨量",
      "ライブカメラ（静止画）",
      "ライブカメラ（動画）",
      "ダム",
    ],
    enabledRiverLevelCategory: "0",
    onlyUsersObservatories: false,
    showObservatoryName: false,
    showRainImage: false,
    histories: [],
    riverLevelCategories: {
      label: "タイル",
      icon: "mdi-map",
      iconColor: "#2c7be5",
      selectedItem: null,
      items: [
        {
          label: "全体",
          value: "0",
        },
        {
          label: "テレメータ水位計",
          value: "1",
        },
        {
          label: "危機管理型水位計",
          value: "2",
        },
        {
          label: "水位周知・洪水予報基準点",
          value: "3",
        },
      ],
    },
  }),
  computed: {
    rivers() {
      return this.$store.getters[rootGetters.OBSERVATORY_RIVERS];
    },
    selectedObservatory() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORY](
        this.analysisMapData.storeId
      );
    },
    selectedObservatories() {
      return this.$store.getters[rootGetters.SELECTED_OBSERVATORIES](
        this.analysisMapData.storeId
      );
    },
    observatoryOptions() {
      return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
        this.analysisMapData.storeId
      );
    },
    markerDataType: {
      get() {
        return this.$store.getters[rootGetters.OBSERVATORY_OPTIONS](
            this.analysisMapData.storeId
        ).markerDataType;
      },
      set(markerDataType) {
        this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
          storeId: this.analysisMapData.storeId,
          observatoryOptions: {
            markerDataType,
          },
        });
      },
    },
  },
  watch: {
    histories() {
      localStorage.setItem(
        "observatory-control/river-history",
        JSON.stringify(this.histories)
      );
    },
    rivers() {
      this.selectedRiverId = this.rivers[0].value;
    },
  },
  created() {
    if (this.rivers && this.rivers.length > 0) {
      if (this.observatoryOptions.river) {
        this.selectedRiverId = this.observatoryOptions.river.value;
      }
    } else {
      this.$store.dispatch(rootActions.LOAD_OBSERVATORY_RIVERS, {
        storeId: this.storeId,
      });
    }

    if (this.observatoryOptions.filter) {
      this.enabledObservatories = _.map(
        this.observatoryOptions.filter,
        (observatory) => {
          return observatory.string;
        }
      );
    }
    this.showRainImage = this.observatoryOptions.showRainImage;

    this.riverLevelCategories.selectedItem = this.riverLevelCategories.items[0];
  },
  mounted() {
    this.histories = JSON.parse(
      localStorage.getItem("observatory-control/river-history")
    );
    if (this.histories === null || typeof this.histories !== "object") {
      this.histories = [];
    }
  },
  beforeDestroy() {
    this.$store.commit(rootMutations.UPDATE_COLOR_LEGEND, {
      storeId: this.analysisMapData.storeId,
      colorLegend: {
        unit: null,
        colors: [],
      },
    });
  },
  methods: {
    updateHistories() {
      const selectedRiver = _.find(this.rivers, {
        value: this.selectedRiverId,
      });
      if (this.rivers.includes(selectedRiver)) {
        if (this.histories.includes(selectedRiver)) {
          _.remove(this.histories, (o) => {
            return o.value === selectedRiver.value;
          });
        }
        this.histories.unshift(selectedRiver);
        this.histories = this.histories.slice(0, 3);
      } else {
        _.remove(this.histories, (o) => {
          return o.value === selectedRiver.value;
        });
      }
    },
    onChangeRiverSelectBox() {
      if (this.selectedRiverId !== -1) {
        this.enabledObservatories = ["水位"];
        this.updateHistories();
      }

      this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
        storeId: this.analysisMapData.storeId,
        observatoryOptions: {
          river: _.find(this.rivers, { value: this.selectedRiverId }),
        },
      });
    },
    onClickResetMarkers(deleteMode = true) {
      if (deleteMode) {
        this.enabledObservatories = [];
      } else {
        this.enabledObservatories = [
          "水位",
          "雨量",
          "ライブカメラ（静止画）",
          "ライブカメラ（動画）",
          "ダム",
        ];
      }
      this.onChangeFilters();
    },
    onChangeFilters() {
      this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
        storeId: this.analysisMapData.storeId,
        observatoryOptions: {
          filter: _.map(this.enabledObservatories, (observatory) => {
            return Observatory.getObservatoryFromString(observatory);
          }),
        },
      });
    },
    onChangeRiverLevelCategory(selectedItem) {
      this.riverLevelCategories.selectedItem = selectedItem;
      this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
        storeId: this.analysisMapData.storeId,
        observatoryOptions: {
          riverLevelCategory: selectedItem.value,
        },
      });
    },
    onChangeOnlyUsersObservatories() {
      this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
        storeId: this.analysisMapData.storeId,
        observatoryOptions: {
          onlyUsersObservatories: this.onlyUsersObservatories,
        },
      });
    },
    onChangeShowObservatoryName() {
      this.$store.commit(rootMutations.UPDATE_OBSERVATORY_OPTIONS, {
        storeId: this.analysisMapData.storeId,
        observatoryOptions: {
          showObservatoryName: this.showObservatoryName,
        },
      });
    },
  },
};
</script>

<style lang="scss">
.observatory-control {
  .river-level-sub {
    background-color: #e9e9e9;
    z-index: 1500;
  }

  .v-input .v-label {
    font-size: 13px;
    white-space: pre-line;
    line-height: 13px;
  }
}
.v-list--dense .v-list-item.category-item {
  min-height: 20px;
  padding: 0 10px;
  font-weight: bold;
  .v-list-item__title {
    font-size: 10px;
  }
}
</style>
<style lang="scss" scoped>
.observatory-control {
  .v-input--selection-controls {
    margin-top: 0;
  }

  .select-box {
    z-index: 1500;
  }
}

.histories {
  padding: 0 0 5px 0;
}
.sub-title {
  color: dimgray;
  font-size: 12px;
}
.active {
  color: rgba(0, 0, 0, 0.87) !important;
}
.sub-area {
  border: 1px solid #dddddd;
  border-radius: 5px;
  background-color: #eeeeee;
}

.v-btn {
  border: 1px solid #dddddd;
  background-color: #eeeeee;
}
</style>
