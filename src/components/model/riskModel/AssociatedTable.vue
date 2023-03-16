<template>
  <div style="text-align: center">
    <el-table
      stripe border
      :data="table_data"
      v-loading="is_loading_table"
      :row-style="{height: '39px'}"
      :cell-style="{padding: '1px'}"
      :header-cell-style="{'text-align': 'center'}"
      style="width: 100%; margin-top: 10px">

      <el-table-column width="50" label="序号" type="index"/>
      <el-table-column label="输入" prop="triad1">
        <template slot-scope="scope">
          {{ scope.row['triad1'][0] }} -
          {{ scope.row['triad1'][1] }} -
          {{ scope.row['triad1'][2] }}
        </template>
      </el-table-column>
      <el-table-column label="输出" prop="triad2">
        <template slot-scope="scope">
          {{ scope.row['triad2'][0] }} -
          {{ scope.row['triad2'][1] }} -
          {{ scope.row['triad2'][2] }}
        </template>
      </el-table-column>
      <el-table-column width="80" label="支持度" prop="support"/>
      <el-table-column width="100" label="置信度" prop="confidence"/>
      <el-table-column width="110" label="启用">
        <template slot-scope="scope">
          <el-switch
            @change="activateModel(scope.row)"
            v-model="scope.row['activate'] === 1"/>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
      :total="total"
      :page-sizes="[10, 20]"
      :page-size.sync="params.page_size"
      :current-page.sync="params.page_num"
      @size-change="val=>{params.page_size=val}"
      layout="total, sizes, prev, pager, next, jumper"
      style="margin-top: 10px; display: flex; justify-content: space-between;">
    </el-pagination>
  </div>
</template>

<script>
import {activateRiskModel, getRuleModels} from "@/api/workingCondition/model/riskModel";

export default {
  name: "AssociatedTable",
  props: {
    building_id: {
      require: true
    },
  },
  data() {
    return {
      is_loading_table: false,
      table_data: [],
      total: 0,
      params: {
        building_id: null,
        page_num: 1,
        page_size: 10,
      },
      date_picker: []
    }
  },
  watch: {
    building_id: {
      handler(val) {
        this.params['building_id'] = val
      }
    },
    params: {
      deep: true,
      handler() {
        this.getTableData()
      }
    }
  },
  mounted() {
    this.getTableData()
  },
  methods: {


    async getTableData() {
      this.is_loading_table = true

      let data = await getRuleModels(this.params)
      if (data['result']) {
        // 当数据总数大于0，并且当前页数据为空，那么重置页码，并重新获取数据（通过watch）
        if (data['data'].total > 0 && data['data'].list.length === 0) {
          this.params.page_num = 1
          return
        }
        this.table_data = data['data']['list']
        this.total = data['data']['total']
      }

      this.is_loading_table = false
    },
    async activateModel(row) {
      let notify = this.$notify.info({
        title: "提示",
        message: row['activate'] ? "禁用中..." : "启用中..."
      })
      let param = {
        rule_id: row['rule_id'],
        activate: row['activate'] ^ 1
      }
      let data = await activateRiskModel(param)
      if (data['result']) {
        row['activate'] ^= 1
        notify.type = 'success'
        notify.message = row['activate'] ? "启用成功" : "禁用成功"
      } else {
        this.$message.warning(data['message'])
      }
    }
  }
}
</script>

<style scoped>

</style>
