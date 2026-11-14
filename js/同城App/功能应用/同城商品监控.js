(() => {
  const page = document.getElementById('productMonitorPage');
  const byId = id => document.getElementById(id);
  const scroll = page.querySelector('.pm-scroll');
  const overlay = byId('pmOverlay');
  const sheetBody = byId('pmSheetBody');
  const storeOverlay = byId('pmStoreOverlay');
  const storeList = byId('pmStoreList');
  const confirmStore = storeOverlay.querySelector('[data-pm-action="confirm-store"]');
  const formatButtons = storeOverlay.querySelectorAll('[data-pm-format]');
  const filterMenu = byId('pmFilterMenu');
  const filterBackdrop = byId('pmFilterBackdrop');
  const filterButtons = {
    period: page.querySelector('[data-pm-filter="period"]'),
    store: page.querySelector('[data-pm-filter="store"]'),
    channel: page.querySelector('[data-pm-filter="channel"]')
  };
  const filterLabels = { period: '日期', store: '门店', channel: '渠道' };
  const periodLabels = { yesterday: '昨日', week: '近七天' };
  const defaults = { period: 'yesterday', store: '经开万达店', channel: '全部渠道' };
  const rank = 'Top200';
  const labels = { new: '新下架', restored: '恢复上架', off: '持续下架' };
  const legacyChannels = { 美团: '美团外卖', 饿了么: '淘宝闪购', 抖音小时达: '抖店', 京东: '京东秒送' };
  const products = [
    { id: 'cola', name: '可乐 500ml 经典原味碳酸饮料夏日畅饮分享装', code: '10010001', store: '经开万达店', channel: '美团外卖', sales: 12, hours: 26, status: 'off' },
    { id: 'sprite', name: '雪碧 500ml 冰爽柠檬味碳酸饮料家庭分享装', code: '10010002', store: '经开万达店', channel: '京东秒送', sales: 8, hours: 2, status: 'new' },
    { id: 'orange', name: '橙汁 1L', code: '10010003', store: '仙林店', channel: '美团外卖', sales: 5, status: 'restored' },
    { id: 'tea', name: '冰红茶 500ml 冰爽柠檬风味红茶饮料夏日分享装', code: '10010004', store: '新街口店', channel: '抖店', sales: 9, hours: 18, status: 'off' }
  ];
  const storesByFormat = {
    大卖场: [
      defaults.store,
      '家得福黄浦银都城店', '家得福解放中路店', '家得福灌云九龙港店',
      '家得福东海锦程佳园店', '家得福海昌北路店', '家得福云鼎家园店',
      '家得福中央华府店', '家得福新孔店', '家得福嘉泰店', '家得福融盛店',
      '家得福东海瓯龙店', '家得福新海花园店', '仙林店', '新街口店'
    ],
    恺源: []
  };
  const sampleChannels = ['美团外卖', '淘宝闪购', '抖店', '京东秒送'];
  const sampleStatuses = ['off', 'new', 'restored'];
  const sampleProducts = products.slice();
  // 为每个可选门店补齐演示明细，保留原有商品图和已有明细。
  storesByFormat.大卖场.forEach((store, storeIndex) => {
    const existing = sampleProducts.filter(product => product.store === store);
    const combinations = sampleProducts.flatMap(product => sampleChannels.map(channel => ({ product, channel })));
    const missing = combinations.filter(({ product, channel }) =>
      !existing.some(row => row.name === product.name && row.channel === channel)
    );
    missing.forEach(({ product, channel }, index) => {
      const status = sampleStatuses[(index + storeIndex) % sampleStatuses.length];
      products.push({
        id: `sample-${storeIndex}-${index}`,
        image: product.id,
        name: product.name,
        code: product.code,
        store,
        channel,
        sales: 3 + (storeIndex * 5 + index * 7) % 24,
        hours: status === 'restored' ? 0 : 2 + (storeIndex + index * 3) % 28 + (index % 4) / 4,
        status
      });
    });
  });

  const pageSize = 10;
  const overviewList = { rows: byId('pmRows'), count: byId('pmRowsCount'), limit: pageSize };
  const detailList = { rows: byId('pmAllRows'), count: byId('pmSampleCount'), limit: pageSize };
  const options = {
    period: Object.keys(periodLabels),
    store: Object.values(storesByFormat).flat(),
    channel: [defaults.channel, ...sampleChannels]
  };
  const icons = {
    chart: '<path d="M5 18v-5m7 5V6m7 12v-8" stroke-width="3.5"/>',
    tag: '<path d="M3 11l8-8h9v9l-8 8a2 2 0 0 1-3 0l-6-6a2 2 0 0 1 0-3Z"/><circle cx="16" cy="7" r="1.5"/>',
    bag: '<path d="M5 7h14l2 14H3L5 7Z"/><path d="M9 10V6a3 3 0 1 1 6 0v4"/>',
    pulse: '<path d="M2 12h5l3-7 4 14 3-7h5"/>',
    coins: '<ellipse cx="12" cy="6" rx="9" ry="3"/><path d="M3 6v12c0 4 18 4 18 0V6M3 12c0 4 18 4 18 0"/>',
    order: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8m-8 4h5"/>',
    box: '<path d="m12 2 9 5v10l-9 5-9-5V7l9-5Zm-9 5 9 5 9-5m-9 5v10"/>'
  };
  document.querySelectorAll('[data-pm-icon]').forEach(element => {
    element.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">' + icons[element.dataset.pmIcon] + '</svg>';
  });

  let filters = { ...defaults };
  let detailStatus = null;
  let showAll = false;
  let previousScroll = 0;
  let returnFocus;
  let activeFilter;
  let draftStore;

  function matchingProducts() {
    // 现有原型只有一个监控快照，昨日和近七天均包含该快照。
    const channel = filters.channel;
    return products.filter(product =>
      product.store === filters.store &&
      (channel === defaults.channel || product.channel === channel)
    );
  }

  function detailProducts(rows) {
    return detailStatus ? rows.filter(product => product.status === detailStatus) : rows;
  }

  const formatHours = hours => hours.toFixed(2) + 'h';

  function downloadDetails({ sku = false } = {}) {
    const matching = matchingProducts();
    const rows = !sku && showAll ? detailProducts(matching) : matching;
    if (!rows.length) {
      showToast('暂无可下载的商品明细');
      return;
    }

    const fields = ['商品名称', '商品编码', '渠道', '销量', '下架时长', '状态'];
    const values = rows.map(product => [
      product.name,
      product.code,
      product.channel,
      product.sales,
      product.hours ? formatHours(product.hours) : '',
      labels[product.status]
    ]);
    const csv = [fields, ...values]
      .map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = (sku ? '监控SKU明细_' : '商品明细_') + periodLabels[filters.period] + '_' + rank + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('已发起下载，共 ' + rows.length + ' 条商品明细');
  }

  function renderRows(target, rows, append = false) {
    if (!append) target.replaceChildren();
    if (!rows.length) {
      const empty = document.createElement('p');
      empty.className = 'pm-empty';
      empty.textContent = '暂无符合条件的明细';
      target.append(empty);
      return;
    }
    for (const product of rows) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'pm-row';
      button.dataset.pmProduct = product.id;
      const duration = product.hours ? '<span>下架时长 ' + formatHours(product.hours) + '</span>' : '';
      button.innerHTML = '<span class="pm-product-image" data-image="' + (product.image || product.id) + '" aria-hidden="true"></span>' +
        '<span class="pm-row-copy"><strong data-screenshot-ellipsis title="' + product.name + '">' + product.name + '</strong><small>编码 ' + product.code + ' ｜ <span class="pm-channel-name">' + product.channel + '</span></small></span>' +
        '<span class="pm-row-sales"><span>销量 ' + product.sales + '</span>' + duration + '</span>' +
        '<span class="pm-badge" data-pm-status="' + product.status + '">' + labels[product.status] + '</span>';
      target.append(button);
    }
  }

  function showRows(list, rows, start = 0) {
    renderRows(list.rows, rows.slice(start, list.limit), start > 0);
    list.count.hidden = !rows.length;
    list.count.textContent = rows.length
      ? `已显示 ${Math.min(list.limit, rows.length)} / ${rows.length} 条样例`
      : '';
  }

  scroll.addEventListener('scroll', () => {
    const remaining = scroll.scrollHeight - scroll.clientHeight - scroll.scrollTop;
    if (remaining > 8 || !scroll.clientHeight) return;
    const list = showAll ? detailList : overviewList;
    const matching = matchingProducts();
    const rows = showAll ? detailProducts(matching) : matching;
    if (list.limit >= rows.length) return;
    const start = list.limit;
    list.limit += pageSize;
    showRows(list, rows, start);
  }, { passive: true });

  const updatedAt = byId('pmUpdatedAt');
  const formatUpdateTime = new Intl.DateTimeFormat('zh-CN', {
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });

  function updateStatusTime() {
    const time = formatUpdateTime.format(Date.now() - 15 * 60 * 1000);
    if (updatedAt.textContent === time) return;
    updatedAt.dateTime = time;
    updatedAt.textContent = time;
  }

  setInterval(() => {
    if (updatedAt.getClientRects().length) updateStatusTime();
  }, 1000);

  function render() {
    for (const [key, trigger] of Object.entries(filterButtons)) {
      const label = key === 'period' ? periodLabels[filters.period] : filters[key];
      trigger.querySelector('span').textContent = label;
      trigger.setAttribute('aria-label', filterLabels[key] + ' ' + label);
    }
    const defaultView = filters.store === defaults.store && filters.channel === defaults.channel;
    for (const [id, value] of Object.entries({ pmSkuCount: '200', pmAvailableCount: '181', pmAttendance: '90.5%', pmSales: '¥2,000.00', pmOrders: '35单', pmOffShelfCount: '19条', pmNewCount: '1<small>个</small>', pmRestoredCount: '2<small>个</small>', pmOngoingCount: '18<small>个</small>' })) {
      byId(id).innerHTML = defaultView ? value : '—';
    }
    const rows = matchingProducts();
    showRows(overviewList, rows);
    showRows(detailList, detailProducts(rows));
    byId('pmOverview').hidden = showAll;
    updateStatusTime();
    byId('pmAllDetails').hidden = !showAll;
    byId('pmAllTitle').textContent = detailStatus ? labels[detailStatus] + '明细' : '下架明细';
    page.querySelector('[data-pm-action="back"]').setAttribute('aria-label', showAll ? '返回监控总览' : '返回全部工具');
  }

  function openSheet(title) {
    returnFocus = document.activeElement;
    byId('pmSheetTitle').textContent = title;
    sheetBody.replaceChildren();
    overlay.hidden = false;
    overlay.querySelector('.pm-sheet header button').focus({ preventScroll: true });
  }

  function dismissSheet(restoreFocus = true) {
    overlay.hidden = true;
    sheetBody.replaceChildren();
    if (restoreFocus && returnFocus instanceof HTMLElement) returnFocus.focus({ preventScroll: true });
    returnFocus = null;
  }

  function renderStoreOptions(format) {
    const stores = storesByFormat[format];
    formatButtons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.pmFormat === format));
    });
    storeList.replaceChildren();
    stores.forEach(store => {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = store;
      button.dataset.pmStoreOption = store;
      button.setAttribute('aria-label', store);
      button.setAttribute('aria-pressed', String(store === draftStore));
      storeList.append(button);
    });
    if (!stores.length) {
      const empty = document.createElement('p');
      empty.className = 'pm-empty';
      empty.textContent = '该业态暂无可选门店';
      storeList.append(empty);
    }
    confirmStore.disabled = !stores.includes(draftStore);
    storeList.scrollTop = 0;
  }

  function openStoreSheet() {
    dismissFilter(false);
    draftStore = filters.store;
    const format = Object.keys(storesByFormat).find(key => storesByFormat[key].includes(draftStore));
    renderStoreOptions(format);
    storeOverlay.hidden = false;
    filterButtons.store.setAttribute('aria-expanded', 'true');
    storeOverlay.querySelector('header button').focus({ preventScroll: true });
    storeList.querySelector('[aria-pressed="true"]')?.scrollIntoView({ block: 'nearest' });
  }

  function dismissStoreSheet(restoreFocus = true) {
    if (storeOverlay.hidden) return;
    storeOverlay.hidden = true;
    filterButtons.store.setAttribute('aria-expanded', 'false');
    if (restoreFocus) filterButtons.store.focus({ preventScroll: true });
  }

  function dismissFilter(restoreFocus = true) {
    if (!activeFilter) return;
    const trigger = filterButtons[activeFilter];
    trigger.setAttribute('aria-expanded', 'false');
    filterMenu.hidden = true;
    filterBackdrop.hidden = true;
    activeFilter = null;
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  function applyFilter(key, value) {
    filters[key] = value;
    overviewList.limit = detailList.limit = pageSize;
    dismissFilter();
    render();
    scroll.scrollTop = 0;
  }

  function openFilter(key) {
    if (activeFilter === key) {
      dismissFilter();
      return;
    }
    dismissFilter(false);
    activeFilter = key;
    filterButtons[key].setAttribute('aria-expanded', 'true');
    filterMenu.setAttribute('aria-label', '选择' + filterLabels[key]);
    filterMenu.replaceChildren();
    for (const value of options[key]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.pmValue = value;
      button.textContent = key === 'period' ? periodLabels[value] : value;
      button.setAttribute('aria-pressed', String(value === filters[key]));
      button.addEventListener('click', () => applyFilter(key, value));
      filterMenu.append(button);
    }
    filterMenu.hidden = false;
    filterBackdrop.hidden = false;
    filterMenu.querySelector('[aria-pressed="true"]').focus({ preventScroll: true });
  }

  function openDetails(status = null) {
    previousScroll = scroll.scrollTop;
    detailStatus = status;
    detailList.limit = pageSize;
    showAll = true;
    render();
    scroll.scrollTop = 0;
  }

  let activeMoreTrigger = null;

  function closeMoreMenu(restoreFocus = false) {
    if (!activeMoreTrigger) return;
    const trigger = activeMoreTrigger;
    byId(trigger.getAttribute('aria-controls')).hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
    activeMoreTrigger = null;
    if (restoreFocus) trigger.focus({ preventScroll: true });
  }

  function toggleMoreMenu(trigger) {
    const alreadyOpen = activeMoreTrigger === trigger;
    closeMoreMenu();
    if (alreadyOpen) return;
    const menu = byId(trigger.getAttribute('aria-controls'));
    activeMoreTrigger = trigger;
    trigger.setAttribute('aria-expanded', 'true');
    menu.hidden = false;
    menu.querySelector('button').focus({ preventScroll: true });
  }

  document.addEventListener('click', event => {
    if (!activeMoreTrigger || activeMoreTrigger.contains(event.target)) return;
    const menu = byId(activeMoreTrigger.getAttribute('aria-controls'));
    if (!menu.contains(event.target)) closeMoreMenu();
  });

  page.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.hasAttribute('data-pm-more')) toggleMoreMenu(button);
    const filter = button.dataset.pmFilter;
    if (filter === 'store') openStoreSheet();
    else if (filter) openFilter(filter);
    if (button.dataset.pmFormat) renderStoreOptions(button.dataset.pmFormat);
    if (button.dataset.pmStoreOption) {
      draftStore = button.dataset.pmStoreOption;
      storeList.querySelector('[aria-pressed="true"]')?.setAttribute('aria-pressed', 'false');
      button.setAttribute('aria-pressed', 'true');
      confirmStore.disabled = false;
    }
    if (button === filterBackdrop) dismissFilter();
    if (button.dataset.pmStatus) openDetails(button.dataset.pmStatus);
    if (button.dataset.pmProduct) {
      const product = products.find(item => item.id === button.dataset.pmProduct);
      openSheet(product.name);
      const fields = [['商品编码', product.code], ['渠道', product.channel], ['销量', product.sales], ['状态', labels[product.status]]];
      if (product.hours) fields.push(['下架时长', formatHours(product.hours)]);
      const details = document.createElement('dl');
      for (const [label, value] of fields) {
        const term = document.createElement('dt');
        const description = document.createElement('dd');
        term.textContent = label;
        description.textContent = value;
        details.append(term, description);
      }
      sheetBody.append(details);
    }
    switch (button.dataset.pmAction) {
      case 'back':
        dismissFilter(false);
        if (showAll) {
          showAll = false;
          render();
          scroll.scrollTop = previousScroll;
        } else {
          dismissSheet(false);
          setRetailUnionAppOpen(true);
        }
        break;
      case 'cancel-store':
        dismissStoreSheet();
        break;
      case 'confirm-store':
        dismissStoreSheet();
        applyFilter('store', draftStore);
        break;
      case 'download-sku':
        closeMoreMenu(true);
        downloadDetails({ sku: true });
        break;
      case 'download':
        closeMoreMenu(true);
        downloadDetails();
        break;
      case 'details':
        openDetails();
        break;
      case 'help':
        dismissFilter(false);
        openSheet('统计规则说明');
        sheetBody.replaceChildren(byId('pmRulesTemplate').content.cloneNode(true));
        sheetBody.scrollTop = 0;
        break;
      case 'dismiss':
        dismissSheet();
        break;
    }
  });

  page.addEventListener('keydown', event => {
    if (activeMoreTrigger && event.key === 'Escape') {
      event.preventDefault();
      closeMoreMenu(true);
      return;
    }
    if (activeFilter && event.key === 'Escape') {
      event.preventDefault();
      dismissFilter();
      return;
    }
    const activeOverlay = storeOverlay.hidden ? overlay : storeOverlay;
    if (activeOverlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      if (activeOverlay === storeOverlay) dismissStoreSheet();
      else dismissSheet();
    }
    if (event.key === 'Tab') {
      const items = [...activeOverlay.querySelectorAll('.pm-sheet button:not(:disabled), .pm-rules[tabindex]')];
      const edge = event.shiftKey ? items[0] : items.at(-1);
      if (document.activeElement === edge) {
        event.preventDefault();
        (event.shiftKey ? items.at(-1) : items[0]).focus();
      }
    }
  });

  // 浮层只改变预览区内的坐标，不参与手机页面的布局或会话状态。
  const requirements = document.querySelector('.product-monitor-requirements');
  if (requirements) {
    const previewArea = requirements.parentElement;
    const handle = requirements.querySelector('.product-monitor-requirements-drag');
    const toggle = requirements.querySelector('.product-monitor-requirements-toggle');
    const content = byId('productMonitorRequirementsContent');
    const inset = 8;
    let drag = null;

    function moveRequirements(left, top) {
      requirements.classList.add('is-positioned');
      const maxLeft = previewArea.clientWidth - requirements.offsetWidth - inset;
      const maxTop = previewArea.clientHeight - requirements.offsetHeight - inset;
      requirements.style.left = Math.max(inset, Math.min(left, maxLeft)) + 'px';
      requirements.style.top = Math.max(inset, Math.min(top, maxTop)) + 'px';
    }

    function keepRequirementsInBounds() {
      if (requirements.classList.contains('is-positioned') && requirements.offsetWidth) {
        moveRequirements(requirements.offsetLeft, requirements.offsetTop);
      }
    }

    toggle.addEventListener('click', () => {
      const expanded = content.hidden;
      content.hidden = !expanded;
      toggle.setAttribute('aria-expanded', String(expanded));
      requirements.classList.toggle('is-open', expanded);
      keepRequirementsInBounds();
    });

    handle.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      drag = {
        pointerId: event.pointerId,
        x: event.clientX - requirements.offsetLeft,
        y: event.clientY - requirements.offsetTop
      };
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', event => {
      if (drag?.pointerId === event.pointerId) {
        moveRequirements(event.clientX - drag.x, event.clientY - drag.y);
      }
    });

    handle.addEventListener('lostpointercapture', () => { drag = null; });
    handle.addEventListener('keydown', event => {
      const offsets = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
      if (!Object.hasOwn(offsets, event.key)) return;
      event.preventDefault();
      const [x, y] = offsets[event.key];
      moveRequirements(requirements.offsetLeft + 16 * x, requirements.offsetTop + 16 * y);
    });

    const requirementsObserver = new ResizeObserver(keepRequirementsInBounds);
    requirementsObserver.observe(previewArea);
    requirementsObserver.observe(requirements);
  }

  page.appSession = {
    open() {
      filters = { ...defaults };
      overviewList.limit = detailList.limit = pageSize;
      detailStatus = null;
      showAll = false;
      previousScroll = 0;
      dismissFilter(false);
      dismissSheet(false);
      dismissStoreSheet(false);
      closeMoreMenu();
      page.hidden = false;
      render();
      scroll.scrollTop = 0;
    },
    capture() {
      return {
        filters: { ...filters }, showAll, detailStatus, scroll: scroll.scrollTop, previousScroll,
        overviewLimit: overviewList.limit, detailLimit: detailList.limit
      };
    },
    restore(state) {
      const saved = state.filters || {};
      const maximum = Math.ceil(products.length / pageSize) * pageSize;
      overviewList.limit = Math.min(maximum, Math.max(pageSize, Number(state.overviewLimit) || pageSize));
      detailList.limit = Math.min(maximum, Math.max(pageSize, Number(state.detailLimit) || pageSize));
      for (const key of ['store', 'channel']) {
        if (options[key].includes(saved[key])) filters[key] = saved[key];
      }
      if (Object.hasOwn(legacyChannels, saved.channel)) filters.channel = legacyChannels[saved.channel];
      if (Object.hasOwn(periodLabels, saved.period)) filters.period = saved.period;
      showAll = state.showAll === true;
      detailStatus = Object.hasOwn(labels, state.detailStatus) ? state.detailStatus : null;
      previousScroll = Number.isFinite(state.previousScroll) ? Math.max(0, state.previousScroll) : 0;
      render();
      scroll.scrollTop = Number.isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
    }
  };
})();
