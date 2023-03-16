import request from '@/request'

// 获取工程信息 巡检
const url_prefix = '/huashui/WorkingCondition/inspection/'

//获取巡检信息列表
export function getInspectionData(params) {
  return request({
    url: url_prefix,
    method: 'get',
    params
  })
}

//批量删除巡检信息
export function deleteInspections(data) {
  return request({
    url: url_prefix + 'delete',
    method: 'post',
    data
  })
}

//研判工情信息
export function analyzeInspections(data) {
  return request({
    url: url_prefix + 'analyze',
    method: 'post',
    data
  })
}

// 提交工情信息
export function postInspection(data) {
  return request({
    url: url_prefix + 'add',
    method: 'post',
    data
  })
}

//审批/修改 工情信息
export function auditInspection(data) {
  return request({
    url: url_prefix + 'edit',
    method: 'post',
    data
  })
}

// 导出工情信息
export function exportInspection(params){
  return request({
    url: url_prefix + 'export',
    method: 'get',
    params,
    responseType: 'blob'
  })
}

//获取问题类别
export function getIssueCategory(){
  return request({
    url: url_prefix + 'category',
    method: 'get',
  })
}

// 巡检LEVEL模型训练
export function trainLEVEL(data){
  return request({
    url:url_prefix + 'trainlevel',
    method:'post',
    data
  })
}

// 巡检category模型训练
export function trainCategory(data){
  return request({
    url:url_prefix + 'traincategory',
    method:'post',
    data
  })
}

// 巡检NER模型训练
export function trainNER(data){
  return request({
    url:url_prefix + 'trainNER',
    method:'post',
    data
  })
}

// 查询模型训练结果 huashui/WorkingCondition/inspection/getCategoryResult
export function CategoryTrainResult(){
  return request({
    url:url_prefix + 'getCategoryResult',
    method:'get',
    
  })
}

// 查询模型训练结果 huashui/WorkingCondition/inspection/getNerResult
export function NerTrainResult(){
  return request({
    url:url_prefix + 'getNerResult',
    method:'get',
    
  })
}

// 查询模型训练结果 huashui/WorkingCondition/inspection/getLevelResult
export function LevelTrainResult(){
  return request({
    url:url_prefix + 'getLevelResult',
    method:'get',
  })
}