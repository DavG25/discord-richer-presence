import Vue from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { detailedDiff } from 'deep-object-diff'
import isUri from 'is-uri'

// Timeout timer for fetch requests
let fetchTimeout

export default {
  clearData ({ commit, state }) {
    commit('resetState')
  },

  async import ({ commit, state, dispatch }, {settings, stopClient = true, raw = false} = {}) {
    try {
      // Parse from JSON if needed
      if (!raw) settings = JSON.parse(settings)
      // Clear old client data
      if (stopClient && state.client.isRunning) await dispatch('stopRPC', {silent: true})
      commit('resetState')

            
      // Validate imported client
      if (!settings.client.id) return false
      let valid = await dispatch('validateClient', {clientId: settings.client.id, silent: true})
      if (!valid) {
        // Validation did not pass, reset settings
        commit('resetState')
        return false
      }

      // Import all settings after validation has passed
      commit('SET_client', settings.client)
      if(settings.normal) commit('SET_normal', settings.normal)
      if(settings.text) commit('SET_text', settings.text)
      if(settings.images) commit('SET_images', settings.images)
      if(settings.party) commit('SET_party', settings.party)
      if(settings.time) commit('SET_time', settings.time)
      if(settings.buttons) commit('SET_buttons', settings.buttons)
      return true
    } catch {
      return false
    }
  },

  /**
   * Compare two objects containg the client settings to see if there are any differences 
   * (with some exceptions like the random party ID)
   */
  compareSettings ({ commit, state }, {originalSettings, updatedSettings, raw1 = false, raw2 = false} = {}) {
    // Parse from JSON if necessary
    if(!raw1) originalSettings = JSON.parse(originalSettings)
    if(!raw2) updatedSettings = JSON.parse(updatedSettings)

    // Merge settings with latest default settings model, to avoid differences between older and newer settings when new fields are added

    // Remove party ID from difference checks if custom party ID is disabled
    if (originalSettings.party && !originalSettings.party.enableCustomPartyId) delete originalSettings.party.partyId
    if (updatedSettings.party && !updatedSettings.party.enableCustomPartyId) delete updatedSettings.party.partyId

    // Compare settings
    let differences = detailedDiff(originalSettings, updatedSettings)

    // If one of the two setttings is empty return the added difference, else return the updated difference
    if (Object.keys(originalSettings).length === 0 || Object.keys(updatedSettings).length === 0) differences = differences.added
    else differences = differences.updated
        
    // Return differences
    return differences
  },

  export ({ commit, state }, {raw = false} = {}) {
    let settings = {
      // Only save the client ID and the isNormal parameter, the other will be obtained by the API each time is imported
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
    // Format settings to JSON if necessary
    if (!raw) settings = JSON.stringify(settings)
    // Return settings
    return settings
  },

  /**
   * Validate Client ID and get its data
   */
  async validateClient ({ commit, state }, {clientId = null, silent = false, noUpdateAssets = false} = {}) {
    /**
     * Return error if Client ID is empty
     */
    if (!clientId && state.client.id.trim() == "" || clientId && clientId.trim() == "") {
      Vue.$toast.error("Please type a client ID")
      state.client.isValid = false
      return
    }

    /**
     * Format Client ID
     */
    clientId = clientId ? clientId.trim() : null
    state.clientId = state.clientId ? state.clientId.trim() : null

    /**
     * Get client data
     */
    state.client.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/clients/${clientId || state.client.id}/get-compound`, {
      method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer'
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    // eslint-disable-next-line require-atomic-updates
    state.client.isLoading = false

    if (response && response.status == 200) {
      if (!noUpdateAssets) {
        // eslint-disable-next-line require-atomic-updates
        state.client.assets = responseBody.assets
        // eslint-disable-next-line require-atomic-updates
        state.client.data = responseBody.metadata
      }
      if (!silent) Vue.$toast.success('Client validated')
      // eslint-disable-next-line require-atomic-updates
      state.client.isValid = true
      return true
    } else {
      if (!silent) Vue.$toast.error(`Unable to validate client` + (responseBody && responseBody.error && responseBody.message ? `: ${responseBody.message}` : ""))
      // eslint-disable-next-line require-atomic-updates
      state.client.isValid = false
      return false
    }
  },

  /**
   * Validate the settings
   */
  async validateSettings ({ commit, state }, {settings} = {}) {
    let errors = []
        
    if (!settings.client) errors.push(`Missing client data`)

    if (settings.client && !settings.client.isNormalGame) {
      // State
      if (settings.text && settings.text.enableState) {
        if (settings.text.state.length > 128) errors.push(`The "Status" field must be less than or equal to 128 characters long`)
        if (settings.text.state.length < 2) errors.push(`The "Status" field must be at least 2 characters long`)
      }
            
      // Details
      if (settings.text && settings.text.enableDetails) {
        if (settings.text.details.length > 128) errors.push(`The "Details" field must be less than or equal to 128 characters long`)
        if (settings.text.details.length < 2) errors.push(`The "Details" field must be at least 2 characters long`)
      }

      // Large image
      if (settings.images && settings.images.enableLargeImage) {
        if (!settings.images.largeImageKey) errors.push(`The "Image name" field for the "Large image" must be a valid image`)
        if (settings.images.enableLargeImageText) {
          if (settings.images.largeImageText.length > 128) errors.push(`The "Hover text" field for the "Large image" must be less than or equal to 128 characters long`)
          if (settings.images.largeImageText.length < 2) errors.push(`The "Hover text" field for the "Large image" must be at least 2 characters long`)
        }
      }
            
      // Small image
      if (settings.images && settings.images.enableSmallImage) {
        if (!settings.images.smallImageKey) errors.push(`The "Image name" field for the "Small image" must be a valid image`)
        if (settings.images.enableSmallImageText) {
          if (settings.images.smallImageText.length > 128) errors.push(`The "Hover text" field for the "Small image" must be less than or equal to 128 characters long`)
          if (settings.images.smallImageText.length < 2) errors.push(`The "Hover text" field for the "Small image" must be at least 2 characters long`)
        }
      }

      // Party
      if (settings.party && settings.party.enableParty) {
        // The real maximum is 1e+308 but going above 999999999999999 will mess up the invite button
        if (Number(settings.party.partySize) > 999999999999999) errors.push(`The "People in party" field must be less than or equal to 999999999999999`)
        if (Number(settings.party.partySize) < 1) errors.push(`The "People in party" field must be at least 1`)
        if (Number(settings.party.partyMax) > 999999999999999) errors.push(`The "Total party size" field must be less than or equal to 999999999999999`)
        if (Number(settings.party.partyMax) < 1) errors.push(`The "Total party size" field must be at least 1`)

        if (settings.party.enableCustomPartyId) {
          if (settings.party.customPartyId.length > 128) errors.push(`The "Custom party ID" field must be less than or equal to 128 characters long`)
          if (settings.party.customPartyId.length < 2) errors.push(`The "Custom party ID" field must be at least 2 characters long`)
        }
      }

      // Timestamp
      if (settings.time && settings.time.enableTimestamp) {
        if (settings.time.timestampType == "start") {
          if (Number(settings.time.startTimestamp) > 86400) errors.push(`The "Elapsed seconds" field must be less than or equal to 86400`)
          if (Number(settings.time.startTimestamp) < 0) errors.push(`The "Elapsed seconds" field must be at least 0`)
        }
        if (settings.time.timestampType == "end") {
          if (Number(settings.time.endTimestamp) > 86400) errors.push(`The "Remaining seconds" field must be less than or equal to 86400`)
          if (Number(settings.time.endTimestamp) < 0) errors.push(`The "Remaining seconds" field must be at least 0`)
        }
      }

      // Buttons
      if (settings.buttons && settings.buttons.enableButton1) {
        if (settings.buttons.button1Label.length > 32) errors.push(`The "Button text" field for the "Button 1" must be less than or equal to 32 characters long`)
        if (settings.buttons.button1Label.length < 1) errors.push(`The "Button text" field for the "Button 1" must be at least 1 character long`)
        if (settings.buttons.button1URL.length > 512) errors.push(`The "Button URL" field for the "Button 1" must be less than or equal to 512 characters long`)
        if (!isUri(settings.buttons.button1URL)) errors.push(`The "Button URL" field for the "Button 1" must be a valid URI (https://..., steam://..., etc)`)
      }
      if (settings.buttons && settings.buttons.enableButton2) {
        if (settings.buttons.button2Label.length > 32) errors.push(`The "Button text" field for the "Button 2" must be less than or equal to 32 characters long`)
        if (settings.buttons.button2Label.length < 1) errors.push(`The "Button text" field for the "Button 2" must be at least 1 character long`)
        if (settings.buttons.button2URL.length > 512) errors.push(`The "Button URL" field for the "Button 2" must be less than or equal to 512 characters long`)
        if (!isUri(settings.buttons.button2URL)) errors.push(`The "Button URL" field for the "Button 2" must be a valid URI (https://..., steam://..., etc)`)
      }
    } else if (settings.client && settings.client.isNormalGame) {
      if (settings.normal && settings.normal.enableNormalTimestamp) {
        if (Number(settings.normal.normalStartTimestamp) > 1615680000) errors.push(`The "Elapsed seconds" field must be less than or equal to 1615680000`)
        if (Number(settings.normal.normalStartTimestamp) < 0) errors.push(`The "Elapsed seconds" field must be at least 0`)
      }
    }

    return errors
  },

  /**
   * Start the RPC server
   */
  async startRPC ({ dispatch, commit, state, getters }, {update = false, silent = false} = {}) {
    /**
     * Generate new party Id each time we start the client,
     * When updating the status generate a new party ID only if the custom Party ID was disabled
     * Or skip if the custom party ID is currenlty enabled
     */
    /*
     * if ((!update || state.party.partyId == null) && (!state.party.enableCustomPartyId || !state.party.enableParty)) state.party.partyId = uuidv4()
     *  else state.party.partyId = state.party.enableParty && state.party.enableCustomPartyId ? state.party.customPartyId : state.party.partyId 
     */

    /**
     * Generate new party Id each time we start or update the client,
     * Or skip if the custom party ID is currenlty enabled
     */
    if (state.party.enableParty && state.party.enableCustomPartyId) state.party.partyId = state.party.customPartyId
    else state.party.partyId = uuidv4()

    /**
     * Create buttons
     */
    let buttons = []
    if (state.buttons.enableButton1) {
      buttons.push({ label: state.buttons.button1Label, url: state.buttons.button1URL })
    }
    if (state.buttons.enableButton2) {
      buttons.push({ label: state.buttons.button2Label, url: state.buttons.button2URL })
    }

    /**
     * Format the RPC settings
     */
    let rpcSettings
    if (state.client.isNormalGame) { // Game should be treated as normal detectable game, only start timestamp allowed
      rpcSettings = {
        clientId: state.client.id,
        instance: false,
        startTimestamp: state.normal.enableNormalTimestamp ? Number(Math.floor(Date.now() / 1000) - Number(state.normal.normalStartTimestamp)) : null,
      }
    } else {
      rpcSettings = { // Game should be treated as rich presence game, everything allowed
        clientId: state.client.id,

        state: state.text.enableState ? state.text.state : null,
        details: state.text.enableDetails ? state.text.details : null,

        largeImageKey: state.images.enableLargeImage ? state.images.largeImageKey : null,
        largeImageText: state.images.enableLargeImage && state.images.enableLargeImageText ? state.images.largeImageText : null,
        smallImageKey: state.images.enableSmallImage ? state.images.smallImageKey : null,
        smallImageText: state.images.enableSmallImage && state.images.enableSmallImageText ? state.images.smallImageText : null,

        instance: state.party.enableParty ? true : false,
        // partyId: state.enableParty || state.enableTimestamp && state.timestampType=="end" ? state.partyId : null, // We must include a partyId for the endTimestamp to work, who knows why
        partyId: state.party.partyId, // Always include a party Id to get full access to all Rich Presence features
        partySize: state.party.enableParty ? Number(state.party.partySize) : null,
        partyMax: state.party.enableParty ? Number(state.party.partyMax) : null,
        joinSecret: state.party.enableParty && state.party.joinSecret && buttons.length == 0 ? btoa("Discord Richer Presence") : null,

        startTimestamp: state.time.enableTimestamp && state.time.timestampType=="start" ? Number(Math.floor(Date.now() / 1000) - Number(state.time.startTimestamp)) : null,
        endTimestamp: state.time.enableTimestamp && state.time.timestampType=="end" ? Number(Math.floor(Date.now() / 1000) + Number(state.time.endTimestamp)) : null,
        
        buttons: buttons.length > 0 ? buttons : null
      }
    }

    let requestType = update ? "update" : "start"

    // Set loading status and a fetch timeout timer
    state.client.isLoading = true
    const controller = new AbortController()
    fetchTimeout = setTimeout(function(){ 
      controller.abort()
      dispatch('stopRPC', {silent: true}) // Stop client in case it was running and Discord was closed (probable cause of timeout)
    }, 8000)

    // Send request to start or update RPC
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/rpc/${requestType}`, {
      method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({rpcSettings: rpcSettings}),
      signal: controller.signal
    }).catch(() => {})

    // Format request response
    const responseBody = response ? await response.json().catch(() => {}) : null

    // Clear loading status and fetch timeout
    // eslint-disable-next-line require-atomic-updates
    state.client.isLoading = false
    clearTimeout(fetchTimeout)

    // Handle response
    if (response && response.status == 200) {
      if (!silent) Vue.$toast.success(`Client ${requestType == 'update' ? 'updated' : 'started'}`)
      commit('SET_appliedSettings', getters.allSettings) // Update "appliedSettings" to reflect settings currently active on the RP server
      // eslint-disable-next-line require-atomic-updates
      state.client.isRunning = true
      window.electron.setStatus({clientStatus: true}) // Update Electron icon
      return true
    } else {
      // eslint-disable-next-line require-atomic-updates
      state.client.isRunning = false
      window.electron.setStatus({clientStatus: false}) // Update Electron icon
      if (!silent) Vue.$toast.error(`Unable to ${requestType} client` + (response && responseBody.error && responseBody.message ? `: ${responseBody.message}` : ""))
      return false
    }
  },

  /**
   * Stop the RPC server
   */
  async stopRPC ({ commit, state }, {silent = false} = {}) {
    // Set loading status and a fetch timeout timer
    state.client.isLoading = true
    const controller = new AbortController()
    fetchTimeout = setTimeout(function(){ 
      controller.abort()
    }, 8000)

    // Send request to stop RPC
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/rpc/stop`, {
      method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({message: "Please stop, thank you"})
    }).catch(() => {})

    // Format request response
    const responseBody = response ? await response.json().catch(() => {}) : null

    // Clear loading status and fetch timeout
    state.client.isLoading = false
    clearTimeout(fetchTimeout)

    // Handle response
    if (response && response.status == 200) {
      state.client.isRunning = false
      window.electron.setStatus({clientStatus: false}) // Update Electron icon
      if (!silent) Vue.$toast.success(`Client stopped`)
      commit('SET_appliedSettings', {}) // Update "appliedSettings" to reflect settings currently active on the RP server
      return true
    } else {
      state.client.isRunning = false
      if (!silent) Vue.$toast.error(`Unable to stop client` + (response && responseBody.error && responseBody.message ? `: ${responseBody.message}` : ""))
      return false
    }
  },
}