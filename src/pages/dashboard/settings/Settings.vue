<template>
  <div class="settings">
    <v-row no-gutters align="center" class="settings-header">
      <v-btn dark icon @click="onClickCloseButton" class="ml-2">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </v-row>
    <v-card class="ma-4">
      <city-setting></city-setting>
    </v-card>
    <v-card class="ma-4">
      <observatory-setting></observatory-setting>
    </v-card>
    <v-card class="ma-4 pa-4">
      <h2>
        リンク
      </h2>
        <ul>
          <li><a :href="`${getOrigin()}/support/index.html`">システム管理者向けログイン</a></li>
        </ul>
    </v-card>
  </div>
</template>

<script>
import ObservatorySetting from "@/pages/dashboard/settings/ObservatorySetting";
import CitySetting from "@/pages/dashboard/settings/CitySetting";
export default {
  name: "Settings",
  components: {CitySetting, ObservatorySetting },
  methods: {
    onClickCloseButton() {
      this.$emit("close-dialog");
    },
    getOrigin() {
      return window.location.origin
    }
  }
};
</script>

<style lang="scss" scoped>
.settings {
  height: 100vh;
  overflow-y: scroll;
  background-color: #eeeeee;
  .settings-header {
    height: 40px;
    background-color: #3a1e87;
  }
}
</style>
