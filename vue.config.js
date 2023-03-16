const path = require("path");

function resolve(dir) {
    return path.join(__dirname, dir)
}

module.exports = {
    // 配置别名 （webStorm 无法识别）
    // chainWebpack: (config) => {
    //     config.resolve.alias
    //         .set('vue$', 'vue/dist/vue.esm.js',)
    //         .set('@', resolve('./src'))
    // },
    // 配置别名（WebStorm也无法识别）
    // webstorm菜单栏 File | Settings | Languages & Frameworks | JavaScript | Webpack | Manually
    // 设置为 项目目录下 node_modules\@vue\cli-service\webpack.config.js
    // configureWebpack: {
    //     resolve: {
    //         alias: {
    //             '@': resolve('./src')
    //         }
    //     }
    // },
    // 关闭语法检查
    lintOnSave: false,
    // 配置开发环境下的反向代理
    devServer: {
        port: 8081,
        proxy: {
            '/api': {
                target: 'http://10.11.12.239:8081',
                // target: 'http://114.55.106.31:8080',
                // target: 'http://localhost:8080',
                changeOrigin: true,
                // onProxyReq: function (proxyReq, req, res) { // 代理requset事件
                //     console.log('req---->', req)
                //     delete req.headers.host
                // },
                // pathRewrite: {
                //     '/api': '/api'
                // }
            }
        },
        
    }
}