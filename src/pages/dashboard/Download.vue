<template>
  <div class="download">
    <div class="d-flex align-center pl-6 pr-4 toolbar">
      <h3>群馬県リアルタイム水害リスク情報システム</h3>
      <v-spacer></v-spacer>
      <v-btn small @click="close()">閉じる</v-btn>
    </div>

    <v-progress-linear
      v-if="isLoading"
      color="orange"
      indeterminate
    ></v-progress-linear>

    <v-card class="ma-8">
      <v-card-title>操作マニュアル</v-card-title>
      <div>
        <div>
          <v-btn
            class="font-weight-bold"
            color="deep-purple lighten-2"
            @click="manual('mobile')"
            text
            >モデル概要及びシステム操作説明資料（PDF）</v-btn
          >
        </div>
        <div>
          <v-btn
            class="font-weight-bold"
            color="deep-purple lighten-2"
            @click="manual('stage')"
            text
            >水防警報等支援システム操作説明資料（水位到達・水防警報編）（PDF）</v-btn
          >
        </div>
        <div>
          <v-btn
            class="font-weight-bold"
            color="deep-purple lighten-2"
            @click="manual('dam')"
            text
            >水防警報等支援システム操作説明資料（ダム放流通知編）（PDF）</v-btn
          >
        </div>
      </div>

      <v-divider class="my-5" />

      <v-card-title>システム説明動画</v-card-title>
      <div class="d-flex">
        <v-btn
          class="font-weight-bold"
          color="deep-purple lighten-2"
          href="https://youtu.be/POUpB56I9YU"
          target="blank"
          text
          >①群馬県リアルタイム水害リスク情報システム概要</v-btn
        >
      </div>
      <div class="d-flex">
        <v-btn
          class="font-weight-bold"
          color="deep-purple lighten-2"
          href="https://youtu.be/p5q-PkdwGrw"
          target="blank"
          text
          >②水位・浸水予測モデル説明</v-btn
        >
      </div>
      <div class="d-flex">
        <v-btn
          class="font-weight-bold"
          color="deep-purple lighten-2"
          href="https://youtu.be/TBknndOQN5w"
          target="blank"
          text
          >③システム操作マニュアル</v-btn
        >
      </div>
      <div class="d-flex">
        <v-btn
          class="font-weight-bold"
          color="deep-purple lighten-2"
          href="https://youtu.be/eky21Zm5H9U"
          target="blank"
          text
          >④水防警報等支援システム操作マニュアル（水位到達・水防警報編）</v-btn
        >
      </div>
      <div class="d-flex">
        <v-btn
          class="font-weight-bold"
          color="deep-purple lighten-2"
          href="https://youtu.be/h3GURiEN-64"
          target="blank"
          text
          >⑤水防警報等支援システム操作マニュアル（ダム放流通知編）</v-btn
        >
      </div>

      <v-divider class="my-5" />

      <v-card-title>過去データダウンロード</v-card-title>
      <v-card-text>
        <v-checkbox
          v-model="rain.checked"
          label="雨量"
          hide-details
          @click="bulkCheck(rain)"
        ></v-checkbox>
        <div class="d-flex ml-6">
          <v-checkbox
            v-for="kind in rain.kinds"
            :key="kind.num"
            v-model="kind.checked"
            :label="kind.label"
            :disabled="!rain.checked"
            class="mr-5"
          ></v-checkbox>
        </div>
        <v-checkbox
          v-model="water.checked"
          label="水位"
          hide-details
          @click="bulkCheck(water)"
        ></v-checkbox>
        <div class="d-flex ml-6">
          <v-checkbox
            v-for="kind in water.kinds"
            :key="kind.num"
            v-model="kind.checked"
            :label="kind.label"
            :disabled="!water.checked"
            class="mr-5"
          ></v-checkbox>
        </div>
        <div class="mt-2">期間入力</div>
        <v-card class="d-flex align-center ml-6" flat tile width="300">
          <v-select v-model="startMonth" :items="months"></v-select>
          <div class="mx-2">〜</div>
          <v-select v-model="endMonth" :items="months"></v-select>
        </v-card>
        <div>※ データダウンロード可能な期間は、2021年1月から前日まで</div>
      </v-card-text>
      <v-card-actions>
        <v-btn
          class="font-weight-bold"
          color="deep-purple lighten-2"
          text
          @click="csv()"
          >CSVダウンロード</v-btn
        >
      </v-card-actions>
    </v-card>
  </div>
</template>

<script>
import moment from "moment";
import axios from "axios";

export default {
  name: "Download",
  data() {
    return {
      rain: {
        checked: true,
        kinds: [
          { checked: true, num: "1_1", label: "国管理雨量観測所" },
          { checked: true, num: "1_2", label: "県管理雨量観測所" },
          { checked: true, num: "1_3", label: "気象庁管理雨量観測所" },
        ],
      },
      water: {
        checked: true,
        kinds: [
          { checked: true, num: "4_1", label: "国管理水位観測所" },
          { checked: true, num: "4_2", label: "県管理水位観測所" },
          { checked: true, num: "4_3", label: "県管理危機管理型水位計観測所" },
        ],
      },
      startMonth: null,
      endMonth: null,
      months: [],
      isLoading: false,
    };
  },
  mounted() {
    this.months = [];
    const latest = moment.utc().local();
    this.startMonth = latest.format("YYYY/MM");
    this.endMonth = latest.format("YYYY/MM");
    let target = "2021/01";
    while (target <= this.endMonth) {
      this.months.unshift(target);
      target = moment.utc(target, "YYYY/MM").add(1, "month").format("YYYY/MM");
    }
  },
  methods: {
    close() {
      window.close();
    },
    bulkCheck(obsType) {
      obsType.kinds.forEach((kind) => {
        kind.checked = obsType.checked;
      });
    },
    manual(type) {
      const url = `https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/docs/${type}-manual.pdf`;
      window.open(url);
    },
    async csv() {
      if (this.startMonth > this.endMonth) {
        const tmp = this.endMonth;
        this.endMonth = this.startMonth;
        this.startMonth = tmp;
      }
      const start = moment(`${this.startMonth}/01`, "YYYY/MM/DD");
      const end = moment(`${this.endMonth}/01`, "YYYY/MM/DD");
      if (end.diff(start, "months") >= 6) {
        this.$root.$emit("showSystemMessage", {
          message: "期間は6ヶ月以内になるように選択してください",
        });
        return;
      }
      const rainKinds = this.rain.kinds
        .filter((k) => k.checked === true)
        .map((k) => k.num);
      const waterKinds = this.water.kinds
        .filter((k) => k.checked === true)
        .map((k) => k.num);
      const type_kind = rainKinds.concat(waterKinds);
      if (type_kind.length === 0) {
        this.$root.$emit("showSystemMessage", {
          message: "観測所タイプを選択してください",
        });
        return;
      }
      const params = {
        start: Number(start.format("YYYYMM")),
        end: Number(end.format("YYYYMM")),
        type_kind: type_kind.join(","),
      };

      this.isLoading = true;
      const response = await axios
        .create({
          baseURL:
            "https://gcdnaj43fi.execute-api.ap-northeast-1.amazonaws.com/prod",
          responseType: "json",
        })
        .get("download/csv", { params });
      this.isLoading = false;

      if (response.data !== null && response.data.url) {
        const url = response.data.url;
        window.open(url);
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.toolbar {
  color: white;
  width: 100%;
  height: 40px;
  background-color: #3a1e87;
  box-shadow: 0 3px 1px -2px rgba(0, 0, 0, 0.2), 0 2px 2px 0 rgba(0, 0, 0, 0.14),
    0 1px 5px 0 rgba(0, 0, 0, 0.12);
}
.download {
  height: 100vh;
  overflow-y: scroll;
}
</style>
