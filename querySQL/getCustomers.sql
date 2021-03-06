select
	id as oldId,
	null as created_at,
	null as updated_at,
	iif(kh.Status = 1, 'ACTIVE', 'INACTIVE') as status,
	TenKhachHang as name,
	NguoiLienHe as contact,
	DiaChi as address,
	XaPhuong as village,
	QuanHuyen as district,
	ThanhPho as city,
	DienThoaiBan as phone,
	DienThoaiDiDong as mobile,
	iif(TanSuatChamSoc = 1, 'F4', iif(TanSuatChamSoc = 2, 'F2', 'F8')) as frequency,
	DATEPART(dw, ngaychamsocgannhat) as last_visited,
	--DATEPART(dw, ngaychamsocsaptoi) as next_visit,
	iif(TanSuatChamSoc <> 3, Thu, case when Thu = 5 then 2 when Thu = 6 then 3 when Thu = 7 then 4 else Thu end) as dow_default,
	iif(TanSuatChamSoc <> 3, 0, case when Thu = 2 then 5 when Thu = 3 then 6 when Thu = 4 then 7 else Thu end) as dow_f8,
	c.ProvinceCode as city_id,
	d.Districtcode as district_id,
	v.Wardcode as village_id,
	vungmien as region,
	idnhanvienchamsoc as user_id,
	LoaiKhach as customer_type,
	ViTriMatBang as location,
	LoaiCuaHang as store_type
from TblKhachHang kh
left join tblcategory_province c on c.ProvinceID = kh.IDThanhPho
left join tblcategory_district d on d.DistrictID = kh.idquanhuyen
left join tblCategory_Ward v on v.WardID = kh.idxa
