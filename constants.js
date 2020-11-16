module.exports = {
    folder: '20201109',
    fileName: {
        fileNameCDV: [
            'Cities',
            'Districts',
            'Villages'
        ],
        fileNameCategories: [
            'Regions',
            'CustomerTypes',
            'StoreTypes',
            'Locations'
        ],
        fileNameModels: [
            // 'Distributors',
            // 'Users',
            // 'TargetKpis',
            // 'Customers',
            // 'CustomerNotes',
            // 'ProductCategories',
            // 'Products',
            // 'Orders',
            // 'OrderProducts',
            'VisitSchedules'
        ],
        filesConvert2Query: [
            { name: 'CustomerTypes', tableName: 'customer_types', type: 'Categories' },
            { name: 'Locations', tableName: 'locations', type: 'Categories' },
            { name: 'Regions', tableName: 'regions', type: 'Categories' },
            { name: 'StoreTypes', tableName: 'store_types', type: 'Categories' },
            { name: 'Distributors', tableName: 'distributors', type: 'Models' },
            { name: 'Users', tableName: 'users', type: 'Models' },
            { name: 'UsersGroups', tableName: 'users_groups', type: 'Models' },
            { name: 'UsersUserPermissions', tableName: 'users_user_permissions', type: 'Models' },
            { name: 'TargetKpis', tableName: 'target_kpis', type: 'Models' },
            { name: 'Customers', tableName: 'customers', type: 'Models' },
            { name: 'CustomerNotes', tableName: 'customer_notes', type: 'Models' },
            { name: 'ProductCategories', tableName: 'product_categories', type: 'Models' },
            { name: 'Products', tableName: 'products', type: 'Models' },
            { name: 'Orders', tableName: 'orders', type: 'Models' },
            { name: 'OrderProducts', tableName: 'order_products', type: 'Models' },
            { name: 'VisitSchedules', tableName: 'visited_schedules', type: 'Models' }
        ]
    },
    keysIgnore: [
        'id',
        'old_id',
        'created_at',
        'updated_at',
        'status'
    ],
    rolesName: [
        'ADMIN',
        'ASM',
        'GSBH',
        'SD',
        'NVBH'
    ]
}