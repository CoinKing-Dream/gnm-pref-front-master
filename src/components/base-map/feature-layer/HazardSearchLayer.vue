<template> </template>

<script>
import L from "leaflet";
import { rootGetters } from "@/store/store-functions";
import axios from "axios";
export default {
  name: "HazardSearchLayer",
  inject: {
    baseMapData: {
      default: [],
    },
  },
  data() {
    return {
      marker: null,
    };
  },
  computed: {
    map() {
      return this.$store.getters[rootGetters.MAP_OBJECT](
          this.baseMapData.storeId
      );
    },
    hazardSearchMode() {
      return this.$store.getters[rootGetters.HAZARD_SEARCH_MODE](
          this.baseMapData.storeId
      );
    },
  },
  watch: {
    hazardSearchMode() {
      if (this.hazardSearchMode) {
        this.map.on("click", this.popupHazardInfo);
      } else {
        this.map.closePopup();
        if (this.marker) {
          this.map.removeLayer(this.marker);
        }
        this.map.off("click", this.popupHazardInfo);
      }
    },
  },
  methods: {
    async popupHazardInfo(e) {
      if (this.marker) {
        this.map.removeLayer(this.marker);
      }
      this.marker = L.marker(e.latlng);
      const url = `https://gcdnaj43fi.execute-api.ap-northeast-1.amazonaws.com/prod/hazard?lat=${e.latlng.lat}&lng=${e.latlng.lng}`;
      const response = await axios.get(url);
      if (
          response === null ||
          response.data === undefined ||
          response.data.contents === undefined
      ) {
        this.map.closePopup();
        return;
      }
      const contents = response.data.contents;
      const getContent = (c) => {
        let title = c.name;
        if (title.includes("土砂災害警戒区域等・")) {
          title = c.name.replace("土砂災害警戒区域等・", "");
        }
        if (title.includes("家屋倒壊等氾濫想定区域・")) {
          title = c.name.replace("家屋倒壊等氾濫想定区域・", "");
        }
        const titleClass =
            c.name.includes("土砂災害警戒区域等") ||
            c.name.includes("家屋倒壊等氾濫想定区域")
                ? "popup-dosya-title"
                : "popup-title";

        let val = c.value === "" ? "なし" : c.value;
        if (c.rgb) {
          const rgb = c.rgb.join(",");
          const fontColor =
              rgb === "180,0,104" ||
              rgb === "0,65,255" ||
              rgb === "96,0,96" ||
              val === "特別警戒区域"
                  ? "white"
                  : "black";
          val = `<span style="color: ${fontColor}; padding: 0 5px; background: rgb(${rgb})">${val}</span>`;
        }
        return (
            '<div class="d-flex">' +
            `<div class="${titleClass}">${title}</div>` +
            "<div>：</div>" +
            `<div>${val}</div>` +
            "</div>"
        );
      };
      let popupContent = "<h4>この場所の自然災害リスクは？</h4>";
      let content = contents.find(
          (c) => c.name === "洪水浸水想定区域(想定最大)"
      );
      if (content !== undefined) {
        popupContent += getContent(content);
      }
      content = contents.find((c) => c.name === "浸水継続時間(想定最大)");
      if (content !== undefined) {
        popupContent += getContent(content);
      }

      popupContent += "<div>家屋倒壊等氾濫想定区域</div>";
      content = contents.find(
          (c) => c.name === "家屋倒壊等氾濫想定区域・氾濫流"
      );
      if (content !== undefined) {
        popupContent += getContent(content);
      }
      content = contents.find(
          (c) => c.name === "家屋倒壊等氾濫想定区域・河岸侵食"
      );
      if (content !== undefined) {
        popupContent += getContent(content);
      }

      popupContent += "<div>土砂災害警戒区域等</div>";
      content = contents.find((c) => c.name.includes("急傾斜地の崩壊"));
      if (content !== undefined) {
        popupContent += getContent(content);
      }
      content = contents.find((c) => c.name.includes("土石流"));
      if (content !== undefined) {
        popupContent += getContent(content);
      }
      content = contents.find((c) => c.name.includes("地すべり"));
      if (content !== undefined) {
        popupContent += getContent(content);
      }
      this.marker.bindPopup(popupContent).addTo(this.map).openPopup();
    },
  },
};
</script>

<style>
.popup-dosya-title {
  padding-left: 10px;
  width: 110px;
}
.leaflet-popup-content {
  max-width: 300px;
  width: 300px;
}
.popup-title {
  width: 170px;
}
</style>
