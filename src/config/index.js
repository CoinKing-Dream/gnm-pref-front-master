/* eslint-disable */
const confs = {
    development: {
      apiServer: {
        url: "http://localhost:3000"
      },
      mobileApiServer: {
        url: "https://api.suibou-gunma.jp",
      }
    },
    staging: {
      apiServer: {
        url: window.location.origin
      },
      mobileApiServer: {
        url: "https://api.suibou-gunma.jp",
      }
    },
    production: {
      apiServer: {
        url: window.location.origin
      },
      mobileApiServer: {
        url: "https://api.suibou-gunma.jp",
      }
    }
  },
  
  staticConf = {
    tileServer: {
      url: "https://cyberjapandata.gsi.go.jp"
    },
    staticServer: {
      url: "https://s3-ap-northeast-1.amazonaws.com"
    },
    dataServer: {
      url: "http://153.122.172.51"
    }
  },
  
  env = require("./current.config"),
  
  custom = env.custom;

let config = confs[env.current]
if (custom) {
  config = custom
  if (custom['devServer'] && !custom['apiServer']) {
    custom.apiServer = {
      host: custom.devServer.host,
      port: custom.devServer.port
    }
  }
}
  
if (env.current === 'development') console.log("env", env.current);
if (process.env.NODE_ENV === 'cluster') console.log("env", process.env.NODE_ENV);

module.exports = Object.assign(staticConf, config);
