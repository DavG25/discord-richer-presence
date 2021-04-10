import Vue from 'vue'

export default {
  /**
   * Set settings
   */
  async set ({ dispatch, commit, state }, {settings, silent = false, updateSettings = true} = {}) {
    if (!settings) return false
        
    settings = JSON.stringify(settings, null, 2)

    let updated = await new Promise((resolve, reject) => {
      window.electron.fs.writeFile(`${window.electron.userDataPath}/settings.json`, settings, 'utf8', ((err) => {
        if (err) {
          if (!silent) Vue.$toast.success('Unable to update settings')
          resolve(false)
        }
        if (!silent) Vue.$toast.success('Settings updated')
        if (updateSettings) {
          const parsedSettings = JSON.parse(settings)
          commit('SET_settings', parsedSettings)
          dispatch('setAutoStart', {enabled: parsedSettings.runAtBoot, hide: parsedSettings.runAsMinimized})
          window.electron.settings.set(parsedSettings)
        }
        resolve(true)
      }))
    })

    return updated
  },
  /**
   * Get settings
   */
  async get ({ commit, state }) {
    let settings = await new Promise((resolve, reject) => {
      window.electron.fs.readFile(`${window.electron.userDataPath}/settings.json`, "utf8", async (err, settings) => {
        if (err) {
          console.log("Unable to read user settings:",err)
          resolve(null)
          return
        }
        settings = JSON.parse(settings)
        resolve(settings)
      })
    })
    return settings
  },
  /**
   * Load settings from file into the VueJS state
   */
  async load ({ dispatch, commit, state }) {
    let settings = await dispatch('get')
    commit('SET_settings', settings)
    return true
  },
  /**
   * Set the application autostart status
   */
  setAutoStart ({ dispatch, commit, state }, {enabled = false, hide = true} = {}) {
    try {
      window.electron.setAutoStart({enabled: enabled, hide: hide})
      return true
    } catch (err) {
      return err
    }
        
  },
  /**
   * Automatically updates the autostart status in Windows based on the current settings
   * The settings are from the VueJS state, so "load" should be called first
   */
  loadAutoStart ({ dispatch, state }) {
    const processed = dispatch('setAutoStart', {enabled: state.settings.runAtBoot, hide: state.settings.runAsMinimized})
    return processed
  },
}