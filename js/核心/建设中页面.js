function openConstructionPage(pageName, shouldAddTab = true) {
  if (pageName === "同城商品") { openCityCatalogPage(shouldAddTab); return; }
  if (pageName === "同城销售总览") {
    openSalesOverviewPage(shouldAddTab);
    return;
  }
  if (pageName === "同城缺勤报表2") {
    openAbsenceReport2Page(shouldAddTab);
    return;
  }
  if (pageName === "同城商品库存对比") {
    openInventoryComparePage(shouldAddTab);
    return;
  }
  if (pageName === "小程序商家客服") {
    openMerchantServicePage(shouldAddTab);
    return;
  }
  if (pageName === "同城库存操作日志") {
    openCityInventoryLogPage(undefined, shouldAddTab);
    return;
  }
  if (pageName === "同城库存") {
    openCityInventoryPage(shouldAddTab);
    return;
  }
  if (pageName === "同城门店商品") {
    openStoreProductPage(shouldAddTab);
    return;
  }
  if (pageName === "商品池管理") {
    openProductPoolPage(shouldAddTab);
    return;
  }
  if (pageName === "订单管理") {
    openOrderManagementPage(shouldAddTab);
    return;
  }
  if (pageName === "订单热力图") {
    openHeatmapPage(shouldAddTab);
    return;
  }
  if (pageName === "同城自定义任务") {
    openCustomTaskPage(shouldAddTab);
    return;
  }
  if (pageName === "同城商品缺勤报表") {
    openProductAbsenceReportPage(shouldAddTab);
    return;
  }
  if (pageName === "同城商品缺货报表") {
    openProductStockoutReportPage(shouldAddTab);
    return;
  }
  if (pageName === "京东接口列表") {
    openInterfacePage(shouldAddTab);
    return;
  }
  if (pageName === "同城生活门店管理") {
    openLocalLifeStorePage(shouldAddTab);
    return;
  }
  if (pageName === "同城生活核销明细") {
    openLocalLifeVerifyPage(shouldAddTab);
    return;
  }
  if (pageName === "同城核销商品明细") {
    openLocalLifeProductPage(shouldAddTab);
    return;
  }
  if (pageName === "同城券规则") {
    openLocalLifeCouponPage(shouldAddTab);
    return;
  }
  if (pageName === "同城生活售后") {
    openLocalLifeAfterSalePage(shouldAddTab);
    return;
  }
  if (pageName === "同城生活店铺") {
    openLocalLifeShopPage(shouldAddTab);
    return;
  }
  if (pageName === "同城运维工具") {
    openCityOpsPage(shouldAddTab);
    return;
  }
  if (pageName === "同城业态") {
    openCityFormatPage(shouldAddTab);
    return;
  }
  if (pageName === "同城上下架计划") {
    openCityShelfPlanPage(shouldAddTab);
    return;
  }
  if (pageName === "同城后台类目") {
    openBackendCategoryPage(shouldAddTab);
    return;
  }
  if (shouldAddTab) addOrActivateTab(pageName);
  leaveCustomTaskPage();
  tongchengPage.hidden = true;
  productPoolPage.hidden = true;
  cityOrderPage.hidden = true;
  heatmapPage.hidden = true;
  productAbsenceReportPage.hidden = true;
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
  storeProductPage.hidden = true;
  pageTabs.hidden = false;
  constructionPage.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  constructionTitle.textContent = `${pageName}建设中`;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });
}
