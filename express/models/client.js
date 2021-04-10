/**
 * Imports
 */
const fetch = require("node-fetch")

/**
 * Discord API settings
 */
const discordApiEndpoint = "https://discord.com/api/v8"


/**
 * Get client data
 */
exports.getMetadata = async function(req, res) {
  /**
   * Query Discord API to get client metadata
   */
  const response = await fetch(`${discordApiEndpoint}/oauth2/applications/${req.params.clientId}/rpc`, {
    method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
    redirect: 'follow', referrerPolicy: 'no-referrer'
  })
  let responseBody = await response.json().catch(() => {})

  if (response.status != 200) {
    res.setHeader('Content-Type', 'application/json')
    res.status(404).send(JSON.stringify({message: "Client not found", error: true}))
    return
  }

  /**
   * Full image URL helper: add an entry to client metadata with a full image URL
   */
  if (responseBody.icon) {
    responseBody.icon_url = `https://cdn.discordapp.com/app-icons/${responseBody.id}/${responseBody.icon}.png`
  } else {
    responseBody.icon_url = null
  }

  /**
   * Send response
   */
  if (response.status == 200) {
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(responseBody)
  } else {
    res.setHeader('Content-Type', 'application/json')
    res.status(404).send(JSON.stringify({message: "Client not found", error: true}))
  }
}


/**
 * Get client assets
 */
exports.getAssets = async function(req, res) {
  /**
   * Query Discord API to get client assets
   */
  const response = await fetch(`${discordApiEndpoint}/oauth2/applications/${req.params.clientId}/assets`, {
    method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
    redirect: 'follow', referrerPolicy: 'no-referrer'
  })
  const responseBody = await response.json().catch(() => {})

  if (response.status != 200) {
    res.setHeader('Content-Type', 'application/json')
    res.status(404).send(JSON.stringify({message: "Client not found", error: true}))
    return
  }

  /**
   * Full image URL helper: add an entry to each asset with a full image URL
   */
  responseBody.forEach((asset, index, assets) => {
    if (assets[index].name) {
      assets[index].url = `https://cdn.discordapp.com/app-assets/${req.params.clientId}/${asset.id}.png`
    } else {
      assets[index].url = null
    }
  })

  /**
   * Send response
   */
  if (response.status == 200) {
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(responseBody)
  } else {
    res.setHeader('Content-Type', 'application/json')
    res.status(404).send(JSON.stringify({message: "Client not found", error: true}))
  }
}


/**
 * Combine both metadata and assets in one response
 */
exports.getCompound = async function(req, res) {
  /**
   * Query Discord API to get client metadata
   */
  const metadataResponse = await fetch(`${discordApiEndpoint}/oauth2/applications/${req.params.clientId}/rpc`, {
    method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
    redirect: 'follow', referrerPolicy: 'no-referrer'
  })
  const metadata = await metadataResponse.json().catch(() => {})

  if (metadataResponse.status != 200) {
    res.setHeader('Content-Type', 'application/json')
    res.status(404).send(JSON.stringify({message: "Client not found", error: true}))
    return
  }

  /**
   * Full image URL helper: add an entry to client metadata with a full image URL
   */
  if (metadata.icon) {
    metadata.icon_url = `https://cdn.discordapp.com/app-icons/${metadata.id}/${metadata.icon}.png`
  } else {
    metadata.icon_url = null
  }

  /**
   * Query Discord API to get client assets
   */
  const assetsResponse = await fetch(`${discordApiEndpoint}/oauth2/applications/${req.params.clientId}/assets`, {
    method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
    redirect: 'follow', referrerPolicy: 'no-referrer'
  })
  const assets = await assetsResponse.json().catch(() => {})

  if (assetsResponse.status != 200) {
    res.setHeader('Content-Type', 'application/json')
    res.status(404).send(JSON.stringify({message: "Client not found", error: true}))
    return
  }

  /**
   * Full image URL helper: add an entry to each asset with a full image URL
   */
  assets.forEach((asset, index, assets) => {
    if (assets[index].name) {
      assets[index].url = `https://cdn.discordapp.com/app-assets/${req.params.clientId}/${asset.id}.png`
    } else {
      assets[index].url = null
    }
  })

  /**
   * Send response
   */
  if (metadataResponse.status == 200 && assetsResponse.status == 200) {
    res.setHeader('Content-Type', 'application/json')
    res.status(200).send({assets: assets, metadata: metadata})
  } else {
    res.setHeader('Content-Type', 'application/json')
    res.status(404).send(JSON.stringify({message: "Client not found", error: true}))
  }
}
