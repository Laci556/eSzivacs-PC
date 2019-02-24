const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

let lastMsgId = 0

window.quitAndInstall = function () {
  electron.remote.autoUpdater.quitAndInstall()
}

ipcRenderer.on('console', (event, consoleMsg) => {
  console.log(consoleMsg)
})

ipcRenderer.on('message', (event, data) => {
  showMessage(data.msg, data.hide, data.replaceAll)
})

ipcRenderer.on('modal', (event, data) => {
  showModal()
})

/*
function showMessage(message, hide = true, replaceAll = false) {
  const messagesContainer = document.querySelector('.messages-container')
  const msgId = lastMsgId++ + 1
  const msgTemplate = `<div id="${msgId}" class="alert alert-info alert-info-message animated fadeIn">${message}</div>`

  if (replaceAll) {
    messagesContainer.innerHTML = msgTemplate
  } else {
    messagesContainer.insertAdjacentHTML('afterbegin', msgTemplate)
  }

  if (hide) {
    setTimeout(() => {
      const msgEl = document.getElementById(msgId)
      msgEl.classList.remove('fadeIn')
      msgEl.classList.add('fadeOut')
    }, 4000)
  }
}
*/

function showMessage (message, hide = true, replaceAll = false) {
  M.toast({
    html: msg,
    displayLength: 2147483647
  })
}

function showModal () {
  document.querySelector('body').innerHTML += `  <div id="updateAvailable" class="modal">
  <div class="modal-content center-align">
    <h4>Új frissítés érhető el!</h4>
    <div class="modal-footer">
      <a href="#!" class="modal-close waves-effect waves-grey btn-flat">Később</a>
      <a href="#!" class="modal-close waves-effect waves-grey btn-flat" id="quitAndInstall">Telepítés</a>
    </div>
  </div>
</div>`
  document.getElementById('quitAndInstall').addEventListener('click', quitAndInstall)
  var elem = document.getElementById('updateAvailable')
  var instance = M.Modal.init(elem, {})
  instance.open()
}
