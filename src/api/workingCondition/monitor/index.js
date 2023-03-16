import request from '@/request'

// 获取工程信息中的监测信息
// 该js文件中所有请求的url前缀
const url_prefix = '/huashui/WorkingCondition/MonitoringInformation/'

// 获取监测信息（分页查询）
export function getMonitorInfo(params) {
  return request({
    url: url_prefix + 'findAllInformation',
    method: 'get',
    params
  })
}

// 删除监测信息
export function deleteInformation(data) {
  return request({
    url: url_prefix + 'deleteInformation',
    method: 'post',
    data,
  })
}

// 添加监测信息
export function postInformation(data) {
  return request({
    url: url_prefix,
    method: 'post',
    data,
  })
}

// 获取监测信息的详细数据
export function getInfoDetail(params) {
  return request({
    url: url_prefix + 'informationDetail',
    method: 'get',
    params
  })
}

// 获取某个传感器的监测值
export function analysisGraph(params) {
  return request({
    url: url_prefix + 'analysisGraph',
    method: 'get',
    params
  })
}

// 审批监测信息

// 导出监测信息
export function exportInformation(params) {
  return request({
    url: url_prefix + 'export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
