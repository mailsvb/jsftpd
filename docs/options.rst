config options
==============

jsftpd takes an object when a new instance is created. This object can contain a ``cnf`` property, which contains the config items mentioned on this page as an object itself.

Example::
    const options = {
        port: 21,
        allowUserFolderCreate: false
    }
    const server = new ftpd({cnf: options})

Options
-------

The below options can be set with the cnf property when creating a new instance of jsftpd.

port
~~~~
The port used for unencrypted or explicit encrypted access. jsftpd will listen on this port for incoming connections.

    port: 21
    ``default: 21``

securePort
~~~~~~~~~~
The port used for encrypted (implicit) access. jsftpd will listen on this port for incoming connections.

    securePort: 990
    ``default: 990``
