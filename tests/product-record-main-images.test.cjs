const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const root = join(__dirname, "..");
const source = readFileSync(join(root, "js/同城App/功能应用/同城商品档案.js"), "utf8");

function element() {
  return {
    innerHTML: "", textContent: "", dataset: {}, hidden: true, scrollTop: 0,
    listeners: {},
    addEventListener(type, listener) { this.listeners[type] = listener; }, removeAttribute() {},
    focus() {}, select() {},
    get lastElementChild() { return this; },
    classList: { remove() {} },
    closest() { return this; }, querySelector() { return this; }
  };
}

function setup() {
  let nextUrl = 0;
  const context = vm.createContext({
    document: { querySelector: element, querySelectorAll: () => [] },
    openProductRecord: element(),
    messages: [], revoked: [],
    URL: {
      createObjectURL: () => `blob:main-${++nextUrl}`,
      revokeObjectURL: (url) => context.revoked.push(url)
    },
    showToast: (message) => context.messages.push(message),
    ...Object.fromEntries([...new Set(source.match(/\bproductRecord[A-Z]\w*/g))].map((name) => [name, element()]))
  });
  vm.runInContext(source, context);
  return context;
}

test("主图和商品详情图依次位于基础信息与特殊图之间，页面片段一致", () => {
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const block = html.match(/<section class="product-record-detail-card product-record-main-card"[\s\S]*?<\/section>/)?.[0];
    const detailBlock = html.match(/<section class="product-record-detail-card product-record-detail-images-card"[\s\S]*?<\/section>/)?.[0];
    assert.ok(block);
    assert.ok(detailBlock);
    assert.ok(html.indexOf('id="productRecordDetailCode"') < html.indexOf(block));
    assert.ok(html.indexOf(block) < html.indexOf(detailBlock));
    assert.ok(html.indexOf(detailBlock) < html.indexOf("<h2>美团特殊图</h2>"));
    assert.equal((html.match(/id="productRecordMainImages"/g) || []).length, 1);
    assert.equal((html.match(/id="productRecordDetailImages"/g) || []).length, 1);
    return `${block}${detailBlock}`.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});

test("主图上传入口可追加多张图片，按商品隔离并在重新进入后保留", () => {
  const context = setup();
  const [first, second] = vm.runInContext("productRecordItems", context);
  context.openProductRecordDetail(first);
  assert.match(context.productRecordMainImages.innerHTML, /type="file" accept="image\/\*" multiple/);
  const input = { files: [{ type: "image/png" }, { type: "image/jpeg" }], value: "selected" };
  context.handleProductRecordMainImageUpload(input);
  assert.equal(input.value, "");
  assert.match(context.productRecordMainImages.innerHTML, /blob:main-1/);
  assert.match(context.productRecordMainImages.innerHTML, /blob:main-2/);
  assert.equal((context.productRecordMainImages.innerHTML.match(/data-product-record-remove-main=/g) || []).length, 2);
  context.closeProductRecordDetail();
  context.openProductRecordDetail(second);
  assert.equal(context.productRecordMainImages.innerHTML.includes("blob:main-"), false);
  context.closeProductRecordDetail();
  context.openProductRecordDetail(first);
  assert.match(context.productRecordMainImages.innerHTML, /blob:main-2/);
});

test("取消选择或选择非图片不会添加主图", () => {
  const context = setup();
  context.openProductRecordDetail(vm.runInContext("productRecordItems[0]", context));
  const before = context.productRecordMainImages.innerHTML;
  context.handleProductRecordMainImageUpload({ files: [], value: "" });
  context.handleProductRecordMainImageUpload({ files: [{ type: "text/plain" }], value: "" });
  assert.equal(context.productRecordMainImages.innerHTML, before);
  assert.equal(context.messages.at(-1), "请选择图片文件");
});

test("删除新增主图会移除预览并释放对应对象 URL", () => {
  const context = setup();
  context.openProductRecordDetail(vm.runInContext("productRecordItems[0]", context));
  context.handleProductRecordMainImageUpload({ files: [{ type: "image/png" }], value: "" });
  context.productRecordMainImages.listeners.click({ target: {
    closest: () => ({ dataset: { productRecordRemoveMain: "0" } })
  } });
  assert.equal(context.productRecordMainImages.innerHTML.includes("blob:main-1"), false);
  assert.deepEqual(context.revoked, ["blob:main-1"]);
  assert.match(context.productRecordMainImages.innerHTML, /上传商品主图/);
});

test("默认商品主图右上角可删除，按商品隔离并在重新进入后保持", () => {
  const context = setup();
  const [first, second] = vm.runInContext("productRecordItems", context);
  context.openProductRecordDetail(first);
  assert.match(context.productRecordMainImages.innerHTML, /data-product-record-remove-main-default/);
  assert.match(context.productRecordMainImages.innerHTML, /aria-label="删除默认商品主图"/);
  context.productRecordMainImages.listeners.click({ target: {
    closest: (selector) => selector.includes("remove-main-default")
      ? { dataset: { productRecordRemoveMainDefault: "" } } : null
  } });
  assert.equal(context.productRecordMainImages.innerHTML.includes("data-product-record-remove-main-default"), false);
  assert.match(context.productRecordMainImages.innerHTML, /上传商品主图/);
  assert.equal(context.messages.at(-1), "已移除商品主图");
  context.closeProductRecordDetail();
  context.openProductRecordDetail(second);
  assert.match(context.productRecordMainImages.innerHTML, /data-product-record-remove-main-default/);
  context.closeProductRecordDetail();
  context.openProductRecordDetail(first);
  assert.equal(context.productRecordMainImages.innerHTML.includes("data-product-record-remove-main-default"), false);
});

test("商品主图中每张默认图和上传图均带删除操作", () => {
  const context = setup();
  context.openProductRecordDetail(vm.runInContext("productRecordItems[0]", context));
  context.handleProductRecordMainImageUpload({ files: [{ type: "image/png" }, { type: "image/jpeg" }], value: "" });
  assert.equal((context.productRecordMainImages.innerHTML.match(/class="product-record-existing-image product-record-main-image/g) || []).length, 3);
  assert.equal((context.productRecordMainImages.innerHTML.match(/aria-label="删除(?:默认商品主图|主图\d+)"/g) || []).length, 3);
});

test("商品详情图初始展示多选上传入口，不预置虚假详情图", () => {
  const context = setup();
  context.openProductRecordDetail(vm.runInContext("productRecordItems[0]", context));
  assert.match(context.productRecordDetailImages.innerHTML, /type="file" accept="image\/\*" multiple/);
  assert.match(context.productRecordDetailImages.innerHTML, /data-product-record-detail-input/);
  assert.equal(context.productRecordDetailImages.innerHTML.includes("data-product-record-remove-detail"), false);
});

test("商品详情图可追加多张，按商品隔离并在重新进入后保留", () => {
  const context = setup();
  const [first, second] = vm.runInContext("productRecordItems", context);
  context.openProductRecordDetail(first);
  const input = { files: [{ type: "image/png" }, { type: "image/jpeg" }], value: "selected" };
  context.handleProductRecordDetailImageUpload(input);
  assert.equal(input.value, "");
  assert.match(context.productRecordDetailImages.innerHTML, /blob:main-1/);
  assert.match(context.productRecordDetailImages.innerHTML, /blob:main-2/);
  assert.equal((context.productRecordDetailImages.innerHTML.match(/data-product-record-remove-detail=/g) || []).length, 2);
  assert.equal(context.messages.at(-1), "已添加2张商品详情图");
  context.closeProductRecordDetail();
  context.openProductRecordDetail(second);
  assert.equal(context.productRecordDetailImages.innerHTML.includes("blob:main-"), false);
  context.closeProductRecordDetail();
  context.openProductRecordDetail(first);
  assert.match(context.productRecordDetailImages.innerHTML, /blob:main-2/);
});

test("详情图取消选择或包含非图片文件时不添加", () => {
  const context = setup();
  context.openProductRecordDetail(vm.runInContext("productRecordItems[0]", context));
  const before = context.productRecordDetailImages.innerHTML;
  context.handleProductRecordDetailImageUpload({ files: [], value: "" });
  assert.equal(context.productRecordDetailImages.innerHTML, before);
  context.handleProductRecordDetailImageUpload({ files: [{ type: "image/png" }, { type: "text/plain" }], value: "selected" });
  assert.equal(context.productRecordDetailImages.innerHTML, before);
  assert.equal(context.messages.at(-1), "请选择图片文件");
});

test("删除详情图会释放对应 URL，保留其余图片和上传入口", () => {
  const context = setup();
  context.openProductRecordDetail(vm.runInContext("productRecordItems[0]", context));
  context.handleProductRecordDetailImageUpload({ files: [{ type: "image/png" }, { type: "image/jpeg" }], value: "" });
  context.productRecordDetailImages.listeners.click({ target: {
    closest: () => ({ dataset: { productRecordRemoveDetail: "0" } })
  } });
  assert.equal(context.productRecordDetailImages.innerHTML.includes("blob:main-1"), false);
  assert.match(context.productRecordDetailImages.innerHTML, /blob:main-2/);
  assert.deepEqual(context.revoked, ["blob:main-1"]);
  assert.equal(context.messages.at(-1), "已移除商品详情图");
  assert.match(context.productRecordDetailImages.innerHTML, /上传商品详情图/);
});

test("详情图名称中的特殊字符不会破坏图片属性", () => {
  const context = setup();
  context.openProductRecordDetail({ name: '详情"<测试>&', id: "123456", barcode: "123456", visual: "tissue" });
  context.handleProductRecordDetailImageUpload({ files: [{ type: "image/png" }], value: "" });
  assert.match(context.productRecordDetailImages.innerHTML, /alt="详情&quot;&lt;测试&gt;&amp;详情图1"/);
  assert.equal(context.productRecordDetailImages.innerHTML.includes("<测试>"), false);
});

test("美团、淘宝标题均移除一键推荐，保留属性填写入口", () => {
  for (const path of ["index.html", "页面/同城App功能菜单/同城商品档案.html"]) {
    const html = readFileSync(join(root, path), "utf8");
    assert.equal(html.includes("data-product-record-recommend-channel"), false);
    assert.equal(html.includes("data-product-record-copy-channel"), false);
    for (const channel of ["美团", "淘宝"]) {
      const header = html.match(new RegExp(`<header><h2>${channel}类目属性[\\s\\S]*?</header>`))?.[0];
      assert.ok(header);
      assert.equal(header.includes("<button"), false);
      assert.ok(html.includes(`data-product-record-fill-channel="${channel}"`));
    }
    assert.ok(html.includes('id="productRecordUseRecommended"'));
  }
  assert.equal(source.includes("data-product-record-recommend-channel"), false);
});

for (const channel of ["美团", "淘宝"]) {
  test(`${channel}填写入口正常，编辑页使用推荐不修改其他渠道`, () => {
    const context = setup();
    const other = channel === "美团" ? "淘宝" : "美团";
    const values = vm.runInContext("productRecordAttributeValues", context);
    values[channel].brand = "";
    values[other].brand = "另一渠道手工品牌";
    context.productRecordDetailView.listeners.click({ target: { closest: (selector) => {
      return selector === "[data-product-record-fill-channel]"
        ? { dataset: { productRecordFillChannel: channel } } : null;
    } } });
    assert.equal(context.productRecordAttributeEditor.hidden, false);
    assert.equal(context.productRecordAttributeTitle.textContent, `${channel}类目属性`);
    assert.equal(values[channel].brand, "");
    context.productRecordUseRecommended.listeners.click();
    assert.equal(values[channel].brand, "清风");
    assert.equal(values[other].brand, "另一渠道手工品牌");
    assert.equal(context.messages.at(-1), `已填入${channel}推荐属性，请确认后保存`);
  });
}

test("进入不同商品详情时展示对应主图，不残留上一个商品", () => {
  const context = setup();
  const items = vm.runInContext("productRecordItems", context);
  for (const item of items) {
    context.openProductRecordDetail(item);
    const html = context.productRecordMainImages.innerHTML;
    assert.ok(html.includes(`product-record-thumb ${item.visual}`));
    assert.ok(html.includes(`aria-label="${item.name}商品主图"`));
    assert.equal((html.match(/role="img"/g) || []).length, 1);
    assert.equal(context.productRecordDetailName.textContent, item.name);
    assert.equal(context.productRecordDetailView.hidden, false);
    assert.equal(context.productRecordDetailScroll.scrollTop, 0);
    context.closeProductRecordDetail();
  }
});

test("商品名称中的特殊字符不会破坏主图属性", () => {
  const context = setup();
  context.openProductRecordDetail({ name: '纸巾"<测试>&', id: "123456", barcode: "123456", visual: "tissue" });
  assert.ok(context.productRecordMainImages.innerHTML.includes('aria-label="纸巾&quot;&lt;测试&gt;&amp;商品主图"'));
  assert.equal(context.productRecordMainImages.innerHTML.includes("<测试>"), false);
});

test("保存推荐属性后，同步详情内容与已填数量", () => {
  const context = setup();
  const block = element();
  context.document.querySelector = () => block;
  context.openProductRecordAttributeEditor("美团");
  context.applyProductRecordRecommendedAttributes();
  context.openProductRecordFabricSheet();
  vm.runInContext('productRecordFabricDraft = [{material:"棉",percent:"100"}]', context);
  context.confirmProductRecordFabric();
  context.openProductRecordAlcoholSheet();
  context.productRecordAlcoholInput.value = "8";
  context.productRecordAlcoholUnit.value = "%vol";
  context.confirmProductRecordAlcohol();
  context.productRecordSaveAttributes.listeners.click();
  assert.equal(block.textContent, "（已填10/16）");
  assert.match(block.innerHTML, /<dt>品牌<\/dt><dd>清风<\/dd>/);
  assert.match(block.innerHTML, /<dt>酒精度<\/dt><dd>8%vol<\/dd>/);
  assert.equal((block.innerHTML.match(/<dt>/g) || []).length, 10);
  assert.equal(context.productRecordAttributeEditor.hidden, true);
});

test("面料成份仅在美团展示，淘宝不增加字段或必填校验", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("美团");
  assert.match(context.productRecordAttributeFields.innerHTML, /面料成份/);
  context.openProductRecordAttributeEditor("淘宝");
  assert.equal(context.productRecordAttributeFields.innerHTML.includes("面料成份"), false);
  assert.equal(context.getProductRecordAttributeDefinitions("淘宝").some((field) => field.key === "fabric"), false);
});

test("面料专属面板支持追加，关闭丢弃草稿，确认后回填且按商品隔离", () => {
  const context = setup();
  const [first, second] = vm.runInContext("productRecordItems", context);
  context.openProductRecordDetail(first);
  context.openProductRecordAttributeEditor("美团");
  context.openProductRecordAttributeInput("fabric");
  assert.equal(context.productRecordFabricSheet.hidden, false);
  assert.equal(context.productRecordAttributeInputSheet.hidden, true);
  context.productRecordFabricAdd.listeners.click();
  assert.equal(vm.runInContext("productRecordFabricDraft.length", context), 2);
  vm.runInContext('productRecordFabricDraft = [{material:"棉",percent:"60"},{material:"聚酯纤维",percent:"40"}]', context);
  context.confirmProductRecordFabric();
  assert.equal(context.productRecordFabricSheet.hidden, true);
  assert.match(context.productRecordAttributeFields.innerHTML, /棉 60%、聚酯纤维 40%/);
  context.openProductRecordFabricSheet();
  vm.runInContext('productRecordFabricDraft[0].percent = "50"', context);
  context.productRecordFabricClose.listeners.click();
  context.openProductRecordFabricSheet();
  assert.equal(vm.runInContext("productRecordFabricDraft[0].percent", context), "60");
  context.closeProductRecordDetail();
  context.openProductRecordDetail(second);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.fabric", context), "");
  context.openProductRecordDetail(first);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.fabric", context), "棉 60%、聚酯纤维 40%");
  context.applyProductRecordRecommendedAttributes();
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.fabric", context), "棉 60%、聚酯纤维 40%");
});

for (const [name, rows, expected] of [
  ["空值", [], "请填写"],
  ["缺少面料", [{material:"",percent:"100"}], "完整填写"],
  ["缺少比例", [{material:"棉",percent:""}], "完整填写"],
  ["负数", [{material:"棉",percent:"-1"}], "大于0"],
  ["超限", [{material:"棉",percent:"101"}], "不超过100"],
  ["非数字", [{material:"棉",percent:"NaN"}], "大于0"],
  ["合计不足", [{material:"棉",percent:"60"}], "合计须为100"],
  ["合计超出", [{material:"棉",percent:"60"},{material:"聚酯纤维",percent:"60"}], "合计须为100"]
]) {
  test(`面料成份校验：${name}`, () => {
    assert.ok(setup().validateProductRecordFabric(rows).error.includes(expected));
  });
}

test("面料成份支持小数占比和自填名称，空白追加行不影响确认", () => {
  const context = setup();
  const result = context.validateProductRecordFabric([
    {material:" 棉 ",percent:"60.5"},{material:"自填面料",percent:"39.5"},{material:"",percent:""}
  ]);
  assert.equal(result.error, undefined);
  assert.equal(result.rows.length, 2);
  assert.equal(context.formatProductRecordFabric(result.rows), "棉 60.5%、自填面料 39.5%");
});

test("未填面料无法保存美团属性，无效草稿不会覆盖已确认值", () => {
  const context = setup();
  context.openProductRecordDetail(vm.runInContext("productRecordItems[0]", context));
  context.openProductRecordAttributeEditor("美团");
  context.productRecordSaveAttributes.listeners.click();
  assert.equal(context.messages.at(-1), "请完善必填属性：面料成份");
  context.openProductRecordFabricSheet();
  vm.runInContext('productRecordFabricDraft = [{material:"棉",percent:"50"}]', context);
  context.confirmProductRecordFabric();
  assert.equal(context.productRecordFabricSheet.hidden, false);
  assert.equal(context.productRecordFabricError.hidden, false);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.fabric", context), "");
});

test("面料面板入口与页面片段结构同步且无重复ID", () => {
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const block = html.match(/<div class="product-record-fabric-sheet"[\s\S]*?<\/section>\s*<\/div>/)?.[0];
    assert.ok(block);
    assert.match(block, /添加新内容/);
    assert.match(block, /聚酯纤维 100 %/);
    const ids = [...html.matchAll(/id="(productRecordFabric\w+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    return block.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});

test("美团品牌使用选择面板，淘宝及其他属性仍使用原输入框", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("美团");
  context.openProductRecordAttributeInput("brand");
  assert.equal(context.productRecordBrandSheet.hidden, false);
  assert.equal(context.productRecordAttributeInputSheet.hidden, true);
  assert.equal(context.productRecordFabricSheet.hidden, true);
  assert.match(context.productRecordBrandList.innerHTML, /selected[\s\S]*?data-product-record-brand="清风" aria-pressed="true"/);
  context.openProductRecordAttributeEditor("淘宝");
  context.openProductRecordAttributeInput("brand");
  assert.equal(context.productRecordBrandSheet.hidden, true);
  assert.equal(context.productRecordAttributeInputSheet.hidden, false);
  assert.equal(context.productRecordAttributeInputTitle.textContent, "填写品牌");
  context.openProductRecordAttributeEditor("美团");
  context.openProductRecordAttributeInput("layers");
  assert.equal(context.productRecordAttributeInputTitle.textContent, "填写层数");
});

test("品牌列表包含截图选项，搜索支持空白处理和忽略大小写", () => {
  const context = setup();
  const values = vm.runInContext("productRecordAttributeValues", context);
  values.美团.brand = "杏花楼";
  assert.deepEqual(Array.from(context.getProductRecordBrandOptions()), ["杏花楼", "全福月饼", "开县冰薄月饼", "华美月饼", "冉嘉月饼", "君缘月饼", "美心月饼", "金九月饼"]);
  assert.equal(context.getProductRecordBrandOptions(" 月饼 ").length, 7);
  assert.deepEqual(Array.from(context.getProductRecordBrandOptions("美")), ["华美月饼", "美心月饼"]);
  values.美团.brand = "Example BRAND";
  assert.deepEqual(Array.from(context.getProductRecordBrandOptions(" brand ")), ["Example BRAND"]);
});

test("品牌搜索无结果显示空状态，清空后恢复完整列表", () => {
  const context = setup();
  context.openProductRecordAttributeInput("brand");
  context.productRecordBrandSearch.value = "不存在的品牌";
  let prevented = false;
  context.productRecordBrandSearchForm.listeners.submit({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(context.productRecordBrandList.innerHTML, "");
  assert.equal(context.productRecordBrandEmpty.hidden, false);
  context.productRecordBrandSearch.value = "";
  context.productRecordBrandSearch.listeners.input();
  assert.equal(context.productRecordBrandEmpty.hidden, true);
  assert.match(context.productRecordBrandList.innerHTML, /金九月饼/);
});

test("选择品牌直接回填，重新展开保留勾选，不修改淘宝值", () => {
  const context = setup();
  const values = vm.runInContext("productRecordAttributeValues", context);
  const previousTaobao = values.淘宝.brand;
  context.openProductRecordAttributeInput("brand");
  context.productRecordBrandList.listeners.click({ target: { closest: () => ({ dataset: { productRecordBrand: "杏花楼" } }) } });
  assert.equal(values.美团.brand, "杏花楼");
  assert.equal(values.淘宝.brand, previousTaobao);
  assert.equal(context.productRecordBrandSheet.hidden, true);
  assert.match(context.productRecordAttributeFields.innerHTML, /品牌：杏花楼/);
  context.openProductRecordAttributeInput("brand");
  assert.match(context.productRecordBrandList.innerHTML, /selected[\s\S]*?data-product-record-brand="杏花楼" aria-pressed="true"/);
  assert.equal((context.productRecordBrandList.innerHTML.match(/aria-pressed="true"/g) || []).length, 1);
});

test("关闭、遮罩及 Escape 不修改原品牌，再次展开清空搜索", () => {
  const context = setup();
  for (const close of [
    () => context.productRecordBrandClose.listeners.click(),
    () => context.productRecordBrandBackdrop.listeners.click(),
    () => context.productRecordBrandSheet.listeners.keydown({ key: "Escape", preventDefault() {} })
  ]) {
    context.openProductRecordAttributeInput("brand");
    context.productRecordBrandSearch.value = "华美";
    close();
    assert.equal(context.productRecordBrandSheet.hidden, true);
    assert.equal(vm.runInContext("productRecordAttributeValues.美团.brand", context), "清风");
    context.openProductRecordAttributeInput("brand");
    assert.equal(context.productRecordBrandSearch.value, "");
    assert.match(context.productRecordBrandList.innerHTML, /全福月饼/);
  }
  context.openProductRecordFabricSheet();
  assert.equal(context.productRecordBrandSheet.hidden, true);
  context.openProductRecordBrandSheet();
  assert.equal(context.productRecordFabricSheet.hidden, true);
  context.productRecordAttributeBack.listeners.click();
  assert.equal(context.productRecordBrandSheet.hidden, true);
});

test("品牌当前值中的 HTML 特殊字符安全转义，不接受列表外选项", () => {
  const context = setup();
  vm.runInContext('productRecordAttributeValues.美团.brand = \'品牌"<测试>&\'', context);
  context.openProductRecordAttributeInput("brand");
  assert.match(context.productRecordBrandList.innerHTML, /品牌&quot;&lt;测试&gt;&amp;/);
  assert.equal(context.productRecordBrandList.innerHTML.includes("<测试>"), false);
  context.productRecordBrandList.listeners.click({ target: { closest: () => ({ dataset: { productRecordBrand: "未知品牌" } }) } });
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.brand", context), '品牌"<测试>&');
});

test("品牌面板的入口与页面片段同步，DOM 引用完整", () => {
  const state = readFileSync(join(root, "js/核心/状态与DOM引用.js"), "utf8");
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const block = html.match(/<div class="product-record-brand-sheet"[\s\S]*?<\/section>\s*<\/div>/)?.[0];
    assert.ok(block);
    assert.match(block, /请输入关键字/);
    assert.match(block, /type="submit">搜索/);
    const ids = [...html.matchAll(/id="(productRecordBrand\w+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids.filter(id => id !== "productRecordBrandTitle")) assert.ok(state.includes(`document.querySelector("#${id}")`));
    return block.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});

function setCategoryChecked(context, value, checked) {
  context.productRecordCategoryList.listeners.change({ target: { value, checked, matches: () => true } });
}

test("商品类别仅在美团使用多选面板，淘宝仍使用原输入框", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("美团");
  context.openProductRecordAttributeInput("category");
  assert.equal(context.productRecordCategorySheet.hidden, false);
  assert.equal(context.productRecordAttributeInputSheet.hidden, true);
  assert.match(context.productRecordCategoryList.innerHTML, /value="其他" checked/);
  context.openProductRecordAttributeEditor("淘宝");
  context.openProductRecordAttributeInput("category");
  assert.equal(context.productRecordCategorySheet.hidden, true);
  assert.equal(context.productRecordAttributeInputSheet.hidden, false);
  assert.equal(context.productRecordAttributeInputTitle.textContent, "填写商品类别");
});

test("商品类别选项按截图顺序展示，支持关键字检索", () => {
  const context = setup();
  assert.deepEqual(Array.from(context.getProductRecordCategoryOptions()), ["其他", "滇式月饼", "徽式月饼", "衢式月饼", "京式月饼", "广式月饼", "秦式月饼", "冰淇淋月饼", "台式月饼", "苏式月饼", "港式月饼", "潮式月饼", "冰皮月饼"]);
  assert.deepEqual(Array.from(context.getProductRecordCategoryOptions(" 冰 ")), ["冰淇淋月饼", "冰皮月饼"]);
  assert.equal(context.getProductRecordCategoryOptions("月饼").length, 12);
});

test("商品类别勾选仅修改草稿，确定后回填多项且不修改淘宝", () => {
  const context = setup();
  const values = vm.runInContext("productRecordAttributeValues", context);
  context.openProductRecordAttributeInput("category");
  setCategoryChecked(context, "其他", false);
  setCategoryChecked(context, "冰皮月饼", true);
  setCategoryChecked(context, "广式月饼", true);
  setCategoryChecked(context, "广式月饼", true);
  assert.equal(values.美团.category, "其他");
  context.productRecordCategoryConfirm.listeners.click();
  assert.equal(values.美团.category, "广式月饼、冰皮月饼");
  assert.equal(values.淘宝.category, "其他");
  assert.equal(context.productRecordCategorySheet.hidden, true);
  assert.match(context.productRecordAttributeFields.innerHTML, /商品类别：广式月饼、冰皮月饼/);
  context.openProductRecordAttributeInput("category");
  assert.match(context.productRecordCategoryList.innerHTML, /value="广式月饼" checked/);
  assert.match(context.productRecordCategoryList.innerHTML, /value="冰皮月饼" checked/);
});

test("搜索和清空关键字不会丢失已勾选但暂时隐藏的类别", () => {
  const context = setup();
  context.openProductRecordAttributeInput("category");
  setCategoryChecked(context, "其他", false);
  setCategoryChecked(context, "广式月饼", true);
  context.productRecordCategorySearch.value = "冰";
  let prevented = false;
  context.productRecordCategorySearchForm.listeners.submit({ preventDefault() { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(context.productRecordCategoryList.innerHTML.includes("广式月饼"), false);
  setCategoryChecked(context, "冰皮月饼", true);
  context.productRecordCategorySearch.value = "不存在的类别";
  context.renderProductRecordCategoryOptions();
  assert.equal(context.productRecordCategoryList.innerHTML, "");
  assert.equal(context.productRecordCategoryEmpty.hidden, false);
  context.productRecordCategorySearch.value = "";
  context.productRecordCategorySearch.listeners.input();
  assert.equal(context.productRecordCategoryEmpty.hidden, true);
  assert.match(context.productRecordCategoryList.innerHTML, /value="广式月饼" checked/);
  assert.match(context.productRecordCategoryList.innerHTML, /value="冰皮月饼" checked/);
  context.confirmProductRecordCategories();
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.category", context), "广式月饼、冰皮月饼");
});

test("取消、关闭、遮罩和 Escape 均丢弃本次类别勾选", () => {
  const context = setup();
  for (const close of [
    () => context.productRecordCategoryCancel.listeners.click(),
    () => context.productRecordCategoryClose.listeners.click(),
    () => context.productRecordCategoryBackdrop.listeners.click(),
    () => context.productRecordCategorySheet.listeners.keydown({ key: "Escape", preventDefault() {} })
  ]) {
    context.openProductRecordAttributeInput("category");
    setCategoryChecked(context, "广式月饼", true);
    context.productRecordCategorySearch.value = "广式";
    close();
    assert.equal(context.productRecordCategorySheet.hidden, true);
    assert.equal(vm.runInContext("productRecordAttributeValues.美团.category", context), "其他");
    context.openProductRecordAttributeInput("category");
    assert.equal(context.productRecordCategorySearch.value, "");
    assert.equal(vm.runInContext('productRecordCategoryDraft.has("广式月饼")', context), false);
  }
});

test("商品类别必填校验不覆盖原值，补选后可以正常确定", () => {
  const context = setup();
  context.openProductRecordAttributeInput("category");
  setCategoryChecked(context, "其他", false);
  context.confirmProductRecordCategories();
  assert.equal(context.productRecordCategorySheet.hidden, false);
  assert.equal(context.productRecordCategoryError.hidden, false);
  assert.equal(context.productRecordCategoryError.textContent, "请选择至少一个商品类别");
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.category", context), "其他");
  setCategoryChecked(context, "广式月饼", true);
  assert.equal(context.productRecordCategoryError.hidden, true);
  context.confirmProductRecordCategories();
  assert.equal(context.productRecordCategorySheet.hidden, true);
});

test("商品类别保留既有自定义值并安全转义，拒绝伪造选项", () => {
  const context = setup();
  const values = vm.runInContext("productRecordAttributeValues", context);
  values.美团.category = '其他, 自定义"<类别>&，广式月饼';
  context.openProductRecordAttributeInput("category");
  assert.match(context.productRecordCategoryList.innerHTML, /自定义&quot;&lt;类别&gt;&amp;/);
  assert.equal(context.productRecordCategoryList.innerHTML.includes("<类别>"), false);
  assert.equal((context.productRecordCategoryList.innerHTML.match(/value="广式月饼"/g) || []).length, 1);
  setCategoryChecked(context, "未知选项", true);
  assert.equal(vm.runInContext('productRecordCategoryDraft.has("未知选项")', context), false);
  context.confirmProductRecordCategories();
  assert.equal(values.美团.category, '其他、广式月饼、自定义"<类别>&');
});

test("返回属性页或打开其他面板时关闭商品类别并丢弃草稿", () => {
  const context = setup();
  for (const leave of [
    () => context.productRecordAttributeBack.listeners.click(),
    () => context.openProductRecordBrandSheet(),
    () => context.openProductRecordFabricSheet(),
    () => context.closeProductRecordDetail()
  ]) {
    context.openProductRecordAttributeEditor("美团");
    context.openProductRecordAttributeInput("category");
    setCategoryChecked(context, "广式月饼", true);
    leave();
    assert.equal(context.productRecordCategorySheet.hidden, true);
    assert.equal(vm.runInContext("productRecordCategoryDraft.size", context), 0);
    assert.equal(vm.runInContext("productRecordAttributeValues.美团.category", context), "其他");
  }
});

test("商品类别面板入口与页面片段一致，搜索和双按钮完整", () => {
  const state = readFileSync(join(root, "js/核心/状态与DOM引用.js"), "utf8");
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const block = html.match(/<div class="product-record-category-sheet"[\s\S]*?<\/section>\s*<\/div>/)?.[0];
    assert.ok(block);
    assert.match(block, /请输入关键字/);
    assert.match(block, /type="submit">搜索/);
    assert.match(block, /id="productRecordCategoryCancel" type="button">取消/);
    assert.match(block, /id="productRecordCategoryConfirm" type="button">确定/);
    const ids = [...html.matchAll(/id="(productRecordCategory\w+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids.filter(id => id !== "productRecordCategoryTitle")) assert.ok(state.includes(`document.querySelector("#${id}")`));
    return block.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});

test("酒精度在美团商品类别之后展示，淘宝不增加该字段", () => {
  const context = setup();
  const definitions = context.getProductRecordAttributeDefinitions("美团");
  assert.equal(definitions.findIndex(field => field.key === "alcohol"), definitions.findIndex(field => field.key === "category") + 1);
  assert.equal(definitions.find(field => field.key === "alcohol").required, true);
  context.openProductRecordAttributeEditor("美团");
  context.openProductRecordAttributeInput("alcohol");
  assert.equal(context.productRecordAlcoholSheet.hidden, false);
  assert.equal(context.productRecordAttributeInputSheet.hidden, true);
  assert.equal(context.productRecordAlcoholInput.value, "");
  assert.equal(context.productRecordAlcoholUnit.value, "");
  context.openProductRecordAttributeEditor("淘宝");
  assert.equal(context.productRecordAlcoholSheet.hidden, true);
  assert.equal(context.productRecordAttributeFields.innerHTML.includes("酒精度"), false);
  assert.equal(context.getProductRecordAttributeDefinitions("淘宝").some(field => field.key === "alcohol"), false);
});

for (const [name, amount, unit, error] of [
  ["空值", "", "%vol", "请输入"],
  ["空白", "  ", "%vol", "请输入"],
  ["非数字", "abc", "%vol", "0至100"],
  ["负数", "-1", "%vol", "0至100"],
  ["超限", "100.1", "%vol", "0至100"],
  ["无穷大", "Infinity", "%vol", "0至100"],
  ["缺少单位", "8", "", "请选择酒精度单位"],
  ["非法单位", "8", "kg", "请选择酒精度单位"]
]) {
  test(`酒精度校验：${name}`, () => {
    assert.ok(setup().validateProductRecordAlcohol(amount, unit).error.includes(error));
  });
}

test("酒精度支持0、100和小数，按数值及单位格式回填", () => {
  const context = setup();
  for (const [amount, expected] of [["0", "0%vol"], ["100", "100%vol"], ["08.50", "8.5%vol"]]) {
    const result = context.validateProductRecordAlcohol(amount, "%vol");
    assert.equal(result.error, undefined);
    assert.equal(context.formatProductRecordAlcohol(result.value), expected);
  }
  assert.equal(context.formatProductRecordAlcohol(), "");
});

test("酒精度确认后回填并按商品保留，使用推荐不覆盖已确认值", () => {
  const context = setup();
  const [first, second] = vm.runInContext("productRecordItems", context);
  context.openProductRecordDetail(first);
  context.openProductRecordAttributeInput("alcohol");
  context.productRecordAlcoholInput.value = "8.5";
  context.productRecordAlcoholUnit.value = "%vol";
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.alcohol", context), "");
  context.productRecordAlcoholConfirm.listeners.click();
  assert.equal(context.productRecordAlcoholSheet.hidden, true);
  assert.match(context.productRecordAttributeFields.innerHTML, /酒精度：8.5%vol/);
  context.applyProductRecordRecommendedAttributes();
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.alcohol", context), "8.5%vol");
  context.openProductRecordAlcoholSheet();
  assert.equal(context.productRecordAlcoholInput.value, "8.5");
  assert.equal(context.productRecordAlcoholUnit.value, "%vol");
  context.closeProductRecordDetail();
  context.openProductRecordDetail(second);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.alcohol", context), "");
  context.openProductRecordDetail(first);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.alcohol", context), "8.5%vol");
});

test("酒精度关闭、遮罩和 Escape 丢弃编辑，Enter 可确认数值", () => {
  const context = setup();
  for (const close of [
    () => context.productRecordAlcoholClose.listeners.click(),
    () => context.productRecordAlcoholBackdrop.listeners.click(),
    () => context.productRecordAlcoholSheet.listeners.keydown({ key: "Escape", preventDefault() {} })
  ]) {
    context.openProductRecordAlcoholSheet();
    context.productRecordAlcoholInput.value = "40";
    context.productRecordAlcoholUnit.value = "%vol";
    close();
    assert.equal(context.productRecordAlcoholSheet.hidden, true);
    context.openProductRecordAlcoholSheet();
    assert.equal(context.productRecordAlcoholInput.value, "");
    assert.equal(context.productRecordAlcoholUnit.value, "");
  }
  context.productRecordAlcoholInput.value = "0";
  context.productRecordAlcoholUnit.value = "%vol";
  context.productRecordAlcoholInput.listeners.keydown({ key: "Enter", preventDefault() {} });
  assert.equal(context.productRecordAlcoholSheet.hidden, true);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.alcohol", context), "0%vol");
});

test("无效酒精度不覆盖已确认值，修改后清除错误提示", () => {
  const context = setup();
  context.openProductRecordAlcoholSheet();
  context.productRecordAlcoholInput.value = "8";
  context.productRecordAlcoholUnit.value = "%vol";
  context.confirmProductRecordAlcohol();
  context.openProductRecordAlcoholSheet();
  context.productRecordAlcoholInput.value = "101";
  context.confirmProductRecordAlcohol();
  assert.equal(context.productRecordAlcoholSheet.hidden, false);
  assert.equal(context.productRecordAlcoholError.hidden, false);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.alcohol", context), "8%vol");
  context.productRecordAlcoholInput.listeners.input();
  assert.equal(context.productRecordAlcoholError.hidden, true);
  context.productRecordAlcoholError.hidden = false;
  context.productRecordAlcoholUnit.listeners.change();
  assert.equal(context.productRecordAlcoholError.hidden, true);
});

test("美团酒精度必填，推荐不使用截图示例自动填值", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("美团");
  context.applyProductRecordRecommendedAttributes();
  context.openProductRecordFabricSheet();
  vm.runInContext('productRecordFabricDraft = [{material:"棉",percent:"100"}]', context);
  context.confirmProductRecordFabric();
  context.productRecordSaveAttributes.listeners.click();
  assert.equal(context.messages.at(-1), "请完善必填属性：酒精度");
  assert.equal(context.productRecordAttributeEditor.hidden, false);
  assert.equal(vm.runInContext("productRecordAttributeValues.美团.alcohol", context), "");
  context.openProductRecordAttributeEditor("淘宝");
  context.productRecordSaveAttributes.listeners.click();
  assert.equal(context.productRecordAttributeEditor.hidden, true);
});

test("返回或切换其他面板时关闭酒精度，互不叠加", () => {
  const context = setup();
  for (const leave of [
    () => context.productRecordAttributeBack.listeners.click(),
    () => context.openProductRecordBrandSheet(),
    () => context.openProductRecordCategorySheet(),
    () => context.openProductRecordFabricSheet(),
    () => context.closeProductRecordDetail()
  ]) {
    context.openProductRecordAttributeEditor("美团");
    context.openProductRecordAlcoholSheet();
    context.productRecordAlcoholInput.value = "40";
    leave();
    assert.equal(context.productRecordAlcoholSheet.hidden, true);
    assert.equal(context.productRecordAlcoholInput.value, "");
    context.openProductRecordAlcoholSheet();
    assert.equal(context.productRecordBrandSheet.hidden, true);
    assert.equal(context.productRecordCategorySheet.hidden, true);
    assert.equal(context.productRecordFabricSheet.hidden, true);
  }
});

test("酒精度面板入口与页面片段同步，含示例、数值、单位及确定按钮", () => {
  const state = readFileSync(join(root, "js/核心/状态与DOM引用.js"), "utf8");
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const block = html.match(/<div class="product-record-alcohol-sheet"[\s\S]*?<\/section>\s*<\/div>/)?.[0];
    assert.ok(block);
    assert.match(block, />40%vol<\/p>/);
    assert.match(block, /placeholder="请输入数值"/);
    assert.match(block, /<option value="%vol">%vol<\/option>/);
    assert.match(block, /id="productRecordAlcoholConfirm" type="button">确定/);
    assert.match(html, /已填6\/16/);
    const ids = [...html.matchAll(/id="(productRecordAlcohol\w+)"/g)].map((match) => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids.filter(id => id !== "productRecordAlcoholTitle")) assert.ok(state.includes(`document.querySelector("#${id}")`));
    return block.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});

test("抖店类目属性位于淘宝下方，移动端入口与页面片段一致", () => {
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const douyin = html.match(/<article class="product-record-attribute-block">\s*<header><h2>抖店类目属性[\s\S]*?<\/article>/)?.[0];
    assert.ok(douyin);
    assert.ok(html.indexOf('data-product-record-fill-channel="淘宝"') < html.indexOf(douyin));
    assert.match(douyin, /已填1\/7/);
    assert.match(douyin, /data-product-record-fill-channel="抖店"/);
    assert.match(douyin, /<dt>品牌<\/dt><dd>其它<\/dd>/);
    return douyin.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});

test("抖店使用七个独立属性，不混入美团和淘宝字段", () => {
  const context = setup();
  const douyin = context.getProductRecordAttributeDefinitions("抖店");
  assert.deepEqual(Array.from(douyin, field => field.key), ["brand", "taste", "quantity", "saleMethod", "qualityCertification", "hotTime", "fruitVariety"]);
  assert.deepEqual(Array.from(douyin, field => field.label), ["品牌", "口味", "个数", "售卖方式", "品质认证", "热卖时间", "水果品种"]);
  assert.equal(douyin.find(field => field.key === "brand").recommended, "其它");
  assert.equal(douyin.find(field => field.key === "fruitVariety").required, true);
  assert.equal(context.getProductRecordAttributeDefinitions("美团").some(field => field.key === "taste"), false);
  assert.equal(context.getProductRecordAttributeDefinitions("淘宝").some(field => field.key === "fruitVariety"), false);
  assert.deepEqual(Object.keys(vm.runInContext("productRecordAttributeValues.抖店", context)), ["brand", "taste", "quantity", "saleMethod", "qualityCertification", "hotTime", "fruitVariety"]);
});

test("点击抖店填写入口进入对应移动端编辑页", () => {
  const context = setup();
  context.productRecordDetailView.listeners.click({ target: { closest: (selector) => selector === "[data-product-record-fill-channel]"
    ? { dataset: { productRecordFillChannel: "抖店" } } : null } });
  assert.equal(context.productRecordAttributeEditor.hidden, false);
  assert.equal(context.productRecordAttributeTitle.textContent, "抖店类目属性");
  assert.equal((context.productRecordAttributeFields.innerHTML.match(/product-record-attribute-field/g) || []).length, 7);
  for (const label of ["品牌", "口味", "个数", "售卖方式", "品质认证", "热卖时间", "水果品种"]) {
    assert.ok(context.productRecordAttributeFields.innerHTML.includes(label));
  }
});

test("口味下拉按新截图展示六项和新建入口，点选后回填", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("抖店");
  context.openProductRecordAttributeInput("taste");
  assert.equal(context.productRecordFruitVarietySheet.hidden, false);
  assert.equal(context.productRecordFruitVarietyTitle.textContent, "口味");
  assert.equal(context.productRecordFruitVarietyCreate.textContent, "＋新建口味");
  assert.deepEqual(Array.from(vm.runInContext("productRecordCreatableConfigs.taste.options", context)), ["脆爽清甜", "脆爽甘甜", "脆爽酸甜", "软糯清甜", "软糯甘甜", "软糯酸甜"]);
  assert.equal((context.productRecordFruitVarietyList.innerHTML.match(/data-product-record-creatable-option=/g) || []).length, 6);
  context.productRecordFruitVarietyList.listeners.click({ target: { closest: () => ({ dataset: { productRecordCreatableOption: "软糯甘甜" } }) } });
  assert.equal(vm.runInContext("productRecordAttributeValues.抖店.taste", context), "软糯甘甜");
  assert.equal(context.productRecordFruitVarietySheet.hidden, true);
  assert.match(context.productRecordAttributeFields.innerHTML, /口味：软糯甘甜/);
});

test("水果品种使用独立下拉和新建字样，不与口味选项混用", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("抖店");
  context.openProductRecordAttributeInput("fruitVariety");
  assert.equal(context.productRecordFruitVarietyTitle.textContent, "水果品种");
  assert.equal(context.productRecordFruitVarietyCreate.textContent, "＋新建水果品种");
  assert.match(context.productRecordFruitVarietyList.innerHTML, /观么冬桃/);
  assert.match(context.productRecordFruitVarietyList.innerHTML, /镇宁水蜜桃/);
  assert.match(context.productRecordFruitVarietyList.innerHTML, /镇远猕猴桃/);
  assert.match(context.productRecordFruitVarietyList.innerHTML, /青州蜜桃/);
  assert.match(context.productRecordFruitVarietyList.innerHTML, /鹰嘴桃/);
  assert.match(context.productRecordFruitVarietyList.innerHTML, /黑桃/);
  assert.equal(context.productRecordFruitVarietyList.innerHTML.includes("脆爽清甜"), false);
});

test("点击新建在当前移动端面板内展开输入、绿色确认和红色取消", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("抖店");
  context.openProductRecordAttributeInput("taste");
  context.productRecordFruitVarietyCreate.listeners.click();
  assert.equal(context.productRecordFruitVarietyCreate.hidden, true);
  assert.equal(context.productRecordFruitVarietyCreateRow.hidden, false);
  assert.equal(context.productRecordFruitVarietyInput.placeholder, "请输入自定义属性");
  context.productRecordFruitVarietyInput.value = "";
  context.productRecordFruitVarietyCreateConfirm.listeners.click();
  assert.equal(context.messages.at(-1), "请输入自定义属性");
  assert.equal(context.productRecordFruitVarietySheet.hidden, false);
  context.productRecordFruitVarietyInput.value = "清甜多汁";
  context.productRecordFruitVarietyCreateConfirm.listeners.click();
  assert.equal(vm.runInContext("productRecordAttributeValues.抖店.taste", context), "清甜多汁");
  assert.equal(vm.runInContext('productRecordCreatableConfigs.taste.options.includes("清甜多汁")', context), true);
  assert.equal(vm.runInContext('productRecordCreatableConfigs.fruitVariety.options.includes("清甜多汁")', context), false);
  assert.equal(context.messages.at(-1), "口味已新建并选中");
  assert.equal(context.productRecordFruitVarietySheet.hidden, true);
  context.openProductRecordAttributeInput("taste");
  assert.match(context.productRecordFruitVarietyList.innerHTML, /清甜多汁/);
  assert.match(context.productRecordFruitVarietyList.innerHTML, /selected[\s\S]*清甜多汁/);
});

test("新建取消与 Escape 只收起输入，再次 Escape 才关闭下拉", () => {
  const context = setup();
  context.openProductRecordAttributeEditor("抖店");
  context.openProductRecordAttributeInput("fruitVariety");
  context.productRecordFruitVarietyCreate.listeners.click();
  context.productRecordFruitVarietyInput.value = "未保存新品种";
  context.productRecordFruitVarietyCreateCancel.listeners.click();
  assert.equal(context.productRecordFruitVarietyCreateRow.hidden, true);
  assert.equal(context.productRecordFruitVarietyCreate.hidden, false);
  assert.equal(vm.runInContext("productRecordAttributeValues.抖店.fruitVariety", context), "");
  context.productRecordFruitVarietyCreate.listeners.click();
  context.productRecordFruitVarietySheet.listeners.keydown({ key: "Escape", preventDefault() {} });
  assert.equal(context.productRecordFruitVarietySheet.hidden, false);
  assert.equal(context.productRecordFruitVarietyCreateRow.hidden, true);
  context.productRecordFruitVarietySheet.listeners.keydown({ key: "Escape", preventDefault() {} });
  assert.equal(context.productRecordFruitVarietySheet.hidden, true);
});

test("抖店保存校验水果品种，保存后同步已填数量与详情", () => {
  const context = setup();
  const block = element();
  context.document.querySelector = () => block;
  context.openProductRecordAttributeEditor("抖店");
  context.productRecordSaveAttributes.listeners.click();
  assert.equal(context.messages.at(-1), "请完善必填属性：水果品种");
  context.openProductRecordAttributeInput("fruitVariety");
  context.productRecordFruitVarietyList.listeners.click({ target: { closest: () => ({ dataset: { productRecordCreatableOption: "青州蜜桃" } }) } });
  context.openProductRecordAttributeInput("taste");
  context.productRecordFruitVarietyList.listeners.click({ target: { closest: () => ({ dataset: { productRecordCreatableOption: "脆爽酸甜" } }) } });
  context.productRecordSaveAttributes.listeners.click();
  assert.equal(block.textContent, "（已填3/7）");
  assert.match(block.innerHTML, /<dt>品牌<\/dt><dd>其它<\/dd>/);
  assert.match(block.innerHTML, /<dt>口味<\/dt><dd>脆爽酸甜<\/dd>/);
  assert.match(block.innerHTML, /<dt>水果品种<\/dt><dd>青州蜜桃<\/dd>/);
  assert.equal(context.productRecordAttributeEditor.hidden, true);
});

test("使用推荐不覆盖已选或新建的抖店下拉值", () => {
  const context = setup();
  const values = vm.runInContext("productRecordAttributeValues.抖店", context);
  values.taste = "自定义口味";
  values.fruitVariety = "自定义水果";
  context.openProductRecordAttributeEditor("抖店");
  context.applyProductRecordRecommendedAttributes();
  assert.equal(values.brand, "其它");
  assert.equal(values.taste, "自定义口味");
  assert.equal(values.fruitVariety, "自定义水果");
});

test("抖店与可新建下拉的 DOM 在入口页和片段中同步", () => {
  const state = readFileSync(join(root, "js/核心/状态与DOM引用.js"), "utf8");
  const blocks = ["index.html", "页面/同城App功能菜单/同城商品档案.html"].map((path) => {
    const html = readFileSync(join(root, path), "utf8");
    const sheet = html.match(/<div class="product-record-fruit-sheet"[\s\S]*?<\/section>\s*<\/div>/)?.[0];
    assert.ok(sheet);
    assert.match(sheet, /请输入自定义属性/);
    assert.match(sheet, /class="confirm"[\s\S]*>✓<\/button>/);
    assert.match(sheet, /class="cancel"[\s\S]*>×<\/button>/);
    const ids = [...html.matchAll(/id="(productRecordFruitVariety\w+)"/g)].map(match => match[1]);
    assert.equal(new Set(ids).size, ids.length);
    for (const id of ids) assert.ok(state.includes(`document.querySelector("#${id}")`));
    return sheet.replace(/\s+/g, " ");
  });
  assert.equal(blocks[0], blocks[1]);
});
