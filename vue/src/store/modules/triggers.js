import Vue from 'vue'

// Initial state
const getDefaultState = () => {
  return {
    triggers: [
      {
        path: false, // If path is false it means "Nothing from the triggers list"
        action: false // If action is false it means "Do nothing", if it's true "Stop client" and if it's a string execute the profile with the string's name
      }
    ],
    formData: {
      enabled: false,
      isLoading: false,
    },
    activeTrigger: {}, // Currently active trigger object
    lastMessage: "Loading triggers" // A message that indicates what the last trigger did and if it had any problems
  }
}

const state = getDefaultState()

// Getters
const getters = {
  triggers: (state, getters, rootState) => {
    return state.triggers
  },
  formData: (state, getters, rootState) => {
    return state.formData
  },
  activeTrigger: (state, getters, rootState) => {
    return state.activeTrigger
  },
  lastMessage: (state, getters, rootState) => {
    return state.lastMessage
  },
}

// Actions
import triggersActions from '../actions/triggers'
const actions = {
  ...triggersActions
}

// Mutations
const mutations = {
  ADD_trigger (state, trigger) {
    state.triggers.push(trigger)
  },
  REMOVE_profile (state, trigger) {
    state.triggers = state.triggers.filter(item => item !== trigger)
  },
  SET_triggers (state, triggers) {
    state.triggers = triggers
  },
  SET_formData (state, formData) {
    state.formData = formData
  },
  SET_enabled (state, enabled) {
    Vue.set(state.formData, 'enabled', enabled)
  },
  SET_activeTrigger (state, activeTrigger) {
    state.activeTrigger = activeTrigger
  },
  SET_lastMessage (state, lastMessage) {
    state.lastMessage = lastMessage
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