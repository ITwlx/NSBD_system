<template>
  <el-dialog
      title="设置"
      width="55%"
      :center="true"
      @close="closeDialog"
      v-loading="is_posting_data"
      :close-on-click-modal="false"
      :visible.sync="dialog_visible">
    <div style="display: flex">
      <div style="flex: 1; padding: 10px">
        <p style="line-height: 29px;">
          关联传感器
          <span style="float: right">
            <el-button
                circle
                @click="$refs['edit-sensors'].showDialog(building_id, section, associated_ids)"
                size="mini"
                type="primary"
                icon="el-icon-plus"/>
            <el-button
                circle
                @click="deleteAssociatedSensors"
                size="mini"
                type="danger"
                icon="el-icon-minus"/>
          </span>
        </p>
        <div style="margin: 20px 20px 20px 20px">
          <el-table
              size="mini"
              v-loading="is_loading_data"
              @selection-change="(val)=>{ selection_sensors = val}"
              :data="associated_sensors_data">
            <el-table-column type="selection" width="45px"/>
            <el-table-column label="传感器" prop="sensor_name"/>
            <el-table-column width="100px" label="类型" prop="sensor_type"/>
          </el-table>
        </div>
        <div style="margin-top: 30px">
          <p style="margin-bottom: 20px">模型参数：</p>
          <el-form
              ref="form"
              size="mini"
              :model="form_data"
              :rules="form_rule"
              label-suffix="："
              label-width="150px"
              label-position="left">
            <el-form-item label="n_estimators" prop="n_estimators">
              <el-input-number v-model="form_data.n_estimators"/>
            </el-form-item>
            <el-form-item label="max_depth" prop="max_depth">
              <el-input-number v-model="form_data.max_depth"/>
            </el-form-item>
            <el-form-item label="learning_rate" prop="learning_rate">
              <el-input-number v-model="form_data.learning_rate"/>
            </el-form-item>
            <el-form-item label="is_time_correlated">
              <el-select v-model="form_data.is_time_correlated" style="width: 130px">
                <el-option value="Y"/>
                <el-option value="N"/>
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div style="border-left: solid 1px #dcdfe6"/>
      <div
          v-loading="is_loading_data"
          style="flex: 2; padding: 10px">
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
        <div v-for="item in sensors_data" :key="item['sensor_id']" style="height: 160px">
          <SensorCharts
              :sensor_id="item['sensor_id']"
              :title="item['sensor_name']"
              :time_line="item['time_line']"
              :y-axis_name="$store.state['units'][item.sensor_type]"
              :series_data="item['data_line']"/>
        </div>
      </div>
    </div>
    <template slot="footer">
      <el-button size="mini" type="" @click="closeDialog">取消</el-button>
      <el-button size="mini" type="primary" @click="checkModelParamsAndTraining">确定</el-button>
    </template>

    <EditAssociatedSensors ref="edit-sensors" @selected="selectAssociatedSensors"/>
  </el-dialog>
</template>

<script>
import {
  getSensorModelSetting, getSensorsValue, trainSensorModel,
  updateAssociatedSensors,
  updateSensorModelSetting
} from "@/api/workingCondition/model";
import EditAssociatedSensors from "@/components/model/monitor/EditAssociatedSensors";
import SensorCharts from "@/components/model/monitor/SensorCharts";

export default {
  name: "ModelSettings",
  components: {SensorCharts, EditAssociatedSensors},
  data() {
    let today = this.$store.state['today']
    today = today.slice(0, 10)
    let y_m_d = today.split('-')
    let last_year_date = (y_m_d[0] - 1) + "-" + y_m_d[1] + "-" + y_m_d[2]

    let checkNum = (rule, value, callback) => {
      if (!value) {
        return new Error('必填项')
      } else {
        if (!Number.isInteger(value)) {
          callback(new Error('请输入整数'))
        } else {
          callback()
        }
      }
    }
    return {
      // 对话框是否可见
      dialog_visible: false,
      // 是否在加载数据
      is_loading_data: false,
      // 是否在提交表单
      is_posting_data: false,
      // 断面信息（id和name）
      section: {},
      // 传感器id
      sensor_id: null,
      // 该传感器关联的传感器id
      associated_ids: new Set(),
      // 该传感器关联的传感器列表
      associated_sensors_data: [],
      // 所有传感器的监测数据
      sensors_data: [],
      // 在表格中选择的传感器
      selection_sensors: [],
      // 表单中的参数
      form_data: {
        n_estimators: 0,
        max_depth: 0,
        learning_rate: 0,
        is_time_correlated: 'N',
      },
      form_rule: {
        n_estimators: [
          {required: true, message: '请输入一个整数', trigger: 'change'},
          {validator: checkNum, trigger: 'blur'}
        ],
        max_depth: [
          {required: true, message: '请输入一个整数', trigger: 'change'},
          {validator: checkNum, trigger: 'blur'}
        ],
        learning_rate: [
          {required: true, type: "number", message: '请输入一个0-1之间的小数', min: 0, max: 1, trigger: 'change'}
        ]
      },
      // 日期选择器
      date_picker: [last_year_date, today],
      is_updated: false,
    }
  },
  watch: {
    date_picker: {
      deep: true,
      handler(newV) {
        this.form_data['start_date'] = newV[0]
        this.form_data['end_date'] = newV[1]
        this.getMonitorDataBySensorsId()
      }
    }
  },

  methods: {
    showDialog(building_id, row, section) {
      // 打开对话框
      this.dialog_visible = true
      // 当 is_updated = true 时，关闭对话框需要触发父组件刷新表格
      this.is_updated = false
      // 更新组件中的数据
      this.section = section
      this.row = row
      this.building_id = building_id
      this.sensor_id = row['sensor_id']
      this.form_data['sensor_id'] = row['sensor_id']
      this.form_data['n_estimators'] = row['n_estimators']
      this.form_data['max_depth'] = row['max_depth']
      this.form_data['learning_rate'] = row['learning_rate']
      this.form_data['is_time_correlated'] = row['is_time_correlated']
      if (this.$refs.form) {
        this.$refs.form.clearValidate()
      }
      // 更新关联传感器
      this.associated_sensors_data = row['associated_sensors_data']
      this.updateAssociatedSensorsIdSet()
      // 更新完关联传感器，更新日期并触发监视 or 手动更新echarts图
      // 当 data_period 不为空，那么更新 date_picker，并触发监视，更新数据图
      if (row['data_period']) {
        this.date_picker = JSON.parse(row['data_period'])
      }else {
        // 否则 按默认的更新数据图
        this.getMonitorDataBySensorsId(null)
      }
    },
    closeDialog() {
      if (this.is_updated) {
        this.$emit('refreshData')
      }
      this.dialog_visible = false
    },
    // 更新关联的传感器id，以便去重（该集合包含这个传感器本身的id）
    updateAssociatedSensorsIdSet() {
      this.associated_ids.clear()
      this.associated_ids.add(this.sensor_id)
      for (let index in this.associated_sensors_data) {
        this.associated_ids.add(this.associated_sensors_data[index]['sensor_id'])
      }
    },
    // 传递给子组件的方法，返回子组件中选择的传感器id
    // 之后发送请求，更新关联传感器
    selectAssociatedSensors(select_sensor_id) {
      // 表示更新过数据，关闭对话框时需要刷新表格
      this.is_updated = true
      this.associated_ids.add(select_sensor_id)
      this.updateServerSensors()
      this.getMonitorDataBySensorsId(select_sensor_id)
    },
    // 删除在表格中选择的关联传感器
    // 之后发送请求，更新关联传感器
    deleteAssociatedSensors() {
      let len = this.selection_sensors.length
      // 当没有选择时，直接返回
      if (len <= 0) {
        this.$message.info("未选中任何关联传感器")
        return
      }
      // 表示更新过数据，关闭对话框时需要刷新表格
      this.is_updated = true
      // 提示一下，是否确认删除
      this.$confirm(`确认删除这${len}个关联传感器？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        for (let item of this.selection_sensors) {
          this.associated_ids.delete(item['sensor_id'])
        }
        // 发送请求，更新关联传感器
        this.updateServerSensors()
        // 更新关联传感器监测数据
        this.sensors_data = this.sensors_data.filter(item => this.associated_ids.has(item['sensor_id']))
      })
    },
    checkModelParamsAndTraining() {
      this.$refs.form.validate(valid => {
        if (valid) {
          let form = [this.form_data['n_estimators'], this.form_data['max_depth'], this.form_data['learning_rate'], this.form_data['is_time_correlated']]
          const msg = ['模型参数分别为：' + JSON.stringify(form), '时间周期：' + JSON.stringify(this.date_picker), '确认训练模型？（训练后将保存参数）']
          const infos = []
          const h = this.$createElement
          for (const i in msg) {
            infos.push(h('p', null, msg[i]))
          }
          this.$confirm('提示', {
            title: '提示',
            message: h('div', null, infos),
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'info'
          }).then(() => {
            this.reTraining()
          })
        }
      })
    },

    // 发送请求，更新关联传感器列表
    async updateServerSensors() {
      // 在发送前，需要将集合中，自己的id去掉，防止自身关联
      let set = new Set(this.associated_ids)
      set.delete(this.sensor_id)
      let params = {
        sensor_id: this.sensor_id,
        // 需要将集合转为数组
        associated_ids: Array.from(set)
      }
      // 发送请求
      let data = await updateAssociatedSensors(params)
      if (data['result']) {
        this.$message.success("更新关联传感器成功")
        // 更新关联传感器列表之后，需要重新请求数据
        await this.getAssociatedSensors()
      }
    },
    // 根据传感器id，请求关联的信息
    async getAssociatedSensors() {
      this.is_loading_data = true
      let data = await getSensorModelSetting({sensor_id: this.sensor_id})
      if (data['result']) {
        this.associated_sensors_data = data['data']['associated_sensors_data']
        this.updateAssociatedSensorsIdSet()
      }
      this.is_loading_data = false
    },
    // 修改模型参数
    async postModelParams() {
      this.is_posting_data = true

      let data = await updateSensorModelSetting(this.form_data)
      if (data['result']) {
        this.$message.success(data['message'] || "更新成功！")
        this.is_updated = true
        this.closeDialog()
      } else {
        this.$message.error(`更新失败，原因：${data['message']}`)
      }

      this.is_posting_data = false
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
      } else if (this.associated_sensors_data === null) {
        params.sensor_ids = [this.sensor_id]
      } else {
        // 获取所有传感器数据
        params.sensor_ids = this.associated_sensors_data.map(item => item['sensor_id'])
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
