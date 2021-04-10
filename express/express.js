/**
 * Express settings
 */
const express = require('express')
const app = express()
const port = 2501
const route = "/api/v1"

/**
 * CORS
 */
var cors = require('cors')
app.use(cors())


/**
 * Body parser
 */
app.use(express.urlencoded({ extended: false }))
app.use(express.json())


/**
 * Models
 */
const rpc = require(`${__dirname}/models/rpc`)
const applications = require(`${__dirname}/models/applications`)
const client = require(`${__dirname}/models/client`)
const profiles = require(`${__dirname}/models/profiles`)
const triggers = require(`${__dirname}/models/triggers`)
const executables = require(`${__dirname}/models/executables`)
const heartbeat = require(`${__dirname}/models/heartbeat`)


/**
 * Heartbeat, used to keep the webserver alive or kill it
 */
app.post(`${route}/heartbeat/keep-alive`, heartbeat.keepAlive)
app.post(`${route}/heartbeat/kill`, heartbeat.kill)


/**
 * API routes
 */
app.post(`${route}/rpc/start`, rpc.start)
app.post(`${route}/rpc/update`, rpc.update)
app.post(`${route}/rpc/stop`, rpc.stop)
app.get(`${route}/rpc/status`, rpc.status)

app.get(`${route}/applications/get-list`, applications.getList)

app.get(`${route}/clients/:clientId/get-metadata`, client.getMetadata)
app.get(`${route}/clients/:clientId/get-assets`, client.getAssets)
app.get(`${route}/clients/:clientId/get-compound`, client.getCompound)

app.post(`${route}/profiles/create`, profiles.create)
app.post(`${route}/profiles/update`, profiles.update)
app.delete(`${route}/profiles/delete`, profiles.delete)
app.get(`${route}/profiles/get-list`, profiles.getList)

app.post(`${route}/triggers/create`, triggers.create)
app.post(`${route}/triggers/update`, triggers.update)
app.delete(`${route}/triggers/delete`, triggers.delete)
app.get(`${route}/triggers/get-list`, triggers.getList)

app.post(`${route}/triggers/set-enabled`, triggers.setEnabled)
app.get(`${route}/triggers/get-enabled`, triggers.getEnabled)

app.get(`${route}/executables/get-list`, executables.getList)


/**
 * Serve the public folder (VueJS site)
 * During development we will connect to the hot-reload VueJS app instead of using this
 * During production we will serve the minified static files that VueJS built for us
 */
const path = require('path')
const distPath = process.env.NODE_ENV==='development' ? `${path.resolve(__dirname+"/../dist")}` : `${path.resolve(process.resourcesPath+"/../dist")}`
const staticMiddleware = express.static(distPath)
app.use(staticMiddleware)


/**
 * Direct all routes except the one that start with "api" to the VueJS index file
 * This is needed for the VueJS router using history mode
 */
app.get(/^\/(?!api).*/, (_req, res) => {
  try {
    res.sendFile(`${distPath}/index.html`);
  } catch (error) {
    res.json({ message: "Sorry, something went wrong!", error: error});
  }
})


/**
 * Start web server
 */
exports.start = function() {
  return new Promise((resolve, reject) => {
    app.listen(port, () => {
      console.log(`Web server started at http://localhost:${port}`)
      resolve(true)
    })
      .on('error', (err) => {
        console.error("Unable to start web server: ", err)
        reject(err)
      })
        
  })
}
