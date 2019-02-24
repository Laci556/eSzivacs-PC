
(function () {
  const remote = require('electron').remote

  function init () {
    document.getElementById('min-btn').addEventListener('click', function (e) {
      const window = remote.getCurrentWindow()
      window.minimize()
    })

    document.getElementById('max-btn').addEventListener('click', function (e) {
      const window = remote.getCurrentWindow()
      if (!window.isMaximized()) {
        window.maximize()
      } else {
        window.unmaximize()
      }
    })

    document.getElementById('close-btn').addEventListener('click', function (e) {
      const window = remote.getCurrentWindow()
      const app = remote.app
      require('./js/file').getGlobal("settings", {}).then(function(result){
        var shouldClose = true;
        if(result["totray"]){
          shouldClose = false;
        }
        if(shouldClose){

          console.log(shouldClose);
          app.quit();
        } else {
          require('./js/tray').startTray(window);
          window.hide();
        }
      });
    })
  };

  document.onreadystatechange = function () {
    if (document.readyState == 'complete') {
      init()
    }
  }
})()
