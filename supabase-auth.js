(function () {
  "use strict";

  const state = {
    client: null,
    session: null,
    user: null,
    book: null,
    initializing: false,
  };

  function getElement(id) {
    return document.getElementById(id);
  }

  function setMessage(message, type = "") {
    const element = getElement("authMessage");
    if (!element) return;
    element.textContent = message || "";
    element.className = `auth-message${type ? ` ${type}` : ""}`;
  }

  function setFormBusy(busy) {
    const button = getElement("authSubmitButton");
    const email = getElement("authEmail");
    const password = getElement("authPassword");
    if (button) {
      button.disabled = busy;
      button.innerHTML = busy
        ? '<i class="fas fa-circle-notch fa-spin"></i> Đang đăng nhập'
        : '<i class="fas fa-right-to-bracket"></i> Đăng nhập';
    }
    if (email) email.disabled = busy;
    if (password) password.disabled = busy;
  }

  function showLogin(message = "") {
    document.body.classList.add("auth-locked");
    const gate = getElement("authGate");
    if (gate) {
      gate.hidden = false;
      gate.setAttribute("aria-hidden", "false");
    }
    setMessage(message);
    setTimeout(() => getElement("authEmail")?.focus(), 0);
  }

  function showApp() {
    const gate = getElement("authGate");
    if (gate) {
      gate.hidden = true;
      gate.setAttribute("aria-hidden", "true");
    }
    document.body.classList.remove("auth-locked");
  }

  function updateConnectedUi() {
    const bookName = state.book?.ten_so || "Sổ ghi";
    const label = getElement("profileButtonLabel");
    const sidebarStatus = getElement("databaseConnectionStatus");
    const logoutButton = getElement("authLogoutButton");

    if (label) label.textContent = bookName;
    if (sidebarStatus) {
      sidebarStatus.innerHTML =
        '<i class="fas fa-cloud"></i><span>Đã kết nối Supabase · dữ liệu vẫn đang đọc cục bộ</span>';
    }
    if (logoutButton) logoutButton.hidden = false;

    window.dispatchEvent(
      new CustomEvent("conhon:auth-ready", {
        detail: {
          user: state.user,
          book: state.book,
        },
      })
    );
  }

  async function loadBook() {
    const { data, error } = await state.client
      .from("so_ghi")
      .select(
        "ma_so, ma_chu_so, ten_so, ma_ho_so_cu, mui_gio, dang_hoat_dong"
      )
      .eq("dang_hoat_dong", true)
      .order("ngay_tao", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      throw new Error("Tài khoản chưa được gán vào sổ nào.");
    }
    state.book = data;
    localStorage.setItem("coNhonConnectedBook", JSON.stringify(data));
  }

  async function applySession(session) {
    state.session = session || null;
    state.user = session?.user || null;
    state.book = null;

    if (!state.user) {
      localStorage.removeItem("coNhonConnectedBook");
      getElement("authLogoutButton")?.setAttribute("hidden", "");
      showLogin();
      return;
    }

    try {
      setMessage("Đang tải sổ của bạn…");
      await loadBook();
      updateConnectedUi();
      showApp();
      setMessage("");
    } catch (error) {
      console.error("Không tải được sổ:", error);
      await state.client.auth.signOut();
      showLogin(
        error?.message || "Không thể tải sổ của tài khoản này."
      );
      setMessage(
        error?.message || "Không thể tải sổ của tài khoản này.",
        "error"
      );
    }
  }

  async function loadConfig() {
    const response = await fetch("/api/supabase-config", {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(
        payload.error || "Không tải được cấu hình Supabase từ Vercel."
      );
    }
    if (!payload.supabaseUrl || !payload.publishableKey) {
      throw new Error("Cấu hình Supabase trả về không đầy đủ.");
    }
    return payload;
  }

  async function initializeAuth() {
    if (state.initializing) return;
    state.initializing = true;
    showLogin("Đang kết nối Supabase…");

    try {
      if (!window.supabase?.createClient) {
        throw new Error("Không tải được thư viện Supabase.");
      }
      const config = await loadConfig();
      state.client = window.supabase.createClient(
        config.supabaseUrl,
        config.publishableKey,
        {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
            detectSessionInUrl: true,
          },
        }
      );

      window.conhonSupabase = state.client;
      window.conhonAuth = state;

      state.client.auth.onAuthStateChange((_event, session) => {
        setTimeout(() => applySession(session), 0);
      });

      const {
        data: { session },
        error,
      } = await state.client.auth.getSession();
      if (error) throw error;
      await applySession(session);
    } catch (error) {
      console.error("Khởi tạo Supabase thất bại:", error);
      showLogin();
      setMessage(
        error?.message || "Không thể kết nối Supabase.",
        "error"
      );
    } finally {
      state.initializing = false;
    }
  }

  async function signIn(event) {
    event?.preventDefault();
    if (!state.client) {
      setMessage("Supabase chưa sẵn sàng. Hãy tải lại trang.", "error");
      return;
    }

    const email = getElement("authEmail")?.value.trim();
    const password = getElement("authPassword")?.value || "";
    if (!email || !password) {
      setMessage("Vui lòng nhập email và mật khẩu.", "error");
      return;
    }

    setFormBusy(true);
    setMessage("");
    try {
      const { error } = await state.client.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error) {
      console.error("Đăng nhập thất bại:", error);
      setMessage(
        error?.message === "Invalid login credentials"
          ? "Email hoặc mật khẩu không đúng."
          : error?.message || "Không thể đăng nhập.",
        "error"
      );
    } finally {
      setFormBusy(false);
    }
  }

  async function signOut() {
    if (!state.client) return;
    const button = getElement("authLogoutButton");
    if (button) button.disabled = true;
    try {
      const { error } = await state.client.auth.signOut();
      if (error) throw error;
      showLogin("Bạn đã đăng xuất.");
    } catch (error) {
      setMessage(error?.message || "Không thể đăng xuất.", "error");
    } finally {
      if (button) button.disabled = false;
    }
  }

  window.signOutSupabase = signOut;
  document.addEventListener("DOMContentLoaded", () => {
    getElement("authForm")?.addEventListener("submit", signIn);
    getElement("authRetryButton")?.addEventListener("click", initializeAuth);
    initializeAuth();
  });
})();
