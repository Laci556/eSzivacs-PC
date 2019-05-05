(function() {
  const remote = require('electron').remote;

  function init() {
    document.getElementById('min-btn').addEventListener('click', function(e) {
      const window = remote.getCurrentWindow();
      window.minimize();
    });

    document.getElementById('max-btn').addEventListener('click', function(e) {
      const window = remote.getCurrentWindow();
      if (!window.isMaximized()) {
        window.maximize();
      } else {
        window.unmaximize();
      }
    });

    document.getElementById('close-btn').addEventListener('click', function(e) {
      const window = remote.getCurrentWindow();
      const app = remote.app;
      // macOS-en a bezárás gomb alapértelmezetten nem zárja be teljesen az alkalmazást, csak a dock-ra teszi
      if (require('os').platform == 'darwin') {
        window.close();
      } else {
        require('./js/file')
          .getGlobal('settings', {})
          .then(function(result) {
            var shouldClose = true;
            if (result['totray']) {
              shouldClose = false;
            }
            if (shouldClose) {
              console.log(shouldClose);
              app.quit();
            } else {
              require('./js/tray').startTray(window);
              window.hide();
            }
          });
      }
    });
  }

  document.onreadystatechange = function() {
    if (document.readyState == 'complete') {
      init();
    }
  };
})();
