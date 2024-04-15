<template>
  <v-card outlined class="alert-report-notification">
    <v-chip x-small :color="info.mode === 'practice' ? '#7d7d7d' : '#86529e'" dark>
      {{info.mode === 'practice' ? '演習' : '正規' }}
    </v-chip>
    <div class="d-flex align-center">
      <div class="subtitle-1">{{ info.title }}</div>
    </div>
    <div class="alert-message">{{ info.observatory }}</div>
    <div class="alert-message red--text text--darken-1" v-if="!info.received">受信確認を送信元にお知らせ下さい。</div>
    <div>
      <v-btn x-small @click="showPdf()" class="mr-2">PDF確認</v-btn>
      <v-btn x-small @click="received()" v-if="!info.received">受信確認送信</v-btn>
    </div>
    <div class="alert-time overline">{{ info.time }}</div>

    <v-dialog
      v-model="dialog"
      width="340"
      style="z-index: 6000"
    >
      <v-card>
        <v-card-title class="subtitle-2 grey lighten-2">
          {{ info.title }}
        </v-card-title>
        <v-card class="ma-5" tile flat>
          <div class="body-2">{{ message }}</div>
        </v-card>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn small color="primary" text @click="dialog = false">CLOSE</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-card>
</template>

<script>
import axios from "axios"
export default {
  name: "AlertReportNotification",
  props: ["info"],
  data() {
    return {
      dialog: false,
      message: ""
    }
  },
  methods: {
    async received() {
      const params = {
        suigaiSysId: this.info.suigaiSysId,
        timestamp: this.info.timestamp
      }
      const res = await axios
        .create({
          baseURL: "https://t64pre4m81.execute-api.ap-northeast-1.amazonaws.com/prod",
          headers: { "x-api-key": "sFbc9GSf4f6n1PHOGZoHb9SWSkqOBhYpax8RTBOq" },
          responseType: "json"
        })
        .post("/api/notification/received", params)
        .catch(err => [err]);
      
      if (res.data !== null && res.data.received === true) {
        this.message = 'WEB通知の受信確認を送信しました。';
        this.info.received = true;
      } else {
        this.message = '受信確認の送信に失敗しました。';
      }
      this.dialog = true;
    },
    showPdf() {
      window.open(this.info.url, "_blank");
    }
  }
};
</script>

<style lang="scss" scoped>
.alert-report-notification {
  width: 100%;
  padding: 6px 10px 0 10px;
  background-color: rgba(0,0,0,0.1);
  border: none !important;
  border-bottom: 1px solid rgba(0,0,0,.12) !important;
  .alert-message {
    line-height: 1rem;
    font-size: 0.6rem;
  }
  .alert-time {
    line-height: 1.8rem;
    text-align: right;
    font-size: 0.6rem !important;
    color: rgba(black, 0.7);
  }
}
</style>
