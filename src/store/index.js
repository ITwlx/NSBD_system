import Vue from "vue";
import vuex from 'vuex';
import {Message} from 'element-ui'
Vue.use(vuex)

import {getAllOffice} from "@/api/workingCondition";
/*Date.prototype.pattern=function(fmt) {
  let o = {
    "M+" : this.getMonth()+1, //月份
    "d+" : this.getDate(), //日
    "h+" : this.getHours()%12 === 0 ? 12 : this.getHours()%12, //小时
    "H+" : this.getHours(), //小时
    "m+" : this.getMinutes(), //分
    "s+" : this.getSeconds(), //秒
    "q+" : Math.floor((this.getMonth()+3)/3), //季度
    "S" : this.getMilliseconds() //毫秒
  };
  let week = {
    "0" : "/u65e5",
    "1" : "/u4e00",
    "2" : "/u4e8c",
    "3" : "/u4e09",
    "4" : "/u56db",
    "5" : "/u4e94",
    "6" : "/u516d"
  };
  if(/(y+)/.test(fmt)){
    fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
  }
  if(/(E+)/.test(fmt)){
    fmt=fmt.replace(RegExp.$1, ((RegExp.$1.length>1) ? (RegExp.$1.length>2 ? "/u661f/u671f" : "/u5468") : "")+week[this.getDay()+""]);
  }
  for(let k in o){
    if(new RegExp("("+ k +")").test(fmt)){
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length===1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
    }
  }
  return fmt;
}*/

let dayjs = require('dayjs')
const state={
  is_collapse_aside: false,
  office_list: [],
  dayjs: dayjs,
  today: dayjs().format("YYYY-MM-DD HH:mm:ss"),
  units: {
    '位移计':'mm',
    '渗压计':'kPa',
    '钢筋计':'MPa',
    '测缝计':'mm',
    '水位计':'m',
    '测压管':'m',
    '温度计':'℃',
    '土压力计':'MPa',
  }
  // today: date.toLocaleDateString('fr-CA')+":"
}
const actions= {

}
const mutations= {

}

// 直接请求管理处列表
getAllOffice().then(data=>{
  state.office_list = data['data']
}).catch(err=>{
  Message({
    type: 'warning',
    showClose: true,
    message: '获取管理处列表失败，请刷新重试'
  })
})
export default new vuex.Store({
  state,
  actions,
  mutations,
  modules: {}
})
