/**
 * Imports
 */
const state = require(`${__dirname}/state`).index
const window = require(`${__dirname}/window`)
const settings = require(`${__dirname}/settings`)
const userData = require(`${__dirname}/../userdata`)
const { autoUpdater } = require('electron-updater')
const log = require('electron-log')


/**
 * Spawn electron
 */
exports.spawn = function() {
  return new Promise((resolve, reject) => {
    /**
     * Instance lock
     */
    require('@electron/remote/main').initialize()
    state.app = require('electron').app
    state.instanceLock = state.app.requestSingleInstanceLock()

    if (!state.instanceLock) {
      state.app.quit()
      console.error("Electron instance is already running")
      process.exit(1)
    } else {
      state.app.on('second-instance', (event, commandLine, workingDirectory) => {
        // User tried to run a second instance, we should focus our window
        if (state.mainWindow) {
          state.mainWindow.show()
        }
      })

      state.app.on('ready', async () => {
        // Check for updates every minute
        setInterval(() => { exports.update() }, 60000)
        exports.update()

        state.app.allowRendererProcessReuse = false
        await userData.checkFolder()
        await userData.checkFiles()
        settings.load().then(() => {
          window.createWindow()
        })
      })

      state.app.on('window-all-closed', () => {
        state.app.quit()
      })
            
      state.app.on('activate', () => {
        if (state.mainWindow === null) {
          window.createWindow(state.mainWindow)
        }
      })
    }

    resolve(true)
  })
}


/**
 * Set the auto start status in Windows
 */
exports.setAutoStart = function({enabled = false, hide = true} = {}) {
  if (process.env.NODE_ENV==='development') {
    // Autostart for development mode, run electron with project path
    const path = require('path')
    const devPath = path.resolve(`${__dirname}/../`)
    state.app.setLoginItemSettings({
      openAtLogin: enabled,
      path: state.app.getPath("exe"),
      args: hide ? [`"${devPath}" --autorun --hidden`] : [`"${devPath}" --autorun`]
    })
  } else {
    /*
     * Autostart for production mode, run bundled application directly
     * TODO: Run updater with --processStart parameter
     */
    state.app.setLoginItemSettings({
      openAtLogin: enabled,
      path: state.app.getPath("exe"),
      args: hide ? [`--autorun --hidden`] : [`--autorun`]
    })
  }
    
}


/**
 * Check for updates
 */
exports.update = function() {
  if (process.env.NODE_ENV==='development') return
  autoUpdater.logger = log
  autoUpdater.logger.transports.file.level = 'info'
  autoUpdater.checkForUpdatesAndNotify()
}

exports.quitAndInstallUpdate = function({silent = true, runAfterInstall = true} = {}) {
  state.app.isQuiting = true
  autoUpdater.quitAndInstall(silent, runAfterInstall)
}

autoUpdater.on('update-downloaded', (ev, info) => {
  if (state.mainWindow && state.mainWindow.webContents) state.mainWindow.webContents.send('update-downloaded')
})