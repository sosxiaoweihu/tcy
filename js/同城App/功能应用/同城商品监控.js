(() => {
  const page = document.getElementById('productMonitorPage');
  const byId = id => document.getElementById(id);
  const scroll = page.querySelector('.pm-scroll');
  const overlay = byId('pmOverlay');
  const sheetBody = byId('pmSheetBody');
  const titles = { date: '日期', store: '门店', channel: '渠道', rank: '榜单' };
  const defaults = { date: '2026-11-13', store: '全部门店', channel: '全部渠道', rank: 'Top200' };
  const labels = { new: '新下架', restored: '恢复上架', off: '持续下架' };
  const products = [
    { id: 'cola', name: '可乐 500ml', store: '经开万达店', channel: '美团', sales: 12, hours: 26, status: 'off' },
    { id: 'sprite', name: '雪碧 500ml', store: '经开万达店', channel: '京东秒送', sales: 8, hours: 2, status: 'new' },
    { id: 'orange', name: '橙汁 1L', store: '仙林店', channel: '美团', sales: 5, status: 'restored' },
    { id: 'tea', name: '冰红茶 500ml', store: '新街口店', channel: '抖音小时达', sales: 9, hours: 18, status: 'off' }
  ];
  const options = {
    store: [defaults.store, ...new Set(products.map(product => product.store))],
    channel: [defaults.channel, ...new Set(products.map(product => product.channel))],
    rank: [defaults.rank]
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

  function matchingProducts() {
    if (filters.date !== defaults.date || filters.rank !== defaults.rank) return [];
    return products.filter(product =>
      (filters.store === defaults.store || product.store === filters.store) &&
      (filters.channel === defaults.channel || product.channel === filters.channel)
    );
  }

  function detailProducts(rows) {
    return detailStatus ? rows.filter(product => product.status === detailStatus) : rows;
  }

  function downloadDetails() {
    const matching = matchingProducts();
    const rows = showAll ? detailProducts(matching) : matching;
    if (!rows.length) {
      showToast('暂无可下载的商品明细');
      return;
    }

    const fields = ['商品名称', '门店', '渠道', '今日销量', '持续时长', '状态'];
    const values = rows.map(product => [
      product.name,
      product.store,
      product.channel,
      product.sales,
      product.hours ? product.hours + 'h' : '',
      labels[product.status]
    ]);
    const csv = [fields, ...values]
      .map(row => row.map(value => '"' + String(value).replace(/"/g, '""') + '"').join(','))
      .join('\r\n');
    const url = URL.createObjectURL(new Blob(['\ufeff', csv], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = '商品明细_' + filters.date + '_' + filters.rank + '.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast('已发起下载，共 ' + rows.length + ' 条商品明细');
  }

  function renderRows(target, rows) {
    target.replaceChildren();
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
      const duration = product.hours ? '<span>持续 ' + product.hours + 'h</span>' : '';
      button.innerHTML = '<span class="pm-product-image" data-image="' + product.id + '" aria-hidden="true"></span>' +
        '<span class="pm-row-copy"><strong>' + product.name + '</strong><small>' + product.store + ' ｜ ' + product.channel + '</small></span>' +
        '<span class="pm-row-sales"><span>今日销量 ' + product.sales + '</span>' + duration + '</span>' +
        '<span class="pm-badge" data-pm-status="' + product.status + '">' + labels[product.status] + '</span>';
      target.append(button);
    }
  }

  function render() {
    for (const [key, value] of Object.entries(filters)) {
      byId('pm' + key[0].toUpperCase() + key.slice(1) + 'Value').textContent = value;
    }
    const defaultView = Object.keys(defaults).every(key => filters[key] === defaults[key]);
    byId('pmSummaryTitle').textContent = '销售' + filters.rank + '监控（9点）';
    byId('pmCaptureTime').textContent = filters.date === defaults.date && filters.rank === defaults.rank ? defaults.date + ' 09:00' : '—';
    for (const [id, value] of Object.entries({ pmSkuCount: '200', pmAvailableCount: '181', pmAttendance: '90.5%', pmSales: '¥2,000.00', pmOrders: '35单', pmOffShelfCount: '19条', pmNewCount: '1<small>个</small>', pmRestoredCount: '2<small>个</small>', pmOngoingCount: '18<small>个</small>' })) {
      byId(id).innerHTML = defaultView ? value : '—';
    }
    const rows = matchingProducts();
    renderRows(byId('pmRows'), rows);
    const details = detailProducts(rows);
    renderRows(byId('pmAllRows'), details);
    byId('pmOverview').hidden = showAll;
    byId('pmAllDetails').hidden = !showAll;
    byId('pmAllTitle').textContent = detailStatus ? labels[detailStatus] + '明细' : '下架明细';
    byId('pmSampleCount').textContent = details.length ? '当前展示 ' + details.length + ' 条样例' : '';
    byId('pmSampleCount').hidden = !details.length;
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

  function applyFilter(key, value) {
    filters[key] = value;
    dismissSheet();
    render();
    scroll.scrollTop = 0;
  }

  function openFilter(key) {
    openSheet('选择' + titles[key]);
    if (key === 'date') {
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.type = 'date';
      input.required = true;
      input.value = filters.date;
      input.setAttribute('aria-label', '选择监控日期');
      const button = document.createElement('button');
      button.type = 'submit';
      button.textContent = '确定';
      form.className = 'pm-date-form';
      form.append(input, button);
      form.addEventListener('submit', event => {
        event.preventDefault();
        if (input.value) applyFilter(key, input.value);
      });
      sheetBody.append(form);
      return;
    }
    for (const value of options[key]) {
      const button = document.createElement('button');
      button.type = 'button';
      button.dataset.pmValue = value;
      button.textContent = value;
      button.setAttribute('aria-pressed', String(value === filters[key]));
      button.addEventListener('click', () => applyFilter(key, value));
      sheetBody.append(button);
    }
  }

  function openDetails(status = null) {
    previousScroll = scroll.scrollTop;
    detailStatus = status;
    showAll = true;
    render();
    scroll.scrollTop = 0;
  }

  page.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.dataset.pmFilter) openFilter(button.dataset.pmFilter);
    if (button.dataset.pmStatus) openDetails(button.dataset.pmStatus);
    if (button.dataset.pmProduct) {
      const product = products.find(item => item.id === button.dataset.pmProduct);
      openSheet(product.name);
      const fields = [['门店', product.store], ['渠道', product.channel], ['今日销量', product.sales], ['状态', labels[product.status]]];
      if (product.hours) fields.push(['持续时长', product.hours + 'h']);
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
        if (showAll) {
          showAll = false;
          render();
          scroll.scrollTop = previousScroll;
        } else {
          dismissSheet(false);
          setRetailUnionAppOpen(true);
        }
        break;
      case 'download':
        downloadDetails();
        break;
      case 'details':
        openDetails();
        break;
      case 'help': {
        openSheet('监控说明');
        const help = document.createElement('p');
        help.textContent = '查看销售榜单在 9 点的监控结果，包括出勤率、销售金额和商品状态变化。当前展示截图中的监控及明细样例。';
        sheetBody.append(help);
        break;
      }
      case 'dismiss':
        dismissSheet();
        break;
    }
  });

  page.addEventListener('keydown', event => {
    if (overlay.hidden) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      dismissSheet();
    }
    if (event.key === 'Tab') {
      const items = [...overlay.querySelectorAll('.pm-sheet button, .pm-sheet input')];
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
      detailStatus = null;
      showAll = false;
      previousScroll = 0;
      dismissSheet(false);
      page.hidden = false;
      render();
      scroll.scrollTop = 0;
    },
    capture() {
      return { filters: { ...filters }, showAll, detailStatus, scroll: scroll.scrollTop, previousScroll };
    },
    restore(state) {
      const saved = state.filters || {};
      for (const key of ['store', 'channel', 'rank']) {
        if (options[key].includes(saved[key])) filters[key] = saved[key];
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(saved.date)) filters.date = saved.date;
      showAll = state.showAll === true;
      detailStatus = Object.hasOwn(labels, state.detailStatus) ? state.detailStatus : null;
      previousScroll = Number.isFinite(state.previousScroll) ? Math.max(0, state.previousScroll) : 0;
      render();
      scroll.scrollTop = Number.isFinite(state.scroll) ? Math.max(0, state.scroll) : 0;
    }
  };
})();
