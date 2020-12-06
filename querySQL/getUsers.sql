select
	id as oldId,
	Created_Date as created_at,
	updated_date as updated_at,
	'ACTIVE' as status,
	UserType as user_type,
	Flag as flag,
	IDGSBH as gsbh_id,
	IDASM as asm_id,
	IDSD as sd_id,
	'' as password,
	null as last_login,
	0 as is_superuser,
	UserName as code,
	1 as is_staff,
	FullName as name,
	null as manager_id,
	IDNPP as distributor_id,
	zalo as zalo,
	phone as phone,
	email as email,
	vungmien as region
from TblCommon_User
where UserName <> '' and len(UserName) <> 3