<template>
  <div class="shadow" style="text-align: center">
    <h3>{{ title }}</h3>
    <BaseEcharts :options="options" :width="width" :height="height"></BaseEcharts>
  </div>
</template>

<script>
import BaseEcharts from "@/components/BaseEcharts";

export default {
  name: "MonitorChart",
  components: {BaseEcharts},
  props: {
    title: {
      type: String,
      require: true
    },
    width: {
      type: String,
      default: '400px'
    },
    height: {
      type: String,
      default: '400px'
    },
    line_name: {
      type: Array,
      default: null
    },
    data_list: {
      type: Array,
      require: true
    },
    x_data: {
      type: Array,
      require: true
    },
  },
  data() {
    return {
      options: {
        color: ["#4876FF", "#FFFF00", "#FF7F24", "#ff0000"],
        legend: {
          data: [],
          textStyle: {
            color: "#fff"
          }
        },
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          textStyle: {
            color: 'white'
          }
        },
        grid: {
          x: 25,
          y: 45,
          x2: 20,
          y2: 30,
        },
        xAxis: {
          data: [],
          axisLabel: {
            show: true,
            textStyle: {
              color: "#fff"
            }
          },
          axisLine: {
            lineStyle: {
              color: "#fff"
            }
          }
        },
        yAxis: {
          axisLabel: {
            show: true,
            textStyle: {
              color: "#fff"
            }
          },
          axisTick: {
            interval: 'auto'
          },
          name: '个',
          nameTextStyle: {
            color: "#fff"
          },
          min: 0,
          max: 0
        },
        series: []
      }
    }
  },
  watch: {
    data_list: {
      deep: true,
      handler() {
        this.showData()
      }
    }
  },
  methods: {
    showData() {
      this.options.xAxis.data = this.x_data
      if (this.line_name) {
        this.showMultiLines()
      } else {
        this.showSingleLine()
      }
    },
    showMultiLines() {
      let min = Math.min(...this.data_list[0])
      let max = Math.max(...this.data_list[0])
      this.options.legend.data = this.line_name
      let series = []
      for (let i = 0; i < this.data_list.length; i++) {
        let item = {
          name: this.line_name[i],
          type: 'line',
          stack: '个数',
          areaStyle: {},
          smooth: true,
          data: this.data_list[i]
        }
        min = Math.min(min, ...this.data_list[i])
        max = Math.max(max, ...this.data_list[i])
        series.push(item)
      }
      this.options.yAxis.min = min
      this.options.yAxis.max = max
      this.options.series = series
    },
    showSingleLine() {
      let min = Math.min(...this.data_list)
      let max = Math.max(...this.data_list)
      this.options.yAxis.min = min
      this.options.yAxis.max = max
      this.options.series[0] = {
        type: 'line',
        smooth: true,
        stack: '个数',
        areaStyle: {},
        data: this.data_list
      }
    }
  }
}
</script>

<style scoped>

</style>