(function () {
  "use strict";

  const paymentToDatabase = {
    cash: "tien_mat",
    bank_transfer: "chuyen_khoan",
    debt: "cong_no",
    unknown: "khong_xac_dinh",
  };

  window.conhonDatabaseWriteCapabilities = [
    "tao_phieu",
    "sua_phieu",
    "xoa_phieu",
    "khoi_phuc_phieu",
    "ket_qua_xo",
    "tra_thuong",
    "cong_no",
    "cau_hinh",
    "nguon_thu_cong",
    "ho_so",
    "nhap_cap_duoi",
  ];
  let lastDeletedEntryId = null;
  const payoutWrites = new Set();

  function databaseContext() {
    const client = window.conhonSupabase;
    const bookId = window.conhonAuth?.book?.ma_so;
    if (!client || !bookId || !window.conhonDatabaseSnapshot) {
      throw new Error("Dữ liệu Supabase chưa tải xong.");
    }
    return { client, bookId };
  }

  async function reloadDatabase() {
    await window.reloadConhonDatabase();
  }

  function showWriteError(action, error) {
    console.error(`${action}:`, error);
    showNotification(
      `${action}: ${error?.message || "Lỗi không xác định"}`,
      "error"
    );
  }

  function setSubmitBusy(busy) {
    const button = document.getElementById("ledgerSubmitButton");
    if (!button) return;
    button.disabled = busy;
    button.innerHTML = busy
      ? '<i class="fas fa-circle-notch fa-spin"></i> Đang lưu'
      : '<i class="fas fa-check-circle"></i> Ghi vào sổ';
  }

  function setEditBusy(busy) {
    const button = document.getElementById("editSaveButton");
    if (!button) return;
    button.disabled = busy;
    button.innerHTML = busy
      ? '<i class="fas fa-circle-notch fa-spin"></i> Đang lưu'
      : '<i class="fas fa-save"></i> Lưu thay đổi';
  }

  function databaseSession(value) {
    return value === "Chiều" ? "chieu" : "sang";
  }

  function databaseDetails(entries) {
    const amountsByAnimal = new Map();
    entries.forEach((entry) => {
      const index = animalNameToIndex[entry.animal];
      const animal = animals[index];
      if (!animal) {
        throw new Error(`Không nhận diện được con "${entry.animal}"`);
      }
      amountsByAnimal.set(
        animal.id,
        (amountsByAnimal.get(animal.id) || 0) + Number(entry.amount)
      );
    });
    return [...amountsByAnimal.entries()].map(([animalId, amount]) => {
      return {
        ma_con: animalId,
        so_tien: amount,
      };
    });
  }

  function selectedSellerSource(scope = "ledger") {
    const snapshot = window.conhonDatabaseSnapshot;
    const selected =
      typeof getSelectedSellerSource === "function"
        ? getSelectedSellerSource(scope)
        : null;
    if (selected?.id && selected?.name) return selected;
    return {
      id: snapshot?.selfSourceId || null,
      name: localProfile.name || "",
      type: "ban_than",
      role: "self",
    };
  }

  function normalizeDuplicateText(value) {
    return removeVietnameseDiacritics(String(value || ""))
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function findLikelyDuplicate({
    sourceId,
    date,
    session,
    person,
    content,
    total,
    excludedEntryId = null,
  }) {
    return ledgerData.find(
      (entry) =>
        String(entry.id) !== String(excludedEntryId || "") &&
        entry.entryType === "direct" &&
        String(entry.sellerSourceId || "") === String(sourceId) &&
        entry.date === date &&
        entry.session === session &&
        normalizeDuplicateText(entry.person) ===
          normalizeDuplicateText(person) &&
        normalizeDuplicateText(entry.content) ===
          normalizeDuplicateText(content) &&
        Number(entry.total || 0) === Number(total || 0)
    );
  }

  function confirmLikelyDuplicate(details) {
    if (!findLikelyDuplicate(details)) return true;
    return confirm(
      "Có một phiếu rất giống phiếu này trong cùng ngày, buổi và người bán. Bạn vẫn muốn lưu?"
    );
  }

  async function createLedgerEntry() {
    const client = window.conhonSupabase;
    const auth = window.conhonAuth;
    const snapshot = window.conhonDatabaseSnapshot;
    if (!client || !auth?.book?.ma_so || !snapshot?.selfSourceId) {
      showNotification(
        "Dữ liệu Supabase chưa tải xong. Hãy thử lại sau.",
        "error"
      );
      return;
    }

    const date = document.getElementById("ledgerDate")?.value;
    const session =
      document.querySelector('input[name="session"]:checked')?.value || "";
    const person = document.getElementById("ledgerPerson")?.value.trim() || "";
    const sellerSource = selectedSellerSource("ledger");
    const seller = sellerSource.name;
    const content =
      document.getElementById("ledgerContent")?.value.trim() || "";
    const paymentType =
      document.querySelector('input[name="paymentType"]:checked')?.value || "";

    if (!date || !session || !person || !content || !paymentType) {
      showNotification("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }
    if (!sellerSource.id || !seller) {
      showNotification("Vui lòng chọn người bán / nguồn hợp lệ.", "error");
      return;
    }

    const parsed = parseContentDetailed(content);
    if (parsed.entries.length === 0) {
      showNotification(
        "Không tìm thấy con vật hoặc số tiền hợp lệ.",
        "error"
      );
      return;
    }
    if (parsed.errors.length > 0) {
      renderParsePreview(parsed.entries, parsed.errors);
      showNotification(
        "Còn nội dung chưa nhận dạng. Vui lòng kiểm tra lại.",
        "error"
      );
      return;
    }
    const total = parsed.entries.reduce(
      (sum, entry) => sum + Number(entry.amount || 0),
      0
    );
    if (
      !confirmLikelyDuplicate({
        sourceId: sellerSource.id,
        date,
        session,
        person,
        content,
        total,
      })
    ) {
      return;
    }

    setSubmitBusy(true);
    try {
      const { data, error } = await client.rpc("luu_phieu_truc_tiep", {
        p_ma_so: auth.book.ma_so,
        p_ma_nguon: sellerSource.id,
        p_ngay_ghi: date,
        p_buoi: databaseSession(session),
        p_ten_khach: person,
        p_ten_nguoi_ban: seller,
        p_noi_dung_goc: content,
        p_hinh_thuc_thanh_toan:
          paymentToDatabase[paymentType] || "khong_xac_dinh",
        p_chi_tiet: databaseDetails(parsed.entries),
        p_ma_phieu_cu: null,
        p_ma_phieu: null,
      });

      if (error) throw error;
      if (!data) throw new Error("Database không trả về mã phiếu mới.");

      addRecentPerson(person);
      addRecentSeller(seller);
      activeViewDate = date;
      activeViewDateFrom = date;
      activeViewDateTo = date;
      activeViewSession = session;

      document.getElementById("ledgerContent").value = "";
      if (sellerSource.type === "cap_duoi_thu_cong") {
        document.getElementById("ledgerPerson").value = "";
      }
      document.getElementById("ledgerTotal").textContent = "0 đ";
      renderParsePreview([]);
      syncViewControls();

      await window.reloadConhonDatabase();
      document.getElementById("ledgerPerson")?.focus();
      showNotification("Đã lưu phiếu vào Supabase.");
    } catch (error) {
      console.error("Không tạo được phiếu Supabase:", error);
      showNotification(
        `Không thể lưu phiếu: ${error?.message || "Lỗi không xác định"}`,
        "error"
      );
    } finally {
      setSubmitBusy(false);
    }
  }

  async function updateLedgerEntry() {
    const client = window.conhonSupabase;
    const auth = window.conhonAuth;
    const snapshot = window.conhonDatabaseSnapshot;
    const entryId = document.getElementById("editEntryId")?.value;
    const entry = findEntryById(entryId);

    if (!client || !auth?.book?.ma_so || !snapshot?.selfSourceId) {
      showNotification(
        "Dữ liệu Supabase chưa tải xong. Hãy thử lại sau.",
        "error"
      );
      return;
    }
    if (!entry || !isDirectEntry(entry)) {
      showNotification("Không tìm thấy phiếu trực tiếp cần sửa.", "error");
      return;
    }

    const date = document.getElementById("editDate")?.value;
    const session =
      document.querySelector('input[name="editSession"]:checked')?.value || "";
    const person = document.getElementById("editPerson")?.value.trim() || "";
    const sellerSource = selectedSellerSource("edit");
    const seller = sellerSource.name;
    const content =
      document.getElementById("editContent")?.value.trim() || "";
    const paymentType =
      document.getElementById("editPaymentType")?.value || "unknown";

    if (!date || !session || !person || !content) {
      showNotification("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }
    if (!sellerSource.id || !seller) {
      showNotification("Vui lòng chọn người bán / nguồn hợp lệ.", "error");
      return;
    }

    const parsed = parseContentDetailed(content);
    if (parsed.entries.length === 0) {
      showNotification(
        "Không tìm thấy con vật hoặc số tiền hợp lệ.",
        "error"
      );
      return;
    }
    if (parsed.errors.length > 0) {
      showNotification("Nội dung sửa còn phần chưa nhận dạng.", "error");
      return;
    }
    const total = parsed.entries.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );
    if (
      !confirmLikelyDuplicate({
        sourceId: sellerSource.id,
        date,
        session,
        person,
        content,
        total,
        excludedEntryId: entry.id,
      })
    ) {
      return;
    }

    setEditBusy(true);
    try {
      const { data, error } = await client.rpc("luu_phieu_truc_tiep", {
        p_ma_so: auth.book.ma_so,
        p_ma_nguon: sellerSource.id,
        p_ngay_ghi: date,
        p_buoi: databaseSession(session),
        p_ten_khach: person,
        p_ten_nguoi_ban: seller,
        p_noi_dung_goc: content,
        p_hinh_thuc_thanh_toan:
          paymentToDatabase[paymentType] || "khong_xac_dinh",
        p_chi_tiet: databaseDetails(parsed.entries),
        p_ma_phieu_cu: entry.legacyId || null,
        p_ma_phieu: String(entry.id),
      });

      if (error) throw error;
      if (!data) throw new Error("Database không trả về mã phiếu.");

      closeEditModal();
      activeViewDate = date;
      activeViewDateFrom = date;
      activeViewDateTo = date;
      activeViewSession = session;
      await window.reloadConhonDatabase();
      showNotification("Đã cập nhật phiếu trên Supabase.");
    } catch (error) {
      console.error("Không sửa được phiếu Supabase:", error);
      showNotification(
        `Không thể sửa phiếu: ${error?.message || "Lỗi không xác định"}`,
        "error"
      );
    } finally {
      setEditBusy(false);
    }
  }

  async function deleteDatabaseEntry(entryId) {
    const entry = findEntryById(entryId);
    if (!entry) return;
    if (!confirm("Bạn có chắc muốn xóa mục ghi sổ này?")) return;

    try {
      const { client, bookId } = databaseContext();
      const { error } = await client.rpc("xoa_mem_phieu", {
        p_ma_so: bookId,
        p_ma_phieu: String(entryId),
      });
      if (error) throw error;
      lastDeletedEntryId = String(entryId);
      await reloadDatabase();
      const undoButton = document.getElementById("undoBtn");
      if (undoButton) undoButton.disabled = false;
      showNotification("Đã xóa mềm phiếu. Có thể bấm Hoàn tác để khôi phục.");
    } catch (error) {
      showWriteError("Không thể xóa phiếu", error);
    }
  }

  async function restoreLastDeletedEntry() {
    if (!lastDeletedEntryId) {
      showNotification("Không có phiếu vừa xóa để hoàn tác.", "error");
      return;
    }
    const entryId = lastDeletedEntryId;
    try {
      const { client, bookId } = databaseContext();
      const { error } = await client.rpc("khoi_phuc_phieu", {
        p_ma_so: bookId,
        p_ma_phieu: entryId,
      });
      if (error) throw error;
      lastDeletedEntryId = null;
      await reloadDatabase();
      const undoButton = document.getElementById("undoBtn");
      if (undoButton) undoButton.disabled = true;
      showNotification("Đã khôi phục phiếu vừa xóa.");
    } catch (error) {
      showWriteError("Không thể khôi phục phiếu", error);
    }
  }

  async function confirmDatabaseDraw() {
    const draw = getCurrentDrawContext();
    if (!draw) {
      showNotification("Hãy chọn đúng một ngày để xác nhận con xổ.", "error");
      return;
    }
    const search = document.getElementById("winAnimalSearch");
    const animalIndex = resolveAnimalSearch(search?.value);
    if (animalIndex === -1) {
      showNotification("Hãy chọn đúng một con trong danh sách gợi ý.", "error");
      return;
    }
    const nextAnimal = animals[animalIndex];
    const existing = drawResults[draw.drawKey];
    if (
      existing &&
      String(existing.animalId) !== String(nextAnimal.id) &&
      !confirm(
        `Đổi con xổ ${formatDateForDisplay(draw.date)} ${draw.session} thành ${getAnimalSearchLabel(animalIndex)}?`
      )
    ) {
      return;
    }

    const button = document.getElementById("confirmWinningAnimalBtn");
    if (button) button.disabled = true;
    try {
      const { client, bookId } = databaseContext();
      const { data, error } = await client.rpc("xac_nhan_ket_qua_xo", {
        p_ma_so: bookId,
        p_ngay_xo: draw.date,
        p_buoi: databaseSession(draw.session),
        p_ma_con: String(nextAnimal.id),
      });
      if (error) throw error;
      if (
        existing &&
        String(existing.animalId) !== String(nextAnimal.id)
      ) {
        Object.keys(payoutStates)
          .filter((key) => key.startsWith(`${draw.drawKey}|`))
          .forEach((key) => delete payoutStates[key]);
      }
      drawResults[draw.drawKey] = {
        databaseId: String(data),
        animalId: String(nextAnimal.id),
        confirmedAt: existing?.confirmedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      syncPayoutLookupForActiveView();
      updateFinanceDashboard();
      showNotification(`Đã lưu kết quả ${draw.session.toLowerCase()} vào Supabase.`);
    } catch (error) {
      showWriteError("Không thể xác nhận kết quả xổ", error);
    } finally {
      if (button) button.disabled = false;
    }
  }

  function getPayoutWriteState(entryId) {
    const confirmedDraw = getConfirmedDraw();
    const entry = findEntryById(entryId);
    if (!confirmedDraw || !entry || !confirmedDraw.result?.databaseId) {
      throw new Error("Chưa có kết quả xổ hợp lệ trong database.");
    }
    const hitSum = (entry.entries || [])
      .filter(
        (item) =>
          animalNameToIndex[item.animal] === confirmedDraw.animalIndex
      )
      .reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
    if (hitSum <= 0) throw new Error("Phiếu không trúng kết quả đã chọn.");
    const { state } = ensurePayoutState(
      confirmedDraw,
      entry,
      confirmedDraw.animalIndex,
      hitSum
    );
    return { confirmedDraw, entry, state };
  }

  async function writePayout(entryId, changes) {
    const key = String(entryId);
    if (payoutWrites.has(key)) return;
    payoutWrites.add(key);
    try {
      const { client, bookId } = databaseContext();
      const { confirmedDraw, entry, state } = getPayoutWriteState(entryId);
      const rate = Number(changes.rate ?? state.rate);
      const paid = Boolean(changes.paid ?? state.paid);
      const rateMode = changes.rateMode || state.rateMode || "default";
      if (![27, 28, 29, 30].includes(rate)) {
        throw new Error("Hệ số trả phải từ 27 đến 30.");
      }
      if (state.paid && paid && rate !== Number(state.rate)) {
        throw new Error("Hãy chuyển về chưa chung trước khi đổi hệ số.");
      }
      const { error } = await client.rpc("cap_nhat_tra_thuong", {
        p_ma_so: bookId,
        p_ma_ket_qua: confirmedDraw.result.databaseId,
        p_ma_phieu: String(entry.id),
        p_he_so_tra: rate,
        p_che_do_he_so: rateMode === "manual" ? "thu_cong" : "mac_dinh",
        p_da_tra: paid,
      });
      if (error) throw error;
      state.rate = rate;
      state.rateMode = rateMode === "manual" ? "manual" : "default";
      state.paid = paid;
      state.paidAt = paid ? new Date().toISOString() : null;
      state.snapshot = paid
        ? buildPayoutSnapshot(
            entry,
            confirmedDraw,
            confirmedDraw.animalIndex,
            (entry.entries || [])
              .filter(
                (item) =>
                  animalNameToIndex[item.animal] ===
                  confirmedDraw.animalIndex
              )
              .reduce(
                (sum, item) => sum + (Number(item.amount) || 0),
                0
              ),
            rate
          )
        : null;
      filterWinningEntries(false);
      updateFinanceDashboard();
      showNotification(
        paid
          ? "Đã đánh dấu đã chung trên Supabase."
          : changes.paid === false
            ? "Đã chuyển về chưa chung."
            : "Đã cập nhật hệ số trả thưởng."
      );
    } catch (error) {
      showWriteError("Không thể cập nhật trả thưởng", error);
      filterWinningEntries(false);
    } finally {
      payoutWrites.delete(key);
    }
  }

  function updateDatabasePayoutRate(entryId, value) {
    const rate = Number(value);
    if (![27, 28, 29, 30].includes(rate)) return;
    return writePayout(entryId, { rate, rateMode: "manual" });
  }

  function toggleDatabasePaidStatus(entryId) {
    try {
      const { state } = getPayoutWriteState(entryId);
      return writePayout(entryId, { paid: !state.paid });
    } catch (error) {
      showWriteError("Không thể cập nhật trả thưởng", error);
      return undefined;
    }
  }

  async function saveDatabaseDebtPayment() {
    const entry = findEntryById(
      document.getElementById("debtPaymentEntryId")?.value
    );
    if (!entry || entry.paymentType !== "debt") return;
    const amount = Number(document.getElementById("debtPaymentAmount")?.value);
    const paidDate = document.getElementById("debtPaymentDate")?.value;
    const method = document.getElementById("debtPaymentMethod")?.value;
    const note = document.getElementById("debtPaymentNote")?.value.trim() || "";
    const snapshot = getDebtSnapshot(entry);
    if (!Number.isSafeInteger(amount) || amount <= 0) {
      showNotification("Số tiền thu nợ phải là số nguyên lớn hơn 0.", "error");
      return;
    }
    if (amount > snapshot.remaining) {
      showNotification("Số tiền nhận lớn hơn công nợ còn lại.", "error");
      return;
    }
    if (!paidDate || paidDate < entry.date || paidDate > getCurrentDate()) {
      showNotification("Ngày nhận tiền không hợp lệ.", "error");
      return;
    }
    if (!["cash", "bank_transfer"].includes(method)) return;

    const button = document.getElementById("saveDebtPaymentBtn");
    if (button) button.disabled = true;
    try {
      const { client, bookId } = databaseContext();
      const { error } = await client.rpc("ghi_thu_cong_no", {
        p_ma_so: bookId,
        p_ma_phieu: String(entry.id),
        p_so_tien: amount,
        p_ngay_thu: paidDate,
        p_hinh_thuc: method === "bank_transfer" ? "chuyen_khoan" : "tien_mat",
        p_ghi_chu: note,
        p_ma_giao_dich_cu: null,
      });
      if (error) throw error;
      await reloadDatabase();
      const refreshed = findEntryById(entry.id);
      if (refreshed) {
        renderDebtPaymentModal(refreshed);
        document.getElementById("debtPaymentAmount").value =
          getDebtSnapshot(refreshed).remaining || "";
      }
      showNotification("Đã ghi nhận thu công nợ vào Supabase.");
    } catch (error) {
      showWriteError("Không thể ghi thu công nợ", error);
    } finally {
      if (button) button.disabled = false;
    }
  }

  async function reverseDatabaseDebtPayment(paymentId) {
    const payment = debtPayments.find(
      (item) => String(item.id) === String(paymentId)
    );
    if (!payment || payment.reversedAt) return;
    if (!confirm("Hủy lần thu nợ này và cộng lại công nợ cho khách?")) return;
    try {
      const { client, bookId } = databaseContext();
      const { error } = await client.rpc("huy_thu_cong_no", {
        p_ma_so: bookId,
        p_ma_lan_thu: String(paymentId),
        p_ly_do: "Hủy từ giao diện quản lý",
      });
      if (error) throw error;
      await reloadDatabase();
      const entry = findEntryById(payment.entryId);
      if (entry) renderDebtPaymentModal(entry);
      showNotification("Đã hủy giao dịch thu nợ.");
    } catch (error) {
      showWriteError("Không thể hủy giao dịch thu nợ", error);
    }
  }

  async function saveDatabaseFinanceSettings() {
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
    if (childRate > ownerRate || payoutRate > ownerPayoutRate) {
      showNotification(
        "Mức trả cấp dưới/khách không được lớn hơn mức bạn nhận.",
        "error"
      );
      syncFinanceSettingsForm();
      return;
    }
    try {
      const { client, bookId } = databaseContext();
      const { error } = await client
        .from("cau_hinh_so")
        .update({
          ty_le_chu_so: ownerRate,
          ty_le_cap_duoi_mac_dinh: childRate,
          he_so_nhan_tu_cap_tren: ownerPayoutRate,
          he_so_tra_mac_dinh: payoutRate,
        })
        .eq("ma_so", bookId)
        .select("ma_so")
        .single();
      if (error) throw error;
      await reloadDatabase();
      showNotification("Đã lưu cấu hình vào Supabase.");
    } catch (error) {
      showWriteError("Không thể lưu cấu hình", error);
    }
  }

  function setManualSellerBusy(busy) {
    const button = document.getElementById("manualSellerSaveButton");
    const input = document.getElementById("manualSellerName");
    if (button) {
      button.disabled = busy;
      button.innerHTML = busy
        ? '<i class="fas fa-circle-notch fa-spin"></i> Đang thêm'
        : '<i class="fas fa-check"></i> Thêm và chọn';
    }
    if (input) input.disabled = busy;
  }

  async function saveManualSellerSource() {
    const name = document.getElementById("manualSellerName")?.value.trim();
    if (!name) {
      showNotification("Vui lòng nhập tên người bán.", "error");
      return;
    }
    if (name.length > 80) {
      showNotification("Tên người bán không được vượt quá 80 ký tự.", "error");
      return;
    }

    setManualSellerBusy(true);
    try {
      const { client, bookId } = databaseContext();
      const { data, error } = await client.rpc(
        "lay_hoac_tao_nguon_thu_cong",
        {
          p_ma_so: bookId,
          p_ten_nguon: name,
        }
      );
      if (error) throw error;
      const source = Array.isArray(data) ? data[0] : data;
      if (!source?.ma_nguon) {
        throw new Error("Database không trả về nguồn vừa tạo.");
      }

      await reloadDatabase();
      if (typeof refreshSellerSourceControls === "function") {
        refreshSellerSourceControls({
          ledgerSourceId: String(source.ma_nguon),
        });
      }
      closeManualSellerModal();
      document.getElementById("ledgerPerson")?.focus();
      showNotification(
        source.loai_nguon === "ban_than"
          ? "Tên này là sổ của bạn. Đã chuyển về nguồn bản thân."
          : `Đã chọn nguồn cấp dưới “${source.ten_nguon}”.`
      );
    } catch (error) {
      showWriteError("Không thể thêm người bán cấp dưới", error);
    } finally {
      setManualSellerBusy(false);
    }
  }

  async function updateDatabaseSourceConfig(encodedKey, field, value) {
    const key = decodeURIComponent(encodedKey);
    const snapshot = window.conhonDatabaseSnapshot;
    if (field === "role") {
      showNotification("Nguồn đã nhập được cố định là cấp dưới.", "error");
      updateFinanceDashboard();
      return;
    }
    if (field !== "childRate") return;
    const sourceId = key.startsWith("child:") ? key.slice(6) : "";
    const source = snapshot?.sources?.find(
      (item) =>
        String(item.ma_ho_so_ngoai || item.ma_nguon) === String(sourceId)
    );
    const rate = normalizeCommissionRate(
      value,
      financeSettings.defaultChildRate
    );
    if (!source || rate > financeSettings.ownerRate) {
      showNotification("Nguồn hoặc tỷ lệ hoa hồng không hợp lệ.", "error");
      updateFinanceDashboard();
      return;
    }
    try {
      const { client, bookId } = databaseContext();
      const { error } = await client
        .from("nguon_so")
        .update({ ty_le_hoa_hong: rate })
        .eq("ma_so", bookId)
        .eq("ma_nguon", source.ma_nguon)
        .select("ma_nguon")
        .single();
      if (error) throw error;
      await reloadDatabase();
      showNotification("Đã cập nhật tỷ lệ của nguồn.");
    } catch (error) {
      showWriteError("Không thể cập nhật nguồn", error);
    }
  }

  async function saveDatabaseProfile() {
    const name = document.getElementById("profileName")?.value.trim();
    if (!name) {
      showNotification("Vui lòng nhập tên sổ.", "error");
      return;
    }
    try {
      const { client, bookId } = databaseContext();
      const { error } = await client
        .from("so_ghi")
        .update({ ten_so: name })
        .eq("ma_so", bookId)
        .select("ma_so, ten_so")
        .single();
      if (error) throw error;
      window.conhonAuth.book.ten_so = name;
      await reloadDatabase();
      closeProfileModal();
      showNotification("Đã lưu tên sổ vào Supabase.");
    } catch (error) {
      showWriteError("Không thể lưu tên sổ", error);
    }
  }

  async function importDatabaseChildSummary(event) {
    const input = event.target;
    const file = input.files?.[0];
    input.value = "";
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const normalized = validateSummaryData(data);
      if (String(data.source.id) === String(localProfile.id)) {
        throw new Error("Không thể nhập phiếu do chính sổ này xuất.");
      }
      const existing = ledgerData.find(
        (entry) =>
          entry.entryType === "child_summary" &&
          String(entry.sourceProfileId) === String(data.source.id) &&
          entry.date === data.date &&
          entry.session === data.session
      );
      if (existing?.sourceSignature === normalized.signature) {
        throw new Error("Phiếu tổng này đã được nhập, không cộng trùng.");
      }
      const actionText = existing
        ? `Cập nhật phiếu cũ thành ${normalized.total.toLocaleString("vi-VN")} đ?`
        : `Nhập phiếu tổng ${normalized.total.toLocaleString("vi-VN")} đ?`;
      if (
        !confirm(
          `Nguồn: ${data.source.name}\nNgày: ${data.date}\nBuổi: ${data.session}\n\n${actionText}`
        )
      ) {
        return;
      }

      const { client, bookId } = databaseContext();
      let source = window.conhonDatabaseSnapshot.sources.find(
        (item) =>
          String(item.ma_ho_so_ngoai) === String(data.source.id)
      );
      if (!source) {
        const { data: inserted, error: sourceError } = await client
          .from("nguon_so")
          .insert({
            ma_so: bookId,
            ten_nguon: String(data.source.name).trim(),
            loai_nguon: "cap_duoi_nhap_file",
            vai_tro_tai_chinh: "cap_duoi",
            ma_ho_so_ngoai: String(data.source.id),
            ty_le_hoa_hong: financeSettings.defaultChildRate,
          })
          .select("ma_nguon")
          .single();
        if (sourceError) throw sourceError;
        source = inserted;
      }
      const details = data.items.map((item) => ({
        ma_con: String(item.animalId),
        so_tien: Number(item.amount),
      }));
      const { error } = await client.rpc("nhap_phieu_cap_duoi", {
        p_ma_so: bookId,
        p_ma_nguon: source.ma_nguon,
        p_ngay_ghi: data.date,
        p_buoi: databaseSession(data.session),
        p_khoa_tom_tat: normalized.summaryKey,
        p_chu_ky: normalized.signature,
        p_thoi_diem_xuat: data.exportedAt || new Date().toISOString(),
        p_phien_ban_tep: Number(data.version) || 1,
        p_ten_tep: file.name,
        p_chi_tiet: details,
        p_du_lieu_goc: data,
      });
      if (error) throw error;
      activeViewDate = data.date;
      activeViewDateFrom = data.date;
      activeViewDateTo = data.date;
      activeViewSession = data.session;
      await reloadDatabase();
      showNotification(
        existing ? "Đã cập nhật phiếu cấp dưới." : "Đã nhập phiếu cấp dưới."
      );
    } catch (error) {
      showWriteError("Không thể nhập phiếu cấp dưới", error);
    }
  }

  window.processLedgerEntry = createLedgerEntry;
  window.saveEditedEntry = updateLedgerEntry;
  window.deleteLedgerEntry = deleteDatabaseEntry;
  window.performUndo = restoreLastDeletedEntry;
  window.confirmWinningAnimal = confirmDatabaseDraw;
  window.updatePayoutRate = updateDatabasePayoutRate;
  window.togglePaidStatus = toggleDatabasePaidStatus;
  window.saveDebtPayment = saveDatabaseDebtPayment;
  window.reverseDebtPayment = reverseDatabaseDebtPayment;
  window.saveFinanceSettingsFromForm = saveDatabaseFinanceSettings;
  window.saveManualSellerSource = saveManualSellerSource;
  window.updateFinanceSourceConfig = updateDatabaseSourceConfig;
  window.saveLocalProfile = saveDatabaseProfile;
  window.importSessionSummary = importDatabaseChildSummary;
  window.addEventListener("conhon:database-loaded", () => {
    const importInput = document.getElementById("summaryImportInput");
    if (importInput) importInput.disabled = false;
  });
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("database-create-enabled");
    const importInput = document.getElementById("summaryImportInput");
    if (importInput) importInput.disabled = false;
  });
})();
