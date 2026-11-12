function renderStandardProductTable() {
  const visibleProducts = activeTab === "exception" ? standardProducts.filter((item) => item.exceptionCount > 0) : standardProducts;
  standardProductTableBody.innerHTML = visibleProducts
    .map((item) => {
      const issue = item.exceptionCount
        ? `<button class="standard-exception-link" data-standard-exception="${item.code}"><span aria-hidden="true">!</span>商品有${item.exceptionCount}个问题</button>`
        : "";
      const stores = item.stores
        .map(
          (store) => `
            <div class="store-channel-line">
              <span class="store-channel-icon ${store.tone}">${store.channel}</span>
              <button class="link-button" type="button">${store.count} 家</button>
            </div>
          `
        )
        .join("");
      const actions = item.actions
        .map((action) => `<button class="link-button" type="button" data-standard-action="${action}" data-standard-code="${item.code}">${action}</button>`)
        .join("");
      return `
        <tr data-standard-row="${item.code}">
          <td>
            <div class="standard-product-info">
              <div class="standard-product-thumb">
                <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer" />
              </div>
              <div class="standard-product-copy">
                <div class="standard-product-name">${item.name}</div>
                <div><span>编码：</span><button class="link-button standard-product-code" type="button">${item.code}</button></div>
                <div><span>条码：</span>${item.barcode}</div>
                ${issue}
              </div>
            </div>
          </td>
          <td>
            <div class="standard-spec-lines">
              <div><span>规格：</span>${item.spec}</div>
              <div><span>单位：</span>${item.unit}</div>
              <div><span>重量：</span>${item.weight}</div>
            </div>
          </td>
          <td>${item.foregroundCategory}</td>
          <td>${item.backendCategory}</td>
          <td><span class="standard-sale-status"><i aria-hidden="true"></i>${item.status}</span></td>
          <td>
            <div class="standard-sync-status">
              <div><span>名称：</span><strong class="${item.syncStatus.name === "停用" ? "disabled" : ""}">${item.syncStatus.name}</strong></div>
              <div><span>主图：</span><strong>${item.syncStatus.image}</strong></div>
            </div>
          </td>
          <td><div class="store-channel-list">${stores}</div></td>
          <td>${item.channelTags.map((tag) => `<span class="tag-pill">${tag}</span>`).join("")}</td>
          <td class="standard-update-time">${item.updatedAt}</td>
          <td class="sticky-col"><div class="standard-row-actions">${actions}</div></td>
        </tr>
      `;
    })
    .join("");
}

function renderTable() {
  renderStandardProductTable();
  const visibleProducts = activeTab === "exception" ? products.filter((item) => item.exceptionCount > 0) : products;
  tableBody.innerHTML = visibleProducts
    .map((item) => {
      const issue = item.exceptionCount
        ? `<button class="link-button exception-link" data-exception="${item.code}">商品有 ${item.exceptionCount} 个问题 &gt;</button>`
        : "";
      const selected = selectedCode === item.code ? "selected" : "";
      const categoryContent = isUnifiedCategoryPage
        ? `
            <div class="category-lines unified-category-lines">
              <div><span>前台类目：</span><em>${item.unifiedForegroundCategory}</em></div>
              <div><span>后台类目：</span><em>${item.unifiedBackendCategory}</em></div>
            </div>
          `
        : `
            <div class="category-lines">
              <div><span>前台类目：</span><strong>京东：</strong><em>${item.foregroundCategories.jd}</em></div>
              <div><span></span><strong>美团：</strong><em>${item.foregroundCategories.mt}</em></div>
              <div><span></span><strong>饿了么：</strong><em>${item.foregroundCategories.ele}</em></div>
              <div><span>后台类目：</span><em>${item.backendCategory}</em></div>
            </div>
          `;
      return `
        <tr class="${selected}" data-row="${item.code}">
          <td class="code-cell">
            <strong>${item.code}</strong>
            ${issue}
          </td>
          <td>
            <div class="product-info">
              <div class="product-thumb">
                <img src="${item.imageUrl}" alt="${item.name}" loading="lazy" referrerpolicy="no-referrer" />
              </div>
              <div>
                <div class="product-name">${item.name}</div>
                <div class="barcode">条码：${item.barcode}</div>
              </div>
            </div>
          </td>
          <td>
            <div>规格：${item.spec}</div>
            <div class="muted">单位：${item.unit}</div>
            <div class="muted">重量：${item.weight}</div>
          </td>
          <td>
            ${categoryContent}
          </td>
          <td><button class="link-button status">${item.status}⌄</button></td>
          <td>${item.tag ? `<span class="tag-pill">${item.tag}</span>` : ""}</td>
          <td>
            <div class="sync-status">
              <div>名称：${item.syncStatus.name}</div>
              <div>主图：${item.syncStatus.image}</div>
            </div>
          </td>
          <td class="sticky-col">
            <div class="row-actions">
              <div class="row-actions-main">
                <button class="link-button" data-edit-product="${item.code}">编辑</button>
                <button class="link-button">删除</button>
                <button class="link-button">更多</button>
              </div>
              <button class="link-button publish-channel-button" data-publish-channel="${item.code}">发品到渠道</button>
            </div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderUnifiedCategoryTree() {
  categoryTree.innerHTML = unifiedCategoryTree
    .map((item) => {
      const hasChildren = item.children.length > 0;
      const expanded = expandedUnifiedCategories.has(item.name);
      const children = expanded
        ? `<div class="category-tree-children">${item.children.map((child) => `<button>${child.name}（${child.count}）</button>`).join("")}</div>`
        : "";
      return `
        <div class="category-tree-node ${expanded ? "expanded" : ""}">
          <button class="category-tree-parent" data-tree-category="${item.name}">
            <span class="tree-arrow">${hasChildren ? (expanded ? "▾" : "▸") : ""}</span>
            <span>${item.name}（${item.count}）</span>
          </button>
          ${children}
        </div>
      `;
    })
    .join("");
}

function renderCategories() {
  const levelOne = document.querySelector("#levelOne");
  const levelTwo = document.querySelector("#levelTwo");

  levelOne.innerHTML = Object.keys(categories)
    .map((name) => {
      const hasChildren = categories[name].length > 0;
      const active = name === activeCategory ? "active" : "";
      return `<button class="category-option ${active}" data-level-one="${name}"><span>${name}</span><span>${hasChildren ? "›" : ""}</span></button>`;
    })
    .join("");

  levelTwo.innerHTML = (categories[activeCategory] || [])
    .map((name) => `<label class="category-option checkbox"><input type="checkbox" data-level-two="${name}" /> ${name}</label>`)
    .join("");
}

function renderPageTabs() {
  document.getElementById("cityCatalogPage").hidden = activePage !== "同城商品";
  document.getElementById("salesOverviewPage").hidden = activePage !== "同城销售总览";
  document.getElementById("absenceReport2Page").hidden = activePage !== "同城缺勤报表2";
  document.getElementById("inventoryComparePage").hidden = activePage !== "同城商品库存对比";
  document.getElementById("merchantServicePage").hidden = activePage !== "小程序商家客服";
  document.getElementById("cityInventoryLogPage").hidden = activePage !== "同城库存操作日志";
  document.getElementById("cityInventoryPage").hidden = activePage !== "同城库存";
  cityShelfPlanPage.hidden = activePage !== "同城上下架计划";
  pageTabs.innerHTML = openTabs
    .map((name) => {
      const active = name === activePage ? "active" : "";
      const displayName = name === "同城商品管理(统一分类)" ? "商品（统一）1" : name;
      const close = name === "概况" ? "" : `<span class="tab-close" data-close-tab="${name}" aria-label="关闭${displayName}">×</span>`;
      return `<button class="${active}" data-tab="${name}">${displayName} ${close}</button>`;
    })
    .join("");
}

function addOrActivateTab(pageName) {
  leaveTongchengAppPage();
  leaveCustomTaskPage();
  cityOpsPage.hidden = pageName !== "同城运维工具";
  cityFormatPage.hidden = pageName !== "同城业态";
  backendCategoryPage.hidden = pageName !== "同城后台类目";
  productStockoutReportPage.hidden = true;
  productPoolPage.hidden = pageName !== "商品池管理";
  if (!openTabs.includes(pageName)) {
    openTabs.push(pageName);
  }
  activePage = pageName;
  renderPageTabs();
}
