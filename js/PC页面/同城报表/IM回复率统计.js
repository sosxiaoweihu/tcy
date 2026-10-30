const imReplyRateQuickPeriods = {
  今天: ["2026-07-20", "2026-07-20"],
  昨天: ["2026-07-19", "2026-07-19"],
  "近7天": ["2026-07-14", "2026-07-20"],
  "近30天": ["2026-06-20", "2026-07-20"]
};

function openImReplyRateReportPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("IM回复率统计");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  constructionPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  productStockoutReportPage.hidden = true;
  imReplyRateReportPage.hidden = false;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "IM回复率统计");
  });
}

function setImReplyRatePeriod(period) {
  const range = imReplyRateQuickPeriods[period];
  if (!range) return;
  imReplyRateDateStart.textContent = range[0];
  imReplyRateDateEnd.textContent = range[1];
  document.querySelectorAll("[data-im-reply-period]").forEach((button) => {
    button.classList.toggle("active", button.dataset.imReplyPeriod === period);
  });
}

function filterImReplyRateReport() {
  const channel = imReplyRateChannelFilter.value;
  const store = imReplyRateStoreFilter.value;
  let visibleCount = 0;

  imReplyRateTableBody.querySelectorAll("tr").forEach((row) => {
    const matchesStore = store === "全部门店" || row.dataset.store.includes(store);
    const matchesChannel = channel === "全部渠道" || row.dataset.channel === channel;
    row.hidden = !(matchesStore && matchesChannel);
    if (!row.hidden) visibleCount += 1;
  });

  imReplyRateEmptyState.hidden = visibleCount > 0;
  imReplyRatePaginationTotal.textContent = `共 ${visibleCount} 条`;
  showToast("IM回复率统计已更新");
}

function resetImReplyRateReport() {
  imReplyRateChannelFilter.value = "全部渠道";
  imReplyRateStoreFilter.value = "全部门店";
  imReplyRateTableBody.querySelectorAll("tr").forEach((row) => {
    row.hidden = false;
  });
  imReplyRateEmptyState.hidden = true;
  imReplyRatePaginationTotal.textContent = "共 8 条";
  setImReplyRatePeriod("近30天");
  showToast("筛选条件已重置");
}

document.querySelectorAll("[data-im-reply-period]").forEach((button) => {
  button.addEventListener("click", () => setImReplyRatePeriod(button.dataset.imReplyPeriod));
});
document.querySelector("#imReplyRateQueryButton").addEventListener("click", filterImReplyRateReport);
document.querySelector("#imReplyRateResetButton").addEventListener("click", resetImReplyRateReport);
document.querySelector("#imReplyRateExportButton").addEventListener("click", () => showToast("IM回复率统计导出任务已创建"));
document.querySelector("#imReplyRateExportHistoryButton").addEventListener("click", () => showToast("已打开导出记录"));
document.querySelector("#imReplyRateNoticeClose").addEventListener("click", () => {
  document.querySelector("#imReplyRateNotice").hidden = true;
});
