import EventEmitter from 'events'
import ConnectionManager from './ConnectionManager'
import Channels from './Channels'
import Logger from './Logger'

export default class Gusher {
  constructor(appKey = '', options = {}) {
    this.key = appKey

    this.options = options

    if (!this.options.token) {
      throw new Error('Authenticate Error: JWT(JSON Web Token) is not defined')
    }

    if (options.level) {
      Logger.setLevel(options.level)
    }

    this.emitter = new EventEmitter()

    this.channels = new Channels()

    this.connection = new ConnectionManager(this.key, this.options)

    this.connection.bind('connected', () => {
      this.subscribeAll()
      this.emitter.emit('connected')
    })

    this.connection.bind('message', (params) => {
      if (params.channel) {
        let channel = this.channel(params.channel)
        if (channel) {
          channel.handleEvent(params.event, params.data)
        }
      }

      this.emitter.emit(params.event, params.data)

      this.emitter.emit('*', params)
    })

    this.connection.bind('disconnected', () => {
      this.channels.disconnect()
      this.emitter.emit('disconnected')
    })

    this.connection.bind('retry', (evt) => {
      this.emitter.emit('retry', evt)
    })

    this.connection.bind('retryMax', () => {
      this.emitter.emit('retryMax')
    })

    // session close event
    this.connection.bind('@closed', (evt) => {
      this.emitter.emit('@closed', evt)
    })

    this.connection.bind('closed', (evt) => {
      this.emitter.emit('closed', evt)
    })

    this.connection.bind('error', (err) => {
      Logger.error('Error', err)
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
    this.connection.disconnect()
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

  subscribeAll() {
    this.channels.channels.forEach((_, channelName) => {
      this.subscribe(channelName)
    })
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
