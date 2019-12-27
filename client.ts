import Gusher from './src/gusher'

const gusher = new Gusher("BB", {
  url: "ws://localhost:3000",
  token: "99fd0534-1a41-4f39-ad14-c29a89acd3bd"
});

gusher.subscribe("A");

gusher.connect();