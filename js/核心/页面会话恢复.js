// 同一浏览器标签页刷新时恢复已打开页签、当前页面及券规则表单。
(() => {
  const key = `ys-prototype-page-session:v1:${location.pathname}${new URLSearchParams(location.search).get('screenshot-check') === '1' ? ':screenshot-check:' + new URLSearchParams(location.search).get('run') : ''}`;
  const couponControls = () => [...document.querySelectorAll('#couponRuleCreate input, #couponRuleCreate select')]
    .filter(control => control.type !== 'checkbox');
  const knownPages = new Set(['概况', '同城商品管理(统一分类)', ...openTabs,
    ...[...document.querySelectorAll('[data-page], [data-tab]')].map(el => el.dataset.page || el.dataset.tab)]);
  function save() {
    try {
      sessionStorage.setItem(key, JSON.stringify({
        tabs: openTabs,
        active: activePage,
        module: document.querySelector('.side-nav [data-nav].active')?.dataset.nav,
        couponCreate: !document.querySelector('#couponRuleCreate').hidden,
        couponControls: couponControls().map(control => ({ value: control.value, checked: control.checked }))
      }));
    } catch { /* 浏览器禁止存储时，保留正常页面操作。 */ }
  }
  function restore() {
    let state;
    try { state = JSON.parse(sessionStorage.getItem(key)); } catch { return; }
    if (!state || !Array.isArray(state.tabs)) return;
    const tabs = [...new Set(state.tabs.filter(name => knownPages.has(name)))];
    if (!tabs.length) return;
    if (!tabs.includes('概况')) tabs.unshift('概况');
    const moduleButton = [...document.querySelectorAll('.side-nav [data-nav]')]
      .find(button => button.dataset.nav === state.module);
    if (moduleButton) switchModule(state.module);
    openTabs = tabs;
    activePage = tabs.includes(state.active) ? state.active : tabs[tabs.length - 1];
    renderPageTabs();
    if (state.module !== '同城App') {
      [...pageTabs.querySelectorAll('[data-tab]')].find(button => button.dataset.tab === activePage)?.click();
    }
    if (Array.isArray(state.couponControls)) {
      couponControls().forEach((control, index) => {
        const saved = state.couponControls[index];
        if (!saved || typeof saved.value !== 'string') return;
        if (control.type === 'radio') control.checked = saved.checked === true;
        else control.value = saved.value;
      });
      document.querySelectorAll('#couponRuleCreate input[type="radio"]:checked').forEach(control => {
        control.dispatchEvent(new Event('change', { bubbles: true }));
      });
    }
    showCouponRuleCreate(state.couponCreate === true);
    syncCouponProductButton();
  }
  restore();
  // 在各页面自己的事件处理完成后记录，关闭页签也会同步更新。
  document.addEventListener('click', () => queueMicrotask(save));
  document.addEventListener('input', save);
  document.addEventListener('change', save);
  window.addEventListener('pagehide', save);
})();
