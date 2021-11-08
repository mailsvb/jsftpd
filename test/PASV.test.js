const { ftpd } = require('../index')
const net = require('net')
const tls = require('tls')
const {PromiseSocket, TimeoutError} = require('promise-socket')
const { sleep } = require('./utils')

jest.setTimeout(1000)
let server, content, dataContent = null

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
        port: 50021,
        user: users,
        minDataPort: 50021,
        maxConnections: 1
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('PASV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('227 Entering passive mode (127,0,0,1,195,102)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(50022, 'localhost')

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
        port: 50021,
        user: users,
        minDataPort: 50021,
        maxConnections: 0
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
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
        port: 50021,
        user: users,
        minDataPort: 70000,
        maxConnections: 0
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
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
        port: 50021,
        user: users,
        minDataPort: 50021,
        maxConnections: 1
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||50022|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(50022, 'localhost')

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
        port: 50021,
        user: users,
        minDataPort: 50021,
        maxConnections: 0
    }
    server = new ftpd({cnf: config})
    expect(server).toBeInstanceOf(ftpd)
    server.start()

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
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
