const { ftpd } = require('../index')
const net = require('net')
const tls = require('tls')
const {PromiseSocket, TimeoutError} = require('promise-socket')
const { sleep, getCmdPortTCP, getDataPort, formatPort } = require('./utils')

jest.setTimeout(5000)
let server, content, dataContent = null
const cmdPortTCP = getCmdPortTCP()
const dataPort = getDataPort()

const cleanup = function() {
    if (server) {
        server.stop()
        server.cleanup()
        server = null
    }
    content = ''
    dataContent = ''
}
beforeEach(() => cleanup())
afterEach(() => cleanup())

test('test PASV message takes next free port', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    const config = {
        port: cmdPortTCP,
        user: users,
        minDataPort: cmdPortTCP,
        maxConnections: 1
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(cmdPortTCP, 'localhost')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('232 User logged in')

    const passiveModeData = formatPort('127.0.0.1', (cmdPortTCP + 1))
    await promiseSocket.write('PASV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe(`227 Entering passive mode (${passiveModeData})`)

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect((cmdPortTCP + 1), 'localhost')

    await promiseSocket.write('LIST')
    content = await promiseSocket.read()

    dataContent = await promiseDataSocket.read()
    expect(dataContent.toString().trim()).toBe('')
    await promiseDataSocket.end()

    await sleep(100)

    content += await promiseSocket.read()
    expect(content.toString().trim()).toMatch('150 Opening data channel')
    expect(content.toString().trim()).toMatch('226 Successfully transferred "/"')

    await promiseSocket.end()
})

test('test PASV message fails port unavailable', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    const config = {
        port: cmdPortTCP,
        user: users,
        minDataPort: cmdPortTCP,
        maxConnections: 0
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(cmdPortTCP, 'localhost')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('PASV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('501 Passive command failed')

    await promiseSocket.end()
})

test('test PASV message fails port range fails', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    const config = {
        port: cmdPortTCP,
        user: users,
        minDataPort: 70000,
        maxConnections: 0
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(cmdPortTCP, 'localhost')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('PASV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('501 Passive command failed')

    await promiseSocket.end()
})


test('test EPSV message takes next free port', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    const config = {
        port: cmdPortTCP,
        user: users,
        minDataPort: cmdPortTCP,
        maxConnections: 1
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(cmdPortTCP, 'localhost')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${(cmdPortTCP + 1)}|)`)

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect((cmdPortTCP + 1), 'localhost')

    await promiseSocket.write('LIST')
    content = await promiseSocket.read()

    dataContent = await promiseDataSocket.read()
    expect(dataContent.toString().trim()).toBe('')
    await promiseDataSocket.end()

    await sleep(100)

    content += await promiseSocket.read()
    expect(content.toString().trim()).toMatch('150 Opening data channel')
    expect(content.toString().trim()).toMatch('226 Successfully transferred "/"')

    await promiseSocket.end()
})

test('test EPSV message fails port unavailable', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    const config = {
        port: cmdPortTCP,
        user: users,
        minDataPort: cmdPortTCP,
        maxConnections: 0
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(cmdPortTCP, 'localhost')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('501 Extended passive command failed')

    await promiseSocket.end()
})
