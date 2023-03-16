import Vue from 'vue'
import App from '@/App.vue'
import '@/assets/css/global.css'
import element from "@/plugins/element"
import 'element-ui/lib/theme-chalk/index.css'
import VueRouter from "vue-router";
import router from "@/router";
import store from '@/store'
import echarts from "@/plugins/echarts";
// 按需引入element-ui
Vue.use(element)
// 引入路由
Vue.use(VueRouter)
// 引入echarts
Vue.prototype.$echarts=echarts


new Vue({
  el: '#app',
  render: h => h(App),
  store, //存储了 管理处列表
  router
})
