<template>
  <div style="width: 100%; height: 100%">
    <BaseEcharts :width="'100%'" :height="'100%'" :options="sensor_options"></BaseEcharts>
  </div>
</template>

<script>
import BaseEcharts from "@/components/BaseEcharts";
export default {
  // 绘制传感器 监测值-时间 的折线图
  name: "SensorCharts",
  components: {BaseEcharts},
  props: {
    // 折线图的标题
    title: String,
    // 横轴时间线（前10个字符必须是 yyyy-MM-dd 格式）
    time_line: Array,
    // y轴单位
    yAxis_name: String,
    // 一组数据（y轴的值）
    series_data: Array
  },
  data() {
    return {
      // echarts 配置项
      sensor_options: {
        // 当 鼠标悬停在某个点，显示 x、y轴的数据
        tooltip: {
          trigger: 'item',
          axisPointer: {
            type: ''
          }
        },
        // 标题
        title: {
          text: '历史数据'
        },
        //echarts的canvas 左右上下 边距
        grid: {
          x: 39,
          x2: 50,
          y: 50,
          y2: 30,
        },
        // x轴单位，数据，自动设置单位长度
        xAxis: {
          name: '时间/t',
          data: [],
          axisTick: {interval: 'auto'}
        },
        // y轴单位，最小、大值，自动设置单位长度
        yAxis: {
          name: '应力/Mpa',
          min: 0.85,
          max: 0.9,
          axisTick: {interval: 'auto'}
        },
        series: [
          // 一组y轴数据（线性，光滑曲线，数据）
          {
            type: 'line',
            smooth: true,
            data: []
          }
        ]
      }
    }
  },
  mounted() {
    this.setEchartsOptions()
  },
  watch: {
    // 检测到 props 中的time_line发生变动
    // 说明数据发生变化了，需要重新渲染
    time_line: {
      deep: true,
      handler(){
        this.setEchartsOptions()
      }
    }
  },
  methods: {
    setEchartsOptions() {
      // 设置y轴上下限
      let max = Math.round(Math.max.apply(null, this.series_data)+1)
      let min = Math.round(Math.min.apply(null, this.series_data)-1)
      this.sensor_options.yAxis.max=max
      this.sensor_options.yAxis.min=min
      // 设置标题
      this.sensor_options.title.text = this.title
      // 设置横轴时间线
      // 后端返回的日期格式为 yyyy-MM-dd HH:mm ，但是表格横轴只需要显示 MM-dd ，所以切分一下，保留月日
      this.sensor_options.xAxis.data = this.time_line.map(item=>item.slice(5, 10))
      // 设置y轴单位
      this.sensor_options.yAxis.name = this.yAxis_name
      // 设置一条数据线
      this.sensor_options.series[0].data = this.series_data
    }
  }
}
</script>

<style scoped>

</style>
