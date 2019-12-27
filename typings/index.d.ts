interface Logger {
  getLogger(): Logger;
  info(...agrs: any): void;
  log(...agrs: any): void;
  debug(...agrs: any): void;
  info(...agrs: any): void;
  notice(...agrs: any): void;
  warning(...agrs: any): void;
  error(...agrs: any): void;
  crit(...agrs: any): void;
  alter(...agrs: any): void;
  emerg(...agrs: any): void;
}

declare module "log4js-free" {
  export function getLogger(name: string): Logger;
}

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
  subscribeAll(): void;
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
  all(): void;
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
  channels: any[]
}

interface IGusherMessage {
  event: string;
  data: any | IGusherMessageData;
  channel?: string;
}
