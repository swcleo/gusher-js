module.exports = {
  host: 'localhost',
  port: 4000,
  open: false,
  proxy: {
    target: 'http://127.0.0.1:3100/',
    ws: true
  },
  plugins: [
    {
      module: 'bs-html-injector',
      options: {
        files: ['src/**/*.pug']
      }
    }
  ]
}
