<template>
  <el-dialog
      width="33%"
      :title="title"
      :center="true"
      :close-on-click-modal="false"
      :visible.sync="dialog_visible">
    <el-form
        size="mini"
        :model="form"
        :rules="rules"
        ref="text-form"
        label-width="150px"
        label-position="left"
        v-loading="is_posting_data"
        :hide-required-asterisk="true"
        :validate-on-rule-change="false"
        style="margin: 0 10%; overflow: hidden; text-align: center">
      <el-form-item
          label="名称"
          prop="name">
        <el-input style="width: 175px" v-model="form['name']"/>
      </el-form-item>
      <el-form-item
          prop="learning_rate">
            <span slot="label">
              <el-tooltip
                  placement="left"
                  content="增大学习率，提高训练速度">
                <p>学习率</p>
              </el-tooltip>
            </span>
        <el-input-number
            style="width: 175px"
            v-model="form.learning_rate">
        </el-input-number>
      </el-form-item>
      <el-form-item
          prop="batch_size">
            <span slot="label">
              <el-tooltip
                  placement="left"
                  content="增大batch size，提高收敛速度">
                <p>batch size</p>
              </el-tooltip>
            </span>
        <el-input-number
            style="width: 175px"
            v-model="form.batch_size">
        </el-input-number>
      </el-form-item>
      <el-form-item
          label="优化器"
          prop="optimizer">
        <el-select
            size="mini"
            style="width: 175px"
            v-model="form.optimizer">
          <el-option value="Adadelta"/>
          <el-option value="Adagrad"/>
          <el-option value="Adam"/>
          <el-option value="Adamax"/>
          <el-option value="ASGD"/>
        </el-select>
      </el-form-item>
      <el-form-item
          label="epoches"
          prop="epoches">
        <el-input-number
            style="width: 175px"
            v-model="form.epoches">
        </el-input-number>
      </el-form-item>
    </el-form>

    <div slot="footer">
      <el-button size="small" @click="dialog_visible = false">返回</el-button>
      <el-button
          v-if="row === null"
          size="small"
          type="primary"
          @click="postForm">确定
      </el-button>
      <el-button
          v-else
          size="small"
          type="primary"
          @click="trainingModel(1)">训练
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
import {addTextModel, editTextModel, trainTextModel} from "@/api/workingCondition/model/textModel";

export default {
  name: "TextModelForm",
  props: {
    model_type: {
      type: String,
      require: true
    }
  },
  data() {
    let today = this.$store.state['today'].slice(0, 10)
    return {
      title: "新建",
      // 表单弹框
      dialog_visible: false,
      row: null,
      is_training: false,
      is_posting_data: false,
      default_form: {
        name: this.model_type + '(' + today + ')',
        learning_rate: 0.001,
        batch_size: 128,
        optimizer: "Adam",
        epoches: 20,
      },
      form: {
        name: null,
        learning_rate: null,
        batch_size: null,
        optimizer: "Adam",
        epoches: null,
      },
      rules: {
        name: {required: true, message: "请输入名称", trigger: 'blur'},
        learning_rate: {
          type: "number",
          min: 0.001,
          max: 0.005,
          required: true,
          message: "学习率限于0.001-0.005",
          trigger: 'blur'
        },
        batch_size: {type: "number", min: 64, max: 256, required: true, message: "batch size限于64-256", trigger: 'blur'},
        optimizer: {required: true, message: "请选择优化器", trigger: 'blur'},
        epoches: {required: true, message: "请输入epoches", trigger: 'blur'},
      }
    }
  },

  methods: {
    showDialog(row) {
      if (this.$refs["text-form"]) {
        this.$refs["text-form"].clearValidate()
      }
      if (row) {
        this.row = row
        this.title = "编辑"
        Object.assign(this.form, this.row)
      } else {
        this.row = null
        this.title = "新建"
        for (let key in this.form) {
          this.form[key] = null
        }
        Object.assign(this.form, this.default_form)
      }
      this.dialog_visible = true
    },
    closeDialog(is_refresh) {
      this.dialog_visible = false
      if (is_refresh) {
        this.$emit('refreshData')
      }
    },
    postForm() {
      // 如果row不为null，说明是进行修改
      if (this.row) {
        // 检验是否修改过数据
        let is_updated = false
        for (let key in this.form) {
          if (this.form[key] !== this.row[key]) {
            is_updated = true
          }
        }
        // 如果修改过，则更新数据
        if (is_updated) {
          this.updateData()
        } else {
          this.$message.info("未修改表单数据")
          return
        }

      } else {
        // 如果row为null，说明是新增数据，进行表单校验
        this.$refs["text-form"].validate(valid => {
          if (valid) {
            this.postData()
          }
        })
      }
    },
    // 新增数据
    async postData() {
      this.is_posting_data = true

      let data = await addTextModel(this.model_type, this.form)
      if (data['result']) {
        this.$message.success(data['message'] || "新建成功！")
        // 关闭对话框
        this.closeDialog(true)
      } else {
        this.$message.warning(data['message'])
      }

      this.is_posting_data = false
    },
    // 更新数据
    async updateData() {
      this.is_posting_data = true

      let data = await editTextModel(this.model_type, this.form)
      if (data['result']) {
        this.$message.success(data['message'] || "更新成功！")
        // 关闭对话框
        this.closeDialog(true)
      } else {
        this.$message.warning(data['message'])
      }
      this.is_posting_data = false
    },
    // 训练模型
    async trainingModel(train_mode) {
      this.is_training = true

      let param = {
        train_mode,
        text_ids: [this.row[this.model_type + '_model_id']]
      }
      let data = await trainTextModel(this.model_type, param)
      if (data['result']) {
        this.$message.success(data['message'] || "操作成功！")
        // 更新数据
        await editTextModel(this.model_type, this.form)
        // 关闭对话框，并刷新表格数据
        this.closeDialog(true)
      } else {
        this.$message.warning(data['message'])
      }
      this.is_training = false
    },
  }
}
</script>

<style scoped>

</style>
