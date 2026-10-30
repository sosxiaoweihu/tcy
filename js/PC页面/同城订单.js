const cityOrderRows = [
  {
    platformNo: "1",
    orderNo: "3567219009392324",
    store: "家得福东海颐景店",
    storeCode: "1177",
    status: "已取消",
    source: "京东到家",
    receiver: "宋**",
    phone: "18994543702",
    createdTime: "2026-07-22 23:58:46",
    acceptedTime: "2026-07-22 23:59:02",
    expectedTime: "2026-07-23 09:17:00",
    completedTime: "--",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "12",
    orderNo: "403065618849041060",
    store: "家得福东海锦绣店",
    storeCode: "1182",
    status: "已完成",
    source: "饿百",
    receiver: "唐**",
    phone: "18468460361",
    createdTime: "2026-07-22 23:55:42",
    acceptedTime: "2026-07-22 23:56:05",
    expectedTime: "2026-07-23 10:25:00",
    completedTime: "2026-07-23 10:06:48",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "1",
    orderNo: "401650618849139772",
    store: "家得福西小区店",
    storeCode: "1003",
    status: "已完成",
    source: "饿百",
    receiver: "李*****",
    phone: "13776497942",
    createdTime: "2026-07-22 23:55:18",
    acceptedTime: "2026-07-22 23:55:36",
    expectedTime: "2026-07-23 11:55:00",
    completedTime: "2026-07-23 11:38:21",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "5",
    orderNo: "408511035469213866",
    store: "家得福海棠店",
    storeCode: "1001",
    status: "已完成",
    source: "饿百",
    receiver: "俞*",
    phone: "13775595301",
    createdTime: "2026-07-22 23:54:33",
    acceptedTime: "2026-07-22 23:54:48",
    expectedTime: "2026-07-23 09:00:00",
    completedTime: "2026-07-23 08:47:16",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "231",
    orderNo: "200222335402058338",
    store: "家得福双盛花店",
    storeCode: "1146",
    status: "已完成",
    source: "美团外卖",
    receiver: "晓女士",
    phone: "18360354683",
    createdTime: "2026-07-22 23:54:06",
    acceptedTime: "2026-07-22 23:54:25",
    expectedTime: "2026-07-23 09:10:00",
    completedTime: "2026-07-23 09:02:45",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "27",
    orderNo: "200222335187572955",
    store: "家得福湖州湾店",
    storeCode: "1198",
    status: "已完成",
    source: "美团外卖",
    receiver: "顾先生",
    phone: "18468467255",
    createdTime: "2026-07-22 23:52:56",
    acceptedTime: "2026-07-22 23:52:59",
    expectedTime: "2026-07-23 09:40:00",
    completedTime: "2026-07-23 09:31:08",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "11",
    orderNo: "401796618866975709",
    store: "家得福东海锦绣店",
    storeCode: "1182",
    status: "已完成",
    source: "饿百",
    receiver: "唐",
    phone: "13775593835",
    createdTime: "2026-07-22 23:52:30",
    acceptedTime: "2026-07-22 23:52:42",
    expectedTime: "2026-07-23 10:25:00",
    completedTime: "2026-07-23 10:12:29",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "230",
    orderNo: "200222335141828397",
    store: "家得福双盛花店",
    storeCode: "1146",
    status: "已完成",
    source: "美团外卖",
    receiver: "晓女士",
    phone: "15061334602",
    createdTime: "2026-07-22 23:51:45",
    acceptedTime: "2026-07-22 23:51:51",
    expectedTime: "2026-07-23 09:10:00",
    completedTime: "2026-07-23 09:01:52",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "10",
    orderNo: "404740035504400555",
    store: "家得福东海锦绣店",
    storeCode: "1182",
    status: "已完成",
    source: "饿百",
    receiver: "小*",
    phone: "17834799863",
    createdTime: "2026-07-22 23:48:27",
    acceptedTime: "2026-07-22 23:48:45",
    expectedTime: "2026-07-23 10:25:00",
    completedTime: "2026-07-23 10:03:17",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "21",
    orderNo: "210222334009738393",
    store: "家得福高新邻里店",
    storeCode: "1195",
    status: "配送中",
    source: "美团外卖",
    receiver: "c先生",
    phone: "15061334636",
    createdTime: "2026-07-22 23:45:36",
    acceptedTime: "2026-07-22 23:45:54",
    expectedTime: "2026-07-23 17:40:00",
    completedTime: "--",
    invoiceStatus: "未开票"
  },
  {
    platformNo: "3",
    orderNo: "4094546188654632504",
    store: "家得福锦绣汇店",
    storeCode: "1180",
    status: "待拣货",
    source: "饿百",
    receiver: "李*****",
    phone: "13048690043",
    createdTime: "2026-07-23 08:32:29",
    acceptedTime: "2026-07-23 08:32:36",
    expectedTime: "2026-07-23 09:35:00",
    completedTime: "--",
    invoiceStatus: "未开票"
  }
];

let activeCityOrderListTab = "all";
let activeCityOrderInvoiceNumbers = [];
const selectedCityOrderNumbers = new Set();
const cityOrderInvoiceDefaultAmount = "42.69";
const cityOrderInvoiceAmounts = {
  "3567219009392324": 36.8,
  "403065618849041060": 42.69,
  "401650618849139772": 57.2,
  "408511035469213866": 31.46,
  "200222335402058338": 68,
  "200222335187572955": 45.9,
  "401796618866975709": 29.8,
  "200222335141828397": 73.52,
  "404740035504400555": 39.9,
  "210222334009738393": 52.6,
  "4094546188654632504": 42.69
};
const cityOrderQrModal = document.querySelector("#cityOrderQrModal");
const cityOrderQrClose = document.querySelector("#cityOrderQrClose");
const cityOrderQrOrderNumber = document.querySelector("#cityOrderQrOrderNumber");
const cityOrderQrCanvas = document.querySelector("#cityOrderQrCanvas");
const cityOrderInvoiceBackButton = document.querySelector("#cityOrderInvoiceBackButton");
let cityOrderQrReturnFocus = null;

function createCityOrderQrModules(orderNumber) {
  const size = 41;
  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));
  let seed = [...orderNumber].reduce(
    (value, character) => Math.imul(value ^ character.charCodeAt(0), 16777619) >>> 0,
    2166136261
  );

  const nextBit = () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return ((seed >>> 28) & 1) === 1;
  };
  const reserveArea = (startX, startY, width, height) => {
    for (let y = Math.max(0, startY); y < Math.min(size, startY + height); y += 1) {
      for (let x = Math.max(0, startX); x < Math.min(size, startX + width); x += 1) {
        reserved[y][x] = true;
      }
    }
  };
  const drawFinder = (startX, startY) => {
    reserveArea(startX - 1, startY - 1, 9, 9);
    for (let y = 0; y < 7; y += 1) {
      for (let x = 0; x < 7; x += 1) {
        const isOuter = x === 0 || x === 6 || y === 0 || y === 6;
        const isCenter = x >= 2 && x <= 4 && y >= 2 && y <= 4;
        modules[startY + y][startX + x] = isOuter || isCenter;
      }
    }
  };
  const drawAlignment = (centerX, centerY) => {
    reserveArea(centerX - 2, centerY - 2, 5, 5);
    for (let y = -2; y <= 2; y += 1) {
      for (let x = -2; x <= 2; x += 1) {
        modules[centerY + y][centerX + x] = Math.abs(x) === 2 || Math.abs(y) === 2 || (x === 0 && y === 0);
      }
    }
  };

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);
  drawAlignment(30, 30);

  for (let index = 8; index < size - 8; index += 1) {
    reserved[6][index] = true;
    reserved[index][6] = true;
    modules[6][index] = index % 2 === 0;
    modules[index][6] = index % 2 === 0;
  }

  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      if (!reserved[y][x]) modules[y][x] = nextBit() !== ((x + y) % 3 === 0);
    }
  }
  return modules;
}

function drawCityOrderQr(orderNumber) {
  const context = cityOrderQrCanvas.getContext("2d");
  const modules = createCityOrderQrModules(orderNumber);
  const quietZone = 4;
  const moduleSize = 7;
  context.clearRect(0, 0, cityOrderQrCanvas.width, cityOrderQrCanvas.height);
  context.fillStyle = "#fff";
  context.fillRect(0, 0, cityOrderQrCanvas.width, cityOrderQrCanvas.height);
  context.fillStyle = "#000";
  modules.forEach((row, y) => {
    row.forEach((filled, x) => {
      if (!filled) return;
      context.fillRect((x + quietZone) * moduleSize, (y + quietZone) * moduleSize, moduleSize, moduleSize);
    });
  });
}

function openCityOrderQrModal(orderNumber, triggerButton) {
  const order = cityOrderRows.find((item) => item.orderNo === orderNumber);
  if (!order) return;
  cityOrderQrReturnFocus = triggerButton;
  cityOrderQrOrderNumber.textContent = order.orderNo;
  cityOrderQrCanvas.setAttribute("aria-label", `订单 ${order.orderNo} 开票二维码`);
  drawCityOrderQr(order.orderNo);
  cityOrderQrModal.classList.add("open");
  cityOrderQrModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("city-order-qr-open");
  cityOrderQrClose.focus();
}

function closeCityOrderQrModal() {
  if (!cityOrderQrModal.classList.contains("open")) return;
  cityOrderQrModal.classList.remove("open");
  cityOrderQrModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("city-order-qr-open");
  if (cityOrderQrReturnFocus) cityOrderQrReturnFocus.focus();
}

function getCityOrderInvoiceAmount(orderNumber) {
  return Number(cityOrderInvoiceAmounts[orderNumber] ?? cityOrderInvoiceDefaultAmount);
}

function canShowCityOrderInvoiceAction(order) {
  return order.status === "已完成" && order.invoiceStatus === "未开票";
}

function clearCityOrderSelection() {
  selectedCityOrderNumbers.clear();
  cityOrderSelectAll.checked = false;
  cityOrderSelectAll.indeterminate = false;
}

function getFilteredCityOrders() {
  const store = cityOrderStoreFilter.value;
  const source = cityOrderSourceFilter.value;
  const orderNumber = cityOrderNumberFilter.value.trim();

  return cityOrderRows.filter((order) => {
    if (activeCityOrderListTab === "picking" && order.status !== "待拣货") return false;
    if (store && order.store !== store) return false;
    if (source && order.source !== source) return false;
    if (orderNumber && !order.orderNo.includes(orderNumber)) return false;
    return true;
  });
}

function renderCityOrderRows() {
  const filteredRows = getFilteredCityOrders();
  const visibleRows = filteredRows.slice(0, 10);

  cityOrderListBody.innerHTML = visibleRows
    .map((order) => {
      const invoiceAction = canShowCityOrderInvoiceAction(order)
        ? `<button class="link-button" type="button" data-invoice-order-number="${order.orderNo}" aria-label="为订单 ${order.orderNo} 开票">开票</button>`
        : "";
      return `
        <tr class="${selectedCityOrderNumbers.has(order.orderNo) ? "is-selected" : ""}">
          <td><input class="city-order-select-checkbox" type="checkbox" data-order-select="${order.orderNo}" aria-label="选择订单 ${order.orderNo}" ${selectedCityOrderNumbers.has(order.orderNo) ? "checked" : ""} /></td>
          <td>${order.platformNo}</td>
          <td><button class="city-order-number-link" type="button" data-order-number="${order.orderNo}">${order.orderNo}</button></td>
          <td title="${order.store}">${order.store}</td>
          <td>${order.storeCode}</td>
          <td>${order.status}</td>
          <td>${order.source}</td>
          <td>${order.receiver}</td>
          <td title="${order.phone}">${order.phone}</td>
          <td title="${order.createdTime}">${order.createdTime}</td>
          <td title="${order.acceptedTime}">${order.acceptedTime}</td>
          <td title="${order.expectedTime}">${order.expectedTime}</td>
          <td title="${order.completedTime}">${order.completedTime}</td>
          <td>${order.invoiceStatus}</td>
          <td>${invoiceAction}</td>
        </tr>
      `;
    })
    .join("");

  const selectedVisibleCount = visibleRows.filter((order) => selectedCityOrderNumbers.has(order.orderNo)).length;
  cityOrderSelectAll.disabled = visibleRows.length === 0;
  cityOrderSelectAll.checked = visibleRows.length > 0 && selectedVisibleCount === visibleRows.length;
  cityOrderSelectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleRows.length;

  cityOrderEmptyState.hidden = visibleRows.length > 0;
  const hasActiveFilter = Boolean(cityOrderStoreFilter.value || cityOrderSourceFilter.value || cityOrderNumberFilter.value.trim());
  const total = hasActiveFilter ? filteredRows.length : activeCityOrderListTab === "picking" ? 128 : 5843;
  cityOrderPaginationTotal.textContent = `共 ${total} 条`;
}

function showCityOrderList() {
  cityOrderListView.hidden = false;
  cityOrderDetailView.hidden = true;
  cityOrderInvoiceView.hidden = true;
  cityOrderServiceButton.hidden = true;
  cityOrderLogList.hidden = true;
  cityOrderLogToggle.setAttribute("aria-expanded", "false");
  renderCityOrderRows();
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showCityOrderDetail(orderNumber) {
  const order = cityOrderRows.find((item) => item.orderNo === orderNumber);
  if (!order) return;

  cityOrderOverviewTitle.textContent = `${order.source} 平台小号：#${order.platformNo}`;
  cityOrderDetailStatus.textContent = order.status;
  cityOrderDetailStatus.dataset.status = order.status;
  cityOrderDetailNumber.textContent = `平台订单号：${order.orderNo}`;
  cityOrderDetailExpectedTime.textContent = `期望送达时间：${order.expectedTime}`;
  cityOrderDetailStore.textContent = order.store;
  cityOrderDetailSource.textContent = order.source;
  cityOrderDetailCreatedTime.textContent = order.createdTime;
  cityOrderDetailAcceptedTime.textContent = order.acceptedTime;
  cityOrderDetailCompletedTime.textContent = order.completedTime;
  cityOrderDetailReceiver.textContent = order.receiver;
  cityOrderDetailPhone.textContent = order.phone;
  cityOrderLogList.hidden = false;
  cityOrderLogToggle.setAttribute("aria-expanded", "true");
  cityOrderListView.hidden = true;
  cityOrderInvoiceView.hidden = true;
  cityOrderDetailView.hidden = false;
  cityOrderServiceButton.hidden = false;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function showCityOrderInvoice(orderNumbers, isBatchInvoice = false) {
  const normalizedOrderNumbers = [...new Set(Array.isArray(orderNumbers) ? orderNumbers : [orderNumbers])];
  const orders = normalizedOrderNumbers
    .map((orderNumber) => cityOrderRows.find((item) => item.orderNo === orderNumber))
    .filter(Boolean);
  if (!orders.length) return;

  activeCityOrderInvoiceNumbers = orders.map((order) => order.orderNo);
  cityOrderInvoiceForm.reset();
  cityOrderInvoiceHeaderName.value = "个人";
  cityOrderInvoiceViewTitle.textContent = isBatchInvoice ? "批量开票" : "开票";
  cityOrderInvoiceHeading.textContent = isBatchInvoice ? `批量订单开票申请（${orders.length}条）` : "订单开票申请";

  const totalAmount = orders.reduce((total, order) => total + getCityOrderInvoiceAmount(order.orderNo), 0);
  const formattedTotalAmount = totalAmount.toFixed(2);
  cityOrderInvoiceAmount.textContent = formattedTotalAmount;
  cityOrderInvoiceOrderCount.textContent = `${orders.length}条`;
  cityOrderInvoiceTableTotalAmount.textContent = formattedTotalAmount;
  cityOrderInvoiceTableBody.innerHTML = orders
    .map(
      (order, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${order.orderNo}</td>
          <td>${getCityOrderInvoiceAmount(order.orderNo).toFixed(2)}</td>
        </tr>
      `
    )
    .join("");
  cityOrderListView.hidden = true;
  cityOrderDetailView.hidden = true;
  cityOrderInvoiceView.hidden = false;
  cityOrderServiceButton.hidden = false;
  window.scrollTo({ top: 0, behavior: "auto" });
}

function openOrderManagementPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("订单管理");

  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  unifiedCategorySidebar.hidden = true;
  tongchengPage.hidden = true;
  productPoolPage.hidden = true;
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
  cityOrderPage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;

  clearCityOrderSelection();
  showCityOrderList();
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "订单管理");
  });
}

function closeOrderManagementPage() {
  cityOrderPage.hidden = true;
}

document.querySelectorAll("[data-order-list-tab]").forEach((button) => {
  button.addEventListener("click", () => {
    activeCityOrderListTab = button.dataset.orderListTab;
    clearCityOrderSelection();
    document.querySelectorAll("[data-order-list-tab]").forEach((tab) => {
      tab.classList.toggle("active", tab === button);
    });
    renderCityOrderRows();
  });
});

cityOrderListBody.addEventListener("click", (event) => {
  const invoiceButton = event.target.closest("[data-invoice-order-number]");
  if (invoiceButton) {
    openCityOrderQrModal(invoiceButton.dataset.invoiceOrderNumber, invoiceButton);
    return;
  }

  const orderLink = event.target.closest("[data-order-number]");
  if (!orderLink) return;
  showCityOrderDetail(orderLink.dataset.orderNumber);
});

cityOrderListBody.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-order-select]");
  if (!checkbox) return;

  if (checkbox.checked) {
    selectedCityOrderNumbers.add(checkbox.dataset.orderSelect);
  } else {
    selectedCityOrderNumbers.delete(checkbox.dataset.orderSelect);
  }
  checkbox.closest("tr").classList.toggle("is-selected", checkbox.checked);

  const visibleRows = getFilteredCityOrders().slice(0, 10);
  const selectedVisibleCount = visibleRows.filter((order) => selectedCityOrderNumbers.has(order.orderNo)).length;
  cityOrderSelectAll.checked = visibleRows.length > 0 && selectedVisibleCount === visibleRows.length;
  cityOrderSelectAll.indeterminate = selectedVisibleCount > 0 && selectedVisibleCount < visibleRows.length;
});

cityOrderSelectAll.addEventListener("change", () => {
  getFilteredCityOrders()
    .slice(0, 10)
    .forEach((order) => {
      if (cityOrderSelectAll.checked) {
        selectedCityOrderNumbers.add(order.orderNo);
      } else {
        selectedCityOrderNumbers.delete(order.orderNo);
      }
    });
  renderCityOrderRows();
});

cityOrderBatchInvoiceButton.addEventListener("click", () => {
  if (!selectedCityOrderNumbers.size) {
    showToast("请先勾选需要开票的订单");
    return;
  }
  showCityOrderInvoice([...selectedCityOrderNumbers], true);
});

cityOrderQrClose.addEventListener("click", closeCityOrderQrModal);

cityOrderQrModal.addEventListener("click", (event) => {
  if (event.target === cityOrderQrModal) closeCityOrderQrModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cityOrderQrModal.classList.contains("open")) {
    closeCityOrderQrModal();
  }
});

cityOrderInvoiceForm.addEventListener("change", (event) => {
  if (event.target.name !== "cityOrderInvoiceHeaderType") return;
  const isPersonal = event.target.value === "个人";
  cityOrderInvoiceHeaderName.value = isPersonal ? "个人" : "";
  cityOrderInvoiceHeaderName.placeholder = isPersonal ? "" : "请输入企业名称";
});

cityOrderInvoiceAmountHelp.addEventListener("click", () => {
  showToast("总金额为当前订单可申请开票的金额");
});

cityOrderInvoiceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const invoiceOrders = cityOrderRows.filter((order) => activeCityOrderInvoiceNumbers.includes(order.orderNo));
  if (!invoiceOrders.length) return;
  invoiceOrders.forEach((order) => {
    order.invoiceStatus = "开票中";
  });
  clearCityOrderSelection();
  showCityOrderList();
  showToast(
    invoiceOrders.length === 1
      ? `订单 ${invoiceOrders[0].orderNo} 的开票申请已提交`
      : `已提交 ${invoiceOrders.length} 笔订单的批量开票申请`
  );
});

cityOrderQueryButton.addEventListener("click", () => {
  clearCityOrderSelection();
  renderCityOrderRows();
  showToast(`查询完成，当前显示 ${getFilteredCityOrders().slice(0, 10).length} 条示例订单`);
});

cityOrderResetButton.addEventListener("click", () => {
  cityOrderStoreFilter.value = "";
  cityOrderSourceFilter.value = "";
  cityOrderNumberFilter.value = "";
  cityOrderPageJump.value = "1";
  activeCityOrderListTab = "all";
  clearCityOrderSelection();
  document.querySelectorAll("[data-order-list-tab]").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.orderListTab === "all");
  });
  renderCityOrderRows();
  showToast("订单筛选条件已重置");
});

cityOrderNumberFilter.addEventListener("keydown", (event) => {
  if (event.key === "Enter") cityOrderQueryButton.click();
});

cityOrderFilterMore.addEventListener("click", () => {
  const isExpanded = cityOrderFilterMore.getAttribute("aria-expanded") === "true";
  cityOrderFilterMore.setAttribute("aria-expanded", String(!isExpanded));
  cityOrderFilterMore.setAttribute("aria-label", isExpanded ? "展开更多筛选条件" : "收起更多筛选条件");
  showToast(isExpanded ? "筛选条件已收起" : "当前筛选条件已全部展示");
});

cityOrderExportButton.addEventListener("click", () => showToast("订单导出任务已创建"));
cityOrderExportHistoryButton.addEventListener("click", () => showToast("已打开订单导出记录"));
cityOrderOptionsButton.addEventListener("click", () => showToast("订单列表选项已打开"));

document.querySelector(".city-order-pagination").addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const pageNumber = Number(button.textContent);
  if (Number.isInteger(pageNumber) && pageNumber > 0) {
    cityOrderPageJump.value = String(pageNumber);
    document.querySelectorAll(".city-order-pagination button").forEach((item) => item.classList.remove("active"));
    button.classList.add("active");
  }
  clearCityOrderSelection();
  renderCityOrderRows();
  showToast("已切换订单列表页码");
});

cityOrderPageJump.addEventListener("change", () => {
  const nextPage = Math.min(585, Math.max(1, Number(cityOrderPageJump.value) || 1));
  cityOrderPageJump.value = String(nextPage);
  clearCityOrderSelection();
  renderCityOrderRows();
  showToast(`已跳转至第 ${nextPage} 页`);
});

cityOrderLogToggle.addEventListener("click", () => {
  const willExpand = cityOrderLogList.hidden;
  cityOrderLogList.hidden = !willExpand;
  cityOrderLogToggle.setAttribute("aria-expanded", String(willExpand));
});

cityOrderBackButton.addEventListener("click", showCityOrderList);

cityOrderInvoiceBackButton.addEventListener("click", () => {
  showCityOrderList();
  cityOrderBatchInvoiceButton.focus();
});

cityOrderServiceButton.addEventListener("click", () => {
  showToast("已为您接入平台订单客服");
});

cityOrderPage.querySelectorAll(".order-help").forEach((button) => {
  button.addEventListener("click", () => {
    showToast(button.getAttribute("aria-label").replace("查看", "").replace("说明", "") + "：以平台结算结果为准");
  });
});

document.addEventListener(
  "click",
  (event) => {
    const navigationTarget = event.target.closest("[data-page], [data-tab], [data-nav]");
    if (!navigationTarget) return;
    const targetName = navigationTarget.dataset.page || navigationTarget.dataset.tab;
    if (targetName && targetName !== "订单管理") {
      closeOrderManagementPage();
    }
  },
  true
);

renderCityOrderRows();
