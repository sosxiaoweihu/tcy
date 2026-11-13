// App 功能页共用一个手机容器；页签仅切换可见页，刷新时按各功能的导航状态恢复。
(() => {
  const bar = document.getElementById('tongchengAppTabs');
  const screen = tongchengAppScreen.closest('.tongcheng-app-screen');
  const key = `ys-prototype-app-session:v1:${location.pathname}${new URLSearchParams(location.search).get('screenshot-check') === '1' ? ':screenshot-check:' + new URLSearchParams(location.search).get('run') : ''}`;
  const $ = selector => document.querySelector(selector);
  const text = value => typeof value === 'string' ? value.slice(0, 2000) : '';
  const offset = value => Number.isFinite(value) ? Math.max(0, value) : 0;
  const entries = [
    { id: 'tools', name: '全部工具' },
    { id: 'monitor', name: '同城商品监控', entry: 'openProductMonitor', panel: 'productMonitorPage' },
    { id: 'products', name: '同城商品', entry: 'openCityProducts', panel: 'cityProductsPage' },
    { id: 'records', name: '同城商品档案', entry: 'openProductRecord', panel: 'productRecordPage', open: openProductRecordPage },
    { id: 'orders', name: '三方订单', entry: 'openThirdPartyOrder', panel: 'thirdPartyOrderPage', open: openThirdPartyOrderPage },
    { id: 'im', name: 'IM消息', entry: 'openImMessage', panel: 'imAppPage', open: openImApp },
    { id: 'reviews', name: '同城订单评价', entry: 'openOrderReviews', panel: 'orderReviewsPage' }
  ];
  const catalog = new Map(entries.map(entry => [entry.id, entry]));
  const roots = [...entries.filter(entry => entry.panel).map(entry => document.getElementById(entry.panel)), thirdPartyPhotoPage];
  const initialized = new Set();
  let tabs = ['tools'], active = 'tools', snapshots = {}, navigating = false, queued = false;
  try {
    const saved = JSON.parse(sessionStorage.getItem(key));
    if (saved && Array.isArray(saved.tabs)) {
      tabs = [...new Set(['tools', ...saved.tabs.filter(id => catalog.has(id))])];
      active = tabs.includes(saved.active) ? saved.active : 'tools';
      if (saved.pages && typeof saved.pages === 'object' && !Array.isArray(saved.pages)) {
        snapshots = Object.fromEntries(tabs.filter(id => catalog.get(id).panel && saved.pages[id] && typeof saved.pages[id] === 'object').map(id => [id, saved.pages[id]]));
      }
    }
  } catch { /* 缺失、损坏或被禁用的存储不影响打开页面。 */ }

  const adapters = {
    orders: {
      capture: () => ({
        tab: $('[data-third-party-order-tab].active')?.dataset.thirdPartyOrderTab,
        keyword: thirdPartyOrderSearch.value, scroll: thirdPartyOrderList.scrollTop,
        photo: !thirdPartyPhotoPage.hidden,
        product: $('[data-third-party-photo-product].selected')?.dataset.thirdPartyPhotoProduct,
        review: $('[data-third-party-photo-product] .third-party-photo-required')?.dataset.displayStatus === $('[data-third-party-photo-product]')?.dataset.reviewStatus,
        photoScroll: $('.third-party-photo-main').scrollTop
      }),
      restore: state => {
        thirdPartyOrderSearch.value = text(state.keyword);
        const buttons = [...document.querySelectorAll('[data-third-party-order-tab]')];
        const tab = buttons.find(button => button.dataset.thirdPartyOrderTab === state.tab) || buttons[0];
        buttons.forEach(button => button.classList.toggle('active', button === tab));
        renderThirdPartyOrders(); thirdPartyOrderList.scrollTop = offset(state.scroll);
        if (state.photo) {
          renderThirdPartyPhotoProductStatuses(state.review === true);
          const product = [...document.querySelectorAll('[data-third-party-photo-product]')].find(button => button.dataset.thirdPartyPhotoProduct === state.product);
          if (product) selectThirdPartyPhotoProduct(product);
          $('.third-party-photo-main').scrollTop = offset(state.photoScroll);
        }
      }
    },
    im: {
      capture: () => ({ tab: activeImTab, role: activeImUserRole, store: activeImStore,
        channel: imChannelFilter.value, today: imTodayUnrepliedFilter.checked,
        conversation: imDetailView.hidden ? null : activeImConversationId,
        reply: imReplyInput.value, scroll: imConversationList.scrollTop, threadScroll: imMessageThread.scrollTop }),
      restore: state => {
        activeImTab = ['pending', 'all'].includes(state.tab) ? state.tab : 'pending';
        activeImUserRole = state.role === 'employee' ? 'employee' : 'headquarters';
        const stores = [...document.querySelectorAll('[data-im-store]')].map(button => button.dataset.imStore);
        activeImStore = stores.includes(state.store) ? state.store : employeeStore;
        imChannelFilter.value = [...imChannelFilter.options].some(option => option.value === state.channel) ? state.channel : '全部渠道';
        imTodayUnrepliedFilter.checked = state.today !== false;
        syncImStoreAccess(); renderImConversationList();
        if (imConversations.some(conversation => conversation.id === state.conversation)) {
          openImConversation(state.conversation); imReplyInput.value = text(state.reply);
          imMessageThread.scrollTop = offset(state.threadScroll);
        }
        imConversationList.scrollTop = offset(state.scroll);
      }
    },
    records: {
      capture: () => ({ issue: activeProductRecordIssue, category: activeProductRecordCategory,
        format: activeProductRecordBusinessFormat, keyword: productRecordSearch.value,
        item: productRecordDetailView.hidden ? null : activeProductRecordItem?.id,
        attribute: productRecordAttributeEditor.hidden ? null : activeProductRecordAttributeChannel,
        values: JSON.parse(JSON.stringify(productRecordAttributeValues)),
        scroll: productRecordList.scrollTop, detailScroll: productRecordDetailScroll.scrollTop,
        attributeScroll: productRecordAttributeEditorScroll.scrollTop }),
      restore: state => {
        if (productRecordBusinessFormats.includes(state.format)) activeProductRecordBusinessFormat = state.format;
        const issues = [...document.querySelectorAll('[data-product-record-issue]')].map(button => button.dataset.productRecordIssue);
        const categories = [...document.querySelectorAll('[data-product-record-category]')].map(button => button.dataset.productRecordCategory);
        if (issues.includes(state.issue)) activeProductRecordIssue = state.issue;
        if (categories.includes(state.category)) activeProductRecordCategory = state.category;
        productRecordSearch.value = text(state.keyword);
        syncProductRecordFormatSwitcher(); syncProductRecordNavigation(); renderProductRecordList();
        const item = productRecordItems.find(item => item.id === state.item);
        if (item) openProductRecordDetail(item);
        if (state.values && typeof state.values === 'object') {
          Object.keys(productRecordAttributeValues).forEach(channel => {
            Object.keys(productRecordAttributeValues[channel]).forEach(field => {
              if (typeof state.values[channel]?.[field] === 'string') productRecordAttributeValues[channel][field] = text(state.values[channel][field]);
            });
          });
        }
        if (item && ['美团', '淘宝', '抖店'].includes(state.attribute)) openProductRecordAttributeEditor(state.attribute);
        productRecordList.scrollTop = offset(state.scroll);
        productRecordDetailScroll.scrollTop = offset(state.detailScroll);
        productRecordAttributeEditorScroll.scrollTop = offset(state.attributeScroll);
      }
    }
  };
  function adapter(id) {
    const entry = catalog.get(id);
    return entry?.panel ? document.getElementById(entry.panel).appSession || adapters[id] : null;
  }
  function capture() {
    if (!initialized.has(active) || tongchengAppPage.hidden) return;
    const panel = catalog.get(active)?.panel;
    if (panel && document.getElementById(panel).hidden && !(active === 'orders' && !thirdPartyPhotoPage.hidden)) return;
    const api = adapter(active);
    if (api) snapshots[active] = api.capture();
  }
  function persist() {
    try { sessionStorage.setItem(key, JSON.stringify({ tabs, active, pages: snapshots })); }
    catch { /* 存储受限时页签仍可正常切换。 */ }
  }
  function renderTabs() {
    bar.innerHTML = tabs.map(id => {
      const entry = catalog.get(id), selected = id === active;
      return `<div class="tc-app-tab${selected ? ' active' : ''}" role="presentation"><button type="button" role="tab" id="tc-app-tab-${id}" data-app-tab="${id}" aria-selected="${selected}" aria-controls="tongchengAppPage" tabindex="${selected ? 0 : -1}">${entry.name}</button>${entry.panel ? `<button type="button" class="tc-app-tab-close" data-app-tab-close="${id}" aria-label="关闭${entry.name}页签">×</button>` : ''}</div>`;
    }).join('');
    tongchengAppPage.setAttribute('role', 'tabpanel');
    tongchengAppPage.setAttribute('aria-labelledby', `tc-app-tab-${active}`);
    bar.querySelector(`[data-app-tab="${active}"]`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }
  function show(id) {
    const entry = catalog.get(id);
    if (!entry) return;
    if (id === 'tools') {
      setRetailUnionAppOpen(true);
      return;
    }
    // 已初始化页保留原 DOM、草稿及滚动状态；仅刷新后第一次激活时恢复快照。
    if (!initialized.has(id)) {
      (entry.open || adapter(id).open)();
      initialized.add(id);
      if (snapshots[id]) adapter(id)?.restore(snapshots[id]);
    }
    const panel = id === 'orders' && snapshots[id]?.photo ? thirdPartyPhotoPage : document.getElementById(entry.panel);
    roots.forEach(root => root.hidden = root !== panel);
    screen.classList.add('retail-union-open');
    tongchengAppScreen.hidden = true;
    ['openRetailUnionApp', 'closeRetailUnionApp', ...entries.map(item => item.entry).filter(Boolean)].forEach(id => document.getElementById(id).hidden = true);
  }
  function activate(id) {
    if (!catalog.has(id)) return;
    capture();
    if (!tabs.includes(id)) tabs.push(id);
    active = id; navigating = true;
    try { show(id); } finally { navigating = false; }
    capture(); renderTabs(); persist();
  }
  function synchronize() {
    if (navigating || tongchengAppPage.hidden || !document.body.classList.contains('tongcheng-app-mode')) return;
    const shown = entries.find(entry => entry.panel && !document.getElementById(entry.panel).hidden);
    const next = shown?.id || (!thirdPartyPhotoPage.hidden ? 'orders' : 'tools');
    const changed = next !== active;
    if (changed) { capture(); active = next; }
    if (!tabs.includes(next)) tabs.push(next);
    if (catalog.get(next).panel) initialized.add(next);
    capture();
    if (changed) renderTabs();
    persist();
  }
  function schedule() {
    if (queued) return;
    queued = true;
    queueMicrotask(() => { queued = false; synchronize(); });
  }
  bar.addEventListener('click', event => {
    const close = event.target.closest('[data-app-tab-close]');
    if (close) {
      const id = close.dataset.appTabClose;
      if (!catalog.get(id)?.panel) return;
      capture();
      const index = tabs.indexOf(id);
      tabs = tabs.filter(tab => tab !== id);
      delete snapshots[id]; initialized.delete(id);
      if (active === id) activate(tabs[Math.max(0, index - 1)] || 'tools');
      else { renderTabs(); persist(); }
      return;
    }
    const tab = event.target.closest('[data-app-tab]');
    if (tab) activate(tab.dataset.appTab);
  });
  bar.addEventListener('keydown', event => {
    if (!event.target.matches('[data-app-tab]') || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const index = tabs.indexOf(active);
    const next = event.key === 'Home' ? tabs[0] : event.key === 'End' ? tabs[tabs.length - 1] : tabs[(index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
    activate(next); bar.querySelector(`[data-app-tab="${next}"]`).focus();
  });
  // 菜单入口也走页签切换，避免重复打开时重置已打开功能页。
  document.addEventListener('click', event => {
    if (navigating || tongchengAppPage.hidden) return;
    const entry = entries.find(entry => entry.entry && event.target.closest(`#${entry.entry}`));
    if (entry) { event.preventDefault(); event.stopImmediatePropagation(); activate(entry.id); }
    else capture();
  }, true);
  ['click', 'input', 'change', 'submit'].forEach(type => document.addEventListener(type, schedule));
  let scrollTimer;
  tongchengAppPage.addEventListener('scroll', () => { clearTimeout(scrollTimer); scrollTimer = setTimeout(schedule, 100); }, true);
  const observer = new MutationObserver(schedule);
  [tongchengAppPage, tongchengAppScreen, ...roots].forEach(root => observer.observe(root, { attributes: true, attributeFilter: ['hidden'] }));
  window.addEventListener('pagehide', () => { capture(); persist(); });
  window.tongchengAppTabs = { resume: () => activate(active) };
  renderTabs();
  if (!tongchengAppPage.hidden) activate(active);
})();
