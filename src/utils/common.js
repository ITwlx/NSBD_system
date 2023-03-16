/**
 * @desc 函数防抖
 * @param fn 函数
 * @param wait 延迟执行毫秒数
 * @param immediate true 表立即执行，false 表非立即执行
 */
let timer // 放在外面，防止重复渲染时导致的缓存失效
export function debounce(fn, wait, immediate= false){
    // let timer = null
    return function () {
        let context = this
        let args = arguments
        // timer 只要没有被指定为 null 或 NaN，那么就会为true
        if (timer) {
            clearTimeout(timer)
        }
        if (immediate){
            const call_now = !timer

            timer = setTimeout(() => {
                timer = null
            }, wait)

            if (call_now){
                console.log('call now', args)
                fn.apply(context, args)
            }
        }else {
            timer = setTimeout(() => {
                console.log('call wait', args[0])
                fn.apply(context, args)
            }, wait)
        }
    }
}

/**
 * @param {Function} fn 目标函数
 * @param {Number} time 延迟执行毫秒数
 * @param {Boolean} immediate true-立即执行，false-不立即执行
 * @description 节流函数
 */
let timeout
function throttle(fn, time, immediate) {
    let previous = 0
    return function() {
        let that = this
        let args = arguments
        if (immediate) {
            let now = Date.now()

            if (now - previous > time) {
                fn.apply(that, args)
                previous = now
            }
        } else if (immediate) {
            if (!timeout) {
                timeout = setTimeout(() => {
                    timeout = null
                    fn.apply(that, args)
                }, time)
            }
        }
    }
}
