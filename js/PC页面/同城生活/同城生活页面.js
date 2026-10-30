function openLocalLifeStorePage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城生活门店管理");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  constructionPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = false;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城生活门店管理");
  });
}

function openLocalLifeVerifyPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城生活核销明细");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  constructionPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = false;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城生活核销明细");
  });
}

function openLocalLifeProductPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城核销商品明细");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  constructionPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = false;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城核销商品明细");
  });
}

function openLocalLifeCouponPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城券规则");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  constructionPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = false;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城券规则");
  });
}

function openLocalLifeAfterSalePage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城生活售后");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  constructionPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = false;
  localLifeShopPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城生活售后");
  });
}

function openLocalLifeShopPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城生活店铺");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  constructionPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  localLifeAfterSalePage.hidden = true;
  localLifeShopPage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城生活店铺");
  });
}
