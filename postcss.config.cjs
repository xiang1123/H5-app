module.exports = {
  plugins: {
    autoprefixer: {
      overrideBrowserslist: [
        'Android 4.1',
        'iOS 7.1',
        'Chrome > 31',
        'ff > 31',
        'ie >= 8',
        '> 1%',
        'last 2 versions'
      ]
    },
    'postcss-pxtorem': {
      rootValue: 37.5, // Vant 官方根字体大小是 37.5
      propList: ['*'],
      selectorBlackList: ['.norem'], // 过滤掉 .norem 开头的 class
      minPixelValue: 2, // 小于 2px 的不转换
      unitPrecision: 5 // rem 精度
    }
  }
}