const electron = require('electron')
const os = require('os')
const autoUpdater = electron.autoUpdater
const appVersion = require('../package.json').version

let updateFeed = ''
let initialized = false
const platform = `${os.platform()}-${os.arch()}`
const nutsURL = 'https://update.electronjs.org/pepyta/eSzivacs-PC/'

if (os.platform() === 'darwin') {
    updateFeed = `${nutsURL}/update/darwin-x64/${appVersion}`
} else if (os.platform() === 'win32') {
    updateFeed = `https://update.electronjs.org/pepyta/eSzivacs-PC/${platform}/${appVersion}`;
    //updateFeed = `${nutsURL}/update/${platform}/${appVersion}`
}

//https://update.electronjs.org/pepyta/eSzivacs-PC/win32-x64/1.0.0

function init(mainWindow) {
    mainWindow.webContents.send('console', updateFeed)
  mainWindow.webContents.send('console', `App version: ${appVersion}`)
  mainWindow.webContents.send('console', `🖥 App version: ${appVersion}`)

  if (initialized || !updateFeed || process.env.NODE_ENV === 'development') { return }

  initialized = true

  autoUpdater.setFeedURL(updateFeed)

  autoUpdater.on('error', (ev, err) => {
    mainWindow.webContents.send('console', `😱 Error: ${err}`)
  })

  autoUpdater.once('checking-for-update', (ev, err) => {
    mainWindow.webContents.send('console', '🔎 Checking for updates')
  })

  autoUpdater.once('update-available', (ev, err) => {
    mainWindow.webContents.send('console', '🎉 Update available. Downloading ⌛️')
  })

  autoUpdater.once('update-not-available', (ev, err) => {
    mainWindow.webContents.send('console', '👎 Update not available')
  })

  autoUpdater.once('update-downloaded', (ev, err) => {
    const msg = '<p style="margin: 0;">🤘 Update downloaded - <a onclick="quitAndInstall()">Restart</a></p>'
    mainWindow.webContents.send('console',  '<p style="margin: 0;">🤘 Update downloaded - <a onclick="quitAndInstall()">Restart</a></p>')
  })

  autoUpdater.checkForUpdates()
}

module.exports = {
  init
}
