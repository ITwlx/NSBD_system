<template>
  <div>
    <el-dialog
        width="56%"
        title="审批/查看"
        :visible.sync="dialog_visible">
      <!-- 对话框内容 -->
      <div>
        <!-- 点线图 + 表单数据 -->
        <div style="display: flex; justify-content: space-around;">
          <!-- 点线图 -->
          <!--        <div style="width: 300px; height: 280px; background-color: #bfdbf6; text-align: left">-->
          <div
              id="eChart"
              v-loading="is_loading_data"
              style="width: 450px; height: 260px">
            <SensorChartsPlus ref="sensor-charts"></SensorChartsPlus>
          </div>
          <!--        </div>-->
          <!--表单数据-->
          <div style="text-align: right" v-loading="is_loading_info">
            <el-form v-model="form_data"
                     size="mini"
                     label-suffix=":"
                     label-width="130px"
                     label-position="left">
              <el-form-item label="建筑物名称">
                <el-tooltip placement="top" :content="form_data.building_name">
                  <el-input v-model="form_data.building_name"
                            style="width: 180px"
                            :readonly="true">
                  </el-input>
                </el-tooltip>
              </el-form-item>
              <el-form-item label="测点编号">
                <el-input v-model="form_data.sensor_name"
                          style="width: 180px"
                          :readonly="true">
                </el-input>
              </el-form-item>
              <el-form-item label="传感器数值">
                <el-input v-model="form_data.sensor_value"
                          style="width: 180px"
                          :readonly="true">
                </el-input>
              </el-form-item>
              <el-form-item v-for="(item, index) in form_data.associated_data"
                            :key="index"
                            :label="'环境量-'+item.sensor_type">
                <el-input v-model="item.sensor_value"
                          style="width: 180px"
                          :readonly="true">
                  <template slot="suffix">{{ $store.state['units'][item.sensor_type] }}</template>
                </el-input>
              </el-form-item>
              <el-form-item label="监测时间">
                <!--                <span style="border: rgba(17,17,17,0.3) solid 1px; padding: 1px">{{form.monitoring_time}}</span>-->
                <el-input v-model="form_data.monitoring_time"
                          style="width: 180px"
                          :readonly="true">
                </el-input>
              </el-form-item>
            </el-form>
          </div>
        </div>
        <!--判别-->
        <div style="display: flex; justify-content: space-around; margin-top: 10px;">
          <div style="display: flex; margin-right: 30px">
            系统判别结果：
            <el-input
                v-model="form_data.result"
                style="width: 60px; display: inline-block"
                size="mini" :readonly="true">
            </el-input>
          </div>
          <div style="display: flex">
            <span>审批结果：</span>
            <el-select v-model="approve_result" style="width: 100px" size="mini">
              <el-option value="正常"></el-option>
              <el-option value="异常"></el-option>
            </el-select>
          </div>
        </div>
      </div>
      <p slot="footer" style="text-align: center">
        <el-button type="primary" @click="postApprove" :readonly="form_data.hasOwnProperty('monitor_data_id')===false">审
          批
        </el-button>
        <el-button @click="dialog_visible = false">取 消</el-button>
      </p>
    </el-dialog>
  </div>
</template>

<script>
import {analysisGraph, getInfoDetail} from "@/api/workingCondition/monitor";
import SensorChartsPlus from "@/components/monitor/SensorChartsPlus";

export default {
  name: "MonitoringDetail",
  components: {SensorChartsPlus},
  data() {
    return {
      dialog_visible: false,
      is_loading_info: false,
      is_loading_data: false,
      approve_result: '',
      form_data: {
        building_id: '',
        building_name: '',
        sensor_id: '',
        sensor_name: '',
        sensor_data: '',
        associated_data: [],
        result: '',
        audit_person: '',
        audit_time: ''
      }
    };
  },
  methods: {
    // 打开对话框，传递监测信息的id
    // 根据监测信息的id请求数据，并渲染echarts图
    showDialog(monitor_data_id) {
      // 设置对话框可见
      this.dialog_visible = true
      // 开启加载动画
      this.is_loading_info = true
      this.is_loading_data = true
      // 发送异步请求
      this.dataInfoDetail(monitor_data_id)
    },
    // 发送请求：审批数据
    postApprove() {
      if (this.approve_result === '') {
        this.$message.info("还未选择审批结果！")
        return
      }

      this.$message.info(`审批结果：${this.approve_result}，记录id：${this.form_data.monitor_data_id}`)
    },

    async dataInfoDetail(monitor_data_id) {
      let data = await getInfoDetail({monitor_data_id})
      // 如果返回结果为true（成功处理请求并返回数据）
      if (data['result']) {
        // 获取表单信息
        this.form_data = data.data
        // 默认审批结果为 表单中的审批结果
        this.approve_result = data.data.result

        // 获取传感器id
        let sensor_id = data.data.sensor_id
        let monitoring_time = data.data.monitoring_time
        let sensor_type = data.data.sensor_type
        // 关闭加载动画
        this.is_loading_info = false
        // 根据传感器id，异步请求该传感器一个月前到现在的数据
        let graph_data = await analysisGraph({sensor_id, monitoring_time})
        // 处理echarts图表
        this.$refs["sensor-charts"].setEchartsOptions(graph_data['data'], sensor_type)
        // 关闭加载动画
        this.is_loading_data = false

      } else {
        this.form_data = {}
        this.$message.error(data['message'])
      }
    }
  }
}
</script>

<style scoped>

</style>
