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
                created_at: ['CustomerNotes', 'Orders', 'VisitSchedules'].includes(fileName) ? utils.datetime.format.yMdHms(data[i].created_at) : createdDate,
                updated_at: ['CustomerNotes', 'Orders', 'VisitSchedules'].includes(fileName) ? utils.datetime.format.yMdHms(data[i].updated_at) : createdDate,
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
            newData.push(temp)
        }
        utils.json.writeFile(`data/json/${folder}/${fileName}.json`, newData)
    }
}