<template>
  <el-dialog
      title="得分详情"
      width="55%"
      :visible.sync="dialog_visible">
    <div>
      <h3 style="text-align: center">{{ row['building_name'] }}</h3>
      <p style="margin-bottom: 10px">安全评价结果：{{ row['security_score'] }}</p>
      <p>风险等级：{{ row['risk_level'] }}</p>
    </div>
    <div style="margin: 20px; padding: 10px; border: 1px solid #DCDFE6">
      <BaseEcharts :width="'100%'" :height="'330px'" :options="score_options"></BaseEcharts>
    </div>
  </el-dialog>
</template>

<script>
import BaseEcharts from "@/components/BaseEcharts";
export default {
  name: "SafetyDetailDialog",
  components: {BaseEcharts},
  data() {
    return {
      dialog_visible: false,
      row: {},
      // echarts 图例配置项
      score_options: {
        tooltip: {
          trigger: 'item',
          triggerOn: 'mousemove'
        },
        series: [
          {
            type: 'tree',
            // 数据
            data: [],
            top: '1%',
            left: '19%',
            bottom: '1%',
            right: '25%',
            symbolSize: 7,
            label: {
              position: 'left',
              verticalAlign: 'middle',
              align: 'right',
              fontSize: 12
            },
            leaves: {
              label: {
                position: 'right',
                verticalAlign: 'middle',
                align: 'left'
              }
            },
            emphasis: {
              focus: 'descendant'
            },
            expandAndCollapse: true,
            animationDuration: 550,
            animationDurationUpdate: 750
          }
        ]
      }
    }
  },
  methods: {
    showDialog(row) {
      this.dialog_visible = true

      this.row = {
        security_score: row['security_score'],
        building_name: row['building_name'],
        risk_level: row['risk_level'],
        result: row['result']
      }

      let data = {
        name: '安全评价结果：' + row['security_score'],
        children: JSON.parse(JSON.stringify(row['scores']))
      }
      // 修改数据格式，并将数据放入配置项
      this.setEchartsOptions(data)
      // 根据配置项初始化echarts图例
      // this.$nextTick(this.initEcharts)

    },
    setEchartsOptions(data) {
      // data 是根节点，name是安全评价结果，
      // 其 children 字段存的是二级指标name和score
      // 每个二级指标下面(children)有三级指标，同样是name和score
      let children = data.children
      for (let i = 0; i < children.length; i++) {
        let item = {
          name: children[i]['second_level_name'] + ":" + children[i]['second_level_score'],
          value: children[i]['second_level_score'],
          children: children[i]['children']
        }
        for (let j = 0; j < item.children.length; j++) {
          item.children[j] = {
            name: item.children[j]['third_level_name'] + ":" + item.children[j]['third_level_score'],
            value: item.children[j]['third_level_score']
          }
        }
        children[i] = item
      }
      // 设置数据集
      this.score_options.series[0].data = [data]
    },
    initEcharts(){
      // 初始化表格
      let chart = this.$echarts.getInstanceByDom(document.getElementById(this.echarts_id))
      if (!chart) {
        chart = this.$echarts.init(document.getElementById(this.echarts_id))
      }
      // 绘制表格
      chart.setOption(this.score_options)
    }
  }
}
</script>

<style scoped>

</style>
