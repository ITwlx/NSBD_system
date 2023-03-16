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
      <el-table-column width="120" label="部位" prop="location"/>
      <el-table-column width="120" label="设施" prop="facility"/>
      <el-table-column width="120" label="模式" prop="mode"/>
      <el-table-column width="110" label="时间">
        <template slot-scope="scope">
          {{ scope.row['event_time'].slice(0, 10) }}
        </template>
      </el-table-column>
      <el-table-column label="三元组" prop="triad">
        <template slot-scope="scope">
          {{ scope.row['triad'][0] }} -
          {{ scope.row['triad'][1] }} -
          {{ scope.row['triad'][2] }}
        </template>
      </el-table-column>
      <el-table-column width="160px" label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="$refs['exception-form'].showDialog(scope.row)">
            编辑
          </el-button>
          <el-button
            size="mini"
            type="danger" @click="deleteExceptions(scope.row)">
            删除
          </el-button>
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

    <ExceptionForm ref="exception-form" @refreshData="getTableData"></ExceptionForm>
  </div>
</template>

<script>
import {deleteAnomalyEvent, getResultList} from "@/api/workingCondition/model/riskModel";
import ExceptionForm from "@/components/model/riskModel/ExceptionForm";

export default {
  name: "ExceptionTable",
  components: {ExceptionForm},
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
        page_num: 1,
        page_size: 10,
      },
    }
  },
  watch: {
    building_id: {
      handler(val) {

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

    deleteExceptions(row) {
      if (row === null) {
        return
      }
      let ids = [row['anomaly_event_id']]
      this.$confirm(`确定删除该条数据？`, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteData(ids)
      }).catch(() => {
      })
    },

    // 请求表格数据
    async getTableData() {
      this.is_loading_table = true

      let data = await getResultList(this.params)
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
    // 删除表格数据
    async deleteData(anomaly_event_ids) {
      let param = {anomaly_event_ids}
      let data = await deleteAnomalyEvent(param)
      if (data['result']) {
        this.$message.success(`成功删除${data['data']}条数据`)
        await this.getTableData()
      } else {
        this.$message.warning(data['message'])
      }
    }
  }
}
</script>

<style scoped>
</style>
