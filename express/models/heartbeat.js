/**
 * Import UUID
 */
const { v4: uuidv4 } = require('uuid')

/**
 * Init death timer
 */
let die, sessionId
const timeout = 8000

/**
 * Keep the server alive as long as client sends heartbeats
 */
exports.keepAlive = async function(req, res) {
  if (!die || !sessionId) {
    /**
     * Create death timer and session ID
     */
    die = setTimeout(kill, timeout)
    sessionId = uuidv4()
  }
  else if (req.body.sessionId == sessionId) {
    /**
     * Only refresh death timer if client sent correct session ID
     */
    clearTimeout(die) 
    die = setTimeout(kill, timeout)
  }
    
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify({sessionId: sessionId}))
}


/**
 * Kill the web server and RP client
 */
exports.kill = async function(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.status(200).send(JSON.stringify({message: "Server killed", error: null}))

  process.exit(1)
}


/**
 * Client is no longer sending heartbeats, kill the server
 */
function kill() {
  // process.exit(1)
}