import EventEmitter from "events";
import Logger from "./logger";

export default class Connection implements IConnection {
  url = "";
  state = "initialized";
  token = "";
  emitter: EventEmitter;
  socket: WebSocket | undefined;

  constructor(options: IConnectionOptions) {
    this.url = options.url;

    this.token = options.token;

    this.state = "initialized";

    this.emitter = new EventEmitter();
  }

  bind(event: string, callback?: any): Connection {
    this.emitter.on(event, callback);
    return this;
  }

  unbind(event: string, callback?: any): IConnection {
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
    } catch (e) {
      this.onError(e);
      return false;
    }

    this.bindListeners();

    Logger.debug("Connecting", { url: this.url, token: this.token });

    this.changeState("connecting");

    return true;
  }

  close(): boolean {
    if (this.socket) {
      this.socket.close();
      return true;
    }

    return false;
  }

  changeState(state: string, params?: any) {
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
    this.changeState("open");

    if (this.socket) {
      this.socket.onopen = null;
    }
  }

  onError(error: Event) {
    this.emitter.emit("error", error);
  }

  onClose(closeEvent: CloseEvent) {
    if (closeEvent) {
      this.changeState("closed", {
        code: closeEvent.code,
        reason: closeEvent.reason,
        wasClean: closeEvent.wasClean
      });
    } else {
      this.changeState("closed");
    }

    this.unbindListeners();

    this.socket = undefined;
  }

  onMessage(event: MessageEvent) {
    let message: IGusherMessage;

    try {
      message = JSON.parse(event.data);
    } catch (err) {
      Logger.error({ error: err });
      message = {
        event: "",
        data: ""
      };
    }

    Logger.debug("Event recd", message);
    this.emitter.emit("message", message);
  }

  send(event: string, data: any, channel?: string | undefined) {
    const message: IGusherMessage = { event, data };

    if (channel) {
      message.channel = channel;
    }

    Logger.debug("Event sent", message);

    if (this.socket) {
      this.socket.send(JSON.stringify(message));
    }
  }
}
