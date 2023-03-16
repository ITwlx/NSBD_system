<template>
<el-dialog
  width="30%"
  :center="true"
  append-to-body
  title="编辑处理详情"
  v-loading="is_posting_data"
  :close-on-click-modal="false"
  :visible.sync="dialog_visible"
  element-loading-text="提交中，请稍后...">
  <el-form
    size="mini"
    :model="form"
    :rules="rules"
    ref="handle-form"
    label-width="70px"
    label-position="right"
    :hide-required-asterisk="true"
    :validate-on-rule-change="false">
    <el-form-item label="处置动作" prop="handle_action">
      <el-select
        style="width: 150px"
        v-model="form['handle_action']"
        :disabled="handle_status === '已处理'">
        <el-option value="勘察"></el-option>
        <el-option value="处理中"></el-option>
        <el-option v-if="handle_status === '待处理'" value="不予处理"></el-option>
        <el-option value="完成处置"></el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="处置人员" prop="handle_person">
      <el-input
        style="width: 150px"
        :readonly="handle_status === '已处理'"
        placeholder="请输入处置人员"
        v-model="form['handle_person']" >
      </el-input>
    </el-form-item>
    <el-form-item label="详情" prop="handle_detail">
      <el-input
        type="textarea"
        :readonly="handle_status === '已处理'"
        :autosize="{ minRows: 6, maxRows: 10}"
        placeholder="请输入内容"
        v-model="form['handle_detail']">
      </el-input>
    </el-form-item>
  </el-form>
  <span slot="footer" style="text-align: center">
        <el-button @click="dialog_visible = false">返 回</el-button>
        <el-button
          type="primary"
          v-if="handle_status !== '已处理'"
          @click="postForm">
          提 交
        </el-button>
  </span>
</el-dialog>
</template>

<script>
import {editHandleDetail} from "@/api/workingCondition/risk";

export default {
  name: "HandleDetailUpdate",
  props: {
    changeStatus: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      dialog_visible: false,
      is_posting_data: false,
      handle_status: '',
      form: {
        risk_event_id: -1,
        handle_action: '勘察',
        handle_person: '',
        handle_detail: '',
      },
      rules: {
        handle_action: {required: true, message: "请选择处置动作", trigger: 'blur'},
        handle_person: {required: true, message: "请输入处置人员", trigger: 'blur'},
        handle_detail: {required: true, message: "请输入详情", trigger: 'blur'}
      },
    }
  },
  methods: {
    showDialog(row, handle_status){
      this.form = row
      this.handle_status = handle_status
      this.dialog_visible=true
    },


    postForm(){
      this.$refs["handle-form"].validate(valid=>{
        if (valid){
          this.is_posting_data =true
          editHandleDetail(this.form).then(data=>{
            this.is_posting_data = false
            if (data['result']){
              this.$message.success("修改成功！")
              this.dialog_visible = false
              this.changeStatus(this.form.handle_action);
            } else {
              this.$message.error(data['message'])
            }
          })
        }else {
          return false
        }
      })
    }
  }
}
</script>

<style scoped>

</style>
