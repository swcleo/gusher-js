import { WebSocketServer, WebSocket } from 'ws';

class Server {
  instance: WebSocketServer;
  interval: NodeJS.Timeout;

  constructor() {
    this.interval = setInterval(() => {
      if (this.instance) {
        const payload = {
          channel: "clock",
          event: "tick",
          data: {
            time: Math.floor(Date.now() / 1000),
          },
        };
        const str = JSON.stringify(payload);
        this.instance.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(str);
          }
        });
      }
    }, 1000);
  }

  listen(port: number) {
    const wss = new WebSocketServer({ port });
    wss.on("connection", (ws: WebSocket) => {
      ws.on("message", (data: string) => {
        let message = "";
        if (typeof data === "string") {
          message = data;
        }
        console.log(message);
      });
    });
    this.instance = wss;
  }
}

new Server().listen(3000);
