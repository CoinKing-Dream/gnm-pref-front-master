<template>
  <div class="dashboard">
    <div class="toolbar pl-2">
      <v-row no-gutters align="center" class="full-height px-4">
        <h3>群馬県リアルタイム水害リスク情報システム(防災担当職員向け)</h3>
        <v-spacer></v-spacer>
        <v-col cols="auto" style="height: 100%">
          <h6 class="mt-4 mx-1">表示範囲：</h6>
        </v-col>
        <v-col cols="auto" class="mr-2">
          <link-menu dark @change="onChangeFilter"></link-menu>
        </v-col>
        <v-col cols="auto" class="mr-4">
          <div class="date-area text-center">
            <v-row no-gutters align="center" class="mx-2">
              <v-col cols="auto">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      text
                      x-small
                      v-bind="attrs"
                      v-on="on"
                      :color="'white'"
                      @click="changeDateToDemo"
                      >DEMO</v-btn
                    >
                  </template>
                  <span>デモ時刻に移動する</span>
                </v-tooltip>
              </v-col>
              <v-col cols="auto">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      text
                      x-small
                      v-bind="attrs"
                      v-on="on"
                      :color="'white'"
                      @click="changeDateToCurrentDate()"
                      >NOW</v-btn
                    >
                  </template>
                  <span>最新に更新する</span>
                </v-tooltip>
              </v-col>
              <v-col>
                <VueCtkDateTimePicker
                  v-model="calendarDate"
                  :no-value-to-custom-elem="true"
                  format="YYYY/MM/DD HH:mm"
                  formatted="YYYY/MM/DD HH:mm"
                  output-format="YYYY-MM-DD HH:mm"
                  :overlay="true"
                  :no-header="true"
                  locale="ja"
                  size="sm"
                  right
                  noLabel
                  noClearButton
                  no-button-now
                  @validate="applyCalendarDate()"
                  color="#3a1e87"
                >
                  <v-btn text dark small block color="warning">{{
                    baseDate.local().format("YYYY/MM/DD HH:mm")
                  }}</v-btn>
                </VueCtkDateTimePicker>
              </v-col>
              <v-col cols="auto">
                <v-tooltip bottom>
                  <template v-slot:activator="{ on, attrs }">
                    <v-btn
                      text
                      x-small
                      v-bind="attrs"
                      v-on="on"
                      :color="isAutoUpdate() ? 'success' : 'error'"
                      @click="isAutoUpdate() ? stopAutoUpdate() : autoUpdate()"
                    >
                      {{ isAutoUpdate() ? "ON" : "OFF" }}
                    </v-btn>
                  </template>
                  <span>自動更新 on/off</span>
                </v-tooltip>
              </v-col>
            </v-row>
          </div>
        </v-col>
        <v-col cols="auto" class="links">
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon :href="`https://gunma-suibou.jp/`" target="_blank">
                <v-icon color="white" v-bind="attrs" v-on="on">
                  mdi-account-supervisor-circle
                </v-icon>
              </v-btn>
            </template>
            <span>水防警報支援システム(県職員)</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon @click="openManual">
                <v-icon color="white" v-bind="attrs" v-on="on">
                  mdi-book-open-variant
                </v-icon>
              </v-btn>
            </template>
            <span>解説書</span>
          </v-tooltip>
          <v-tooltip bottom>
            <template v-slot:activator="{ on, attrs }">
              <v-btn icon @click="dialog = true">
                <v-icon color="white" v-bind="attrs" v-on="on">
                  mdi-cog
                </v-icon>
              </v-btn>
            </template>
            <span>各種設定</span>
          </v-tooltip>
        </v-col>
      </v-row>
    </div>
    <v-row no-gutters align="stretch" class="full-height">
      <v-col class="risks-panel">
        <div class="river-level-monitor-area pa-4 pr-2">
          <v-card class="full-height">
            <h4
              class="pt-2 px-4 pb-1"
              style="font-weight: bold; color: rgba(0, 0, 0, 0.7);"
            >
              観測情報
            </h4>
            <observatories-monitor
              :base-date="baseDate"
              :link-type="linkType"
              :filter-item="filterItem"
              :filtered-ob-ids="filteredObIds"
            ></observatories-monitor>
          </v-card>
        </div>
      </v-col>
      <v-col cols="auto" class="alert-panel pa-4 pl-2" style="width: 350px;">
        <v-card color="white">
          <h4 class="alert-panel-title pt-2 px-4 pb-1">
            警報情報
            <a
              href="https://www.jma.go.jp/bosai/"
              target="_blank"
              style="font-size: 12px;"
              >(気象庁防災情報)</a
            >
          </h4>
          <div class="alert-warning-area" :class="{ small: !!sysMsg }">
            <div class="tab-items">
              <template v-if="tab === 'alert'">
                <alert :base-date="baseDate" :link-type="linkType" :filter-item="filterItem"></alert>
              </template>
            </div>
          </div>
        </v-card>
        <v-card v-if="sysMsg" class="news mt-4">
          <h4 class="news-title pt-2 px-4 pb-0">お知らせ</h4>
          <div class="news-contents pa-4 pt-2" v-html="sysMsg"></div>
        </v-card>
      </v-col>
    </v-row>
    <v-dialog
      v-model="dialog"
      fullscreen
      hide-overlay
      transition="dialog-bottom-transition"
    >
      <v-card>
        <settings @close-dialog="closeDialog"></settings>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
import moment from "moment";

import ObservatoriesMonitor from "./ObservatoriesMonitor";
import Settings from "./settings/Settings";
import VueCtkDateTimePicker from "vue-ctk-date-time-picker";

import axios from "axios";
import LinkMenu from "@/components/LinkMenu";
import Alert from "@/components/alerts/Alert";
import {get} from "@/axios/apiAxios";
import conf from "@/config";

export default {
  name: "Dashboard",
  components: {
    Alert,
    LinkMenu,
    ObservatoriesMonitor,
    Settings,
    VueCtkDateTimePicker,
  },
  data() {
    return {
      sysMsg: null,
      dialog: false,
      tab: "alert",
      baseDate: moment(),
      autoUpdateInterval: null,
      subWindow: null,
      calendarDate: moment().format("YYYY/MM/DD HH:mm"),
      filterItem: null,
      linkType: null,
      filteredObIds: null
    };
  },
  async created() {
    window.name = "gnm-dashboard";

    this.linkType = "user";
    this.filterItem = this.$cookies.get("userId") || "0S0100";
    this.filteredObIds = await this.loadObIds(this.filterItem, this.linkType);
  },
  mounted() {
    this.autoUpdate();
  },
  methods: {
    to(path, mapInfo) {
      const target = "gnm-sub";
      const subWindow = window.open("", target, "", true);
      const pastHref = subWindow.location.href;
      let url = `${window.location.origin}/index.html#/${path}`;
      if (path === "analysis") {
        url = `${window.location.origin}/index.html#/${path}?tile=${
          mapInfo.baseTile.index
        }&risk=${mapInfo.risk.index}&baseDate=${this.baseDate.format("X")}`;
      }

      if (pastHref !== "about:blank") {
        subWindow.close();
        window.open(url, target, "", true);
      } else {
        subWindow.location.href = url;
      }
    },
    openManual() {
      const url = `${window.location.href}download`;
      window.open(url);
    },
    autoUpdate() {
      this.changeDateToCurrentDate();
      this.loadServiceStatusJson();
      this.autoUpdateInterval = setInterval(() => {
        this.changeDateToCurrentDate();
        this.loadServiceStatusJson();
      }, 1000 * 60 * 5);
    },
    stopAutoUpdate() {
      clearInterval(this.autoUpdateInterval);
      this.autoUpdateInterval = null;
    },
    applyCalendarDate() {
      this.baseDate = moment(this.calendarDate, "YYYY/MM/DD HH:mm");
    },
    changeDateToDemo() {
      this.stopAutoUpdate();
      this.updateBaseDate(moment("2019/10/12 00:00", "YYYY/MM/DD HH:mm"));
    },
    changeDateToCurrentDate() {
      this.updateBaseDate(moment());
    },
    updateBaseDate(date) {
      this.calendarDate = date;
      this.baseDate = date;
    },
    async loadServiceStatusJson() {
      return axios
        .create({
          responseType: "json",
        })
        .get(
          "https://s3-ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/system/sys_msg.json",
          {
            params: {
              ts: moment().unix(),
            },
          }
        )
        .then((response) => {
          if (response.data && response.data.html) {
            this.sysMsg = response.data.html;
          } else {
            this.sysMsg = null;
          }
        })
        .catch((err) => {
          this.sysMsg = null;
          return err;
        });
    },
    async loadObIds(filterId, type) {
      const path = `/api/${type}/observatories`;
      const [err, list] = await get(conf.apiServer.url, path, { id: filterId });
      if (err) {
        throw new Error("load failed : " + path);
      }

      return list
    },
    isAutoUpdate() {
      return !!this.autoUpdateInterval;
    },
    onChangeFilter(changed) {
      this.linkType = changed.linkType;
      this.filterItem = changed.filterItem;
      this.filteredObIds = changed.filteredObIds;
    },
    async closeDialog() {
      this.dialog = false;
      if (this.linkType === "user") {
        this.filteredObIds = await this.loadObIds(this.filterItem, this.linkType);
      }
      this.changeDateToCurrentDate();
    },
  },
};
</script>
<style lang="scss">
button,
input,
select,
textarea {
  background-color: transparent;
  border-style: none;
  color: inherit;
}

.date-time-picker .time-picker-overlay {
  z-index: 999 !important;
}
</style>
<style lang="scss" scoped>
@import "../../common";

.dashboard {
  width: 100vw;
  height: 100vh;
  background-color: #eeeeee;
  color: white;
  .toolbar {
    position: absolute;
    width: 100%;
    height: 40px;
    background-color: #3a1e87;
    box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2),
      0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12);
    .links {
    }

    .date-area {
      position: relative;
      background-color: rgba(0, 0, 0, 0.2);
      border-radius: 15px;
      width: 310px;

      .vdatetime {
        font-size: 14px;
      }

      .date {
        color: white;
        font-weight: bold;
        font-size: 15px;
      }

      .active {
        background-color: #0d47a1;
        color: white !important;
      }
    }
  }

  .sub-title {
    font-size: 12px;
    color: rgba(0, 0, 0, 0.5);
  }
  .risks-panel {
    margin-top: 40px;
    height: calc(100% - 40px);

    .buttons {
      position: absolute;
      top: 0;
      right: 0;
      z-index: 500;
    }
    .river-level-monitor-area {
      height: calc(100vh - 40px - 4px);
    }
    .map-list-area {
      height: calc(100vh - 40px - 60vh);
      .map-area {
        height: calc((100vh - 40px - 60vh) - 20px);
      }
    }
    .map-list-area.system-message {
      height: calc(95vh - 40px - 60vh);
      .map-area {
        height: calc((95vh - 40px - 60vh) - 20px);
      }
    }
    .system-message-area {
      height: 5vh;
      background-color: #ff9800;
      color: black;
      font-weight: bold;
      text-align: center;
      font-size: 25px;
    }
  }
  .map-card {
    position: relative;
    .map-transition {
      height: 100%;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 2000;
      background-color: rgba(black, 0.4);
    }
  }

  .info-area {
    cursor: pointer;
    position: absolute;
    bottom: 0;
    z-index: 500;
    width: 100%;
    padding: 5px 10px;
    background-color: rgba(0, 0, 0, 0.6);
    color: #f5f5f5;
    font-size: 1.2rem !important;
    font-family: "ヒラギノ角ゴ ProN", "Hiragino Kaku Gothic ProN", "游ゴシック",
      "游ゴシック体", YuGothic, "Yu Gothic", "メイリオ", Meiryo, "ＭＳ ゴシック",
      "MS Gothic", HiraKakuProN-W3, "TakaoExゴシック", TakaoExGothic,
      "MotoyaLCedar", "Droid Sans Japanese", sans-serif;
    .detail-button {
      font-size: 12px;
      color: orange;
      text-align: right;
      font-weight: bold;
    }
  }

  .alert-panel {
    margin-top: 40px;
    .alert-panel-title {
      font-weight: bold;
      color: rgba(0, 0, 0, 0.7);
    }
    .alert-warning-area {
      height: calc(100vh - 131px);
    }
    .alert-warning-area.small {
      width: 100%;
      height: calc(100vh - 112px - 200px);
    }

    .tabs {
      text-align: center;
      .orange-text {
        color: #fb8c00;
        font-size: 15px;
        font-weight: bold;
        margin: 0 3px;
      }
      .white-text {
        color: white;
        font-size: 12px;
      }
    }
    .tab-items {
      height: calc(100% - 20px);
    }

    .news {
      ::-webkit-scrollbar {
        display: none;
      }
      height: calc(200px - 16px);
      .news-title {
        background-color: #3a1e87;
        font-weight: bold;
        color: white;
      }
      .news-contents {
        height: calc(100% - 54px);
        overflow-y: scroll;
        background-color: white;
      }
    }
  }
}
.full-height {
  height: 100%;
}
.half-height {
  height: 50%;
}
</style>
<style lang="scss">
@import "../../common";

.vdatetime-input {
  text-align: center;
}
.vdatetime-popup {
  z-index: 2000 !important;
}
.vdatetime-time-picker__item {
  font-size: 20px;
}
</style>
