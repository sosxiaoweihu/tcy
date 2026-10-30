const cityShelfPlanForm = document.querySelector("#cityShelfPlanForm");
const cityShelfPlanBusiness = document.querySelector("#cityShelfPlanBusiness");
const cityShelfPlanEnabled = document.querySelector("#cityShelfPlanEnabled");
const cityShelfPlanTimeField = document.querySelector("#cityShelfPlanTimeField");
const cityShelfPlanTime = document.querySelector("#cityShelfPlanTime");

const cityShelfPlanTabs = Array.from(cityShelfPlanPage.querySelectorAll(".city-shelf-plan-tabs [role='tab']"));

function activateCityShelfPlanTab(targetTab) {
  cityShelfPlanTabs.forEach((tab) => {
    const active = tab === targetTab;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute("aria-controls")).hidden = !active;
  });
}

cityShelfPlanTabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateCityShelfPlanTab(tab));
  tab.addEventListener("keydown", (event) => {
    let nextIndex;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % cityShelfPlanTabs.length;
    if (event.key === "ArrowLeft") nextIndex = (index - 1 + cityShelfPlanTabs.length) % cityShelfPlanTabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = cityShelfPlanTabs.length - 1;
    if (nextIndex === undefined) return;
    event.preventDefault();
    activateCityShelfPlanTab(cityShelfPlanTabs[nextIndex]);
    cityShelfPlanTabs[nextIndex].focus();
  });
});

// 沿用“同城业态”中的选项及顺序，默认选择第一项。
cityFormatPage.querySelectorAll(".city-format-table tbody tr").forEach((row, index) => {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "cityShelfPlanBusiness";
  input.value = row.cells[0].textContent.trim();
  input.checked = index === 0;
  input.required = true;
  label.append(input, document.createTextNode(row.cells[1].textContent.trim()));
  cityShelfPlanBusiness.append(label);
});

function getCityShelfPlanBusiness() {
  return cityShelfPlanBusiness.querySelector("input:checked")?.value || "";
}

// 静态原型仅在本次页面会话内保存，不创建实际的商品上架任务。
const cityShelfPlanSchedules = new Map();

function syncCityShelfPlanEnabled() {
  const enabled = cityShelfPlanEnabled.checked;
  cityShelfPlanTimeField.hidden = !enabled;
  cityShelfPlanTime.disabled = !enabled;
  cityShelfPlanTime.required = enabled;
}

function loadCityShelfPlanSchedule() {
  const schedule = cityShelfPlanSchedules.get(getCityShelfPlanBusiness()) || { enabled: false, time: "" };
  cityShelfPlanEnabled.checked = schedule.enabled;
  cityShelfPlanTime.value = schedule.time;
  syncCityShelfPlanEnabled();
}

function openCityShelfPlanPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城上下架计划");
  leaveTongchengAppPage();
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  unifiedCategorySidebar.hidden = true;
  tongchengPage.hidden = true;
  productPoolPage.hidden = true;
  cityOrderPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  productStockoutReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  cityOpsPage.hidden = true;
  cityFormatPage.hidden = true;
  backendCategoryPage.hidden = true;
  constructionPage.hidden = true;
  cityShelfPlanPage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll(".side-nav [data-nav]").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === "同城");
  });
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城上下架计划");
  });
}

cityShelfPlanBusiness.addEventListener("change", loadCityShelfPlanSchedule);
cityShelfPlanEnabled.addEventListener("change", syncCityShelfPlanEnabled);

cityShelfPlanForm.addEventListener("submit", (event) => {
  event.preventDefault();
  cityShelfPlanSchedules.set(getCityShelfPlanBusiness(), {
    enabled: cityShelfPlanEnabled.checked,
    time: cityShelfPlanTime.value
  });
  showToast("商品上架计划已提交（原型演示）");
});

loadCityShelfPlanSchedule();

// 待上架商品示例数据，仅用于列表与查询分页演示。
const cityShelfPendingProducts = [
  "农夫山泉饮用天然水550ml", "伊利纯牛奶250ml", "康师傅红烧牛肉面", "可口可乐330ml", "乐事原味薯片70g",
  "奥利奥原味夹心饼干", "维达抽纸3层100抽", "金龙鱼玉米油900ml", "双汇王中王火腿肠", "统一冰红茶500ml"
].map((name, index) => ({
  code: String(10010001 + index), name,
  storeCode: `S00${index % 3 + 1}`,
  storeName: ["人民路店", "中山路店", "世纪广场店"][index % 3],
  createdAt: `2026-09-07 09:${String(index * 5).padStart(2, "0")}:00`,
  updatedAt: `2026-09-08 08:${String(index * 5).padStart(2, "0")}:00`
}));
let cityShelfPendingPage = 1;
let cityShelfPendingQuery = "";
const cityShelfPendingSize = document.querySelector("#cityShelfPendingSize");
const cityShelfPendingJump = document.querySelector("#cityShelfPendingJump");
function renderCityShelfPending() {
  const records = cityShelfPendingProducts.filter((item) => item.code.includes(cityShelfPendingQuery));
  const size = Number(cityShelfPendingSize.value);
  const pages = Math.max(1, Math.ceil(records.length / size));
  cityShelfPendingPage = Math.max(1, Math.min(pages, cityShelfPendingPage));
  const start = (cityShelfPendingPage - 1) * size;
  document.querySelector("#cityShelfPendingBody").innerHTML = records.slice(start, start + size).map((item) =>
    `<tr>${[item.code, item.name, item.storeCode, item.storeName, item.createdAt, item.updatedAt].map((value) => `<td>${value}</td>`).join("")}</tr>`
  ).join("");
  document.querySelector("#cityShelfPendingEmpty").hidden = records.length > 0;
  document.querySelector("#cityShelfPendingTotal").textContent = `共 ${records.length} 条`;
  document.querySelector("#cityShelfPendingPagination").innerHTML =
    `<button type="button" data-pending-page="${cityShelfPendingPage - 1}" aria-label="上一页" ${cityShelfPendingPage === 1 ? "disabled" : ""}>‹</button>` +
    Array.from({ length: pages }, (_, i) => `<button type="button" data-pending-page="${i + 1}" ${cityShelfPendingPage === i + 1 ? 'class="active" aria-current="page"' : ""}>${i + 1}</button>`).join("") +
    `<button type="button" data-pending-page="${cityShelfPendingPage + 1}" aria-label="下一页" ${cityShelfPendingPage === pages ? "disabled" : ""}>›</button>`;
  cityShelfPendingJump.value = cityShelfPendingPage;
  cityShelfPendingJump.max = pages;
}
document.querySelector("#cityShelfPendingFilters").addEventListener("submit", (event) => {
  event.preventDefault();
  cityShelfPendingQuery = document.querySelector("#cityShelfPendingCode").value.trim();
  cityShelfPendingPage = 1;
  renderCityShelfPending();
});
document.querySelector("#cityShelfPendingFilters").addEventListener("reset", () => {
  cityShelfPendingQuery = "";
  cityShelfPendingPage = 1;
  renderCityShelfPending();
});
cityShelfPendingSize.addEventListener("change", () => { cityShelfPendingPage = 1; renderCityShelfPending(); });
document.querySelector("#cityShelfPendingPagination").addEventListener("click", (event) => {
  const button = event.target.closest("[data-pending-page]");
  if (!button || button.disabled) return;
  cityShelfPendingPage = Number(button.dataset.pendingPage);
  renderCityShelfPending();
});
cityShelfPendingJump.addEventListener("change", () => {
  cityShelfPendingPage = Math.trunc(Number(cityShelfPendingJump.value)) || 1;
  renderCityShelfPending();
});
renderCityShelfPending();
