const { ftpd } = require('../index')
const net = require('net')
const {PromiseSocket, TimeoutError} = require('promise-socket')

let server

afterEach(() => {
    server.stop()
    server.cleanup()
    server = null
});

test('create ftpd instance without options created with default values', () => {
    server = new ftpd()
    expect(server).toBeInstanceOf(ftpd);
    expect(server._opt.cnf.allowAnonymousFileDelete).toBeFalsy()
    expect(server._opt.cnf.allowAnonymousFolderCreate).toBeFalsy()
    expect(server._opt.cnf.allowAnonymousFolderDelete).toBeFalsy()
    expect(server._opt.cnf.allowAnonymousLogin).toBeFalsy()
    expect(server._opt.cnf.allowLoginWithoutPassword).toBeFalsy()
    expect(server._opt.cnf.allowUserFileDelete).toBeTruthy()
    expect(server._opt.cnf.allowUserFileOverwrite).toBeTruthy()
    expect(server._opt.cnf.allowUserFolderCreate).toBeTruthy()
    expect(server._opt.cnf.allowUserFolderDelete).toBeTruthy()
    expect(server._opt.cnf.allowUserFolderDelete).toBeTruthy()
    expect(server._opt.cnf.allowUserFolderDelete).toBeTruthy()
    expect(server._opt.cnf.port).toBe(21)
    expect(server._opt.cnf.securePort).toBe(990)
});

test('ftp server can be started on non default ports', () => {
    server = new ftpd({cnf: {port: 50021, securePort: 50990}})
    expect(server).toBeInstanceOf(ftpd);
    expect(server._opt.cnf.port).toBe(50021)
    expect(server._opt.cnf.securePort).toBe(50990)
    server.start()
    expect(server._tcp.address().port).toBe(50021)
    expect(server._tls.address().port).toBe(50990)
});

test('login as anonymous not allowed by default', async () => {
    server = new ftpd({cnf: {port: 50021, securePort: 50990}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    const promiseSocket = new PromiseSocket(new net.Socket())
    const socket = promiseSocket.stream
    let content
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')
    await promiseSocket.write('USER anonymous')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('530 Not logged in')

    await promiseSocket.end()
});

test('login as anonymous when enabled', async () => {
    server = new ftpd({cnf: {port: 50021, securePort: 50990, allowAnonymousLogin: true}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    const promiseSocket = new PromiseSocket(new net.Socket())
    const socket = promiseSocket.stream
    let content
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER anonymous')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('331 Password required for anonymous')

    await promiseSocket.write('PASS anonymous@anonymous')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('230 Logged on')

    await promiseSocket.end()
});

test('login with default user settings', async () => {
    server = new ftpd({cnf: {port: 50021, securePort: 50990, username: 'john', password: 'doe'}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    const promiseSocket = new PromiseSocket(new net.Socket())
    const socket = promiseSocket.stream
    let content
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('331 Password required for john')

    await promiseSocket.write('PASS doe')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('230 Logged on')

    await promiseSocket.end()
});

test('login with default user settings without password allowed', async () => {
    server = new ftpd({cnf: {port: 50021, securePort: 50990, username: 'john', allowLoginWithoutPassword: true}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    const promiseSocket = new PromiseSocket(new net.Socket())
    const socket = promiseSocket.stream
    let content
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.end()
});

test('login with user settings', async () => {
    const users = [
        {
            username: 'john',
            password: 'doe'
        },
        {
            username: 'michael',
            password: 'myers'
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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
    expect(content.toString().trim()).toBe('331 Password required for john')

    await promiseSocket.write('PASS doe')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('230 Logged on')

    await promiseSocket.end()

    promiseSocket = new PromiseSocket(new net.Socket())
    socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER michael')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('331 Password required for michael')

    await promiseSocket.write('PASS myers')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('230 Logged on')

    await promiseSocket.end()
});

test('login with user settings without password allowed', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        },
        {
            username: 'michael',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.end()

    promiseSocket = new PromiseSocket(new net.Socket())
    socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER michael')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.end()
});

test('login with user settings and wrong user rejected', async () => {
    const users = [
        {
            username: 'john',
            password: 'doe'
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
    expect(server).toBeInstanceOf(ftpd);
    server.start()

    let content

    let promiseSocket = new PromiseSocket(new net.Socket())
    let socket = promiseSocket.stream
    await socket.connect(50021, 'localhost')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('220 Welcome')

    await promiseSocket.write('USER michael')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('530 Not logged in')

    await promiseSocket.end()
});

test('login with user settings and wrong password rejected', async () => {
    const users = [
        {
            username: 'john',
            password: 'doe'
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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
    expect(content.toString().trim()).toBe('331 Password required for john')

    await promiseSocket.write('PASS pass')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('530 Username or password incorrect')

    await promiseSocket.end()
});

test('test unknown message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('SOMETHING')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('500 Command not implemented')

    await promiseSocket.end()
});

test('test CLNT message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('CLNT tests')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 Don\'t care')

    await promiseSocket.end()
});

test('test FEAT message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('FEAT')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toMatch('211-Features')

    await promiseSocket.end()
});

test('test PWD message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('PWD')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('257 "/" is current directory')

    await promiseSocket.end()
});

test('test QUIT message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('QUIT')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('221 Goodbye')

    await promiseSocket.end()
});

test('test PBSZ message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('PBSZ 0')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 PBSZ=0')

    await promiseSocket.end()
});

test('test OPTS message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('OPTS UTF8 ON')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 UTF8 ON')

    await promiseSocket.write('OPTS UTF8 OFF')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 UTF8 OFF')

    await promiseSocket.write('OPTS SOMETHING')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('451 Not supported')

    await promiseSocket.end()
});

test('test PROT message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.write('PROT C')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('503 PBSZ missing')

    await promiseSocket.write('PBSZ 0')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 PBSZ=0')

    await promiseSocket.write('PROT C')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 Protection level is C')

    await promiseSocket.write('PROT P')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 Protection level is P')

    await promiseSocket.end()
});

test('test MKD message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFolderCreate: true
        }
    ]
    server = new ftpd({cnf: {port: 50021, securePort: 50990, user: users}})
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

    await promiseSocket.end()
});
