import Channel from "./channel";

export default class Channels implements IChannels {
  channels: Map<string, IChannel>;

  constructor() {
    this.channels = new Map();
  }

  add(name: string, gusher: IGusher): IChannel {
    let channel = this.channels.get(name);
    if (!channel) {
      channel = new Channel(name, gusher);
      this.channels.set(name, channel);
    }
    return channel;
  }

  all() {
    const keys: string[] = [];

    this.channels.forEach((_: IChannel, name: string) => {
      keys.push(name);
    });

    return keys;
  }

  find(name: string): IChannel | undefined {
    return this.channels.get(name);
  }

  remove(name: string): IChannel | undefined {
    const channel = this.channels.get(name)
    this.channels.delete(name)
    return channel
  }

  disconnect() {
    this.channels.forEach(channel => channel.disconnect());
  }
}
