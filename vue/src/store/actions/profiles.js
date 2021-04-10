import Vue from 'vue'

export default {
  /**
   * Create new profile
   */
  async create ({ commit, state }, {profileName, settings, silent = false, updateProfiles = true} = {}) {
    if (!profileName || !settings) return false
    profileName = profileName.trim()

    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/profiles/create`, {
      method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({profileName: profileName, settings: settings})
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      if (updateProfiles) commit('SET_profiles', responseBody.profiles)
      if (!silent) Vue.$toast.success('Profile created')
      return true
    } else {
      if (!silent) Vue.$toast.error('Unable to create profile')
      return false
    }
  },
  /**
   * Update profile
   */
  async update ({ commit, state }, {profileName, settings, silent = false, updateProfiles = true} = {}) {
    if (!profileName || !settings) return false

    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/profiles/update`, {
      method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({profileName: profileName, settings: settings})
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      if (updateProfiles) commit('SET_profiles', responseBody.profiles)
      if (!silent) Vue.$toast.success('Profile updated')
      return true
    } else {
      if (!silent) Vue.$toast.error('Unable to update profile')
      return false
    }
  },
  /**
   * Delete profile
   */
  async delete ({ commit, state }, {profileName, silent = false, updateProfiles = true} = {}) {
    if (!profileName) return false

    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/profiles/delete`, {
      method: 'DELETE', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({profileName: profileName})
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      if (updateProfiles) commit('SET_profiles', responseBody.profiles)
      if (!silent) Vue.$toast.success('Profile deleted')
      return true
    } else {
      if (!silent) Vue.$toast.error('Unable to delete profile')
      return false
    }
  },
  /**
   * Get list of all profiles
   */
  async getList ({ commit, state }) {
    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/profiles/get-list`, {
      method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer'
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      return responseBody
    } else {
      return false
    }
  },
  /**
   * Load list of profiles into the VueJS state
   */
  async loadList ({ dispatch, commit, state }) {
    const profiles = await dispatch('getList')
    commit('SET_profiles', profiles)
  },
  /**
   * Load icons of profiles icons (the client icons) into the VueJS state
   */
  async loadIcons ({ dispatch, commit, state }) {
    for (const profile of state.profiles) {
      const clientId = JSON.parse(profile.settings).client.id
      // Check if profile already has an icon
      let hasIcon = state.icons.filter((icon)=>{
        return icon.clientId === clientId
      })
      if (hasIcon.length > 0) continue

      const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/clients/${clientId}/get-metadata`, {
        method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
        redirect: 'follow', referrerPolicy: 'no-referrer'
      }).catch(() => {})
      const responseBody = response ? await response.json().catch(() => {}) : null
      const icon_url = responseBody ? responseBody.icon_url : null
      commit('ADD_icon', {clientId: clientId, icon_url: icon_url})
    }
  },
  /**
   * Load missing icons of profiles into the VueJS state
   */
  async loadMissingIcons ({ dispatch, commit, state }) {
    // Check if there are missing icons, if so load them
    for (const profile of state.profiles) {
      const clientId = JSON.parse(profile.settings).client.id
      // Check if profile already has an icon
      let hasIcon = state.icons.filter((icon)=>{
        return icon.clientId === clientId
      })
      if (hasIcon.length > 0) continue
      await dispatch('loadIcons')
    }
  },
  /**
   * Update an icon URL for the specified profile
   */
  async updateIcon ({ dispatch, commit, state }, {profile: profile, icon_url: icon_url} = {}) {
    const clientId = JSON.parse(profile.settings).client.id
    commit('UPDATE_icon', {clientId: clientId, icon_url: icon_url})
  },
  /**
   * Read profile configs from given data, returns a formatted object with the client configs
   */
  async format ({ dispatch, commit, state }, {profileConfigs} = {}) {
    // Remove BOM marker
    profileConfigs = profileConfigs.replace(/^\uFEFF/gm, "").replace(/^\u00BB\u00BF/gm,"")

    function getSafe(fn, defaultVal) {
      try {
        return fn()
      } catch (e) {
        return defaultVal
      }
    }

    if (profileConfigs.includes('<?xml')) { // File is from previous Discord MagicPresence version (up to 1.1)
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(profileConfigs, "text/xml")
      profileConfigs = {
        client: {
          id: getSafe(() => xmlDoc.getElementsByTagName("s25")[0].childNodes[0].nodeValue),
          isNormal: false
        },
        text: {
          enableDetails: (getSafe(() => xmlDoc.getElementsByTagName("s1")[0].childNodes[0].nodeValue == 'true')),
          details: getSafe(() => xmlDoc.getElementsByTagName("s2")[0].childNodes[0].nodeValue),
          enableState: (getSafe(() => xmlDoc.getElementsByTagName("s3")[0].childNodes[0].nodeValue == 'true')),
          state: getSafe(() => xmlDoc.getElementsByTagName("s4")[0].childNodes[0].nodeValue)
        },
        images: {
          enableLargeImage: (getSafe(() => xmlDoc.getElementsByTagName("s5")[0].childNodes[0].nodeValue == 'true')),
          largeImageKey: getSafe(() => xmlDoc.getElementsByTagName("s6")[0].childNodes[0].nodeValue),
          enableLargeImageText: (getSafe(() => xmlDoc.getElementsByTagName("s7")[0].childNodes[0].nodeValue == 'true')),
          largeImageText: getSafe(() => xmlDoc.getElementsByTagName("s8")[0].childNodes[0].nodeValue),

          enableSmallImage: (getSafe(() => xmlDoc.getElementsByTagName("s9")[0].childNodes[0].nodeValue == 'true')),
          smallImageKey: getSafe(() => xmlDoc.getElementsByTagName("s10")[0].childNodes[0].nodeValue),
          enableSmallImageText: (getSafe(() => xmlDoc.getElementsByTagName("s11")[0].childNodes[0].nodeValue == 'true')),
          smallImageText: getSafe(() => xmlDoc.getElementsByTagName("s12")[0].childNodes[0].nodeValue)
        },
        party: {
          enableParty: (getSafe(() => xmlDoc.getElementsByTagName("s13")[0].childNodes[0].nodeValue == 'true')),
          partySize: getSafe(() => xmlDoc.getElementsByTagName("s14")[0].childNodes[0].nodeValue),
          partyMax: getSafe(() => xmlDoc.getElementsByTagName("s15")[0].childNodes[0].nodeValue),
          joinSecret: (getSafe(() => xmlDoc.getElementsByTagName("s16")[0].childNodes[0].nodeValue == 'true'))
        },
        time: {
          enableTimestamp: (getSafe(() => xmlDoc.getElementsByTagName("s17")[0].childNodes[0].nodeValue == 'true')),
          timestampType: (getSafe(() => xmlDoc.getElementsByTagName("s18")[0].childNodes[0].nodeValue == 'true' ? 'start' : 'end')),
          startTimestamp: getSafe(() => xmlDoc.getElementsByTagName("s19")[0].childNodes[0].nodeValue),
          endTimestamp: getSafe(() => xmlDoc.getElementsByTagName("s21")[0].childNodes[0].nodeValue)
        }
      }
      profileConfigs = JSON.stringify(profileConfigs)
    }
    return profileConfigs
  }
}