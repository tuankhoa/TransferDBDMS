const utils = require('../utils.js')
const constants = require('../constants.js')

const files = constants.fileName.filesConvert2Query

module.exports = async function () {
    for (let i = 0; i < files.length; i++) {
        let result = []
        let data = await utils.json.readFile(`data/json/${files[i].type}/${files[i].name}.json`)
        let dataLen = data.length
        let keys = Object.keys(data[0])
        let query = `INSERT IGNORE INTO ${files[i].tableName} (${keys.join(', ')}) VALUES `
        for (let j = 0; j < dataLen; j++) {
            let q = ""
            let currentData = data[j]
            for (let k = 0; k < keys.length; k++) {
                if (typeof currentData[`${keys[k]}`] == 'string') {
                    let text = currentData[`${keys[k]}`]
                    if (currentData[`${keys[k]}`].includes("'")) {
                        text = currentData[`${keys[k]}`].replace(/'/g, "\\'")
                    }
                    q = [q, "'" + text + "'"].join(', ')
                } else {
                    q = [q, currentData[`${keys[k]}`] == null ? 'null' : currentData[`${keys[k]}`]].join(', ')
                }
            }
            q.replace("'null'", "null")
            result += `${query} (${q.slice(2)});\n`
        }
        utils.text.writeFile(`data/SQLQuery/${i + 1}_${files[i].name}.sql`, result)
    }
}