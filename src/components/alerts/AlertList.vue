<template>
  <div class="alert-warning">
    <v-container id="scroll-target">
      <v-btn
        class="mb-1 ml-4"
        x-small
        depressed
        :color="allowSound === true ? 'success' : null"
        @click="changeAllowSound()"
      >
        水防警報通知音 {{ allowSound ? "ON" : "OFF" }}
      </v-btn>
      <v-row no-gutters align="start" justify="center">
        <v-list width="100%">
          <v-list-item v-for="(item, i) in mixAlerts" :key="i" class="pb-1">
            <alert-report-notification
              v-if="item.isReportNotification === true"
              :info="item"
            ></alert-report-notification>
            <alert-list-item v-else :info="item"></alert-list-item>
          </v-list-item>
        </v-list>
      </v-row>
      <h5 v-if="mixAlerts.length === 0" class="pa-2 text-center message">
        注意報・警報情報はありません。
      </h5>
    </v-container>
  </div>
</template>

<script>
import _ from "lodash";
import moment from "moment";
import axios from "axios";
import AlertListItem from "./AlertListItem";
import AlertReportNotification from "./AlertReportNotification";

export default {
  name: "AlertList",
  components: { AlertListItem, AlertReportNotification },
  inject: {
    common: {
      default: [],
    },
  },
  props: {
    alerts: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      mixAlerts: [],
      timer: null,
      allowSound: false,
    };
  },
  computed: {
    notReadAlertCount() {
      if (!this.common.lastCheckedAlertDate) {
        return this.mixAlerts.length;
      }

      const notRead = _.filter(this.mixAlerts, (alert) => {
        return (
          this.common.lastCheckedAlertDate.diff(
            moment(alert.time, "YYYY/MM/DD HH:mm"),
            "minutes"
          ) <= 0
        );
      });

      return notRead.length;
    },
  },
  watch: {
    notReadAlertCount() {
      this.$parent.$emit("change", this.notReadAlertCount);
    },
    async alerts() {
      this.mixAlerts = this.alerts.concat();
      await this.fetchNotification();
    },
  },
  created() {
    this.mixAlerts = this.alerts.concat();

    // 水防警報等支援システムWEB通知
    setTimeout(async () => {
      clearInterval(this.timer);
      await this.fetchNotification();
      this.timer = setInterval(() => this.fetchNotification(), 60 * 1000);
    }, 3 * 1000);
  },
  mounted() {
    this.$nextTick(() => {
      this.$parent.$emit("change", this.notReadAlertCount);
    });
  },
  methods: {
    getUserId() {
      const jwt = require("jsonwebtoken");
      const token = this.$cookies.get("access_token");
      try {
        const info = jwt.verify(token, "gnm_pref_pass");
        if (info.user && info.user.userId) {
          return info.user.userId;
        }
      } catch (e) {
        //
      }
      return null;
    },
    async fetchNotification() {
      const suigaiSysId = this.getUserId();
      if (suigaiSysId === null) {
        return;
      }
      const params = {
        suigaiSysId: suigaiSysId,
        baseDate: this.common.baseDate.format("YYYY/MM/DD HH:mm"),
      };
      const res = await axios
        .create({
          baseURL:
            "https://t64pre4m81.execute-api.ap-northeast-1.amazonaws.com/prod",
          headers: { "x-api-key": "sFbc9GSf4f6n1PHOGZoHb9SWSkqOBhYpax8RTBOq" },
          responseType: "json",
        })
        .get("/api/notification/fetch", { params })
        .catch((err) => [err]);

      const notifications = res.data.notifications;
      if (notifications.length === 0) {
        return;
      }

      // 水防警報等支援システムの通知とJMAアラートを結合する
      const rows = this.alerts.concat();
      for (const n of notifications) {
        n.isReportNotification = true;
        const targetIndex = rows.findIndex((alert) => alert.time <= n.time);
        if (targetIndex === -1) {
          rows.push(n);
        } else {
          rows.splice(targetIndex, 0, n);
        }
      }
      this.mixAlerts = rows;

      // Sound
      const key = "reportNotificationTime";
      let lastTime = localStorage.getItem(key);
      if (lastTime === null) {
        lastTime = moment().local().add(-3, "hours").format("YYYY/MM/DD HH:mm");
        localStorage.setItem(key, lastTime);
      }
      if (notifications.length > 0) {
        const times = notifications.map((n) => n.time).sort();
        const latest = times[times.length - 1];
        if (latest > lastTime) {
          localStorage.setItem(key, latest);
          const days_ago = moment()
            .local()
            .add(-1, "days")
            .format("YYYY/MM/DD HH:mm");
          if (days_ago < latest) {
            this.playSound();
          }
        }
      }
    },
    async changeAllowSound() {
      this.allowSound = !this.allowSound;
      const ctx = new AudioContext();
      const source = ctx.createBufferSource();
      source.start();
      source.stop();
      source.disconnect();
      ctx.close();
    },
    playSound() {
      if (this.allowSound !== true) {
        return;
      }
      const ctx = new AudioContext();
      const source = ctx.createBufferSource();
      const gain = ctx.createGain();
      gain.gain.value = 0.3;
      source.connect(gain);
      gain.connect(ctx.destination);
      source.connect(ctx.destination);
      source.onended = function () {
        source.disconnect();
        ctx.close();
      };
      source.start(0);
      const url =
        "https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/sound/notification.mp3";
      axios
        .get(url, { responseType: "arraybuffer" })
        .then((response) => ctx.decodeAudioData(response.data))
        .then((buf) => (source.buffer = buf));
    },
  },
};
</script>
<style lang="scss"></style>
<style lang="scss" scoped>
.alert-warning {
  width: 100%;
  height: 100%;

  .theme--light.v-list {
    background-color: rgba(#ffffff, 0);
    padding: 0;
  }

  .v-list--two-line .v-list-item,
  .v-list-item--two-line {
    margin: 2px 0;
    background-color: rgba(#000000, 0.2);
  }

  .v-list--two-line .v-list-item.not-read,
  .v-list-item--two-line {
    margin: 2px 0;
    background-color: rgba(#0d47a1, 0.6);
  }

  .v-list-item .v-list-item__title {
    color: #ffffff;
    font-weight: bold;
  }

  .theme--light.v-list-item .v-list-item__subtitle {
    color: #ffffff;
    font-weight: normal;
  }

  .v-list-item__action-text {
    color: #ffffff;
    font-weight: bold;
  }

  .alert-title {
    color: white;
    > span {
      color: #fb8c00;
      font-size: 18px;
      margin: 0 5px;
    }
  }

  .scroll-container {
    height: 100%;
    overflow-y: auto;
  }
  #scroll-target {
    height: 100%;
    overflow-y: scroll;
    padding: 0;
  }
}
.message {
  color: rgba(0, 0, 0, 0.4);
}
</style>
