const utils = require('../utils.js')
const constants = require('../constants.js')

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
        for (let i = 0; i < usersLen; i++) {
            let currentUser = users[i]
            // convert code to string
            currentUser.code = currentUser.code ? currentUser.code.toString() : null
            // set password is empty
            currentUser.password = ''
            // process phone, zalo
            currentUser.phone = utils.text.checkAndAddZeroPrePhone(currentUser.phone)
            currentUser.zalo = utils.text.checkAndAddZeroPrePhone(currentUser.zalo)
            // process distributor
            if (currentUser.distributor_id) {
                let distributor = distributors.find(d => d.old_id == currentUser.distributor_id && currentUser.user_type == 'NVBH')
                if (distributor) {
                    currentUser.distributor_id = distributor ? distributor.id : null
                    distributor.region = currentUser.region
                }
            }
            // process manager
            let managerRole = currentUser.user_type == 'NVBH' ? 'gsbh' : currentUser.user_type == 'GSBH' ? 'asm' : currentUser.user_type == 'ASM' ? 'sd' : null
            if (managerRole) {
                let manager = users.find(u => u.old_id == currentUser[`${managerRole}_id`])
                currentUser.manager_id = manager ? manager.id : null
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
                distributor_id: currentUser.distributor_id,
                zalo: currentUser.zalo,
                phone: currentUser.phone
            })
        }
        // console.log(users[5])
        // console.log(result[5])
        // utils.excel.writeFile(`data/excel/Models/Users.xlsx`, result)
        // utils.json.writeFile(`data/json/Models/Users.json`, result)
        this.Distributors(distributors)
        this.TargetKpis(users)
        this.Customers(users)
    },
    Distributors: async function (distributors) {
        let result = []
        // let distributors = await utils.json.readFile(`data/json/${folder}/Distributors.json`)
        let keys = Object.keys(distributors[0])
        let distributorsLen = distributors.length
        for (let i = 0; i < distributorsLen; i++) {
            let temp = {}
            for (let key of keys) {
                if (key != 'old_id') {
                    if (key == 'phone') {
                        temp.phone = utils.text.checkAndAddZeroPrePhone(distributors[i].phone)
                    } else {
                        temp[`${key}`] = distributors[i][`${key}`]
                    }
                }
            }
            result.push(temp)
        }
        // console.log(result[0])
        // utils.excel.writeFile(`data/excel/Models/Distributors.xlsx`, result)
        // utils.json.writeFile(`data/json/Models/Distributors.json`, result)
    },
    TargetKpis: async function (users) {
        let result = []
        // let users = await utils.json.readFile(`data/json/${folder}/Users.json`)
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
        // utils.excel.writeFile(`data/excel/Models/TargetKpis.xlsx`, result.filter(t => t.user_id))
        // utils.json.writeFile(`data/json/Models/TargetKpis.json`, result.filter(t => t.user_id))
    },
    Customers: async function (users) {
        let result = []
        // let users = await utils.json.readFile(`data/json/${folder}/Users.json`)
        let customers = await utils.json.readFile(`data/json/${folder}/Customers.json`)
        let customersLen = customers.length
        // console.log(customers[0])
        for (let i = 0; i < customersLen; i++) {
            let currentCustomer = customers[i]
            let temp = {
                id: currentCustomer.id,
                created_at: currentCustomer.created_at,
                updated_at: currentCustomer.updated_at,
                status: currentCustomer.status,
                name: currentCustomer.name,
                contact: currentCustomer.contact,
                address: ((currentCustomer.address ? currentCustomer.address + ' - ' : '') + (currentCustomer.village ? currentCustomer.village + ' - ' : '')
                    + (currentCustomer.district ? currentCustomer.district + ' - ' : '') + (currentCustomer.city ? currentCustomer.city : '')).trim(),
                phone: utils.text.checkAndAddZeroPrePhone(currentCustomer.phone),
                mobile: utils.text.checkAndAddZeroPrePhone(currentCustomer.mobile),
                frequency: currentCustomer.frequency
            }
            if (currentCustomer.dow_default) {
                temp.dow_default = currentCustomer.dow_default
                temp.dow_f8 = currentCustomer.dow_f8
            } else {
                temp.dow_default = currentCustomer.last_visited
                if (currentCustomer.frequency == 'F8') {
                    if ([2, 3, 4].includes(currentCustomer.last_visited)) {
                        temp.dow_default = currentCustomer.last_visited - 3
                    }
                    temp.dow_f8 = temp.dow_default + 3
                }
            }
            temp.city_id = null
            temp.district_id = null
            temp.village_id = null
            temp.region = currentCustomer.region
            user = users.find(u => u.old_id == currentCustomer.user_id)
            temp.user_id = user ? user.id : null
            temp.customer_type = currentCustomer.customer_type
            temp.location = currentCustomer.location
            temp.store_type = currentCustomer.store_type

            result.push(temp)
        }
        // console.log(result[0])
        // utils.excel.writeFile(`data/excel/Models/Customers.xlsx`, result)
        // utils.json.writeFile(`data/json/Models/Customers.json`, result)
        this.ProductCategories(users, customers)
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
        // utils.excel.writeFile(`data/excel/Models/ProductCategories.xlsx`, result)
        // utils.json.writeFile(`data/json/Models/ProductCategories.json`, result)
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
        // utils.excel.writeFile(`data/excel/Models/Products.xlsx`, result)
        // utils.json.writeFile(`data/json/Models/Products.json`, result)
        this.Orders(users, customers, products)
    },
    Orders: async function (users, customers, products) {
        let result = []
        let orders = await utils.json.readFile(`data/json/${folder}/Orders.json`)
        let ordersLen = orders.length
        // console.log(orders[0])
        let keys = Object.keys(orders[0])
        for (let i = 0; i < ordersLen; i++) {
            let currentOrder = orders[i]
            let temp = {}
            for (let j = 0; j < keys.length; j++) {
                if (keys[j] != 'old_id') {
                    temp[`${keys[j]}`] = currentOrder[`${keys[j]}`]
                }
            }
            user = users.find(u => u.old_id == currentOrder.user_id)
            customer = customers.find(c => c.old_id == currentOrder.customer_id)
            temp.user_id = user ? user.id : null
            temp.customer_id = customer ? customer.id : null

            result.push(temp)
        }
        // console.log(result[0])
        // utils.excel.writeFile(`data/excel/Models/Orders.xlsx`, result)
        // utils.json.writeFile(`data/json/Models/Orders.json`, result)
        this.OrderProducts(orders, products)
    },
    OrderProducts: async function (orders, products) {
        let result = []
        let orderProducts = await utils.json.readFile(`data/json/${folder}/OrderProducts.json`)
        let orderProductsLen = orderProducts.length
        // console.log(orderProducts[0])
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
        // console.log(result[0])
        // utils.excel.writeFile(`data/excel/Models/OrderProducts.xlsx`, result)
        // utils.json.writeFile(`data/json/Models/OrderProducts.json`, result)
    }
}
