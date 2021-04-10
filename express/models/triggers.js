/**
 * Import FS and normalize path
 */
const fs = require('fs')
const normalize = require('normalize-path')

/**
 * Init user data folder
 */
const userDataPath = require(`${__dirname}/../../userdata`).getPath()

/**
 * Create a new trigger
 */
exports.create = async function(req, res) {
  const triggerPath = normalize(req.body.path)
  const triggerName = req.body.name || null // The trigger name is just a name displayed on the UI, not used for detection
  const triggerAction = req.body.action

  fs.readFile(`${userDataPath}/triggers.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
        
    // Read current triggers
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.triggers) || typeof jsonData.enabled !== 'boolean') throw "Invalid jsonData"
      let defaultTrigger = jsonData.triggers.filter(trigger => {
        return trigger.path === false // False is the path for "Nothing from this list"
      })
      if (defaultTrigger.length == 0) throw "Default trigger is missing"
    } catch (err) {
      jsonData = null
    }
    // If JSON file is incorrect, create a new default array
    let data = jsonData ? jsonData : {enabled: false, triggers: [{path: false, name: null, action: false}]}
    let enabled = data.enabled
    let triggers = data.triggers

    // Check if trigger already exists (case insensitive)
    let triggerByPath = triggers.filter(trigger => {
      return trigger.path ? trigger.path.toLowerCase() === triggerPath.toLowerCase() : trigger.path === triggerPath
    })
    if (triggerByPath.length > 0) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Trigger already exists", error: true}))
      return
    }

    // Add new trigger
    const newTrigger = {
      path: triggerPath,
      name: triggerName,
      action: triggerAction || false
    }
    triggers.push(newTrigger)
    let newJsonData = JSON.stringify({enabled: enabled, triggers: triggers}, null, 2)

    // Save trigger to file
    fs.writeFile(`${userDataPath}/triggers.json`, newJsonData, 'utf8', ((err) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).send(JSON.stringify({message: "Unable to create trigger", error: err}))
        return
      }
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({message: "Trigger created", triggers: triggers, error: null}))
      return
    }))

  }))
}


/**
 * Update an existing trigger
 */
exports.update = async function(req, res) {
  const triggerPath = req.body.path ? normalize(req.body.path) : req.body.path // Path could be false when updating the default trigger, not needed on create and delete since the default trigger can't be deleted or created
  const triggerAction = req.body.action

  fs.readFile(`${userDataPath}/triggers.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
        
    // Read current triggers
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.triggers) || typeof jsonData.enabled !== 'boolean') throw "Invalid jsonData"
    } catch (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
    let data = jsonData
    let enabled = data.enabled
    let triggers = data.triggers

    // Find trigger
    let triggerByPath = triggers.findIndex(trigger => {
      return trigger.path === triggerPath
    })
    if (triggerByPath == -1) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to find trigger", error: true}))
      return
    }

    // Update trigger
    triggers[triggerByPath].action = triggerAction
        
    let newJsonData = JSON.stringify({enabled: enabled, triggers: triggers}, null, 2)

    // Save triggers to file
    fs.writeFile(`${userDataPath}/triggers.json`, newJsonData, 'utf8', ((err) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).send(JSON.stringify({message: "Unable to update trigger", error: err}))
        return
      }
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({message: "Trigger updated", triggers: triggers, error: null}))
      return
    }))

  }))
}


/**
 * Delete an existing trigger
 */
exports.delete = async function(req, res) {
  const triggerPath = normalize(req.body.path)

  fs.readFile(`${userDataPath}/triggers.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
        
    // Read current triggers
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.triggers) || typeof jsonData.enabled !== 'boolean') throw "Invalid jsonData"
    } catch (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
    let data = jsonData
    let enabled = data.enabled
    let triggers = data.triggers

    // Find trigger
    let triggerByPath = triggers.filter(trigger => {
      return trigger.path === triggerPath
    })
    if (triggerByPath.length == 0) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to find trigger", error: true}))
      return
    }

    // Delete trigger
    triggers = triggers.filter(trigger => {
      return trigger.path != triggerPath
    })
    let newJsonData = JSON.stringify({enabled: enabled, triggers: triggers}, null, 2)

    // Save triggers to file
    fs.writeFile(`${userDataPath}/triggers.json`, newJsonData, 'utf8', ((err) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).send(JSON.stringify({message: "Unable to delete trigger", error: err}))
        return
      }
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({message: "Trigger deleted", triggers: triggers, error: null}))
      return
    }))

  }))
}

/**
 * Get list of all triggers
 */
exports.getList = async function(req, res) {
  fs.readFile(`${userDataPath}/triggers.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
        
    // Read current triggers
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.triggers) || typeof jsonData.enabled !== 'boolean') throw "Invalid jsonData"
    } catch (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify(jsonData.triggers))
    return

  }))
}


/**
 * Set triggers enabled status
 */
exports.setEnabled = async function(req, res) {
  const enabled = req.body.enabled || false

  fs.readFile(`${userDataPath}/triggers.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
        
    // Read current triggers
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.triggers) || typeof jsonData.enabled !== 'boolean') throw "Invalid jsonData"
    } catch (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
    let data = jsonData
    let triggers = data.triggers

    // Enabled status is contained inside body
        
    let newJsonData = JSON.stringify({enabled: enabled, triggers: triggers}, null, 2)

    // Save status to file
    fs.writeFile(`${userDataPath}/triggers.json`, newJsonData, 'utf8', ((err) => {
      if (err) {
        res.setHeader('Content-Type', 'application/json')
        res.status(500).send(JSON.stringify({message: "Unable to update triggers status", error: err}))
        return
      }
      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify({message: "Triggers status updated", enabled: enabled, error: null}))
      return
    }))

  }))
}


/**
 * Gets if triggers are enabled or not
 */
exports.getEnabled = async function(req, res) {
  fs.readFile(`${userDataPath}/triggers.json`, ((err, jsonData) => {
    if (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }
        
    // Read current status
    try {
      jsonData = JSON.parse(jsonData)
      if (!Array.isArray(jsonData.triggers) || typeof jsonData.enabled !== 'boolean') throw "Invalid jsonData"
    } catch (err) {
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to read triggers data", error: err}))
      return
    }

    res.setHeader('Content-Type', 'application/json')
    res.status(200).send(JSON.stringify(jsonData.enabled))
    return

  }))
}