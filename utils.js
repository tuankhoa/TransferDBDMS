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
            fs.writeFileSync(path, JSON.stringify(dataJson))
            console.log('Wrote file to: ' + path)
        }
    },
    excel: {
        readFile: function (path) {
            return new Promise((res, rej) => {
                excel2Json(path).then((rows) => {
                    let result = []
                    for (let i = 1; i < rows.length; i++) {
                        let row = {}
                        for (let j = 0; j < rows[0].length; j++) {
                            row[`${rows[0][j]}`] = typeof rows[i][j] == 'string' && rows[i][j].toLowerCase() == 'null' ? null : rows[i][j]
                        }
                        result.push(row)
                    }
                    return res(result)
                })
            })
        },
        readFileAndCreatedNewId: function (path) {
            return new Promise((res, rej) => {
                excel2Json(path).then((rows) => {
                    let result = []
                    for (let i = 1; i < rows.length; i++) {
                        let row = {
                            id: uuid4()
                        }
                        for (let j = 0; j < rows[0].length; j++) {
                            if (rows[0][j] == 'oldId') {
                                row.old_id = rows[i][j]
                            } else {
                                row[`${rows[0][j]}`] = typeof rows[i][j] == 'string' && rows[i][j].toLowerCase() == 'null' ? null : rows[i][j]
                            }
                        }
                        result.push(row)
                    }
                    return res(result)
                })
            })
        },
        readAndWriteJsonFile: async function (pathRead, pathWrite) {
            fs.writeFileSync(pathWrite, JSON.stringify(await this.readFile(pathRead)))
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
            let results = [data[indexOfObjectMaxKeysLength]]
            for (let i = 0; i < data.length; i++) {
                if (i != indexOfObjectMaxKeysLength) {
                    results.push(data[i])
                }
            }
            fs.writeFileSync(path, json2xls(results), 'binary')
            console.log('Wrote file to: ' + path)
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
    },
    text: {
        writeFile: function (path, data) {
            fs.writeFileSync(path, data)
            console.log('Wrote file to: ' + path)
        },
        removeAccents: function (text) {
            let accentsMap = [
                'aàảãáạăằẳẵắặâầẩẫấậ',
                'AÀẢÃÁẠĂẰẲẴẮẶÂẦẨẪẤẬ',
                'dđ', 'DĐ',
                'eèẻẽéẹêềểễếệ',
                'EÈẺẼÉẸÊỀỂỄẾỆ',
                'iìỉĩíị',
                'IÌỈĨÍỊ',
                'oòỏõóọôồổỗốộơờởỡớợ',
                'OÒỎÕÓỌÔỒỔỖỐỘƠỜỞỠỚỢ',
                'uùủũúụưừửữứự',
                'UÙỦŨÚỤƯỪỬỮỨỰ',
                'yỳỷỹýỵ',
                'YỲỶỸÝỴ'
            ]
            for (let i = 0 ; i < accentsMap.length; i++) {
                let re = new RegExp('[' + accentsMap[i].substr(1) + ']', 'g')
                let char = accentsMap[i][0]
                text = text.replace(re, char)
            }
            return text
        },
        checkAndAddZeroPrePhone: function (phone) {
            if (phone) {
                let temp = phone.toString().trim()
                return temp[0] != '0' ? '0' + temp : temp
            } else {
                return null
            }
        }
    }
}