const utils = require('../utils.js')
const constants = require('../constants.js')

module.exports = async function () {
    let cat = constants.fileName.fileNameCategories
    let createdDate = utils.datetime.format.yMdHms(new Date('2020-01-01 00:00:00'))
    for (let fileName of cat) {
        let newData = []
        let data = await utils.excel.readFile(`data/excel/Categories/${fileName}.xlsx`)
        for (let i = 0; i < data.length; i++) {
            newData.push({
                id: data[i].id,
                created_at: createdDate,
                updated_at: createdDate,
                status: data[i].status,
                name: data[i].name
            })
        }
        utils.json.writeFile(`data/json/Categories/${fileName}.json`, newData)
    }
}