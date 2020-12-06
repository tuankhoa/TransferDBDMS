select
	dhct.id as oldId,
	dh.ngaytao as created_at,
	dh.ngaytao as updated_at,
	iif(dh.trangthai = 'DELETE', 'DELETED', 'ACTIVE') as status,
	SoLuong as quantity,
	IDDonHang as order_id,
	dhct.IDSanPham as product_id,
	iif(dh.ngaytao < '2020-12-01 00:00:00', null, kmn.id) as promotion_id,
	iif(dh.ngaytao < '2020-12-01 00:00:00', null, cast(kmn.hanmuc as int)) as promotion_level_id
from TblDonHangChiTiet dhct
left join tbldonhang dh on dh.id = dhct.iddonhang
left join (
	select
		kmn.id as id,
		kmn.hanmuc,
		kmn.giatrikm
	from TblKhuyenMaiNen kmn
	left join tblvungmienkhuyenmai vm on vm.idkhuyenmai = kmn.id
	where iskmmn = 0 and kmn.giatrikm > 0
) kmn on kmn.id = dhct.idkhuyenmainen
