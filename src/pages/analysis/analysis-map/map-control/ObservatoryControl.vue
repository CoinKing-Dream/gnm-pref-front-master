<template>
  <div class="observatory-control">
    <v-expansion-panels v-model="panel" focusable accordion>
      <v-expansion-panel>
        <v-expansion-panel-header
          :style="{ backgroundColor: '#ffbe3d' }"
          disable-icon-rotate
        >
          <div>
            {{ panelData.selectedItem.label }}
          </div>
          <template v-slot:actions>
            <v-icon color="black">mdi-office-building-marker</v-icon>
          </template>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
          <observatory-sub-control></observatory-sub-control>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
import { Risk } from "../../../../enums/Risk";
import { rootGetters, rootMutations } from "../../../../store/store-functions";
import ObservatorySubControl from "@/pages/analysis/analysis-map/map-control/risk-sub-control/ObservatorySubControl";

export default {
  name: "ObservatoryControl",
  components: { ObservatorySubControl },
  inject: {
    analysisMapData: {
      default: [],
    },
  },
  data() {
    return {
      panelData: {
        label: "リスク",
        icon: "mdi-weather-lightning-rainy",
        iconColor: "black",
        selectedItem: {},
        items: [],
      },
      panel: 0,
    };
  },
  computed: {
    selectedRisk() {
      return this.$store.getters[rootGetters.SELECTED_RISK](
        this.analysisMapData.storeId
      );
    },
    hideMenu() {
      return this.$store.getters[rootGetters.HIDE_MENU];
    }
  },
  created() {
    this.panel = this.hideMenu? 1: 0;

    this.panelData.items.push({
      label: Risk.OBSERVATORY.string,
      value: Risk.OBSERVATORY,
    });

    this.panelData.selectedItem = {
      label: Risk.OBSERVATORY.string,
      value: Risk.OBSERVATORY,
    };
  },
  methods: {
    callback(selectedItem) {
      const storeId = this.analysisMapData.storeId;
      this.$store.commit(rootMutations.UPDATE_SELECTED_RISK, {
        storeId,
        selectedRiskType: selectedItem.value,
      });
    },
  },
};
</script>
<style lang="scss">
.observatory-control {
  .theme--light.v-expansion-panels .v-expansion-panel {
    margin: 1px 0;
    max-width: inherit;
  }

  .v-expansion-panel-header {
    min-height: 20px;
  }

  .v-expansion-panel-header {
    padding: 5px 10px;
    height: 30px;
  }

  .v-expansion-panel-content__wrap {
    padding: 0px;
  }

  .v-expansion-panel-header {
    font-size: 13px;
  }
}
</style>
<style lang="scss" scoped>
@import "../../../../common";

.observatory-control {
  width: 170px;
  .v-btn {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
  }
  .v-sheet.v-card.risk-sub-control-area {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
.select-area {
  position: relative;
}

.risk-sub-control {
  max-width: inherit;
}
</style>
