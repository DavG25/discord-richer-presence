/**
 * Imports
 */
const PowerShell = require("powershell")
const normalize = require('normalize-path')
const { extractIcon } = require('@bitdisaster/exe-icon-extractor')
const fs = require('fs')


/**
 * Get list of all currently running executables (Windows only)
 */
exports.getList = async function(req, res) {
  const getIcons = req.query.icons == 'true' ? true : false || false

  /**
   * Create a PowerShell command to get all tasks that have a start time and a main window title
   */
  const command = `
        $OutputEncoding = [System.Console]::OutputEncoding = [System.Console]::InputEncoding = [System.Text.Encoding]::UTF8;
        $PSDefaultParameterValues['*:Encoding'] = 'utf8';
        $procList = New-Object System.Collections.ArrayList;
        $procList = Get-Process | Where-Object {$_.StartTime <# -and $_.MainWindowTitle -and $_.MainWindowHandle #>} | Select-Object -Property
          @{Name="StartTimeSeconds"; Expression={New-TimeSpan -Start $_.StartTime | Select -ExpandProperty TotalSeconds}},
          Product,
          ProcessName,
          @{Name="ModuleName"; Expression={$_.MainModule.ModuleName}},
          MainWindowTitle,
          Path;
        $procList = $procList | ConvertTo-Json;
        Write-Output $procList;
    `
    .replace(/\n/g, " ") // Make the command a one line string

  /**
   * Create PowerShell promise
   */
  const runPowerShell = (command) => {
    return new Promise((resolve, reject) => {
      let ps = new PowerShell(command)

      // Error
      ps.on("error", err => {
        reject(err)
      })
      
      // Stdout
      ps.on("output", data => {
        resolve(data)
      })
      
      // Stderr
      ps.on("error-output", data => {
        reject(data)
      })
    })
  }

  /**
   * Run PowerShell command
   */
  runPowerShell(command)
    .then(output => {
      // Tasks array
      let tasks = JSON.parse(output)

      /**
       * Format tasks list
       */
      tasks.forEach((task, index) => {
        /**
         * Normalize the process path
         */
        if (task.Path) {
          tasks[index].Path = normalize(task.Path)
        }
        /**
         * Create a "SafeModuleName", this key will always contain the application EXE name and cannot be null
         */
        tasks[index].SafeModuleName = task.ModuleName || `${task.ProcessName}.exe`
        /**
         * Create a "SafePath", this key will always contain the application path or EXE name but cannot be null
         */
        tasks[index].SafePath = task.Path || `${task.SafeModuleName}`
      })

      /**
       * If there are multiple entries of the same process and only one with a MainWindowTitle,
       * remove all the others without the MainWindowTitle
       */
      tasks.forEach((task, index) => {
        /**
         * Check for other processes to delete only if the process has a MainWindowTitle
         */
        if (task.MainWindowTitle) {
          /**
           * Get an array of indexes of all the processes without a MainWindowTitle and the same Path and SafeModuleName
           */
          const tasksToDelete = tasks.map((taskToDelete, idx) => (
            taskToDelete.MainWindowTitle == "" 
            && taskToDelete.Path === task.Path
            && taskToDelete.SafeModuleName === task.SafeModuleName) ? idx : '').filter(String)

          /**
           * Remove the processes without the MainWindowTitle
           */
          tasks = tasks.filter(function(task, index) {
            return tasksToDelete.indexOf(index) == -1
          })
        }
      })

      /**
       * Remove duplicates
       * A task in considered unique when no other task has the same Path and SafeModuleName
       */
      tasks = tasks.filter((v,i,a)=>a.findIndex(t=>(t.Path === v.Path && t.SafeModuleName===v.SafeModuleName))===i)

      /**
       * Remove non EXE processes (WTF Windows?)
       */
      tasks = tasks.filter(function(task, index) {
        return task.SafeModuleName.endsWith(".exe") == true
      })
        
      /**
       * Get icons if specified in request
       */
      if (getIcons) {
        let index = 0
        for (const task of tasks) {
          try {
            let buffer = extractIcon(task.path, 'large')
            tasks[index].base64_icon = new Buffer.from(buffer).toString('base64')
          } catch {
            tasks[index].base64_icon = null
          }
          index++
        }
      }

      res.setHeader('Content-Type', 'application/json')
      res.status(200).send(JSON.stringify(tasks))
    })
    .catch(err => {
      console.log(err)
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(JSON.stringify({message: "Unable to get executables list", error: err.message}))
    })
    
    
}


/**
 *  Validate that executable exists and get its image (Windows only)
 */
/*
 *exports.getInfo = async function(req, res) {
 *    const executables = req.body.executables || []
 *    const getIcons = req.query.icons == 'true' ? true : false || false
 *    
 *
 *    let executablesInfo = []
 *    let index = 0
 *    for (const executable of executables) {
 *        executablesInfo[index] = {}
 *
 *        if (fs.existsSync(executable.path)) {
 *            executablesInfo[index].exists = true
 *        } else {
 *            executablesInfo[index].exists = false
 *        }
 *
 *        if (getIcons) {
 *            try {
 *                let buffer = extractIcon(normalize(executable.path), 'large')
 *                executablesInfo[index].base64_icon = new Buffer.from(buffer).toString('base64')
 *            } catch {
 *                executablesInfo[index].base64_icon = null
 *            }
 *        }
 *        index++
 *    }
 *
 *    res.setHeader('Content-Type', 'application/json')
 *    res.status(200).send(JSON.stringify(executablesInfo))
 *}
 */

