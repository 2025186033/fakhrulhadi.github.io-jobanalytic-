/**
 * Application Module - Applications table (Add, Edit, Delete, Search, Filter, Sort)
 * Depends on js/auth.js (LS, esc, fillSelect, safeUrl, getSession) - loaded first.
 */
const APP_STATUSES = ["Pending", "Reviewed", "Accepted", "Rejected"];

// Seed data: [id, name, email, company, position, date, status]
const APP_SEED = [
  ["APP-101", "Ahmad Zaki", "zaki@example.com", "PETRONAS", "Data Scientist", "2026-11-01", "Accepted"],
  ["APP-102", "Sarah Lee", "sarah.lee@example.com", "Shopee", "Frontend Engineer", "2026-11-03", "Pending"],
  ["APP-103", "Raj Kumar", "raj.kumar@example.com", "Maybank", "Financial Consultant", "2026-11-05", "Reviewed"],
  ["APP-104", "Ahmad Zaki", "zaki@example.com", "Grab", "Backend Developer", "2026-11-06", "Rejected"],
  ["APP-105", "Ahmad Zaki", "zaki@example.com", "CIMB Group", "Business Analyst", "2026-10-14", "Accepted"],
  ["APP-106", "Nur Aisyah", "aisyah@example.com", "Telekom Malaysia", "Network Engineer", "2026-10-02", "Pending"],
  ["APP-107", "Ahmad Zaki", "zaki@example.com", "AirAsia", "Software Engineer", "2026-09-18", "Rejected"],
  ["APP-108", "Ahmad Zaki", "zaki@example.com", "Tenaga Nasional (TNB)", "Systems Analyst", "2026-09-05", "Accepted"],
  ["APP-109", "Sarah Lee", "sarah.lee@example.com", "Shopee", "Data Analyst", "2026-08-21", "Reviewed"],
  ["APP-110", "Raj Kumar", "raj.kumar@example.com", "Maybank", "IT Auditor", "2026-07-11", "Rejected"],
  ["APP-111", "Ahmad Zaki", "zaki@example.com", "PETRONAS", "Digital Engineer", "2026-06-09", "Pending"],
  ["APP-112", "Nur Aisyah", "aisyah@example.com", "Grab", "Product Analyst", "2026-05-15", "Accepted"]
].map(([id, name, email, company, position, date, status]) => ({ id, name, email, company, position, date, status }));

// Load seed data if it does not exist yet (immediately, so the Dashboard always has data)
if (localStorage.getItem("jobApplications") === null) LS.set("jobApplications", APP_SEED);

let appSort = { key: "date", dir: "desc" };

function getApps() { const a = LS.get("jobApplications", []); return Array.isArray(a) ? a : []; }
function saveApps(apps) {
  if (!LS.set("jobApplications", apps)) { alert("Failed to save: browser storage is full."); return false; }
  return true;
}

function nextAppId(apps) {
  const max = apps.reduce((m, a) => Math.max(m, parseInt(String(a.id).replace(/\D/g, ""), 10) || 0), 100);
  return "APP-" + (max + 1);
}

// ---- Company website (matched automatically from the directory) ----
function companyWebsite(name) {
  const n = String(name || "").trim().toLowerCase();
  if (!n) return "";
  const dir = LS.get("companyDirectory", []);
  const c = (Array.isArray(dir) ? dir : []).find(x => String(x.name).toLowerCase() === n);
  return c ? safeUrl(c.website) : "";
}
function appWebsite(app) { return safeUrl(app.website) || companyWebsite(app.company); }
function visitBtn(url) {
  return url
    ? `<a class="btn btn-neon btn-sm text-nowrap" href="${esc(url)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-arrow-up-right-from-square me-1"></i>Visit Website</a>`
    : `<button type="button" class="btn btn-secondary-dark btn-sm text-nowrap" disabled title="No website URL"><i class="fa-solid fa-link-slash me-1"></i>Visit Website</button>`;
}
function showSavedAlert(record, isEdit) {
  const box = document.getElementById("appSavedAlert");
  if (!box) return;
  box.className = "alert alert-success d-flex flex-wrap align-items-center justify-content-between gap-2 mb-3";
  box.innerHTML = `<span><i class="fa-solid fa-circle-check me-2"></i>Application <strong>${esc(record.id)}</strong> for <strong>${esc(record.company)}</strong> was ${isEdit ? "updated" : "saved"} successfully.</span>${visitBtn(appWebsite(record))}`;
}

function populateCompanyLists() {
  const dir = LS.get("companyDirectory", []);
  const dirNames = (Array.isArray(dir) ? dir : []).map(c => c.name);
  const appNames = getApps().map(a => a.company);
  const all = [...new Set([...dirNames, ...appNames])].filter(Boolean).sort((a, b) => a.localeCompare(b));
  fillSelect(document.getElementById("filterCompanySelect"), all, "All Companies");
  const dl = document.getElementById("companyOptions");
  if (dl) dl.innerHTML = [...new Set(dirNames)].map(n => `<option value="${esc(n)}"></option>`).join("");
}

function renderAppTable() {
  const tbody = document.getElementById("applicationsTableBody");
  if (!tbody) return;
  const q = (document.getElementById("searchAppInput")?.value || "").trim().toLowerCase();
  const fCompany = document.getElementById("filterCompanySelect")?.value || "";
  const fStatus = document.getElementById("filterStatusSelect")?.value || "";
  const fYear = document.getElementById("filterYearSelect")?.value || "";

  const list = getApps().filter(a => {
    const hay = [a.id, a.name, a.company, a.position, a.email].join(" ").toLowerCase();
    return (!q || hay.includes(q)) && (!fCompany || a.company === fCompany) && (!fStatus || a.status === fStatus) &&
      (!fYear || String(a.date || "").startsWith(fYear + "-"));
  });

  const { key, dir } = appSort;
  list.sort((a, b) => {
    const r = String(a[key] ?? "").localeCompare(String(b[key] ?? ""), undefined, { numeric: true, sensitivity: "base" });
    return dir === "asc" ? r : -r;
  });

  tbody.innerHTML = list.length ? list.map(a => `
    <tr>
      <td>${esc(a.id)}</td>
      <td>${esc(a.name)}</td>
      <td>${esc(a.company)}</td>
      <td>${esc(a.position)}</td>
      <td>${esc(a.date)}</td>
      <td>${esc(a.email || "-")}</td>
      <td><span class="status-tag ${esc(String(a.status).toLowerCase())}">${esc(a.status)}</span></td>
      <td class="text-nowrap">
        ${visitBtn(appWebsite(a))}
        <button type="button" class="btn btn-outline-info btn-sm mx-1" data-action="edit" data-id="${esc(a.id)}" aria-label="Edit ${esc(a.id)}"><i class="fa-solid fa-pen"></i> Edit</button>
        <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${esc(a.id)}" aria-label="Delete ${esc(a.id)}"><i class="fa-solid fa-trash"></i> Delete</button>
      </td>
    </tr>`).join("")
    : `<tr><td colspan="8" class="text-center text-secondary py-4">No application records found.</td></tr>`;

  const rc = document.getElementById("resultCount");
  if (rc) rc.textContent = `${list.length} ${list.length === 1 ? "record" : "records"}`;

  // Update sort icons in the table header
  document.querySelectorAll("th.sortable").forEach(th => {
    const active = th.dataset.sort === key;
    th.classList.toggle("sorted", active);
    const icon = th.querySelector("i");
    if (icon) icon.className = "fa-solid " + (active ? (dir === "asc" ? "fa-sort-up" : "fa-sort-down") : "fa-sort");
    th.setAttribute("aria-sort", active ? (dir === "asc" ? "ascending" : "descending") : "none");
  });
}

function openAppModal(app, prefillCompany) {
  const form = document.getElementById("appForm");
  form.reset();
  const session = getSession() || {};
  document.getElementById("appModalTitle").textContent = app ? "Edit Application " + app.id : "Add New Application";
  document.getElementById("appId").value = app ? app.id : "";
  document.getElementById("appApplicantName").value = app ? app.name : (session.fullName || "");
  document.getElementById("appEmail").value = app ? (app.email || "") : (session.email || "");
  document.getElementById("appCompany").value = app ? app.company : (prefillCompany || "");
  document.getElementById("appPosition").value = app ? app.position : "";
  document.getElementById("appDate").value = app ? app.date : new Date().toISOString().slice(0, 10);
  document.getElementById("appStatus").value = app ? app.status : "Pending";
  const site = document.getElementById("appWebsite");
  site.setCustomValidity("");
  site.value = app ? (app.website || companyWebsite(app.company)) : companyWebsite(prefillCompany);
  site.dataset.auto = app && app.website ? "0" : "1";
  bootstrap.Modal.getOrCreateInstance(document.getElementById("appModal")).show();
}

function initAppEvents() {
  const modalEl = document.getElementById("appModal");

  document.getElementById("openAppModalBtn")?.addEventListener("click", () => openAppModal(null));
  document.getElementById("searchAppInput")?.addEventListener("input", renderAppTable);
  ["filterCompanySelect", "filterStatusSelect", "filterYearSelect"].forEach(id => document.getElementById(id)?.addEventListener("change", renderAppTable));

  // Auto-fill the website URL when the company name matches the directory
  const siteInput = document.getElementById("appWebsite");
  document.getElementById("appCompany")?.addEventListener("input", e => {
    const match = companyWebsite(e.target.value);
    if (match && (!siteInput.value || siteInput.dataset.auto === "1")) { siteInput.value = match; siteInput.dataset.auto = "1"; }
    else if (!match && siteInput.dataset.auto === "1") siteInput.value = "";
    siteInput.setCustomValidity("");
  });
  siteInput?.addEventListener("input", () => { siteInput.dataset.auto = "0"; siteInput.setCustomValidity(""); });

  // Sort columns
  document.querySelectorAll("th.sortable").forEach(th => {
    th.setAttribute("tabindex", "0");
    const sort = () => {
      const k = th.dataset.sort;
      appSort = { key: k, dir: appSort.key === k && appSort.dir === "asc" ? "desc" : "asc" };
      renderAppTable();
    };
    th.addEventListener("click", sort);
    th.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sort(); } });
  });

  // Edit / Delete (event delegation)
  document.getElementById("applicationsTableBody").addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const apps = getApps();
    const app = apps.find(a => a.id === btn.dataset.id);
    if (!app) return;
    if (btn.dataset.action === "edit") {
      openAppModal(app);
    } else if (confirm(`Are you sure you want to delete application ${app.id} (${app.company})?`)) {
      if (saveApps(apps.filter(a => a.id !== app.id))) {
        populateCompanyLists();
        renderAppTable();
      }
    }
  });

  // Save (add / update)
  document.getElementById("appForm").addEventListener("submit", e => {
    e.preventDefault();
    const apps = getApps();
    const id = document.getElementById("appId").value;

    // Website is optional; "https://" is added automatically when missing
    const rawSite = siteInput.value.trim();
    const site = safeUrl(rawSite);
    if (rawSite && !site) {
      siteInput.setCustomValidity("Please enter a valid website address, e.g. www.company.com");
      siteInput.reportValidity();
      return;
    }

    const statusVal = document.getElementById("appStatus").value;
    const record = {
      id: id || nextAppId(apps),
      name: document.getElementById("appApplicantName").value.trim(),
      email: document.getElementById("appEmail").value.trim(),
      company: document.getElementById("appCompany").value.trim(),
      position: document.getElementById("appPosition").value.trim(),
      date: document.getElementById("appDate").value,
      status: APP_STATUSES.includes(statusVal) ? statusVal : "Pending"
    };
    record.website = site || companyWebsite(record.company);

    const idx = apps.findIndex(a => a.id === id);
    const isEdit = !!(id && idx >= 0);
    if (isEdit) apps[idx] = record; else apps.unshift(record);
    if (!saveApps(apps)) return;

    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    populateCompanyLists();
    renderAppTable();
    showSavedAlert(record, isEdit);
  });

  // From "Apply Now": applications.html?company=CompanyName -> open the modal pre-filled
  const company = new URLSearchParams(window.location.search).get("company");
  if (company) {
    openAppModal(null, company);
    history.replaceState(null, "", window.location.pathname);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("applicationsTableBody")) return;
  populateCompanyLists();
  renderAppTable();
  initAppEvents();
});