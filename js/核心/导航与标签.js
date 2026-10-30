function enableColumnResize() {
  document.querySelectorAll(".table-card table").forEach((table) => {
    const cols = [...table.querySelectorAll("col")];
    let startX = 0;
    let startWidth = 0;
    let activeCol = null;

    table.querySelectorAll(".resize-handle").forEach((handle, index) => {
      handle.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        activeCol = cols[index];
        startX = event.clientX;
        startWidth = activeCol.getBoundingClientRect().width;
        document.body.classList.add("resizing-column");
        handle.setPointerCapture(event.pointerId);
      });

      handle.addEventListener("pointermove", (event) => {
        if (!activeCol) return;
        const nextWidth = Math.max(120, startWidth + event.clientX - startX);
        activeCol.style.width = `${nextWidth}px`;
      });

      handle.addEventListener("pointerup", () => {
        activeCol = null;
        document.body.classList.remove("resizing-column");
      });
    });
  });
}

document.querySelector(".side-nav").addEventListener("click", (event) => {
  const target = event.target.closest("[data-nav]");
  if (!target) return;
  switchModule(target.dataset.nav);
});

tongchengMenu.addEventListener("click", (event) => {
  const target = event.target.closest("[data-page]");
  if (!target) return;
  storeProductPage.hidden = true;
  if (target.dataset.page === "同城商品" || target.dataset.page === "同城商品管理(统一分类)") {
    openTongchengProductPage(target.dataset.page);
    return;
  }
  if (target.dataset.page === "同城门店商品") {
    openStoreProductPage();
    return;
  }
  if (target.dataset.page === "订单管理") {
    openOrderManagementPage();
    return;
  }
  if (target.dataset.page === "同城自定义任务") {
    openCustomTaskPage();
    return;
  }
  if (target.dataset.page === "同城业态") {
    openCityFormatPage();
    return;
  }
  if (target.dataset.page === "同城上下架计划") {
    openCityShelfPlanPage();
    return;
  }
  if (target.dataset.page === "同城运维工具") {
    openCityOpsPage();
    return;
  }
  if (target.dataset.page === "同城后台类目") {
    openBackendCategoryPage();
    return;
  }
  if (target.dataset.page === "IM回复率统计") {
    openImReplyRateReportPage();
    return;
  }
  if (target.dataset.page === "同城生活门店管理") {
    openLocalLifeStorePage();
    return;
  }
  if (target.dataset.page === "同城生活核销明细") {
    openLocalLifeVerifyPage();
    return;
  }
  if (target.dataset.page === "同城核销商品明细") {
    openLocalLifeProductPage();
    return;
  }
  if (target.dataset.page === "同城券规则") {
    openLocalLifeCouponPage();
    return;
  }
  if (target.dataset.page === "同城生活售后") {
    openLocalLifeAfterSalePage();
    return;
  }
  if (target.dataset.page === "同城生活店铺") {
    openLocalLifeShopPage();
    return;
  }
  openConstructionPage(target.dataset.page);
});

interfaceMenu.addEventListener("click", (event) => {
  const target = event.target.closest("[data-page]");
  if (!target) return;
  document.querySelectorAll("#interfaceMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button === target);
  });
  openConstructionPage(target.dataset.page);
});

legacyMenu.addEventListener("click", (event) => {
  const target = event.target.closest("[data-page]");
  if (!target) return;
  document.querySelectorAll("#legacyMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button === target);
  });
  if (target.dataset.page === "商品池管理") {
    openProductPoolPage();
    return;
  }
  openConstructionPage(target.dataset.page);
});

categoryTree.addEventListener("click", (event) => {
  const target = event.target.closest("[data-tree-category]");
  if (!target) return;
  const name = target.dataset.treeCategory;
  const item = unifiedCategoryTree.find((category) => category.name === name);
  if (!item || item.children.length === 0) return;
  if (expandedUnifiedCategories.has(name)) {
    expandedUnifiedCategories.delete(name);
  } else {
    expandedUnifiedCategories.add(name);
  }
  renderUnifiedCategoryTree();
});

pageTabs.addEventListener("click", (event) => {
  const closeTarget = event.target.closest("[data-close-tab]");
  if (closeTarget) {
    event.stopPropagation();
    closeTab(closeTarget.dataset.closeTab);
    return;
  }

  const tabTarget = event.target.closest("[data-tab]");
  if (!tabTarget) return;
  const pageName = tabTarget.dataset.tab;
  activePage = pageName;
  renderPageTabs();
  cityOpsPage.hidden = pageName !== "同城运维工具";
  cityFormatPage.hidden = pageName !== "同城业态";
  backendCategoryPage.hidden = pageName !== "同城后台类目";
  storeProductPage.hidden = pageName !== "同城门店商品";
  productStockoutReportPage.hidden = true;
  imReplyRateReportPage.hidden = true;
  if (pageName === "商品池管理") {
    openProductPoolPage(false);
    return;
  }
  if (pageName === "订单管理") {
    openOrderManagementPage(false);
    return;
  }
  if (pageName === "同城商品" || pageName === "同城商品管理(统一分类)") {
    openTongchengProductPage(pageName, false);
    return;
  }
  if (pageName === "同城门店商品") {
    openStoreProductPage(false);
    return;
  }
  if (pageName === "订单热力图") {
    openHeatmapPage(false);
    return;
  }
  if (pageName === "同城自定义任务") {
    openCustomTaskPage(false);
    return;
  }
  if (pageName === "同城运维工具") {
    openCityOpsPage(false);
    return;
  }
  if (pageName === "同城业态") {
    openCityFormatPage(false);
    return;
  }
  if (pageName === "同城上下架计划") {
    openCityShelfPlanPage(false);
    return;
  }
  if (pageName === "同城后台类目") {
    openBackendCategoryPage(false);
    return;
  }
  if (pageName === "IM回复率统计") {
    openImReplyRateReportPage(false);
    return;
  }
  if (pageName === "京东接口列表") {
    openInterfacePage(false);
    return;
  }
  if (pageName === "同城生活门店管理") {
    openLocalLifeStorePage(false);
    return;
  }
  if (pageName === "同城生活核销明细") {
    openLocalLifeVerifyPage(false);
    return;
  }
  if (pageName === "同城核销商品明细") {
    openLocalLifeProductPage(false);
    return;
  }
  if (pageName === "同城券规则") {
    openLocalLifeCouponPage(false);
    return;
  }
  if (pageName === "同城生活售后") {
    openLocalLifeAfterSalePage(false);
    return;
  }
  if (pageName === "同城生活店铺") {
    openLocalLifeShopPage(false);
    return;
  }
  openConstructionPage(pageName, false);
});
