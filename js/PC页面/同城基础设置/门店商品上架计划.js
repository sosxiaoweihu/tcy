const storeShelfPlanPanel = document.querySelector("#storeShelfPlanPanel");
const storeShelfPlanBusiness = document.querySelector("#storeShelfPlanBusiness");
const storeShelfPlanFilters = document.querySelector("#storeShelfPlanFilters");
const storeShelfPlanTableBody = document.querySelector("#storeShelfPlanTableBody");
const storeShelfPlanEditor = document.querySelector("#storeShelfPlanEditor");
const storeShelfPlanEditorForm = document.querySelector("#storeShelfPlanEditorForm");
const storeShelfPlanConfirm = document.querySelector("#storeShelfPlanConfirm");
const storeShelfPlanBatchMenu = document.querySelector("#storeShelfPlanBatchMenu");
const storeShelfPlanBatchToggle = document.querySelector("#storeShelfPlanBatchToggle");

// 使用截图中完整可见的五条样例；这些历史计划不代表实时商品状态。
const storeShelfPlanProducts = [
  { id: "123004", name: "金家福素丸子500g", spu: "1777638778077380656", sku: "1777638778081820704", erp: "123004", barcode: "2800001230042", specification: "份(500克(g)/份)", photoY: -173.6 },
  { id: "93364", name: "金盛福酱香饼500g", spu: "1777637134669627453", sku: "1777637134673629192", erp: "93364", barcode: "2800000933647", specification: "500g/份(500克(g)/份)", photoY: -244.3 },
  { id: "122544", name: "金家福煎饼(个)", spu: "1777638825842085969", sku: "1777638825842167829", erp: "122544", barcode: "2800001225444", specification: "个(300克(g)/个)", photoY: -315 },
  { id: "93692", name: "金家福椒盐烧饼(个)", spu: "1777637090503315513", sku: "1777637090511986784", erp: "93692", barcode: "2800000936921", specification: "个(100克(g)/个)", photoY: -386.4 },
  { id: "122595", name: "金家福肉包子(个)", spu: "1777638831714152524", sku: "1777638831714193480", erp: "122595", barcode: "2800001225956", specification: "个(100克(g)/个)", photoY: -456.4 }
];

cityFormatPage.querySelectorAll(".city-format-table tbody tr").forEach((row, index) => {
  const label = document.createElement("label");
  const input = document.createElement("input");
  input.type = "radio";
  input.name = "storeShelfPlanBusiness";
  input.value = row.cells[0].textContent.trim();
  input.checked = index === 0;
  label.append(input, document.createTextNode(row.cells[1].textContent.trim()));
  storeShelfPlanBusiness.append(label);
});

// 沿用现有门店字典，避免另造门店名称。
const storeShelfPlanStores = Array.from(document.querySelectorAll("#absenceStoreFilter option"))
  .filter((option) => option.value)
  .map((option) => option.textContent.trim());
["storeShelfPlanStoreFilter", "storeShelfPlanEditorStore"].forEach((id) => {
  const select = document.getElementById(id);
  storeShelfPlanStores.forEach((name) => select.add(new Option(name, name)));
});
storeShelfPlanProducts.forEach((product) => {
  storeShelfPlanEditorForm.elements.productId.add(new Option(product.name, product.id));
});

function getStoreShelfPlanBusiness() {
  return storeShelfPlanBusiness.querySelector("input:checked")?.value || "";
}

let storeShelfPlans = storeShelfPlanProducts.map((product, index) => ({
  id: index + 1,
  business: getStoreShelfPlanBusiness(),
  productId: product.id,
  quantity: 0,
  startDate: "2023-01-04",
  endDate: "2024-12-31",
  startTime: "09:00",
  endTime: "20:00",
  store: "",
  status: "disabled"
}));
let storeShelfPlanNextId = storeShelfPlans.length + 1;
let storeShelfPlanAppliedFilters = {};
let storeShelfPlanPageNumber = 1;
const storeShelfPlanPageSize = 5;
let storeShelfPlanFiltersExpanded = false;
let storeShelfPlanEditingId = null;
let storeShelfPlanPendingAction = null;

function storeShelfPlanEscape(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
}

function storeShelfPlanProduct(plan) {
  return storeShelfPlanProducts.find((product) => product.id === plan.productId);
}

function storeShelfPlanDateRange(plan) {
  return `${plan.startDate.replaceAll("-", ".")} – ${plan.endDate.replaceAll("-", ".")}`;
}

function storeShelfPlanCodeMatches(code, filter) {
  const values = String(filter || "").split(/[,，;；\s]+/).filter(Boolean);
  return !values.length || values.includes(code);
}

function getFilteredStoreShelfPlans() {
  const filters = storeShelfPlanAppliedFilters;
  return storeShelfPlans.filter((plan) => {
    const product = storeShelfPlanProduct(plan);
    return plan.business === getStoreShelfPlanBusiness()
      && product.name.toLowerCase().includes((filters.productName || "").trim().toLowerCase())
      && ["spu", "sku", "erp", "barcode"].every((key) => storeShelfPlanCodeMatches(product[key], filters[key]))
      && (!filters.status || plan.status === filters.status)
      && (!filters.store || !plan.store || plan.store === filters.store);
  });
}

function renderStoreShelfPlans() {
  const records = getFilteredStoreShelfPlans();
  const totalPages = Math.max(1, Math.ceil(records.length / storeShelfPlanPageSize));
  storeShelfPlanPageNumber = Math.min(storeShelfPlanPageNumber, totalPages);
  const start = (storeShelfPlanPageNumber - 1) * storeShelfPlanPageSize;
  storeShelfPlanTableBody.innerHTML = records.slice(start, start + storeShelfPlanPageSize).map((plan, index) => {
    const product = storeShelfPlanProduct(plan);
    const escape = storeShelfPlanEscape;
    return `<tr data-store-plan-id="${plan.id}">
      <td>${start + index + 1}</td>
      <td><div class="store-shelf-plan-product"><span class="store-shelf-plan-product-image" role="img" aria-label="${escape(product.name)}" style="--store-plan-photo-y: ${product.photoY}px"></span><div><strong>${escape(product.name)}</strong><small>SPU：${product.spu}</small></div></div></td>
      <td>${escape(product.specification)}<small>SKU：${product.sku}</small><small>ERP编码：${product.erp}</small><small>线下商品条码：${product.barcode}</small></td>
      <td>${plan.quantity}</td><td>${storeShelfPlanDateRange(plan)}</td><td>${plan.startTime} – ${plan.endTime}</td><td>${escape(plan.store || "全部门店")}</td>
      <td><select data-store-plan-status="${plan.id}" data-status="${plan.status}" aria-label="${escape(product.name)}计划状态"><option value="disabled" ${plan.status === "disabled" ? "selected" : ""}>禁用</option><option value="enabled" ${plan.status === "enabled" ? "selected" : ""}>启用</option></select></td>
      <td><div class="store-shelf-plan-row-actions"><button class="link-button" type="button" data-store-plan-action="edit">修改</button><button class="link-button store-shelf-plan-danger" type="button" data-store-plan-action="delete">删除</button><button class="link-button" type="button" data-store-plan-action="detail">查看门店商品状态</button></div></td>
    </tr>`;
  }).join("");
  document.querySelector("#storeShelfPlanEmpty").hidden = records.length > 0;
  document.querySelector("#storeShelfPlanTotal").textContent = `共 ${records.length} 条`;
  const pagination = document.querySelector("#storeShelfPlanPagination");
  pagination.innerHTML = `<button type="button" data-store-plan-page="${storeShelfPlanPageNumber - 1}" aria-label="上一页" ${storeShelfPlanPageNumber === 1 ? "disabled" : ""}>‹</button>`
    + Array.from({ length: totalPages }, (_, index) => `<button type="button" data-store-plan-page="${index + 1}" ${index + 1 === storeShelfPlanPageNumber ? 'class="active" aria-current="page"' : ""}>${index + 1}</button>`).join("")
    + `<button type="button" data-store-plan-page="${storeShelfPlanPageNumber + 1}" aria-label="下一页" ${storeShelfPlanPageNumber === totalPages ? "disabled" : ""}>›</button>`;
  const jump = document.querySelector("#storeShelfPlanPageJump");
  jump.value = storeShelfPlanPageNumber;
  jump.max = totalPages;
}

function syncStoreShelfPlanFilterLayout() {
  const width = storeShelfPlanFilters.clientWidth;
  if (!width) return;
  const columns = Math.min(4, Math.max(1, Math.floor((width - 228) / 260)));
  storeShelfPlanFilters.style.setProperty("--store-plan-filter-cols", columns);
  storeShelfPlanFilters.querySelectorAll("[data-store-plan-filter]").forEach((field, index) => {
    field.hidden = !storeShelfPlanFiltersExpanded && index >= columns;
  });
  const toggle = document.querySelector("#storeShelfPlanFilterToggle");
  toggle.setAttribute("aria-expanded", String(storeShelfPlanFiltersExpanded));
  toggle.innerHTML = storeShelfPlanFiltersExpanded ? '收起 <span aria-hidden="true">⌃</span>' : '展开 <span aria-hidden="true">⌄</span>';
}

new ResizeObserver(syncStoreShelfPlanFilterLayout).observe(storeShelfPlanFilters);
document.querySelector("#storeShelfPlanFilterToggle").addEventListener("click", () => {
  storeShelfPlanFiltersExpanded = !storeShelfPlanFiltersExpanded;
  syncStoreShelfPlanFilterLayout();
});

storeShelfPlanFilters.addEventListener("submit", (event) => {
  event.preventDefault();
  storeShelfPlanAppliedFilters = Object.fromEntries(new FormData(storeShelfPlanFilters));
  storeShelfPlanPageNumber = 1;
  renderStoreShelfPlans();
  showToast(`已查询到 ${getFilteredStoreShelfPlans().length} 条门店商品上架计划`);
});

document.querySelector("#storeShelfPlanReset").addEventListener("click", () => {
  storeShelfPlanFilters.reset();
  storeShelfPlanBusiness.querySelector("input").checked = true;
  storeShelfPlanAppliedFilters = {};
  storeShelfPlanPageNumber = 1;
  renderStoreShelfPlans();
  showToast("已重置筛选条件");
});

storeShelfPlanBusiness.addEventListener("change", () => {
  storeShelfPlanPageNumber = 1;
  renderStoreShelfPlans();
});

function closeStoreShelfPlanBatchMenu() {
  storeShelfPlanBatchMenu.hidden = true;
  storeShelfPlanBatchToggle.setAttribute("aria-expanded", "false");
}

storeShelfPlanBatchToggle.addEventListener("click", () => {
  storeShelfPlanBatchMenu.hidden = !storeShelfPlanBatchMenu.hidden;
  storeShelfPlanBatchToggle.setAttribute("aria-expanded", String(!storeShelfPlanBatchMenu.hidden));
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".store-shelf-plan-batch")) closeStoreShelfPlanBatchMenu();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeStoreShelfPlanBatchMenu();
});

function confirmStoreShelfPlanAction(title, message, action) {
  document.querySelector("#storeShelfPlanConfirmTitle").textContent = title;
  document.querySelector("#storeShelfPlanConfirmMessage").textContent = message;
  storeShelfPlanPendingAction = action;
  storeShelfPlanConfirm.showModal();
}

document.querySelector("#storeShelfPlanConfirmAction").addEventListener("click", () => {
  const action = storeShelfPlanPendingAction;
  storeShelfPlanConfirm.close();
  if (action) action();
});
storeShelfPlanConfirm.addEventListener("close", () => { storeShelfPlanPendingAction = null; });

storeShelfPlanBatchMenu.addEventListener("click", (event) => {
  const button = event.target.closest("[data-store-plan-batch]");
  if (!button) return;
  closeStoreShelfPlanBatchMenu();
  const records = getFilteredStoreShelfPlans();
  if (!records.length) return showToast("当前没有可操作的计划");
  const action = button.dataset.storePlanBatch;
  const actionName = action === "delete" ? "删除" : action === "enabled" ? "启用" : "禁用";
  const ids = new Set(records.map((plan) => plan.id));
  confirmStoreShelfPlanAction(`批量${actionName}`, `将${actionName}当前业态查询结果中的全部 ${records.length} 条计划（包含其他分页）。此操作仅修改原型数据，是否确认？`, () => {
    if (action === "delete") storeShelfPlans = storeShelfPlans.filter((plan) => !ids.has(plan.id));
    else storeShelfPlans.forEach((plan) => { if (ids.has(plan.id)) plan.status = action; });
    renderStoreShelfPlans();
    showToast(`已${actionName} ${ids.size} 条计划（原型演示）`);
  });
});

function openStoreShelfPlanEditor(plan = null) {
  storeShelfPlanEditingId = plan?.id || null;
  storeShelfPlanEditorForm.reset();
  storeShelfPlanEditorForm.elements.endDate.setCustomValidity("");
  document.querySelector("#storeShelfPlanEditorTitle").textContent = plan ? "修改计划" : "添加计划";
  if (plan) {
    ["productId", "quantity", "startDate", "endDate", "startTime", "endTime", "store", "status"].forEach((key) => {
      storeShelfPlanEditorForm.elements[key].value = plan[key];
    });
  }
  storeShelfPlanEditor.showModal();
}

document.querySelector("#storeShelfPlanAdd").addEventListener("click", () => openStoreShelfPlanEditor());
storeShelfPlanEditorForm.addEventListener("input", () => storeShelfPlanEditorForm.elements.endDate.setCustomValidity(""));
storeShelfPlanEditorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const values = Object.fromEntries(new FormData(storeShelfPlanEditorForm));
  if (values.endDate < values.startDate) {
    storeShelfPlanEditorForm.elements.endDate.setCustomValidity("结束日期不能早于开始日期");
    storeShelfPlanEditorForm.elements.endDate.reportValidity();
    return;
  }
  const plan = { ...values, quantity: Number(values.quantity), business: getStoreShelfPlanBusiness() };
  if (storeShelfPlanEditingId) {
    const existing = storeShelfPlans.find((item) => item.id === storeShelfPlanEditingId);
    Object.assign(existing, plan);
  } else {
    storeShelfPlans.unshift({ ...plan, id: storeShelfPlanNextId++ });
    storeShelfPlanFilters.reset();
    storeShelfPlanAppliedFilters = {};
    storeShelfPlanPageNumber = 1;
  }
  storeShelfPlanEditor.close();
  renderStoreShelfPlans();
  showToast("门店商品上架计划已提交（原型演示）");
});

storeShelfPlanTableBody.addEventListener("click", (event) => {
  const button = event.target.closest("[data-store-plan-action]");
  if (!button) return;
  const plan = storeShelfPlans.find((item) => item.id === Number(button.closest("tr").dataset.storePlanId));
  const product = storeShelfPlanProduct(plan);
  if (button.dataset.storePlanAction === "edit") return openStoreShelfPlanEditor(plan);
  if (button.dataset.storePlanAction === "delete") {
    confirmStoreShelfPlanAction("删除计划", `确认删除“${product.name}”的门店商品上架计划？此操作仅修改原型数据。`, () => {
      storeShelfPlans = storeShelfPlans.filter((item) => item.id !== plan.id);
      renderStoreShelfPlans();
      showToast("已删除计划（原型演示）");
    });
    return;
  }
  const details = [["商品名称", product.name], ["门店", plan.store || "全部门店"], ["计划状态", plan.status === "enabled" ? "启用" : "禁用"], ["上架数量", plan.quantity], ["开始结束时间", storeShelfPlanDateRange(plan)], ["上架时间", `${plan.startTime} – ${plan.endTime}`]];
  document.querySelector("#storeShelfPlanDetails").innerHTML = details.map(([key, value]) => `<dt>${key}</dt><dd>${storeShelfPlanEscape(value)}</dd>`).join("");
  document.querySelector("#storeShelfPlanDetail").showModal();
});

storeShelfPlanTableBody.addEventListener("change", (event) => {
  const select = event.target.closest("[data-store-plan-status]");
  if (!select) return;
  const plan = storeShelfPlans.find((item) => item.id === Number(select.dataset.storePlanStatus));
  plan.status = select.value;
  renderStoreShelfPlans();
  showToast(`计划已${plan.status === "enabled" ? "启用" : "禁用"}（原型演示）`);
});

storeShelfPlanPanel.querySelectorAll("[data-store-plan-close]").forEach((button) => {
  button.addEventListener("click", () => document.getElementById(button.dataset.storePlanClose).close());
});

document.querySelector("#storeShelfPlanPagination").addEventListener("click", (event) => {
  const button = event.target.closest("[data-store-plan-page]");
  if (!button || button.disabled) return;
  storeShelfPlanPageNumber = Number(button.dataset.storePlanPage);
  renderStoreShelfPlans();
});
document.querySelector("#storeShelfPlanPageJump").addEventListener("change", (event) => {
  storeShelfPlanPageNumber = Math.max(1, Math.floor(Number(event.target.value) || 1));
  renderStoreShelfPlans();
});

document.querySelector("#storeShelfPlanExport").addEventListener("click", () => {
  const records = getFilteredStoreShelfPlans();
  if (!records.length) return showToast("暂无可导出的计划");
  const rows = [["序号", "商品名称", "SPU", "规格信息", "SKU", "ERP编码", "线下商品条码", "上架数量", "开始结束时间", "上架时间", "门店", "状态"]];
  records.forEach((plan, index) => {
    const product = storeShelfPlanProduct(plan);
    rows.push([index + 1, product.name, product.spu, product.specification, product.sku, product.erp, product.barcode, plan.quantity, storeShelfPlanDateRange(plan), `${plan.startTime} – ${plan.endTime}`, plan.store || "全部门店", plan.status === "enabled" ? "启用" : "禁用"]);
  });
  const csv = rows.map((row) => row.map((value) => {
    let text = String(value);
    if (/^[=+\-@\t\r]/.test(text) || /^\d{15,}$/.test(text)) text = "'" + text;
    return '"' + text.replaceAll('"', '""') + '"';
  }).join(",")).join("\r\n");
  const url = URL.createObjectURL(new Blob(["\ufeff", csv], { type: "text/csv;charset=utf-8;" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = "门店商品上架计划.csv";
  document.body.append(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  showToast(`已导出 ${records.length} 条计划`);
});

renderStoreShelfPlans();
