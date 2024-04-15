<template>
  <div class="observatory-settings pa-4">
    <div class="link-menu-area">
      <v-row no-gutters justify="center">
        <v-col>
          <h2>
            観測所設定
            <span class="description">TOP画面対象観測所を設定します</span>
          </h2>
        </v-col>
        <v-spacer></v-spacer>
        <v-col cols="auto" style="height: 100%;">
          <h5 class="mt-2 mx-1">表示範囲：</h5>
        </v-col>
        <v-col cols="auto">
          <link-menu
            background-color="rgba(0,0,0,0.1)"
            :all-mode="true"
            @change="onChangeFilter"
          ></link-menu>
        </v-col>
      </v-row>
    </div>
    <div>
      <template v-for="(set, key) in dataset">
        <v-row :key="`set-${key}`" no-gutters class="set mb-4">
          <v-col cols="4">
            <div style="height: 100%; min-height: 440px;">
              <l-map
                :ref="key"
                :zoom="commonMapSet.zoom"
                :center="commonMapSet.center"
              >
                <l-tile-layer
                  :url="commonMapSet.url"
                  :zoom="commonMapSet.zoom"
                  :attribution="commonMapSet.attribution"
                ></l-tile-layer>
                <template v-for="(ob, i) in set.obs">
                  <l-marker
                    :key="i"
                    :lat-lng="[ob.lat, ob.lng]"
                    @click="onClickMarker(set, ob)"
                  >
                    <l-icon
                      :icon-size="[20, 20]"
                      :icon-anchor="[10, 20]"
                      :tooltipAnchor="[10, -25]"
                      :icon-url="
                        require(`@/assets/images/observatory-icons/${
                          isLinkedOb(set.linkedIds, ob)
                            ? set.map.linked
                            : set.map.default
                        }`)
                      "
                    >
                    </l-icon>
                    <l-tooltip :options="{ direction: 'top' }">
                      {{ ob.name }}
                      {{ ob.riverName ? `(${ob.riverName})` : "" }}
                    </l-tooltip>
                  </l-marker>
                </template>
              </l-map>
            </div>
          </v-col>
          <v-col class="pa-4">
            <v-row no-gutters class="mb-2">
              <v-col>
                <h3>{{ set.table.title }}</h3>
              </v-col>
              <v-spacer></v-spacer>
              <v-col cols="auto">
                <v-text-field
                  v-model="set.table.search"
                  append-icon="mdi-magnify"
                  label="検索 (観測所名、住所)"
                  single-line
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
            <v-data-table
              v-if="set.table.items"
              dense
              :headers="set.table.headers"
              :items="set.table.items"
              :search="set.table.search"
              :page.sync="set.table.page"
              :loading="isLoading"
              @click:row="onClickRow"
            >
              <template v-slot:item.link="{ item }">
                <v-row no-gutters justify="center">
                  <v-checkbox
                    dense
                    hide-details
                    v-model="item.link"
                    :disabled="isLoading"
                    @change="onChangeLinkCheckbox(set, item)"
                  ></v-checkbox>
                </v-row>
              </template>
            </v-data-table>
          </v-col>
        </v-row>
        <div :key="`set-chips-${key}`" class="mb-4 pa-2 sort-setting-area">
          <v-row no-gutters align="center">
            <h4 class="mr-1">表示順番</h4>
            <v-btn
                v-if="!isSortModifyMode"
                small
                depressed
                @click="isSortModifyMode = true"
                icon
            >
              <v-icon>
                mdi-cog
              </v-icon>
            </v-btn>
            <v-btn
                v-else
                x-small
                depressed
                dark
                class="success ml-1"
                @click="onClickUpdate"
                :loading="isLoading"
            >
              確定
            </v-btn>
          </v-row>
          <div v-if="isSortModifyMode" style="font-size: 12px">
            ドラッグ＆ドロップで観測所の順番を変更できます。
          </div>
          <draggable
            v-model="set.linkedIds"
            ghost-class="ghost"
            :disabled="!isSortModifyMode"
            class="mt-2"
          >
            <v-chip
              v-for="(id, index) in set.linkedIds"
              :key="id"
              class="ma-1"
              :dark="!isSortModifyMode"
              :disabled="isLoading"
            >
              <v-avatar left small :class="isSortModifyMode? 'white':'black'">
                {{ index + 1 }}
              </v-avatar>
              {{ getName(id, set.type) }}
            </v-chip>
          </draggable>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import { get, post } from "@/axios/apiAxios";
import conf from "@/config";
import _ from "lodash";
import { Observatory } from "@/enums/Observatory";
import LinkMenu from "@/components/LinkMenu";
import { LMap, LTileLayer, LMarker, LIcon, LTooltip } from "vue2-leaflet";
import Draggable from "vuedraggable";

export default {
  name: "ObservatorySetting",
  components: {
    LinkMenu,
    LMap,
    LTileLayer,
    LMarker,
    LIcon,
    LTooltip,
    Draggable,
  },
  data() {
    return {
      linkType: null,
      filterItem: null,
      isLoading: true,
      commonMapSet: {
        url: "https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png",
        zoom: 11,
        center: [35.693825, 139.703356],
        attribution:
          '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">地理院タイル</a>',
      },
      obs: null,
      dataset: {
        river: {
          type: Observatory.RIVER_LEVEL,
          linkedIds: null,
          filterIds: null,
          obs: null,
          table: {
            title: "水位観測所",
            headers: [
              {
                text: "観測所",
                align: "left",
                sortable: true,
                value: "name",
              },
              {
                text: "河川名",
                align: "left",
                sortable: true,
                value: "riverName",
                width: "20%",
                filterable: false,
              },
              {
                text: "住所",
                align: "left",
                sortable: true,
                value: "address",
                width: "35%",
              },
              {
                text: "TOP表示",
                align: "center",
                sortable: true,
                value: "link",
                width: "15%",
                filterable: false,
              },
            ],
            search: "",
            page: 0,
            items: null,
          },
          map: {
            default: "stage-deficit.png",
            linked: "stage-standby.png",
          },
        },
        rain: {
          type: Observatory.RAIN,
          linkedIds: null,
          filterIds: null,
          obs: null,
          table: {
            title: "雨量観測所",
            headers: [
              {
                text: "観測所",
                align: "left",
                sortable: true,
                value: "name",
              },
              {
                text: "住所",
                align: "left",
                sortable: true,
                value: "address",
                width: "55%",
              },
              {
                text: "TOP表示",
                align: "center",
                sortable: true,
                value: "link",
                width: "15%",
                filterable: false,
              },
            ],
            search: "",
            page: 0,
            items: null,
          },
          map: {
            default: "rain-deficit.png",
            linked: "rain-1.png",
          },
        },
      },
      isSortModifyMode: false,
    };
  },
  async created() {
    await this.init();
  },
  methods: {
    async init() {
      this.isLoading = true;

      await this.loadObs();
      await this.loadLinkedObIds();
      this.setData();
      this.$nextTick(() => {
        this.initMap();
      });

      this.isLoading = false;
    },
    async reset() {
      this.isLoading = true;

      if (this.linkType !== "all") {
        await this.loadFilteredObs();
      }
      await this.loadLinkedObIds();
      this.setData();
      this.$nextTick(() => {
        this.initMap();
      });

      this.isLoading = false;
    },
    async loadObs() {
      const path = "/api/observatories";
      const [err, obs] = await get(conf.apiServer.url, path);
      if (err) {
        throw new Error("load failed : " + path);
      }

      this.obs = _.cloneDeep(obs);
    },
    async loadFilteredObs() {
      const parameters = {
        status: "not_forecast",
        id: this.filterItem,
      };

      const path = `/api/${this.linkType}/observatories`;
      const [err, response] = await get(conf.apiServer.url, path, parameters);
      if (err) {
        throw new Error("load failed : " + path);
      }

      this.dataset.river.filterIds = _.map(response.waterList, (o) => {
        return o._id;
      });
      this.dataset.rain.filterIds = _.map(response.rainList, (o) => {
        return o._id;
      });
    },
    async loadLinkedObIds() {
      const path = "/api/observatoryLink/get";
      const [err, response] = await get(conf.apiServer.url, path);
      if (err) {
        throw new Error("load failed : " + path);
      }

      this.dataset.river.linkedIds = response.waterList;
      this.dataset.rain.linkedIds = response.rainList;
    },
    async updateSettings() {
      const path = "/api/observatoryLink/set";
      const [err, response] = await post(conf.apiServer.url, path, {
        waterList: this.dataset.river.linkedIds,
        rainList: this.dataset.rain.linkedIds,
      });

      if (err) {
        throw new Error("load failed : " + path);
      }
    },
    setData() {
      _.forEach(this.dataset, (set) => {
        set.obs = _.filter(this.obs, (ob) => {
          if (set.filterIds) {
            return set.type.index === ob.type && set.filterIds.includes(ob._id);
          } else {
            return set.type.index === ob.type;
          }
        });
        _.forEach(set.obs, (ob) => {
          ob.link = set.linkedIds.includes(ob._id);
        });

        set.table.items = set.obs;
      });
    },
    initMap() {
      _.forEach(this.dataset, (set, key) => {
        const mapObject = this.$refs[key][0].mapObject;
        mapObject.invalidateSize();

        const tempObs = _.filter(set.obs, (ob) => {
          if (set.filterIds) {
            return (
              this.isLinkedOb(set.linkedIds, ob) &&
              set.filterIds.includes(ob._id)
            );
          } else {
            return this.isLinkedOb(set.linkedIds, ob);
          }
        });
        const bounds = _.map(tempObs, (ob) => {
          return [ob.lat, ob.lng];
        });

        if (bounds && bounds.length > 0) {
          mapObject.fitBounds(bounds);
        }
      });
    },
    async onChangeLinkCheckbox(set, ob) {
      if (ob.link) {
        set.linkedIds.push(ob._id);
      } else {
        _.remove(set.linkedIds, (id) => {
          return id === ob._id;
        });
      }

      this.isLoading = true;
      await this.updateSettings();
      this.isLoading = false;
    },
    onClickRow(ob) {
      const key = _.findKey(this.dataset, (set) => {
        return ob.type === set.type.index;
      });
      this.$refs[key][0].mapObject.panTo([ob.lat, ob.lng]);
    },
    async onClickMarker(set, ob) {
      ob.link = !ob.link;

      if (ob.link) {
        set.linkedIds.push(ob._id);
      } else {
        _.remove(set.linkedIds, (id) => {
          return id === ob._id;
        });
      }

      this.isLoading = true;
      await this.updateSettings();
      this.isLoading = false;
    },
    isLinkedOb(linkedIds, ob) {
      return linkedIds.includes(ob._id);
    },
    onChangeFilter(changed) {
      this.linkType = changed.linkType;
      this.filterItem = changed.filterItem;

      if (this.linkType === "all") {
        this.dataset.river.filterIds = null;
        this.dataset.rain.filterIds = null;
      }

      this.reset();
    },
    getName(id, type) {
      return _.find(this.obs, { _id: id, type: type.index }).name;
    },
    async onClickUpdate() {
      this.isLoading = true;
      await this.updateSettings();
      this.isLoading = false;
      this.isSortModifyMode = false;
    },
  },
};
</script>
<style lang="scss">
.observatory-settings {
  table td:hover {
    cursor: pointer;
  }
}
</style>
<style scoped>
.link-menu-area {
}
.description {
  font-size: 12px;
  color: #555555;
}
.v-input--selection-controls {
  margin: 0;
  padding-top: 0;
}
.set {
  border: 1px solid #eeeeee;
}
.ghost {
  opacity: 0.5;
  background: #c8ebfb;
}
.sort-setting-area {
  background-color: whitesmoke;
}
</style>
