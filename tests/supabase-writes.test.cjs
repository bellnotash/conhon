const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const calls = [];
const notifications = [];
const elements = new Map();
const element = (id) => {
  if (!elements.has(id)) {
    elements.set(id, {
      id,
      value: "",
      textContent: "",
      innerHTML: "",
      disabled: false,
      style: {},
      classList: { add() {}, remove() {} },
    });
  }
  return elements.get(id);
};

function queryBuilder(table, operation, payload) {
  const filters = [];
  const builder = {
    eq(column, value) {
      filters.push([column, value]);
      return builder;
    },
    select(columns) {
      calls.push({ type: operation, table, payload, filters, columns });
      return builder;
    },
    single() {
      return Promise.resolve({
        data:
          table === "nguon_so"
            ? { ma_nguon: "source-new" }
            : { ma_so: "book-1" },
        error: null,
      });
    },
  };
  return builder;
}

const client = {
  rpc(name, args) {
    calls.push({ type: "rpc", name, args });
    return Promise.resolve({ data: "result-id", error: null });
  },
  from(table) {
    return {
      update(payload) {
        return queryBuilder(table, "update", payload);
      },
      insert(payload) {
        return queryBuilder(table, "insert", payload);
      },
    };
  },
};

const context = {
  console,
  setTimeout,
  clearTimeout,
  confirm: () => true,
  showNotification: (message, type) =>
    notifications.push({ message, type }),
  document: {
    body: { classList: { add() {} } },
    addEventListener() {},
    getElementById: element,
    querySelector() {
      return null;
    },
  },
  window: {
    conhonSupabase: client,
    conhonAuth: {
      book: { ma_so: "book-1", ten_so: "thiên" },
    },
    conhonDatabaseSnapshot: {
      selfSourceId: "source-self",
      sources: [
        {
          ma_nguon: "source-child",
          ma_ho_so_ngoai: "child-1",
        },
      ],
    },
    reloadConhonDatabase: async () => {
      calls.push({ type: "reload" });
    },
    addEventListener() {},
  },
  financeSettings: {
    ownerRate: 20,
    defaultChildRate: 15,
    ownerPayoutRate: 28,
    defaultPayoutRate: 27,
  },
  localProfile: { id: "profile-self", name: "thiên" },
  debtPayments: [],
  ledgerData: [],
  drawResults: {},
  payoutStates: {},
  animals: [
    { id: "01", type: "cá", name: "Cá" },
    { id: "02", type: "chó", name: "Chó" },
  ],
  animalNameToIndex: { cá: 0, chó: 1 },
  findEntryById: () => null,
  getCurrentDrawContext: () => null,
  getConfirmedDraw: () => null,
  resolveAnimalSearch: () => -1,
  formatDateForDisplay: (value) => value,
  getAnimalSearchLabel: (index) => `animal-${index}`,
  ensurePayoutState: () => ({ state: {} }),
  buildPayoutSnapshot: (entry, draw, animalIndex, hitSum, rate) => ({
    entryId: entry.id,
    drawKey: draw.drawKey,
    animalIndex,
    hitAmount: hitSum,
    rate,
  }),
  filterWinningEntries() {},
  syncPayoutLookupForActiveView() {},
  renderDebtPaymentModal() {},
  getDebtSnapshot: () => ({ remaining: 0 }),
  getCurrentDate: () => "2026-07-27",
  normalizeCommissionRate: (value, fallback) => {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  },
  normalizePayoutRate: (value, fallback) => {
    const number = Number(value);
    return [27, 28, 29, 30].includes(number) ? number : fallback;
  },
  syncFinanceSettingsForm() {},
  updateFinanceDashboard() {},
  closeProfileModal() {},
  validateSummaryData: () => {
    throw new Error("not configured");
  },
  removeVietnameseDiacritics: (value) => value,
  parseContentDetailed: () => ({ entries: [], errors: [] }),
  renderParsePreview() {},
  addRecentPerson() {},
  addRecentSeller() {},
  syncViewControls() {},
  activeViewDate: "",
  activeViewDateFrom: "",
  activeViewDateTo: "",
  activeViewSession: "",
};
context.window.window = context.window;
Object.assign(context.window, {
  document: context.document,
});
vm.createContext(context);
vm.runInContext(
  fs.readFileSync(
    path.join(__dirname, "..", "supabase-writes.js"),
    "utf8"
  ),
  context,
  { filename: "supabase-writes.js" }
);

async function run() {
  const entry = {
    id: "entry-1",
    date: "2026-07-27",
    session: "Sáng",
    paymentType: "debt",
    entries: [{ animal: "cá", amount: 10000 }],
  };
  context.findEntryById = () => entry;

  await context.window.deleteLedgerEntry(entry.id);
  assert.equal(calls.at(-2).type, "rpc");
  assert.equal(calls.at(-2).name, "xoa_mem_phieu");
  assert.equal(calls.at(-2).args.p_ma_so, "book-1");
  assert.equal(calls.at(-2).args.p_ma_phieu, "entry-1");
  assert.equal(calls.at(-1).type, "reload");

  await context.window.performUndo();
  assert.equal(calls.at(-2).name, "khoi_phuc_phieu");
  assert.equal(calls.at(-1).type, "reload");

  context.getCurrentDrawContext = () => ({
    date: "2026-07-27",
    session: "Sáng",
    drawKey: "2026-07-27|Sáng",
  });
  context.resolveAnimalSearch = () => 1;
  element("winAnimalSearch").value = "chó";
  await context.window.confirmWinningAnimal();
  const drawCall = calls.findLast(
    (call) => call.name === "xac_nhan_ket_qua_xo"
  );
  assert.equal(drawCall.args.p_ma_so, "book-1");
  assert.equal(drawCall.args.p_ngay_xo, "2026-07-27");
  assert.equal(drawCall.args.p_buoi, "sang");
  assert.equal(drawCall.args.p_ma_con, "02");

  context.getConfirmedDraw = () => ({
    animalIndex: 0,
    result: { databaseId: "draw-1" },
  });
  context.ensurePayoutState = () => ({
    state: { rate: 27, rateMode: "default", paid: false },
  });
  await context.window.updatePayoutRate(entry.id, 29);
  let payoutCall = calls.findLast(
    (call) => call.name === "cap_nhat_tra_thuong"
  );
  assert.equal(payoutCall.args.p_he_so_tra, 29);
  assert.equal(payoutCall.args.p_che_do_he_so, "thu_cong");

  await context.window.togglePaidStatus(entry.id);
  payoutCall = calls.findLast(
    (call) => call.name === "cap_nhat_tra_thuong"
  );
  assert.equal(payoutCall.args.p_da_tra, true);

  element("debtPaymentEntryId").value = entry.id;
  element("debtPaymentAmount").value = "4000";
  element("debtPaymentDate").value = "2026-07-27";
  element("debtPaymentMethod").value = "bank_transfer";
  element("debtPaymentNote").value = "đợt 1";
  context.getDebtSnapshot = () => ({ remaining: 10000 });
  await context.window.saveDebtPayment();
  assert.equal(calls.at(-2).name, "ghi_thu_cong_no");
  assert.equal(calls.at(-2).args.p_hinh_thuc, "chuyen_khoan");
  assert.equal(calls.at(-2).args.p_so_tien, 4000);
  const debtRpcCount = calls.filter(
    (call) => call.name === "ghi_thu_cong_no"
  ).length;
  element("debtPaymentAmount").value = "11000";
  await context.window.saveDebtPayment();
  assert.equal(
    calls.filter((call) => call.name === "ghi_thu_cong_no").length,
    debtRpcCount,
    "Không được gửi RPC khi số thu lớn hơn nợ còn lại"
  );

  context.debtPayments.push({
    id: "payment-1",
    entryId: entry.id,
    reversedAt: null,
  });
  await context.window.reverseDebtPayment("payment-1");
  assert.equal(calls.at(-2).name, "huy_thu_cong_no");

  element("financeOwnerRate").value = "20";
  element("financeDefaultChildRate").value = "15";
  element("financeOwnerPayoutRate").value = "29";
  element("financeDefaultPayoutRate").value = "28";
  await context.window.saveFinanceSettingsFromForm();
  const settingsWrite = calls.findLast(
    (call) => call.type === "update" && call.table === "cau_hinh_so"
  );
  assert.equal(settingsWrite.payload.he_so_tra_mac_dinh, 28);
  const settingsWriteCount = calls.filter(
    (call) => call.type === "update" && call.table === "cau_hinh_so"
  ).length;
  element("financeDefaultChildRate").value = "21";
  await context.window.saveFinanceSettingsFromForm();
  assert.equal(
    calls.filter(
      (call) => call.type === "update" && call.table === "cau_hinh_so"
    ).length,
    settingsWriteCount,
    "Không được ghi cấu hình khi tỷ lệ cấp dưới vượt tỷ lệ chủ sổ"
  );
  element("financeDefaultChildRate").value = "15";

  await context.window.updateFinanceSourceConfig(
    encodeURIComponent("child:child-1"),
    "childRate",
    "14"
  );
  const sourceWrite = calls.findLast(
    (call) => call.type === "update" && call.table === "nguon_so"
  );
  assert.equal(sourceWrite.payload.ty_le_hoa_hong, 14);

  element("profileName").value = "thiên mới";
  await context.window.saveLocalProfile();
  const profileWrite = calls.findLast(
    (call) => call.type === "update" && call.table === "so_ghi"
  );
  assert.equal(profileWrite.payload.ten_so, "thiên mới");
  assert.equal(context.window.conhonAuth.book.ten_so, "thiên mới");

  context.validateSummaryData = () => ({
    summaryKey: "child-1|2026-07-27|Sáng",
    signature: "sig-1",
    total: 5000,
  });
  const importEvent = {
    target: {
      files: [
        {
          name: "phieu-cap-duoi.json",
          text: async () =>
            JSON.stringify({
              version: 1,
              source: { id: "child-1", name: "Cấp dưới 1" },
              date: "2026-07-27",
              session: "Sáng",
              exportedAt: "2026-07-27T10:00:00.000Z",
              items: [{ animalId: "01", amount: 5000 }],
            }),
        },
      ],
      value: "selected",
    },
  };
  await context.window.importSessionSummary(importEvent);
  const importCall = calls.findLast(
    (call) => call.type === "rpc" && call.name === "nhap_phieu_cap_duoi"
  );
  assert.equal(importCall.args.p_ma_nguon, "source-child");
  assert.equal(JSON.stringify(importCall.args.p_chi_tiet), JSON.stringify([
    { ma_con: "01", so_tien: 5000 },
  ]));

  const importRpcCount = calls.filter(
    (call) => call.name === "nhap_phieu_cap_duoi"
  ).length;
  context.validateSummaryData = () => ({
    summaryKey: "profile-self|2026-07-27|Sáng",
    signature: "sig-self",
    total: 5000,
  });
  importEvent.target.files[0].text = async () =>
    JSON.stringify({
      version: 1,
      source: { id: "profile-self", name: "thiên mới" },
      date: "2026-07-27",
      session: "Sáng",
      items: [{ animalId: "01", amount: 5000 }],
    });
  await context.window.importSessionSummary(importEvent);
  assert.equal(
    calls.filter((call) => call.name === "nhap_phieu_cap_duoi").length,
    importRpcCount,
    "Không được nhập phiếu do chính sổ này xuất"
  );

  assert.equal(JSON.stringify(context.window.conhonDatabaseWriteCapabilities), JSON.stringify([
    "tao_phieu",
    "sua_phieu",
    "xoa_phieu",
    "khoi_phuc_phieu",
    "ket_qua_xo",
    "tra_thuong",
    "cong_no",
    "cau_hinh",
    "ho_so",
    "nhap_cap_duoi",
  ]));
  console.log(`OK: ${calls.length} lời gọi database đã được kiểm tra.`);
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
