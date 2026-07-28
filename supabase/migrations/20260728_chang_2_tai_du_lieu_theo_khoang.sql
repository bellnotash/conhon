begin;

-- Ho tro loc cac lan thu no theo so va khoang ngay.
create index if not exists idx_thu_cong_no_so_ngay
  on public.thu_cong_no(ma_so, ngay_thu, ma_phieu)
  where ngay_huy is null;

create index if not exists idx_thu_cong_no_so_phieu_ngay
  on public.thu_cong_no(ma_so, ma_phieu, ngay_thu);

-- Tra ve dung tap du lieu can cho khoang ngay dang xem:
-- 1. Tat ca phieu nam trong khoang ngay.
-- 2. Phieu cong no cu van con no tai ngay ket thuc.
-- 3. Phieu cong no cu co phat sinh thu tien trong khoang ngay.
-- 4. Chi tiet, ket qua xo, tra thuong va thu cong no lien quan.
create or replace function public.tai_du_lieu_theo_khoang(
  p_ma_so uuid,
  p_tu_ngay date,
  p_den_ngay date
)
returns jsonb
language plpgsql
stable
security invoker
set search_path = ''
as $$
declare
  v_ket_qua jsonb;
begin
  if p_ma_so is null then
    raise exception 'Ma so khong duoc de trong.';
  end if;

  if p_tu_ngay is null or p_den_ngay is null then
    raise exception 'Khoang ngay khong duoc de trong.';
  end if;

  if p_tu_ngay > p_den_ngay then
    raise exception 'Ngay bat dau khong the sau ngay ket thuc.';
  end if;

  if not public.co_quyen_so(p_ma_so, 'xem') then
    raise exception 'Ban khong co quyen xem so nay.';
  end if;

  with
  da_thu_den_ngay as materialized (
    select
      t.ma_phieu,
      sum(t.so_tien)::bigint as tong_da_thu
    from public.thu_cong_no t
    where
      t.ma_so = p_ma_so
      and t.ngay_huy is null
      and t.ngay_thu <= p_den_ngay
    group by t.ma_phieu
  ),
  phieu_can_tai as materialized (
    select p.*
    from public.phieu_ghi p
    left join da_thu_den_ngay d
      on d.ma_phieu = p.ma_phieu
    where
      p.ma_so = p_ma_so
      and p.ngay_xoa is null
      and (
        p.ngay_ghi between p_tu_ngay and p_den_ngay
        or (
          p.loai_phieu = 'truc_tiep'
          and p.hinh_thuc_thanh_toan = 'cong_no'
          and p.ngay_ghi <= p_den_ngay
          and p.tong_tien > coalesce(d.tong_da_thu, 0)
        )
        or exists (
          select 1
          from public.thu_cong_no t
          where
            t.ma_so = p.ma_so
            and t.ma_phieu = p.ma_phieu
            and t.ngay_huy is null
            and t.ngay_thu between p_tu_ngay and p_den_ngay
        )
      )
  ),
  ket_qua_can_tai as materialized (
    select k.*
    from public.ket_qua_xo k
    where
      k.ma_so = p_ma_so
      and k.ngay_xo between p_tu_ngay and p_den_ngay
  )
  select jsonb_build_object(
    'phieu',
    coalesce(
      (
        select jsonb_agg(to_jsonb(p) order by p.ngay_tao desc)
        from phieu_can_tai p
      ),
      '[]'::jsonb
    ),
    'chi_tiet',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(c)
          order by c.ma_phieu, c.thu_tu
        )
        from public.chi_tiet_phieu c
        join phieu_can_tai p
          on p.ma_so = c.ma_so
         and p.ma_phieu = c.ma_phieu
      ),
      '[]'::jsonb
    ),
    'ket_qua',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(k)
          order by k.ngay_xo, k.buoi
        )
        from ket_qua_can_tai k
      ),
      '[]'::jsonb
    ),
    'tra_thuong',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(t)
          order by t.ngay_tao
        )
        from public.tra_thuong t
        join ket_qua_can_tai k
          on k.ma_so = t.ma_so
         and k.ma_ket_qua = t.ma_ket_qua
      ),
      '[]'::jsonb
    ),
    'thu_cong_no',
    coalesce(
      (
        select jsonb_agg(
          to_jsonb(t)
          order by t.ngay_tao
        )
        from public.thu_cong_no t
        join phieu_can_tai p
          on p.ma_so = t.ma_so
         and p.ma_phieu = t.ma_phieu
        where t.ngay_thu <= p_den_ngay
      ),
      '[]'::jsonb
    ),
    'thong_ke',
    jsonb_build_object(
      'tu_ngay', p_tu_ngay,
      'den_ngay', p_den_ngay,
      'so_phieu_tai', (select count(*) from phieu_can_tai),
      'so_ket_qua_tai', (select count(*) from ket_qua_can_tai)
    )
  )
  into v_ket_qua;

  return v_ket_qua;
end;
$$;

comment on function public.tai_du_lieu_theo_khoang(uuid, date, date)
is 'Tai du lieu nghiep vu theo khoang ngay, kem cong no cu con du va giao dich thu no lien quan.';

revoke all on function public.tai_du_lieu_theo_khoang(
  uuid, date, date
) from public;

grant execute on function public.tai_du_lieu_theo_khoang(
  uuid, date, date
) to authenticated;

commit;
