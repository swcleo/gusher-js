import Channel from './Channel'

export default class Channels {
  constructor() {
    this.channels = new Map()
  }

  add(name, gusher) {
    let channel = this.channels.get(name)
    if (!channel) {
      channel = new Channel(name, gusher)
      this.channels.set(name, channel)
    }
    return channel
  }

  find(name) {
    return this.channels.get(name)
  }

  remove(name) {
    let channel = this.channels.get(name)
    this.channels.delete(name)
    return channel
  }

  all() {
    let keys = []
    for (let key of this.channels.keys()) {
      keys.push(key)
    }
    return keys
  }

  disconnect() {
    this.channels.forEach((channel) => channel.disconnect())
  }
}
