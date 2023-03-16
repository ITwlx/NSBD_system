<template>
<el-dialog title="查看/处置"
           :visible.sync="dialog_visible">
  <el-table
    :data="table_data"
    border
    v-loading="is_loading_table"
    element-loading-text="加载中，请稍后...">
    <el-table-column label="风险事件" prop="risk_event_content">
    </el-table-column>
    <el-table-column min-width="130px" label="预警依据" prop="anomaly_event_content">
    </el-table-column>
    <el-table-column width="150px" label="预警时间" prop="warning_time">
    </el-table-column>
    <el-table-column label="状态">
      <template slot-scope="scope">
        <el-button
          v-text="scope.row['handle_status']"
          size="mini"
          @click="$refs['handle-list'].showDialog({...scope.row, building_name, risk_level})">
        </el-button>
      </template>
    </el-table-column>
  </el-table>
  <!--分页插件 box-->
  <el-pagination
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
    :current-page="params.page_num"
    background
    style="margin-top: 10px; display: flex; justify-content: space-between;"
    :page-sizes="[10,20]"
    :page-size="params.page_size"
    layout="total, sizes, prev, pager, next, jumper"
    :total="table_data_total">
  </el-pagination>

  <!--风险处置弹框-->
  <HandleListDialog :refreshRiskList="getTableData" ref="handle-list"></HandleListDialog>
</el-dialog>
</template>

<script>
import {checkHandle} from "@/api/workingCondition/risk";
import HandleListDialog from "@/components/risk/HandleListDialog";

export default {
  name: "RiskListDialog",
  components: {HandleListDialog},
  data() {
    return {
      dialog_visible: false,
      table_data: [],
      table_data_total: 0,
      is_loading_table: false,
      building_name: '',
      risk_level: '',
      params: {
        risk_id: '',
        page_num: 1,
        page_size: 10,
      },
    }
  },
  methods: {
    showDialog(row){
      this.building_name = row['building_name']
      this.risk_level = row['risk_level']
      this.params.risk_id = row['risk_id']

      this.dialog_visible=true
      this.getTableData()
    },

    // 分页插件-改变每页大小
    handleSizeChange(val) {
      this.params.page_size = val
    },
    // 改变当前页
    handleCurrentChange(val) {
      this.params.page_num = val
    },

    getTableData(){
      this.is_loading_table = true
      checkHandle(this.params).then(data=>{
        if (data['result']){
          this.table_data=data.data.list
          this.table_data_total = data.data['total']
        }else {
          this.$message.error(data['message'])
        }
        this.is_loading_table = false
      }).catch(err=>{
        this.$message.error(err)
        this.is_loading_table = false
      })
    }
  }
}
</script>

<style scoped>

</style>
