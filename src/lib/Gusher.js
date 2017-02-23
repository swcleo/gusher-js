import EventEmitter from 'events'
import ConnectionManager from './ConnectionManager'
import Channels from './Channels'
import Logger from './Logger'

export default class Gusher {
  constructor(appKey = '', options = {}) {
    this.key = appKey

    this.options = options

    if (options.level) {
      Logger.setLevel(options.level)
    }

    this.emitter = new EventEmitter()

    this.channels = new Channels()

    this.connection = this.createConnection()
  }

  getAuthToken() {
    return this.options.token || ''
  }

  setAuthToken(token) {
    if (!token) {
      return
    }

    this.options.token = token
    this.connection.unBindAll()
    this.connection.disconnect()
    this.connection = new ConnectionManager(this.key, this.options)
    this.connection.connect()
  }

  createConnection() {
    const connection = new ConnectionManager(this.key, this.options)

    connection.bind('connected', () => {
      this.subscribeAll()
      this.emitter.emit('connected')
    })

    connection.bind('message', (params) => {
      if (params.channel) {
        const channel = this.channel(params.channel)
        if (channel) {
          channel.handleEvent(params.event, params.data)
        }
      }

      this.emitter.emit(params.event, params.data)

      this.emitter.emit('*', params)
    })

    connection.bind('disconnected', () => {
      this.channels.disconnect()
      this.emitter.emit('disconnected')
    })

    connection.bind('retry', (evt) => {
      this.emitter.emit('retry', evt)
    })

    connection.bind('retryMax', () => {
      this.emitter.emit('retryMax')
    })

    // session close event
    connection.bind('@closed', (evt) => {
      this.emitter.emit('@closed', evt)
    })

    connection.bind('closed', (evt) => {
      this.emitter.emit('closed', evt)
    })

    connection.bind('error', (err) => {
      Logger.error('Error', err)
    })

    return connection
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
    const channel = this.channels.add(channelName, this)
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
    const channel = this.channels.remove(channelName)
    if (channel && this.connection.state === 'connected') {
      channel.unsubscribe()
    }
  }

  send(event, data, channel) {
    this.connection.send(event, data, channel)
  }
}
