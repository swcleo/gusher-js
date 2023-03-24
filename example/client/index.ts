// 使用esm模組或是使用umd模組
import { Gusher } from "../..";

console.log(Gusher.Event);

const gusher = new Gusher('BB', {
  url: 'ws://127.0.0.1:3000',
  token: '99fd0534-1a41-4f39-ad14-c29a89acd3bd',
});

gusher.connect();

// 使用定義好的字串監聽事件
gusher.bind("*", (event) => {
  console.log(event);
});

// 使用定義好事件類別監聽事件
gusher.bind(Gusher.Event.ERROR, (event) => {
  console.error(`連線失敗: ${event.currentTarget.url}`);
});

gusher.bind(Gusher.Event.ERROR, (event) => {
  console.error(`連線失敗: ${event.currentTarget.url}`);
});

gusher.bind(Gusher.Event.CONNECTED, () => {
  console.log('連線成功');
});

gusher.bind(Gusher.Event.CLOSED, () => {
  console.log('連線關閉');
});

// 自定義好頻道事件
type ClockEvents = "tick"

// 自定義好頻道內容
interface ClockData {
  time: number;
}

const clock_channel = gusher.subscribe('clock')

clock_channel.bind<ClockEvents>('tick', (data: ClockData) => {
  console.log(data.time);
});
