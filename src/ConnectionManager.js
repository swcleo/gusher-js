import EventEmitter from 'events'
import Connection from './Connection'
import Logger from './Logger'

/**
 * ConnectionManager states:
 *  initialized
 *  connecting
 *  connected
 *  disconnected
 *  failed
 */
export default class ConnectionManager {
  constructor(key = '', options = {}) {
    this.key = key

    this.options = options

    this.state = 'initialized'

    this.emitter = new EventEmitter()

    this.reconnection = options.reconnection || true

    this.reconnectionDelay = options.reconnectionDelay || 1000

    this.skipReconnect = false

    this.retryNum = 0

    this.retryTimer = null

    this.connection = new Connection(this.options)

    this.connection.bind('open', () => {
      if (this.retryTimer) {
        clearTimeout(this.retryTimer)
        this.retryNum = 0
        this.retryTimer = null
      }
      this.skipReconnect = false
      this.updateState('connected')
    })

    this.connection.bind('message', (message) => {
      this.emitter.emit('message', message)
    })

    this.connection.bind('error', (err) => {
      this.updateState('error', err)
    })

    this.connection.bind('closed', (evt) => {
      this.updateState('closed', evt)
      this.retryIn(this.reconnectionDelay)
    })

    this.connect()
  }

  retryIn(delay = 0) {
    if (this.reconnection && !this.skipReconnect) {
      this.retryTimer = setTimeout(() => {
        this.retryNum++
        Logger.debug('Reconnect attempts: ', this.retryNum)
        this.connect()
        this.retryTimer = null
      }, delay)
    }
  }

  bind(event, callback) {
    this.emitter.on(event, callback)
    return this
  }

  unbind(event, callback) {
    this.emitter.removeListener(event, callback)
    return this
  }

  connect() {
    this.updateState('connecting')
    this.connection.connect()
  }

  disconnect() {
    this.skipReconnect = true
    this.connection.close()
    this.updateState('disconnected')
  }

  updateState(newState, data) {
    let previousState = this.state
    this.state = newState
    if (previousState !== newState) {
      Logger.debug('State changed', previousState + ' -> ' + newState)
      this.emitter.emit('state_change', {
        previous: previousState,
        current: newState
      })
      this.emitter.emit(newState, data)
    }
  }

  send(event, data, channel) {
    if (this.connection) {
      return this.connection.send(event, data, channel)
    } else {
      return false
    }
  }

}
