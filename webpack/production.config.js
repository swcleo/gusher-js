const WebPackConfig = require('webpack-config')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

module.exports = new WebPackConfig.Config().extend('webpack/base.config.js').merge({
  devtool: '#source-map',
  plugins: [
    new UglifyJsPlugin()
  ]
})
