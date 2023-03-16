<template>
  <div id="header" @click="$router.push({path: '/'})" style="cursor: pointer">
    <!-- 右侧菜单部分 舍弃，v-if= false -->
    <div v-if="false" id="menu" style="display: inline-block; width: 240px; float: right; margin-right: 10px">
      <!--铃铛和信封图标-->
      <div style="display: inline-block; width: 100px; text-align: center; float: left">
        <el-badge :value="6" class="el-tag--mini">
          <a><i class="el-icon-bell"></i></a>
        </el-badge>
        &nbsp;
        <el-badge :value="5" class="el-tag--mini">
          <i class="el-icon-message"></i>
        </el-badge>
      </div>
      <!--应用中心-->
      <div style="display: inline-block; width: 120px; position: absolute; right: 5px">
        <!-- 应用中心暂时作废 -->
<!--        <span @mouseover="dialog_visible=true"-->
        <span style="height: 30px; font-size: medium; border: solid 1px #000000; padding: 4px 6px">
          <i class="el-icon-menu"></i>
          应用中心
          <i class="el-icon-arrow-down"></i>
        </span>
        <el-dialog :modal="false"
                   width="100%" top="50px"
                   :visible.sync="dialog_visible"
                   :modal-append-to-body="false">
          <div @mouseleave="dialog_visible = false">
            <div v-for="(item, index) in nav_item"
                         :key="index"
                         class="nav-item"
                         @click="$router.push({path: item.route}); dialog_visible=false"
                         style="height: 120px;
                         text-decoration: none;
                         display: inline-block;
                         padding: 20px; text-align: center">
              <div style="height: 30px">
                <img :src="item.url" style="float: top; margin: auto"/>
              </div>
              <span v-text="item.name" style="line-height: 30px"></span>
            </div>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "BaseHeader",
  data() {
    return {
      dialog_visible: false,
      nav_item: [
      ]

    };
  },
  methods: {}
}
</script>

<style scoped>
#header{
  width: 100%;
  height: 50px;
  color: #7095c3;
  line-height: 50px;
  font-size: x-large;
  text-align: center;
  background: #2b3648 url(~@/static/title.png) no-repeat center center;
}
.nav-item{
  padding: 20px;
  height: 120px;
  color: gray;
  text-align: center;
  display: inline-block;
}
.nav-item :hover{
  color: #1698ef;
  cursor: pointer;
}
#header /deep/ .el-dialog *{
  background-color: #2c3e50;
  margin: 0;
  padding: 0;
  display: flex;
  justify-content: center;
}
</style>
