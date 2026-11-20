/**
 * Auth & Shared Module
 * - Helpers (localStorage, escaping, URL cleaning, select filling, image compression)
 * - Light/Dark theme, interactive background animation, offcanvas menu
 * - Login, Register, Forgot Password, Demo Login, Logout, session guard
 * Loaded first on ALL pages.
 */

/* ---------- Helpers ---------- */
const LS = {
  get(key, fallback) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null || v === undefined ? fallback : v; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.warn("localStorage is full or unavailable:", e); return false; }
  }
};
function getSession() { return LS.get("activeUserSession", null); }
function isDarkTheme() { return document.documentElement.getAttribute("data-bs-theme") !== "light"; }

/**
 * Cleans a website URL. Adds "https://" automatically when the scheme is missing
 * (e.g. "www.maybank.com" -> "https://www.maybank.com").
 * Returns "" for empty or invalid input (including javascript:, data:, ftp:// etc.).
 */
function safeUrl(url) {
  let s = String(url ?? "").trim();
  if (!s) return "";
  if (/^(javascript|data|vbscript|file|blob):/i.test(s)) return "";
  if (!/^https?:\/\//i.test(s)) {
    if (/^[a-z][a-z0-9+.-]*:\/\//i.test(s)) return "";   // some other scheme, e.g. ftp://
    s = "https://" + s.replace(/^\/+/, "");
  }
  try {
    const u = new URL(s);
    if (!/^https?:$/.test(u.protocol)) return "";
    if (!u.hostname.includes(".")) return "";            // must look like a real domain
    return s;
  } catch (e) { return ""; }
}

/** Storage key suffix for the logged-in user's profile data (photo, resume, profile fields). */
function profileKey() {
  const s = getSession();
  return s ? (s.username || s.email || "default").toLowerCase().replace(/[^a-z0-9]/g, "_") : "default";
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function fillSelect(select, values, placeholder) {
  if (!select) return;
  const current = select.value;
  select.innerHTML = `<option value="">${esc(placeholder)}</option>` +
    values.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join("");
  if (values.includes(current)) select.value = current;
}

// Read an image, shrink it with a Canvas, return a Data URL (fits within localStorage quota)
function compressImage(file, maxSize = 256, type = "image/jpeg", quality = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL(type, quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function showAlert(message, type = "info", boxId = "alertBox") {
  const box = document.getElementById(boxId);
  if (!box) return;
  const cls = { error: "danger", danger: "danger", success: "success", info: "info" }[type] || "info";
  box.className = `alert alert-${cls}`;
  box.textContent = message;
}
function hideAlert(boxId = "alertBox") {
  const box = document.getElementById(boxId);
  if (box) { box.className = "alert d-none"; box.textContent = ""; }
}

// Updates the user's name and profile photo in the side menu
function updateUserName() {
  const s = getSession();
  const name = s ? (s.fullName || s.username || "User") : "User";
  document.querySelectorAll(".js-user-name").forEach(el => { el.textContent = name; });
  const photo = s ? LS.get("profileImg_" + profileKey(), null) : null;
  if (photo) document.querySelectorAll(".js-user-avatar").forEach(el => { el.src = photo; });
}

/* ---------- Session guard (runs immediately) ---------- */
(function guard() {
  if (document.body && document.body.dataset.protected === "true" && !getSession()) {
    window.location.replace("index.html");
  }
})();

/* ---------- Light / Dark theme ---------- */
function updateThemeIcons() {
  const dark = isDarkTheme();
  document.querySelectorAll("#themeToggle").forEach(btn => {
    btn.innerHTML = `<i class="fa-solid ${dark ? "fa-sun" : "fa-moon"}"></i>`;
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
    btn.setAttribute("title", dark ? "Light Mode" : "Dark Mode");
  });
}
function toggleTheme() {
  const next = isDarkTheme() ? "light" : "dark";
  document.documentElement.setAttribute("data-bs-theme", next);
  try { localStorage.setItem("theme", next); } catch (e) { /* ignore */ }
  updateThemeIcons();
  document.dispatchEvent(new CustomEvent("themechange", { detail: next }));
}

/* ---------- Interactive background animation (particles + cursor glow) ---------- */
function initBackground() {
  const cv = document.getElementById("bgCanvas");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mouse = { x: null, y: null };
  let w = 0, h = 0, pts = [];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    cv.width = w * dpr; cv.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const n = Math.min(90, Math.round((w * h) / 16000));
    pts = Array.from({ length: n }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 1
    }));
    if (reduce) draw();
  }

  function draw() {
    const dark = isDarkTheme();
    const c = dark ? "0,255,102" : "0,138,62";
    ctx.clearRect(0, 0, w, h);

    if (mouse.x !== null) {
      const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
      g.addColorStop(0, `rgba(${c},${dark ? 0.16 : 0.12})`);
      g.addColorStop(1, `rgba(${c},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }

    for (const p of pts) {
      if (!reduce) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        if (mouse.x !== null) {
          const dx = p.x - mouse.x, dy = p.y - mouse.y, d = Math.hypot(dx, dy);
          if (d < 140 && d > 0) { p.x += (dx / d) * 0.9; p.y += (dy / d) * 0.9; }
        }
      }
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c},${dark ? 0.7 : 0.55})`;
      ctx.fill();
    }

    ctx.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
        if (d < 120) {
          ctx.strokeStyle = `rgba(${c},${(1 - d / 120) * (dark ? 0.35 : 0.3)})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(pts[j].x, pts[j].y); ctx.stroke();
        }
      }
      if (mouse.x !== null) {
        const d = Math.hypot(pts[i].x - mouse.x, pts[i].y - mouse.y);
        if (d < 160) {
          ctx.strokeStyle = `rgba(${c},${(1 - d / 160) * 0.6})`;
          ctx.beginPath(); ctx.moveTo(pts[i].x, pts[i].y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
    }
    if (!reduce) requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });
  window.addEventListener("mouseout", () => { mouse.x = mouse.y = null; });
  const touch = e => { const t = e.touches[0]; if (t) { mouse.x = t.clientX; mouse.y = t.clientY; } };
  window.addEventListener("touchstart", touch, { passive: true });
  window.addEventListener("touchmove", touch, { passive: true });
  window.addEventListener("touchend", () => { mouse.x = mouse.y = null; });
  document.addEventListener("themechange", () => { if (reduce) draw(); });

  resize();
  if (!reduce) requestAnimationFrame(draw);
}

/* ---------- Offcanvas menu: close when a same-page link is clicked ---------- */
function initOffcanvasMenu() {
  const oc = document.getElementById("mainMenu");
  if (!oc) return;
  oc.querySelectorAll("a.nav-link").forEach(a => {
    a.addEventListener("click", e => {
      const url = new URL(a.href, window.location.href);
      if (url.pathname === window.location.pathname && url.hash) {
        // #hash link on the same page: close the menu first, then scroll
        e.preventDefault();
        oc.addEventListener("hidden.bs.offcanvas", () => {
          const target = document.querySelector(url.hash);
          if (target) target.scrollIntoView({ behavior: "smooth" });
          history.replaceState(null, "", url.hash);
        }, { once: true });
        bootstrap.Offcanvas.getOrCreateInstance(oc).hide();
      }
    });
  });
}

/* ---------- Main ---------- */
document.addEventListener("DOMContentLoaded", () => {
  updateThemeIcons();
  document.querySelectorAll("#themeToggle").forEach(btn => btn.addEventListener("click", toggleTheme));
  updateUserName();
  initBackground();
  initOffcanvasMenu();

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const logoutBtn = document.getElementById("logoutBtn");

  // Logout
  if (logoutBtn) {
    logoutBtn.addEventListener("click", e => {
      e.preventDefault();
      localStorage.removeItem("activeUserSession");
      window.location.href = "index.html";
    });
  }

  if (!loginForm || !registerForm) return; // the rest is only for index.html

  const ADMIN = { fullName: "Fakhrul Hadi", username: "admin", email: "admin@jobanalytics.com" };
  const isAdminId = id => id === "admin" || id === "admin@jobanalytics.com";
  const adminPassword = () => LS.get("adminPassword", "admin123");

  function startSession(user, rememberValue) {
    LS.set("activeUserSession", user);
    if (rememberValue) localStorage.setItem("rememberedEmail", rememberValue);
    window.location.href = "dashboard.html";
  }

  // Switch between Login and Register views
  function showForm(which) {
    hideAlert();
    loginForm.classList.toggle("d-none", which !== "login");
    registerForm.classList.toggle("d-none", which !== "register");
  }
  document.getElementById("showRegisterBtn")?.addEventListener("click", e => { e.preventDefault(); showForm("register"); });
  document.getElementById("showLoginBtn")?.addEventListener("click", e => { e.preventDefault(); showForm("login"); });

  // Remember Me
  const savedEmail = localStorage.getItem("rememberedEmail");
  if (savedEmail) {
    document.getElementById("loginEmail").value = savedEmail;
    document.getElementById("rememberMe").checked = true;
  }

  // Register
  registerForm.addEventListener("submit", e => {
    e.preventDefault();
    const fullName = document.getElementById("regFullName").value.trim();
    const username = document.getElementById("regUsername").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const phone = document.getElementById("regPhone").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirmPassword").value;

    if (password.length < 6) return showAlert("Password must be at least 6 characters.", "error");
    if (password !== confirm) return showAlert("Passwords do not match!", "error");

    const users = LS.get("registeredUsers", []);
    const em = email.toLowerCase(), un = username.toLowerCase();
    if (users.some(u => u.email.toLowerCase() === em) || isAdminId(em))
      return showAlert("This email address is already registered!", "error");
    if (users.some(u => u.username.toLowerCase() === un) || isAdminId(un))
      return showAlert("This username is already taken!", "error");

    users.push({ fullName, username, email, phone, password });
    if (!LS.set("registeredUsers", users)) return showAlert("Failed to save the account (storage is full).", "error");
    registerForm.reset();
    showForm("login");
    showAlert("Registration successful! Please log in.", "success");
  });

  // Login
  loginForm.addEventListener("submit", e => {
    e.preventDefault();
    const raw = document.getElementById("loginEmail").value.trim();
    const id = raw.toLowerCase();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("rememberMe").checked;

    const users = LS.get("registeredUsers", []);
    const user = users.find(u => (u.email.toLowerCase() === id || u.username.toLowerCase() === id) && u.password === password);
    const admin = isAdminId(id) && password === adminPassword();

    if (user || admin) {
      if (!remember) localStorage.removeItem("rememberedEmail");
      const { password: _pw, ...safeUser } = user || ADMIN;
      startSession(safeUser, remember ? raw : null);
    } else {
      showAlert("Login failed. Incorrect email/username or password.", "error");
    }
  });

  // Demo Login for the lecturer (one click)
  document.getElementById("demoLoginBtn")?.addEventListener("click", () => startSession(ADMIN, null));

  // Forgot Password (Bootstrap Modal)
  const forgotEl = document.getElementById("forgotModal");
  const forgotForm = document.getElementById("forgotForm");
  if (forgotEl && forgotForm) {
    const forgotModal = bootstrap.Modal.getOrCreateInstance(forgotEl);
    document.getElementById("forgotPasswordLink")?.addEventListener("click", e => {
      e.preventDefault();
      forgotForm.reset();
      hideAlert("forgotAlert");
      document.getElementById("forgotEmail").value = document.getElementById("loginEmail").value.trim();
      forgotModal.show();
    });

    forgotForm.addEventListener("submit", e => {
      e.preventDefault();
      const id = document.getElementById("forgotEmail").value.trim().toLowerCase();
      const pw = document.getElementById("forgotNewPassword").value;
      const confirm = document.getElementById("forgotConfirmPassword").value;

      if (pw.length < 6) return showAlert("The new password must be at least 6 characters.", "error", "forgotAlert");
      if (pw !== confirm) return showAlert("Passwords do not match!", "error", "forgotAlert");

      const users = LS.get("registeredUsers", []);
      const idx = users.findIndex(u => u.email.toLowerCase() === id || u.username.toLowerCase() === id);
      if (idx >= 0) {
        users[idx].password = pw;
        LS.set("registeredUsers", users);
      } else if (isAdminId(id)) {
        LS.set("adminPassword", pw);
      } else {
        return showAlert("Account not found. Please check your email or username.", "error", "forgotAlert");
      }
      forgotModal.hide();
      document.getElementById("loginPassword").value = "";
      showAlert("Password reset successfully. Please log in.", "success");
    });
  }
});