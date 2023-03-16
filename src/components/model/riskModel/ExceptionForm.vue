<template>
  <el-dialog
    width="360px"
    title="编辑"
    :center="true"
    :close-on-click-modal="false"
    :visible.sync="dialog_visible">

    <el-form
      size="mini"
      :model="form"
      ref="entity-form"
      label-width="60px"
      label-position="left"
      label-suffix="："
      v-loading="is_posting_data"
      :hide-required-asterisk="true"
      :validate-on-rule-change="false"
      style="margin: 0 10%; overflow: hidden; text-align: center">

      <el-form-item prop="triad[0]" label="部位">
        <el-input size="mini" v-model="form.triad[0]"/>
      </el-form-item>
      <el-form-item prop="triad[1]" label="设施">
        <el-input size="mini" v-model="form.triad[1]"/>
      </el-form-item>
      <el-form-item prop="triad[2]" label="模式">
        <el-input size="mini" v-model="form.triad[2]"/>
      </el-form-item>
    </el-form>

    <span slot="footer">
      <el-button type="" size="small" @click="closeDialog()">返回</el-button>
      <el-button type="primary" size="small" @click="postTheForm">确定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import {changeTriad} from "@/api/workingCondition/model/riskModel";

export default {
  name: "ExceptionForm",
  data() {
    return {
      dialog_visible: false,
      is_posting_data: false,
      is_updated: false,
      form: {
        anomaly_event_id: '',
        triad: ['', '', ''],
      },
      row: null
    }
  },
  methods: {
    showDialog(row) {
      this.row = row
      this.form.anomaly_event_id = row['anomaly_event_id']
      this.form.triad[0] = row['triad'][0]
      this.form.triad[1] = row['triad'][1]
      this.form.triad[2] = row['triad'][2]
      this.is_updated = false
      this.dialog_visible = true
    },
    closeDialog() {
      if (this.is_updated) {
        this.$emit('refreshData')
      }
      this.dialog_visible = false
    },
    postTheForm() {
      let updated = false
      for (let i = 0; i < 3; i++) {
        if (this.form.triad[i] !== this.row.triad[i]) {
          updated = true
        }
      }
      if (updated){
        this.postData()
      }else {
        this.$message.info("还未修改表单数据")
      }
    },

    async postData() {
      this.is_posting_data = true

      let data = await changeTriad(this.form)
      if (data['result']){
        this.$message.success(data['message'] || "修改成功")
        this.is_updated = true
        this.closeDialog()
      }else {
        this.$message.warning(data['message'] || "请求处理失败")
      }

      this.is_posting_data = false
    }
  }
}
</script>

<style scoped>

</style>
