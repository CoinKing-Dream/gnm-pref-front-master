<template> </template>

<script>
import _ from "lodash";
import { rootGetters } from "@/store/store-functions";
import axios from "axios";
import L from "leaflet";

export default {
  name: "HairyosyaLayer",
  inject: {
    baseMapData: {
      default: [],
    },
  },
  data() {
    return {
      tileLayer: null,
      vectorLayer: null,
      targetId: null,
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
          this.baseMapData.storeId
      );
    },
  },
  async created() {
    this.map.createPane("labels");
    this.map.getPane("labels").style.zIndex = 600;

    this.vectorTileAddToMap();
    L.GridLayer.Hairyosya = L.GridLayer.extend({
      createTile: (coords) => {
        return document.createElement("div");
      },
    });
    this.tileLayer = new L.GridLayer.Hairyosya({
      maxNativeZoom: 15,
    }).addTo(this.map);

    this.tileLayer.on("tileload", this.onTileLoad);
    this.map.on("zoomstart", this.onZoomStart);
    this.map.on("zoomend", this.onZoomEnd);
  },
  beforeDestroy() {
    if (this.map) {
      this.tileLayer.off("tileload", this.onTileLoad);
      this.vectorTileRemoveToMap();

      this.map.off("zoomstart", this.onZoomStart);
      this.map.off("zoomend", this.onZoomEnd);
    }
  },
  methods: {
    vectorTileAddToMap() {
      const buildPopupTemplate = this.buildPopupTemplate;
      const zoom = this.map.getZoom();
      this.vectorTile = L.geoJSON(null, {
        pointToLayer: (feature, latlng) => {
          const sites = feature.properties.sites;
          const length = sites.length;
          const marker = L.circleMarker(
              latlng,
              length === 1 || zoom >= 17
                  ? this.getMarker(sites, zoom)
                  : this.getMultipleMarker()
          );

          if (zoom >= 17) {
            let string = "";
            let tooltipOptions = { direction: "top" };

            _.forEach(sites, (site) => {
              string += `<span style="color:${this.getColor(
                  site
              )}; font-weight: bolder">◎</span> ${site["名称"]} / ${
                  site["区分"]
              }<br>`;
              if (this.targetId === site.id) {
                tooltipOptions.permanent = true;
              }
            });

            marker.bindTooltip(string, tooltipOptions);
          }

          return marker;
        },
        onEachFeature: (feature, layer) => {
          layer.bindPopup(buildPopupTemplate(feature));
        },
      }).addTo(this.map);
    },
    getMultipleMarker() {
      return {
        radius: 20,
        fillOpacity: 0.4,
        color: "rgba(0,0,0,0)",
        fillColor: "red",
        pane: "labels",
      };
    },
    getMarker(sites, zoom) {
      let color = this.getColor(sites[0]);
      let fillColor = "rgba(0,0,0,0)";
      if (zoom >= 17 && sites.length > 1) {
        color = this.getColor(sites[0]);
        const secondSite = _.find(sites, (site) => {
          return color !== this.getColor(site);
        });

        fillColor = secondSite ? this.getColor(secondSite) : color;
      }
      return {
        radius: 5,
        color,
        fillColor,
        fillOpacity: 1,
        pane: "labels",
      };
    },
    getColor(site) {
      const type = site["分類コード"];
      let color = "black";
      switch (type) {
        case 1:
          color = "red";
          break;
        case 2:
          color = "green";
          break;
        case 3:
          color = "blue";
          break;
      }
      return color;
    },
    buildPopupTemplate(feature) {
      const sites = feature.properties.sites;

      const template = L.DomUtil.create("div");
      template.setAttribute("class", "hairyosya-popup");
      _.forEach(sites, (site) => {
        this.buildPopupButton(site, feature, template);
      });

      return template;
    },
    buildPopupButton(site, feature, container) {
      const btn = L.DomUtil.create("button", "", container);
      const latlng = [feature.properties.lat, feature.properties.lng];
      L.DomEvent.on(btn, "click", () => {
        this.moveToPlace(site, latlng);
      });

      btn.setAttribute("class", "hairyosya-popup-button");
      btn.innerHTML = `${site["名称"]} / ${site["区分"]} / ${site["分類"]}`;
      return btn;
    },
    moveToPlace(site, latlng) {
      this.map.setView(latlng, 17);
      this.targetId = site.id;
    },
    vectorTileRemoveToMap() {
      if (this.vectorTile) {
        this.vectorTile.clearLayers();
        this.map.removeLayer(this.vectorTile);
      }
    },
    async onTileLoad(event) {
      const vectorTileId = _.cloneDeep(this.vectorTile._leaflet_id);
      const coords = event.coords;
      let [err, data] = await this.loadJson(coords);
      if (err) {
        return;
      }

      //sites.分類.区分.名称
      const features = _.map(data, (o) => {
        return {
          type: "Feature",
          properties: {
            sites: o.sites,
            lat: o.latitude,
            lng: o.longitude,
          },
          geometry: {
            type: "Point",
            coordinates: [o.longitude, o.latitude],
          },
        };
      });
      const geojson = {
        type: "FeatureCollection",
        features,
      };
      if (this.vectorTile._leaflet_id === vectorTileId) {
        this.vectorTile.addData(geojson);
      }
      if (this.targetId) {
        const feature = _.find(features, (feature) => {
          return _.find(feature.properties.sites, { id: this.targetId });
        });
        if (feature) {
          this.$nextTick(() => {
            this.map.panTo(
                [feature.properties.lat, feature.properties.lng],
                17
            );
            this.targetId = null;
          });
        }
      }
    },
    onZoomStart() {
      this.vectorTileRemoveToMap();
    },
    onZoomEnd() {
      this.vectorTileAddToMap();
    },
    async loadJson(coords) {
      return axios
          .create({
            responseType: "json",
          })
          .get(
              `https://s3.ap-northeast-1.amazonaws.com/ctie.gnm-pref.web/static/tile/yohairyosya/${coords.z}/${coords.x}/${coords.y}.json`
          )
          .then((response) => {
            return [null, response.data];
          })
          .catch((err) => [err]);
    },
  },
};
</script>

<style lang="scss">
.hairyosya-popup {
  max-height: 300px;
  overflow: scroll;
}
.hairyosya-popup-button {
  text-align: left;
  margin-bottom: 5px;
  padding: 5px;
  border: 1px solid black;
  width: 100%;
  border-radius: 10px;
  h5 {
    margin-bottom: 0px;
  }
}
.hairyosya-popup-button:hover {
  background-color: #eeeeee;
}
.hairyosya-popup-button:last-child {
  margin-bottom: 0;
}
</style>
