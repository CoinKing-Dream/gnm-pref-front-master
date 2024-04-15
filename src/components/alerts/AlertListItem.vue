<template>
  <v-card
    outlined
    class="alert-card"
    @click="showAlert()"
    :style="{backgroundColor: 'rgba(0,0,0,0.1)'}"
  >
    <v-card-text>
      <v-row
        no-gutters
        v-if="!info.category || (info.category && info.category !== 'release')"
      >
        <v-col>
          <v-chip x-small dark :color="info.color" v-if="!info.alert_levels">
            {{ info.level }}
          </v-chip>
          <template v-for="(level, index) in info.alert_levels">
            <v-chip x-small dark :key="index" :color="getLevelColor(info, level)">
              {{ getLevelName(info, level) }}
            </v-chip>
          </template>
        </v-col>
        <v-col v-if="info.read === 'true'" cols="auto">
          <v-icon color="red">mdi-new-box</v-icon>
        </v-col>
      </v-row>
      <div class="mt-1 alert-title">
        {{ info.title }}
      </div>
      <div class="alert-contents overline" v-if="info.area">
        {{ info.area }}
      </div>
      <div style="text-align: right;">
        <span class="time overline">
          {{ info.time }}
        </span>
      </div>
    </v-card-text>
  </v-card>
</template>

<script>
import moment from "moment";

export default {
  name: "AlertListItem",
  inject: {
    common: {
      default: []
    }
  },
  props: ["info"],
  data() {
    return {
      show: false,
      items: [],
      colors: ["red", "warning", "black"],
      names: ["警報", "注意報", "特別警報"],
    };
  },
  methods: {
    showAlert() {
      this.$root.$emit("showAlertDialog", { alert_info: this.$props.info });
    },
    isRead(time) {
      if (!this.common.lastCheckedAlertDate) {
        return false;
      }

      return this.common.lastCheckedAlertDate.diff(moment(time, 'YYYY/MM/DD HH:mm'), 'minutes') >= 0;
    },
    getLevelName(info, level) {
      if (info.title === "土砂災害警戒情報") {
        return "土砂災害警戒情報"
      } else {
        return this.names[level - 1]
      }
    },
    getLevelColor(info, level) {
      if (info.title === "土砂災害警戒情報") {
        return "#aa00aa"
      } else {
        return this.colors[level - 1]
      }
    }
  },
};
</script>

<style lang="scss" scoped>
.alert-card {
  width: 100%;
  border: none !important;
  border-bottom: 1px solid rgba(0,0,0,.12) !important;

  .alert-title {
    font-size: 1rem;
    color: black;
  }
  .alert-contents {
    color: black;
  }

  .time {
    color: rgba(black, 0.7);
  }

  .overline {
    line-height: 1rem;
    font-size: .625rem !important;
  }

  .v-card__subtitle, .v-card__text, .v-card__title {
    padding: 5px 10px;
  }
}

</style>
