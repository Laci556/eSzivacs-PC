// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron')
const autoUpdater = require('electron-updater').autoUpdater
const path = require('path')
const url = require('url')

const isDev = require('./assets/js/isdev')
//require('update-electron-app')()

require('ejs')
require('ejs-electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

// Setup auto updater.
function initAutoUpdater(event, data) {

  if(data){
      autoUpdater.allowPrerelease = true
  } else {
      // Defaults to true if application version contains prerelease components (e.g. 0.12.1-alpha.1)
      // autoUpdater.allowPrerelease = true
  }
  
  if(isDev){
      autoUpdater.autoInstallOnAppQuit = false
      autoUpdater.updateConfigPath = path.join(__dirname, 'dev-app-update.yml')
  }
  if(process.platform === 'darwin'){
      autoUpdater.autoDownload = false
  }
  autoUpdater.on('update-available', (info) => {
      event.sender.send('autoUpdateNotification', 'update-available', info)
  })
  autoUpdater.on('update-downloaded', (info) => {
      event.sender.send('autoUpdateNotification', 'update-downloaded', info)
  })
  autoUpdater.on('update-not-available', (info) => {
      event.sender.send('autoUpdateNotification', 'update-not-available', info)
  })
  autoUpdater.on('checking-for-update', () => {
      event.sender.send('autoUpdateNotification', 'checking-for-update')
  })
  autoUpdater.on('error', (err) => {
      event.sender.send('autoUpdateNotification', 'realerror', err)
  }) 
}

// Open channel to listen for update actions.
ipcMain.on('autoUpdateAction', (event, arg, data) => {
  switch(arg){
      case 'initAutoUpdater':
          console.log('Frissítési szolgáltatás beindítása...')
          initAutoUpdater(event, data)
          event.sender.send('autoUpdateNotification', 'ready')
          break
      case 'checkForUpdate':
          autoUpdater.checkForUpdates()
              .catch(err => {
                  event.sender.send('autoUpdateNotification', 'realerror', err)
              })
          break
      case 'allowPrereleaseChange':
          if(!data){
              const preRelComp = semver.prerelease(app.getVersion())
              if(preRelComp != null && preRelComp.length > 0){
                  autoUpdater.allowPrerelease = true
              } else {
                  autoUpdater.allowPrerelease = data
              }
          } else {
              autoUpdater.allowPrerelease = data
          }
          break
      case 'installUpdateNow':
          autoUpdater.quitAndInstall()
          break
      default:
          console.log('Unknown argument', arg)
          break
  }
})

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1052,
    height: 600,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    icon: path.join(__dirname, 'assets/img/icon.png')
  })

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'assets', 'index.ejs'),
    protocol: 'file:',
    slashes: true
  }))

  /* win.once('ready-to-show', () => {
        win.show()
    }) */

  // mainWindow.setMenu(null)

  mainWindow.setResizable(true)

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.setAppUserModelId(process.execPath)

app.on('activate', function () {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.