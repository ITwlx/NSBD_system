import request from '@/request'

const url_prefix = '/huashui/WorkingCondition/risk/'

// 请求 风险列表信息
export function getRiskInfo(params) {
  return request({
    url: url_prefix + '',
    method: 'get',
    params
  })
}

// 删除风险信息
export function deleteRiskInfo(data) {
  return request({
    url: url_prefix + 'delete',
    method: 'post',
    data
  })
}

//查询风险事件详情
export function checkHandle(params) {
  return request({
    url: url_prefix + 'check_handle',
    method: 'get',
    params
  })
}

//查看处置情况
export function checkHandleStatus(params){
  return request({
    url: url_prefix + 'check_handle_status',
    method: 'get',
    params
  })
}

// 新增处置情况
export function addHandleDetail(data){
  return request({
    url: url_prefix+'add_handle_detail',
    method: 'post',
    data
  })
}

// 编辑处置情况
export function editHandleDetail(data){
  return request({
    url: url_prefix+'edit_handle_detail',
    method: 'post',
    data
  })
}

// 编辑处置情况
export function deleteHandleDetail(data){
  return request({
    url: url_prefix+'delete_handle_detail',
    method: 'post',
    data
  })
}

// 导出工情信息
export function exportRisk(params){
  return request({
    url: url_prefix + 'export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}
