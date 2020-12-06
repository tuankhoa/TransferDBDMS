const utils = require('../utils.js')
const constants = require('../constants.js')
const uuid4 = require('uuid4')

const step5CreateQueryFile = require('./step5CreateQueryFile.js')

const regions = require('../data/json/Categories/Regions.json')
const locations = require('../data/json/Categories/Locations.json')
const customerTypes = require('../data/json/Categories/CustomerTypes.json')
const storeTypes = require('../data/json/Categories/StoreTypes.json')

const cities = require('../data/json/CDV/Cities.json')
const districts = require('../data/json/CDV/Districts.json')
const villages = require('../data/json/CDV/Villages.json')

const folder = constants.folder
const rolesName = constants.rolesName
let createdDate = utils.datetime.format.yMdHms(new Date('2020-01-01 00:00:00'))

module.exports = {
    Main: function () {
        this.Businesses()
    },
    Businesses: async function () {
        let results = []
        results.push({
            id: 'cdf495cd-1ebe-11eb-adc1-0242ac120002',
            created_at: createdDate,
            updated_at: createdDate,
            status: 'ACTIVE',
            name: 'Yến Việt'
        })
        utils.excel.writeFile(`data/excel/Models/Businesses.xlsx`, results)
        utils.json.writeFile(`data/json/Models/Businesses.json`, results)
        this.Users()
    },
    Users: async function () {
        // nhà phân phối
        let roles = ['ADMIN', 'SD', 'ASM', 'GSBH', 'NVBH']
        let results = []
        let listUsers = await utils.json.readFile(`data/json/${folder}/Users.json`)
        let distributors = await utils.json.readFile(`data/json/${folder}/Distributors.json`)
        let users = []
        for (let r = 0; r < roles.length; r++) {
            let temps = listUsers.filter(u => u.user_type == roles[r])
            for (let i = 0; i < temps.length; i++) {
                users.push(temps[i])
            }
        }
        let usersLen = users.length
        let admin = users.find(u => u.code && u.code.toLowerCase() == 'admin')
        for (let i = 0; i < usersLen; i++) {
            let currentUser = users[i]
            // convert code to string
            currentUser.code = currentUser.code ? currentUser.code.toString() : null
            // process phone, zalo
            currentUser.phone = utils.text.checkAndAddZeroPrePhone(currentUser.phone)
            currentUser.zalo = utils.text.checkAndAddZeroPrePhone(currentUser.zalo)
            // process distributor
            let distributor = distributors.find(d => currentUser.distributor_id && d.old_id == currentUser.distributor_id && currentUser.user_type == 'NVBH')
            if (distributor) {
                distributor.region = currentUser.region
            }
            // process manager
            let managerRole = currentUser.user_type == 'NVBH' ? 'gsbh' : currentUser.user_type == 'GSBH' ? 'asm' : currentUser.user_type == 'ASM' ? 'sd' : null
            if (managerRole) {
                let manager = users.find(u => u.old_id == currentUser[`${managerRole}_id`])
                if (manager && manager.code == '') {
                    manager = admin
                }
                currentUser.manager_id = manager ? manager.id : currentUser.code && !(currentUser.code.toLowerCase().includes('admin')) ? admin.id : null
            } else if (currentUser.user_type == 'SD') {
                currentUser.manager_id = admin.id
            }

            results.push({
                id: currentUser.id,
                created_at: currentUser.created_at,
                updated_at: currentUser.updated_at,
                status: currentUser.status,
                business_id: 'cdf495cd-1ebe-11eb-adc1-0242ac120002',
                password: currentUser.password,
                last_login: currentUser.last_login,
                is_superuser: currentUser.is_superuser,
                code: currentUser.code,
                is_staff: currentUser.is_staff,
                name: currentUser.name,
                manager_id: currentUser.manager_id,
                distributor_id: distributor ? distributor.id : null,
                zalo: currentUser.zalo,
                phone: currentUser.phone,
                email: currentUser.email
            })
        }
        utils.excel.writeFile(`data/excel/Models/Users.xlsx`, results.filter(r => r.code))
        utils.json.writeFile(`data/json/Models/Users.json`, results.filter(r => r.code))
        this.UsersGroups(users)
        this.UsersUserPermissions(users)
        this.Distributors(distributors)
        this.TargetKpis(users)
    },
    UsersGroups: function (users) {
        let result = []
        let usersLen = users.length
        for (let i = 0; i < usersLen; i++) {
            let currentUser = users[i]
            result.push({
                user_id: currentUser.id,
                group_id: rolesName.indexOf(currentUser.user_type.toUpperCase()) + 1
            })
        }
        utils.excel.writeFile(`data/excel/Models/UsersGroups.xlsx`, result)
        utils.json.writeFile(`data/json/Models/UsersGroups.json`, result)
    },
    UsersUserPermissions: function (users) {
        let result = []
        let usersLen = users.length
        for (let i = 0; i < usersLen; i++) {
            let currentUser = users[i]
            for (let j = 1; j <= 200; j++) {
                result.push({
                    user_id: currentUser.id,
                    permission_id: j
                })
            }
            if (currentUser.user_type != 'NVBH') {
                result.push({
                    user_id: currentUser.id,
                    permission_id: 1000
                })
                result.push({
                    user_id: currentUser.id,
                    permission_id: 1001
                })
            }
        }
        utils.excel.writeFile(`data/excel/Models/UsersUserPermissions.xlsx`, result)
        utils.json.writeFile(`data/json/Models/UsersUserPermissions.json`, result)
    },
    Distributors: async function (distributors) {
        let result = []
        let keys = Object.keys(distributors[0])
        let distributorsLen = distributors.length
        for (let i = 0; i < distributorsLen; i++) {
            let currentDistributor = distributors[i]
            let temp = {}
            for (let key of keys) {
                if (key != 'old_id') {
                    if (key == 'phone') {
                        temp.phone = utils.text.checkAndAddZeroPrePhone(currentDistributor.phone)
                    } else if (key == 'address') {
                        temp.address = currentDistributor.address ? currentDistributor.address : ''
                    } else if (key == 'region') {
                        let region = regions.find(r => r.name == currentDistributor.region)
                        temp.region_id = region ? region.id : null
                    } else if (['city', 'district', 'village'].includes(key)) {
                        temp[`${key}_id`] = currentDistributor[`${key}`]
                    } else {
                        temp[`${key}`] = currentDistributor[`${key}`]
                    }
                }
            }
            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/Distributors.xlsx`, result.filter(r => r.code))
        utils.json.writeFile(`data/json/Models/Distributors.json`, result.filter(r => r.code))
    },
    TargetKpis: async function (users) {
        let result = []
        let targetKpis = await utils.json.readFile(`data/json/${folder}/TargetKpis.json`)
        let targetKpisLen = targetKpis.length
        for (let i = 0; i < targetKpisLen; i++) {
            let currentTarget = targetKpis[i]
            let targetTime = utils.datetime.format.yMdHms(new Date(currentTarget.year, currentTarget.month - 1, 2))
            let user = users.find(u => u.old_id == currentTarget.user_id && u.user_type == 'NVBH')
            result.push({
                id: currentTarget.id,
                created_at: targetTime,
                updated_at: targetTime,
                status: currentTarget.status,
                kpi_type: currentTarget.kpi_type,
                month: targetTime,
                value: currentTarget.value,
                user_id: user ? user.id : null
            })
        }
        utils.excel.writeFile(`data/excel/Models/TargetKpis.xlsx`, result.filter(t => t.user_id))
        utils.json.writeFile(`data/json/Models/TargetKpis.json`, result.filter(t => t.user_id))
        this.Customers(users, targetKpis.filter(k => k.kpi_type == 'PRODUCTS'))
    },
    Customers: async function (users, targetKpis) {
        let result = []
        let customers = await utils.json.readFile(`data/json/${folder}/Customers.json`)
        let customersLen = customers.length
        for (let i = 0; i < customersLen; i++) {
            let currentCustomer = customers[i]
            let address = ((currentCustomer.address ? currentCustomer.address + ', ' : '') + (currentCustomer.village ? currentCustomer.village + ', ' : '')
                + (currentCustomer.district ? currentCustomer.district + ', ' : '') + (currentCustomer.city ? currentCustomer.city : '')).trim()
            let temp = {
                id: currentCustomer.id,
                created_at: currentCustomer.created_at,
                updated_at: currentCustomer.updated_at,
                status: currentCustomer.status,
                name: currentCustomer.name ? currentCustomer.name : '',
                contact: currentCustomer.contact,
                address: address ? address : '',
                phone: utils.text.checkAndAddZeroPrePhone(currentCustomer.phone),
                mobile: utils.text.checkAndAddZeroPrePhone(currentCustomer.mobile),
                frequency: currentCustomer.frequency
            }
            if (currentCustomer.dow_default) {
                temp.dow_default = currentCustomer.dow_default
                temp.dow_f8 = currentCustomer.dow_f8 != null ? currentCustomer.dow_f8 : 0
            } else {
                temp.dow_default = currentCustomer.last_visited
                if (currentCustomer.frequency == 'F8') {
                    if ([2, 3, 4].includes(currentCustomer.last_visited)) {
                        temp.dow_default = currentCustomer.last_visited - 3
                    }
                    temp.dow_f8 = temp.dow_default + 3
                }
            }
            if (temp.dow_f8 == null) {
                temp.dow_f8 = currentCustomer.frequency == 'F8' ? temp.dow_default + 3 : 0
            }
            temp.city_id = currentCustomer.city_id
            temp.district_id = currentCustomer.district_id
            temp.village_id = currentCustomer.village_id

            let region = regions.find(r => r.name == currentCustomer.region)
            temp.region_id = region ? region.id : null

            let user = users.find(u => u.old_id == currentCustomer.user_id)
            temp.user_id = user ? user.id : null

            let customerType = customerTypes.find(ct => ct.name == currentCustomer.customer_type)
            temp.customer_type_id = customerType ? customerType.id : null

            let location = locations.find(l => l.name == currentCustomer.location)
            temp.location_id = location ? location.id : null

            let storeType = storeTypes.find(st => st.name == currentCustomer.store_type)
            temp.store_type_id = storeType ? storeType.id : null

            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/Customers.xlsx`, result.filter(r => r.user_id))
        utils.json.writeFile(`data/json/Models/Customers.json`, result.filter(r => r.user_id))
        this.CustomerNotes(users, customers)
        this.ProductCategories(users, targetKpis, customers)
    },
    CustomerNotes: async function (users, customers) {
        let result = []
        let notes = await utils.json.readFile(`data/json/${folder}/CustomerNotes.json`)
        let notesLen = notes.length
        for (let i = 0; i < notesLen; i++) {
            let currentNote = notes[i]
            let temp = {
                id: currentNote.id,
                created_at: currentNote.created_at,
                updated_at: currentNote.updated_at,
                status: currentNote.status,
                content: currentNote.content
            }
            let user = users.find(u => u.old_id == currentNote.user_id)
            temp.user_id = user ? user.id : null
            let customer = customers.find(c => c.old_id == currentNote.customer_id)
            temp.customer_id = customer ? customer.id : null

            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/CustomerNotes.xlsx`, result.filter(r => r.user_id && r.customer_id))
        utils.json.writeFile(`data/json/Models/CustomerNotes.json`, result.filter(r => r.user_id && r.customer_id))
    },
    ProductCategories: async function (users, targetKpis, customers) {
        let result = []
        let productCategories = await utils.json.readFile(`data/json/${folder}/ProductCategories.json`)
        let productCatsLen = productCategories.length
        for (let i = 0; i < productCatsLen; i++) {
            let currentProductCat = productCategories[i]
            result.push({
                id: currentProductCat.id,
                created_at: currentProductCat.created_at,
                updated_at: currentProductCat.updated_at,
                status: currentProductCat.status,
                name: currentProductCat.name
            })
        }
        utils.excel.writeFile(`data/excel/Models/ProductCategories.xlsx`, result)
        utils.json.writeFile(`data/json/Models/ProductCategories.json`, result)
        this.Products(users, targetKpis, customers, productCategories)
    },
    Products: async function (users, targetKpis, customers, productCategories) {
        let result = []
        let products = await utils.json.readFile(`data/json/${folder}/Products.json`)
        let productsLen = products.length
        let keys = Object.keys(products[0])
        for (let i = 0; i < productsLen; i++) {
            let currentProduct = products[i]
            let temp = {
                business_id: 'cdf495cd-1ebe-11eb-adc1-0242ac120002'
            }
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] != 'old_id') {
                    if (keys[j] == 'code') {
                        temp.code = currentProduct.code ? currentProduct.code.toString() : null
                    } else if (keys[j] == 'product_category_id') {
                        let productCategory = productCategories.find(pc => pc.old_id == currentProduct.product_category_id)
                        temp.product_category_id = productCategory ? productCategory.id : null
                    } else {
                        temp[`${keys[j]}`] = currentProduct[`${keys[j]}`]
                    }
                }
            }
            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/Products.xlsx`, result)
        utils.json.writeFile(`data/json/Models/Products.json`, result)
        this.PromotionTypes(users, customers, products)
        this.KpiProducts(users, targetKpis, products)
    },
    KpiProducts: async function (users, targetKpis, products) {
        let result = []
        for (let i = 0; i < targetKpis.length; i++) {
            let currentTarget = targetKpis[i]
            let user = users.find(u => u.old_id == currentTarget.user_id)
            let targetTime = utils.datetime.format.yMdHms(new Date(currentTarget.year, currentTarget.month - 1, 2))
            if (user && user.user_type == 'NVBH') {
                result.push({
                    id: uuid4(),
                    created_at: targetTime,
                    updated_at: targetTime,
                    status: 'ACTIVE',
                    kpi_id: currentTarget.id,
                    product_id: products.find(p => p.code == '24130002').id
                })
                result.push({
                    id: uuid4(),
                    created_at: targetTime,
                    updated_at: targetTime,
                    status: 'ACTIVE',
                    kpi_id: currentTarget.id,
                    product_id: products.find(p => p.code == '24130004').id
                })
            }
        }
        utils.excel.writeFile(`data/excel/Models/KpiProducts.xlsx`, result)
        utils.json.writeFile(`data/json/Models/KpiProducts.json`, result)
    },
    PromotionTypes: async function (users, customers, products) {
        let result = []
        let proTypes = await utils.json.readFile(`data/json/${folder}/PromotionTypes.json`)
        let proTypesLen = proTypes.length
        let keys = Object.keys(proTypes[0])
        for (let i = 0; i < proTypesLen; i++) {
            let currentProType = proTypes[i]
            let temp = {}
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] != 'old_id') {
                    temp[`${keys[j]}`] = currentProType[`${keys[j]}`]
                }
            }
            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/PromotionTypes.xlsx`, result)
        utils.json.writeFile(`data/json/Models/PromotionTypes.json`, result)
        this.Promotions(users, customers, products, proTypes)
    },
    Promotions: async function (users, customers, products, proTypes) {
        let result = []
        let promotions = await utils.json.readFile(`data/json/${folder}/Promotions.json`)
        let promotionsLen = promotions.length
        let keys = Object.keys(promotions[0])
        for (let i = 0; i < promotionsLen; i++) {
            let currentPromotion = promotions[i]
            let temp = {}
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] != 'old_id' && keys[j] != 'region') {
                    temp[`${keys[j]}`] = currentPromotion[`${keys[j]}`]
                }
            }
            temp.promotion_type_id = proTypes.find(pt => pt.old_id == currentPromotion.promotion_type_id).id
            temp.region_id = regions.find(r => r.name == currentPromotion.region).id
            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/Promotions.xlsx`, result)
        utils.json.writeFile(`data/json/Models/Promotions.json`, result)
        this.PromotionProducts(users, customers, products, promotions)
    },
    PromotionProducts: async function (users, customers, products, promotions) {
        let result = []
        let proPros = await utils.json.readFile(`data/json/${folder}/PromotionProducts.json`)
        let proProsLen = proPros.length
        let keys = Object.keys(proPros[0])
        for (let i = 0; i < proProsLen; i++) {
            let currentProPro = proPros[i]
            if (currentProPro.promotion_id != 1) {
                let temp = {}
                for (let j = 0; j < keys.length; j++) {
                    if (keys[j] != 'old_id') {
                        temp[`${keys[j]}`] = currentProPro[`${keys[j]}`]
                    }
                }
                temp.product_id = products.find(p => p.old_id == currentProPro.product_id).id
                temp.promotion_id = promotions.find(pr => pr.old_id == currentProPro.promotion_id).id
                result.push(temp)
            }
        }
        let proProALot = proPros.filter(pp => pp.promotion_id == 1)
        let promotionsALot = promotions.filter(pr => pr.old_id == 1)
        for (let i = 0; i < proProALot.length; i++) {
            for (let r = 0; r < regions.length; r++) {
                let currentProPro = proProALot[i]
                let temp = {}
                for (let j = 0; j < keys.length; j++) {
                    if (keys[j] != 'old_id') {
                        temp[`${keys[j]}`] = currentProPro[`${keys[j]}`]
                    }
                }
                temp.id = uuid4()
                temp.product_id = products.find(p => p.old_id == currentProPro.product_id).id
                temp.promotion_id = promotionsALot.find(pr => pr.region == regions[r].name).id
                result.push(temp)
            }
        }
        utils.excel.writeFile(`data/excel/Models/PromotionProducts.xlsx`, result)
        utils.json.writeFile(`data/json/Models/PromotionProducts.json`, result)
        this.PromotionLevels(users, customers, products, promotions)
    },
    PromotionLevels: async function (users, customers, products, promotions) {
        let result = []
        let proLevs = await utils.json.readFile(`data/json/${folder}/PromotionLevels.json`)
        let proLevsLen = proLevs.length
        let keys = Object.keys(proLevs[0])
        for (let i = 0; i < proLevsLen; i++) {
            let currentProLevs = proLevs[i]
            if (currentProLevs.promotion_id != 1) {
                let temp = {}
                for (let j = 0; j < keys.length; j++) {
                    if (keys[j] != 'old_id') {
                        temp[`${keys[j]}`] = currentProLevs[`${keys[j]}`]
                    }
                }
                temp.promotion_id = promotions.find(pr => pr.old_id == currentProLevs.promotion_id).id
                result.push(temp)
            }
        }
        let proLevsALot = proLevs.filter(pl => pl.promotion_id == 1)
        let promotionsALot = promotions.filter(pr => pr.old_id == 1)
        for (let i = 0; i < proLevsALot.length; i++) {
            for (let r = 0; r < regions.length; r++) {
                let currentProLev = proLevsALot[i]
                let temp = {}
                for (let j = 0; j < keys.length; j++) {
                    if (keys[j] != 'old_id') {
                        temp[`${keys[j]}`] = currentProLev[`${keys[j]}`]
                    }
                }
                temp.id = uuid4()
                temp.promotion_id = promotionsALot.find(pr => pr.region == regions[r].name).id
                result.push(temp)
            }
        }
        utils.excel.writeFile(`data/excel/Models/PromotionLevels.xlsx`, result)
        utils.json.writeFile(`data/json/Models/PromotionLevels.json`, result)
        this.Orders(users, customers, products, promotions, result)
    },
    Orders: async function (users, customers, products, promotions, promotionLevels) {
        let result = []
        let orders = await utils.json.readFile(`data/json/${folder}/Orders.json`)
        let ordersLen = orders.length
        let keys = Object.keys(orders[0])
        for (let i = 0; i < ordersLen; i++) {
            let currentOrder = orders[i]
            let temp = {}
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] != 'old_id') {
                    temp[`${keys[j]}`] = currentOrder[`${keys[j]}`]
                }
            }
            let user = users.find(u => u.old_id == currentOrder.user_id)
            temp.user_id = user ? user.id : null

            let customer = customers.find(c => c.old_id == currentOrder.customer_id)
            temp.customer_id = customer ? customer.id : null

            temp.promotion_id = null
            temp.promotion_level_id = null
            if (customer) {
                let promotion = promotions.find(pr => pr.old_id == currentOrder.promotion_id && customer.region == pr.region)
                if (promotion) {
                    temp.promotion_id = promotion.id
                    temp.promotion_level_id = promotionLevels.find(pl => pl.promotion_id == promotion.id).id
                }
            }

            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/Orders.xlsx`, result.filter(r => r.user_id && r.customer_id))
        utils.json.writeFile(`data/json/Models/Orders.json`, result.filter(r => r.user_id && r.customer_id))
        this.OrderProducts(users, customers, orders, products, promotions, promotionLevels)
    },
    OrderProducts: async function (users, customers, orders, products, promotions, promotionLevels) {
        let result = []
        let orderProducts = await utils.json.readFile(`data/json/${folder}/OrderProducts.json`)
        let orderProductsLen = orderProducts.length
        let keys = Object.keys(orderProducts[0])
        for (let i = 0; i < orderProductsLen; i++) {
            let currentOrderProduct = orderProducts[i]
            let temp = {}
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] != 'old_id') {
                    temp[`${keys[j]}`] = currentOrderProduct[`${keys[j]}`]
                }
            }
            let order = orders.find(o => o.old_id == currentOrderProduct.order_id)
            if (order) {
                temp.order_id = order.id || temp.order_id
                temp.created_at = order.created_at || temp.created_at
                temp.created_at = order.updated_at || temp.updated_at
            }
            product = products.find(p => p.old_id == currentOrderProduct.product_id)
            temp.product_id = product ? product.id : null

            let promotion = promotions.find(pr => pr.old_id == currentOrderProduct.promotion_id)
            temp.promotion_id = promotion ? promotion.id : null
            temp.promotion_level_id = promotion ? promotionLevels.find(pl => pl.promotion_id == promotion.id).id : null

            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/OrderProducts.xlsx`, result)
        utils.json.writeFile(`data/json/Models/OrderProducts.json`, result)
        this.VisitSchedules(users, customers)
    },
    VisitSchedules: async function (users, customers) {
        // let result = []
        // let visitSchedules = await utils.json.readFile(`data/json/${folder}/VisitSchedules.json`)
        // let visitSchedulesLen = visitSchedules.length
        // let keys = Object.keys(visitSchedules[0])
        // for (let i = 0; i < visitSchedulesLen; i++) {
        //     let currentOrdervisitSchedule = visitSchedules[i]
        //     let temp = {}
        //     for (let j = 0; j < keys.length; j++) {
        //         if (keys[j] != 'old_id') {
        //             temp[`${keys[j]}`] = currentOrdervisitSchedule[`${keys[j]}`]
        //         }
        //     }
        //     let user = users.find(u => u.old_id == currentOrdervisitSchedule.user_id)
        //     temp.user_id = user ? user.id : null
        //     let customer = customers.find(c => c.old_id == currentOrdervisitSchedule.customer_id)
        //     temp.customer_id = customer ? customer.id : null

        //     result.push(temp)
        // }
        // utils.excel.writeFile(`data/excel/Models/VisitSchedules.xlsx`, result.filter(r => r.user_id))
        // utils.json.writeFile(`data/json/Models/VisitSchedules.json`, result.filter(r => r.user_id))
        step5CreateQueryFile()
    }
}
