const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const { join } = require("node:path");
const { test } = require("node:test");
const vm = require("node:vm");

const source = readFileSync(join(__dirname, "../js/同城App/同城App手机预览.js"), "utf8");
const pageNames = ["cityProductsPage", "thirdPartyPhotoPage", "productRecordPage", "imAppPage", "thirdPartyOrderPage"];

function setup(options = {}) {
  const png = new Blob(["test PNG"], { type: "image/png" });
  const calls = { captures: [], writes: [], downloads: [], timers: [], revoked: [], toasts: [], errors: [] };
  const canvas = { toBlob: (callback) => callback(png) };
  const screen = { classList: { contains: () => options.retailOpen !== false }, querySelectorAll: () => [] };
  const button = { disabled: false, textContent: "复制 App 截图", addEventListener() {} };
  const context = vm.createContext({
    console: { error: (...args) => calls.errors.push(args) },
    Blob,
    URL: {
      createObjectURL: (blob) => { assert.equal(blob, png); return "blob:screenshot"; },
      revokeObjectURL: (url) => calls.revoked.push(url)
    },
    document: {
      getElementById: (id) => context[id],
      createElement: () => {
        const link = { click: () => calls.downloads.push({ href: link.href, download: link.download }) };
        return link;
      }
    },
    window: {
      isSecureContext: options.secure !== false,
      getComputedStyle: () => Object.assign(["width"], { getPropertyValue: () => "343px" }),
      setTimeout: (callback, delay) => calls.timers.push({ callback, delay }),
      html2canvas: options.missingRenderer ? undefined : async (target, config) => {
        calls.captures.push({ target, config });
        return options.render ? options.render(target, config, canvas) : canvas;
      }
    },
    navigator: {
      clipboard: options.clipboardMissing ? undefined : {
        write: (items) => {
          calls.writes.push(items);
          return options.write ? options.write(items) : Promise.resolve(items[0].data["image/png"]).then(() => undefined);
        }
      }
    },
    ClipboardItem: class { constructor(data) { this.data = data; } },
    fetch: async () => ({ ok: true, blob: async () => png }),
    tongchengAppScreen: { closest: () => screen, currentSrc: "./assets/tongcheng-app-home.png" },
    copyTongchengAppScreenshot: button,
    openRetailUnionApp: { addEventListener() {} },
    closeRetailUnionApp: { addEventListener() {} },
    showToast: (message) => calls.toasts.push(message),
    ...Object.fromEntries(pageNames.map((name) => [name, {
      id: name, hidden: name !== options.page, querySelectorAll: () => []
    }]))
  });
  vm.runInContext(source, context);
  return { context, calls, button, screen, png };
}

for (const page of pageNames) {
  test(`截图只绘制当前 ${page}，不包含被遮挡的工具页本地背景`, async () => {
    const { context, calls, button } = setup({ page });
    await context.copyTongchengAppScreenshotToClipboard();
    assert.equal(calls.captures[0].target, context[page]);
    assert.equal(calls.captures[0].config.allowTaint, false);
    assert.equal(calls.captures[0].config.scale, 2);
    assert.equal(calls.downloads.length, 0);
    assert.match(calls.toasts.at(-1), /截图已复制/);
    assert.equal(button.disabled, false);
    assert.equal(button.textContent, "复制 App 截图");
  });
}

test("工具页仍截取完整手机容器", async () => {
  const { context, calls, screen } = setup();
  await context.copyTongchengAppScreenshotToClipboard();
  assert.equal(calls.captures[0].target, screen);
});

test("克隆截图保留计算样式和滚动位置，并跳过伪元素替身", async () => {
  const { context, calls } = setup({ page: "productRecordPage" });
  context.productRecordPage.scrollTop = 120;
  context.productRecordPage.scrollLeft = 24;
  await context.createTongchengAppScreenshot(context.productRecordPage);
  const styles = new Map();
  const pseudo = { closest: () => pseudo };
  const clone = {
    closest: () => null,
    querySelectorAll: () => [pseudo],
    style: { setProperty: (property, value) => styles.set(property, value) }
  };
  calls.captures[0].config.onclone({}, clone);
  assert.equal(styles.get("width"), "343px");
  assert.equal(styles.get("animation"), "none");
  assert.equal(styles.get("transition"), "none");
  assert.equal(clone.scrollTop, 120);
  assert.equal(clone.scrollLeft, 24);
});

test("克隆节点数量不一致时明确失败，避免样式错配", async () => {
  const { context, calls } = setup({ page: "productRecordPage" });
  await context.createTongchengAppScreenshot(context.productRecordPage);
  const clone = { closest: () => null, querySelectorAll: () => [{ closest: () => null }] };
  assert.throws(() => calls.captures[0].config.onclone({}, clone), /页面内容已变化/);
});

test("截图会移除 file 协议的受限样式资源，避免画布导出报错", () => {
  const { context } = setup();
  assert.equal(context.sanitizeTongchengScreenshotStyleValue("background-image", 'url("file:///tmp/product.jpg")'), "none");
  assert.equal(context.sanitizeTongchengScreenshotStyleValue("background", 'rgba(255, 255, 255, 1) url("file:///tmp/product.jpg")', "rgb(255, 255, 255)"), "rgb(255, 255, 255)");
  assert.equal(context.sanitizeTongchengScreenshotStyleValue("color", "rgb(0, 0, 0)"), "rgb(0, 0, 0)");
});

test("图片未生成时已经申请剪贴板写入，且阻止重复点击", async () => {
  let finishRender;
  const { context, calls, button, png } = setup({
    page: "productRecordPage",
    render: () => new Promise((resolve) => { finishRender = resolve; })
  });
  const pending = context.copyTongchengAppScreenshotToClipboard();
  assert.equal(button.disabled, true);
  assert.equal(calls.writes.length, 1);
  assert.equal(typeof calls.writes[0][0].data["image/png"].then, "function");
  await context.copyTongchengAppScreenshotToClipboard();
  assert.equal(calls.captures.length, 1);
  finishRender({ toBlob: (callback) => callback(png) });
  await pending;
  assert.equal(button.disabled, false);
});

for (const reason of ["insecure", "missing", "denied", "syncThrow"]) {
  test(`剪贴板不可用时下载当前截图：${reason}`, async () => {
    const { context, calls } = setup({
      page: "productRecordPage",
      secure: reason !== "insecure",
      clipboardMissing: reason === "missing",
      write: reason === "syncThrow" ? () => { throw new Error("NotAllowedError"); }
        : () => Promise.reject(new Error("NotAllowedError"))
    });
    await context.copyTongchengAppScreenshotToClipboard();
    assert.equal(calls.downloads.length, 1);
    assert.equal(calls.downloads[0].download, "同城App截图.png");
    assert.match(calls.toasts.at(-1), /已下载截图/);
    assert.equal(calls.revoked.length, 0);
    calls.timers[0].callback();
    assert.deepEqual(calls.revoked, ["blob:screenshot"]);
  });
}

test("图片生成失败时恢复按钮，不误报复制成功或下载旧图", async () => {
  const { context, calls, button } = setup({
    page: "productRecordPage",
    render: () => { throw new Error("模拟生成异常"); }
  });
  await context.copyTongchengAppScreenshotToClipboard();
  assert.equal(calls.downloads.length, 0);
  assert.equal(calls.toasts.at(-1), "模拟生成异常");
  assert.equal(calls.errors.length, 1);
  assert.equal(button.disabled, false);
});

test("空 PNG 不会复制或下载", async () => {
  const { context, calls, button } = setup({
    page: "productRecordPage",
    render: () => ({ toBlob: (callback) => callback(null) })
  });
  await context.copyTongchengAppScreenshotToClipboard();
  assert.equal(calls.toasts.at(-1), "截图生成失败，请重试");
  assert.equal(calls.downloads.length, 0);
  assert.equal(button.disabled, false);
});

test("资源安全限制提供明确反馈", async () => {
  const { context, calls } = setup({
    page: "productRecordPage",
    render: () => ({ toBlob: () => { throw Object.assign(new Error("tainted canvas"), { name: "SecurityError" }); } })
  });
  await context.copyTongchengAppScreenshotToClipboard();
  assert.match(calls.toasts.at(-1), /浏览器安全限制/);
  assert.equal(calls.downloads.length, 0);
});

test("截图库加载失败提供明确反馈并恢复按钮", async () => {
  const { context, calls, button } = setup({ page: "productRecordPage", missingRenderer: true });
  await context.copyTongchengAppScreenshotToClipboard();
  assert.match(calls.toasts.at(-1), /截图服务加载失败/);
  assert.equal(button.disabled, false);
});

test("手机桌面保留原图复制，读取原图前即申请剪贴板写入", async () => {
  const { context, calls, png } = setup({ retailOpen: false });
  let finishFetch;
  context.fetch = () => new Promise((resolve) => { finishFetch = resolve; });
  const pending = context.copyTongchengAppScreenshotToClipboard();
  assert.equal(calls.writes.length, 1);
  finishFetch({ ok: true, blob: async () => png });
  await pending;
  assert.equal(calls.captures.length, 0);
  assert.match(calls.toasts.at(-1), /截图已复制/);
});

test("手机桌面在禁止读取本地图片时保留原图下载降级", async () => {
  const { context, calls, button } = setup({ retailOpen: false });
  context.fetch = async () => { throw new Error("file fetch blocked"); };
  await context.copyTongchengAppScreenshotToClipboard();
  assert.equal(calls.downloads[0].href, "./assets/tongcheng-app-home.png");
  assert.match(calls.toasts.at(-1), /已下载 App 原图/);
  assert.equal(button.disabled, false);
});

test('自绘开关的克隆使用可容纳伪元素的 SPAN，圆点位移只计算一次', () => {
  const { context } = setup();
  const properties = new Map([['transform','matrix(1, 0, 0, 1, 12, 0)'],['left','2px'],['top','2px']]);
  const pseudo = { style: { getPropertyValue: name => properties.get(name) || '', setProperty: (name,value) => properties.set(name,value) } };
  let child = pseudo, replaced;
  const input = { id:'switch', className:'cp-switch', style:{cssText:'width:30px;background:blue'}, get firstChild(){return child;}, replaceWith: value => replaced=value };
  const span = { style:{}, children:[], appendChild: value => {span.children.push(value);child=null;} };
  const document = { createElement: tag => {assert.equal(tag,'span');return span;} };
  assert.equal(context.normalizeTongchengScreenshotControl(input,document),span);
  assert.equal(replaced,span);
  assert.equal(span.style.cssText,input.style.cssText);
  assert.equal(span.children[0],pseudo);
  assert.equal(properties.get('left'),'14px');
  assert.equal(properties.get('top'),'2px');
  assert.equal(properties.get('transform'),'none');
});

test('选择框的勾号旋转保留，不按纯位移错误展开', () => {
  const { context } = setup();
  const transform='matrix(0.707107, -0.707107, 0.707107, 0.707107, 0, -1)';
  const properties=new Map([['transform',transform],['left','0px'],['top','0px']]);
  const pseudo={style:{getPropertyValue:name=>properties.get(name)||'',setProperty:(name,value)=>properties.set(name,value)}};
  let child=pseudo;
  const input={className:'cp-check',style:{cssText:''},get firstChild(){return child;},replaceWith(){}};
  const span={style:{},children:[],appendChild:value=>{span.children.push(value);child=null;}};
  context.normalizeTongchengScreenshotControl(input,{createElement:()=>span});
  assert.equal(properties.get('transform'),transform);
});

test('冻结截图样式不向每个节点复制继承的大型图片变量', async () => {
  const { context,calls }=setup({page:'cityProductsPage'});
  context.window.getComputedStyle=()=>Object.assign(['width','--city-products-reference','content'],{getPropertyValue:name=>name==='width'?'343px':'url(data:image/png;base64,example)'});
  await context.createTongchengAppScreenshot(context.cityProductsPage);
  const copied=new Map();
  const clone={closest:()=>null,querySelectorAll:()=>[],style:{setProperty:(name,value)=>copied.set(name,value)}};
  calls.captures[0].config.onclone({},clone);
  assert.equal(copied.get('width'),'343px');
  assert.equal(copied.has('--city-products-reference'),false);
  assert.equal(copied.has('content'),false);
});
