const util = require('util')

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

module.exports = {
    sleep,
    formatPort
}
