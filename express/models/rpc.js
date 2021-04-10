/**
 * Import RPC server
 */
const RPCServer = require(`${__dirname}/../../rpc/discord-rpc`)

/**
 * Import RPC settings validator
 */
const RPCSettings = require(`${__dirname}/rpcSettings`)


/**
 * Start the RPC server with received data
 */
exports.start = async function(req, res) {
  let rpcSettings = RPCSettings.format(req.body.rpcSettings)
  let response = await RPCServer.start(rpcSettings)

  res.setHeader('Content-Type', 'application/json')
  if (response.error) res.status(500).send(JSON.stringify(response))
  else res.status(200).send(JSON.stringify(response))
}


/**
 * Update the RPC server with received data
 */
exports.update = async function(req, res) {
  let rpcSettings = RPCSettings.format(req.body.rpcSettings)
  let response = await RPCServer.update(rpcSettings)

  res.setHeader('Content-Type', 'application/json')
  if (response.error) res.status(500).send(JSON.stringify(response))
  else res.status(200).send(JSON.stringify(response))
}


/**
 * Stop the RPC server
 */
exports.stop = async function(req, res) {
  let response = await RPCServer.stop()
  res.setHeader('Content-Type', 'application/json')
  if (response.error) res.status(500).send(JSON.stringify(response))
  else res.status(200).send(JSON.stringify(response))
}


/**
 * Get RPC server status
 */
exports.status = async function(req, res) {
  let response = await RPCServer.status()
  res.setHeader('Content-Type', 'application/json')
  if (response.error) res.status(500).send(JSON.stringify(response))
  else res.status(200).send(JSON.stringify(response))
}