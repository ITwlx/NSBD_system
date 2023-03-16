<template>
    <div id="aside">
      <el-menu
        style="min-height: calc(100vh - 50px); height: 100%"
        :default-active="$route.path"
        class="el-menu-vertical-demo"
        :collapse="$route.path === '/home'"
        :router="true">
<!--        <el-button style="background-color: inherit; border: none; border-bottom: 1px; width: 100%" @click="$store.state.is_collapse_aside=!$store.state.is_collapse_aside">-->
<!--          <i :class="[$store.state.is_collapse_aside?'el-icon-s-fold':'el-icon-s-unfold']"></i>-->
<!--        </el-button>-->
        <el-menu-item index="/home">
          <i class="el-icon-s-home"></i>
          <span slot="title">首页</span>
        </el-menu-item>
        <el-submenu index="/data-tidy">
          <template slot="title">
            <i class="el-icon-s-data"></i>
            <span slot="title">数据整理</span>
          </template>
          <el-menu-item index="/data-tidy/building-component">建筑物组件管理</el-menu-item>
        </el-submenu>
        <el-submenu index="/model">
          <template slot="title">
            <i class="el-icon-s-management"></i>
            <span slot="title">模型管理</span>
          </template>
          <el-menu-item index="/model/monitor-model">监测模型管理</el-menu-item>
          <el-menu-item index="/model/inspection-model">巡检模型管理</el-menu-item>
          <el-menu-item index="/model/risk-model">风险预警模型管理</el-menu-item>
          <el-menu-item index="/model/groundwater-model">地下水研判模型管理</el-menu-item>
        </el-submenu>
        <el-menu-item index="/monitoring-info">
          <i class="el-icon-info"></i>
          <span slot="title">监测数据管理</span>
        </el-menu-item>
        <el-menu-item index="/inspection">
          <i class="el-icon-data-analysis"></i>
          <span slot="title">工程巡检问题研判</span>
        </el-menu-item>
        <el-menu-item index="/warning-page">
          <i class="el-icon-document"></i>
          <span slot="title">风险评估与预警</span>
        </el-menu-item>
      </el-menu>
    </div>
</template>

<script>
import BaseContainer from "@/components/BaseContainer";
export default {
  name: "BaseAside",
  components: {BaseContainer},
  data() {
    return {
      is_collapse_aside: this.$store.state.is_collapse_aside
    }
  }
}
</script>

<style scoped>
/deep/ .el-menu .is-active {
  color: #64b9fc !important;
}
/deep/ .el-menu-vertical-demo:not(.el-menu--collapse) {
  width: 180px;
  height: 100%;
}
</style>
