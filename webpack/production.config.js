import webpack from 'webpack'
import Config from 'webpack-config'

export default new Config().extend('webpack/base.config.js').merge({
  devtool: 'cheap-source-map',
  output: {
    library: 'Gusher',
    libraryTarget: 'umd'
  },
  plugins: [
    new webpack.optimize.OccurrenceOrderPlugin(true),
    new webpack.optimize.UglifyJsPlugin({
        mangle: true,
        output: {
            comments: false
        },
        compress: {
            warnings: false
        }
    })
  ]
})
