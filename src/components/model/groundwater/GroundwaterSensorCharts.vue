<template>
  <div style="width: 100%; height: 100%">
    <BaseEcharts :width="'100%'" :height="'100%'" :options="sensor_options"></BaseEcharts>
  </div>
</template>

<script>

import BaseEcharts from "@/components/BaseEcharts";

export default {
  name: "GroundwaterSensorCharts",
  components: {BaseEcharts},
  props: {
    sensors_data: {
      default: []
    }
  },
  data() {
    return {
      sensor_options: {
        title: {
          text: ''
        },
        legend: {
          data: []
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
        series: []
      }
    }
  },
  watch: {
    sensors_data: {
      deep: true,
      immediate: true,
      handler(newV, oldV) {
        this.init()
      }
    }
  },
  methods: {
    init() {
      if (this.sensors_data.length > 0) {

        let time_line = this.sensors_data[0]['time_line']
        let sensor_names = [this.sensors_data[0]['sensor_name']]
        let data_list = [this.sensors_data[0]['data_line']]
        let max = Math.max(...this.sensors_data[0]['data_line'])
        let min = Math.min(...this.sensors_data[0]['data_line'])
        for (let i = 1; i < this.sensors_data.length; i++) {
          max = Math.round(Math.max(max, ...this.sensors_data[i]['data_line']) + 1)
          min = Math.round(Math.min(min, ...this.sensors_data[i]['data_line']) - 1)
          sensor_names.push(this.sensors_data[i]['sensor_name'])
          data_list.push(this.sensors_data[i]['data_line'])
        }
        this.setEchartsOptions(max, min, sensor_names, time_line, data_list, '水位计')
      }
    },
    setEchartsOptions(max_y, min_y, sensor_names, time_line, data_list, sensor_type) {
      // 设置y轴的上下限
      this.sensor_options.yAxis.max = max_y
      this.sensor_options.yAxis.min = min_y
      this.sensor_options.legend.data = sensor_names
      this.sensor_options.yAxis.name = this.$store.state['units'][sensor_type]

      this.sensor_options.series.length = 0
      //三条线
      for (let i = 0; i < data_list.length; i++) {
        this.sensor_options.series.push({
          name: sensor_names[i],
          type: 'line',
          smooth: true,
          data: data_list[i]
        })
      }
      // 后端返回的日期格式为 yyyy-MM-dd HH:mm ，但是表格横轴只需要显示 MM-dd ，所以切分一下，保留月日
      this.sensor_options.xAxis.data = time_line.map(item => item.slice(5, 10))
    }
  }
}
</script>

<style scoped>

</style>
