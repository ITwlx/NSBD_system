<template>
  <div id="home">
    <div class="select-box">
      <p v-if="true" style="line-height: 50px; float: right">
        <!--起止时间选择框-->
        <el-date-picker
            popper-class="date-picker-transparent"
            v-model="select_date"
            size="small"
            type="daterange"
            value-format="yyyy-MM-dd"
            align="right"
            unlink-panels
            :clearable="false"
            range-separator="-"
            start-placeholder="开始日期"
            end-placeholder="结束日期">
        </el-date-picker>
      </p>

      <!-- 管理处选择框 -->
      <el-select
          :popper-append-to-body="false"
          style="display: inline-block; background: inherit; width: 150px" v-model="params.office_id" placeholder="请选择">
        <el-option
            v-for="item in $store.state.office_list"
            :key="item.office_id"
            :label="item['office_name']"
            :value="item.office_id">
        </el-option>
      </el-select>
      <h3 style="line-height: 50px; margin-left: 30px; display: inline-block">近15天工程安全评价结果统计：</h3>
    </div>
    <div class="content-wrapper">
      <!-- 各项统计 -->
      <div class="dis-flex-center">
        <div v-loading="is_loading_monitor_building" class="shadow text-statistic-box">
          <h2>具有异常监测数据建筑物数量</h2>
          <h4 style="font-size: x-large">{{ monitor_building_num }}</h4>
        </div>
        <div v-loading="is_loading_risk_building" class="shadow text-statistic-box">
          <h2>具有风险因子建筑物数量</h2>
          <h4 style="font-size: x-large">{{ risk_building_data.length }}</h4>
        </div>
        <div v-loading="is_loading_issue_building" class="shadow text-statistic-box">
          <h2>具有巡检问题建筑物数量</h2>
          <h4 style="font-size: x-large">{{ issue_building_data.length }}</h4>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="dis-flex-center">
        <!-- 监测数据图表 -->
        <div class="content-box">
          <h3>监测数据</h3>
          <MonitorChart
              :width="'600px'"
              :height="'270px'"
              :title="'异常监测数据个数'"
              :x_data="monitor_data.time_line"
              :data_list="monitor_data.data_list"
              v-loading="is_loading_monitor"></MonitorChart>
          <MonitorChart
              :width="'600px'"
              :height="'270px'"
              :title="'各类告警信息个数'"
              :x_data="alarm_data.time_line"
              :line_name="alarm_data.line_name"
              :data_list="alarm_data.data_list"
              v-loading="is_loading_alarm"></MonitorChart>
        </div>
        <!-- 风险数据图表 -->
        <div class="content-box dis-col-flex dis-flex-center">
          <h3>风险数据</h3>
          <RiskChart
              :chart_data="risk_data"
              v-loading="is_loading_risk">
          </RiskChart>
          <WordList
              v-if="false"
              :title="'告警建筑物列表'"
              :label_name="'建筑物名称'"
              :data_list="risk_building_data"
              v-loading="is_loading_risk_building">
          </WordList>
        </div>
        <!-- 巡检数据图表 -->
        <div class="content-box">
          <h3>巡检数据</h3>
          <WordList
              :title="'巡检问题分类列表'"
              :data_list="issue_data"
              :label_name="'巡检问题分类名称'"
              v-loading="is_loading_issue">
          </WordList>
          <!--          <WordCloud2 :words="issue_data" :width="'100%'" :height="'500px'"></WordCloud2>-->
          <!--        <InspectionWordCloud :chart_data="issue_data" v-loading="is_loading_issue"></InspectionWordCloud>-->
        </div>
      </div>
      <!--      <div class="content-panel"></div>-->
    </div>
  </div>
</template>

<script>
import BaseHeader from "@/components/BaseHeader";
import InspectionWordCloud from "@/components/home/InspectionWordCloud";
import RiskChart from "@/components/home/RiskChart";
import MonitorChart from "@/components/home/MonitorChart";
import {
  getAlarmDataNums, getIssueBuildingNums,
  getIssueCategoryNums, getMonitorDataBuildingNums,
  getMonitorDataNums, getRiskBuildingNums,
  getRiskClassesNums
} from "@/api/workingCondition/judge";
import WordList from "@/components/home/WordList";
import WordCloud2 from "@/components/home/WordCloud2";

export default {
  name: "Home",
  components: {WordCloud2, WordList, MonitorChart, RiskChart, InspectionWordCloud, BaseHeader},
  data() {
    // let yesterday = this.$store.state['dayjs']().format("YYYY-MM-DD")
    // let daysAgo16 = this.$store.state['dayjs']().subtract(15, 'day').format("YYYY-MM-DD")
    let yesterday = "2021-10-22"
    let daysAgo16 = "2021-10-05"
    return {
      select_date: [daysAgo16, yesterday],
      params: {
        office_id: 59,
        start_date: daysAgo16,
        end_date: yesterday
      },
      is_loading_monitor: true,
      is_loading_monitor_building: true,
      is_loading_alarm: true,
      is_loading_issue: true,
      is_loading_issue_building: true,
      is_loading_risk: true,
      is_loading_risk_building: true,
      monitor_data: {
        time_line: [],
        data_list: []
      },
      monitor_building_num: 0,
      alarm_data: {
        time_line: [],
        line_name: [],
        data_list: []
      },
      issue_data: [],
      issue_building_data: [],
      risk_data: [],
      risk_building_data: [],
      colors: {
        '蓝色': 'blue',
        '黄色': 'yellow',
        '橙色': 'orange',
        '红色': 'red',
      }
    }
  },
  watch: {
    select_date: {
      deep: true,
      handler(newV) {
        this.params.start_date = newV[0]
        this.params.end_date = newV[1]
      }
    },
    params: {
      deep: true,
      handler() {
        this.loadAllData()
      }
    }
  },
  mounted() {
    // this.$store.state.is_collapse_aside = true
    this.loadAllData()
  },
  methods: {
    loadAllData() {
      this.loadExceptionMonitorData()
      this.loadExceptionMonitorDataBuilding()
      this.loadAlarmData()
      this.loadIssueData()
      this.loadIssueBuildingData()
      this.loadRiskData()
      this.loadRiskBuildingData()
    },

    async loadExceptionMonitorData() {
      this.is_loading_monitor = true
      let res_data = await getMonitorDataNums(this.params)
      if (res_data['result']) {
        let data = res_data['data']
        this.monitor_data.time_line = data['days']
        this.monitor_data.data_list = data['nums']
      }
      this.is_loading_monitor = false
    },
    async loadExceptionMonitorDataBuilding() {
      this.is_loading_monitor_building = true
      let res_data = await getMonitorDataBuildingNums(this.params)
      if (res_data['result']) {
        this.monitor_building_num = res_data['data']
      }
      this.is_loading_monitor_building = false
    },
    async loadAlarmData() {
      this.is_loading_alarm = true
      let res_data = await getAlarmDataNums(this.params)
      if (res_data['result']) {
        let data = res_data['data']
        this.alarm_data.time_line = data['days']
        this.alarm_data.line_name = ['蓝色告警', '黄色告警', '橙色告警', '红色告警']
        this.alarm_data.data_list = [data['blue'], data['yellow'], data['orange'], data['red']]
      }
      this.is_loading_alarm = false
    },
    async loadIssueData() {
      this.is_loading_issue = true
      let res_data = await getIssueCategoryNums(this.params)
      if (res_data['result']) {
        this.issue_data = res_data['data']
      }
      this.is_loading_issue = false
    },
    async loadIssueBuildingData() {
      this.is_loading_issue_building = true
      let res_data = await getIssueBuildingNums(this.params)
      if (res_data['result']) {
        this.issue_building_data = res_data['data']
      }
      this.is_loading_issue_building = false
    },
    async loadRiskData() {
      this.is_loading_risk = true
      let res_data = await getRiskClassesNums(this.params)
      if (res_data['result']) {
        this.risk_data = res_data['data']
        for (let i = 0; i < this.risk_data.length; i++) {
          this.risk_data[i]['itemStyle'] = {
            color: this.colors[this.risk_data[i]['name']]
          }
        }
      }
      this.is_loading_risk = false
    },
    async loadRiskBuildingData() {
      this.is_loading_risk_building = true
      let res_data = await getRiskBuildingNums(this.params)
      if (res_data['result']) {
        this.risk_building_data = res_data['data']
      }
      this.is_loading_risk_building = false
    },
  }
}
</script>

<style scoped>
#home {
  padding: 8px;
  height: 100%;
  overflow: scroll;
  -ms-overflow-style: none;
}

#home::-webkit-scrollbar {
  display: none;
}

/deep/ .select-box * {
  color: white !important;
}

.content-wrapper {
  position: relative;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.content-panel {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  background: transparent;
}

/*flex布局*/
.dis-flex-center {
  display: flex;
  justify-content: center;
}

.flex1 {
  flex: 1;
}

.dis-col-flex {
  display: flex;
  flex-direction: column;
}

/*文字版统计信息box*/
.text-statistic-box {
  width: 360px;
  height: 100px;
  margin: 10px 20px 20px;
  text-align: center;
  line-height: 48px;
  background: rgba(255, 255, 255, 0.05);
}

h3 {
  text-align: center;
  line-height: 50px;
  position: relative;
  top: 0;
}

/*监测、风险、巡检三图表模块*/
.content-box {
  margin: 0 10px;
  flex: 1;
  box-shadow: 0 2px 4px rgba(0, 0, 0, .12), 0 0 6px rgba(0, 0, 0, .12);
  background: rgba(255, 255, 255, 0.1);
}

.content-box h3 {
  margin-bottom: 8px;
  border-radius: 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.content-box > * {
  margin: 8px 5px;
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/deep/ * {
  background: transparent;
}

/deep/ .el-select-dropdown__item.hover, .el-select-dropdown__item:hover {
  background-color: rgba(255, 255, 255, 0.5);
}

/deep/ el-range-input {
  color: white;
}
</style>
