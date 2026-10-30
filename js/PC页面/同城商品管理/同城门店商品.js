const storeProductSeed = [
  { icon: "🍐", name: "山东 秋月梨1000g±30g", code: "11001714", barcode: "311200304228", weight: "1000g", front: "苹果蕉梨", back: "瓜果", offline: "17.6", prices: ["17.9", "18.9", "18.9", "18.9"], issue: false },
  { icon: "🥮", name: "甄选秋月梨礼盒4kg（单果450g+）", code: "11001643", barcode: "2106745", weight: "4000g", front: "水果礼盒", back: "联营礼盒/果篮", offline: "88", prices: ["101.9", "101.9", "101.9", "101.9"], issue: false },
  { icon: "🦪", name: "鲜活文蛤约300g", code: "11400938", barcode: "3000114009385", weight: "300g", front: "花蛤鲍鱼", back: "鲜活贝品", offline: "9.48", prices: ["9.9", "9.9"], issue: true },
  { icon: "🥝", name: "【佳沛】新西兰阳光金果4个装约350-450g", code: "11001850", barcode: "3112000305379", weight: "450g", front: "葡提莓果", back: "浆果", offline: "27.2", prices: ["30.9", "30.9", "28.9", "28.9"], issue: true },
  { icon: "🥝", name: "【佳沛】新西兰阳光金果4个装约420g", code: "11001805", barcode: "3112000203187", weight: "420g", front: "葡提莓果", back: "浆果", offline: "43.2", prices: ["45.9", "49.9", "43.9", "43.9"], issue: true },
  { icon: "🥦", name: "乐颐 西兰花450-500g/个", code: "11001758", barcode: "3000111017581", weight: "380g", front: "番茄瓜果", back: "联营精品蔬菜", offline: "11.4", prices: ["11.4", "11.4", "11.4", "11.4"], issue: false }
].map((product, index) => ({ ...product, id: index + 1, online: true, selected: false, sync: index !== 2,
  stockSync: index !== 4,
  markupRates: [10, 0, 5, 0].slice(0, product.prices.length),
  priceSync: product.prices.map((_, channelIndex) => index === 2 ? false : index % 3 === 0 ? channelIndex % 2 === 0 : true)
}));

const storeProductChannels = [["mt", "美", "美团"], ["tb", "淘", "淘宝"], ["jd", "京", "京东"], ["dy", "抖", "抖店"]];

function getStorePriceSyncStatus(product) {
  if (product.priceSync.every(Boolean)) return "启用";
  return product.priceSync.some(Boolean) ? "部分启用" : "停用";
}

function storeMarkupRows(product) {
  return storeProductChannels.slice(0, product.prices.length).map(([kind, label, name], index) =>
    `<span class="store-channel" aria-label="${name} ${product.markupRates[index]}%"><b class="${kind}" title="${name}">${label}</b>${product.markupRates[index]}%</span>`).join("");
}

function storeSyncRows(product) {
  const priceStatus = getStorePriceSyncStatus(product);
  return `<div class="store-product-sync-rows">
    <label><span>上下架：</span><select class="store-product-sync" data-store-sync="${product.id}" aria-label="上下架同步"><option ${product.sync ? "selected" : ""}>启用</option><option ${!product.sync ? "selected" : ""}>停用</option></select></label>
    <div class="store-product-sync-row"><span>价格：</span><div class="store-price-sync-control">
      <select class="store-product-sync" data-store-price-sync-select="${product.id}" aria-label="价格同步">${["启用", "部分启用", "停用"].map(status => `<option ${priceStatus === status ? "selected" : ""}>${status}</option>`).join("")}</select>
      ${priceStatus === "部分启用" ? `<button type="button" class="store-price-sync-value" data-store-price-sync="${product.id}" aria-haspopup="dialog" aria-label="查看及修改${product.name}各渠道价格同步">部分启用</button>` : ""}
    </div></div>
    <label><span>库存：</span><select class="store-product-sync" data-store-stock-sync="${product.id}" aria-label="库存同步"><option ${product.stockSync ? "selected" : ""}>启用</option><option ${!product.stockSync ? "selected" : ""}>停用</option></select></label>
  </div>`;
}

function openStorePriceSyncDetails(product) {
  const dialog = document.getElementById("storePriceSyncDialog");
  dialog.dataset.productId = product.id;
  dialog.querySelector("tbody").innerHTML = storeProductChannels.slice(0, product.prices.length).map(([kind, label, name], index) =>
    `<tr><td><span class="store-channel"><b class="${kind}">${label}</b>${name}</span></td><td><select class="store-product-sync" data-store-channel-sync="${index}" aria-label="${name}价格同步"><option value="enabled" ${product.priceSync[index] ? "selected" : ""}>启用</option><option value="disabled" ${!product.priceSync[index] ? "selected" : ""}>停用</option></select></td></tr>`).join("");
  dialog.showModal();
}

const storeProductState = { tab: "all", page: 1, keyword: "", code: "", filters: {}, products: storeProductSeed };

function showStoreProductToast(message) {
  storeProductToast.textContent = message;
  storeProductToast.hidden = false;
  window.clearTimeout(showStoreProductToast.timer);
  showStoreProductToast.timer = window.setTimeout(() => { storeProductToast.hidden = true; }, 1600);
}

function getVisibleStoreProducts() {
  return storeProductState.products.filter((product) => {
    const matchesTab = storeProductState.tab === "all"
      || (storeProductState.tab === "combo" && product.id <= 2)
      || (storeProductState.tab === "exception" && product.issue)
      || (storeProductState.tab === "missing" && product.id >= 5);
    const matchesName = !storeProductState.keyword || product.name.includes(storeProductState.keyword);
    const matchesCode = !storeProductState.code || product.code === storeProductState.code;
    const f = storeProductState.filters;
    const equals = (key, value) => !f[key] || f[key] === value;
    const range = (key, value) => (!f[key + "Min"] || value >= Number(f[key + "Min"]))
      && (!f[key + "Max"] || value <= Number(f[key + "Max"]));
    const channelNames = ["美团", "淘宝", "京东", "抖店"].slice(0, product.prices.length);
    const prices = f.channel ? product.prices.filter((_, index) => channelNames[index] === f.channel) : product.prices;
    return matchesTab && matchesName && matchesCode
      && equals("barcode", product.barcode) && equals("front", product.front) && equals("back", product.back)
      && equals("offlineStatus", product.online ? "上架" : "下架")
      && equals("channelStatus", getStoreProductChannelStatus(product))
      && equals("productStatus", "售卖") && (!f.channel || channelNames.includes(f.channel))
      && range("stock", 999) && prices.some(price => range("price", Number(price)))
      && equals("type", product.id <= 2 ? "组合商品" : "普通商品")
      && equals("priceSync", getStorePriceSyncStatus(product)) && equals("stockSync", product.stockSync ? "启用" : "停用")
      && equals("presale", "否") && equals("recommended", "否")
      && equals("reason", product.online ? "" : "手动下架");
  });
}

function getStoreProductChannelStatus(product) {
  if (product.temporarilyOffShelf) return "临时下架";
  const states = product.channelStates || product.prices.map(() => product.online);
  if (states.length && states.every(Boolean)) return "全部上架";
  if (states.some(Boolean)) return "部分上架";
  return "全部下架";
}

function storeChannelRows(product) {
  const channels = [["mt", "美"], ["tb", "淘"], ["jd", "京"], ["dy", "抖"]];
  return channels.map(([kind, label], index) => `<span class="store-channel"><b class="${kind}">${label}</b>${product.online ? "上架" : "下架"}${index < product.prices.length ? "" : ""}</span>`).join("");
}

function storePriceRows(product) {
  const channels = [["mt", "美"], ["tb", "淘"], ["jd", "京"], ["dy", "抖"]];
  return channels.slice(0, product.prices.length).map(([kind, label], index) => `<span class="store-channel"><b class="${kind}">${label}</b>¥${product.prices[index]} <button class="store-edit" type="button" data-store-price="${product.id}" aria-label="编辑渠道售价"></button></span>`).join("");
}

function renderStoreProducts() {
  const products = getVisibleStoreProducts();
  storeProductTabs.innerHTML = [
    ["all", "全部商品", "8738", ""], ["combo", "组合商品", "624", ""],
    ["exception", "异常商品", "6531", "warning"], ["missing", "缺货商品", "1677", "danger"]
  ].map(([id, name, count, color]) => `<button type="button" data-store-tab="${id}" class="${storeProductState.tab === id ? "active" : ""}">${name}（<em class="${color}">${count}</em>）</button>`).join("");
  storeProductTableBody.innerHTML = products.map((product) => `
    <tr data-store-row="${product.id}">
      <td><input type="checkbox" data-store-select="${product.id}" ${product.selected ? "checked" : ""} aria-label="选择${product.name}" /></td>
      <td><div class="store-product-info"><span class="store-product-photo">${product.icon}</span><div><strong><i class="combo">组</i>${product.name}</strong><div class="store-product-muted">编码： <button class="store-product-link">${product.code}</button></div><div class="store-product-muted">条码： ${product.barcode}</div><div class="store-product-muted">规格：--｜重量：${product.weight}</div>${product.issue ? '<span class="store-product-warning">● 商品有1个问题</span>' : ""}</div></div></td>
      <td>联家恒通店<br><button class="store-product-link">1001</button></td><td>${product.front}</td><td>${product.back}</td>
      <td>线上： <span class="store-product-sale">售卖</span><br>线下： ${product.online ? "上架" : "下架"}</td><td>${storeChannelRows(product)}</td>
      <td>999 <button class="store-edit" type="button" data-store-stock="${product.id}" aria-label="编辑线上库存"></button></td><td>¥${product.offline}</td><td>${storePriceRows(product)}</td><td>${storeMarkupRows(product)}</td>
      <td>${storeSyncRows(product)}</td>
      <td><div class="store-product-actions"><button type="button" data-store-toggle="${product.id}">设置商品上下架</button><button type="button" data-store-log="${product.id}">日志</button><button type="button" data-store-delete="${product.id}">删除</button></div></td>
    </tr>`).join("");
  storeProductEmpty.hidden = products.length !== 0;
  storeProductSelectAll.checked = products.length > 0 && products.every((product) => product.selected);
  storeProductTotal.textContent = `共 ${storeProductState.tab === "all" ? 8738 : storeProductState.tab === "combo" ? 624 : storeProductState.tab === "exception" ? 6531 : 1677} 条`;
  storeProductPages.innerHTML = `<button aria-label="上一页">‹</button>${[1,2,3,4,5,6].map(page => `<button class="${storeProductState.page === page ? "active" : ""}" data-store-page="${page}">${page}</button>`).join("")}<span>…</span><button data-store-page="874">874</button><button aria-label="下一页">›</button>`;
}

function openStoreProductPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城门店商品");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  [tongchengPage, productPoolPage, cityOrderPage, constructionPage, heatmapPage, productAbsenceReportPage, productStockoutReportPage, imReplyRateReportPage, interfacePage, localLifeStorePage, localLifeVerifyPage, localLifeProductPage, localLifeCouponPage, localLifeAfterSalePage, localLifeShopPage, cityOpsPage, cityFormatPage, backendCategoryPage, cityShelfPlanPage].forEach(page => { page.hidden = true; });
  storeProductPage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach(button => button.classList.toggle("active", button.dataset.page === "同城门店商品"));
  renderStoreProducts();
}

storeProductQuery.addEventListener("click", () => {
  const inputs = [...storeProductPage.querySelectorAll("[data-store-filter]")];
  const filters = Object.fromEntries(inputs.map(input => [input.dataset.storeFilter, input.value.trim()]));
  for (const key of ["stock", "price"]) {
    const low = filters[key + "Min"], high = filters[key + "Max"];
    if ((low !== "" && Number(low) < 0) || (high !== "" && Number(high) < 0)
      || (low !== "" && high !== "" && Number(low) > Number(high))) {
      showStoreProductToast(key === "stock" ? "请填写正确的库存范围，最低值不能大于最高值" : "请填写正确的价格范围，最低值不能大于最高值");
      return;
    }
  }
  storeProductState.filters = filters;
  storeProductState.page = 1;
  storeProductState.code = storeProductCode.value.trim();
  storeProductState.keyword = storeProductName.value.trim();
  renderStoreProducts();
});
storeProductReset.addEventListener("click", () => {
  storeProductCode.value = ""; storeProductName.value = "";
  storeProductState.code = ""; storeProductState.keyword = ""; storeProductState.filters = {}; storeProductState.page = 1;
  storeProductPage.querySelectorAll("[data-store-filter]").forEach(input => { input.value = ""; });
  renderStoreProducts();
});
storeProductPage.querySelector(".store-product-expand").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const expanded = button.getAttribute("aria-expanded") !== "true";
  button.setAttribute("aria-expanded", String(expanded));
  button.setAttribute("aria-label", expanded ? "收起筛选" : "展开筛选");
  button.textContent = expanded ? "⌃" : "⌄";
  storeProductPage.querySelector(".store-product-filter").classList.toggle("is-expanded", expanded);
  storeProductPage.querySelectorAll(".store-product-filter-extra").forEach(field => { field.hidden = !expanded; });
});
storeProductPage.querySelector(".store-product-filter").addEventListener("keydown", event => {
  if (event.key === "Enter" && event.target.tagName === "INPUT") { event.preventDefault(); storeProductQuery.click(); }
});
storeProductSelectAll.addEventListener("change", () => { getVisibleStoreProducts().forEach(product => { product.selected = storeProductSelectAll.checked; }); renderStoreProducts(); });
storeProductPage.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  if (button.dataset.storeTab) { storeProductState.tab = button.dataset.storeTab; storeProductState.page = 1; renderStoreProducts(); }
  if (button.dataset.storePage) { storeProductState.page = Number(button.dataset.storePage); renderStoreProducts(); showStoreProductToast(`已切换至第 ${storeProductState.page} 页`); }
  if (button.dataset.storeToggle) { const product = storeProductState.products.find(item => item.id === Number(button.dataset.storeToggle)); product.online = !product.online; renderStoreProducts(); showStoreProductToast(product.online ? "商品已上架" : "商品已下架"); }
  if (button.dataset.storeDelete) { const product = storeProductState.products.find(item => item.id === Number(button.dataset.storeDelete)); product.issue = true; renderStoreProducts(); showStoreProductToast("原型演示：商品已移入异常商品"); }
  if (button.dataset.storePriceSync) openStorePriceSyncDetails(storeProductState.products.find(item => item.id === Number(button.dataset.storePriceSync)));
  if (button.hasAttribute("data-store-sync-save")) {
    const dialog = document.getElementById("storePriceSyncDialog");
    const product = storeProductState.products.find(item => item.id === Number(dialog.dataset.productId));
    product.priceSync = [...dialog.querySelectorAll("[data-store-channel-sync]")].map(select => select.value === "enabled");
    dialog.close();
    renderStoreProducts();
    showStoreProductToast("已保存渠道价格同步设置");
  }
  if (button.hasAttribute("data-store-sync-close")) document.getElementById("storePriceSyncDialog").close();
  if (button.dataset.storeLog) showStoreProductToast("已打开商品操作日志");
  if (button.dataset.storeStock || button.dataset.storePrice) showStoreProductToast("编辑内容已保存");
  if (button.dataset.storeBatch) { const selected = storeProductState.products.filter(product => product.selected); if (!selected.length) { showStoreProductToast("请先选择商品"); return; } selected.forEach(product => { product.online = button.dataset.storeBatch === "up"; product.selected = false; }); renderStoreProducts(); showStoreProductToast(button.dataset.storeBatch === "up" ? "所选商品已全渠道上架" : "所选商品已全渠道下架"); }
  if (button.hasAttribute("data-store-more")) showStoreProductToast("更多操作菜单已展开");
  if (button.hasAttribute("data-store-create-batch")) showStoreProductToast("已进入批量创建门店商品");
  if (button.hasAttribute("data-store-create")) showStoreProductToast("已进入创建商品");
});
storeProductPage.addEventListener("change", (event) => {
  if (event.target.dataset.storeSelect) { const product = storeProductState.products.find(item => item.id === Number(event.target.dataset.storeSelect)); product.selected = event.target.checked; renderStoreProducts(); }
  if (event.target.dataset.storePriceSyncSelect) {
    const product = storeProductState.products.find(item => item.id === Number(event.target.dataset.storePriceSyncSelect));
    if (event.target.value === "部分启用") {
      event.target.value = getStorePriceSyncStatus(product);
      openStorePriceSyncDetails(product);
    } else {
      product.priceSync = product.priceSync.map(() => event.target.value === "启用");
      renderStoreProducts();
      showStoreProductToast(`已${getStorePriceSyncStatus(product)}全渠道价格同步`);
    }
  }
  if (event.target.dataset.storeStockSync) {
    const product = storeProductState.products.find(item => item.id === Number(event.target.dataset.storeStockSync));
    product.stockSync = event.target.value === "启用";
    renderStoreProducts();
    showStoreProductToast(`已${product.stockSync ? "启用" : "停用"}线下库存同步`);
  }
  if (event.target.dataset.storeSync) { const product = storeProductState.products.find(item => item.id === Number(event.target.dataset.storeSync)); product.sync = event.target.value === "启用"; showStoreProductToast(`已${event.target.value}线下上下架同步`); }
});

renderStoreProducts();
