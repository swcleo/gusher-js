import { EventEmitter } from "events";
import { Gusher } from "./gusher";
import { Action, Event } from "./system";

export interface IChannel {
  trigger(event: string, data: any): void;
  bind<T extends string>(event: T, callback: (...args: any[]) => void): IChannel;
  unbind<T extends string>(event: T, callback: (...args: any[]) => void): IChannel;
  subscribe(): void;
  unsubscribe(): void;
  handleEvent(event: string, data: any): void;
  disconnect(): void;
}

export class Channel implements IChannel {
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

  trigger(event: string, data: any): void {
    this.gusher.send(event, data, this.name);
  }

  bind<T extends string>(event: T, callback: (...args: any[]) => void): Channel {
    this.emitter.on(event, callback);
    return this;
  }

  unbind<T extends string>(event: T, callback: (...args: any[]) => void): Channel {
    this.emitter.removeListener(event, callback);
    return this;
  }

  unsubscribe(): void {
    this.gusher.send(Action.UNSUBSCRIBE, { channel: this.name });
  }

  handleEvent(event: string, data: any): void {
    if (
      event === Event.SUBSCRIBE_SUCCESS ||
      event === Event.MULTI_SUBSCRIBE_SUCCESS
    ) {
      this.subscribed = true;
    }

    this.emitter.emit(event, data);
  }

  subscribe(): void {
    this.gusher.send(Action.SUBSCRIBE, { channel: this.name });
  }

  disconnect(): void {
    this.subscribed = true;
  }
}
