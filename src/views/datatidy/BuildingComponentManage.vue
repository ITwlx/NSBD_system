<template>
  <!--  <div>-->
  <div style="display: flex; border-top: solid #dcdfe6 1px">
    <!-- 管理处 和 建筑物、断面 的box -->
    <div
        style="margin: 20px; width: 300px; height: fit-content; border: solid 1px #99ceef">
      <!-- 管理处选择框 -->
      <el-select
          style="width: 100%"
          v-model="params.office_id"
          placeholder="请选择">
        <el-option
            :key="item.office_id"
            :value="item.office_id"
            :label="item['office_name']"
            v-for="item in office_list">
        </el-option>
      </el-select>
      <!-- 建筑物和断面的树形控件 box -->
      <div style="overflow: auto; min-height: 300px; max-height: calc(100vh - 200px);">
        <!--        <el-radio-group
                    style="min-width: fit-content"
                    v-model="building_index"
                    @change="selectBuilding"
                    v-loading="is_loading_build"
                    v-if="building_list && building_list.length > 0">
                    <el-radio
                        style="display: block; margin: 20px"
                        :key="item['building_id']"
                        :label="index"
                        v-for="(item, index) in building_list">
                      {{item['building_name']}}
                    </el-radio>
                </el-radio-group>-->
        <div
            style="min-width: fit-content"
            v-loading="is_loading_build"
            v-if="building_list && building_list.length > 0">
          <el-button
              style="display: block; margin: 5px; width: 96%; text-align: left"
              plain type="primary"
              :key="item['building_id']"
              @click="selectBuilding(index)"
              v-for="(item, index) in building_list">
            {{ item['building_name'] }} <br/>{{"("+ item['begin_pile'] +"-"+ item['end_pile']+")" }}
          </el-button>
        </div>
        <p v-else style="color: #afbdcd; text-align: center; line-height: 200px">
          暂无建筑物
        </p>

      </div>
    </div>
    <!--监测异常识别表-->
    <div style="flex: 1; padding: 20px; overflow:auto; border-left: solid 1px #dcdfe6">
      <div>
        <h5 style="display: inline-block; width: 130px">监测异常识别表</h5>
        <el-checkbox style="display: inline-block; width: 180px" v-model="params.is_bound">显示已绑定组件</el-checkbox>
        <!-- 并没有采用 @change，而是采用对key的监听触发事件 -->
        <el-input
            style="display: inline-block; width: 160px"
            clearable
            size="medium"
            maxlength="20"
            v-model="key"
            placeholder="请输入组件名"
            prefix-icon="el-icon-search"/>
      </div>
      <el-table
          ref="monitor_table"
          stripe border
          :data="table_data"
          @selection-change="val => multiple_selection = val"
          v-loading="is_loading_table"
          :row-style="{height: '36px'}"
          :cell-style="{padding: '1px'}"
          style="width: 100%; margin-top: 10px">
        <el-table-column
            type="selection"
            width="50">
        </el-table-column>
        <el-table-column
            label="#"
            type="index"
            width="50">
        </el-table-column>
        <el-table-column
            width="120px"
            label="已绑定建筑物id"
            prop="building_id">
        </el-table-column>
        <el-table-column
            min-width="300px"
            label="组件名"
            prop="componentName">
        </el-table-column>
        <el-table-column
            label="firstStakeNum"
            width="150px"
            prop="fistStakeNum">
        </el-table-column>
        <el-table-column
            label="endStakeNum"
            width="150px"
            prop="endStakeNum">
        </el-table-column>
        <el-table-column
            label="substationCode"
            width="120px"
            prop="substationCode">
        </el-table-column>
        <el-table-column
            label="managementCode"
            width="130px"
            prop="managementCode">
        </el-table-column>
        <el-table-column
            label="totalCode"
            width="280px"
            prop="totalCode">
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
  </div>
  <!--  </div>-->
</template>

<script>
import {getOfficeList, getBuildingByOfficeId, getPageComponentByOfficeAndBounded, postBindBuilding}
  from "@/api/workingCondition/model/buildingComponentManage";
import {debounce} from "@/utils/common";

export default {
  name: "BuildingComponentManage",
  data() {
    return {
      office_list: [],
      building_index: '',
      building_list: [],
      // 在表格中选择的数据 列表
      multiple_selection: [],
      // 是否在加载建筑物列表
      is_loading_build: false,
      // 是否在加载表格数据
      is_loading_table: false,
      // 刷新表格数据时提交的参数
      // 在监视对象时，value和oldValue都是指向对象，所以一样
      // 但是key在改变的时候需要进行防抖处理，所以只能提取出来
      key: '',
      params: {
        office_id: '',
        page_num: 1,
        page_size: 10,
        is_bound: false
      },
      // 表格中的数据
      table_data: [],
      // 分页插件-表格数据总数
      table_data_total: 0,
    }
  },
  watch: {
    // 当改变office_id后，重新加载建筑物列表
    "params.office_id": {
      handler() {
        this.getBuildingList()
      }
    },
    // 当改变 断面id、分页参数时，刷新表格数据
    params: {
      deep: true,
      handler(newV, oldV) {
        // 心就值一样，因为vue并没有对旧对象进行拷贝
        // console.log(newV, oldV)
        this.getTableData()
      }
    },
    // 需要对 key 进行防抖，所以不能放在 params中进行监听
    key() {
      this.queryTable()
    }
  },
  mounted() {
    // 获取管理处信息
    this.getOfficeList()
  },
  methods: {
    selectBuilding(val) {
      // console.log(this.building_list[val]['building_id'], this.building_list[val]['building_name'])
      if (this.multiple_selection.length <= 0) {
        this.$message.info("还未在表格中选择要绑定到该建筑物的组件")
        this.building_index = ''
      } else {
        let building_id = this.building_list[val]['building_id']
        let building_name = this.building_list[val]['building_name']
        let repeat = []
        let component_ids = []
        for (let i in this.multiple_selection) {
          component_ids.push(this.multiple_selection[i]['id'])
          if (this.multiple_selection[i]['building_id']) {
            repeat.push(this.multiple_selection[i]['id'])
          }
        }
        // let component_ids = this.multiple_selection.map(item => item['id'])
        let param = {
          "building_id": building_id,
          component_ids
        }
        let msg = `是否将这${this.multiple_selection.length}个组件绑定到【${building_name}】？\n(${repeat.length}个组件已绑定过)`
        this.$confirm(msg, "提示", {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info'
        }).then(() => {
          this.bindingBuilding(param)
        }).catch(() => {
          this.building_index = ''
        })
      }
    },
    queryTable() {
      if (this.key){
        debounce(this.getTableData, 500).bind(this, this.key)()
      }else {
        this.getTableData()
      }
    },

    // 获取管理处列表
    async getOfficeList() {
      let params = {
        "grade": 3
      }
      let data = await getOfficeList(params)
      if (data['result']) {
        this.office_list = data['data']
        this.params.office_id = 59
      }
    },
    // 获取建筑物列表（依据管理处id）
    async getBuildingList() {
      this.is_loading_build = true
      let param = {
        'office_id': this.params.office_id
      }
      let data = await getBuildingByOfficeId(param)
      if (data['result']) {
        // 按 起始桩号进行排序
        this.building_list = data['data'].sort((a, b) => {
          let ap = parseFloat(a['begin_pile'].replace(/[^\d.]/g,''))
          let bp = parseFloat(b['begin_pile'].replace(/[^\d.]/g, ''))
          return ap-bp
        })
      }
      this.is_loading_build = false
    },
    // 获取表格中的数据
    async getTableData(key=null) {
      this.is_loading_table = true
      // 请求数据
      let params = {...this.params, key}
      let data = await getPageComponentByOfficeAndBounded(params)
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
    // 绑定组件到建筑物
    async bindingBuilding(binding_list) {
      let notify = this.$notify.info({
        title: '提示',
        message: '绑定中...'
      })
      // 0表示禁用，1表示启用，与1进行异或运算
      let data = await postBindBuilding(binding_list)
      if (data['result']) {
        notify.type = 'success'
        notify.message = "绑定成功！"
      } else {
        this.$message.warning(data['message'])
      }
      // 刷新表格数据
      await this.getTableData()
    }
  }
}
</script>

<style scoped>

</style>
