const windowManager = require('./windowManager')
const dbManager = require('./dbManager')

let { app, ipcMain } = require('electron')
let win
let priceChecker = setInterval(dbManager.getCurrentPrices, 1000 * 60 * 60 * 24)

app.on('ready', () => {
    win = windowManager.createWindow()
    win.webContents.on('did-finish-load', () => {
        dbManager.getCurrentPrices()
            .then(prices => {
                win.webContents.send('prices:latest', prices)
            }).catch(error => console.log(error))
    })
})
app.on('window-all-closed', () => {
    priceChecker.unref
    app.quit()
    app = priceChecker = null
})
ipcMain.on('req:stat', (e, key) => {
    dbManager.getPriceHistory(key, (error, prices) => {
        win.webContents.send('prices:chart', { prices, key })
    })
})
