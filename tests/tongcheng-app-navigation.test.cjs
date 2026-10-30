const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { test } = require('node:test');
const vm = require('node:vm');
const source = readFileSync(join(__dirname, '../js/同城App/同城App手机预览.js'), 'utf8');
const opening = source.slice(0, source.indexOf('function setRetailUnionAppOpen('));
function setup(controller) {
  const calls = [];
  const context = { window: { tongchengAppTabs: controller },
    document: { body: { classList: { add: value => calls.push(['mode', value]), remove() {} } } },
    setRetailUnionAppOpen: value => calls.push(['home', value]) };
  const pages = ['tongchengAppPage','customTaskPage','tongchengPage','productPoolPage','constructionPage','cityOrderPage','heatmapPage','productAbsenceReportPage','productStockoutReportPage','imReplyRateReportPage','interfacePage','localLifeStorePage','localLifeVerifyPage','localLifeProductPage','localLifeCouponPage','localLifeAfterSalePage','localLifeShopPage','tongchengMenu','interfaceMenu','legacyMenu','pageTabs','cityShelfPlanPage'];
  pages.forEach(name => context[name] = { hidden: false });
  vm.createContext(context); vm.runInContext(opening, context);
  return { context, calls };
}
test('首次刷新时，同名 DOM 元素不能被误当作已初始化的页签控制器', () => {
  const { context, calls } = setup({ nodeType: 1, id: 'tongchengAppTabs' });
  assert.doesNotThrow(() => vm.runInContext('openTongchengAppPage()', context));
  assert.deepEqual(calls.find(([name]) => name === 'home'), ['home', false]);
  assert.equal(context.tongchengAppPage.hidden, false);
  assert.equal(context.tongchengPage.hidden, true);
});
test('再次进入 App 时委托页签恢复当前页，避免重置到手机桌面', () => {
  let resumes = 0;
  const { context, calls } = setup({ resume: () => resumes++ });
  vm.runInContext('openTongchengAppPage()', context);
  assert.equal(resumes, 1);
  assert.equal(calls.some(([name]) => name === 'home'), false);
  assert.equal(context.tongchengAppPage.hidden, false);
});
