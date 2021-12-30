# jsftpd
FTP server for node.js

[![GitHub Workflow - CI](https://github.com/mailsvb/jsftpd/workflows/test/badge.svg)](https://github.com/mailsvb/jsftpd/actions?workflow=test)
[![Coverage Status](https://coveralls.io/repos/github/mailsvb/jsftpd/badge.svg)](https://coveralls.io/github/mailsvb/jsftpd?branch=main)
[![GitHub release (latest by date)](https://img.shields.io/github/v/release/mailsvb/jsftpd)](https://github.com/mailsvb/jsftpd/releases/latest)
[![Npm package version](https://badgen.net/npm/v/jsftpd)](https://npmjs.com/package/jsftpd)
[![Documentation Status](https://readthedocs.org/projects/jsftpd/badge/?version=latest)](https://jsftpd.readthedocs.io/en/latest/?badge=latest)
[![GitHub license](https://badgen.net/github/license/mailsvb/jsftpd)](https://github.com/mailsvb/jsftpd/blob/master/license)
[![made-with-javascript](https://img.shields.io/badge/Made%20with-JavaScript-1f425f.svg)](https://www.javascript.com)

## Install

Either download from [here](https://github.com/mailsvb/jsftpd/releases) or install via npm.

```shell
$ npm install jsftpd
```

## Quick start

To get an FTP server running quickly, the below code will get you started by allowing access for a single user.

```js
const { ftpd } = require('jsftpd')

const server = new ftpd({cnf: {username: 'john', password: 'doe', basefolder: '/tmp'}})

server.start()
```

## Documentation

The full documentation of the project is available [here](https://jsftpd.readthedocs.io/en/latest/).

The ftpd instance takes an object with two properties that allows for configuring the new instance.
- `tls` property object. Takes any configuration option as per node.js tls.createServer [options](https://nodejs.org/api/tls.html#tlscreateserveroptions-secureconnectionlistener)
- `cnf` property object. Takes jsftpd specific configuration items. See full documentation [here](https://jsftpd.readthedocs.io/en/latest/options.html#cnf)
- `hdl` property object. Takes handler functions for specific FTP commands. See full documentation [here](https://jsftpd.readthedocs.io/en/latest/options.html#hdl)
