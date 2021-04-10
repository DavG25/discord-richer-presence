// Initial state
const getDefaultState = () => {
  return {
    settings: {
      // Settings for autorun on boot
      runAtBoot: false,
      runAsMinimized: false,
      /*
       * Show tray icon when minimized and hide application icon (disabled for now)
       * trayIconOnMinimize: false,
       * Autoload a profile when application starts
       */
      autoLoadProfile: false,
      autoLoadProfileName: "",
      autoStartProfile: false,
    },
    updateDownloaded: false
  }
}

const state = getDefaultState()

// Getters
const getters = {
  settings: (state, getters, rootState) => {
    return state.settings
  },
  updateDownloaded: (state, getters, rootState) => {
    return state.updateDownloaded
  },
}

// Actions
import settingsActions from '../actions/settings'
const actions = {
  ...settingsActions
}

// Mutations
const mutations = {
  SET_settings (state, settings) {
    if (!settings) return
    state.settings = settings
  },
  SET_updateDownloaded (state, value) {
    state.updateDownloaded = value
  },

  resetState (state) {
    Object.assign(state, getDefaultState())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}