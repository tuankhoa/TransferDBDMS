select
	id as oldId,
	null as created_at,
	null as updated_at,
	'ACTIVE' as status,
	Contentx as content,
	IDCustomer as customer_id,
	IDUserNoted as user_id
from TblCustomerNoted