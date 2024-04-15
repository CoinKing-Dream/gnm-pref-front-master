<template>
  <div class="city-setting pa-4">
    <div>
      <v-row no-gutters>
        <v-col>
          <h2>
            気象庁注意報・警報対象設定
            <span class="description">表示対象市町村を設定します<span class="red--text">（反映まで最大5分ほどかかります。）</span></span>
          </h2>
        </v-col>
      </v-row>
    </div>
    <div class="px-4">
      <v-row>
        <v-checkbox
          dense
          hide-details
          v-for="(city, i) in cities"
          v-model="city.link"
          :key="i"
          :label="city.name"
          :disabled="isLoading"
          class="mr-2"
          @change="onChangeLink(city)"
        ></v-checkbox>
      </v-row>
    </div>
  </div>
</template>

<script>
import { get, post } from "@/axios/apiAxios";
import conf from "@/config";
import _ from "lodash";

export default {
  name: "CitySetting",
  data() {
    return {
      isLoading: false,
      cities: null,
      linkedCities: [],
    };
  },
  async created() {
    this.isLoading = true;
    await this.loadCities();
    await this.loadUsersCities();
    this.isLoading = false;
  },
  methods: {
    async loadCities() {
      const path = "/api/cities";
      const [err, list] = await get(conf.apiServer.url, path);
      if (err) {
        throw new Error("load failed : " + path);
      }

      this.cities = list;
    },
    async loadUsersCities() {
      const path = "/api/userCityLink";
      const [err, response] = await get(conf.apiServer.url, path);
      if (err) {
        throw new Error("load failed : " + path);
      }

      if (response.cityList) {
        this.linkedCities = response.cityList;
      }
      if (this.linkedCities) {
        _.forEach(this.cities, (city) => {
          city.link = this.linkedCities.includes(city._id);
        });
      }
    },
    async updateUsersCities() {
      const path = "/api/userCityLink";
      const [err, response] = await post(conf.apiServer.url, path, {
        cityList: this.linkedCities
      });
      if (err) {
        throw new Error("load failed : " + path);
      }
    },
    async onChangeLink(city) {
      if (city.link) {
        this.linkedCities.push(city._id);
      } else {
        _.remove(this.linkedCities, (id) => {
          return id === city._id;
        });
      }

      this.isLoading = true;
      await this.updateUsersCities();
      this.isLoading = false;
    }
  },
};
</script>

<style scoped>
.v-input--selection-controls {
  margin: 0;
}
.description {
  font-size: 12px;
  color: #555555;
}
</style>
