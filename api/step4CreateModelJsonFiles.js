const utils = require('../utils.js')
const constants = require('../constants.js')

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

module.exports = {
    Main: function () {
        this.Users()
    },
    Users: async function () {
        let result = []
        let distributors = await utils.json.readFile(`data/json/${folder}/Distributors.json`)
        let users = await utils.json.readFile(`data/json/${folder}/Users.json`)
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

            result.push({
                id: currentUser.id,
                created_at: currentUser.created_at,
                updated_at: currentUser.updated_at,
                status: currentUser.status,
                password: currentUser.password,
                last_login: currentUser.last_login,
                is_superuser: currentUser.is_superuser,
                code: currentUser.code,
                is_staff: currentUser.is_staff,
                name: currentUser.name,
                manager_id: currentUser.manager_id,
                distributor_id: distributor ? distributor.id : null,
                zalo: currentUser.zalo,
                phone: currentUser.phone
            })
        }
        utils.excel.writeFile(`data/excel/Models/Users.xlsx`, result.filter(r => r.code))
        utils.json.writeFile(`data/json/Models/Users.json`, result.filter(r => r.code))
        this.UsersGroups(users)
        this.UsersUserPermissions(users)
        this.Distributors(distributors)
        this.TargetKpis(users)
        this.Customers(users)
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
    },
    Customers: async function (users) {
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
        this.ProductCategories(users, customers)
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
    ProductCategories: async function (users, customers) {
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
        this.Products(users, customers, productCategories)
    },
    Products: async function (users, customers, productCategories) {
        let result = []
        let products = await utils.json.readFile(`data/json/${folder}/Products.json`)
        let productsLen = products.length
        let keys = Object.keys(products[0])
        for (let i = 0; i < productsLen; i++) {
            let currentProduct = products[i]
            let temp = {}
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
        this.Orders(users, customers, products)
    },
    Orders: async function (users, customers, products) {
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

            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/Orders.xlsx`, result.filter(r => r.user_id && r.customer_id))
        utils.json.writeFile(`data/json/Models/Orders.json`, result.filter(r => r.user_id && r.customer_id))
        this.OrderProducts(users, customers, orders, products)
    },
    OrderProducts: async function (users, customers, orders, products) {
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
            order = orders.find(o => o.old_id == currentOrderProduct.order_id)
            product = products.find(p => p.old_id == currentOrderProduct.product_id)
            temp.order_id = order ? order.id : null
            temp.product_id = product ? product.id : null

            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/OrderProducts.xlsx`, result)
        utils.json.writeFile(`data/json/Models/OrderProducts.json`, result)
        this.VisitSchedules(users, customers)
    },
    VisitSchedules: async function (users, customers) {
        let result = []
        let visitSchedules = await utils.json.readFile(`data/json/${folder}/VisitSchedules.json`)
        let visitSchedulesLen = visitSchedules.length
        let keys = Object.keys(visitSchedules[0])
        for (let i = 0; i < visitSchedulesLen; i++) {
            let currentOrdervisitSchedule = visitSchedules[i]
            let temp = {}
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] != 'old_id') {
                    temp[`${keys[j]}`] = currentOrdervisitSchedule[`${keys[j]}`]
                }
            }
            let user = users.find(u => u.old_id == currentOrdervisitSchedule.user_id)
            temp.user_id = user ? user.id : null
            let customer = customers.find(c => c.old_id == currentOrdervisitSchedule.customer_id)
            temp.customer_id = customer ? customer.id : null

            result.push(temp)
        }
        utils.excel.writeFile(`data/excel/Models/VisitSchedules.xlsx`, result.filter(r => r.user_id))
        utils.json.writeFile(`data/json/Models/VisitSchedules.json`, result.filter(r => r.user_id))
        step5CreateQueryFile()
    }
}
