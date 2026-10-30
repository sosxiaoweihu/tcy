function openProductAbsenceReportPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城商品缺勤报表");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  constructionPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = false;
  imReplyRateReportPage.hidden = true;
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
    button.classList.toggle("active", button.dataset.page === "同城商品缺勤报表");
  });
}

function filterAbsenceReport() {
  const filters = {
    product: absenceProductFilter.value.trim().toLowerCase(),
    store: absenceStoreFilter.value,
    channel: absenceChannelFilter.value,
    reason: absenceReasonFilter.value,
    business: absenceBusinessFilter.value,
    category: absenceCategoryFilter.value
  };
  let visibleCount = 0;

  absenceReportTableBody.querySelectorAll("tr").forEach((row) => {
    const matches = Object.entries(filters).every(([key, value]) => {
      if (!value) return true;
      return row.dataset[key].toLowerCase().includes(value.toLowerCase());
    });
    row.hidden = !matches;
    if (matches) visibleCount += 1;
  });

  absenceEmptyState.hidden = visibleCount > 0;
  absenceResultSummary.textContent = `共 ${visibleCount} 条缺勤记录`;
  absencePaginationTotal.textContent = `共 ${visibleCount} 条`;
}

document.querySelector("#absenceSearchButton").addEventListener("click", filterAbsenceReport);
document.querySelector("#absenceResetButton").addEventListener("click", () => {
  absenceProductFilter.value = "";
  absenceStoreFilter.value = "";
  absenceChannelFilter.value = "";
  absenceReasonFilter.value = "";
  absenceBusinessFilter.value = "便利店";
  absenceCategoryFilter.value = "";
  absenceReportTableBody.querySelectorAll("tr").forEach((row) => {
    row.hidden = false;
  });
  absenceEmptyState.hidden = true;
  absenceResultSummary.textContent = "共 126 条缺勤记录";
  absencePaginationTotal.textContent = "共 126 条";
});
document.querySelector("#absenceExportButton").addEventListener("click", () => {
  showToast("缺勤报表导出任务已创建");
});
