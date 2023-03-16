<template>
  <el-dialog
      title="得分详情"
      :visible.sync="dialog_visible">
    <div>
      <h3 style="text-align: center">{{ row['building_name'] }}</h3>
      <p style="margin-bottom: 10px">安全评价结果：{{ row['security_score'] }}</p>
      <p>风险等级：{{ row['risk_level'] }}</p>
    </div>
    <div style="margin: 20px; padding: 10px; border: 1px solid #DCDFE6">
      <el-tree
          :data="tree_data"
          :default-expand-all=true>
        <span slot-scope="{data}">
          <span v-if="data['children']">{{ data['second_level_name'] + "得分：" + data['second_level_score'] }}</span>
          <span v-else>{{ data['third_level_name'] + "：" + data['third_level_score'] }}</span>
        </span>
      </el-tree>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: "SafetyDetailDialogElTree",
  data() {
    return {
      dialog_visible: false,
      row: {},

      tree_data: {},
    }
  },
  methods: {
    showDialog(row) {
      this.tree_data = row['scores']

      this.row = {
        security_score: row['security_score'],
        building_name: row['building_name'],
        risk_level: row['risk_level'],
        result: row['result']
      }
      this.dialog_visible = true
    }
  }
}
</script>

<style scoped>

</style>
