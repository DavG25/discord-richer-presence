/**
 * This plugin will manage and activate the triggers set by the user
 */
exports.install = async function (Vue, options) {
  // Import deep diff
  const diff = require("deep-object-diff").diff
  // Time between each triggers check
  const interval = 6000 
  // Delay after which we should execute the trigger action
  const triggerTimeout = 1000
  // Sorting method when there are multiple triggers matches, can be either "most-recent" or "most-older"
  const sortingMethod = "most-recent" 
  // Keep track of previous trigger
  let previousCycleTrigger = {}
  // Triggers check
  let triggersCheck = setTimeout(executeTriggers, interval)
  const nextCycle = ((message) => {
    // Update the last message
    if (message) options.store.commit('triggers/SET_lastMessage', message)
    // Clear active trigger if triggers have been disabled
    const enabled = options.store.getters['triggers/formData'].enabled
    if (!enabled) options.store.commit('triggers/SET_activeTrigger', {})
    // Init next cycle
    clearTimeout(triggersCheck)
    triggersCheck = setTimeout(executeTriggers, interval)
  })

  /**
   * Run triggers check cycle
   */
  async function executeTriggers () {
    let enabled = options.store.getters['triggers/formData'].enabled
    if (!enabled) {
      nextCycle(`Waiting for triggers to be activated, skipping`)
      return
    }

    /**
     * Get list of currently running executables and triggers set by the user
     */
    let taskList = await options.store.dispatch('triggers/getTasksList')
    let triggers = options.store.getters['triggers/triggers']
    let profiles = options.store.getters['profiles/profiles']

    /**
     * Return an array of matching profiles with current running executables
     */
    let matches = []
    triggers.forEach(trigger => {
      if (trigger.path == false) return // Ignore "Nothing fromt this list" trigger
      let match = taskList.filter((task)=>{
        return task.SafePath.toLowerCase() === trigger.path.toLowerCase()
      })
      // Add match to list
      if (match.length > 0) {
        match = {
          trigger: trigger,
          executable: match[0],
          startTime: match[0].StartTimeSeconds
        }
        matches.push(match)
      }
    })

    /**
     * If there are multiple matches, pick one based on the sorting preference
     */
    let match
    if (matches.length > 1) {
      // Sort by time since the application was started
      matches.sort(function (a, b) {
        return a.startTime - b.startTime
      })
      const mostRecent = matches[0]
      const mostOlder = matches[matches.length - 1]
      // Update match
      if (sortingMethod == "most-recent") match = mostRecent // Sort by most recently started application
      if (sortingMethod == "most-older") match = mostOlder // Sort by most older running application
    } else if (matches.length == 1) match = matches[0]
    else match = null

        
        
    /**
     * Get trigger action that should be executed and log what trigger is currently active
     */
    let triggerAction, triggerToActivate
    if (match) { // There is at a match (executables / trigger)
      triggerAction = match.trigger.action
      triggerToActivate = match.trigger
    } else { // No matches, go back to the "Nothing from this list" action
      const defaultTrigger = triggers.filter((trigger)=>{
        return trigger.path === false
      })
      triggerAction = defaultTrigger[0].action
      triggerToActivate = defaultTrigger[0]
    }

    /**
     * Execute trigger action (we use a timeout to start the action after a program has started
     * so that if it's a game detected by Discord our client **should** override it)
     */
    setTimeout(async () => {
      enabled = options.store.getters['triggers/formData'].enabled
      if (!enabled) {
        nextCycle(`Waiting for triggers to be activated, skipping`)
        return
      }

      /**
       * Get current client status
       */
      let client = options.store.getters['client/client']

      /**
       * Update currently active trigger
       */
      options.store.commit('triggers/SET_activeTrigger', triggerToActivate)

      /**
       * Log currently active trigger
       */
      console.log("Currently active trigger:", triggerToActivate.path ? triggerToActivate.path : 'default')

      /**
       * Check if triggered action (profile) still exists
       */
      if (triggerAction == false || triggerAction == true) {// If trigger action is either do "Nothing" or "Stop client"
        // There is no profile for "Nothing" and "Stop client", everything is ok
      } else {
        let profileByName = profiles.filter((profile)=>{
          return profile.name === triggerAction
        })
        // If profile does not exist anymore, convert the action to false (corresponds to do "Nothing")
        if (profileByName.length == 0) triggerAction = false
      }
            
      /**
       * Check trigger action type and execute it
       */
      if (triggerAction == false) { // Action is "Nothing"
        /**
         * Do nothing
         */
        nextCycle(`Did nothing, skipping`)
        return
      }
      else if (triggerAction == true) { // Action is "Stop client"
        /**
         * Stop client if it's running
         */
        if (client.isRunning) {
          await options.store.dispatch('client/stopRPC', {silent: true})
          nextCycle(`Stopped client`)
          return
        }
        else {
          nextCycle(`Skipping because client is already stopped`)
          return
        }
      }
      else { // Action is a profile, import the profile and then start the client or apply the new configs to it

        /**
         * Get client settings from profile provided by the trigger
         */
        const profile = profiles.filter(profile => {
          return profile.name === triggerAction
        })
        const newClientsettings = JSON.parse(profile[0].settings)
                
        /**
         * Get current client settings 
         */
        const currentClient = client
        const currentClientSettings = options.store.getters['client/appliedSettings'] // The settings that are currently applied and in use by the RP server

        /**
         * Execute action if the current client settings are different 
         * from the settings that we get from the profile provided in the trigger
         */
        const settingsDifferences = await options.store.dispatch('client/compareSettings', {originalSettings: currentClientSettings, updatedSettings: newClientsettings, raw1: true, raw2: true})
        if (settingsDifferences && Object.keys(settingsDifferences).length === 0 && settingsDifferences.constructor === Object) { 
          /*
           * No differences, settings are already the same, check if also the trigger is the same
           * The settings are the same, but if the trigger path or action is different, we still update the client
           */
                    
          /**
           * Check if the trigger is still the same
           */
          let triggerDifference = diff(previousCycleTrigger, triggerToActivate)
          if (triggerDifference.path == null && triggerDifference.action == null) { 
            // The triggers (the new one and the old one) have no differences, no need to update
            nextCycle(`Skipping because profile "${triggerToActivate.action}" is already loaded and running`)
            return
          }
          // Else: settings are the same but the trigger is different, we should re-update the client
                    
        }

        /**
         * Check if the settings we are going to apply are valid
         */
        const errors = await options.store.dispatch('client/validateSettings', {settings: newClientsettings})
        if (errors.length > 0) { 
          // There are some errors with the settings, do not apply them
          console.log(`The trigger did not start because there were the following errors with the profile ${triggerToActivate.action}:`, errors)
          nextCycle(`Tried to load and run profile "${triggerToActivate.action}" but failed because its configs are not valid`)
          return
        }

        /**
         * Import settings and start or update client
         */
        client.isLoading = true
        const imported = await options.store.dispatch('client/import', {settings: newClientsettings, stopClient: false, silent: true, raw: true})
        const update = currentClient.isRunning ? true : false
        const started = await options.store.dispatch('client/startRPC', {update: update, silent: true})
        // eslint-disable-next-line require-atomic-updates
        previousCycleTrigger = triggerToActivate
        client.isLoading = false
                
        /**
         * Go to next triggers cycle
         */
        if (started) nextCycle(`Loaded and ran profile "${triggerToActivate.action}"`) // Client was started
        else nextCycle(`Loaded profile "${triggerToActivate.action}" but failed to run it because of a client error`) // Client did not start
        return
      }
    }, triggerTimeout)
  }
}