import EventEmitter from 'events'
import Connection from './Connection'

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

    this.connection = new Connection(this.options)

    this.connection.bind('message', (message) => {
      this.emitter.emit('message', message)
    })

    this.connection.bind('error', (err) => {
      this.emitter.emit('error', {
        type: 'WebSocketError',
        error: err
      })
    })

    this.connect()
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
    this.connection.close()
    this.updateState('disconnected')
  }

  updateState(newState, data) {
    let previousState = this.state
    this.state = newState
    if (previousState !== newState) {
      this.emitter.emit('state_change', {
        previous: previousState,
        current: newState
      })
      this.emitter.emit(newState, data)
    }
  }

}
