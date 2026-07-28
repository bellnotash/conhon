// Tạo mảng chứa thông tin các con vật
const animals = [
  { id: "05", name: "CHIẾM KHÔI", type: "Cá Trắng" },
  { id: "16", name: "BẢN QUẾ", type: "Con Ốc" },
  { id: "32", name: "VINH SANH", type: "Con Ngỗng" },
  { id: "12", name: "PHÙNG XUÂN", type: "Con Công" },
  { id: "01", name: "CHÍ CAO", type: "Con Trùn" },
  { id: "17", name: "KHÔN SƠN", type: "Con Cọp" },
  { id: "24", name: "CHÁNH THUẬN", type: "Con Heo" },
  { id: "20", name: "NGUYỆT BỬU", type: "Con Thỏ" },
  { id: "33", name: "HỚN VÂN", type: "Con Trâu" },
  { id: "18", name: "GIANG TỪ", type: "Rồng Bay" },
  { id: "15", name: "PHƯỚC TÔN", type: "Con Chó" },
  { id: "04", name: "QUANG MINH", type: "Con Ngựa" },
  { id: "14", name: "HỮU TÀI", type: "Con Voi" },
  { id: "13", name: "CHÍ ĐẮC", type: "Con Mèo" },
  { id: "11", name: "TẤT KHẮC", type: "Con Chuột" },
  { id: "02", name: "MẬU LÂM", type: "Con Ong" },
  { id: "06", name: "TRỌNG TIÊN", type: "Con Hạc" },
  { id: "10", name: "THIÊN THÂN", type: "Kỳ Lân" },
  { id: "27", name: "CẤN NGỌC", type: "Con Bướm" },
  { id: "08", name: "TRÂN CHÂU", type: "Hòn Đá" },
  { id: "22", name: "THƯỢNG CHIÊU", type: "Con Én" },
  { id: "21", name: "SONG ĐỒNG", type: "Con Cu" },
  { id: "30", name: "TAM HÒE", type: "Con Khỉ" },
  { id: "07", name: "HIỆP HẢI", type: "Con Ếch" },
  { id: "35", name: "CỬU QUAN", type: "Con Quạ" },
  { id: "31", name: "THÁI BÌNH", type: "Rồng Nằm" },
  { id: "19", name: "HỎA DIỆM", type: "Con Rùa" },
  { id: "29", name: "NHỰT THẮNG", type: "Con Gà" },
  { id: "28", name: "ĐỊA LƯƠNG", type: "Con Lươn" },
  { id: "23", name: "TĨNH LỢI", type: "Cá Đỏ" },
  { id: "26", name: "TRƯỜNG THỌ", type: "Con Tôm" },
  { id: "03", name: "VẠN KIM", type: "Con Rắn" },
  { id: "09", name: "THANH TIÊN", type: "Con Nhện" },
  { id: "36", name: "NGUYÊN KIẾT", type: "Con Nai" },
  { id: "25", name: "NHỨT PHẨM", type: "Con Dê" },
  { id: "34", name: "AN SỸ", type: "Con Yêu" },
];

// Thêm mảng để lưu lịch sử cho mỗi ô
const cellHistory = Array(36)
  .fill()
  .map(() => []);

// ===== CẤU HÌNH NĂM =====
const APP_CONFIG = {
  year: 2026,
  lunar: "BÍNH NGỌ",
  title: "CỔ NHƠN 2026 - XUÂN BÍNH NGỌ",
};

// ===== HÀM PARSE TIỀN ĐA ĐỊNH DẠNG =====
// Hỗ trợ: 50k, 50K, 0.5m, 50.000, 50,000, 50000, +50k, -50k.
// Trong ô ghi sổ, số nguyên ngắn mặc định là nghìn: 50 = 50.000đ.
function parseMoney(str, shortNumberAsThousands = false) {
  if (!str) return 0;
  str = str.toString().trim().toLowerCase().replace(/\s+/g, "");
  if (!str) return 0;

  // Bỏ dấu +/- (chỉ cho phép số dương)
  str = str.replace(/^[\+\-]/, "");

  // Hậu tố "m" (triệu)
  if (str.endsWith("m")) {
    const num = parseFloat(str.replace("m", "").replace(/,/g, "."));
    return isNaN(num) ? 0 : Math.abs(Math.round(num * 1000000));
  }

  // Hậu tố "k" (nghìn)
  if (str.endsWith("k")) {
    const numStr = str.replace("k", "").replace(/\./g, "").replace(/,/g, ".");
    const num = parseFloat(numStr);
    return isNaN(num) ? 0 : Math.abs(Math.round(num * 1000));
  }

  // Dấu chấm phân cách hàng nghìn: "50.000"
  if (/^\d{1,3}(\.\d{3})+$/.test(str)) {
    return Math.abs(parseInt(str.replace(/\./g, "")));
  }

  // Dấu phẩy phân cách hàng nghìn: "50,000"
  if (/^\d{1,3}(,\d{3})+$/.test(str)) {
    return Math.abs(parseInt(str.replace(/,/g, "")));
  }

  // Số thuần. Khi nhập nội dung ghi sổ: 1..999 được hiểu là nghìn.
  const num = parseInt(str);
  if (isNaN(num)) return 0;
  const absolute = Math.abs(num);
  return shortNumberAsThousands && /^\d+$/.test(str) && absolute < 1000
    ? absolute * 1000
    : absolute;
}

// ===== BỎ DẤU TIẾNG VIỆT =====
function removeVietnameseDiacritics(str) {
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  str = str.replace(/đ/gi, "d");
  return str;
}

// ===== MAP TÊN CON VẬT VỚI INDEX (CÓ ALIAS) =====
const animalNameToIndex = {};
animals.forEach((animal, index) => {
  const type = animal.type.toLowerCase();
  animalNameToIndex[type] = index;

  // Thêm phiên bản không dấu
  const noDiacritics = removeVietnameseDiacritics(type);
  if (noDiacritics !== type) animalNameToIndex[noDiacritics] = index;

  // Thêm tên rút gọn (bỏ "con ", "cá ", "hòn ")
  const shortForm = type.replace(/^(con |cá |hòn |rồng |kỳ )/, "");
  if (shortForm !== type) {
    animalNameToIndex[shortForm] = index;
    const shortNoDiacritics = removeVietnameseDiacritics(shortForm);
    if (shortNoDiacritics !== shortForm) animalNameToIndex[shortNoDiacritics] = index;
  }
});

// Sắp xếp alias theo độ dài giảm dần (match dài trước)
const sortedAnimalEntries = Object.entries(animalNameToIndex)
  .sort((a, b) => b[0].length - a[0].length);

// ===== UNDO STACK =====
const undoStack = [];
const MAX_UNDO = 50;

function pushUndo(action) {
  undoStack.push(action);
  if (undoStack.length > MAX_UNDO) undoStack.shift();
  updateUndoButton();
}

function updateUndoButton() {
  const btn = document.getElementById("undoBtn");
  if (btn) btn.disabled = undoStack.length === 0;
}

function performUndo() {
  if (undoStack.length === 0) {
    showNotification("Không có thao tác để hoàn tác!", "error");
    return;
  }
  const action = undoStack.pop();
  const affectedEntryId =
    action.type === "add_entry"
      ? action.entryId
      : action.type === "edit_entry"
        ? action.entry?.id
        : null;
  if (
    affectedEntryId &&
    debtPayments.some(
      (payment) => String(payment.entryId) === String(affectedEntryId)
    )
  ) {
    undoStack.push(action);
    updateUndoButton();
    showNotification(
      "Không thể hoàn tác phiếu đã có lịch sử thu nợ!",
      "error"
    );
    return;
  }
  if (action.type === "add_entry") {
    ledgerData = ledgerData.filter((entry) => String(entry.id) !== String(action.entryId));
    showNotification("Đã hoàn tác ghi sổ!");
  } else if (action.type === "restore_entry") {
    ledgerData.splice(
      Math.min(action.index, ledgerData.length),
      0,
      JSON.parse(JSON.stringify(action.entry))
    );
    showNotification("Đã khôi phục phiếu vừa xóa!");
  } else if (action.type === "edit_entry") {
    const index = ledgerData.findIndex(
      (entry) => String(entry.id) === String(action.entry.id)
    );
    if (index !== -1) ledgerData[index] = JSON.parse(JSON.stringify(action.entry));
    showNotification("Đã hoàn tác chỉnh sửa!");
  }
  markDataChanged();
  refreshAllViews();
  saveDataToLocalStorage();
  updateUndoButton();
}

// ===== TRACKING NGƯỜI GHI GẦN NHẤT =====
let recentPersons = JSON.parse(localStorage.getItem("recentPersons") || "[]");

function addRecentPerson(name) {
  if (!name) return;
  recentPersons = recentPersons.filter((p) => p !== name);
  recentPersons.unshift(name);
  if (recentPersons.length > 10) recentPersons.pop();
  localStorage.setItem("recentPersons", JSON.stringify(recentPersons));
  updatePersonSuggestions();
}

function updatePersonSuggestions() {
  const datalist = document.getElementById("personSuggestions");
  if (!datalist) return;
  datalist.innerHTML = recentPersons
    .map((p) => `<option value="${escapeHtml(p)}">`)
    .join("");
}

// ===== TRACKING NGƯỜI BÁN GẦN NHẤT =====
let recentSellers = JSON.parse(localStorage.getItem("recentSellers") || "[]");

function addRecentSeller(name) {
  if (!name) return;
  recentSellers = recentSellers.filter((s) => s !== name);
  recentSellers.unshift(name);
  if (recentSellers.length > 10) recentSellers.pop();
  localStorage.setItem("recentSellers", JSON.stringify(recentSellers));
  updateSellerSuggestions();
}

function updateSellerSuggestions() {
  const datalist = document.getElementById("sellerSuggestions");
  if (!datalist) return;
  datalist.innerHTML = recentSellers
    .map((s) => `<option value="${escapeHtml(s)}">`)
    .join("");
}

// ===== DỮ LIỆU GHI SỔ CÓ CẤU TRÚC =====
let ledgerData = [];
let nextEntryId = 1;
const DATA_VERSION = 7;
const SUMMARY_FILE_TYPE = "conhon-session-summary";
const LIST_PAGE_SIZE = 50;
let activeViewDate = getCurrentDate();
let activeViewDateFrom = getCurrentDate();
let activeViewDateTo = getCurrentDate();
let activeViewSession = new Date().getHours() < 12 ? "Sáng" : "Chiều";
let calendarCursor = new Date();
let calendarAwaitingEnd = false;
let lastKnownToday = getCurrentDate();
let dataRevision = 0;
let ledgerEntryById = new Map();
let entriesByDateSession = new Map();
let debtPaymentsByEntryId = new Map();
let visibleEntriesCache = { key: "", entries: [] };
let ledgerHistoryPageState = { key: "", page: 1 };
let debtListPageState = { key: "", page: 1 };

function createUuid() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadLocalProfile() {
  try {
    const saved = JSON.parse(localStorage.getItem("coNhonProfile") || "null");
    if (saved?.id) return saved;
  } catch (error) {
    console.warn("Không đọc được hồ sơ sổ:", error);
  }
  const profile = { id: createUuid(), name: "" };
  localStorage.setItem("coNhonProfile", JSON.stringify(profile));
  return profile;
}

let localProfile = loadLocalProfile();

function getSellerIdentity(sellerName) {
  const name = String(sellerName || "").trim();
  const normalizedName = removeVietnameseDiacritics(name).toLowerCase();
  const normalizedProfile = removeVietnameseDiacritics(
    localProfile.name || ""
  ).toLowerCase();
  const isSelf =
    !name || (normalizedProfile && normalizedName === normalizedProfile);
  return isSelf
    ? {
        seller: name || localProfile.name || "",
        sellerSourceId: localProfile.id,
        sellerRole: "self",
      }
    : {
        seller: name,
        sellerSourceId: `manual:${normalizedName}`,
        sellerRole: "child",
      };
}

function applySellerIdentity(entry, sellerName) {
  const identity = getSellerIdentity(sellerName);
  entry.seller = identity.seller;
  entry.sellerSourceId = identity.sellerSourceId;
  entry.sellerRole = identity.sellerRole;
}

function useCurrentProfileAsSeller() {
  const input = document.getElementById("ledgerSeller");
  if (!input) return;
  input.value = localProfile.name || "";
  input.focus();
}

function initializeDefaultSeller(force = false) {
  const input = document.getElementById("ledgerSeller");
  if (!input) return;
  if (force || !input.value.trim()) {
    input.value = localProfile.name || "";
  }
}

function findEntryById(entryId) {
  return ledgerEntryById.get(String(entryId));
}

function isDirectEntry(entry) {
  return entry.entryType !== "child_summary";
}

function getVisibleEntries() {
  const cacheKey = [
    dataRevision,
    activeViewDateFrom,
    activeViewDateTo,
    activeViewSession || "all",
  ].join("|");
  if (visibleEntriesCache.key === cacheKey) {
    return visibleEntriesCache.entries;
  }
  const entries = ledgerData.filter(
    (entry) =>
      entry.date >= activeViewDateFrom &&
      entry.date <= activeViewDateTo &&
      (!activeViewSession || entry.session === activeViewSession)
  );
  visibleEntriesCache = { key: cacheKey, entries };
  return entries;
}

function getEntriesForDateSession(date, session) {
  return entriesByDateSession.get(`${date}|${session}`) || [];
}

function rebuildDataIndexes() {
  ledgerEntryById = new Map();
  entriesByDateSession = new Map();
  debtPaymentsByEntryId = new Map();

  ledgerData.forEach((entry) => {
    const entryId = String(entry.id);
    ledgerEntryById.set(entryId, entry);
    const sessionKey = `${entry.date}|${entry.session}`;
    const sessionEntries = entriesByDateSession.get(sessionKey) || [];
    sessionEntries.push(entry);
    entriesByDateSession.set(sessionKey, sessionEntries);
  });

  debtPayments.forEach((payment) => {
    const entryId = String(payment.entryId);
    const payments = debtPaymentsByEntryId.get(entryId) || [];
    payments.push(payment);
    debtPaymentsByEntryId.set(entryId, payments);
  });

  dataRevision += 1;
  visibleEntriesCache = { key: "", entries: [] };
}

function markDataChanged() {
  rebuildDataIndexes();
}

// ===== ĐÁNH DẤU ĐÃ CHUNG TIỀN =====
let paidEntries = {}; // Dữ liệu cũ, chỉ dùng để chuyển đổi.
let drawResults = {}; // { "YYYY-MM-DD|Buổi": { animalId, confirmedAt, updatedAt } }
let payoutStates = {}; // { "drawKey|entryId": { rate, paid, paidAt, snapshot } }
let activePayoutStatus = "unpaid";
let debtPayments = [];
let financeSettings = {
  ownerRate: 20,
  defaultChildRate: 15,
  ownerPayoutRate: 28,
  defaultPayoutRate: 27,
  sourceConfigs: {},
};

// ===== CẬP NHẬT BADGE LẦN CUỐI =====
function updateLastUpdateBadge() {
  const badge = document.getElementById("lastUpdateBadge");
  if (badge) {
    badge.textContent = `Cập nhật: ${new Date().toLocaleString("vi-VN")}`;
  }
}

// Thêm hàm để lấy ngày hiện tại theo định dạng YYYY-MM-DD
function getCurrentDate() {
  const today = new Date();
  return formatDateForInput(today);
}

function formatDateForInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Sửa lại hàm createGrid
function createGrid() {
  const grid = document.getElementById("animalGrid");

  for (let i = 0; i < 36; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";

    // Thêm hình ảnh
    const img = document.createElement("img");
    img.src = `./images/item${i + 1}.jpg`;
    img.alt = animals[i].type;
    img.crossOrigin = "anonymous";

    // Thêm tên và số thứ tự
    const name = document.createElement("div");
    name.className = "item-name";
    name.innerHTML = `${i + 1}. ${
      animals[i].name
    }<br><span class="item-type">(${animals[i].id}) ${animals[i].type}</span>`;

    // Thêm tổng tiền của ô
    const itemTotal = document.createElement("div");
    itemTotal.className = "item-total";
    itemTotal.textContent = "Tổng: 0 đ";

    // Thêm nút xem lịch sử
    const historyBtn = document.createElement("button");
    historyBtn.className = "history-btn";
    historyBtn.innerHTML = '<i class="fas fa-history"></i> Lịch sử';

    // Thêm div hiển thị lịch sử
    const history = document.createElement("div");
    history.className = "history";
    history.style.display = "none";

    // Xử lý nút xem lịch sử
    historyBtn.addEventListener("click", () => {
      history.style.display =
        history.style.display === "none" ? "block" : "none";
      historyBtn.innerHTML =
        history.style.display === "none"
          ? '<i class="fas fa-history"></i> Lịch sử'
          : '<i class="fas fa-times"></i> Ẩn';
    });

    // Thêm div hiển thị tổng cột
    const columnTotal = document.createElement("div");
    columnTotal.className = "column-total";
    columnTotal.dataset.column = i % 6;

    // Thêm các phần tử vào ô
    cell.appendChild(img);
    cell.appendChild(name);
    cell.appendChild(itemTotal);
    cell.appendChild(historyBtn);
    cell.appendChild(history);
    cell.appendChild(columnTotal);
    grid.appendChild(cell);
  }
}

// Hàm cập nhật hiển thị lịch sử
function updateHistory(historyDiv, cellHistory) {
  const historyHTML = cellHistory
    .map(
      (record) =>
        `<div class="history-item">
          <span class="history-time">
            ${escapeHtml(record.time || "")}
            ${
              record.session
                ? `<span class="history-session">(${escapeHtml(record.session)})</span>`
                : ""
            }
          </span>
          <span class="history-amount positive">
            +${record.amount.toLocaleString("vi-VN")} đ
          </span>
        </div>`
    )
    .join("");
  historyDiv.innerHTML = historyHTML;
}

// Cập nhật hàm tính tổng theo cột
function calculateColumnTotal(columnIndex) {
  const cells = document.querySelectorAll(".cell");
  let total = 0;

  for (let i = columnIndex; i < cells.length; i += 6) {
    const itemTotal = cells[i].querySelector(".item-total");
    total += parseInt(itemTotal.dataset.total || 0);
  }

  const columnTotals = document.querySelectorAll(
    `.column-total[data-column="${columnIndex}"]`
  );
  columnTotals.forEach((el) => {
    el.textContent = `Tổng cột: ${total.toLocaleString("vi-VN")} đ`;
  });

  return total;
}

// Cập nhật hàm tính tổng tất cả
function calculateTotal() {
  const itemTotals = document.querySelectorAll(".item-total");
  let total = 0;

  itemTotals.forEach((itemTotal) => {
    total += parseInt(itemTotal.dataset.total || 0);
  });

  document.getElementById(
    "totalAmount"
  ).textContent = `Tổng: ${total.toLocaleString("vi-VN")} đ`;
}

function rebuildGridFromLedgerData() {
  for (let index = 0; index < cellHistory.length; index++) {
    cellHistory[index] = [];
  }

  getVisibleEntries().forEach((entry) => {
    (entry.entries || []).forEach((item) => {
      const index = animalNameToIndex[item.animal];
      if (index === undefined) return;
      cellHistory[index].push({
        entryId: entry.id,
        time: entry.createdAt
          ? new Date(entry.createdAt).toLocaleString("vi-VN")
          : entry.date,
        session: entry.session,
        amount: Number(item.amount) || 0,
        person: entry.person || "",
        seller: entry.seller || "",
      });
    });
  });

  document.querySelectorAll(".cell").forEach((cell, index) => {
    const history = cellHistory[index];
    const total = history.reduce((sum, record) => sum + record.amount, 0);
    const itemTotal = cell.querySelector(".item-total");
    itemTotal.dataset.total = total;
    itemTotal.textContent = `Tổng: ${total.toLocaleString("vi-VN")} đ`;
    updateHistory(cell.querySelector(".history"), history);
  });

  for (let column = 0; column < 6; column++) calculateColumnTotal(column);
  calculateTotal();
}

function refreshActiveView(route = getCurrentRoute()) {
  switch (route) {
    case "home":
      updateHomeDashboard();
      break;
    case "ledger-entry":
      rebuildGridFromLedgerData();
      break;
    case "ledger-history":
      updateSellerFilter();
      renderLedgerEntries();
      updateSellerSummary();
      break;
    case "payout-lookup":
      updateWinSellerFilter();
      syncPayoutLookupForActiveView();
      break;
    case "payout-history":
      renderPayoutHistory();
      break;
    case "finance-overview":
    case "finance-debt":
    case "finance-source":
      updateFinanceDashboard(route);
      break;
    case "data-imported":
      renderImportedEntries();
      break;
    case "data-export":
      updateExportSummaryPreview();
      updateExportSessionButton();
      break;
    case "tools-backup":
    case "tools-data":
      updateStorageUsage();
      break;
    default:
      break;
  }
}

// Giữ tên cũ để các luồng thao tác hiện tại chỉ làm mới màn hình đang mở.
function refreshAllViews() {
  refreshActiveView();
}

// Cập nhật hàm processLedgerEntry để lấy giá trị radio button
function processLedgerEntry() {
  const date = document.getElementById("ledgerDate").value;
  const session = document.querySelector('input[name="session"]:checked').value;
  const person = document.getElementById("ledgerPerson").value;
  const seller =
    document.getElementById("ledgerSeller").value.trim() ||
    localProfile.name ||
    "";
  const content = document.getElementById("ledgerContent").value;
  const paymentType =
    document.querySelector('input[name="paymentType"]:checked')?.value || "";

  if (!date || !person || !content || !paymentType) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  // Xử lý nội dung và cập nhật các ô
  const parsed = parseContentDetailed(content);
  const entries = parsed.entries;
  if (entries.length === 0) {
    showNotification("Không tìm thấy con vật hoặc số tiền hợp lệ!", "error");
    return;
  }
  if (parsed.errors.length > 0) {
    showNotification("Còn nội dung chưa nhận dạng. Vui lòng kiểm tra lại!", "error");
    renderParsePreview(entries, parsed.errors);
    return;
  }

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

  // Thêm vào dữ liệu ghi sổ
  const entryRecord = {
    id: createUuid(),
    date,
    session,
    person,
    seller,
    content,
    total,
    entries: entries.map((e) => ({ ...e })),
    paymentType,
    entryType: "direct",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  applySellerIdentity(entryRecord, seller);
  ledgerData.unshift(entryRecord);
  markDataChanged();
  pushUndo({ type: "add_entry", entryId: entryRecord.id });

  // Lưu tên người ghi + người bán gần nhất
  addRecentPerson(person);
  addRecentSeller(seller);

  activeViewDate = date;
  activeViewDateFrom = date;
  activeViewDateTo = date;
  activeViewSession = session;
  syncViewControls();

  // Reset form
  document.getElementById("ledgerContent").value = "";
  document.getElementById("ledgerTotal").textContent = "0 đ";
  renderParsePreview([]);

  // Lưu + badge
  refreshAllViews();
  saveDataToLocalStorage();
  updateLastUpdateBadge();

  showNotification("Đã ghi sổ thành công!");
}

// Hàm phân tích nội dung ghi sổ.
// Hỗ trợ cả:
//   "lân 50 chó 50"
//   "lân 50, chó 50"
//   "kỳ lân 50k; chó 50.000"
function parseContentDetailed(content) {
  const entries = [];
  const errors = [];
  const normalizedContent = (content || "").toLowerCase();
  const moneyPattern = /[\+\-]?\s*\d+(?:(?:[\.,]\d+)+)?[km]?/gi;
  let segmentStart = 0;
  let moneyMatch;

  while ((moneyMatch = moneyPattern.exec(normalizedContent)) !== null) {
    const amount = parseMoney(moneyMatch[0], true);
    const animalPart = normalizedContent
      .slice(segmentStart, moneyMatch.index)
      .replace(/^[\s,;|]+|[\s,;|]+$/g, "")
      .trim();
    const animalPartNoDiacritics = removeVietnameseDiacritics(animalPart);

    let matched = false;
    if (amount > 0 && animalPart) {
      // Match alias dài nhất trước để ưu tiên "rồng bay" hơn "bay".
      for (const [animal] of sortedAnimalEntries) {
        if (
          animalPart.includes(animal) ||
          animalPartNoDiacritics.includes(animal)
        ) {
          entries.push({ animal, amount });
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      const fragment = `${animalPart} ${moneyMatch[0]}`.trim();
      errors.push(fragment || moneyMatch[0].trim());
    }

    segmentStart = moneyPattern.lastIndex;
  }

  const trailing = normalizedContent
    .slice(segmentStart)
    .replace(/[\s,;|]+/g, " ")
    .trim();
  if (trailing) errors.push(trailing);

  return { entries, errors };
}

function parseContent(content) {
  return parseContentDetailed(content).entries;
}

function getAnimalNoteName(animalKey) {
  const index = animalNameToIndex[animalKey];
  if (index === undefined) return animalKey;
  return animals[index].type
    .toLowerCase()
    .replace(/^(con |cá |hòn |kỳ )/, "");
}

function formatAmountForNote(amount) {
  if (amount % 1000 === 0) return String(amount / 1000);
  return amount.toLocaleString("vi-VN");
}

function renderParsePreview(entries, errors = []) {
  const preview = document.getElementById("parsePreview");
  if (!preview) return;
  if (entries.length === 0 && errors.length === 0) {
    preview.innerHTML =
      '<div class="parse-preview-empty">Nhập nội dung để xem kết quả nhận dạng</div>';
    return;
  }

  const validRows = entries
    .map(
      (entry) => `
        <div class="parse-preview-row">
          <span class="parse-preview-name"><i class="fas fa-check-circle"></i>${escapeHtml(getAnimalNoteName(entry.animal))}</span>
          <span class="parse-preview-amount">${entry.amount.toLocaleString("vi-VN")} đ</span>
        </div>`
    )
    .join("");
  const errorRows = errors
    .map(
      (error) => `
        <div class="parse-preview-row">
          <span class="parse-preview-name" style="color:var(--primary)"><i class="fas fa-triangle-exclamation" style="color:var(--primary)"></i>Không hiểu: ${escapeHtml(error)}</span>
        </div>`
    )
    .join("");
  preview.innerHTML = validRows + errorRows;
}

// ===== RENDER LEDGER ENTRIES TỪ DỮ LIỆU CÓ CẤU TRÚC =====

// Xuất nội dung entry thành từng dòng ngắn gọn như nội dung ghi chú.
function formatEntryAsText(entry) {
  if (!entry.entries || entry.entries.length === 0) {
    return entry.content || '';
  }
  return entry.entries.map((e) => {
    return `${getAnimalNoteName(e.animal)} ${formatAmountForNote(e.amount)}`;
  }).join('\n');
}

function formatEntryLinesHtml(entry) {
  if (!entry.entries || entry.entries.length === 0) {
    return `<div>${escapeHtml(entry.content || "")}</div>`;
  }
  return `
    <div class="ledger-content-chips">
      ${entry.entries
        .map(
          (item) => `
            <span class="ledger-item-chip">
              <span>${escapeHtml(getAnimalNoteName(item.animal))}</span>
              <strong>${escapeHtml(formatAmountForNote(item.amount))}</strong>
            </span>`
        )
        .join("")}
    </div>`;
}

function getPaymentMeta(paymentType) {
  const map = {
    cash: { label: "Tiền mặt", icon: "fa-money-bill-wave" },
    bank_transfer: { label: "Chuyển khoản", icon: "fa-building-columns" },
    debt: { label: "Nợ", icon: "fa-clock" },
    unknown: { label: "Chưa xác định", icon: "fa-circle-question" },
  };
  return map[paymentType] || map.unknown;
}

async function copyEntryText(entryId) {
  const entry = findEntryById(entryId);
  if (!entry) return;
  const text = formatEntryAsText(entry);
  try {
    await navigator.clipboard.writeText(text);
    showNotification('Đã sao chép nội dung phiếu!');
  } catch {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showNotification('Đã sao chép nội dung phiếu!');
  }
}

function getPagedRows(rows, pageState, key) {
  if (pageState.key !== key) {
    pageState.key = key;
    pageState.page = 1;
  }
  const pageCount = Math.max(1, Math.ceil(rows.length / LIST_PAGE_SIZE));
  pageState.page = Math.min(Math.max(1, pageState.page), pageCount);
  const start = (pageState.page - 1) * LIST_PAGE_SIZE;
  return {
    rows: rows.slice(start, start + LIST_PAGE_SIZE),
    page: pageState.page,
    pageCount,
    total: rows.length,
  };
}

function renderPaginationControls(type, page, pageCount, total) {
  if (total <= LIST_PAGE_SIZE) {
    return `<div class="list-pagination list-pagination-summary"><span>${total.toLocaleString(
      "vi-VN"
    )} phiếu</span></div>`;
  }
  const handler =
    type === "ledger" ? "changeLedgerHistoryPage" : "changeDebtListPage";
  return `
    <div class="list-pagination">
      <button type="button" onclick="${handler}(${page - 1})" ${
        page <= 1 ? "disabled" : ""
      }><i class="fas fa-chevron-left"></i> Trước</button>
      <span>Trang <strong>${page}</strong> / ${pageCount} · ${total.toLocaleString(
        "vi-VN"
      )} phiếu</span>
      <button type="button" onclick="${handler}(${page + 1})" ${
        page >= pageCount ? "disabled" : ""
      }>Sau <i class="fas fa-chevron-right"></i></button>
    </div>`;
}

function changeLedgerHistoryPage(page) {
  ledgerHistoryPageState.page = page;
  renderLedgerEntries();
}

function changeDebtListPage(page) {
  debtListPageState.page = page;
  updateFinanceDashboard("finance-debt");
}

function renderLedgerEntries() {
  const container = document.getElementById("ledgerEntries");
  const filterSeller = document.getElementById("sellerFilter")?.value || "";

  // Lọc theo người bán nếu có
  const visibleEntries = getVisibleEntries();
  const filtered = filterSeller
    ? visibleEntries.filter((e) => e.seller === filterSeller)
    : visibleEntries;

  if (filtered.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-light);padding:20px;">Chưa có dữ liệu ghi sổ</div>';
    container.style.maxHeight = "none";
    return;
  }

  const pageKey = [
    dataRevision,
    activeViewDateFrom,
    activeViewDateTo,
    activeViewSession || "all",
    filterSeller,
  ].join("|");
  const paged = getPagedRows(filtered, ledgerHistoryPageState, pageKey);
  container.innerHTML =
    renderPaginationControls(
      "ledger",
      paged.page,
      paged.pageCount,
      paged.total
    ) +
    paged.rows.map((entry) => {
    const sessionIcon = entry.session === "Sáng" ? "fa-sun" : "fa-moon";
    const sellerBadge = entry.seller
      ? `<span class="ledger-entry-seller"><i class="fas fa-store"></i> ${escapeHtml(entry.seller)}</span>`
      : '';
    const isImported = !isDirectEntry(entry);
    const sourceBadge = isImported
      ? `<span class="ledger-entry-source"><i class="fas fa-sitemap"></i> ${escapeHtml(entry.sourceProfileName || entry.person || "Cấp dưới")}</span>`
      : "";
    const personBadge = isImported
      ? ""
      : `<span class="ledger-entry-person">${escapeHtml(entry.person || "")}</span>`;
    const payment = getPaymentMeta(entry.paymentType);
    const paymentBadge = isImported
      ? ""
      : `<span class="payment-badge payment-badge-${escapeHtml(entry.paymentType || "unknown")}"><i class="fas ${payment.icon}"></i> ${payment.label}</span>`;
    const safeId = escapeHtml(String(entry.id));
    const editButton = isImported
      ? ""
      : `<button class="btn-entry-action btn-edit" onclick="openEditModal('${safeId}')" title="Sửa">
           <i class="fas fa-pen"></i>
         </button>`;
    return `
      <div class="ledger-entry" data-id="${entry.id}">
        <div class="ledger-entry-header">
          <span class="ledger-entry-date">${escapeHtml(entry.date)}</span>
          <span class="ledger-entry-session">
            <i class="fas ${sessionIcon}"></i>
            ${escapeHtml(entry.session)}
          </span>
          ${personBadge}
          ${sellerBadge}
          ${sourceBadge}
          ${paymentBadge}
          <span class="entry-actions">
            <button class="btn-entry-action btn-copy" onclick="copyEntryText('${safeId}')" title="Sao chép nội dung">
              <i class="fas fa-copy"></i>
            </button>
            ${editButton}
            <button class="btn-entry-action btn-delete" onclick="deleteLedgerEntry('${safeId}')" title="Xóa">
              <i class="fas fa-trash"></i>
            </button>
          </span>
        </div>
        <div class="ledger-entry-content">${formatEntryLinesHtml(entry)}</div>
        <div class="ledger-entry-total">Tổng cộng: ${entry.total.toLocaleString("vi-VN")} đ</div>
      </div>
    `;
    }).join("");
  scheduleLedgerHistoryHeight();
}

function scheduleLedgerHistoryHeight() {
  window.requestAnimationFrame(() => {
    const container = document.getElementById("ledgerEntries");
    if (!container || container.offsetParent === null) return;
    const entries = Array.from(container.querySelectorAll(".ledger-entry"));
    if (entries.length <= 4) {
      container.style.maxHeight = "none";
      container.classList.remove("history-scroll-active");
      return;
    }

    const styles = getComputedStyle(container);
    const padding =
      (parseFloat(styles.paddingTop) || 0) +
      (parseFloat(styles.paddingBottom) || 0);
    const pagination = container.querySelector(".list-pagination");
    const paginationHeight = pagination
      ? pagination.offsetHeight +
        (parseFloat(getComputedStyle(pagination).marginBottom) || 0)
      : 0;
    const fourEntriesHeight = entries.slice(0, 4).reduce((height, entry) => {
      const entryStyles = getComputedStyle(entry);
      return (
        height +
        entry.offsetHeight +
        (parseFloat(entryStyles.marginBottom) || 0)
      );
    }, 0);
    container.style.maxHeight = `${Math.ceil(
      padding + paginationHeight + fourEntriesHeight
    )}px`;
    container.classList.add("history-scroll-active");
  });
}

// ===== EDIT MODAL =====
function hasPaidPayoutForEntry(entryId) {
  return Object.values(payoutStates).some(
    (state) =>
      state.paid &&
      String(state.snapshot?.entryId || "") === String(entryId)
  );
}

function openEditModal(entryId) {
  const entry = findEntryById(entryId);
  if (!entry) return;
  if (hasPaidPayoutForEntry(entryId)) {
    showNotification(
      "Phiếu đã được chung thưởng. Hãy bỏ trạng thái đã chung trước khi sửa!",
      "error"
    );
    return;
  }
  if (!isDirectEntry(entry)) {
    showNotification("Phiếu cấp dưới chỉ được cập nhật bằng cách import lại!", "error");
    return;
  }

  document.getElementById("editEntryId").value = entryId;
  document.getElementById("editDate").value = entry.date;
  document.getElementById("editPerson").value = entry.person;
  document.getElementById("editSeller").value = entry.seller || "";
  document.getElementById("editContent").value = entry.content;
  document.getElementById("editPaymentType").value = entry.paymentType || "unknown";

  // Set session radio
  const sessionRadios = document.querySelectorAll('input[name="editSession"]');
  sessionRadios.forEach((r) => {
    r.checked = r.value === entry.session;
  });

  document.getElementById("editModal").classList.add("show");
}

function closeEditModal() {
  document.getElementById("editModal").classList.remove("show");
}

function saveEditedEntry() {
  const entryId = document.getElementById("editEntryId").value;
  const entry = findEntryById(entryId);
  if (!entry) return;

  const newDate = document.getElementById("editDate").value;
  const newSession = document.querySelector('input[name="editSession"]:checked').value;
  const newPerson = document.getElementById("editPerson").value;
  const newSeller = document.getElementById("editSeller").value;
  const newContent = document.getElementById("editContent").value;
  const newPaymentType = document.getElementById("editPaymentType").value;

  if (!newDate || !newPerson || !newContent) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  const parsed = parseContentDetailed(newContent);
  const newEntries = parsed.entries;
  if (newEntries.length === 0) {
    showNotification("Không tìm thấy con vật hoặc số tiền hợp lệ!", "error");
    return;
  }
  if (parsed.errors.length > 0) {
    showNotification("Nội dung sửa còn phần chưa nhận dạng!", "error");
    return;
  }

  const newTotal = newEntries.reduce((sum, e) => sum + e.amount, 0);
  const debtPaidAmount = getDebtPaidAmount(entry.id);
  if (debtPaidAmount > 0 && newPaymentType !== "debt") {
    showNotification(
      "Phiếu đã có giao dịch thu nợ nên không thể đổi sang hình thức khác!",
      "error"
    );
    return;
  }
  if (debtPaidAmount > newTotal) {
    showNotification(
      "Tổng phiếu mới không thể nhỏ hơn số tiền khách đã trả!",
      "error"
    );
    return;
  }

  pushUndo({ type: "edit_entry", entry: JSON.parse(JSON.stringify(entry)) });

  entry.date = newDate;
  entry.session = newSession;
  entry.person = newPerson;
  applySellerIdentity(entry, newSeller);
  entry.content = newContent;
  entry.total = newTotal;
  entry.entries = newEntries;
  entry.paymentType = newPaymentType;
  entry.updatedAt = new Date().toISOString();

  markDataChanged();
  refreshAllViews();
  saveDataToLocalStorage();
  closeEditModal();
  showNotification("Đã cập nhật ghi sổ!");
}

// ===== DELETE ENTRY =====
function deleteLedgerEntry(entryId) {
  if (hasPaidPayoutForEntry(entryId)) {
    showNotification(
      "Phiếu đã được chung thưởng. Hãy bỏ trạng thái đã chung trước khi xóa!",
      "error"
    );
    return;
  }
  if (
    debtPayments.some(
      (payment) => String(payment.entryId) === String(entryId)
    )
  ) {
    showNotification(
      "Phiếu đã có lịch sử thu nợ nên không thể xóa!",
      "error"
    );
    return;
  }
  if (!confirm("Bạn có chắc muốn xóa mục ghi sổ này?")) return;

  const entryIndex = ledgerData.findIndex((e) => String(e.id) === String(entryId));
  if (entryIndex === -1) return;

  const entry = ledgerData[entryIndex];

  pushUndo({
    type: "restore_entry",
    entry: JSON.parse(JSON.stringify(entry)),
    index: entryIndex,
  });
  ledgerData.splice(entryIndex, 1);

  markDataChanged();
  refreshAllViews();
  saveDataToLocalStorage();
  showNotification("Đã xóa mục ghi sổ!");
}

// ===== SELLER FILTER =====
function filterBySeller() {
  renderLedgerEntries();
}

function updateSellerFilter() {
  const select = document.getElementById("sellerFilter");
  if (!select) return;
  const currentVal = select.value;

  // Lấy danh sách sellers duy nhất
  const sellers = [
    ...new Set(
      getVisibleEntries()
        .filter(isDirectEntry)
        .map((e) => e.seller)
        .filter(Boolean)
    ),
  ];
  sellers.sort();

  select.innerHTML = '<option value="">-- Tất cả --</option>' +
    sellers.map((s) => `<option value="${escapeHtml(s)}" ${s === currentVal ? 'selected' : ''}>${escapeHtml(s)}</option>`).join("");
}

// ===== SELLER SUMMARY =====
function updateSellerSummary() {
  const card = document.getElementById("sellerSummaryCard");
  const body = document.getElementById("sellerSummaryBody");
  if (!card || !body) return;

  // Group by seller
  const sellerTotals = {};
  getVisibleEntries().filter(isDirectEntry).forEach((entry) => {
    const seller = entry.seller || "(Không rõ)";
    if (!sellerTotals[seller]) sellerTotals[seller] = 0;
    sellerTotals[seller] += entry.total;
  });

  const sellers = Object.entries(sellerTotals).sort((a, b) => b[1] - a[1]);

  if (sellers.length === 0) {
    card.style.display = "none";
    return;
  }

  card.style.display = "block";
  const grandTotal = sellers.reduce((sum, [, total]) => sum + total, 0);

  body.innerHTML = `
    <div class="seller-summary-scroll">
      <table class="seller-summary-table">
        <thead>
          <tr><th>Người bán</th><th>Tổng tiền</th><th>Tỷ lệ</th></tr>
        </thead>
        <tbody>
          ${sellers.map(([seller, total]) => `
            <tr>
              <td><i class="fas fa-store"></i> ${escapeHtml(seller)}</td>
              <td class="seller-total-amount">${total.toLocaleString("vi-VN")} đ</td>
              <td>${grandTotal > 0 ? Math.round(total / grandTotal * 100) : 0}%</td>
            </tr>
          `).join("")}
        </tbody>
        <tfoot>
          <tr>
            <td><strong>Tổng cộng</strong></td>
            <td class="seller-total-amount"><strong>${grandTotal.toLocaleString("vi-VN")} đ</strong></td>
            <td><strong>100%</strong></td>
          </tr>
        </tfoot>
      </table>
    </div>
  `;
}

// ===== TRA CỨU CON XỔ =====
function updateWinSellerFilter() {
  const select = document.getElementById('winSeller');
  if (!select) return;
  const currentVal = select.value;
  const sellers = [
    ...new Set(
      getVisibleEntries()
        .map((entry) =>
          isDirectEntry(entry)
            ? entry.seller
            : entry.sourceProfileName || entry.person
        )
        .filter(Boolean)
    ),
  ];
  sellers.sort();
  select.innerHTML = '<option value="">-- Tất cả --</option>' +
    sellers.map((s) => `<option value="${escapeHtml(s)}" ${s === currentVal ? 'selected' : ''}>${escapeHtml(s)}</option>`).join('');
}

function legacyPopulateWinAnimalSelect() {
  const sel = document.getElementById('winAnimal');
  if (!sel) return;
  sel.innerHTML = '<option value="">-- Chọn con --</option>';
  animals.forEach((a, idx) => {
    const opt = document.createElement('option');
    opt.value = idx;
    opt.textContent = `${a.id} - ${a.name} (${a.type})`;
    sel.appendChild(opt);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function legacyFilterWinningEntries() {
  const session = document.getElementById('winSession')?.value || '';
  const animalIndexStr = document.getElementById('winAnimal')?.value;
  const card = document.getElementById('winResultCard');
  const body = document.getElementById('winResultBody');
  const titleEl = document.getElementById('winResultTitle');
  if (!card || !body) return;

  body.innerHTML = '';
  card.style.display = 'none';

  if (animalIndexStr === '' || animalIndexStr == null) {
    showNotification('Vui lòng chọn con đã xổ!', 'error');
    return;
  }

  const animalIdx = Number(animalIndexStr);
  const a = animals[animalIdx];
  const seller = document.getElementById('winSeller')?.value || '';
  const sessionLabel = session || 'Cả ngày';
  const sellerLabel = seller || 'Tất cả';
  const dateLabel =
    activeViewDateFrom === activeViewDateTo
      ? activeViewDateFrom
      : `${activeViewDateFrom} đến ${activeViewDateTo}`;
  titleEl.textContent = `Phiếu chứa: ${a.type} (${a.name}) — ${dateLabel} — ${sessionLabel} — NB: ${sellerLabel}`;

  // Tìm tất cả phiếu có chứa con này
  const matches = [];

  ledgerData.forEach((entry) => {
    if (entry.date < activeViewDateFrom || entry.date > activeViewDateTo) return;
    // Lọc buổi nếu có chọn
    if (session && entry.session !== session) return;
    // Lọc người bán nếu có chọn
    if (seller && entry.seller !== seller) return;

    // Kiểm tra entries có chứa con xổ không
    const hitItems = (entry.entries || []).filter((e) => {
      const idx = animalNameToIndex[e.animal];
      return idx === animalIdx;
    });

    if (hitItems.length > 0) {
      const hitSum = hitItems.reduce((s, it) => s + (it.amount || 0), 0);
      matches.push({ entry, hitItems, hitSum });
    }
  });

  if (matches.length === 0) {
    body.innerHTML = `<div class="win-empty">
      <i class="fas fa-search"></i>
      <p>Không có phiếu nào chứa <strong>${a.type}</strong>${session ? ' buổi <strong>' + session + '</strong>' : ''}.</p>
    </div>`;
    card.style.display = 'block';
    return;
  }

  const totalHit = matches.reduce((s, m) => s + m.hitSum, 0);
  const totalPayout = totalHit * 28;
  const totalEntries = matches.length;
  const paidCount = matches.filter((m) => paidEntries[m.entry.id]).length;
  const paidSum = matches.filter((m) => paidEntries[m.entry.id]).reduce((s, m) => s + m.hitSum, 0);
  const paidPayout = paidSum * 28;
  const unpaidSum = totalHit - paidSum;
  const unpaidPayout = unpaidSum * 28;

  // Summary
  const summary = document.createElement('div');
  summary.className = 'win-summary';
  summary.innerHTML = `
    <div class="win-summary-grid">
      <div class="win-stat">
        <div class="win-stat-label"><i class="fas fa-receipt"></i> Số phiếu</div>
        <div class="win-stat-value">${totalEntries}</div>
      </div>
      <div class="win-stat">
        <div class="win-stat-label"><i class="fas fa-coins"></i> Tổng tiền đánh ${a.type}</div>
        <div class="win-stat-value win-stat-money">${totalHit.toLocaleString('vi-VN')} đ</div>
      </div>
      <div class="win-stat win-stat-payout">
        <div class="win-stat-label"><i class="fas fa-hand-holding-dollar"></i> Tiền chung (×28)</div>
        <div class="win-stat-value win-stat-payout-value">${totalPayout.toLocaleString('vi-VN')} đ</div>
      </div>
    </div>
    <div id="winPaidSummary" class="win-paid-summary">
      <div class="win-paid-stat win-paid-done">
        <i class="fas fa-check-circle"></i>
        <span>Đã chung: <strong>${paidCount}</strong> phiếu — <strong>${paidPayout.toLocaleString('vi-VN')} đ</strong></span>
      </div>
      <div class="win-paid-stat win-paid-pending">
        <i class="far fa-circle"></i>
        <span>Chưa chung: <strong>${totalEntries - paidCount}</strong> phiếu — <strong>${unpaidPayout.toLocaleString('vi-VN')} đ</strong></span>
      </div>
    </div>
  `;
  body.appendChild(summary);

  // List
  const list = document.createElement('div');
  list.className = 'win-list';

  matches.forEach((m) => {
    const sessionIcon = m.entry.session === 'Sáng' ? 'fa-sun' : 'fa-moon';
    const sellerHtml = m.entry.seller
      ? `<span class="ledger-entry-seller"><i class="fas fa-store"></i> ${escapeHtml(m.entry.seller)}</span>`
      : '';

    // Highlight con xổ trong nội dung
    let contentHighlighted = escapeHtml(m.entry.content);
    // Highlight animal type in content (case insensitive)
    const typeRegex = new RegExp('(' + a.type.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
    contentHighlighted = contentHighlighted.replace(typeRegex, '<mark class="win-highlight">$1</mark>');
    // Also try short form
    const shortType = a.type.toLowerCase().replace(/^(con |cá |hòn |rồng )/, '');
    if (shortType !== a.type.toLowerCase()) {
      const shortRegex = new RegExp('(' + shortType.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      contentHighlighted = contentHighlighted.replace(shortRegex, '<mark class="win-highlight">$1</mark>');
    }

    const isPaid = !!paidEntries[m.entry.id];
    const payoutAmount = m.hitSum * 28;
    const div = document.createElement('div');
    div.className = 'win-item' + (isPaid ? ' win-item-paid' : '');
    div.dataset.entryId = m.entry.id;
    div.dataset.hitSum = m.hitSum;
    div.innerHTML = `
      <div class="win-item-header">
        <div class="win-item-meta">
          <span class="ledger-entry-date">${m.entry.date}</span>
          <span class="ledger-entry-session"><i class="fas ${sessionIcon}"></i> ${m.entry.session}</span>
          <span class="ledger-entry-person">${escapeHtml(m.entry.person)}</span>
          ${sellerHtml}
        </div>
        <div class="win-item-amounts">
          <div class="win-item-amount">+${m.hitSum.toLocaleString('vi-VN')} đ</div>
          <div class="win-item-payout">×28 = ${payoutAmount.toLocaleString('vi-VN')} đ</div>
        </div>
      </div>
      <div class="win-item-content">${contentHighlighted}</div>
      <div class="win-item-footer">
        <button class="win-paid-btn${isPaid ? ' is-paid' : ''}" onclick="togglePaidStatus('${escapeHtml(String(m.entry.id))}')">
          <i class="${isPaid ? 'fas fa-check-circle' : 'far fa-circle'}"></i> ${isPaid ? 'Đã chung' : 'Chưa chung'}
        </button>
        <button class="win-copy-btn" onclick="copyEntryText('${escapeHtml(String(m.entry.id))}')" title="Sao chép nội dung phiếu">
          <i class="fas fa-copy"></i> Copy
        </button>
        <span class="win-item-total-label">Tổng phiếu:</span>
        <span class="win-item-total-value">${m.entry.total.toLocaleString('vi-VN')} đ</span>
      </div>
    `;
    list.appendChild(div);
  });

  body.appendChild(list);
  card.style.display = 'block';

  showNotification(`Tìm thấy ${totalEntries} phiếu chứa ${a.type}!`);
}

function legacyTogglePaidStatus(entryId) {
  if (paidEntries[entryId]) {
    delete paidEntries[entryId];
  } else {
    paidEntries[entryId] = true;
  }
  saveDataToLocalStorage();

  // Cập nhật UI cho item
  const itemEl = document.querySelector(`.win-item[data-entry-id="${entryId}"]`);
  if (itemEl) {
    itemEl.classList.toggle('win-item-paid', !!paidEntries[entryId]);
    const btn = itemEl.querySelector('.win-paid-btn');
    if (btn) {
      const isPaid = !!paidEntries[entryId];
      btn.classList.toggle('is-paid', isPaid);
      btn.innerHTML = isPaid
        ? '<i class="fas fa-check-circle"></i> Đã chung'
        : '<i class="far fa-circle"></i> Chưa chung';
    }
  }

  // Cập nhật summary
  updateWinPaidSummary();
}

function legacyUpdateWinPaidSummary() {
  const summaryEl = document.getElementById('winPaidSummary');
  if (!summaryEl) return;

  const items = document.querySelectorAll('.win-item[data-entry-id]');
  let paidCount = 0, unpaidCount = 0, paidSum = 0, unpaidSum = 0;

  items.forEach((item) => {
    const id = item.dataset.entryId;
    const amount = Number(item.dataset.hitSum) || 0;
    if (paidEntries[id]) {
      paidCount++;
      paidSum += amount;
    } else {
      unpaidCount++;
      unpaidSum += amount;
    }
  });

  summaryEl.innerHTML = `
    <div class="win-paid-stat win-paid-done">
      <i class="fas fa-check-circle"></i>
      <span>Đã chung: <strong>${paidCount}</strong> phiếu — <strong>${(paidSum * 28).toLocaleString('vi-VN')} đ</strong></span>
    </div>
    <div class="win-paid-stat win-paid-pending">
      <i class="far fa-circle"></i>
      <span>Chưa chung: <strong>${unpaidCount}</strong> phiếu — <strong>${(unpaidSum * 28).toLocaleString('vi-VN')} đ</strong></span>
    </div>
  `;
}

// ===== QUẢN LÝ KẾT QUẢ XỔ VÀ CHUNG THƯỞNG =====
function getAnimalSearchLabel(index) {
  const animal = animals[index];
  return animal ? `${animal.id} - ${animal.name} (${animal.type})` : "";
}

function populateWinAnimalSelect() {
  const suggestions = document.getElementById("winAnimalSuggestions");
  if (suggestions) {
    suggestions.innerHTML = animals
      .map(
        (_, index) =>
          `<option value="${escapeHtml(getAnimalSearchLabel(index))}"></option>`
      )
      .join("");
  }
}

function resolveAnimalSearch(value) {
  const normalized = removeVietnameseDiacritics(String(value || ""))
    .toLowerCase()
    .trim();
  if (!normalized) return -1;

  const exactLabelIndex = animals.findIndex(
    (_, index) =>
      removeVietnameseDiacritics(getAnimalSearchLabel(index)).toLowerCase() ===
      normalized
  );
  if (exactLabelIndex !== -1) return exactLabelIndex;

  const idMatch = animals.findIndex((animal) => animal.id === normalized);
  if (idMatch !== -1) return idMatch;

  const aliasIndex = animalNameToIndex[normalized];
  if (aliasIndex !== undefined) return aliasIndex;

  const matches = animals
    .map((animal, index) => ({
      index,
      text: removeVietnameseDiacritics(
        `${animal.id} ${animal.name} ${animal.type} ${getAnimalNoteName(
          animal.type.toLowerCase()
        )}`
      ).toLowerCase(),
    }))
    .filter((item) => item.text.includes(normalized));
  return matches.length === 1 ? matches[0].index : -1;
}

function getDrawKey(date, session) {
  return `${date}|${session}`;
}

function getPayoutStateKey(drawKey, entryId) {
  return `${drawKey}|${entryId}`;
}

function getPayoutRecipient(entry) {
  return isDirectEntry(entry)
    ? {
        name: entry.person || "Không rõ",
        type: "Khách trực tiếp",
        source: entry.seller || "",
      }
    : {
        name: entry.sourceProfileName || entry.person || "Cấp dưới",
        type: "Cấp dưới",
        source: entry.sourceProfileName || entry.person || "",
      };
}

function getCurrentDrawContext() {
  const sessionElement = document.getElementById("winSession");
  const session = ["Sáng", "Chiều"].includes(sessionElement?.value)
    ? sessionElement.value
    : ["Sáng", "Chiều"].includes(activeViewSession)
      ? activeViewSession
      : "Sáng";
  if (activeViewDateFrom !== activeViewDateTo) return null;
  return {
    date: activeViewDateFrom,
    session,
    drawKey: getDrawKey(activeViewDateFrom, session),
  };
}

function buildPayoutSnapshot(entry, draw, animalIndex, hitSum, rate) {
  const recipient = getPayoutRecipient(entry);
  const animal = animals[animalIndex];
  return {
    entryId: String(entry.id),
    drawKey: draw.drawKey,
    date: draw.date,
    session: draw.session,
    animalId: animal.id,
    animalName: animal.name,
    animalType: animal.type,
    recipientName: recipient.name,
    recipientType: recipient.type,
    seller: entry.seller || "",
    sourceName: recipient.source,
    hitAmount: hitSum,
    rate,
    payoutAmount: hitSum * rate,
    entryTotal: Number(entry.total) || 0,
    entryContent: entry.content || formatEntryAsText(entry),
  };
}

function ensurePayoutState(draw, entry, animalIndex, hitSum) {
  const key = getPayoutStateKey(draw.drawKey, entry.id);
  const defaultRate = getDefaultPayoutRateForEntry(entry);
  if (!payoutStates[key]) {
    const legacyPaid = Boolean(paidEntries[String(entry.id)]);
    payoutStates[key] = {
      rate: defaultRate,
      rateMode: "default",
      paid: legacyPaid,
      paidAt: legacyPaid
        ? entry.updatedAt || entry.createdAt || new Date().toISOString()
        : null,
      snapshot: legacyPaid
        ? buildPayoutSnapshot(entry, draw, animalIndex, hitSum, defaultRate)
        : null,
    };
    if (legacyPaid) delete paidEntries[String(entry.id)];
  }
  const state = payoutStates[key];
  if (!state.rateMode) state.rateMode = "manual";
  if (state.rateMode === "default" && !state.paid) state.rate = defaultRate;
  if (![27, 28, 29, 30].includes(Number(state.rate))) {
    state.rate = defaultRate;
    state.rateMode = "default";
  }
  return { key, state };
}

function getConfirmedDraw() {
  const draw = getCurrentDrawContext();
  if (!draw) return null;
  const result = drawResults[draw.drawKey];
  if (!result) return null;
  const animalIndex = animals.findIndex(
    (animal) => animal.id === String(result.animalId)
  );
  return animalIndex === -1 ? null : { ...draw, result, animalIndex };
}

function renderWinConfirmation(draw, animalIndex, confirmed) {
  const element = document.getElementById("winConfirmation");
  if (!element) return;
  if (!draw) {
    element.innerHTML =
      '<i class="fas fa-triangle-exclamation"></i><span>Tra cứu trả thưởng chỉ áp dụng cho đúng một ngày.</span>';
    element.className = "win-confirmation warning";
    return;
  }
  if (!confirmed || animalIndex < 0) {
    element.innerHTML = `<i class="far fa-circle"></i><span>Ngày <strong>${formatDateForDisplay(
      draw.date
    )}</strong>, buổi <strong>${
      draw.session
    }</strong> chưa xác nhận con xổ.</span>`;
    element.className = "win-confirmation pending";
    return;
  }
  const animal = animals[animalIndex];
  element.innerHTML = `<i class="fas fa-circle-check"></i><span>Đã xác nhận: <strong>${escapeHtml(
    getAnimalSearchLabel(animalIndex)
  )}</strong> · ${formatDateForDisplay(draw.date)} · ${draw.session}</span>`;
  element.className = "win-confirmation confirmed";
}

function syncPayoutLookupForActiveView() {
  const search = document.getElementById("winAnimalSearch");
  const hidden = document.getElementById("winAnimal");
  const sessionElement = document.getElementById("winSession");
  const resultCard = document.getElementById("winResultCard");
  if (!search || !hidden || !sessionElement) return;

  if (["Sáng", "Chiều"].includes(activeViewSession)) {
    sessionElement.value = activeViewSession;
  } else if (!["Sáng", "Chiều"].includes(sessionElement.value)) {
    sessionElement.value = "Sáng";
  }

  const draw = getCurrentDrawContext();
  const confirmed = draw ? drawResults[draw.drawKey] : null;
  const animalIndex = confirmed
    ? animals.findIndex(
        (animal) => animal.id === String(confirmed.animalId)
      )
    : -1;

  if (animalIndex !== -1) {
    search.value = getAnimalSearchLabel(animalIndex);
    hidden.value = String(animalIndex);
    renderWinConfirmation(draw, animalIndex, true);
    filterWinningEntries(false);
  } else {
    search.value = "";
    hidden.value = "";
    renderWinConfirmation(draw, -1, false);
    if (resultCard) resultCard.style.display = "none";
    updatePayoutStatusCounts([]);
  }
}

function confirmWinningAnimal() {
  const draw = getCurrentDrawContext();
  if (!draw) {
    showNotification("Hãy chọn đúng một ngày để xác nhận con xổ!", "error");
    return;
  }

  const search = document.getElementById("winAnimalSearch");
  const animalIndex = resolveAnimalSearch(search?.value);
  if (animalIndex === -1) {
    showNotification(
      "Không xác định được con xổ. Hãy chọn đúng một gợi ý!",
      "error"
    );
    return;
  }

  const existing = drawResults[draw.drawKey];
  const nextAnimal = animals[animalIndex];
  if (existing && String(existing.animalId) !== nextAnimal.id) {
    const hasPaid = Object.entries(payoutStates).some(
      ([key, state]) => key.startsWith(`${draw.drawKey}|`) && state.paid
    );
    if (hasPaid) {
      showNotification(
        "Kỳ xổ này đã có phiếu được chung. Hãy bỏ đánh dấu đã chung trước khi đổi con xổ!",
        "error"
      );
      return;
    }
    if (
      !confirm(
        `Đổi con xổ ${formatDateForDisplay(draw.date)} ${
          draw.session
        } thành ${getAnimalSearchLabel(animalIndex)}?`
      )
    ) {
      return;
    }
    Object.keys(payoutStates)
      .filter((key) => key.startsWith(`${draw.drawKey}|`))
      .forEach((key) => delete payoutStates[key]);
  }

  drawResults[draw.drawKey] = {
    animalId: nextAnimal.id,
    confirmedAt: existing?.confirmedAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  document.getElementById("winAnimal").value = String(animalIndex);
  search.value = getAnimalSearchLabel(animalIndex);
  saveDataToLocalStorage();
  renderWinConfirmation(draw, animalIndex, true);
  filterWinningEntries(false);
  updateFinanceDashboard();
  showNotification(
    `Đã lưu con xổ buổi ${draw.session.toLowerCase()}: ${nextAnimal.type}!`
  );
}

function getPayoutMatches(confirmedDraw) {
  const seller = document.getElementById("winSeller")?.value || "";
  const matches = [];
  getEntriesForDateSession(confirmedDraw.date, confirmedDraw.session).forEach((entry) => {
    const recipient = getPayoutRecipient(entry);
    const sourceFilter = entry.seller || recipient.name;
    if (seller && sourceFilter !== seller) return;

    const hitItems = (entry.entries || []).filter(
      (item) =>
        animalNameToIndex[item.animal] === confirmedDraw.animalIndex
    );
    if (hitItems.length === 0) return;
    const hitSum = hitItems.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0
    );
    const { key, state } = ensurePayoutState(
      confirmedDraw,
      entry,
      confirmedDraw.animalIndex,
      hitSum
    );
    matches.push({ entry, recipient, hitItems, hitSum, key, state });
  });
  return matches;
}

function updatePayoutStatusCounts(matches) {
  const paid = matches.filter((match) => match.state.paid).length;
  const unpaid = matches.length - paid;
  const allElement = document.getElementById("payoutAllCount");
  const paidElement = document.getElementById("payoutPaidCount");
  const unpaidElement = document.getElementById("payoutUnpaidCount");
  if (allElement) allElement.textContent = matches.length;
  if (paidElement) paidElement.textContent = paid;
  if (unpaidElement) unpaidElement.textContent = unpaid;
}

function setPayoutStatusFilter(status) {
  if (!["all", "paid", "unpaid"].includes(status)) return;
  activePayoutStatus = status;
  document.querySelectorAll("[data-payout-status]").forEach((button) => {
    button.classList.toggle(
      "active",
      button.dataset.payoutStatus === activePayoutStatus
    );
  });
  filterWinningEntries(false);
}

function formatWinningContent(entry, animalIndex) {
  return `
    <div class="ledger-content-chips">
      ${(entry.entries || [])
        .map((item) => {
          const isWinner = animalNameToIndex[item.animal] === animalIndex;
          return `<span class="ledger-item-chip${
            isWinner ? " win-highlight-chip" : ""
          }"><span>${escapeHtml(
            getAnimalNoteName(item.animal)
          )}</span><strong>${escapeHtml(
            formatAmountForNote(item.amount)
          )}</strong></span>`;
        })
        .join("")}
    </div>`;
}

function filterWinningEntries(showToast = true) {
  const confirmedDraw = getConfirmedDraw();
  const card = document.getElementById("winResultCard");
  const body = document.getElementById("winResultBody");
  const title = document.getElementById("winResultTitle");
  if (!card || !body || !title) return;

  if (!confirmedDraw) {
    card.style.display = "none";
    return;
  }

  const animal = animals[confirmedDraw.animalIndex];
  const allMatches = getPayoutMatches(confirmedDraw);
  updatePayoutStatusCounts(allMatches);
  const visibleMatches = allMatches.filter((match) => {
    if (activePayoutStatus === "paid") return match.state.paid;
    if (activePayoutStatus === "unpaid") return !match.state.paid;
    return true;
  });

  const totalHit = allMatches.reduce(
    (sum, match) => sum + match.hitSum,
    0
  );
  const totalPayout = allMatches.reduce(
    (sum, match) => sum + match.hitSum * Number(match.state.rate),
    0
  );
  const paidMatches = allMatches.filter((match) => match.state.paid);
  const paidPayout = paidMatches.reduce(
    (sum, match) => sum + match.hitSum * Number(match.state.rate),
    0
  );
  const unpaidPayout = totalPayout - paidPayout;

  title.textContent = `${getAnimalSearchLabel(
    confirmedDraw.animalIndex
  )} · ${formatDateForDisplay(confirmedDraw.date)} · ${
    confirmedDraw.session
  }`;

  body.innerHTML = `
    <div class="win-summary">
      <div class="win-summary-grid">
        <div class="win-stat"><div class="win-stat-label"><i class="fas fa-receipt"></i> Số phiếu trúng</div><div class="win-stat-value">${
          allMatches.length
        }</div></div>
        <div class="win-stat"><div class="win-stat-label"><i class="fas fa-coins"></i> Tiền đánh ${
          animal.type
        }</div><div class="win-stat-value win-stat-money">${totalHit.toLocaleString(
          "vi-VN"
        )} đ</div></div>
        <div class="win-stat win-stat-payout"><div class="win-stat-label"><i class="fas fa-hand-holding-dollar"></i> Tổng tiền phải chung</div><div class="win-stat-value win-stat-payout-value">${totalPayout.toLocaleString(
          "vi-VN"
        )} đ</div></div>
      </div>
      <div class="win-paid-summary">
        <div class="win-paid-stat win-paid-done"><i class="fas fa-check-circle"></i><span>Đã chung: <strong>${
          paidMatches.length
        }</strong> phiếu — <strong>${paidPayout.toLocaleString(
          "vi-VN"
        )} đ</strong></span></div>
        <div class="win-paid-stat win-paid-pending"><i class="far fa-circle"></i><span>Chưa chung: <strong>${
          allMatches.length - paidMatches.length
        }</strong> phiếu — <strong>${unpaidPayout.toLocaleString(
          "vi-VN"
        )} đ</strong></span></div>
      </div>
    </div>
    <div class="win-list">
      ${
        visibleMatches.length === 0
          ? '<div class="win-empty"><i class="fas fa-search"></i><p>Không có phiếu phù hợp với bộ lọc hiện tại.</p></div>'
          : visibleMatches
              .map((match) => {
                const entry = match.entry;
                const rate = Number(match.state.rate);
                const payout = match.hitSum * rate;
                const sessionIcon =
                  entry.session === "Sáng" ? "fa-sun" : "fa-moon";
                const sourceBadge = isDirectEntry(entry)
                  ? entry.seller
                    ? `<span class="ledger-entry-seller"><i class="fas fa-store"></i> ${escapeHtml(
                        entry.seller
                      )}</span>`
                    : ""
                  : '<span class="ledger-entry-source"><i class="fas fa-sitemap"></i> Cấp dưới</span>';
                return `
                  <article class="win-item${
                    match.state.paid ? " win-item-paid" : ""
                  }" data-entry-id="${escapeHtml(
                    String(entry.id)
                  )}" data-state-key="${escapeHtml(match.key)}">
                    <div class="win-item-header">
                      <div class="win-item-meta">
                        <span class="ledger-entry-date">${escapeHtml(
                          entry.date
                        )}</span>
                        <span class="ledger-entry-session"><i class="fas ${sessionIcon}"></i> ${escapeHtml(
                          entry.session
                        )}</span>
                        <span class="ledger-entry-person">${escapeHtml(
                          match.recipient.name
                        )}</span>
                        ${sourceBadge}
                      </div>
                      <div class="win-item-amounts">
                        <div class="win-item-amount">+${match.hitSum.toLocaleString(
                          "vi-VN"
                        )} đ</div>
                        <div class="win-item-payout">×${rate} = ${payout.toLocaleString(
                          "vi-VN"
                        )} đ</div>
                      </div>
                    </div>
                    <div class="win-item-content">${formatWinningContent(
                      entry,
                      confirmedDraw.animalIndex
                    )}</div>
                    <div class="win-item-footer">
                      <label class="payout-rate-control">Hệ số
                        <select onchange="updatePayoutRate('${escapeHtml(
                          String(entry.id)
                        )}', this.value)" ${
                          match.state.paid ? "disabled" : ""
                        }>
                          ${[27, 28, 29, 30]
                            .map(
                              (option) =>
                                `<option value="${option}" ${
                                  option === rate ? "selected" : ""
                                }>${option}</option>`
                            )
                            .join("")}
                        </select>
                      </label>
                      <button class="win-paid-btn${
                        match.state.paid ? " is-paid" : ""
                      }" onclick="togglePaidStatus('${escapeHtml(
                        String(entry.id)
                      )}')"><i class="${
                        match.state.paid
                          ? "fas fa-check-circle"
                          : "far fa-circle"
                      }"></i> ${
                        match.state.paid ? "Đã chung" : "Chưa chung"
                      }</button>
                      <button class="win-copy-btn" onclick="copyEntryText('${escapeHtml(
                        String(entry.id)
                      )}')"><i class="fas fa-copy"></i> Copy</button>
                      <span class="win-item-total-label">Tổng phiếu:</span>
                      <span class="win-item-total-value">${(
                        Number(entry.total) || 0
                      ).toLocaleString("vi-VN")} đ</span>
                    </div>
                  </article>`;
              })
              .join("")
      }
    </div>`;
  card.style.display = "block";
  schedulePayoutLookupHeight();
  if (showToast) {
    showNotification(
      `Tìm thấy ${allMatches.length} phiếu chứa ${animal.type}!`
    );
  }
}

function schedulePayoutLookupHeight() {
  requestAnimationFrame(() => {
    const list = document.querySelector("#winResultBody .win-list");
    if (!list) return;
    const items = Array.from(list.querySelectorAll(".win-item"));
    list.classList.toggle("is-scrollable", items.length > 3);
    if (items.length <= 3) {
      list.style.maxHeight = "";
      return;
    }
    const gap = Number.parseFloat(getComputedStyle(list).gap) || 10;
    const height =
      items.slice(0, 3).reduce((sum, item) => sum + item.offsetHeight, 0) +
      gap * 2;
    list.style.maxHeight = `${Math.ceil(height)}px`;
  });
}

function updatePayoutRate(entryId, value) {
  const rate = Number(value);
  if (![27, 28, 29, 30].includes(rate)) return;
  const confirmedDraw = getConfirmedDraw();
  if (!confirmedDraw) return;
  const entry = findEntryById(entryId);
  if (!entry) return;
  const hitSum = (entry.entries || [])
    .filter(
      (item) =>
        animalNameToIndex[item.animal] === confirmedDraw.animalIndex
    )
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const { state } = ensurePayoutState(
    confirmedDraw,
    entry,
    confirmedDraw.animalIndex,
    hitSum
  );
  if (state.paid) {
    showNotification(
      "Hãy bỏ đánh dấu đã chung trước khi đổi hệ số!",
      "error"
    );
    filterWinningEntries(false);
    return;
  }
  state.rate = rate;
  state.rateMode = "manual";
  saveDataToLocalStorage();
  filterWinningEntries(false);
  updateFinanceDashboard();
}

function togglePaidStatus(entryId) {
  const confirmedDraw = getConfirmedDraw();
  const entry = findEntryById(entryId);
  if (!confirmedDraw || !entry) return;
  const hitSum = (entry.entries || [])
    .filter(
      (item) =>
        animalNameToIndex[item.animal] === confirmedDraw.animalIndex
    )
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const { state } = ensurePayoutState(
    confirmedDraw,
    entry,
    confirmedDraw.animalIndex,
    hitSum
  );

  state.paid = !state.paid;
  state.paidAt = state.paid ? new Date().toISOString() : null;
  state.snapshot = state.paid
    ? buildPayoutSnapshot(
        entry,
        confirmedDraw,
        confirmedDraw.animalIndex,
        hitSum,
        Number(state.rate)
      )
    : null;
  saveDataToLocalStorage();
  filterWinningEntries(false);
  showNotification(
    state.paid ? "Đã đánh dấu đã chung!" : "Đã chuyển về chưa chung!"
  );
}

function updateWinPaidSummary() {
  filterWinningEntries(false);
}

function renderPayoutHistory() {
  const container = document.getElementById("payoutHistoryList");
  if (!container) return;
  renderPayoutHistoryDrawInfo();
  const recipientFilter = removeVietnameseDiacritics(
    document.getElementById("payoutHistoryRecipient")?.value || ""
  ).toLowerCase();

  const records = Object.values(payoutStates)
    .filter((state) => state.paid && state.snapshot)
    .map((state) => ({ ...state.snapshot, paidAt: state.paidAt }))
    .filter(
      (record) =>
        record.date >= activeViewDateFrom &&
        record.date <= activeViewDateTo &&
        (!activeViewSession || record.session === activeViewSession) &&
        (!recipientFilter ||
          removeVietnameseDiacritics(record.recipientName)
            .toLowerCase()
            .includes(recipientFilter))
    )
    .sort((a, b) => String(b.paidAt).localeCompare(String(a.paidAt)));

  if (records.length === 0) {
    container.innerHTML =
      '<div class="empty-state">Chưa có khoản trả thưởng phù hợp với bộ lọc</div>';
    return;
  }

  const total = records.reduce(
    (sum, record) => sum + (Number(record.payoutAmount) || 0),
    0
  );
  container.innerHTML = `
    <div class="payout-history-summary">Đã chung <strong>${
      records.length
    }</strong> phiếu · Tổng <strong>${total.toLocaleString(
      "vi-VN"
    )} đ</strong></div>
    <div class="payout-history-table-wrap">
      <table class="payout-history-table">
        <thead><tr><th>Ngày / buổi</th><th>Con xổ</th><th>Người nhận</th><th>Tiền đánh</th><th>Hệ số</th><th>Tiền đã chung</th><th>Thời gian chung</th></tr></thead>
        <tbody>
          ${records
            .map(
              (record) => `
                <tr>
                  <td>${formatDateForDisplay(record.date)}<small>${escapeHtml(
                    record.session
                  )}</small></td>
                  <td>${escapeHtml(
                    `${record.animalId} - ${record.animalType}`
                  )}</td>
                  <td><strong>${escapeHtml(
                    record.recipientName
                  )}</strong><small>${escapeHtml(
                    record.recipientType
                  )}${record.seller ? ` · ${escapeHtml(record.seller)}` : ""}</small></td>
                  <td>${Number(record.hitAmount).toLocaleString("vi-VN")} đ</td>
                  <td>×${record.rate}</td>
                  <td class="payout-history-money">${Number(
                    record.payoutAmount
                  ).toLocaleString("vi-VN")} đ</td>
                  <td>${new Date(record.paidAt).toLocaleString("vi-VN")}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

function renderPayoutHistoryDrawInfo() {
  const container = document.getElementById("payoutHistoryDrawInfo");
  if (!container) return;
  const date = activeViewDateTo;
  const sessions = activeViewSession
    ? [activeViewSession]
    : ["Sáng", "Chiều"];

  container.innerHTML = sessions
    .map((session) => {
      const result = drawResults[getDrawKey(date, session)];
      const animalIndex = result
        ? animals.findIndex((animal) => animal.id === String(result.animalId))
        : -1;
      const icon = session === "Sáng" ? "fa-sun" : "fa-moon";
      if (animalIndex === -1) {
        return `<span class="payout-draw-chip is-empty"><i class="fas ${icon}"></i><strong>${session}</strong>: chưa xác nhận</span>`;
      }
      return `<span class="payout-draw-chip"><i class="fas ${icon}"></i><strong>${session}</strong>: ${escapeHtml(
        getAnimalSearchLabel(animalIndex)
      )}</span>`;
    })
    .join("");
}

// Thêm sự kiện lắng nghe thay đổi nội dung để tính tổng
document.getElementById("ledgerContent").addEventListener("input", function () {
  const parsed = parseContentDetailed(this.value);
  const entries = parsed.entries;
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  document.getElementById("ledgerTotal").textContent = `${total.toLocaleString(
    "vi-VN"
  )} đ`;
  renderParsePreview(entries, parsed.errors);
});

// ===== ĐIỀU HƯỚNG PHÂN HỆ =====
const PAGE_META = {
  home: ["Trang chủ", "Hệ thống / Trang chủ"],
  "ledger-entry": ["Sổ ghi", "Quản lý sổ ghi / Sổ ghi"],
  "ledger-history": ["Lịch sử ghi sổ", "Quản lý sổ ghi / Lịch sử ghi sổ"],
  "payout-lookup": ["Tra cứu & chung thưởng", "Quản lý trả thưởng / Tra cứu & chung thưởng"],
  "payout-history": ["Lịch sử trả thưởng", "Quản lý trả thưởng / Lịch sử trả thưởng"],
  "finance-overview": ["Tổng quan doanh thu", "Doanh thu & công nợ / Tổng quan"],
  "finance-debt": ["Công nợ khách hàng", "Doanh thu & công nợ / Công nợ khách hàng"],
  "finance-source": ["Tổng theo nguồn", "Doanh thu & công nợ / Tổng theo nguồn"],
  "data-import": ["Nhập từ cấp dưới", "Tổng hợp dữ liệu / Nhập từ cấp dưới"],
  "data-imported": ["Phiếu cấp dưới", "Tổng hợp dữ liệu / Phiếu cấp dưới"],
  "data-export": ["Xuất lên cấp trên", "Tổng hợp dữ liệu / Xuất lên cấp trên"],
  "tools-report": ["Xuất báo cáo", "Báo cáo & tiện ích / Xuất báo cáo"],
  "tools-backup": ["Sao lưu & khôi phục", "Báo cáo & tiện ích / Sao lưu & khôi phục"],
  "tools-profile": ["Hồ sơ sổ", "Báo cáo & tiện ích / Hồ sơ sổ"],
  "tools-data": ["Quản lý dữ liệu", "Báo cáo & tiện ích / Quản lý dữ liệu"],
};

function getCurrentRoute() {
  const route = window.location.hash.replace(/^#\/?/, "");
  return PAGE_META[route] ? route : "home";
}

function showRoute(route) {
  const validRoute = PAGE_META[route] ? route : "home";
  const rangeDateRoutes = [
    "finance-overview",
    "finance-debt",
    "finance-source",
  ];
  const usesSingleDate =
    validRoute !== "home" && !rangeDateRoutes.includes(validRoute);
  document.body.classList.toggle("home-route", validRoute === "home");
  document.body.classList.toggle("ledger-route", validRoute === "ledger-entry");
  document.body.classList.toggle(
    "single-date-route",
    usesSingleDate
  );
  document.body.classList.toggle(
    "finance-range-route",
    rangeDateRoutes.includes(validRoute)
  );
  document.body.classList.toggle(
    "payout-lookup-route",
    validRoute === "payout-lookup"
  );
  document.body.classList.toggle(
    "payout-history-route",
    validRoute === "payout-history"
  );
  document.querySelectorAll("[data-route-page]").forEach((page) => {
    page.classList.toggle("active", page.dataset.routePage === validRoute);
  });
  document.querySelectorAll(".erp-nav-link[data-route-link]").forEach((link) => {
    link.classList.toggle("active", link.dataset.routeLink === validRoute);
  });
  const activeNavLink = document.querySelector(
    `.erp-nav-link[data-route-link="${validRoute}"]`
  );
  const activeGroup = activeNavLink?.closest(".erp-nav-group");
  if (activeGroup?.classList.contains("collapsed")) {
    setNavGroupCollapsed(activeGroup, false, false);
  }

  const [title, breadcrumb] = PAGE_META[validRoute];
  const titleElement = document.getElementById("pageTitle");
  const breadcrumbElement = document.getElementById("pageBreadcrumb");
  if (titleElement) titleElement.textContent = title;
  if (breadcrumbElement) breadcrumbElement.textContent = breadcrumb;
  document.title = `${title} - Quản lý sổ ghi`;

  document.body.classList.remove("sidebar-open");
  window.scrollTo({ top: 0, behavior: "instant" });
  const singleDateWasReset =
    usesSingleDate &&
    activeViewDateFrom !== activeViewDateTo;
  if (singleDateWasReset) {
    activeViewDateFrom = activeViewDateTo;
    activeViewDate = activeViewDateTo;
  }
  if (usesSingleDate) {
    syncViewControls();
  } else {
    syncViewControls();
  }
  if (validRoute === "payout-lookup") {
    if (activeViewDateFrom !== activeViewDateTo) {
      activeViewDateFrom = activeViewDateTo;
      activeViewDate = activeViewDateTo;
    }
    if (!["Sáng", "Chiều"].includes(activeViewSession)) {
      activeViewSession = "Sáng";
    }
    syncViewControls();
  }
  if (validRoute === "payout-history") {
    if (activeViewDateFrom !== activeViewDateTo) {
      activeViewDateFrom = activeViewDateTo;
      activeViewDate = activeViewDateTo;
    }
    syncViewControls();
  }
  refreshActiveView(validRoute);
}

function navigateToRoute(route) {
  const targetHash = `#/${route}`;
  if (window.location.hash === targetHash) showRoute(route);
  else window.location.hash = targetHash;
}

function toggleAppSidebar(open) {
  const isMobile = window.matchMedia("(max-width: 980px)").matches;
  if (isMobile) {
    const shouldOpen =
      typeof open === "boolean"
        ? open
        : !document.body.classList.contains("sidebar-open");
    document.body.classList.toggle("sidebar-open", shouldOpen);
    return;
  }

  const shouldCollapse =
    typeof open === "boolean"
      ? !open
      : !document.body.classList.contains("sidebar-collapsed");
  document.body.classList.toggle("sidebar-collapsed", shouldCollapse);
  localStorage.setItem("coNhonSidebarCollapsed", String(shouldCollapse));
}

function getCollapsedNavGroups() {
  try {
    return new Set(
      JSON.parse(localStorage.getItem("coNhonCollapsedNavGroups") || "[]")
    );
  } catch {
    return new Set();
  }
}

function saveCollapsedNavGroups() {
  const collapsed = Array.from(
    document.querySelectorAll(".erp-nav-group.collapsed")
  ).map((group) => group.dataset.navGroup);
  localStorage.setItem("coNhonCollapsedNavGroups", JSON.stringify(collapsed));
}

function setNavGroupCollapsed(group, collapsed, persist = true) {
  if (!group) return;
  group.classList.toggle("collapsed", collapsed);
  const toggle = group.querySelector("[data-nav-group-toggle]");
  if (toggle) toggle.setAttribute("aria-expanded", String(!collapsed));
  if (persist) saveCollapsedNavGroups();
}

function initNavGroups() {
  const collapsedGroups = getCollapsedNavGroups();
  document.querySelectorAll(".erp-nav-group").forEach((group) => {
    let closeTimer = null;
    setNavGroupCollapsed(
      group,
      collapsedGroups.has(group.dataset.navGroup),
      false
    );
    group.addEventListener("mouseenter", () => {
      if (closeTimer) clearTimeout(closeTimer);
      group.classList.add("flyout-open");
    });
    group.addEventListener("mouseleave", () => {
      if (closeTimer) clearTimeout(closeTimer);
      closeTimer = setTimeout(() => {
        group.classList.remove("flyout-open");
      }, 220);
    });
    group.querySelectorAll("[data-route-link]").forEach((link) => {
      link.addEventListener("click", () => {
        if (closeTimer) clearTimeout(closeTimer);
        group.classList.remove("flyout-open");
      });
    });
  });
  document.querySelectorAll("[data-nav-group-toggle]").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const group = toggle.closest(".erp-nav-group");
      setNavGroupCollapsed(group, !group.classList.contains("collapsed"));
    });
  });
}

function initTabs() {
  if (localStorage.getItem("coNhonSidebarCollapsed") === "true") {
    document.body.classList.add("sidebar-collapsed");
  }
  initNavGroups();
  const homeLink = document.querySelector(
    '.erp-nav-link[data-route-link="home"]'
  );
  if (homeLink) {
    let homeCloseTimer = null;
    homeLink.addEventListener("mouseenter", () => {
      if (homeCloseTimer) clearTimeout(homeCloseTimer);
      homeLink.classList.add("flyout-open");
    });
    homeLink.addEventListener("mouseleave", () => {
      if (homeCloseTimer) clearTimeout(homeCloseTimer);
      homeCloseTimer = setTimeout(() => {
        homeLink.classList.remove("flyout-open");
      }, 220);
    });
    homeLink.addEventListener("click", () => {
      if (homeCloseTimer) clearTimeout(homeCloseTimer);
      homeLink.classList.remove("flyout-open");
    });
  }
  document.querySelectorAll("[data-route-link]").forEach((button) => {
    button.addEventListener("click", () => {
      navigateToRoute(button.dataset.routeLink);
    });
  });
  window.addEventListener("hashchange", () => showRoute(getCurrentRoute()));
  showRoute(getCurrentRoute());
}

function syncViewControls() {
  const viewDateFrom = document.getElementById("viewDateFrom");
  const viewDateTo = document.getElementById("viewDateTo");
  if (viewDateFrom) viewDateFrom.value = activeViewDateFrom;
  if (viewDateTo) viewDateTo.value = activeViewDateTo;
  const dateRangeLabel = document.getElementById("dateRangeLabel");
  if (dateRangeLabel) {
    dateRangeLabel.textContent = isSingleDateRoute()
      ? formatDateForDisplay(activeViewDateTo)
      : `${formatDateForDisplay(activeViewDateFrom)} - ${formatDateForDisplay(
          activeViewDateTo
        )}`;
  }
  document.querySelectorAll(".view-session-btn").forEach((button) => {
    button.classList.toggle("active", button.dataset.session === activeViewSession);
  });
  const rangeDays =
    Math.round(
      (new Date(`${activeViewDateTo}T00:00:00`) -
        new Date(`${activeViewDateFrom}T00:00:00`)) /
        86400000
    ) + 1;
  document.querySelectorAll(".quick-date-btn").forEach((button) => {
    const expectedDays = Number(button.dataset.rangeDays);
    const endsToday = activeViewDateTo === getCurrentDate();
    button.classList.toggle(
      "active",
      endsToday && rangeDays === expectedDays
    );
  });

  const winSession = document.getElementById("winSession");
  if (winSession) winSession.value = activeViewSession;
  if (activeViewSession) {
    const entrySession = document.querySelector(
      `input[name="session"][value="${activeViewSession}"]`
    );
    if (entrySession) entrySession.checked = true;
  }
  renderDateRangeCalendar();
}

function setActiveView(date, session) {
  activeViewDate = date || getCurrentDate();
  activeViewDateFrom = activeViewDate;
  activeViewDateTo = activeViewDate;
  activeViewSession = session;
  syncViewControls();
  refreshAllViews();
}

function goToToday() {
  setActiveView(getCurrentDate(), activeViewSession);
  document.getElementById("ledgerDate").value = getCurrentDate();
}

function formatDateForDisplay(dateValue) {
  const [year, month, day] = String(dateValue || "").split("-");
  return year && month && day ? `${day}/${month}/${year}` : dateValue;
}

function closeDateRangePicker() {
  const popover = document.getElementById("dateRangePopover");
  const toggle = document.getElementById("dateRangeToggle");
  if (popover) popover.classList.remove("show");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function parseCalendarDate(value) {
  const [year, month, day] = String(value || "")
    .split("-")
    .map(Number);
  return new Date(year, month - 1, day);
}

function isSingleDateRoute() {
  return document.body.classList.contains("single-date-route");
}

function renderCalendarMonth(year, month) {
  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const mondayOffset = (firstDay.getDay() + 6) % 7;
  const monthTitle = `Tháng ${month + 1} ${year}`;
  const cells = [];

  for (let index = 0; index < mondayOffset; index += 1) {
    cells.push('<span class="calendar-day is-blank"></span>');
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const value = formatDateForInput(new Date(year, month, day));
    const isStart = value === activeViewDateFrom;
    const isEnd = value === activeViewDateTo;
    const isRange =
      value >= activeViewDateFrom && value <= activeViewDateTo;
    const classes = [
      "calendar-day",
      isRange ? "is-in-range" : "",
      isStart ? "is-start" : "",
      isEnd ? "is-end" : "",
      value === getCurrentDate() ? "is-today" : "",
    ]
      .filter(Boolean)
      .join(" ");
    cells.push(
      `<button type="button" class="${classes}" data-calendar-date="${value}">${day}</button>`
    );
  }

  return `
    <section class="calendar-month">
      <h3>${monthTitle}</h3>
      <div class="calendar-weekdays">
        ${["T2", "T3", "T4", "T5", "T6", "T7", "CN"]
          .map((day) => `<span>${day}</span>`)
          .join("")}
      </div>
      <div class="calendar-days">${cells.join("")}</div>
    </section>`;
}

function renderDateRangeCalendar() {
  const calendar = document.getElementById("dateRangeCalendar");
  const monthSelect = document.getElementById("calendarMonth");
  const yearSelect = document.getElementById("calendarYear");
  if (!calendar || !monthSelect || !yearSelect) return;

  const cursorYear = calendarCursor.getFullYear();
  const cursorMonth = calendarCursor.getMonth();
  monthSelect.innerHTML = Array.from(
    { length: 12 },
    (_, index) =>
      `<option value="${index}" ${
        index === cursorMonth ? "selected" : ""
      }>Tháng ${index + 1}</option>`
  ).join("");
  yearSelect.innerHTML = Array.from(
    { length: 11 },
    (_, index) => cursorYear - 5 + index
  )
    .map(
      (year) =>
        `<option value="${year}" ${
          year === cursorYear ? "selected" : ""
        }>${year}</option>`
    )
    .join("");

  const nextMonth = new Date(cursorYear, cursorMonth + 1, 1);
  calendar.innerHTML =
    renderCalendarMonth(cursorYear, cursorMonth) +
    renderCalendarMonth(nextMonth.getFullYear(), nextMonth.getMonth());
  calendar.querySelectorAll("[data-calendar-date]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      selectCalendarDate(button.dataset.calendarDate);
    });
  });
}

function shiftCalendarMonth(delta) {
  calendarCursor = new Date(
    calendarCursor.getFullYear(),
    calendarCursor.getMonth() + delta,
    1
  );
  renderDateRangeCalendar();
}

function updateCalendarCursor() {
  const month = Number(document.getElementById("calendarMonth")?.value);
  const year = Number(document.getElementById("calendarYear")?.value);
  if (!Number.isInteger(month) || !Number.isInteger(year)) return;
  calendarCursor = new Date(year, month, 1);
  renderDateRangeCalendar();
}

function selectCalendarDate(value) {
  if (!value) return;
  if (isSingleDateRoute()) {
    activeViewDateFrom = value;
    activeViewDateTo = value;
    activeViewDate = value;
    calendarAwaitingEnd = false;
    syncViewControls();
    refreshAllViews();
    closeDateRangePicker();
    return;
  }

  if (!calendarAwaitingEnd) {
    activeViewDateFrom = value;
    activeViewDateTo = value;
    activeViewDate = value;
    calendarAwaitingEnd = true;
  } else {
    const rangeStart = activeViewDateFrom;
    activeViewDateFrom = value < rangeStart ? value : rangeStart;
    activeViewDateTo = value < rangeStart ? rangeStart : value;
    activeViewDate = activeViewDateTo;
    calendarAwaitingEnd = false;
  }
  syncViewControls();
  refreshAllViews();
  if (!calendarAwaitingEnd) closeDateRangePicker();
}

function initDateRangePicker() {
  const picker = document.getElementById("dateRangePicker");
  const popover = document.getElementById("dateRangePopover");
  const toggle = document.getElementById("dateRangeToggle");
  if (!picker || !popover || !toggle) return;

  toggle.addEventListener("click", () => {
    const willOpen = !popover.classList.contains("show");
    popover.classList.toggle("show", willOpen);
    toggle.setAttribute("aria-expanded", String(willOpen));
    if (willOpen) {
      calendarCursor = parseCalendarDate(activeViewDateFrom);
      calendarCursor.setDate(1);
      calendarAwaitingEnd = false;
      renderDateRangeCalendar();
    }
  });
  document
    .getElementById("calendarMonth")
    ?.addEventListener("change", updateCalendarCursor);
  document
    .getElementById("calendarYear")
    ?.addEventListener("change", updateCalendarCursor);
  document.addEventListener("click", (event) => {
    const clickPath =
      typeof event.composedPath === "function" ? event.composedPath() : [];
    if (!clickPath.includes(picker) && !picker.contains(event.target)) {
      closeDateRangePicker();
    }
  });
}

function initViewControls() {
  const viewDateFrom = document.getElementById("viewDateFrom");
  const viewDateTo = document.getElementById("viewDateTo");
  initDateRangePicker();

  const applyCustomRange = () => {
    if (!viewDateFrom.value || !viewDateTo.value) return;
    if (viewDateFrom.value > viewDateTo.value) {
      showNotification("Ngày bắt đầu không thể sau ngày kết thúc!", "error");
      syncViewControls();
      return;
    }
    activeViewDateFrom = viewDateFrom.value;
    activeViewDateTo = viewDateTo.value;
    activeViewDate = activeViewDateTo;
    refreshAllViews();
    syncViewControls();
  };
  viewDateFrom.addEventListener("change", applyCustomRange);
  viewDateTo.addEventListener("change", applyCustomRange);

  document.querySelectorAll(".quick-date-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const days = Number(button.dataset.rangeDays) || 1;
      const end = new Date(`${getCurrentDate()}T00:00:00`);
      const start = new Date(end);
      start.setDate(start.getDate() - days + 1);
      activeViewDateFrom = formatDateForInput(start);
      activeViewDateTo = formatDateForInput(end);
      activeViewDate = activeViewDateTo;
      calendarCursor = new Date(start.getFullYear(), start.getMonth(), 1);
      calendarAwaitingEnd = false;
      syncViewControls();
      refreshAllViews();
    });
  });

  document.querySelectorAll(".view-session-btn").forEach((button) => {
    button.addEventListener("click", () => {
      activeViewSession = button.dataset.session;
      syncViewControls();
      refreshAllViews();
    });
  });
  syncViewControls();
}

function updateExportSessionButton() {
  const button = document.getElementById("exportSessionBtn");
  if (!button) return;
  const isSingleDate = activeViewDateFrom === activeViewDateTo;
  button.disabled = !activeViewSession || !isSingleDate;
  button.title = activeViewSession && isSingleDate
    ? `Xuất phiếu tổng ${activeViewSession.toLowerCase()} ngày ${activeViewDate}`
    : "Chọn đúng một ngày và một buổi Sáng hoặc Chiều để xuất";
}

function setMoneyText(id, amount) {
  const element = document.getElementById(id);
  if (element) element.textContent = `${amount.toLocaleString("vi-VN")} đ`;
}

function normalizeCommissionRate(value, fallback = 0) {
  const rate = Number(value);
  if (!Number.isFinite(rate)) return fallback;
  return Math.min(100, Math.max(0, Math.round(rate * 10) / 10));
}

function normalizePayoutRate(value, fallback = 28) {
  const rate = Math.round(Number(value));
  return [27, 28, 29, 30].includes(rate) ? rate : fallback;
}

function getFinanceSource(entry) {
  if (!isDirectEntry(entry)) {
    const sourceId = entry.sourceProfileId || entry.sourceProfileName || "unknown";
    return {
      key: `child:${sourceId}`,
      name: entry.sourceProfileName || entry.person || "Cấp dưới",
      defaultRole: "child",
      imported: true,
    };
  }

  const seller = String(entry.seller || "").trim();
  if (entry.sellerRole === "self") {
    return {
      key: `self:${entry.sellerSourceId || localProfile.id}`,
      name: seller || localProfile.name || "Bản thân",
      defaultRole: "self",
      imported: false,
    };
  }
  if (entry.sellerRole === "child") {
    return {
      key: `seller:${entry.sellerSourceId || removeVietnameseDiacritics(seller).toLowerCase()}`,
      name: seller || "Người bán khác",
      defaultRole: "child",
      imported: false,
    };
  }
  const normalizedSeller = removeVietnameseDiacritics(seller).toLowerCase();
  const normalizedProfile = removeVietnameseDiacritics(
    localProfile.name || ""
  ).toLowerCase();
  const isOwner =
    !seller || (normalizedProfile && normalizedSeller === normalizedProfile);

  return isOwner
    ? {
        key: `self:${localProfile.id}`,
        name: localProfile.name || "Bản thân",
        defaultRole: "self",
        imported: false,
      }
    : {
        key: `seller:${normalizedSeller}`,
        name: seller,
        defaultRole: "child",
        imported: false,
      };
}

function getFinanceSourceConfig(source) {
  const stored = financeSettings.sourceConfigs[source.key] || {};
  const role = source.imported
    ? "child"
    : stored.role === "self" || stored.role === "child"
      ? stored.role
      : source.defaultRole;
  const childRate =
    role === "child"
      ? Math.min(
          normalizeCommissionRate(financeSettings.ownerRate, 20),
          normalizeCommissionRate(
            stored.childRate,
            financeSettings.defaultChildRate
          )
        )
      : 0;
  return { role, childRate };
}

function getDefaultPayoutRateForEntry(entry) {
  return normalizePayoutRate(financeSettings.defaultPayoutRate, 27);
}

function getEntryPayoutSpread(entry) {
  const drawKey = getDrawKey(entry.date, entry.session);
  const draw = drawResults[drawKey];
  if (!draw) {
    return {
      hitAmount: 0,
      incomingPayout: 0,
      outgoingPayout: 0,
      payoutMargin: 0,
    };
  }
  const animalIndex = animals.findIndex(
    (animal) => animal.id === String(draw.animalId)
  );
  if (animalIndex === -1) {
    return {
      hitAmount: 0,
      incomingPayout: 0,
      outgoingPayout: 0,
      payoutMargin: 0,
    };
  }
  const hitAmount = (entry.entries || [])
    .filter((item) => animalNameToIndex[item.animal] === animalIndex)
    .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  if (!hitAmount) {
    return {
      hitAmount: 0,
      incomingPayout: 0,
      outgoingPayout: 0,
      payoutMargin: 0,
    };
  }

  const state = payoutStates[getPayoutStateKey(drawKey, entry.id)];
  const defaultOutgoingRate = getDefaultPayoutRateForEntry(entry);
  const outgoingRate =
    state &&
    [27, 28, 29, 30].includes(Number(state.rate)) &&
    (state.rateMode !== "default" || state.paid)
      ? Number(state.rate)
      : defaultOutgoingRate;
  const incomingRate = normalizePayoutRate(
    financeSettings.ownerPayoutRate,
    28
  );
  const incomingPayout = hitAmount * incomingRate;
  const outgoingPayout = hitAmount * outgoingRate;
  return {
    hitAmount,
    incomingRate,
    outgoingRate,
    incomingPayout,
    outgoingPayout,
    payoutMargin: incomingPayout - outgoingPayout,
  };
}

function getFinanceBreakdown(entries = getVisibleEntries()) {
  const ownerRate = normalizeCommissionRate(financeSettings.ownerRate, 20);
  const sources = new Map();

  entries.forEach((entry) => {
    const source = getFinanceSource(entry);
    const config = getFinanceSourceConfig(source);
    const current = sources.get(source.key) || {
      ...source,
      ...config,
      count: 0,
      total: 0,
      hitAmount: 0,
      incomingPayout: 0,
      outgoingPayout: 0,
      payoutMargin: 0,
    };
    const payout = getEntryPayoutSpread(entry);
    current.count += 1;
    current.total += Number(entry.total) || 0;
    current.hitAmount += payout.hitAmount;
    current.incomingPayout += payout.incomingPayout;
    current.outgoingPayout += payout.outgoingPayout;
    current.payoutMargin += payout.payoutMargin;
    sources.set(source.key, current);
  });

  const rows = Array.from(sources.values()).map((source) => {
    const grossCommission = Math.round((source.total * ownerRate) / 100);
    const childCommission =
      source.role === "child"
        ? Math.round((source.total * source.childRate) / 100)
        : 0;
    const commissionIncome = grossCommission - childCommission;
    return {
      ...source,
      grossCommission,
      childCommission,
      commissionIncome,
      netIncome: commissionIncome + source.payoutMargin,
      upstreamPayable: source.total - grossCommission,
    };
  });

  return {
    ownerRate,
    rows,
    total: rows.reduce((sum, row) => sum + row.total, 0),
    grossCommission: rows.reduce(
      (sum, row) => sum + row.grossCommission,
      0
    ),
    childCommission: rows.reduce(
      (sum, row) => sum + row.childCommission,
      0
    ),
    commissionIncome: rows.reduce(
      (sum, row) => sum + row.commissionIncome,
      0
    ),
    hitAmount: rows.reduce((sum, row) => sum + row.hitAmount, 0),
    incomingPayout: rows.reduce(
      (sum, row) => sum + row.incomingPayout,
      0
    ),
    outgoingPayout: rows.reduce(
      (sum, row) => sum + row.outgoingPayout,
      0
    ),
    payoutMargin: rows.reduce((sum, row) => sum + row.payoutMargin, 0),
    netIncome: rows.reduce((sum, row) => sum + row.netIncome, 0),
    upstreamPayable: rows.reduce(
      (sum, row) => sum + row.upstreamPayable,
      0
    ),
  };
}

function syncFinanceSettingsForm() {
  const ownerRate = document.getElementById("financeOwnerRate");
  const childRate = document.getElementById("financeDefaultChildRate");
  const ownerPayoutRate = document.getElementById("financeOwnerPayoutRate");
  const payoutRate = document.getElementById("financeDefaultPayoutRate");
  if (ownerRate) ownerRate.value = financeSettings.ownerRate;
  if (childRate) childRate.value = financeSettings.defaultChildRate;
  if (ownerPayoutRate) {
    ownerPayoutRate.value = financeSettings.ownerPayoutRate;
  }
  if (payoutRate) {
    payoutRate.value = financeSettings.defaultPayoutRate;
  }
}

function saveFinanceSettingsFromForm() {
  const ownerRate = normalizeCommissionRate(
    document.getElementById("financeOwnerRate")?.value,
    financeSettings.ownerRate
  );
  const childRate = normalizeCommissionRate(
    document.getElementById("financeDefaultChildRate")?.value,
    financeSettings.defaultChildRate
  );
  const ownerPayoutRate = normalizePayoutRate(
    document.getElementById("financeOwnerPayoutRate")?.value,
    financeSettings.ownerPayoutRate
  );
  const payoutRate = normalizePayoutRate(
    document.getElementById("financeDefaultPayoutRate")?.value,
    financeSettings.defaultPayoutRate
  );
  if (childRate > ownerRate) {
    showNotification(
      "Tỷ lệ trả cấp dưới không được lớn hơn tỷ lệ bạn được hưởng!",
      "error"
    );
    syncFinanceSettingsForm();
    return;
  }
  if (payoutRate > ownerPayoutRate) {
    showNotification(
      "Hệ số trả khách/cấp dưới không được lớn hơn hệ số bạn nhận từ cấp trên!",
      "error"
    );
    syncFinanceSettingsForm();
    return;
  }
  financeSettings.ownerRate = ownerRate;
  financeSettings.defaultChildRate = childRate;
  financeSettings.ownerPayoutRate = ownerPayoutRate;
  financeSettings.defaultPayoutRate = payoutRate;
  saveDataToLocalStorage();
  refreshAllViews();
  showNotification("Đã lưu cấu hình hệ số và hoa hồng!");
}

function updateFinanceSourceConfig(encodedKey, field, value) {
  const key = decodeURIComponent(encodedKey);
  const source = getFinanceBreakdown().rows.find((row) => row.key === key);
  if (!source) return;
  const current = financeSettings.sourceConfigs[key] || {
    role: source.role,
    childRate: source.childRate,
  };

  if (field === "role" && !source.imported) {
    current.role = value === "self" ? "self" : "child";
  }
  if (field === "childRate") {
    const childRate = normalizeCommissionRate(
      value,
      financeSettings.defaultChildRate
    );
    if (childRate > financeSettings.ownerRate) {
      showNotification(
        "Tỷ lệ trả nguồn không được lớn hơn tỷ lệ bạn được hưởng!",
        "error"
      );
      updateFinanceDashboard();
      return;
    }
    current.childRate = childRate;
  }
  financeSettings.sourceConfigs[key] = current;
  saveDataToLocalStorage();
  updateFinanceDashboard();
}

function getDebtPaymentsForEntry(entryId, cutoffDate = "") {
  const payments = debtPaymentsByEntryId.get(String(entryId)) || [];
  return payments.filter(
    (payment) =>
      !payment.reversedAt &&
      (!cutoffDate || payment.paidDate <= cutoffDate)
  );
}

function getDebtPaidAmount(entryId, cutoffDate = "") {
  return getDebtPaymentsForEntry(entryId, cutoffDate).reduce(
    (sum, payment) => sum + (Number(payment.amount) || 0),
    0
  );
}

function getDebtSnapshot(entry, cutoffDate = "") {
  const total = Number(entry.total) || 0;
  const paid = Math.min(total, getDebtPaidAmount(entry.id, cutoffDate));
  const remaining = Math.max(0, total - paid);
  const status =
    remaining === 0 ? "paid" : paid > 0 ? "partial" : "unpaid";
  return { total, paid, remaining, status };
}

function getDebtStatusMeta(status) {
  const map = {
    unpaid: { label: "Chưa trả", icon: "fa-clock", className: "unpaid" },
    partial: {
      label: "Đã trả một phần",
      icon: "fa-circle-half-stroke",
      className: "partial",
    },
    paid: {
      label: "Đã trả đủ",
      icon: "fa-circle-check",
      className: "paid",
    },
  };
  return map[status] || map.unpaid;
}

function getDebtEntriesAsOf(cutoffDate = activeViewDateTo) {
  return ledgerData.filter(
    (entry) =>
      isDirectEntry(entry) &&
      entry.paymentType === "debt" &&
      entry.date <= cutoffDate &&
      (!activeViewSession || entry.session === activeViewSession)
  );
}

function getDebtEntriesInRange(
  startDate = activeViewDateFrom,
  endDate = activeViewDateTo
) {
  return ledgerData.filter(
    (entry) =>
      isDirectEntry(entry) &&
      entry.paymentType === "debt" &&
      entry.date >= startDate &&
      entry.date <= endDate &&
      (!activeViewSession || entry.session === activeViewSession)
  );
}

function compareDebtRowsByRecordedTime(a, b) {
  const dateComparison = String(b.entry.date).localeCompare(
    String(a.entry.date)
  );
  if (dateComparison !== 0) return dateComparison;

  const sessionRank = { Sáng: 1, Chiều: 2 };
  const sessionComparison =
    (sessionRank[b.entry.session] || 0) -
    (sessionRank[a.entry.session] || 0);
  if (sessionComparison !== 0) return sessionComparison;

  const createdAtComparison = String(b.entry.createdAt || "").localeCompare(
    String(a.entry.createdAt || "")
  );
  if (createdAtComparison !== 0) return createdAtComparison;

  return String(b.entry.id).localeCompare(String(a.entry.id));
}

let debtFilterTimer = null;
function scheduleDebtFilterUpdate() {
  clearTimeout(debtFilterTimer);
  debtFilterTimer = setTimeout(() => {
    debtListPageState.page = 1;
    updateFinanceDashboard("finance-debt");
  }, 220);
}

function renderDebtList(entries) {
  const container = document.getElementById("debtList");
  if (!container) return;
  const search = removeVietnameseDiacritics(
    document.getElementById("debtSearchInput")?.value || ""
  ).toLowerCase();
  const statusFilter =
    document.getElementById("debtStatusFilter")?.value || "outstanding";
  const rows = entries
    .map((entry) => ({ entry, snapshot: getDebtSnapshot(entry, activeViewDateTo) }))
    .filter(({ entry, snapshot }) => {
      const matchesSearch =
        !search ||
        removeVietnameseDiacritics(`${entry.person} ${entry.seller}`)
          .toLowerCase()
          .includes(search);
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "outstanding"
          ? snapshot.remaining > 0
          : snapshot.status === statusFilter);
      return matchesSearch && matchesStatus;
    })
    .sort(compareDebtRowsByRecordedTime);
  const pageKey = [
    dataRevision,
    activeViewDateFrom,
    activeViewDateTo,
    activeViewSession || "all",
    search,
    statusFilter,
  ].join("|");
  const paged = getPagedRows(rows, debtListPageState, pageKey);

  const allSnapshots = entries.map((entry) =>
    getDebtSnapshot(entry, activeViewDateTo)
  );
  const totalOriginal = allSnapshots.reduce(
    (sum, snapshot) => sum + snapshot.total,
    0
  );
  const totalPaid = allSnapshots.reduce(
    (sum, snapshot) => sum + snapshot.paid,
    0
  );
  const totalRemaining = allSnapshots.reduce(
    (sum, snapshot) => sum + snapshot.remaining,
    0
  );

  container.innerHTML = `
    <div class="debt-overview-strip">
      <span>Tổng phiếu nợ <strong>${totalOriginal.toLocaleString("vi-VN")} đ</strong></span>
      <span>Đã thu <strong>${totalPaid.toLocaleString("vi-VN")} đ</strong></span>
      <span>Còn nợ đến ${formatDateForDisplay(
        activeViewDateTo
      )} <strong>${totalRemaining.toLocaleString("vi-VN")} đ</strong></span>
    </div>
    ${
      rows.length === 0
        ? '<div class="empty-state">Không có công nợ phù hợp với điều kiện đang xem</div>'
        : `<div class="debt-table-wrap">
            <table class="debt-table debt-management-table">
              <colgroup>
                <col class="debt-col-person" />
                <col class="debt-col-date" />
                <col class="debt-col-money" />
                <col class="debt-col-money" />
                <col class="debt-col-money" />
                <col class="debt-col-status" />
                <col class="debt-col-actions" />
              </colgroup>
              <thead><tr><th>Khách / người bán</th><th>Ngày ghi</th><th class="table-number-head">Tổng phiếu</th><th class="table-number-head">Đã trả</th><th class="table-number-head">Còn nợ</th><th class="table-center-head">Trạng thái</th><th class="table-center-head">Thao tác</th></tr></thead>
              <tbody>
                ${paged.rows
                  .map(({ entry, snapshot }) => {
                    const status = getDebtStatusMeta(snapshot.status);
                    return `<tr>
                      <td class="table-primary-cell"><strong>${escapeHtml(
                        entry.person || "Không có tên"
                      )}</strong><small>${escapeHtml(
                        entry.seller || localProfile.name || "Bản thân"
                      )}</small></td>
                      <td class="table-date-cell">${formatDateForDisplay(
                        entry.date
                      )}<small>${escapeHtml(entry.session)}</small></td>
                      <td class="finance-money">${snapshot.total.toLocaleString(
                        "vi-VN"
                      )} đ</td>
                      <td class="finance-money">${snapshot.paid.toLocaleString(
                        "vi-VN"
                      )} đ</td>
                      <td class="finance-money debt-remaining">${snapshot.remaining.toLocaleString(
                        "vi-VN"
                      )} đ</td>
                      <td class="table-status-cell"><span class="debt-status debt-status-${
                        status.className
                      }"><i class="fas ${status.icon}"></i> ${
                        status.label
                      }</span></td>
                      <td class="table-actions-cell"><div class="debt-actions">
                        <button type="button" class="debt-pay-btn" onclick="openDebtPaymentModal('${escapeHtml(
                          String(entry.id)
                        )}')" ${
                          snapshot.remaining === 0 ? "disabled" : ""
                        }><i class="fas fa-hand-holding-dollar"></i> Thu nợ</button>
                        <button type="button" class="debt-history-btn" onclick="openDebtPaymentModal('${escapeHtml(
                          String(entry.id)
                        )}', true)"><i class="fas fa-clock-rotate-left"></i> Lịch sử</button>
                      </div></td>
                    </tr>`;
                  })
                  .join("")}
              </tbody>
            </table>
          </div>
          ${renderPaginationControls(
            "debt",
            paged.page,
            paged.pageCount,
            paged.total
          )}`
    }`;
}

function renderDebtPaymentModal(entry) {
  const summary = document.getElementById("debtPaymentSummary");
  const history = document.getElementById("debtPaymentHistoryList");
  const saveButton = document.getElementById("saveDebtPaymentBtn");
  const paymentForm = document.getElementById("debtPaymentForm");
  if (!summary || !history || !saveButton || !paymentForm) return;
  const snapshot = getDebtSnapshot(entry);
  const status = getDebtStatusMeta(snapshot.status);
  summary.innerHTML = `
    <div><span>Khách</span><strong>${escapeHtml(
      entry.person || "Không có tên"
    )}</strong></div>
    <div><span>Phiếu</span><strong>${formatDateForDisplay(
      entry.date
    )} · ${escapeHtml(entry.session)}</strong></div>
    <div><span>Tổng phiếu</span><strong>${snapshot.total.toLocaleString(
      "vi-VN"
    )} đ</strong></div>
    <div><span>Đã trả</span><strong>${snapshot.paid.toLocaleString(
      "vi-VN"
    )} đ</strong></div>
    <div><span>Còn nợ</span><strong class="debt-modal-remaining">${snapshot.remaining.toLocaleString(
      "vi-VN"
    )} đ</strong></div>
    <div><span>Trạng thái</span><strong>${status.label}</strong></div>`;

  const payments = debtPayments
    .filter((payment) => String(payment.entryId) === String(entry.id))
    .sort((a, b) =>
      `${b.paidDate}|${b.createdAt}`.localeCompare(
        `${a.paidDate}|${a.createdAt}`
      )
    );
  history.innerHTML =
    payments.length === 0
      ? '<div class="empty-state debt-history-empty">Chưa có lần thu nợ nào</div>'
      : payments
          .map((payment) => {
            const method = getPaymentMeta(payment.method);
            return `<div class="debt-payment-history-item${
              payment.reversedAt ? " is-reversed" : ""
            }">
              <span class="debt-payment-method"><i class="fas ${
                method.icon
              }"></i></span>
              <div><strong>${Number(payment.amount).toLocaleString(
                "vi-VN"
              )} đ · ${method.label}</strong><small>${formatDateForDisplay(
                payment.paidDate
              )}${payment.note ? ` · ${escapeHtml(payment.note)}` : ""}</small></div>
              ${
                payment.reversedAt
                  ? '<span class="debt-reversed-label">Đã hủy</span>'
                  : `<button type="button" onclick="reverseDebtPayment('${escapeHtml(
                      String(payment.id)
                    )}')"><i class="fas fa-rotate-left"></i> Hủy</button>`
              }
            </div>`;
          })
          .join("");
  const isFullyPaid = snapshot.remaining === 0;
  paymentForm.style.display = isFullyPaid ? "none" : "";
  saveButton.style.display = isFullyPaid ? "none" : "inline-flex";
  saveButton.disabled = isFullyPaid;
}

function openDebtPaymentModal(entryId, historyOnly = false) {
  const entry = findEntryById(entryId);
  if (!entry || entry.paymentType !== "debt") return;
  const snapshot = getDebtSnapshot(entry);
  document.getElementById("debtPaymentEntryId").value = entry.id;
  document.getElementById("debtPaymentAmount").value =
    snapshot.remaining || "";
  document.getElementById("debtPaymentAmount").max = snapshot.remaining;
  document.getElementById("debtPaymentDate").value = getCurrentDate();
  document.getElementById("debtPaymentDate").min = entry.date;
  document.getElementById("debtPaymentDate").max = getCurrentDate();
  document.getElementById("debtPaymentMethod").value = "cash";
  document.getElementById("debtPaymentNote").value = "";
  renderDebtPaymentModal(entry);
  document.getElementById("debtPaymentModal").classList.add("show");
  if (historyOnly) {
    document
      .querySelector(".debt-payment-history")
      ?.scrollIntoView({ block: "nearest" });
  } else {
    document.getElementById("debtPaymentAmount").focus();
  }
}

function closeDebtPaymentModal() {
  document.getElementById("debtPaymentModal").classList.remove("show");
}

function saveDebtPayment() {
  const entry = findEntryById(
    document.getElementById("debtPaymentEntryId").value
  );
  if (!entry || entry.paymentType !== "debt") return;
  const amount = Number(document.getElementById("debtPaymentAmount").value);
  const paidDate = document.getElementById("debtPaymentDate").value;
  const method = document.getElementById("debtPaymentMethod").value;
  const note = document.getElementById("debtPaymentNote").value.trim();
  const snapshot = getDebtSnapshot(entry);

  if (!Number.isFinite(amount) || amount <= 0) {
    showNotification("Số tiền thu nợ phải lớn hơn 0!", "error");
    return;
  }
  if (amount > snapshot.remaining) {
    showNotification("Số tiền nhận không được lớn hơn số còn nợ!", "error");
    return;
  }
  if (!paidDate || paidDate < entry.date || paidDate > getCurrentDate()) {
    showNotification("Ngày nhận tiền không hợp lệ!", "error");
    return;
  }
  if (!["cash", "bank_transfer"].includes(method)) return;

  debtPayments.push({
    id: createUuid(),
    entryId: entry.id,
    amount,
    paidDate,
    method,
    note,
    createdAt: new Date().toISOString(),
    reversedAt: null,
  });
  markDataChanged();
  saveDataToLocalStorage();
  refreshAllViews();
  renderDebtPaymentModal(entry);
  document.getElementById("debtPaymentAmount").value =
    getDebtSnapshot(entry).remaining || "";
  showNotification(
    getDebtSnapshot(entry).remaining === 0
      ? "Đã thu đủ công nợ của phiếu!"
      : "Đã ghi nhận khách trả một phần!"
  );
}

function reverseDebtPayment(paymentId) {
  const payment = debtPayments.find(
    (item) => String(item.id) === String(paymentId)
  );
  if (!payment || payment.reversedAt) return;
  if (!confirm("Hủy lần thu nợ này và cộng lại công nợ cho khách?")) return;
  payment.reversedAt = new Date().toISOString();
  markDataChanged();
  saveDataToLocalStorage();
  refreshAllViews();
  const entry = findEntryById(payment.entryId);
  if (entry) {
    renderDebtPaymentModal(entry);
    document.getElementById("debtPaymentAmount").value =
      getDebtSnapshot(entry).remaining || "";
  }
  showNotification("Đã hủy giao dịch thu nợ!");
}

function renderFinanceOverviewInsights({
  financeBreakdown,
  cash,
  transfer,
  debtCash,
  debtTransfer,
  debtEntries,
}) {
  const money = (amount) => `${Number(amount || 0).toLocaleString("vi-VN")} đ`;
  const allocation = document.getElementById("financeAllocation");
  const collection = document.getElementById("financeCollectionBreakdown");
  const actions = document.getElementById("financeActionList");
  const debtInsights = null;
  const sourceInsights = null;

  if (allocation) {
    const netPercent = financeBreakdown.total
      ? (financeBreakdown.netIncome / financeBreakdown.total) * 100
      : 0;
    allocation.innerHTML = `
      <div class="allocation-root">
        <span>Tổng tiền ghi</span>
        <strong>${money(financeBreakdown.total)}</strong>
      </div>
      <div class="allocation-branches">
        <div class="allocation-branch upstream">
          <span><i class="fas fa-arrow-up"></i> Chuyển cấp trên</span>
          <strong>${money(financeBreakdown.upstreamPayable)}</strong>
          <small>${100 - financeBreakdown.ownerRate}% tổng ghi</small>
        </div>
        <div class="allocation-branch commission">
          <span><i class="fas fa-percent"></i> Hoa hồng được hưởng</span>
          <strong>${money(financeBreakdown.grossCommission)}</strong>
          <small>${financeBreakdown.ownerRate}% tổng ghi</small>
        </div>
      </div>
      <div class="allocation-commission-split">
        <span>Hoa hồng nhận <strong>${money(
          financeBreakdown.grossCommission
        )}</strong></span>
        <span>Hoa hồng trả <strong>${money(
          financeBreakdown.childCommission
        )}</strong></span>
        <span class="allocation-net">Lãi hoa hồng <strong>${money(
          financeBreakdown.commissionIncome
        )}</strong></span>
      </div>
      <div class="allocation-payout-spread">
        <div class="allocation-payout-title">
          <span><i class="fas fa-trophy"></i> Chênh lệch trả thưởng</span>
          <strong>${money(financeBreakdown.payoutMargin)}</strong>
        </div>
        <div class="allocation-payout-values">
          <span>Tiền trúng <strong>${money(
            financeBreakdown.hitAmount
          )}</strong></span>
          <span>Cấp trên phải chung <strong>${money(
            financeBreakdown.incomingPayout
          )}</strong></span>
          <span>Phải trả khách/cấp dưới <strong>${money(
            financeBreakdown.outgoingPayout
          )}</strong></span>
        </div>
        <small>Nhận mặc định ×${financeSettings.ownerPayoutRate} · Trả theo từng phiếu, mặc định ×${financeSettings.defaultPayoutRate} · Tính theo con xổ đã xác nhận</small>
      </div>
      <div class="allocation-final">
        <span>Thu nhập thực nhận</span>
        <strong>${money(
          financeBreakdown.netIncome
        )}</strong>
        <small>Lãi hoa hồng + chênh lệch trả thưởng · ${netPercent.toLocaleString("vi-VN", {
          maximumFractionDigits: 1,
        })}% tổng ghi</small>
      </div>`;
  }

  if (collection) {
    const totalCollected = cash + transfer;
    const cashPercent = totalCollected ? (cash / totalCollected) * 100 : 0;
    const transferPercent = totalCollected
      ? (transfer / totalCollected) * 100
      : 0;
    const debtCollected = debtCash + debtTransfer;
    collection.innerHTML = `
      <div class="collection-total"><span>Đã thu trong kỳ</span><strong>${money(
        totalCollected
      )}</strong></div>
      <div class="collection-bar" aria-label="Cơ cấu tiền đã thu">
        <span class="collection-cash-bar" style="width:${cashPercent}%"></span>
        <span class="collection-transfer-bar" style="width:${transferPercent}%"></span>
      </div>
      <div class="collection-lines">
        <div><span><i class="fas fa-money-bill-wave cash-dot"></i> Tiền mặt</span><strong>${money(
          cash
        )}</strong></div>
        <div><span><i class="fas fa-building-columns transfer-dot"></i> Chuyển khoản</span><strong>${money(
          transfer
        )}</strong></div>
        <div class="collection-subset"><span><i class="fas fa-rotate"></i> Trong đó thu nợ</span><strong>${money(
          debtCollected
        )}</strong></div>
      </div>
      <p>Dữ liệu cấp dưới chưa được tính vào tiền đã thu vì chưa có trạng thái đối soát.</p>`;
  }

  const outstandingRows = debtEntries
    .map((entry) => ({
      entry,
      snapshot: getDebtSnapshot(entry, activeViewDateTo),
    }))
    .filter(({ snapshot }) => snapshot.remaining > 0);
  const endDate = parseCalendarDate(activeViewDateTo);
  const overdueRows = outstandingRows.filter(({ entry }) => {
    const entryDate = parseCalendarDate(entry.date);
    return Math.floor((endDate - entryDate) / 86400000) >= 3;
  });
  const outstandingAmount = outstandingRows.reduce(
    (sum, row) => sum + row.snapshot.remaining,
    0
  );
  const overdueAmount = overdueRows.reduce(
    (sum, row) => sum + row.snapshot.remaining,
    0
  );

  if (actions) {
    const actionRows = [
      {
        icon: "fa-file-invoice-dollar",
        tone: "warning",
        label: `${outstandingRows.length} phiếu khách còn nợ`,
        value: money(outstandingAmount),
        note: "Cần thu từ khách",
        route: "finance-debt",
      },
      {
        icon: "fa-arrow-up",
        tone: "neutral",
        label: "Nghĩa vụ chuyển cấp trên",
        value: money(financeBreakdown.upstreamPayable),
        note: "Theo công thức, chưa theo dõi đã chuyển",
        route: "",
      },
      {
        icon: "fa-users",
        tone: "purple",
        label: "Hoa hồng cấp dưới",
        value: money(financeBreakdown.childCommission),
        note: "Theo công thức, chưa theo dõi đã trả",
        route: "finance-source",
      },
    ];
    actions.innerHTML = actionRows
      .map(
        (row) => `
          <button type="button" class="finance-action-row ${
            row.tone
          }" ${
            row.route
              ? `onclick="navigateToRoute('${row.route}')"`
              : "disabled"
          }>
            <span class="finance-action-icon"><i class="fas ${
              row.icon
            }"></i></span>
            <span><strong>${row.label}</strong><small>${
              row.note
            }</small></span>
            <b>${row.value}</b>
            ${
              row.route
                ? '<i class="fas fa-chevron-right"></i>'
                : '<i class="fas fa-circle-info"></i>'
            }
          </button>`
      )
      .join("");
  }

  if (debtInsights) {
    const aging = [
      { label: "0–2 ngày", min: 0, max: 2, amount: 0 },
      { label: "3–7 ngày", min: 3, max: 7, amount: 0 },
      { label: "Trên 7 ngày", min: 8, max: Infinity, amount: 0 },
    ];
    const debtorMap = new Map();
    outstandingRows.forEach(({ entry, snapshot }) => {
      const age = Math.max(
        0,
        Math.floor(
          (endDate - parseCalendarDate(entry.date)) / 86400000
        )
      );
      const bucket = aging.find((item) => age >= item.min && age <= item.max);
      if (bucket) bucket.amount += snapshot.remaining;
      const name = entry.person || "Không có tên";
      debtorMap.set(
        name,
        (debtorMap.get(name) || 0) + snapshot.remaining
      );
    });
    const topDebtors = Array.from(debtorMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);
    debtInsights.innerHTML =
      outstandingRows.length === 0
        ? '<div class="finance-clean-state"><i class="fas fa-circle-check"></i><strong>Không còn công nợ</strong><span>Không có phiếu cần thu đến cuối kỳ.</span></div>'
        : `
          <div class="debt-aging">
            ${aging
              .map(
                (item) =>
                  `<div><span>${item.label}</span><strong>${money(
                    item.amount
                  )}</strong></div>`
              )
              .join("")}
          </div>
          <div class="debt-attention-line"><span>Nợ từ 3 ngày trở lên</span><strong>${overdueRows.length} phiếu · ${money(
            overdueAmount
          )}</strong></div>
          <div class="top-debtors">
            <h4>Khách còn nợ nhiều</h4>
            ${topDebtors
              .map(
                ([name, amount], index) =>
                  `<div><span><b>${index + 1}</b>${escapeHtml(
                    name
                  )}</span><strong>${money(amount)}</strong></div>`
              )
              .join("")}
          </div>`;
  }

  if (sourceInsights) {
    const topSources = [...financeBreakdown.rows]
      .sort((a, b) => b.netIncome - a.netIncome)
      .slice(0, 5);
    sourceInsights.innerHTML =
      topSources.length === 0
        ? '<div class="empty-state">Chưa có dữ liệu nguồn trong kỳ</div>'
        : `<div class="source-insight-list">
            ${topSources
              .map(
                (source, index) => `
                  <div class="source-insight-row">
                    <span class="source-rank">${index + 1}</span>
                    <span class="source-insight-name"><strong>${escapeHtml(
                      source.name
                    )}</strong><small>${
                      source.role === "self" ? "Bản thân" : "Cấp dưới"
                    } · Tổng ghi ${money(source.total)}</small></span>
                    <span class="source-insight-income"><small>Thực nhận</small><strong>${money(
                      source.netIncome
                    )}</strong></span>
                  </div>`
              )
              .join("")}
          </div>
          <button type="button" class="source-insight-more" onclick="navigateToRoute('finance-source')">Xem và cấu hình tất cả nguồn <i class="fas fa-arrow-right"></i></button>`;
  }
}

function updateFinanceDashboard(route = getCurrentRoute()) {
  if (route === "finance-debt") {
    renderDebtList(
      getDebtEntriesInRange(activeViewDateFrom, activeViewDateTo)
    );
    return;
  }
  if (!["finance-overview", "finance-source"].includes(route)) return;

  const visible = getVisibleEntries();
  const direct = visible.filter(isDirectEntry);
  const imported = visible.filter((entry) => !isDirectEntry(entry));
  const financeBreakdown = getFinanceBreakdown(visible);
  const sumEntries = (entries) =>
    entries.reduce((sum, entry) => sum + (Number(entry.total) || 0), 0);

  const saleCash = sumEntries(
    direct.filter((entry) => entry.paymentType === "cash")
  );
  const saleTransfer = sumEntries(
    direct.filter((entry) => entry.paymentType === "bank_transfer")
  );
  const debtPaymentsInRange = debtPayments.filter((payment) => {
    if (
      payment.reversedAt ||
      payment.paidDate < activeViewDateFrom ||
      payment.paidDate > activeViewDateTo
    ) {
      return false;
    }
    const entry = findEntryById(payment.entryId);
    return (
      entry &&
      (!activeViewSession || entry.session === activeViewSession)
    );
  });
  const debtCash = debtPaymentsInRange
    .filter((payment) => payment.method === "cash")
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  const debtTransfer = debtPaymentsInRange
    .filter((payment) => payment.method === "bank_transfer")
    .reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
  const cash = saleCash + debtCash;
  const transfer = saleTransfer + debtTransfer;
  const debtEntries = getDebtEntriesAsOf(activeViewDateTo);
  const debt = debtEntries.reduce(
    (sum, entry) =>
      sum + getDebtSnapshot(entry, activeViewDateTo).remaining,
    0
  );

  if (route === "finance-overview") {
    setMoneyText("financeGrandTotal", financeBreakdown.total);
    setMoneyText("financeCash", cash);
    setMoneyText("financeTransfer", transfer);
    setMoneyText("financeDebt", debt);
    setMoneyText("financeCollected", cash + transfer);
    setMoneyText("financeImported", sumEntries(imported));
    setMoneyText("financeGrossCommission", financeBreakdown.grossCommission);
    setMoneyText("financeChildCommission", financeBreakdown.childCommission);
    setMoneyText("financeNetIncome", financeBreakdown.netIncome);
    setMoneyText("financeUpstreamPayable", financeBreakdown.upstreamPayable);
    const grossHint = document.getElementById("financeGrossCommissionHint");
    if (grossHint) {
      grossHint.textContent = `Theo tỷ lệ ${financeBreakdown.ownerRate}%`;
    }
    const upstreamHint = document.getElementById("financeUpstreamHint");
    if (upstreamHint) {
      upstreamHint.textContent = `Theo ${100 - financeBreakdown.ownerRate}% tổng ghi`;
    }
    renderFinanceOverviewInsights({
      financeBreakdown,
      cash,
      transfer,
      debtCash,
      debtTransfer,
      debtEntries,
    });
  }
  if (route === "finance-source") syncFinanceSettingsForm();

  const sourceSummary =
    route === "finance-source"
      ? document.getElementById("sourceSummary")
      : null;
  if (sourceSummary) {
    if (financeBreakdown.rows.length === 0) {
      sourceSummary.innerHTML = '<div class="empty-state">Chưa có dữ liệu theo nguồn</div>';
    } else {
      sourceSummary.innerHTML = `
        <div class="finance-source-note">
          <i class="fas fa-circle-info"></i>
          <span>Nguồn không ghi tên người bán được mặc định là <strong>Bản thân</strong>. Người bán khác và phiếu tổng nhập vào được mặc định là <strong>Cấp dưới</strong>.</span>
        </div>
        <div class="source-summary-scroll">
        <table class="source-summary-table finance-source-table">
          <colgroup>
            <col class="source-col-name" />
            <col class="source-col-role" />
            <col class="source-col-count" />
            <col class="source-col-total" />
            <col class="source-col-commission" />
            <col class="source-col-child" />
            <col class="source-col-payout" />
            <col class="source-col-net" />
          </colgroup>
          <thead><tr><th>Nguồn/người bán</th><th class="table-center-head">Phân loại</th><th class="table-center-head">Số phiếu</th><th class="table-number-head">Tổng ghi</th><th class="table-number-head">HH nhận (${financeBreakdown.ownerRate}%)</th><th class="table-number-head">HH nguồn giữ</th><th class="table-number-head">Chênh lệch thưởng</th><th class="table-number-head">Thực nhận</th></tr></thead>
          <tbody>
            ${financeBreakdown.rows
              .sort((a, b) => b.total - a.total)
              .map((source) => {
                const encodedKey = encodeURIComponent(source.key).replace(
                  /'/g,
                  "%27"
                );
                return `
                  <tr>
                    <td class="table-primary-cell"><strong>${escapeHtml(source.name)}</strong><small>${source.imported ? "Phiếu tổng cấp dưới" : "Phiếu ghi trực tiếp"}</small></td>
                    <td class="table-role-cell">
                      <select class="finance-role-select" onchange="updateFinanceSourceConfig('${encodedKey}', 'role', this.value)" ${source.imported ? "disabled" : ""}>
                        <option value="self" ${source.role === "self" ? "selected" : ""}>Bản thân</option>
                        <option value="child" ${source.role === "child" ? "selected" : ""}>Cấp dưới</option>
                      </select>
                    </td>
                    <td class="table-count-cell">${source.count}</td>
                    <td class="finance-money">${source.total.toLocaleString("vi-VN")} đ</td>
                    <td class="finance-money">${source.grossCommission.toLocaleString("vi-VN")} đ</td>
                    <td class="finance-money">
                      ${
                        source.role === "child"
                          ? `<span class="source-rate-editor"><input type="number" min="0" max="${financeBreakdown.ownerRate}" step="0.1" value="${source.childRate}" onchange="updateFinanceSourceConfig('${encodedKey}', 'childRate', this.value)" /><b>%</b></span><small>${source.childCommission.toLocaleString("vi-VN")} đ</small>`
                          : '<span class="finance-not-applicable">—</span>'
                      }
                    </td>
                    <td class="finance-money payout-margin-value${source.payoutMargin < 0 ? " is-negative" : ""}" title="Tiền trúng ${source.hitAmount.toLocaleString("vi-VN")} đ · Cấp trên phải chung ${source.incomingPayout.toLocaleString("vi-VN")} đ · Phải trả khách/cấp dưới ${source.outgoingPayout.toLocaleString("vi-VN")} đ">${source.payoutMargin.toLocaleString("vi-VN")} đ</td>
                    <td class="finance-money finance-net-value" title="Lãi hoa hồng ${source.commissionIncome.toLocaleString("vi-VN")} đ + Chênh lệch thưởng ${source.payoutMargin.toLocaleString("vi-VN")} đ">${source.netIncome.toLocaleString("vi-VN")} đ</td>
                  </tr>`;
              })
              .join("")}
          </tbody>
          <tfoot>
            <tr><td colspan="3"><strong>Tổng cộng</strong></td><td class="finance-money">${financeBreakdown.total.toLocaleString("vi-VN")} đ</td><td class="finance-money">${financeBreakdown.grossCommission.toLocaleString("vi-VN")} đ</td><td class="finance-money">${financeBreakdown.childCommission.toLocaleString("vi-VN")} đ</td><td class="finance-money payout-margin-value${financeBreakdown.payoutMargin < 0 ? " is-negative" : ""}">${financeBreakdown.payoutMargin.toLocaleString("vi-VN")} đ</td><td class="finance-money finance-net-value">${financeBreakdown.netIncome.toLocaleString("vi-VN")} đ</td></tr>
          </tfoot>
        </table>
        </div>`;
    }
  }
}

function updateHomeDashboard() {
  const visible = getVisibleEntries();
  const direct = visible.filter(isDirectEntry);
  const imported = visible.filter((entry) => !isDirectEntry(entry));
  const sumEntries = (entries) =>
    entries.reduce((sum, entry) => sum + (Number(entry.total) || 0), 0);
  const cash = sumEntries(direct.filter((entry) => entry.paymentType === "cash"));
  const transfer = sumEntries(
    direct.filter((entry) => entry.paymentType === "bank_transfer")
  );
  const debt = sumEntries(direct.filter((entry) => entry.paymentType === "debt"));

  setMoneyText("homeRevenue", sumEntries(visible));
  setMoneyText("homeCollected", cash + transfer);
  setMoneyText("homeDebt", debt);
  const importedCount = document.getElementById("homeImportedCount");
  if (importedCount) importedCount.textContent = imported.length.toLocaleString("vi-VN");
}

function renderImportedEntries() {
  const container = document.getElementById("importedEntriesList");
  if (!container) return;
  const imported = getVisibleEntries().filter((entry) => !isDirectEntry(entry));

  if (imported.length === 0) {
    container.innerHTML =
      '<div class="empty-state">Chưa có phiếu cấp dưới trong ngày và buổi đang xem</div>';
    return;
  }

  container.innerHTML = `
    <div class="imported-entry-list">
      ${imported
        .map(
          (entry) => `
            <article class="imported-entry">
              <div class="imported-entry-source">
                <strong>${escapeHtml(entry.sourceProfileName || entry.person || "Cấp dưới")}</strong>
                <small>Mã nguồn: ${escapeHtml(entry.sourceProfileId || "Không xác định")}</small>
              </div>
              <span class="imported-entry-meta">${escapeHtml(entry.date)}</span>
              <span class="imported-entry-meta">${escapeHtml(entry.session || "")}</span>
              <strong class="imported-entry-total">${(Number(entry.total) || 0).toLocaleString("vi-VN")} đ</strong>
            </article>`
        )
        .join("")}
    </div>`;
}

function updateExportSummaryPreview() {
  const preview = document.getElementById("exportSummaryPreview");
  if (!preview) return;

  if (!activeViewSession || activeViewDateFrom !== activeViewDateTo) {
    preview.innerHTML =
      '<div class="empty-state">Hãy chọn đúng một ngày và một buổi Sáng hoặc Chiều để xem trước phiếu xuất</div>';
    return;
  }

  const entries = getSessionEntries(activeViewDate, activeViewSession);
  const items = aggregateEntriesByAnimal(entries);
  const total = items.reduce((sum, item) => sum + item.amount, 0);
  preview.innerHTML = `
    <div class="export-preview-grid">
      <div class="export-preview-item"><span>Nguồn dữ liệu</span><strong>${escapeHtml(localProfile.name || "Chưa đặt tên sổ")}</strong></div>
      <div class="export-preview-item"><span>Ngày / buổi</span><strong>${escapeHtml(activeViewDate)} · ${escapeHtml(activeViewSession)}</strong></div>
      <div class="export-preview-item"><span>Dữ liệu sẽ xuất</span><strong>${items.length} con · ${total.toLocaleString("vi-VN")} đ</strong></div>
    </div>`;
}

function updateStorageUsage() {
  const element = document.getElementById("storageUsage");
  if (!element) return;
  const raw = localStorage.getItem("coNhonData") || "";
  const bytes = new Blob([raw]).size;
  const maxBytes = 5 * 1024 * 1024;
  const percent = Math.min(100, (bytes / maxBytes) * 100);
  const sizeLabel =
    bytes >= 1024 * 1024
      ? `${(bytes / 1024 / 1024).toFixed(2)} MB`
      : `${Math.ceil(bytes / 1024)} KB`;
  element.textContent = `Dữ liệu: ${sizeLabel} (${percent.toFixed(1)}%)`;
  element.classList.toggle("storage-warning", percent >= 70 && percent < 90);
  element.classList.toggle("storage-danger", percent >= 90);
}

function openProfileModal() {
  document.getElementById("profileName").value = localProfile.name || "";
  document.getElementById("profileIdDisplay").textContent = localProfile.id;
  document.getElementById("profileModal").classList.add("show");
}

function closeProfileModal() {
  document.getElementById("profileModal").classList.remove("show");
}

function updateProfileButton() {
  const label = document.getElementById("profileButtonLabel");
  if (label) label.textContent = localProfile.name || "Tên sổ";
  const pageName = document.getElementById("profilePageName");
  if (pageName) pageName.textContent = localProfile.name || "Tên sổ chưa thiết lập";
  updateExportSummaryPreview();
}

function saveLocalProfile() {
  const name = document.getElementById("profileName").value.trim();
  if (!name) {
    showNotification("Vui lòng nhập tên sổ!", "error");
    return;
  }
  const previousName = localProfile.name || "";
  localProfile.name = name;
  localStorage.setItem("coNhonProfile", JSON.stringify(localProfile));
  const sellerInput = document.getElementById("ledgerSeller");
  if (
    sellerInput &&
    (!sellerInput.value.trim() || sellerInput.value.trim() === previousName)
  ) {
    sellerInput.value = name;
  }
  updateProfileButton();
  updateFinanceDashboard();
  closeProfileModal();
  showNotification("Đã lưu hồ sơ sổ!");
}

function getSessionEntries(date, session) {
  return getEntriesForDateSession(date, session);
}

function aggregateEntriesByAnimal(entries) {
  const totals = Array(animals.length).fill(0);
  entries.forEach((entry) => {
    (entry.entries || []).forEach((item) => {
      const index = animalNameToIndex[item.animal];
      if (index !== undefined) totals[index] += Number(item.amount) || 0;
    });
  });
  return totals
    .map((amount, index) => ({
      animalId: animals[index].id,
      animalType: animals[index].type,
      amount,
    }))
    .filter((item) => item.amount > 0);
}

function simpleHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function downloadJson(data, fileName) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function exportSessionSummary() {
  if (!activeViewSession || activeViewDateFrom !== activeViewDateTo) {
    showNotification("Chọn đúng một ngày và một buổi để xuất!", "error");
    return;
  }
  if (!localProfile.name) {
    openProfileModal();
    showNotification("Cần đặt tên sổ trước khi xuất!", "error");
    return;
  }

  const sessionEntries = getSessionEntries(activeViewDate, activeViewSession);
  const items = aggregateEntriesByAnimal(sessionEntries);
  if (items.length === 0) {
    showNotification("Buổi đang chọn chưa có dữ liệu để xuất!", "error");
    return;
  }

  const total = items.reduce((sum, item) => sum + item.amount, 0);
  const summaryKey = `${localProfile.id}|${activeViewDate}|${activeViewSession}`;
  const signature = simpleHash(
    JSON.stringify({ summaryKey, items: items.map(({ animalId, amount }) => ({ animalId, amount })) })
  );
  const data = {
    type: SUMMARY_FILE_TYPE,
    version: DATA_VERSION,
    summaryKey,
    signature,
    source: { id: localProfile.id, name: localProfile.name },
    date: activeViewDate,
    session: activeViewSession,
    exportedAt: new Date().toISOString(),
    items,
    total,
  };

  const safeName = localProfile.name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "so";
  const sessionSlug = activeViewSession === "Sáng" ? "sang" : "chieu";
  downloadJson(data, `phieu-tong-${safeName}-${activeViewDate}-${sessionSlug}.json`);
  showNotification(`Đã xuất phiếu tổng buổi ${activeViewSession.toLowerCase()}!`);
}

function validateSummaryData(data) {
  if (!data || data.type !== SUMMARY_FILE_TYPE) {
    throw new Error("Không phải file phiếu tổng Cổ Nhơn");
  }
  if (!data.source?.id || !data.source?.name || !data.date) {
    throw new Error("File thiếu thông tin nguồn hoặc ngày");
  }
  if (!["Sáng", "Chiều"].includes(data.session)) {
    throw new Error("Buổi trong file không hợp lệ");
  }
  if (!Array.isArray(data.items) || data.items.length === 0) {
    throw new Error("File không có dữ liệu tổng theo con");
  }

  const seenAnimals = new Set();
  const entries = data.items.map((item) => {
    const index = animals.findIndex((animal) => animal.id === String(item.animalId));
    const amount = Number(item.amount);
    if (index === -1 || !Number.isSafeInteger(amount) || amount <= 0) {
      throw new Error("File có con vật hoặc số tiền không hợp lệ");
    }
    if (seenAnimals.has(item.animalId)) {
      throw new Error("File có con vật bị lặp");
    }
    seenAnimals.add(item.animalId);
    return { animal: animals[index].type.toLowerCase(), amount };
  });

  const calculatedTotal = entries.reduce((sum, item) => sum + item.amount, 0);
  if (Number(data.total) !== calculatedTotal) {
    throw new Error("Tổng tiền trong file không khớp chi tiết");
  }
  const summaryKey = `${data.source.id}|${data.date}|${data.session}`;
  const calculatedSignature = simpleHash(
    JSON.stringify({
      summaryKey,
      items: data.items.map((item) => ({
        animalId: String(item.animalId),
        amount: Number(item.amount),
      })),
    })
  );
  if (data.signature && data.signature !== calculatedSignature) {
    throw new Error("Nội dung file đã thay đổi hoặc không còn hợp lệ");
  }
  return { entries, total: calculatedTotal, summaryKey, signature: calculatedSignature };
}

function importSessionSummary(event) {
  const file = event.target.files[0];
  event.target.value = "";
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (loadEvent) => {
    try {
      const data = JSON.parse(loadEvent.target.result);
      const normalized = validateSummaryData(data);
      if (data.source.id === localProfile.id) {
        throw new Error("Không thể import phiếu do chính sổ này xuất");
      }

      const existing = ledgerData.find(
        (entry) =>
          entry.entryType === "child_summary" &&
          entry.sourceProfileId === data.source.id &&
          entry.date === data.date &&
          entry.session === data.session
      );
      if (existing?.sourceSignature === normalized.signature) {
        showNotification("Phiếu tổng này đã được nhập, không cộng trùng!", "error");
        return;
      }

      const actionText = existing
        ? `Cập nhật phiếu cũ ${existing.total.toLocaleString("vi-VN")} đ thành ${normalized.total.toLocaleString("vi-VN")} đ?`
        : `Nhập phiếu tổng ${normalized.total.toLocaleString("vi-VN")} đ?`;
      if (
        !confirm(
          `Nguồn: ${data.source.name}\nNgày: ${data.date}\nBuổi: ${data.session}\n\n${actionText}`
        )
      ) {
        return;
      }

      if (existing) {
        pushUndo({ type: "edit_entry", entry: JSON.parse(JSON.stringify(existing)) });
        existing.person = data.source.name;
        existing.content = normalized.entries
          .map((item) => `${getAnimalNoteName(item.animal)} ${formatAmountForNote(item.amount)}`)
          .join("\n");
        existing.total = normalized.total;
        existing.entries = normalized.entries;
        existing.sourceProfileName = data.source.name;
        existing.sellerSourceId = data.source.id;
        existing.sellerRole = "child";
        existing.sourceSignature = normalized.signature;
        existing.sourceExportedAt = data.exportedAt || new Date().toISOString();
        existing.updatedAt = new Date().toISOString();
      } else {
        const importedEntry = {
          id: createUuid(),
          date: data.date,
          session: data.session,
          person: data.source.name,
          seller: "",
          content: normalized.entries
            .map((item) => `${getAnimalNoteName(item.animal)} ${formatAmountForNote(item.amount)}`)
            .join("\n"),
          total: normalized.total,
          entries: normalized.entries,
          paymentType: null,
          entryType: "child_summary",
          sourceProfileId: data.source.id,
          sourceProfileName: data.source.name,
          sellerSourceId: data.source.id,
          sellerRole: "child",
          sourceSummaryKey: normalized.summaryKey,
          sourceSignature: normalized.signature,
          sourceExportedAt: data.exportedAt || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        ledgerData.unshift(importedEntry);
        pushUndo({ type: "add_entry", entryId: importedEntry.id });
      }

      markDataChanged();
      activeViewDate = data.date;
      activeViewDateFrom = data.date;
      activeViewDateTo = data.date;
      activeViewSession = data.session;
      syncViewControls();
      refreshAllViews();
      saveDataToLocalStorage();
      showNotification(existing ? "Đã cập nhật phiếu cấp dưới!" : "Đã nhập phiếu cấp dưới!");
    } catch (error) {
      showNotification(`Không thể nhập: ${error.message}`, "error");
    }
  };
  reader.readAsText(file);
}

// Cập nhật hàm createGrid để thêm sự kiện DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo grid
  createGrid();

  // Khởi tạo tab switching
  initTabs();
  initViewControls();
  updateProfileButton();

  // Set ngày mặc định là ngày hiện tại
  document.getElementById("ledgerDate").value = getCurrentDate();

  // Tải dữ liệu đã lưu
  loadDataFromLocalStorage();
  initializeDefaultSeller();

  // Khởi tạo search index
  initializeSearchIndex();

  // Thêm event listener với debounce
  const searchInput = document.getElementById("searchInput");
  const debouncedSearch = debounce(searchAnimals, 300);
  searchInput.addEventListener("input", debouncedSearch);

  // Cập nhật gợi ý người ghi + người bán
  updatePersonSuggestions();
  updateSellerSuggestions();

  // Khởi tạo dropdown con vật cho tra cứu xổ
  populateWinAnimalSelect();
  updateWinSellerFilter();
  document.getElementById("winSession")?.addEventListener("change", (event) => {
    activeViewSession = event.target.value;
    syncViewControls();
    refreshAllViews();
  });
  document.getElementById("winSeller")?.addEventListener("change", () => {
    filterWinningEntries(false);
  });
  document
    .getElementById("winAnimalSearch")
    ?.addEventListener("input", (event) => {
      const index = resolveAnimalSearch(event.target.value);
      document.getElementById("winAnimal").value =
        index === -1 ? "" : String(index);
    });

  // Cập nhật undo button
  updateUndoButton();
  renderParsePreview([]);

  setInterval(() => {
    const today = getCurrentDate();
    if (today !== lastKnownToday) {
      const wasViewingToday =
        activeViewDateFrom === lastKnownToday &&
        activeViewDateTo === lastKnownToday;
      lastKnownToday = today;
      if (wasViewingToday) {
        activeViewDate = today;
        activeViewDateFrom = today;
        activeViewDateTo = today;
        document.getElementById("ledgerDate").value = today;
        initializeDefaultSeller(true);
        syncViewControls();
        refreshAllViews();
        showNotification("Đã chuyển sang ngày mới!");
      }
    }
  }, 60000);

  // ===== PHÍM TẮT TOÀN CỤC =====
  document.addEventListener("keydown", (e) => {
    // Ctrl+F: focus ô tìm kiếm
    if ((e.ctrlKey || e.metaKey) && e.key === "f") {
      e.preventDefault();
      const searchInput = document.getElementById("searchInput");
      searchInput.focus();
      searchInput.select();
    }
    // Ctrl+Z: undo (khi không đang focus input/textarea)
    if (
      (e.ctrlKey || e.metaKey) &&
      e.key === "z" &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)
    ) {
      e.preventDefault();
      performUndo();
    }
    // Escape: clear search & blur
    if (e.key === "Escape") {
      const searchInput = document.getElementById("searchInput");
      if (document.activeElement === searchInput) {
        searchInput.value = "";
        searchAnimals();
        searchInput.blur();
      }
    }
  });
});

// Thêm hàm xuất lịch sử
async function exportHistory() {
  try {
    toggleLoading(true);
    // Tạo dữ liệu cho sheet lịch sử ghi sổ (từ ledgerData)
    const ledgerSheetData = [[
      "Ngày",
      "Buổi",
      "Người Mua/Nguồn",
      "Người Bán",
      "Loại Dữ Liệu",
      "Thanh Toán",
      "Nội Dung",
      "Tổng Tiền",
    ]];

    const visibleEntries = getVisibleEntries();
    visibleEntries.forEach((entry) => {
      ledgerSheetData.push([
        entry.date,
        entry.session,
        entry.person,
        entry.seller || "",
        isDirectEntry(entry) ? "Trực tiếp" : "Tổng từ cấp dưới",
        isDirectEntry(entry) ? getPaymentMeta(entry.paymentType).label : "",
        formatEntryAsText(entry),
        entry.total,
      ]);
    });

    // Tạo dữ liệu cho sheet lịch sử từng ô
    const cellsData = [
      ["Con Vật", "Thời Gian", "Buổi", "Người Mua", "Người Bán", "Số Tiền", "Tổng Hiện Tại"],
    ];

    document.querySelectorAll(".cell").forEach((cell, index) => {
      const animalName = animals[index].type;
      const history = cellHistory[index];
      let runningTotal = 0;

      history.forEach((record) => {
        runningTotal += record.amount;
        cellsData.push([
          animalName,
          record.time,
          record.session || "",
          record.person || "",
          record.seller || "",
          record.amount,
          runningTotal,
        ]);
      });
    });

    // Tạo dữ liệu cho sheet tổng hợp
    const summaryData = [["Con Vật", "Tổng Tiền"]];
    document.querySelectorAll(".cell").forEach((cell, index) => {
      const animalName = animals[index].type;
      const total = parseInt(
        cell.querySelector(".item-total").dataset.total || 0
      );
      summaryData.push([animalName, total]);
    });

    // Tạo dữ liệu cho sheet tổng theo người bán
    const sellerSummaryData = [["Người Bán", "Tổng Tiền", "Số Lần Ghi"]];
    const sellerMap = {};
    visibleEntries.filter(isDirectEntry).forEach((entry) => {
      const seller = entry.seller || "(Không rõ)";
      if (!sellerMap[seller]) sellerMap[seller] = { total: 0, count: 0 };
      sellerMap[seller].total += entry.total;
      sellerMap[seller].count += 1;
    });
    Object.entries(sellerMap)
      .sort((a, b) => b[1].total - a[1].total)
      .forEach(([seller, data]) => {
        sellerSummaryData.push([seller, data.total, data.count]);
      });

    // Tạo workbook với nhiều sheet
    const wb = XLSX.utils.book_new();

    // Thêm các sheet
    const ws1 = XLSX.utils.aoa_to_sheet(ledgerSheetData);
    XLSX.utils.book_append_sheet(wb, ws1, "Lịch Sử Ghi Sổ");

    const ws2 = XLSX.utils.aoa_to_sheet(cellsData);
    XLSX.utils.book_append_sheet(wb, ws2, "Lịch Sử Chi Tiết");

    const ws3 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws3, "Tổng Hợp");

    const ws4 = XLSX.utils.aoa_to_sheet(sellerSummaryData);
    XLSX.utils.book_append_sheet(wb, ws4, "Tổng Theo Người Bán");

    // Tạo tên file với ngày giờ hiện tại
    const now = new Date();
    const fileName = `lich_su_co_nhon_${now.getFullYear()}${String(
      now.getMonth() + 1
    ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
      now.getHours()
    ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}.xlsx`;

    // Xuất file
    XLSX.writeFile(wb, fileName);

    showNotification("Xuất file thành công!");
  } catch (error) {
    showNotification("Có lỗi xảy ra khi xuất file!", "error");
  } finally {
    toggleLoading(false);
  }
}

// Thêm các hàm để lưu và tải dữ liệu
function saveDataToLocalStorage() {
  const data = {
    version: DATA_VERSION,
    ledgerData: ledgerData,
    paidEntries: paidEntries,
    drawResults: drawResults,
    payoutStates: payoutStates,
    debtPayments: debtPayments,
    financeSettings: financeSettings,
    lastUpdate: new Date().toLocaleString("vi-VN"),
  };
  try {
    localStorage.setItem("coNhonData", JSON.stringify(data));
    updateLastUpdateBadge();
    updateStorageUsage();
  } catch (error) {
    if (error?.name === "QuotaExceededError") {
      showNotification("Bộ nhớ trình duyệt đã đầy. Hãy xuất sao lưu và dọn dữ liệu cũ!", "error");
    } else {
      showNotification("Không thể lưu dữ liệu vào trình duyệt!", "error");
    }
    throw error;
  }
}

function normalizeLedgerEntry(entry) {
  const normalizedItems = Array.isArray(entry.entries)
    ? entry.entries
        .map((item) => ({
          animal: item.animal,
          amount: Number(item.amount) || 0,
        }))
        .filter(
          (item) =>
            item.amount > 0 && animalNameToIndex[item.animal] !== undefined
        )
    : parseContent(entry.content || "");
  const calculatedTotal = normalizedItems.reduce(
    (sum, item) => sum + item.amount,
    0
  );
  const sellerIdentity = getSellerIdentity(entry.seller || "");
  return {
    ...entry,
    id: entry.id ?? createUuid(),
    date: entry.date || getCurrentDate(),
    session: entry.session === "Chiều" ? "Chiều" : "Sáng",
    person: entry.person || "",
    seller: entry.seller || "",
    sellerSourceId:
      entry.sellerSourceId ||
      (entry.entryType === "child_summary"
        ? entry.sourceProfileId || ""
        : sellerIdentity.sellerSourceId),
    sellerRole:
      entry.sellerRole ||
      (entry.entryType === "child_summary"
        ? "child"
        : sellerIdentity.sellerRole),
    content: entry.content || formatEntryAsText({ entries: normalizedItems }),
    total: calculatedTotal || Number(entry.total) || 0,
    entries: normalizedItems,
    paymentType:
      entry.entryType === "child_summary"
        ? null
        : entry.paymentType || "unknown",
    entryType: entry.entryType || "direct",
    createdAt: entry.createdAt || new Date().toISOString(),
    updatedAt: entry.updatedAt || entry.createdAt || new Date().toISOString(),
  };
}

function loadDataFromLocalStorage() {
  const savedData = localStorage.getItem("coNhonData");
  if (!savedData) {
    rebuildDataIndexes();
    refreshAllViews();
    return;
  }
  try {
    const data = JSON.parse(savedData);
    paidEntries = data.paidEntries || {};
    drawResults = data.drawResults || {};
    payoutStates = data.payoutStates || {};
    debtPayments = Array.isArray(data.debtPayments)
      ? data.debtPayments
          .map((payment) => ({
            ...payment,
            id: payment.id || createUuid(),
            entryId: payment.entryId,
            amount: Number(payment.amount) || 0,
            paidDate: payment.paidDate || getCurrentDate(),
            method:
              payment.method === "bank_transfer"
                ? "bank_transfer"
                : "cash",
            note: payment.note || "",
            createdAt: payment.createdAt || new Date().toISOString(),
            reversedAt: payment.reversedAt || null,
          }))
          .filter((payment) => payment.entryId && payment.amount > 0)
      : [];
    const savedFinanceSettings = data.financeSettings || {};
    const ownerRate = normalizeCommissionRate(
      savedFinanceSettings.ownerRate,
      20
    );
    const ownerPayoutRate = normalizePayoutRate(
      savedFinanceSettings.ownerPayoutRate,
      28
    );
    financeSettings = {
      ownerRate,
      defaultChildRate: Math.min(
        ownerRate,
        normalizeCommissionRate(savedFinanceSettings.defaultChildRate, 15)
      ),
      ownerPayoutRate,
      defaultPayoutRate: Math.min(
        ownerPayoutRate,
        normalizePayoutRate(
          savedFinanceSettings.defaultPayoutRate ??
            savedFinanceSettings.defaultChildPayoutRate,
          27
        )
      ),
      sourceConfigs:
        savedFinanceSettings.sourceConfigs &&
        typeof savedFinanceSettings.sourceConfigs === "object"
          ? savedFinanceSettings.sourceConfigs
          : {},
    };

    if (Array.isArray(data.ledgerData)) {
      ledgerData = data.ledgerData.map(normalizeLedgerEntry);
    } else if (data.ledgerEntries) {
      migrateLedgerEntries(data.ledgerEntries);
      ledgerData = ledgerData.map(normalizeLedgerEntry);
    }

    rebuildDataIndexes();
    refreshAllViews();
    const badge = document.getElementById("lastUpdateBadge");
    if (badge && data.lastUpdate) {
      badge.textContent = `Cập nhật: ${data.lastUpdate}`;
    }
    console.log(`Đã tải dữ liệu (Cập nhật lần cuối: ${data.lastUpdate})`);
  } catch (error) {
    console.error("Không thể tải dữ liệu:", error);
    showNotification("Dữ liệu trình duyệt bị lỗi. Hãy khôi phục từ file sao lưu!", "error");
    refreshAllViews();
  }
}

// Migration: chuyển từ innerHTML cũ sang cấu trúc mới
function migrateLedgerEntries(html) {
  const temp = document.createElement("div");
  temp.innerHTML = html;
  const entries = temp.querySelectorAll(".ledger-entry");

  entries.forEach((el) => {
    const dateEl = el.querySelector(".ledger-entry-date");
    const sessionEl = el.querySelector(".ledger-entry-session");
    const personEl = el.querySelector(".ledger-entry-person");
    const contentEl = el.querySelector(".ledger-entry-content");
    const totalEl = el.querySelector(".ledger-entry-total");

    if (!dateEl || !sessionEl || !personEl || !contentEl || !totalEl) return;

    const date = dateEl.textContent.trim();
    const session = sessionEl.textContent.trim();
    const person = personEl.textContent.trim();
    const content = contentEl.textContent.trim();
    const totalText = totalEl.textContent.replace("Tổng cộng:", "").replace("đ", "").replace(/\./g, "").replace(/,/g, "").trim();
    const total = parseInt(totalText) || 0;

    const parsedEntries = parseContent(content);

    ledgerData.push({
      id: nextEntryId++,
      date,
      session,
      person,
      seller: "",
      content,
      total,
      entries: parsedEntries,
      createdAt: new Date().toISOString(),
    });
  });
}

// Thêm nút xóa dữ liệu
function clearAllData() {
  if (confirm("Bạn có chắc muốn xóa tất cả dữ liệu không?")) {
    try {
      toggleLoading(true);
      localStorage.removeItem("coNhonData");
      showNotification("Đã xóa tất cả dữ liệu!");
      setTimeout(() => location.reload(), 1000);
    } catch (error) {
      showNotification("Có lỗi xảy ra khi xóa dữ liệu!", "error");
      toggleLoading(false);
    }
  }
}

// ===== SAO LƯU & KHÔI PHỤC =====
function exportBackup() {
  const raw = localStorage.getItem('coNhonData');
  if (!raw) {
    showNotification('Không có dữ liệu để xuất!', 'error');
    return;
  }
  const data = JSON.parse(raw);
  data._backupDate = new Date().toLocaleString('vi-VN');
  data._version = `conhon-2026-v${DATA_VERSION}`;
  data._type = "conhon-full-backup";
  data._profile = localProfile;
  const dateStr = new Date().toISOString().slice(0, 10);
  downloadJson(data, `conhon-backup-${dateStr}.json`);
  showNotification(`Đã xuất file sao lưu! (${ledgerData.length} phiếu)`);
}

function importBackup(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Reset input để có thể chọn lại cùng file
  event.target.value = '';

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      // Kiểm tra dữ liệu hợp lệ
      const hasLedgerData = Array.isArray(data.ledgerData);
      const isLegacyBackup =
        Array.isArray(data.cellHistory) || typeof data.ledgerEntries === "string";
      if (!hasLedgerData && !isLegacyBackup) {
        showNotification('File không đúng định dạng sao lưu Cổ Nhơn!', 'error');
        return;
      }

      const existingRaw = localStorage.getItem('coNhonData');
      const hasExisting = existingRaw && JSON.parse(existingRaw).ledgerData?.length > 0;

      const importCount = (data.ledgerData || []).length;
      const backupInfo = data._backupDate ? ` (sao lưu ngày ${data._backupDate})` : '';

      if (hasExisting) {
        const choice = confirm(
          `File chứa ${importCount} phiếu${backupInfo}.\n\n` +
          `Máy này đang có ${ledgerData.length} phiếu.\n\n` +
          `Bấm OK = THAY THẾ toàn bộ (xóa dữ liệu cũ)\n` +
          `Bấm Cancel = HỦY, không nhập`
        );
        if (!choice) return;
      } else {
        if (!confirm(`Nhập ${importCount} phiếu${backupInfo}?`)) return;
      }

      toggleLoading(true);
      localStorage.setItem('coNhonData', JSON.stringify(data));
      if (data._profile?.id) {
        localStorage.setItem("coNhonProfile", JSON.stringify(data._profile));
      }
      showNotification(`Đã nhập thành công ${importCount} phiếu!`);
      setTimeout(() => location.reload(), 800);
    } catch (err) {
      showNotification('Lỗi đọc file: ' + err.message, 'error');
    }
  };
  reader.readAsText(file);
}

// Thêm hàm hiển thị thông báo
function showNotification(message, type = "success") {
  const notification = document.getElementById("notification");
  notification.textContent = message;
  notification.className = `notification ${type} show`;

  setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Thêm hàm hiển thị/ẩn loading
function toggleLoading(show) {
  const loading = document.querySelector(".loading-overlay");
  loading.style.display = show ? "flex" : "none";
}

// Thêm animation cho số tiền khi thay đổi
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const animate = () => {
    current += increment;
    if (
      (increment > 0 && current >= end) ||
      (increment < 0 && current <= end)
    ) {
      element.textContent = `Tổng: ${end.toLocaleString("vi-VN")} đ`;
      return;
    }
    element.textContent = `Tổng: ${Math.floor(current).toLocaleString(
      "vi-VN"
    )} đ`;
    requestAnimationFrame(animate);
  };

  animate();
}

// Tạo index tìm kiếm khi khởi tạo ứng dụng
let searchIndex = [];

function initializeSearchIndex() {
  searchIndex = animals.map((animal, index) => ({
    index,
    searchText: `${animal.name} ${animal.type} ${animal.id}`.toLowerCase(),
    tokens: `${animal.name} ${animal.type} ${animal.id}`
      .toLowerCase()
      .split(/[\s-]+/)
      .filter((token) => token.length > 1),
  }));
}

// Tối ưu hàm tìm kiếm
function searchAnimals() {
  const searchInput = document.getElementById("searchInput");
  const searchText = searchInput.value.toLowerCase().trim();
  const cells = document.querySelectorAll(".cell");

  // Nếu không có từ khóa tìm kiếm, hiển thị tất cả
  if (!searchText) {
    cells.forEach((cell) => {
      cell.style.display = "";
      cell.style.opacity = "1";
    });
    return;
  }

  // Tách từ khóa tìm kiếm thành tokens
  const searchTokens = searchText
    .split(/[\s-]+/)
    .filter((token) => token.length > 1);

  // Tìm kiếm qua index
  const results = searchIndex.filter((item) =>
    searchTokens.every(
      (token) =>
        // Kiểm tra match đầu từ hoặc match toàn bộ
        item.tokens.some((t) => t.startsWith(token)) ||
        item.searchText.includes(token)
    )
  );

  // Cập nhật UI
  requestAnimationFrame(() => {
    cells.forEach((cell, index) => {
      const isMatch = results.some((r) => r.index === index);

      if (isMatch) {
        cell.style.display = "";
        requestAnimationFrame(() => {
          cell.style.opacity = "1";
        });
      } else {
        cell.style.opacity = "0";
        cell.addEventListener(
          "transitionend",
          function hide() {
            cell.style.display = "none";
            cell.removeEventListener("transitionend", hide);
          },
          { once: true }
        );
      }
    });
  });
}

// Thêm debounce để tránh gọi hàm quá nhiều lần
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Thêm style cho animation
const style = document.createElement("style");
style.textContent = `
  .cell {
    transition: opacity 0.3s ease;
    opacity: 1;
  }
  .cell.fade {
    opacity: 0;
  }
  .cell.hidden {
    display: none;
  }
`;
document.head.appendChild(style);

// ===== HELPER: CHỜ ẢNH LOAD XONG =====
async function waitForImages(root) {
  const imgs = Array.from(root.querySelectorAll("img"));
  if (!imgs.length) return;
  await Promise.all(
    imgs.map((img) =>
      img.complete && img.naturalWidth > 0
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.onload = img.onerror = () => resolve();
          })
    )
  );
}

// Thêm hàm xuất ảnh
async function exportAsImage() {
  document.querySelector(".loading-overlay").style.display = "flex";

  try {
    // Tạo container tạm thời để render
    const container = document.createElement("div");
    container.className = "export-container";

    // Thêm tiêu đề
    const header = document.createElement("div");
    header.className = "export-header";
    header.innerHTML = `
      <h1>${APP_CONFIG.title}</h1>
      <p>Thời gian xuất: ${new Date().toLocaleString("vi-VN")}</p>
    `;
    container.appendChild(header);

    // Copy grid và chỉ lấy thông tin cần thiết
    const grid = document.createElement("div");
    grid.className = "export-grid";

    document.querySelectorAll(".cell").forEach((cell) => {
      const exportCell = document.createElement("div");
      exportCell.className = "cell";

      // Copy ảnh — tạo mới với crossOrigin
      const origImg = cell.querySelector("img");
      const img = document.createElement("img");
      img.crossOrigin = "anonymous";
      img.src = origImg.src;
      img.alt = origImg.alt;

      const name = cell.querySelector(".item-name").cloneNode(true);
      const total = cell.querySelector(".item-total").cloneNode(true);

      exportCell.appendChild(img);
      exportCell.appendChild(name);
      exportCell.appendChild(total);
      grid.appendChild(exportCell);
    });

    container.appendChild(grid);

    // Thêm phần tổng
    const totalsSection = document.createElement("div");
    totalsSection.className = "export-totals";

    const columnTotals = document.createElement("div");
    columnTotals.className = "export-column-totals";
    for (let i = 0; i < 6; i++) {
      const total = calculateColumnTotal(i);
      columnTotals.innerHTML += `
        <div class="column-total">
          Cột ${i + 1}: ${total.toLocaleString("vi-VN")} đ
        </div>
      `;
    }
    totalsSection.appendChild(columnTotals);

    const grandTotal = document.createElement("div");
    grandTotal.className = "export-grand-total";
    grandTotal.textContent = document.getElementById("totalAmount").textContent;
    totalsSection.appendChild(grandTotal);

    container.appendChild(totalsSection);

    // Thêm container vào body nhưng ẩn đi
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    // Chờ tất cả ảnh load xong
    await waitForImages(container);

    // Tạo ảnh với html2canvas
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const canvas = await html2canvas(container, {
      scale: dpr,
      backgroundColor: "#f5f6fa",
      logging: false,
      useCORS: true,
      allowTaint: false,
    });

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `co-nhon-${APP_CONFIG.year}_${timestamp}.png`;

    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Dọn dẹp
    document.body.removeChild(container);

    showNotification("Đã xuất ảnh thành công!");
  } catch (error) {
    console.error("Lỗi khi xuất ảnh:", error);
    showNotification("Có lỗi xảy ra khi xuất ảnh!", "error");
  } finally {
    document.querySelector(".loading-overlay").style.display = "none";
  }
}
