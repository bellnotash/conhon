const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const migration = fs.readFileSync(
  path.join(
    __dirname,
    "..",
    "supabase",
    "migrations",
    "20260728_toi_uu_ghi_so_cap_duoi_thu_cong.sql"
  ),
  "utf8"
);

assert.match(
  migration,
  /create unique index if not exists uq_nguon_thu_cong_ten/i,
  "Migration phải chống trùng tên nguồn nhập tay"
);
assert.match(
  migration,
  /create or replace function public\.lay_hoac_tao_nguon_thu_cong/i,
  "Migration phải tạo RPC quản lý nguồn nhập tay"
);
assert.match(
  migration,
  /public\.co_quyen_so\(p_ma_so, 'quan_ly'\)/i,
  "RPC phải kiểm tra quyền quản lý đúng sổ"
);
assert.match(
  migration,
  /'cap_duoi_thu_cong'/i,
  "Nguồn tạo mới phải mang loại cấp dưới thủ công"
);
assert.match(
  migration,
  /grant execute on function public\.lay_hoac_tao_nguon_thu_cong\(uuid, text\)\s+to authenticated/i,
  "Chỉ tài khoản đăng nhập mới được gọi RPC"
);

console.log("OK: migration nguồn cấp dưới thủ công đạt kiểm tra tĩnh.");
