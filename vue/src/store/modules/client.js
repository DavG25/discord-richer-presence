// Initial state
const getDefaultState = () => {
  /*
   * How **NOT** to use the VueJS store!
   * There is a lot of work to do to corretly use the setters instead of just putting the objects keys inside the v-models
   * TODO: Correctly use setters inside all of Vue pages
   */
  return {
    client: {
      isNormalGame: false,
      id: "",
      data: null,
      assets: [],

      isRunning: false,
      isValid: false,
      isLoading: false,
    },
    normal: {
      enableNormalTimestamp: false,
      normalStartTimestamp: "0",
    },
    text: {
      state: "",
      enableState: false,
      details: "",
      enableDetails: false,
    },
    images: {
      showClientImagesModal: false,

      enableLargeImage: false,
      largeImageKey: "",
      enableLargeImageText: false,
      largeImageText: "",

      enableSmallImage: false,
      smallImageKey: "",
      enableSmallImageText: false,
      smallImageText: "",
    },
    party: {
      enableParty: false,
      partySize: "1",
      partyMax: "1",
      joinSecret: false,
      partyId: null,
      enableCustomPartyId: false,
      customPartyId: "",
    },
    time: {
      enableTimestamp: false,
      timestampType: "start",
      startTimestamp: "0",
      endTimestamp: "0",
    },
    buttons: {
      enableButton1: false,
      button1Label: "",
      button1URL: "",
      enableButton2: false,
      button2Label: "",
      button2URL: "",
    },

    appliedSettings: {} // This object will contain the settings applied to the RPC when it's running
  }
}

const state = getDefaultState()

// Getters
const getters = {
  client: (state, getters, rootState) => {
    return state.client
  },
  normal: (state, getters, rootState) => {
    return state.normal
  },
  text: (state, getters, rootState) => {
    return state.text
  },
  images: (state, getters, rootState) => {
    return state.images
  },
  party: (state, getters, rootState) => {
    return state.party
  },
  time: (state, getters, rootState) => {
    return state.time
  },
  buttons: (state, getters, rootState) => {
    return state.buttons
  },
  allSettings: (state, getters, rootState) => {
    let settings = {
      // Only return the client ID and the isNormal parameter, the other keys are just local
      client: {
        id: state.client.id,
        isNormalGame: state.client.isNormalGame
      },
      normal: state.normal,
      text: state.text,
      images: state.images,
      party: state.party,
      time: state.time,
      buttons: state.buttons
    }
    return settings
  },

  appliedSettings: (state, getters, rootState) => {
    return state.appliedSettings
  }
}

// Actions
import clientActions from '../actions/client'
const actions = {
  ...clientActions
}

// Mutations
const mutations = {
  SET_client (state, value) {
    state.client = {...state.client, ...value}
  },
  SET_normal (state, value) {
    state.normal = {...state.normal, ...value}
  },
  SET_text (state, value) {
    state.text = {...state.text, ...value}
  },
  SET_images (state, value) {
    state.images = {...state.images, ...value}
  },
  SET_party (state, value) {
    state.party = {...state.party, ...value}
  },
  SET_time (state, value) {
    state.time = {...state.time, ...value}
  },
  SET_buttons (state, value) {
    state.buttons = {...state.buttons, ...value}
  },

  SET_appliedSettings (state, value) {
    // Remove reactivty from object
    state.appliedSettings = JSON.parse(JSON.stringify(value))
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