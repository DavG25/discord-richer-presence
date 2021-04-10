/**
 * Imports
 */
const { app, BrowserWindow, Tray, Menu, nativeImage } = require('electron')
const url = process.env.NODE_ENV==='development' ? "http://localhost:2502/" : "http://localhost:2501/"
const iconPath = `${__dirname}/icons/icon.ico`
const state = require(`${__dirname}/state`).index

/**
 * Command line args
 */
const launchedByAutoRun = app.commandLine.hasSwitch('autorun')
const runAsMinimized = app.commandLine.hasSwitch('hidden')

/**
 * Create the Electron browser window
 */
exports.createWindow = () => {
  // Create loading window if "runAsMinimized" (the command line arg --hidden) is not present
  let loadingWindow
  if (!runAsMinimized) {
    loadingWindow = new BrowserWindow({
      width: 300,
      height: 350,
      show: false,
      resizable: false,
      frame: false,
      title: 'Discord Richer Presence',
      icon: iconPath
    })
    loadingWindow.loadFile(`${__dirname}/loading.html`)
    loadingWindow.webContents.on('did-finish-load', function() {
      loadingWindow.show()
    })
  }

  // Create main window
  state.mainWindow = new BrowserWindow({
    width: 1040,
    height: 700,
    minWidth: 1040,
    minHeight: 700,
    show: false,
    resizable: true,
    webPreferences: {
      enableRemoteModule: true,
      nodeIntegration: false,
      contextIsolation: false,
      preload: `${__dirname}/preload`
    },
    title: 'Discord Richer Presence',
    icon: iconPath
  })
  // Remove menu bar from window
  state.mainWindow.setMenuBarVisibility(false)

  // Attach function to "devtools-opened" (when the console is opened)
  state.mainWindow.webContents.on("devtools-opened", () => { 
    state.mainWindow.webContents.send('opened-dev-tools')
  })

  // Prevent HTML pages changing the app title
  state.mainWindow.on('page-title-updated', (event) => {
    event.preventDefault()
  })

  // Load the VueJS static app served by Express (if in production) or the hot-reload VueJS server (if in development)
  state.mainWindow.loadURL(url)
    
  // Prevent application from completly closing, the tray icon is enabled
  state.mainWindow.on('close', function (event) {
    if(!app.isQuiting){
      event.preventDefault()
      state.mainWindow.hide()
    }
    return false
  })

  // Destory window once it's closed
  state.mainWindow.on('closed', () => {
    state.mainWindow = null
  })

  // Build tray menu
  exports.setTray({update: false})

  // Show window and tray icon once the web contents have loaded (only the first time)
  let firstLoad = true
  state.mainWindow.webContents.on('did-finish-load', function() {
    // Return if it's not the first 'did-finish-load'
    if (!firstLoad) return

    // Destory loading window if present
    if (loadingWindow) loadingWindow.destroy()

    // Tray icon
    state.trayIcon = new Tray(iconPath)
    state.trayIcon.setContextMenu(state.trayMenu)
    state.trayIcon.setIgnoreDoubleClickEvents(true)
    state.trayIcon.setToolTip(app.getName())
    state.trayIcon.on('click', () => {
      state.mainWindow.show()
    })
        
    // Only show window if "runAsMinimized" (the command line arg --hidden) is not present
    if (!runAsMinimized) state.mainWindow.show()

    // Update first load
    firstLoad = false
  })
}

/**
 * Change the tray icon and window overlay icon (16x16) during runtime
 */
exports.setIcon = ({clientStatus = false} = {}) => {
  if (clientStatus) { // Active icon, is green, used when the RPC is running
    /*
     * state.mainWindow.setOverlayIcon(
     *      `${__dirname}/icons-active/overlay.png`,
     *      `Rich Presence is active`
     *  )
     */
    state.trayIcon.setImage(`${__dirname}/icons-active/icon.ico`)
  } else { // Default icon
    state.trayIcon.setImage(`${__dirname}/icons/icon.ico`)
    /* state.mainWindow.setOverlayIcon(null)*/
  }
}

/**
 * Change the tray menu during runtime
 */
exports.setTray = ({clientStatus = false, triggersStatus = false, update = false} = {}) => {
  // Create template
  const profiles = [
    { 'label': 'My profile', icon: nativeImage.createFromPath(iconPath).resize({width: 16, height: 16}) },
  ]

  const template = [
    { label: app.name, enabled: false, icon: nativeImage.createFromPath(iconPath).resize({width: 16, height: 16})},
    { type: "separator" },
    { label: clientStatus ? 'Stop client' : 'Start client', click: function(){
      state.mainWindow.webContents.send(clientStatus ? 'stopRPC' : 'startRPC')
    }},
    /*
     * { type: "separator" },
     *  { label: 'Load and run profile', submenu: profiles},
     *  { type: "separator" },
     *  { label: triggersStatus ? 'Disable triggers' : 'Enable triggers', click: function(){
     *      state.mainWindow.webContents.send(triggersStatus ? 'disableTriggers' : 'enableTriggers')
     *  }},
     */
    { type: "separator" },
    { label: 'Show', click: function(){
      state.mainWindow.show()
    }},
    { type: "separator" },
    { label: 'Quit', click: function(){
      app.isQuiting = true
      app.quit()
    }}
  ]

  state.mainWindow.webContents.send('computer-unlock')

  // Rebuild tray menu
  state.trayMenu = Menu.buildFromTemplate(template)
  // Set new tray menu
  if (update) state.trayIcon.setContextMenu(state.trayMenu)
}