module.exports = {
    startTray: function (window) {
        const { app, Menu, Tray } = require('electron').remote;

        let tray = null

        tray = new Tray(require('electron').remote.app.getAppPath()+"/assets/img/icon.png"); //new Tray('assets/img/icon.png');
        const contextMenu = Menu.buildFromTemplate([
            {
                label: `eSzivacs v${require('../../package.json').version}`,
                enabled: false
            },
            {
                label: 'Bezárás',
                click: function () {
                    app.quit();
                }
            }
        ])

        tray.addListener('click', function(){
            window.show();
            tray.destroy();
        })
        tray.setToolTip(`eSzivacs v${require('../../package.json').version}`)
        tray.setContextMenu(contextMenu)
    },
    totray: function() {
        return new Promise(function(resolve, reject){
            const file = require('./file');
            file.getGlobal("settings", {}).then(function(result, err){
                if(err) reject(err);
                if(result["totray"] == true){
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        });
    }
};