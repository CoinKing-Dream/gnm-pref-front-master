import conf from "../config";
import moment from "moment";
import _ from "lodash";
import axios from "axios";

import {
  riskData as functions,
  rootGetters as rootGetterFunctions,
  rootMutations as rootMutationFunctions,
} from "./store-functions";
import { Risk } from "../enums/Risk";
import { Observatory } from "../enums/Observatory";
import { get, mobileApiGet, post } from "../axios/apiAxios";
moment.locale("ja");

const DATE_FORMAT = "YYYY/MM/DD HH:mm";
const FIRST_STORE_ID = 1111;
const SECOND_STORE_ID = 2222;
const helper = {
  localizationKouzuiResponse(response) {
    const riskData = {
      baseDate: null,
      contents: [],
    };

    riskData.baseDate = this.stringDateToLocalMoment(response.baseDate);
    riskData.contents = _.map(response.riverRisks, (o) => {
      return {
        date: this.stringDateToLocalMoment(o.date),
        url: o.url,
      };
    });

    return riskData;
  },
  localizationDosyaResponse(response) {
    const riskData = {
      baseDate: null,
      contents: [],
    };

    riskData.baseDate = this.stringDateToLocalMoment(response.baseDate);
    riskData.bounds = response.bounds;
    riskData.contents = _.map(response.imageInfos, (o) => {
      const image = new Image();
      image.src = o.url;
      return {
        image: image,
        date: o.date,
      };
    });

    return riskData;
  },
  localizationSmallRiverFloodingResponse(response) {
    const riskData = {
      baseDate: null,
      contents: [],
    };

    if (!response) {
      return riskData;
    }

    riskData.baseDate = this.stringDateToLocalMoment(response.baseDate);
    riskData.boundsList = response.boundsList;

    riskData.contents = _.map(response.floodings, (o) => {
      const images = _.map(o.urls, (url) => {
        const image = new Image();
        image.src = url;
        return image;
      });

      return {
        images: images,
        date: o.date,
      };
    });

    return riskData;
  },
  localizationRiskLineResponse(response) {
    const riskData = {
      baseDate: null,
      contents: [],
    };

    riskData.baseDate = this.stringDateToLocalMoment(response.baseDate);
    riskData.contents = _.map(response.ts, (o) => {
      const geojson = {
        type: "FeatureCollection",
        features: [],
      };
      geojson.features = _.map(o.lines, (o) => {
        return {
          type: "Feature",
          properties: {
            _id: o.id,
            level: o.value,
          },
          geometry: {
            type: "LineString",
            coordinates: [
              [parseFloat(o.startX), parseFloat(o.startY)],
              [parseFloat(o.endX), parseFloat(o.endY)],
            ],
          },
        };
      });

      return {
        lines: geojson,
        date: this.stringDateToLocalMoment(o.date).format(DATE_FORMAT),
      };
    });

    return riskData;
  },

  localizationRainResponse(response, loadOnlyCurrent) {
    const riskData = {
      baseDate: null,
      contents: [],
    };
    riskData.baseDate = this.stringDateToLocalMoment(response.baseDate);
    riskData.bounds = response.bounds;
    riskData.imageInfo = response.imageInfo;
    riskData.contents = _.map(response.rains, (o) => {
      let image = loadOnlyCurrent ? {} : new Image();
      image.src = o.url;
      return {
        image: image,
        date: o.date,
        type: o.type,
      };
    });

    return riskData;
  },
  localizationObservatoryResponse(obInfo, obData) {
    const riskData = {
      contents: [],
    };

    const contents = [];
    _.forEach(obInfo, (o, index) => {
      if (typeof o.type !== "object") {
        o.type = Observatory.getObservatoryFromIndex(parseInt(o.type));
      }

      let temp = o;
      temp.index = index;
      temp.dangerousLevel = parseFloat(o.dangerousLevel);
      temp.outbreakLevel = parseFloat(o.outbreakLevel);
      temp.evacuationLevel = parseFloat(o.evacuationLevel);

      if (obData) {
        const rainData = _.find(obData.rainList, {
          _id: o._id,
          type: o.type.index,
        });
        if (rainData) {
          delete rainData.type;
          temp = _.assign(temp, rainData);
        }

        const waterData = _.find(obData.waterList, {
          _id: o._id,
          type: o.type.index,
        });
        if (waterData) {
          delete waterData.type;
          temp = _.assign(temp, waterData);
        }
      }
      contents.push(temp);
    });
    riskData.contents = contents;

    return riskData;
  },
  stringDateToLocalMoment(string) {
    return moment.utc(string, DATE_FORMAT);
  },
  round(date, duration, method) {
    return moment(Math[method](+date / +duration) * +duration);
  },
};
const defaultRisks = {
  [Risk.SMALL_RIVER_FLOODING.key]: {
    type: Risk.SMALL_RIVER_FLOODING,
    displayType: "image",
    updateType: "realtime",
    timeAxis: true,
    slider: true,
    subControl: true,
    data: {
      baseDate: null,
      contents: [],
    },
  },
  [Risk.OBSERVATORY.key]: {
    type: Risk.OBSERVATORY,
    displayType: "customLayer",
    updateType: "realtime",
    timeAxis: true,
    slider: false,
    subControl: true,
    data: {
      baseDate: null,
      contents: [],
      observatories: [],
    },
  },
  [Risk.RAIN.key]: {
    type: Risk.RAIN,
    displayType: "image",
    updateType: "realtime",
    timeAxis: true,
    slider: true,
    subControl: true,
    data: {
      baseDate: null,
      contents: [],
    },
  },
  [Risk.KOUZUI.key]: {
    type: Risk.KOUZUI,
    displayType: "image",
    updateType: "realtime",
    timeAxis: true,
    slider: true,
    subControl: false,
    data: {
      baseDate: null,
      contents: [],
    },
  },
  [Risk.DOSYA.key]: {
    type: Risk.DOSYA,
    displayType: "image",
    updateType: "realtime",
    timeAxis: true,
    slider: true,
    subControl: true,
    data: {
      baseDate: null,
      contents: [],
    },
  },
};
export const store = {
  namespaced: true,
  state: {
    observatoryRivers: [],
    bigRiverFloodingRivers: [],
    risks: _.cloneDeep(defaultRisks),
    secondRisks: _.cloneDeep(defaultRisks),
  },
  getters: {
    [functions.getters.FIND_RISK]: (state) => (riskType, storeId) => {
      const risk = storeId === FIRST_STORE_ID ? state.risks : state.secondRisks;
      return _.find(risk, { type: riskType });
    },
    [functions.getters.FILTER_RISK]: (state) => (query) => {
      const filteredRisk = [];

      // todo _lodashを使ってもっと簡単にできるはず
      _.forEach(state.risks, (o) => {
        if (query.displayType && o.displayType === query.displayType) {
          filteredRisk.push(o);
        } else if (query.updateType && o.updateType === query.updateType) {
          filteredRisk.push(o);
        } else if (query.timeAxis && o.timeAxis === query.timeAxis) {
          filteredRisk.push(o);
        } else if (query.slider && o.slider === query.slider) {
          filteredRisk.push(o);
        }
      });

      return filteredRisk;
    },
    [functions.getters.OBSERVATORY_RIVERS]: (state) => {
      return state.observatoryRivers;
    },
    [functions.getters.BIG_RIVER_FLOODING_RIVERS]: (state) => {
      return state.bigRiverFloodingRivers;
    },
  },
  mutations: {
    [functions.mutations.RESET_ALL_RISK_DATA](state) {
      _.forEach(state.risks, (risk) => {
        risk.data = {
          baseDate: null,
          contents: [],
        };
      });
      _.forEach(state.secondRisks, (risk) => {
        risk.data = {
          baseDate: null,
          contents: [],
        };
      });
    },
    [functions.mutations.UPDATE_SMALL_RIVER_FLOODING](
      state,
      { data, isSecond }
    ) {
      const risks = isSecond ? "secondRisks" : "risks";
      state[risks][Risk.SMALL_RIVER_FLOODING.key].data = data;
    },
    [functions.mutations.UPDATE_RAIN](state, { data, isSecond }) {
      const risks = isSecond ? "secondRisks" : "risks";
      state[risks][Risk.RAIN.key].data = data;
    },
    [functions.mutations.UPDATE_DOSYA](state, { data, isSecond }) {
      const risks = isSecond ? "secondRisks" : "risks";
      state[risks][Risk.DOSYA.key].data = data;
    },
    [functions.mutations.UPDATE_KOUZUI](state, { data, isSecond }) {
      const risks = isSecond ? "secondRisks" : "risks";
      state[risks][Risk.KOUZUI.key].data = data;
    },
    [functions.mutations.UPDATE_OBSERVATORY](state, { data, isSecond }) {
      const risks = isSecond ? "secondRisks" : "risks";
      state[risks][Risk.OBSERVATORY.key].data = data;
    },
    [functions.mutations.UPDATE_OBSERVATORY_RIVERS](state, data) {
      state.observatoryRivers = data;
    },
  },
  actions: {
    async [functions.actions.LOAD_DOSYA](
      { dispatch, commit, getters, rootGetters },
      { storeId, type }
    ) {
      const baseDate = rootGetters[rootGetterFunctions.BASE_DATE](
        storeId
      ).clone();
      const paramDate = helper.round(
        baseDate,
        moment.duration(5, "minutes"),
        "floor"
      );
      const parameters = {
        date: paramDate.utc().format(DATE_FORMAT),
      };
      let [err, response] = await get(
        "https://data.riskma.net",
        "/bosai/dosya",
        parameters
      );
      if (err) throw new Error("load failed : /bosai/dosya");

      const riskData = helper.localizationDosyaResponse(response);
      commit(
        rootMutationFunctions.UPDATE_SELECTED_DATE,
        { storeId, selectedDate: riskData.baseDate },
        { root: true }
      );
      commit(functions.mutations.UPDATE_DOSYA, {
        data: riskData,
        isSecond: storeId === SECOND_STORE_ID,
      });
    },
    async [functions.actions.LOAD_SMALL_RIVER_FLOODING](
      { dispatch, commit, getters, rootGetters },
      { storeId, type }
    ) {
      const debug = rootGetters[rootGetterFunctions.DEBUG];
      const baseDate = rootGetters[rootGetterFunctions.BASE_DATE](
        storeId
      ).clone();
      const paramDate = helper.round(
        baseDate,
        moment.duration(5, "minutes"),
        "floor"
      );

      const parameters = {
        date: paramDate.utc().format(DATE_FORMAT),
        type: type,
      };
      if (debug) {
        parameters.debug = debug;
      }

      let [err1, response1] = await get(
        conf.apiServer.url,
        "/api/small-river-flooding",
        parameters
      );
      if (err1) throw new Error("load failed : small-river-flooding");
      const imageData = helper.localizationSmallRiverFloodingResponse(
        response1
      );

      let [err2, response2] = await get(
        conf.apiServer.url,
        "/api/risk-line",
        parameters
      );
      if (err2) throw new Error("load failed : risk-line");
      const geojsonData = helper.localizationRiskLineResponse(response2);

      const riskData = {
        baseDate: imageData.baseDate || geojsonData.baseDate,
        boundsList: imageData.boundsList || [],
        contents: _.merge(imageData.contents, geojsonData.contents),
      };

      commit(
        rootMutationFunctions.UPDATE_SELECTED_DATE,
        { storeId, selectedDate: riskData.baseDate },
        { root: true }
      );
      commit(functions.mutations.UPDATE_SMALL_RIVER_FLOODING, {
        data: riskData,
        isSecond: storeId === SECOND_STORE_ID,
      });
    },
    async [functions.actions.LOAD_RAIN](
      { dispatch, commit, getters, rootGetters },
      { storeId, level, selectedDate = null, loadOnlyCurrent = false }
    ) {
      const baseDate = rootGetters[rootGetterFunctions.BASE_DATE](
        storeId
      ).clone();
      const paramDate = helper.round(
        baseDate,
        moment.duration(5, "minutes"),
        "floor"
      );
      const parameters = {
        date: paramDate.utc().format(DATE_FORMAT),
        level: level,
      };

      let [err, response] = await get(
        conf.apiServer.url,
        "/api/rain",
        parameters
      );
      if (err) throw new Error("load failed : rain");

      const riskData = helper.localizationRainResponse(
        response,
        loadOnlyCurrent
      );
      commit(
        rootMutationFunctions.UPDATE_SELECTED_DATE,
        { storeId, selectedDate: selectedDate || riskData.baseDate },
        { root: true }
      );
      commit(functions.mutations.UPDATE_RAIN, {
        data: riskData,
        isSecond: storeId === SECOND_STORE_ID,
      });
    },
    async [functions.actions.LOAD_OBSERVATORY](
      { commit, rootGetters },
      { storeId, loadInfo, loadCurrentData }
    ) {
      let obInfo, obData;

      if (loadInfo) {
        let err;
        [err, obInfo] = await mobileApiGet(
          conf.mobileApiServer.url,
          "/api/observatories"
        );
        if (err) throw new Error("load failed : observatories");
      } else {
        const risk = rootGetters[rootGetterFunctions.FIND_RISK](
          Risk.OBSERVATORY,
          storeId
        );
        obInfo = risk.data.contents;
      }

      if (loadCurrentData) {
        const baseDate = rootGetters[rootGetterFunctions.BASE_DATE](
          storeId
        ).clone();
        const paramDate = helper.round(
          baseDate,
          moment.duration(5, "minutes"),
          "floor"
        );
        const parameters = {
          date: paramDate.utc().format("YYYY/MM/DD HH:mm"),
          status: "all",
        };

        const path = `/api/observatories/status`;
        let err;
        [err, obData] = await mobileApiGet(
          conf.mobileApiServer.url,
          path,
          parameters
        );
        if (err) throw new Error(`load failed : ${path}`);
      }
      const riskData = helper.localizationObservatoryResponse(obInfo, obData);
      commit(functions.mutations.UPDATE_OBSERVATORY, {
        data: riskData,
        isSecond: storeId === SECOND_STORE_ID,
      });

      return new Promise((resolve, reject) => {
        resolve(null);
      });
    },
    async [functions.actions.LOAD_OBSERVATORY_RIVERS]({
      dispatch,
      commit,
      getters,
      rootGetters,
    }) {
      let [err, response] = await get(conf.apiServer.url, "/api/rivers");
      if (err) throw new Error("load failed : /rivers");

      const rivers = [{ text: "全体", value: -1 }];
      _.forEach(response, (o) => {
        rivers.push({
          text: o.name,
          value: o._id,
        });
      });

      commit(functions.mutations.UPDATE_OBSERVATORY_RIVERS, rivers);
    },
    async [functions.actions.LOAD_KOUZUI](
      { dispatch, commit, getters, rootGetters },
      storeId
    ) {
      const baseDate = rootGetters[rootGetterFunctions.BASE_DATE](
        storeId
      ).clone();
      const paramDate = helper.round(
        baseDate,
        moment.duration(5, "minutes"),
        "floor"
      );
      const parameters = {
        date: paramDate.utc().format(DATE_FORMAT),
      };

      let [loginErr, loginResponse] = await axios
        .create({
          responseType: "json",
          baseURL: "https://www.tfd-umbrela.jp",
        })
        .get("/api/login", {
          params: {
            userId: "gest_gnm",
            userPassWord: "gest_gnm",
          },
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
        })
        .then((response) => {
          return [null, response.data];
        });
      if (loginErr) throw new Error("load failed : /login");

      let [err, response] = await axios
        .create({
          responseType: "json",
          baseURL: "https://www.tfd-umbrela.jp",
        })
        .get("/api/river-risk", {
          params: parameters,
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            "x-api-key": `${loginResponse["access_token"]}`,
          },
        })
        .then((response) => {
          return [null, response.data];
        });
      if (err) throw new Error("load failed : /api/river-risk");

      const riskData = helper.localizationKouzuiResponse(response);
      commit(
        rootMutationFunctions.UPDATE_SELECTED_DATE,
        { storeId, selectedDate: riskData.baseDate },
        { root: true }
      );
      commit(functions.mutations.UPDATE_KOUZUI, {
        data: riskData,
        isSecond: storeId === SECOND_STORE_ID,
      });
    },
  },
};
