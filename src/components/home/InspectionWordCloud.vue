<template>
  <div class="shadow" style="text-align: center;">
    <h3>巡检问题分类</h3>
    <div style="width: 600px; height: 500px; overflow: auto">
      <WordCloud3 :words="chart_data" :width="cloud_width" :height="cloud_height"></WordCloud3>
    </div>
  </div>
</template>

<script>
import BaseEcharts from "@/components/BaseEcharts";
import WordCloud3 from "@/components/home/WordCloud3";
export default {
  name: "InspectionWordCloud",
  components: {WordCloud3, BaseEcharts},
  props: {
    chart_data: {
      type: Array,
      default: []
    }
  },
  data() {
    return{
      cloud_width: 500,
      cloud_height: 500,
    }
  },
  mounted() {
    // this.loadInspectionData()
  },
  methods: {
    async loadInspectionData() {
      let data = [
        {name: '建筑物混凝土裂缝、破损', value: 13},
        {name: '建筑物管身内部渗漏水', value: 26},
        {name: '建筑物管身段内部不均匀沉降，出现错台', value: 11},
        {name: '建筑物管身段内部不均匀沉降，出现渗水', value: 30},
        {name: '管身段两侧回填土塌陷', value: 20},
        {name: '进出口平台沉陷、开裂', value: 40},
        {name: '进出口与渠堤衔接部位出现冲刷掏空、塌陷', value: 5},
        {name: '混凝土裂缝、破损', value: 60},
        {name: '闸墩沉降、错台', value: 33},
        {name: '闸墩变形、倾斜', value: 23}
      ]

      // let word_max_len = Math.max.apply(Math, data.map(item => item['name'].length))
      // this.cloud_width = 30 * word_max_len
      // this.cloud_height = 30 * word_max_len
      this.word_cloud = data
    }
  }
}
</script>

<style scoped>
::-webkit-scrollbar {
  display: none;
}

</style>