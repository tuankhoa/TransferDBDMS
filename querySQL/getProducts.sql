select
	sp.id as oldId,
	null as created_at,
	null as updated_at,
	'ACTIVE' as status,
	MaSanPham as code,
	TenSanPham as name,
	dvt.TenDonVi as unit,
	GiaNiemYet as price,
	QuyCach as description,
	SLTrenThung as quantity_per_box,
	IDNhomSanPham as product_category_id,
	Seq as sequence
from TblSanPham sp
left join TblDonViTinh dvt on dvt.id = sp.IDDonViTinh