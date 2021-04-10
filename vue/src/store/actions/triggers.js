import Vue from 'vue'

export default {
  /**
   * Create new trigger
   */
  async create ({ commit, state }, {path, name = null, action = false, silent = false, updateTriggers = true} = {}) {
    if (!path) return false

    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/triggers/create`, {
      method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({path: path, name: name, action: action})
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      if (updateTriggers) commit('SET_triggers', responseBody.triggers)
      if (!silent) Vue.$toast.success('Trigger created')
      return true
    } else {
      if (!silent) Vue.$toast.error('Unable to create trigger')
      return false
    }
  },
  /**
   * Update trigger
   */
  async update ({ commit, state }, {path, action, settings, silent = false, updateTriggers = true} = {}) {
    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/triggers/update`, {
      method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({path: path, action: action})
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      if (updateTriggers) commit('SET_triggers', responseBody.triggers)
      if (!silent) Vue.$toast.success('Trigger updated')
      return true
    } else {
      if (!silent) Vue.$toast.error('Unable to update trigger')
      return false
    }
  },
  /**
   * Delete trigger
   */
  async delete ({ commit, state }, {path, silent = false, updateTriggers = true} = {}) {
    if (!path) return false

    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/triggers/delete`, {
      method: 'DELETE', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({path: path})
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      if (updateTriggers) commit('SET_triggers', responseBody.triggers)
      if (!silent) Vue.$toast.success('Trigger deleted')
      return true
    } else {
      if (!silent) Vue.$toast.error('Unable to delete trigger')
      return false
    }
  },
  /**
   * Get list of all triggers
   */
  async getList ({ commit, state }) {
    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/triggers/get-list`, {
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
   * Sets if triggers are enabled or not
   */
  async setEnabled ({ commit, state }, {enabled, silent = false, updateEnabled = true} = {}) {
    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/triggers/set-enabled`, {
      method: 'POST', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({enabled: enabled})
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null
    state.formData.isLoading = false

    if (response && response.status == 200) {
      if (updateEnabled) {
        commit('SET_enabled', responseBody.enabled)
        window.electron.setStatus({triggersStatus: responseBody.enabled}) // Update Electron tray
      }
      if (!silent) Vue.$toast.success(`Triggers ${responseBody.enabled ? 'enabled' : 'disabled'}`)
      return true
    } else {
      if (!silent) Vue.$toast.error('Unable to change triggers status')
      return false
    }
  },
  /**
   * Get enabled status of triggers
   */
  async getEnabled ({ commit, state }) {
    state.formData.isLoading = true
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/triggers/get-enabled`, {
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
   * Load list of triggers into the VueJS state
   */
  async loadList ({ dispatch, commit, state }) {
    const triggers = await dispatch('getList')
    commit('SET_triggers', triggers)
  },
  /**
   * Load status of triggers (enabled or disabled) into the VueJS state
   */
  async loadStatus ({ dispatch, commit, state }) {
    const enabled = await dispatch('getEnabled')
    commit('SET_enabled', enabled)
  },
  /**
   * Get a list of running tasks
   */
  async getTasksList ({ commit, state }) {
    const response = await fetch(`${process.env.VUE_APP_API_ENDPOINT}/executables/get-list?icons=${false}`, {
      method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
      redirect: 'follow', referrerPolicy: 'no-referrer'
    }).catch(() => {})
    const responseBody = response ? await response.json().catch(() => {}) : null

    if (response && response.status == 200) {
      return responseBody
    } else {
      return false
    }
  },
}