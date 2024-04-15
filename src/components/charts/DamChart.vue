<script>
import { Line } from "vue-chartjs";
import _ from "lodash";
import moment from "moment";

import WarningLevels from "@/enums/WarningLevels";

const COLOR = {
  LABEL: "#01163F",
  QIN_ALL: "#91C46C",
  QOUT_ALL: "RED",
};
const BORDER_WIDTH = 2;

export default {
  mixins: [WarningLevels],
  name: "DamChart",
  extends: Line,
  props: {
    reverse: {
      type: Boolean,
      required: false,
      default: false,
    },
    miniMode: {
      default: false,
      type: Boolean,
    },
    //initRains: {
    initLevels: {
      type: Array,
      required: true,
    },
    initTimes: {
      type: Array,
      required: true,
    },
    qinAlls: {
      type: Array,
      default: () => [],
      required: false,
    },
    qoutAlls: {
      type: Array,
      default: () => [],
      required: false,
    },
    baseDate: {
      type: Object,
      required: true,
    },
    latestRealDate: {
      type: Object,
      required: true,
    },
    warningLines: {
      type: Array,
      required: false,
      default: () => [],
    },
    landform: {
      type: Array,
      required: false,
      default: () => [],
    },
  },
  data() {
    return {
      levels: [],
      times: [],
      datacollection: {
        labels: [],
        datasets: [
          {
            type: "line",
            label: "貯水位",
            yAxisID: "level",
            xAxisID: "data",
            unit: "m",
            fill: false,
            borderWidth: BORDER_WIDTH,
            borderColor: COLOR.LABEL,
            backgroundColor: COLOR.LABEL,
            tooltipLabelColor: COLOR.LABEL,
            pointBackgroundColor: "white",
            pointRadius: 2,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
          {
            type: "line",
            label: "貯水位",
            yAxisID: "level",
            xAxisID: "data",
            unit: "m",
            fill: false,
            borderWidth: 3,
            borderDash: [10, 5],
            borderColor: "#3734dc",
            backgroundColor: "#3734dc",
            tooltipLabelColor: "#3734dc",
            pointBorderColor: "#3734dc",
            pointBackgroundColor: "white",
            pointRadius: 0,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
          {
            type: "line",
            label: "流入量",
            yAxisID: "qAll",
            xAxisID: "data",
            unit: "m3/s",
            fill: false,
            borderWidth: BORDER_WIDTH,
            borderColor: COLOR.QIN_ALL,
            backgroundColor: COLOR.QIN_ALL,
            tooltipLabelColor: COLOR.QIN_ALL,
            pointBackgroundColor: "white",
            pointRadius: 2,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
          {
            type: "line",
            label: "流入量",
            yAxisID: "qAll",
            xAxisID: "data",
            unit: "m3/s",
            fill: false,
            borderWidth: BORDER_WIDTH,
            borderDash: [10, 5],
            borderColor: COLOR.QIN_ALL,
            backgroundColor: COLOR.QIN_ALL,
            tooltipLabelColor: COLOR.QIN_ALL,
            pointBackgroundColor: "white",
            pointRadius: 0,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
          {
            type: "line",
            label: "放流量",
            yAxisID: "qAll",
            xAxisID: "data",
            unit: "m3/s",
            pointBackgroundColor: "white",
            fill: false,
            borderWidth: BORDER_WIDTH,
            borderColor: COLOR.QOUT_ALL,
            backgroundColor: COLOR.QOUT_ALL,
            tooltipLabelColor: COLOR.QOUT_ALL,
            pointRadius: 2,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
          {
            type: "line",
            label: "放流量",
            yAxisID: "qAll",
            xAxisID: "data",
            unit: "m3/s",
            pointBackgroundColor: "white",
            fill: false,
            borderWidth: BORDER_WIDTH,
            borderDash: [10, 5],
            borderColor: COLOR.QOUT_ALL,
            backgroundColor: COLOR.QOUT_ALL,
            tooltipLabelColor: COLOR.QOUT_ALL,
            pointRadius: 0,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
        ],
      },

      options: {
        layout: {
          padding: { right: 0, left: 0 },
        },
        scales: {
          yAxes: [
            {
              id: "level",
              position: "left",
              type: "linear",
              ticks: {
                reverse: this.reverse,
                display: !this.miniMode,
                max: 5,
                min: 0,
                stepSize: 1,
                beginAtZero: true,
                callback: (label /*, index, labels*/) => {
                  return ("　　　　　  " + parseFloat(label).toFixed(1)).slice(
                    -5
                  );
                },
              },
              gridLines: {
                display: !this.miniMode,
              },
            },
            {
              id: "qAll",
              position: "right",
              type: "linear",
              ticks: {
                reverse: this.reverse,
                display: !this.miniMode,
                min: 0,
                max: 30,
                //autoSkip: false,
                stepSize: 0.5,
                beginAtZero: false,
              },
              gridLines: {
                display: false, //!this.miniMode,
                color: COLOR.QIN_ALL,
              },
            },
          ],
          xAxes: [
            {
              id: "data",
              type: "time",
              time: {
                tooltipFormat:'MM/DD HH:mm',
                displayFormats: {
                  minute: "HH:mm",
                  hour: "HH:mm",
                  day: "HH:mm",
                  week: "HH:mm",
                  month: "HH:mm",
                },
              },
              position: "bottom",
              gridLines: {
                display: !this.miniMode,
              },
              ticks: {
                fontColor: "#9a9a9a",
                display: !this.miniMode,
                beginAtZero: true,
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
              },
              categoryPercentage: 1.0,
              barPercentage: 1.0,
            },
          ],
        },
        legend: {
          display: false,
        },
        tooltips: {
          enabled: !this.miniMode,
          mode: "index",
          intersect: false,
          callbacks: {
            labelColor: function (tooltipItem, chart) {
              const dataset =
                chart.config.data.datasets[tooltipItem.datasetIndex];
              return {
                backgroundColor: dataset.tooltipLabelColor,
              };
            },
            label: function (tooltipItem, data) {
              const label = data.datasets[tooltipItem.datasetIndex].label;
              const unit = data.datasets[tooltipItem.datasetIndex].unit;
              return (
                label +
                " : " +
                data.datasets[tooltipItem.datasetIndex].data[
                  tooltipItem.index
                ] +
                " " +
                unit
              );
            },
          },
        },
        hover: {
          mode: "index",
          intersect: false,
        },
        groundDataset: [],
        annotation: {
          events: ["click", "dblclick", "mouseover", "mouseout"],
          annotations: [
            {
              type: "box",
              drawTime: "beforeDatasetsDraw",
              yScaleID: "level",
              borderColor: "rgba(0,0,0,0)",
              yMin: 0,
              yMax: 0,
              backgroundColor: "#3D8AFF",
            },
            {
              type: "line",
              mode: "vertical",
              scaleID: "data",
              value: this.baseDate.toDate(),
              borderColor: "#FF0000",
              borderWidth: 1.5,
              label: {
                content: this.miniMode ? "" : "現在",
                position: "top",
                enabled: true,
              },
            },
          ],
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  watch: {
    initLevels() {
      this.levels = _.cloneDeep(this.initLevels);
      this.times = _.cloneDeep(this.initTimes);
      this.setLabelData();
      this.setData();
      this.setLandformData();
      this.setYAxesLimitData();
      this.setWarningLevelStrokeData();
      this.setWaterBoxData();

      this.renderChart(this.datacollection, this.options);
    },
  },
  created() {
    this.levels = _.cloneDeep(this.initLevels);
    this.times = _.cloneDeep(this.initTimes);
  },
  mounted() {
    this.setLabelData();
    this.setData();
    this.setLandformData();
    this.setYAxesLimitData();
    this.setWarningLevelStrokeData();
    this.setWaterBoxData();

    this.addPlugin({
      id: "horizontalLine",
      beforeDatasetsDraw: (chart) => {
        const gSet = chart.config.options.groundDataset;
        if (gSet.length === 0) return;
        const ctxPlugin = chart.chart.ctx;
        const xAxe = chart.scales[chart.config.options.scales.xAxes[0].id];
        const yAxe = chart.scales[chart.config.options.scales.yAxes[0].id];
        const minGround = _.minBy(gSet, (o) => {
          return o[0];
        });
        const maxGround = _.maxBy(gSet, (o) => {
          return o[0];
        });

        ctxPlugin.strokeStyle = "red";
        ctxPlugin.lineWidth = 2;
        ctxPlugin.beginPath();
        ctxPlugin.moveTo(xAxe.left, yAxe.bottom);
        for (let i = 0; i < gSet.length; i++) {
          let x = gSet[i][0] - minGround[0];
          x = (x / (maxGround[0] - minGround[0])) * xAxe.width + xAxe.left;

          let y = yAxe.max - yAxe.min - (gSet[i][1] - yAxe.min);
          y = (y / (yAxe.max - yAxe.min)) * yAxe.height + yAxe.top;
          ctxPlugin.lineTo(x, y);
        }
        ctxPlugin.lineTo(xAxe.right, yAxe.bottom);
        ctxPlugin.lineTo(xAxe.left, yAxe.bottom);
        ctxPlugin.closePath();
        ctxPlugin.fillStyle = "#f1eeea";
        ctxPlugin.fill();
      },
    });

    this.renderChart(this.datacollection, this.options);
  },
  methods: {
    setLabelData() {
      this.datacollection.labels = _.map(this.times, (time) => {
        return moment
          .utc(time, "YYYY/MM/DD HH:mm")
          .toDate();
      });
    },
    setData() {
      const latestRealDateIndex = _.findLastIndex(this.times, (o) => {
        return moment.utc(o, "YYYY/MM/DD HH:mm").isSameOrBefore(this.latestRealDate);
      });
      const getPastData = (tag) => {
        return _.fill(_.cloneDeep(tag), null, latestRealDateIndex + 1);
      };
      const getFuturetData = (tag) => {
        return _.fill(_.cloneDeep(tag), null, 0, latestRealDateIndex + 1);
      };

      this.datacollection.datasets[0].data = getPastData(this.levels);
      this.datacollection.datasets[1].data = getFuturetData(this.levels);

      this.datacollection.datasets[2].data = getPastData(this.qinAlls);
      this.datacollection.datasets[3].data = getFuturetData(this.qinAlls);

      this.datacollection.datasets[4].data = getPastData(this.qoutAlls);
      this.datacollection.datasets[5].data = getFuturetData(this.qoutAlls);
    },

    setWaterBoxData() {
      const latestRealDateIndex = _.findLastIndex(this.times, (o) => {
        return moment.utc(o, "YYYY/MM/DD HH:mm").isSameOrBefore(this.latestRealDate);
      });

      const pastData = this.levels.slice(0, latestRealDateIndex - 2);

      const blueAreaY = _.findLast(pastData, (level) => {
        return level !== null;
      });

      const blueAreaYMax = blueAreaY
        ? blueAreaY
        : this.options.scales.yAxes[0].ticks.min;
      this.options.annotation.annotations[0].yMax = blueAreaYMax;
      this.options.annotation.annotations[0].yMin = this.options.scales.yAxes[0].ticks.min;
    },

    setYAxesLimitData() {
      const warningMin = _.find(this.warningLines, { key: "normalMinLevel" }).detals[0].value;
      this.options.scales.yAxes[0].ticks.min = warningMin - 1

      const levelMax = parseFloat(_.max(this.levels));
      if (this.landform.length > 0) {
        const landformYMax = _.maxBy(this.landform, (o) => {
          return o[1];
        });

        if (landformYMax) {
          const max = landformYMax[1] > levelMax ? landformYMax[1] : levelMax;
          this.options.scales.yAxes[0].ticks.max = max + 1;
        }
      } else {
        this.options.scales.yAxes[0].ticks.max = levelMax + 5;
      }

      const qMax = Number(
        _.maxBy(_.concat(this.qinAlls, this.qoutAlls), (v) => {
          return parseInt(v);
        })
      );
      if (qMax > this.options.scales.yAxes[1].ticks.max)
        this.options.scales.yAxes[1].ticks.max = qMax + 1;
    },
    setLandformData() {
      if (this.landform.length > 0) {
        this.options.groundDataset = this.landform;
      }
    },
    setWarningLevelStrokeData() {
      this.warningLevels(this.warningLines, this.baseDate, (warningIno) => {
        this.options.annotation.annotations.push(
          this.getAnnotationObject(warningIno)
        );
      });
    },

    getAnnotationObject(warningInfo) {
      return {
        type: "line",
        mode: "horizontal",
        scaleID: "level",
        value: warningInfo.value,
        borderColor: warningInfo.color,
        borderWidth: 0.8,
      };
    },
  },
};
</script>
