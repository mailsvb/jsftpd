# Configuration

jsftpd takes an object when a new instance is created. This object can contain two properties:

```{code-block} javascript
const server = new ftpd({tls: {...}, cnf: {...}})
```

* **tls**: TLS options. Takes any option as per node.js tls.createServer [options](https://nodejs.org/api/tls.html#tlscreateserveroptions-secureconnectionlistener)
* **cnf**: jsftpd specific configuration items

## cnf

The below options can be set with the cnf property when creating a new instance of jsftpd.

### port

`default: 21`
The port used for unencrypted or explicit encrypted access. jsftpd will listen on this port for incoming connections.

```{code-block} javascript
port: 21
```

### securePort

`default: 990`
The port used for encrypted (implicit) access. jsftpd will listen on this port for incoming connections.

```{code-block} javascript
securePort: 990
```

### maxConnections

`default: 10`
The maximum number of simultaneous connections to the ftp server. Will be counted separatly for control and data connections.

```{code-block} javascript
maxConnections: 10
```

### minDataPort

`default: 1024`
The minimum port used for establishing the data connection in passive mode. Together with ``maxConnections``, it builds the possible range of ports being used.

```{code-block} javascript
minDataPort: 1024
```

### basefolder

`default: __dirname/tmp`
The main folder used when the default user or the anonymous user accesses the server.

```{code-block} javascript
basefolder: '/tmp'
```

### username

`default: null`
The main users username. By default, there is no main user configured.

```{code-block} javascript
username: 'john'
```

### password

`default: null`
The main users password. By default, there is no main user configured.

```{code-block} javascript
password: '123456'
```

### allowLoginWithoutPassword

`default: false`
Allow login without password. This only affects the main user.

```{code-block} javascript
allowLoginWithoutPassword: false
```

### allowUserFileOverwrite

`default: true`
Allow to overwrite existing files. This only affects the main user.

```{code-block} javascript
allowUserFileOverwrite: true
```

### allowUserFileDelete

`default: true`
Allow to delete existing files. This only affects the main user.

```{code-block} javascript
allowUserFileDelete: true
```

### allowUserFolderDelete

`default: true`
Allow to delete existing folders. This only affects the main user.

```{code-block} javascript
allowUserFolderDelete: true
```

### allowUserFolderCreate

`default: true`
Allow to create new folders. This only affects the main user.

```{code-block} javascript
allowUserFolderCreate: true
```
