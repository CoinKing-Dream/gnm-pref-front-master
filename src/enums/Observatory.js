//import conf from "../config";
import _ from "lodash";
export const Observatory = {
  RAIN: {
    index: 1,
    key: "rain",
    string: "雨量",
  },
  RIVER_LEVEL: {
    index: 4,
    key: "riverLevel",
    string: "水位",
  },
  DAM: {
    index: 7,
    key: "dam",
    string: "ダム",
  },
  CAMERA: {
    index: 30,
    key: "camera",
    string: "ライブカメラ（静止画）",
  },
  VIDEO: {
    index: 50,
    key: "video",
    string: "ライブカメラ（動画）",
  },
  getObservatoryFromIndex(index) {
    return _.find(this, observatory => {
      return _.isMatch(observatory, { index: index });
    });
  },
  getObservatoryFromString(string) {
    return _.find(this, observatory => {
      return _.isMatch(observatory, { string: string });
    });
  }
};
