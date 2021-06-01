import { EventEmitter } from "events";
import Logger from "./logger";
import { ab2str, str2ab } from './lib';

interface ConnectionOptions {
  url: string;
  token: string;
  binary?: boolean;
}

export interface Message {
  event: string;
  data: any;
  errors?: any[];
  channel?: string;
}

export enum State {
  INIT = "initialized",
  ERROR = "error",
  CLOSED = "closed",
  CONNECTING = "connecting",
  OPEN = "open",
}

export enum EmitterEvent {
  INIT = "initialized",
  ERROR = "error",
  CLOSED = "closed",
  CONNECTING = "connecting",
  OPEN = "open",
  MSG = "message",
}

export class Connection {
  state: State;
  url = "";
  token = "";
  binary = false;
  emitter: EventEmitter;
  socket: WebSocket | undefined;

  constructor(options: ConnectionOptions) {
    this.url = options.url;

    this.token = options.token;

    this.binary = options.binary || false;

    this.state = State.INIT;

    this.emitter = new EventEmitter();
  }

  bind(event: string, callback?: any): Connection {
    this.emitter.on(event, callback);
    return this;
  }

  unbind(event: string, callback?: any): Connection {
    this.emitter.removeListener(event, callback);
    return this;
  }

  connect(token: string): boolean {
    if (this.socket) {
      this.close();
    }

    let url = this.url || "ws://127.0.0.1";

    if (token) {
      url = `${url}?token=${token}`;
    }

    try {
      this.socket = new WebSocket(url);
      this.socket.binaryType = "arraybuffer";
    } catch (e) {
      this.onError(e);
      return false;
    }

    this.bindListeners();

    Logger.log("Connecting", { url: this.url, token: this.token });

    this.changeState(State.CONNECTING);

    return true;
  }

  close(): boolean {
    if (this.socket) {
      this.socket.close();
      return true;
    }

    return false;
  }

  changeState(state: State, params?: any) {
    this.state = state;
    this.emitter.emit(state, params);
  }

  bindListeners() {
    const socket = <WebSocket>this.socket;

    socket.onopen = (evt: Event) => {
      this.onOpen(evt);
    };

    socket.onerror = (evt: Event) => {
      this.onError(evt);
    };

    socket.onclose = (evt: CloseEvent) => {
      this.onClose(evt);
    };

    socket.onmessage = (message: MessageEvent) => {
      this.onMessage(message);
    };
  }

  unbindListeners() {
    if (this.socket) {
      this.socket.onopen = null;
      this.socket.onerror = null;
      this.socket.onclose = null;
      this.socket.onmessage = null;
    }
  }

  onOpen(evt: Event) {
    this.changeState(State.OPEN);

    if (this.socket) {
      this.socket.onopen = null;
    }
  }

  onError(error: Event) {
    this.emitter.emit(EmitterEvent.ERROR, error);
  }

  onClose(closeEvent: CloseEvent) {
    if (closeEvent) {
      this.changeState(State.CLOSED, {
        code: closeEvent.code,
        reason: closeEvent.reason,
        wasClean: closeEvent.wasClean,
      });
    } else {
      this.changeState(State.CLOSED);
    }

    this.unbindListeners();

    this.socket = undefined;
  }

  onMessage(event: MessageEvent) {
    let message: Message;
    let content = '';

    if (event.data instanceof Blob) {
      console.error("gusher is not support type Blob");
    }

    if (event.data instanceof ArrayBuffer) {
      content = ab2str(event.data);
    }

    if (typeof event.data === "string") {
      content = event.data
    }

    try {
      message = JSON.parse(content);
    } catch (err) {
      Logger.log({ error: err });
      message = {
        event: "",
        data: "",
        errors: []
      };
    }

    Logger.log("Event recd", message);
    this.emitter.emit(EmitterEvent.MSG, message);
  }

  send(event: string, data: any, channel?: string | undefined) {
    const message: Message = { event, data };

    if (channel) {
      message.channel = channel;
    }

    Logger.log("Event sent", message);

    if (this.socket) {
      const text = JSON.stringify(message);
      if (this.binary) {
        this.socket.send(str2ab(text));
      } else {
        this.socket.send(text);
      }
    }
  }
}
