require('./libs/chart')
const { ipcRenderer } = require('electron')
const names = require('../constants').names
const tools = require('./tools')
let ctx, chart

ipcRenderer.on('prices:latest', (e, data) => {
    let tbody = document.getElementById('latestPrices')
    let sortedPrices = tools.sortedKeys(data.prices)
    for (coin in sortedPrices) {
        let key = sortedPrices[coin].toString()
        let row = document.createElement('tr')
        tbody.appendChild(row)
        row.innerHTML = `<td>${names[key]}</td><td>${data.prices[key]}</td>`
        row.addEventListener('click', () => ipcRenderer.send('req:stat', key))
    }
})

ipcRenderer.on('prices:chart', (e, prices) => {
    let { labels, data, name } = tools.extractData(prices)
    let { solidColor, transparentColor } = tools.randomColor()
    if (! ctx) {
        ctx = document.getElementById("priceChart").getContext('2d')
    }
    if (chart) {
        chart.destroy()
    }
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: name,
                    data,
                    backgroundColor: [transparentColor],
                    borderColor: [solidColor],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                yAxes: [{
                    ticks: {
                        stepSize: Math.max.apply(null, data) > 1000000 ? 500000 : 1000
                    }
                }]
            }
        }
    })
})
