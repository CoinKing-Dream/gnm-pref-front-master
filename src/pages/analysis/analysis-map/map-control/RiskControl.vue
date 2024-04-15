<template>
  <div class="risk-control">
    <div class="select-area">
      <expansion-panels
        :data="[panelData]"
        :default-open="hideMenu? 1:0"
        :background-color="'#ffbe3d'"
        @change="callback"
      ></expansion-panels>
      <div class="risk-sub-control-area ml-2">
        <risk-sub-control></risk-sub-control>
      </div>
    </div>
  </div>
</template>

<script>
import _ from "lodash";
import { Risk } from "../../../../enums/Risk";
import ExpansionPanels from "../../../../components/ExpansionPanels";
import { rootGetters, rootMutations } from "../../../../store/store-functions";
import RiskSubControl from "./risk-sub-control/RiskSubControl";

export default {
  name: "RiskControl",
  components: { RiskSubControl, ExpansionPanels },
  inject: {
    analysisMapData: {
      default: []
    }
  },
  data() {
    return {
      panelData: {
        label: "リスク",
        icon: "mdi-weather-lightning-rainy",
        iconColor: "black",
        selectedItem: {},
        items: []
      }
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
  watch: {
    selectedRisk(after, before) {
      if (before) {
        before.data = {
          baseDate: null,
          contents: [],
        };
      }
    }
  },
  created() {
    _.forEach(Risk, risk => {
      if (typeof risk === "object" && risk !== Risk.OBSERVATORY) {
        this.panelData.items.push({
          label: risk.string,
          value: risk
        });
      }
    });

    this.panelData.selectedItem = _.find(this.panelData.items, o => {
      return this.selectedRisk.type === o.value;
    });
  },
  methods: {
    callback(selectedItem) {
      const storeId = this.analysisMapData.storeId;
      this.$store.commit(rootMutations.UPDATE_SELECTED_RISK, {
        storeId,
        selectedRiskType: selectedItem? selectedItem.value : null
      });
    }
  }
};
</script>
<style>
.select-area .item {
  font-size: 15px !important;
  font-weight: normal;
  color: rgba(0,0,0,.6);
  font-family: Roboto,sans-serif;
}
</style>
<style lang="scss" scoped>
@import "../../../../common";

.risk-control {
  width: 170px;
}
.select-area {
  position: relative;
  font-size: 20px !important;
}
.risk-sub-control-area {
  position: absolute;
  top: 0;
  left: 100%;
}
</style>
