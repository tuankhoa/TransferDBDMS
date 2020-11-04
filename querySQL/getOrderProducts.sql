select
	id as oldId,
	null as created_at,
	null as updated_at,
	'ACTIVE' as status,
	SoLuong as quantity,
	IDDonHang as order_id,
	IDSanPham as product_id
from TblDonHangChiTiet