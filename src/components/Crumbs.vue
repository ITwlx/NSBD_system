<template>
  <div class="crumbs" style="height: 20px">
    <!-- 面包屑 -->
    <el-breadcrumb separator="/">
      <el-breadcrumb-item v-for="(level,index) in this.level_list" :key="index" :to="level.path">
        {{level.name}}
      </el-breadcrumb-item>
    </el-breadcrumb>
  </div>
</template>

<script>
export default {
  name : "Crumbs",
  props:{
    isShow:{
      type:Boolean,
      default:true //默认值为true 显示
    }
  },
  data() {
    return {
      level_list: []
    }
  },
  created() {
    // 获取到当前路由，然后显示路径信息
    let match=this.$router.currentRoute.matched
    this.level_list=match.map(item=>{
      // 返回要显示的信息，以及跳转路径
      return {name: item.meta.title, path: item.path}
    })
  },
  watch: {
    $route(to,from) {
      // 思路：to、from中保存的是目的地和发起地的路由信息
      // 其中保存着路由信息（matched数组），每一项中都有path（路由地址）
      // 可以将想要显示在面包屑中的内容存到meta对象中进行获取。
      // console.log(to)
      let match=to.matched
      this.level_list=match.map(item=>{
        // 返回要显示的信息，以及跳转路径
        return {name: item.meta.title, path: item.path}
      })
    }
  }
}
</script>

<style scoped>
.crumbs{
  margin: 10px;
}

</style>
