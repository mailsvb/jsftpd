const { ftpd } = require('../index')
const util = require('util')
const net = require('net')
const tls = require('tls')
const {PromiseSocket, TimeoutError} = require('promise-socket')

let server

afterEach(() => {
    if (server) {
        server.stop()
        server.cleanup()
        server = null
    }
});

test('test LIST message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFolderCreate: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, user: users}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    let content

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('MKD john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 Folder created successfully')

    await promiseSocket.write('PASV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('227 Entering passive mode (127,0,0,1,4,0)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('LIST')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    content = await promiseDataSocket.read();
    expect(content.toString().trim()).toMatch('dr--r--r--')
    expect(content.toString().trim()).toMatch('john john')
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "/"')

    await promiseSocket.end()
});

test('test MLSD message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFolderCreate: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, user: users}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    let content

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('MKD john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 Folder created successfully')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('MLSD')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    content = await promiseDataSocket.read();
    expect(content.toString().trim()).toMatch('type=dir')
    expect(content.toString().trim()).toMatch('john')
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "/"')

    await promiseSocket.end()
});

test('test MLSD message over secure connection', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
        }
    ]
    server = new ftpd({cnf: {port: 50021, user: users}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    let content

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('AUTH NONE')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('504 Unsupported auth type NONE')

    await promiseSocket.write('AUTH TLS')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('234 Using authentication type TLS')

    promiseSocket = new PromiseSocket(new tls.connect({socket: socket, rejectUnauthorized: false}))
    await promiseSocket.stream.once('secureConnect', function(){})

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('PBSZ 0')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 PBSZ=0')

    await promiseSocket.write('PROT P')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 Protection level is P')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new tls.connect(1024, 'localhost', {rejectUnauthorized: false}))
    let dataSocket = promiseDataSocket.stream
    await dataSocket.once('secureConnect', function(){})

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.end()
});


test('test MLSD message with handler', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFolderCreate: true
        }
    ]
    const ls = jest.fn().mockImplementationOnce(() => Promise.resolve(Buffer.from('')));
    server = new ftpd({cnf: {port: 50021, user: users}, hdl: {list: ls}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    let content

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('MLSD')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    content = await promiseDataSocket.read();
    expect(content.toString().trim()).toBe('')
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "/"')

    await promiseSocket.end()
});
