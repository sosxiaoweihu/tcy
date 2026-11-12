const ccEditor = (() => {
  const form = ccEl('ccCreateForm');
  const page = ccEl('ccCreatePage');
  const list = ccEl('ccCatalogList');
  const feedback = ccEl('cccFeedback');
  const issueNotice = ccEl('cccIssueNotice');
  const issueDetails = ccEl('cccIssueDetails');
  const issueToggle = ccEl('cccIssueToggle');
  const field = name => form.elements.namedItem(name);
  const archiveFields = [...form.querySelectorAll('input[readonly]:not([name=productType])')];
  const channels = [
    ['jd', '京东到家'],
    ['mt', '美团外卖'],
    ['ele', '淘宝闪购'],
    ['dou', '抖店']
  ];
  const recommendedPlatformCategories = {
    jd: '休闲食品 / 膨化食品 / 薯片 / 马铃薯薯片',
    mt: '休闲食品 / 膨化/油炸 / 薯片/薯条',
    ele: '休闲食品 / 膨化食品 / 薯片/薯条',
    dou: '休闲食品 / 膨化食品 / 薯片/薯条'
  };
  const demoFields = {
    code: '32600487', name: '乐事STAX黑松露味薯片90g', barcode: '6924743936010',
    brand: '301005乐事', spec: '90g', unit: '罐', weight: '90', origin: '上海',
    back: '食品处 / 休闲食品部 / 膨化类 / 薯片 / 罐装薯片',
    'mt.category': recommendedPlatformCategories.mt,
    'ele.category': '休闲食品 / 膨化食品 / 爆米花',
    'dou.category': recommendedPlatformCategories.dou
  };
  const shelfLifeUnits = ['天', '月', '年'];
  const platformAttributes = {
    mt: [
      ['品牌', '1200000088', {required: true, value: '乐事', inputType: 'text'}],
      ['口味', '1200000133', {required: true, value: '黑松露味'}],
      ['商品类别', '1200000210', {required: true, value: '薯条'}],
      ['赠品', '1200256777'],
      ['国产/进口', '1200000132'],
      ['产地', '1200000094', {suggestion: '上海'}],
      ['加工方式', '1200000224'],
      ['包装方式', '1200000135'],
      ['保质期', '1200000158', {value: '270', units: shelfLifeUnits, unit: '天'}],
      ['营养特点', '1200256715'],
      ['是否独立小包装', '1200271217']
    ],
    ele: [
      ['单件净含量', '227143751', {required: true, suggestion: '90', units: ['g', 'kg', 'mL', 'L']}],
      ['口味', '31560', {required: true, suggestion: '黑松露味'}],
      ['售卖方式', '589735080', {required: true, value: '预包装'}],
      ['商品类别', '589743111', {required: true, suggestion: '薯片'}],
      ['包装方式', '6939376', {required: true, suggestion: '罐装'}],
      ['品牌', '20000', {required: true, suggestion: '乐事'}],
      ['主要成分', '608366858', {inputType: 'text'}],
      ['产地', '589735952'],
      ['加工方式', '589738149'],
      ['包装数量', '3986737', {inputType: 'number'}],
      ['厂家联系方式', '151428601', {inputType: 'text'}],
      ['国产/进口', '560244283'],
      ['形态', '589733565'],
      ['是否独立包装', '589738839'],
      ['营养特点', '606279687'],
      ['适用场景', '589738940'],
      ['保质期', '1989873', {units: shelfLifeUnits}],
      ['包装规格', '2020563', {inputType: 'text'}],
      ['生产厂家地址', '151454497', {inputType: 'text'}],
      ['生产厂家名称', '151486361', {inputType: 'text'}]
    ],
    dou: [
      ['产地与包装', '5975', {required: true}],
      ['品牌', '1687', {value: '乐事', inputType: 'text'}],
      ['包装方式', '1758', {suggestion: '罐装'}],
      ['产地', '1880', {suggestion: '上海'}],
      ['生产企业名称', '2685', {inputType: 'text'}],
      ['保质期', '2988', {units: shelfLifeUnits}]
    ]
  };
  const initialAttributeCounts = {mt: 4, ele: 6};
  const specialImageGroups = {
    mt: [
      ['mt', '配料与营养成分图', 'special'],
      ['mtGiftBag', '原厂礼袋图', 'special']
    ],
    ele: [['ele', '背签图', 'special']],
    dou: [['dou', '食品标签图', 'special']]
  };
  const giftBagMaxImages = 4;
  const giftBagMaxBytes = 1024 * 1024;
  const giftBagFormats = ['image/jpeg', 'image/png'];
  const imageGroups = [
    ['main', '商品图片', 'main'],
    ['detail', '图文详情', 'detail'],
    ...Object.values(specialImageGroups).flat()
  ];
  const demoImage = (file, name) => ({src: `./assets/city-product-catalog/chips-demo/${file}`, name});
  const demoMain = demoImage('main.jpg', '乐事STAX黑松露味薯片主图');
  const demoNutrition = demoImage('recommended-detail-10.webp', '乐事薯片配料与营养成分图');
  const recommendations = {
    main: Array.from({length: 3}, (_, i) => demoImage(`recommended-main-${i + 1}.webp`, `主图推荐 ${i + 1}`)),
    detail: Array.from({length: 11}, (_, i) => demoImage(`recommended-detail-${i + 1}.webp`, `详情图推荐 ${i + 1}`))
  };
  const images = new Map();
  const pendingUploads = new Set();
  const picker = ccEl('cccImagePicker');
  const imageDialog = ccEl('cccImageActionDialog');
  const imagePreview = ccEl('cccImageActionPreview');
  const imageControls = ccEl('cccImageActionControls');
  const imageActionFeedback = ccEl('cccImageActionFeedback');
  let imageAction;
  let pickerGroup = '';
  let pickerOptions = [];
  let catalogMatch;
  const navigation = [...page.querySelectorAll('[data-ccc-jump]')];
  const sections = navigation.map(button => ccEl(button.dataset.cccJump));
  let navigationScroll;
  let editingProduct;
  const publishChannels = ccEl('cccChannelChoices').closest('.cc-create-channels');
  const storeSection = ccEl('cccStores');
  const storeNav = navigation.find(button => button.dataset.cccJump === storeSection.id);

  const options = values => values.map(value => `<option>${ccEscape(value)}</option>`).join('');
  const channelBadge = (key, name) =>
    `<span class="cc-channel-badge" data-channel-badge="${key}" aria-hidden="true">${name[0]}</span>`;
  ccEl('cccChannelChoices').innerHTML = '<label><input type="checkbox" id="cccSelectAll" checked /> 全选</label>' +
    channels.map(([key, name]) => `<label title="${name}"><input type="checkbox" name="channel" value="${key}" aria-label="${name}" checked />${channelBadge(key, name)}</label>`).join('');
  const frontDialog = ccEl('cccFrontDialog');
  const frontSearch = ccEl('cccFrontSearch');
  const frontTrigger = ccEl('cccChooseFront');
  const frontTags = ccEl('cccFrontTags');
  const frontRoots = ccEl('cccFrontRoots');
  const frontChildren = ccEl('cccFrontChildren');
  const frontSelection = new Set();
  let activeFrontRoot = '';

  function renderFrontTags() {
    const categories = field('front').value.split(',').filter(Boolean);
    ccEl('cccFrontPlaceholder').hidden = categories.length > 0;
    frontTags.innerHTML = categories.map(name =>
      `<span class="cc-create-front-tag">${ccEscape(name)}<button type="button" data-ccc-front-remove="${ccEscape(name)}" aria-label="移除${ccEscape(name)}">×</button></span>`).join('');
  }

  function renderFrontDialog() {
    const keyword = frontSearch.value.trim().toLowerCase();
    const matches = name => name.toLowerCase().includes(keyword);
    const roots = ccCategories.filter(category =>
      matches(category.name) || category.children.some(([name]) => matches(name)));
    const root = roots.find(category => category.name === activeFrontRoot) ?? roots[0];
    activeFrontRoot = root?.name ?? '';
    const scrollTop = frontRoots.scrollTop;
    const childScrollTop = frontChildren.scrollTop;
    frontRoots.innerHTML = roots.length ? roots.map(({name, children}) => {
      const escaped = ccEscape(name);
      const active = name === activeFrontRoot;
      return `<li class="cc-create-front-root${active ? ' is-active' : ''}">
        <button type="button" data-ccc-front-root="${escaped}" ${children.length ? `aria-current="${active}"` : `aria-pressed="${frontSelection.has(name)}"`}>${escaped}</button>
      </li>`;
    }).join('') : '<li class="cc-create-front-empty">暂无匹配类目</li>';
    frontRoots.scrollTop = scrollTop;
    const children = root?.children.filter(([name]) => matches(root.name) || matches(name)) ?? [];
    frontChildren.innerHTML = children.map(([name]) =>
      `<li><button type="button" data-ccc-front-child="${ccEscape(name)}" aria-pressed="${frontSelection.has(name)}">${ccEscape(name)}</button></li>`).join('');
    frontChildren.scrollTop = childScrollTop;
    ccEl('cccFrontSelectedTitle').textContent = `已选类目（${frontSelection.size}）`;
    ccEl('cccFrontSelected').innerHTML = [...frontSelection].map(name =>
      `<li>${ccEscape(name)}<button type="button" data-ccc-front-unpick="${ccEscape(name)}" aria-label="移除${ccEscape(name)}">×</button></li>`).join('');
  }

  frontTrigger.addEventListener('click', () => {
    frontSelection.clear();
    field('front').value.split(',').filter(Boolean).forEach(name => frontSelection.add(name));
    frontSearch.value = '';
    activeFrontRoot = '';
    frontRoots.scrollTop = 0;
    renderFrontDialog();
    frontDialog.showModal();
  });
  frontSearch.addEventListener('input', renderFrontDialog);
  frontDialog.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const {cccFrontRoot: root, cccFrontChild: child, cccFrontUnpick: unpick} = button.dataset;
    if (button.hasAttribute('data-ccc-front-cancel')) {
      frontDialog.close();
      return;
    }
    if (button.id === 'cccConfirmFront') {
      field('front').value = [...frontSelection].join(',');
      renderFrontTags();
      feedback.textContent = '';
      frontDialog.close();
      return;
    }
    if (root) {
      activeFrontRoot = root;
      frontChildren.scrollTop = 0;
    }
    const name = child || (root && !ccCategories.find(category => category.name === root).children.length ? root : '');
    if (name && !frontSelection.delete(name)) frontSelection.add(name);
    if (unpick) frontSelection.delete(unpick);
    if (!root && !child && !unpick) return;
    renderFrontDialog();
    if (unpick) frontSearch.focus({preventScroll: true});
    else {
      const buttons = (root ? frontRoots : frontChildren).querySelectorAll('button');
      [...buttons].find(item => (root ? item.dataset.cccFrontRoot : item.dataset.cccFrontChild) === (root || child))?.focus({preventScroll: true});
    }
  });
  frontTags.addEventListener('click', event => {
    const name = event.target.closest('button')?.dataset.cccFrontRemove;
    if (!name) return;
    field('front').value = field('front').value.split(',').filter(item => item !== name).join(',');
    renderFrontTags();
    frontTrigger.focus({preventScroll: true});
  });

  function attributeField(key, [label, id, config = {}], index) {
    const {value = '', suggestion = value, units, unit = '', inputType, required} = config;
    const name = `${key}.attr.${id}`;
    const choose = !units && !inputType;
    const placeholder = `${choose ? '请选择' : '请输入'}${label}`;
    const hasOptions = choose && suggestion;
    const extra = index >= (initialAttributeCounts[key] ?? Infinity);
    return `<div class="cc-create-field cc-create-attribute" ${extra ? 'data-ccc-extra-attribute hidden' : ''}>
      <label for="cccAttr-${id}"${required ? ' class="ccc-required"' : ''}>${label}：</label><div>
        <div class="${units ? 'cc-create-joined' : hasOptions ? 'cc-create-select-field' : ''}">
          <input id="cccAttr-${id}" name="${name}"${required ? ' aria-required="true"' : ''} value="${ccEscape(value)}" placeholder="${placeholder}" ${units || inputType === 'number' ? `type="number" min="0" step="${units ? 'any' : '1'}"` : ''} ${hasOptions ? `list="cccOptions-${id}"` : ''} />
          ${hasOptions ? `<datalist id="cccOptions-${id}">${options([suggestion])}</datalist>` : ''}
          ${units ? `<select name="${name}.unit" aria-label="${label}单位"${required ? ' aria-required="true"' : ''}><option value="">选择单位</option>${units.map(option => `<option${option === unit ? ' selected' : ''}>${ccEscape(option)}</option>`).join('')}</select>` : ''}
        </div>
        <small data-ccc-attribute-tip class="cc-create-recommended" hidden><span aria-hidden="true">✓</span> 已为推荐信息</small>
      </div>
    </div>`;
  }

  ccEl('cccPlatforms').innerHTML = channels.map(([key, name]) => {
    const path = recommendedPlatformCategories[key];
    return `<div class="cc-create-field cc-create-platform">
      <label for="cccPlatform-${key}" class="ccc-required" title="${name}">${channelBadge(key, name)}</label>
      <div>
        <div class="cc-create-platform-line">
          <div class="${path ? 'cc-create-select-field' : ''}">
            <input id="cccPlatform-${key}" name="${key}.category" aria-label="${name}平台类目" placeholder="请选择" ${path ? `list="cccCategory-${key}"` : ''} />
            ${path ? `<datalist id="cccCategory-${key}">${options([...new Set([demoFields[`${key}.category`], path].filter(Boolean))])}</datalist>` : ''}
          </div>
          <label class="cc-create-inline"><input type="checkbox" name="${key}.auto" data-ccc-auto="${key}" aria-label="${name}自动匹配" /> 自动匹配</label>
          ${path ? `<div class="cc-create-platform-meta">
            <span class="cc-create-recommended" data-ccc-category-recommended="${key}" hidden><span aria-hidden="true">✓</span> 已为推荐类目</span>
            <div class="cc-create-platform-suggestion" data-ccc-category-suggestion="${key}" hidden>
              <span class="cc-create-platform-suggestion-tag">推荐</span>
              <span>${ccEscape(key === 'jd' || key === 'ele' ? path.replaceAll(' / ', '，') : path)}</span>
              <button type="button" class="cc-link" data-ccc-use-category="${key}">使用推荐</button>
            </div>
          </div>` : ''}
        </div>
      </div>
    </div>`;
  }).join('');

  function jdCategoryAttributes() {
    const nutrients = [
      ['锰', 'mg'], ['氟', 'mg'], ['铜', 'mg'],
      ['能量', 'kJ'], ['蛋白质', 'g'], ['脂肪', 'g'], ['胆固醇', 'mg'],
      ['多不饱和脂肪（酸）', 'g'], ['单不饱和脂肪（酸）', 'g'], ['反式脂肪（酸）', 'g'],
      ['钾', 'mg'], ['镁', 'mg'], ['钙', 'mg'], ['铁', 'mg'], ['锌', 'mg'], ['碘', 'μg'], ['硒', 'μg']
    ];
    const productInfo = [
      '（在华）注册编号', '委托商联系方式', '委托商地址',
      '委托商名称', '产品类型', '食品名称',
      '致敏物质', '厂家联系方式', '进口商/代理商名称',
      '储存方法', '原产国（地区）', '厂址',
      '生产商家名称', '产品标准号', '生产许可证号'
    ];
    return `<fieldset id="cccJdCategoryFields" class="cc-create-jd-fields" disabled>
      <section class="cc-create-jd-section">
        <h4>营养成分表</h4>
        <div class="cc-create-jd-basis">
          <label for="cccJdNutritionAmount" class="ccc-required">计量单位</label>
          <span>每</span>
          <input id="cccJdNutritionAmount" name="jd.nutrition.amount" type="number" min="0" step="any" placeholder="请输入" aria-required="true" />
          <select name="jd.nutrition.unit" aria-label="营养成分计量单位" aria-required="true">
            <option value="">请选择</option><option>g</option><option>mL</option>
          </select>
        </div>
        <table id="cccJdNutritionTable" class="cc-create-jd-table" aria-label="京东到家营养成分表">
          <thead><tr><th scope="col">成分</th><th scope="col">含量</th></tr></thead>
          <tbody>
            ${nutrients.map(([label, unit], index) => `<tr${index >= 3 ? ' data-ccc-jd-extra hidden' : ''}>
              <th scope="row">${label}</th>
              <td><div class="cc-create-joined">
                <input type="number" name="jd.nutrition.${label}" min="0" step="any" placeholder="请输入${label}" aria-label="${label}含量（${unit}）" />
                <span class="cc-create-unit">${unit}</span>
              </div></td>
            </tr>`).join('')}
          </tbody>
        </table>
        <div class="cc-create-jd-toggle">
          <button type="button" class="cc-link" id="cccJdNutritionToggle" aria-controls="cccJdNutritionTable" aria-expanded="false">展开其他营养成分</button>
        </div>
      </section>
      <section class="cc-create-jd-section">
        <h4><label for="cccJdIngredients">配料表</label></h4>
        <div class="cc-create-jd-ingredients">
          <textarea id="cccJdIngredients" name="jd.ingredients" maxlength="2000" placeholder="请输入配料表" aria-describedby="cccJdIngredientsCount"></textarea>
          <span id="cccJdIngredientsCount">0 / 2000</span>
        </div>
      </section>
      <section class="cc-create-jd-section">
        <h4>产品信息</h4>
        <div class="cc-create-jd-product-grid">
          ${productInfo.map(label => `<label class="cc-create-field"><span>${label}</span><input name="jd.productInfo.${label}" placeholder="请输入${label}" /></label>`).join('')}
        </div>
      </section>
    </fieldset>`;
  }

  ccEl('cccPlatformAttributes').innerHTML = ['mt', 'ele', 'dou', 'jd'].map(key => {
    const [, name] = channels.find(([channelKey]) => channelKey === key);
    const attrs = platformAttributes[key];
    return `<section class="cc-create-attribute-channel" aria-label="${name}类目属性">
      <div class="cc-create-attributes-header">
        <span>${channelBadge(key, name)} <strong>${name}</strong></span>
        <div class="cc-create-attributes-header-actions">
          ${key === 'mt' || key === 'ele' ? `<button type="button" class="cc-link" data-ccc-attribute-recommend="${key}">一键推荐属性</button>` : ''}
          <button type="button" class="cc-link" data-ccc-attributes="${key}" aria-controls="cccAttrs-${key}" aria-expanded="${Boolean(attrs)}">${attrs ? '取消填写' : '填写类目属性'}</button>
        </div>
      </div>
      <div id="cccAttrs-${key}" class="cc-create-attributes" ${attrs ? '' : 'hidden'}>
        ${attrs ? `<div class="cc-create-attribute-grid">${attrs.map((item, index) => attributeField(key, item, index)).join('')}</div>` : jdCategoryAttributes()}
        ${key === 'mt' || key === 'ele' ? `<div class="cc-create-attribute-actions">
          <button type="button" class="cc-create-attribute-more" data-ccc-attribute-more="${key}" aria-expanded="false">⌄ 展开输入项，选择更多${attrs.length - initialAttributeCounts[key]}项参数</button>
        </div>` : ''}
      </div>
    </section>`;
  }).join('');

  function recommendationPanel(group) {
    return `<div class="cc-create-recommend">
      <div class="cc-create-recommend-title">淘宝闪购${group === 'main' ? '主图' : '详情图'}推荐</div>
      <div class="cc-create-recommend-content">
        <div class="cc-create-recommend-list">
          ${recommendations[group].map(({src, name}, index) => `<button type="button" class="cc-create-recommend-image" data-ccc-recommend-image="${group}" data-index="${index}" aria-label="选择${name}" aria-pressed="false"><img src="${src}" alt="" /></button>`).join('')}
        </div>
        <div class="cc-create-recommend-actions">
          ${group === 'main' ? `<button type="button" class="cc-link" data-ccc-apply-images="append" data-group="${group}">追加</button>` : ''}
          <button type="button" class="cc-link" data-ccc-apply-images="replace" data-group="${group}">覆盖</button>
        </div>
      </div>
    </div>`;
  }

  function imageRow([key, name, type]) {
    const main = key === 'main';
    const special = type === 'special';
    const giftBag = key === 'mtGiftBag';
    const content = `
        ${key === 'mt' ? `<div class="cc-create-special-description">
          <div>标题：配料&amp;营养成分图 <span>（不传将驳回下架）</span></div>
          <p>描述：当前类目需上传清晰完整的商品配料、营养成分表图片，建议上传电子扫描图或平面设计图；若实拍图片，建议对关键信息特写拍摄，保证文字清晰、背景整洁。<a href="https://daxue.meituan.com/web/shangoushang/article/16394" target="_blank" rel="noopener noreferrer">配料&amp;营养成分图上传指南</a></p>
        </div>` : ''}
        ${key === 'ele' ? `<div class="cc-create-special-description">
          <div>标题：背签图 <span>（必传）</span></div>
          <p>描述：预包装食品须上传对应商品的食品背签图，须包含产品名称、规格或净含量、生产日期、成分或配料表、生产者名称及地址及联系方式、保质期、产品标准代号、贮存条件、所使用的食品添加剂、生产许可证编号。</p>
        </div>` : ''}
        ${key === 'dou' ? `<div class="cc-create-special-description">
          <div>标题：食品标签图 <span>（必传）</span></div>
          <p>描述：抖店食品类商品需上传食品标签图，建议尺寸800*800，png/jpg/jpeg格式。</p>
        </div>` : ''}
        ${giftBag ? '<div>原厂礼袋图：</div>' : ''}
        <div class="cc-create-image-line">
          <button type="button" data-ccc-library="${key}">使用图片库</button>
          ${special ? '' : `<div class="cc-notice cc-create-image-tip" data-ccc-image-tip="${key}"><span aria-hidden="true">i</span><span>淘宝闪购：${main ? '请至少上传2张图片' : '请上传图片'}</span></div>`}
          <input type="file" accept="${giftBag ? '.png,.jpg,.jpeg' : 'image/*'}" data-ccc-file="${key}" ${key === 'dou' ? '' : 'multiple'} hidden />
        </div>
        <div class="cc-create-previews">
          <div class="cc-create-preview-items" data-ccc-previews="${key}"></div>
          <button type="button" class="cc-create-upload-tile" data-ccc-upload="${key}"><span aria-hidden="true">＋</span>上传图片</button>
        </div>
        ${main ? `<div class="cc-create-image-guidance">
          <p>1、建议图片清晰、白底，最多上传6张图，第1张为主图，可拖拽调整图片顺序；</p>
          <p>2、仅支持jpg/gif/png格式，建议使用800*800px、大小2M以内</p>
        </div>` : ''}
        ${key === 'detail' ? `<div class="cc-create-image-guidance">
          <p>支持上传格式为jpg、jpeg、png，单张大小5M以内的图片,最多可上传40张，可拖拽调整顺序；</p>
        </div>` : ''}
        ${special ? `<div class="cc-create-image-guidance">
          <p>尺寸建议为800*800，最多${key === 'dou' ? 1 : giftBag ? giftBagMaxImages : 4}张图片，仅支持png、jpg、jpeg格式，小于1M</p>
        </div>` : recommendationPanel(key)}`;
    if (special) {
      return `<div role="group" aria-label="${name}">${content}</div>`;
    }
    return `<div class="cc-create-image-row">
      <span class="${main ? 'ccc-required' : ''}">${name}：</span>
      <div>${content}</div>
    </div>`;
  }

  ccEl('cccImageGroups').innerHTML = imageGroups.filter(([, , type]) => type !== 'special').map(imageRow).join('') +
    `<div class="cc-create-image-row cc-create-special-image-row" role="group" aria-labelledby="cccSpecialImageLabel">
      <span id="cccSpecialImageLabel">特殊图片：</span>
      <div class="cc-create-image-rows">
        ${channels.filter(([key]) => specialImageGroups[key]).map(([key, name]) => `
          <div class="cc-create-special-image-card" role="group" aria-label="${name}特殊图片">
            <div class="cc-create-special-image-title">${channelBadge(key, name)} ${name}</div>
            <div class="cc-create-image-rows">${specialImageGroups[key].map(imageRow).join('')}</div>
          </div>`).join('')}
      </div>
    </div>`;

  const storeSettings = ccEl('cccStoreFields');
  const specifiedStores = ccEl('cccSpecifiedStores');
  specifiedStores.innerHTML = [...document.querySelectorAll('#absenceStoreFilter option')]
    .filter(option => option.value)
    .map(option => {
      const name = ccEscape(option.textContent.trim());
      return `<label><input type="checkbox" name="storeName" value="${name}" disabled /> ${name}</label>`;
    }).join('');

  function activateSection(section) {
    navigation.forEach(button => {
      if (button.dataset.cccJump === section.id) button.setAttribute('aria-current', 'location');
      else button.removeAttribute('aria-current');
    });
  }

  form.addEventListener('scroll', () => {
    if (navigationScroll === form.scrollTop) return;
    navigationScroll = undefined;
    const threshold = form.getBoundingClientRect().top + Math.min(96, form.clientHeight * 0.18);
    const atEnd = form.scrollTop + form.clientHeight >= form.scrollHeight - 2;
    const visibleSections = sections.filter(section => !section.hidden);
    const current = atEnd ? visibleSections.at(-1) : visibleSections.findLast(section => section.getBoundingClientRect().top <= threshold);
    activateSection(current || sections[0]);
  }, {passive: true});

  function setAttributePanel(key, expanded) {
    const button = page.querySelector(`[data-ccc-attributes="${key}"]`);
    ccEl(`cccAttrs-${key}`).hidden = !expanded;
    button.setAttribute('aria-expanded', expanded);
    button.textContent = expanded ? '取消填写' : '填写类目属性';
    if (key === 'jd') ccEl('cccJdCategoryFields').disabled = !expanded;
    const recommend = button.parentElement.querySelector('[data-ccc-attribute-recommend]');
    if (recommend) recommend.hidden = !expanded;
  }

  const jdNutritionToggle = ccEl('cccJdNutritionToggle');
  const jdIngredients = ccEl('cccJdIngredients');

  function setJdNutritionExpanded(expanded) {
    jdNutritionToggle.setAttribute('aria-expanded', expanded);
    jdNutritionToggle.textContent = expanded ? '收起其他营养成分' : '展开其他营养成分';
    ccEl('cccJdNutritionTable').querySelectorAll('[data-ccc-jd-extra]').forEach(row => { row.hidden = !expanded; });
  }

  function updateJdIngredientsCount() {
    ccEl('cccJdIngredientsCount').textContent = `${jdIngredients.value.length} / ${jdIngredients.maxLength}`;
  }

  jdNutritionToggle.addEventListener('click', () => {
    setJdNutritionExpanded(jdNutritionToggle.getAttribute('aria-expanded') !== 'true');
  });
  jdIngredients.addEventListener('input', updateJdIngredientsCount);

  function setExtraAttributes(key, expanded) {
    const panel = ccEl(`cccAttrs-${key}`);
    const button = panel.querySelector('[data-ccc-attribute-more]');
    const extraFields = panel.querySelectorAll('[data-ccc-extra-attribute]');
    button.setAttribute('aria-expanded', expanded);
    button.textContent = expanded ? '⌃ 收起输入项' : `⌄ 展开输入项，选择更多${extraFields.length}项参数`;
    extraFields.forEach(item => { item.hidden = !expanded; });
  }

  function updateChannels() {
    const selected = [...form.querySelectorAll('[name="channel"]:checked')];
    const all = ccEl('cccSelectAll');
    all.checked = selected.length === channels.length;
    all.indeterminate = selected.length > 0 && !all.checked;
    updateImageTips();
  }

  function updateStoreFields() {
    const custom = field('storeSync').value === 'custom';
    ccEl('cccStoreDefaults').hidden = custom;
    storeSettings.hidden = !custom;
    storeSettings.disabled = !custom;
    storeSettings.querySelectorAll('[data-ccc-store-option]').forEach(group => {
      const visible = field(group.dataset.cccStoreOption).value === group.dataset.value;
      group.hidden = !visible;
      group.querySelectorAll('input').forEach(input => { input.disabled = !visible; });
    });
  }

  function updateImageTips() {
    const eleSelected = form.querySelector('[name="channel"][value="ele"]').checked;
    page.querySelectorAll('[data-ccc-image-tip]').forEach(tip => {
      tip.hidden = !eleSelected;
    });
  }

  const imageActionIcons = {
    preview: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    remove: '<path d="M3 6h18m-15 0 1 14h10l1-14M9 6V3h6v3"/>',
    white: '<path d="M12 3a9 9 0 1 0 9 9M17 3v4m-2-2h4m2 0v6m-3-3h6"/>',
    edit: '<path d="m5 16 10-10 3 3L8 19H5v-3ZM16 5l2-2 3 3-2 2M5 3v5M2.5 5.5h5"/>',
    copy: '<rect x="7" y="7" width="12" height="14" rx="2"/><path d="M15 3H5a2 2 0 0 0-2 2v12"/>'
  };
  const imageActionLabels = {preview: '预览图片', white: '一键白底', edit: '图片编辑', copy: '复制到特殊图'};
  const imageIcon = name => `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${imageActionIcons[name]}</svg>`;

  function renderImages(group) {
    const groupImages = images.get(group) || [];
    page.querySelector(`[data-ccc-previews="${group}"]`).innerHTML = groupImages.map(({src, name}, index) =>
      `<figure tabindex="0">
        <img src="${ccEscape(src)}" alt="${ccEscape(name)}" />
        <div class="cc-create-image-overlay">
          <button type="button" data-ccc-image-action="preview" data-group="${group}" data-index="${index}" aria-label="预览${ccEscape(name)}" title="预览">${imageIcon('preview')}</button>
          <button type="button" data-ccc-remove="${group}" data-index="${index}" aria-label="移除${ccEscape(name)}" title="删除">${imageIcon('remove')}</button>
        </div>
        ${group === 'main' ? `<div class="cc-create-image-tools">
          <div>${['white', 'edit', 'copy'].map(action => `<button type="button" data-ccc-image-action="${action}" data-group="${group}" data-index="${index}">${imageIcon(action)}<span>${imageActionLabels[action]}</span></button>`).join('')}</div>
        </div>` : ''}
      </figure>`).join('');
  }

  function openImageAction(group, index, action) {
    const image = images.get(group)?.[index];
    if (!image) return;
    imageAction = {group, index, action, image, rotation: 0};
    ccEl('cccImageActionTitle').textContent = imageActionLabels[action];
    imagePreview.src = image.src;
    imagePreview.alt = image.name;
    imagePreview.style.transform = '';
    imagePreview.parentElement.classList.toggle('cc-create-image-white-preview', action === 'white');
    imageActionFeedback.hidden = true;
    if (action === 'copy') {
      imageControls.innerHTML = Object.entries(specialImageGroups).flatMap(([key, groups]) => {
        const [, channel] = channels.find(([id]) => id === key);
        return groups.map(([target, name]) => `<button type="button" data-ccc-image-target="${target}">${channel} · ${name}</button>`);
      }).join('');
    } else {
      imageControls.innerHTML = `${action === 'edit' ? '<button type="button" data-ccc-image-rotate>旋转 90°</button>' : ''}
        ${action === 'edit' || action === 'white' ? '<button type="button" class="cc-primary" data-ccc-image-confirm>应用</button>' : ''}`;
    }
    imageControls.hidden = action === 'preview';
    imageDialog.showModal();
  }

  function imageActionError(message) {
    imageActionFeedback.textContent = message;
    imageActionFeedback.hidden = false;
  }

  function applyImageAction(target) {
    const {group, index, action, image, rotation} = imageAction;
    let result = image;
    if (!target || target === 'mtGiftBag') {
      if (!imagePreview.complete || !imagePreview.naturalWidth) {
        imageActionError('图片尚未加载，请稍后重试。');
        return;
      }
      const white = action === 'white' || target === 'mtGiftBag';
      const sideways = rotation % 180 !== 0;
      const {naturalWidth, naturalHeight} = imagePreview;
      const canvas = document.createElement('canvas');
      canvas.width = sideways ? naturalHeight : naturalWidth;
      canvas.height = sideways ? naturalWidth : naturalHeight;
      if (action === 'white') canvas.width = canvas.height = Math.max(naturalWidth, naturalHeight);
      const context = canvas.getContext('2d');
      if (white) {
        context.fillStyle = '#fff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.translate(canvas.width / 2, canvas.height / 2);
      context.rotate(rotation * Math.PI / 180);
      context.drawImage(imagePreview, -naturalWidth / 2, -naturalHeight / 2);
      const src = canvas.toDataURL(white ? 'image/jpeg' : 'image/png', 0.9);
      if (target === 'mtGiftBag' && (src.length - src.indexOf(',') - 1) * 3 / 4 >= giftBagMaxBytes) {
        imageActionError('图片超过原厂礼袋图的 1 MB 大小限制。');
        return;
      }
      result = {src, name: image.name};
    }

    if (target) {
      if (target === 'mtGiftBag' && (images.get(target)?.length ?? 0) >= giftBagMaxImages) {
        imageActionError(`原厂礼袋图最多上传${giftBagMaxImages}张。`);
        return;
      }
      addImages(target, [result]);
    } else {
      images.get(group)[index] = result;
      renderImages(group);
    }
    imageDialog.close();
    if (!target) page.querySelector(`[data-ccc-previews="${group}"]`).children[index]?.focus({preventScroll: true});
    ccToast(target ? '已复制到特殊图' : '已应用图片调整');
  }

  function addImages(group, additions) {
    const current = images.get(group) || [];
    if (group === 'dou') {
      images.set(group, additions.slice(0, 1));
    } else {
      const next = [...current, ...additions.filter(image => !current.some(item => item.src === image.src))];
      images.set(group, group === 'mtGiftBag' ? next.slice(0, giftBagMaxImages) : next);
      if (group === 'mtGiftBag' && next.length > giftBagMaxImages) {
        renderImages(group);
        showError(`原厂礼袋图最多上传${giftBagMaxImages}张。`);
        return;
      }
    }
    renderImages(group);
    feedback.textContent = '';
  }

  function openImagePicker(group) {
    pickerGroup = group;
    const libraryType = imageGroups.find(([id]) => id === group)[2];
    const demoImages = group === 'main' ? [demoMain, ...recommendations.main] : recommendations[group] || [];
    if (group === 'mt') demoImages.push(demoNutrition);
    const sources = [...demoImages, ...imageLibraryAssets[libraryType]];
    pickerOptions = [...new Map(sources.map(image => [image.src, image])).values()];
    ccEl('cccImageChoices').innerHTML = pickerOptions.map(({src, name}, index) =>
      `<button type="button" data-ccc-pick="${index}"><img src="${ccEscape(src)}" alt="" /><span>${ccEscape(name)}</span></button>`).join('');
    picker.showModal();
  }

  function showError(message, target) {
    feedback.textContent = message;
    target?.focus();
  }

  function matchPlatform(key) {
    if (!field(`${key}.auto`).checked || field(`${key}.category`).value.trim()) return;
    const category = field('code').value.trim() === demoFields.code
      ? recommendedPlatformCategories[key]
      : catalogMatch?.[9]?.[key];
    if (category) field(`${key}.category`).value = category;
    else showError('本地商品档案暂无该渠道的匹配类目，请手动填写。');
  }

  function updateJdBrandRecommendation() {
    const recommendation = field('code').value.trim() === demoFields.code ? demoFields.brand.replace(/^\d+/, '') : '';
    const isRecommended = field('jdBrand').value.trim() === recommendation;
    ccEl('cccJdBrandHint').hidden = !recommendation;
    ccEl('cccJdBrandRecommended').hidden = !isRecommended;
    ccEl('cccJdBrandSuggestion').hidden = isRecommended;
    ccEl('cccJdBrandSuggestionText').textContent = recommendation;
  }

  function lookupProduct() {
    const code = field('code').value.trim();
    if (code === demoFields.code) {
      for (const [name, value] of Object.entries(demoFields)) {
        if (!field(name).value.trim()) field(name).value = value;
      }
      channels.forEach(([key]) => updateCategoryRecommendation(key));
      updateJdBrandRecommendation();
      feedback.textContent = '已补全薯片样例中有值的空白字段。';
      return;
    }
    catalogMatch = products.find(product => product[0] === code);
    const record = standardProducts.find(product => product.code === code);
    if (!catalogMatch && !record) {
      showError(code ? '本地商品档案未找到该编码，请核对后重新查找。' : '请先输入商品编码。', field('code'));
      return;
    }
    const values = catalogMatch
      ? {name: catalogMatch[1], barcode: catalogMatch[2], spec: catalogMatch[3], unit: catalogMatch[4], weight: catalogMatch[5], back: catalogMatch[11]}
      : {name: record.name, barcode: record.barcode, spec: record.spec, unit: record.unit, weight: record.weight, back: record.backendCategory};
    values.weight = /^\s*(\d+(?:\.\d+)?)\s*g?\s*$/i.exec(values.weight || '')?.[1] || '';
    for (const [name, value] of Object.entries(values)) {
      if (!field(name).value.trim()) field(name).value = value || '';
    }
    feedback.textContent = '已补全本地档案中有值的空白字段。';
    channels.forEach(([key]) => matchPlatform(key));
  }

  function clearDraft(keepImages) {
    if (!keepImages) pendingUploads.forEach(url => URL.revokeObjectURL(url));
    pendingUploads.clear();
    images.clear();
    catalogMatch = undefined;
    form.reset();
    field('front').value = '时令上新,柑橘橙柚';
    renderFrontTags();
    for (const [name, value] of Object.entries(demoFields)) field(name).value = value;
    updateJdBrandRecommendation();
    channels.forEach(([key]) => {
      setAttributePanel(key, Boolean(demoFields[`${key}.category`]));
      updateCategoryRecommendation(key);
    });
    Object.keys(initialAttributeCounts).forEach(key => setExtraAttributes(key, false));
    setJdNutritionExpanded(false);
    updateJdIngredientsCount();
    page.querySelectorAll('[data-ccc-attribute-tip]').forEach(tip => { tip.hidden = true; });
    images.set('main', [demoMain, ...recommendations.main.slice(1, 3)]);
    images.set('detail', recommendations.detail.slice(0, 7));
    images.set('mt', [demoNutrition]);
    imageGroups.forEach(([key]) => renderImages(key));
    page.querySelectorAll('[data-ccc-recommend-image]').forEach(button => button.setAttribute('aria-pressed', 'false'));
    feedback.textContent = '';
    updateChannels();
    updateStoreFields();
  }

  function returnToList(saved = false) {
    const editedId = editingProduct?.id;
    clearDraft(saved);
    editingProduct = undefined;
    page.hidden = true;
    list.hidden = false;
    const rowEdit = editedId && list.querySelector(`[data-cc-edit="${editedId}"]`);
    (rowEdit || ccEl('ccCreate')).focus();
  }

  function setIssueExpanded(expanded) {
    issueToggle.setAttribute('aria-expanded', String(expanded));
    issueToggle.textContent = expanded ? '收起' : '展开';
    issueDetails.querySelectorAll('[data-ccc-extra-issue]').forEach(item => {
      item.hidden = !expanded;
    });
  }

  function renderIssueNotice(product) {
    issueNotice.hidden = !product;
    if (issueNotice.hidden) return;

    const hasIssueDetails = Boolean(product.issues?.length);
    const groups = hasIssueDetails ? product.issues : ccExampleIssues;
    ccEl('cccIssueExample').hidden = hasIssueDetails;
    ccEl('cccIssueChannelCount').textContent = groups.length;
    issueDetails.innerHTML = ccIssueDetails(groups, true);
    issueToggle.hidden = !issueDetails.querySelector('[data-ccc-extra-issue]');
    setIssueExpanded(false);
  }

  issueToggle.addEventListener('click', () => {
    setIssueExpanded(issueToggle.getAttribute('aria-expanded') !== 'true');
  });

  function openEditor(product) {
    editingProduct = product;
    clearDraft(false);
    for (const [group] of imageGroups) {
      const savedImages = product?.creation?.images?.[group];
      if (!savedImages) continue;
      images.set(group, [...savedImages]);
      renderImages(group);
    }
    field('combo').value = product?.combo ? 'yes' : 'no';
    const savedFields = product?.creation?.fields;
    field('mtSellingPoint').value = savedFields?.mtSellingPoint ?? '';
    field('eleSellingPoint').value = savedFields?.eleSellingPoint ?? '';
    renderIssueNotice(product);
    const editing = Boolean(product);
    page.setAttribute('aria-label', editing ? '编辑商品' : '创建商品');
    page.querySelector('.cc-create-nav').setAttribute('aria-label', editing ? '编辑商品区块' : '创建商品区块');
    publishChannels.hidden = editing;
    storeSection.hidden = editing;
    storeNav.hidden = editing;
    form.querySelectorAll('.cc-create-channels input, [name="storeSync"]').forEach(input => {
      input.disabled = editing;
    });
    list.hidden = true;
    page.hidden = false;
    form.scrollTop = 0;
    navigationScroll = 0;
    activateSection(sections[0]);
    navigation[0].focus({preventScroll: true});
  }

  ccEl('ccCreate').addEventListener('click', () => openEditor());
  ccEl('cccLookup').addEventListener('click', lookupProduct);
  ccEl('cccUseJdBrand').addEventListener('click', () => {
    const input = field('jdBrand');
    input.value = ccEl('cccJdBrandSuggestionText').textContent;
    input.dispatchEvent(new Event('input', {bubbles: true}));
    input.focus({preventScroll: true});
  });
  ccEl('cccCloseImagePicker').addEventListener('click', () => picker.close());

  function updateCategoryRecommendation(key) {
    const tip = page.querySelector(`[data-ccc-category-recommended="${key}"]`);
    if (!tip) return;
    const suggestion = page.querySelector(`[data-ccc-category-suggestion="${key}"]`);
    const matchesDemo = field('code').value.trim() === demoFields.code;
    const isRecommended = field(`${key}.category`).value.trim() === recommendedPlatformCategories[key];
    tip.hidden = !matchesDemo || !isRecommended;
    suggestion.hidden = !matchesDemo || isRecommended;
  }

  form.addEventListener('input', event => {
    if (event.target.name === 'code') {
      catalogMatch = undefined;
      archiveFields.forEach(input => { input.value = ''; });
      channels.forEach(([key]) => updateCategoryRecommendation(key));
    }
    if (event.target.name === 'code' || event.target.name === 'jdBrand') updateJdBrandRecommendation();
    const tip = event.target.closest('.cc-create-attribute')?.querySelector('[data-ccc-attribute-tip]');
    if (tip) tip.hidden = true;
    if (event.target.name?.endsWith('.category')) updateCategoryRecommendation(event.target.name.split('.')[0]);
    feedback.textContent = '';
  });
  form.addEventListener('change', event => {
    const input = event.target;
    if (input.id === 'cccSelectAll') form.querySelectorAll('[name="channel"]').forEach(channel => { channel.checked = input.checked; });
    if (input.name === 'channel' || input.id === 'cccSelectAll') updateChannels();
    if (['storeSync', 'storePriceMode', 'storeStockMode', 'storeRange'].includes(input.name)) updateStoreFields();
    if (input.dataset.cccAuto) {
      matchPlatform(input.dataset.cccAuto);
      updateCategoryRecommendation(input.dataset.cccAuto);
    }
    if (input.dataset.cccFile) {
      const group = input.dataset.cccFile;
      const files = [...input.files];
      if (group === 'mtGiftBag' && files.some(file => !giftBagFormats.includes(file.type) || file.size >= giftBagMaxBytes)) {
        showError('原厂礼袋图仅支持 PNG、JPG、JPEG 格式，单张须小于 1 MB。');
        input.value = '';
        return;
      }
      const uploads = files.filter(file => file.type.startsWith('image/')).map(file => {
        const src = URL.createObjectURL(file);
        pendingUploads.add(src);
        return {src, name: file.name};
      });
      if (uploads.length) addImages(group, uploads);
      else showError('请选择图片文件。');
      input.value = '';
    }
  });

  page.addEventListener('click', event => {
    const button = event.target.closest('button');
    if (!button) return;
    const data = button.dataset;
    if (data.cccImageAction) openImageAction(data.group, Number(data.index), data.cccImageAction);
    if ('cccImageClose' in data) imageDialog.close();
    if ('cccImageRotate' in data) {
      imageAction.rotation = (imageAction.rotation + 90) % 360;
      imagePreview.style.transform = `rotate(${imageAction.rotation}deg)`;
    }
    if ('cccImageConfirm' in data || data.cccImageTarget) applyImageAction(data.cccImageTarget);
    if ('cccClose' in data) returnToList();
    if (data.cccJump) {
      const section = ccEl(data.cccJump);
      form.scrollTop += section.getBoundingClientRect().top - form.getBoundingClientRect().top;
      navigationScroll = form.scrollTop;
      activateSection(section);
    }
    if (data.cccUseCategory) {
      const key = data.cccUseCategory;
      const input = field(`${key}.category`);
      input.value = recommendedPlatformCategories[key];
      updateCategoryRecommendation(key);
      input.focus({preventScroll: true});
    }
    if (data.cccAttributes) setAttributePanel(data.cccAttributes, button.getAttribute('aria-expanded') !== 'true');
    if (data.cccAttributeMore) setExtraAttributes(data.cccAttributeMore, button.getAttribute('aria-expanded') !== 'true');
    if (data.cccAttributeRecommend) {
      const key = data.cccAttributeRecommend;
      for (const [, id, {value, suggestion = value, units, unit = units?.[0]} = {}] of platformAttributes[key]) {
        const input = field(`${key}.attr.${id}`);
        if (!suggestion || input.value) continue;
        input.value = suggestion;
        if (unit) field(`${key}.attr.${id}.unit`).value = unit;
        input.closest('.cc-create-attribute').querySelector('[data-ccc-attribute-tip]').hidden = false;
      }
    }
    if (data.cccRecommendImage) button.setAttribute('aria-pressed', button.getAttribute('aria-pressed') !== 'true');
    if (data.cccApplyImages) {
      const group = data.group;
      const selected = [...page.querySelectorAll(`[data-ccc-recommend-image="${group}"][aria-pressed="true"]`)];
      const additions = selected.length ? selected.map(item => recommendations[group][Number(item.dataset.index)]) : recommendations[group];
      if (data.cccApplyImages === 'replace') images.set(group, []);
      addImages(group, additions);
      selected.forEach(item => item.setAttribute('aria-pressed', 'false'));
    }
    if (data.cccUpload) form.querySelector(`[data-ccc-file="${data.cccUpload}"]`).click();
    if (data.cccLibrary) openImagePicker(data.cccLibrary);
    if ('cccPick' in data) {
      addImages(pickerGroup, [pickerOptions[Number(data.cccPick)]]);
      picker.close();
    }
    if (data.cccRemove) {
      images.get(data.cccRemove).splice(Number(data.index), 1);
      renderImages(data.cccRemove);
      form.querySelector(`[data-ccc-upload="${data.cccRemove}"]`).focus();
    }
  });

  form.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(form);
    data.set('combo', field('combo').value);
    const storeNames = data.getAll('storeName');
    data.delete('storeName');
    const values = Object.fromEntries([...data].map(([key, value]) => [key, String(value).trim()]));
    if (!values.name || !values.barcode || !values.back) {
      const missing = ['name', 'barcode', 'back'].find(name => !values[name]);
      if (missing === 'barcode') showError('请通过商品编码查找商品条码。', ccEl('cccLookup'));
      else showError('请补全商品名称和后台类目。', field(missing));
      return;
    }
    if (!values.front) {
      showError('请至少选择一个前台类目。', frontTrigger);
      return;
    }
    if (ccState.products.some(product => product !== editingProduct && product.code === values.code)) {
      showError('商品编码已存在，请修改。', field('code'));
      return;
    }
    const selected = data.getAll('channel');
    if (!editingProduct) {
      if (!selected.length) {
        showError('请至少选择一个发布渠道。', ccEl('cccSelectAll'));
        return;
      }
      const missingCategory = selected.find(key => !values[`${key}.category`]);
      if (missingCategory) {
        const channelName = channels.find(([key]) => key === missingCategory)[1];
        showError(`请填写${channelName}平台类目。`, field(`${missingCategory}.category`));
        return;
      }
      if (values.storeRange === 'specified' && !storeNames.length) {
        showError('请至少选择一家门店。', specifiedStores.querySelector('input'));
        return;
      }
    }
    if (!images.get('main')?.length) {
      showError('请上传或选择至少一张商品图片。', form.querySelector('[data-ccc-upload="main"]'));
      return;
    }
    if (!ccEl('cccJdCategoryFields').disabled) {
      const missing = ['jd.nutrition.amount', 'jd.nutrition.unit'].find(name => !values[name]);
      if (missing) {
        showError('请填写京东到家营养成分表的计量单位。', field(missing));
        return;
      }
    }

    const productFields = {
      code: values.code, name: values.name, barcode: values.barcode, spec: values.spec, unit: values.unit,
      weight: `${values.weight}g`, front: values.front, back: values.back,
      combo: values.combo === 'yes', photo: images.get('main')[0].src
    };
    const productImages = Object.fromEntries(images);
    const usedSources = new Set([...images.values()].flat().map(image => image.src));
    pendingUploads.forEach(url => { if (!usedSources.has(url)) URL.revokeObjectURL(url); });
    if (editingProduct) {
      const existing = editingProduct.creation;
      Object.assign(editingProduct, productFields, {
        creation: {...existing, fields: {...existing?.fields, ...values}, images: productImages}
      });
      ccLog(editingProduct, '编辑商品');
      ccRender();
      returnToList(true);
      ccToast('商品已更新');
      return;
    }

    const product = {
      ...productFields,
      id: Math.max(0, ...ccState.products.map(item => item.id)) + 1,
      status: '售卖', syncName: '停用', syncImage: '启用', issue: false, stores: [],
      creation: {fields: values, channels: selected, storeNames, images: productImages}
    };
    ccState.products.unshift(product);
    ccLog(product, '创建商品');
    ccState.tab = 'all';
    ccState.page = 1;
    ccEl('ccFilters').reset();
    returnToList(true);
    ccToast('商品已创建');
  });

  return product => { if (product) openEditor(product); };
})();
