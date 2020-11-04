select
	id as oldId,
	'ACTIVE' as status,
	NgayTao as created_at,
	NgayCapNhat as updated_at,
	MaNhaPP as code,
	TenNhaPP as name,
	TenCongTy as company,
	DiaChi as address,
	null as city,
	null as district,
	null as village,
	null as region,
	Email as email,
	DienThoai as phone
from TblNhaPhanPhoi