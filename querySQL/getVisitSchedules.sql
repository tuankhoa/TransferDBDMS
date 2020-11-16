select
	id as oldId,
	ngayghetham as created_at,
	ngayghetham as updated_at,
	'ACTIVE' as status,
	idnhanvien as user_id,
	idcustomer as customer_id
from tblmcp
where ngayghetham is not null