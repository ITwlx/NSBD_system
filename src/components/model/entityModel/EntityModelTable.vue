<template>
  <div style="width: 80%; margin: 10px auto; text-align: center">
    <p style="line-height: 60px;">
      实体识别模型
      <!--管理处选择框-->
      <span style="float: left">
      管理处：
      <el-select size="small" style="width: 120px" v-model="params.office_id">
        <el-option
            v-for="item in $store.state.office_list"
            :value="item.office_id"
            :key="item.office_id"
            :label="item['office_name']">
        </el-option>
      </el-select>
    </span>
      <span style="float: right">
        <el-button size="mini" type="primary"
                   @click="$refs['entity-form'].showDialog(null, params.office_id)">新建</el-button>
        <!--        <el-button size="mini" type="primary" @click="trainModels">批量更新训练</el-button>-->
        <el-button size="mini" type="danger" @click="deleteEntityModels(null)">批量删除</el-button>
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
      <el-table-column
          label="名称"
          prop="name">
      </el-table-column>
<!--      <el-table-column
          label="所属管理处"
          prop="office_name"
          show-overflow-tooltip>
      </el-table-column>-->
      <el-table-column
          width="130"
          label="学习率"
          prop="learning_rate">
      </el-table-column>
      <el-table-column
          width="130"
          label="batch size"
          prop="batch_size">
      </el-table-column>
      <el-table-column
          width="130"
          label="优化器"
          prop="optimizer">
      </el-table-column>
      <el-table-column
          width="130"
          label="epoches"
          prop="epoches">
      </el-table-column>
      <el-table-column
          width="150"
          label="启用">
        <template slot-scope="scope">
          <el-switch
              v-model="scope.row['activate'] === 1"
              @change="changeModelStatus(scope.row)"/>
        </template>
      </el-table-column>
      <el-table-column
          width="220"
          label="操作">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" @click="$refs['entity-form'].showDialog(scope.row)">修改</el-button>
          <el-button size="mini" type="danger" @click="deleteEntityModels(scope.row)">删除</el-button>
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

    <EntityModelForm ref="entity-form" @refreshData="getTableData"></EntityModelForm>
  </div>
</template>

<script>
import {
  changeEntityStatus,
  deleteEntityModel,
  getEntityModel,
  trainEntityModel
} from "@/api/workingCondition/model/entityModel";
import EntityModelForm from "@/components/model/entityModel/EntityModelForm";

export default {
  name: "EntityModelTable",
  components: {EntityModelForm},
  mounted() {
    // 获取管理处信息
    let office_list = this.$store.state.office_list
    // 如果store中已经有列表了，那么直接获取即可
    if (office_list.length > 0) {
      // 设置默认的管理处（辉县管理处）
      for (let index in office_list) {
        if (office_list[index]['office_name'] === '辉县管理处') {
          this.params.office_id = office_list[index]['office_id']
        }
      }
    } else {
      this.params.office_id = 59
    }
  },
  data() {
    return {
      params: {
        office_id: null,
        page_num: 1,
        page_size: 10,
      },
      table_data: [],
      total: 0,
      is_loading_table: false,
      select_data: []
    }
  },
  watch: {
    params: {
      deep: true,
      handler(newV, oldV) {
        this.getTableData()
      }
    }
  },
  methods: {
    deleteEntityModels(row) {
      let entity_ids = null
      if (row) {
        entity_ids = [row['entity_model_id']]
      } else {
        entity_ids = this.select_data.map(item => item['entity_model_id'])
      }
      let len = entity_ids.length
      if (len <= 0) {
        this.$message.info("未选择数据")
        return
      }
      this.$confirm(`确定删除这${entity_ids.length}个模型？`, "提示", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteData(entity_ids)
      })
    },
    trainModels() {
      let len = this.select_data.length
      if (len <= 0) {
        this.$message.info("未选择数据")
        return
      }
      let entity_ids = this.select_data.map(item => item['entity_model_id'])
      this.$confirm(`确定重新训练这${entity_ids.length}个模型？`, "提示", {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.reTrainingData(entity_ids)
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
      let data = await getEntityModel(this.params)
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
      let param = {
        entity_model_id: row['entity_model_id'],
        activate: row['activate'] ^ 1
      }
      let data = await changeEntityStatus(param)
      if (data['result']) {
        row['activate'] ^= 1
        notify.type = 'success'
        notify.message = row['activate'] ? '启用成功' : '关闭成功'
      } else {
        this.$message.warning(data['message'])
      }
      await this.getTableData()
    },
    async deleteData(entity_ids) {
      let param = {entity_ids}
      let data = await deleteEntityModel(param)
      if (data['result']) {
        this.$message.success(`成功删除${data['data']}条数据`)
        await this.getTableData()
      } else {
        this.$message.warning(data['message'])
      }
    },
    async reTrainingData(entity_ids) {
      let notify = this.$notify.info({
        title: "提示",
        message: "开始重新训练..."
      })
      let train_mode = 2
      let param = {entity_ids, train_mode}
      let data = await trainEntityModel(param)
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
