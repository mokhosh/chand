const axios = require('axios')
const path = require('path')
const Datastore = require('nedb')
const constants = require('./constants')
const db = new Datastore({
    filename: path.join(__dirname, 'db/prices.db'),
    autoload: true
})

exports.getCurrentPrices = function getCurrentPrices() {
    return new Promise((resolve, reject) => {
        let yesterday = getYesterday()
        db.findOne({ date: { $gt: yesterday } }, (error, doc) => {
            if (doc !== null) {
                resolve(doc)
                return
            }

            axios.get(constants.api)
                .then(response => {
                    let doc = extractPrices(response.data)
                    db.insert(doc)
                    resolve(doc)
                })
                .catch(error => reject(error))
        })
    })
}

exports.getPriceHistory = function getPriceHistory(key, callback) {
    db.find(makeQuery(key), makeProjection(key)).sort({ date: 1 }).exec((error, prices) => {
        callback(error, prices)
    })
}

function extractPrices(string) {
    let htmlPart = string.split('<div id="tgju">')[1].split('\'+copyright+\'')[0]
    let prices = Object.assign({}, constants.names)
    for (key in constants.names) {
        prices[key] = new RegExp(constants.names[key] + '[^\\d]*([\\d\\,]*)').exec(htmlPart)[1]
    }

    let doc = {
        prices,
        date: new Date()
    }
    return doc
}

function getYesterday() {
    let yesterday = new Date()
    yesterday.setHours(0, 0, 0)
    return yesterday
}

function makeQuery(key) {
    let query = {}
    query['prices.' + key] = { $exists: true }
    return query
}

function makeProjection(key) {
    let projection = {
        date: 1,
        _id: 0
    }
    projection['prices.' + key] = 1
    return projection
}

function deleteDuplicates() {
    db.find({}, { date: 1, _id: 0, 'prices.rob': 1 }).sort({ date: 1 }).exec((error, prices) => {
        for (let i = 1; i < prices.length; i += 1) {
            if (prices[i].date.getDay() === prices[i - 1].date.getDay() && prices[i].prices.rob === prices[i - 1].prices.rob) {
                db.remove({ date: prices[i].date })
            }
        }
    })
}
