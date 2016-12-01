import EventEmitter from 'events'
import Logger from './Logger'

/**
 * state:
 *  connecting
 *  open
 *  closing
 *  closed
 */
export default class Connection {
  constructor(options = {}) {
    this.options = options || {}
    this.url = options.url || ''
    this.state = 'initialized'
    this.emitter = new EventEmitter()
  }

  bind(event, callback) {
    this.emitter.on(event, callback)
    return this
  }

  unbind(event, callback) {
    this.emitter.removeListener(event, callback)
    return this
  }

  connect(token) {
    if (this.socket || !token) {
      return false
    }

    try {
      this.socket = new WebSocket(`${this.url}?token=${token}`)
    } catch (e) {
      return false
    }

    this.bindListeners()

    Logger.debug('Connecting', { url: this.url, token })

    this.changeState('connecting')
    return true
  }

  close() {
    if (this.socket) {
      this.socket.close()
      return true
    }

    return false
  }

  changeState(state, params) {
    this.state = state
    this.emitter.emit(state, params)
  }

  bindListeners() {
    this.socket.onopen = () => {
      this.onOpen()
    }

    this.socket.onerror = (error) => {
      this.onError(error)
    }

    this.socket.onclose = (closeEvent) => {
      this.onClose(closeEvent)
    }

    this.socket.onmessage = (message) => {
      this.onMessage(message)
    }
  }

  unbindListeners() {
    if (this.socket) {
      this.socket.onopen = null
      this.socket.onerror = null
      this.socket.onclose = null
      this.socket.onmessage = null
    }
  }

  onOpen() {
    this.changeState('open')
    this.socket.onopen = null
  }

  onError(error) {
    this.emitter.emit('error', error)
  }

  onClose(closeEvent) {
    if (closeEvent) {
      this.changeState('closed', {
        code: closeEvent.code,
        reason: closeEvent.reason,
        wasClean: closeEvent.wasClean
      })
    } else {
      this.changeState('closed')
    }

    this.unbindListeners()

    this.socket = null
  }

  onMessage(event) {
    let message
    try {
      message = JSON.parse(event.data)
    } catch (e) {
      Logger.error({ error: e })
      this.emitter('error', { error: e })
      return
    }

    if (message) {
      Logger.debug('Event recd', message)
      this.emitter.emit('message', message)
    }
  }

  send(event, data, channel) {
    let message = { event, data }

    if (this.channel) {
      message.channel = channel
    }

    Logger.debug('Event sent', message)

    this.socket.send(JSON.stringify(message))
  }
}
