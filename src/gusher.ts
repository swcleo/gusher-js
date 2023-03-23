import { EventEmitter } from "events";
import chunk from "lodash.chunk";
import { Channel, IChannel } from "./channel";
import { Channels } from "./channels";
import {
  ConnectionManager,
  EmitterEvent as ConnectionManagerEvent,
} from "./connection-manager";
import { Connection, Message } from "./connection";
import { Action } from "./system";
import Logger from "./logger";

export type Listener = (...args: any[]) => void;

export enum GusherEvent {
  ALL = "*",
  CONNECTED = "connected",
  DISCONNECTED = "disconnected",
  RETRY = "retry",
  RETRYMAX = "retryMax",
  CLOSED = "closed",
  ATCLOASED = "@closed",
  ERROR = "error",
}

export interface GusherOptions {
  url: string;
  token: string;
  reconnection?: boolean;
  reconnectionDelay?: number;
  retryMax?: number;
  binary?: boolean;
}

export class Gusher {
  static Event = GusherEvent;
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

  unsubscribe(channelName: string): void {
    const channel = this.channels.remove(channelName);
    if (channel && this.connection.state === "connected") {
      channel.unsubscribe();
    }
  }

  getAuthToken(): string {
    return this.options.token || "";
  }

  setAuthToken(token: string): void {
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

    connection.bind(ConnectionManagerEvent.CONNECTED, () => {
      this.subscribeAll();
      this.emitter.emit(GusherEvent.CONNECTED);
    });

    connection.bind(ConnectionManagerEvent.MSG, (params: Message) => {
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

      this.emitter.emit(GusherEvent.ALL, params);
    });

    connection.bind(ConnectionManagerEvent.DISCONNECTED, () => {
      this.channels.disconnect();
      this.emitter.emit(GusherEvent.DISCONNECTED);
    });

    connection.bind(ConnectionManagerEvent.RETRY, (evt: Event) => {
      this.emitter.emit(GusherEvent.RETRY, evt);
    });

    connection.bind(ConnectionManagerEvent.RETRYMAX, () => {
      this.emitter.emit(GusherEvent.RETRYMAX);
    });

    connection.bind(ConnectionManagerEvent.ATCLOSED, (evt: Event) => {
      this.emitter.emit(GusherEvent.ATCLOASED, evt);
    });

    connection.bind(ConnectionManagerEvent.CLOSED, (evt: Event) => {
      this.emitter.emit(GusherEvent.CLOSED, evt);
    });

    connection.bind(ConnectionManagerEvent.ERROR, (err: Event) => {
      Logger.log("Error", err);
      this.emitter.emit(GusherEvent.ERROR, err);
    });

    return connection;
  }

  channel(name: string): Channel | undefined {
    return this.channels.find(name);
  }

  allChannel(): string[] {
    return this.channels.all();
  }

  connect(): void {
    this.connection.connect();
  }

  disconnect(): void {
    this.connection.disconnect();
  }

  bind<T extends string>(event: T, callback: Listener): Gusher {
    this.emitter.on(event, callback);
    return this;
  }

  unbind<T extends string>(event: T, callback: Listener): Gusher {
    this.emitter.removeListener(event, callback);
    return this;
  }

  subscribe(channelName: string): IChannel {
    const channel = this.channels.add(channelName, this);
    if (this.connection.state === "connected") {
      channel.subscribe();
    }
    return channel;
  }

  subscribes(channels: string[]): { [key: string]: Channel } {
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

  subscribeAll(channels?: string[]): void {
    const multiChannel = channels || this.channels.all();

    chunk(multiChannel, 10).forEach((group: string[]) => {
      this.send(Action.MULTI_SUBSCRIBE, { multi_channel: group });
    });
  }

  send(event: string, data: any, channel?: string | undefined): void {
    this.connection.send(event, data, channel);
  }
}

export { Channel, Channels, ConnectionManager, Connection, Message }
