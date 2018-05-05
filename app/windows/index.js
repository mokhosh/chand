require('./libs/chart')
const { ipcRenderer } = require('electron')
const names = require('../constants').coinNames
let ctx, chart

ipcRenderer.on('prices:latest', (e, data) => {
    let tbody = document.getElementById('latestPrices')
    for (coin in data.prices) {
        let key = coin.toString()
        let row = document.createElement('tr')
        tbody.appendChild(row)
        row.innerHTML = `<td>${names[coin]}</td><td>${data.prices[coin]}</td>`
        row.addEventListener('click', () => ipcRenderer.send('req:stat', key))
    }
})

ipcRenderer.on('prices:chart', (e, prices) => {
    let { labels, data, name } = extractData(prices)
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
                    backgroundColor: ['rgba(99,242,151,0.2)'],
                    borderColor: ['rgba(99,242,151,1)'],
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: false,
            scales: {
                yAxes: [{
                    ticks: {
                        stepSize: 500000
                    }
                }]
            }
        }
    })
})

function extractData(input)
{
    let labels =[], data = []

    for (item of input.prices) {
        labels[labels.length] = formatDate(item.date)
        data[data.length] = currencyToNumber(item.prices[input.key])
    }

    return { labels, data, name: names[input.key] }
}

function formatDate(string)
{
    return new Date(string).toLocaleDateString("fa-IR", {day: 'numeric', month: 'short'})
}

function currencyToNumber(string)
{
    return Number(string.replace(/,/g,''))
}
