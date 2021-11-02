# config options

jsftpd takes an object when a new instance is created. This object can contain a ``cnf`` property, which contains the config items mentioned on this page as an object itself.

```js
const options = {
    port: 21,
    allowUserFolderCreate: false
}
const server = new ftpd({cnf: options})
```

## Options

The below options can be set with the cnf property when creating a new instance of jsftpd.

### port

The port used for unencrypted or explicit encrypted access. jsftpd will listen on this port for incoming connections. `default: 21`

```
port: 21
```

### securePort

The port used for encrypted (implicit) access. jsftpd will listen on this port for incoming connections. `default: 990`

```
securePort: 990
```

### maxConnections

The maximum number of simultaneous connections to the ftp server. Will be counted separatly for control and data connections. `default: 10`

```
maxConnections: 10
```

### minDataPort

The minimum port used for establishing the data connection in passive mode. Together with ``maxConnections``, it builds the possible range of ports being used. `default: 1024`

```
minDataPort: 1024
```

### basefolder

The main folder used when the default user or the anonymous user accesses the server. `default: __dirname/tmp`

```
basefolder: '/tmp'
```

### username

The main users username. By default, there is no main user configured. `default: null`

```
username: 'john'
```

### password

The main users password. By default, there is no main user configured. `default: null`

```
password: '123456'
```
