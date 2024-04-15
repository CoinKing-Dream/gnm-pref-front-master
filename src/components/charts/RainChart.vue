<script>
import { Bar } from "vue-chartjs";
import _ from "lodash";
import moment from "moment";

export default {
  name: "RainChart",
  extends: Bar,
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
    initRains: {
      type: Array,
      required: true,
    },
    totalRains: {
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
    },
    rainType: {
      type: String,
      required: false,
      default: "10分"
    }
  },
  data() {
    return {
      rains: [],
      times: [],
      datacollection: {
        //Data to be represented on x-axis
        labels: [],
        datasets: [
          {
            type: "line",
            label: "累計雨量",
            yAxisID: "totalRain",
            xAxisID: "data",
            unit: "mm",
            pointBackgroundColor: "white",
            borderWidth: 3,
            backgroundColor: "#91C46C",
            tooltipLabelColor: "#91C46C",
            borderColor: "#91C46C",
            pointRadius: 0,
            pointHitRadius: 0,
            fill: false,
            data: [],
            spanGaps: true,
            lineTension: 0,
          },
          {
            type: "line",
            label: "累計雨量",
            yAxisID: "totalRain",
            xAxisID: "data",
            unit: "mm",
            pointBackgroundColor: "white",
            borderWidth: 3,
            backgroundColor: "#91C46C",
            tooltipLabelColor: "#91C46C",
            borderColor: "#91C46C",
            borderDash: [5, 2],
            pointRadius: 0,
            pointHitRadius: 0,
            fill: false,
            data: [],
            spanGaps: true,
            lineTension: 0,
          },
          {
            type: "line",
            label: "降雨強度",
            yAxisID: "rain",
            xAxisID: "data",
            unit: "mm/h",
            pointBackgroundColor: "white",
            borderWidth: 3,
            backgroundColor: "#1C344C",
            tooltipLabelColor: "#1C344C",
            borderColor: "#1C344C",
            pointRadius: 0,
            lineTension: 0,
            pointHitRadius: 0,
            fill: true,
            data: [],
            spanGaps: true,
          },
          {
            type: "line",
            label: "降雨強度",
            yAxisID: "rain",
            xAxisID: "data",
            unit: "mm/h",
            pointBackgroundColor: "white",
            borderWidth: 3,
            backgroundColor: "rgba(28,52,76,0.5)",
            tooltipLabelColor: "rgba(28,52,76,0.5)",
            borderColor: "rgba(28,52,76,0.5)",
            pointRadius: 0,
            lineTension: 0,
            pointHitRadius: 0,
            fill: true,
            data: [],
            spanGaps: true,
          },
          {
            type: "bar",
            label: this.rainType+ "雨量",
            yAxisID: "rain",
            xAxisID: "data",
            unit: "mm",
            backgroundColor: "#1C344C",
            tooltipLabelColor: "#1C344C",
            borderColor: "#1C344C",
            pointBackgroundColor: "white",
            borderWidth: 0.5,
            data: [],
            barPercentage: 1.0,
            categoryPercentage: 1.0,
          },
        ],
      },
      //Chart.js options that controls the appearance of the chart
      options: {
        layout: {
          padding: {
            right: 0,
            left: 0,
          },
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
              const value =
                data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
              return `${label} : ${(value !== null)? value : "-"} ${unit}`;
            },
          },
        },
        hover: {
          mode: "index",
          intersect: false,
        },
        scales: {
          yAxes: [
            {
              id: "rain",
              ticks: {
                reverse: this.reverse,
                display: !this.miniMode,
                min: 0,
                max: 5,
                stepSize: 1,
                beginAtZero: true,
                callback: (label, index, labels) => {
                  return ("　　　　　   " + parseFloat(label).toFixed(1)).slice(
                    -6
                  );
                },
              },
              gridLines: {
                display: !this.miniMode,
              },
            },
          ],
          xAxes: [
            {
              position: "bottom",
              id: "data",
              type: "time",
              time: {
                unit: 'hour',
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
                fontColor: "rgba(0,0,0,0)",
                display: !this.miniMode,
                beginAtZero: true,
                autoSkip: false,
                maxRotation: 45,
                minRotation: 45,
                min: this.minDate.toDate(),
                max: this.maxDate.toDate(),
              },
              gridLines: {
                display: !this.miniMode,
              },
            },
          ],
        },
        annotation: {
          annotations: [
            {
              type: "line",
              mode: "vertical",
              scaleID: "data",
              value: "06:10",
              borderColor: "#FF0000",
              borderWidth: 1.5,
            },
          ],
        },
        legend: {
          display: false,
        },
        responsive: true,
        maintainAspectRatio: false,
      },
    };
  },
  watch: {
    initRains() {
      this.rains = _.cloneDeep(this.initRains);
      this.times = _.cloneDeep(this.initTimes);
      this.setRainData();
      this.setYAxesLimitData();
      this.setLabelData();

      if (!this.reverse) {
        this.options.scales.xAxes[0].ticks.fontColor = "#9a9a9a";
        this.options.scales.xAxes[0].ticks.autoSkip = true;
        this.options.scales.xAxes[0].ticks.callback = (tick, index, array) => {
          return tick;
        };

        const totalRainMax = _.maxBy(this.totalRains, (value) => {
          return parseFloat(value);
        });
        const totalRainDefaultMax = 300;

        const max =
          totalRainMax > totalRainDefaultMax
            ? parseFloat(totalRainMax) + 1
            : totalRainDefaultMax;

        this.options.scales.yAxes.push({
          id: "totalRain",
          position: "right",
          type: "linear",
          ticks: {
            display: !this.miniMode,
            reverse: this.reverse,
            max: max,
            min: 0,
            stepSize: 100,
            beginAtZero: true,
          },
          gridLines: {
            display: !this.miniMode,
          },
        });
        this.options.layout.padding.right = 0;
      }
      this.options.annotation.annotations[0].value = this.baseDate.toDate();

      this.renderChart(this.datacollection, this.options);
    },
  },
  created() {
    this.rains = _.cloneDeep(this.initRains);
    this.times = _.cloneDeep(this.initTimes);
  },
  mounted() {
    this.setRainData();
    this.setYAxesLimitData();
    this.setLabelData();
    if (!this.reverse) {
      this.options.scales.xAxes[0].ticks.fontColor = "#9a9a9a";
      this.options.scales.xAxes[0].ticks.autoSkip = true;
      this.options.scales.xAxes[0].ticks.callback = (tick, index, array) => {
        return tick;
      };

      const totalRainMax = _.maxBy(this.totalRains, (value) => {
        return parseFloat(value);
      });
      const totalRainDefaultMax = 300;

      const max =
        totalRainMax > totalRainDefaultMax
          ? parseFloat(totalRainMax) + 1
          : totalRainDefaultMax;

      this.options.scales.yAxes.push({
        id: "totalRain",
        position: "right",
        type: "linear",
        ticks: {
          display: !this.miniMode,
          reverse: this.reverse,
          max: max,
          min: 0,
          stepSize: 100,
          beginAtZero: true,
        },
        gridLines: {
          display: !this.miniMode,
        },
      });
      this.options.layout.padding.right = 0;
    }
    this.options.annotation.annotations[0].value = this.baseDate.toDate();

    this.renderChart(this.datacollection, this.options);
  },
  methods: {
    setLabelData() {
      this.datacollection.labels = _.map(this.times, (time) => {
        return moment.utc(time, "YYYY/MM/DD HH:mm").toDate();
      });
    },
    setYAxesLimitData() {
      const rainMax = _.maxBy(this.rains, (value) => {
        return parseFloat(value);
      });
      const defaultMax = 5;

      this.options.scales.yAxes[0].ticks.max =
        rainMax > defaultMax ? parseFloat(rainMax) + 1 : defaultMax;
    },
    setRainData() {
      let realRainData = [];
      let forecastRainData = [];
      let realTotalRainData = [];
      let forecastTotalRainData = [];
      if (!this.latestRealDate) {
        if (this.rains.length > 0) {
          forecastRainData = this.rains;
          forecastTotalRainData = this.totalRains;
        }
      } else {
        const latestRealDateIndex = _.findLastIndex(this.times, (o) => {
          return moment
            .utc(o, "YYYY/MM/DD HH:mm")
            .isSameOrBefore(this.latestRealDate);
        });

        realRainData = _.fill(
          _.cloneDeep(this.rains),
          null,
          latestRealDateIndex + 1
        );
        forecastRainData = _.fill(
          _.cloneDeep(this.rains),
          null,
          0,
          latestRealDateIndex + 1
        );

        realTotalRainData = _.fill(
          _.cloneDeep(this.totalRains),
          null,
          latestRealDateIndex + 1
        );
        forecastTotalRainData = _.fill(
          _.cloneDeep(this.totalRains),
          null,
          0,
          latestRealDateIndex + 1
        );
      }

      if (this.reverse) {
        this.datacollection.datasets[0].data = this.totalRains;
        this.datacollection.datasets[2].data = realRainData;
        this.datacollection.datasets[3].data = forecastRainData;
      } else {
        this.datacollection.datasets[0].data = realTotalRainData;
        this.datacollection.datasets[1].data = forecastTotalRainData;
        this.datacollection.datasets[4].data = this.rains;
      }
    },
  },
};
</script>
