<template>
  <div style="width: 80%; margin: 10px auto; text-align: center">
    <p style="line-height: 60px;">
      {{ table_title }}
      <span style="float: right">
        <el-button size="mini" type="primary" @click="$refs['text-form'].showDialog(null)">新建</el-button>
        <!--        <el-button size="mini" type="primary" @click="trainModels">批量更新训练</el-button>-->
        <el-button size="mini" type="danger" @click="deleteModels(null)">批量删除</el-button>
      </span>
    </p>
    <el-table
        border stripe
        :data="table_data"
        style="width: 100%"
        @selection-change="val=>{select_data = val}"
        :row-style="{height: '39px'}"
        :header-cell-style="{'text-align': 'center'}"
        :cell-style="{padding: '1px', 'text-align': 'center'}"
        v-loading="is_loading_table">
      <el-table-column type="selection" width="45"/>
      <el-table-column label="序号" type="index" width="50"/>
      <!--      <el-table-column-->
      <!--          label="名称"-->
      <!--          :prop="model_type+'_model_name'">-->
      <el-table-column
          label="名称"
          prop="name">
      </el-table-column>
      <el-table-column
          label="学习率"
          prop="learning_rate">
      </el-table-column>
      <el-table-column
          label="batch size"
          prop="batch_size">
      </el-table-column>
      <el-table-column
          label="优化器"
          prop="optimizer">
      </el-table-column>
      <el-table-column
          label="epoches"
          prop="epoches">
      </el-table-column>
      <el-table-column
          label="启用">
        <template slot-scope="scope">
          <el-switch
              v-model="scope.row['activate'] === 1"
              @change="changeModelStatus(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column
          width="160px"
          label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="$refs['text-form'].showDialog(scope.row)">修改</el-button>
          <el-button size="mini" type="danger" @click="deleteModels(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination
        :total="total"
        :page-sizes="[10, 20]"
        :page-size="params.page_size"
        :current-page.sync="params.page_num"
        @size-change="(val)=>{params.page_size = val}"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 10px; display: flex; justify-content: space-between;">
    </el-pagination>

    <TextModelForm ref="text-form" :model_type="model_type" @refreshData="getTableData"></TextModelForm>
  </div>
</template>

<script>
import {
  changeTextStatus,
  deleteTextModel,
  getTextModel,
  trainTextModel
} from "@/api/workingCondition/model/textModel";
import TextModelForm from "@/components/model/textModel/TextModelForm";

export default {
  name: "TextModelTable",
  components: {TextModelForm},
  props: {
    table_title: {
      type: String,
      require: true
    },
    model_type: {
      type: String,
      require: true
    }
  },
  data() {
    return {
      params: {
        page_num: 1,
        page_size: 10,
      },
      table_data: [],
      total: 0,
      is_loading_table: false,
      select_data: []
    }
  },
  mounted() {
    if (this.$store.state.office_list.length) {
      this.params.office_id = this.$store.state.office_list[0].office_id
    }
    this.getTableData()
  },
  watch: {
    params: {
      deep: true,
      handler() {
        this.getTableData()
      }
    }
  },
  methods: {
    deleteModels(row) {
      let text_ids = null
      if (row) {
        text_ids = [row[this.model_type + '_model_id']]
      } else {
        text_ids = this.select_data.map(item => item[this.model_type + '_model_id'])
      }
      let len = text_ids.length
      if (len <= 0) {
        this.$message.info("未选择数据")
        return
      }
      this.$confirm(`确定删除这${text_ids.length}个模型？`, "提示", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteData(text_ids)
      }).catch(() => {
      })
    },
    trainModels() {
      let len = this.select_data.length
      if (len <= 0) {
        this.$message.info("未选择数据")
        return
      }
      let text_ids = this.select_data.map(item => item[this.model_type + '_model_id'])
      this.$confirm(`确定重新训练这${text_ids.length}个模型？`, "提示", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.reTrainingData(text_ids)
      }).catch(() => {
      })
    },
    changeModelStatus(row) {
      let info = row['activate'] ? '关闭后将没有模型可用，确认关闭？' : '只能开启一个模型, 是否开启此模型？'
      this.$confirm(info, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'info'
      }).then(() => {
        this.changeActivate(row)
      })
    },

    // 请求表格数据
    async getTableData() {
      this.is_loading_table = true
      let data = await getTextModel(this.model_type, this.params)
      if (data['result']) {
        // 当数据总数大于0，并且当前页数据为空，那么重置页码，并重新获取数据（通过watch）
        if (data['data'].total > 0 && data['data'].list.length === 0) {
          this.params.page_num = 1
          return
        }
        this.total = data['data']['total']
        this.table_data = data['data']['list']
      }

      this.is_loading_table = false
    },
    async changeActivate(row) {
      let notify = this.$notify.info({
        title: '提示',
        message: row['activate'] ? '关闭中...' : '启用中...'
      })
      let param = {}
      param[this.model_type + '_model_id'] = row[this.model_type + '_model_id']
      param['activate'] = row['activate'] ^ 1

      let data = await changeTextStatus(this.model_type, param)
      if (data['result']) {
        row['activate'] ^= 1
        notify.type = 'success'
        notify.message = row['activate'] ? '启用成功' : '关闭成功'
      } else {
        this.$message.warning(data['message'])
      }
      await this.getTableData()
    },
    async deleteData(text_ids) {
      let param = {}
      param[this.model_type + '_ids'] = text_ids
      let data = await deleteTextModel(this.model_type, param)
      if (data['result']) {
        this.$message.success(`成功删除${data['data']}条数据`)
        await this.getTableData()
      } else {
        this.$message.warning(data['message'])
      }
    },
    async reTrainingData(text_ids) {
      let notify = this.$notify.info({
        title: "提示",
        message: "开始重新训练..."
      })
      let train_mode = 2
      let param = {train_mode}
      param[this.model_type + '_ids'] = text_ids
      let data = await trainTextModel(this.model_type, param)
      if (data['result']) {
        notify.type = 'success'
        notify.message = data['message'] || "操作成功！"
      } else {
        this.$message.warning(data['message'])
      }
    },
  }
}
</script>

<style scoped>

</style>
