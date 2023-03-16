module.exports = {
    presets: [
        // 配置 element-ui按需引入（还需要npm install @babel/preset-env -D）
        ["@babel/preset-env", {"modules": false}],
        '@vue/cli-plugin-babel/preset'
    ],
    "plugins": [
        [
            "component",
            {
                "libraryName": "element-ui",
                "styleLibraryName": "theme-chalk"
            }
        ]
    ]
}
