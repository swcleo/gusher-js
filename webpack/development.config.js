const webpack = require('webpack')
const WebPackConfig = require('webpack-config')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const BrowserSyncPlugin = require('browser-sync-webpack-plugin')
const browserSyncConfig =  require('./browser-sync.config')

module.exports = new WebPackConfig.Config().extend('webpack/base.config.js').merge({
  devtool: '#cheap-module-eval-source-map',
  entry: {
    'webpack-dev-server-client': [require.resolve('webpack-dev-server/client') + '?/', require.resolve('webpack/hot/dev-server')]
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new HtmlWebpackPlugin({
      hash: true
    }),
    new BrowserSyncPlugin(
      browserSyncConfig,
      {
        reload: false
      }
    )
  ]
})
