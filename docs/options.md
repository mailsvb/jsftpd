# Configuration

jsftpd takes an object when a new instance is created. This object can contain two properties:

```{code-block} javascript
new ftpd({tls: {...}, cnf: {...}})
```

* **tls**: TLS options. Takes any option as per node.js tls.createServer
* **cnf**: jsftpd specific configuration items

## tls

jsftpd will only listen on the `securePort`, when the instance is created with a `tls` property. This property takes **all** options from node.js [tls.createServer](https://nodejs.org/api/tls.html#tlscreateserveroptions-secureconnectionlistener).\
Some default values are configured.

### honorCipherOrder

**Type: `boolean`**\
**Default: `true`**

Attempt to use the server's cipher suite preferences instead of the client's

### rejectUnauthorized

**Type: `boolean`**\
**Default: `false`**

If not `false` the server will reject any connection which is not authorized with the list of supplied CAs.

### cert

**Type: `string | string[] | Buffer | Buffer[]`**\
**Default: `...`**

A self signed certificate has been added to allow using the TLS interface.

```{note}
The default certificate **must** be replaced for secure operation.
```

### key

**Type: `string | string[] | Buffer | Buffer[]`**\
**Default: `...`**

A self generated RSA private key to allow using the TLS interface.

```{note}
The default key **must** be replaced for secure operation.
```

## cnf

The below options can be set with the cnf property when creating a new instance of jsftpd.

### port

**Type: `number`**\
**Default: `21`**

The port used for unencrypted or explicit encrypted access. jsftpd will listen on this port for incoming connections.

```{code-block} javascript
new ftpd({cnf: {port: 21}})
```

### securePort

**Type: `number`**\
**Default: `990`**

The port used for encrypted (implicit) access. jsftpd will listen on this port for incoming connections.

```{code-block} javascript
new ftpd({cnf: {securePort: 990}})
```

### maxConnections

**Type: `number`**\
**Default: `10`**

The maximum number of simultaneous connections to the ftp server. Will be counted separatly for control and data connections.

```{code-block} javascript
new ftpd({cnf: {maxConnections: 10}})
```

### minDataPort

**Type: `number`**\
**Default: `1024`**

The minimum port used for establishing the data connection in passive mode. Together with ``maxConnections``, it builds the possible range of ports being used.

```{code-block} javascript
new ftpd({cnf: {minDataPort: 1024}})
```

### basefolder

**Type: `string`**\
**Default: `${__dirname}/tmp`**

The main folder used when the default user or the anonymous user accesses the server.

```{code-block} javascript
new ftpd({cnf: {basefolder: '/tmp'}})
```

### username

**Type: `string`**\
**Default: `undefined`**

The main users username. By default, there is no main user configured.

```{code-block} javascript
new ftpd({cnf: {username: 'john'}})
```

### password

**Type: `string`**\
**Default: `undefined`**

The main users password. By default, there is no main user configured.

```{code-block} javascript
new ftpd({cnf: {password: '123456'}})
```

### allowLoginWithoutPassword

**Type: `boolean`**\
**Default: `false`**

Allow login without password. This only affects the main user.

```{code-block} javascript
new ftpd({cnf: {allowLoginWithoutPassword: false}})
```

### allowUserFileOverwrite

**Type: `boolean`**\
**Default: `true`**

Allow to overwrite existing files. This only affects the main user.

```{code-block} javascript
new ftpd({cnf: {allowUserFileOverwrite: true}})
```

### allowUserFileDelete

**Type: `boolean`**\
**Default: `true`**

Allow to delete existing files. This only affects the main user.

```{code-block} javascript
new ftpd({cnf: {allowUserFileDelete: true}})
```

### allowUserFolderDelete

**Type: `boolean`**\
**Default: `true`**

Allow to delete existing folders. This only affects the main user.

```{code-block} javascript
new ftpd({cnf: {allowUserFolderDelete: true}})
```

### allowUserFolderCreate

**Type: `boolean`**\
**Default: `true`**

Allow to create new folders. This only affects the main user.

```{code-block} javascript
new ftpd({cnf: {allowUserFolderCreate: true}})
```

### allowAnonymousLogin

**Type: `boolean`**\
**Default: `false`**

Allow the anonymous user to login. The defined `basefolder` will be the default folder for this user.

```{code-block} javascript
new ftpd({cnf: {allowAnonymousLogin: true}})
```

### allowAnonymousFileOverwrite

**Type: `boolean`**\
**Default: `false`**

Allow the anonymous user to overwrite files.

```{code-block} javascript
new ftpd({cnf: {allowAnonymousFileOverwrite: true}})
```

### allowAnonymousFileDelete

**Type: `boolean`**\
**Default: `false`**

Allow the anonymous user to delete files.

```{code-block} javascript
new ftpd({cnf: {allowAnonymousFileDelete: true}})
```

### allowAnonymousFolderDelete

**Type: `boolean`**\
**Default: `false`**

Allow the anonymous user to delete folders.

```{code-block} javascript
new ftpd({cnf: {allowAnonymousFolderDelete: true}})
```

### allowAnonymousFolderCreate

**Type: `boolean`**\
**Default: `false`**

Allow the anonymous user to create folders.

```{code-block} javascript
new ftpd({cnf: {allowAnonymousFolderCreate: true}})
```
