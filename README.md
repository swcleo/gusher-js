# gusher-js

[gusher.cluster](https://github.com/syhlion/gusher.cluster) 是一套參考[Pusher](https://pusher.com/)設計概念，透過golang開發 WebSocket Server。

應用 `channel` 以及 `event` 設計，可以按自己想要的方式訂閱頻道接收對應的事件訊息，

Install with:

```sh
npm install gusher-js
```

## Usage

```js
const gusher = new Gusher('app_name', {
    url: 'ws_url',
    token: 'auth_token'
})

gusher.connect()

const channel = gusher.subscribe('channel')

channel.bind('event', (data) => {
  console.log('Received from channel:', data)
})

```

## 補充說明

gusher.cluster的認證方式，在文檔上沒有標注說明，其`auth機制`依賴`Redis`保存，通常會由另外的認證服務完成檢查後產生`身分憑證`使用的`token`，將其資訊記錄在`Redis`DB上。

結構大致如下，可以根據需求定置好頻道的類型，例如是個人資訊的私有頻道或是特定公開資料的共同頻道或是群組共用的群組頻道等…

```js
{
  "channels": ["dev"],
  "user_id": "123456",
  "app_key": "app",
  "remotes": {
    "test": true
  }
}
```
