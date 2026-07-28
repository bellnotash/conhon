(function () {
  "use strict";

  const PAGE_SIZE = 1000;
  let loadingBookId = null;
  let loadedBookId = null;
  let loadingRangeKey = null;
  let loadedRangeKey = null;
  let pendingRangeRequest = null;
  let cachedMetadataBookId = null;
  let cachedSources = null;
  let cachedSettingsRows = null;
  window.conhonDatabaseReady = false;

  const paymentToLocal = {
    tien_mat: "cash",
    chuyen_khoan: "bank_transfer",
    cong_no: "debt",
    khong_xac_dinh: "unknown",
  };

  const readonlyFunctions = [
    "clearAllData",
    "importBackup",
  ];

  function vietnameseSession(value) {
    return value === "chieu" ? "Chiều" : "Sáng";
  }

  function localAnimalName(animalCode) {
    const animal = animals.find(
      (item) => String(item.id) === String(animalCode)
    );
    if (!animal) {
      throw new Error(`Không tìm thấy mã con ${animalCode}`);
    }
    return animal.type.toLowerCase();
  }

  function normalizePayoutSnapshot(snapshot, context = {}) {
    if (!snapshot) return null;
    if (snapshot.entryId) {
      return {
        ...snapshot,
        entryId: context.entryId || snapshot.entryId,
        drawKey: context.drawKey || snapshot.drawKey,
      };
    }
    return {
      entryId: context.entryId || snapshot.ma_phieu || "",
      drawKey: context.drawKey || snapshot.ma_ket_qua || "",
      date: snapshot.ngay_ghi || "",
      session: vietnameseSession(snapshot.buoi),
      animalId: snapshot.ma_con || "",
      recipientName: snapshot.ten_khach_nguon || "",
      seller: snapshot.ten_nguoi_ban || "",
      hitAmount: Number(snapshot.tien_trung) || 0,
      rate: Number(snapshot.he_so_tra) || 27,
      payoutAmount: Number(snapshot.tien_tra) || 0,
      entryTotal: Number(snapshot.tong_tien_phieu) || 0,
      entryContent: snapshot.noi_dung_goc || "",
    };
  }

  async function fetchAll(client, table, columns, options = {}) {
    const rows = [];
    let from = 0;

    while (true) {
      let query = client
        .from(table)
        .select(columns)
        .eq("ma_so", options.bookId)
        .range(from, from + PAGE_SIZE - 1);

      if (options.onlyActiveEntries) {
        query = query.is("ngay_xoa", null);
      }
      if (options.orderBy) {
        query = query.order(options.orderBy, {
          ascending: options.ascending !== false,
        });
      }
      if (options.secondaryOrderBy) {
        query = query.order(options.secondaryOrderBy, {
          ascending: options.secondaryAscending !== false,
        });
      }

      const { data, error } = await query;
      if (error) throw error;
      const page = data || [];
      rows.push(...page);
      if (page.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    return rows;
  }

  function normalizeRangeDate(value) {
    const date = String(value || "");
    return /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : getCurrentDate();
  }

  function getRequestedRange(range = {}) {
    const startDate = normalizeRangeDate(
      range.startDate || activeViewDateFrom
    );
    const endDate = normalizeRangeDate(
      range.endDate || activeViewDateTo
    );
    return startDate <= endDate
      ? { startDate, endDate }
      : { startDate: endDate, endDate: startDate };
  }

  function rangeKey(bookId, startDate, endDate) {
    return `${bookId}|${startDate}|${endDate}`;
  }

  async function fetchRangeData(client, bookId, startDate, endDate) {
    const { data, error } = await client.rpc(
      "tai_du_lieu_theo_khoang",
      {
        p_ma_so: bookId,
        p_tu_ngay: startDate,
        p_den_ngay: endDate,
      }
    );
    if (error) throw error;
    if (!data || typeof data !== "object") {
      throw new Error("RPC tải dữ liệu trả về không đúng định dạng.");
    }
    return data;
  }

  function enableReadOnlyMode() {
    window.conhonDatabaseReadOnly = true;
    document.body.classList.add("database-readonly");

    readonlyFunctions.forEach((name) => {
      const original = window[name];
      if (typeof original !== "function" || original.__databaseReadonlyGuard) {
        return;
      }
      const guarded = function () {
        if (window.conhonDatabaseReadOnly) {
          showNotification(
            "Đang kiểm thử dữ liệu Supabase ở chế độ chỉ đọc.",
            "error"
          );
          return undefined;
        }
        return original.apply(this, arguments);
      };
      guarded.__databaseReadonlyGuard = true;
      guarded.__original = original;
      window[name] = guarded;
    });

    const importInputs = [
      document.getElementById("summaryImportInput"),
    ];
    importInputs.forEach((input) => {
      if (input) input.disabled = true;
    });
  }

  function updateDatabaseStatus(count, startDate, endDate) {
    const sidebarStatus = document.getElementById(
      "databaseConnectionStatus"
    );
    if (sidebarStatus) {
      const capabilities =
        window.conhonDatabaseWriteCapabilities || [];
      const mode = capabilities.includes("sua_phieu")
        ? capabilities.includes("nhap_cap_duoi")
          ? "đồng bộ đầy đủ"
          : "tạo/sửa phiếu đã bật"
        : capabilities.includes("tao_phieu")
          ? "tạo phiếu đã bật"
          : "chỉ đọc";
      const rangeLabel =
        startDate === endDate
          ? formatDateForDisplay(endDate)
          : `${formatDateForDisplay(startDate)}–${formatDateForDisplay(
              endDate
            )}`;
      sidebarStatus.innerHTML = `<i class="fas fa-database"></i><span>Supabase · ${count.toLocaleString(
        "vi-VN"
      )} phiếu · ${rangeLabel} · ${mode}</span>`;
    }
    const badge = document.getElementById("lastUpdateBadge");
    if (badge) {
      badge.innerHTML = `<i class="fas fa-cloud"></i> Supabase: ${count.toLocaleString(
        "vi-VN"
      )} phiếu`;
    }
  }

  async function loadDatabaseData(authState, force = false, range = {}) {
    const client = window.conhonSupabase;
    const book = authState?.book;
    if (!client || !book?.ma_so) {
      return;
    }
    const { startDate, endDate } = getRequestedRange(range);
    const requestedRangeKey = rangeKey(
      book.ma_so,
      startDate,
      endDate
    );
    if (force) {
      loadedBookId = null;
      loadedRangeKey = null;
    }
    if (
      loadingRangeKey === requestedRangeKey ||
      (
        loadedBookId === book.ma_so &&
        loadedRangeKey === requestedRangeKey &&
        window.conhonDatabaseReady
      )
    ) {
      return;
    }
    if (loadingRangeKey) {
      pendingRangeRequest = { startDate, endDate };
      return;
    }
    loadingBookId = book.ma_so;
    loadingRangeKey = requestedRangeKey;
    window.conhonDatabaseReady = false;
    document.body.classList.add("database-unavailable");

    toggleLoading(true);
    try {
      const bookId = book.ma_so;
      const hasMetadataCache =
        !force &&
        cachedMetadataBookId === bookId &&
        Array.isArray(cachedSources) &&
        Array.isArray(cachedSettingsRows);
      const metadataPromise = hasMetadataCache
        ? Promise.resolve([cachedSources, cachedSettingsRows])
        : Promise.all([
            fetchAll(
              client,
              "nguon_so",
              "ma_nguon, ten_nguon, loai_nguon, vai_tro_tai_chinh, ma_ho_so_ngoai, ty_le_hoa_hong, dang_hoat_dong",
              { bookId, orderBy: "ngay_tao" }
            ),
            fetchAll(
              client,
              "cau_hinh_so",
              "ma_so, ty_le_chu_so, ty_le_cap_duoi_mac_dinh, he_so_nhan_tu_cap_tren, he_so_tra_mac_dinh",
              { bookId }
            ),
          ]);
      const [[sources, settingsRows], rangeData] =
        await Promise.all([
          metadataPromise,
          fetchRangeData(client, bookId, startDate, endDate),
        ]);
      if (!hasMetadataCache) {
        cachedMetadataBookId = bookId;
        cachedSources = sources.map((source) => ({ ...source }));
        cachedSettingsRows = settingsRows.map((settings) => ({
          ...settings,
        }));
      }
      const databaseEntries = Array.isArray(rangeData.phieu)
        ? rangeData.phieu
        : [];
      const databaseDetails = Array.isArray(rangeData.chi_tiet)
        ? rangeData.chi_tiet
        : [];
      const databaseDraws = Array.isArray(rangeData.ket_qua)
        ? rangeData.ket_qua
        : [];
      const databasePayouts = Array.isArray(rangeData.tra_thuong)
        ? rangeData.tra_thuong
        : [];
      const databaseDebtPayments = Array.isArray(rangeData.thu_cong_no)
        ? rangeData.thu_cong_no
        : [];

      const sourceById = new Map(
        sources.map((source) => [String(source.ma_nguon), source])
      );
      const detailsByEntryId = new Map();
      databaseDetails.forEach((detail) => {
        const key = String(detail.ma_phieu);
        const list = detailsByEntryId.get(key) || [];
        list.push(detail);
        detailsByEntryId.set(key, list);
      });

      const mappedEntries = databaseEntries.map((entry) => {
        const source = sourceById.get(String(entry.ma_nguon)) || {};
        const isChild = entry.loai_phieu === "tong_cap_duoi";
        const supplementary = entry.du_lieu_bo_sung || {};
        const details = (detailsByEntryId.get(String(entry.ma_phieu)) || [])
          .sort((a, b) => Number(a.thu_tu) - Number(b.thu_tu))
          .map((detail) => ({
            animal: localAnimalName(detail.ma_con),
            amount: Number(detail.so_tien),
          }));

        return {
          id: String(entry.ma_phieu),
          legacyId: entry.ma_phieu_cu,
          date: entry.ngay_ghi,
          session: vietnameseSession(entry.buoi),
          person: entry.ten_khach_nguon || "",
          seller: entry.ten_nguoi_ban || "",
          sellerSourceId:
            source.ma_ho_so_ngoai || String(source.ma_nguon || ""),
          sellerRole:
            source.vai_tro_tai_chinh === "ban_than" ? "self" : "child",
          content: entry.noi_dung_goc || "",
          total: Number(entry.tong_tien),
          entries: details,
          paymentType: isChild
            ? null
            : paymentToLocal[entry.hinh_thuc_thanh_toan] || "unknown",
          entryType: isChild ? "child_summary" : "direct",
          sourceProfileId: isChild
            ? source.ma_ho_so_ngoai ||
              supplementary.sourceProfileId ||
              String(source.ma_nguon || "")
            : undefined,
          sourceProfileName: isChild
            ? source.ten_nguon ||
              supplementary.sourceProfileName ||
              entry.ten_khach_nguon
            : undefined,
          sourceSummaryKey: isChild
            ? supplementary.sourceSummaryKey ||
              supplementary.khoa_tom_tat ||
              entry.ma_phieu_cu
            : undefined,
          sourceSignature: isChild
            ? supplementary.sourceSignature || supplementary.chu_ky
            : undefined,
          sourceExportedAt: isChild
            ? supplementary.sourceExportedAt ||
              supplementary.thoi_diem_xuat ||
              null
            : undefined,
          createdAt: entry.ngay_tao,
          updatedAt: entry.ngay_cap_nhat,
        };
      });

      const drawKeyById = new Map();
      const mappedDraws = {};
      databaseDraws.forEach((draw) => {
        const session = vietnameseSession(draw.buoi);
        const key = `${draw.ngay_xo}|${session}`;
        drawKeyById.set(String(draw.ma_ket_qua), key);
        mappedDraws[key] = {
          databaseId: String(draw.ma_ket_qua),
          animalId: String(draw.ma_con),
          confirmedAt: draw.thoi_diem_xac_nhan,
          updatedAt: draw.ngay_cap_nhat,
        };
      });

      const mappedPayouts = {};
      databasePayouts.forEach((payout) => {
        const drawKey = drawKeyById.get(String(payout.ma_ket_qua));
        if (!drawKey) return;
        mappedPayouts[`${drawKey}|${payout.ma_phieu}`] = {
          rate: Number(payout.he_so_tra),
          rateMode:
            payout.che_do_he_so === "thu_cong" ? "manual" : "default",
          paid: Boolean(payout.da_tra),
          paidAt: payout.thoi_diem_tra,
          snapshot: normalizePayoutSnapshot(payout.du_lieu_chot, {
            entryId: String(payout.ma_phieu),
            drawKey,
          }),
        };
      });

      const mappedDebtPayments = databaseDebtPayments.map((payment) => ({
        id: String(payment.ma_lan_thu),
        legacyId: payment.ma_giao_dich_cu,
        entryId: String(payment.ma_phieu),
        amount: Number(payment.so_tien),
        paidDate: payment.ngay_thu,
        method:
          payment.hinh_thuc === "chuyen_khoan"
            ? "bank_transfer"
            : "cash",
        note: payment.ghi_chu || "",
        createdAt: payment.ngay_tao,
        reversedAt: payment.ngay_huy,
      }));

      const settings = settingsRows[0] || {};
      const sourceConfigs = {};
      sources
        .filter((source) => source.vai_tro_tai_chinh === "cap_duoi")
        .forEach((source) => {
          const sourceId =
            source.ma_ho_so_ngoai || String(source.ma_nguon);
          sourceConfigs[`child:${sourceId}`] = {
            role: "child",
            childRate: Number(
              source.ty_le_hoa_hong ??
                settings.ty_le_cap_duoi_mac_dinh ??
                15
            ),
          };
        });

      ledgerData = mappedEntries;
      paidEntries = {};
      drawResults = mappedDraws;
      payoutStates = mappedPayouts;
      debtPayments = mappedDebtPayments;
      financeSettings = {
        ownerRate: Number(settings.ty_le_chu_so ?? 20),
        defaultChildRate: Number(
          settings.ty_le_cap_duoi_mac_dinh ?? 15
        ),
        ownerPayoutRate: Number(
          settings.he_so_nhan_tu_cap_tren ?? 28
        ),
        defaultPayoutRate: Number(settings.he_so_tra_mac_dinh ?? 27),
        sourceConfigs,
      };
      localProfile = {
        id: book.ma_ho_so_cu || book.ma_so,
        name: book.ten_so,
      };

      rebuildDataIndexes();
      updateProfileButton();
      initializeDefaultSeller(true);
      syncViewControls();
      enableReadOnlyMode();
      const rangeEntryCount = mappedEntries.filter(
        (entry) =>
          entry.date >= startDate && entry.date <= endDate
      ).length;
      updateDatabaseStatus(rangeEntryCount, startDate, endDate);

      window.conhonDatabaseSnapshot = {
        book,
        range: {
          startDate,
          endDate,
          key: requestedRangeKey,
        },
        sources: sources.map((source) => ({ ...source })),
        selfSourceId:
          sources.find((source) => source.loai_nguon === "ban_than")
            ?.ma_nguon || null,
        counts: {
          entries: mappedEntries.length,
          rangeEntries: rangeEntryCount,
          details: databaseDetails.length,
          draws: databaseDraws.length,
          payouts: databasePayouts.length,
          debtPayments: databaseDebtPayments.length,
          sources: sources.length,
        },
        total: mappedEntries.reduce(
          (sum, entry) => sum + Number(entry.total || 0),
          0
        ),
      };
      loadedBookId = bookId;
      loadedRangeKey = requestedRangeKey;
      window.conhonDatabaseReady = true;
      document.body.classList.remove("database-unavailable");
      refreshAllViews();
      window.dispatchEvent(
        new CustomEvent("conhon:database-loaded", {
          detail: window.conhonDatabaseSnapshot,
        })
      );

      showNotification(
        `Đã tải ${rangeEntryCount.toLocaleString(
          "vi-VN"
        )} phiếu trong khoảng đã chọn.`
      );
    } catch (error) {
      loadedBookId = null;
      loadedRangeKey = null;
      window.conhonDatabaseReady = false;
      window.conhonDatabaseSnapshot = null;
      document.body.classList.add("database-unavailable");
      ledgerData = [];
      paidEntries = {};
      drawResults = {};
      payoutStates = {};
      debtPayments = [];
      rebuildDataIndexes();
      refreshAllViews();
      console.error("Không tải được dữ liệu Supabase:", error);
      const sidebarStatus = document.getElementById(
        "databaseConnectionStatus"
      );
      if (sidebarStatus) {
        sidebarStatus.innerHTML =
          '<i class="fas fa-triangle-exclamation"></i><span>Lỗi tải Supabase · không có dữ liệu cục bộ thay thế</span>';
      }
      showNotification(
        `Không tải được dữ liệu Supabase: ${
          error?.message || "Lỗi không xác định"
        }`,
        "error"
      );
    } finally {
      loadingBookId = null;
      loadingRangeKey = null;
      toggleLoading(false);
      const pending = pendingRangeRequest;
      pendingRangeRequest = null;
      if (pending) {
        loadDatabaseData(window.conhonAuth, false, pending);
      }
    }
  }

  window.addEventListener("conhon:auth-ready", (event) => {
    loadDatabaseData(event.detail);
  });

  window.reloadConhonDatabase = function () {
    return loadDatabaseData(window.conhonAuth, true, {
      startDate: activeViewDateFrom,
      endDate: activeViewDateTo,
    });
  };

  window.getConhonFullDatabaseBackup = async function () {
    const client = window.conhonSupabase;
    const book = window.conhonAuth?.book;
    if (!client || !book?.ma_so || !window.conhonDatabaseReady) {
      throw new Error("Dữ liệu Supabase chưa sẵn sàng.");
    }
    const bookId = book.ma_so;
    const [sources, settings, rangeData] = await Promise.all([
      fetchAll(
        client,
        "nguon_so",
        "ma_nguon, ten_nguon, loai_nguon, vai_tro_tai_chinh, ma_ho_so_ngoai, ty_le_hoa_hong, dang_hoat_dong, ngay_tao, ngay_cap_nhat",
        { bookId, orderBy: "ngay_tao" }
      ),
      fetchAll(
        client,
        "cau_hinh_so",
        "ma_so, ty_le_chu_so, ty_le_cap_duoi_mac_dinh, he_so_nhan_tu_cap_tren, he_so_tra_mac_dinh, ngay_cap_nhat",
        { bookId }
      ),
      fetchRangeData(
        client,
        bookId,
        "1900-01-01",
        "9999-12-31"
      ),
    ]);
    return {
      so_ghi: { ...book },
      nguon_so: sources,
      cau_hinh_so: settings,
      phieu_ghi: Array.isArray(rangeData.phieu)
        ? rangeData.phieu
        : [],
      chi_tiet_phieu: Array.isArray(rangeData.chi_tiet)
        ? rangeData.chi_tiet
        : [],
      ket_qua_xo: Array.isArray(rangeData.ket_qua)
        ? rangeData.ket_qua
        : [],
      tra_thuong: Array.isArray(rangeData.tra_thuong)
        ? rangeData.tra_thuong
        : [],
      thu_cong_no: Array.isArray(rangeData.thu_cong_no)
        ? rangeData.thu_cong_no
        : [],
    };
  };

  window.ensureConhonDatabaseRange = function (startDate, endDate) {
    const client = window.conhonSupabase;
    const authState = window.conhonAuth;
    const bookId = authState?.book?.ma_so;
    if (!client || !bookId) return false;
    const normalized = getRequestedRange({ startDate, endDate });
    const requestedRangeKey = rangeKey(
      bookId,
      normalized.startDate,
      normalized.endDate
    );
    if (
      window.conhonDatabaseReady &&
      loadedBookId === bookId &&
      loadedRangeKey === requestedRangeKey
    ) {
      return false;
    }
    if (loadingRangeKey) {
      if (loadingRangeKey !== requestedRangeKey) {
        pendingRangeRequest = normalized;
      }
    } else {
      loadDatabaseData(authState, false, normalized);
    }
    return true;
  };
})();
