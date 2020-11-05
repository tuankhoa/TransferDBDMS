const utils = require('../utils.js')
const constants = require('../constants.js')

module.exports = async function () {
    let folder = constants.folder
    let models = constants.fileName.fileNameModels
    let keysIgnore = constants.keysIgnore
    let createdDate = utils.datetime.format.yMdHms(new Date('2020-01-01 00:00:00'))
    for (let fileName of models) {
        let newData = []
        let data = await utils.excel.readFileAndCreatedNewId(`data/excel/${folder}/${fileName}.xlsx`)
        let keys = Object.keys(data[0])
        for (let i = 0; i < data.length; i++) {
            let temp = {
                id: data[i].id,
                old_id: data[i].old_id,
                created_at: ['CustomerNotes', 'Orders'].includes(fileName) ? utils.datetime.format.yMdHms(data[i].created_at) : createdDate,
                updated_at: ['CustomerNotes', 'Orders'].includes(fileName) ? utils.datetime.format.yMdHms(data[i].updated_at) : createdDate,
                status: data[i].status
            }
            for (let j = 0; j < keys.length; j++) {
                if (!keysIgnore.includes(keys[j])) {
                    temp[`${keys[j]}`] = data[i][`${keys[j]}`]
                }
            }
            newData.push(temp)
        }
        utils.json.writeFile(`data/json/${folder}/${fileName}.json`, newData)
    }
}