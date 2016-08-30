let path = require('path')
let express = require('express')

let app = express()

app.use(express.static(__dirname))
app.use(express.static(path.resolve(__dirname, '../dist')))

app.post('/auth', (req, res) => {
  res.send(JSON.stringify({
    user_id: 'gusher',
    channels: [ 'AM', 'FM' ]
  }))
})

app.listen(3000, () => {
  console.log('Example app listening on port 3000!')
})
