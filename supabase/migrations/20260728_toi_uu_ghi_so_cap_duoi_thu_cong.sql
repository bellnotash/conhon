begin;

-- Mỗi sổ chỉ có một nguồn cấp dưới thủ công cho cùng một tên
-- (không phân biệt chữ hoa/chữ thường và khoảng trắng hai đầu).
create unique index if not exists uq_nguon_thu_cong_ten
  on public.nguon_so (ma_so, lower(btrim(ten_nguon)))
  where loai_nguon = 'cap_duoi_thu_cong';

create or replace function public.lay_hoac_tao_nguon_thu_cong(
  p_ma_so uuid,
  p_ten_nguon text
)
returns table (
  ma_nguon uuid,
  ten_nguon text,
  loai_nguon text,
  vai_tro_tai_chinh text,
  ty_le_hoa_hong numeric,
  dang_hoat_dong boolean
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ten_nguon text := btrim(coalesce(p_ten_nguon, ''));
  v_nguon public.nguon_so%rowtype;
  v_ty_le_mac_dinh numeric(5,2);
begin
  if not public.co_quyen_so(p_ma_so, 'quan_ly') then
    raise exception 'Ban khong co quyen quan ly nguon cua so nay';
  end if;

  if length(v_ten_nguon) = 0 then
    raise exception 'Ten nguon khong duoc de trong';
  end if;

  if length(v_ten_nguon) > 80 then
    raise exception 'Ten nguon khong duoc vuot qua 80 ky tu';
  end if;

  -- Nếu nhập đúng tên sổ thì trả về nguồn bản thân, không tạo cấp dưới trùng tên.
  select n.*
  into v_nguon
  from public.nguon_so n
  join public.so_ghi s on s.ma_so = n.ma_so
  where n.ma_so = p_ma_so
    and n.loai_nguon = 'ban_than'
    and n.dang_hoat_dong = true
    and lower(btrim(s.ten_so)) = lower(v_ten_nguon)
  limit 1;

  if found then
    return query
    select
      v_nguon.ma_nguon,
      v_nguon.ten_nguon,
      v_nguon.loai_nguon,
      v_nguon.vai_tro_tai_chinh,
      v_nguon.ty_le_hoa_hong,
      v_nguon.dang_hoat_dong;
    return;
  end if;

  select n.*
  into v_nguon
  from public.nguon_so n
  where n.ma_so = p_ma_so
    and n.loai_nguon = 'cap_duoi_thu_cong'
    and lower(btrim(n.ten_nguon)) = lower(v_ten_nguon)
  limit 1
  for update;

  if found then
    if not v_nguon.dang_hoat_dong
       or v_nguon.ten_nguon is distinct from v_ten_nguon then
      update public.nguon_so
      set
        ten_nguon = v_ten_nguon,
        dang_hoat_dong = true
      where nguon_so.ma_nguon = v_nguon.ma_nguon
      returning * into v_nguon;
    end if;
  else
    select c.ty_le_cap_duoi_mac_dinh
    into v_ty_le_mac_dinh
    from public.cau_hinh_so c
    where c.ma_so = p_ma_so;

    begin
      insert into public.nguon_so (
        ma_so,
        ten_nguon,
        loai_nguon,
        vai_tro_tai_chinh,
        ty_le_hoa_hong,
        dang_hoat_dong
      )
      values (
        p_ma_so,
        v_ten_nguon,
        'cap_duoi_thu_cong',
        'cap_duoi',
        coalesce(v_ty_le_mac_dinh, 15),
        true
      )
      returning * into v_nguon;
    exception
      when unique_violation then
        select n.*
        into v_nguon
        from public.nguon_so n
        where n.ma_so = p_ma_so
          and n.loai_nguon = 'cap_duoi_thu_cong'
          and lower(btrim(n.ten_nguon)) = lower(v_ten_nguon)
        limit 1
        for update;

        if not found then
          raise;
        end if;

        update public.nguon_so
        set
          ten_nguon = v_ten_nguon,
          dang_hoat_dong = true
        where nguon_so.ma_nguon = v_nguon.ma_nguon
        returning * into v_nguon;
    end;
  end if;

  return query
  select
    v_nguon.ma_nguon,
    v_nguon.ten_nguon,
    v_nguon.loai_nguon,
    v_nguon.vai_tro_tai_chinh,
    v_nguon.ty_le_hoa_hong,
    v_nguon.dang_hoat_dong;
end;
$$;

revoke all on function public.lay_hoac_tao_nguon_thu_cong(uuid, text)
from public;

grant execute on function public.lay_hoac_tao_nguon_thu_cong(uuid, text)
to authenticated;

commit;
