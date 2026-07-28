const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const source = fs.readFileSync(
  path.join(__dirname, "..", "script.js"),
  "utf8"
);

function extractFunction(name) {
  const marker = `function ${name}(`;
  const start = source.indexOf(marker);
  assert.notEqual(start, -1, `Không tìm thấy hàm ${name}`);
  const bodyStart = source.indexOf("{", start);
  let depth = 0;
  for (let index = bodyStart; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`Không đọc hết được hàm ${name}`);
}

const entries = [
  {
    id: "old",
    date: "2026-07-20",
    session: "Sáng",
    paymentType: "debt",
    entryType: "direct",
    createdAt: "2026-07-20T08:00:00.000Z",
  },
  {
    id: "start",
    date: "2026-07-21",
    session: "Sáng",
    paymentType: "debt",
    entryType: "direct",
    createdAt: "2026-07-21T08:00:00.000Z",
  },
  {
    id: "same-day-morning",
    date: "2026-07-27",
    session: "Sáng",
    paymentType: "debt",
    entryType: "direct",
    createdAt: "2026-07-27T10:00:00.000Z",
  },
  {
    id: "same-day-afternoon-old",
    date: "2026-07-27",
    session: "Chiều",
    paymentType: "debt",
    entryType: "direct",
    createdAt: "2026-07-27T09:00:00.000Z",
  },
  {
    id: "same-day-afternoon-new",
    date: "2026-07-27",
    session: "Chiều",
    paymentType: "debt",
    entryType: "direct",
    createdAt: "2026-07-27T11:00:00.000Z",
  },
  {
    id: "after",
    date: "2026-07-28",
    session: "Sáng",
    paymentType: "debt",
    entryType: "direct",
    createdAt: "2026-07-28T08:00:00.000Z",
  },
  {
    id: "cash",
    date: "2026-07-27",
    session: "Sáng",
    paymentType: "cash",
    entryType: "direct",
    createdAt: "2026-07-27T12:00:00.000Z",
  },
  {
    id: "child",
    date: "2026-07-27",
    session: "Sáng",
    paymentType: "debt",
    entryType: "child_summary",
    createdAt: "2026-07-27T12:00:00.000Z",
  },
];

const context = {
  ledgerData: entries,
  activeViewDateFrom: "2026-07-21",
  activeViewDateTo: "2026-07-27",
  activeViewSession: "",
  isDirectEntry: (entry) => entry.entryType !== "child_summary",
};
vm.createContext(context);
vm.runInContext(
  [
    extractFunction("getDebtEntriesAsOf"),
    extractFunction("getDebtEntriesInRange"),
    extractFunction("compareDebtRowsByRecordedTime"),
    "this.getDebtEntriesAsOf = getDebtEntriesAsOf;",
    "this.getDebtEntriesInRange = getDebtEntriesInRange;",
    "this.compareDebtRowsByRecordedTime = compareDebtRowsByRecordedTime;",
  ].join("\n"),
  context
);

const ids = (rows) => rows.map((entry) => entry.id);

assert.deepEqual(
  ids(context.getDebtEntriesInRange("2026-07-21", "2026-07-27")),
  [
    "start",
    "same-day-morning",
    "same-day-afternoon-old",
    "same-day-afternoon-new",
  ],
  "Khoảng ngày phải bao gồm hai đầu và loại phiếu ngoài khoảng"
);

assert.deepEqual(
  ids(context.getDebtEntriesInRange("2026-07-27", "2026-07-27")),
  [
    "same-day-morning",
    "same-day-afternoon-old",
    "same-day-afternoon-new",
  ],
  "Chọn một ngày chỉ được trả về phiếu đúng ngày đó"
);

context.activeViewSession = "Sáng";
assert.deepEqual(
  ids(context.getDebtEntriesInRange("2026-07-21", "2026-07-27")),
  ["start", "same-day-morning"],
  "Bộ lọc buổi phải tiếp tục được áp dụng"
);

context.activeViewSession = "";
assert.deepEqual(
  ids(context.getDebtEntriesAsOf("2026-07-27")),
  [
    "old",
    "start",
    "same-day-morning",
    "same-day-afternoon-old",
    "same-day-afternoon-new",
  ],
  "Phép tính công nợ tồn đến cuối kỳ phải tiếp tục giữ các phiếu cũ"
);

const sortedRows = entries
  .filter(
    (entry) =>
      entry.paymentType === "debt" && entry.entryType === "direct"
  )
  .map((entry) => ({ entry, snapshot: { remaining: 0 } }))
  .sort(context.compareDebtRowsByRecordedTime);

assert.deepEqual(
  sortedRows.map((row) => row.entry.id),
  [
    "after",
    "same-day-afternoon-new",
    "same-day-afternoon-old",
    "same-day-morning",
    "start",
    "old",
  ],
  "Thứ tự phải theo ngày, buổi và thời gian tạo thay vì số tiền còn nợ"
);

console.log("OK: bộ lọc và thứ tự công nợ hoạt động đúng kế hoạch.");
