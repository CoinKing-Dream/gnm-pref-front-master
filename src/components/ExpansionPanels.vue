<template>
  <div class="expansion-panels">
    <v-expansion-panels v-model="displayedPanelList" focusable accordion>
      <v-expansion-panel
        v-for="(itemGroup, groupIndex) in data"
        :key="groupIndex"
      >
        <template v-if="multipleSelect">
          <v-expansion-panel-header
            disable-icon-rotate
            :style="{ backgroundColor: backgroundColor }"
          >
            {{ itemGroup.label }}
            <template v-slot:actions v-if="itemGroup.selectedItems.length > 0">
              <v-avatar size="20" color="red">
                <span class="white--text"
                  >{{ itemGroup.selectedItems.length }}
                </span>
              </v-avatar>
            </template>
          </v-expansion-panel-header>
        </template>
        <template v-else>
          <v-expansion-panel-header
            disable-icon-rotate
            :style="{ backgroundColor: backgroundColor }"
          >
            <div>
              {{ itemGroup.selectedItem ? itemGroup.selectedItem.label : itemGroup.label }}
            </div>
            <template v-if="showIcon" v-slot:actions>
              <v-icon :color="itemGroup.iconColor">{{ itemGroup.icon }}</v-icon>
            </template>
          </v-expansion-panel-header>
        </template>

        <v-expansion-panel-content>
          <template v-if="itemGroup.subGroups">
            <template v-for="(subGroup, subGroupIndex) in itemGroup.subGroups">
              <v-expansion-panels
                v-if="subGroup.items"
                :key="subGroupIndex"
                class="sub-group"
                flat
              >
                <v-expansion-panel>
                  <v-expansion-panel-header disable-icon-rotate>
                    {{ subGroup.label }}
                    <template v-slot:actions>
                      <v-icon small>mdi-dots-vertical</v-icon>
                    </template>
                  </v-expansion-panel-header>
                  <v-expansion-panel-content>
                    <div
                      v-for="(item, itemIndex) in subGroup.items"
                      :key="itemIndex"
                      class="item"
                      :class="{
                        visible:
                          (itemGroup.selectedItems &&
                            itemGroup.selectedItems.includes(item)) ||
                          itemGroup.selectedItem === item,
                      }"
                      @click="updateItem(itemGroup, item)"
                    >
                      <span style="white-space: pre-line;">{{
                        item.label
                      }}</span>
                    </div>
                  </v-expansion-panel-content>
                </v-expansion-panel>
              </v-expansion-panels>
              <div
                v-else
                :key="subGroupIndex"
                class="item"
                :class="{
                  visible:
                    (itemGroup.selectedItems &&
                      itemGroup.selectedItems.includes(subGroup.item)) ||
                    itemGroup.selectedItem === subGroup.item,
                }"
                @click="updateItem(itemGroup, subGroup.item)"
              >
                <span style="white-space: pre-line;">{{
                  subGroup.item.label
                }}</span>
              </div>
            </template>
          </template>
          <template v-else>
            <div
              v-for="(item, itemIndex) in itemGroup.items"
              :key="itemIndex"
              class="item"
              :class="{
                visible:
                  (itemGroup.selectedItems &&
                    itemGroup.selectedItems.includes(item)) ||
                  itemGroup.selectedItem === item,
              }"
              @click="updateItem(itemGroup, item)"
            >
              <span style="white-space: pre-line;">{{ item.label }}</span>
            </div>
          </template>
        </v-expansion-panel-content>
      </v-expansion-panel>
    </v-expansion-panels>
  </div>
</template>

<script>
export default {
  name: "ExpansionPanels",
  props: {
    data: {
      type: Array,
      require: true,
      default: () => [
        {
          label: "",
          icon: "",
          iconColor: "primary",
          selectedItems: [],
          items: [{ label: "", visible: false }],
        },
      ],
    },
    multipleSelect: {
      type: Boolean,
      require: true,
      default: false,
    },
    backgroundColor: {
      type: String,
      require: false,
      default: "#ffffff",
    },
    defaultOpen: {
      type: Number,
      require: false,
    },
    showIcon: {
      type: Boolean,
      require: false,
      default: true,
    },
  },
  data() {
    return {
      displayedPanelList: [],
      changed: null,
    };
  },
  created() {
    this.displayedPanelList =
      typeof this.defaultOpen === "undefined" ? [] : this.defaultOpen;

    if (this.multipleSelect === false) {
      this.data.forEach((itemGroup) => {
        if (itemGroup.selectedItem == null) {
          itemGroup.selectedItem = itemGroup.items[0];
        }
        this.$emit("change", itemGroup.selectedItem);
      });
    }
  },
  methods: {
    updateItem(itemGroup, item) {
      if (this.multipleSelect === false) {
        this.updateSingleItem(itemGroup, item);
      } else {
        this.updateMultipleItem(itemGroup, item);
      }
      this.$emit("change", this.changed);
    },
    updateSingleItem(itemGroup, item) {
      itemGroup.selectedItem = itemGroup.selectedItem === item ? null : item;
      this.changed = itemGroup.selectedItem;
    },
    updateMultipleItem(itemGroup, item) {
      if (itemGroup.selectedItems.includes(item)) {
        itemGroup.selectedItems.forEach((selectedItem, index) => {
          if (item === selectedItem) {
            itemGroup.selectedItems.splice(index, 1);
          }
        });
      } else {
        itemGroup.selectedItems.push(item);
      }

      let changed = [];
      this.data.forEach((itemGroup) => {
        changed = changed.concat(itemGroup.selectedItems);
      });
      this.changed = changed;
    },
  },
};
</script>

<style lang="scss">
@import "../common";

.expansion-panels {
  .theme--light.v-expansion-panels .v-expansion-panel {
    border-radius: 5px;
  }

  .v-expansion-panel--active .v-expansion-panel-header {
    min-height: 30px;
  }

  .v-expansion-panel-header {
    padding: 5px 10px;
    min-height: 30px;
  }

  .v-expansion-panel-content__wrap {
    padding: 8px;
  }

  .v-expansion-panel-header {
    font-size: 13px;
  }
}
</style>
<style lang="scss" scoped>
@import "../common";

.expansion-panels {
  width: 100%;
}

.item {
  margin: 0;
  font-size: 11px;
  padding: 3px 5px;
  cursor: pointer;
  line-height: 1;
}

.item:hover {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}

.item.visible {
  background-color: $point-color-1;
  color: #ffffff;
  border-radius: 3px;
}

.sub-group {
  .v-expansion-panel-header {
    font-size: 11px;
    padding: 3px 5px;
    min-height: inherit;
    line-height: 1;
  }
}
</style>
