<template>
  <div style="margin: 10px 0 0 10px">
    <el-tabs v-model="active_name" type="card">
      <el-tab-pane label="实体识别模型" name="entity">
        <EntityModelTable></EntityModelTable>
      </el-tab-pane>
      <el-tab-pane label="巡检文本分类" name="category">
        <TextModelTable :table_title="'巡检文本分类'" :model_type="'category'"></TextModelTable>
      </el-tab-pane>
      <el-tab-pane label="巡检文本分级" name="level">
        <TextModelTable :table_title="'巡检文本分级'" :model_type="'level'"></TextModelTable>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import EntityModelTable from "@/components/model/entityModel/EntityModelTable";
import TextModelTable from "@/components/model/textModel/TextModelTable";
export default {
  name: "InspectionModel",
  components: {TextModelTable, EntityModelTable},
  data() {
    return {
      active_name: 'entity'
    }
  }
}
</script>

<style scoped>

</style>
