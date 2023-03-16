<template>
  <div style="margin-left: 20px; margin-right: 20px">

    <!--输入框与按钮-->
    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
      <!--管理处选择框-->
      <span>
      管理处：
      <el-select size="small" style="width: 120px" v-model="params.office_id">
        <el-option v-for="item in $store.state.office_list"
                   :value="item.office_id"
                   :key="item.office_id"
                   :label="item['office_name']">
        </el-option>
      </el-select>
    </span>
      <!--状态选择框-->
      <span>
      状态：
      <el-select size="small" style="width: 100px" v-model="params.risk_level">
        <el-option value="全部"/>
        <el-option value="红色"/>
        <el-option value="橙色"/>
        <el-option value="黄色"/>
        <el-option value="蓝色"/>
      </el-select>
    </span>
      <!--起止时间选择框-->
      <span>
          <el-date-picker
              v-model="select_date"
              size="small"
              type="daterange"
              value-format="yyyy-MM-dd"
              align="right"
              unlink-panels
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="picker_options">
    </el-date-picker>
    </span>
      <!--三个按钮（查询、上传、导出-->
      <span style="display: flex; justify-content: space-between">
<!--        <el-button class="icon-button" type="primary" size="small" @click="$refs.risk.showDialog()">
          <i class="el-icon-plus"/> 风险处置
        </el-button>

        <el-button class="icon-button" type="primary" size="small" @click="exportInspection">
          <i class="el-icon-delete"/> 删除
        </el-button>-->

        <el-upload v-if="false"
            :limit="1"
            class="import-excel"
            :action="import_url"
            accept=".xls, .xlsx, .csv"
            :on-success="importSuccess">
          <el-button class="icon-button" type="primary" size="small"><i class="el-icon-upload"/> 上传</el-button>
        </el-upload>

        <el-button class="icon-button" type="primary" size="small" @click="exportInspection">
          <img :src="require('@/static/icon/u7965.png')" alt="!"/> 导出
        </el-button>
    </span>
    </div>

    <!-- 蓝条提示框，显示选中的数据条数 -->
    <div class="message-info">
      <i class="el-icon-info" style="color: #1698ef; float: left; font-size: 20px; margin: 10px 0 10px 5px"/>
      <span v-text="select_info"></span>
      <button style="background: transparent; border: none; color: #1698ef" @click="clearSelection">清空</button>
    </div>

    <!-- 表格，分页 -->
    <div style="text-align: center">
      <!-- 表格 -->
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
          style="width: 100%"
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
        <el-table-column
            min-width="180px"
            label="建筑物名称"
            prop="building_name"
            show-overflow-tooltip>
        </el-table-column>
        <el-table-column
            label="结构安全"
            width="100">
          <template slot-scope="scope" v-if="scope.row['scores'] && scope.row['scores'].length>0">
            {{ scope.row['scores'][0]['second_level_score'] }}
          </template>
        </el-table-column>
        <el-table-column
            label="金结机电"
            width="80">
          <template slot-scope="scope" v-if="scope.row['scores'] && scope.row['scores'].length>1">
            {{ scope.row['scores'][1]['second_level_score'] }}
          </template>
        </el-table-column>
        <el-table-column
            label="运行管理"
            width="100"
            show-overflow-tooltip>
          <template slot-scope="scope" v-if="scope.row['scores'] && scope.row['scores'].length>2">
            {{ scope.row['scores'][2]['second_level_score'] }}
          </template>
        </el-table-column>
        <el-table-column
            show-overflow-tooltip
            label="安全评价得分"
            align="center"
            width="130">
          <el-button size="mini" slot-scope="scope" @click="handleSafetyDetail(scope.row)">
            {{ scope.row['security_score'] }}
          </el-button>
        </el-table-column>
        <el-table-column
            prop="risk_level"
            label="风险等级"
            width="80">
        </el-table-column>
        <el-table-column
            width="130"
            align="center"
            label="关联风险事件">
          <template slot-scope="scope">
            <el-button
                size="mini"
                type="primary"
                @click="handleAssociatedRisk(scope.row)">查看
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
            label="风险评估周期"
            align="center"
            width="200">
          <template slot-scope="slot">
            {{ slot.row['evaluation_start'] + '~' + slot.row['evaluation_end'] }}
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
    </div>

    <!--查看安全评价得分-->
    <SafetyDetailDialog ref="safety-dialog"></SafetyDetailDialog>
    <!--查看/处置 关联风险事件-->
    <RiskListDialog ref="risk-list-dialog"></RiskListDialog>
  </div>
</template>

<script>
import downloadExcel from "@/utils/downloadExcel";
import {deleteRiskInfo, exportRisk, getRiskInfo} from "@/api/workingCondition/risk";
import SafetyDetailDialog from "@/components/risk/SafetyDetailDialog";
import RiskListDialog from "@/components/risk/RiskListDialog";
import HandleListDialog from "@/components/risk/HandleListDialog";

export default {
  name: "WarningPage",
  components: {HandleListDialog, RiskListDialog, SafetyDetailDialog},
  mounted() {
    // 获取管理处信息
    let office_list = this.$store.state.office_list
    // 如果store中已经有列表了，那么直接获取即可
    if (office_list.length > 0) {
      // 设置默认的管理处（辉县管理处）
      for (let index in office_list) {
        if (office_list[index]['office_name'] === '辉县管理处') {
          this.params.office_id = office_list[index]['office_id']
        }
      }
    } else {
      this.params.office_id = 59
    }
  },
  data() {
    let today = this.$store.state['today'].slice(0, 10)
    let start = this.$store.state['dayjs']().subtract(3, 'month').format('YYYY-MM-DD')
    return {
      // 输入框中的参数
      params: {
        office_id: '',
        risk_level: "全部",
        start_date: start,
        end_date: today,
        page_num: 1,
        page_size: 10,
      },
      select_date: [start, today],
      // 上传文件的uri
      import_url: '',
      // 日期选择器
      picker_options: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
            picker.$emit('pick', [start, end]);
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date();
            const start = new Date();
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
            picker.$emit('pick', [start, end]);
          }
        }],
        disabledDate(time) {
          return time.getTime() > Date.now()
        }
      },
      // 表格中的数据
      table_data: [],
      table_data_total: 0,
      // 选中的表格数据
      multiple_selection: [],
      // 是否显示加载动画
      is_loading_table: false,
    }
  },
  computed: {
    select_info() {
      return `已选择${this.multiple_selection.length}项`
    }
  },
  watch: {
    // 选择日期后，将值更新到请求参数中，然后加载表格
    select_date: {
      handler(newV, oldV) {
        if (newV) {
          this.params.start_date = newV[0]
          this.params.end_date = newV[1]
        } else {
          this.params.start_date = ''
          this.params.end_date = ''
        }
        this.getTableData()
      }
    },
    // 当参数变化时，重新加载表格
    params: {
      deep: true,
      handler() {
        this.getTableData()
      }
    }
  },
  methods: {
    // 成功上传文件后
    importSuccess(response, file, fileList) {
      console.log(response)
    },
    // 多选表格中的数据
    handleSelectionChange(val) {
      this.multiple_selection = val
    },
    // 清空选中的数据
    clearSelection() {
      this.$refs.multipleTable.clearSelection()
    },
    // 查看安全得分详情
    handleSafetyDetail(row) {
      this.$refs["safety-dialog"].showDialog(row)
    },
    // 查看/处置 关联风险事件
    handleAssociatedRisk(row) {
      this.$refs["risk-list-dialog"].showDialog(row)
    },
    // 批量删除所选数据
    handleDelete() {
      // 如果有选中项
      if (this.multiple_selection.length > 0) {
        // 弹框确认
        this.$confirm(`是否确定要删除这${this.multiple_selection.length}条数据？`, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          // 点击确认后，显示加载动画
          this.is_loading_table = true
          let risk_ids = []
          // 提取所有选中项的数据id
          for (let i = 0; i < this.multiple_selection.length; i++) {
            risk_ids.push(this.multiple_selection[i]['risk_id'])
          }

          // 使用api/monitor.js中的方法发送请求，回调函数
          deleteRiskInfo({risk_ids}).then(data => {
            this.is_loading_table = false
            // 返回的结果是成功
            if (data['result']) {
              this.clearSelection()
              this.is_loading_table = false
              this.$message.success(data['message'])
              // 重新加载表格数据
              this.getTableData()
            } else {
              this.$message.error(`删除失败，原因：${data['message']}`);
            }
          }).catch(err => {
            this.is_loading_table = false
            this.$message({type: "error", message: "删除失败!", showClose: true})
          })
        })
      } else {
        this.$message({type: "info", message: "还未选中任何数据！", showClose: true})
      }
    },

    // 分页插件-改变每页大小
    handleSizeChange(val) {
      this.params.page_size = val
    },
    // 改变当前页
    handleCurrentChange(val) {
      this.params.page_num = val
    },

    // 获取表格数据
    async getTableData() {
      if (!this.params.office_id) {
        this.$message.info("请在左侧选择管理处")
        return
      }
      this.is_loading_table = true
      let data = await getRiskInfo(this.params)
      if (data['result']) {
        // 当数据总数大于0，并且当前页数据为空，那么重置页码，并重新获取数据（通过watch）
        if (data['data'].total > 0 && data['data'].list.length === 0) {
          this.params.page_num = 1
          return
        }
        this.table_data = data['data'].list
        this.table_data_total = data['data'].total
      } else {
        this.$message.error(data['message'])
      }
      this.is_loading_table = false
    },

    //导出工情信息
    exportInspection() {
      // 设置参数
      let params = {
        office_id: this.params.office_id,
        is_no_audited: this.params.is_no_audited,
        start_date: this.params.start_date,
        end_date: this.params.end_date,
      }
      // 发送请求，因为需要从响应头中获取文件名，所以没有对它进行拦截，返回的是response
      exportRisk(params).then(response => {
        downloadExcel(response)
        this.$message.success("下载成功")
      }).catch(err => {
        this.$message.error(err)
      })
    },
  }
}
</script>

<style scoped>
.icon-button {
  height: 30px;
  line-height: 14px;
  padding: 8px 5px;
  margin: 0;
}

.import-excel {
  display: inline-block;
}

.message-info {
  margin: 10px 0;
  width: inherit;
  height: 40px;
  background-color: #e6f7ff;
  border: #99ceef solid 1px;
  border-radius: 5px;
  display: flow;
  justify-content: center;
  line-height: 40px;
  text-align: center;
}
</style>
