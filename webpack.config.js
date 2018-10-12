const path = require('path')

module.exports = {
  entry: './src/Gusher.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'Gusher.js',
    library: 'Gusher',
    libraryTarget: 'umd'
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: {
        loader: 'babel-loader',
      }
    }]
  },
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production'
}
