import request from "@/request";

const prefix = '/huashui/WorkingCondition/InspectionModel/'

export function getTextModel(type, params) {
  return request({
    url: prefix + 'get_' + type + '_model',
    method: 'get',
    params
  })
}

export function addTextModel(type, data) {
  return request({
    url: prefix + 'add_' + type + '_model',
    method: 'post',
    data
  })
}

export function changeTextStatus(type, data){
  return request({
    url: prefix + 'activate_' + type + '_model',
    method: 'post',
    data
  })
}

export function editTextModel(type, data){
  return request({
    url: prefix + 'edit_' + type + '_model',
    method: 'post',
    data
  })
}

export function deleteTextModel(type, data){
  return request({
    url: prefix + 'delete_' + type + '_model',
    method: 'post',
    data
  })
}

export function trainTextModel(type, data){
  return request({
    url: prefix + 'train_' + type + '_model',
    method: 'post',
    data
  })
}
