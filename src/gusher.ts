import { EventEmitter } from "events";
import chunk from "lodash.chunk";
import Channel from "./channel";
import Channels from "./channels";
import ConnectionManager from "./connection-manager";
import { Message } from "./connection";
import Logger from "./logger";

export interface GusherOptions {
  url: string;
  token: string;
  reconnection?: boolean;
  reconnectionDelay?: number;
  retryMax?: number;
}

export default class Gusher {
  key: string;
  options: GusherOptions;
  emitter: EventEmitter;
  channels: Channels;
  connection: ConnectionManager;

  constructor(appKey = "", options: GusherOptions) {
    this.key = appKey;

    this.options = options;

    this.emitter = new EventEmitter();

    this.channels = new Channels();

    this.connection = this.createConnection();
  }

  unsubscribe(channelName: string) {
    const channel = this.channels.remove(channelName);
    if (channel && this.connection.state === "connected") {
      channel.unsubscribe();
    }
  }

  getAuthToken() {
    return this.options.token || "";
  }

  setAuthToken(token: string) {
    if (!token) {
      return;
    }

    this.options.token = token;
    this.connection.unBindAll();
    this.connection.disconnect();
    this.connection = this.createConnection();
  }

  createConnection(): ConnectionManager {
    const connection = new ConnectionManager(this.key, this.options);

    connection.bind("connected", () => {
      this.subscribeAll();
      this.emitter.emit("connected");
    });

    connection.bind("message", (params: Message) => {
      if (!params) {
        return;
      }

      if (params.channel) {
        const channel = this.channels.find(params.channel);

        if (channel) {
          channel.handleEvent(params.event, params.data);
        }
      }

      if (
        params.data &&
        params.data.channel &&
        Array.isArray(params.data.channel)
      ) {
        params.data.channel.forEach((ch: string) => {
          const channel = this.channels.find(ch);

          if (channel) {
            channel.handleEvent(params.event, params.data);
          }
        });
      }

      this.emitter.emit(params.event, params.data);

      this.emitter.emit("*", params);
    });

    connection.bind("disconnected", () => {
      this.channels.disconnect();
      this.emitter.emit("disconnected");
    });

    connection.bind("retry", (evt: Event) => {
      this.emitter.emit("retry", evt);
    });

    connection.bind("retryMax", () => {
      this.emitter.emit("retryMax");
    });

    connection.bind("@closed", (evt: Event) => {
      this.emitter.emit("@closed", evt);
    });

    connection.bind("closed", (evt: Event) => {
      this.emitter.emit("closed", evt);
    });

    connection.bind("error", (err: Event) => {
      Logger.log("Error", err);
      this.emitter.emit("error", err);
    });

    return connection;
  }

  channel(name: string): Channel | undefined {
    return this.channels.find(name);
  }

  allChannel() {
    return this.channels.all();
  }

  connect() {
    this.connection.connect();
  }

  disconnect() {
    this.connection.disconnect();
  }

  bind(event: string, callback: any): Gusher {
    this.emitter.on(event, callback);
    return this;
  }

  unbind(event: string, callback: any): Gusher {
    this.emitter.removeListener(event, callback);
    return this;
  }

  subscribe(channelName: string): Channel {
    const channel = this.channels.add(channelName, this);
    if (this.connection.state === "connected") {
      channel.subscribe();
    }
    return channel;
  }

  subscribes(channels: string[]) {
    const returnValues: { [key: string]: Channel } = {};

    if (!Array.isArray(channels)) {
      return returnValues;
    }

    channels.forEach((channelName: string) => {
      returnValues[channelName] = this.channels.add(channelName, this);
    });

    if (this.connection.state === "connected") {
      this.subscribeAll(channels);
    }

    return returnValues;
  }

  subscribeAll(channels?: string[]) {
    const multiChannel = channels || this.channels.all();

    chunk(multiChannel, 10).forEach((group: string[]) => {
      this.send("gusher.multi_subscribe", { multi_channel: group });
    });
  }

  send(event: string, data: any, channel?: string | undefined): void {
    this.connection.send(event, data, channel);
  }
}
