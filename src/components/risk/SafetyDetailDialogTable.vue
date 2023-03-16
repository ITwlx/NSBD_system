<template>
  <el-dialog
      title="得分详情"
      :visible.sync="dialog_visible">
    <div>
      <h3 style="text-align: center">{{ row['building_name'] }}</h3>
      <p style="margin-bottom: 10px">安全评价结果：{{ row['security_score'] }}</p>
      <p>风险等级：{{ row['risk_level'] }}</p>
    </div>

    <el-table :data="table_data"
              size="small"
              border
              :show-header="false"
              :span-method="arraySpanMethod">
      <el-table-column>
        <template slot-scope="scope">
          {{ scope.row['second_level_name'] }}得分：{{ scope.row['second_level_score'] }}
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          {{ scope.row['third_level_name'] }}
        </template>
      </el-table-column>
      <el-table-column>
        <template slot-scope="scope">
          {{ scope.row['third_level_score'] }}
        </template>
      </el-table-column>
    </el-table>
  </el-dialog>
</template>

<script>
export default {
  name: "SafetyDetailDialogTable",
  data() {
    return {
      dialog_visible: false,
      row: {},
      row_span: [],
      table_data: [],
    }
  },
  methods: {
    showDialog(row) {

      let list = []
      let row_span = [0]
      for (let i = 0; i < row['scores'].length; i++) {
        let children = row['scores'][i]['children']
        for (let j = 0; j < children.length; j++) {
          list.push(Object.assign(
              children[j],
              {
                second_level_name: row['scores'][i]['second_level_name'],
                second_level_score: row['scores'][i]['second_level_score']
              }
          ))
        }
        row_span.push(list.length)
      }

      this.row = {
        security_score: row['security_score'],
        building_name: row['building_name'],
        risk_level: row['risk_level'],
        result: row['result']
      }
      this.row_span = row_span
      this.table_data = list
      this.dialog_visible = true
    },
    arraySpanMethod({row, column, rowIndex, columnIndex}) {
      // 只对第一列进行合并
      if (columnIndex === 0) {
        let index = this.row_span.indexOf(rowIndex);
        if (index > -1) {
          return {
            rowspan: this.row_span[index + 1] - this.row_span[index],
            colspan: 1
          }
        } else {
          return {
            rowspan: 0,
            colspan: 0
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
