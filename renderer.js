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

ipcRenderer.on('pushToMain', (event, data) => {
  pushToFooldal()
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
    html: message,
    displayLength: 2147483647
  })
}

function showModal () {
  document.getElementsByClassName("sidenav")[0].innerHTML = document.getElementsByClassName("sidenav")[0].innerHTML + `
  <li class="quitAndInstall green-text"><a href="#!"><i class="material-icons">done</i>Frissítés letöltve. Újraindítás!</a></li>
  <li class="divider"></li>`;

  document.getElementById("user").innerHTML = document.getElementById("user").innerHTML + `<li class="quitAndInstall"><a href="#!">Frissítés letöltve. Újraindítás!</a></li>
  `
  document.querySelector('body').innerHTML += `  <div id="updateAvailable" class="modal">
  <div class="modal-content center-align">
    <h4>Új frissítés érhető el!</h4>
    <div class="modal-footer">
      <a href="#!" class="modal-close waves-effect waves-grey btn-flat">Később</a>
      <a href="#!" class="modal-close waves-effect waves-grey btn-flat quitAndInstall">Telepítés</a>
    </div>
  </div>
</div>`
  var restartButtons = document.getElementsByClassName('quitAndInstall');
  for(var i = 0; i < restartButtons.length; i++){
    restartButtons[i].addEventListener('click', quitAndInstall)
  }
  var elem = document.getElementById('updateAvailable')
  var instance = M.Modal.init(elem, {})
  instance.open()
}

function pushToFooldal () {
  document.getElementById("fooldal").innerHTML += `<div class="col s12 m4"><div class="card"><div class="card-content"><h4>🎉 Új frissítés érhető el</h4></div><div class="card-action"><a href="#" class="quitAndInstall black-text">Újraindítás és telepítés</a></div></div></div>`
  var restartButtons = document.getElementsByClassName('quitAndInstall');
  for(var i = 0; i < restartButtons.length; i++){
    restartButtons[i].addEventListener('click', quitAndInstall)
  }
  var elem = document.getElementById('updateAvailable')
  var instance = M.Modal.init(elem, {})
  instance.open()
}
