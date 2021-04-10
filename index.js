/**
 * Init electron browser
 */
const Electron = require(`${__dirname}/electron/app`)

/**
 * Init web server
 */
const WebServer = require(`${__dirname}/express/express`)

/**
 * Start application
 */
const startApp = (async () => {
  await WebServer.start().catch(() => {})
  await Electron.spawn()
})
startApp()