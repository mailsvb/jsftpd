# Events

jsftpd emits several events during runtime.

```{code-block} javascript
const server = new ftpd({tls: {...}, cnf: {...}})
server.on(<event>, (...) => { ... })
```

* **Logging**: Information for debugging purposes
* **Other**: Specific events

## Logging

Log events will provide debug information of a certain level. All events can be handled by separate functions.

### log

**Name: `log`**\
**Attribute 1: `string`

Contains the plain FTP messages exchanged between client and server. Executing function needs to take one arugment of type `string`

```{code-block} javascript
server.on('log', (msg) => console.log(msg))
```

### debug

**Name: `debug`**\
**Attribute 1: `string`

Contains detailed debug information. Executing function needs to take one arugment of type `string`

```{code-block} javascript
server.on('debug', (msg) => console.log(msg))
```

## Other

Other events for specific occasions.

### listen

**Name: `listen`**\
**Attribute 1: `object`

This event will fire when the FTP server is listening on defined ports. Executing function needs to take one arugment of type `object`. The `object` contains the following information:

**protocol: `string` tcp or tls**\
**address: `string` local address listening on**\
**port: `number` local port listening on**

```{code-block} javascript
server.on('listen', (data) => console.log(`${data.protocol} on ${data.address}:${data.port}))
```

### login

**Name: `login`**\
**Attribute 1: `object`

This event will fire when a user logs into the server. Executing function needs to take one arugment of type `object`. The `object` contains the following information:

**username: `string` the user who has logged in**\
**address: `string` remote address from where the user logged in**\
**total: `number` total amount of open sessions**

```{code-block} javascript
server.on('login', (data) => console.log(`${data.username} logged in from ${data.address} total users ${data.total}))
```

### logoff

**Name: `logoff`**\
**Attribute 1: `object`

This event will fire when a user logs off from the server. Executing function needs to take one arugment of type `object`. The `object` contains the following information:

**username: `string` the user who has logged off**\
**address: `string` remote address from where the user was logged in**\
**total: `number` total amount of open sessions**

```{code-block} javascript
server.on('logoff', (data) => console.log(`${data.username} logged off from ${data.address} total users ${data.total}))
```
