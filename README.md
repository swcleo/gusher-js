# gusher-js
gusher client tool


## Getting Started
Install `gusher-js`:

```
npm install gusher-js --save
```


### Usage
```

const gusher = new Gusher({ANY_NAME || APP_KEY}', {
    url: 'ws://{HOST_URL}/ws/{APP_KEY}',
    token: 'TOKEN',
    level: {DEBUG}
})

gusher.connect()

const channel = gusher.subscribe('channel_name')

channel.bind('event_name', (data) => {
  console.log('Received from channel: ', data)
})

```
## Gusher Options
* url: websocket connect url
* token: JWT(Auth Token)
* reconnection auto reconnect default: true
* retryMaxL: retry number default: Number.MAX_SAFE_INTEGER
* reconnectionDelay: retry delay (ms)   default: 3000
* level: debug logger {'DEBUG'|'INFO'|'WARN'|'ERROR'|'FATAL'}


## Events
* \*
* connected
* disconnected
* closed
* @closed

## Getting To Know Gusher
Gusher is a WebSocket server.  

Pusher implement server-side by go.


## Relative Links
* [gusher.cluster](https://github.com/syhlion/gusher.cluster)  
* [pusher](https://pusher.com/)  
* [pusher-js](https://github.com/pusher/pusher-js)


## Support
If you have any problem or suggestion please open an issue [here](https://github.com/cswleocsw/gusher-js/issues).


## License
The MIT License

Copyright (c) 2016, cswleocsw

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
