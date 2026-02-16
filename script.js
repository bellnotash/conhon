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
// Hỗ trợ: 50k, 50K, 0.5m, 50.000, 50,000, 50000, +50k, -50k
function parseMoney(str) {
  if (!str) return 0;
  str = str.toString().trim().toLowerCase();
  if (!str) return 0;

  // Bỏ dấu +/- (chỉ cho phép số dương)
  str = str.replace(/^[\+\-]/, "").trim();

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

  // Số thuần
  const num = parseInt(str);
  return isNaN(num) ? 0 : Math.abs(num);
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
  const shortForm = type.replace(/^(con |cá |hòn |rồng )/, "");
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
  const cells = document.querySelectorAll(".cell");

  if (action.type === "cell") {
    const cell = cells[action.index];
    const itemTotal = cell.querySelector(".item-total");
    // Trừ lại số tiền đã cộng
    const currentTotal = parseInt(itemTotal.dataset.total || 0);
    const newTotal = currentTotal - action.amount;
    itemTotal.dataset.total = newTotal;
    itemTotal.textContent = `Tổng: ${newTotal.toLocaleString("vi-VN")} đ`;
    // Xóa record cuối trong lịch sử ô
    cellHistory[action.index].pop();
    const history = cell.querySelector(".history");
    updateHistory(history, cellHistory[action.index]);
    calculateColumnTotal(action.index % 6);
    calculateTotal();
    saveDataToLocalStorage();
    showNotification(`Đã hoàn tác: ${animals[action.index].type}`);
  } else if (action.type === "ledger") {
    // Hoàn tác nhiều ô từ ghi sổ
    action.entries.forEach((entry) => {
      const idx = animalNameToIndex[entry.animal];
      if (idx !== undefined) {
        const cell = cells[idx];
        const itemTotal = cell.querySelector(".item-total");
        const currentTotal = parseInt(itemTotal.dataset.total || 0);
        const newTotal = currentTotal - entry.amount;
        itemTotal.dataset.total = newTotal;
        itemTotal.textContent = `Tổng: ${newTotal.toLocaleString("vi-VN")} đ`;
        cellHistory[idx].pop();
        const history = cell.querySelector(".history");
        updateHistory(history, cellHistory[idx]);
        calculateColumnTotal(idx % 6);
      }
    });
    // Xóa ledger entry đầu tiên (mới nhất)
    const ledgerEntries = document.getElementById("ledgerEntries");
    if (ledgerEntries.firstElementChild) {
      ledgerEntries.removeChild(ledgerEntries.firstElementChild);
    }
    calculateTotal();
    saveDataToLocalStorage();
    showNotification("Đã hoàn tác ghi sổ!");
  }
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
    .map((p) => `<option value="${p}">`)
    .join("");
}

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
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
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
    img.src = `images/item${i + 1}.jpg`;
    img.alt = animals[i].type;

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
            ${record.time}
            ${
              record.session
                ? `<span class="history-session">(${record.session})</span>`
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

// Cập nhật hàm processLedgerEntry để lấy giá trị radio button
function processLedgerEntry() {
  const date = document.getElementById("ledgerDate").value;
  const session = document.querySelector('input[name="session"]:checked').value;
  const person = document.getElementById("ledgerPerson").value;
  const content = document.getElementById("ledgerContent").value;

  if (!date || !person || !content) {
    alert("Vui lòng điền đầy đủ thông tin!");
    return;
  }

  // Xử lý nội dung và cập nhật các ô
  const entries = parseContent(content);
  if (entries.length === 0) {
    showNotification("Không tìm thấy con vật hoặc số tiền hợp lệ!", "error");
    return;
  }

  let total = 0;

  // Lưu undo cho toàn bộ lần ghi sổ
  pushUndo({ type: "ledger", entries: entries.map((e) => ({ ...e })) });

  entries.forEach((entry) => {
    const { animal, amount } = entry;
    total += amount;

    // Cập nhật số tiền vào ô tương ứng
    if (animalNameToIndex.hasOwnProperty(animal)) {
      const index = animalNameToIndex[animal];
      const cell = document.querySelectorAll(".cell")[index];
      const itemTotal = cell.querySelector(".item-total");
      const currentTotal = parseInt(itemTotal.dataset.total || 0);
      const newTotal = currentTotal + amount;

      // Cập nhật tổng tiền của ô
      itemTotal.dataset.total = newTotal;
      itemTotal.textContent = `Tổng: ${newTotal.toLocaleString("vi-VN")} đ`;

      // Thêm vào lịch sử của ô
      const currentTime = new Date().toLocaleString("vi-VN");
      cellHistory[index].push({
        time: currentTime,
        session: session,
        amount: amount,
        person: person,
      });

      // Cập nhật hiển thị lịch sử
      const history = cell.querySelector(".history");
      updateHistory(history, cellHistory[index]);

      // Cập nhật tổng cột
      calculateColumnTotal(index % 6);
    }
  });

  // Thêm vào lịch sử ghi sổ
  addToLedgerHistory({
    date,
    session,
    person,
    content,
    total,
  });

  // Lưu tên người ghi gần nhất
  addRecentPerson(person);

  // Reset form
  document.getElementById("ledgerContent").value = "";
  document.getElementById("ledgerTotal").textContent = "0 đ";

  // Auto tính tổng chung
  calculateTotal();

  // Lưu + badge
  saveDataToLocalStorage();
  updateLastUpdateBadge();

  showNotification("Đã ghi sổ thành công!");
}

// Hàm phân tích nội dung ghi sổ (cải tiến)
function parseContent(content) {
  const entries = [];
  const patterns = content
    .toLowerCase()
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);

  patterns.forEach((pattern) => {
    // Tìm số tiền ở cuối chuỗi (hỗ trợ 50k, 100K, 0.5m, 50.000, 50000)
    const moneyMatch = pattern.match(/([\+\-]?\s*\d[\d.,]*[km]?)\s*$/i);
    if (moneyMatch) {
      const amount = parseMoney(moneyMatch[1]);
      if (amount === 0) return;

      // Phần tên con vật (trước số tiền)
      const animalPart = pattern
        .replace(moneyMatch[0], "")
        .trim();
      const animalPartNoDiacritics = removeVietnameseDiacritics(animalPart);

      // Match theo alias dài nhất trước
      for (const [animal, index] of sortedAnimalEntries) {
        if (
          animalPart.includes(animal) ||
          animalPartNoDiacritics.includes(animal)
        ) {
          entries.push({ animal, amount });
          break;
        }
      }
    }
  });

  return entries;
}

// Thêm icons cho session trong lịch sử
function addToLedgerHistory(entry) {
  const ledgerEntries = document.getElementById("ledgerEntries");
  const entryDiv = document.createElement("div");
  entryDiv.className = "ledger-entry";
  const sessionIcon = entry.session === "Sáng" ? "fa-sun" : "fa-moon";

  entryDiv.innerHTML = `
    <div class="ledger-entry-header">
      <span class="ledger-entry-date">${entry.date}</span>
      <span class="ledger-entry-session">
        <i class="fas ${sessionIcon}"></i>
        ${entry.session}
      </span>
      <span class="ledger-entry-person">${entry.person}</span>
    </div>
    <div class="ledger-entry-content">${entry.content}</div>
    <div class="ledger-entry-total">Tổng cộng: ${entry.total.toLocaleString(
      "vi-VN"
    )} đ</div>
  `;

  ledgerEntries.insertBefore(entryDiv, ledgerEntries.firstChild);
}

// Thêm sự kiện lắng nghe thay đổi nội dung để tính tổng
document.getElementById("ledgerContent").addEventListener("input", function () {
  const entries = parseContent(this.value);
  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  document.getElementById("ledgerTotal").textContent = `${total.toLocaleString(
    "vi-VN"
  )} đ`;
});

// ===== TAB SWITCHING =====
function initTabs() {
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      // Deactivate all
      document.querySelectorAll(".tab-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      // Activate clicked
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

// Cập nhật hàm createGrid để thêm sự kiện DOMContentLoaded
document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo grid
  createGrid();

  // Khởi tạo tab switching
  initTabs();

  // Set ngày mặc định là ngày hiện tại
  document.getElementById("ledgerDate").value = getCurrentDate();

  // Tải dữ liệu đã lưu
  loadDataFromLocalStorage();

  // Khởi tạo search index
  initializeSearchIndex();

  // Thêm event listener với debounce
  const searchInput = document.getElementById("searchInput");
  const debouncedSearch = debounce(searchAnimals, 300);
  searchInput.addEventListener("input", debouncedSearch);

  // Cập nhật gợi ý người ghi
  updatePersonSuggestions();

  // Cập nhật undo button
  updateUndoButton();

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
    // Tạo dữ liệu cho sheet lịch sử ghi sổ
    const ledgerEntries = document.querySelectorAll(".ledger-entry");
    const ledgerData = [["Ngày", "Buổi", "Người Ghi", "Nội Dung", "Tổng Tiền"]];

    ledgerEntries.forEach((entry) => {
      const date = entry.querySelector(".ledger-entry-date").textContent;
      const session = entry.querySelector(".ledger-entry-session").textContent;
      const person = entry.querySelector(".ledger-entry-person").textContent;
      const content = entry.querySelector(".ledger-entry-content").textContent;
      const total = entry
        .querySelector(".ledger-entry-total")
        .textContent.replace("Tổng cộng: ", "")
        .replace(" đ", "");

      ledgerData.push([date, session, person, content, total]);
    });

    // Tạo dữ liệu cho sheet lịch sử từng ô
    const cellsData = [
      ["Con Vật", "Thời Gian", "Buổi", "Số Tiền", "Tổng Hiện Tại"],
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
          record.amount.toLocaleString("vi-VN"),
          runningTotal.toLocaleString("vi-VN"),
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
      summaryData.push([animalName, total.toLocaleString("vi-VN")]);
    });

    // Tạo workbook với nhiều sheet
    const wb = XLSX.utils.book_new();

    // Thêm các sheet
    const ws1 = XLSX.utils.aoa_to_sheet(ledgerData);
    XLSX.utils.book_append_sheet(wb, ws1, "Lịch Sử Ghi Sổ");

    const ws2 = XLSX.utils.aoa_to_sheet(cellsData);
    XLSX.utils.book_append_sheet(wb, ws2, "Lịch Sử Chi Tiết");

    const ws3 = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws3, "Tổng Hợp");

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
    cellHistory: cellHistory,
    ledgerEntries: document.getElementById("ledgerEntries").innerHTML,
    lastUpdate: new Date().toLocaleString("vi-VN"),
  };
  localStorage.setItem("coNhonData", JSON.stringify(data));
  updateLastUpdateBadge();
}

function loadDataFromLocalStorage() {
  const savedData = localStorage.getItem("coNhonData");
  if (savedData) {
    const data = JSON.parse(savedData);

    // Khôi phục lịch sử các ô
    cellHistory.splice(0, cellHistory.length, ...data.cellHistory);

    // Khôi phục lịch sử ghi sổ
    document.getElementById("ledgerEntries").innerHTML = data.ledgerEntries;

    // Cập nhật tổng tiền cho từng ô
    document.querySelectorAll(".cell").forEach((cell, index) => {
      const history = cellHistory[index];
      const total = history.reduce((sum, record) => sum + record.amount, 0);
      const itemTotal = cell.querySelector(".item-total");
      itemTotal.dataset.total = total;
      itemTotal.textContent = `Tổng: ${total.toLocaleString("vi-VN")} đ`;

      // Cập nhật lịch sử hiển thị
      const historyDiv = cell.querySelector(".history");
      updateHistory(historyDiv, history);
    });

    // Cập nhật tổng các cột
    for (let i = 0; i < 6; i++) {
      calculateColumnTotal(i);
    }

    // Cập nhật tổng tất cả
    calculateTotal();

    // Cập nhật badge lần cuối
    const badge = document.getElementById("lastUpdateBadge");
    if (badge && data.lastUpdate) {
      badge.textContent = `Cập nhật: ${data.lastUpdate}`;
    }

    console.log(`Đã tải dữ liệu (Cập nhật lần cuối: ${data.lastUpdate})`);
  }
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

// Thêm hàm xuất ảnh
async function exportAsImage() {
  // Hiển thị loading
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

      // Copy ảnh
      const img = cell.querySelector("img").cloneNode(true);

      // Copy tên và loại
      const name = cell.querySelector(".item-name").cloneNode(true);

      // Lấy tổng tiền
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

    // Thêm tổng cột
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

    // Thêm tổng tất cả
    const grandTotal = document.createElement("div");
    grandTotal.className = "export-grand-total";
    grandTotal.textContent = document.getElementById("totalAmount").textContent;
    totalsSection.appendChild(grandTotal);

    container.appendChild(totalsSection);

    // Thêm container vào body nhưng ẩn đi
    container.style.position = "absolute";
    container.style.left = "-9999px";
    document.body.appendChild(container);

    // Tạo ảnh với html2canvas
    const canvas = await html2canvas(container, {
      scale: 2, // Tăng độ phân giải
      backgroundColor: "#fff9f0",
      logging: false,
      useCORS: true, // Cho phép load ảnh từ domain khác
      allowTaint: true,
    });

    // Tạo tên file với timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `co-nhon-${APP_CONFIG.year}_${timestamp}.png`;

    // Tải ảnh
    const link = document.createElement("a");
    link.download = fileName;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // Dọn dẹp
    document.body.removeChild(container);

    // Hiển thị thông báo thành công
    showNotification("Đã xuất ảnh thành công!");
  } catch (error) {
    console.error("Lỗi khi xuất ảnh:", error);
    showNotification("Có lỗi xảy ra khi xuất ảnh!", "error");
  } finally {
    // Ẩn loading
    document.querySelector(".loading-overlay").style.display = "none";
  }
}
