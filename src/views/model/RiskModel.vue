<template>
  <div style="display: flex; border-top: solid #dcdfe6 1px">
    <!--左侧 管理处、建筑物、断面 选择框-->
    <div v-if="false"
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
      <!-- 建筑物的树形控件 box -->
      <div style="overflow: auto; max-height: calc(100vh - 200px);">
        <el-tree
            :default-expand-all="true"
            :highlight-current="true"
            :data="building_list"
            v-loading="is_loading_build"
            @node-click="handleNodeClick"
            style="min-width: fit-content">
            <span class="custom-tree-node" slot-scope="{ data }">
              <span class="treeText1">
                <i v-if="data['building_name']" class="el-icon-folder-opened"></i>
                <i v-else class="el-icon-document-remove"/>
                {{ data['building_name'] }}
              </span>
           </span>
        </el-tree>
      </div>
    </div>
    <!--右侧 训练模型、筛选条件、表格 -->
    <div style="flex: 1; padding: 20px;border-left: solid 1px #dcdfe6; overflow: auto">
      <!--训练模型表单-->
      <div style="display: flex; justify-content: space-between; margin-bottom: 10px; align-items: start">
        <!--表单-->
        <el-form
            size="mini"
            class="except-form"
            :model="form"
            :inline="true"
            :show-message="false"
            :rules="rules"
            ref="except-form"
            label-suffix="："
            v-loading="is_training"
            :hide-required-asterisk="true"
            :validate-on-rule-change="false"
            style="margin: 0 10%; overflow: hidden; text-align: center">

          <el-form-item label="时间" prop="time_section">
            <el-date-picker
                size="mini"
                style="width: 220px"
                v-model="form.time_section"
                :clearable="false"
                format="yyyy-MM-dd"
                value-format="yyyy-MM-dd"
                type="daterange"
                unlink-panels
                range-separator="-"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                :picker-options="{disabledDate(time){return time.getTime()>Date.now()}}">
            </el-date-picker>
          </el-form-item>
          <el-form-item label="时间窗口大小" prop="time_step">
            <el-input-number
                size="mini"
                style="width: 80px"
                :step="1"
                step-strictly
                controls-position="right"
                v-model="form.time_step"/>
          </el-form-item>
          <el-form-item label="最小支持度" prop="support">
            <el-input-number
                :step="1"
                size="mini"
                style="width: 80px"
                controls-position="right"
                v-model="form.support"/>
          </el-form-item>
          <el-form-item label="最小置信度" prop="confidence">
            <el-input-number
                :step="1"
                size="mini"
                style="width: 80px"
                controls-position="right"
                v-model="form.confidence"/>
          </el-form-item>
        </el-form>
        <!--按钮-->
        <el-button type="primary" size="small" @click="trainingModel">模型训练</el-button>
      </div>

      <el-tabs
          type="card"
          v-model="active_name">
        <el-tab-pane label="异常识别结果表" name="result">
          <ExceptionTable :building_id="building_id"></ExceptionTable>
        </el-tab-pane>
        <el-tab-pane label="关联规则模型表" name="model">
          <AssociatedTable :building_id="building_id"></AssociatedTable>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import {getAllBuilding} from "@/api/workingCondition";
import ExceptionTable from "@/components/model/riskModel/ExceptionTable";
import AssociatedTable from "@/components/model/riskModel/AssociatedTable";
import {trainRiskModel} from "@/api/workingCondition/model/riskModel";

export default {
  name: "RiskModel",
  components: {AssociatedTable, ExceptionTable},
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
    let today = this.$store.state.today.slice(0, 10)
    return {
      active_name: 'result',
      office_id: null,
      is_loading_build: false,
      building_list: [],
      building_id: null,

      form: {
        building_id: 0,
        time_section: [today, today],
        time_step: 1,
        support: '',
        confidence: '',
      },
      rules: {
        building_id: {type: 'number', required: true,},
        time_section: {type: 'array', required: true,},
        time_step: {type: 'number', required: true,},
        support: {type: 'number', required: true,},
        confidence: {type: 'number', required: true,},
      },
      is_training: false,
    }
  },
  watch: {
    // 当改变office_id后，重新加载建筑物列表
    office_id: {
      handler(newV, oldV) {
        this.is_loading_build = true
        this.form.building_id = ''
        getAllBuilding({"office_id": this.office_id}).then(data => {
          this.building_list = data['data']
          this.is_loading_build = false
        }).catch(err => {
          this.$message({type: 'error', message: '数据加载失败', showClose: true})
        })
      }
    }
  },
  methods: {
    // 点击树形控件中的断面，然后更新表格数据
    handleNodeClick(data) {
      // 更新选择的建筑物id（如果点击的断面，那么断面对象的原型上有建筑物id
      this.form.building_id = data['building_id']
    },
    trainingModel() {
      this.$refs["except-form"].validate(valid => {
        if (valid && this.form['building_id'] > 0) {
          this.trainingData(this.form)
        } else {
          this.$message.info("请选择建筑物，并设置正确的训练参数")
        }
      })
    },

    async trainingData(param) {
      this.is_training = true

      let data = await trainRiskModel(param)
      if (data['result']) {
        this.$message.success(data['message'] || '训练成功')
      } else {
        this.$message.warning(data['message'])
      }

      this.is_training = false
    }
  }
}
</script>

<style scoped>
.except-form {
  margin: 0 !important;
}
</style>
