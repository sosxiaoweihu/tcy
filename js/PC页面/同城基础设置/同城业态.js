function openCityFormatPage(shouldAddTab = true) {
  if (shouldAddTab) addOrActivateTab("同城业态");
  leaveCustomTaskPage();
  document.body.classList.remove("unified-category-mode");
  unifiedCategorySidebar.hidden = true;
  tongchengPage.hidden = true;
  productPoolPage.hidden = true;
  cityOrderPage.hidden = true;
  customTaskPage.hidden = true;
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
  constructionPage.hidden = true;
  cityFormatPage.hidden = false;
  pageTabs.hidden = false;
  tongchengMenu.hidden = true;
  interfaceMenu.hidden = true;
  legacyMenu.hidden = true;
  document.querySelectorAll("#tongchengMenu [data-page]").forEach((button) => {
    button.classList.toggle("active", button.dataset.page === "同城业态");
  });
}

const cityFormatInvoiceModal = document.querySelector("#cityFormatInvoiceModal");
const cityFormatInvoiceForm = document.querySelector("#cityFormatInvoiceForm");
const cityFormatInvoiceName = document.querySelector("#cityFormatInvoiceName");
const cityFormatInvoiceClose = document.querySelector("#cityFormatInvoiceClose");
const cityFormatInvoiceCancel = document.querySelector("#cityFormatInvoiceCancel");
const cityFormatInvoiceBody = document.querySelector(".city-format-invoice-body");
const cityFormatInvoiceItemPanels = document.querySelector("#cityFormatInvoiceItemPanels");
const cityFormatInvoiceChannelInputs = Array.from(
  document.querySelectorAll("input[name='cityFormatInvoiceChannel']")
);

const cityFormatInvoiceChannelOptions = cityFormatInvoiceChannelInputs.map((input) => ({
  id: input.value,
  name: input.dataset.channelName
}));

const cityFormatInvoiceItemOptions = [
  { id: "packing-fee", name: "打包费金额", requiresCode: true },
  { id: "package-fee", name: "包装费金额", requiresCode: true },
  { id: "delivery-fee", name: "配送费金额", requiresCode: true }
];

const cityFormatInvoiceConfigs = new Map();
let cityFormatInvoiceDraft = { channels: [], items: {} };
let activeCityFormatInvoiceName = "";
let cityFormatInvoiceReturnFocus = null;

function createCityFormatInvoiceItemStates() {
  return Object.fromEntries(
    cityFormatInvoiceItemOptions.map((item) => [item.id, { enabled: false, code: "" }])
  );
}

function createCityFormatInvoiceConfig() {
  return { channels: [], items: {} };
}

function cloneCityFormatInvoiceConfig(config) {
  return JSON.parse(JSON.stringify(config));
}

function ensureCityFormatInvoiceChannelState(channelId) {
  if (!cityFormatInvoiceDraft.items[channelId]) {
    cityFormatInvoiceDraft.items[channelId] = createCityFormatInvoiceItemStates();
  }
  return cityFormatInvoiceDraft.items[channelId];
}

function createCityFormatInvoiceItemRow(channel, item) {
  const state = ensureCityFormatInvoiceChannelState(channel.id)[item.id];
  const row = document.createElement("div");
  const itemName = document.createElement("span");
  const toggle = document.createElement("label");
  const checkbox = document.createElement("input");
  const toggleText = document.createElement("span");
  const codeCell = document.createElement("div");

  row.className = "city-format-invoice-item-grid city-format-invoice-item-row";
  itemName.textContent = item.name;
  toggle.className = "city-format-invoice-item-toggle";
  checkbox.type = "checkbox";
  checkbox.checked = state.enabled;
  checkbox.dataset.cityFormatInvoiceItem = item.id;
  checkbox.dataset.channelId = channel.id;
  checkbox.setAttribute("aria-label", `${channel.name}${item.name}`);
  toggleText.textContent = "开票";
  toggle.append(checkbox, toggleText);
  codeCell.className = "city-format-invoice-item-code";
  if (item.requiresCode) {
    const codeInput = document.createElement("input");
    codeInput.type = "text";
    codeInput.value = state.code || "";
    codeInput.placeholder = "请输入商品编码";
    codeInput.disabled = !state.enabled;
    codeInput.required = state.enabled;
    codeInput.dataset.cityFormatInvoiceCode = item.id;
    codeInput.dataset.channelId = channel.id;
    codeInput.setAttribute("aria-label", `${channel.name}${item.name.replace(/金额$/, "")}商品编码`);
    codeCell.append(codeInput);
  } else {
    const notRequired = document.createElement("span");
    notRequired.className = "city-format-invoice-code-empty";
    notRequired.textContent = "—";
    codeCell.append(notRequired);
  }
  row.append(itemName, toggle, codeCell);
  return row;
}

function renderCityFormatInvoiceItems() {
  cityFormatInvoiceItemPanels.replaceChildren();

  if (cityFormatInvoiceDraft.channels.length === 0) {
    const empty = document.createElement("div");
    empty.className = "city-format-invoice-empty";
    empty.textContent = "请先勾选开通渠道";
    cityFormatInvoiceItemPanels.append(empty);
    return;
  }

  cityFormatInvoiceDraft.channels.forEach((channelId) => {
    const channel = cityFormatInvoiceChannelOptions.find((item) => item.id === channelId);
    if (!channel) return;

    const panel = document.createElement("article");
    const title = document.createElement("h4");
    const tableHead = document.createElement("div");
    title.textContent = channel.name;
    panel.className = "city-format-invoice-channel-panel";
    tableHead.className = "city-format-invoice-item-grid city-format-invoice-item-head";
    ["开票项", "是否开票", "商品编码"].forEach((text) => {
      const cell = document.createElement("span");
      cell.textContent = text;
      tableHead.append(cell);
    });
    panel.append(title, tableHead);
    cityFormatInvoiceItemOptions.forEach((item) => {
      panel.append(createCityFormatInvoiceItemRow(channel, item));
    });
    cityFormatInvoiceItemPanels.append(panel);
  });
}

function openCityFormatInvoiceModal(formatName, triggerButton) {
  const savedConfig = cityFormatInvoiceConfigs.get(formatName);
  activeCityFormatInvoiceName = formatName;
  cityFormatInvoiceReturnFocus = triggerButton;
  cityFormatInvoiceDraft = savedConfig
    ? cloneCityFormatInvoiceConfig(savedConfig)
    : createCityFormatInvoiceConfig();
  cityFormatInvoiceName.textContent = formatName;
  cityFormatInvoiceChannelInputs.forEach((input) => {
    input.checked = cityFormatInvoiceDraft.channels.includes(input.value);
  });
  renderCityFormatInvoiceItems();
  cityFormatInvoiceModal.classList.add("open");
  cityFormatInvoiceModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("city-format-invoice-open");
  cityFormatInvoiceBody.scrollTop = 0;
  cityFormatInvoiceClose.focus();
}

function closeCityFormatInvoiceModal() {
  if (!cityFormatInvoiceModal.classList.contains("open")) return;
  cityFormatInvoiceModal.classList.remove("open");
  cityFormatInvoiceModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("city-format-invoice-open");
  if (cityFormatInvoiceReturnFocus) cityFormatInvoiceReturnFocus.focus();
}

cityFormatInvoiceChannelInputs.forEach((input) => {
  input.addEventListener("change", () => {
    cityFormatInvoiceDraft.channels = cityFormatInvoiceChannelInputs
      .filter((channelInput) => channelInput.checked)
      .map((channelInput) => channelInput.value);
    cityFormatInvoiceDraft.channels.forEach(ensureCityFormatInvoiceChannelState);
    renderCityFormatInvoiceItems();
  });
});

cityFormatInvoiceItemPanels.addEventListener("change", (event) => {
  const checkbox = event.target.closest("[data-city-format-invoice-item]");
  if (!checkbox) return;
  const channelState = ensureCityFormatInvoiceChannelState(checkbox.dataset.channelId);
  const itemState = channelState[checkbox.dataset.cityFormatInvoiceItem];
  itemState.enabled = checkbox.checked;
  const codeInput = checkbox
    .closest(".city-format-invoice-item-row")
    .querySelector("[data-city-format-invoice-code]");
  if (!codeInput) return;
  codeInput.disabled = !checkbox.checked;
  codeInput.required = checkbox.checked;
  codeInput.setAttribute("aria-required", String(checkbox.checked));
  if (!checkbox.checked) codeInput.classList.remove("invalid");
});

cityFormatInvoiceItemPanels.addEventListener("input", (event) => {
  const codeInput = event.target.closest("[data-city-format-invoice-code]");
  if (!codeInput) return;
  const channelState = ensureCityFormatInvoiceChannelState(codeInput.dataset.channelId);
  channelState[codeInput.dataset.cityFormatInvoiceCode].code = codeInput.value;
  codeInput.classList.remove("invalid");
});

cityFormatInvoiceForm.addEventListener("submit", (event) => {
  event.preventDefault();
  if (cityFormatInvoiceDraft.channels.length === 0) {
    showToast("请至少勾选一个开通渠道");
    cityFormatInvoiceChannelInputs[0].focus();
    return;
  }

  for (const channelId of cityFormatInvoiceDraft.channels) {
    const channel = cityFormatInvoiceChannelOptions.find((option) => option.id === channelId);
    const channelState = ensureCityFormatInvoiceChannelState(channelId);
    for (const item of cityFormatInvoiceItemOptions.filter((option) => option.requiresCode)) {
      const itemState = channelState[item.id];
      const code = (itemState.code || "").trim();
      itemState.code = code;
      if (!itemState.enabled || code) continue;
      const codeInput = cityFormatInvoiceItemPanels.querySelector(
        `[data-city-format-invoice-code="${item.id}"][data-channel-id="${channelId}"]`
      );
      codeInput.classList.add("invalid");
      codeInput.focus();
      showToast(`请填写${channel.name}${item.name.replace(/金额$/, "")}商品编码`);
      return;
    }
  }

  cityFormatInvoiceConfigs.set(
    activeCityFormatInvoiceName,
    cloneCityFormatInvoiceConfig(cityFormatInvoiceDraft)
  );
  const savedFormatName = activeCityFormatInvoiceName;
  closeCityFormatInvoiceModal();
  showToast(`${savedFormatName}开票配置已保存`);
});

cityFormatInvoiceClose.addEventListener("click", closeCityFormatInvoiceModal);
cityFormatInvoiceCancel.addEventListener("click", closeCityFormatInvoiceModal);
cityFormatInvoiceModal.addEventListener("click", (event) => {
  if (event.target === cityFormatInvoiceModal) closeCityFormatInvoiceModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCityFormatInvoiceModal();
});

cityFormatPage.addEventListener("click", (event) => {
  const actionButton = event.target.closest("[data-city-format-action]");
  if (!actionButton) return;
  const action = actionButton.dataset.cityFormatAction;
  const formatName = actionButton.dataset.cityFormatName;
  if (action === "配置") {
    openCityFormatInvoiceModal(formatName, actionButton);
    return;
  }
  showToast(formatName ? `已打开${formatName}的${action}操作` : "已打开新增业态操作");
});
