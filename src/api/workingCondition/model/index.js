import request from "@/request"

const url_prefix = '/huashui/WorkingCondition/MonitorModel/'

// 请求 传感器模型信息
export function getSensorModelList(params) {
  return request({
    url: url_prefix + 'get_sensor_model_list',
    method: 'get',
    params
  })
}

// 请求 启用/关闭 传感器模型
export function changeModelActivate(data) {
  return request({
    url: url_prefix + 'activate_model',
    method: 'post',
    data
  })
}

// 请求 异常识别模型详细 信息
export function getSensorModelSetting(params) {
  return request({
    url: url_prefix + 'get_sensor_model_setting',
    method: 'get',
    params
  })
}

// 请求 更新关联传感器
export function updateAssociatedSensors(data) {
  return request({
    url: url_prefix + 'edit_associated_sensors',
    method: 'post',
    data
  })
}

// 请求 更新传感器模型参数
export function updateSensorModelSetting(data) {
  return request({
    url: url_prefix + 'edit_sensor_model_setting',
    method: 'post',
    data
  })
}

// 请求 更新传感器模型参数
export function getSensorsValue(params) {
  return request({
    url: url_prefix + 'get_sensors_value',
    method: 'get',
    params,
    paramsSerializer: (params)=>{
      //date_start=2021-12-06&date_end=2021-12-06&
      //sensor_ids[]=1&sensor_ids[]=4&sensor_ids[]=7&sensor_ids[]=8
      let ids=params['sensor_ids'].map(item=> `sensor_ids=${item}`).join('&')
      return `date_start=${params['date_start']}&date_end=${params['date_end']}&${ids}`
    }
  })
}

// 请求 更新传感器模型参数
export function trainSensorModel(data) {
  return request({
    url: url_prefix + 'train_sensor_model',
    method: 'post',
    data,
  })
}
