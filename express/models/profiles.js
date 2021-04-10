/**
 * Import FS
 */
const fs = require('fs')

/**
 * Init user data folder
 */
const userDataPath = require(`${__dirname}/../../userdata`).getPath()

/**
 * Create a new profile
 */
exports.create = async function(req, res) {
  const profileName = req.body.profileName
  const settings = req.body.settings

  fs.readFile(`${userDataPath}/profiles.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read profiles data", error: err.message}))
      return
    }
        
    // Read current profiles
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.profiles)) throw "Invalid jsonData"
    } catch {
      jsonData = null
    }
    // If JSON file is incorrect, create a new empty array
    let profiles = jsonData ? jsonData.profiles : []

    // Check if profile already exists
    let profileByName = profiles.filter(profile => {
      return profile.name.toLowerCase() === profileName.toLowerCase()
    })
    if (profileByName.length > 0) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Profile already exists", error: true}))
      return
    }

    // Add new profile
    const newProfile = {
      name: profileName,
      settings: settings
    }
    profiles.push(newProfile)
    let newJsonData = JSON.stringify({profiles: profiles}, null, 2)

    // Save profile to file
    fs.writeFile(`${userDataPath}/profiles.json`, newJsonData, 'utf8', ((err) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).send(JSON.stringify({message: "Unable to create profile", error: err.message}))
        return
      }
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({message: "Profile created", profiles: profiles, error: null}))
      return
    }))

  }))
}


/**
 * Update an existing profile
 */
exports.update = async function(req, res) {
  const profileName = req.body.profileName
  const settings = req.body.settings

  fs.readFile(`${userDataPath}/profiles.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read profiles data", error: err.message}))
      return
    }
        
    // Read current profiles
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.profiles)) throw "Invalid jsonData"
    } catch {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read profiles data", error: err.message}))
      return
    }
    let profiles = jsonData.profiles

    // Find profile
    let profileByName = profiles.findIndex(profile => {
      return profile.name === profileName
    })
    if (profileByName == -1) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to find profile", error: true}))
      return
    }

    // Update profile
    profiles[profileByName].settings = settings
        
    let newJsonData = JSON.stringify({profiles: profiles}, null, 2)

    // Save profiles to file
    fs.writeFile(`${userDataPath}/profiles.json`, newJsonData, 'utf8', ((err) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).send(JSON.stringify({message: "Unable to update profile", error: err.message}))
        return
      }
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({message: "Profile updated", profiles: profiles, error: null}))
      return
    }))

  }))
}


/**
 * Delete an existing profile
 */
exports.delete = async function(req, res) {
  const profileName = req.body.profileName

  fs.readFile(`${userDataPath}/profiles.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read profiles data", error: err.message}))
      return
    }
        
    // Read current profiles
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.profiles)) throw "Invalid jsonData"
    } catch {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read profiles data", error: err.message}))
      return
    }
    let profiles = jsonData.profiles

    // Find profile
    let profileByName = profiles.filter(profile => {
      return profile.name === profileName
    })
    if (profileByName.length == 0) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to find profile", error: true}))
      return
    }

    // Delete profile
    profiles = profiles.filter(profile => {
      return profile.name != profileName
    })
    let newJsonData = JSON.stringify({profiles: profiles}, null, 2)

    // Save profiles to file
    fs.writeFile(`${userDataPath}/profiles.json`, newJsonData, 'utf8', ((err) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).send(JSON.stringify({message: "Unable to delete profile", error: err.message}))
        return
      }
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({message: "Profile deleted", profiles: profiles, error: null}))
      return
    }))

  }))
}

/**
 * Get list of all profiles
 */
exports.getList = async function(req, res) {
  fs.readFile(`${userDataPath}/profiles.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read profiles data", error: err.message}))
      return
    }
        
    // Read current profiles
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.profiles)) throw "Invalid jsonData"
    } catch {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read profiles data", error: err.message}))
      return
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify(jsonData.profiles))
    return

  }))
}