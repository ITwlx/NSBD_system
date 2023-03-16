<template>
  <div style="margin-left: 20px; margin-right: 20px">
    <div v-if="false" style="text-align: center; font-size: x-large">
      <p style="color: #bebebe">
        管理处总共上报
        <span style="color: black">{{ statistics["all"] }}</span>
        个，其中二类、三类、其他各
        <span style="color: black"
          >{{ statistics["second"] }}、{{ statistics["third"] }}、{{
            statistics["other"]
          }}</span
        >
        个，已审批
        <span style="color: black">{{ statistics["approved"] }}</span>
        个，待审批
        <span style="color: black">{{ statistics["pending"] }}</span
        >个
      </p>
    </div>

    <!--输入框与按钮-->
    <div
      style="display: flex; justify-content: space-between; margin-top: 20px"
    >
      <!--管理处选择框-->
      <span>
        管理处：
        <el-select size="small" style="width: 120px" v-model="params.office_id">
          <el-option
            v-for="item in $store.state.office_list"
            :value="item.office_id"
            :key="item.office_id"
            :label="item['office_name']"
          >
          </el-option>
        </el-select>
      </span>
      <!--状态选择框 v-model="params.is_no_audited" -->
      <span>
        问题级别：
        <el-select
          size="small"
          style="width: 100px"
          v-model="params.issue_level"
          :multiple="true"
          placeholder="全部"
          :clearable="true"
        >
          <el-option value='""' label="其他" />
          <el-option value="I类" label="I类" />
          <el-option value="Ⅱ类" label="Ⅱ类" />
          <el-option value="Ⅲ类" label="Ⅲ类" />
        </el-select>
      </span>
      <!--起止时间选择框-->
      <span>
        <el-date-picker
          v-model="select_date"
          size="small"
          type="daterange"
          value-format="yyyy-MM-dd"
          align="right"
          unlink-panels
          range-separator="-"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          :picker-options="picker_options"
        >
        </el-date-picker>
      </span>

      <span v-if="modelTrain_button">
        <el-button @click="showModel" type="primary" size="mini"
          >模型训练</el-button
        >
      </span>
      <!--  -->
      <el-button type="danger" size="mini" v-else @click="lookTrainSearch"
        >模型训练情况：训练中</el-button
      >
      <ModelTrain ref="modelTrain" @showTrainButton="showTrainButton">
        <template slot="footer">
          <el-button @click="cancelModelTrain">取 消</el-button>
          <el-button
            type="primary"
            @click="sureModelTrain"
            :disabled="train_buttonShow"
            >开始训练</el-button
          >
        </template>
      </ModelTrain>

      <!--三个按钮（新建、上传、导出-->
      <span style="display: flex; justify-content: space-between">
        <el-button
          class="icon-button"
          type="primary"
          size="small"
          @click="addDialog"
        >
          <i class="el-icon-plus" /> 新建
        </el-button>
        <el-button
          size="small"
          class="icon-button"
          type="primary"
          @click="handleDelete"
        >
          <i class="el-icon-delete" /> 删除
        </el-button>
        <!--        <el-button class="icon-button" type="primary" size="small" @click="deleteSelectedDate"><i class="el-icon-delete"/> 删除</el-button>-->
        <el-upload
          v-if="false"
          :limit="1"
          class="import-excel"
          :action="import_url"
          accept=".xls, .xlsx, .csv"
          :on-success="importSuccess"
        >
          <el-button class="icon-button" type="primary" size="small"
            ><i class="el-icon-upload" /> 上传</el-button
          >
        </el-upload>
        <!-- @click="exportInspection" -->
        <el-button
          class="icon-button"
          type="primary"
          size="small"
          @click="exportInspect"
        >
          <img :src="require('@/static/icon/u7965.png')" alt="!" /> 导出
        </el-button>
        <el-dialog
          title="导出设置"
          :visible.sync="showExportDialog"
          width="30%"
        >
          <div>
            管理处：
            <el-select
              size="mini"
              style="width: 120px"
              v-model="exportParams.id"
            >
              <el-option
                v-for="item in $store.state.office_list"
                :value="item.office_id"
                :key="item.office_id"
                :label="item['office_name']"
              >
              </el-option>
            </el-select>
          </div>
          <br />
          <div>
            时间:
            <el-date-picker
              v-model="exportParams.date"
              size="small"
              type="daterange"
              value-format="yyyy-MM-dd"
              align="right"
              unlink-panels
              range-separator="-"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              :picker-options="picker_options"
            >
            </el-date-picker>
          </div>

          <br />
          <div>
            问题级别：
            <el-select
              size="small"
              style="width: 100px"
              v-model="exportParams.level"
              :multiple="true"
              placeholder="全部"
            >
              <el-option value='""' label="其他" />
              <el-option value="I类" label="I类" />
              <el-option value="Ⅱ类" label="Ⅱ类" />
              <el-option value="Ⅲ类" label="Ⅲ类" />
            </el-select>
          </div>

          <span slot="footer" class="dialog-footer">
            <el-button @click="cancelExport">取 消</el-button>
            <el-button type="primary" @click="exportInspectInfo"
              >确 定</el-button
            >
          </span>
        </el-dialog>
      </span>
    </div>

    <div
      v-if="false"
      style="
        margin-top: 15px;
        width: 130px;
        display: flex;
        justify-content: space-between;
      "
    >
      <span style="line-height: 30px">批量操作：</span>
      <!--      <el-button size="small" class="icon-button" @click="handleInspect">审核通过</el-button>-->
    </div>

    <!-- 蓝条提示框，显示选中的数据条数 -->
    <div class="message-info">
      <i
        class="el-icon-info"
        style="
          color: #1698ef;
          float: left;
          font-size: 20px;
          margin: 10px 0 10px 5px;
        "
      />
      <span v-text="select_info"></span>
      <button
        style="background: transparent; border: none; color: #1698ef"
        @click="clearSelection"
      >
        清空
      </button>
    </div>

    <!-- 表格，分页 -->
    <div style="text-align: center">
      <!-- 表格 -->
      <el-table
        ref="multipleTable"
        stripe
        border
        :data="table_data"
        :row-style="{ height: '39px' }"
        :cell-style="{ padding: '1px' }"
        v-loading="is_loading_table"
        element-loading-text="加载中，请稍后..."
        element-loading-spinner="el-icon-loading"
        tooltip-effect="dark"
        style="width: 100%"
        @selection-change="handleSelectionChange"
        :header-cell-style="{ 'text-align': 'center' }"
      >
        <el-table-column
          :selectable="checkSelection"
          type="selection"
          width="45"
        >
        </el-table-column>
        <el-table-column label="序号" type="index" width="50">
        </el-table-column>
        <el-table-column prop="description" label="问题描述" width="120">
        </el-table-column>
        <el-table-column prop="building_name" label="建筑物" width="120">
        </el-table-column>
        <el-table-column prop="location" label="部位" width="120">
        </el-table-column>
        <el-table-column prop="facility" label="失效设施" width="120">
        </el-table-column>
        <el-table-column prop="mode" label="失效模式" width="120">
        </el-table-column>
        <el-table-column prop="event_triple" label="问题三元组">
        </el-table-column>
        <el-table-column prop="category" label="危险源类型"> </el-table-column>
        <!--        <el-table-column
            prop="type"
            label="问题类别"
            width="120">
        </el-table-column>-->
        <el-table-column prop="level" label="问题级别" width="80">
        </el-table-column>
        <el-table-column prop="found_time" label="发现时间" width="145">
        </el-table-column>
        <el-table-column label="操作" width="70">
          <template slot-scope="scope">
            <el-button
              v-if="scope.row.audit_person"
              size="mini"
              type="primary"
              @click="detailDialog(scope.$index, scope.row)"
              >查看
            </el-button>
            <el-button
              v-else
              size="mini"
              type="primary"
              @click="updateDialog(scope.$index, scope.row)"
              >审核
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      <!--分页插件 box-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="params.page_num"
        background
        style="margin-top: 10px; display: flex; justify-content: space-between"
        :page-sizes="[10, 20]"
        :page-size="params.page_size"
        layout="total, sizes, prev, pager, next, jumper"
        :total="table_data_total"
      >
      </el-pagination>
    </div>

    <!--新增工情对话框-->
    <InspectionForm
      title="新增工情记录"
      ref="addInspectionForm"
      :issue_category="issue_category"
    >
      <el-button @click="analyzeDescription">研判</el-button>
      <el-button type="primary" @click="postInspection">提交</el-button>
    </InspectionForm>
    <!--审核工情-->
    <InspectionForm
      title="工情记录详情"
      ref="updateInspectionForm"
      :issue_category="issue_category"
    >
      <el-button
        type="primary"
        @click="updateInspection('updateInspectionForm')"
        >审核通过</el-button
      >
      <el-button @click="closeTheDialog('updateInspectionForm')"
        >返回</el-button
      >
    </InspectionForm>
    <!--查看详情 :editable="false"-->
    <InspectionForm
      title="工情记录详情"
      ref="checkInspectionForm"
      :issue_category="issue_category"
    >
      <el-button type="primary" @click="updateInspection('checkInspectionForm')"
        >确定</el-button
      >
      <el-button @click="closeTheDialog('checkInspectionForm')">返回</el-button>
    </InspectionForm>
  </div>
</template>

<script>
import InspectionForm from "@/components/inspection/InspectionForm";
import ModelTrain from "@/components/inspection/modelTrain";
import {
  analyzeInspections,
  auditInspection,
  deleteInspections,
  exportInspection,
  getInspectionData,
  getIssueCategory,
  postInspection,
  trainLEVEL,
  trainCategory,
  trainNER,
  NerTrainResult,
  CategoryTrainResult,
  LevelTrainResult,
} from "@/api/workingCondition/inspection";
import downloadExcel from "@/utils/downloadExcel";

export default {
  name: "DataAnalysis",
  components: { InspectionForm, ModelTrain },
  mounted() {
    // 获取管理处信息
    let office_list = this.$store.state.office_list;
    // 如果store中已经有列表了，那么直接获取即可
    if (office_list.length > 0) {
      // 设置默认的管理处（辉县管理处）
      for (let index in office_list) {
        if (office_list[index]["office_name"] === "辉县管理处") {
          this.params.office_id = office_list[index]["office_id"];
        }
      }
    } else {
      this.params.office_id = 59;
    }
    // 获取问题分类信息
    getIssueCategory()
      .then((data) => {
        if (data["result"]) {
          this.issue_category = data["data"];
        } else {
          this.$message.error(data["message"]);
          this.issue_category = [
            { id: 0, pid: -1, content: "unknown", children: [] },
          ];
        }
      })
      .catch((err) => {
        this.issue_category = [
          { id: 0, pid: -1, content: "unknown", children: [] },
        ];
      });
  },
  data() {
    let today = this.$store.state["today"].slice(0, 10);
    let start = this.$store.state["dayjs"]()
      .subtract(3, "month")
      .format("YYYY-MM-DD");
    /*let start = new Date();
    start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
    start = start.toLocaleString().slice(0, 10).split('/')
    start = start[2] + "-" + start[1] + "-" + start[0]*/
    return {
      // 导出参数
      a: 0,
      exportParams: {
        id: "",
        level: "",
        date: [start, today],
      },
      // 哪种训练的名称
      train_name: "",
      // 导出弹窗的显示与隐藏
      showExportDialog: false,
      // 模型训练按钮的显示与隐藏
      modelTrain_button: true,
      // 发送模型训练请求name
      train_name: "",
      // 模型训练控制发送请求的timer
      trainTimer: null,
      // 模型训练弹窗的发送请求的按钮
      train_buttonShow: true,
      // 顶部统计数据
      statistics: {
        all: 24,
        second: 10,
        third: 6,
        other: 8,
        approved: 15,
        pending: 9,
      },
      // 输入框中的参数
      params: {
        office_id: "",
        // is_no_audited: "",
        page_num: 1,
        page_size: 20,
        start_date: start,
        end_date: today,
        issue_level: [],
      },
      select_date: [start, today],
      // 上传文件的url
      import_url: "",
      // 日期选择器
      picker_options: {
        shortcuts: [
          {
            text: "最近一周",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近一个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit("pick", [start, end]);
            },
          },
          {
            text: "最近三个月",
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit("pick", [start, end]);
            },
          },
        ],
        disabledDate(time) {
          return time.getTime() > Date.now();
        },
      },
      // 表格中的数据
      table_data: [],
      table_data_total: 0,
      // 选中的表格数据
      multiple_selection: [],
      // 是否显示加载动画
      is_loading_table: false,
      // 子组件 表单中的问题类别，防止多次请求
      issue_category: [],
    };
  },
  computed: {
    select_info() {
      return `已选择${this.multiple_selection.length}项`;
    },
  },
  watch: {
    // 选择日期后，将值更新到请求参数中，然后触发 watch params
    select_date: {
      handler(newV, oldV) {
        if (newV) {
          this.params.start_date = newV[0];
          this.params.end_date = newV[1];
        } else {
          this.params.start_date = "";
          this.params.end_date = "";
        }
        // watch params 中触发更新表格数据
        // this.getTableData()
      },
    },
    // 当参数变化时，重新加载表格
    params: {
      deep: true,
      handler() {
        this.getTableData();
      },
    },
  },
  methods: {
    // 成功上传文件后
    importSuccess(response, file, fileList) {
      console.log(response);
    },
    // "新建工情信息"对话框
    addDialog() {
      this.$refs.addInspectionForm.showDialog({
        office_id: this.params.office_id,
      });
    },
    // "审批工情信息"对话框
    updateDialog(index, row) {
      // this.$message.info(JSON.stringify(row))
      this.$refs.updateInspectionForm.showDialog(null, row);
    },
    // "查看工情信息"对话框
    detailDialog(index, row) {
      console.log("123");
      this.$refs.checkInspectionForm.showDialog(null, row);
    },
    // 多选表格中的数据
    handleSelectionChange(val) {
      this.multiple_selection = val;
    },
    // 设置表格中的数据是否可选
    checkSelection(row, index) {
      return true;
      if (row["audit_person"]) {
        return false;
      } else {
        return true;
      }
    },
    // 清空选中的数据
    clearSelection() {
      this.$refs.multipleTable.clearSelection();
    },
    // 批量删除所选数据
    handleDelete() {
      // 如果有选中项
      if (this.multiple_selection.length > 0) {
        // 弹框确认
        this.$confirm(
          `是否确定要删除这${this.multiple_selection.length}条数据？`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          }
        ).then(() => {
          // 点击确认后，显示加载动画
          this.is_loading_table = true;
          let issue_ids = [];
          // 提取所有选中项的数据id
          for (let i = 0; i < this.multiple_selection.length; i++) {
            issue_ids.push(this.multiple_selection[i].issue_id);
          }

          // 使用api/monitor.js中的方法发送请求，回调函数
          deleteInspections({ issue_ids })
            .then((data) => {
              this.is_loading_table = false;
              // 返回的结果是成功
              if (data["result"]) {
                this.clearSelection();
                this.is_loading_table = false;
                this.$message({
                  type: "success",
                  message: data["message"],
                });
                // 重新加载表格数据
                this.getTableData();
              } else {
                this.$message({
                  type: "error",
                  message: `删除失败，原因：${data["message"]}`,
                });
              }
            })
            .catch((err) => {
              this.is_loading_table = false;
              this.$message({
                type: "error",
                message: "删除失败!",
                showClose: true,
              });
            });
        });
      } else {
        this.$message({
          type: "info",
          message: "还未选中任何数据！",
          showClose: true,
        });
      }
    },
    // 批量通过
    handleInspect() {},
    closeTheDialog(name) {
      this.$refs[name]["closeDialog"]();
    },

    // 分页插件-改变每页大小
    handleSizeChange(val) {
      this.params.page_size = val;
    },
    // 改变当前页
    handleCurrentChange(val) {
      this.params.page_num = val;
    },

    // 获取表格数据
    async getTableData() {
      if (!this.params.office_id) {
        this.$message.info("请在左侧选择管理处");
        return;
      }
      this.is_loading_table = true;
      let data = await getInspectionData(this.params);
      if (data["result"]) {
        // 当数据总数大于0，并且当前页数据为空，那么重置页码，并重新获取数据（通过watch）
        if (data["data"].total > 0 && data["data"].list.length === 0) {
          this.params.page_num = 1;
          return;
        }
        this.table_data = data["data"].list;
        this.table_data_total = data["data"].total;
      } else {
        this.$message.error(data["message"]);
      }
      this.is_loading_table = false;
    },
    // 分析/研判 工情描述
    async analyzeDescription() {
      // 获取表单组件中的数据
      let form_data = this.$refs.addInspectionForm.getFormData();
      // 判断工情描述是否不为空
      if (
        form_data.description &&
        form_data.description.length > 3 &&
        form_data.office_id
      ) {
        this.$refs.addInspectionForm.isPostingData(true);
        let data = await analyzeInspections({
          office_id: form_data.office_id,
          description: form_data.description,
        });
        if (data["result"]) {
          this.$refs.addInspectionForm.updateFormData(data["data"]);
        } else {
          this.$message.error(data["message"]);
        }
        this.$refs.addInspectionForm.isPostingData(false);
      } else {
        this.$message.info("请选择管理处并输入有效的工情描述！");
      }
    },
    //提交表单数据
    postInspection() {
      this.$refs.addInspectionForm.$refs.InspectionForm.validate((valid) => {
        if (valid) {
          //校验通过，准备提交
          this.$refs.addInspectionForm.isPostingData(true);
          // 获取表单组件中的数据
          let form_data = this.$refs.addInspectionForm.getFormData();
          postInspection(form_data)
            .then((data) => {
              if (data["result"]) {
                this.$message.success(data["message"]);
                this.getTableData();
              } else {
                this.$message.error(data["message"]);
              }
              this.$refs.addInspectionForm.isPostingData(false);
              this.$refs.addInspectionForm.closeDialog();
            })
            .catch((err) => {
              this.$message.error(err);
              this.$refs.addInspectionForm.isPostingData(false);
            });
        }
      });
    },
    //修改工情信息
    updateInspection(form) {
      // 获取表单组件中的数据（引用的是第二个对话框！！！）
      // 校验表单数据
      console.log(this.$refs[form].getFormData());
      this.$refs[form].$refs.InspectionForm.validate((valid) => {
        if (valid) {
          //校验通过，准备提交
          this.$refs[form].isPostingData(true);
          // 获取表单组件中的数据
          let form_data = this.$refs[form].getFormData();
          // 模拟 审核人信息
          form_data.audit_person = "测试审核";
          // 发送审核请求
          auditInspection(form_data)
            .then((data) => {
              if (data["result"]) {
                this.$message.success(data["message"]);
                this.getTableData();
              } else {
                this.$message.error(data["message"]);
              }
              this.$refs[form].isPostingData(false);
              this.$refs[form].closeDialog();
            })
            .catch((err) => {
              this.$message.error(err);
              this.$refs[form].isPostingData(false);
            });
        }
      });
    },
    // 导出工情信息弹窗
    exportInspect() {
      this.exportParams = {
        id: "",
        level: "",
        date: [],
      };
      this.showExportDialog = true;
    },
    // 关闭弹窗
    cancelExport() {
      this.showExportDialog = false;
    },
    // 确定导出工情信息
    exportInspectInfo() {
      // 设置参数
      let params = {
        office_id: this.exportParams.id,
        issue_level: this.exportParams.level,
        start_date: this.exportParams.date[0],
        end_date: this.exportParams.date[1],
      };
      // 发送请求，因为需要从响应头中获取文件名，所以没有对它进行拦截，返回的是response
      exportInspection(params)
        .then((response) => {
          downloadExcel(response);
          this.$message.success("下载成功");
        })
        .catch((err) => {
          this.$message.error(err);
        });
      this.showExportDialog = false;
    },

    //导出工情信息
    // exportInspection() {
    //   // 设置参数
    //   let params = {
    //     office_id: this.params.office_id,
    //     issue_level: this.params.issue_level,
    //     start_date: this.params.start_date,
    //     end_date: this.params.end_date,
    //     // is_no_audited:this.params.is_no_audited
    //   };
    //   // 发送请求，因为需要从响应头中获取文件名，所以没有对它进行拦截，返回的是response
    //   exportInspection(params)
    //     .then((response) => {
    //       downloadExcel(response);
    //       this.$message.success("下载成功");
    //     })
    //     .catch((err) => {
    //       this.$message.error(err);
    //     });
    // },

    // 展示模型训练窗口
    showModel() {
      this.$refs.modelTrain.showModel();
    },
    // 关闭对话框
    cancelModelTrain() {
      Object.assign(
        this.$refs.modelTrain._data,
        this.$refs.modelTrain.$options.data()
      );
      this.$refs.modelTrain.dialogVisible = false;
    },

    // 确认对话框，发送模型训练请求
    async sureModelTrain() {
      // this.$refs.modelTrain.loading = true
      this.$refs.modelTrain.dialogVisible = false;
      this.modelTrain_button = false;
      this.train_buttonShow = true;
      // 从子组件获取里面的数据
      let { NERNum, categoryNum, LevelNum, value } = this.$refs.modelTrain;
      // 获取是哪一个训练
      this.train_name = this.$refs.modelTrain.activeName;
      // 如果是level训练 接下来发送请求
      if (this.train_name == "level") {
        //获取数据
        let epoches = LevelNum.epochesNum;
        let learning_rate = LevelNum.learningNum;
        let optimizer = value;
        let batch_size = LevelNum.batchNum;
        console.log(epoches, learning_rate, optimizer, batch_size);
        this.trainTimer = setInterval(async () => {
          let data = await this.searchLevelTrain();
          if (data.search("训练中") !== -1) {
          } else if (data.search("训练完毕") !== -1) {
            this.modelTrain_button = true;
            clearInterval(this.trainTimer);
            alert(`${this.train_name}模型训练完毕`);
          } else {
            alert(data);
            clearInterval(this.trainTimer);
            this.modelTrain_button = true;
          }
          console.log(data.search("训练中"));
        }, 30000);
        Object.assign(
          this.$refs.modelTrain._data,
          this.$refs.modelTrain.$options.data()
        );
        let result = await trainLEVEL({ epoches, learning_rate, optimizer, batch_size });
        // 如果是category训练，发送请求
      } else if (this.train_name == "category") {
        //获取数据
        let epoches = categoryNum.epochesNum;
        let lr = categoryNum.learningNum;
        let optimizer = value;
        let batch_size = categoryNum.batchNum;
        this.trainTimer = setInterval(async () => {
          let data = await this.searchCategoryTrain();
          if (data.search("训练中") !== -1) {
          } else if (data.search("训练完毕") !== -1) {
            this.modelTrain_button = true;
            clearInterval(this.trainTimer);
            alert(`${this.train_name}模型训练完毕`);
          } else {
            alert(data);
            clearInterval(this.trainTimer);
            this.modelTrain_button = true;
          }
          console.log(data.search("训练中"));
        }, 30000);
        Object.assign(
          this.$refs.modelTrain._data,
          this.$refs.modelTrain.$options.data()
        );
        let result = await trainCategory({
          epoches,
          lr,
          optimizer,
          batch_size,
        });
        console.log(result);
      } else {
        let epoches = NERNum.epochesNum;
        let learning_rate = NERNum.learningNum;
        let optimizer = value;
        let batch_size = NERNum.batchNum;
        console.log(epoches, learning_rate, optimizer, batch_size);
        this.trainTimer = setInterval(async () => {
          let data = await this.searchNerTrain();
          if (data.search("训练中") !== -1) {
          } else if (data.search("训练完毕") !== -1) {
            this.modelTrain_button = true;
            clearInterval(this.trainTimer);
            alert(`${this.train_name}模型训练完毕`);
          } else {
            alert(data);
            clearInterval(this.trainTimer);
            this.modelTrain_button = true;
          }
          console.log(data.search("训练中"));
        }, 30000);
        await trainNER({ epoches, learning_rate, optimizer, batch_size }).catch(
          () => {}
        );
      }console.log('========');
      console.log(this.$refs.modelTrain._data);
      
      console.log(this.$refs.modelTrain.$options.data());
       console.log('========');
      Object.assign(
        this.$refs.modelTrain._data,
        this.$refs.modelTrain.$options.data()
      );
    },
    // 查看ner训练结果的回调
    // 训练中 训练完毕 训练失败
    async searchNerTrain() {
      let result = await NerTrainResult().catch((e) => {});
      return result.data;
    },
    // 查看category训练结果的回调
    // 训练中 训练完毕 训练失败
    async searchCategoryTrain() {
      let result = await CategoryTrainResult().catch((e) => {});
      return result.data;
    },
    // 查看level训练结果的回调
    // 训练中 训练完毕 训练失败
    async searchLevelTrain() {
      let result = await LevelTrainResult().catch((e) => {});
      return result.data;
    },
    // 查询现在的训练情况
    async lookTrainSearch() {
      let result;
      if (this.train_name == "ner") {
        result = await this.searchNerTrain();
      } else if (this.train_name == "category") {
        result = await this.searchCategoryTrain();
      } else {
        result = await this.searchLevelTrain();
      }
      if (result.search("训练完毕") !== -1) {
        this.$message({
          type: "success",
          message: "数据正在处理中",
        });
        return;
      }
      this.$message({
        type: "success",
        message: result,
      });
    },
    // 获取模型训练按钮是否展示事件
    showTrainButton(show) {
      this.train_buttonShow = show;
    },
  },
};
</script>

<style scoped>
.icon-button {
  height: 30px;
  line-height: 14px;
  padding: 8px 5px;
  margin-left: 10px;
}

.import-excel {
  display: inline-block;
}

.message-info {
  margin: 10px 0;
  width: inherit;
  height: 40px;
  background-color: #e6f7ff;
  border: #99ceef solid 1px;
  border-radius: 5px;
  display: flow;
  justify-content: center;
  line-height: 40px;
  text-align: center;
}
</style>
