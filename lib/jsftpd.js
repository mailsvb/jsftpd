/*
 * @package jsftpd
 * @author Sven <mailsvb@gmail.com>
 * @license https://github.com/mailsvb/jsftpd/blob/main/LICENSE MIT License
 */

'use strict'

const tls = require('tls')
const fs = require('fs')
const util = require('util')
const path = require('path')
const net = require('net')
const EventEmitter = require('events').EventEmitter
const defaultBaseFolder = path.join(__dirname, 'tmp')
const defaultCert = Buffer.from('LS0tLS1CRUdJTiBSU0EgUFJJVkFURSBLRVktLS0tLQpNSUlFb3dJQkFBS0NBUUVBdHpOM1dKdHE5MjAzYWQ0eFRxb2hHM3hLUVdvUnJFejArd3JTUnNhZitMQTQzSWQ4CjRWUUU0elpsaEhSRVJzSGJjQkdGd0dNTEwxaGJXTWc3eDErSFhKYXlxNXJwcldTZ1g4TVRwZllkN2RUNkxRT3oKdmdBTUx3WUJwM3VkYm5IM2tyUERQazBibWRDcTZ4RmxqaUR4bHB6dWxIN1Vqb2crRE1XYmdpVHFYU2YrUThZTwpXS2xVRXhMVzZ5L3hFNUNIVVN3ZGI3MWREc2pDSG90YWliTTNXdlpGdEc3MnAvUXBaWldtZmQreEQwL3VoVnhNCnBualR0S21xWlMwcnJZM3Y1SFR5dVpBMUJRMFBVWmV0NzdLdWZKUis2aVlzQjQ4Z3NSM0szNmd6WHoyMzRXUXUKbEppcWk0dXo4Wjk1LzQyZmJOUlR3eWxRZXBQY1Ruc0Rib0Y0Q1FJREFRQUJBb0lCQVFDanR1UmlWSkVraDM5TApwbm9kdUQ5WjFwcHRGcUt3ZlIwMzhwV3pGZkVEUmtlcUc1SG5zek9pOEl1TDhITExZSlgrOGttNmdVZ1BpVUFvCmVOZWk5YVY3Z2xnc3JvVkFwSG9FMmNtSE9BZks3OWFadjRNeXVjd3BnWTZjNHdUdkcvMklKZ2pHZGhYQ1FRMWMKZi9Gbkw5MTFJTXk3K3hOc1JDaGZOWUFncjJpWTBZOUpRQndncTlJM1BWZ1RGQUtkTTBKZ1hySzhXVCtsN3NDRQpWc0kyUkVnYUxzeUxud2VmYnRwbVV0ankrbWtLemIzcnNyY1JVVmJOZjB3aEFlTG9HS01wZjVPNVUzMVNjd2xwClB2RnpHWkUyM01HbHpheGpZVVJTVmV3TFlzR2dwNTg5SDF6WmZaQVhSRWRiOEx2MGYra0I5MSthUi9Hdy9IT3gKS3ZlVXEvTVpBb0dCQU9BQkhxWWdXNmFwM3BjMjZJNVdNNURrMnJ1TnArRENQbzJUV3RRTklwTlREMEorRWt6SgpMZ1ZEK0xGVWZmNDFTQlZEbWZXR2x3cnVtajdWWGtTbjZyWmZXQUVKYTBySkljdHV3TDcxQ1Y0Q280cnFsUGlpCnhEazdhUFpYSXJBcjdaOG5UOG1kVStmcENMS1FNVUhYY0wydDI0cE85NytFVGVycVVYcGtEQXVEQW9HQkFORmUKVitZYThuVGxjVVhkbktqQVU4czJNSlhUUFZkeDlIM3BzQjNOVjJtR2lmM1h2d2F6ei9mYTg5NG5Ha3FxS2N6cwppV1BLdlR0MytVdUwxSlhWSlcwMllycHpUMlpMd2lqY3pCQlc1OGtIeU9UUGZ4UENjemh1dGlQUHJoMnQwbGJtCkR6WFpuTzJPUlpJWlp3MFllVFlNVzFUcnZ3WnRpT0VxMFp4cVVkeURBb0dBYld0K21pMmlOMll3NmZLVFpMdnMKMG5GSCsyZTF3bzkvMk01TEJ0d25zSWxaSWVUTmNaNndFVGhqcWRPWSsrencraG9jZ1pldC9sUVJHbkpGYXdvUApGK2k0NTBDL25UZGtmNmZwRlI1QzVoNHAzdmk1cmo1cjFYMFV4NGhHMUlHUXdEYUd2ZmhRL1M2UzVnNlRVUk00CjZoNmI2QktzNkd0cldEMy9jT2FnRDVzQ2dZQXpwNHdXS0dYVE0xeHIrVTRTVUVrY0pNVjk0WDBMMndDUUpCeWcKYmEzNFNnbzNoNGdJdGtwRUExQVJhaUpSYzRRV20vRVZuc3BySnFGcDR4alMwcUNHUGxuRFdIbXBhbDEveVdITApValdqWW5sTkFtaCt6b1d3MFplOFpCdTRGTStGUXdOVHJObkx2a01wMVh5WVBZYUNNREJFVmxsdDA0NW14ektwCjNZMU8wd0tCZ0FHaVkyNVZLOGJyMVFydXlzM3Vhb21LQ3BYUmhjZU15eHdBazdxeUlpNnpHeEx3bnFaVldaQmQKbkcxbkFaT2JET1JSTGRBRktPZ2tncGtVbGgrTEE3dTRuUytGWEdteGtLZlF1cTNTcTNaWHhiTjMxcXBCcERHTQoxbE9QSlVWY2UxV3ZyeXcrWVI4M1VFQ0ZTOEZjeDdibEVEM3oyNnVOQnN0dlBwVTUrV3ZxCi0tLS0tRU5EIFJTQSBQUklWQVRFIEtFWS0tLS0tCi0tLS0tQkVHSU4gQ0VSVElGSUNBVEUtLS0tLQpNSUlDNGpDQ0FjcWdBd0lCQWdJSWJqQ2hhajZDT2Iwd0RRWUpLb1pJaHZjTkFRRUxCUUF3RVRFUE1BMEdBMVVFCkF4TUdhbk5tZEhCa01DQVhEVEl3TURFd01UQXdNREF3TUZvWUR6azVPVGt4TWpNeE1qTTFPVFU1V2pBUk1ROHcKRFFZRFZRUURFd1pxYzJaMGNHUXdnZ0VpTUEwR0NTcUdTSWIzRFFFQkFRVUFBNElCRHdBd2dnRUtBb0lCQVFDMwpNM2RZbTJyM2JUZHAzakZPcWlFYmZFcEJhaEdzVFBUN0N0Skd4cC80c0RqY2gzemhWQVRqTm1XRWRFUkd3ZHR3CkVZWEFZd3N2V0Z0WXlEdkhYNGRjbHJLcm11bXRaS0Jmd3hPbDloM3QxUG90QTdPK0FBd3ZCZ0duZTUxdWNmZVMKczhNK1RSdVowS3JyRVdXT0lQR1duTzZVZnRTT2lENE14WnVDSk9wZEovNUR4ZzVZcVZRVEV0YnJML0VUa0lkUgpMQjF2dlYwT3lNSWVpMXFKc3pkYTlrVzBidmFuOUNsbGxhWjkzN0VQVCs2RlhFeW1lTk8wcWFwbExTdXRqZS9rCmRQSzVrRFVGRFE5Umw2M3ZzcTU4bEg3cUppd0hqeUN4SGNyZnFETmZQYmZoWkM2VW1LcUxpN1B4bjNuL2paOXMKMUZQREtWQjZrOXhPZXdOdWdYZ0pBZ01CQUFHalBEQTZNQXdHQTFVZEV3RUIvd1FDTUFBd0hRWURWUjBPQkJZRQpGQkRRdzE4NC91Qk5zMHlxczVqaU92dnd4TFBTTUFzR0ExVWREd1FFQXdJRjREQU5CZ2txaGtpRzl3MEJBUXNGCkFBT0NBUUVBaWdSa0draEMxeTVMendOQ0N1T0I5eUsyS2NkUGJhcm9lZGlSWVVxZmpVU2JsT3NweWFTNjEvQjgKVk9UdHZSRjBxZkJFZTVxZVhVUTRIV1JGSnRVZmQ1eisvZTRZNkJHVmR3eFJ5aktIYkVGQ3NpOFlFZDNHOTdaZwpWM1RFV08xVVlCTlJhN2tZajE2QXFDOWtXaG5WRVU3bUdRWE5nR1NJaDNNTmx5RG1RblBIdHdzS2d3cUs5VWcvCk9QVUhUNGlTa2h2OEVoTjYyUFlRaHBEaU1udWFQbUZ1bGVKbmllQnNFMTlvSVBtbWsxblRIZXRPZDg4VU1PeUEKWDFKY0ZBZXI2dmVPQkxVMUhRSEdtd1Iyalgzai83YzI3SjJFdjRQWW1rU2R2N0FYcm5LaENDeGRSblA2WDlGaApTYlEwRHBhbW5zaWFEWld4QzNuUks2LzVndXdlOHc9PQotLS0tLUVORCBDRVJUSUZJQ0FURS0tLS0tCg==', 'base64')

const TLSserverDefaults = {
    key: defaultCert,
    cert: defaultCert,
    honorCipherOrder: true,
    rejectUnauthorized: false
}

const FTPdefaults = {
    port: 21,
    securePort: 990,
    maxConnections: 10,
    basefolder: defaultBaseFolder,
    user: [],
    allowAnonymousFileCreate: false,
    allowAnonymousFileRetrieve: false,
    allowAnonymousFileOverwrite: false,
    allowAnonymousFileDelete: false,
    allowAnonymousFolderDelete: false,
    allowAnonymousFolderCreate: false,
    allowAnonymousLogin: false,
    minDataPort: 1024,
    uploadHandler: null,
    downloadHandler: null
}

const UserDefaults = {
    allowLoginWithoutPassword: false,
    allowUserFileCreate: true,
    allowUserFileRetrieve: true,
    allowUserFileOverwrite: true,
    allowUserFileDelete: true,
    allowUserFolderDelete: true,
    allowUserFolderCreate: true
}

const LoginType = Object.freeze({
    None: 0,
    Anonymous: 1,
    Password: 2,
    NoPassword: 3
})

const SocketStateAfterWrite = Object.freeze({
    Open: 0,
    End: 1
})

class ftpd {
    constructor (options) {
        // options
        this._opt = {}
        this._opt.tls = Object.assign({}, TLSserverDefaults, options && options.tls)
        this._opt.cnf = Object.assign({}, FTPdefaults, UserDefaults, options && options.cnf)
        this._useTLS = options && options.tls

        // checks
        if (!this._opt.cnf.uploadHandler && !fs.existsSync(this._opt.cnf.basefolder)) {
            if (this._opt.cnf.basefolder === defaultBaseFolder) {
                fs.mkdirSync(defaultBaseFolder)
            } else {
                throw new Error('Basefolder must exist')
            }
        }

        this.lastSocketKey = 0
        this.openSockets = {}

        // setup FTP on TCP
        this._tcp = net.createServer()
        this._tcp.on('connection', (socket) => this.Handler(this, socket))
        this._tcp.on('error', (err) => this.ErrorHandler(err))
        this._tcp.on('listening', () => {
            this.DebugHandler(`FTP server listening on ${util.inspect(this._tcp.address(), { showHidden: false, depth: null, breakLength: 'Infinity' })}`)
            this.emit('listen-tcp', this._tcp.address())
        })
        this._tcp.maxConnections = this._opt.cnf.maxConnections

        // setup FTP on TLS
        this._tls = tls.createServer(this._opt.tls)
        this._tls.on('secureConnection', (socket) => this.Handler(this, socket))
        this._tls.on('error', (err) => this.ErrorHandler(err))
        this._tls.on('listening', () => {
            this.DebugHandler(`FTP server listening on ${util.inspect(this._tls.address(), { showHidden: false, depth: null, breakLength: 'Infinity' })}`)
            this.emit('listen-tls', this._tls.address())
        })
        this._tls.maxConnections = this._opt.cnf.maxConnections
    }

    start () {
        this._tcp.listen(this._opt.cnf.port)
        this._useTLS && this._tls.listen(this._opt.cnf.securePort)
    }

    stop () {
        Object.keys(this.openSockets).forEach((socketKey) => this.openSockets[socketKey].destroy())
        this._tcp.close()
        this._useTLS && this._tls.close()
    }

    cleanup () {
        if (fs.existsSync(defaultBaseFolder) === true && fs.statSync(defaultBaseFolder).isDirectory() === true) {
            fs.rmSync(defaultBaseFolder, { force: true, recursive: true })
        }
    }

    LogHandler (msg) {
        this.emit('log', `${_getDate()} ${msg}`)
    }

    DebugHandler (msg) {
        this.emit('debug', `${_getDate()} ${msg}`)
    }

    ErrorHandler (err) {
        if (err.code !== 'ECONNRESET') {
            console.error('error', `${_getDate()} ${util.inspect(err, { showHidden: false, depth: null, breakLength: 'Infinity' })}`)
        }
    }

    Handler (main, socket) {
        const connectionInfo = `[${socket.remoteAddress.replace(/::ffff:/g, '')}] [${socket.remotePort}]`
        const localAddr = socket.localAddress.replace(/::ffff:/g, '')
        const socketKey = ++main.lastSocketKey
        main.openSockets[socketKey] = socket
        let authenticated = false
        let isSecure = socket.encrypted || false
        let protection = false
        let username
        let basefolder = main._opt.cnf.basefolder
        let absolutePath = main._opt.cnf.basefolder
        let relativePath = '/'
        let renameFrom = ''
        let PBSZcompleted = false
        let addr = false
        let port = false
        let dataObj = {}
        let pasv = true
        let actv = false
        let ftpData = null
        let asciiOn = false
        let retrOffset = 0
        let allowFileCreate = false
        let allowFileRetrieve = false
        let allowFileOverwrite = false
        let allowFileDelete = false
        let allowFolderDelete = false
        let allowFolderCreate = false
        main.DebugHandler(`${connectionInfo} new FTP connection established`)

        const dataHandler = function (data) {
            try {
                data = data.toString()
                main.LogHandler(`${connectionInfo} < ${data.trim().replace(/^PASS\s.*$/i, 'PASS ***')}`)
                let cmd, arg
                [cmd, ...arg] = data.split(' ')
                cmd = cmd.trim()
                arg = arg.join(' ').trim()
                main.DebugHandler(`${connectionInfo} cmd[${cmd}] arg[${arg}]`)
                if (authenticated) {
                    if (Object.keys(authenticatedFunc).indexOf(cmd) >= 0) {
                        authenticatedFunc[cmd](cmd, arg)
                    } else {
                        main._writeToSocket(socket, '500', ' ', 'Command not implemented', connectionInfo, SocketStateAfterWrite.Open)
                    }
                } else if (Object.keys(preAuthFunctions).indexOf(cmd) >= 0) {
                    preAuthFunctions[cmd](cmd, arg)
                } else {
                    main._writeToSocket(socket, '530', ' ', 'Not logged in', connectionInfo, SocketStateAfterWrite.End)
                }
            } catch (err) {
                main._writeToSocket(socket, '550', ' ', `${err.message}`, connectionInfo, SocketStateAfterWrite.End)
            }
        }
        socket.on('data', dataHandler)
        socket.on('error', main.ErrorHandler)
        socket.on('close', () => {
            delete main.openSockets[socketKey]
            main.DebugHandler(`${connectionInfo} FTP connection closed`)
            if (ftpData) {
                ftpData.close()
            }
        })
        main._writeToSocket(socket, '220', ' ', 'Welcome', connectionInfo, SocketStateAfterWrite.Open)

        /*
         *  USER
         */
        const USER = function (cmd, arg) {
            username = arg
            const login = validateLoginType()
            switch (login) {
            case LoginType.None:
                return main._writeToSocket(socket, '530', ' ', 'Not logged in', connectionInfo, SocketStateAfterWrite.Open)
            case LoginType.Anonymous:
            case LoginType.Password:
                return main._writeToSocket(socket, '331', ' ', `Password required for ${username}`, connectionInfo, SocketStateAfterWrite.Open)
            case LoginType.NoPassword:
                authenticated = true
                return main._writeToSocket(socket, '232', ' ', 'User logged in', connectionInfo, SocketStateAfterWrite.Open)
            default:
                return main._writeToSocket(socket, '331', ' ', `Password required for ${username}`, connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  PASS
         */
        const PASS = function (cmd, arg) {
            if (authenticateUser(arg) === true) {
                authenticated = true
                main._writeToSocket(socket, '230', ' ', 'Logged on', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '530', ' ', 'Username or password incorrect', connectionInfo, SocketStateAfterWrite.Open)
                socket.end()
            }
        }

        /*
         *  AUTH
         */
        const AUTH = function (cmd, arg) {
            if (arg === 'TLS' || arg === 'SSL') {
                main._writeToSocket(socket, '234', ' ', `Using authentication type ${arg}`, connectionInfo, SocketStateAfterWrite.Open)
                socket = new tls.TLSSocket(socket, { isServer: true, secureContext: tls.createSecureContext(main._opt.tls) })
                socket.on('secure', () => {
                    main.DebugHandler(`${connectionInfo} secure connection established`)
                    isSecure = socket.encrypted
                })
                socket.on('data', dataHandler)
            } else {
                main._writeToSocket(socket, '504', ' ', `Unsupported auth type ${arg}`, connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        const preAuthFunctions = {
            USER: USER,
            PASS: PASS,
            AUTH: AUTH
        }

        /*
         *  QUIT
         */
        const QUIT = function (cmd, arg) {
            main._writeToSocket(socket, '221', ' ', 'Goodbye', connectionInfo, SocketStateAfterWrite.End)
        }

        /*
         *  PWD
         */
        const PWD = function (cmd, arg) {
            main._writeToSocket(socket, '257', ' ', `"${relativePath}" is current directory`, connectionInfo, SocketStateAfterWrite.Open)
        }

        /*
         *  CLNT
         */
        const CLNT = function (cmd, arg) {
            main._writeToSocket(socket, '200', ' ', 'Don\'t care', connectionInfo, SocketStateAfterWrite.Open)
        }

        /*
         *  PBSZ
         */
        const PBSZ = function (cmd, arg) {
            const size = arg
            PBSZcompleted = true
            main._writeToSocket(socket, '200', ' ', `PBSZ=${size}`, connectionInfo, SocketStateAfterWrite.Open)
        }

        /*
         *  OPTS
         */
        const OPTS = function (cmd, arg) {
            arg = arg.toLowerCase()
            if (arg === 'utf8 on') {
                main._writeToSocket(socket, '200', ' ', 'UTF8 ON', connectionInfo, SocketStateAfterWrite.Open)
            } else if (arg === 'utf8 off') {
                main._writeToSocket(socket, '200', ' ', 'UTF8 OFF', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '451', ' ', 'Not supported', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  PROT
         */
        const PROT = function (cmd, arg) {
            if (PBSZcompleted === true) {
                if (arg === 'C' || arg === 'P') {
                    protection = (arg === 'P')
                    main._writeToSocket(socket, '200', ' ', `Protection level is ${arg}`, connectionInfo, SocketStateAfterWrite.Open)
                } else {
                    main._writeToSocket(socket, '534', ' ', 'Protection level must be C or P', connectionInfo, SocketStateAfterWrite.Open)
                }
            } else {
                main._writeToSocket(socket, '503', ' ', 'PBSZ missing', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  FEAT
         */
        const FEAT = function (cmd, arg) {
            const features = Object.keys(preAuthFunctions).concat(Object.keys(authenticatedFunc)).join('\r\n ').replace('AUTH', 'AUTH TLS\r\n AUTH SSL')
            main._writeToSocket(socket, '211', '-', `Features:\r\n ${features}\r\n211 End`, connectionInfo, SocketStateAfterWrite.Open)
        }

        /*
         *  CWD
         */
        const CWD = function (cmd, arg) {
            let newPath = arg
            if (newPath.charAt(0) === '/') {
                let folder = path.join(basefolder, newPath)
                if (fs.existsSync(folder) === true && fs.statSync(folder).isDirectory() === true && main._beginsWith(basefolder, folder) === true) {
                    if (folder.charAt(folder.length - 1) !== '/') {
                        folder += '/'
                    }
                    if (newPath.charAt(newPath.length - 1) !== '/') {
                        newPath += '/'
                    }
                    absolutePath = folder
                    relativePath = newPath
                    return main._writeToSocket(socket, '250', ' ', `CWD successful. "${relativePath}" is current directory`, connectionInfo, SocketStateAfterWrite.Open)
                }
            } else if (newPath !== '..') {
                let folder = path.join(basefolder, relativePath, newPath)
                if (fs.existsSync(folder) === true && fs.statSync(folder).isDirectory() === true && main._beginsWith(basefolder, folder) === true) {
                    if (folder.charAt(folder.length - 1) !== '/') {
                        folder += '/'
                    }
                    if (newPath.charAt(newPath.length - 1) !== '/') {
                        newPath += '/'
                    }
                    absolutePath = folder
                    relativePath += newPath
                    return main._writeToSocket(socket, '250', ' ', `CWD successful. "${relativePath}" is current directory`, connectionInfo, SocketStateAfterWrite.Open)
                }
            } else if (newPath === '..') {
                if (relativePath !== '/') {
                    newPath = relativePath.split('/')
                    newPath.pop()
                    newPath.pop()
                    newPath = newPath.join('/') + '/'
                    const folder = path.join(basefolder, newPath)
                    if (fs.existsSync(folder) === true && fs.statSync(folder).isDirectory() === true && main._beginsWith(basefolder, folder) === true) {
                        absolutePath = folder
                        relativePath = newPath
                        return main._writeToSocket(socket, '250', ' ', `CWD successful. "${relativePath}" is current directory`, connectionInfo, SocketStateAfterWrite.Open)
                    }
                } else {
                    return main._writeToSocket(socket, '250', ' ', `CWD successful. "${relativePath}" is current directory`, connectionInfo, SocketStateAfterWrite.Open)
                }
            }
            return main._writeToSocket(socket, '530', ' ', 'CWD not successful', connectionInfo, SocketStateAfterWrite.Open)
        }

        /*
         *  SIZE
         */
        const SIZE = function (cmd, arg) {
            let file = arg
            if (file.charAt(0) === '/') {
                file = path.join(basefolder, file)
            } else {
                file = path.join(basefolder, relativePath, file)
            }
            if (fs.existsSync(file) === true && fs.statSync(file).isFile() === true && main._beginsWith(basefolder, file) === true) {
                main._writeToSocket(socket, '213', ' ', `${fs.statSync(file).size.toString()}`, connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '550', ' ', 'File not found', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  DELE
         */
        const DELE = function (cmd, arg) {
            let file = arg
            if (file.charAt(0) === '/') {
                file = path.join(basefolder, file)
            } else {
                file = path.join(basefolder, relativePath, file)
            }
            if (fs.existsSync(file) === true && fs.statSync(file).isFile() === true && main._beginsWith(basefolder, file) === true) {
                if (allowFileDelete) {
                    fs.unlinkSync(file)
                    main._writeToSocket(socket, '250', ' ', 'File deleted successfully', connectionInfo, SocketStateAfterWrite.Open)
                } else {
                    main._writeToSocket(socket, '550', ' ', 'Permission denied', connectionInfo, SocketStateAfterWrite.Open)
                }
            } else {
                main._writeToSocket(socket, '550', ' ', 'File not found', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  RMD
         *  RMDA
         */
        const RMD = function (cmd, arg) {
            let folder = arg
            if (folder.charAt(0) === '/') {
                folder = path.join(basefolder, folder)
            } else {
                folder = path.join(basefolder, relativePath, folder)
            }
            if (allowFolderDelete && main._beginsWith(basefolder, folder) === true) {
                if (fs.existsSync(folder) === true && fs.statSync(folder).isDirectory() === true) {
                    fs.rmSync(folder, { force: true, recursive: true })
                    main._writeToSocket(socket, '250', ' ', 'Folder deleted successfully', connectionInfo, SocketStateAfterWrite.Open)
                } else {
                    main._writeToSocket(socket, '550', ' ', 'Folder not found', connectionInfo, SocketStateAfterWrite.Open)
                }
            } else {
                main._writeToSocket(socket, '550', ' ', 'Permission denied', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  MKD
         */
        const MKD = function (cmd, arg) {
            let folder = arg
            if (folder.charAt(0) === '/') {
                folder = path.join(basefolder, folder)
            } else {
                folder = path.join(basefolder, relativePath, folder)
            }
            if (allowFolderCreate && main._beginsWith(basefolder, folder) === true) {
                if (fs.existsSync(folder) === true && fs.statSync(folder).isDirectory() === true) {
                    main._writeToSocket(socket, '550', ' ', 'Folder exists', connectionInfo, SocketStateAfterWrite.Open)
                } else {
                    fs.mkdirSync(folder, { recursive: true })
                    main._writeToSocket(socket, '250', ' ', 'Folder created successfully', connectionInfo, SocketStateAfterWrite.Open)
                }
            } else {
                main._writeToSocket(socket, '550', ' ', 'Permission denied', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  LIST
         *  MLSD
         */
        const LIST = function (cmd, arg) {
            dataObj.method = function (obj) {
                if (obj.dataSocket && obj.cmdSocket && obj.absolutePath) {
                    if (asciiOn) {
                        obj.dataSocket.setEncoding('ascii')
                    }
                    const read = fs.readdirSync(obj.absolutePath)
                    let listData = ''
                    for (let i = 0; i < read.length; i++) {
                        let line
                        const file = path.join(obj.absolutePath, read[i].trim())
                        const stat = fs.statSync(file)
                        if (obj.MLSD === true) {
                            const size = (fs.statSync(file).isDirectory() === true) ? '' : 'size=' + stat.size.toString() + ';'
                            line = util.format('type=%s;modify=%s;%s %s\r\n', (stat.isDirectory() === true) ? 'dir' : 'file'
                                , main._getDateForMLSD(stat.mtime)
                                , size
                                , read[i].trim())
                        } else {
                            let size = (fs.statSync(file).isDirectory() === true) ? '0' : stat.size.toString()
                            size = new Array(14 - size.length).join(' ') + size
                            line = util.format('%s 1 %s %s %s %s %s\r\n', (stat.isDirectory() === true) ? 'dr--r--r--' : '-r--r--r--'
                                , username
                                , username
                                , size
                                , main._getDateForLIST(stat.mtime)
                                , read[i].trim())
                        }
                        listData += line
                    }
                    if (listData.length === 0) {
                        listData = '\r\n'
                    }
                    main.DebugHandler(`${connectionInfo} LIST response on data channel\r\n${listData}`)
                    obj.dataSocket.end(listData)
                    main._writeToSocket(obj.cmdSocket, '226', ' ', `Successfully transferred "${relativePath}"`, connectionInfo, SocketStateAfterWrite.Open)
                }
            }
            dataObj.MLSD = (cmd === 'MLSD')
            dataObj.cmdSocket = socket
            dataObj.absolutePath = absolutePath
            openDataChannel(dataObj)
        }

        /*
         *  PORT
         */
        const PORT = function (cmd, arg) {
            pasv = false
            actv = false
            const cmdData = arg.split(',')
            if (cmdData.length === 6) {
                addr = cmdData[0] + '.' + cmdData[1] + '.' + cmdData[2] + '.' + cmdData[3]
                port = (parseInt(cmdData[4], 10) * 256) + parseInt(cmdData[5])
                actv = true
                main._writeToSocket(socket, '200', ' ', 'Port command successful', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '501', ' ', 'Port command failed', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  PASV
         */
        const PASV = function (cmd, arg) {
            ftpData = setupDataChannel()
            pasv = false
            actv = false
            main._getDataPort((port) => {
                ftpData.listen(port, () => {
                    main.DebugHandler(`${connectionInfo} listening on ${ftpData.address().port} for data connection`)
                    dataObj = {}
                    pasv = true
                    const p1 = (ftpData.address().port) / 256 | 0
                    const p2 = (ftpData.address().port) % 256
                    const pasvData = util.format('Entering passive mode (%s,%d,%d)', localAddr.split('.').join(','), p1, p2)
                    main._writeToSocket(socket, '227', ' ', `${pasvData}`, connectionInfo, SocketStateAfterWrite.Open)
                })
            })
        }

        /*
         *  EPRT
         */
        const EPRT = function (cmd, arg) {
            pasv = false
            actv = false
            const cmdData = arg.split('|')
            if (cmdData.length === 5) {
                addr = cmdData[2]
                port = parseInt(cmdData[3], 10)
                actv = true
                main._writeToSocket(socket, '200', ' ', 'Extended Port command successful', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '501', ' ', 'Extended port command failed', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  EPSV
         */
        const EPSV = function (cmd, arg) {
            ftpData = setupDataChannel()
            pasv = false
            actv = false
            main._getDataPort((port) => {
                ftpData.listen(port, () => {
                    main.DebugHandler(`${connectionInfo} listening on ${ftpData.address().port} for data connection`)
                    dataObj = {}
                    pasv = true
                    const pasvData = util.format('Entering extended passive mode (|||%d|)', ftpData.address().port)
                    main._writeToSocket(socket, '229', ' ', `${pasvData}`, connectionInfo, SocketStateAfterWrite.Open)
                })
            })
        }

        /*
         *  RETR
         */
        const RETR = function (cmd, arg) {
            const relativeFile = arg
            let file
            if (relativeFile.charAt(0) === '/') {
                file = path.join(basefolder, relativeFile)
            } else {
                file = path.join(basefolder, relativePath, relativeFile)
            }
            if (fs.existsSync(file) === true && allowFileRetrieve === false) {
                return main._writeToSocket(socket, '550', ' ', `Transfer failed "${relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
            }
            if (fs.existsSync(file) === true && fs.statSync(file).isFile() === true && main._beginsWith(basefolder, file) === true) {
                dataObj.method = async function (obj) {
                    if (obj.dataSocket && obj.cmdSocket && obj.file && obj.relativeFile) {
                        asciiOn && obj.dataSocket.setEncoding('ascii')
                        if (obj.handler) {
                            const data = await obj.handler(username, relativePath, obj.fileName, retrOffset)
                            retrOffset = 0
                            obj.dataSocket.write(data)
                            obj.dataSocket.end()
                            main._writeToSocket(obj.cmdSocket, '226', ' ', `Successfully transferred "${obj.relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
                        } else {
                            const streamOpts = {
                                flags: 'r',
                                start: retrOffset,
                                encoding: asciiOn ? 'ascii' : null,
                                autoClose: true,
                                emitClose: true
                            }
                            retrOffset = 0
                            const stream = fs.createReadStream(obj.file, streamOpts)
                            stream.on('error', main.ErrorHandler)
                            stream.on('open', () => {
                                obj.dataSocket.on('close', () => {
                                    if (!obj.dataSocket.destroyed) {
                                        stream.destroy()
                                        main._writeToSocket(obj.cmdSocket, '426', ' ', `Connection closed. Aborted transfer of "${obj.relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
                                    }
                                })
                                stream.pipe(obj.dataSocket)
                            })
                            stream.on('end', () => {
                                obj.dataSocket.end()
                                main._writeToSocket(obj.cmdSocket, '226', ' ', `Successfully transferred "${obj.relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
                            })
                        }
                    }
                }
                dataObj.cmdSocket = socket
                dataObj.file = file
                dataObj.fileName = path.basename(file)
                dataObj.relativeFile = relativeFile
                dataObj.handler = main._opt.cnf.downloadHandler
                openDataChannel(dataObj)
            } else {
                main._writeToSocket(socket, '550', ' ', 'File not found', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  REST
         */
        const REST = function (cmd, arg) {
            const offset = parseInt(arg, 10)
            if (offset > -1) {
                retrOffset = offset
                main._writeToSocket(socket, '350', ' ', `Restarting at ${retrOffset}`, connectionInfo, SocketStateAfterWrite.Open)
            } else {
                retrOffset = 0
                main._writeToSocket(socket, '550', ' ', 'Wrong restart offset', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  STOR
         */
        const STOR = function (cmd, arg) {
            const relativeFile = arg
            let file
            if (relativeFile.charAt(0) === '/') {
                file = path.join(basefolder, relativeFile)
            } else {
                file = path.join(basefolder, relativePath, relativeFile)
            }
            if (fs.existsSync(file) === true && allowFileOverwrite === false) {
                return main._writeToSocket(socket, '550', ' ', 'File already exists', connectionInfo, SocketStateAfterWrite.Open)
            }
            if (fs.existsSync(file) === false && allowFileCreate === false) {
                return main._writeToSocket(socket, '550', ' ', `Transfer failed "${relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
            }
            if (main._beginsWith(basefolder, file) === true) {
                dataObj.cmdSocket = socket
                dataObj.file = file
                dataObj.fileName = path.basename(file)
                dataObj.relativeFile = relativeFile
                dataObj.handler = main._opt.cnf.uploadHandler
                dataObj.method = function (obj) {
                    if (obj.dataSocket && obj.cmdSocket && obj.relativeFile) {
                        if (asciiOn) {
                            obj.dataSocket.setEncoding('ascii')
                        }
                        if (obj.handler) {
                            const data = []
                            obj.dataSocket.on('data', (d) => data.push(d))
                            obj.dataSocket.on('close', async () => {
                                await obj.handler(username, relativePath, obj.fileName, Buffer.concat(data), obj.retrOffset)
                                main._writeToSocket(obj.cmdSocket, '226', ' ', `Successfully transferred "${obj.relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
                            })
                        } else if (obj.stream) {
                            obj.dataSocket.on('close', () => {
                                obj.stream.destroy()
                                main._writeToSocket(obj.cmdSocket, '226', ' ', `Successfully transferred "${obj.relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
                            })
                            obj.dataSocket.pipe(obj.stream)
                        }
                    }
                }
                if (dataObj.handler) {
                    dataObj.retrOffset = retrOffset
                    retrOffset = 0
                    openDataChannel(dataObj)
                } else {
                    const streamOpts = {
                        flags: retrOffset > 0 ? 'a+' : 'w',
                        start: retrOffset,
                        encoding: asciiOn ? 'ascii' : null,
                        autoClose: true,
                        emitClose: true
                    }
                    retrOffset = 0
                    const stream = fs.createWriteStream(file, streamOpts)
                    stream.on('error', main.ErrorHandler)
                    stream.on('open', () => {
                        dataObj.stream = stream
                        openDataChannel(dataObj)
                    })
                    stream.on('end', () => {
                        if (dataObj.dataSocket) {
                            dataObj.dataSocket.end()
                        }
                        main._writeToSocket(socket, '550', ' ', `Transfer failed "${relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
                    })
                }
            } else {
                main._writeToSocket(socket, '550', ' ', `Transfer failed "${relativeFile}"`, connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  SYST
         */
        const SYST = function (cmd, arg) {
            main._writeToSocket(socket, '215', ' ', 'UNIX', connectionInfo, SocketStateAfterWrite.Open)
        }

        /*
         *  TYPE
         */
        const TYPE = function (cmd, arg) {
            if (arg === 'A') {
                asciiOn = true
                main._writeToSocket(socket, '200', ' ', 'Type set to ASCII', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                asciiOn = false
                main._writeToSocket(socket, '200', ' ', 'Type set to BINARY', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  RNFR
         */
        const RNFR = function (cmd, arg) {
            const relativeFile = arg
            let file
            if (relativeFile.charAt(0) === '/') {
                file = path.join(basefolder, relativeFile)
            } else {
                file = path.join(basefolder, relativePath, relativeFile)
            }
            if (fs.existsSync(file) === true && fs.statSync(file).isFile() === true && main._beginsWith(basefolder, file) === true) {
                renameFrom = file
                main._writeToSocket(socket, '350', ' ', 'File exists', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '550', ' ', 'File does not exist', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  RNTO
         */
        const RNTO = function (cmd, arg) {
            const relativeFile = arg
            let file
            if (relativeFile.charAt(0) === '/') {
                file = path.join(basefolder, relativeFile)
            } else {
                file = path.join(basefolder, relativePath, relativeFile)
            }
            if (fs.existsSync(file) === false && main._beginsWith(basefolder, file) === true) {
                fs.renameSync(renameFrom, file)
                renameFrom = ''
                main._writeToSocket(socket, '250', ' ', 'File renamed successfully', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '550', ' ', 'File already exists', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        /*
         *  MFMT
         */
        const MFMT = function (cmd, arg) {
            let time, file
            [time, file] = arg.split(' ')
            if (file.charAt(0) === '/') {
                file = path.join(basefolder, file)
            } else {
                file = path.join(basefolder, relativePath, file)
            }
            if (fs.existsSync(file) === true && fs.statSync(file).isFile() === true && main._beginsWith(basefolder, file) === true) {
                const mtime = main._getDateForMFMT(time)
                fs.utimesSync(file, mtime, mtime)
                main._writeToSocket(socket, '253', ' ', 'Date/time changed okay', connectionInfo, SocketStateAfterWrite.Open)
            } else {
                main._writeToSocket(socket, '550', ' ', 'File does not exist', connectionInfo, SocketStateAfterWrite.Open)
            }
        }

        const authenticatedFunc = {
            QUIT: QUIT,
            PWD: PWD,
            CLNT: CLNT,
            PBSZ: PBSZ,
            OPTS: OPTS,
            PROT: PROT,
            FEAT: FEAT,
            CWD: CWD,
            SIZE: SIZE,
            DELE: DELE,
            RMD: RMD,
            RMDA: RMD,
            MKD: MKD,
            LIST: LIST,
            MLSD: LIST,
            PORT: PORT,
            PASV: PASV,
            EPRT: EPRT,
            EPSV: EPSV,
            RETR: RETR,
            REST: REST,
            STOR: STOR,
            SYST: SYST,
            TYPE: TYPE,
            RNFR: RNFR,
            RNTO: RNTO,
            MFMT: MFMT,
            MDTM: MFMT
        }

        const validateLoginType = function () {
            let login = LoginType.None
            if (username === 'anonymous' && main._opt.cnf.allowAnonymousLogin) {
                login = LoginType.Anonymous
            } else if (main._opt.cnf.user.length > 0) {
                for (let i = 0; i < main._opt.cnf.user.length; i++) {
                    const u = Object.assign({}, UserDefaults, main._opt.cnf.user[i])
                    if (typeof u === 'object' && username === u.username) {
                        if (Object.prototype.hasOwnProperty.call(u, 'allowLoginWithoutPassword') && u.allowLoginWithoutPassword === true) {
                            setUserRights(u)
                            login = LoginType.NoPassword
                        } else {
                            login = LoginType.Password
                        }
                        break
                    }
                }
            } else if (username === main._opt.cnf.username) {
                if (main._opt.cnf.allowLoginWithoutPassword === true) {
                    setUserRights(main._opt.cnf)
                    login = LoginType.NoPassword
                } else {
                    login = LoginType.Password
                }
            }
            return login
        }

        const authenticateUser = function (password) {
            let success = false
            if (username === 'anonymous' && main._opt.cnf.allowAnonymousLogin) {
                allowFileCreate = main._opt.cnf.allowAnonymousFileCreate
                allowFileRetrieve = main._opt.cnf.allowAnonymousFileRetrieve
                allowFileOverwrite = main._opt.cnf.allowAnonymousFileOverwrite
                allowFileDelete = main._opt.cnf.allowAnonymousFileDelete
                allowFolderDelete = main._opt.cnf.allowAnonymousFolderDelete
                allowFolderCreate = main._opt.cnf.allowAnonymousFolderCreate
                success = true
            } else if (main._opt.cnf.user.length > 0) {
                for (let i = 0; i < main._opt.cnf.user.length; i++) {
                    const u = Object.assign({}, UserDefaults, main._opt.cnf.user[i])
                    if (typeof u === 'object' && username === u.username && (u.allowLoginWithoutPassword === true || password === u.password)) {
                        setUserRights(u)
                        success = true
                        break
                    }
                }
            } else if (username === main._opt.cnf.username && (main._opt.cnf.allowLoginWithoutPassword === true || password === main._opt.cnf.password)) {
                setUserRights(main._opt.cnf)
                success = true
            }
            main.DebugHandler(`${connectionInfo} authenticateUser success[${success}] username[${username}]`)
            return success
        }

        const setUserRights = function (obj) {
            if (Object.prototype.hasOwnProperty.call(obj, 'basefolder') && fs.existsSync(obj.basefolder) && fs.statSync(obj.basefolder).isDirectory()) {
                basefolder = obj.basefolder
                absolutePath = obj.basefolder
            }
            Object.prototype.hasOwnProperty.call(obj, 'allowUserFileCreate') && (allowFileCreate = obj.allowUserFileCreate)
            Object.prototype.hasOwnProperty.call(obj, 'allowUserFileRetrieve') && (allowFileRetrieve = obj.allowUserFileRetrieve)
            Object.prototype.hasOwnProperty.call(obj, 'allowUserFileOverwrite') && (allowFileOverwrite = obj.allowUserFileOverwrite)
            Object.prototype.hasOwnProperty.call(obj, 'allowUserFileDelete') && (allowFileDelete = obj.allowUserFileDelete)
            Object.prototype.hasOwnProperty.call(obj, 'allowUserFolderDelete') && (allowFolderDelete = obj.allowUserFolderDelete)
            Object.prototype.hasOwnProperty.call(obj, 'allowUserFolderCreate') && (allowFolderCreate = obj.allowUserFolderCreate)
        }

        const setupDataChannel = function () {
            if (ftpData) {
                ftpData.close()
            }
            let dataChannel
            if (isSecure === true && protection === true) {
                dataChannel = tls.Server(main._opt.tls)
                dataChannel.on('secureConnection', (pasvSocket) => {
                    main.DebugHandler(`${connectionInfo} data connection established`)
                    dataObj.dataSocket = pasvSocket
                    if (dataObj.method) {
                        dataObj.method(dataObj)
                    }
                })
            } else {
                dataChannel = net.Server()
                dataChannel.on('connection', (pasvSocket) => {
                    if (isSecure === true && protection === true) {
                        pasvSocket = new tls.TLSSocket(pasvSocket, { isServer: true, secureContext: tls.createSecureContext(main._opt.tls) })
                        pasvSocket.on('secure', () => {
                            main.DebugHandler(`${connectionInfo} data connection is secure`)
                            dataObj.dataSocket = pasvSocket
                            if (dataObj.method) {
                                dataObj.method(dataObj)
                            }
                        })
                    } else {
                        dataObj.dataSocket = pasvSocket
                        if (dataObj.method) {
                            dataObj.method(dataObj)
                        }
                    }
                    main.DebugHandler(`${connectionInfo} data connection established`)
                })
            }
            dataChannel.on('error', main.ErrorHandler)
            dataChannel.maxConnections = main._opt.cnf.maxConnections
            return dataChannel
        }

        const openDataChannel = function (obj) {
            if (actv === true || pasv === true) {
                main._writeToSocket(socket, '150', ' ', 'Opening data channel', connectionInfo, SocketStateAfterWrite.Open)
                if (actv === true) {
                    main.DebugHandler(`${connectionInfo} openDataChannel isSecure[${isSecure}] protection[${protection}] addr[${addr}] port[${port}]`)
                    const client = net.connect(port, addr, () => {
                        if (isSecure === true && protection === true) {
                            const activeSocket = new tls.TLSSocket(client, { isServer: true, secureContext: tls.createSecureContext(main._opt.tls) })
                            activeSocket.on('secure', () => {
                                main.DebugHandler(`${connectionInfo} data connection is secure`)
                                dataObj.dataSocket = activeSocket
                                dataObj.method(dataObj)
                            })
                        } else {
                            obj.dataSocket = client
                            obj.method(obj)
                        }
                    })
                    client.on('error', main.ErrorHandler)
                } else {
                    obj.method(obj)
                }
            } else {
                main._writeToSocket(socket, '501', ' ', 'Command failed', connectionInfo, SocketStateAfterWrite.Open)
            }
        }
    }

    _writeToSocket (socket, code, delimiter, message, connectionInfo, socketState) {
        this.LogHandler(`${connectionInfo} > ${code}${delimiter}${message}`)
        socket.writable && socket.write(Buffer.from(`${code}${delimiter}${message}\r\n`))
        socketState === SocketStateAfterWrite.End && socket.end()
    }

    _beginsWith (needle, haystack) {
        return haystack.startsWith(needle)
    }

    _getDataPort (resolve) {
        if (this._opt.cnf.minDataPort > 0 && this._opt.cnf.minDataPort < 65535) {
            const testPort = function (port) {
                const server = net.createServer()
                server.once('error', function (_err) {
                    if (port > (this._opt.cnf.minDataPort + this._opt.cnf.maxConnections)) {
                        resolve(0)
                    } else {
                        testPort(port + 1)
                    }
                })
                server.once('listening', function () {
                    server.close()
                })
                server.once('close', function () {
                    resolve(port)
                })
                server.listen(port)
            }
            testPort(this._opt.cnf.minDataPort)
        } else {
            resolve(0)
        }
    }

    _getDateForLIST (mtime) {
        const shortMonth = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const now = new Date(mtime)
        const MM = shortMonth[now.getMonth()]
        const DD = now.getDate().toString().padStart(2, '0')
        const H = now.getHours().toString().padStart(2, '0')
        const M = now.getMinutes().toString().padStart(2, '0')
        return `${MM} ${DD} ${H}:${M}`
    }

    _getDateForMLSD (mtime) {
        const now = new Date(mtime)
        const MM = (now.getMonth() + 1).toString().padStart(2, '0')
        const DD = now.getDate().toString().padStart(2, '0')
        const H = now.getHours().toString().padStart(2, '0')
        const M = now.getMinutes().toString().padStart(2, '0')
        const S = now.getSeconds().toString().padStart(2, '0')
        return `${now.getFullYear()}${MM}${DD}${H}${M}${S}`
    }

    _getDateForMFMT (time) {
        const Y = time.substr(0, 4)
        const M = time.substr(4, 2)
        const D = time.substr(6, 2)
        const Hrs = time.substr(8, 2)
        const Min = time.substr(10, 2)
        const Sec = time.substr(12, 2)
        return (Date.parse(`${Y}-${M}-${D}T${Hrs}:${Min}:${Sec}+00:00`) / 1000)
    }
}

const _getDate = (date) => {
    const now = date || (new Date())
    const MM = (now.getMonth() + 1).toString().padStart(2, '0')
    const DD = now.getDate().toString().padStart(2, '0')
    const H = now.getHours().toString().padStart(2, '0')
    const M = now.getMinutes().toString().padStart(2, '0')
    const S = now.getSeconds().toString().padStart(2, '0')
    return `${DD}.${MM}.${now.getFullYear()} - ${H}:${M}:${S}`
}

util.inherits(ftpd, EventEmitter)

module.exports = {
    ftpd
}
