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
    }

};