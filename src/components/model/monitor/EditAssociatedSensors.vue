<template>
  <el-dialog
    width="30%"
    append-to-body
    title="添加关联传感器"
    :center="true"
    :close-on-click-modal="false"
    :visible.sync="dialog_visible">

    <p>
      断面：{{ section_name }}
      <span style="float: right">
        传感器类型：
        <el-select style="width: 100px" size="mini" v-model="params.sensor_type">
          <el-option v-for="(item,index) in sensor_types" :key="index" :value="item"/>
        </el-select>
      </span>
    </p>
    <div
      style="margin-top: 20px"
      v-loading="is_loading_data">
      <el-radio
        style="margin-top: 10px; min-width: 25%"
        :key="item['sensor_id']"
        :label="item['sensor_id']"
        v-model="select_sensor_id"
        v-for="item in sensor_list"
        v-if="!associated_sensors_id.has(item['sensor_id'])">
        {{ item['sensor_name'] }}
      </el-radio>
      <p v-show="sensor_list.length===0" style="text-align: center; color: gray">没有可关联的传感器</p>
    </div>

    <template slot="footer">
      <el-button size="small" @click="dialog_visible = false">取消</el-button>
      <el-button size="small" @click="selectedSensor" type="primary">确定</el-button>
    </template>
  </el-dialog>
</template>

<script>
import {getAllSensors} from "@/api/workingCondition";

export default {
  name: "EditAssociatedSensors",
  data() {
    return {
      sensor_types: ["全部", "位移计", "渗压计", "钢筋计", "测缝计", "水位计", "温度计", "土压力计"],
      dialog_visible: false,
      is_loading_data: false,
      section_name: 'haha',
      associated_sensors_id: new Set(),
      params: {
        building_id: 1,
        section_id: 1,
        sensor_type: "全部"
      },
      sensor_list: [],
      select_sensor_id: null,
    }
  },
  watch: {
    params: {
      deep: true,
      handler(newV, oldV) {
        this.getSensorsSectionId()
      }
    }
  },
  methods: {
    showDialog(building_id, section, associated_sensors_id) {
      this.dialog_visible = true
      this.section_name = section['section_name']
      this.params.building_id = building_id
      this.params.section_id = section['section_id']
      this.associated_sensors_id = associated_sensors_id
      this.getSensorsSectionId()
      // console.log(associated_sensors_id)  //Set(3) {1, 2, 3}
      // console.log(JSON.stringify(associated_sensors_id)) //{}
    },
    selectedSensor(){
      if (this.select_sensor_id !== null) {
        this.$emit('selected', this.select_sensor_id)
        this.dialog_visible = false
      }else {
        this.$message.info("还没有选择关联的传感器")
      }
    },

    async getSensorsSectionId() {
      this.is_loading_data = true
      let data = await getAllSensors(this.params)
      if (data['result']) {
        this.select_sensor_id = null
        this.sensor_list = data['data'].filter(item=>!this.associated_sensors_id.has(item['sensor_id']))
      }
      this.is_loading_data = false
    },
  }
}
</script>

<style scoped>

</style>
