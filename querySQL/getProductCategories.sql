select
	id as oldId,
	null as created_at,
	null as updated_at,
	'ACTIVE' as status,
	TenNhomSanPham as name,
	MaNhomSanPham as code
from TblNhomSanPham