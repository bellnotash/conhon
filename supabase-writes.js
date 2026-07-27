(function () {
  "use strict";

  const paymentToDatabase = {
    cash: "tien_mat",
    bank_transfer: "chuyen_khoan",
    debt: "cong_no",
    unknown: "khong_xac_dinh",
  };

  window.conhonDatabaseWriteCapabilities = ["tao_phieu", "sua_phieu"];

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

  function isOwnerSeller(seller) {
    return (
      removeVietnameseDiacritics(seller).toLowerCase() ===
      removeVietnameseDiacritics(localProfile.name || "").toLowerCase()
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
    const seller =
      document.getElementById("ledgerSeller")?.value.trim() ||
      localProfile.name ||
      "";
    const content =
      document.getElementById("ledgerContent")?.value.trim() || "";
    const paymentType =
      document.querySelector('input[name="paymentType"]:checked')?.value || "";

    if (!date || !session || !person || !content || !paymentType) {
      showNotification("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }
    if (!isOwnerSeller(seller)) {
      showNotification(
        "Giai đoạn này chỉ mở ghi phiếu của chính sổ thiên.",
        "error"
      );
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

    setSubmitBusy(true);
    try {
      const { data, error } = await client.rpc("luu_phieu_truc_tiep", {
        p_ma_so: auth.book.ma_so,
        p_ma_nguon: snapshot.selfSourceId,
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
      document.getElementById("ledgerTotal").textContent = "0 đ";
      renderParsePreview([]);
      syncViewControls();

      await window.reloadConhonDatabase();
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
    const seller =
      document.getElementById("editSeller")?.value.trim() ||
      localProfile.name ||
      "";
    const content =
      document.getElementById("editContent")?.value.trim() || "";
    const paymentType =
      document.getElementById("editPaymentType")?.value || "unknown";

    if (!date || !session || !person || !content) {
      showNotification("Vui lòng điền đầy đủ thông tin.", "error");
      return;
    }
    if (!isOwnerSeller(seller)) {
      showNotification(
        "Giai đoạn này chỉ mở sửa phiếu của chính sổ thiên.",
        "error"
      );
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

    setEditBusy(true);
    try {
      const { data, error } = await client.rpc("luu_phieu_truc_tiep", {
        p_ma_so: auth.book.ma_so,
        p_ma_nguon: snapshot.selfSourceId,
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

  window.processLedgerEntry = createLedgerEntry;
  window.saveEditedEntry = updateLedgerEntry;
  document.addEventListener("DOMContentLoaded", () => {
    document.body.classList.add("database-create-enabled");
  });
})();
