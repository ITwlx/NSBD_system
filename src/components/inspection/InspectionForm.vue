<template>
  <el-dialog
    :title="title"
    :center="true"
    :visible.sync="dialog_visible"
    :close-on-click-modal="false"
    element-loading-text="提交中，请稍后..."
    width="50%"
  >
    <!-- 设置文本为按钮 -->
    <div
      v-show="problem_show_div"
      style="
        width: 722px;
        height: 625px;
        background-color: #fff;
        position: absolute;
        top: 0px;
        left: 0px;
        z-index: 9;
        padding: 0 30px;
        padding-top: 20px;
      "
    >
      <h3
        style="
          text-align: center;
          color: rgb(64, 158, 255);
          padding-bottom: 20px;
        "
      >
        请点击连续的文字(双击按钮消除文字)
      </h3>
      <div ref="problem_div">
        <button
          v-for="(item, index) in arr"
          :key="index"
          @click="inputChar($event, index)"
          :value="item"
          ref="inputBtn"
          style="
            width: 60px;
            height: 45px;
            margin-bottom: 10px;
            margin-left: 4px;
            text-align: center;
            border: 2px solid rgb(0, 0, 0);
            background-color: rgb(220, 240, 255);
          "
        >
          {{ item }}
        </button>
      </div>
      <textarea
        name="text"
        ref="text"
        style="position: absolute; bottom: 280px; left: 60px"
        cols="80"
        rows="2"
        v-model="text"
        readonly="readonly"
      >
      </textarea>
      <button
        @click="confirmTxt(to_text)"
        style="
          width: 63px;
          height: 51px;
          position: absolute;
          bottom: 150px;
          left: 200px;
        "
      >
        确定
      </button>
      <button
        @click="closediv"
        style="
          width: 63px;
          height: 51px;
          position: absolute;
          bottom: 150px;
          right: 200px;
        "
      >
        返回
      </button>
    </div>
    <!--表单-->
    <el-form
      :model="form_data"
      size="mini"
      :rules="rules"
      ref="InspectionForm"
      label-suffix="："
      label-width="120px"
      label-position="left"
      v-loading="is_posting_data"
      :hide-required-asterisk="true"
      :validate-on-rule-change="false"
      style="margin: 0 10%; text-align: center"
    >
      <el-form-item label="所属管理处" prop="office_id">
        <el-select
          :disabled="!editable"
          v-model="form_data.office_id"
          placeholder="请选择管理处"
          style="width: 100%"
        >
          <el-option
            :key="item.office_id"
            :value="item.office_id"
            :label="item.office_name"
            v-for="item in $store.state.office_list"
          >
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item v-if="false" label="上报人员" prop="create_person">
        <el-input :readonly="!editable" v-model="form_data.create_person" />
      </el-form-item>
      <el-form-item label="发现时间" prop="found_time">
        <el-date-picker
          style="width: 100%"
          v-model="form_data.found_time"
          type="datetime"
          :readonly="!editable"
          format="yyyy-MM-dd HH:mm"
          value-format="yyyy-MM-dd HH:mm"
          placeholder="选择日期时间"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item label="问题描述" prop="description">
        <el-input
          type="textarea"
          :readonly="!editable"
          :autosize="{ minRows: 2, maxRows: 3 }"
          placeholder="请输入内容"
          v-model="form_data.description"
        >
        </el-input>
      </el-form-item>
      <el-form-item label="建筑物">
        <el-input
          :readonly="!editable"
          @focus="showDetails('building_name')"
          v-model="form_data.building_name"
        />
      </el-form-item>
      <el-form-item label="部位">
        <el-input
          :readonly="!editable"
          @focus="showDetails('location')"
          v-model="form_data.location"
        />
      </el-form-item>
      <el-form-item label="失效设施">
        <el-input
          :readonly="!editable"
          @focus="showDetails('facility')"
          v-model="form_data.facility"
        />
      </el-form-item>
      <el-form-item label="失效模式">
        <el-input
          :readonly="!editable"
          @focus="showDetails('mode')"
          v-model="form_data.mode"
        />
      </el-form-item>
      <el-form-item label="问题三元组">
        <el-input
          :readonly="!editable"
          @focus="showDetails('event_triple')"
          v-model="form_data.event_triple"
        />
      </el-form-item>
      <el-form-item label="危险源类型" prop="category">
        <input
          type="text"
          placeholder="请选择"
          :disabled="!editable"
          style="width: 100%; height: 28px; padding: 0 15px"
          ref="category_select"
          @click="showCategory"
        />
        <!-- category页面 -->
        <CategoryPage
          v-show="category_show"
          :category_data="issue_category"
          :showCategory="showCategory"
          @getCategory="addInfo"
        />
        <!-- <el-select
          :disabled="!editable"
          style="width: 100%"
          ref="category_select"
          v-model="form_data.category"
        >
        
          <el-option
            :value="form_data.category"
            style="height: auto; background-color: transparent !important"
          >
            <el-tree
              :props="tree_props"
              :data="issue_category"
              :highlight-current="true"
              @node-click="handleNodeClick"
              style="height: inherit; background-color: transparent"
            >
            </el-tree>
          </el-option>
        </el-select> -->
      </el-form-item>
      <el-form-item label="问题级别" prop="level">
        <el-select
          style="width: 100%"
          :disabled="!editable"
          v-model="form_data.level"
        >
          <el-option value="I类" />
          <el-option value="II类" />
          <el-option value="III类" />
          <el-option value="其他" />
        </el-select>
      </el-form-item>
    </el-form>

    <span slot="footer" style="text-align: center">
      <!--如果是添加信息，此处为 研判/提交，否则是 审核通过/返回 -->
      <slot></slot>
    </span>
  </el-dialog>
</template>

<script>
import CategoryPage from "../categorypage/index.vue";
export default {
  name: "InspectionForm",
  props: {
    title: String,
    issue_category: {
      type: Array,
      required: true,
    },
    editable: {
      type: Boolean,
      default: true,
    },
  },

  components: { CategoryPage },
  data() {
    return {
      dialog_visible: false,
      is_posting_data: false,
      //
      category_content: "",
      //输入框的文本内容
      input_txt: [],
      text: "",
      // 判断是否展示categorypage页面
      category_show: false,
      indexArr: [],
      temp: 0,
      problem_show_div_arr: [],
      problem_show_div_str: "",
      // 输入到哪个文本框
      to_text: "",
      form_data: {
        issue_id: "",
        office_id: "",
        create_person: "",
        found_time: "",
        description: "",
        building_name: "",
        //新增
        building_location: "",
        location_location: "",
        facility_location: "",
        mode_location: "",
        location: "",
        facility: "",
        mode: "",
        category: "",
        level: "",
        photo: "",
        audit_person: "",
        audit_time: "",
        //新增的问题三元组
        event_triple:''
      },
      building_name_arr: [],
      problem_show_div: false,
      rules: {
        office_id: { required: true, message: "请选择管理处", trigger: "blur" },
        create_person: {
          required: true,
          message: "请输入上报人员",
          trigger: "blur",
        },
        found_time: {
          required: true,
          message: "请选择发现时间",
          trigger: "blur",
        },
        description: {
          required: true,
          message: "请输入工情描述",
          trigger: "blur",
        },
        building_name: {
          required: true,
          message: "请输入建筑物名称",
          trigger: "blur",
        },
        location: {
          required: true,
          message: "请输入建筑物部位",
          trigger: "blur",
        },
        facility: {
          required: true,
          message: "请输入失效设施",
          trigger: "blur",
        },
        mode: { required: true, message: "请输入失效模式", trigger: "blur" },
        category: {
          required: true,
          message: "请选择问题类别",
          trigger: "blur",
        },
        level: { required: true, message: "请选择问题级别", trigger: "blur" },
        photo: "",
        audit_person: "",
        audit_time: "",
      },
      tree_props: {
        label: "content",
      },
    };
  },
  computed: {
    arr() {
      return [...this.form_data.description].slice(0, -1);
    },
    txt() {
      return this.text.split("");
    },
  },
  methods: {
    // 显示对话框（参数为表单的初始数据）
    // 如果是添加数据，则select_data中有当前选择的管理处id
    // 如果是修改书籍，则form_data存放的是修改前的记录
    showDialog(select_data, form_data) {
      // 重置表格中的数据
      this.resetFormData();
      this.is_posting_data = false;
      // 打开对话框
      this.dialog_visible = true;
      if (select_data) {
        // 设置默认的管理处
        this.form_data.office_id = select_data.office_id;
      } else if (form_data) {
        // 设置表单数据
        Object.assign(this.form_data, form_data);
        // this.form_data = form_data
      }
    },
    // 点击文本框显示按钮
    showDetails(value) {
      this.problem_show_div = true;
      this.input_txt = [];
      this.to_text = value;
    },
    // 显示文字
    inputChar(e, index) {
      //  console.log(e);
      //如果为空数组
      if (this.problem_show_div_arr.length < 1) {
        this.problem_show_div_arr.push(index);
        this.input_txt[index] = e.target.value;
        // e.target.disabled = true
        e.path[0].style.backgroundColor = "rgb(64,158,255)";
        e.path[0].style.color = "rgb(220,240,255)";
      }
      // 如果索引值小于数组最后一个元素
      else if (
        this.problem_show_div_arr[this.problem_show_div_arr.length - 1] >=
          index &&
        this.problem_show_div_arr[0] - 1 <= index
      ) {
        if (this.problem_show_div_arr.indexOf(index) != -1) {
          for (let i = 0; i < this.problem_show_div_arr.length; i++) {
            if (this.problem_show_div_arr[i] == index) {
              this.problem_show_div_arr.splice(i, 1);
              this.input_txt[index] = null;
              e.path[0].style.backgroundColor = "rgb(220,240,255)";
              e.path[0].style.color = "rgb(0,0,0)";
            }
          }
        } else {
          this.problem_show_div_arr.push(index);
          this.input_txt[index] = e.target.value;
          e.path[0].style.backgroundColor = "rgb(64,158,255)";
          e.path[0].style.color = "rgb(220,240,255)";
        }
      } // 如果索引值只比数组最后一个元素大一，则加入数组
      else if (
        this.problem_show_div_arr[this.problem_show_div_arr.length - 1] + 1 ==
        index
      ) {
        this.problem_show_div_arr.push(index);
        // this.text += e.target.value;
        this.input_txt[index] = e.target.value;
        e.path[0].style.backgroundColor = "rgb(64,158,255)";
        e.path[0].style.color = "rgb(255,255,255)";
      } else {
        alert("请点击连续的文字");
      }

      this.problem_show_div_arr.sort((a,b)=>a-b);
      console.log(this.problem_show_div_arr);
      this.problem_show_div_str =
        "[" +
        this.problem_show_div_arr[0] +
        "," +
        this.problem_show_div_arr[this.problem_show_div_arr.length - 1] +
        "]";
      console.log(this.problem_show_div_str);
      let txtArr = this.problem_show_div_arr;
      this.problem_show_div_arr = txtArr;
      console.log(this.problem_show_div_arr);
      this.text = this.input_txt.join("");
    },
    // 保存内容
    confirmTxt(value) {
      this.backNormal()
      if (!this.text) {
        alert("请输入内容后点击确定");
        return;
      }
      console.log(value);
      console.log(this.problem_show_div_str);
      //判断给哪个location赋值
      switch (value) {
        case "building_name":
          this.form_data.building_location = this.problem_show_div_str;
          break;
        case "location":
          this.form_data.location_location = this.problem_show_div_str;
          break;
        case "facility":
          this.form_data.facility_location = this.problem_show_div_str;
          break;
        case "mode":
          this.form_data.mode_location = this.problem_show_div_str;
          break;
        default:
          break;
      }
      let name = value;
      this.form_data[name] = this.text;
      console.log(this.text);
      this.problem_show_div_arr = [];
      this.problem_show_div_str = "";
      this.text = "";
      this.indexArr = [];
      this.problem_show_div = false;
    },
    // 输入危险源类别
    addInfo(concent) {
      this.$refs.category_select.value = concent;
      this.form_data.category = concent;
    },
    // 点击input输入框的确定||取消按钮时，将按钮样式变回原样
    backNormal() {
      this.$refs.inputBtn.forEach((item) => {
        item.style.backgroundColor = "rgb(220, 240, 255)";
        item.style.color = 'rgb(0,0,0)'
      });
    },
    // 关闭文本选择框
    closediv() {
      // 按钮样式变回原样
      this.backNormal()
      // 清空上一个输入框的文字
      this.problem_show_div_arr = [];
      this.problem_show_div_str = "";
      this.text = "";
      this.indexArr = [];
      this.problem_show_div = false;
    },
    // 关闭对话框
    closeDialog() {
      console.log(this.form_data);
      this.dialog_visible = false;
    },
    isPostingData(is_posting_data) {
      this.is_posting_data = is_posting_data;
    },
    handleNodeClick(data, node) {
      // console.log(node);
      if (data.children && data.children.length > 0) {
        this.form_data.category = "";
      } else {
        let parent = node.parent;
        let root = parent.parent;
        this.form_data.category =
          root.data.content + "-" + parent.data.content + "-" + data.content;
        console.log(this.form_data.category);
        this.$refs.category_select.blur();
      }
    },

    // 在打开表单对话框时重置表单数据
    resetFormData() {
      if (this.$refs.InspectionForm) {
        this.form_data.building_name = ''
        this.form_data.location = ''
        this.form_data.facility = ''

        console.log('reset');
        this.sensor_index = "";
        this.building_id = "";
        this.$refs.category_select.value = ''
        this.$refs.InspectionForm.resetFields();
        this.$refs.InspectionForm.clearValidate();
      }
    },
    // 父组件调用该方法获取表单中的数据
    getFormData() {
      console.log('-----');
      console.log(this.form_data);
      return this.form_data;
    },
    //分析研判后，更新表格数据
    updateFormData(form_data) {
      Object.assign(this.form_data, form_data);
    },
    // 点击文本框显示category页面
    showCategory() {
      this.category_show = !this.category_show;
    },
  },
};
</script>

<style scoped>
</style>
