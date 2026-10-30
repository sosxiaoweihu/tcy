let activeFrontendCategoryCorrectionRow = null;

function getCityOpsSelectedStores() {
  return Array.from(cityOpsStoreDropdown.querySelectorAll("input:checked"));
}

function syncCityOpsStoreValue() {
  const selected = getCityOpsSelectedStores();
  if (selected.length === 0) {
    cityOpsStoreValue.textContent = "支持多选";
    cityOpsStoreControl.classList.remove("has-value");
    return;
  }
  cityOpsStoreValue.textContent = selected.length === 1 ? selected[0].value : `已选择 ${selected.length} 家门店`;
  cityOpsStoreControl.classList.add("has-value");
}

function closeCityOpsStoreDropdown() {
  cityOpsStoreDropdown.hidden = true;
  cityOpsStoreControl.setAttribute("aria-expanded", "false");
}

function getFrontendCategorySelectedStores() {
  return Array.from(frontendCategoryStoreDropdown.querySelectorAll("input:checked"));
}

function syncFrontendCategoryStoreValue() {
  const selected = getFrontendCategorySelectedStores();
  if (selected.length === 0) {
    frontendCategoryStoreValue.textContent = "支持多选";
    frontendCategoryStoreControl.classList.remove("has-value");
    return;
  }
  frontendCategoryStoreValue.textContent = selected.length === 1 ? selected[0].value : `已选择 ${selected.length} 家门店`;
  frontendCategoryStoreControl.classList.add("has-value");
}

function closeFrontendCategoryStoreDropdown() {
  frontendCategoryStoreDropdown.hidden = true;
  frontendCategoryStoreControl.setAttribute("aria-expanded", "false");
}

function createCityOpsRow(values) {
  const row = document.createElement("tr");
  row.dataset.taskCode = values[0];
  values.forEach((value) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.append(cell);
  });
  const actionCell = document.createElement("td");
  const downloadButton = document.createElement("button");
  downloadButton.className = "city-ops-download";
  downloadButton.type = "button";
  downloadButton.dataset.downloadTask = values[0];
  downloadButton.textContent = "下载差异";
  actionCell.append(downloadButton);
  row.append(actionCell);
  return row;
}

function createFrontendCategoryRow(values) {
  const row = document.createElement("tr");
  row.dataset.taskCode = values[0];
  values.forEach((value, index) => {
    const cell = document.createElement("td");
    cell.textContent = value;
    if (index === 6) cell.className = "frontend-category-correction-status";
    row.append(cell);
  });
  const actionCell = document.createElement("td");
  const actionGroup = document.createElement("div");
  actionGroup.className = "city-ops-row-actions";
  const downloadButton = document.createElement("button");
  downloadButton.className = "city-ops-download";
  downloadButton.type = "button";
  downloadButton.dataset.frontendCategoryDownload = values[0];
  downloadButton.textContent = "下载差异";
  const correctionButton = document.createElement("button");
  correctionButton.className = "city-ops-download";
  correctionButton.type = "button";
  correctionButton.dataset.frontendCategoryCorrect = values[0];
  correctionButton.textContent = "修正";
  actionGroup.append(downloadButton, correctionButton);
  actionCell.append(actionGroup);
  row.append(actionCell);
  return row;
}

function renderCityOpsRows(rows) {
  cityOpsTableBody.replaceChildren(...rows.map(createCityOpsRow));
  cityOpsEmptyState.hidden = rows.length > 0;
}

function formatCityOpsTime(date = new Date()) {
  const pad = (value) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function showCityOpsTool(toolName) {
  const isFrontendCategory = toolName === "frontend-category";
  cityOpsPlatformWorkbench.hidden = isFrontendCategory;
  cityOpsFrontendCategoryWorkbench.hidden = !isFrontendCategory;
  document.querySelectorAll("[data-city-ops-tool]").forEach((button) => {
    const isActive = button.dataset.cityOpsTool === toolName;
    button.classList.toggle("active", isActive);
    button.setAttribute("aria-pressed", String(isActive));
  });
  closeCityOpsStoreDropdown();
  closeFrontendCategoryStoreDropdown();
}

function downloadCityOpsDifference(row, filePrefix, taskCode) {
  const values = Array.from(row.cells).slice(0, -1).map((cell) => cell.textContent.trim());
  const headers = Array.from(row.closest("table").querySelectorAll("thead th")).slice(0, -1).map((cell) => cell.textContent.trim());
  const escapeCsv = (value) => `"${String(value).replaceAll('"', '""')}"`;
  const csv = `\uFEFF${headers.map(escapeCsv).join(",")}\n${values.map(escapeCsv).join(",")}`;
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filePrefix}_${taskCode}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast(`任务 ${taskCode} 差异文件已生成`);
}

function openFrontendCategoryCorrectionModal(row) {
  activeFrontendCategoryCorrectionRow = row;
  const storeCode = row.dataset.correctionStore || row.cells[2]?.textContent.trim();
  frontendCategoryCorrectionStore.value = Array.from(frontendCategoryCorrectionStore.options).some((option) => option.value === storeCode) ? storeCode : "";
  frontendCategoryCorrectionModal.classList.add("open");
  frontendCategoryCorrectionModal.setAttribute("aria-hidden", "false");
}

function closeFrontendCategoryCorrectionModal() {
  frontendCategoryCorrectionModal.classList.remove("open");
  frontendCategoryCorrectionModal.setAttribute("aria-hidden", "true");
  frontendCategoryCorrectionStore.value = "";
  activeFrontendCategoryCorrectionRow = null;
}

function openCityOpsPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城运维工具");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  unifiedCategorySidebar.hidden = true;
  tongchengPage.hidden = true;
  productPoolPage.hidden = true;
  cityOrderPage.hidden = true;
  customTaskPage.hidden = true;
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
  constructionPage.hidden = true;
  cityFormatPage.hidden = true;
  cityOpsPage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城运维工具");
  });
}

cityOpsStoreControl.addEventListener("click", () => {
  const shouldOpen = cityOpsStoreDropdown.hidden;
  cityOpsStoreDropdown.hidden = !shouldOpen;
  cityOpsStoreControl.setAttribute("aria-expanded", String(shouldOpen));
});

cityOpsStoreDropdown.addEventListener("change", syncCityOpsStoreValue);

frontendCategoryStoreControl.addEventListener("click", () => {
  const shouldOpen = frontendCategoryStoreDropdown.hidden;
  frontendCategoryStoreDropdown.hidden = !shouldOpen;
  frontendCategoryStoreControl.setAttribute("aria-expanded", String(shouldOpen));
});

frontendCategoryStoreDropdown.addEventListener("change", syncFrontendCategoryStoreValue);

document.querySelector(".city-ops-subnav").addEventListener("click", (event) => {
  const toolButton = event.target.closest("[data-city-ops-tool]");
  if (!toolButton) return;
  showCityOpsTool(toolButton.dataset.cityOpsTool);
});

document.addEventListener("click", (event) => {
  if (!event.target.closest("#cityOpsStorePicker")) closeCityOpsStoreDropdown();
  if (!event.target.closest("#frontendCategoryStorePicker")) closeFrontendCategoryStoreDropdown();
});

document.querySelectorAll("input[name='cityOpsEnvironment']").forEach((input) => {
  input.addEventListener("change", () => showToast(`已切换状态：${input.value}`));
});

cityOpsForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const compareTypes = Array.from(document.querySelectorAll("input[name='cityOpsCompareType']:checked")).map((input) => input.value);
  const stores = getCityOpsSelectedStores();
  const channel = document.querySelector("input[name='cityOpsChannel']:checked")?.value;
  if (compareTypes.length === 0) {
    showToast("请至少选择一种对比类型");
    return;
  }
  if (stores.length === 0) {
    showToast("请选择对比门店");
    return;
  }
  if (!channel) {
    showToast("请选择对比渠道");
    return;
  }

  const products = cityOpsProductFilter.value.trim() || "全部商品";
  const createdAt = formatCityOpsTime();
  const taskStart = Math.max(287, ...Array.from(cityOpsTableBody.rows).map((row) => Number(row.dataset.taskCode) || 0)) + 1;
  const rows = [];
  stores.forEach((store, storeIndex) => {
    compareTypes.forEach((type, typeIndex) => {
      const taskCode = String(taskStart + storeIndex * compareTypes.length + typeIndex);
      const baseCount = type === "三方存在平台无" ? 5029 : 13;
      const differenceCount = type === "三方存在平台无" ? 5016 : type === "库存对比" ? 6 : type === "价格对比" ? 3 : 1;
      rows.push([taskCode, type, channel, store.value, products, String(differenceCount), String(baseCount), "18", createdAt, "肖伟虎", createdAt]);
    });
  });
  cityOpsTableBody.prepend(...rows.map(createCityOpsRow));
  cityOpsEmptyState.hidden = true;
  showToast(`已创建 ${rows.length} 个对比任务`);
});

cityOpsRefreshButton.addEventListener("click", () => {
  showToast(`已刷新，共 ${cityOpsTableBody.rows.length} 条任务`);
});

frontendCategoryCompareForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const channel = document.querySelector("input[name='frontendCategoryChannel']:checked")?.value;
  const stores = getFrontendCategorySelectedStores();
  if (!channel) {
    showToast("请选择对比渠道");
    return;
  }
  if (stores.length === 0) {
    showToast("请选择对比门店");
    return;
  }

  const createdAt = formatCityOpsTime();
  const taskStart = Math.max(309, ...Array.from(frontendCategoryTableBody.rows).map((row) => Number(row.dataset.taskCode) || 0)) + 1;
  const rows = stores.map((store, index) => [
    String(taskStart + index),
    channel,
    store.value,
    String(12 + index),
    "--",
    "对比完成",
    "--",
    createdAt,
    "肖伟虎",
    createdAt
  ]);
  frontendCategoryTableBody.prepend(...rows.map(createFrontendCategoryRow));
  frontendCategoryEmptyState.hidden = true;
  showToast(`已创建 ${rows.length} 个前台类目对比任务`);
});

frontendCategoryRefreshButton.addEventListener("click", () => {
  showToast(`已刷新，共 ${frontendCategoryTableBody.rows.length} 条任务`);
});

closeFrontendCategoryCorrectionModalButton.addEventListener("click", closeFrontendCategoryCorrectionModal);
cancelFrontendCategoryCorrectionButton.addEventListener("click", closeFrontendCategoryCorrectionModal);

frontendCategoryCorrectionModal.addEventListener("click", (event) => {
  if (event.target === frontendCategoryCorrectionModal) closeFrontendCategoryCorrectionModal();
});

frontendCategoryCorrectionForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (!frontendCategoryCorrectionStore.value) {
    showToast("请选择需要修正的门店");
    return;
  }
  if (!activeFrontendCategoryCorrectionRow) return;

  const taskCode = activeFrontendCategoryCorrectionRow.dataset.taskCode;
  const statusCell = activeFrontendCategoryCorrectionRow.querySelector(".frontend-category-correction-status");
  activeFrontendCategoryCorrectionRow.dataset.correctionStore = frontendCategoryCorrectionStore.value;
  statusCell.textContent = "修正执行中";
  statusCell.classList.add("is-running");
  closeFrontendCategoryCorrectionModal();
  showToast(`任务 ${taskCode} 已提交类目修正`);
});

cityOpsTableBody.addEventListener("click", (event) => {
  const downloadButton = event.target.closest("[data-download-task]");
  if (!downloadButton) return;
  const row = downloadButton.closest("tr");
  downloadCityOpsDifference(row, "平台商品对比差异", downloadButton.dataset.downloadTask);
});

frontendCategoryTableBody.addEventListener("click", (event) => {
  const correctionButton = event.target.closest("[data-frontend-category-correct]");
  if (correctionButton) {
    openFrontendCategoryCorrectionModal(correctionButton.closest("tr"));
    return;
  }
  const downloadButton = event.target.closest("[data-frontend-category-download]");
  if (!downloadButton) return;
  const row = downloadButton.closest("tr");
  downloadCityOpsDifference(row, "前台类目对比差异", downloadButton.dataset.frontendCategoryDownload);
});

syncCityOpsStoreValue();
syncFrontendCategoryStoreValue();
