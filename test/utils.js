const util = require('util')
const NODE_MAJOR_VERSION = process.versions.node.split('.')[0]

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

function formatPort(addr, port) {
    const p1 = (port) / 256 | 0
    const p2 = (port) % 256
    return util.format('%s,%d,%d', addr.split('.').join(','), p1, p2)
}

function getCmdPortTCP() {
    return parseInt(NODE_MAJOR_VERSION + '021')
}

function getCmdPortTLS() {
    return parseInt(NODE_MAJOR_VERSION + '990')
}

function getDataPort() {
    return parseInt(NODE_MAJOR_VERSION + '120')
}

module.exports = {
    sleep,
    formatPort,
    getCmdPortTCP,
    getCmdPortTLS,
    getDataPort
}
