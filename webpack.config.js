const path = require('path')

module.exports = {
  entry: './src/Gusher.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'Gusher.js',
    library: 'Gusher',
    libraryTarget: 'umd'
  },
  mode: process.env.NODE_ENV === 'development' ? 'development' : 'production'
}
