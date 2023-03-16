<template>
  <div style="display: flex">
    <div id="aside" style="width: 210px">
      <el-menu
        style="min-height: calc(100vh - 50px); height: 100%"
        default-active="/training/monitorModel"
        class="el-menu-vertical-demo"
        :router="true">
        <el-menu-item index="/training/monitorModel">
          <i class="el-icon-setting"></i>
          <span slot="title">监测模型管理</span>
        </el-menu-item>
        <el-menu-item index="/training/inspectionModel">
          <i class="el-icon-s-management"></i>
          <span slot="title">巡检模型管理</span>
        </el-menu-item>
        <el-menu-item index="/training/riskModel">
          <i class="el-icon-apple"></i>
          <span slot="title">风险模型管理</span>
        </el-menu-item>
      </el-menu>
    </div>
    <BaseContainer></BaseContainer>
  </div>
</template>

<script>
import BaseContainer from "@/components/BaseContainer";
export default {
  name: "TrainAside",
  components: {BaseContainer}
}
</script>

<style scoped>

</style>
