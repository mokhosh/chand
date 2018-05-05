const { BrowserWindow, Tray, Menu } = require('electron')
const url = require('url')
const path = require('path')

let win, tray

exports.createWindow = function createWindow() {
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: path.join(__dirname, 'icon/icon.png'),
        resizable: false
    })
    win.loadURL(url.format({
        pathname: path.join(__dirname, 'windows/index.html'),
        protocol: 'file',
        slashes: true
    }))
    win.setMenu(null)
    win.on('closed', () => {
        win = null
    })
    // this and tray not working in ubuntu
    // win.on('close', function (event) {
    //     if (! app.isQuitting) {
    //         event.preventDefault()
    //         win.hide()
    //     }
    //     return false
    // })
    // win.on('minimize',function(event){
    //     event.preventDefault()
    //     win.hide()
    // })
    return win
}

exports.createTray = function createTray() {
    tray = new Tray(path.join(__dirname, 'icon/icon.png'))
    tray.setToolTip('Chand?!')
    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                label: 'پیدا / پنهان',
                click() {
                    win.isVisible() ? win.hide() : win.show()
                }
            },
            { type: "separator" },
            {
                label: 'خروج',
                click() {
                    app.isQuitting = true
                    app.quit()
                }
            }
        ])
    )
    tray.on('click', () => {
        win.isVisible() ? win.hide() : win.show()
    })
}