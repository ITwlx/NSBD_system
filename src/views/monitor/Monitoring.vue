<template>
  <div class="monitoring" style="margin: 20px 15px">
    <!--第一行内容：监测日期选择、查询等按钮 -->
    <div style="display: flow; text-align: center">
      <!-- 左侧输入框，输入日期等 -->
      <p style="width: 360px; float: left">
        监测日期：
        <el-date-picker
            v-model="params.monitoring_time"
            format="yyyy-MM-dd"
            value-format="yyyy-MM-dd"
            type="date"
            style="width: 140px"
            size="small"
            :clearable="false"
            placeholder="选择日期"
            :picker-options="{disabledDate(time){return time.getTime()>Date.now()}}">
        </el-date-picker>
        <el-checkbox style="margin-left: 10px" v-model="params.is_only_exception">仅查看异常
        </el-checkbox>
      </p>
      <!-- 右侧按钮：新增、删除、导出、上传 -->
      <p style="display: flex; justify-content: space-between; float:right;">
        <el-button class="icon-button" type="primary" size="small" @click="openDialog"><i class="el-icon-plus"/> 新增
        </el-button>
        <el-button class="icon-button" type="primary" size="small" @click="deleteSelectedDate">
          <i class="el-icon-delete"/> 删除
        </el-button>
        <el-button class="icon-button" type="primary" size="small" @click="exportInformation">
          <img :src="require('@/static/icon/u7965.png')" alt="!"/>
          导出
        </el-button>
        <el-upload
            v-if="false"
            style="margin-left: 10px"
            class="import-excel"
            :action="import_url"
            :show-file-list="false"
            accept=".xls, .xlsx, .csv"
            :limit="1"
            :before-upload="beforeUpload"
            :on-success="importSuccess">
          <el-button class="icon-button" type="primary" size="small"><i class="el-icon-upload"/> 上传</el-button>
        </el-upload>
      </p>
      <!-- 查询和重置按钮 -->
      <span style="position: relative; right: 50px;">
        <el-button style="padding: 8px 10px;" @click="resetQuery">重置</el-button>
      </span>
    </div>
    <!-- 蓝条提示框，显示选中的数据条数 -->
    <div class="message-info">
      <i class="el-icon-info" style="color: #1698ef; float: left; font-size: 20px; margin: 10px 0 10px 5px"/>
      <span v-text="selectInfo"></span>
      <button style="background: transparent; border: none; color: #1698ef" @click="clearSelection">清空</button>
    </div>
    <!-- 主体区域 box-->
    <div style="display: flex; margin-top: 30px">
      <!-- 管理处 和 建筑物、断面 的box-->
      <div style="margin: 0 20px 0 2px; width: 300px; height: fit-content; border: solid 1px #99ceef;">
        <!-- 管理处选择框 -->
        <el-select style="width: 100%" v-model="office_id" placeholder="请选择">
          <el-option
              v-for="item in $store.state.office_list"
              :key="item.office_id"
              :label="item['office_name']"
              :value="item.office_id">
          </el-option>
        </el-select>
        <!-- 建筑物和断面的树形控件 box -->
        <div style="overflow: auto; max-height: calc(100vh - 300px);">
          <el-tree
              node-key="key"
              ref="building-tree"
              :props="tree_props"
              :data="building_list"
              :highlight-current="true"
              :default-expand-all="true"
              v-loading="is_loading_build"
              @node-click="handleNodeClick"
              style="min-width: fit-content">
            <span class="custom-tree-node" slot-scope="{ data }">
              <span class="treeText1">
                <i v-if="data['building_name']" class="el-icon-folder-opened"></i>
                <i v-else class="el-icon-document-remove"/>
                {{ data['building_name'] || data['section_name'] }}
              </span>
                  <span v-text="'(' +(is_refresh_nums ? '-' : (data_nums['except'][data['key']] + '/' + data_nums['all'][data['key']])) + ')'"></span>

<!--                  <span >({{ is_refresh_nums ? '加载中' : (data_nums['except'][data['key']] + '/' + data_nums['all'][data['key']]) }})</span>-->
<!--                  <span>({{-->
<!--                      is_refresh_nums ? '加载中' : (data_nums['except']['s' + data['section_id']] + '/' + data_nums['all']['s' + data['section_id']])-->
<!--                    }})</span>-->
           </span>
          </el-tree>
        </div>
      </div>
      <!-- 表格，分页 -->
      <div style="flex: 1; overflow: auto">
        <!-- 表格 -->
        <el-table
            stripe
            border
            ref="multipleTable"
            :data="table_data"
            style="overflow: auto"
            tooltip-effect="dark"
            :row-style="{height: '20px'}"
            :cell-style="{padding: '1px'}"
            v-loading="is_loading_table"
            element-loading-text="加载中，请稍后..."
            element-loading-spinner="el-icon-loading"
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
              label="传感器名称"
              width="150">
            <template slot-scope="scope">{{ scope.row.sensor_name }}</template>
          </el-table-column>
          <el-table-column
              prop="sensor_type"
              label="传感器类型"
              width="120">
          </el-table-column>
          <el-table-column
              prop="associated_sensors_value"
              label="关联环境量"
              show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-for="(data, index) in scope.row.associated_sensors_value">
                <span v-if="index>0">, </span>
                <span>
                  {{ scope.row['associated_sensors'][index] }}:
                  {{ data }}
                </span>
              </span>
            </template>
          </el-table-column>
          <el-table-column
              prop="sensor_value"
              label="测值"
              width="80">
          </el-table-column>
          <el-table-column
              prop="monitoring_time"
              label="监测时间"
              width="150">
          </el-table-column>
          <el-table-column
              prop="result"
              label="判别结果"
              width="100">
          </el-table-column>
          <el-table-column
              prop="audit_time"
              label="时间"
              width="150">
          </el-table-column>
          <el-table-column label="操作" width="70">
            <template slot-scope="scope">
              <el-button
                  size="mini"
                  type="primary"
                  @click="handleEdit(scope.$index, scope.row)">查看
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
      </div>
    </div>

    <MonitoringForm :building_list="building_list" ref="monitoringForm"></MonitoringForm>
    <MonitoringDetail ref="monitoringDetail"></MonitoringDetail>
  </div>
</template>

<script>
import {getMonitorInfo, deleteInformation, exportInformation} from "@/api/workingCondition/monitor";
import {getAllBuilding, getAllSection, getBuildingDataNums} from "@/api/workingCondition";
import MonitoringForm from "@/components/monitor/MonitoringForm";
import MonitoringDetail from "@/components/monitor/MonitoringDetail";
import downloadExcel from "@/utils/downloadExcel";

export default {
  name: "Monitoring",
  components: {MonitoringDetail, MonitoringForm},
  mounted() {
    // 获取管理处信息
    let office_list = this.$store.state.office_list
    // 如果store中已经有列表了，那么直接获取即可
    if (office_list.length > 0) {
      // 设置默认的管理处（辉县管理处）
      for (let index in office_list) {
        if (office_list[index]['office_name'] === '辉县管理处') {
          this.office_id = office_list[index]['office_id']
        }
      }
    } else {
      this.office_id = 59
    }
  },
  data() {
    let today = this.$store.state['today']
    return {
      params: {
        section_id: '',
        monitoring_time: today.slice(0, 10),
        is_only_exception: true,
        page_num: 1,
        page_size: 10
      },
      select_monitor_date: "",
      multiple_selection: [],
      office_id: '',
      building_id: '',
      building_list: [],
      is_loading_build: false,
      is_loading_table: false,
      tree_props: {
        children: 'sections',
        isLeaf: 'is_leaf'
      },
      import_url: process.env.VUE_APP_BASE_API + "/huashui/WorkingCondition/MonitoringInformation/import",
      table_data: [],
      table_data_total: 0,
      is_refresh_nums: false,
      data_nums: {
        all: {},
        except: {}
      },
    }
  },
  watch: {
    // 当改变office_id后，重新加载建筑物列表
    office_id: {
      immediate: false,
      handler() {
        this.building_id = ''
        this.params.section_id = ''
        this.getBuildingData()
      }
    },
    params: {
      deep: true,
      handler() {
        this.getTableData()
      }
    },
    // 当改变日期后，刷新数据记录数
    "params.monitoring_time": {
      handler() {
        this.refreshAllBuildingDataNums()
      }
    }
  },
  computed: {
    selectInfo: function () {
      return "已选择" + this.multiple_selection.length + "项"
    }
  },
  methods: {
    // 重置筛选条件：是否仅查看异常、监测日期，然后重新加载
    resetQuery() {
      if (this.params.is_only_exception) {
        this.params.is_only_exception = false
        if (this.params.section_id) {
          // 清空选中的数据
          this.clearSelection()
        }
        this.$message({type: "success", message: "重置成功！", showClose: true})
      } else {
        this.$message({type: "info", message: "不需要重置", showClose: true})
      }
    },
    // 点击新增后，显示 弹框表单 组件
    openDialog() {
      this.$refs.monitoringForm.showDialog(this.building_id, this.params.section_id, this.params.monitoring_time)
    },
    // 清空表格中复选的数据（清除所有选中的项）
    clearSelection() {
      this.$refs.multipleTable.clearSelection();
    },
    // 点击表格中的复选框后选中数据
    handleSelectionChange(val) {
      this.multiple_selection = val;
    },
    // 点击表格中的查看，弹框显示数据
    handleEdit(index, row) {
      this.$refs.monitoringDetail.showDialog(row.monitor_data_id)
    },
    // 分页插件-改变每页大小
    handleSizeChange(val) {
      this.params.page_size = val
    },
    // 改变当前页
    handleCurrentChange(val) {
      this.params.page_num = val
    },
    // 点击树形控件中的断面，然后更新表格数据
    handleNodeClick(data, node) {
      // 更新选择的建筑物id（如果点击的断面，那么断面对象的原型上有建筑物id
      this.building_id = data['building_id']
      // 如果点击的是一个断面节点（有section_id）
      if (data['section_id']) {
        // 如果选择了别的断面
        if (this.params.section_id !== data['section_id']) {
          // 更新选择的断面id
          this.params.section_id = data['section_id']
          // 更新建筑物id
          this.building_id = node.parent.data['building_id']
        }
      } else {
        // 如果选择的是建筑物，更新建筑物id
        this.building_id = data['building_id']
      }
    },
    beforeUpload(file) {
      this.$message.info(`文件"${file.name}"上传中...`)
      // return false
    },
    refreshAllBuildingDataNums() {
      // 优化完毕，可以使用
      // sql太久，暂时不需要
      // let need = false
      // if (need === false) {
      //   return
      // }
      let buildings = this.building_list
      for (let i = 0, len = buildings.length; i < len; i++) {
        this.refreshBuildingDataNums(buildings[i]['building_id'])
      }
    },

    // 加载建筑物信息
    async getBuildingData() {
      // 加载建筑物列表
      this.is_loading_build = true

      let data = await getAllBuilding({
        "office_id": this.office_id,
        "monitoring_time": this.params.monitoring_time
      })
      if (data['result']) {
        this.building_list = data['data']
      } else {
        this.$message({type: 'error', message: '数据加载失败', showClose: true})
      }

      this.is_loading_build = false
      // 刷新数据记录数
      this.refreshAllBuildingDataNums()
    },
    // 加载某个建筑物下的异常数据记录数
    async refreshBuildingDataNums(building_id) {
      this.is_refresh_nums = true

      let monitoring_time = this.params.monitoring_time
      let data = await getBuildingDataNums({
        "building_id": building_id,
        "monitoring_time": monitoring_time
      })
      // 如果请求的数据没错，并且在此期间用户没有切换过监测日期，那么覆盖数据
      if (data['result']) {
        let building = data['data']
        // 将该building的总记录数放入map
        this.data_nums['all'][building['key']] = building['all_num']
        // 将该building的异常记录数放入map
        this.data_nums['except'][building['key']] = building['exceptions_num']
        let list = building['sections']
        // 将该building下的断面的总记录数和异常记录数放入map
        for (let i = 0, len = list.length; i < len; i++) {
          this.data_nums['all'][list[i]['key']] = list[i]['all_num']
          this.data_nums['except'][list[i]['key']] = list[i]['exceptions_num']
        }
      } else {
        this.$message({type: 'error', message: '记录数加载失败', showClose: true})
      }
      this.data_nums = JSON.parse(JSON.stringify(this.data_nums))
      this.is_refresh_nums = false
    },
    // 查询表格数据
    async getTableData() {
      // 如果没有选择断面
      if (!this.params.section_id) {
        this.$message.info("请在左侧选择断面")
        return
      }
      // 请求数据并更新表格数据
      this.is_loading_table = true
      // 必选参数：断面id、分页下标、分页尺寸
      let data = await getMonitorInfo(this.params)
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
    // 导入excel表
    importSuccess(response, file, fileList) {
      let filename = file.name
      if (response.result) {
        this.$message.success(`文件 ${filename} 导入成功！${response.message}`)
      } else {
        this.$message.error(`文件 ${filename} 导入失败。${response.message}`)
      }
      // console.log(response, file, fileList)
    },
    // 导出excel表
    exportInformation() {
      // 判断是否选择了断面
      if (this.params.section_id) {
        this.$message.info("开始导出，请稍后...")
        // 设置参数
        let params = {
          section_id: this.params.section_id,
          monitoring_time: this.params.monitoring_time,
          is_only_exception: this.params.is_only_exception
        }
        // 发送请求，因为需要从响应头中获取文件名，所以没有对它进行拦截，返回的是response
        exportInformation(params).then(response => {
          downloadExcel(response)
          this.$message.success("下载成功")
        }).catch(err => {
          this.$message.error(err)
        })
      } else {
        this.$message.info("请先选择断面")
      }
    },
    // 想后台发送删除数据的请求：删除表格中所有选中的数据项
    deleteSelectedDate() {
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
          let monitor_data_ids = []
          // 提取所有选中项的数据id
          for (let i = 0; i < this.multiple_selection.length; i++) {
            monitor_data_ids.push(this.multiple_selection[i].monitor_data_id)
          }

          // 使用api/monitor.js中的方法发送请求，回调函数
          deleteInformation({monitor_data_ids}).then(data => {
            this.is_loading_table = false
            // 返回的结果是成功
            if (data['result']) {
              this.clearSelection()
              this.is_loading_table = false
              this.$message({
                type: 'success',
                message: '删除成功!'
              });
              // 重新加载表格数据
              this.getTableData()
            } else {
              this.$message({
                type: 'error',
                message: `删除失败，原因：${data['message']}`
              });
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
  }
}
</script>

<style scoped>
.monitoring {
  margin: 20px 0 0 20px;
}

p {
  font-size: small;
}

.icon-button {
  height: 30px;
  line-height: 14px;
  padding: 8px 5px;
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

.import-excel {
  display: inline-block;
}
</style>
