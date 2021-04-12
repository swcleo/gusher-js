import { EventEmitter } from "events";
import { Gusher } from "./gusher";
import { Action, Event } from "./system";

export class Channel {
  name: string;
  gusher: Gusher;
  subscribed: boolean;
  emitter: EventEmitter;

  constructor(name: string, gusher: Gusher) {
    this.name = name;
    this.gusher = gusher;
    this.subscribed = false;
    this.emitter = new EventEmitter();
  }

  trigger(event: string, data: any) {
    this.gusher.send(event, data, this.name);
  }

  bind(event: string, callback: any): Channel {
    this.emitter.on(event, callback);
    return this;
  }

  unbind(event: string, callback: any): Channel {
    this.emitter.removeListener(event, callback);
    return this;
  }

  unsubscribe() {
    this.gusher.send(Action.UNSUBSCRIBE, { channel: this.name });
  }

  handleEvent(event: string, data: any) {
    if (
      event === Event.SUBSCRIBE_SUCCESS ||
      event === Event.MULTI_SUBSCRIBE_SUCCESS
    ) {
      this.subscribed = true;
    }

    this.emitter.emit(event, data);
  }

  subscribe() {
    this.gusher.send(Action.SUBSCRIBE, { channel: this.name });
  }

  disconnect() {
    this.subscribed = true;
  }
}
