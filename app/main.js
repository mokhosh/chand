let { app, ipcMain, BrowserWindow, Tray, Menu } = require('electron')
let path = require('path')
let url = require('url')
let axios = require('axios')
let Datastore = require('nedb')
let constants = require('./constants')

let win, tray
let db = new Datastore({ filename: path.join(__dirname,'db/prices.db'), autoload: true })

setInterval(getCurrentPrices, 1000 * 60 * 60 * 24)
app.on('ready', bootstrap)
ipcMain.on('req:stat', (e, key) => {
    db.find({}, makeProjection(key)).sort({date: 1}).exec((error, prices) => {
        win.webContents.send('prices:chart', {prices, key})
    })
})

function bootstrap() {
    createWindow()
    createTray()
    win.webContents.on('did-finish-load', () => {
        getCurrentPrices()
            .then(prices => {
                win.webContents.send('prices:latest', prices)
            }).catch(error => console.log(error))
    })
}

function createWindow()
{
    win = new BrowserWindow({
        width: 800,
        height: 600,
        icon: `${__dirname}/icon/icon.png`,
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
    win.on('minimize',function(event){
        event.preventDefault()
        win.hide()
    })
    win.on('close', function (event) {
        if (! app.isQuitting) {
            event.preventDefault()
            win.hide()
        }
        return false
    })
}

function createTray()
{
    tray = new Tray(`${__dirname}/icon/icon.png`)
    tray.setToolTip('Chand?!')
    tray.setContextMenu(
        Menu.buildFromTemplate([
            {
                label: 'پیدا / پنهان',
                click() {
                    win.isVisible() ? win.hide() : win.show()
                }
            },
            {type: "separator"},
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

function getCurrentPrices()
{
    return new Promise((resolve, reject) => {
        let yesterday = getYesterday()
        db.findOne({date: {$gt: yesterday}}, (error, doc) => {
            if (doc !== null) {
                resolve(doc)
                return
            }

            axios.get(constants.coinApi)
                .then(response => {
                    let doc = extractPrices(response.data)
                    db.insert(doc)
                    resolve(doc)
                })
                .catch(error => reject(error))
        })
    })
}

function extractPrices(string)
{
    let htmlPart = string.split('<div id="tgju">')[1].split('\'+copyright+\'')[0]
    let bahar = /سکه بهار آزادی[^\d]*([\d\,]*)/.exec(htmlPart)[1]
    let emami = /سکه امامی[^\d]*([\d\,]*)/.exec(htmlPart)[1]
    let nim = /نیم سکه[^\d]*([\d\,]*)/.exec(htmlPart)[1]
    let rob = /ربع سکه[^\d]*([\d\,]*)/.exec(htmlPart)[1]
    let gerami = /سکه گرمی[^\d]*([\d\,]*)/.exec(htmlPart)[1]

    let doc = {
        prices: {bahar, emami, nim, rob, gerami},
        date: new Date()
    }
    return doc
}

function getYesterday()
{
    let yesterday = new Date()
    yesterday.setHours(0,0,0)
    return yesterday
}

function makeProjection(key)
{
    let projection = {
        date: 1,
        _id: 0
    }
    projection['prices.' + key] = 1
    return projection
}