/**
 * This plugin will handle the events fired by the Electron app
 */
exports.install = async function (Vue, options) {
  /**
   * Register hooks
   */
  window.electron.ipcRenderer.on('stopRPC', async () => {
    const stopped = await options.store.dispatch('client/stopRPC', {silent: false})
    // If there is a problem stopping the client, show the app window
    if (!stopped) {
      options.router.push({ name: 'Home'}).catch(()=>{})
      window.electron.mainWindow.show()
      return
    }
  })

  window.electron.ipcRenderer.on('startRPC', async () => {
    const isValidClient = options.store.getters['client/client'].isValid
    // If the client is not valid, show the app window
    if (!isValidClient) {
            
      window.electron.mainWindow.show()
      options.router.push({ name: 'Home'}).catch(()=>{})
      Vue.$toast.error("Invalid client")
      return
    }

    const errors = await options.store.dispatch('client/validateSettings', {settings: options.store.getters['client/allSettings']})
    // If there is a problem with the client settings, show the app window
    if (errors.length > 0) {
      options.router.push({ name: 'Home'}).catch(()=>{})
      window.electron.mainWindow.show()
      Vue.$toast.error("Invalid client settings")
      return
    }

    const started = await options.store.dispatch('client/startRPC', {silent: false})
    // If there is a problem starting the client, show the app window
    if (!started) {
      options.router.push({ name: 'Home'}).catch(()=>{})
      window.electron.mainWindow.show()
      return
    }
  })

  window.electron.ipcRenderer.on('update-downloaded', async (updateInfo) => {
    // When an update has been download and is ready to be installed display an install update button on the Vue UI
    console.log("A new update has been download and is ready to be installed")
    options.store.commit('settings/SET_updateDownloaded', true)
  })

  window.electron.ipcRenderer.on('opened-dev-tools', () => {
    console.image = async (url, size = 50, title, titleStyle) => {
      await new Promise((resolve) => {
        let image = new Image()
        image.onload = function() {
          var style = [
            'font-size: 1px;',
            'padding: ' + this.height/100*size + 'px ' + this.width/100*size + 'px;',
            'background: url('+ url +') no-repeat;',
            'background-size: contain;'
          ].join(' ')
          if (title) console.log(`%c${title}`, `${titleStyle}`)
          console.log('%c ', style)
          resolve(true)
        }
        image.onerror = function() { resolve(false) }
        image.src = url
      })
    }
    console.image("https://www.davg25.com/app/discord-richer-presence/app_assets/console.png", 50, "Discord Richer Presence", 'font-size:50px;').then(() => {
      if (process.env.NODE_ENV==='development') {
        console.image("https://www.davg25.com/app/discord-richer-presence/app_assets/debug.jpg", 25).then(() => {
          console.log('%cEnvironment: development', 'font-size:20px;')
          console.log(`%cData path: ${window.electron.userDataPath}`, 'font-size:15px;')
        })
      }
    })
  })
}