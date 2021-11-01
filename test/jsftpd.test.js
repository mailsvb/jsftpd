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
    server = new ftpd({tls: {rejectUnauthorized: false}, cnf: {port: 50021, securePort: 50990}})
    expect(server).toBeInstanceOf(ftpd);
    expect(server._opt.cnf.port).toBe(50021)
    expect(server._opt.cnf.securePort).toBe(50990)
    server.start()
    expect(server._tcp.address().port).toBe(50021)
    expect(server._tls.address().port).toBe(50990)
});

test('login as anonymous not allowed by default', async () => {
    server = new ftpd({cnf: {port: 50021}})
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
    server = new ftpd({cnf: {port: 50021, allowAnonymousLogin: true}})
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
    server = new ftpd({cnf: {port: 50021, username: 'john', password: 'doe'}})
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
    server = new ftpd({cnf: {port: 50021, username: 'john', allowLoginWithoutPassword: true}})
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
    server = new ftpd({cnf: {port: 50021, user: users}})
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

    await promiseSocket.write('CLNT tests')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 Don\'t care')

    await promiseSocket.end()
});

test('test SYST message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
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

    await promiseSocket.write('SYST')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('215 UNIX')

    await promiseSocket.end()
});

test('test FEAT message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
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

    await promiseSocket.write('PBSZ 0')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 PBSZ=0')

    await promiseSocket.end()
});

test('test TYPE message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
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

    await promiseSocket.write('TYPE A')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 Type set to ASCII')

    await promiseSocket.write('TYPE')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('200 Type set to BINARY')

    await promiseSocket.end()
});

test('test OPTS message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
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

    await promiseSocket.write('PROT Z')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('534 Protection level must be C or P')

    await promiseSocket.end()
});

test('test REST message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true
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

    await promiseSocket.write('REST 0')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('350 Restarting at 0')

    await promiseSocket.write('REST -1')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('550 Wrong restart offset')

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

    await promiseSocket.write('MKD /john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('550 Folder exists')

    await promiseSocket.end()
});

test('test MKD message cannot create folder without permission', async () => {
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

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('MKD john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('550 Permission denied')

    await promiseSocket.end()
});

test('test RMD message', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFolderCreate: true,
            allowUserFolderDelete: true
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

    await promiseSocket.write('RMD john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 Folder deleted successfully')

    await promiseSocket.end()
});

test('test RMD message cannot delete folder without permission', async () => {
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

    await promiseSocket.write('RMD john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('550 Permission denied')

    await promiseSocket.end()
});

test('test CWD message', async () => {
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

    await promiseSocket.write('CWD john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 CWD successful. "/john/" is current directory')

    await promiseSocket.write('CWD /john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 CWD successful. "/john/" is current directory')

    await promiseSocket.write('CWD ..')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 CWD successful. "/" is current directory')

    await promiseSocket.write('CWD ..')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 CWD successful. "/" is current directory')

    await promiseSocket.write('CWD false')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('530 CWD not successful')

    await promiseSocket.end()
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

test('test STOR message', async () => {
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

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('MLSD')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    content = await promiseDataSocket.read();
    expect(content.toString().trim()).toMatch('type=file')
    expect(content.toString().trim()).toMatch('size=15')
    expect(content.toString().trim()).toMatch('mytestfile')
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "/"')

    await promiseSocket.end()
});

test('test STOR message with handler', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
        }
    ]
    const handler = (path, filename, data) => {
        expect(filename).toMatch('mytestfile')
        expect(path).toMatch('/')
        expect(data.toString()).toMatch('SOMETESTCONTENT')
    }
    server = new ftpd({cnf: {uploadHandler: handler, port: 50021, user: users}})
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

test('test RETR message', async () => {
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

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('RETR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    content = await promiseDataSocket.read();
    expect(content.toString().trim()).toMatch('SOMETESTCONTENT')
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.end()
});

test('test MFMT message', async () => {
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

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('MFMT 20150215120000 mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('253 Date/time changed okay')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('MLSD')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    content = await promiseDataSocket.read();
    expect(content.toString().trim()).toMatch('type=file')
    expect(content.toString().trim()).toMatch('modify=20150215')
    expect(content.toString().trim()).toMatch('size=15')
    expect(content.toString().trim()).toMatch('mytestfile')
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "/"')

    await promiseSocket.end()
});

test('test RNFR/RNTO message', async () => {
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

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('RNFR /mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('350 File exists')

    await promiseSocket.write('RNTO /someotherfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 File renamed successfully')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    promiseDataSocket = new PromiseSocket(new net.Socket())
    dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('MLSD')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    content = await promiseDataSocket.read();
    expect(content.toString().trim()).toMatch('type=file')
    expect(content.toString().trim()).toMatch('size=15')
    expect(content.toString().trim()).toMatch('someotherfile')
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "/"')

    await promiseSocket.end()
});

test('test DELE message without permission', async () => {
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

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('DELE mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('550 Permission denied')

    await promiseSocket.end()
});

test('test DELE message relative path', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileDelete: true
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

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('DELE mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 File deleted successfully')

    await promiseSocket.end()
});

test('test DELE message absolute path', async () => {
    const users = [
        {
            username: 'john',
            allowLoginWithoutPassword: true,
            allowUserFileDelete: true
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

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('DELE /mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('250 File deleted successfully')

    await promiseSocket.end()
});

test('test SIZE message', async () => {
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

    await promiseSocket.write('USER john')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('232 User logged in')

    await promiseSocket.write('EPSV')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('229 Entering extended passive mode (|||1024|)')

    let promiseDataSocket = new PromiseSocket(new net.Socket())
    let dataSocket = promiseDataSocket.stream
    await dataSocket.connect(1024, 'localhost')

    await promiseSocket.write('STOR mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('150 Opening data channel')

    await promiseDataSocket.write('SOMETESTCONTENT');
    dataSocket.end()
    await promiseDataSocket.end()

    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('226 Successfully transferred "mytestfile"')

    await promiseSocket.write('SIZE /myfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('550 File not found')

    await promiseSocket.write('SIZE /mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('213 15')

    await promiseSocket.write('SIZE mytestfile')
    content = await promiseSocket.read();
    expect(content.toString().trim()).toBe('213 15')

    await promiseSocket.end()
});
