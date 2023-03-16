import VueRouter from 'vue-router';
//引入组件
// import Home from "../Home";
import BaseAside from "@/views/BaseAside";


const routes = [
    {
        path: "*",
        redirect: {
            name: "home"
        }
    },
    {
        path: "/home",
        name: "home",
        meta: {title: "首页"},
        component: r => require.ensure([], () => r(require("@/Home"), "home"))
    },
    {
        path: "/monitoring-info",
        name: "monitor",
        meta: {title: "监测信息"},
        component: r => require.ensure([], () => r(require("@/views/monitor/Monitoring"), "monitoring"))
    },
    {
        path: "/inspection",
        meta: {title: "数据分析"},
        component: r => require.ensure([], () => r(require('@/views/inspection/InspectionIssue'), 'DataAnalysis')),
    },
    {
        path: "/warning-page",
        meta: {title: "智能预警"},
        component: r => require.ensure([], () => r(require('@/views/risk/WarningPage'))),
    },
    {
        path: "/model/groundwater-model",
        meta: {title: "地下水研判模型"},
        component: r => require.ensure([], () => r(require("@/views/model/GroundwaterModel"), "groundwaterModel"))
    },
    {
        path: "/model/monitor-model",
        meta: {title: "监测模型"},
        component: r => require.ensure([], () => r(require("@/views/model/MonitorModel"), "monitorModel"))
    },
    {
        path: "/model/inspection-model",
        meta: {title: "巡检模型"},
        component: r => require.ensure([], () => r(require('@/views/model/InspectionModel'), 'inspectionModel')),
    },
    {
        path: "/model/risk-model",
        meta: {title: "风险预警模型"},
        component: r => require.ensure([], () => r(require('@/views/model/RiskModel'), 'riskModel')),
    },
    {
        path: "/data-tidy/building-component",
        meta: {title: "建筑物组件管理"},
        component: r => require.ensure([], () => r(require('@/views/datatidy/BuildingComponentManage'), 'buildingComponent')),
    },
]

const router = new VueRouter({
    routes,
    mode: 'history'
})

router.afterEach((to, from) => {
    // console.log('to', to)
    // console.log('from', from)
    // console.log(this)
})

export default router
