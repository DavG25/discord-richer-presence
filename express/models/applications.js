/**
 * Imports
 */
const fetch = require("node-fetch")

/**
 * Discord API settings
 */
const discordApiEndpoint = "https://discord.com/api/v8"

/**
 * Get list of official applications (also called detectables)
 */
exports.getList = async function(req, res) {
  /**
   * Query Discord API to get list
   */
  const response = await fetch(`${discordApiEndpoint}/applications/detectable`, {
    method: 'GET', mode: 'cors', cache: 'no-cache', credentials: 'same-origin',
    redirect: 'follow', referrerPolicy: 'no-referrer'
  })
  const responseBody = await response.json().catch(() => {})

  /**
   * Full image URL helper: add an entry to each client with a full image URL
   */
  responseBody.forEach(function(client, index, clients) {
    if (clients[index].icon) {
      /**
       * Has icon
       */
      clients[index].icon_url = `https://cdn.discordapp.com/app-icons/${client.id}/${client.icon}.png`
    } else {
      /**
       * Does not have icon
       */
      clients[index].icon_url = null
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
    res.status(404).send(JSON.stringify({message: "Unable to fetch list", error: true}))
  }
}
