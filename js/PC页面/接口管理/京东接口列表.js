function openInterfacePage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("京东接口列表");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  constructionPage.hidden = true;
  interfacePage.hidden = false;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#interfaceMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "京东接口列表");
  });
}
