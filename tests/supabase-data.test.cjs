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
const rpcCalls = [];
const tableFetchCounts = {};

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

function rangePayload() {
  return {
    phieu: [
      {
        ma_phieu: "entry-range",
        ma_nguon: "source-self",
        ma_phieu_cu: "legacy-range",
        ngay_ghi: "2026-07-28",
        buoi: "sang",
        ten_khach_nguon: "Khách A",
        ten_nguoi_ban: "Thiên",
        noi_dung_goc: "nai 100",
        hinh_thuc_thanh_toan: "tien_mat",
        loai_phieu: "truc_tiep",
        tong_tien: 100000,
        du_lieu_bo_sung: {},
        ngay_tao: "2026-07-28T01:00:00Z",
        ngay_cap_nhat: "2026-07-28T01:00:00Z",
      },
      {
        ma_phieu: "entry-old-debt",
        ma_nguon: "source-self",
        ma_phieu_cu: "legacy-debt",
        ngay_ghi: "2026-07-20",
        buoi: "chieu",
        ten_khach_nguon: "Khách nợ",
        ten_nguoi_ban: "Thiên",
        noi_dung_goc: "nai 200",
        hinh_thuc_thanh_toan: "cong_no",
        loai_phieu: "truc_tiep",
        tong_tien: 200000,
        du_lieu_bo_sung: {},
        ngay_tao: "2026-07-20T08:00:00Z",
        ngay_cap_nhat: "2026-07-20T08:00:00Z",
      },
    ],
    chi_tiet: [
      {
        ma_phieu: "entry-range",
        ma_con: "1",
        so_tien: 100000,
        thu_tu: 1,
      },
      {
        ma_phieu: "entry-old-debt",
        ma_con: "1",
        so_tien: 200000,
        thu_tu: 1,
      },
    ],
    ket_qua: [
      {
        ma_ket_qua: "draw-1",
        ngay_xo: "2026-07-28",
        buoi: "sang",
        ma_con: "1",
        thoi_diem_xac_nhan: "2026-07-28T04:00:00Z",
        ngay_cap_nhat: "2026-07-28T04:00:00Z",
      },
    ],
    tra_thuong: [
      {
        ma_tra_thuong: "payout-1",
        ma_ket_qua: "draw-1",
        ma_phieu: "entry-range",
        he_so_tra: 27,
        che_do_he_so: "mac_dinh",
        tien_trung: 100000,
        tien_tra: 2700000,
        da_tra: false,
        thoi_diem_tra: null,
        du_lieu_chot: null,
        ngay_tao: "2026-07-28T04:00:00Z",
        ngay_cap_nhat: "2026-07-28T04:00:00Z",
      },
    ],
    thu_cong_no: [
      {
        ma_lan_thu: "payment-1",
        ma_phieu: "entry-old-debt",
        ma_giao_dich_cu: null,
        so_tien: 50000,
        ngay_thu: "2026-07-28",
        hinh_thuc: "tien_mat",
        ghi_chu: "",
        ngay_tao: "2026-07-28T02:00:00Z",
        ngay_huy: null,
      },
    ],
  };
}

function queryFor(table) {
  const query = {
    select: () => query,
    eq: () => query,
    range: () => query,
    is: () => query,
    order: () => query,
    then(resolve) {
      tableFetchCounts[table] = (tableFetchCounts[table] || 0) + 1;
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
    rpc: async (name, parameters) => {
      rpcCalls.push({ name, parameters });
      return shouldFail
        ? { data: null, error: new Error("database unavailable") }
        : {
            data: rangePayload(),
            error: null,
          };
    },
  },
  conhonAuth: {
    book: {
      ma_so: "book-1",
      ma_ho_so_cu: "profile-thien",
      ten_so: "Thiên",
    },
  },
  animals: [{ id: "1", type: "Nai" }],
  ledgerData: [{ id: "local-stale-entry" }],
  paidEntries: { stale: true },
  drawResults: { stale: true },
  payoutStates: { stale: true },
  debtPayments: [{ id: "stale" }],
  financeSettings: {},
  localProfile: {},
  activeViewDateFrom: "2026-07-28",
  activeViewDateTo: "2026-07-28",
  getCurrentDate: () => "2026-07-28",
  formatDateForDisplay: (value) => value,
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
  assert.equal(context.conhonDatabaseSnapshot.counts.entries, 2);
  assert.equal(context.conhonDatabaseSnapshot.counts.rangeEntries, 1);
  assert.equal(context.ledgerData.length, 2);
  assert.equal(context.ledgerData[0].entries[0].animal, "nai");
  assert.equal(context.ledgerData[1].paymentType, "debt");
  assert.equal(context.debtPayments.length, 1);
  assert.equal(
    context.drawResults["2026-07-28|Sáng"].databaseId,
    "draw-1"
  );
  assert.equal(
    context.payoutStates["2026-07-28|Sáng|entry-range"].rate,
    27
  );
  assert.equal(context.localProfile.name, "Thiên");
  assert.equal(loading, false);
  assert.equal(tableFetchCounts.nguon_so, 1);
  assert.equal(tableFetchCounts.cau_hinh_so, 1);
  assert.equal(rpcCalls[0].name, "tai_du_lieu_theo_khoang");
  assert.equal(rpcCalls[0].parameters.p_ma_so, "book-1");
  assert.equal(rpcCalls[0].parameters.p_tu_ngay, "2026-07-28");
  assert.equal(rpcCalls[0].parameters.p_den_ngay, "2026-07-28");
  assert.equal(
    context.ensureConhonDatabaseRange("2026-07-28", "2026-07-28"),
    false
  );

  assert.equal(
    context.ensureConhonDatabaseRange("2026-07-21", "2026-07-27"),
    true
  );
  for (let index = 0; index < 5; index += 1) {
    await new Promise((resolve) => setImmediate(resolve));
  }
  assert.equal(context.conhonDatabaseSnapshot.range.startDate, "2026-07-21");
  assert.equal(context.conhonDatabaseSnapshot.range.endDate, "2026-07-27");
  assert.equal(rpcCalls.length, 2);
  assert.equal(tableFetchCounts.nguon_so, 1);
  assert.equal(tableFetchCounts.cau_hinh_so, 1);

  const backup = await context.getConhonFullDatabaseBackup();
  assert.equal(backup.phieu_ghi.length, 2);
  assert.equal(backup.chi_tiet_phieu.length, 2);
  assert.equal(backup.nguon_so.length, 1);
  assert.equal(rpcCalls[2].parameters.p_tu_ngay, "1900-01-01");
  assert.equal(rpcCalls[2].parameters.p_den_ngay, "9999-12-31");
  assert.equal(tableFetchCounts.nguon_so, 2);
  assert.equal(tableFetchCounts.cau_hinh_so, 2);

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
