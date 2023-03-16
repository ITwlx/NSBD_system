<template>
  <div id="app" :class="{'bg-img': $route.path === '/home', '.bg-img::-webkit-scrollbar': this.$route.path === '/home'}">
    <!-- 头部组件（标题+应用中心导航栏） -->
    <base-header></base-header>
    <!-- 主体区域（侧边栏+内容） -->
    <div style="display: flex; height: calc(100vh - 50px)">
      <BaseAside></BaseAside>
      <BaseContainer></BaseContainer>
    </div>
  </div>
</template>

<script>
// import Home from "./Home";
import BaseHeader from "@/components/BaseHeader";
import BaseAside from "@/views/BaseAside";
import BaseContainer from "@/components/BaseContainer";
export default {
  name: 'app',
  components: {BaseContainer, BaseAside, BaseHeader},
}
</script>

<style>
.bg-img::-webkit-scrollbar {
  display: none !important;
  width: 0 !important;
}
 .bg-img {
  color: white !important;
  background-size: 100% 100%;
  background-image: url("~@/static/bg-img.jpg");
  scrollbar-width: none;
  -ms-overflow-style: none;
}
</style>

<!--<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
body {
  margin: 0;
}
h1, h2 {
  font-weight: normal;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  display: inline-block;
  margin: 0 10px;
}

a {
  color: #42b983;
}
</style>-->
