select
	id as oldId,
	null as created_at,
	null as updated_at,
	'ACTIVE' as status,
	iif(idkpi = 2, 'ORDERS', iif(idkpi = 1, 'SALES', 'PRODUCTS')) as kpi_type,
	Month as month,
	Year as year,
	isnull(value, 0) as value,
	IDUser as user_id
from TblKPIUser