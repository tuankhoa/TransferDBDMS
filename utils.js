const fs = require('fs')
const excel2Json = require('read-excel-file/node')
const json2xls = require('json2xls')
const uuid4 = require('uuid4')

module.exports = {
    jsonUtils: {
        readFile: function (path) {
            let data = fs.readFileSync(path)
            return JSON.parse(data)
        },
        writeFile: function (path, dataJson) {
            let data = JSON.stringify(dataJson);
            fs.writeFileSync(path, data)
        }
    },
    excelUtils: {
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
    }
}