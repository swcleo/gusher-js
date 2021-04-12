import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 3000 });

interface GusherEvent {
  event: string;
  data: any
}

enum Actions {
  MULTI_SUBSCRIBE = 'gusher.multi_subscribe'
}

enum Events {
  MULTI_SUBSCRIBE_SUCCESS = 'gusher.multi_subscribe_succeeded'
}

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    // gusher multi subscribe event
    try {
      const payload: GusherEvent = JSON.parse(message);
      if (payload.event === Actions.MULTI_SUBSCRIBE) {
        const channels: string[] = payload.data.multi_channel;
        const data = {
          event: Events.MULTI_SUBSCRIBE_SUCCESS,
          data: {
            channel: channels,
          },
        };
        ws.send(JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    }

    setInterval(() => {
         // gusher custom event
      const data = {
        channel: "clock",
        event: "tick",
        data: {
          time: Math.floor(Date.now() / 1000),
        },
      };
      ws.send(JSON.stringify(data));
    }, 1000);
  });
});
