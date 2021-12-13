# Welcome to jsftpd documentation!

jsftpd is an FTP server written for node.js. It's feature set is:

* Multi User capable
* Implicit/Explicit TLS
* Active/Passive mode for data transfer
* Hooks for file operations

## Install

```{code-block} shell
npm install jsftpd
```

## Quick start

To get an FTP server running quickly, the below code will get you started by allowing access for a single user.

```{code-block} javascript
const { ftpd } = require('jsftpd')

const server = new ftpd({cnf: {username: 'john', password: 'doe', basefolder: '/tmp'}})

server.start()
```

## Contents

```{toctree}
---
maxdepth: 1
glob:
---
*
```
