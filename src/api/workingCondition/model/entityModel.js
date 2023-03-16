import request from "@/request";

const prefix = '/huashui/WorkingCondition/InspectionModel/'

export function getEntityModel(params) {
  return request({
    url: prefix + 'get_entity_model',
    method: 'get',
    params
  })
}

export function addEntityModel(data) {
  return request({
    url: prefix + 'add_entity_model',
    method: 'post',
    data
  })
}

export function changeEntityStatus(data){
  return request({
    url: prefix + 'activate_entity_model',
    method: 'post',
    data
  })
}

export function editEntityModel(data){
  return request({
    url: prefix + 'edit_entity_model',
    method: 'post',
    data
  })
}

export function deleteEntityModel(data){
  return request({
    url: prefix + 'delete_entity_model',
    method: 'post',
    data
  })
}

export function trainEntityModel(data){
  return request({
    url: prefix + 'train_entity_model',
    method: 'post',
    data
  })
}
