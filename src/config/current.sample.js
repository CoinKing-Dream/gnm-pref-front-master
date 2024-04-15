// 以下設定３つの中の一つだけ残して
// current.config.jsonを作成する
// apiServerはフロント実行時にApi呼び出しに直接利用される。

/***************************************
 * developmentの場合：
 * ※ devServerの設定変更も可能です。
 ***************************************/
/* -------------------------------------*
 * １．簡単な設定： localhost のみの環境
 * フロントの開発環境の3000ポートにAPI
 * サーバーが動作する場合の指定
 * -------------------------------------*/
module.exports = {
  current: "development",
}

/* -------------------------------------*
 * ２．apiServerの設定： 
 * ・ デフォルト： localhost:3000
 * ・  変更例   ： $ip:$port
 * -------------------------------------*/
module.exports = {
  current: "development",
  // 追加およびオーバーライトの部分を記述する
  custom:{
    // apiServerの設定変更場合
    apiServer: {
      url: `http://192.168.100.100:4000` // デフォルト：http://localhost:3000
    }
  }
}

/* -------------------------------------*
 * ３．ApiはdevServer経由： クラスター環境
 *   および他のPCからも利用する場合など
 * devServerの設定の変更は必要になる。
 * ・ デフォルト： localhost:8080
 * ・  変更例   ： 192.168.100.100:8000
 * 更にApiは別ホストも対応可能
 * ※ apiServerのプロキシ設定も必要になり、
 * 更にソケット通信のポートはApiと分ける
 * ことは可能になる。この場合はapiServerは
 * devServerと同じになる。
 * 
 * ※ 注意：
 * １．devServer：フロントのデバッグ実行間で
 * 　　フロントの配信サーバーになる。
 * ２．apiProxy ：devServer時に動作し、到達した
 * 　　フロントのリクエストをクロスドメインの
 * 　　転送を行うので転送先には制限はない。
  * -------------------------------------*/

const DEV_HOST = "192.168.100.100";  // 開発PCのIP
const API_HOST = "192.168.200.200";  // APIのIP
module.exports = {
  current: "development",
  // 追加およびオーバーライトの部分を記述する
  custom:{
    apiProxy: {
      host: API_HOST,
      api: 3000,
      socket: 3000  //Apiと同じポート：3000、 ソケット独自ポート：3030
    },
    // devServerの設定変更場合
    devServer: {
      host: DEV_HOST, // 省略の場合は localhostになる
      port:8000       // 省略の場合は 8080になる
    }
  }
};

/***************************************
 * stagingの場合：
 ***************************************/
module.exports = {
  current: "staging"
};

/***************************************
 * productionの場合：
 ***************************************/
module.exports = {
  current: "production"
};

/***************************************
 * サーバ設定依存(連動)するの場合：
 ***************************************/
module.exports = {
  current: require("../../srv/configure/current.config").current
};
