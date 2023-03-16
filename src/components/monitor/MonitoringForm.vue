<template>
  <div>
    <el-dialog
      title="新增录入"
      :center="true"
      :visible.sync="dialog_visible"
      :lock-scroll="false"
      :close-on-click-modal="false"
      v-loading="is_posting_data"
      element-loading-text="提交中，请稍后..."
      width="36%">

      <el-form :model="form_data"
               size="mini"
               :rules="rules"
               ref="monitorForm"
               label-width="150px"
               label-position="left"
               :hide-required-asterisk="true"
               :validate-on-rule-change="false"
               style="margin: 0 10%; overflow: hidden; text-align: center">
        <el-form-item label="建筑物名称">
          <el-select v-model="building_id" placeholder="请选择建筑物" style="width: 200px">
            <el-option v-for="build in building_list" :key="build.building_id"
                       :label="build.building_name" :value="build.building_id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="监测断面">
          <el-select v-model="form_data.section_id" placeholder="请选择断面" style="width: 200px">
            <el-option v-for="section in section_list" :key="section.section_id"
                       :label="section.section_name" :value="section.section_id"></el-option>
          </el-select>
        </el-form-item>
        <!--因为要根据获取sensor的相关传感器，所以此处绑定下标，便于获取-->
        <el-form-item label="测点编号" prop="sensor_id">
          <el-select v-model="sensor_index" placeholder="请选择测点" style="width: 200px">
            <el-option v-for="(sensor, index) in sensor_list" :key="sensor.sensor_id"
                       :label="sensor.sensor_name" :value="index"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="传感器数值" prop="sensor_value">
          <el-input-number v-model="form_data.sensor_value"
                           @focus="$event.currentTarget.select()"
                           :step="0.01" style="width: 200px"/>
        </el-form-item>
        <el-form-item label="监测时间" prop="monitoring_time">
          <el-date-picker
            style="width: 200px"
            v-model="form_data.monitoring_time"
            type="datetime"
            format="yyyy-MM-dd HH:mm"
            value-format="yyyy-MM-dd HH:mm"
            placeholder="选择日期时间">
          </el-date-picker>
        </el-form-item>
        <el-form-item
          v-for="(ass_sensor, index) in form_data.associated_sensors_value"
          :prop="'associated_sensors_value.' + index + '.sensor_value'"
          :rules="{required: true, message: '请输入测量值', trigger: 'blur'}"
          :label="'环境量：'+ass_sensor.sensor_type" :key="ass_sensor.sensor_id">
          <el-input-number
            v-model="ass_sensor.sensor_value"
            :step="0.01" style="width: 200px"/>
        </el-form-item>

      </el-form>
      <span slot="footer" style="text-align: center">
        <el-button @click="dialog_visible = false">取 消</el-button>
        <el-button type="primary" @click="postForm">提 交</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import {postInformation} from "@/api/workingCondition/monitor";
import {getAllSensors} from "@/api/workingCondition";

export default {
  name: "MonitoringForm",
  data() {
    return {
      dialog_visible: false,
      is_posting_data: false,
      building_id: '',
      form_data: {
        section_id: '',
        sensor_id: '',
        sensor_value: '',
        associated_sensors_value: [],
        monitoring_time: ''
      },
      rules: {
        sensor_id: {required: true, message: "请选择传感器", trigger: 'blur'},
        sensor_value: {required: true, message: "请输入传感器测值", trigger: 'blur'},
        monitoring_time: {required: true, message: "请选择监测时间", trigger: 'blur'}
      },
      temperature: {},
      pressure: {},
      sensor_index: '',//因为要根据获取sensor的相关传感器，所以此处绑定下标，便于获取id和相关传感器列表
      section_list: [],
      sensor_list: []
    }
  },
  props: {
    building_list: {
      type: Array,
      required: true
    }
  },
  watch: {
    // 当重新选择建筑物时，将断面置空（需要重新选择断面）
    // building_id: {
    //   handler(newV, oldV) {
    //     if (oldV) {
    //       this.form_data.section_id = ''
    //       let builds = this.building_list
    //       for (let i = 0, len = builds.length; i < len; i++) {
    //         if (builds[i].building_id === newV) {
    //           this.section_list = builds[i]['sections']
    //           break
    //         }//end if
    //       }// end for
    //     }
    //   }
    // },
    // 当重新选择断面时，需要重新选择传感器
    'form_data.section_id': {
      handler(newV, oldV) {
        //因为要根据获取sensor的相关传感器，所以此处绑定的传感器下标，便于获取id和相关传感器列表
        this.sensor_index = ''
        // 请求该断面下的传感器列表
        getAllSensors({section_id: newV}).then(data => {
          this.sensor_list = data.data
        }).catch(err => {
          this.$message({type: "error", message: "获取传感器列表失败", showClose: true})
        })
      }
    },
    //当传感器下标改变，即改变选择的传感器了
    sensor_index: {
      handler(newV, oldV) {
        if (parseInt(newV) >= 0) {
          // 设置传感器id
          this.form_data.sensor_id = this.sensor_list[newV].sensor_id
          // 改变相关传感器列表
          this.form_data.associated_sensors_value = this.sensor_list[this.sensor_index]['associated_sensors']
        } else {
          this.form_data.sensor_id = ''
          this.form_data.associated_sensors_value = []
        }
      }
    }
  },
  methods: {
    showDialog(building_id, section_id, monitoring_time) {
      // 重置表格中的数据
      this.resetFormData()
      // 打开对话框
      this.dialog_visible = true
      // 设置默认的建筑物
      this.building_id = building_id
      // 根据建筑物id，获取断面信息
      let builds = this.building_list
      for (let i = 0, len = builds.length; i < len; i++) {
        if (builds[i].building_id === this.building_id) {
          this.section_list = builds[i]['sections']
          break
        }//end if
      }// end for
      // 设置默认的断面信息
      this.form_data.section_id = section_id
      this.form_data.monitoring_time = monitoring_time + " 08:00:00"
    },
    // 在打开表单对话框时重置表单数据
    resetFormData() {
      if (this.$refs.monitorForm) {
        this.sensor_index = ''
        this.building_id = ''
        this.$refs.monitorForm.resetFields()
        this.$refs.monitorForm.clearValidate()
      }
    },
    // 点击确定提交表单前 校验表单
    postForm() {
      this.$refs.monitorForm.validate(valid => {
        // 校验通过
        if (valid) {
          this.is_posting_data = true
          // 精简要提交的数据字段
          this.form_data.associated_sensors_value = this.form_data.associated_sensors_value.map(item => {
            return {
              sensor_id: item.sensor_id,
              sensor_value: item.sensor_value
            }
          })
          // 提交数据
          postInformation(this.form_data).then(data => {
            if (data['result']) {
              this.$message({type: "success", message: data.message, showClose: true})
              // 调用父组件方法，刷新表单
              this.$parent.getTableData()
            } else {
              this.$message({type: "error", message: data.message, showClose: true})
            }
            this.is_posting_data = false
            this.dialog_visible = false
          }).catch(err => {
            this.$message({type: "error", message: err, showClose: true})
            this.is_posting_data = false
            this.dialog_visible = false
          })
        } else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
