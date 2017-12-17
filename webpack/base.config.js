const path = require('path')
const webpack = require('webpack')
const WebpackConfig = require('webpack-config')

module.exports = new WebpackConfig.Config().merge({
  context: path.resolve(__dirname, '..', 'src'),

  entry: {
    app: ['./index.js']
  },

  output: {
    path: path.resolve(__dirname, '..', 'build'),
    libraryTarget: 'umd',
    library: 'GusherJS'
  },

  resolve: {
    extensions: ['.js'],
    modules: [
      'node_modules'
    ]
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
    })
  ],

  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
})
