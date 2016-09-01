import EventEmitter from 'events'

export default class Channel {
  constructor(name, gusher) {
    this.name = name
    this.gusher = gusher
    this.subscribed = false
    this.emitter = new EventEmitter()
  }

  trigger(event, data) {
    return this.gusher.send(event, data, this.name)
  }

  disconnect() {
    this.subscribed = true
  }

  bind(event, callback) {
    this.emitter.on(event, callback)
    return this
  }

  unbind(event, callback) {
    this.emitter.removeListener(event, callback)
    return this
  }

  handleEvent(event, data) {
    if (event === "subscribe_succeeded") {
      this.subscribed = true;
    }

    this.emitter.emit(event, data)
  }

  subscribe() {
    this.gusher.send('gusher.subscribe', { id: 'todo', channel: this.name })
  }

  unsubscribe() {
    this.gusher.send('gusher.unsubscribe', { id: 'todo', channel: this.name })
  }
}
