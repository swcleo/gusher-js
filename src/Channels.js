/* eslint no-restricted-syntax: 0 */
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
    const channel = this.channels.get(name)
    this.channels.delete(name)
    return channel
  }

  all() {
    const keys = []

    this.channels.forEach((channel, name) => {
      keys.push(name)
    })

    return keys
  }

  disconnect() {
    this.channels.forEach(channel => channel.disconnect())
  }
}
