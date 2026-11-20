/**
 * Dashboard Module - KPIs, 3 live charts (theme-aware), Personal Profile and 2 personal performance charts.
 * Depends on js/auth.js, js/application.js, js/companies.js (seed data).
 * All figures are read live from localStorage ("companyDirectory" and "jobApplications").
 */
const DASH_STATUSES = ["Pending", "Reviewed", "Accepted", "Rejected"];
const RESET_KEYS = ["jobApplications", "companyDirectory", "companyDataVersion"];
const RESET_PREFIXES = ["profile_", "profileImg_", "resume_"];
const TREND_START_YEAR = 2026, TREND_YEARS = 5;   // 2026-2030
let dashCharts = [];
let skillsChart = null;
let strengthChart = null;

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("barChart")) return;
  initProfile();
  initResetButton();
  initTrendYearSelect();
  refreshDashboard();
  document.addEventListener("themechange", refreshDashboard);
  // Keep the dashboard in sync if data changes in another tab or the page is restored from cache
  window.addEventListener("storage", refreshDashboard);
  window.addEventListener("pageshow", e => { if (e.persisted) refreshDashboard(); });
});

function dashApps() { const a = LS.get("jobApplications", []); return Array.isArray(a) ? a : []; }
function dashComps() { const c = LS.get("companyDirectory", []); return Array.isArray(c) ? c : []; }

function refreshDashboard() {
  loadDashboardStats();
  renderCharts();
  renderProfileCharts();
}

function loadDashboardStats() {
  const apps = dashApps();
  const count = s => apps.filter(a => a.status === s).length;
  document.getElementById("statTotalCompanies").textContent = dashComps().length;
  document.getElementById("statTotalApps").textContent = apps.length;
  document.getElementById("statPendingApps").textContent = count("Pending");
  document.getElementById("statAcceptedApps").textContent = count("Accepted");
  document.getElementById("statRejectedApps").textContent = count("Rejected");
}

/* ---------- Year selector for chart C (2026-2030 + All Years) ---------- */
function initTrendYearSelect() {
  const sel = document.getElementById("trendYearSelect");
  if (!sel) return;
  const years = Array.from({ length: TREND_YEARS }, (_, i) => TREND_START_YEAR + i);
  sel.innerHTML = years.map(y => `<option value="${y}">${y}</option>`).join("") +
    `<option value="all">All Years (${years[0]}-${years[years.length - 1]})</option>`;
  const now = new Date().getFullYear();
  sel.value = years.includes(now) ? String(now) : String(TREND_START_YEAR);
  sel.addEventListener("change", renderCharts);
}

/* ---------- Reset Demo Data ---------- */
function initResetButton() {
  document.getElementById("resetDataBtn")?.addEventListener("click", () => {
    const ok = confirm("Reset all demo data?\n\nYour applications, company directory, profile details, photo and resume will be removed and the default demo data will be restored. Your login account is kept.");
    if (!ok) return;
    const doomed = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (RESET_KEYS.includes(k) || RESET_PREFIXES.some(p => k.startsWith(p)))) doomed.push(k);
    }
    doomed.forEach(k => localStorage.removeItem(k));
    // Reloading re-runs the seed code in application.js and companies.js with a clean slate
    window.location.reload();
  });
}

/* ---------- Chart palette (purple) ---------- */
function chartTheme() {
  const d = isDarkTheme();
  return {
    text: d ? "#f1eefc" : "#1e1b2e",
    muted: d ? "#a09cb8" : "#5b5675",
    grid: d ? "#2a2640" : "#e4def5",
    accent: d ? "#a78bfa" : "#7c3aed",
    accentFill: d ? "rgba(167,139,250,0.16)" : "rgba(124,58,237,0.12)",
    border: d ? "#171426" : "#ffffff",
    bars: d ? ["#a78bfa", "#8b5cf6", "#c4b5fd", "#7c3aed", "#ddd6fe", "#6d28d9"]
            : ["#7c3aed", "#8b5cf6", "#6d28d9", "#a78bfa", "#5b21b6", "#c4b5fd"],
    pie: d ? ["#ddd6fe", "#a78bfa", "#7c3aed", "#f472b6"] : ["#c4b5fd", "#8b5cf6", "#5b21b6", "#db2777"],
    series: d
      ? ["rgba(167,139,250,.75)", "rgba(244,114,182,.75)", "rgba(96,165,250,.75)", "rgba(52,211,153,.75)",
         "rgba(251,191,36,.75)", "rgba(196,181,253,.75)", "rgba(248,113,113,.75)", "rgba(139,92,246,.75)"]
      : ["rgba(124,58,237,.75)", "rgba(219,39,119,.75)", "rgba(37,99,235,.75)", "rgba(5,150,105,.75)",
         "rgba(180,83,9,.75)", "rgba(91,33,182,.75)", "rgba(220,38,38,.75)", "rgba(109,40,217,.75)"]
  };
}
function axisStyle(t, extra) {
  return Object.assign({ ticks: { color: t.muted }, grid: { color: t.grid }, border: { color: t.grid } }, extra);
}

function renderCharts() {
  if (typeof Chart === "undefined") return;
  dashCharts.forEach(c => c.destroy());
  dashCharts = [];
  const t = chartTheme();
  Chart.defaults.font.family = "Inter, system-ui, sans-serif";
  Chart.defaults.color = t.muted;
  const legend = { labels: { color: t.text } };
  const apps = dashApps();

  // A: Bar - top 10 companies by Google rating (from the directory)
  const top = dashComps().slice().sort((a, b) => b.rating - a.rating || String(a.name).localeCompare(String(b.name))).slice(0, 10);
  dashCharts.push(new Chart(document.getElementById("barChart"), {
    type: "bar",
    data: {
      labels: top.map(c => c.name),
      datasets: [{
        label: "Google Rating (Simulated Data)",
        data: top.map(c => c.rating),
        backgroundColor: top.map((_, i) => t.bars[i % t.bars.length]),
        borderRadius: 6
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend },
      scales: { x: axisStyle(t, { ticks: { color: t.muted, maxRotation: 60, minRotation: 30, autoSkip: false } }), y: axisStyle(t, { min: 0, max: 5 }) }
    }
  }));

  // B: Pie - application status distribution with percentages
  const counts = DASH_STATUSES.map(s => apps.filter(a => a.status === s).length);
  const total = counts.reduce((a, b) => a + b, 0);
  dashCharts.push(new Chart(document.getElementById("pieChart"), {
    type: "pie",
    data: { labels: DASH_STATUSES, datasets: [{ data: counts, backgroundColor: t.pie, borderColor: t.border, borderWidth: 2 }] },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend,
        tooltip: { callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed} (${total ? ((ctx.parsed / total) * 100).toFixed(1) : "0.0"}%)` } }
      }
    }
  }));

  // C: Line - monthly trend for the selected year, or yearly totals for all 5 years (from application dates)
  const sel = document.getElementById("trendYearSelect");
  const choice = sel ? sel.value : String(TREND_START_YEAR);
  const allYears = choice === "all";
  const years = Array.from({ length: TREND_YEARS }, (_, i) => TREND_START_YEAR + i);
  const trendLabels = allYears ? years.map(String) : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthly = Array(trendLabels.length).fill(0);
  apps.forEach(a => {
    const m = /^(\d{4})-(\d{2})/.exec(a.date || "");
    if (!m) return;
    const y = parseInt(m[1], 10);
    if (allYears) { if (y >= TREND_START_YEAR && y < TREND_START_YEAR + TREND_YEARS) monthly[y - TREND_START_YEAR]++; }
    else if (String(y) === choice) monthly[parseInt(m[2], 10) - 1]++;
  });
  const trendTitle = document.getElementById("trendTitle");
  if (trendTitle) trendTitle.textContent = allYears
    ? `C. Yearly Application Trend (${TREND_START_YEAR}-${TREND_START_YEAR + TREND_YEARS - 1})`
    : `C. Monthly Application Trend (${choice})`;
  dashCharts.push(new Chart(document.getElementById("lineChart"), {
    type: "line",
    data: {
      labels: trendLabels,
      datasets: [{
        label: allYears ? `Applications Submitted (${TREND_START_YEAR}-${TREND_START_YEAR + TREND_YEARS - 1})` : `Applications Submitted (${choice})`, data: monthly,
        borderColor: t.accent, backgroundColor: t.accentFill, pointBackgroundColor: t.accent, fill: true, tension: 0.3
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend },
      scales: { x: axisStyle(t), y: axisStyle(t, { beginAtZero: true, ticks: { color: t.muted, precision: 0 } }) }
    }
  }));
}

/* ---------- Saved profile helpers ---------- */
const PROFILE_FIELDS = {
  profFullName: "fullName", profEmail: "email", profPhone: "phone",
  profAddress: "address", profEducation: "education", profSkills: "skills", profAbout: "about"
};

// The profile as last SAVED (stored profile merged over the session defaults)
function getSavedProfile() {
  const session = getSession() || {};
  const saved = LS.get("profile_" + profileKey(), {});
  return {
    fullName: session.fullName || "MUHAMMAD FAKHRUL HADI BIN ZAMRI",
    email: session.email || "2025186033@student.uitm.edu.my",
    phone: session.phone || "+60 18-237 5359",
    address: "Shah Alam, Selangor",
    education: "Bachelor of Information Science (Hons.) Information Systems Management, UiTM",
    skills: "HTML:90, CSS:85, JavaScript:80, Bootstrap 5:90, Data Analysis:85",
    about: "Final year Information Systems Management student at UiTM passionate about web development and data analytics.",
    ...saved
  };
}

/* ---------- Graph 2: Skill Mastery (polar area / horizontal bar) ---------- */
// Skills field format: "JavaScript:90, Python:75, SQL". Without a level, it is estimated from the
// list order and keyword matches in About Me, Education and the positions applied for.
function parseSkills(profile) {
  const context = [profile.about, profile.education, dashApps().map(a => a.position).join(" ")].join(" ").toLowerCase();
  return String(profile.skills || "").split(",").map(s => s.trim()).filter(Boolean).slice(0, 8).map((item, i) => {
    const m = /^(.*?)\s*[:=]\s*(\d{1,3})\s*%?$/.exec(item);
    if (m && m[1].trim()) return { name: m[1].trim(), level: Math.min(100, parseInt(m[2], 10)) };
    const hits = context.split(item.toLowerCase()).length - 1;
    return { name: item, level: Math.min(95, 60 + Math.max(0, 16 - i * 3) + Math.min(hits, 3) * 7) };
  });
}

function renderSkillsChart() {
  const canvas = document.getElementById("skillsChart");
  const empty = document.getElementById("skillsEmpty");
  if (!canvas) return;
  if (skillsChart) { skillsChart.destroy(); skillsChart = null; }

  const skills = parseSkills(getSavedProfile());
  canvas.parentElement.classList.toggle("d-none", !skills.length);
  if (empty) empty.classList.toggle("d-none", skills.length > 0);
  if (!skills.length || typeof Chart === "undefined") return;

  const t = chartTheme();
  const polar = skills.length >= 3;   // 3+ skills: polar area; 1-2 skills: horizontal bars
  const dataset = {
    label: "Mastery Level (%)",
    data: skills.map(s => s.level),
    backgroundColor: skills.map((_, i) => t.series[i % t.series.length]),
    borderColor: t.border, borderWidth: 2
  };
  if (!polar) dataset.borderRadius = 6;

  const options = polar ? {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { position: "bottom", labels: { color: t.text, boxWidth: 12 } } },
    scales: { r: {
      min: 0, max: 100, ticks: { stepSize: 20, color: t.muted, backdropColor: "transparent" },
      grid: { color: t.grid }, angleLines: { color: t.grid }
    } }
  } : {
    indexAxis: "y", responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: axisStyle(t, { min: 0, max: 100 }), y: axisStyle(t) }
  };
  skillsChart = new Chart(canvas, { type: polar ? "polarArea" : "bar", data: { labels: skills.map(s => s.name), datasets: [dataset] }, options });
}

/* ---------- Graph 1: Profile Strength & Readiness (radar) ---------- */
const STRENGTH_LABELS = ["Basic Info", "Education", "Skills", "About Me", "Photo & Resume", "Application Activity"];

function computeStrength(profile) {
  const key = profileKey();
  const filled = v => String(v || "").trim().length > 0;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(profile.email || "").trim());
  const phoneOk = String(profile.phone || "").replace(/\D/g, "").length >= 9;

  const basic = (filled(profile.fullName) ? 25 : 0) + (emailOk ? 25 : 0) + (phoneOk ? 25 : 0) + (filled(profile.address) ? 25 : 0);
  const eduLen = String(profile.education || "").trim().length;
  const education = eduLen === 0 ? 0 : (eduLen >= 20 ? 100 : 70);
  const skills = Math.min(100, String(profile.skills || "").split(",").map(s => s.trim()).filter(Boolean).length * 20);
  const about = Math.min(100, Math.round(String(profile.about || "").trim().length / 150 * 100));
 const hasPhoto = true;
  const hasResume = !!LS.get("resume_" + key, null);
  const media = (hasPhoto ? 50 : 0) + (hasResume ? 50 : 0);

  // Application activity: applications submitted under the user's name or email (5+ = 100%)
  const session = getSession() || {};
  const names = [profile.fullName, session.fullName].filter(Boolean).map(s => s.trim().toLowerCase());
  const emails = [profile.email, session.email].filter(Boolean).map(s => s.trim().toLowerCase());
  const mine = dashApps().filter(a => names.includes(String(a.name || "").trim().toLowerCase()) || emails.includes(String(a.email || "").trim().toLowerCase()));
  const activity = Math.min(100, mine.length * 20);

  return [basic, education, skills, about, media, activity];
}

function renderStrengthChart() {
  const canvas = document.getElementById("profileStrengthChart");
  const summary = document.getElementById("profileStrengthSummary");
  if (!canvas) return;
  if (strengthChart) { strengthChart.destroy(); strengthChart = null; }

  const scores = computeStrength(getSavedProfile());
  const overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const level = overall >= 90 ? "Job-ready" : overall >= 70 ? "Strong" : overall >= 40 ? "Good progress" : "Getting started";
  if (summary) {
    const weakest = scores.indexOf(Math.min(...scores));
    summary.textContent = `Overall readiness: ${overall}% (${level})` +
      (scores[weakest] < 100 ? ` · Next step: improve "${STRENGTH_LABELS[weakest]}"` : "");
  }
  if (typeof Chart === "undefined") return;

  const t = chartTheme();
  strengthChart = new Chart(canvas, {
    type: "radar",
    data: {
      labels: STRENGTH_LABELS,
      datasets: [{
        label: "Profile Strength (%)", data: scores,
        borderColor: t.accent, borderWidth: 2, backgroundColor: t.accentFill,
        pointBackgroundColor: t.accent, pointRadius: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { color: t.text } } },
      scales: { r: {
        min: 0, max: 100, ticks: { stepSize: 20, color: t.muted, backdropColor: "transparent" },
        grid: { color: t.grid }, angleLines: { color: t.grid }, pointLabels: { color: t.text, font: { size: 12 } }
      } }
    }
  });
}

function renderProfileCharts() {
  renderStrengthChart();
  renderSkillsChart();
}

/* ---------- Personal Profile ---------- */
const MAX_RESUME_BYTES = 2 * 1024 * 1024; // 2 MB (Data URL ~1.33x, localStorage quota ~5 MB)
let profileMsgTimer = null;

function showProfileMsg(text, ok = true) {
  const el = document.getElementById("profileMsg");
  if (!el) return;
  el.className = `small ${ok ? "text-neon" : "text-danger"}`;
  el.innerHTML = `<i class="fa-solid ${ok ? "fa-circle-check" : "fa-triangle-exclamation"} me-1"></i>${esc(text)}`;
  clearTimeout(profileMsgTimer);
  profileMsgTimer = setTimeout(() => el.classList.add("d-none"), 3500);
}

function initProfile() {
  const key = profileKey();
  const session = getSession() || {};
  const data = getSavedProfile();

  Object.entries(PROFILE_FIELDS).forEach(([id, field]) => { document.getElementById(id).value = data[field] || ""; });
  document.getElementById("profUsername").value = session.username || "";

  const preview = document.getElementById("profileImagePreview");
  const img = LS.get("profileImg_" + key, null);
  if (img) preview.src = img;

  const nameEl = document.getElementById("resumeFileName");
  const resume = LS.get("resume_" + key, null);
  nameEl.textContent = resume && resume.name ? resume.name : "No resume uploaded yet";

  // Upload photo: shrink with Canvas, preview, save, update the menu avatar and the charts
  document.getElementById("profileImageInput").addEventListener("change", async e => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) return showProfileMsg("Please choose an image file.", false);
    try {
      const dataUrl = await compressImage(file, 256, "image/jpeg", 0.8);
      if (!LS.set("profileImg_" + key, dataUrl)) return showProfileMsg("Failed to save the photo (storage is full).", false);
      preview.src = dataUrl;
      updateUserName();
      renderProfileCharts();
      showProfileMsg("Profile photo updated.");
    } catch (err) { showProfileMsg("Failed to read the image.", false); }
  });

  // Upload resume: stored as a Data URL
  document.getElementById("resumeUploadInput").addEventListener("change", e => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (!/\.(pdf|doc|docx|txt)$/i.test(file.name)) return showProfileMsg("The file must be PDF, DOC, DOCX or TXT.", false);
    if (file.size > MAX_RESUME_BYTES) return showProfileMsg("The resume is larger than 2 MB.", false);
    const reader = new FileReader();
    reader.onerror = () => showProfileMsg("Failed to read the file.", false);
    reader.onload = () => {
      if (LS.set("resume_" + key, { name: file.name, type: file.type, data: reader.result })) {
        nameEl.textContent = file.name;
        renderProfileCharts();
        showProfileMsg("Resume uploaded successfully.");
      } else showProfileMsg("Failed to save the resume (storage is full).", false);
    };
    reader.readAsDataURL(file);
  });

  // Download resume (the real file, or a profile summary if none was uploaded)
  document.getElementById("btnDownloadResume").addEventListener("click", () => {
    const stored = LS.get("resume_" + key, null);
    const a = document.createElement("a");
    if (stored && stored.data) {
      a.href = stored.data;
      a.download = stored.name;
    } else {
      const v = id => document.getElementById(id).value.trim() || "-";
      const text = [
        "PROFILE SUMMARY - JOB ANALYTICS", "================================",
        `Full Name : ${v("profFullName")}`, `Email     : ${v("profEmail")}`, `Phone     : ${v("profPhone")}`,
        `Address   : ${v("profAddress")}`, `Education : ${v("profEducation")}`, `Skills    : ${v("profSkills")}`,
        "", "About Me:", v("profAbout")
      ].join("\n");
      a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
      a.download = "profile-summary.txt";
    }
    document.body.appendChild(a);
    a.click();
    a.remove();
    if (a.href.startsWith("blob:")) setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  // Save profile changes + refresh the two profile charts
  document.getElementById("profileForm").addEventListener("submit", e => {
    e.preventDefault();
    const profile = {};
    Object.entries(PROFILE_FIELDS).forEach(([id, field]) => { profile[field] = document.getElementById(id).value.trim(); });
    if (!LS.set("profile_" + key, profile)) return showProfileMsg("Failed to save the profile (storage is full).", false);

    const s = getSession() || {};
    LS.set("activeUserSession", { ...s, fullName: profile.fullName, email: profile.email, phone: profile.phone });
    const users = LS.get("registeredUsers", []);
    const u = users.find(x => x.username && x.username.toLowerCase() === (s.username || "").toLowerCase());
    if (u) { u.fullName = profile.fullName; u.email = profile.email; u.phone = profile.phone; LS.set("registeredUsers", users); }
    updateUserName();
    renderProfileCharts();
    showProfileMsg("Profile saved successfully.");
  });
}
