// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')
const url = require('url')
//require('update-electron-app')()
const autoUpdater = require('./auto-updater')

require('ejs')
require('ejs-electron')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

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

  mainWindow.webContents.on('did-finish-load', () => {
    autoUpdater.init(mainWindow)
  })

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