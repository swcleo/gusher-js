# gusher-js

This is a [gusher](https://github.com/syhlion/gusher.cluster) client. 

Install with:

```
npm install gusher-js
```

### Usage

```js
const gusher = new Gusher('app_name', {
    url: 'url',
    token: 'token'
})

gusher.connect()

const channel = gusher.subscribe('channel')

channel.bind('event', (data) => {
  console.log('Received from channel:', data)
})

```
