import Vue from 'vue'

// Initial state
const getDefaultState = () => {
  return {
    profiles: [],
    icons: [], // Images of the clients associated to the profiles (by ID)
    formData: {
      selectedProfile: null,
      newProfileName: "",
      isLoading: false,
    }
  }
}

const state = getDefaultState()

// Getters
const getters = {
  profiles: (state, getters, rootState) => {
    return state.profiles
  },
  icons: (state, getters, rootState) => {
    return state.icons
  },
  formData: (state, getters, rootState) => {
    return state.formData
  }
}

// Actions
import profilesActions from '../actions/profiles'
const actions = {
  ...profilesActions
}

// Mutations
const mutations = {
  ADD_profile (state, profile) {
    state.profiles.push(profile)
  },
  REMOVE_profile (state, profile) {
    state.profiles = state.profiles.filter(item => item !== profile)
  },
  SET_profiles (state, profiles) {
    state.profiles = profiles
  },
  ADD_icon (state, {clientId, icon_url} = {}) {
    const iconByClientId = state.icons.filter((icon)=>{
      return icon.clientId === clientId
    })
    if (iconByClientId.length > 0) return
    const icon = {clientId: clientId, icon_url: icon_url}
    state.icons.push(icon)
  },
  UPDATE_icon (state, {clientId, icon_url} = {}) {
    const iconIndexByClientId = state.icons.findIndex((icon)=>{
      return icon.clientId === clientId
    })
    if (iconIndexByClientId == -1) return
    Vue.set(state.icons[iconIndexByClientId], 'icon_url', icon_url)
  },
  REMOVE_icon (state, {clientId} = {}) {
    const iconIndexByClientId = state.icons.findIndex((icon)=>{
      return icon.clientId === clientId
    })
    if (iconIndexByClientId == -1) return
    state.icons.splice(iconIndexByClientId, 1)
  },
  SET_formData (state, formData) {
    state.formData = formData
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