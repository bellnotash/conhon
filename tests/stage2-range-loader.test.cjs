const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const dataLayer = fs.readFileSync(
  path.join(root, "supabase-data.js"),
  "utf8"
);
const script = fs.readFileSync(path.join(root, "script.js"), "utf8");

assert.match(
  dataLayer,
  /client\.rpc\(\s*"tai_du_lieu_theo_khoang"/
);
assert.match(dataLayer, /window\.ensureConhonDatabaseRange/);
assert.match(dataLayer, /loadedRangeKey/);
assert.match(dataLayer, /cachedMetadataBookId/);
assert.match(dataLayer, /pendingRangeRequest/);
assert.match(dataLayer, /counts:\s*\{[\s\S]*rangeEntries:/);
assert.match(script, /window\.ensureConhonDatabaseRange\(/);

[
  "phieu_ghi",
  "chi_tiet_phieu",
  "ket_qua_xo",
  "tra_thuong",
  "thu_cong_no",
].forEach((table) => {
  assert.doesNotMatch(
    dataLayer,
    new RegExp(
      `fetchAll\\(\\s*client,\\s*["']${table}["']`,
      "m"
    ),
    `${table} không được tải toàn bảng khi đổi bộ lọc`
  );
});

assert.match(dataLayer, /getConhonFullDatabaseBackup/);
assert.match(dataLayer, /"1900-01-01"/);
assert.match(dataLayer, /"9999-12-31"/);

console.log(
  "OK: Chặng 2 tải nghiệp vụ theo khoảng ngày và chỉ tải toàn bộ khi sao lưu."
);
