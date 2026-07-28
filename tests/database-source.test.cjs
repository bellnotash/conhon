const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");

const script = read("script.js");
const dataLayer = read("supabase-data.js");
const writeLayer = read("supabase-writes.js");
const authLayer = read("supabase-auth.js");
const html = read("index.html");

assert.doesNotMatch(script, /localStorage\.(?:getItem|setItem)\(["']coNhonData/);
assert.doesNotMatch(script, /localStorage\.(?:getItem|setItem)\(["']coNhonProfile/);
assert.doesNotMatch(authLayer, /coNhonConnectedBook/);
assert.doesNotMatch(script, /loadDataFromLocalStorage/);
assert.doesNotMatch(script, /saveDataToLocalStorage/);

const backupStart = script.indexOf("function exportBackup()");
const backupEnd = script.indexOf("function importBackup", backupStart);
assert.notEqual(backupStart, -1);
assert.notEqual(backupEnd, -1);
const backupSource = script.slice(backupStart, backupEnd);
assert.match(backupSource, /window\.conhonDatabaseReady/);
assert.match(backupSource, /window\.conhonDatabaseSnapshot/);
assert.match(backupSource, /conhon-supabase-backup/);
assert.doesNotMatch(backupSource, /localStorage/);

assert.match(dataLayer, /window\.conhonDatabaseReady = true/);
assert.match(dataLayer, /window\.conhonDatabaseSnapshot = null/);
assert.match(dataLayer, /ledgerData = \[\]/);
assert.match(html, /auth-locked database-unavailable/);
assert.doesNotMatch(html, /id="importFileInput"/);

[
  "processLedgerEntry",
  "saveEditedEntry",
  "deleteLedgerEntry",
  "performUndo",
  "confirmWinningAnimal",
  "saveDebtPayment",
  "saveFinanceSettingsFromForm",
  "saveLocalProfile",
  "importSessionSummary",
].forEach((name) => {
  assert.match(
    writeLayer,
    new RegExp(`window\\.${name}\\s*=`),
    `${name} phải được điều hướng sang Supabase`
  );
});

console.log(
  "OK: Supabase là nguồn dữ liệu nghiệp vụ duy nhất; không còn fallback localStorage."
);
