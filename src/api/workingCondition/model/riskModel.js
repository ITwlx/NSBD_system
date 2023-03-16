import request from "@/request"

const prefix = '/huashui/WorkingCondition/RiskModel/'

export function getResultList(params) {
  return request({
    url: prefix + 'get_result_list',
    method: 'get',
    params
  })
}

export function changeTriad(data) {
  return request({
    url: prefix + 'change_triad',
    method: 'post',
    data
  })
}

export function deleteAnomalyEvent(data) {
  return request({
    url: prefix + 'delete_anomaly_event',
    method: 'post',
    data
  })
}

export function getRuleModels(params) {
  return request({
    url: prefix + 'get_rule_models',
    method: 'get',
    params
  })
}

export function activateRiskModel(data) {
  return request({
    url: prefix + 'activate_model',
    method: 'post',
    data
  })
}

export function trainRiskModel(data) {
  return request({
    url: prefix + 'train_model',
    method: 'post',
    data
  })
}
