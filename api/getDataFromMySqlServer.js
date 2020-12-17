const utils = require('../utils.js')
const constants = require('../constants.js')

module.exports = async function () {
    let data = await utils.mysql.select('select * from users limit 2')
    console.log(data)
}
