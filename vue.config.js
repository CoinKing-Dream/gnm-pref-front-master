/* eslint-disable */
const ansiRegex = require('ansi-regex');
const conf = require('./src/config/current.config').custom || {};
const debug = true

if(debug) console.log("++ conf:", conf)

// setup devServer : no customize port is 8080
const devServer = (()=>{
  if (!conf['devServer']) return {
    port: 8080,
    disableHostCheck: true,
  }
  return {
    host: conf.devServer.host,
    port: conf.devServer.port,
    disableHostCheck: true,
  }
})();

// set proxy to devServer if have apiProxy
((ser)=>{
  if (!conf['apiProxy']) return
  const proxy = {
    host      : conf.apiProxy.host,
    apiPort   : conf.apiProxy.api,
    socketPort: conf.apiProxy.socket
  }
  const socketUrl = `http://${proxy.host}:${proxy.socketPort}`
  const apiUrl    = `http://${proxy.host}:${proxy.apiPort}`
  ser.proxy = {
    '^/websocket': {
      target: socketUrl,
      ws: true,
      changeOrigin: true,
      pathRewrite: p => {if(debug) console.log(conf.apiProxy.socket, p);return p;},
    },
    '^/sockjs-node/':{
      target: socketUrl,
      changeOrigin: true,
      ws: true,
      pathRewrite: p => {if(debug) console.log(conf.apiProxy.socket, p);return p;},
    },
    '^/socket.io':{
      target: socketUrl,
      changeOrigin: true,
      ws: true,
      pathRewrite: p => {if(debug) console.log(conf.apiProxy.socket, p);return p;},
    },
    "/login": {
      target: apiUrl,
      changeOrigin: true,
      pathRewrite: p => {if(debug) console.log(conf.apiProxy.api, p);return p;},
    },
    "^/api/": {
      target: apiUrl,
      changeOrigin: true,
      pathRewrite: p => {if(debug) console.log(conf.apiProxy.api, p);return p;},
    }
  }
})(devServer);

if(debug) console.log("------------------devServer:", devServer)

module.exports = {
  transpileDependencies: [ansiRegex],
  devServer,
  pluginOptions: {
    express: {
      shouldServeApp: true,
      serverDir: "./srv"
    },
    moment: {
      locales: ['ja']
    }
  },

  runtimeCompiler: true,

  css: {
    sourceMap: true
  },
  productionSourceMap: false,
};