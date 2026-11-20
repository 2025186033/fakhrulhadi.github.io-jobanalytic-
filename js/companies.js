/**
 * Companies Module - Directory of 120 Malaysian Companies (Bootstrap grid cards)
 * Add, Edit, Delete, Details, Search, Filter (industry / location / vacancy), Sort, Apply Now.
 * Depends on js/auth.js (LS, esc, fillSelect, compressImage, safeUrl).
 * Ratings, review counts, open positions and vacancy status are SIMULATED demo data.
 */
const COMPANY_DATA_VERSION = 3;   // bumped: industries/descriptions/vacancy labels are now English

// Location code -> [city, state]
const LOC = {
  KL: ["Kuala Lumpur", "W.P. Kuala Lumpur"], PU: ["Putrajaya", "W.P. Putrajaya"],
  PJ: ["Petaling Jaya", "Selangor"], SA: ["Shah Alam", "Selangor"], SJ: ["Subang Jaya", "Selangor"], SP: ["Sepang", "Selangor"],
  KG: ["Klang", "Selangor"], PK: ["Port Klang", "Selangor"], CJ: ["Cyberjaya", "Selangor"], PC: ["Puchong", "Selangor"],
  RW: ["Rawang", "Selangor"], SK: ["Seri Kembangan", "Selangor"], SD: ["Serdang", "Selangor"],
  SR: ["Seremban", "Negeri Sembilan"],
  JB: ["Johor Bahru", "Johor"], GP: ["Gelang Patah", "Johor"], NJ: ["Iskandar Puteri", "Johor"],
  BL: ["Bayan Lepas", "Pulau Pinang"], BK: ["Batu Kawan", "Pulau Pinang"], GT: ["George Town", "Pulau Pinang"], GL: ["Gelugor", "Pulau Pinang"],
  IP: ["Ipoh", "Perak"], SI: ["Seri Iskandar", "Perak"], TP: ["Taiping", "Perak"], LM: ["Lumut", "Perak"], KP: ["Kampar", "Perak"],
  KU: ["Kulim", "Kedah"], AS: ["Alor Setar", "Kedah"], LK: ["Langkawi", "Kedah"], SN: ["Sintok", "Kedah"],
  KC: ["Kuching", "Sarawak"], BT: ["Bintulu", "Sarawak"], KK: ["Kota Kinabalu", "Sabah"]
};

const INDUSTRY_EMOJI = {
  "Banking & Finance": "🏦", "Oil, Gas & Energy": "🛢️", "Conglomerates & Plantations": "🏢", "Telecommunications": "📡",
  "Technology & E-Commerce": "💻", "Logistics & Transportation": "✈️", "Electronics & Manufacturing": "🏭", "Automotive": "🚗",
  "Property & Construction": "🏗️", "Retail & F&B": "🛒", "Healthcare": "🏥", "Education": "🎓",
  "Hospitality & Tourism": "🏨", "Defence & Shipbuilding": "⚓", "Agriculture & Agencies": "🌾"
};

// Industry -> [name, official website, location code]
const COMPANY_ROWS = [
  ["Banking & Finance", [
    ["Maybank", "https://www.maybank.com", "KL"], ["CIMB Group", "https://www.cimb.com", "KL"],
    ["Public Bank", "https://www.publicbank.com.my", "KL"], ["RHB Bank", "https://www.rhbgroup.com", "KL"],
    ["Hong Leong Bank", "https://www.hlb.com.my", "KL"], ["AmBank Group", "https://www.ambankgroup.com", "KL"],
    ["Bank Islam", "https://www.bankislam.com", "KL"], ["Bank Rakyat", "https://www.bankrakyat.com.my", "KL"],
    ["Allianz Malaysia", "https://www.allianz.com.my", "KL"], ["Etiqa", "https://www.etiqa.com.my", "KL"],
    ["AIA Malaysia", "https://www.aia.com.my", "KL"], ["Prudential Malaysia", "https://www.prudential.com.my", "KL"],
    ["Bursa Malaysia", "https://www.bursamalaysia.com", "KL"], ["KWSP (EPF)", "https://www.kwsp.gov.my", "KL"]]],
  ["Oil, Gas & Energy", [
    ["PETRONAS", "https://www.petronas.com", "KL"], ["Petronas Chemicals", "https://www.petronaschemicals.com", "KL"],
    ["Petronas Dagangan", "https://www.petronasdagangan.com.my", "KL"], ["Tenaga Nasional (TNB)", "https://www.tnb.com.my", "KL"],
    ["Malakoff Corporation", "https://www.malakoff.com.my", "KL"], ["YTL Corporation", "https://www.ytl.com", "KL"],
    ["Sapura Energy", "https://www.sapuraenergy.com", "KL"], ["Dialog Group", "https://www.dialogasia.com", "KL"],
    ["Sarawak Energy", "https://www.sarawakenergy.com", "KC"], ["Yinson Holdings", "https://www.yinson.com", "KL"]]],
  ["Conglomerates & Plantations", [
    ["Sime Darby", "https://www.simedarby.com", "KL"], ["SD Guthrie", "https://www.sdguthrie.com", "PJ"],
    ["IOI Corporation", "https://www.ioigroup.com", "PU"], ["Kuala Lumpur Kepong (KLK)", "https://www.klk.com.my", "KL"],
    ["FGV Holdings", "https://www.fgvholdings.com", "KL"], ["Genting Berhad", "https://www.genting.com", "KL"],
    ["Johor Corporation", "https://www.jcorp.com.my", "JB"]]],
  ["Telecommunications", [
    ["Axiata Group", "https://www.axiata.com", "KL"], ["Telekom Malaysia", "https://www.tm.com.my", "KL"],
    ["Maxis", "https://www.maxis.com.my", "KL"], ["CelcomDigi", "https://www.celcomdigi.com", "KL"],
    ["U Mobile", "https://www.u.com.my", "KL"], ["TIME dotCom", "https://www.time.com.my", "KL"]]],
  ["Technology & E-Commerce", [
    ["Shopee", "https://shopee.com.my", "KL"], ["Grab", "https://www.grab.com/my", "PJ"],
    ["Lazada Malaysia", "https://www.lazada.com.my", "KL"], ["Touch 'n Go", "https://www.touchngo.com.my", "KL"],
    ["MyEG Services", "https://www.myeg.com.my", "PJ"], ["Mesiniaga", "https://www.mesiniaga.com.my", "SJ"],
    ["Carsome", "https://www.carsome.my", "KL"], ["foodpanda Malaysia", "https://www.foodpanda.my", "KL"],
    ["MIMOS", "https://www.mimos.my", "KL"], ["MDEC", "https://mdec.my", "CJ"],
    ["Microsoft Malaysia", "https://www.microsoft.com/en-my", "KL"], ["Google Malaysia", "https://www.google.com.my", "KL"],
    ["Dell Technologies Malaysia", "https://www.dell.com/en-my", "CJ"], ["PayNet", "https://www.paynet.my", "KL"],
    ["ViTrox", "https://www.vitrox.com", "BL"]]],
  ["Logistics & Transportation", [
    ["AirAsia", "https://www.airasia.com", "SP"], ["Malaysia Airlines", "https://www.malaysiaairlines.com", "SP"],
    ["Malaysia Airports", "https://www.malaysiaairports.com.my", "SP"], ["Pos Malaysia", "https://www.pos.com.my", "KL"],
    ["MISC Berhad", "https://www.misc.com.my", "KL"], ["Westports Holdings", "https://www.westportsholdings.com", "PK"],
    ["Pelabuhan Tanjung Pelepas", "https://www.ptp.com.my", "GP"], ["KTM Berhad (KTMB)", "https://www.ktmb.com.my", "KL"],
    ["J&T Express Malaysia", "https://www.jtexpress.my", "KL"]]],
  ["Electronics & Manufacturing", [
    ["Intel Malaysia", "https://www.intel.com", "BL"], ["AMD Malaysia", "https://www.amd.com", "BL"],
    ["Infineon Technologies", "https://www.infineon.com", "KU"], ["Micron Technology", "https://www.micron.com", "BK"],
    ["Keysight Technologies", "https://www.keysight.com", "BL"], ["Motorola Solutions", "https://www.motorolasolutions.com", "BL"],
    ["Bosch Malaysia", "https://www.bosch.com.my", "BL"], ["Texas Instruments Malaysia", "https://www.ti.com", "KL"],
    ["SilTerra Malaysia", "https://www.silterra.com", "KU"], ["First Solar Malaysia", "https://www.firstsolar.com", "KU"],
    ["Samsung SDI Energy Malaysia", "https://www.samsungsdi.com", "SR"], ["Top Glove", "https://www.topglove.com", "SA"],
    ["Hartalega", "https://www.hartalega.com.my", "SP"], ["Kossan Rubber", "https://www.kossan.com.my", "KG"],
    ["Press Metal", "https://www.pressmetal.com", "BT"]]],
  ["Automotive", [
    ["Proton", "https://www.proton.com", "SA"], ["Perodua", "https://www.perodua.com.my", "RW"],
    ["Honda Malaysia", "https://www.honda.com.my", "KL"], ["UMW Holdings", "https://www.umwholdings.com", "SA"]]],
  ["Property & Construction", [
    ["SP Setia", "https://www.spsetia.com.my", "SA"], ["IJM Corporation", "https://www.ijm.com", "PJ"],
    ["Gamuda", "https://www.gamuda.com.my", "PJ"], ["Sunway Berhad", "https://www.sunway.com.my", "SJ"],
    ["Malayan Cement", "https://www.malayancement.com", "KL"]]],
  ["Retail & F&B", [
    ["AEON Co. (M)", "https://www.aeonretail.com.my", "KL"], ["Mydin", "https://www.mydin.com.my", "SK"],
    ["99 Speedmart", "https://www.99speedmart.com.my", "KG"], ["Nestlé Malaysia", "https://www.nestle.com.my", "PJ"],
    ["Dutch Lady Milk", "https://www.dutchlady.com.my", "PJ"], ["Carlsberg Malaysia", "https://www.carlsbergmalaysia.com.my", "SA"],
    ["Fraser & Neave", "https://www.fn.com.my", "KL"], ["QL Resources", "https://www.ql.com.my", "PJ"],
    ["Padini", "https://www.padini.com", "KL"], ["McDonald's Malaysia", "https://www.mcdonalds.com.my", "KL"],
    ["Secret Recipe", "https://www.secretrecipe.com.my", "KL"], ["ZUS Coffee", "https://www.zuscoffee.com", "KL"],
    ["OldTown White Coffee", "https://www.oldtown.com.my", "IP"], ["Spritzer", "https://www.spritzer.com.my", "TP"]]],
  ["Healthcare", [
    ["IHH Healthcare", "https://www.ihhhealthcare.com", "KL"], ["KPJ Healthcare", "https://www.kpjhealth.com.my", "KL"],
    ["Pharmaniaga", "https://www.pharmaniaga.com", "PC"]]],
  ["Education", [
    ["Universiti Malaya", "https://www.um.edu.my", "KL"], ["Universiti Teknologi MARA (UiTM)", "https://uitm.edu.my", "SA"],
    ["Universiti Putra Malaysia (UPM)", "https://www.upm.edu.my", "SD"], ["Asia Pacific University (APU)", "https://www.apu.edu.my", "KL"],
    ["Sunway University", "https://university.sunway.edu.my", "SJ"], ["Taylor's University", "https://university.taylors.edu.my", "SJ"],
    ["Universiti Sains Malaysia (USM)", "https://www.usm.my", "GL"], ["Universiti Teknologi Malaysia (UTM)", "https://www.utm.my", "JB"],
    ["Universiti Teknologi PETRONAS (UTP)", "https://www.utp.edu.my", "SI"], ["Universiti Tunku Abdul Rahman (UTAR)", "https://www.utar.edu.my", "KP"],
    ["Universiti Utara Malaysia (UUM)", "https://www.uum.edu.my", "SN"]]],
  ["Hospitality & Tourism", [
    ["LEGOLAND Malaysia Resort", "https://www.legoland.com.my", "NJ"], ["Sutera Harbour Resort", "https://www.suteraharbour.com", "KK"],
    ["Eastern & Oriental (E&O)", "https://www.eando.com", "GT"], ["The Datai Langkawi", "https://www.thedatai.com", "LK"]]],
  ["Defence & Shipbuilding", [
    ["Boustead Naval Shipyard", "https://www.bnsb.com.my", "LM"]]],
  ["Agriculture & Agencies", [
    ["MADA (Muda Agricultural Development Authority)", "https://www.mada.gov.my", "AS"], ["LADA (Langkawi Development Authority)", "https://www.lada.gov.my", "LK"]]]
];

// Build seed data (rating, reviews & vacancies are generated deterministically = simulated)
function buildCompanySeed() {
  const out = [];
  let i = 0;
  COMPANY_ROWS.forEach(([industry, list]) => list.forEach(([name, website, loc]) => {
    i++;
    const [city, state] = LOC[loc];
    const isFull = (i * 7 + 3) % 5 === 0;
    const positions = isFull ? 0 : ((i * 13 + 5) % 24) + 1;
    out.push({
      id: i, name, industry, location: city, state, website,
      rating: +(3.8 + ((i * 37) % 12) / 10).toFixed(1),
      reviews: 300 + ((i * 977) % 6000),
      positions, vacancy: isFull ? "Full" : "Openings",
      emoji: INDUSTRY_EMOJI[industry] || "🏢", logo: "",
      desc: `${name} is an organisation in the ${industry.toLowerCase()} sector, operating in ${city}, ${state}.`
    });
  }));
  return out;
}

// Load seed data immediately. Companies added by the user (id > 1000) are kept when the data version is upgraded.
(function seedCompanies() {
  const stored = LS.get("companyDirectory", null);
  const ver = Number(localStorage.getItem("companyDataVersion")) || 0;
  if (!Array.isArray(stored) || ver < COMPANY_DATA_VERSION) {
    const custom = Array.isArray(stored) ? stored.filter(c => c.id > 1000) : [];
    LS.set("companyDirectory", [...custom, ...buildCompanySeed()]);
    localStorage.setItem("companyDataVersion", String(COMPANY_DATA_VERSION));
  }
})();

const LOGO_PLACEHOLDER = "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='72' height='72'%3E%3Crect width='72' height='72' fill='%23a78bfa' fill-opacity='.15'/%3E%3Ctext x='36' y='46' font-size='30' text-anchor='middle'%3E%F0%9F%8F%A2%3C/text%3E%3C/svg%3E";
let compPendingLogo = null;   // New logo Data URL (not saved yet)
let compDetailId = null;      // Company ID shown in #detailModal

// Older saved data may use the previous Malay vacancy labels; map them to the English ones
const LEGACY_VACANCY = { "Ada Kekosongan": "Openings", "Penuh": "Full" };
function normalizeCompany(c) {
  const positions = Math.max(0, Number(c.positions) || 0);
  const v = LEGACY_VACANCY[c.vacancy] || c.vacancy;
  return { ...c, state: c.state || "", website: safeUrl(c.website), positions,
    vacancy: v === "Openings" || v === "Full" ? v : (positions > 0 ? "Openings" : "Full") };
}
function getComps() { const c = LS.get("companyDirectory", []); return Array.isArray(c) ? c.map(normalizeCompany) : []; }
function saveComps(list) {
  if (!LS.set("companyDirectory", list)) { alert("Failed to save: browser storage is full."); return false; }
  return true;
}
function logoHtml(c) { return c.logo ? `<img src="${esc(c.logo)}" alt="Logo ${esc(c.name)}">` : esc(c.emoji || "🏢"); }
function placeText(c) { return c.state && c.state !== c.location ? `${c.location}, ${c.state}` : c.location; }
function applyToCompany(name) { window.location.href = "applications.html?company=" + encodeURIComponent(name); }
function vacancyBadge(c) {
  return c.vacancy === "Full"
    ? `<span class="vacancy-badge full"><i class="fa-solid fa-circle-xmark"></i>Full</span>`
    : `<span class="vacancy-badge open"><i class="fa-solid fa-circle-check"></i>Openings · ${c.positions}</span>`;
}
function websiteBtn(c, cls) {
  return c.website
    ? `<a class="btn ${cls}" href="${esc(c.website)}" target="_blank" rel="noopener noreferrer" aria-label="Website of ${esc(c.name)}" title="Official website"><i class="fa-solid fa-globe"></i></a>`
    : "";
}

function companyCard(c) {
  return `
  <div class="col-12 col-md-6 col-lg-4">
    <article class="card company-card h-100">
      <div class="card-body p-3">
        <div class="d-flex align-items-center gap-3 mb-3">
          <div class="company-logo">${logoHtml(c)}</div>
          <div class="flex-grow-1 min-w-0">
            <h2 class="h6 mb-0 text-truncate" title="${esc(c.name)}">${esc(c.name)}</h2>
            <small class="text-secondary d-block text-truncate">${esc(c.industry)} • ${esc(placeText(c))}</small>
          </div>
          <span class="rating-badge" title="Google rating (simulated)"><i class="fa-solid fa-star"></i> ${Number(c.rating).toFixed(1)}</span>
        </div>
        <p class="small mb-3 company-desc">${esc(c.desc)}</p>
        <div class="d-flex justify-content-between align-items-center small text-secondary mb-3">
          <span><i class="fa-solid fa-comments me-1"></i>${Number(c.reviews || 0).toLocaleString("en-MY")} reviews</span>
          ${vacancyBadge(c)}
        </div>
        <div class="d-flex flex-wrap gap-2 mt-auto">
          <button type="button" class="btn btn-secondary-dark btn-sm" data-action="detail" data-id="${c.id}"><i class="fa-solid fa-eye me-1"></i>Details</button>
          <button type="button" class="btn btn-neon btn-sm flex-grow-1" data-action="apply" data-id="${c.id}">Apply Now</button>
          ${websiteBtn(c, "btn-secondary-dark btn-sm")}
          <button type="button" class="btn btn-outline-info btn-sm" data-action="edit" data-id="${c.id}" aria-label="Edit ${esc(c.name)}"><i class="fa-solid fa-pen"></i></button>
          <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" data-id="${c.id}" aria-label="Delete ${esc(c.name)}"><i class="fa-solid fa-trash"></i></button>
        </div>
      </div>
    </article>
  </div>`;
}

// Refill filter options (industries, and locations grouped by state)
function refreshFilterOptions() {
  const all = getComps();
  fillSelect(document.getElementById("filterIndustrySelect"), [...new Set(all.map(c => c.industry))].sort((a, b) => a.localeCompare(b)), "All Industries");

  const sel = document.getElementById("filterLocationSelect");
  if (!sel) return;
  const cur = sel.value;
  const byState = {};
  all.forEach(c => { (byState[c.state || "Other"] = byState[c.state || "Other"] || new Set()).add(c.location); });
  sel.innerHTML = '<option value="">All Locations</option>' + Object.keys(byState).sort((a, b) => a.localeCompare(b)).map(st =>
    `<optgroup label="${esc(st)}">${[...byState[st]].sort((a, b) => a.localeCompare(b)).map(l => `<option value="${esc(l)}">${esc(l)}</option>`).join("")}</optgroup>`).join("");
  sel.value = [...sel.options].some(o => o.value === cur) ? cur : "";
}

function renderCompanies() {
  const grid = document.getElementById("companiesGrid");
  if (!grid) return;
  const q = (document.getElementById("searchCompanyInput")?.value || "").trim().toLowerCase();
  const ind = document.getElementById("filterIndustrySelect")?.value || "";
  const loc = document.getElementById("filterLocationSelect")?.value || "";
  const vac = document.getElementById("filterVacancySelect")?.value || "";
  const sort = document.getElementById("sortCompanySelect")?.value || "name";

  const list = getComps().filter(c =>
    (!q || c.name.toLowerCase().includes(q)) && (!ind || c.industry === ind) && (!loc || c.location === loc) && (!vac || c.vacancy === vac));
  list.sort(sort === "rating" ? (a, b) => b.rating - a.rating || a.name.localeCompare(b.name)
    : sort === "positions" ? (a, b) => b.positions - a.positions || a.name.localeCompare(b.name)
    : (a, b) => a.name.localeCompare(b.name));

  const rc = document.getElementById("resultCount");
  if (rc) rc.textContent = `${list.length} ${list.length === 1 ? "company" : "companies"}`;
  grid.innerHTML = list.length ? list.map(companyCard).join("")
    : `<div class="col-12"><div class="card p-4 text-center text-secondary">No companies found.</div></div>`;
}

function openCompanyModal(c) {
  document.getElementById("companyForm").reset();
  compPendingLogo = null;
  document.getElementById("compWebsite").setCustomValidity("");
  document.getElementById("compModalTitle").textContent = c ? "Edit Company" : "Add New Company";
  document.getElementById("compId").value = c ? c.id : "";
  document.getElementById("logoPreview").src = (c && c.logo) || LOGO_PLACEHOLDER;
  document.getElementById("compVacancy").value = c ? c.vacancy : "Openings";
  if (c) {
    document.getElementById("compName").value = c.name;
    document.getElementById("compIndustry").value = c.industry;
    document.getElementById("compLocation").value = c.location;
    document.getElementById("compState").value = c.state;
    document.getElementById("compRating").value = c.rating;
    document.getElementById("compReviews").value = c.reviews || 0;
    document.getElementById("compPositions").value = c.positions || 0;
    document.getElementById("compWebsite").value = c.website || "";
    document.getElementById("compDesc").value = c.desc;
  }
  bootstrap.Modal.getOrCreateInstance(document.getElementById("companyModal")).show();
}

function openDetailModal(c) {
  compDetailId = c.id;
  document.getElementById("detailTitle").textContent = c.name;
  document.getElementById("detailBody").innerHTML = `
    <div class="d-flex align-items-center gap-3 mb-3">
      <div class="company-logo">${logoHtml(c)}</div>
      <div>
        <div class="fw-semibold">${esc(c.name)}</div>
        <small class="text-secondary">${esc(c.industry)} • ${esc(placeText(c))}</small>
      </div>
    </div>
    <p>${esc(c.desc)}</p>
    <ul class="list-unstyled mb-0">
      <li class="mb-2"><span class="rating-badge"><i class="fa-solid fa-star"></i> ${Number(c.rating).toFixed(1)}</span> <span class="text-secondary small">Google rating (simulated)</span></li>
      <li class="mb-2"><i class="fa-solid fa-comments me-2 text-secondary"></i>${Number(c.reviews || 0).toLocaleString("en-MY")} reviews</li>
      <li class="mb-2"><i class="fa-solid fa-briefcase me-2 text-secondary"></i>Vacancy status: ${vacancyBadge(c)}</li>
      <li>${c.website ? `<a href="${esc(c.website)}" target="_blank" rel="noopener noreferrer"><i class="fa-solid fa-globe me-2"></i>${esc(c.website.replace(/^https?:\/\//, ""))}</a>` : '<span class="text-secondary small">No website</span>'}</li>
    </ul>`;
  bootstrap.Modal.getOrCreateInstance(document.getElementById("detailModal")).show();
}

function initCompEvents() {
  const modalEl = document.getElementById("companyModal");
  const siteInput = document.getElementById("compWebsite");

  document.getElementById("openCompanyModalBtn")?.addEventListener("click", () => openCompanyModal(null));
  document.getElementById("searchCompanyInput")?.addEventListener("input", renderCompanies);
  ["filterIndustrySelect", "filterLocationSelect", "filterVacancySelect", "sortCompanySelect"].forEach(id =>
    document.getElementById(id)?.addEventListener("change", renderCompanies));
  siteInput?.addEventListener("input", () => siteInput.setCustomValidity(""));

  // Card buttons (event delegation)
  document.getElementById("companiesGrid").addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const comps = getComps();
    const c = comps.find(x => String(x.id) === btn.dataset.id);
    if (!c) return;
    const action = btn.dataset.action;
    if (action === "detail") openDetailModal(c);
    else if (action === "apply") applyToCompany(c.name);
    else if (action === "edit") openCompanyModal(c);
    else if (action === "delete" && confirm(`Are you sure you want to delete ${c.name}?`)) {
      if (saveComps(comps.filter(x => x.id !== c.id))) {
        refreshFilterOptions();
        renderCompanies();
      }
    }
  });

  document.getElementById("detailApplyBtn")?.addEventListener("click", () => {
    const c = getComps().find(x => x.id === compDetailId);
    if (c) applyToCompany(c.name);
  });

  // Logo upload + preview
  document.getElementById("compLogo")?.addEventListener("change", async e => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Please choose an image file."); e.target.value = ""; return; }
    if (file.size > 300 * 1024) { alert("The logo is larger than 300 KB."); e.target.value = ""; return; }
    try {
      compPendingLogo = await compressImage(file, 160, "image/png");
      document.getElementById("logoPreview").src = compPendingLogo;
    } catch (err) { alert("Failed to read the image."); }
  });

  // Save (add / update)
  document.getElementById("companyForm").addEventListener("submit", e => {
    e.preventDefault();
    const rating = parseFloat(document.getElementById("compRating").value);
    if (!(rating >= 1 && rating <= 5)) { alert("Rating must be between 1.0 and 5.0."); return; }
    const rawSite = siteInput.value.trim();
    const website = safeUrl(rawSite);   // adds https:// automatically when missing
    if (rawSite && !website) {
      siteInput.setCustomValidity("Please enter a valid website address, e.g. www.company.com");
      siteInput.reportValidity();
      return;
    }

    const comps = getComps();
    const id = Number(document.getElementById("compId").value) || 0;
    const existing = comps.find(c => c.id === id);
    const vacancy = document.getElementById("compVacancy").value === "Full" ? "Full" : "Openings";
    let positions = Math.max(0, parseInt(document.getElementById("compPositions").value, 10) || 0);
    if (vacancy === "Full") positions = 0; else if (positions === 0) positions = 1;

    const record = {
      id: existing ? existing.id : Date.now(),
      name: document.getElementById("compName").value.trim(),
      industry: document.getElementById("compIndustry").value.trim(),
      location: document.getElementById("compLocation").value.trim(),
      state: document.getElementById("compState").value,
      rating,
      reviews: Math.max(0, parseInt(document.getElementById("compReviews").value, 10) || 0),
      positions, vacancy, website,
      desc: document.getElementById("compDesc").value.trim(),
      emoji: existing ? existing.emoji : "🏢",
      logo: compPendingLogo || (existing ? existing.logo : "")
    };
    if (existing) comps[comps.indexOf(existing)] = record; else comps.unshift(record);
    if (!saveComps(comps)) return;
    bootstrap.Modal.getOrCreateInstance(modalEl).hide();
    refreshFilterOptions();
    renderCompanies();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (!document.getElementById("companiesGrid")) return;
  refreshFilterOptions();
  renderCompanies();
  initCompEvents();
});