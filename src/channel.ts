import EventEmitter from "events";

export default class Channel implements IChannel {
  name: string;
  gusher: IGusher;
  subscribed: boolean;
  emitter: EventEmitter;

  constructor(name: string, gusher: IGusher) {
    this.name = name;
    this.gusher = gusher;
    this.subscribed = false;
    this.emitter = new EventEmitter();
  }

  trigger(event: string, data: any) {
    this.gusher.send(event, data, this.name);
  }

  bind(event: string, callback: any): IChannel {
    this.emitter.on(event, callback);
    return this;
  }

  unbind(event: string, callback: any): IChannel {
    this.emitter.removeListener(event, callback);
    return this;
  }

  unsubscribe() {
    this.gusher.send("gusher.unsubscribe", { channel: this.name });
  }

  handleEvent(event: string, data: any) {
    if (
      event === "gusher.subscribe_succeeded" ||
      event === "gusher.multi_subscribe_succeeded"
    ) {
      this.subscribed = true;
    }

    this.emitter.emit(event, data);
  }

  subscribe() {
    this.gusher.send("gusher.subscribe", { channel: this.name });
  }

  disconnect() {
    this.subscribed = true;
  }
}
