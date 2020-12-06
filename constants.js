module.exports = {
    folder: '20201205',
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
            // 'Businesses',
            'Distributors',
            'Users',
            'TargetKpis',
            // 'KpiProducts',
            'Customers',
            'CustomerNotes',
            'ProductCategories',
            'Products',
            'PromotionTypes',
            'Promotions',
            'PromotionProducts',
            'PromotionLevels',
            'Orders',
            'OrderProducts',
            // 'VisitSchedules'
        ],
        filesConvert2Query: [
            { name: 'CustomerTypes', tableName: 'customer_types', type: 'Categories' },
            { name: 'Locations', tableName: 'locations', type: 'Categories' },
            { name: 'Regions', tableName: 'regions', type: 'Categories' },
            { name: 'StoreTypes', tableName: 'store_types', type: 'Categories' },
            { name: 'Businesses', tableName: 'business', type: 'Models' },
            { name: 'Distributors', tableName: 'distributors', type: 'Models' },
            { name: 'Users', tableName: 'users', type: 'Models' },
            { name: 'UsersGroups', tableName: 'users_groups', type: 'Models' },
            { name: 'UsersUserPermissions', tableName: 'users_user_permissions', type: 'Models' },
            { name: 'TargetKpis', tableName: 'target_kpis', type: 'Models' },
            { name: 'KpiProducts', tableName: 'kpi_products', type: 'Models' },
            { name: 'Customers', tableName: 'customers', type: 'Models' },
            { name: 'CustomerNotes', tableName: 'customer_notes', type: 'Models' },
            { name: 'ProductCategories', tableName: 'product_categories', type: 'Models' },
            { name: 'Products', tableName: 'products', type: 'Models' },
            { name: 'PromotionTypes', tableName: 'promotion_types', type: 'Models' },
            { name: 'Promotions', tableName: 'promotions', type: 'Models' },
            { name: 'PromotionProducts', tableName: 'promotion_products', type: 'Models' },
            { name: 'PromotionLevels', tableName: 'promotion_levels', type: 'Models' },
            { name: 'Orders', tableName: 'orders', type: 'Models' },
            { name: 'OrderProducts', tableName: 'order_products', type: 'Models' },
            // { name: 'VisitSchedules', tableName: 'visited_schedules', type: 'Models' }
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