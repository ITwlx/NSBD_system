<template>
  <!--  <div>-->
  <div style="display: flex; border-top: solid #dcdfe6 1px">
    <!-- 管理处 和 建筑物、断面 的box -->
    <div
        style="margin: 20px; width: 300px; height: fit-content; border: solid 1px #99ceef">
      <!-- 管理处选择框 -->
      <el-select
          style="width: 100%"
          v-model="office_id"
          placeholder="请选择">
        <el-option
            :key="item.office_id"
            :value="item.office_id"
            :label="item['office_name']"
            v-for="item in $store.state.office_list">
        </el-option>
      </el-select>
      <!-- 建筑物和断面的树形控件 box -->
      <div style="overflow: auto; max-height: calc(100vh - 200px);">
        <el-tree
            style="min-width: fit-content"
            :default-expand-all="true"
            :highlight-current="true"
            :data="building_list"
            :props="tree_props"
            v-loading="is_loading_build"
            @node-click="data => {params.building_id = data['building_id']}">
            <span class="custom-tree-node" slot-scope="{ data }">
              <span class="treeText1">
                <i class="el-icon-folder-opened"></i>
                {{ data['building_name'] }}
              </span>
              <span>({{ sensor_nums[data['key']] || '-' }})</span>
           </span>
        </el-tree>
      </div>
    </div>
    <!--监测异常识别表-->
    <div style="flex: 1; padding: 20px; overflow:auto; border-left: solid 1px #dcdfe6">
      <h5>监测设备表（测压管）</h5>
      <el-table
          ref="monitor_table"
          stripe border
          :data="table_data"
          v-loading="is_loading_table"
          :row-style="{height: '20px'}"
          :cell-style="{padding: '1px'}"
          style="width: 100%; margin-top: 10px"
          @sort-change="sortChange"
          :default-sort="{'prop': 'pile_no', 'order': 'ascending'}">
        <el-table-column
            label="序号"
            type="index"
            width="50">
        </el-table-column>
        <el-table-column
            width="200px"
            label="传感器"
            prop="sensor_name">
        </el-table-column>
        <el-table-column
            width="130px"
            label="传感器类型"
            prop="sensor_type">
        </el-table-column>
        <el-table-column
            width="160px"
            label="桩号"
            sortable="custom"
            prop="pile_no">
        </el-table-column>
        <!--            :sort-method="(a, b) =>{
              let ap = parseFloat(a['pile_no'].replace(/[^\d.]/g,''))
              let bp = parseFloat(b['pile_no'].replace(/[^\d.]/g, ''))
              return ap-bp
            }"-->
        <el-table-column
            label="关联传感器">
          <template slot-scope="scope">
            {{
              scope.row['associated_sensors_data'] && scope.row['associated_sensors_data'].length > 0
                  ? scope.row['associated_sensors_data'].map(item => item['sensor_name']).join() : ""
            }}
          </template>
        </el-table-column>
        <el-table-column
            label="选项"
            width="84px">
          <template slot-scope="scope">
            <el-button
                size="mini"
                @click="$refs['model-settings'].showDialog(params.building_id, building_name, scope.row)">
              设置
            </el-button>
          </template>
        </el-table-column>
        <el-table-column
            label="启用"
            width="70px">
          <template slot-scope="scope">
            <el-switch
                @change="changeActivate(scope.row)"
                v-model="scope.row['activate'] === 1">
            </el-switch>
          </template>
        </el-table-column>
      </el-table>
      <!--分页插件 box-->
      <el-pagination
          @size-change="val => {params.page_size = val}"
          @current-change="val => {params.page_num = val}"
          :current-page="params.page_num"
          background
          style="margin-top: 10px; display: flex; justify-content: space-between;"
          :page-sizes="[10,20]"
          :page-size="params.page_size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="table_data_total">
      </el-pagination>
    </div>
    <!--点击表格中的设置后，弹框页面-->
    <GroundwaterModelSettings ref="model-settings" @refreshData="getTableData"></GroundwaterModelSettings>
  </div>
  <!--  </div>-->
</template>

<script>
import {getAllBuilding} from "@/api/workingCondition";
import {changeModelActivate, getSensorModelList, getGroundwaterSensorNumByBuildingId}
  from "@/api/workingCondition/model/groundWaterModel";
import GroundwaterModelSettings from "@/components/model/groundwater/GroundwaterModelSettings";

export default {
  name: "GroundwaterModel",
  components: {GroundwaterModelSettings},
  data() {
    return {
      office_id: '',
      building_name: '',
      building_list: [],
      sensor_nums: {},
      // 在表格中选择的数据 列表
      multiple_selection: [],
      // 是否在加载建筑物列表
      is_loading_build: false,
      // 是否在加载表格数据
      is_loading_table: false,
      // 左侧 建筑物树形结构的子节点列表
      tree_props: {},
      // 刷新表格数据时提交的参数
      params: {
        building_id: '',
        order: 'asc',
        page_num: 1,
        page_size: 20,
      },
      // 表格中的数据
      table_data: [],
      // 分页插件-表格数据总数
      table_data_total: 0,
    }
  },
  watch: {
    // 当改变office_id后，重新加载建筑物列表
    office_id: {
      handler() {
        this.is_loading_build = true
        this.params.building_id = ''
        getAllBuilding({"office_id": this.office_id}).then(data => {
          this.building_list = data['data']
          this.refreshSensorNums()
          this.is_loading_build = false
        }).catch(err => {
          this.$message({type: 'error', message: '数据加载失败', showClose: true})
        })
      }
    },
    // 当改变 断面id、分页参数时，刷新表格数据
    params: {
      deep: true,
      handler() {
        this.getTableData()
      }
    }
  },
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
  methods: {
    refreshSensorNums() {
      this.sensor_nums = {}
      for (let index in this.building_list) {
        this.getSensorNums(this.building_list[index])
      }
    },
    sortChange(sort){
      if (sort['order']){
        if (sort['order'] === 'descending'){
          this.params.order = 'desc'
        }else {
          this.params.order = 'asc'
        }
      }else {
        this.params.order = null
      }
      // console.log(sort)
    },

    // 获取表格中的数据
    async getTableData() {
      this.is_loading_table = true
      // 请求数据
      let data = await getSensorModelList(this.params)
      if (data['result']) {
        // 当数据总数大于0，并且当前页数据为空，那么重置页码，并重新获取数据（通过watch）
        if (data['data'].total > 0 && data['data'].list.length === 0) {
          this.params.page_num = 1
          return
        }
        this.table_data = data['data']['list']
        this.table_data_total = data['data']['total']
      }

      this.is_loading_table = false
    },
    // 获取表格中的数据
    async getSensorNums(building) {
      let building_id = building['building_id']
      // 请求数据
      let data = await getGroundwaterSensorNumByBuildingId({building_id})
      if (data['result']) {
        this.sensor_nums[building['key']] = data['data']
        this.sensor_nums = JSON.parse(JSON.stringify(this.sensor_nums))
      }
    },
    // 启用/禁用 模型
    async changeActivate(row) {
      let notify = this.$notify.info({
        title: '提示',
        message: row['activate'] ? '关闭中...' : '启用中...'
      })
      // 0表示禁用，1表示启用，与1进行异或运算
      let data = await changeModelActivate({
        sensor_id: row['sensor_id'],
        activate: row['activate'] ^ 1,
      })
      if (data['result']) {
        // 更新表格中开关的状态
        row['activate'] ^= 1
        notify.type = 'success'
        notify.message = row['activate'] ? "启用成功" : "关闭成功"
      } else {
        this.$message.warning(data['message'])
      }
    }
  }
}
</script>

<style scoped>

</style>
