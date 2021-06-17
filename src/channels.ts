import { Gusher } from "./gusher";
import { Channel } from "./channel";

export class Channels {
  channels: Map<string, Channel>;

  constructor() {
    this.channels = new Map();
  }

  add(name: string, gusher: Gusher): Channel {
    let channel = this.channels.get(name);
    if (!channel) {
      channel = new Channel(name, gusher);
      this.channels.set(name, channel);
    }
    return channel;
  }

  all(): string[] {
    const keys: string[] = [];

    this.channels.forEach((_: Channel, name: string) => {
      keys.push(name);
    });

    return keys;
  }

  find(name: string): Channel | undefined {
    return this.channels.get(name);
  }

  remove(name: string): Channel | undefined {
    const channel = this.channels.get(name);
    this.channels.delete(name);
    return channel;
  }

  disconnect(): void {
    this.channels.forEach((channel: Channel) => channel.disconnect());
  }
}
