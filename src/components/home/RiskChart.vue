<template>
  <div class="shadow" style="text-align: center">
    <h3>各类风险事件个数</h3>
    <BaseEcharts style="display: inline-block" :options="options" :width="chart_width" :height="chart_height"></BaseEcharts>
  </div>
</template>

<script>
import BaseEcharts from "@/components/BaseEcharts";

export default {
  name: "RiskChart",
  components: {BaseEcharts},
  props: {
    chart_data: {
      type: Array,
      default: []
    }
  },
  watch: {
    chart_data: {
      deep: true,
      handler(newV) {
        this.options.series[0].data = newV
      }
    }
  },
  data() {
    return {
      chart_width: "300px",
      chart_height: "300px",
      options: {
        legend: {
          top: 'bottom'
        },
        tooltip: {
          trigger: 'item',
          formatter: '{b} : {c} ({d}%)',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          textStyle: {
            color: 'white'
          }
        },
        toolbox: {
          show: true,
          feature: {
            mark: {show: true},
            dataView: {show: true, readOnly: false},
            restore: {show: true},
            saveAsImage: {show: true}
          }
        },
        series: [
          {
            type: 'pie',
            // radius: [50, 250],
            radius: '70%',
            center: ['50%', '50%'],
            roseType: 'area',
            itemStyle: {
              borderRadius: 8
            },
            data: this.chart_data
          }
        ]
      }
    }
  },
  mounted() {
    // this.loadRiskData()
  },
  methods: {
    async loadRiskData() {
      let data = [
        {value: 40, name: '黄色告警', alterClass: '1'},
        {value: 38, name: '蓝色告警', alterClass: '2'},
        {value: 32, name: '橙色告警', alterClass: '3'},
        {value: 30, name: '红色告警', alterClass: '4'},
      ]
      this.options.series[0].data = data
    }
  }
}
</script>

<style scoped>

</style>