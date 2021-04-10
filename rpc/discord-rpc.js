/**
 * Imports
 */
const DiscordRPC = require("discord-rpc")


/**
 * Define RPC, activity and settings
 */
let rpc, activity, settings

/**
 * Start RPC server with custom settings
 */
exports.start = (async (rpcSettings) => {
  /**
   * Stop if RPC is already running
   */
  if (rpc) {
    /*
     * console.log("Already running")
     *  return {message: "Rich presence is already started", error: true}
     */
    await exports.stop()
  }

  /**
   * Init configs
   */
  settings = rpcSettings
  const clientId = settings.clientId

  /**
   * Init RPC
   */
  // eslint-disable-next-line require-atomic-updates
  rpc = new DiscordRPC.Client({ transport: 'ipc' })
    
  /**
   * Init party
   */
  if (settings.partyId) DiscordRPC.register(clientId)
    
  /**
   * Init activty
   */
  async function setActivity() {
    const res = await rpc.setActivity(settings)
      .then(() => {
        return {set: true, error: null}
      })
      .catch((err) => {
        exports.stop()
        return {set: false, error: err}
      })
    return res
  }

  /**
   * Set RPC activity when it's ready
   */
  rpc.on('ready', () => {
    // setActivity()
      
    /**
     * Refresh RPC activity (it can only be set every 15 seconds)
     */
    activity = setInterval(() => {
      setActivity()
    }, 15e3)
  })
    
  /**
   * Log into the RPC and start it
   */
  const response = await rpc.login({ clientId })
    .then(async () => {
      /**
       * Set activty
       */
      const activtyStatus = await setActivity()
      if (!activtyStatus.set) {
        // There was a problem setting the activity, RPC was not started
        console.log("Set activity error:", activtyStatus.error)
        return {message: activtyStatus.error.message, error: activtyStatus.error}
      }

      /**
       * RPC was started
       */
      console.log("RPC started with the following settings:", settings)
      return {message: "Rich presence started", error: null}
    })
    .catch((err) => {
      /**
       * RPC was not started, or it started with an error
       */
      exports.stop()
      return {message: err.message, error: err.message}
    })

  /**
   * Return response
   */
  return response
})


/**
 * Update RPC status
 */
exports.update = (async (rpcSettings) => {
  /**
   * Stop if RPC is stopped
   */
  if (!rpc) {
    /*
     * console.log("Rich presence is not running, unable to update")
     *  return {message: "Rich presence is not running", error: true}
     */
    const startResponse = await exports.start(rpcSettings)
    return startResponse
  }

  /**
   * Init activty
   */
  async function updateActivity() {
    const res = await rpc.setActivity(settings)
      .then(() => {
        return {set: true, error: null}
      })
      .catch((err) => {
        exports.stop()
        return {set: false, error: err}
      })
    return res
  }

  /**
   * Load new settings
   */
  settings = rpcSettings
  const activtyStatus = await updateActivity()
  if (!activtyStatus.set) {
    // There was a problem setting the activity, RPC was not started
    console.log("Update activity error:", activtyStatus.error)
    return {message: activtyStatus.error.message, error: activtyStatus.error}
  }
    
  /**
   * RPC was updated
   */
  console.log("RPC updated with the following settings:", settings)
  return {message: "Rich presence updated", error: null}
})


/**
 * Stop RPC server
 */
exports.stop = (async () => {
  /**
   * Stop if RPC is already stopped
   */
  if (!rpc) {
    console.log("RPC is already stopped")
    return {message: "Rich presence is already stopped", error: true}
  }

  /**
   * Stop RPC and clear activity refresh interval
   */
  clearInterval(activity)
  try { await rpc.destroy().catch(() => {}) } catch (err) { console.log(err) }
  // eslint-disable-next-line require-atomic-updates
  rpc = null
    
  /**
   * Return response
   */
  console.log("RPC stopped")
  return {message: "Rich presence stopped", error: null}
})


/**
 * RPC server status
 */
exports.status = (() => {
  /**
   * Return RPC status
   */
  if (rpc) {
    return {active: true, rpcSettings: settings, message: "Rich presence is running", error: null}
  } else {
    return {active: false, rpcSettings: null, message: "Rich presence is not running", error: null}
  }
})
