const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

function createClassList(initial = []) {
  const values = new Set(initial);
  return {
    add: (...names) => names.forEach((name) => values.add(name)),
    remove: (...names) => names.forEach((name) => values.delete(name)),
    contains: (name) => values.has(name),
  };
}

const elements = {
  databaseConnectionStatus: { innerHTML: "" },
  lastUpdateBadge: { innerHTML: "" },
  summaryImportInput: { disabled: false },
};
const bodyClassList = createClassList(["database-unavailable"]);
const listeners = new Map();
let shouldFail = false;
let loading = false;
let refreshCount = 0;

const tableRows = {
  nguon_so: [
    {
      ma_nguon: "source-self",
      ten_nguon: "Thiên",
      loai_nguon: "ban_than",
      vai_tro_tai_chinh: "ban_than",
      ma_ho_so_ngoai: "profile-thien",
      ty_le_hoa_hong: 0,
      dang_hoat_dong: true,
    },
  ],
  cau_hinh_so: [
    {
      ma_so: "book-1",
      ty_le_chu_so: 20,
      ty_le_cap_duoi_mac_dinh: 15,
      he_so_nhan_tu_cap_tren: 28,
      he_so_tra_mac_dinh: 27,
    },
  ],
  phieu_ghi: [],
  chi_tiet_phieu: [],
  ket_qua_xo: [],
  tra_thuong: [],
  thu_cong_no: [],
};

function queryFor(table) {
  const query = {
    select: () => query,
    eq: () => query,
    range: () => query,
    is: () => query,
    order: () => query,
    then(resolve) {
      return Promise.resolve(
        shouldFail
          ? { data: null, error: new Error("database unavailable") }
          : { data: tableRows[table] || [], error: null }
      ).then(resolve);
    },
  };
  return query;
}

const context = {
  console: {
    log: console.log,
    warn: console.warn,
    error: () => {},
  },
  Promise,
  setTimeout,
  clearTimeout,
  CustomEvent: class {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail;
    }
  },
  document: {
    body: { classList: bodyClassList },
    getElementById: (id) => elements[id] || null,
  },
  conhonSupabase: {
    from: (table) => queryFor(table),
  },
  conhonAuth: {
    book: {
      ma_so: "book-1",
      ma_ho_so_cu: "profile-thien",
      ten_so: "Thiên",
    },
  },
  animals: [],
  ledgerData: [{ id: "local-stale-entry" }],
  paidEntries: { stale: true },
  drawResults: { stale: true },
  payoutStates: { stale: true },
  debtPayments: [{ id: "stale" }],
  financeSettings: {},
  localProfile: {},
  rebuildDataIndexes: () => {},
  updateProfileButton: () => {},
  initializeDefaultSeller: () => {},
  syncViewControls: () => {},
  refreshAllViews: () => {
    refreshCount += 1;
  },
  toggleLoading: (value) => {
    loading = value;
  },
  showNotification: () => {},
};
context.window = context;
context.window.addEventListener = (name, handler) => listeners.set(name, handler);
context.window.dispatchEvent = (event) => listeners.get(event.type)?.(event);

vm.createContext(context);
vm.runInContext(
  fs.readFileSync(path.join(__dirname, "..", "supabase-data.js"), "utf8"),
  context,
  { filename: "supabase-data.js" }
);

(async () => {
  await context.reloadConhonDatabase();

  assert.equal(context.conhonDatabaseReady, true);
  assert.equal(bodyClassList.contains("database-unavailable"), false);
  assert.equal(context.conhonDatabaseSnapshot.counts.entries, 0);
  assert.equal(context.localProfile.name, "Thiên");
  assert.equal(loading, false);

  context.ledgerData = [{ id: "must-be-cleared" }];
  context.paidEntries = { stale: true };
  context.drawResults = { stale: true };
  context.payoutStates = { stale: true };
  context.debtPayments = [{ id: "stale" }];
  shouldFail = true;

  await context.reloadConhonDatabase();

  assert.equal(context.conhonDatabaseReady, false);
  assert.equal(context.conhonDatabaseSnapshot, null);
  assert.equal(bodyClassList.contains("database-unavailable"), true);
  assert.equal(context.ledgerData.length, 0);
  assert.equal(Object.keys(context.paidEntries).length, 0);
  assert.equal(Object.keys(context.drawResults).length, 0);
  assert.equal(Object.keys(context.payoutStates).length, 0);
  assert.equal(context.debtPayments.length, 0);
  assert.match(
    elements.databaseConnectionStatus.innerHTML,
    /không có dữ liệu cục bộ thay thế/
  );
  assert.ok(refreshCount >= 2);
  assert.equal(loading, false);

  console.log(
    "OK: tải Supabase thành công và lỗi tải đều giữ đúng nguồn dữ liệu."
  );
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
