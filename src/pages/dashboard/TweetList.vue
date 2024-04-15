<template>
  <div class="tweet-list">
    <div class="scroll-container px-3">
      <v-card
        tile
        dark
        v-for="(tweet,i) in tweets"
        :key="i"
        class="mx-auto my-2"
        color="rgba(255,255,255,0.1)"
        :href="tweet.tweetUrl"
        target="_blank"
      >
        <v-list-item>
          <v-list-item-avatar color="grey">
            <img :src="tweet.thumbnailUrl" />
          </v-list-item-avatar>
          <v-list-item-content>
            <v-list-item-title>{{ tweet.displayName }}</v-list-item-title>
            <v-list-item-subtitle class="user-id-area"
              >@{{ tweet.userId }}</v-list-item-subtitle
            >
          </v-list-item-content>
          <v-list-item-icon>
            <v-icon small color="#2b7bb9">mdi-twitter</v-icon>
          </v-list-item-icon>
        </v-list-item>
        <v-card-text class="contents-area">
          {{ tweet.tweetText }}
        </v-card-text>
        <v-divider class="mx-4"></v-divider>
        <div class="date-area overline px-4 py-2">
          {{ stringDateToLocalMoment(tweet.tweetTime) }}
        </div>
      </v-card>
    </div>
  </div>
</template>

<script>
import config from "../../config";
import moment from "moment";
import { get } from "../../axios/apiAxios";

export default {
  name: "TweetList",
  props: {
    baseDate: {
      type: Object,
      require: false,
      default: () => moment(),
    },
    autoUpdate: {
      type: Boolean,
      require: false,
      default: true,
    },
  },
  data() {
    return {
      tweets: [],
      autoUpdateInterval: null,
    };
  },
  watch: {
    autoUpdate() {
      if (this.autoUpdate) {
        this.startAutoUpdate();
      } else {
        this.stopAutoUpdate();
      }
    },
    baseDate() {
      this.loadTweet();
    },
  },
  mounted() {
    this.loadTweet();
    this.startAutoUpdate();
  },
  beforeDestroy() {
    this.stopAutoUpdate();
  },
  methods: {
    loadTweet() {
      get(config.apiServer.url, "/api/flood-tweet", {
        date: this.baseDate.clone().utc().format("YYYY/MM/DD HH:mm"),
        limit: 100,
      }).then(([err, responseData]) => {
        this.tweets = responseData.tweets;
      });
    },
    stringDateToLocalMoment(string) {
      return moment
        .utc(string, "YYYY/MM/DD HH:mm")
        .local()
        .format("YYYY/MM/DD HH:mm");
    },
    startAutoUpdate() {
      this.autoUpdateInterval = setInterval(() => {
        this.loadTweet();
      }, 1000 * 60 * 5);
    },
    stopAutoUpdate() {
      clearInterval(this.autoUpdateInterval);
    },
  },
};
</script>

<style lang="scss" scoped>
.tweet-list {
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  .user-id-area {
    color: #00b0ff;
  }
  .contents-area {
    color: white;
  }
  .date-area {
    color: rgba(255, 255, 255, 0.7);
    text-align: right;
  }
}
</style>
