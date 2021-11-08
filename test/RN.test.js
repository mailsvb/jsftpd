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

test('test RNFR message file does not exist', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
        }
    ]
    server = new ftpd({cnf: {port: 50021, user: users}})
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
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('RNFR myothertestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('550 File does not exist')

    await promiseSocket.end()
})

test('test RNFR/RNTO message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
        }
    ]
    server = new ftpd({cnf: {port: 50021, user: users}})
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
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('RNFR /mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('350 File exists')

    await promiseSocket.write('RNTO /someotherfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('250 File renamed successfully')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('MLSD')
    content = await promiseSocket.read()

    dataContent = await promiseDataSocket.read()
    expect(dataContent.toString().trim()).toMatch('type=file')
    expect(dataContent.toString().trim()).toMatch('size=15')
    expect(dataContent.toString().trim()).toMatch('someotherfile')
    await promiseDataSocket.end()

    await sleep(100)

    content += await promiseSocket.read()
    expect(content.toString().trim()).toMatch('150 Opening data channel')
    expect(content.toString().trim()).toMatch('226 Successfully transferred "/"')

    await promiseSocket.end()
})

test('test RNFR/RNTO message using handlers', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
        }
    ]
    const rn = jest.fn().mockImplementationOnce(() => Promise.resolve(true))
    server = new ftpd({cnf: {port: 50021, user: users}, hdl: {rename: rn}})
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

    await promiseSocket.write('RNFR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('350 File exists')

    await promiseSocket.write('RNTO someotherfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('250 File renamed successfully')

    expect(rn).toBeCalledTimes(1)
    expect(rn).toHaveBeenCalledWith('john', '/', 'mytestfile', 'someotherfile')

    await promiseSocket.end()
})

test('test RNFR/RNTO message using handlers failing', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
        }
    ]
    const rn = jest.fn().mockImplementationOnce(() => Promise.resolve(false))
    server = new ftpd({cnf: {port: 50021, user: users}, hdl: {rename: rn}})
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

    await promiseSocket.write('RNFR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('350 File exists')

    await promiseSocket.write('RNTO someotherfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('550 File rename failed')

    expect(rn).toBeCalledTimes(1)
    expect(rn).toHaveBeenCalledWith('john', '/', 'mytestfile', 'someotherfile')

    await promiseSocket.end()
})

test('test RNFR/RNTO message file already exists', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
        }
    ]
    server = new ftpd({cnf: {port: 50021, user: users}})
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
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT')
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('RNFR /mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('350 File exists')

    await promiseSocket.write('RNTO mytestfile')
    content = await promiseSocket.read()
    expect(content.toString().trim()).toBe('550 File already exists')

    await promiseSocket.end()
})
