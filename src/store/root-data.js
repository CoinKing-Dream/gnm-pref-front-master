import {rootData as functions} from "./store-functions";
import conf from "../config";
import { get } from "../axios/apiAxios";

export const store = {
  namespaced: true,
  state: {
    multiMapShow: false,
    multiMapSync: true,
    userInfo: null,
    debug: false,
    hideMenu: window.innerHeight <= 800,
  },
  getters: {
    [functions.getters.MULTI_MAP_SHOW](state) {
      return state.multiMapShow;
    },
    [functions.getters.MULTI_MAP_SYNC](state) {
      return state.multiMapSync;
    },
    [functions.getters.USER_INFO](state) {
      return state.userInfo;
    },
    [functions.getters.DEBUG](state) {
      return state.debug;
    },
    [functions.getters.HIDE_MENU](state) {
      return state.hideMenu;
    },
  },
  mutations: {
    [functions.mutations.UPDATE_MULTI_MAP_SHOW](state, data) {
      state.multiMapShow = data;
    },
    [functions.mutations.UPDATE_MULTI_MAP_SYNC](state, data) {
      state.multiMapSync = data;
    },
    [functions.mutations.UPDATE_USER_INFO](state, data) {
      state.userInfo = data;
    },
    [functions.mutations.UPDATE_DEBUG](state, data) {
      state.debug = data;
    },
    [functions.mutations.UPDATE_HIDE_MENU](state, data) {
      state.hideMenu = data;
    },
  },
  actions: {
    async [functions.actions.LOAD_USER_INFO]({
      dispatch,
      commit,
      getters,
      rootGetters
    }) {
      const parameters = {
        mode: "all"
      };

      let [err, response] = await get(
        conf.apiServer.url,
        "/api/observatoryLink/get",
        parameters
      );
      if (err) throw new Error("load failed : /api/observatoryLink/get");

      commit(functions.mutations.UPDATE_USER_INFO, {
        name: response.userInfo.name,
        rainfallWarningVisible: response.userInfo.rainWarningUseing,
        rainfallDangerVisible: response.userInfo.rainAlarmUseing,
        rainfallWarningLimit: response.userInfo.rainWarning,
        rainfallDangerLimit: response.userInfo.rainAlarm,
        mainObservatoryId: response.userInfo.waterCenterId,
        riverLevelObservatories: response.waterList,
        rainfallObservatories: response.rainList,
      });

      return new Promise((resolve, reject) => {
        resolve(null);
      });
    },

  }
};
