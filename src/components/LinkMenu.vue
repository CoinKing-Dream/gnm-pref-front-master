<template>
  <div>
    <v-progress-circular
      v-if="isLoading"
      :size="20"
      indeterminate
      color="green"
      class="mr-2"
    ></v-progress-circular>
    <v-menu
      v-if="filterItems && filterItems.length > 0"
      offset-y
      max-height="300px"
    >
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          :dark="dark"
          depressed
          small
          v-bind="attrs"
          v-on="on"
          :color="backgroundColor"
          class="font-weight-bold mr-1"
        >
          <template v-if="selectedFilterItem">
            {{ selectedFilterItem.name }}
          </template>
          <template v-else>
            選択
          </template>
          <v-icon right>
            mdi-chevron-down
          </v-icon>
        </v-btn>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(o, i) in filterItems"
          :key="i"
          @click="onClickFilterItem(o)"
        >
          <v-list-item-title>{{ o.name }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu offset-y>
      <template v-slot:activator="{ on, attrs }">
        <v-tooltip left>
          <template v-slot:activator="{ on: onT, attrs: attrsT }">
            <v-btn
              :dark="dark"
              depressed
              small
              :color="backgroundColor"
              v-bind="attrsT"
              v-on="{ ...on, ...onT }"
              class="mr-2 font-weight-bold"
            >
              {{ selectedLinkType.title }}
              <v-icon right>
                mdi-chevron-down
              </v-icon>
            </v-btn>
          </template>
          <span>表示対象を選択します</span>
        </v-tooltip>
      </template>
      <v-list dense>
        <v-list-item
          v-for="(o, i) in linkTypes"
          :key="i"
          @click="onClickLinkType(o)"
        >
          <v-list-item-title>{{ o.title }}</v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script>
import _ from "lodash";
import { get } from "@/axios/apiAxios";
import conf from "@/config";
export default {
  name: "LinkMenu",
  props: {
    isLoading: {
      type: Boolean,
      require: false,
      default: false,
    },
    initValue: {
      type: Object,
      require: false,
      default: null,
    },
    dark: {
      type: Boolean,
      require: false,
      default: false,
    },
    allMode: {
      type: Boolean,
      require: false,
      default: false,
    },
    backgroundColor: {
      type: String,
      require: false,
      default: "rgba(255,255,255,0.1)",
    },
  },
  data() {
    return {
      linkTypes: [
        { title: "登録地点", key: "user" },
        { title: "市町村", key: "city" },
        { title: "土木事務所", key: "office" },
      ],
      selectedLinkType: null,
      filterItems: null,
      selectedFilterItem: null,
    };
  },
  async created() {
    if (this.allMode) {
      this.linkTypes.unshift({ title: "全体", key: "all" });
    }

    if (this.initValue) {
      this.selectedLinkType = _.find(this.linkTypes, {
        key: this.initValue.linkType,
      });
      if (this.selectedLinkType.key !== "user") {
        await this.loadFilter(this.selectedLinkType.key);
        this.selectedFilterItem = _.find(this.filterItems, {
          _id: parseInt(this.initValue.filterItem),
        });
      }
    } else {
      this.selectedLinkType = this.linkTypes[0];
    }
  },
  methods: {
    onClickLinkType(item) {
      this.selectedFilterItem = null;
      this.filterItems = null;

      this.selectedLinkType = item;
      if (
        this.selectedLinkType.key === "user" ||
        this.selectedLinkType.key === "all"
      ) {
        this.commit();
      } else {
        this.loadFilter(this.selectedLinkType.key);
      }
    },
    async loadFilter(type) {
      const path = this.getFilterUrl(type);
      const [err, list] = await get(conf.apiServer.url, path);
      if (err) {
        throw new Error("load failed : " + path);
      }
      this.filterItems = list;
    },
    async loadObIds(filterId, type) {
      const path = `/api/${type}/observatories`;
      const [err, list] = await get(conf.apiServer.url, path, { id: filterId });
      if (err) {
        throw new Error("load failed : " + path);
      }

      return list
    },
    getFilterUrl(type) {
      switch (type) {
        case "city":
          return "/api/cities";
        case "office":
          return "/api/offices";
        default:
          return null;
      }
    },
    onClickFilterItem(item) {
      this.selectedFilterItem = item;
      this.commit();
    },
    async commit() {
      let filterItem = this.selectedFilterItem;
      if (this.selectedLinkType.key === "user") {
        filterItem = {
          _id: this.$cookies.get("userId") || "0S0100",
        };
      } else if (this.selectedLinkType.key === "all") {
        filterItem = {
          _id: "all",
        };
      }

      let filteredObIds;
      if (this.selectedLinkType.key === "all") {
        filteredObIds = {};
      } else {
        filteredObIds = await this.loadObIds(
            filterItem._id,
            this.selectedLinkType.key
        );
      }

      this.$emit("change", {
        linkType: this.selectedLinkType.key,
        filterItem: filterItem._id,
        filteredObIds
      });
    },
  },
};
</script>

<style scoped></style>
