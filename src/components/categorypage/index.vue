<template>
  <div class="nav">
    <!-- <el-header style="poaition:absolute;background-color:skyblue;color:black">危险源类别选择</el-header> -->
    <el-input
      type="textarea"
      v-model="content"
      autosize
      placeholder="请选择内容"
      class="sure ipt"
      style="width: 450px; text-align: center"
      
    />
    <el-button
      type="success sure btn"
      style="width: 50px; margin-left: 15px"
      @click.prevent="changeShowCategory"
      plain
    >
      确定
    </el-button>
    <div class="left-nav">
      <div class="all-sort-list">
        <div class="item bo" v-for="(c1, index) in category_data" :class="{cur:curIndex == index}" :key="c1.id" @mouseenter="getColor(index)" @mouseleave="clearColor">
          <h3>
            <a>{{ c1.content }}</a>
          </h3>
          <div class="item-list clearfix">
            <div class="subitem clearfix">
              <dl
                class="fore clearfix"
                v-for="(c2, index) in c1.children"
                :key="c2.id"
              >
                <dt>
                  <a>{{ c2.content+':' }}</a>
                </dt>
                <dd>
                  <em v-for="(c3, index) in c2.children" :key="c3.id">
                    <el-button
                      class="c3style"
                      type="primary" plain
                      @click.prevent="
                        submit_data(c3.content, c2.content, c1.content)
                      "
                      >{{ c3.content }}</el-button
                    >
                    <i class="line">|</i>
                  </em>
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    category_data: {
      type: Array,
      required: true,
    },
    showCategory: {
      type: Function,
      required: true,
    },
  },
  data() {
    return {
      content: "",
      curIndex:-1
    };
  },
  methods: {
    submit_data(v1, v2, v3) {
      this.content = v3 + "-" + v2 + "-" + v1;
    },
    changeShowCategory() {
      this.$emit("getCategory", this.content);
      this.showCategory();
    },
    getColor(index){
      this.curIndex = index
    },
    clearColor(){
      this.curIndex = -1
    }
  },
};
</script>

<style scoped>
.sure {
  position: absolute;
  top: 20px;
}
.ipt {
  position: absolute;
  left: 330px;
}
.btn {
  right: 250px;
}
.clearfix {
  zoom: 1;
}
.clearfix:before,
.clearfix:after {
  display: table;
  line-height: 0;
  content: "";
}
.clearfix:after {
  clear: both;
}
a {
  text-decoration: none;
}
.nav {
  list-style: none;
  width: 1100px;
  height: 800px;
  /* background-color: rgb(186, 208, 217); */
  background-color: rgb(212, 211, 211);
  position: absolute;
  top: -470px;
  left: -390px;
  z-index: 9;
  padding-top: 70px;
}
.all-sort-list {
  text-decoration: none;
  width: 200px;
  float: left;
  height: 100%;
  box-sizing: border-box;
}
.item {
  border-radius: 25%;
  padding: 30px 0;
  background-color: rgb(33, 41, 54);
  color: #fff;
  border: 1px solid #fff;
}
.item-list {
  box-sizing: border-box;
  /* border: 1px solid red; */
  /* background-color: rgb(145, 159, 180); */
  background-color: #fff;
  position: absolute;
  display: none;
  left: 200px;
  top: 70px;
  min-height: 700px;
}
dt a {
  color: black
}
.subitem {
  float: left;
  width: 900px;
  height: 100%;
}
.fore dt {
  float: left;
  padding-left: 4px;
  font-weight: 800;
}
/* .fore dd {
  margin-left: 80px;
} */
.fore dd {
  float: left;
  flex-direction: row;
  text-align: left;
  padding-left: 5px;
  font-size: 13px;
}
.fore dd em {
  display: inline-block;
}
.c3style {
  display: inline-block;
  margin: 3px 0;
  padding: 5px 7px;
}
.item:hover .item-list {
  display: block;
}
.line {
  width: 2px;
  font-weight: 800;
  margin: 0 10px;
}
.cur{
  background-color: rgb(204, 204, 241);
  color: black;
}
</style>