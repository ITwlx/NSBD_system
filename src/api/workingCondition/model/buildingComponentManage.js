import request from "@/request"

const url_prefix = '/huashui/WorkingCondition/bindBuilding/'

//获取管理处列表
export function getOfficeList(params) {
    return request({
        url: url_prefix + 'office',
        method: 'get',
        params
    })
}

// 获取某个管理处下的建筑物列表
export function getBuildingByOfficeId(params) {
    return request({
        url: url_prefix + 'building',
        method: 'get',
        params
    })
}

// 分页获取某个管理处下的建筑物组件（is_bound:是否获取已经绑定过的）
export function getPageComponentByOfficeAndBounded(params) {
    return request({
        url: url_prefix + 'component',
        method: 'get',
        params
    })
}

// 将组件批量绑定到某个建筑物上
export function postBindBuilding(data) {
    return request({
        url: url_prefix + 'bind_building',
        method: 'post',
        data
    })
}
