const fs = require('fs')
const state = require(`${__dirname}/state`).index
const userDataPath = require(`${__dirname}/../userdata`).getPath()

exports.get = () => { 
  // Load user settings
  return new Promise((resolve, reject) => {
    fs.readFile(`${userDataPath}/settings.json`, "utf8", async (err, settings) => {
      if (err) {
        console.log("Unable to read user settings")
        resolve({}) // We should create the window even if we can't read the settings
        return
      }
      settings = JSON.parse(settings)
      resolve(settings)
    })
  })
}

exports.load = () => { 
  // Load user settings to state
  return new Promise((resolve, reject) => {
    fs.readFile(`${userDataPath}/settings.json`, "utf8", async (err, settings) => {
      if (err) {
        state.settings = {}
        resolve(false) // Non blocking
        return
      }
      settings = JSON.parse(settings)
      state.settings = settings
      resolve(true)
    })
  })
}

exports.set = (settings) => { 
  // Set new settings to current state
  state.settings = settings
}