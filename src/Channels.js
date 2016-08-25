import Channel from './Channel'

export default class Channels {
  constructor() {
    this.map = new Map()
  }

  add(name, gusher) {
    let channel = this.map.get(name)
    if (!channel) {
      channel = new Channel(name, gusher)
      this.map.set(name, channel)
    }
    return channel
  }

  find(name) {
    return this.map.get(name)
  }

  remove(name) {
    let channel = this.map.get(name)
    this.map.delete(name)
    return channel
  }

  all() {
    let keys = []
    for (let key of this.map.keys()) {
      keys.push(key)
    }
    return keys
  }

  disconnect() {
    this.map.forEach((channel) => channel.disconnect())
  }
}
