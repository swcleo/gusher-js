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

    this.reconnectionDelay = options.reconnectionDelay || 3000

    this.skipReconnect = false

    this.retryNum = 0

    this.connectionStartTimestamp = 0

    this.retryTimer = null

    this.connection = new Connection(this.options)

    this.connection.bind('open', () => {
      this.connectionStartTimestamp = Date.now()

      if (this.retryTimer) {
        clearTimeout(this.retryTimer)
        this.retryNum = 0
        this.retryTimer = null
      }

      this.skipReconnect = false

      if (this.options && this.options.token) {
        this.send('gusher.login', {
          jwt: this.options.token
        })
      }

      this.updateState('connected')
    })

    this.connection.bind('message', (message) => {
      this.emitter.emit('message', message)
    })

    this.connection.bind('error', (err) => {
      this.updateState('error', err)
    })

    this.connection.bind('closed', (evt) => {
      const sessionTime = Date.now() - this.connectionStartTimestamp

      if (sessionTime > 0 && this.connectionStartTimestamp !== 0) {
        this.emitter.emit('@closed', Object.assign({}, evt, { session_time: sessionTime }))
        Logger.debug(`Session Time: ${sessionTime} ms`)
        this.connectionStartTimestamp = 0
      }

      this.updateState('closed', evt)
      this.retryIn(this.reconnectionDelay)
    })
  }

  retryIn(delay = 0) {
    if (this.reconnection && !this.skipReconnect) {
      this.retryTimer = setTimeout(() => {
        this.retryNum++
        Logger.debug('Reconnect attempts: ', this.retryNum)
        this.connect()
        this.emitter.emit('retry')
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
