const utils = require('../utils.js')
const constants = require('../constants.js')

const files = constants.fileName.filesConvert2Query
const startFileSql = `
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;
`
const endFileSql = `
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;
`

module.exports = async function () {
    let queryTotal = ''
    queryTotal += `${startFileSql}\n\n`
    for (let i = 0; i < files.length; i++) {
        if (files[i].name != 'UsersUserPermissions') {
            // let result = `${startFileSql}\n\n`
            let result = ''
            let data = await utils.json.readFile(`data/json/${files[i].type}/${files[i].name}.json`)
            let dataLen = data.length
            let keys = Object.keys(data[0])
            let query = `LOCK TABLES ${files[i].tableName} WRITE;\n/*!40000 ALTER TABLE \`${files[i].tableName}\` DISABLE KEYS */;\nINSERT IGNORE INTO ${files[i].tableName} (${keys.filter(k => k != 'old_id' && k != 'kpi_old_id' && k != 'product_old_id').join(', ')}) VALUES `
            for (let j = 0; j < dataLen; j++) {
                let q = ""
                let currentData = data[j]
                for (let k = 0; k < keys.length; k++) {
                    if (keys[k] != 'old_id' && keys[k] != 'kpi_old_id' && keys[k] != 'product_old_id') {
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
                }
                q.replace("'null'", "null")
                // result += `${query} (${q.slice(2)});\n`
                // queryTotal += `${query} (${q.slice(2)});\n`
                result += `(${q.slice(2)}),`
            }
            result = `${query} ${result.slice(0, result.length - 1)};\n/*!40000 ALTER TABLE \`${files[i].tableName}\` ENABLE KEYS */;\nUNLOCK TABLES;`
            // result += `\n${endFileSql}`
            queryTotal += `${result}\n`
            utils.text.writeFile(`data/SQLQuery/${i + 1}_${files[i].name}.sql`, result)
        }
    }
    queryTotal += `\n${endFileSql}`
    utils.text.writeFile(`data/SQLQuery/0_Total.sql`, queryTotal)
}