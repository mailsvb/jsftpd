const { ftpd } = require('../index')
const net = require('net')
const tls = require('tls')
const {PromiseSocket, TimeoutError} = require('promise-socket')
const { sleep, getCmdPortTCP, getDataPort } = require('./utils')

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

test('test RETR message not allowed', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileRetrieve: false
        }
    ]
    server = new ftpd({cnf: {port: cmdPortTCP, user: users, minDataPort: dataPort}})
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
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('RETR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('550 Transfer failed "mytestfile"')

    await promiseSocket.end()
})

test('test RETR message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileRetrieve: true
        }
    ]
    server = new ftpd({cnf: {port: cmdPortTCP, user: users, minDataPort: dataPort}})
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
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('RETR /someotherfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('550 File not found')

    await promiseSocket.write('RETR mytestfile')

    dataContent = await promiseDataSocket.read()
    expect(dataContent.toString().trim()).toMatch('SOMETESTCONTENT')
    await promiseDataSocket.end()

    await sleep(100)

    content = await promiseSocket.read()
    expect(content.toString().trim()).toMatch('150 Opening data channel')
    expect(content.toString().trim()).toMatch('226 Successfully transferred "mytestfile"')

    await promiseSocket.end()
})

test('test RETR message with ASCII', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileRetrieve: true
        }
    ]
    server = new ftpd({cnf: {port: cmdPortTCP, user: users, minDataPort: dataPort}})
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

    await promiseSocket.write('TYPE A')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('200 Type set to ASCII')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    dataSocket.setEncoding('ascii')
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    dataSocket.setEncoding('ascii')
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('RETR /someotherfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('550 File not found')

    await promiseSocket.write('RETR mytestfile')

    dataContent = await promiseDataSocket.read()
    expect(dataContent.toString().trim()).toMatch('SOMETESTCONTENT')
    await promiseDataSocket.end()

    await sleep(100)

    content = await promiseSocket.read()
    expect(content.toString().trim()).toMatch('150 Opening data channel')
    expect(content.toString().trim()).toMatch('226 Successfully transferred "mytestfile"')

    await promiseSocket.end()
})

test('test RETR message with handler', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileRetrieve: true
        }
    ]
    const dl = jest.fn().mockImplementationOnce(() => Promise.resolve(Buffer.from('SOMETESTCONTENT')))
    const ul = jest.fn().mockImplementationOnce(() => Promise.resolve(true))
    server = new ftpd({cnf: {port: cmdPortTCP, user: users, minDataPort: dataPort}, hdl: {download: dl, upload: ul}})
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
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('RETR mytestfile')

    dataContent = await promiseDataSocket.read()
    expect(dataContent.toString().trim()).toMatch('SOMETESTCONTENT')
    await promiseDataSocket.end()

    await sleep(100)

    content = await promiseSocket.read()
    expect(content.toString().trim()).toMatch('150 Opening data channel')
    expect(content.toString().trim()).toMatch('226 Successfully transferred "mytestfile"')

    expect(ul).toBeCalledTimes(1)
    expect(dl).toBeCalledTimes(1)

    await promiseSocket.end()
})

test('test RETR message with handler fails', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileRetrieve: true
        }
    ]
    const dl = jest.fn().mockImplementationOnce(() => Promise.resolve('SOMETESTCONTENT'))
    const ul = jest.fn().mockImplementationOnce(() => Promise.resolve(true))
    server = new ftpd({cnf: {port: cmdPortTCP, user: users, minDataPort: dataPort}, hdl: {download: dl, upload: ul}})
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
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe(`229 Entering extended passive mode (|||${dataPort}|)`)

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(dataPort, 'localhost')

    await promiseSocket.write('RETR mytestfile')

    dataContent = await promiseDataSocket.read()
    expect(dataContent).toBe(undefined)
    await promiseDataSocket.end()

    await sleep(100)

    content = await promiseSocket.read()
    expect(content.toString().trim()).toMatch('150 Opening data channel')
    expect(content.toString().trim()).toMatch('550 Transfer failed "mytestfile"')

    expect(ul).toBeCalledTimes(1)
    expect(dl).toBeCalledTimes(1)

    await promiseSocket.end()
})

test('test RETR message no active or passive mode', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileRetrieve: true
        }
    ]
    server = new ftpd({cnf: {port: cmdPortTCP, user: users}})
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

    await promiseSocket.write('PORT WRONG')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('501 Port command failed')

    server._useHdl = true

    await promiseSocket.write('RETR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('501 Command failed')

    await promiseSocket.end()
})
