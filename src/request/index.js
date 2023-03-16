import axios from 'axios'
import { Message } from 'element-ui'
import qs from 'qs'

if (process.env["VUE_APP_ENV "] === 'test') {
    console.log(process.env)
} else if (process.env.NODE_ENV === 'production') {
    axios.defaults.crossDomain = true
    axios.defaults.withCredentials = true
    axios.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded'
    //Access-Control-Allow-Origin
    axios.defaults.headers.common['Access-Control-Allow-Origin'] = process.env.VUE_APP_Access_Control_Allow_Origin;
}

const service = axios.create({
    // baseURL: '/api',
    baseURL: process.env.VUE_APP_BASE_API,
    // withCredentials: true,
    timeout: 23000
})
// request 拦截器
// 可以自请求发送前对请求做一些处理
// 比如统一加token，对请求参数统一加密
service.interceptors.request.use(config => {
    config.headers['Content-Type'] = 'application/json;charset=utf-8';
    //只针对get方式进行序列化
    if (config.method === 'get') {
        config.paramsSerializer = function (params) {
            return qs.stringify(params, { arrayFormat: 'repeat' })
        }
    }
    /*  if (store.state.token) {
        config.headers['Oauth-Token'] = getToken()
      }*/
    return config
}, error => {
    return Promise.reject(error)
})

// response 拦截器
// 可以在接口响应后统一处理结果
service.interceptors.response.use(
    response => {

        // 如果是返回的文件（返回response，因为需要获取响应头中的文件名）
        if (response.config.responseType === 'blob') {
            return response
        }
        //全局统一处理 Session超时
        if (response.headers['session_time_out'] === 'timeout') {
            store.dispatch('fedLogOut')
        }

        let res = response.data;
        // 兼容服务端返回的字符串数据
        if (typeof res === 'string') {
            res = res ? JSON.parse(res) : res
        }
        // response.data.result = true，返回 response.data
        if (res.result) {
            return res
            // res.message
        } 
        // else {
        //     Message({
        //         type: 'error',
        //         showClose: true,
        //         message: 'result'
        //     })
        // }
        // 否则进行拦截并报错
        return Promise.reject(res.message)

    },
    // error.toString()
    error => {
        Message({
            type: 'error',
            showClose: true,
            message: '接口出现问题，请检查网络或联系工作人员'
        })
        return Promise.reject('error')
    })

export default service
