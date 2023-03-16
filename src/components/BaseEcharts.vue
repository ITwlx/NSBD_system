<template>
  <div :id="el_id" :style="style"></div>
</template>

<script>
import 'echarts-wordcloud'

const idGenerator = () => new Date().getTime();
export default {
  name: "BaseEcharts",
  props: {
    width: {
      type: String,
      default: '400px'
    },
    height: {
      type: String,
      default: '200px'
    },
    options: {
      type: Object,
      require: true
    }
  },
  data() {
    return {
      el_id: null,
      my_chart: null
    }
  },
  created() {
    this.el_id = idGenerator();
  },
  mounted() {
    // 准备实例
    // this.my_chart = this.$echarts.getInstanceByDom(document.getElementById(this.el_id))
    // if (this.my_chart == null) {
    //   this.my_chart = this.$echarts.init(document.getElementById(this.el_id))
    // }
    this.my_chart = this.$echarts.init(document.getElementById(this.el_id))
    // 应用配置项
    this.my_chart.setOption(this.options)
  },
  computed: {
    style() {
      return {
        width: this.width,
        height: this.height
      }
    }
  },
  watch: {
    width() {
      this.resize()
    },
    height() {
      this.resize()
    },
    options: {
      deep: true,
      handler() {
        // console.log('reset options')
        if (this.my_chart) {
          this.my_chart.setOption(this.options, {
            notMerge: true
          })
        }
      }
    }
  },
  methods: {
    resize() {
      if (this.my_chart) {
        this.my_chart.resize({
          animation: {
            duration: 300
          }
        })
      }
    }
  }
}
</script>

<style scoped>

</style>