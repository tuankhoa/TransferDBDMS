select
	id as oldId,
	ngaytao as created_at,
	ngaytao as updated_at,
	'ACTIVE' as status,
	Contentx as content,
	IDCustomer as customer_id,
	IDUserNoted as user_id
from TblCustomerNoted