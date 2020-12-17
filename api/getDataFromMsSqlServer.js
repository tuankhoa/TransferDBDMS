const utils = require('../utils.js')
const constants = require('../constants.js')

module.exports = async function () {
    // let query = await utils.text.readFile('querySQL/getProducts.sql')
    // let result = await utils.mssql.select(query)
    // console.log(result)
    let query = utils.text.readFile('querySQL/getProductCategories.sql')
    // console.log(query.slice(2))
    // utils.mssql.selectFileAndCreateNewId(query.slice(2), 35)
    let data = await utils.mssql.selectFileAndCreateNewId(query)
    console.log(data[0])
}
