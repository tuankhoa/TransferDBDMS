select
	'' as oldId,
	'2020-12-01 12:00:00' as created_at,
	'2020-12-01 12:00:00' as updated_at,
	'ACTIVE' as status,
	idsanpham as product_id,
	km.id as promotion_id
from TblKhuyenMai km
left join TblSanPhamKMMuaNhieu spmn on spmn.idkhuyenmai = km.id
union
select
	'' as oldId,
	'2020-12-01 12:00:00' as created_at,
	'2020-12-01 12:00:00' as updated_at,
	'ACTIVE' as status,
	IDSanPham as product_id,
	max(kmn.id) as promotion_id
from TblKhuyenMaiNen kmn
left join tblvungmienkhuyenmai vm on vm.idkhuyenmai = kmn.id
where iskmmn = 0
group by kmn.IDSanPham, vm.vungmien
