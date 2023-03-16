import request from '@/request'

// 获取工程信息
const url_prefix = '/huashui/WorkingCondition/'

// 获取所有管理处（数据会被保存在store中）
export function getAllOffice() {
    return request({
        url: url_prefix + 'getAllOffice',
        method: 'get'
    })
}

//根据管理处id获取其下的建筑物列表
export function getAllBuilding(params) {
    return request({
        url: url_prefix + 'getAllBuilding',
        method: 'get',
        params
    })
}

//根据建筑物id获取其下监测数据记录数（异常数和总数）
export function getBuildingDataNums(params) {
    return request({
        url: url_prefix + 'getBuildingDataNums',
        method: 'get',
        params,
        timeout: 35000
    })
}

//根据建筑物id获取其下传感器数目
export function getSensorNumByBuildingId(params) {
    return request({
        url: url_prefix + 'getBuildingSensorNums',
        method: 'get',
        params
    })
}

//获取某个断面的全部传感器列表
export function getAllSensors(params) {
    return request({
        url: url_prefix + 'sensors',
        method: 'get',
        params
    })
}
