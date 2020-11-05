select
	id as oldId,
	ngaytao as created_at,
	ngaycapnhatcuoi as updated_at,
	iif(TrangThai = 'Delete', 'DELETED', 'ACTIVE') as status,
	GhiChu as note,
	IDCustomer as customer_id,
	IDNhanVien as user_id
from TblDonHang