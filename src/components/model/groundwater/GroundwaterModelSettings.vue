<template>
  <el-dialog
      width="65%"
      :center="true"
      @close="closeDialog"
      :close-on-click-modal="false"
      :visible.sync="dialog_visible">
    <!--    title -->
    <div slot="title">
      <p>测压管研判模型设置</p>
      <p>{{ row == null ? '' : (row['sensor_name'] + '(桩号：' + row['pile_no'] + ')') }}</p>
    </div>
    <!--    content -->
    <div style="display: flex">
      <!--      left content: table of associated sensors -->
      <div style="flex: 1; padding: 10px">
        <p style="line-height: 29px;">
          关联传感器
        </p>
        <div style="margin: 20px 20px 20px 20px; flex: 2">
          <el-table
              ref="sensor-table"
              size="mini"
              max-height="500"
              v-loading="is_loading_data"
              @select="selectSensor"
              @select-all="selectAllSensor"
              @selection-change="(val)=>{ selection_sensors = val}"
              :data="associatable_sensors">
            <el-table-column type="selection" width="45px"/>
            <el-table-column label="传感器" prop="sensor_name"/>
            <el-table-column label="桩号" prop="pile_no" width="90px"/>
            <el-table-column width="100px" label="类型" prop="sensor_type"/>
          </el-table>
        </div>
      </div>
      <div style="border-left: solid 1px #dcdfe6"/>
      <div
          v-loading="is_loading_data"
          style="flex: 3; padding: 10px">
        <p>
          时间：
          <el-date-picker
              size="mini"
              style="width:230px"
              unlink-panels
              type="daterange"
              :clearable="false"
              format="yyyy-MM-dd"
              value-format="yyyy-MM-dd"
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              v-model="date_picker"
              :picker-options="{disabledDate(time){return time.getTime()>Date.now()}}">
          </el-date-picker>
        </p>
        <div style="height: 500px; width: 90%">
          <GroundwaterSensorCharts
              :sensors_data="sensors_data"/>
        </div>

      </div>
    </div>
    <template slot="footer">
      <el-button size="mini" type="" @click="closeDialog">取消</el-button>
      <el-button size="mini" type="primary" @click="postAssociatedSensors">更新</el-button>
    </template>

  </el-dialog>
</template>

<script>
import {
  getSensorsValue, trainSensorModel,
  updateAssociatedSensors, getAssociatedSensorsByBuildingId
} from "@/api/workingCondition/model/groundWaterModel";
import GroundwaterSensorCharts from "@/components/model/groundwater/GroundwaterSensorCharts";

export default {
  name: "GroundwaterModelSettings",
  components: {GroundwaterSensorCharts},
  data() {
    let today = this.$store.state['today'].slice(0, 10)
    let last_year_date = this.$store.state['dayjs']().subtract(1, 'year').format('YYYY-MM-DD')

    return {
      // 对话框是否可见
      dialog_visible: false,
      // 是否在加载数据
      is_loading_data: false,
      row: null,
      // 传感器id
      sensor_id: null,
      // 该传感器关联的传感器id
      associated_ids: new Set(),
      // 该传感器可关联的传感器列表
      associatable_sensors: [],
      // 在表格中选择的传感器
      selection_sensors: [],
      // 所有传感器的监测数据
      sensors_data: [],
      // 日期选择器
      date_picker: [last_year_date, today],
      is_updated: false,
    }
  },
  watch: {
    date_picker: {
      deep: true,
      handler(newV) {
        this.getMonitorDataBySensorsId()
      }
    }
  },

  methods: {
    showDialog(building_id, building_name, row) {
      // 打开对话框
      this.dialog_visible = true
      // 当 is_updated = true 时，关闭对话框需要触发父组件刷新表格
      this.is_updated = false
      // 更新组件中的数据
      this.selection_sensors.length = 0
      this.row = row
      this.building_id = building_id
      this.building_name = building_name
      this.sensor_id = row['sensor_id']
      // 获取所有可关联的传感器，并更新关联的传感器
      this.$nextTick(async () => {
        // 等待获取传感器列表
        await this.getBuildingSensors()

        // 更新已关联的传感器
        this.updateAssociatedSensorsIdSet(row['associated_sensors_data'])

        // 更新完关联传感器，更新日期并触发监视 or 手动更新echarts图
        // 当 data_period 不为空，那么更新 date_picker，并触发监视，更新数据图
        if (row['data_period']) {
          this.date_picker = JSON.parse(row['data_period'])
        } else {
          // 否则 按默认的更新数据图
          await this.getMonitorDataBySensorsId(null)
        }
      })
    },
    closeDialog() {
      if (this.is_updated) {
        this.$emit('refreshData')
      }
      this.dialog_visible = false
    },
    // 更新关联的传感器id，以便去重（该集合包含这个传感器本身的id）
    updateAssociatedSensorsIdSet(associated_sensors) {
      this.associated_ids.clear()
      this.associated_ids.add(this.sensor_id)
      for (let index in associated_sensors) {
        this.associated_ids.add(associated_sensors[index]['sensor_id'])
      }

      // 将已关联的传感器放入 已选择列表，表格会自动勾选
      for (let i = 0; i < this.associatable_sensors.length; i++) {
        if (this.associated_ids.has(this.associatable_sensors[i]['sensor_id'])) {
          this.$refs["sensor-table"].toggleRowSelection(this.associatable_sensors[i], true)
        }
      }
    },
    // 每选择一个传感器，就请求他的监测数据
    selectSensor(selection, row) {
      this.is_updated = true
      if (selection.length > this.selection_sensors.length) {
        this.getMonitorDataBySensorsId(row['sensor_id'])
      } else {
        for (let i = 0; i < this.sensors_data.length; i++) {
          if (row['sensor_id'] === this.sensors_data[i]['sensor_id']) {
            this.sensors_data.splice(i, 1)
            break
          }
        }
      }
    },
    selectAllSensor() {
      this.is_updated = true
      this.getMonitorDataBySensorsId()
    },

    // 获取建筑物下的所有传感器
    async getBuildingSensors() {
      let params = {
        building_id: this.building_id
      }
      let data = await getAssociatedSensorsByBuildingId(params)
      if (data['result']) {
        this.associatable_sensors = data['data']
      }
    },
    // 请求 更新该传感器的关联传感器
    async postAssociatedSensors() {
      if (this.is_updated) {
        let params = {
          'sensor_id': this.sensor_id,
          'associated_ids': this.selection_sensors.map(item => item['sensor_id'])
        }
        let data = await updateAssociatedSensors(params)
        if (data['result']) {
          this.$message.success(data['message'] || "更新成功！")
        }
      }
      this.closeDialog()
    },
    // 根据传感器id获取传感器监测数据
    // 如果传入参数，则获取该传感器的数据
    // 否则，获取关联传感器的监测数据
    async getMonitorDataBySensorsId(sensor_id) {
      this.is_loading_data = true
      // 设置起止日期
      let params = {
        date_start: this.date_picker[0],
        date_end: this.date_picker[1]
      }
      // 获取单个传感器数据
      if (sensor_id) {
        params.sensor_ids = [sensor_id]
      } else if (this.selection_sensors === null) {
        params.sensor_ids = [this.sensor_id]
      } else {
        // 获取所有传感器数据
        params.sensor_ids = this.selection_sensors.map(item => item['sensor_id'])
        // 将传感器本身放入列表第一位
        params.sensor_ids.unshift(this.sensor_id)
      }
      let data = await getSensorsValue(params)
      if (data['result']) {
        if (sensor_id && data['data'].length === 1) {
          this.sensors_data.push(data['data'][0])
        } else {
          this.sensors_data = data['data']
        }
      }
      this.is_loading_data = false
    },
    // 重新训练
    async reTraining() {
      let data = await trainSensorModel(this.form_data)
      if (data['result']) {
        this.$message.success(data['message'] || "训练成功！")
      } else {
        this.$message.error(`error: ${data['message']}`)
      }
    }
  }
}
</script>

<style scoped>

</style>
