import EventEmitter from 'events'
import Log4js from 'log4js-free'
import ConnectionManager from './ConnectionManager'
import Channels from './Channels'

let logger = Log4js.getLogger('Gusher')
logger.setLevel('DEBUG')

export default class Gusher {
  constructor(appKey = '', options = {}) {
    this.key = appKey

    this.options = options

    this.emitter = new EventEmitter()

    this.channels = new Channels()

    this.connection = new ConnectionManager(this.key, this.options)

    this.connection.bind('connected', () => {
      logger.info('Connected')
    })

    this.connection.bind('message', (params) => {
      if (params.channel) {
        let channel = this.channel(params.channel)
        if (channel) {
          channel.handleEvent(params.event, params.data)
        }
      }

      this.emitter.emit(params.event, params.data)
    })

    this.connection.bind('disconnected', () => {
      this.channels.disconnect()
    })

    this.connection.bind('error', (err) => {
      logger.warn('Error', err)
    })
  }

  channel(name) {
    return this.channels.find(name)
  }

  allChannel() {
    return this.channels.all()
  }

  connect() {
    this.connection.connect()
  }

  disconnect() {
    this.connect().disconnect()
  }

  bind(event, callback) {
    this.emitter.on(event, callback)
    return this
  }

  unbind(event, callback) {
    this.emitter.removeListener(event, callback)
    return this
  }

  subscribe(channelName) {
    let channel = this.channels.add(channelName, this)
    if (this.connection.state === 'connected') {
      channel.subscribe()
    }
    return channel
  }

  unsubscribe(channelName) {
    let channel = this.channels.remove(channelName)
    if (channel && this.connection.state === 'connected') {
      channel.unsubscribe()
    }
  }

  send(event, data, channel) {
    this.connection.send(event, data, channel)
  }
}
