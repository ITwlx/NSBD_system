import request from '@/request'

// 获取工程信息中的监测信息
// 该js文件中所有请求的url前缀
const url_prefix = '/huashui/WorkingCondition/judge'

// 监测数据异常研判数据统计
export function getMonitorDataNums(params) {
  return request({
    url: url_prefix + '/monitor',
    method: 'get',
    params
  })
}

// 统计具有异常监测数据的建筑物数量
export function getMonitorDataBuildingNums(params) {
  return request({
    url: url_prefix + '/monitor-building',
    method: 'get',
    params
  })
}

// 监测数据告警研判数据统计
export function getAlarmDataNums(params) {
  return request({
    url: url_prefix + '/alarm',
    method: 'get',
    params
  })
}

// 巡检数据研判数据统计
export function getIssueCategoryNums(params) {
  return request({
    url: url_prefix + '/issue',
    method: 'get',
    params
  })
}

// 有巡检问题的建筑物数据统计
export function getIssueBuildingNums(params) {
  return request({
    url: url_prefix + '/issue-building',
    method: 'get',
    params
  })
}

// 安全评价服务告警类型数据统计
export function getRiskClassesNums(params) {
  return request({
    url: url_prefix + '/risk',
    method: 'get',
    params
  })
}

// 安全评价服务告警建筑物数据统计
export function getRiskBuildingNums(params) {
  return request({
    url: url_prefix + '/risk-building',
    method: 'get',
    params
  })
}
