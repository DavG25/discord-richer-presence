/**
 * Imports
 */
const fs = require('fs')
const normalize = require('normalize-path')
const getAppDataPath = require("appdata-path")
const appName = require(`${__dirname}/../package.json`).productName || require(`${__dirname}/../package.json`).name

/**
 * Define user data path and files
 */
const userDataPath = process.env.NODE_ENV==='development' ? normalize(`${getAppDataPath(appName)}/User Data Dev`) : normalize(`${getAppDataPath(appName)}/User Data`)
const userDataFiles = [
  {
    name: "settings.json",
    path: `${userDataPath}/settings.json`,
    template: `${__dirname}/settings.json`
  },
  {
    name: "profiles.json",
    path: `${userDataPath}/profiles.json`,
    template: `${__dirname}/profiles.json`
  },
  {
    name: "triggers.json",
    path: `${userDataPath}/triggers.json`,
    template: `${__dirname}/triggers.json`
  }
]

/**
 * Check if user data folder exists and create it if it doesn't
 */
exports.checkFolder = async function() {
  return new Promise((resolve, reject) => {
    fs.access(userDataPath, fs.F_OK, (err) => {
      if (err) {
        fs.mkdir(userDataPath, {recursive: true}, (err) => {
          if (err) {
            reject(err)
            return
          }
          resolve(true)
          return
        })
      }
      resolve(true)
      return
    })
  })
}

/**
 * Check if user data files exist and are valid, otherwise fix them or create them
 */
exports.checkFiles = async function() {
  return new Promise((resolve, reject) => {
    let errors = []
    for (const file of userDataFiles) {
      // Check if file exists
      fs.access(file.path, fs.F_OK, (err) => {
        // Create file from template if it doesn't exist
        if (err) {
          fs.copyFile(file.template, file.path, (err) => {
            if (err) {
              errors.push(`Error for ${file.name}: ${err}`)
              return
            }
            return
          })
        } 
        // TODO: Overwrite file from template if it's invalid
      })
    }

    if (errors.length == 0) resolve(true)
    else reject(errors)
  })
}

/**
 * Get the current user data folder path
 */
exports.getPath = function() {
  return userDataPath
}