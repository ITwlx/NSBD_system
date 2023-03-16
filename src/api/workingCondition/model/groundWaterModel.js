import request from "@/request"

const url_prefix = '/huashui/WorkingCondition/GroundwaterModel/'

//根据建筑物id获取其下传感器数目
export function getGroundwaterSensorNumByBuildingId(params) {
    return request({
        url: url_prefix + 'model_count',
        method: 'get',
        params
    })
}

// 请求 该建筑物下的传感器模型信息
export function getSensorModelList(params) {
    return request({
        url: url_prefix + 'sensor_model_list',
        method: 'get',
        params
    })
}

// 请求 可关联传感器列表
export function getAssociatedSensorsByBuildingId(params) {
    return request({
        url: url_prefix + 'waterLevel',
        method: 'get',
        params
    })
}

// 请求 传感器指定时间段间的监测数据
export function getSensorsValue(params) {
    return request({
        url: url_prefix + 'value',
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

// 请求 更新关联传感器
export function updateAssociatedSensors(data) {
    return request({
        url: url_prefix + 'association',
        method: 'post',
        data
    })
}

// 请求 模型详细信息
export function getSensorModelSetting(params) {
    return request({
        url: url_prefix + 'setting',
        method: 'get',
        params
    })
}

// 请求 更新传感器模型参数
export function trainSensorModel(data) {
    return request({
        url: url_prefix + 'training',
        method: 'post',
        data,
    })
}

// 请求 启用/关闭 传感器模型
export function changeModelActivate(data) {
    return request({
        url: url_prefix + 'activation',
        method: 'post',
        data
    })
}
