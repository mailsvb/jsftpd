# Handler

jsftpd can use handler functions instead of reading/writing to the file system for several FTP commands.

```{code-block} javascript
const handler = {
    upload: async function (...) {},
    download: async function (...) {},
    list: async function (...) {},
    rename: async function (...) {}
}
const server = new ftpd({hdl: handler})
```

The following FTP commands are covered by the handlers

* **STOR**: Uploading files to the FTP server
* **RETR**: Downloading files from the FTP server
* **LIST**: Listing directory contents on the FTP server
* **MLSD**: Listing directory contents on the FTP server
* **RNFR**: Renaming files on the FTP server
* **RNTO**: Renaming files on the FTP server

### upload

**Name: `upload`**\
**Returns: `boolean`**

The upload function takes 5 arguments when being called from jsftpd. It must return `true` on success or `false` on any error handling the file upload.

**username: `string` the user who has uploaded the file**\
**path: `string` relative path on the FTP server where the file is stored**\
**fileName: `string` the name of the file that is stored**\
**data: `Buffer` the file content that is stored**\
**offset: `number` the offset of the data received**

```{code-block} javascript
async upload (username, path, fileName, data, offset) {
    ...
}
```

### download

**Name: `upload`**\
**Returns: `Buffer`**

The download function takes 4 arguments when being called from jsftpd. It must return the file content as a `Buffer`.

**username: `string` the user who has uploaded the file**\
**path: `string` relative path on the FTP server where the file is stored**\
**fileName: `string` the name of the file that is stored**\
**data: `Buffer` the file content that is stored**\
**offset: `number` the offset of the data received**

```{code-block} javascript
async upload (username, path, fileName, data, offset) {
    ...
}
```

### list

**Name: `list`**\
**Returns: `string`**

The list function takes 3 arguments when being called from jsftpd. It must return the content of the specified directory as a `string`.

**username: `string` the current user**\
**path: `string` relative path on the FTP server**\
**format: `string` the format of the list reply (MLSD | LIST)**

```{code-block} javascript
async upload (username, path, format) {
    ...
}
```

### rename

**Name: `rename`**\
**Returns: `boolean`**

The rename function takes 4 arguments when being called from jsftpd. It must return `true` on success or `false` on any error handling the file rename.

**username: `string` the current user**\
**path: `string` relative path on the FTP server**\
**fromName: `string` the current file that needs to be renamed**
**newName: `string` the new name of the file**

```{code-block} javascript
async upload (username, path, fromName, newName) {
    ...
}
```
