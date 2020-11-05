select
	dhct.id as oldId,
	null as created_at,
	null as updated_at,
	iif(dh.trangthai = 'DELETE', 'DELETED', 'ACTIVE') as status,
	SoLuong as quantity,
	IDDonHang as order_id,
	IDSanPham as product_id
from TblDonHangChiTiet dhct
left join tbldonhang dh on dh.id = dhct.iddonhang
