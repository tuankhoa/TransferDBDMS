const utils = require('../utils.js')
const constants = require('../constants.js')

module.exports = async function () {
    let cdv = constants.fileName.fileNameCDV
    for (let fileName of cdv) {
        let newData = []
        // let lengthCode = fileName == 'Cities' ? 2 : fileName == 'Districts' ? 3 : 5
        // let lengthCodeParent = lengthCode == 5 ? 3 : lengthCode == 3 ? 2 : 0
        let numberCode = fileName == 'Cities' ? 100 : fileName == 'Districts' ? 1000 : 100000
        let data = await utils.excel.readFile(`data/excel/CDV/${fileName}.xlsx`)
        for (let i = 0; i < data.length; i++) {
            
            let temp = {
                id: (numberCode + data[i].id).toString().slice(1),
                name: data[i].name,
                type: data[i].type
            }
            if (fileName == 'Districts') {
                temp.city_id = (100 + data[i].city_id).toString().slice(1)
            } else if (fileName == 'Villages') {
                temp.district_id = (1000 + data[i].district_id).toString().slice(1)
            }
            newData.push(temp)
        }
        utils.json.writeFile(`data/json/CDV/${fileName}.json`, newData)
    }
}