const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3000 });

wss.on("connection", ws => {
  ws.on("message", message => {
    try {
      const payload = JSON.parse(message);

      if (payload.event === "gusher.multi_subscribe") {
        ws.send(
          JSON.stringify({
            event: "gusher.multi_subscribe_succeeded",
            data: {
              channel: payload.data["multi_channel"]
            }
          })
        );
      }
    } catch (err) {
      console.error(err);
    }
  });
});
