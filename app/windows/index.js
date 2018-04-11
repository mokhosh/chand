require('./libs/chart')
const { ipcRenderer } = require('electron')
const names = require('../constants').coinNames

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
    let { labels, data } = extractData(prices)
    let ctx = document.getElementById("priceChart").getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels,
            datasets: [
                {
                    label: 'TODO',
                    data,
                    backgroundColor: ['rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(255,99,132,1)'],
                    borderWidth: 1
                }
            ],
            options: {
                responsive: false,
                scales: {
                    yAxes: [{
                        ticks: {
                            beginAtZero: true
                        }
                    }]
                }
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

    return { labels, data }
}

function formatDate(string)
{
    return new Date(string).toLocaleDateString("fa-IR", {day: 'numeric', month: 'short'})
}

function currencyToNumber(string)
{
    return Number(string.replace(/,/g,''))
}
