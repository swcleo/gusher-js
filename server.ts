import WebSocket from "ws";

const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", (ws: WebSocket) => {
  ws.on("message", (message: string) => {
    try {
      const payload = JSON.parse(message);

      if (payload.event === "gusher.multi_subscribe") {
        const data = {
          event: "gusher.multi_subscribe_succeeded",
          data: {
            channel: payload.data["multi_channel"]
          }
        };
        ws.send(JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
    }
  });
});

