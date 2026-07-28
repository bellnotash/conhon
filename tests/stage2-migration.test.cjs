const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const sql = fs.readFileSync(
  path.join(
    __dirname,
    "..",
    "supabase",
    "migrations",
    "20260728_chang_2_tai_du_lieu_theo_khoang.sql"
  ),
  "utf8"
);

assert.match(sql, /create index if not exists idx_thu_cong_no_so_ngay/i);
assert.match(
  sql,
  /create index if not exists idx_thu_cong_no_so_phieu_ngay/i
);
assert.match(
  sql,
  /create or replace function public\.tai_du_lieu_theo_khoang/i
);
assert.match(sql, /public\.co_quyen_so\(p_ma_so, 'xem'\)/i);
assert.match(sql, /p\.ngay_ghi between p_tu_ngay and p_den_ngay/i);
assert.match(sql, /p\.tong_tien > coalesce\(d\.tong_da_thu, 0\)/i);
assert.match(sql, /t\.ngay_thu between p_tu_ngay and p_den_ngay/i);
assert.match(sql, /'phieu'/i);
assert.match(sql, /'chi_tiet'/i);
assert.match(sql, /'ket_qua'/i);
assert.match(sql, /'tra_thuong'/i);
assert.match(sql, /'thu_cong_no'/i);
assert.match(
  sql,
  /grant execute on function public\.tai_du_lieu_theo_khoang/i
);
assert.doesNotMatch(sql, /\b(?:drop|truncate|delete)\b/i);

console.log(
  "OK: migration Chặng 2 có bộ lọc ngày, công nợ và quyền truy cập an toàn."
);
