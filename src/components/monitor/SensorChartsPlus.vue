<template>
  <!--  <div :id="sensor_id" style="width: 100%; height: 100%"></div>-->
  <BaseEcharts :width="width" :height="height" :options="sensor_options"></BaseEcharts>
</template>

<script>
import BaseEcharts from "@/components/BaseEcharts";

export default {
  name: "SensorChartsPlus",
  components: {BaseEcharts},
  props: {
    sensor_id: {
      default: "echarts_id"
    }
  },
  data() {
    let line_name = ['max', 'real', 'min']
    return {
      width: '100%',
      height: '100%',
      sensor_options: {
        title: {
          text: '异常点位展示'
        },
        legend: {
          data: line_name
        },
        tooltip: {
          trigger: 'axis'
        },
        grid: {
          x2: 50
        },
        xAxis: {
          name: '时间/t',
          data: [],
          axisTick: {
            interval: 'auto'
          }
        },
        yAxis: {
          name: '应力/Mpa',
          axisTick: {
            interval: 'auto'
          },
          min: 0.85,
          max: 0.9
        },
        series: [
          {
            name: line_name[0],
            type: 'line',
            smooth: true,
            data: [],
            lineStyle: {
              color: '#60b0ef'
            }
          },
          {
            name: line_name[1],
            type: 'line',
            smooth: true,
            data: []
          },
          {
            name: line_name[2],
            type: 'line',
            smooth: true,
            data: [],
            lineStyle: {
              color: '#60b0ef'
            }
          }
        ]
      }
    }
  },
  methods: {
    setEchartsOptions(data_list, sensor_type) {
      // 赋值，求出最大值和最小值，然后作为y轴的上下限
      let max = Math.max(Math.max.apply(null, data_list['upper_line']), Math.max.apply(null, data_list['data_line']))
      let min = Math.min(...[...data_list['data_line'], ...data_list['lower_line']])
      // 设置y轴的上下限
      this.sensor_options.yAxis.max = Math.round(max + 1)
      this.sensor_options.yAxis.min = Math.round(min - 1)
      this.sensor_options.yAxis.name = this.$store.state['units'][sensor_type]
      //三条线
      this.sensor_options.series[0].data = data_list['upper_line']
      this.sensor_options.series[1].data = data_list['data_line']
      this.sensor_options.series[2].data = data_list['lower_line']
      // 后端返回的日期格式为 yyyy-MM-dd HH:mm ，但是表格横轴只需要显示 MM-dd ，所以切分一下，保留月日
      this.sensor_options.xAxis.data = data_list['time_line'].map(item => item.slice(5, 10))

      // 初始化表格
      // let chart = this.$echarts.getInstanceByDom(document.getElementById(this.sensor_id))
      // if (chart == null) {
      //   chart = this.$echarts.init(document.getElementById(this.sensor_id))
      // }
      // 绘制表格
      // chart.setOption(this.sensor_options)
    }
  }
}
</script>

<style scoped>

</style>
