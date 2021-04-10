import Vue from 'vue'
import Vuex from 'vuex'

import client from './modules/client'
import profiles from './modules/profiles'
import triggers from './modules/triggers'
import settings from './modules/settings'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    client,
    profiles,
    triggers,
    settings
  }
})