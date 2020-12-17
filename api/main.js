const utils = require('../utils.js')
const constants = require('../constants.js')

const getDataFromMsSqlServer = require('./getDataFromMsSqlServer.js')
const getDataFromMySqlServer = require('./getDataFromMySqlServer.js')

const step1CreateCDVJsonFiles = require('../api/step1CreateCDVJsonFiles.js')
const step2CreateCategoryJsonFiles = require('../api/step2CreateCategoryJsonFiles.js')
const step3CreateModelRawJsonFiles = require('../api/step3CreateModelRawJsonFiles.js')
const step4CreateModelJsonFiles = require('../api/step4CreateModelJsonFiles.js')
const step5CreateQueryFile = require('../api/step5CreateQueryFile.js')

module.exports = async function () {
    // getDataFromMsSqlServer()
    // getDataFromMySqlServer()

    // step1CreateCDVJsonFiles()
    // step2CreateCategoryJsonFiles()
    // step3CreateModelRawJsonFiles()
    step4CreateModelJsonFiles.Main()
    // step5CreateQueryFile()
}