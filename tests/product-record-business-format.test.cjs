const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const root = join(__dirname, "..");
const source = readFileSync(join(root, "js/同城App/功能应用/同城商品档案.js"), "utf8");

function element() {
  return {
    innerHTML: "", textContent: "", value: "", dataset: {}, hidden: true, disabled: false, scrollTop: 0,
    attributes: {}, listeners: {},
    addEventListener(type, listener) { this.listeners[type] = listener; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    getAttribute(name) { return this.attributes[name]; },
    removeAttribute() {}, focus() {}, select() {}, scrollIntoView() {},
    get lastElementChild() { return this; },
    classList: { remove() {}, toggle() {} },
    closest() { return this; }, querySelector() { return this; }
  };
}

function setup() {
  const context = vm.createContext({
    document: { querySelector: element, querySelectorAll: () => [] },
    openProductRecord: element(), messages: [],
    URL: { createObjectURL: () => "blob:test", revokeObjectURL() {} },
    showToast: (message) => context.messages.push(message),
    setRetailUnionAppOpen() {},
    ...Object.fromEntries([...new Set(source.match(/\bproductRecord[A-Z]\w*/g))].map((name) => [name, element()]))
  });
  vm.runInContext(source, context);
  return context;
}

test("业态选择位于搜索框上方，并在入口页与页面片段中保持一致", () => {
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const block = html.match(/<section class="product-record-format-switch"[\s\S]*?<\/section>/)?.[0];
    assert.ok(block);
    assert.ok(html.indexOf(block) < html.indexOf('class="product-record-searchbar"'));
    assert.ok(html.includes('id="productRecordFormatSheet"'));
    assert.ok(html.includes('id="productRecordFormatList"'));
    return block.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});

test("多个业态可打开移动端选择面板，当前项带选中状态", () => {
  const context = setup();
  context.syncProductRecordFormatSwitcher();
  assert.equal(context.productRecordFormatName.textContent, "大卖场");
  assert.equal(context.productRecordFormatAction.textContent, "切换");
  assert.equal(context.productRecordFormatTrigger.disabled, false);
  context.openProductRecordFormatSheet();
  assert.equal(context.productRecordFormatSheet.hidden, false);
  assert.equal(context.productRecordFormatTrigger.getAttribute("aria-expanded"), "true");
  assert.match(context.productRecordFormatList.innerHTML, /data-product-record-format="大卖场"/);
  assert.match(context.productRecordFormatList.innerHTML, /data-product-record-format="恺源"/);
  assert.match(context.productRecordFormatList.innerHTML, /product-record-format-option selected/);
});

test("点击其他业态后回填当前业态、关闭面板并提示切换成功", () => {
  const context = setup();
  context.openProductRecordFormatSheet();
  context.productRecordFormatList.listeners.click({ target: {
    closest: () => ({ dataset: { productRecordFormat: "恺源" } })
  } });
  assert.equal(vm.runInContext("activeProductRecordBusinessFormat", context), "恺源");
  assert.equal(context.productRecordFormatName.textContent, "恺源");
  assert.equal(context.productRecordFormatSheet.hidden, true);
  assert.equal(context.productRecordFormatTrigger.getAttribute("aria-expanded"), "false");
  assert.equal(context.messages.at(-1), "已切换至恺源");
});

test("单业态时显示当前状态且无法打开切换面板", () => {
  const context = setup();
  vm.runInContext("productRecordBusinessFormats.splice(1)", context);
  context.syncProductRecordFormatSwitcher();
  assert.equal(context.productRecordFormatAction.textContent, "当前");
  assert.equal(context.productRecordFormatTrigger.disabled, true);
  context.openProductRecordFormatSheet();
  assert.equal(context.productRecordFormatSheet.hidden, true);
});

test("关闭按钮、遮罩和 Escape 均关闭业态面板且不改变当前业态", () => {
  const context = setup();
  for (const close of [
    () => context.productRecordFormatClose.listeners.click(),
    () => context.productRecordFormatBackdrop.listeners.click(),
    () => context.productRecordFormatSheet.listeners.keydown({ key: "Escape", preventDefault() {} })
  ]) {
    context.openProductRecordFormatSheet();
    close();
    assert.equal(context.productRecordFormatSheet.hidden, true);
    assert.equal(vm.runInContext("activeProductRecordBusinessFormat", context), "大卖场");
  }
});

test("业态切换所需 DOM 引用完整", () => {
  const refs = readFileSync(join(root, "js/核心/状态与DOM引用.js"), "utf8");
  for (const id of ["productRecordFormatTrigger", "productRecordFormatName", "productRecordFormatAction", "productRecordFormatSheet", "productRecordFormatBackdrop", "productRecordFormatClose", "productRecordFormatList"]) {
    assert.match(refs, new RegExp(`const ${id} = document\\.querySelector\\(\"#${id}\"\\);`));
  }
});
