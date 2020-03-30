import { EventEmitter } from "events";

interface IGusher {
  allChannel(): void;
  bind(event: string, callback: any): IGusher;
  channel(name: string): IChannel | undefined;
  connect(): void;
  createConnection(): IConnectionManager;
  disconnect(): void;
  getAuthToken(): void;
  send(event: string, data: any, channel?: string | undefined): void;
  setAuthToken(token: string): void;
  subscribe(channelName: string): IChannel | void;
  subscribeAll(channels: string[] | undefined): void;
  subscribes(channels: string[]): void;
  unsubscribe(channelName: string): void;
  unbind(event: string, callback: any): IGusher;
}

interface IConnectionManager {
  state: string;
  bind(event: string, callback?: any): void;
  connect(): void;
  disconnect(): void;
  retryIn(): void;
  send(event: string, data: any, channel?: string | undefined): void;
  unbind(event: string, callback?: any): void;
  unBindAll(): void;
  updateState(state: string, data?: any): void;
}

interface IConnection {
  bind(event: string, callback?: any): void;
  bindListeners(): void;
  changeState(state: string, params?: any): void;
  close(): boolean;
  connect(token: string): boolean;
  onClose(evt: CloseEvent): void;
  onError(evt: Event): void;
  onMessage(event: MessageEvent): void;
  onOpen(evt: Event): void;
  send(event: string, data: any, channel?: string | undefined): void;
  unbind(event: string, callback?: any): IConnection;
  unbindListeners(): void;
}

interface IChannels {
  add(name: string, gusher: IGusher): IChannel;
  all(): string[] | undefined;
  disconnect(): void;
  find(name: string): IChannel | undefined;
  remove(name: string): IChannel | undefined;
}

interface IChannel {
  bind(event: string, callback: any): IChannel;
  unbind(event: string, callback: any): IChannel;
  disconnect(): void;
  handleEvent(event: string, data: any): void;
  subscribe(): void;
  trigger(event: string, data: any): void;
  unsubscribe(): void;
}

interface IGusherOptions {
  url: string;
  token: string;
  reconnection?: boolean;
  reconnectionDelay?: number;
  retryMax?: number;
}

interface IConnectionOptions {
  url: string;
  token: string;
}

interface IGusherMessageData {
  channels: any[];
}

interface IGusherMessage {
  event: string;
  data: any | IGusherMessageData;
  channel?: string;
}

export default class Gusher implements IGusher {
    key: string;
    options: IGusherOptions;
    emitter: EventEmitter;
    channels: IChannels;
    connection: IConnectionManager;
    constructor(appKey: string | undefined, options: IGusherOptions);
    unsubscribe(channelName: string): void;
    getAuthToken(): string;
    setAuthToken(token: string): void;
    createConnection(): IConnectionManager;
    channel(name: string): IChannel | undefined;
    allChannel(): string[] | undefined;
    connect(): void;
    disconnect(): void;
    bind(event: string, callback: any): IGusher;
    unbind(event: string, callback: any): IGusher;
    subscribe(channelName: string): IChannel;
    subscribes(channels: string[]): {
        [key: string]: IChannel;
    };
    subscribeAll(channels?: string[]): void;
    send(event: string, data: any, channel?: string | undefined): void;
}
