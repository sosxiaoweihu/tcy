const productRecordItems = [
  {
    id: "1687593370453573",
    barcode: "697854696546",
    code: "453573",
    name: "清风组合品",
    category: "居家清洁",
    visual: "tissue",
    issues: ["main", "special", "attribute", "detail"]
  },
  {
    id: "1684197806261061",
    barcode: "23098790000012",
    code: "261061",
    name: "北京同仁堂内廷上用 甄选级燕盏蜜盖100g/盒",
    category: "营养冲调",
    visual: "tonic",
    issues: ["main", "special", "attribute"]
  },
  {
    id: "1684191207917445",
    barcode: "232866100000",
    code: "917445",
    name: "紫菜苔 250g±25g/份",
    category: "蔬菜菌菇",
    visual: "vegetable",
    issues: ["main", "attribute", "detail"]
  },
  {
    id: "1683629820954181",
    barcode: "6944043824497",
    code: "954181",
    name: "杏花楼杏月呈祥(龙祥) 480g/盒",
    category: "休闲食品",
    visual: "mooncake-red",
    issues: ["main", "special", "attribute", "detail"]
  },
  {
    id: "1683625229223813",
    barcode: "6944043824510",
    code: "223813",
    name: "杏花楼杏福礼月（龙祥）810g/盒",
    category: "休闲食品",
    visual: "mooncake-lady",
    issues: ["main", "special", "attribute"]
  },
  {
    id: "1683419085927746",
    barcode: "6907992501076",
    code: "927746",
    name: "蒙牛纯牛奶 250ml×24盒",
    category: "乳品奶酪",
    visual: "milk",
    issues: ["main", "special", "detail"]
  }
];

// 与“同城业态”配置中的演示数据保持一致；单业态时切换入口自动禁用。
const productRecordBusinessFormats = ["大卖场", "恺源"];
let activeProductRecordBusinessFormat = productRecordBusinessFormats[0] || "暂无业态";
let activeProductRecordIssue = "main";
let activeProductRecordCategory = "全部商品";
let activeProductRecordItem = null;
let activeProductRecordAttributeChannel = "美团";
let activeProductRecordAttributeKey = "";
// 主图仅保存在本次原型会话中，按商品隔离；不会上传到外部服务。
const productRecordMainImageUploads = new Map();
const productRecordDetailImageUploads = new Map();
const productRecordRemovedDefaultMainImages = new Set();
const productRecordFabricCompositions = new Map();
const productRecordAlcoholValues = new Map();
let productRecordFabricDraft = [];
// 截图中的演示品牌；保留当前值，不接入外部品牌服务。
const productRecordBrandOptions = ["杏花楼", "全福月饼", "开县冰薄月饼", "华美月饼", "冉嘉月饼", "君缘月饼", "美心月饼", "金九月饼"];
const productRecordCategoryOptions = ["其他", "滇式月饼", "徽式月饼", "衢式月饼", "京式月饼", "广式月饼", "秦式月饼", "冰淇淋月饼", "台式月饼", "苏式月饼", "港式月饼", "潮式月饼", "冰皮月饼"];
let productRecordCategoryDraft = new Set();
const productRecordCreatableConfigs = {
  taste: { label: "口味", createLabel: "＋新建口味", options: ["脆爽清甜", "脆爽甘甜", "脆爽酸甜", "软糯清甜", "软糯甘甜", "软糯酸甜"] },
  fruitVariety: { label: "水果品种", createLabel: "＋新建水果品种", options: ["观么冬桃", "镇宁水蜜桃", "镇远猕猴桃", "青州蜜桃", "鹰嘴桃", "黑桃"] }
};
let activeProductRecordCreatableKey = "";

const productRecordAttributeDefinitions = [
  { key: "print", label: "是否印花", required: true, recommended: "无印花", placeholder: "请选择" },
  { key: "material", label: "原材料成分", required: true, recommended: "草浆,混浆,木浆", placeholder: "请完善" },
  { key: "fabric", label: "面料成份", required: true, recommended: "", placeholder: "请选择", channel: "美团", editor: "fabric" },
  { key: "layers", label: "层数", required: true, recommended: "3层", placeholder: "请选择" },
  { key: "scene", label: "适用场景", required: true, recommended: "家用,通用", placeholder: "请选择" },
  { key: "brand", label: "品牌", required: true, recommended: "清风", placeholder: "请选择" },
  { key: "origin", label: "国产/进口", required: true, recommended: "国产", placeholder: "请选择" },
  { key: "category", label: "商品类别", required: true, recommended: "其他", placeholder: "请选择" },
  { key: "alcohol", label: "酒精度", required: true, recommended: "", placeholder: "请完善", channel: "美团", editor: "alcohol" },
  { key: "scent", label: "是否有香味", required: true, recommended: "无香型", placeholder: "请选择" },
  { key: "rollWeight", label: "单卷克重(g/卷)", required: false, recommended: "", placeholder: "请完善" },
  { key: "rollCount", label: "卷数", required: false, recommended: "", placeholder: "请完善" },
  { key: "standard", label: "生产执行标准", required: false, recommended: "", placeholder: "请选择" },
  { key: "flushable", label: "是否可冲散", required: false, recommended: "", placeholder: "请选择" },
  { key: "brand", label: "品牌", required: true, recommended: "其它", placeholder: "请选择", channel: "抖店" },
  { key: "taste", label: "口味", required: false, recommended: "", placeholder: "请选择口味", channel: "抖店", editor: "creatable-select" },
  { key: "quantity", label: "个数", required: false, recommended: "", placeholder: "请输入个数", channel: "抖店" },
  { key: "saleMethod", label: "售卖方式", required: false, recommended: "", placeholder: "请选择售卖方式", channel: "抖店" },
  { key: "qualityCertification", label: "品质认证", required: false, recommended: "", placeholder: "请选择品质认证", channel: "抖店" },
  { key: "hotTime", label: "热卖时间", required: false, recommended: "", placeholder: "请选择热卖时间", channel: "抖店" },
  { key: "fruitVariety", label: "水果品种", required: true, recommended: "", placeholder: "请选择水果品种", channel: "抖店", editor: "creatable-select" }
];

function getProductRecordAttributeDefinitions(channel = activeProductRecordAttributeChannel) {
  if (channel === "抖店") return productRecordAttributeDefinitions.filter((field) => field.channel === "抖店");
  return productRecordAttributeDefinitions.filter((field) => !field.channel || field.channel === channel);
}

const productRecordAttributeValues = {
  美团: Object.fromEntries(getProductRecordAttributeDefinitions("美团").map((field) => [field.key, field.recommended])),
  淘宝: Object.fromEntries(getProductRecordAttributeDefinitions("淘宝").map((field) => [field.key, field.recommended])),
  抖店: Object.fromEntries(getProductRecordAttributeDefinitions("抖店").map((field) => [field.key, field.recommended]))
};

function escapeProductRecordText(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderProductRecordFormatOptions() {
  productRecordFormatList.innerHTML = productRecordBusinessFormats.map((format) => {
    const selected = format === activeProductRecordBusinessFormat;
    return `<li><button class="product-record-format-option${selected ? " selected" : ""}" type="button" data-product-record-format="${escapeProductRecordText(format)}" aria-pressed="${selected}"><span>${escapeProductRecordText(format)}</span><i aria-hidden="true"></i></button></li>`;
  }).join("");
}

function syncProductRecordFormatSwitcher() {
  const canSwitch = productRecordBusinessFormats.length > 1;
  productRecordFormatName.textContent = activeProductRecordBusinessFormat;
  productRecordFormatAction.textContent = canSwitch ? "切换" : "当前";
  productRecordFormatTrigger.disabled = !canSwitch;
  productRecordFormatTrigger.dataset.switchable = String(canSwitch);
  productRecordFormatTrigger.setAttribute("aria-label", canSwitch
    ? `当前业态${activeProductRecordBusinessFormat}，点击切换`
    : `当前业态${activeProductRecordBusinessFormat}`);
}

function openProductRecordFormatSheet() {
  if (productRecordBusinessFormats.length < 2) return;
  renderProductRecordFormatOptions();
  productRecordFormatSheet.hidden = false;
  productRecordFormatTrigger.setAttribute("aria-expanded", "true");
  productRecordFormatClose.focus();
}

function closeProductRecordFormatSheet(restoreFocus = true) {
  productRecordFormatSheet.hidden = true;
  productRecordFormatTrigger.setAttribute("aria-expanded", "false");
  if (restoreFocus) productRecordFormatTrigger.focus();
}

function selectProductRecordBusinessFormat(format) {
  if (!productRecordBusinessFormats.includes(format)) return;
  const changed = format !== activeProductRecordBusinessFormat;
  activeProductRecordBusinessFormat = format;
  syncProductRecordFormatSwitcher();
  closeProductRecordFormatSheet();
  if (!changed) return;
  renderProductRecordList();
  productRecordList.scrollTop = 0;
  showToast(`已切换至${format}`);
}

function getProductRecordThumb(item) {
  const content = {
    tissue: "<i>清风</i><b>原木纯品</b><em>组合装</em>",
    tonic: "<i>北京同仁堂</i><b>燕盏蜜盖</b>",
    vegetable: "<i>🥬</i>",
    "mooncake-red": "<i>杏花楼</i><b>月</b>",
    "mooncake-lady": "<i>月</i><b>杏福礼月</b>",
    milk: "<i>蒙牛<br>纯牛奶</i>"
  }[item.visual] || "";
  return `<span class="product-record-thumb ${item.visual}" aria-hidden="true">${content}</span>`;
}

function getVisibleProductRecords() {
  const keyword = productRecordSearch.value.trim().toLowerCase();
  return productRecordItems.filter((item) => {
    const matchesIssue = item.issues.includes(activeProductRecordIssue);
    const matchesCategory = activeProductRecordCategory === "全部商品" || item.category === activeProductRecordCategory;
    const searchText = `${item.name} ${item.id} ${item.barcode}`.toLowerCase();
    return matchesIssue && matchesCategory && (!keyword || searchText.includes(keyword));
  });
}

function renderProductRecordList() {
  const visibleItems = getVisibleProductRecords();
  if (visibleItems.length === 0) {
    productRecordList.innerHTML = '<div class="product-record-empty">当前条件下暂无待完善商品</div>';
    return;
  }

  productRecordList.innerHTML = visibleItems.map((item) => `
    <article class="product-record-card">
      ${getProductRecordThumb(item)}
      <div class="product-record-copy">
        <h2>${escapeProductRecordText(item.name)}</h2>
        <p>商品ID：${escapeProductRecordText(item.id)}</p>
        <p>条码：${escapeProductRecordText(item.barcode)}</p>
      </div>
      <button class="product-record-complete" type="button" data-product-record-product="${escapeProductRecordText(item.id)}">去完善</button>
    </article>
  `).join("");
}

function syncProductRecordNavigation() {
  document.querySelectorAll("[data-product-record-issue]").forEach((button) => {
    button.classList.toggle("active", button.dataset.productRecordIssue === activeProductRecordIssue);
  });
  document.querySelectorAll("[data-product-record-category]").forEach((button) => {
    button.classList.toggle("active", button.dataset.productRecordCategory === activeProductRecordCategory);
  });
}

function openProductRecordPage() {
  tongchengAppScreen.hidden = true;
  openRetailUnionApp.hidden = true;
  closeRetailUnionApp.hidden = true;
  openThirdPartyOrder.hidden = true;
  openImMessage.hidden = true;
  openProductRecord.hidden = true;
  thirdPartyOrderPage.hidden = true;
  thirdPartyPhotoPage.hidden = true;
  imAppPage.hidden = true;
  productRecordPage.hidden = false;
  productRecordDetailView.hidden = true;
  closeProductRecordFormatSheet(false);
  activeProductRecordIssue = "main";
  activeProductRecordCategory = "全部商品";
  productRecordSearch.value = "";
  syncProductRecordFormatSwitcher();
  syncProductRecordNavigation();
  renderProductRecordList();
  productRecordList.scrollTop = 0;
  document.querySelector(".product-record-categories").scrollTop = 0;
  document.querySelector(".product-record-tabs").scrollLeft = 0;
}

openProductRecord.addEventListener("click", openProductRecordPage);
productRecordBack.addEventListener("click", () => {
  closeProductRecordFormatSheet(false);
  setRetailUnionAppOpen(true);
});
productRecordFormatTrigger.addEventListener("click", openProductRecordFormatSheet);
productRecordFormatBackdrop.addEventListener("click", () => closeProductRecordFormatSheet());
productRecordFormatClose.addEventListener("click", () => closeProductRecordFormatSheet());
productRecordFormatList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-record-format]");
  if (!button || productRecordFormatSheet.hidden) return;
  selectProductRecordBusinessFormat(button.dataset.productRecordFormat);
});
productRecordFormatSheet.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  event.preventDefault();
  closeProductRecordFormatSheet();
});
productRecordSearch.addEventListener("input", renderProductRecordList);

document.querySelector(".product-record-tabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-record-issue]");
  if (!button) return;
  activeProductRecordIssue = button.dataset.productRecordIssue;
  syncProductRecordNavigation();
  renderProductRecordList();
  productRecordList.scrollTop = 0;
  button.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
});

document.querySelector(".product-record-categories").addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-record-category]");
  if (!button) return;
  activeProductRecordCategory = button.dataset.productRecordCategory;
  syncProductRecordNavigation();
  renderProductRecordList();
  productRecordList.scrollTop = 0;
});

productRecordList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-record-product]");
  if (!button) return;
  const item = productRecordItems.find((product) => product.id === button.dataset.productRecordProduct);
  if (!item) return;
  openProductRecordDetail(item);
});

productRecordScan.addEventListener("click", () => {
  showToast("扫码查询功能演示");
  productRecordSearch.focus();
});

function resetProductRecordUploadTile(input) {
  const tile = input.closest(".product-record-upload-tile");
  const preview = tile.querySelector("img");
  if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
  input.value = "";
  preview.removeAttribute("src");
  preview.removeAttribute("data-object-url");
  preview.hidden = true;
  tile.classList.remove("uploaded");
  tile.closest(".product-record-special-field").classList.remove("complete");
}

function resetProductRecordDetail() {
  closeProductRecordFabricSheet(false);
  closeProductRecordBrandSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFruitVarietySheet(false);
  resetProductRecordUploadTile(productRecordMeituanImageInput);
  resetProductRecordUploadTile(productRecordTaobaoImageInput);
  productRecordTaobaoExistingImage.hidden = false;
  productRecordAttributeEditor.hidden = true;
  productRecordAttributeInputSheet.hidden = true;
  document.querySelectorAll(".product-record-attribute-values").forEach((section) => {
    section.classList.remove("collapsed");
    const button = section.querySelector("[data-product-record-attribute-toggle]");
    button.innerHTML = "收起更多 <i></i>";
    button.setAttribute("aria-expanded", "true");
  });
}

function renderProductRecordMainImages(item) {
  const uploads = productRecordMainImageUploads.get(item.id) || [];
  productRecordMainImages.innerHTML = `
    ${productRecordRemovedDefaultMainImages.has(item.id) ? "" : `
      <div class="product-record-existing-image product-record-main-image product-record-default-image" role="img" aria-label="${escapeProductRecordText(item.name)}商品主图">
        ${getProductRecordThumb(item)}
        <button type="button" data-product-record-remove-main-default aria-label="删除默认商品主图">×</button>
      </div>
    `}
    ${uploads.map((image, index) => `
      <div class="product-record-existing-image product-record-main-image">
        <img src="${escapeProductRecordText(image.url)}" alt="${escapeProductRecordText(item.name)}主图${index + 2}" />
        <button type="button" data-product-record-remove-main="${index}" aria-label="删除主图${index + 2}">×</button>
      </div>
    `).join("")}
    <label class="product-record-upload-tile" aria-label="上传商品主图">
      <input type="file" accept="image/*" multiple data-product-record-main-input aria-label="上传商品主图" hidden />
      <span>＋</span><em>上传</em>
    </label>
  `;
}

function renderProductRecordDetailImages(item) {
  const uploads = productRecordDetailImageUploads.get(item.id) || [];
  productRecordDetailImages.innerHTML = `
    ${uploads.map((image, index) => `
      <div class="product-record-existing-image product-record-detail-image">
        <img src="${escapeProductRecordText(image.url)}" alt="${escapeProductRecordText(item.name)}详情图${index + 1}" />
        <button type="button" data-product-record-remove-detail="${index}" aria-label="删除详情图${index + 1}">×</button>
      </div>
    `).join("")}
    <label class="product-record-upload-tile" aria-label="上传商品详情图">
      <input type="file" accept="image/*" multiple data-product-record-detail-input aria-label="上传商品详情图" hidden />
      <span>＋</span><em>上传</em>
    </label>
  `;
}

function handleProductRecordMainImageUpload(input) {
  const files = Array.from(input.files || []);
  input.value = "";
  if (!activeProductRecordItem || files.length === 0) return;
  if (files.some((file) => !file.type.startsWith("image/"))) {
    showToast("请选择图片文件");
    return;
  }
  const added = [];
  try {
    files.forEach((file) => added.push({ url: URL.createObjectURL(file) }));
  } catch (error) {
    added.forEach((image) => URL.revokeObjectURL(image.url));
    showToast("主图读取失败，请重试");
    return;
  }
  const uploads = productRecordMainImageUploads.get(activeProductRecordItem.id) || [];
  productRecordMainImageUploads.set(activeProductRecordItem.id, [...uploads, ...added]);
  renderProductRecordMainImages(activeProductRecordItem);
  showToast(`已添加${added.length}张商品主图`);
}

productRecordMainImages.addEventListener("change", (event) => {
  if (event.target.matches("[data-product-record-main-input]")) handleProductRecordMainImageUpload(event.target);
});

productRecordMainImages.addEventListener("click", (event) => {
  const defaultButton = event.target.closest("[data-product-record-remove-main-default]");
  if (defaultButton && Object.hasOwn(defaultButton.dataset, "productRecordRemoveMainDefault") && activeProductRecordItem) {
    productRecordRemovedDefaultMainImages.add(activeProductRecordItem.id);
    renderProductRecordMainImages(activeProductRecordItem);
    showToast("已移除商品主图");
    return;
  }
  const button = event.target.closest("[data-product-record-remove-main]");
  if (!button || !activeProductRecordItem) return;
  const uploads = productRecordMainImageUploads.get(activeProductRecordItem.id) || [];
  const index = Number(button.dataset.productRecordRemoveMain);
  if (!Number.isInteger(index) || index < 0 || index >= uploads.length) return;
  URL.revokeObjectURL(uploads[index].url);
  uploads.splice(index, 1);
  renderProductRecordMainImages(activeProductRecordItem);
  showToast("已移除商品主图");
});

function handleProductRecordDetailImageUpload(input) {
  const files = Array.from(input.files || []);
  input.value = "";
  if (!activeProductRecordItem || files.length === 0) return;
  if (files.some((file) => !file.type.startsWith("image/"))) {
    showToast("请选择图片文件");
    return;
  }
  const added = [];
  try {
    files.forEach((file) => added.push({ url: URL.createObjectURL(file) }));
  } catch (error) {
    added.forEach((image) => URL.revokeObjectURL(image.url));
    showToast("详情图读取失败，请重试");
    return;
  }
  const uploads = productRecordDetailImageUploads.get(activeProductRecordItem.id) || [];
  productRecordDetailImageUploads.set(activeProductRecordItem.id, [...uploads, ...added]);
  renderProductRecordDetailImages(activeProductRecordItem);
  showToast(`已添加${added.length}张商品详情图`);
}

productRecordDetailImages.addEventListener("change", (event) => {
  if (event.target.matches("[data-product-record-detail-input]")) handleProductRecordDetailImageUpload(event.target);
});

productRecordDetailImages.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-record-remove-detail]");
  if (!button || !activeProductRecordItem) return;
  const uploads = productRecordDetailImageUploads.get(activeProductRecordItem.id) || [];
  const index = Number(button.dataset.productRecordRemoveDetail);
  if (!Number.isInteger(index) || index < 0 || index >= uploads.length) return;
  URL.revokeObjectURL(uploads[index].url);
  uploads.splice(index, 1);
  renderProductRecordDetailImages(activeProductRecordItem);
  showToast("已移除商品详情图");
});

function openProductRecordDetail(item) {
  activeProductRecordItem = item;
  productRecordAttributeValues.美团.fabric = formatProductRecordFabric(productRecordFabricCompositions.get(item.id) || []);
  productRecordAttributeValues.美团.alcohol = formatProductRecordAlcohol(productRecordAlcoholValues.get(item.id));
  productRecordDetailName.textContent = item.name;
  productRecordDetailId.textContent = item.id;
  productRecordDetailBarcode.textContent = item.barcode;
  productRecordDetailCode.textContent = item.code || item.id.slice(-6);
  renderProductRecordMainImages(item);
  renderProductRecordDetailImages(item);
  resetProductRecordDetail();
  productRecordDetailView.hidden = false;
  productRecordDetailScroll.scrollTop = 0;
}

function closeProductRecordDetail() {
  closeProductRecordFabricSheet(false);
  closeProductRecordBrandSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFruitVarietySheet(false);
  productRecordAttributeEditor.hidden = true;
  productRecordAttributeInputSheet.hidden = true;
  productRecordDetailView.hidden = true;
  activeProductRecordItem = null;
}

function renderProductRecordAttributeFields() {
  const values = productRecordAttributeValues[activeProductRecordAttributeChannel];
  productRecordAttributeFields.innerHTML = getProductRecordAttributeDefinitions().map((field) => {
    const value = values[field.key];
    return `
      <button class="product-record-attribute-field" type="button" data-product-record-attribute-key="${field.key}" aria-label="${escapeProductRecordText(field.label)}：${escapeProductRecordText(value || field.placeholder)}">
        <span>${escapeProductRecordText(field.label)}${field.required ? " <em>*</em>" : ""}</span>
        <strong class="${value ? "" : "placeholder"}">${escapeProductRecordText(value || field.placeholder)}</strong>
        <i aria-hidden="true"></i>
      </button>
    `;
  }).join("");
}

function openProductRecordAttributeEditor(channel) {
  closeProductRecordFabricSheet(false);
  closeProductRecordBrandSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFruitVarietySheet(false);
  activeProductRecordAttributeChannel = channel;
  activeProductRecordAttributeKey = "";
  productRecordAttributeTitle.textContent = `${channel}类目属性`;
  productRecordAttributeInputSheet.hidden = true;
  renderProductRecordAttributeFields();
  productRecordAttributeEditor.hidden = false;
  productRecordAttributeEditorScroll.scrollTop = 0;
}

function closeProductRecordAttributeInput() {
  productRecordAttributeInputSheet.hidden = true;
  activeProductRecordAttributeKey = "";
}

function openProductRecordAttributeInput(key) {
  const field = getProductRecordAttributeDefinitions().find((item) => item.key === key);
  if (!field) return;
  if (key === "brand" && activeProductRecordAttributeChannel === "美团") {
    openProductRecordBrandSheet();
    return;
  }
  if (key === "category" && activeProductRecordAttributeChannel === "美团") {
    openProductRecordCategorySheet();
    return;
  }
  if (field.editor === "fabric") {
    openProductRecordFabricSheet();
    return;
  }
  if (field.editor === "alcohol") {
    openProductRecordAlcoholSheet();
    return;
  }
  if (field.editor === "creatable-select") {
    openProductRecordFruitVarietySheet(key);
    return;
  }
  closeProductRecordFruitVarietySheet(false);
  activeProductRecordAttributeKey = key;
  productRecordAttributeInputTitle.textContent = `填写${field.label}`;
  productRecordAttributeInputLabel.textContent = field.required ? `${field.label}（必填）` : field.label;
  productRecordAttributeInput.value = productRecordAttributeValues[activeProductRecordAttributeChannel][key] || "";
  productRecordAttributeInput.placeholder = field.placeholder;
  productRecordAttributeInputSheet.hidden = false;
  productRecordAttributeInput.focus();
  productRecordAttributeInput.select();
}

function confirmProductRecordAttributeInput() {
  if (!activeProductRecordAttributeKey) return;
  productRecordAttributeValues[activeProductRecordAttributeChannel][activeProductRecordAttributeKey] = productRecordAttributeInput.value.trim();
  closeProductRecordAttributeInput();
  renderProductRecordAttributeFields();
}

function formatProductRecordFabric(rows) {
  return rows.map((row) => `${row.material} ${Number(row.percent)}%`).join("、");
}

function getProductRecordBrandOptions(keyword = "") {
  const current = productRecordAttributeValues.美团.brand;
  const options = current && !productRecordBrandOptions.includes(current)
    ? [current, ...productRecordBrandOptions] : productRecordBrandOptions;
  const query = keyword.trim().toLocaleLowerCase();
  return options.filter((brand) => brand.toLocaleLowerCase().includes(query));
}

function renderProductRecordBrandOptions() {
  const selected = productRecordAttributeValues.美团.brand;
  const brands = getProductRecordBrandOptions(productRecordBrandSearch.value);
  productRecordBrandList.innerHTML = brands.map((brand) => `
    <li><button class="product-record-brand-option${brand === selected ? " selected" : ""}" type="button"
      data-product-record-brand="${escapeProductRecordText(brand)}" aria-pressed="${brand === selected}">
      <span>${escapeProductRecordText(brand)}</span><i aria-hidden="true"></i>
    </button></li>
  `).join("");
  productRecordBrandEmpty.hidden = brands.length > 0;
  productRecordBrandList.scrollTop = 0;
}

function openProductRecordBrandSheet() {
  if (activeProductRecordAttributeChannel !== "美团") return;
  closeProductRecordFabricSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFruitVarietySheet(false);
  closeProductRecordAttributeInput();
  activeProductRecordAttributeKey = "brand";
  productRecordBrandSearch.value = "";
  renderProductRecordBrandOptions();
  productRecordBrandSheet.hidden = false;
  productRecordBrandClose.focus();
}

function closeProductRecordBrandSheet(restoreFocus = true) {
  productRecordBrandSheet.hidden = true;
  productRecordBrandSearch.value = "";
  if (activeProductRecordAttributeKey === "brand") activeProductRecordAttributeKey = "";
  if (restoreFocus) productRecordAttributeFields.querySelector('[data-product-record-attribute-key="brand"]')?.focus();
}

productRecordBrandSearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderProductRecordBrandOptions();
});
productRecordBrandSearch.addEventListener("input", () => {
  // 清空搜索时恢复完整列表；输入关键字后点击搜索或按回车查询。
  if (!productRecordBrandSearch.value.trim()) renderProductRecordBrandOptions();
});
productRecordBrandList.addEventListener("click", (event) => {
  const button = event.target.closest("[data-product-record-brand]");
  if (!button || productRecordBrandSheet.hidden || activeProductRecordAttributeChannel !== "美团") return;
  const brand = button.dataset.productRecordBrand;
  if (!getProductRecordBrandOptions().includes(brand)) return;
  productRecordAttributeValues.美团.brand = brand;
  renderProductRecordAttributeFields();
  closeProductRecordBrandSheet();
});
productRecordBrandClose.addEventListener("click", () => closeProductRecordBrandSheet());
productRecordBrandBackdrop.addEventListener("click", () => closeProductRecordBrandSheet());
productRecordBrandSheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeProductRecordBrandSheet();
  }
  if (event.key === "Tab") {
    const controls = productRecordBrandSheet.querySelector('[role="dialog"]').querySelectorAll("button, input");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function getSelectedProductRecordCategories() {
  return (productRecordAttributeValues.美团.category || "").split(/[、,，]/).map((value) => value.trim()).filter(Boolean);
}

function getProductRecordCategoryOptions(keyword = "") {
  const query = keyword.trim().toLocaleLowerCase();
  // 保留原有类别值，避免打开面板时丢失不在演示选项中的内容。
  return [...new Set([...productRecordCategoryOptions, ...getSelectedProductRecordCategories()])]
    .filter((category) => category.toLocaleLowerCase().includes(query));
}

function renderProductRecordCategoryOptions() {
  const options = getProductRecordCategoryOptions(productRecordCategorySearch.value);
  productRecordCategoryList.innerHTML = options.map((category) => `
    <label class="product-record-category-option">
      <input type="checkbox" data-product-record-category-option value="${escapeProductRecordText(category)}"${productRecordCategoryDraft.has(category) ? " checked" : ""} />
      <span>${escapeProductRecordText(category)}</span>
    </label>
  `).join("");
  productRecordCategoryEmpty.hidden = options.length > 0;
  productRecordCategoryList.closest(".product-record-category-content").scrollTop = 0;
}

function openProductRecordCategorySheet() {
  if (activeProductRecordAttributeChannel !== "美团") return;
  closeProductRecordBrandSheet(false);
  closeProductRecordFabricSheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFruitVarietySheet(false);
  closeProductRecordAttributeInput();
  activeProductRecordAttributeKey = "category";
  productRecordCategoryDraft = new Set(getSelectedProductRecordCategories());
  productRecordCategorySearch.value = "";
  productRecordCategoryError.hidden = true;
  renderProductRecordCategoryOptions();
  productRecordCategorySheet.hidden = false;
  productRecordCategoryClose.focus();
}

function closeProductRecordCategorySheet(restoreFocus = true) {
  productRecordCategorySheet.hidden = true;
  productRecordCategoryDraft = new Set();
  productRecordCategorySearch.value = "";
  productRecordCategoryError.hidden = true;
  if (activeProductRecordAttributeKey === "category") activeProductRecordAttributeKey = "";
  if (restoreFocus) productRecordAttributeFields.querySelector('[data-product-record-attribute-key="category"]')?.focus();
}

function confirmProductRecordCategories() {
  if (productRecordCategorySheet.hidden || activeProductRecordAttributeChannel !== "美团") return;
  const selected = getProductRecordCategoryOptions().filter((category) => productRecordCategoryDraft.has(category));
  if (!selected.length) {
    productRecordCategoryError.textContent = "请选择至少一个商品类别";
    productRecordCategoryError.hidden = false;
    return;
  }
  productRecordAttributeValues.美团.category = selected.join("、");
  renderProductRecordAttributeFields();
  closeProductRecordCategorySheet();
}

productRecordCategorySearchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  renderProductRecordCategoryOptions();
});
productRecordCategorySearch.addEventListener("input", () => {
  if (!productRecordCategorySearch.value.trim()) renderProductRecordCategoryOptions();
});
productRecordCategoryList.addEventListener("change", (event) => {
  const input = event.target;
  if (!input.matches("[data-product-record-category-option]") || productRecordCategorySheet.hidden || activeProductRecordAttributeChannel !== "美团") return;
  if (!getProductRecordCategoryOptions().includes(input.value)) return;
  if (input.checked) productRecordCategoryDraft.add(input.value);
  else productRecordCategoryDraft.delete(input.value);
  productRecordCategoryError.hidden = true;
});
[productRecordCategoryClose, productRecordCategoryBackdrop, productRecordCategoryCancel].forEach((button) => {
  button.addEventListener("click", () => closeProductRecordCategorySheet());
});
productRecordCategoryConfirm.addEventListener("click", confirmProductRecordCategories);
productRecordCategorySheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeProductRecordCategorySheet();
  }
  if (event.key === "Tab") {
    const controls = productRecordCategorySheet.querySelector('[role="dialog"]').querySelectorAll("button, input");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function formatProductRecordAlcohol(value) {
  return value ? `${value.amount}${value.unit}` : "";
}

function validateProductRecordAlcohol(amount, unit) {
  if (!String(amount).trim()) return { error: "请输入酒精度数值" };
  const number = Number(amount);
  if (!Number.isFinite(number) || number < 0 || number > 100) return { error: "酒精度须为0至100之间的数值" };
  if (unit !== "%vol") return { error: "请选择酒精度单位" };
  return { value: { amount: String(number), unit } };
}

function openProductRecordAlcoholSheet() {
  if (activeProductRecordAttributeChannel !== "美团") return;
  closeProductRecordBrandSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordFabricSheet(false);
  closeProductRecordFruitVarietySheet(false);
  closeProductRecordAttributeInput();
  const saved = productRecordAlcoholValues.get(activeProductRecordItem?.id);
  activeProductRecordAttributeKey = "alcohol";
  productRecordAlcoholInput.value = saved?.amount ?? "";
  productRecordAlcoholUnit.value = saved?.unit ?? "";
  productRecordAlcoholError.hidden = true;
  productRecordAlcoholSheet.hidden = false;
  productRecordAlcoholClose.focus();
}

function closeProductRecordAlcoholSheet(restoreFocus = true) {
  productRecordAlcoholSheet.hidden = true;
  productRecordAlcoholInput.value = "";
  productRecordAlcoholUnit.value = "";
  productRecordAlcoholError.hidden = true;
  if (activeProductRecordAttributeKey === "alcohol") activeProductRecordAttributeKey = "";
  if (restoreFocus) productRecordAttributeFields.querySelector('[data-product-record-attribute-key="alcohol"]')?.focus();
}

function confirmProductRecordAlcohol() {
  if (productRecordAlcoholSheet.hidden || activeProductRecordAttributeChannel !== "美团") return;
  const result = validateProductRecordAlcohol(productRecordAlcoholInput.value, productRecordAlcoholUnit.value);
  if (result.error) {
    productRecordAlcoholError.textContent = result.error;
    productRecordAlcoholError.hidden = false;
    return;
  }
  productRecordAlcoholValues.set(activeProductRecordItem?.id, result.value);
  productRecordAttributeValues.美团.alcohol = formatProductRecordAlcohol(result.value);
  renderProductRecordAttributeFields();
  closeProductRecordAlcoholSheet();
}

productRecordAlcoholInput.addEventListener("input", () => { productRecordAlcoholError.hidden = true; });
productRecordAlcoholUnit.addEventListener("change", () => { productRecordAlcoholError.hidden = true; });
productRecordAlcoholInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    confirmProductRecordAlcohol();
  }
});
productRecordAlcoholConfirm.addEventListener("click", confirmProductRecordAlcohol);
[productRecordAlcoholClose, productRecordAlcoholBackdrop].forEach((button) => {
  button.addEventListener("click", () => closeProductRecordAlcoholSheet());
});
productRecordAlcoholSheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeProductRecordAlcoholSheet();
  }
  if (event.key === "Tab") {
    const controls = productRecordAlcoholSheet.querySelector('[role="dialog"]').querySelectorAll("button, input, select");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function renderProductRecordFruitVarietyOptions() {
  const config = productRecordCreatableConfigs[activeProductRecordCreatableKey];
  const selected = productRecordAttributeValues.抖店[activeProductRecordCreatableKey];
  productRecordFruitVarietyList.innerHTML = config.options.map((option) => `
    <li><button class="product-record-fruit-option${option === selected ? " selected" : ""}" type="button"
      data-product-record-creatable-option="${escapeProductRecordText(option)}" aria-pressed="${option === selected}">
      <span>${escapeProductRecordText(option)}</span><i aria-hidden="true"></i>
    </button></li>
  `).join("");
}

function openProductRecordFruitVarietySheet(key) {
  const config = productRecordCreatableConfigs[key];
  if (activeProductRecordAttributeChannel !== "抖店" || !config) return;
  closeProductRecordBrandSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFabricSheet(false);
  closeProductRecordAttributeInput();
  activeProductRecordAttributeKey = key;
  activeProductRecordCreatableKey = key;
  productRecordFruitVarietyTitle.textContent = config.label;
  productRecordFruitVarietyCreate.textContent = config.createLabel;
  productRecordFruitVarietyCreate.hidden = false;
  productRecordFruitVarietyCreateRow.hidden = true;
  productRecordFruitVarietyInput.value = "";
  productRecordFruitVarietyInput.placeholder = "请输入自定义属性";
  renderProductRecordFruitVarietyOptions();
  productRecordFruitVarietySheet.hidden = false;
  productRecordFruitVarietyClose.focus();
}

function closeProductRecordFruitVarietySheet(restoreFocus = true) {
  productRecordFruitVarietySheet.hidden = true;
  productRecordFruitVarietyCreate.hidden = false;
  productRecordFruitVarietyCreateRow.hidden = true;
  productRecordFruitVarietyInput.value = "";
  const key = activeProductRecordCreatableKey;
  activeProductRecordCreatableKey = "";
  if (activeProductRecordAttributeKey === key) activeProductRecordAttributeKey = "";
  if (restoreFocus && key) productRecordAttributeFields.querySelector(`[data-product-record-attribute-key="${key}"]`)?.focus();
}

function openProductRecordFruitVarietyCreate() {
  productRecordFruitVarietyCreate.hidden = true;
  productRecordFruitVarietyCreateRow.hidden = false;
  productRecordFruitVarietyInput.value = "";
  productRecordFruitVarietyInput.focus();
}

function cancelProductRecordFruitVarietyCreate() {
  productRecordFruitVarietyCreateRow.hidden = true;
  productRecordFruitVarietyCreate.hidden = false;
  productRecordFruitVarietyInput.value = "";
  productRecordFruitVarietyCreate.focus();
}

function confirmProductRecordFruitVarietyCreate() {
  const config = productRecordCreatableConfigs[activeProductRecordCreatableKey];
  const value = productRecordFruitVarietyInput.value.trim();
  if (!config || !value) {
    showToast("请输入自定义属性");
    productRecordFruitVarietyInput.focus();
    return;
  }
  if (!config.options.includes(value)) config.options.push(value);
  productRecordAttributeValues.抖店[activeProductRecordCreatableKey] = value;
  renderProductRecordAttributeFields();
  const label = config.label;
  closeProductRecordFruitVarietySheet();
  showToast(`${label}已新建并选中`);
}

productRecordFruitVarietyList.addEventListener("click", (event) => {
  const option = event.target.closest("[data-product-record-creatable-option]");
  if (!option || productRecordFruitVarietySheet.hidden || activeProductRecordAttributeChannel !== "抖店") return;
  const config = productRecordCreatableConfigs[activeProductRecordCreatableKey];
  const value = option.dataset.productRecordCreatableOption;
  if (!config?.options.includes(value)) return;
  productRecordAttributeValues.抖店[activeProductRecordCreatableKey] = value;
  renderProductRecordAttributeFields();
  closeProductRecordFruitVarietySheet();
});
productRecordFruitVarietyCreate.addEventListener("click", openProductRecordFruitVarietyCreate);
productRecordFruitVarietyCreateConfirm.addEventListener("click", confirmProductRecordFruitVarietyCreate);
productRecordFruitVarietyCreateCancel.addEventListener("click", cancelProductRecordFruitVarietyCreate);
productRecordFruitVarietyInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") { event.preventDefault(); confirmProductRecordFruitVarietyCreate(); }
});
productRecordFruitVarietyClose.addEventListener("click", () => closeProductRecordFruitVarietySheet());
productRecordFruitVarietyBackdrop.addEventListener("click", () => closeProductRecordFruitVarietySheet());
productRecordFruitVarietySheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    if (!productRecordFruitVarietyCreateRow.hidden) cancelProductRecordFruitVarietyCreate();
    else closeProductRecordFruitVarietySheet();
  }
  if (event.key === "Tab") {
    const controls = productRecordFruitVarietySheet.querySelector('[role="dialog"]').querySelectorAll("button, input");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function validateProductRecordFabric(rows) {
  const filledRows = rows.filter((row) => String(row.percent).trim() || row.material.trim());
  if (!filledRows.length) return { error: "请填写面料成份及占比" };
  for (const row of filledRows) {
    if (!row.material.trim() || !String(row.percent).trim()) return { error: "请完整填写每项面料及对应占比" };
    const percent = Number(row.percent);
    if (!Number.isFinite(percent) || percent <= 0 || percent > 100) return { error: "面料占比须大于0且不超过100%" };
  }
  const total = filledRows.reduce((sum, row) => sum + Number(row.percent), 0);
  if (Math.abs(total - 100) > 0.000001) return { error: "面料占比合计须为100%" };
  return { rows: filledRows.map((row) => ({ material: row.material.trim(), percent: String(Number(row.percent)) })) };
}

function renderProductRecordFabricRows() {
  productRecordFabricRows.innerHTML = productRecordFabricDraft.map((row, index) => `
    <div class="product-record-fabric-row" data-product-record-fabric-row="${index}">
      <input type="number" min="0" max="100" step="any" inputmode="decimal" data-product-record-fabric-percent
        aria-label="第${index + 1}项面料占比（%）" placeholder="请填写商品实际占比" value="${escapeProductRecordText(row.percent)}" />
      <div class="product-record-fabric-material">
        <input type="text" maxlength="60" data-product-record-fabric-material
          aria-label="第${index + 1}项面料名称" placeholder="请填写对应的面料成份" value="${escapeProductRecordText(row.material)}" />
        <span class="product-record-fabric-select">
          <select data-product-record-fabric-select aria-label="选择第${index + 1}项面料">
            <option value="" selected disabled>请选择</option><option>聚酯纤维</option><option>棉</option>
          </select>
        </span>
      </div>
    </div>
  `).join("");
}

function openProductRecordFabricSheet() {
  if (activeProductRecordAttributeChannel !== "美团") return;
  closeProductRecordBrandSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFruitVarietySheet(false);
  const saved = productRecordFabricCompositions.get(activeProductRecordItem?.id) || [];
  productRecordFabricDraft = saved.length ? saved.map((row) => ({ ...row })) : [{ percent: "", material: "" }];
  productRecordAttributeInputSheet.hidden = true;
  activeProductRecordAttributeKey = "fabric";
  productRecordFabricError.hidden = true;
  renderProductRecordFabricRows();
  productRecordFabricSheet.hidden = false;
  productRecordFabricClose.focus();
}

function closeProductRecordFabricSheet(restoreFocus = true) {
  productRecordFabricSheet.hidden = true;
  productRecordFabricDraft = [];
  productRecordFabricError.hidden = true;
  if (activeProductRecordAttributeKey === "fabric") activeProductRecordAttributeKey = "";
  if (restoreFocus) productRecordAttributeFields.querySelector('[data-product-record-attribute-key="fabric"]')?.focus();
}

function confirmProductRecordFabric() {
  const result = validateProductRecordFabric(productRecordFabricDraft);
  if (result.error) {
    productRecordFabricError.textContent = result.error;
    productRecordFabricError.hidden = false;
    return;
  }
  productRecordFabricCompositions.set(activeProductRecordItem?.id, result.rows);
  productRecordAttributeValues.美团.fabric = formatProductRecordFabric(result.rows);
  renderProductRecordAttributeFields();
  closeProductRecordFabricSheet();
}

productRecordFabricRows.addEventListener("input", (event) => {
  const row = event.target.closest("[data-product-record-fabric-row]");
  if (!row) return;
  const draft = productRecordFabricDraft[Number(row.dataset.productRecordFabricRow)];
  if (!draft) return;
  if (event.target.matches("[data-product-record-fabric-percent]")) draft.percent = event.target.value;
  if (event.target.matches("[data-product-record-fabric-material]")) draft.material = event.target.value;
  productRecordFabricError.hidden = true;
});

productRecordFabricRows.addEventListener("change", (event) => {
  if (!event.target.matches("[data-product-record-fabric-select]")) return;
  const row = event.target.closest("[data-product-record-fabric-row]");
  const draft = productRecordFabricDraft[Number(row.dataset.productRecordFabricRow)];
  draft.material = event.target.value;
  row.querySelector("[data-product-record-fabric-material]").value = draft.material;
  event.target.value = "";
  productRecordFabricError.hidden = true;
});

productRecordFabricAdd.addEventListener("click", () => {
  productRecordFabricDraft.push({ percent: "", material: "" });
  renderProductRecordFabricRows();
  productRecordFabricRows.lastElementChild.querySelector("input").focus();
});
productRecordFabricClose.addEventListener("click", () => closeProductRecordFabricSheet());
productRecordFabricBackdrop.addEventListener("click", () => closeProductRecordFabricSheet());
productRecordFabricConfirm.addEventListener("click", confirmProductRecordFabric);
productRecordFabricSheet.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    event.preventDefault();
    closeProductRecordFabricSheet();
  }
  if (event.key === "Tab") {
    const controls = productRecordFabricSheet.querySelector('[role="dialog"]').querySelectorAll("button, input, select");
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

function handleProductRecordImageUpload(input) {
  const [file] = input.files;
  if (!file) return;
  if (!file.type.startsWith("image/")) {
    showToast("请选择图片文件");
    resetProductRecordUploadTile(input);
    return;
  }

  const tile = input.closest(".product-record-upload-tile");
  const preview = tile.querySelector("img");
  if (preview.dataset.objectUrl) URL.revokeObjectURL(preview.dataset.objectUrl);
  const objectUrl = URL.createObjectURL(file);
  preview.src = objectUrl;
  preview.dataset.objectUrl = objectUrl;
  preview.hidden = false;
  tile.classList.add("uploaded");
  tile.closest(".product-record-special-field").classList.add("complete");
  showToast("图片已上传");
}

productRecordDetailBack.addEventListener("click", closeProductRecordDetail);
productRecordMeituanImageInput.addEventListener("change", () => handleProductRecordImageUpload(productRecordMeituanImageInput));
productRecordTaobaoImageInput.addEventListener("change", () => handleProductRecordImageUpload(productRecordTaobaoImageInput));

productRecordRemoveTaobaoImage.addEventListener("click", () => {
  productRecordTaobaoExistingImage.hidden = true;
  showToast("已移除背签图");
});

productRecordDetailView.addEventListener("click", (event) => {
  const help = event.target.closest("[data-product-record-image-help]");
  if (help) {
    showToast(`${help.dataset.productRecordImageHelp}用于渠道商品资料展示`);
    return;
  }

  const fill = event.target.closest("[data-product-record-fill-channel]");
  if (fill) {
    openProductRecordAttributeEditor(fill.dataset.productRecordFillChannel);
    return;
  }

  const toggle = event.target.closest("[data-product-record-attribute-toggle]");
  if (!toggle) return;
  const section = document.getElementById(toggle.dataset.productRecordAttributeToggle);
  const isCollapsed = section.classList.toggle("collapsed");
  toggle.innerHTML = `${isCollapsed ? "展开更多" : "收起更多"} <i></i>`;
  toggle.setAttribute("aria-expanded", String(!isCollapsed));
});

productRecordDetailConfirm.addEventListener("click", () => {
  if (!activeProductRecordItem) return;
  const productName = activeProductRecordItem.name;
  closeProductRecordDetail();
  showToast(`“${productName}”商品资料已保存`);
});

productRecordAttributeBack.addEventListener("click", () => {
  closeProductRecordFabricSheet(false);
  closeProductRecordBrandSheet(false);
  closeProductRecordCategorySheet(false);
  closeProductRecordAlcoholSheet(false);
  closeProductRecordFruitVarietySheet(false);
  productRecordAttributeInputSheet.hidden = true;
  productRecordAttributeEditor.hidden = true;
});

productRecordAttributeFields.addEventListener("click", (event) => {
  const field = event.target.closest("[data-product-record-attribute-key]");
  if (field) openProductRecordAttributeInput(field.dataset.productRecordAttributeKey);
});

[productRecordAttributeInputBackdrop, productRecordAttributeInputClose, productRecordAttributeInputCancel].forEach((button) => {
  button.addEventListener("click", closeProductRecordAttributeInput);
});

productRecordAttributeInputConfirm.addEventListener("click", confirmProductRecordAttributeInput);
productRecordAttributeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") confirmProductRecordAttributeInput();
});

function applyProductRecordRecommendedAttributes() {
  getProductRecordAttributeDefinitions().forEach((field) => {
    // 成份比例和酒精度由用户填写；使用推荐不清除已确认值或代填示例。
    if (field.editor === "fabric" || field.editor === "alcohol" || field.editor === "creatable-select") return;
    productRecordAttributeValues[activeProductRecordAttributeChannel][field.key] = field.recommended;
  });
  renderProductRecordAttributeFields();
  productRecordAttributeEditorScroll.scrollTop = 0;
  showToast(`已填入${activeProductRecordAttributeChannel}推荐属性，请确认后保存`);
}

productRecordUseRecommended.addEventListener("click", applyProductRecordRecommendedAttributes);

productRecordSaveAttributes.addEventListener("click", () => {
  const values = productRecordAttributeValues[activeProductRecordAttributeChannel];
  const definitions = getProductRecordAttributeDefinitions();
  const missingField = definitions.find((field) => field.required && !values[field.key]);
  if (missingField) {
    showToast(`请完善必填属性：${missingField.label}`);
    productRecordAttributeFields.querySelector(`[data-product-record-attribute-key="${missingField.key}"]`)?.focus();
    return;
  }

  const filledCount = definitions.filter((field) => values[field.key]).length;
  const totalCount = { 美团: 16, 淘宝: 20, 抖店: 7 }[activeProductRecordAttributeChannel];
  const block = document.querySelector(`[data-product-record-fill-channel="${activeProductRecordAttributeChannel}"]`)
    ?.closest(".product-record-attribute-block");
  const summary = block?.querySelector("h2 small");
  if (summary) summary.textContent = `（已填${filledCount}/${totalCount}）`;
  const list = block?.querySelector(".product-record-attribute-values dl");
  if (list) {
    list.innerHTML = definitions
      .filter((field) => values[field.key])
      .map((field, index) => `<div${index >= 3 ? " data-product-record-attribute-extra" : ""}><dt>${escapeProductRecordText(field.label)}</dt><dd>${escapeProductRecordText(values[field.key])}</dd></div>`)
      .join("");
  }
  const channel = activeProductRecordAttributeChannel;
  productRecordAttributeEditor.hidden = true;
  showToast(`${channel}类目属性已保存`);
});
