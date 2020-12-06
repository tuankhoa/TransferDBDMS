select
	dh.id as oldId,
	dh.ngaytao as created_at,
	dh.ngaycapnhatcuoi as updated_at,
	iif(dh.TrangThai = 'Delete', 'DELETED', 'ACTIVE') as status,
	dh.GhiChu as note,
	dh.IDCustomer as customer_id,
	dh.IDNhanVien as user_id,
	kmtl.idkhuyenmai as promotion_id,
	kmtl.id as promotion_level_id
from TblDonHang dh
left join tblkhuyenmaitichluy kmtl on kmtl.idkhuyenmai = dh.idkhuyenmai and kmtl.muctichluy = dh.muctichluy
