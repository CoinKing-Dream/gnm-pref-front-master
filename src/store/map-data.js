import Vue from "vue";
import _ from "lodash";

import moment from "moment";
import {
  mapData as functions,
  rootGetters as rootGetterFunctions,
} from "./store-functions";
import { BaseTile } from "../enums/BaseTile";
import { Risk } from "../enums/Risk";
import { Observatory } from "../enums/Observatory";
import conf from "../config";
const DATE_FORMAT = "YYYY/MM/DD HH:mm";
import {get, mobileApiGet} from "../axios/apiAxios";
import { Feature } from "@/enums/Feature";

const defaultMapData = {
  mapObject: null,
  selectedBaseTile: BaseTile.GRAY,
  selectedRisk: Risk.RAIN,
  selectedFeatures: [Feature.RIVER],
  selectedDate: null,
  baseDate: moment(),
  dialog: {
    isShowing: false,
    title: "",
    cols: 6,
    contents: "",
  },
  rivers: [],
  selectedObservatory: null,
  selectedObservatories: [],
  baseDateRain: null,
  observatoryOptions: {
    river: { text: "全体", value: -1 },
    filter: [
      Observatory.RIVER_LEVEL,
      Observatory.RAIN,
      Observatory.CAMERA,
      Observatory.DAM,
      Observatory.VIDEO,
    ],
    riverLevelCategory: "0",
    onlyUsersObservatories: false,
    showObservatoryName: false,
    showRainImage: false,
    isLoading: true,
    range: 0,
    interval: 0,
    markerDataType: 0,
  },
  smallRiverFloodingOptions: {
    type: 3, //内外水 todo : enum化
    sample: false,
    opacity: 0.7,
    level: "L1",
  },
  colorLegend: null,
  rainOptions: {
    opacity: 0.7,
  },
  dosyaOptions: {
    opacity: 0.7,
  },
  autoUpdate: true,
  riskOpacity: 0.7,
  featureOpacity: 0.7,
  hazardSearchMode: false,
  showGrayBackground: false,
  showColorLegend: true,
};
const helper = {
  localizationObservatoryDataResponse(response) {
    const riskData = [];
    const getFloodValues = (tag, key) => {
      return _.map(tag, (item) => {
        const rst =
          (!item[key] && item[key] !== 0) ||
          typeof item[key] === "undefined" ||
          item[key] <= -998;
        return rst ? null : item[key].toFixed(2);
      });
    };

    _.forEach(response.observatories, (o) => {
      const observatory = {
        _id: o._id,
        baseDate: this.stringDateToLocalMoment(response.baseTime),
        thumbnailUrl: o.thumbnailUrl,
      };
      observatory.times = [];

      if (response.type === Observatory.RIVER_LEVEL.index) {
        observatory.riverLevels = [];
        observatory.rains = [];

        if (o.rainVolumes && o.rainVolumes.length > 0) {
          observatory.rainTimes = _.map(o.rainVolumes, (volume) => {
            return volume.dateTime;
          });
          _.forEach(o.rainVolumes, (volume) => {
            if (volume.type === "forecast") {
              if (_.has(volume, "value")) {
                volume.min60 = volume.value;
              }
            }
          });
          observatory.rains = getFloodValues(o.rainVolumes, "value");
          observatory.rains60 = getFloodValues(o.rainVolumes, "min60");

          const realTypeLastIndex = _.findLastIndex(o.rainVolumes, (volume) => {
            return volume.type === "real";
          });
          if (realTypeLastIndex !== -1) {
            observatory.rainLatestRealDate = this.stringDateToLocalMoment(
              o.rainVolumes[realTypeLastIndex].dateTime
            );
          } else {
            const forecastTypeIndex = _.findIndex(o.rainVolumes, (volume) => {
              return volume.type === "forecast";
            });
            if (forecastTypeIndex !== -1) {
              observatory.rainLatestRealDate = this.stringDateToLocalMoment(
                  o.rainVolumes[forecastTypeIndex].dateTime
              ).subtract(10, "minutes");
            }
          }
        }
        if (o.waterVolumes && o.waterVolumes.length > 0) {
          observatory.times = _.map(o.waterVolumes, (volume) => {
            return volume.dateTime;
          });
          observatory.riverLevels = getFloodValues(o.waterVolumes, "level");

          const realTypeLastIndex = _.findLastIndex(
            o.waterVolumes,
            (volume) => {
              return volume.type === "real";
            }
          );
          if (realTypeLastIndex !== -1) {
            observatory.latestRealDate = this.stringDateToLocalMoment(
              o.waterVolumes[realTypeLastIndex].dateTime
            );
          } else {
            const forecastTypeIndex = _.findIndex(o.waterVolumes, (volume) => {
              return volume.type === "forecast";
            });
            if (forecastTypeIndex !== -1) {
              observatory.latestRealDate = this.stringDateToLocalMoment(
                  o.waterVolumes[forecastTypeIndex].dateTime
              ).subtract(10, "minutes");
            }
          }
        }

        if (o.cameraInfo) {
          o.cameraInfo.images = _.reverse(o.cameraInfo.images);
          observatory.cameraInfo = o.cameraInfo;
        }

      } else if (response.type === Observatory.RAIN.index) {
        observatory.rains = [];
        observatory.totalRains = [];

        if (o.rainVolumes && o.rainVolumes.length > 0) {
          observatory.times = _.map(o.rainVolumes, (volume) => {
            return volume.dateTime;
          });
          observatory.rains = getFloodValues(o.rainVolumes, "min10");
          observatory.rains60 = getFloodValues(o.rainVolumes, "min60");
          observatory.totalRains = getFloodValues(o.rainVolumes, "total");

          const realTypeLastIndex = _.findLastIndex(o.rainVolumes, (rain) => {
            return rain.type === "real";
          });
          if (realTypeLastIndex !== -1) {
            observatory.latestRealDate = this.stringDateToLocalMoment(
              o.rainVolumes[realTypeLastIndex].dateTime
            );
          } else {
            const forecastTypeIndex = _.findIndex(o.rainVolumes, (volume) => {
              return volume.type === "forecast";
            });
            if (forecastTypeIndex !== -1) {
              observatory.latestRealDate = this.stringDateToLocalMoment(
                  o.rainVolumes[forecastTypeIndex].dateTime
              ).subtract(10, "minutes");
            }
          }
        }
      } else if (response.type === Observatory.DAM.index) {
        observatory.levels = [];
        observatory.qinAlls = [];
        observatory.qoutAlls = [];

        if (o.waterVolumes && o.waterVolumes.length > 0) {
          const realTypeLastIndex = _.findLastIndex(o.waterVolumes, (level) => {
            return level.type === "real";
          });
          if (realTypeLastIndex !== -1) {
            observatory.latestRealDate = this.stringDateToLocalMoment(
              o.waterVolumes[realTypeLastIndex].dateTime
            );
          }
          observatory.times = _.map(o.waterVolumes, (volume) => {
            return volume.dateTime;
          });
          observatory.levels = getFloodValues(o.waterVolumes, "level");
          observatory.qinAlls = getFloodValues(o.waterVolumes, "qinAll");
          observatory.qoutAlls = getFloodValues(o.waterVolumes, "qoutAll");
        }
      } else if (response.type === Observatory.CAMERA.index) {
        if (o.imageInfo) {
          observatory.imageInfo = o.imageInfo;
        }
      }

      riskData.push(observatory);
    });

    return riskData;
  },
  stringDateToLocalMoment(string) {
    return moment.utc(string, DATE_FORMAT);
  },
  round(date, duration, method) {
    return moment(Math[method](+date / +duration) * +duration);
  },
};
export const store = {
  namespaced: true,
  state: {
    maps: {},
  },
  getters: {
    [functions.getters.MAP_DATA]: (state) => (storeId) => {
      return state.maps[storeId];
    },
    [functions.getters.MAP_OBJECT]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].mapObject
        : undefined;
    },
    [functions.getters.SELECTED_BASE_TILE]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedBaseTile
        : undefined;
    },
    [functions.getters.SELECTED_RISK]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedRisk
        : undefined;
    },
    [functions.getters.SELECTED_FEATURES]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedFeatures
        : undefined;
    },
    [functions.getters.SELECTED_DATE]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedDate
        : undefined;
    },
    [functions.getters.BASE_DATE]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].baseDate
        : undefined;
    },
    [functions.getters.DIALOG]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].dialog
        : undefined;
    },
    [functions.getters.SELECTED_OBSERVATORY]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedObservatory
        : undefined;
    },
    [functions.getters.SELECTED_OBSERVATORIES]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedObservatories
        : undefined;
    },
    [functions.getters.OBSERVATORY_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].observatoryOptions
        : undefined;
    },
    [functions.getters.SELECTED_WIND]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedWind
        : undefined;
    },
    [functions.getters.WIND_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].windOptions
        : undefined;
    },
    [functions.getters.SELECTED_DIKE_BREAK_POINT]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].selectedDikeBreakPoint
        : undefined;
    },
    [functions.getters.BIG_RIVER_FLOODING_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].bigRiverFloodingOptions
        : undefined;
    },
    [functions.getters.FLOODING_HISTORY_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].floodingHistoryOptions
        : undefined;
    },
    [functions.getters.SMALL_RIVER_FLOODING_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].smallRiverFloodingOptions
        : undefined;
    },
    [functions.getters.LAND_SLIDE_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].landSlideOptions
        : undefined;
    },
    [functions.getters.LAND_SLIDE_MESH_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].landSlideMeshOptions
        : undefined;
    },
    [functions.getters.COLOR_LEGEND]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].colorLegend
        : undefined;
    },
    [functions.getters.MAP_TOOL]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].mapTool
        : undefined;
    },
    [functions.getters.X_RAIN_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].xRainOptions
        : undefined;
    },
    [functions.getters.RAIN_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].rainOptions
        : undefined;
    },
    [functions.getters.DOSYA_OPTIONS]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].dosyaOptions
        : undefined;
    },
    [functions.getters.AUTO_UPDATE]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].autoUpdate
        : undefined;
    },
    [functions.getters.RISK_OPACITY]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].riskOpacity
        : undefined;
    },
    [functions.getters.FEATURE_OPACITY]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].featureOpacity
        : undefined;
    },
    [functions.getters.HAZARD_SEARCH_MODE]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].hazardSearchMode
        : undefined;
    },
    [functions.getters.SHOW_GRAY_BACKGROUND]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].showGrayBackground
        : undefined;
    },
    [functions.getters.SHOW_COLOR_LEGEND]: (state) => (storeId) => {
      return _.has(state.maps, storeId)
        ? state.maps[storeId].showColorLegend
        : undefined;
    },
  },
  mutations: {
    [functions.mutations.INIT_MAP_DATA](state, { storeId, mapData }) {
      const userMapData = _.cloneDeep(defaultMapData);
      if (_.has(mapData, "mapObject")) {
        userMapData.mapObject = mapData.mapObject;
      }
      if (_.has(mapData, "selectedBaseTile")) {
        userMapData.selectedBaseTile = mapData.selectedBaseTile;
      }
      if (_.has(mapData, "selectedRiskType")) {
        userMapData.selectedRisk = this.getters[rootGetterFunctions.FIND_RISK](
          mapData.selectedRiskType,
          storeId
        );
      }
      if (_.has(mapData, "selectedFeatures")) {
        userMapData.selectedFeatures = mapData.selectedFeatures;
      }
      if (_.has(mapData, "selectedDate")) {
        userMapData.selectedDate = mapData.selectedDate;
      }
      if (_.has(mapData, "baseDate")) {
        userMapData.baseDate = mapData.baseDate;
      }
      if (_.has(mapData, "dialog")) {
        userMapData.dialog = mapData.dialog;
      }
      if (_.has(mapData, "observatoryOptions")) {
        userMapData.observatoryOptions = mapData.observatoryOptions;
      }
      if (_.has(mapData, "autoUpdate")) {
        userMapData.autoUpdate = mapData.autoUpdate;
      }

      Vue.set(state.maps, storeId, userMapData);
    },
    [functions.mutations.REMOVE_MAP_DATA](state, storeId) {
      state.maps[storeId] = defaultMapData;
      Vue.delete(state.maps, storeId);
    },
    [functions.mutations.UPDATE_MAP_OBJECT](state, { storeId, mapObject }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].mapObject = mapObject;
    },
    [functions.mutations.UPDATE_SELECTED_BASE_TILE](
      state,
      { storeId, baseTile }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].selectedBaseTile = baseTile;
    },
    [functions.mutations.UPDATE_SELECTED_RISK](
      state,
      { storeId, selectedRiskType }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].selectedRisk = this.getters[
        rootGetterFunctions.FIND_RISK
      ](selectedRiskType, storeId);
    },
    [functions.mutations.UPDATE_SELECTED_FEATURES](
      state,
      { storeId, selectedFeatures }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].selectedFeatures = selectedFeatures;
    },
    [functions.mutations.UPDATE_SELECTED_DATE](
      state,
      { storeId, selectedDate }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].selectedDate = selectedDate;
    },
    [functions.mutations.UPDATE_BASE_DATE](state, { storeId, baseDate }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].baseDate = baseDate;
    },
    [functions.mutations.UPDATE_DIALOG](state, { storeId, dialog }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(dialog, "isShowing")) {
        state.maps[storeId].dialog.isShowing = dialog.isShowing;
      }
      if (_.has(dialog, "title")) {
        state.maps[storeId].dialog.title = dialog.title;
      }
      if (_.has(dialog, "cols")) {
        state.maps[storeId].dialog.cols = dialog.cols;
      }
      if (_.has(dialog, "contents")) {
        state.maps[storeId].dialog.contents = dialog.contents;
      }
    },
    [functions.mutations.UPDATE_SELECTED_OBSERVATORY](
      state,
      { storeId, selectedObservatory }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].selectedObservatory = selectedObservatory;
    },
    [functions.mutations.UPDATE_SELECTED_OBSERVATORIES](
      state,
      { storeId, selectedObservatories }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].selectedObservatories = selectedObservatories;
    },
    [functions.mutations.UPDATE_OBSERVATORY_OPTIONS](
      state,
      { storeId, observatoryOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(observatoryOptions, "river")) {
        state.maps[storeId].observatoryOptions.river = observatoryOptions.river;
      }
      if (_.has(observatoryOptions, "filter")) {
        state.maps[storeId].observatoryOptions.filter =
          observatoryOptions.filter;
      }
      if (_.has(observatoryOptions, "riverLevelCategory")) {
        state.maps[storeId].observatoryOptions.riverLevelCategory =
          observatoryOptions.riverLevelCategory;
      }
      if (_.has(observatoryOptions, "onlyUsersObservatories")) {
        state.maps[storeId].observatoryOptions.onlyUsersObservatories =
          observatoryOptions.onlyUsersObservatories;
      }
      if (_.has(observatoryOptions, "showObservatoryName")) {
        state.maps[storeId].observatoryOptions.showObservatoryName =
          observatoryOptions.showObservatoryName;
      }
      if (_.has(observatoryOptions, "showRainImage")) {
        state.maps[storeId].observatoryOptions.showRainImage =
          observatoryOptions.showRainImage;
      }
      if (_.has(observatoryOptions, "isLoading")) {
        state.maps[storeId].observatoryOptions.isLoading =
          observatoryOptions.isLoading;
      }
      if (_.has(observatoryOptions, "range")) {
        state.maps[storeId].observatoryOptions.range = observatoryOptions.range;
      }
      if (_.has(observatoryOptions, "interval")) {
        state.maps[storeId].observatoryOptions.interval =
          observatoryOptions.interval;
      }
      if (_.has(observatoryOptions, "markerDataType")) {
        state.maps[storeId].observatoryOptions.markerDataType =
          observatoryOptions.markerDataType;
      }
    },
    [functions.mutations.UPDATE_SELECTED_WIND](
      state,
      { storeId, selectedWind }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(selectedWind, "speed")) {
        state.maps[storeId].selectedWind.speed = selectedWind.speed;
      }
      if (_.has(selectedWind, "direction")) {
        state.maps[storeId].selectedWind.direction = selectedWind.direction;
      }
    },
    [functions.mutations.UPDATE_WIND_OPTIONS](state, { storeId, windOptions }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(windOptions, "height")) {
        state.maps[storeId].windOptions.height = windOptions.height;
      }
      if (_.has(windOptions, "sample")) {
        state.maps[storeId].windOptions.sample = windOptions.sample;
      }
      if (_.has(windOptions, "loading")) {
        state.maps[storeId].windOptions.loading = windOptions.loading;
      }
    },
    [functions.mutations.UPDATE_SELECTED_DIKE_BREAK_POINT](
      state,
      { storeId, selectedDikeBreakPoint }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].selectedDikeBreakPoint = selectedDikeBreakPoint;
    },
    [functions.mutations.UPDATE_BIG_RIVER_FLOODING_OPTIONS](
      state,
      { storeId, bigRiverFloodingOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(bigRiverFloodingOptions, "river")) {
        state.maps[storeId].bigRiverFloodingOptions.river =
          bigRiverFloodingOptions.river;
      }
      if (_.has(bigRiverFloodingOptions, "level")) {
        state.maps[storeId].bigRiverFloodingOptions.level =
          bigRiverFloodingOptions.level;
      }
      if (_.has(bigRiverFloodingOptions, "displayDataType")) {
        state.maps[storeId].bigRiverFloodingOptions.displayDataType =
          bigRiverFloodingOptions.displayDataType;
      }
      if (_.has(bigRiverFloodingOptions, "selectedIndex")) {
        state.maps[storeId].bigRiverFloodingOptions.selectedIndex =
          bigRiverFloodingOptions.selectedIndex;
      }
      if (_.has(bigRiverFloodingOptions, "opacity")) {
        state.maps[storeId].bigRiverFloodingOptions.opacity =
          bigRiverFloodingOptions.opacity;
      }
    },
    [functions.mutations.UPDATE_FLOODING_HISTORY_OPTIONS](
      state,
      { storeId, floodingHistoryOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(floodingHistoryOptions, "areaSelectMode")) {
        state.maps[storeId].floodingHistoryOptions.areaSelectMode =
          floodingHistoryOptions.areaSelectMode;
      }
      if (_.has(floodingHistoryOptions, "newArea")) {
        state.maps[storeId].floodingHistoryOptions.newArea =
          floodingHistoryOptions.newArea;
      }
    },
    [functions.mutations.UPDATE_SMALL_RIVER_FLOODING_OPTIONS](
      state,
      { storeId, smallRiverFloodingOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(smallRiverFloodingOptions, "type")) {
        state.maps[storeId].smallRiverFloodingOptions.type =
          smallRiverFloodingOptions.type;
      }
      if (_.has(smallRiverFloodingOptions, "sample")) {
        state.maps[storeId].smallRiverFloodingOptions.sample =
          smallRiverFloodingOptions.sample;
      }
      if (_.has(smallRiverFloodingOptions, "opacity")) {
        state.maps[storeId].smallRiverFloodingOptions.opacity =
          smallRiverFloodingOptions.opacity;
      }
      if (_.has(smallRiverFloodingOptions, "level")) {
        state.maps[storeId].smallRiverFloodingOptions.level =
          smallRiverFloodingOptions.level;
      }
    },
    [functions.mutations.UPDATE_LAND_SLIDE_OPTIONS](
      state,
      { storeId, landSlideOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(landSlideOptions, "sample")) {
        state.maps[storeId].landSlideOptions.sample = landSlideOptions.sample;
      }
      if (_.has(landSlideOptions, "opacity")) {
        state.maps[storeId].landSlideOptions.opacity = landSlideOptions.opacity;
      }
      if (_.has(landSlideOptions, "level")) {
        state.maps[storeId].landSlideOptions.level = landSlideOptions.level;
      }
    },
    [functions.mutations.UPDATE_LAND_SLIDE_MESH_OPTIONS](
      state,
      { storeId, landSlideMeshOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(landSlideMeshOptions, "opacity")) {
        state.maps[storeId].landSlideMeshOptions.opacity =
          landSlideMeshOptions.opacity;
      }
    },
    [functions.mutations.UPDATE_COLOR_LEGEND](state, { storeId, colorLegend }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].colorLegend = colorLegend;
    },
    [functions.mutations.UPDATE_MAP_TOOL](state, { storeId, mapTool }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(mapTool, "addressMarker")) {
        state.maps[storeId].mapTool.addressMarker = mapTool.addressMarker;
      }
    },
    [functions.mutations.UPDATE_X_RAIN_OPTIONS](
      state,
      { storeId, xRainOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(xRainOptions, "chart")) {
        state.maps[storeId].xRainOptions.chart = xRainOptions.chart;
      }
      if (_.has(xRainOptions, "opacity")) {
        state.maps[storeId].xRainOptions.opacity = xRainOptions.opacity;
      }
    },
    [functions.mutations.UPDATE_RAIN_OPTIONS](state, { storeId, rainOptions }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(rainOptions, "opacity")) {
        state.maps[storeId].rainOptions.opacity = rainOptions.opacity;
      }
    },
    [functions.mutations.UPDATE_DOSYA_OPTIONS](
      state,
      { storeId, dosyaOptions }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      if (_.has(dosyaOptions, "opacity")) {
        state.maps[storeId].dosyaOptions.opacity = dosyaOptions.opacity;
      }
    },
    [functions.mutations.UPDATE_AUTO_UPDATE](state, { storeId, autoUpdate }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].autoUpdate = autoUpdate;
    },

    [functions.mutations.UPDATE_RISK_OPACITY](state, { storeId, riskOpacity }) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].riskOpacity = riskOpacity;
    },
    [functions.mutations.UPDATE_FEATURE_OPACITY](
      state,
      { storeId, featureOpacity }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].featureOpacity = featureOpacity;
    },
    [functions.mutations.UPDATE_HAZARD_SEARCH_MODE](
      state,
      { storeId, hazardSearchMode }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].hazardSearchMode = hazardSearchMode;
    },
    [functions.mutations.UPDATE_SHOW_GRAY_BACKGROUND](
        state,
        { storeId, showGrayBackground }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].showGrayBackground = showGrayBackground;
    },
    [functions.mutations.UPDATE_SHOW_COLOR_LEGEND](
        state,
        { storeId, showColorLegend }
    ) {
      if (_.has(state.maps, storeId) === false) {
        return;
      }
      state.maps[storeId].showColorLegend = showColorLegend;
    },
  },
  actions: {
    async [functions.actions.LOAD_OBSERVATION_DATA](
      { /*dispatch,*/ commit, getters, rootGetters },
      {
        storeId,
        observatoryId,
        isRiverArea,
        type,
        userLink,
        categoryNo,
        targetIds,
        isTestPage,
        linkType,
      }
    ) {
      const debug = rootGetters[rootGetterFunctions.DEBUG];
      const baseDate = getters[functions.getters.BASE_DATE](storeId).clone();
      const paramDate = helper.round(
        baseDate,
        moment.duration(5, "minutes"),
        "floor"
      );

      const parameters = {
        date: paramDate.utc().format(DATE_FORMAT),
        observatory_id: observatoryId,
        type: type,
      };
      if (isRiverArea) {
        parameters.isRiverArea = isRiverArea;
      }
      if (userLink) {
        parameters.userLink = userLink;
      }
      if (categoryNo) {
        parameters.categoryNo = categoryNo;
      }
      if (targetIds) {
        parameters.targetIds = targetIds;
      }
      if (debug) {
        parameters.debug = debug;
      }
      if (isTestPage) {
        parameters.withRain = true;
      }

      let [err, response] = await mobileApiGet(
        conf.mobileApiServer.url,
        "/api/observatories/data",
        parameters
      );
      if (err) throw new Error("load failed : /observatories/data");

      const observationData = helper.localizationObservatoryDataResponse(
        response
      );

      const selectedObservatories = [];
      let selectedObservatory = null;
      _.forEach(observationData, (o) => {
        const masterContents = rootGetters[rootGetterFunctions.FIND_RISK](
          Risk.OBSERVATORY,
          storeId
        ).data.contents;
        const index = _.findIndex(masterContents, (mo) => {
          return o._id === mo._id && response.type === mo.type.index;
        });
        if (index !== -1) {
          const observatoryMaster = Object.assign({}, masterContents[index]);
          Object.assign(observatoryMaster, o);
          selectedObservatories.push(observatoryMaster);
          if (observatoryId === observatoryMaster._id) {
            selectedObservatory = observatoryMaster;
          }
        }
      });
      commit(functions.mutations.UPDATE_SELECTED_OBSERVATORIES, {
        storeId,
        selectedObservatories: selectedObservatories,
      });
      commit(functions.mutations.UPDATE_SELECTED_OBSERVATORY, {
        storeId,
        selectedObservatory: selectedObservatory,
      });
    },
  },
};
