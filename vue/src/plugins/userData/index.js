/**
 * This plugin will load all the user data when first launching the application
 */
exports.install = async function (Vue, options) {
  /**
   * Stop client, in case application was reloaded
   */
  options.store.dispatch('client/stopRPC', {silent: true})

  /**
   * Load general settings
   */
  await options.store.dispatch('settings/load').then(() => {
    /**
     * Apply autostart status to windows
     */
    options.store.dispatch('settings/loadAutoStart')
  })

  /**
   * Load profiles
   */
  options.store.dispatch('profiles/loadList').then(async () => {
    /**
     * Load profiles icons
     */
    options.store.dispatch('profiles/loadIcons')
    /**
     * Autoload profile if set in the settings
     */
    if (options.store.getters['settings/settings'].autoLoadProfile) {
      const profile = options.store.getters['profiles/profiles'].filter(profile => {
        return profile.name === options.store.getters['settings/settings'].autoLoadProfileName
      })
      if (profile.length == 0) { // Profile does not exist
        return
      }
      const settings = profile[0].settings
      const imported = await options.store.dispatch('client/import', {settings: settings})
      /**
       * Autostart client if set in the settings
       */
      if (imported && options.store.getters['settings/settings'].autoStartProfile) {
        options.store.dispatch('client/startRPC', {silent: true})
      }
    }
  })

  /**
   * Load triggers status
   */
  options.store.dispatch('triggers/loadStatus').then(() => {
    /**
     * Load triggers
     */
    options.store.dispatch('triggers/loadList')
  })
}