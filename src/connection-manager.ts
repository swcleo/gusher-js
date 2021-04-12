import { EventEmitter } from "events";
import { GusherOptions } from "./gusher";
import Connection, { EmitterEvent as ConnectionEvent } from "./connection";
import Logger from "./logger";

export enum State {
  INIT = 'initialized',
  CONNECTED = 'connected',
  ERROR = 'error',
  CLOSED = 'closed',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected'
}

export enum EmitterEvent {
  INIT = 'initialized',
  CONNECTED = 'connected',
  ERROR = 'error',
  CLOSED = 'closed',
  ATCLOSED = '@closed',
  CONNECTING = 'connecting',
  DISCONNECTED = 'disconnected',
  MSG = 'message',
  RETRYMAX = 'retryMax',
  RETRY = 'retry'
}

export default class ConnectionManager {
  key: string;
  options: GusherOptions;
  state: State;
  url: string;
  token: string;
  emitter: EventEmitter;
  reconnection: boolean;
  reconnectionDelay: number;
  retryMax: number;
  skipReconnect: boolean;
  retryNum: number;
  connectionStartTimestamp: number;
  retryTimer: number | null;
  connection: Connection;

  constructor(key: string, options: GusherOptions) {
    this.key = key;

    this.options = options;

    this.state = State.INIT;

    this.url = options.url;

    this.token = options.token;

    this.emitter = new EventEmitter();

    this.reconnection = !!options.reconnection;

    this.reconnectionDelay = !options.reconnectionDelay
      ? 3000
      : options.reconnectionDelay;

    this.retryMax =
      options.retryMax === undefined
        ? Number.MAX_SAFE_INTEGER
        : options.retryMax;

    this.skipReconnect = false;

    this.retryNum = 0;

    this.connectionStartTimestamp = 0;

    this.retryTimer = null;

    this.connection = new Connection({ url: this.url, token: this.token });

    this.connection.bind(ConnectionEvent.OPEN, () => {
      this.connectionStartTimestamp = Date.now();

      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
        this.retryNum = 0;
        this.retryTimer = null;
      }

      this.skipReconnect = false;

      this.updateState(State.CONNECTED);
    });

    this.connection.bind(ConnectionEvent.MSG, (message: any) => {
      this.emitter.emit(EmitterEvent.MSG, message);
    });

    this.connection.bind(ConnectionEvent.ERROR, (err: any) => {
      this.updateState(State.ERROR, err);
    });

    this.connection.bind(ConnectionEvent.CLOSED, (evt: any) => {
      const sessionTime = Date.now() - this.connectionStartTimestamp;

      if (sessionTime > 0 && this.connectionStartTimestamp !== 0) {
        this.emitter.emit(
          "@closed",
          Object.assign({}, evt, { session_time: sessionTime })
        );
        Logger.log(`Session Time: ${sessionTime} ms`);
        this.connectionStartTimestamp = 0;
      }

      this.updateState(State.CLOSED, evt);

      this.retryIn(this.reconnectionDelay);
    });
  }

  retryIn(delay = 0) {
    if (this.retryNum >= this.retryMax) {
      this.disconnect();
      this.emitter.emit(EmitterEvent.RETRYMAX);
      Logger.log("Reconnect Max: ", this.retryNum);
    }

    if (this.reconnection && !this.skipReconnect) {
      this.retryTimer = window.setTimeout(() => {
        this.retryNum += 1;
        Logger.log("Reconnect attempts: ", this.retryNum);
        this.connect();
        this.emitter.emit(EmitterEvent.RETRY, { retry: this.retryNum });
      }, delay);
    }
  }

  bind(event: string, callback?: any) {
    this.emitter.on(event, callback);
    return this;
  }

  unbind(event: string, callback?: any): ConnectionManager {
    this.emitter.removeListener(event, callback);
    return this;
  }

  unBindAll(...evt: any) {
    if (evt.length) {
      this.emitter.removeAllListeners(evt);
    } else {
      this.emitter.removeAllListeners();
    }
  }

  connect() {
    this.updateState(State.CONNECTING);

    this.connection.connect(this.token);

    Logger.log("Auth", {
      token: this.token,
    });
  }

  disconnect() {
    this.skipReconnect = true;
    this.connection.close();
    this.updateState(State.DISCONNECTED);
  }

  updateState(newState: State, data?: any) {
    const previousState = this.state;

    this.state = newState;

    if (previousState !== newState) {
      Logger.log("State changed", `'${previousState}' -> '${newState}'`);

      this.emitter.emit(newState, data);
    }
  }

  send(event: string, data: any, channel?: string | undefined) {
    if (this.connection) {
      return this.connection.send(event, data, channel);
    }

    return false;
  }
}
