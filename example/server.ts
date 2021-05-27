import WebSocket from "ws";
import { str2ab, b2str } from "../src/lib";

const isBinary = true;

declare type ServerHandle = () => void;

class Server {
  _instance: null | WebSocket.Server = null;
  _tick: null | NodeJS.Timeout = null;

  constructor() {
    // test: for send message
    this._tick = setInterval(() => {
      if (this._instance) {
        const payload = {
          channel: "clock",
          event: "tick",
          data: {
            time: Math.floor(Date.now() / 1000),
          },
        };
        const str = JSON.stringify(payload);
        this._instance.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(isBinary ? str2ab(str) : str);
          }
        });
      }
    }, 1000);
  }

  listen(port: number, callback: ServerHandle) {
    const wss = new WebSocket.Server({ port });

    wss.on("connection", (ws: WebSocket) => {
      ws.on("message", (data) => {
        let message = "";

        if (typeof data === "string") {
          message = data;
        }

        // buffer -> arraybuffer -> string
        if (data instanceof Buffer) {
          message = b2str(data);
        }

        const payload = JSON.parse(message);

        // test: for receive message
        console.log(payload);
      });
    });

    this._instance = wss;

    callback();
  }
}

const port = 3000

new Server().listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
