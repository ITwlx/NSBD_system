<template>
  <div id="base-container" style="flex: 1; width: 80%; margin-bottom: 8px; overflow-x: auto">
    <Crumbs v-if="$route.path !== '/home'"></Crumbs>
    <router-view></router-view>
  </div>
</template>

<script>
import Crumbs from "@/components/Crumbs";
export default {
  name: "BaseContainer",
  components: {Crumbs}
}
</script>

<style scoped>

</style>
