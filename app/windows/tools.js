const names = require('../constants').names

exports.extractData = function extractData(input) {
    let labels = [], data = []

    for (item of input.prices) {
        labels[labels.length] = formatDate(item.date)
        data[data.length] = currencyToNumber(item.prices[input.key])
    }

    return { labels, data, name: names[input.key] }
}

exports.sortedKeys = function sortedKeys(object) {
    let out = []
    let array = []
    for (item in object) {
        array.push([item, object[item]])
    }
    array.sort((a, b) => currencyToNumber(b[1]) - currencyToNumber(a[1]))
    for (item in array) {
        out.push(array[item][0])
    }
    return out
}

exports.randomColor = function randomColor() {
    let r, g, b
    r = randomChannel()
    g = randomChannel()
    b = randomChannel()
    return {
        solidColor: `rgba(${r},${g},${b},1)`,
        transparentColor: `rgba(${r},${g},${b},0.2)`
    }
}

function randomChannel() {
    return Math.floor(Math.random() * 256)
}

function formatDate(string) {
    return new Date(string).toLocaleDateString("fa-IR", { day: 'numeric', month: 'short' })
}

function currencyToNumber(string) {
    return Number(string.replace(/,/g, ''))
}
