const utils = require('../utils.js')
const constants = require('../constants.js')
const step4CreateModelJsonFiles = require('./step4CreateModelJsonFiles.js')

module.exports = async function () {
    let folder = constants.folder
    let models = constants.fileName.fileNameModels
    let keysIgnore = constants.keysIgnore
    let createdDate = utils.datetime.format.yMdHms(new Date('2020-01-01 12:00:00'))
    for (let fileName of models) {
        // let systemData = await utils.json.readFile(`data/json/${folder}/${fileName}.json`)
        let systemData = []
        // console.log(systemData.length)
        // let data = await utils.excel.readFileAndCreatedNewId(`data/excel/${folder}/${fileName}.xlsx`, systemData)
        // let data = await utils.excel.readFileAndCreatedNewId(`data/excel/${folder}/${fileName}.xlsx`)
        let query = utils.text.readFile(`querySQL/get${fileName}.sql`)
        if (fileName == 'Users') {
            query = `select
            id as oldId,
            Created_Date as created_at,
            updated_date as updated_at,
            'ACTIVE' as status,
            UserType as user_type,
            Flag as flag,
            IDGSBH as gsbh_id,
            IDASM as asm_id,
            IDSD as sd_id,
            '' as password,
            null as last_login,
            0 as is_superuser,
            UserName as code,
            1 as is_staff,
            FullName as name,
            null as manager_id,
            IDNPP as distributor_id,
            zalo as zalo,
            phone as phone,
            email as email,
            vungmien as region
        from TblCommon_User
        where UserName <> '' and len(UserName) <> 3
        and (FullName like N'lê xuân lập' and username like N'98000184' or FullName not like N'lê xuân lập')`
        }
        let data = await utils.mssql.selectFileAndCreateNewId(query)
        if (data.length) {
            let keys = Object.keys(data[0])
            for (let i = 0; i < data.length; i++) {
                // if (data[i].old_id == 110110) console.log(data[i])
                let temp = {
                    id: data[i].id,
                    old_id: data[i].old_id,
                    created_at: ['CustomerNotes', 'Promotions', 'PromotionProducts', 'PromotionLevels',
                        'Orders', 'OrderProducts', 'VisitSchedules'].includes(fileName) ? utils.datetime.format.yMdHms(data[i].created_at) : createdDate,
                    updated_at: ['CustomerNotes', 'Promotions', 'PromotionProducts', 'PromotionLevels',
                        'Orders', 'OrderProducts', 'VisitSchedules'].includes(fileName) ? utils.datetime.format.yMdHms(data[i].updated_at) : createdDate,
                    status: data[i].status
                }
                for (let j = 0; j < keys.length; j++) {
                    if (!keysIgnore.includes(keys[j])) {
                        if (keys[j] == 'region') {
                            if (data[i].region == 'Miễn Tây') {
                                temp.region = 'Miền Tây'
                            } else {
                                temp.region = data[i].region
                            }
                        } else {
                            temp[`${keys[j]}`] = data[i][`${keys[j]}`]
                        }
                        if (fileName == 'Customers') {
                            if (keys[j] == 'location') {
                                if (['mặt đường'].includes(temp.location)) {
                                    temp.location = 'Mặt tiền đường'
                                } else if (['Hẻm/Ngỏ/Ngách', 'Hẻm/Ngõ/Ngách', 'Hẻm'].includes(temp.location)) {
                                    temp.location = 'Hẻm/Ngõ/Ngách'
                                } else if (['Xung Quanh Chợ', 'Trong Chợ', 'Chợ'].includes(temp.location)) {
                                    temp.location = 'Chợ'
                                } else if (['Trường Học'].includes(temp.location)) {
                                    temp.location = 'Trường học'
                                } else if (!temp.location) {
                                    temp.location = null
                                }
                            } else if (keys[j] == 'customer_type') {
                                if (temp.customer_type && ['sỉ', 'sĩ'].includes(temp.customer_type.toLowerCase())) {
                                    temp.customer_type = 'Sỉ'
                                } else {
                                    temp.customer_type = 'Lẻ'
                                }
                            } else if (keys[j] == 'store_type') {
                                if (['Keyshop'].includes(temp.store_type)) {
                                    temp.store_type = 'KeyShop'
                                } else if (['Tạp Hóa', 'Tập Hóa'].includes(temp.store_type)) {
                                    temp.store_type = 'Tạp hoá'
                                } else if (['Cửa Hàng Tự Chọn'].includes(temp.store_type)) {
                                    temp.store_type = 'Cửa hàng tự chọn'
                                } else if (['Cửa Hàng Thực Phẩm Sạch'].includes(temp.store_type)) {
                                    temp.store_type = 'Cửa hàng thực phẩm sạch'
                                } else if (['Quán Café'].includes(temp.store_type)) {
                                    temp.store_type = 'Quán cafe'
                                } else if (['Nhà Thuốc'].includes(temp.store_type)) {
                                    temp.store_type = 'Nhà thuốc'
                                } else if (['Trường Học'].includes(temp.store_type)) {
                                    temp.store_type = 'Trường học'
                                } else if (['Khu Công Nghiệp'].includes(temp.store_type)) {
                                    temp.store_type = 'Khu công nghiệp'
                                } else if (['Quán Ăn'].includes(temp.store_type)) {
                                    temp.store_type = 'Quán ăn'
                                } else if (['Căn Tin'].includes(temp.store_type)) {
                                    temp.store_type = 'Căn tin'
                                } else if (['Mini'].includes(temp.store_type)) {
                                    temp.store_type = 'Mini'
                                } else if (['CỬA HÀNG'].includes(temp.store_type)) {
                                    temp.store_type = 'Cửa hàng'
                                } else if (!temp.store_type) {
                                    temp.store_type = null
                                }
                            } else if (keys[j] == 'city_id') {
                                if (temp.city_id) {
                                    let numberCode = 100
                                    temp.city_id = (numberCode + temp.city_id).toString().slice(1)
                                }
                            } else if (keys[j] == 'district_id') {
                                if (temp.district_id) {
                                    let numberCode = 1000
                                    temp.district_id = (numberCode + temp.district_id).toString().slice(1)
                                }
                            } else if (keys[j] == 'village_id') {
                                if (temp.village_id) {
                                    let numberCode = 100000
                                    temp.village_id = (numberCode + temp.village_id).toString().slice(1)
                                }
                            }
                        }
                    }
                }
                systemData.push(temp)
            }
        }
        // console.log(fileName, systemData.length)
        await utils.json.writeFile(`data/json/${folder}/${fileName}.json`, systemData)
    }
    // step4CreateModelJsonFiles.Main()
}
