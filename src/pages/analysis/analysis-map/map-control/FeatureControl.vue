<template>
  <div class="layer-control">
    <expansion-panels
      :data="layerGroups"
      :multiple-select="true"
      @change="callback"
    ></expansion-panels>
    <v-card class="pa-1">
      <v-checkbox
        v-model="hazardSearchMode"
        hide-details="true"
        :label="`地点ハザード一括検索`"
        class="hazard-checkbox"
      ></v-checkbox>
    </v-card>
  </div>
</template>

<script>
import _ from "lodash";
import { rootGetters, rootMutations } from "../../../../store/store-functions";
import ExpansionPanels from "../../../../components/ExpansionPanels";
import { Feature } from "../../../../enums/Feature";
export default {
  name: "FeatureControl",
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  components: { ExpansionPanels },
  data() {
    return {
      layerGroups: [
        {
          label: "防災マップ",
          subGroups: [
            {
              label: "洪水浸水想定区域等",
              items: [],
            },
            {
              label: "浸水実績",
              items: [],
            },
            {
              label: "総雨量別浸水リスク",
              items: [],
            },
          ],
          selectedItems: [],
        },
        {
          label: "地理情報",
          selectedItems: [],
          items: [],
        },
      ],
    };
  },
  computed: {
    selectedFeatures() {
      return this.$store.getters[rootGetters.SELECTED_FEATURES](
        this.analysisMapData.storeId
      );
    },
    hazardSearchMode: {
      get() {
        return this.$store.getters[rootGetters.HAZARD_SEARCH_MODE](
          this.analysisMapData.storeId
        );
      },
      set(bool) {
        this.$store.commit(rootMutations.UPDATE_HAZARD_SEARCH_MODE, {
          storeId: this.analysisMapData.storeId,
          hazardSearchMode: bool,
        });
      },
    },
  },
  created() {
    _.forEach(Feature, (feature, key) => {
      _.forEach(this.layerGroups, (layerGroup) => {
        if (layerGroup.label === feature.group) {
          if (layerGroup.subGroups) {
            const subGroup = _.find(layerGroup.subGroups, {
              label: feature.subGroup,
            });
            if (subGroup) {
              subGroup.items.push({
                label: feature.string,
                value: feature,
              });
            } else {
              layerGroup.subGroups.push({
                label: feature.string,
                item: {
                  label: feature.string,
                  value: feature,
                },
              });
            }
          } else {
            layerGroup.items.push({
              label: feature.string,
              value: feature,
            });
          }

          return false;
        }
      });
    });
    _.forEach(this.selectedFeatures, (feature) => {
      _.find(this.layerGroups, (group) => {
        if (group.label === feature.group) {
          const item = _.find(group.items, { label: feature.string });
          group.selectedItems.push(item);
        }
      });
    });
  },
  methods: {
    callback(selectedItems) {
      this.$store.commit(rootMutations.UPDATE_SELECTED_FEATURES, {
        storeId: this.analysisMapData.storeId,
        selectedFeatures: _.map(selectedItems, "value"),
      });
    },
  },
};
</script>

<style lang="scss">
.layer-control {
  .hazard-checkbox .v-label {
    font-size: 12px;
    color: black;
  }
  .v-input--selection-controls {
    margin-top: 0;
  }
}
</style>
<style lang="scss" scoped>
.layer-control {
  width: 170px;
}
</style>
