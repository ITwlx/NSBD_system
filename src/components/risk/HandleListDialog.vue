<template>
  <el-dialog width="66%"
             title="风险处置"
             append-to-body
             @close="closeDialog"
             :close-on-click-modal="true"
             :visible.sync="dialog_visible">

    <div class="head" style="margin: 10px">
      <div>
        <div style="display: inline-block; width: 300px; vertical-align: top">
          <p v-text="'  建筑物：'+building_name"></p>
          <p v-text="'预警时间：'+warning_time"></p>
        </div>
        <div style="display: inline-block; width: 300px">
          <p v-text="'风险因子：'+building_name"></p>
        </div>
      </div>
      <div style="">
        <p style="float: right; margin: 20px">
          <el-button
            size="mini"
            type="primary"
            v-if="handle_status !== '已处理'"
            @click="$refs['add-detail'].showDialog(params.risk_event_id, handle_status)">
            <i class="el-icon-plus"/> 新增
          </el-button>
          <el-button
            size="mini"
            type="primary"
            @click="deleteHandles"
            v-if="handle_status !== '已处理'">
            <i class="el-icon-delete"/> 删除
          </el-button>
        </p>
      </div>
    </div>
    <el-table
      ref="multipleTable"
      stripe
      border
      :data="table_data"
      :row-style="{height: '20px'}"
      :cell-style="{padding: '1px'}"
      v-loading="is_loading_table"
      element-loading-text="加载中，请稍后..."
      element-loading-spinner="el-icon-loading"
      tooltip-effect="dark"
      style="margin-top: 10px; width: 100%"
      :header-cell-style="{'text-align': 'center'}"
      @selection-change="handleSelectionChange">
      <el-table-column
        type="selection"
        width="45">
      </el-table-column>
      <el-table-column
        label="序号"
        type="index"
        width="50">
      </el-table-column>
      <el-table-column width="100px" label="处置动作" prop="handle_action"></el-table-column>
      <el-table-column
        label="详情"
        min-width="180px"
        prop="handle_detail"
        :show-overflow-tooltip="true" >
      </el-table-column>
      <el-table-column width="100px" label="处置人员" prop="handle_person"></el-table-column>
      <el-table-column
        width="150px"
        label="提交时间"
        prop="submit_time">
      </el-table-column>
      <el-table-column width="100px" align="center" label="操作">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="$refs['update-detail'].showDialog({...scope.row, risk_event_id: params.risk_event_id}, handle_status)">
            详情
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

    <!--新增处理详情-->
    <HandleDetailAdd
      ref="add-detail"
      :changeStatus="changeHandleStatus">
    </HandleDetailAdd>

    <!--编辑处理详情-->
    <HandleDetailUpdate
      ref="update-detail"
      :changeStatus="changeHandleStatus">
    </HandleDetailUpdate>
  </el-dialog>
</template>

<script>
import HandleDetailAdd from "@/components/risk/HandleDetailAdd";
import {checkHandleStatus, deleteHandleDetail} from "@/api/workingCondition/risk";
import HandleDetailUpdate from "@/components/risk/HandleDetailUpdate";

export default {
  name: "HandleListDialog",
  components: {HandleDetailUpdate, HandleDetailAdd},
  props: {
    refreshRiskList: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      dialog_visible: false,
      table_data: [],
      table_data_total: 0,
      multiple_selection: [],
      is_loading_table: false,
      building_name: '',
      risk_event_content: '',
      warning_time: '',
      handle_status: '',
      is_change_status: false,
      params: {
        page_num: 1,
        page_size: 10,
        risk_event_id: 0,
      }
    }
  },
  created() {

  },
  methods: {
    showDialog(row) {
      this.warning_time = row['warning_time']
      this.building_name = row['building_name']
      this.risk_event_content = row['risk_event_content']
      this.params.risk_event_id = row['risk_event_id']
      this.handle_status = row['handle_status']
      this.dialog_visible = true
      this.is_change_status = false

      this.getTableData()
    },
    // 刷新风险列表数据
    closeDialog() {
      if (this.is_change_status){
        this.refreshRiskList()
      }
    },
    //提交表单后，修改风险事件的处置状态
    changeHandleStatus(status){
      if (status === "勘察" || status==="处理"){
        this.handle_status = "处理中"
      }else if (status === "不予处理" || status==="完成处置"){
        this.handle_status = "已处理"
      }
      // 提交过表单，状态改变过，关闭窗口时，需要刷新列表数据
      this.is_change_status = true
      // 刷新表格数据
      this.getTableData()
    },
    // 多选表格中的数据
    handleSelectionChange(val) {
      this.multiple_selection = val
    },
    deleteHandles(){
      let len = this.multiple_selection.length
      if (len <= 0){
        this.$message.info("还未选中任何数据")
        return
      }
      this.$confirm(`确定删除这${len}项？`, '删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteTableData()
      });
    },

    // 分页插件-改变每页大小
    handleSizeChange(val) {
      this.params.page_size = val
    },
    // 改变当前页
    handleCurrentChange(val) {
      this.params.page_num = val
    },

    //请求表格数据
    getTableData() {
      this.is_loading_table = true
      checkHandleStatus(this.params).then(data=>{
        this.is_loading_table = false
        this.table_data = data.data.list
        this.table_data_total = data.data['total']
      }).catch(err=>{
        this.is_loading_table = false
      })
    },
    //删除表格数据
    deleteTableData(){
      this.is_loading_table = true
      let handle_ids = this.multiple_selection.map(item=>item['handle_id'])
      deleteHandleDetail({handle_ids}).then(data=>{
        if (data['result']){
          this.$message.success(`成功删除${data['data']}项！`)
          this.getTableData()
        }else{
          this.is_loading_table = false
          this.$message.error(data['message'])
        }
      }).catch(err=>{
        this.is_loading_table = false
      })
    }
  }
}
</script>

<style scoped>

</style>
