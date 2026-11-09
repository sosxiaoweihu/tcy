function closeTab(pageName) {
  openTabs = openTabs.filter((name) => name !== pageName);
  if (activePage === pageName) {
    activePage = openTabs[openTabs.length - 1] || "概况";
  }
  renderPageTabs();
  productPoolPage.hidden = activePage !== "商品池管理";
  cityOrderPage.hidden = activePage !== "订单管理";
  cityOpsPage.hidden = true;
  cityFormatPage.hidden = true;
  backendCategoryPage.hidden = activePage !== "同城后台类目";
  storeProductPage.hidden = activePage !== "同城门店商品";
  productStockoutReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  if (activePage === "商品池管理") {
    openProductPoolPage(false);
    return;
  }
  if (activePage === "订单管理") {
    openOrderManagementPage(false);
    return;
  }
  if (activePage === "同城商品" || activePage === "同城商品管理(统一分类)") {
    openTongchengProductPage(activePage, false);
    return;
  }
  if (activePage === "同城门店商品") {
    openStoreProductPage(false);
    return;
  }
  if (activePage === "订单热力图") {
    openHeatmapPage(false);
    return;
  }
  if (activePage === "同城商品缺勤报表") {
    openProductAbsenceReportPage(false);
    return;
  }
  if (activePage === "同城商品缺货报表") {
    openProductStockoutReportPage(false);
    return;
  }
  if (activePage === "IM回复率统计") {
    openImReplyRateReportPage(false);
    return;
  }
  if (activePage === "同城自定义任务") {
    openCustomTaskPage(false);
    return;
  }
  if (activePage === "同城运维工具") {
    openCityOpsPage(false);
    return;
  }
  if (activePage === "同城业态") {
    openCityFormatPage(false);
    return;
  }
  if (activePage === "同城上下架计划") {
    openCityShelfPlanPage(false);
    return;
  }
  if (activePage === "同城后台类目") {
    openBackendCategoryPage(false);
    return;
  }
  if (activePage === "京东接口列表") {
    openInterfacePage(false);
    return;
  }
  if (activePage === "同城生活门店管理") {
    openLocalLifeStorePage(false);
    return;
  }
  if (activePage === "同城生活核销明细") {
    openLocalLifeVerifyPage(false);
    return;
  }
  if (activePage === "同城核销商品明细") {
    openLocalLifeProductPage(false);
    return;
  }
  if (activePage === "同城券规则") {
    openLocalLifeCouponPage(false);
    return;
  }
  if (activePage === "同城生活售后") {
    openLocalLifeAfterSalePage(false);
    return;
  }
  if (activePage === "同城生活店铺") {
    openLocalLifeShopPage(false);
    return;
  }
  if (activePage === "概况") {
    openConstructionPage("概况", false);
    return;
  }
  openConstructionPage(activePage, false);
}

function switchModule(moduleName) {
  if (moduleName !== "同城") document.getElementById("inventoryComparePage").hidden = true;
  if (moduleName !== "同城") document.getElementById("merchantServicePage").hidden = true;
  if (moduleName !== "同城") document.getElementById("cityInventoryLogPage").hidden = true;
  if (moduleName !== "同城") document.getElementById("cityInventoryPage").hidden = true;
  leaveCustomTaskPage();
  if (moduleName !== "同城") backendCategoryPage.hidden = true;
  if (moduleName !== "同城") storeProductPage.hidden = true;
  document.querySelectorAll(".side-nav button").forEach((button) => {
    button.classList.toggle("active", button.dataset.nav === moduleName);
  });

  if (moduleName === "同城") {
    tongchengMenu.hidden = false;
    interfaceMenu.hidden = true;
    legacyMenu.hidden = true;
    return;
  }

  if (moduleName === "同城App") {
    openTongchengAppPage();
    return;
  }

  if (moduleName === "接口") {
    interfaceMenu.hidden = false;
    tongchengMenu.hidden = true;
    legacyMenu.hidden = true;
    return;
  }

  if (moduleName === "老三方") {
    legacyMenu.hidden = false;
    tongchengMenu.hidden = true;
    interfaceMenu.hidden = true;
    return;
  }

  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  leaveTongchengAppPage();
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
  storeProductPage.hidden = true;
  pageTabs.hidden = true;
  cityShelfPlanPage.hidden = true;
  constructionPage.hidden = false;
  constructionTitle.textContent = `${moduleName}建设中`;
}

function openTongchengProductPage(pageName = "同城商品", shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab(pageName);
  leaveCustomTaskPage();
  isUnifiedCategoryPage = pageName === "同城商品管理(统一分类)";
  document.body.classList.toggle("unified-category-mode", isUnifiedCategoryPage);
  tongchengPage.classList.toggle("standard-product-mode", !isUnifiedCategoryPage);
  unifiedCategorySidebar.hidden = !isUnifiedCategoryPage;
  tongchengPage.hidden = false;
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
  cityOpsPage.hidden = true;
  cityFormatPage.hidden = true;
  backendCategoryPage.hidden = true;
  storeProductPage.hidden = true;
  pageTabs.hidden = false;
  constructionPage.hidden = true;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === pageName);
  });
  renderTable();
  renderUnifiedCategoryTree();
}

function openHeatmapPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("订单热力图");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  tongchengPage.hidden = true;
  productPoolPage.hidden = true;
  cityOrderPage.hidden = true;
  constructionPage.hidden = true;
  heatmapPage.hidden = false;
  productAbsenceReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  interfacePage.hidden = true;
  localLifeStorePage.hidden = true;
  localLifeVerifyPage.hidden = true;
  localLifeProductPage.hidden = true;
  localLifeCouponPage.hidden = true;
  cityOpsPage.hidden = true;
  cityFormatPage.hidden = true;
  backendCategoryPage.hidden = true;
  storeProductPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "订单热力图");
  });
}
