select
	km.id as oldId,
	'2020-12-01 12:00:00' as created_at,
	'2020-12-01 12:00:00' as updated_at,
	'ACTIVE' as status,
	CONCAT('KMMN-T122020-', vm.VungMien) as code,
	2 as promotion_type_id,
	vm.vungmien as region,
	null as city_id
from TblKhuyenMai km
left join TblVungMienKhuyenMai vm on vm.IDKhuyenMai = km.ID
where IsKMMN = 1
union
select
	max(kmn.id) as oldId,
	'2020-12-01 12:00:00' as created_at,
	'2020-12-01 12:00:00' as updated_at,
	'ACTIVE' as status,
	CONCAT('KMN-SP', IIF(IDSanPham < 10, '0', ''), IDSanPham, '-T122020-', vm.vungmien) as code,
	1 as promotion_type_id,
	vm.VungMien as region,
	null as city_id
from TblKhuyenMaiNen kmn
left join tblvungmienkhuyenmai vm on vm.idkhuyenmai = kmn.id
where iskmmn = 0
group by kmn.IDSanPham, vm.vungmien
