import Gusher from './lib/Gusher'

const gusher = new Gusher('test', {
  url: 'ws://www.vir999.com/gsc/ws/rd2',
  token: 'cce9cbe9-b421-411b-815f-b03056d774b1',
  level: 'DEBUG'
})

gusher.connect()
