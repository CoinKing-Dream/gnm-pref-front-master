<template>
  <l-geo-json
    :geojson="selectedDateRiskData.lines"
    :options="{ style: styleFunction }"
  ></l-geo-json>
</template>

<script>
import { LGeoJson } from "vue2-leaflet";
export default {
  name: "GeojsonLayer",
  props: {
    selectedDateRiskData: {
      type: Object,
      require: true,
    }
  },
  components: {
    LGeoJson,
  },
  methods: {
    styleFunction(feature) {
      const style = {
        weight: 2,
        color: "#85bcff",
        opacity: 1,
        fillColor: "#85bcff",
        fillOpacity: 0.2,
        "fill-outline-color": "rgba(255,255,255,0.0)",
        outlineColor: "blue"
      };

      if (feature.properties.level && feature.properties.level === 1) {
        style.weight= 10;
        style.color = "yellow";
        style.fillColor = "yellow";
      } else if (feature.properties.level && feature.properties.level === 2) {
        style.weight= 10;
        style.color = "red";
        style.fillColor = "red";
      } else if (feature.properties.level && feature.properties.level === 3) {
        style.weight= 10;
        style.color = "black";
        style.fillColor = "black";
      }

      return style;
    },
  },
};
</script>

<style scoped></style>
