const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");
const writes = fs.readFileSync(
  path.join(root, "supabase-writes.js"),
  "utf8"
);

for (const id of [
  "ledgerSellerSource",
  "editSellerSource",
  "manualSellerBanner",
  "manualSellerModal",
  "manualSellerName",
  "manualSellerSaveButton",
]) {
  assert.match(
    html,
    new RegExp(`id=["']${id}["']`),
    `Giao diện phải có #${id}`
  );
}

assert.match(
  script,
  /source\?\.type === "cap_duoi_thu_cong"/,
  "Banner nhập theo đợt phải chỉ hiện cho nguồn cấp dưới thủ công"
);
assert.match(
  script,
  /source\.aliases\.includes\(String\(entry\.sellerSourceId \|\| ""\)\)/,
  "Tổng đợt nhập phải nhóm theo mã nguồn, không nhóm theo tên"
);
assert.match(
  script,
  /\(e\.ctrlKey \|\| e\.metaKey\)[\s\S]*?e\.key === "Enter"[\s\S]*?processLedgerEntry\(\)/,
  "Phải hỗ trợ Ctrl+Enter để lưu nhanh"
);
assert.doesNotMatch(
  writes,
  /function isOwnerSeller/,
  "Không được giữ khóa chỉ cho phép người bán là chủ sổ"
);
assert.match(
  writes,
  /p_ma_nguon: sellerSource\.id/g,
  "Tạo và sửa phiếu phải gửi đúng mã nguồn được chọn"
);
assert.match(
  writes,
  /findLikelyDuplicate/,
  "Phải có cảnh báo mềm cho phiếu có dấu hiệu trùng"
);

console.log("OK: giao diện và luồng nhập sổ cấp dưới đạt kiểm tra tĩnh.");
