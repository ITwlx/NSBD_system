<template>
  <el-dialog
    title=""
    :visible.sync="dialogVisible"
    width="50%"
    :before-close="handleClose"
  >
    <!-- v-loading="loading" -->
    <el-tabs v-model="activeName" type="card" :stretch="true">
      <el-tab-pane label="NER模型训练" name="ner">
        <div>
          <br />

          <h3 style="text-align: center">模型训练</h3>

          <el-upload
            class="upload_btn"
            ref="upload"
            action="http://localhost:8081/api/huashui/WorkingCondition/inspection/nertdataimport"
            accept=".xlsx"
            :limit="1"
            :show-file-list="true"
            :file-list="fileList"
            :auto-upload="true"
            :before-upload="beforeExcelUpload"
            :on-remove="remove"
            :on-success="showButton"
          >
            <el-button slot="trigger" size="small" type="primary"
              >选取文件
            </el-button>
          </el-upload>
          <br />
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">学习率</span>
            <el-input-number
              v-model="NERNum.learningNum"
              :precision="3"
              :step="0.001"
              :max="1"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">batchSize</span>
            <el-input-number
              v-model="NERNum.batchNum"
              :step="1"
              :max="1000"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">优化器</span>
            <el-select
              v-model="value"
              placeholder="请选择"
              style="float: right; width: 180px"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <!-- :precision="2"
              :step="0.01" -->
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">epoches</span>
            <el-input-number
              v-model="NERNum.epochesNum"
              :max="100"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            v-model="textarea"
          >
          </el-input>
        </div>
      </el-tab-pane>
      <el-tab-pane label="分类模型训练" name="category"
        ><div>
          <br />
          <h3 style="text-align: center">模型训练</h3>
          <el-upload
            class="upload_btn"
            ref="upload"
            action="http://localhost:8081/api/huashui/WorkingCondition/inspection/categorytdataimport"
            accept=".xlsx"
            :limit="1"
            :show-file-list="true"
            :file-list="fileList"
            :auto-upload="true"
            :before-upload="beforeExcelUpload"
            :on-remove="remove"
            :on-success="showButton"
          >
            <el-button slot="trigger" size="small" type="primary"
              >选取文件</el-button
            >
          </el-upload>
          <br>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">学习率</span>
            <el-input-number
              v-model="categoryNum.learningNum"
              :precision="3"
              :step="0.001"
              :max="1"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">batchSize</span>
            <el-input-number
              v-model="categoryNum.batchNum"
              :step="1"
              :max="1000"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">优化器</span>
            <el-select
              v-model="value"
              placeholder="请选择"
              style="float: right; width: 180px"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">epoches</span>
            <el-input-number
              v-model="categoryNum.epochesNum"
              :max="100"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            v-model="textarea"
          >
          </el-input></div
      ></el-tab-pane>
      <el-tab-pane label="分级模型训练" name="level"
        ><div>
          <br />
          <h3 style="text-align: center">模型训练</h3>
          <el-upload
            class="upload_btn"
            ref="upload"
            action="http://localhost:8081/api/huashui/WorkingCondition/inspection/leveltdataimport"
            accept=".xlsx"
            :limit="1"
            :show-file-list="true"
            :file-list="fileList"
            :auto-upload="true"
            :before-upload="beforeExcelUpload"
            :on-remove="remove"
            :on-success="showButton"
          >
            <el-button slot="trigger" size="small" type="primary"
              >选取文件</el-button
            >
          </el-upload>
          <br>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">学习率</span>
            <el-input-number
              v-model="LevelNum.learningNum"
              :precision="3"
              :step="0.001"
              :max="1"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">batchSize</span>
            <el-input-number
              v-model="LevelNum.batchNum"
              :step="1"
              :max="1000"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">优化器</span>
            <el-select
              v-model="value"
              placeholder="请选择"
              style="float: right; width: 180px"
            >
              <el-option
                v-for="item in options"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </div>
          <div style="margin-bottom: 10px">
            <span style="line-height: 40px">epoches</span>
            <el-input-number
              v-model="LevelNum.epochesNum"
              :max="100"
              :min="0"
              style="float: right"
            ></el-input-number>
          </div>
          <el-input
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            v-model="textarea"
          >
          </el-input></div
      ></el-tab-pane>
    </el-tabs>
    <slot name="footer"> </slot>
  </el-dialog>
</template>

<script>
export default {
  name: "ModelTrain",
  data() {
    return {
      activeName: "ner",
      dialogVisible: false,
      NERNum: {
        epochesNum: 0,
        batchNum: 0,
        learningNum: 0,
      },
      categoryNum: {
        epochesNum: 0,
        batchNum: 0,
        learningNum: 0,
      },
      LevelNum: {
        epochesNum: 0,
        batchNum: 0,
        learningNum: 0,
      },
      options: [
        {
          value: "Adam",
          label: "Adam",
        },
        {
          value: "Adagrad",
          label: "Adagrad",
        },
        {
          value: "Adamax",
          label: "Adamax",
        },
        {
          value: "SGD",
          label: "SGD",
        },
      ],
      value: "Adam",
      textarea: "",
      loading: false,
      fileList: [],
      imgUrl: {},
    };
  },
  methods: {
    handleClose(done) {
      Object.assign(this._data, this.$options.data());
    },
    showModel() {
      this.dialogVisible = true;
    },
    //文件上传成功的钩子
    showButton() {
      this.$emit("showTrainButton", false);
    },
    // 上传文件之前的钩子,上传前对文件的大小和类型进行判断
    beforeExcelUpload(file) {
      // 打印file，帮助我们了解我们需要的参数
      console.log(file);

      const isExcel = file.name.split(".")[1] === "xlsx";
      // file.name.split(".")[1] === "doc" ||
      // file.name.split(".")[1] === "pdf";
      const isSize = file.size / 1024 / 1024 < 100;
      if (!isExcel) {
        this.$message({
          message: "只能上传xlsx!",
          type: "error",
        });
      }
      if (!isSize) {
        this.$message({
          message: "上传文件大小不能超过 100MB!",
          type: "error",
        });
      }
      return isExcel && isSize;
    },
    //
    remove(file, filelist) {
      console.log(file, filelist);
    },
  },
};
</script>

<style>
</style>