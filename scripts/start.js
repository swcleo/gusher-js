const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const rimraf = require('rimraf')
const webpackConfig = require('../webpack.config')

const compiler = webpack(webpackConfig)

rimraf.sync('build/*')

const server = new WebpackDevServer(compiler, {
  hot: true,
  publicPath: webpackConfig.output.publicPath,
  quiet: false,
  stats: {
    children: false,
    colors: true
  },
  historyApiFallback: true,
  watchOptions: {
    ignored: /node_modules/
  },
})

server.listen(3100)
