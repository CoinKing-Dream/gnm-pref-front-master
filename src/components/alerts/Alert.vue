<template>
  <div class="alert">
    <alert-list :alerts="alerts"></alert-list>
  </div>
</template>

<script>
import io from "socket.io-client";
import conf from "../../config";
import moment from "moment";
import { get } from "../../axios/apiAxios";
import AlertList from "@/components/alerts/AlertList";

export default {
  name: "Alert",
  components: { AlertList },
  props: {
    baseDate: {
      type: Object,
      required: true,
    },
    linkType: {
      type: [String, Number],
      require: true,
    },
    filterItem: {
      type: [String, Number],
      require: true,
    },
  },
  provide() {
    const common = {};
    Object.defineProperty(common, "baseDate", {
      enumerable: true,
      get: () => this.baseDate,
    });
    Object.defineProperty(common, "lastCheckedAlertDate", {
      enumerable: true,
      get: () => this.lastCheckedAlertDate,
    });
    return { common };
  },
  data() {
    return {
      socket: null,
      alerts: [],
      lastCheckedAlertDate: null,
    };
  },
  watch: {
    async baseDate(after, before) {
      if (!before.isSame(after)) {
        await this.loadAlerts();
      }

      const current = moment();
      const diff = current.diff(this.baseDate, "minutes");
      if (diff >= 10) {
        this.stopListening();
      } else {
        this.startListening();
      }
    },
    async filterItem() {
      await this.loadAlerts();
    },
  },
  async created() {
    this.socket = io(conf.apiServer.url, {
      query: {
        access_token: this.$cookies.get("access_token"),
        transports: ["websocket", "polling"]
      },
      // transportOptions: {
      //   polling: {
      //     extraHeaders: {
      //       Accept: "application/json",
      //     },
      //   },
      // },
    });

    const temp = localStorage.getItem("lastCheckedAlertDate");
    this.lastCheckedAlertDate = temp
      ? moment(temp, "YYYY/MM/DD HH:mm")
      : moment();
  },
  beforeDestroy() {
    this.stopListening();
  },
  methods: {
    async loadAlerts() {
      const path = "/api/delivered-alerts";
      const paramDate = this.round(
          this.baseDate,
          moment.duration(5, "minutes"),
          "floor"
      );
      const params = {
        date: paramDate.clone().utc().format("YYYY/MM/DD HH:mm"),
      };
      if (this.linkType && this.linkType !== "user") {
        params.mode = this.linkType;
        params.id = this.filterItem;
      }
      const [err, responseData] = await get(conf.apiServer.url, path, params);
      if (err || !responseData.alerts) {
        throw new Error("load failed : " + path);
      }

      const alerts = responseData.alerts;
      const temp = [];
      alerts.forEach((info) => {
        if (
          info.title === "東京都気象警報・注意報" ||
          info.title === "土砂災害警戒情報"
        ) {
          // VPWW54
          temp.push(this.localizationAlertAnnounceData(info));
        } else {
          temp.push(this.localizationAlertChangeData(info));
        }
      });

      this.alerts = temp;
    },
    startListening() {
      // socket event listener
      this.socket.on("alertChange", (data) => {
        const addData = [];

        data.forEach((info) => {
          info._id = info.time;
          addData.push(this.localizationAlertChangeData(info));
        });

        this.alerts = addData.concat(this.alerts);
      });

      this.socket.on("alertAnnounce", (data) => {
        const addData = [];
        const announcement = data.announcement;
        // const release = data.release;

        announcement.forEach((info) => {
          info._id = data.time;
          info.text = data.text;
          addData.push(this.localizationAlertAnnounceData(info));
        });

        this.alerts = addData.concat(this.alerts);
      });
    },
    stopListening() {
      this.socket.removeAllListeners();
    },
    localizationAlertAnnounceData(info) {
      return {
        time: moment
          .utc(info._id, "YYYY/MM/DD HH:mm")
          .local()
          .format("YYYY/MM/DD HH:mm"),
        alert_levels: info.alert_levels.filter((x, i, self) => {
          return self.indexOf(x) === i;
        }),
        title: info.alert_names.join(","),
        area: info.area_names.join(","),
        text: info.text,
        read: false,
        category: info.category,
      };
    },
    localizationAlertChangeData(info) {
      return {
        title: info.title,
        type: info.type,
        level: info.level,
        text: info.text,
        comment: info.comment,
        time: moment
          .utc(info._id, "YYYY/MM/DD HH:mm")
          .local()
          .format("YYYY/MM/DD HH:mm"),
        read: false,
      };
    },
    updateLastCheckedAlertDate(date) {
      this.lastCheckedAlertDate = date;
      localStorage.setItem(
        "lastCheckedAlertDate",
        date.format("YYYY/MM/DD HH:mm")
      );
    },
    round(date, duration, method) {
      return moment(Math[method](+date / +duration) * +duration);
    },
  },
};
</script>

<style scoped>
.message {
  color: rgba(0,0,0, 0.4);
}
.alert {
  height: 100%;
}
</style>
