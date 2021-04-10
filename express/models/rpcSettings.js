/**
 * Format and validate RPC settings
 *
 * Most of the validation is done client-side
 * TODO: Implement full validation server-side
 */
exports.format = ((rpcSettings) => {
  let formattedRpcSettings = {}

  /**
   * Value: clientId
   */
  if (rpcSettings.clientId) {
    if (rpcSettings.clientId.trim() != "") {
      formattedRpcSettings.clientId = rpcSettings.clientId.trim()
    }
  }

  /**
   * Value: details
   */
  if (rpcSettings.details) {
    if (rpcSettings.details.trim() != "" && rpcSettings.details.trim().length >= 2) {
      formattedRpcSettings.details = rpcSettings.details.trim()
    }
  }

  /**
   * Value: state
   */
  if (rpcSettings.state) {
    if (rpcSettings.state.trim() != "" && rpcSettings.state.trim().length >= 2) {
      formattedRpcSettings.state = rpcSettings.state.trim()
    }
  }


  /**
   * Value: largeImageKey
   */
  if (rpcSettings.largeImageKey) {
    if (rpcSettings.largeImageKey.trim() != "") {
      formattedRpcSettings.largeImageKey = rpcSettings.largeImageKey.trim()
    }
  }

  /**
   * Value: largeImageText
   */
  if (rpcSettings.largeImageText) {
    if (rpcSettings.largeImageText.trim() != "") {
      formattedRpcSettings.largeImageText = rpcSettings.largeImageText.trim()
    }
  }

  /**
   * Value: smallImageKey
   */
  if (rpcSettings.smallImageKey) {
    if (rpcSettings.smallImageKey.trim() != "") {
      formattedRpcSettings.smallImageKey = rpcSettings.smallImageKey.trim()
    }
  }

  /**
   * Value: smallImageText
   */
  if (rpcSettings.smallImageText) {
    if (rpcSettings.smallImageText.trim() != "") {
      formattedRpcSettings.smallImageText = rpcSettings.smallImageText.trim()
    }
  }


  /**
   * Value: instance
   */
  if (rpcSettings.instance) {
    formattedRpcSettings.instance = true
  } else {
    formattedRpcSettings.instance = false
  }

  /**
   * Value: partyId
   */
  if (rpcSettings.partyId) {
    if (rpcSettings.partyId.trim() != "") {
      formattedRpcSettings.partyId = rpcSettings.partyId.trim()
    }
  }

  /**
   * Value: partySize
   */
  if (rpcSettings.partySize) {
    if (Number.isInteger(rpcSettings.partySize)) {
      formattedRpcSettings.partySize = rpcSettings.partySize
    }
  }

  /**
   * Value: partyMax
   */
  if (rpcSettings.partyMax) {
    if (Number.isInteger(rpcSettings.partyMax)) {
      formattedRpcSettings.partyMax = rpcSettings.partyMax
    }
  }

  /**
   * Value: joinSecret
   */
  if (rpcSettings.joinSecret) {
    if (rpcSettings.joinSecret.trim() != "") {
      formattedRpcSettings.joinSecret = rpcSettings.joinSecret.trim()
    }
  }
    

  /**
   * Value: startTimestamp
   */
  if (rpcSettings.startTimestamp) {
    if (Number.isInteger(rpcSettings.startTimestamp) || !isNaN(Date.parse(rpcSettings.startTimestamp))) {
      if(!isNaN(Date.parse(rpcSettings.startTimestamp))) formattedRpcSettings.startTimestamp = Date.parse(rpcSettings.startTimestamp)
      else formattedRpcSettings.startTimestamp = rpcSettings.startTimestamp
    }
  }

  /**
   * Value: endTimestamp
   */
  if (rpcSettings.endTimestamp) {
    if (Number.isInteger(rpcSettings.endTimestamp) || !isNaN(Date.parse(rpcSettings.endTimestamp))) {
      if(!isNaN(Date.parse(rpcSettings.endTimestamp))) formattedRpcSettings.endTimestamp = Date.parse(rpcSettings.endTimestamp)
      formattedRpcSettings.endTimestamp = rpcSettings.endTimestamp
    }
  }

  /**
   * Value: buttons
   */
  if (rpcSettings.buttons) {
    if (Array.isArray(rpcSettings.buttons)) formattedRpcSettings.buttons = rpcSettings.buttons
  }

  /**
   * Return formatted and validated settings
   */
  return formattedRpcSettings
})
