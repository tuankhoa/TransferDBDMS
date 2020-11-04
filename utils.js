const fs = require('fs')
const excel2Json = require('read-excel-file/node')
const json2xls = require('json2xls')
const uuid4 = require('uuid4')

module.exports = {
    json: {
        readFile: function (path) {
            let data = fs.readFileSync(path)
            return JSON.parse(data)
        },
        writeFile: function (path, dataJson) {
            let data = JSON.stringify(dataJson);
            fs.writeFileSync(path, data)
        }
    },
    excel: {
        readFile: function (path) {
            return new Promise((res, rej) => {
                excel2Json(path).then((rows) => {
                    let result = []
                    for (let i = 1; i < rows.length; i++) {
                        let row = {
                            new_id: uuid4()
                        }
                        for (let j = 0; j < rows[0].length; j++) {
                            row[`${rows[0][j]}`] = typeof rows[i][j] == 'string' && rows[i][j].toLowerCase() == 'null' ? null : rows[i][j]
                        }
                        result.push(row)
                    }
                    return res(result)
                })
            })
        },
        writeFile: function (path, data) {
            let objectMaxKeysLength = Object.keys(data[0]).length
            let indexOfObjectMaxKeysLength = 0
            for (let i = 1; i < data.length; i++) {
                let dataKeysLength = Object.keys(data[i]).length
                if (objectMaxKeysLength < dataKeysLength) {
                    objectMaxKeysLength = dataKeysLength
                    indexOfObjectMaxKeysLength = i
                }
            }
            let result = [data[indexOfObjectMaxKeysLength]]
            for (let i = 0; i < data.length; i++) {
                if (i != indexOfObjectMaxKeysLength) {
                    result.push(data[i])
                }
            }
            fs.writeFileSync(path, json2xls(data), 'binary')
        }
    },
    datetime: {
        format: {
            yMd: function (data) {
                if (!data) {
                    return null
                }
                let year = '' + data.getFullYear()
                let month = '' + (data.getMonth() + 1)
                if (month.length === 1) {
                    month = '0' + month
                }
                let day = '' + data.getDate()
                if (day.length === 1) {
                    day = '0' + day
                }
                return `${year}-${month}-${day}`
            },
            yMdHms: function (data) {
                if (!data) {
                    return null
                }
                let hour = '' + data.getHours()
                if (hour.length === 1) {
                    hour = '0' + hour
                }
                let minute = '' + data.getMinutes()
                if (minute.length === 1) {
                    minute = '0' + minute
                }
                let second = '' + data.getSeconds()
                if (second.length === 1) {
                    second = '0' + second
                }
                return `${this.yMd(data)} ${hour}:${minute}:${second}`
            }
        },
        getDayOfWeek: function (date) {
            return date.getDay() + 1
        }
    }
}