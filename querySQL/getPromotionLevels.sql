select
	'' as oldId,
	'2020-12-01 12:00:00' as created_at,
	'2020-12-01 12:00:00' as updated_at,
	'ACTIVE' as status,
	km.id as promotion_id,
	cast(kmtl.hanmuc as int) as level,
	kmtl.GiaTriKM as discount
from TblKhuyenMai km
left join TblKhuyenMaiTichLuy kmtl on kmtl.idkhuyenmai = km.id
union
select
	A.*,
	cast(kmn.hanmuc  as int) as level,
	kmn.GiaTriKM as discount
from TblKhuyenMaiNen kmn
right join (
	select
		'' as oldId,
		'2020-12-01 12:00:00' as created_at,
		'2020-12-01 12:00:00' as updated_at,
		'ACTIVE' as status,
		max(kmn.id) as promotion_id
	from TblKhuyenMaiNen kmn
	left join tblvungmienkhuyenmai vm on vm.idkhuyenmai = kmn.id
	where iskmmn = 0
	group by kmn.IDSanPham, vm.vungmien
) as A on A.promotion_id = kmn.id
