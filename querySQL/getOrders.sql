select
	id as oldId,
	null as created_at,
	null as updated_at,
	iif(TrangThai = 'Delete', 'DELETED', 'ACTIVE') as status,
	GhiChu as note,
	IDCustomer as customer_id,
	IDNhanVien as user_id
from TblDonHang