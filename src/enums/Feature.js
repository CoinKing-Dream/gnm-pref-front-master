import conf from "../config";
export const Feature = {
  FLOOD_INUNDATED_AREA_1: {
    index: 1,
    key: "floodInundatedArea1",
    string: "洪水浸水想定区域\n想定最大規模",
    group: "防災マップ",
    subGroup: "洪水浸水想定区域等",
    url: "https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/tile/sinsou/{z}/{x}/{y}.png"
  },
  FLOOD_INUNDATED_AREA_2: {
    index: 2,
    key: "floodInundatedArea2",
    string: "洪水浸水想定区域\n計画規模",
    group: "防災マップ",
    subGroup: "洪水浸水想定区域等",
    url: "https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/tile/sinsouL1/{z}/{x}/{y}.png"
  },
  FLOOD_INUNDATED_DIKE_BREAK_2: {
    index: 3,
    key: "floodInundatedDikeBreak2",
    string: "破堤地点別\n想定最大規模",
    group: "防災マップ",
    subGroup: "洪水浸水想定区域等",
    url: null
  },
  FLOOD_INUNDATED_DIKE_BREAK_1: {
    index: 20,
    key: "floodInundatedDikeBreak1",
    string: "破堤地点別\n計画規模",
    group: "防災マップ",
    subGroup: "洪水浸水想定区域等",
    url: null
  },
  FLOOD_DURATION: {
    index: 4,
    key: "floodDuration",
    string: "浸水継続時間",
    group: "防災マップ",
    subGroup: "洪水浸水想定区域等",
    url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/tile/keizoku_L2/{z}/{x}/{y}.png`,
  },
  HOUSE_COLLAPSE_1: {
    index: 5,
    key: "houseCollapse1",
    string: "家屋倒壊等氾濫想定区域\n氾濫流",
    group: "防災マップ",
    subGroup: "洪水浸水想定区域等",
    url: [
      "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_kaokutoukai_hanran_pref_data/10/{z}/{x}/{y}.png",
      "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_kaokutoukai_hanran_kuni_data/{z}/{x}/{y}.png",
    ]
  },
  HOUSE_COLLAPSE_2: {
    index: 6,
    key: "houseCollapse2",
    string: "家屋倒壊等氾濫想定区域\n河岸侵食",
    group: "防災マップ",
    subGroup: "洪水浸水想定区域等",
    url: [
      "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_kaokutoukai_kagan_pref_data/10/{z}/{x}/{y}.png",
      "https://disaportaldata.gsi.go.jp/raster/01_flood_l2_kaokutoukai_kagan_kuni_data/{z}/{x}/{y}.png",
    ]
  },
  GRADUAL_RAIN_200: {
    index: 200,
    key: "gradualRain200",
    string: "総雨量200mm",
    group: "防災マップ",
    subGroup: "総雨量別浸水リスク",
    height: 200,
    url: null
  },
  GRADUAL_RAIN_300: {
    index: 201,
    key: "gradualRain300",
    string: "総雨量300mm",
    group: "防災マップ",
    subGroup: "総雨量別浸水リスク",
    height: 300,
    url: null
  },
  GRADUAL_RAIN_400: {
    index: 202,
    key: "gradualRain400",
    string: "総雨量400mm",
    group: "防災マップ",
    subGroup: "総雨量別浸水リスク",
    height: 400,
    url: null
  },
  GRADUAL_RAIN_500: {
    index: 203,
    key: "gradualRain500",
    string: "総雨量500mm",
    group: "防災マップ",
    subGroup: "総雨量別浸水リスク",
    height: 500,
    url: null
  },
  GRADUAL_RAIN_600: {
    index: 204,
    key: "gradualRain600",
    string: "総雨量600mm",
    group: "防災マップ",
    subGroup: "総雨量別浸水リスク",
    height: 600,
    url: null
  },
  FLOOD_RECORD_H29: {
    index: 7,
    key: "floodRecordH29",
    string: "H29台風21号",
    group: "防災マップ",
    subGroup: "浸水実績",
    url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/tile/GNMAFloodRecordH29/{z}/{x}/{y}.png`
  },
  FLOOD_RECORD_R01: {
    index: 8,
    key: "floodRecordR01",
    string: "R01台風19号",
    group: "防災マップ",
    subGroup: "浸水実績",
    url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/tile/GNMAFloodRecordR01/{z}/{x}/{y}.png`
  },
  UNDER_PATH: {
    index: 11,
    key: "underPath",
    string: "道路冠水注意箇所",
    group: "防災マップ",
    url: `${conf.staticServer.url}/ctie.gnm-pref.web/static/tile/under-path/{z}/{x}/{y}.png`
  },
  FLOOD_PREVENTION_SITE: {
    index: 12,
    key: "FloodPreventionSite",
    string: "重要水防箇所",
    group: "防災マップ",
    url: null
  },
  SAND_WARNING_AREA: {
    index: 9,
    key: "sandArea",
    string: "土砂災害警戒区域等",
    group: "防災マップ",
    url: [
      `${conf.staticServer.url}/ctie.gnm-pref.web/static/tile/R04do/{z}/{x}/{y}.png`,
      `${conf.staticServer.url}/ctie.gnm-pref.web/static/tile/R04ji/{z}/{x}/{y}.png`,
      `${conf.staticServer.url}/ctie.gnm-pref.web/static/tile/R04ky/{z}/{x}/{y}.png`,
    ],
  },
  HAIRYOSYA: {
    index: 13,
    key: "hairyosya",
    string: "要配慮者利用施設",
    group: "地理情報",
    url: null
  },
  RIVER: {
    index: 14,
    key: "river",
    string: "河川",
    group: "地理情報",
    url: "https://s3-ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/tile/river/{z}/{x}/{y}.png"
  },
  REGION_NAME: {
    index: 15,
    key: "regionName",
    string: "地域名(大字)",
    group: "地理情報",
    url: "https://s3-ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/tile/border_admintown/{z}/{x}/{y}.png"
  },
  SHELTER: {
    index: 16,
    key: "shelter",
    string: "指定避難所",
    group: "地理情報",
    url: null
  },
  EMERGENCY_SHELTER: {
    index: 17,
    key: "emergencyShelter",
    string: "指定緊急避難場所",
    group: "地理情報",
    url: null,
  },
  KYUTOMARIGAWA: {
    index: 18,
    key: "kyutomarigawa",
    string: "休泊川特定都市河川流域界",
    group: "地理情報",
    url: null
  },
  getFeatureFromIndex(index) {
    return _.find(this, feature => {
      return _.isMatch(feature, { index: index });
    });
  }
};
import _ from "lodash";
