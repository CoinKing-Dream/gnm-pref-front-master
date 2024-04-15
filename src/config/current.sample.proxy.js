/***************************************
 * developmentの場合：
 * ※ devServerの設定変更も可能です。
 ***************************************/
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

const DEV_HOST = "localhost";  // 開発PCのホスト名 OR IP
const API_HOST = "stage.gunma-suigai-risk.jp";  // APIのホスト名 OR IP
module.exports = {
  current: "development",
  // 追加およびオーバーライトの部分を記述する
  custom:{
    // devServerの設定変更場合
    devServer: {
      host: DEV_HOST, // 省略の場合は localhostになる
      port:8000       // 省略の場合は 8080になる
    },
    // apiServerProxyの設定
    apiProxy: {
      host: API_HOST,
      api: 80,
      socket: 80  //Apiと同じポート：3000、 ソケット独自ポート：3030
    }
  }
};
