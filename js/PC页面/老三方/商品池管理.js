const productPoolRows = [
  {
    name: "C我得什锦罐头258g",
    code: "2043000099",
    barcode: "6901234567891",
    platformCategory: "鲜食/熟食 / 熟食/卤味/凉菜 / 禽肉类熟食",
    tone: "tone-dark",
    tenantCategory: "休闲食品/水果罐头",
    frontendCategory: "休闲食品",
    channel: "京东到家",
    syncStatus: "成功",
    customImage: true,
    badge: false,
    packageBox: false,
    prefix: false,
    hasImage: true,
    createdAt: "2023-08-15 11:16:55",
    syncedAt: "2026-07-23 14:50:41"
  },
  {
    name: "C我得黄桃罐头258g",
    code: "2043000098",
    barcode: "6901234567884",
    platformCategory: "鲜食/熟食 / 熟食/卤味/凉菜 / 禽肉类熟食",
    tone: "tone-green",
    tenantCategory: "休闲食品/水果罐头",
    frontendCategory: "休闲食品",
    channel: "美团外卖",
    syncStatus: "成功",
    customImage: true,
    badge: false,
    packageBox: true,
    prefix: false,
    hasImage: true,
    createdAt: "2023-08-15 11:16:25",
    syncedAt: "2026-07-23 14:50:24"
  },
  {
    name: "奈雪橙C凤厘单丛果蔬汁450ml",
    code: "2211000092",
    barcode: "6973125500929",
    platformCategory: "饮料酒水 / 果蔬汁",
    tone: "tone-orange",
    tenantCategory: "饮料酒水/果蔬汁",
    frontendCategory: "饮料酒水",
    channel: "饿百",
    syncStatus: "成功",
    customImage: false,
    badge: true,
    packageBox: false,
    prefix: true,
    hasImage: true,
    createdAt: "2026-05-08 15:49:51",
    syncedAt: "2026-07-22 16:55:01"
  },
  {
    name: "奈雪羽衣甘蓝茉莉花茶饮450ml",
    code: "2211000090",
    barcode: "6973125500905",
    platformCategory: "饮料酒水 / 果蔬汁",
    tone: "tone-lime",
    tenantCategory: "饮料酒水/茶饮料",
    frontendCategory: "饮料酒水",
    channel: "京东到家",
    syncStatus: "成功",
    customImage: true,
    badge: false,
    packageBox: false,
    prefix: false,
    hasImage: true,
    createdAt: "2025-12-17 09:33:48",
    syncedAt: "2026-07-22 16:54:42"
  },
  {
    name: "C糖厨白砂糖400g",
    code: "2030000012",
    barcode: "6923456700128",
    platformCategory: "粮油调味 / 米面杂粮",
    tone: "tone-red",
    tenantCategory: "粮油调味/糖",
    frontendCategory: "粮油调味",
    channel: "美团外卖",
    syncStatus: "成功",
    customImage: false,
    badge: false,
    packageBox: true,
    prefix: true,
    hasImage: true,
    createdAt: "2023-08-15 12:05:33",
    syncedAt: "2026-07-22 16:32:13"
  },
  {
    name: "金龙鱼多用途巴盟雪花小麦粉1kg",
    code: "2002000172",
    barcode: "6948195801726",
    platformCategory: "粮油调味 / 米面杂粮",
    tone: "tone-gold",
    tenantCategory: "粮油调味/面粉",
    frontendCategory: "粮油调味",
    channel: "京东到家",
    syncStatus: "成功",
    customImage: true,
    badge: false,
    packageBox: true,
    prefix: false,
    hasImage: true,
    createdAt: "2026-05-21 10:39:15",
    syncedAt: "2026-07-22 14:22:16"
  }
];

let activeProductPoolEditCode = null;
let productPoolEditMainImageState = [];
let productPoolEditDetailImageState = [];
let productPoolEditSpecialImageState = [];

function matchesProductPoolBoolean(filterValue, actualValue) {
  if (!filterValue) return true;
  return filterValue === "yes" ? actualValue : !actualValue;
}

function getFilteredProductPoolRows() {
  const name = productPoolNameFilter.value.trim().toLowerCase();
  const code = productPoolCodeFilter.value.trim();
  const tenantCategory = productPoolTenantCategoryFilter.value.trim().toLowerCase();

  return productPoolRows.filter((item) => {
    if (name && !item.name.toLowerCase().includes(name)) return false;
    if (code && !item.code.includes(code)) return false;
    if (tenantCategory && !item.tenantCategory.toLowerCase().includes(tenantCategory)) return false;
    if (productPoolSyncFilter.value && item.syncStatus !== productPoolSyncFilter.value) return false;
    if (productPoolChannelFilter.value && item.channel !== productPoolChannelFilter.value) return false;
    if (productPoolFrontendCategoryFilter.value && item.frontendCategory !== productPoolFrontendCategoryFilter.value) return false;
    if (!matchesProductPoolBoolean(productPoolCustomImageFilter.value, item.customImage)) return false;
    if (!matchesProductPoolBoolean(productPoolBadgeFilter.value, item.badge)) return false;
    if (!matchesProductPoolBoolean(productPoolPackageFilter.value, item.packageBox)) return false;
    if (!matchesProductPoolBoolean(productPoolPrefixFilter.value, item.prefix)) return false;
    if (!matchesProductPoolBoolean(productPoolImageFilter.value, item.hasImage)) return false;
    return true;
  });
}

function renderProductPoolTable() {
  const rows = getFilteredProductPoolRows();
  productPoolTableBody.innerHTML = rows
    .map(
      (item) => `
        <tr data-product-pool-code="${item.code}">
          <td><input class="product-pool-row-check" type="checkbox" aria-label="选择${item.name}" /></td>
          <td><button class="product-pool-name" type="button" title="${item.name}">${item.name}</button></td>
          <td><span class="product-pool-thumb ${item.tone}" aria-label="${item.name}商品图片"></span></td>
          <td>${item.badge ? '<span class="product-pool-thumb tone-orange" aria-label="角标图片"></span>' : ""}</td>
          <td>${item.prefix ? "C" : ""}</td>
          <td></td>
          <td>${item.code}</td>
          <td><span class="product-pool-sync-success">${item.syncStatus}</span></td>
          <td>${item.createdAt}</td>
          <td>${item.syncedAt}</td>
          <td>
            <div class="product-pool-row-actions">
              <button type="button" data-product-pool-row-action="修改">修改</button>
              <button type="button" data-product-pool-row-action="删除">删除</button>
              <button type="button" data-product-pool-row-action="自定义图片管理">自定义图片管理</button>
              <button type="button" data-product-pool-row-action="设置包装盒">设置包装盒</button>
            </div>
          </td>
        </tr>
      `
    )
    .join("");

  productPoolEmptyState.hidden = rows.length > 0;
  const hasFilter = [
    productPoolNameFilter.value,
    productPoolCodeFilter.value,
    productPoolTenantCategoryFilter.value,
    productPoolSyncFilter.value,
    productPoolChannelFilter.value,
    productPoolFrontendCategoryFilter.value,
    productPoolCustomImageFilter.value,
    productPoolBadgeFilter.value,
    productPoolPackageFilter.value,
    productPoolPrefixFilter.value,
    productPoolImageFilter.value
  ].some(Boolean);
  productPoolPaginationTotal.textContent = `共 ${hasFilter ? rows.length : 42187} 条`;
  productPoolSelectAll.checked = false;
}

function getProductPoolEditImageState(kind) {
  if (kind === "main") return productPoolEditMainImageState;
  if (kind === "detail") return productPoolEditDetailImageState;
  return productPoolEditSpecialImageState;
}

function renderProductPoolEditImageList(container, images, kind, includeAdd) {
  const cards = images
    .map(
      (image, index) => `
        <div class="product-pool-edit-image-card">
          ${image.src ? `<img src="${image.src}" alt="${image.name || "已上传商品图片"}" />` : `<span class="product-pool-image-mock ${image.variant || ""}" aria-label="商品图片示例"></span>`}
          <button class="product-pool-edit-image-remove" type="button" data-remove-edit-image="${kind}" data-image-index="${index}" aria-label="删除图片">×</button>
        </div>
      `
    )
    .join("");
  const addButton = includeAdd
    ? `<button class="product-pool-edit-image-add" type="button" data-add-edit-image="${kind}" aria-label="上传${kind === "detail" ? "详情图" : "特殊图片"}">＋</button>`
    : "";
  container.innerHTML = cards + addButton;
}

function renderAllProductPoolEditImages() {
  renderProductPoolEditImageList(productPoolMainImages, productPoolEditMainImageState, "main", false);
  renderProductPoolEditImageList(productPoolDetailImages, productPoolEditDetailImageState, "detail", true);
  renderProductPoolEditImageList(productPoolSpecialImages, productPoolEditSpecialImageState, "special", true);
}

function resetProductPoolEditImages() {
  [productPoolEditMainImageState, productPoolEditDetailImageState, productPoolEditSpecialImageState].flat().forEach((image) => {
    if (image.src?.startsWith("blob:")) URL.revokeObjectURL(image.src);
  });
  productPoolEditMainImageState = [
    { variant: "" },
    { variant: "mock-side" },
    { variant: "mock-detail" },
    { variant: "mock-detail" }
  ];
  productPoolEditDetailImageState = [{ variant: "mock-detail" }];
  productPoolEditSpecialImageState = [];
  renderAllProductPoolEditImages();
}

function openProductPoolEditModal(code) {
  const item = productPoolRows.find((row) => row.code === code);
  if (!item) return;
  activeProductPoolEditCode = item.code;
  productPoolEditName.value = item.name;
  productPoolEditCode.value = item.code;
  productPoolEditBarcode.value = item.barcode;
  productPoolEditCategory.value = item.platformCategory;
  resetProductPoolEditImages();
  productPoolEditModal.classList.add("open");
  productPoolEditModal.setAttribute("aria-hidden", "false");
  productPoolEditName.focus();
}

function closeProductPoolEditModal() {
  productPoolEditModal.classList.remove("open");
  productPoolEditModal.setAttribute("aria-hidden", "true");
  activeProductPoolEditCode = null;
}

function addProductPoolUploadedImages(kind, files) {
  const images = getProductPoolEditImageState(kind);
  Array.from(files).forEach((file) => {
    images.push({ src: URL.createObjectURL(file), name: file.name });
  });
  renderAllProductPoolEditImages();
}

function openProductPoolPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("商品池管理");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  unifiedCategorySidebar.hidden = true;
  tongchengPage.hidden = true;
  productPoolPage.hidden = false;
  cityOrderPage.hidden = true;
  constructionPage.hidden = true;
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
  customTaskPage.hidden = true;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll("#legacyMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "商品池管理");
  });
  renderProductPoolTable();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function closeProductPoolPage() {
  productPoolPage.hidden = true;
  closeProductPoolEditModal();
}

productPoolQueryButton.addEventListener("click", () => {
  renderProductPoolTable();
  showToast(`查询完成，当前显示 ${getFilteredProductPoolRows().length} 条示例商品`);
});

productPoolResetButton.addEventListener("click", () => {
  [
    productPoolNameFilter,
    productPoolCodeFilter,
    productPoolTenantCategoryFilter,
    productPoolSyncFilter,
    productPoolChannelFilter,
    productPoolFrontendCategoryFilter,
    productPoolCustomImageFilter,
    productPoolBadgeFilter,
    productPoolPackageFilter,
    productPoolPrefixFilter,
    productPoolImageFilter
  ].forEach((control) => {
    control.value = "";
  });
  productPoolPageJump.value = "1";
  renderProductPoolTable();
  showToast("商品池筛选条件已重置");
});

[productPoolNameFilter, productPoolCodeFilter, productPoolTenantCategoryFilter].forEach((input) => {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") productPoolQueryButton.click();
  });
});

productPoolSelectAll.addEventListener("change", () => {
  productPoolTableBody.querySelectorAll(".product-pool-row-check").forEach((checkbox) => {
    checkbox.checked = productPoolSelectAll.checked;
  });
});

document.querySelector(".product-pool-toolbar").addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-pool-action]");
  if (!button) return;
  const selectedCount = productPoolTableBody.querySelectorAll(".product-pool-row-check:checked").length;
  const noSelectionRequired = ["新增商品", "批量导入", "商品数据下载", "推送失败结果导出"].includes(button.dataset.productPoolAction);
  if (!noSelectionRequired && selectedCount === 0) {
    showToast("请先选择需要操作的商品");
    return;
  }
  showToast(`${button.dataset.productPoolAction}操作已触发`);
});

productPoolTableBody.addEventListener("click", (event) => {
  const rowAction = event.target.closest("[data-product-pool-row-action]");
  const productName = event.target.closest(".product-pool-name");
  if (rowAction) {
    const code = rowAction.closest("tr").dataset.productPoolCode;
    if (rowAction.dataset.productPoolRowAction === "修改") {
      openProductPoolEditModal(code);
      return;
    }
    showToast(`商品 ${code}：${rowAction.dataset.productPoolRowAction}`);
    return;
  }
  if (productName) showToast(`已打开${productName.textContent}商品详情`);
});

productPoolEditClose.addEventListener("click", closeProductPoolEditModal);
productPoolEditCancel.addEventListener("click", closeProductPoolEditModal);
productPoolEditModal.addEventListener("click", (event) => {
  if (event.target === productPoolEditModal) closeProductPoolEditModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && productPoolEditModal.classList.contains("open")) closeProductPoolEditModal();
});

productPoolRecommendAttributes.addEventListener("click", () => {
  const attributeInputs = productPoolEditModal.querySelectorAll(".product-pool-attribute-field input");
  const recommendedValues = ["鸡肉、香辛料", "258", "400-800-8899", "江苏省南京市江宁区", "258g", "南京示例食品有限公司"];
  attributeInputs.forEach((input, index) => {
    input.value = recommendedValues[index] || "示例属性";
  });
  productPoolEditModal.querySelectorAll(".product-pool-attribute-field select").forEach((select) => {
    if (select.options.length > 1) select.selectedIndex = 1;
  });
  showToast("类目属性已按推荐值填写");
});

productPoolMainUpload.addEventListener("click", () => productPoolMainImageInput.click());

[
  [productPoolMainImageInput, "main"],
  [productPoolDetailImageInput, "detail"],
  [productPoolSpecialImageInput, "special"]
].forEach(([input, kind]) => {
  input.addEventListener("change", () => {
    addProductPoolUploadedImages(kind, input.files);
    input.value = "";
  });
});

productPoolEditModal.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-edit-image]");
  const removeButton = event.target.closest("[data-remove-edit-image]");
  if (addButton) {
    const input = addButton.dataset.addEditImage === "detail" ? productPoolDetailImageInput : productPoolSpecialImageInput;
    input.click();
    return;
  }
  if (removeButton) {
    const images = getProductPoolEditImageState(removeButton.dataset.removeEditImage);
    const index = Number(removeButton.dataset.imageIndex);
    const [removed] = images.splice(index, 1);
    if (removed?.src?.startsWith("blob:")) URL.revokeObjectURL(removed.src);
    renderAllProductPoolEditImages();
  }
});

productPoolEditSave.addEventListener("click", () => {
  const name = productPoolEditName.value.trim();
  const code = productPoolEditCode.value.trim();
  const barcode = productPoolEditBarcode.value.trim();
  if (!name || !code || !barcode) {
    showToast("请完整填写商品名称、商品编码和商品条码");
    return;
  }
  const item = productPoolRows.find((row) => row.code === activeProductPoolEditCode);
  if (!item) return;
  item.name = name;
  item.code = code;
  item.barcode = barcode;
  item.platformCategory = productPoolEditCategory.value;
  renderProductPoolTable();
  closeProductPoolEditModal();
  showToast("商品修改已保存");
});

document.querySelector(".product-pool-pagination").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const pageNumber = Number(button.textContent);
  if (Number.isInteger(pageNumber) && pageNumber > 0) {
    productPoolPageJump.value = String(pageNumber);
    document.querySelectorAll(".product-pool-pagination button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  }
  showToast("已切换商品池页码");
});

productPoolPageJump.addEventListener("change", () => {
  const nextPage = Math.min(4219, Math.max(1, Number(productPoolPageJump.value) || 1));
  productPoolPageJump.value = String(nextPage);
  showToast(`已跳转至第 ${nextPage} 页`);
});

document.addEventListener(
  "click",
  (event) => {
    const navigationTarget = event.target.closest("[data-page], [data-tab], [data-nav]");
    if (!navigationTarget) return;
    const targetName = navigationTarget.dataset.page || navigationTarget.dataset.tab;
    if (targetName && targetName !== "商品池管理") closeProductPoolPage();
  },
  true
);

renderProductPoolTable();
