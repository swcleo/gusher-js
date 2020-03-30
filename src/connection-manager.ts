import { EventEmitter } from "events";
import Connection from "./connection";
import Logger from "./logger";

export default class ConnectionManager implements IConnectionManager {
  key: string;
  options: IGusherOptions;
  state: string;
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

  constructor(key: string, options: IGusherOptions) {
    this.key = key;

    this.options = options;

    this.state = "initialized";

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

    this.connection.bind("open", () => {
      this.connectionStartTimestamp = Date.now();

      if (this.retryTimer) {
        clearTimeout(this.retryTimer);
        this.retryNum = 0;
        this.retryTimer = null;
      }

      this.skipReconnect = false;

      this.updateState("connected");
    });

    this.connection.bind("message", (message: any) => {
      this.emitter.emit("message", message);
    });

    this.connection.bind("error", (err: any) => {
      this.updateState("error", err);
    });

    this.connection.bind("closed", (evt: any) => {
      const sessionTime = Date.now() - this.connectionStartTimestamp;

      if (sessionTime > 0 && this.connectionStartTimestamp !== 0) {
        this.emitter.emit(
          "@closed",
          Object.assign({}, evt, { session_time: sessionTime })
        );
        Logger.debug(`Session Time: ${sessionTime} ms`);
        this.connectionStartTimestamp = 0;
      }

      this.updateState("closed", evt);

      this.retryIn(this.reconnectionDelay);
    });
  }

  retryIn(delay = 0) {
    if (this.retryNum >= this.retryMax) {
      this.disconnect();
      this.emitter.emit("retryMax");
      Logger.debug("Reconnect Max: ", this.retryNum);
    }

    if (this.reconnection && !this.skipReconnect) {
      this.retryTimer = window.setTimeout(() => {
        this.retryNum += 1;
        Logger.debug("Reconnect attempts: ", this.retryNum);
        this.connect();
        this.emitter.emit("retry", { retry: this.retryNum });
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
    this.updateState("connecting");

    this.connection.connect(this.token);

    Logger.debug("Auth", {
      token: this.token
    });
  }

  disconnect() {
    this.skipReconnect = true;
    this.connection.close();
    this.updateState("disconnected");
  }

  updateState(newState: string, data?: any) {
    const previousState = this.state;

    this.state = newState;

    if (previousState !== newState) {
      Logger.debug("State changed", `'${previousState}' -> '${newState}'`);
      this.emitter.emit("state_change", {
        previous: previousState,
        current: newState
      });

      this.emitter.emit(newState, data);
    }
  }

  send(event: string, data: any, channel?: string | undefined) {
    if (this.connection) {
      return this.connection.send(event, data, channel)
    }

    return false
  }
}
