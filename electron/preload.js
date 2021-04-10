/**
 * Preload imports
 */
const remote = require('@electron/remote') // TODO: Remove remote and enable context isolation
const { app, dialog } = remote
const { ipcRenderer } = require('electron')
const mainWindow = remote.require(`${__dirname}/state`).index.mainWindow
const os = require('os')
const fs = require('fs')
const { extractIcon } = require('@bitdisaster/exe-icon-extractor')
const settings = remote.require(`${__dirname}/settings`)
const userDataPath = remote.require(`${__dirname}/../userdata`).getPath()
const setAutoStart = remote.require(`${__dirname}/app`).setAutoStart
const quitAndInstallUpdate = remote.require(`${__dirname}/app`).quitAndInstallUpdate

/**
 * Add modules
 */
window.electron = {}
window.electron.app = app
window.electron.dialog = dialog
window.electron.ipcRenderer = ipcRenderer
window.electron.mainWindow = mainWindow
window.electron.os = os
window.electron.fs = fs
window.electron.extractIcon = extractIcon
window.electron.settings = settings
window.electron.userDataPath = userDataPath
window.electron.setAutoStart = setAutoStart
window.electron.quitAndInstallUpdate = quitAndInstallUpdate
window.electron.__dirname = __dirname

/**
 * Update status of all dymanic elements in the electron app
 */
const setIcon = remote.require(`${__dirname}/window`).setIcon
const setTray = remote.require(`${__dirname}/window`).setTray
window.electron.setStatus = ({clientStatus = null, triggersStatus = null, profiles = null}) => {
  setIcon({clientStatus: clientStatus})
  setTray({clientStatus: clientStatus, triggersStatus: triggersStatus, profiles: profiles, update: true})
}