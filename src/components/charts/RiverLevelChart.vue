<script>
import { Bar } from "vue-chartjs";
import _ from "lodash";
import moment from "moment";
export default {
  name: "RiverLevelChart",
  extends: Bar,
  props: {
    miniMode: {
      default: false,
      type: Boolean,
    },
    initRiverLevels: {
      type: Array,
      required: true,
    },
    observatoryId: {
      type: String,
      required: true,
    },
    baseDate: {
      type: Object,
      required: true,
    },
    latestRealDate: {
      type: [Object, null],
      required: false,
    },
    standbyLevel: {
      type: Number,
      required: false,
      default: -1,
    },
    startStage: {
      type: Number,
      required: false,
      default: -1,
    },
    warningLevel: {
      type: Number,
      required: false,
      default: -1,
    },
    evacuationLevel: {
      type: Number,
      required: false,
      default: -1,
    },
    dangerousLevel: {
      type: Number,
      required: false,
      default: -1,
    },
    outbreakLevel: {
      type: Number,
      required: false,
      default: -1,
    },
    landform: {
      type: Array,
      required: false,
      default: () => [],
    },
    initTimes: {
      type: Array,
      required: true,
    },
    minDate: {
      type: [Object, null],
      required: false,
    },
    maxDate: {
      type: [Object, null],
      required: false,
    }
  },
  data() {
    return {
      riverLevels: [],
      times: [],
      warningInfos: {
        startStage: {
          color: "#22b022",
          label: "観測開始水位",
          value: this.startStage,
        },
        standby: {
          color: "#008000",
          label: "水防団待機水位",
          value: this.standbyLevel,
        },
        warning: {
          color: "#f2e700",
          label: "氾濫注意水位",
          value: this.warningLevel,
        },
        evacuation: {
          color: "#ff2800",
          label: "避難判断水位",
          value: this.evacuationLevel,
        },
        dangerous: {
          color: "#aa00aa",
          label: "氾濫危険水位",
          value: this.dangerousLevel,
        },
        outbreak: {
          color: "#000000",
          label: "氾濫発生水位",
          value: this.outbreakLevel,
        },
      },
      datacollection: {
        labels: [],
        datasets: [
          {
            type: "line",
            label: "水位",
            unit: "m",
            pointBackgroundColor: "white",
            fill: false,
            yAxisID: "riverLevel",
            borderWidth: 2,
            borderColor: "#01163F",
            backgroundColor: "#01163F",
            pointBorderColor: "#01163F",
            pointRadius: 2,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
          {
            type: "line",
            label: "水位",
            unit: "m",
            pointBackgroundColor: "white",
            fill: false,
            yAxisID: "riverLevel",
            borderWidth: 3,
            borderColor: "#3734dc",
            backgroundColor: "#3734dc",
            pointBorderColor: "#3734dc",
            borderDash: [10, 5],
            pointRadius: 0,
            pointHitRadius: 0,
            lineTension: 0,
            data: [],
            spanGaps: true,
          },
        ],
      },
      //Chart.js options that controls the appearance of the chart
      options: {
        layout: {
          padding: {
            right: 0,
          },
        },
        scales: {
          yAxes: [
            {
              id: "riverLevel",
              gridLines: {
                display: false,
              },
              ticks: {
                max: 8,
                min: 0,
                callback: (label /*, index, labels*/) => {
                  return parseFloat(label).toFixed(1);
                },
              },
            },
          ],
          xAxes: [
            {
              id: "data",
              type: "time",
              time: {
                tooltipFormat: "MM/DD HH:mm",
                displayFormats: {
                  minute: "HH:mm",
                  hour: "HH:mm",
                  day: "HH:mm",
                  week: "HH:mm",
                  month: "HH:mm",
                },
              },
              ticks: {
                min: this.minDate.toDate(),
                max : this.maxDate.toDate(),
                display: false,
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
              },
              gridLines: {
                display: false,
              },
              categoryPercentage: 1.0,
              barPercentage: 1.0,
            },
          ],
        },
        legend: {
          display: false,
          position: "bottom",
          labels: {
            filter: function (item) {
              return !item.text.includes("Data");
            },
          },
        },
        tooltips: {
          enabled: false,
          mode: "index",
          intersect: false,
          filter: function (tooltipItem) {
            return (
              tooltipItem.datasetIndex === 0 || tooltipItem.datasetIndex === 1
            );
          },
          callbacks: {
            labelColor: function (tooltipItem, chart) {
              const dataset =
                chart.config.data.datasets[tooltipItem.datasetIndex];
              return {
                backgroundColor: dataset.backgroundColor,
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
              yScaleID: "riverLevel",
              borderColor: "rgba(0,0,0,0)",
              yMin: 0,
              yMax: 0,
              backgroundColor: "#3D8AFF",
            },
            {
              type: "line",
              mode: "vertical",
              scaleID: "data",
              value: "06:10",
              borderColor: "#FF0000",
              borderWidth: 1.5,
              label: {
                content: "現在",
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
    initRiverLevels() {
      this.riverLevels = _.cloneDeep(this.initRiverLevels);
      this.times = _.cloneDeep(this.initTimes);

      this.setLabelData();
      this.setRiverLevelData();
      this.setYAxesLimitData();
      this.setLandformData();
      this.setWarningLevelStrokeData();
      this.setNowStrokeData();
      this.setWaterBoxData();
      this.setMiniModeOptions();

      this.renderChart(this.datacollection, this.options);
    },
  },
  created() {
    this.riverLevels = _.cloneDeep(this.initRiverLevels);
    this.times = _.cloneDeep(this.initTimes);
  },
  mounted() {
    this.setLabelData();
    this.setRiverLevelData();
    this.setYAxesLimitData();
    this.setLandformData();
    this.setWarningLevelStrokeData();
    this.setNowStrokeData();
    this.setWaterBoxData();
    this.setMiniModeOptions();

    this.addPlugin({
      id: "horizontalLine",
      beforeDatasetsDraw: (chart) => {
        const groundDataset = chart.config.options.groundDataset;
        if (groundDataset.length > 0) {
          const ctxPlugin = chart.chart.ctx;
          const xAxe = chart.scales[chart.config.options.scales.xAxes[0].id];
          const yAxe = chart.scales[chart.config.options.scales.yAxes[0].id];

          const minGround = _.minBy(groundDataset, (o) => {
            return o[0];
          });
          const maxGround = _.maxBy(groundDataset, (o) => {
            return o[0];
          });

          ctxPlugin.strokeStyle = "red";
          ctxPlugin.beginPath();
          ctxPlugin.moveTo(xAxe.left, yAxe.bottom);
          for (let i = 0; i < groundDataset.length; i++) {
            let x = groundDataset[i][0] - minGround[0];
            x = (x / (maxGround[0] - minGround[0])) * xAxe.width + xAxe.left;

            let y = yAxe.max - yAxe.min - (groundDataset[i][1] - yAxe.min);
            y = (y / (yAxe.max - yAxe.min)) * yAxe.height + yAxe.top;

            ctxPlugin.lineTo(x, y);
          }
          ctxPlugin.lineTo(xAxe.right, yAxe.bottom);
          ctxPlugin.lineTo(xAxe.left, yAxe.bottom);
          ctxPlugin.closePath();
          ctxPlugin.fillStyle = "#f1eeea";
          ctxPlugin.fill();
        }
      },
    });

    //renderChart function renders the chart with the datacollection and options object.
    this.renderChart(this.datacollection, this.options);
  },
  methods: {
    setLabelData() {
      let labels = _.map(this.times, (time) => {
        return moment.utc(time, "YYYY/MM/DD HH:mm").toDate();
      });

      this.datacollection.labels = labels;
    },
    setRiverLevelData() {
      let pastData = [];
      let futureData = [];
      if(!this.latestRealDate) {
        if (this.riverLevels.length > 0) {
          futureData = this.riverLevels;
        }
      } else {
        const latestRealDateIndex = _.findLastIndex(this.times, (o) => {
          return moment.utc(o, "YYYY/MM/DD HH:mm").isSameOrBefore(this.latestRealDate);
        });

        pastData = _.fill(
            _.cloneDeep(this.riverLevels),
            null,
            latestRealDateIndex + 1
        );

        futureData = _.fill(
            _.cloneDeep(this.riverLevels),
            null,
            0,
            latestRealDateIndex + 1
        );
      }

      this.datacollection.datasets[0].data = pastData;
      this.datacollection.datasets[1].data = futureData;
    },
    setNowStrokeData() {
      this.options.annotation.annotations[1].value = this.baseDate.toDate();
      this.options.annotation.annotations[1].label.content = this.miniMode
        ? ""
        : "現在";
    },
    setWaterBoxData() {
      const latestRealDateIndex = _.findLastIndex(this.times, (o) => {
        return moment.utc(o, "YYYY/MM/DD HH:mm").isSameOrBefore(this.latestRealDate);
      });

      const pastData = this.riverLevels.slice(0, latestRealDateIndex);

      const blueAreaY = _.findLast(pastData, (level) => {
        return level !== null;
      });
      const blueAreaYMax = blueAreaY
        ? blueAreaY
        : this.options.scales.yAxes[0].ticks.min;
      this.options.annotation.annotations[0].yMax = blueAreaYMax;

      if (blueAreaYMax) {
        this.options.annotation.annotations[0].yMin = this.options.scales.yAxes[0].ticks.min;
      }
    },
    setLandformData() {
      if (this.landform.length > 0) {
        this.options.groundDataset = this.landform;
      }
    },
    setYAxesLimitData() {
      if (this.landform.length > 0) {
        const landformYMin = _.minBy(this.landform, (o) => {
          return o[1];
        });
        const landformYMax = _.maxBy(this.landform, (o) => {
          return o[1];
        });

        if (landformYMin) {
          const riverLevelMin = parseFloat(_.min(this.riverLevels)) - 1;
          const landformYMinValue = landformYMin[1] - 0.5;

          if (landformYMinValue > riverLevelMin) {
            this.options.scales.yAxes[0].ticks.min = riverLevelMin;
            this.options.annotation.annotations[0].yMin = riverLevelMin;
          } else {
            this.options.scales.yAxes[0].ticks.min = landformYMinValue;
            this.options.annotation.annotations[0].yMin = landformYMinValue;
          }
        }

        if (landformYMax) {
          const riverLevelMax = parseFloat(_.max(this.riverLevels)) + 5;
          const landformYMaxValue = landformYMax[1] + 1;
          if (landformYMaxValue < riverLevelMax) {
            this.options.scales.yAxes[0].ticks.max = riverLevelMax;
          } else {
            this.options.scales.yAxes[0].ticks.max = landformYMaxValue;
          }
        }
      } else {
        const yMaxWhiteSpace = 5;
        const yMinWhiteSpace = 1;

        const riverLevelMin = parseFloat(_.min(this.riverLevels));
        const riverLevelMax = parseFloat(_.max(this.riverLevels));

        const levels = _.filter(_.map(this.warningInfos, "value"), (level) => {
          return !(!level || level === -1);
        });

        let warningMin = _.min(levels);
        let warningMax = _.max(levels);

        let yMin =
          !riverLevelMin || warningMin < riverLevelMin
            ? warningMin
            : riverLevelMin;
        yMin -= yMinWhiteSpace;
        let yMax =
          !riverLevelMax || warningMax > riverLevelMax
            ? warningMax
            : riverLevelMax;
        yMax += yMaxWhiteSpace;

        this.options.scales.yAxes[0].ticks.min = yMin;
        this.options.scales.yAxes[0].ticks.max = yMax;
      }
    },
    setWarningLevelStrokeData() {
      this.options.annotation.annotations = [
        {
          type: "box",
          drawTime: "beforeDatasetsDraw",
          yScaleID: "riverLevel",
          borderColor: "rgba(0,0,0,0)",
          yMin: 0,
          yMax: 0,
          backgroundColor: "#3D8AFF",
        },
        {
          type: "line",
          mode: "vertical",
          scaleID: "data",
          value: "06:10",
          borderColor: "#FF0000",
          borderWidth: 1.5,
          label: {
            content: "現在",
            position: "top",
            enabled: true,
          },
        },
      ];
      _.forEach(this.warningInfos, (warningInfo) => {
        if (!warningInfo.value || warningInfo.value === -1) {
          return;
        }
        this.options.annotation.annotations.push(
          this.getAnnotationObject(warningInfo)
        );
      });
    },
    setMiniModeOptions() {
      this.options.layout.padding.right = this.miniMode ? 10 : 0;
      this.options.scales.yAxes[0].gridLines.display = !this.miniMode;
      this.options.scales.xAxes[0].gridLines.display = !this.miniMode;
      this.options.scales.xAxes[0].ticks.display = !this.miniMode;
      this.options.scales.yAxes[0].ticks.display = !this.miniMode;
      this.options.tooltips.enabled = !this.miniMode;

      if (!this.miniMode) {
        this.options.layout.padding.left = 0;
        this.options.scales.yAxes[0].ticks.callback = (
          label /*,index,labels*/
        ) => {
          return ("　　　　　   " + parseFloat(label).toFixed(1)).slice(-6);
        };
      }
    },
    getAnnotationObject(warningInfo) {
      return {
        type: "line",
        mode: "horizontal",
        scaleID: "riverLevel",
        value: warningInfo.value,
        borderColor: warningInfo.color,
        borderWidth: 1.5,
      };
    },
  },
};
</script>
