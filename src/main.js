import "@mdi/font/css/materialdesignicons.css";
import "@babel/polyfill";
import Vue from "vue";
import App from "./App.vue";
import Vuetify from "vuetify";
import "vuetify/dist/vuetify.min.css";
import { store } from "./store";
import router from "./router";
import VueCookies from "vue-cookies";
import "leaflet/dist/leaflet.css";
import "vue-ctk-date-time-picker/dist/vue-ctk-date-time-picker.css";
import "chartjs-plugin-annotation";
import VueGtag from "vue-gtag"

if (window.location.origin.indexOf("http://localhost") === -1) {
  const accessToken = VueCookies.get("access_token");
  const userId = VueCookies.get("userId");
  const urlParams = VueCookies.get("urlParams");
  if (!accessToken || !userId) {
    window.location.href = window.location.origin + "/login";
  } else if (urlParams) {
    window.location.href = window.location.href + urlParams;
    VueCookies.remove("urlParams");
  }
}

Vue.config.productionTip = true;
Vue.config.devtools = process.env.NODE_ENV === "development";
Vue.use(Vuetify);
Vue.use(VueCookies);
Vue.use(
    VueGtag,
    {
      config: { id: "G-RK1QTKEVP8" },
      params: {
        send_page_view: false,
      },
    },
    router
);

export default new Vuetify({
  icons: {
    iconfont: "mdi", // default - only for display purposes
  },
});
new Vue({
  render: (h) => h(App),
  store,
  router: router,
  vuetify: new Vuetify({
    icons: {
      iconfont: "mdiSvg", // 'mdi' || 'mdiSvg' || 'md' || 'fa' || 'fa4'
    },
  }),
}).$mount("#app");
