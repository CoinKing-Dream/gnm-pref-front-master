import _ from "lodash";
export const Risk = {
  OBSERVATORY: {
    index: 1,
    key: "observatory",
    string: "観測所"
  },
  RAIN: {
    index: 3,
    key: "rain",
    string: "予測降雨"
  },
  SMALL_RIVER_FLOODING: {
    index: 7,
    key: "smallRiver",
    string: "河川・内水氾濫"
  },
  KOUZUI: {
    index: 8,
    key: "kouzui",
    string: "洪水キキクル"
  },
  DOSYA: {
    index: 9,
    key: "dosya",
    string: "土砂キキクル"
  },
  getRiskFromIndex(index) {
    return _.find(this, risk => {
      return _.isMatch(risk, { index: index });
    });
  }
};
