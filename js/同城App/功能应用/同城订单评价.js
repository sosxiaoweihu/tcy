(() => {
  const page=document.getElementById('orderReviewsPage'),entry=document.getElementById('openOrderReviews'),$=s=>page.querySelector(s);
  const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const stores=['便利一店','家得福鸥翔路店','家得福锦绣汇店','家得福海州湾店','家得福白虎山店','家得福嘉瑞宝店'];
  const fruitStores=['北京市朝阳区果多美左家庄店','北京市西城区果多美月坛南街店','北京市东城区果多美北新桥南店','北京市朝阳区果多美大望路店','北京市丰台区果多美蒲黄榆店','北京市丰台区果多美富丰桥店','北京市东城区果多美和平里西街店','北京市朝阳区果多美劲松中街店','北京市朝阳区果多美甜水园店','北京市朝阳区果多美枣营北里店','北京市大兴区果多美亦庄梅园店','北京市朝阳区果多美七圣南路店'];
  const storeCatalog=[...stores.map(name=>({name,format:'便利店'})),...fruitStores.map(name=>({name,format:'果多美'})),...fruitStores.slice(0,4).map(name=>({name:name+'（抖店）',format:'果多美抖店'}))];
  const businessFormats=['','便利店','果多美','果多美抖店'];
  let draftStore='',draftBusiness='';
  const channels=['美团','淘宝','京东','抖店','自营'];
  const sources=['美团外卖','淘宝闪购','京东到家','小程序','小程序'];
  // 商品、业态及补充评论为布局演示数据，不代表真实订单。
  const sampleProducts=[{name:'农夫山泉饮用天然水 550ml',reaction:'like'},{name:'乐事原味薯片 70g',reaction:'dislike'},{name:'伊利纯牛奶 250ml',reaction:'like'},{name:'奥利奥原味夹心饼干 97g',reaction:'like'}];
  const reviewImages=['./assets/product-beef.svg','./assets/product-fish.svg','./assets/product-shrimp.svg'];
  const rows=[['4080050373768926926',0],['4018020371351614173',0],['',1],['',1],['4059726206330873537',2],['',3],['4005936207353798249',4],['4095766207376056995',5]].map(([order,store],id)=>({id,order,store:stores[store],date:'2026-09-08',channel:channels[id%channels.length],source:sources[id%sources.length],images:id===0?reviewImages:id===1?reviewImages.slice(0,2):[],format:'便利店',products:id===6?[{name:'鲜猪肚 约500g',reaction:'dislike'},sampleProducts[0]]:sampleProducts.slice(0,id%2===0?4:2),score:id===6?3:5,quality:id===6?3:5,packing:5,comment:id===6?'猪肚超级不好，还有味道，不要买这个猪肚':id===0?'商品齐全，包装完好，送得也很快，下次还会再来！':id===1?'东西很好，日期新鲜，服务也很满意。':'',reply:id===1?'感谢您的好评，您的肯定是我们最大的鼓励，是我们未来不断前进的动力，我们会更加努力为您提供满意舒心的服务，期待您再次光临！':''}));
  const defaults={start:'2026-09-03',end:'2026-09-09',store:'',storeFormat:'',channel:'',satisfaction:'',replied:''};
  let filters={...defaults},expanded=new Set(),timer,returnFocus;
  const filtered=()=>rows.filter(r=>r.date>=filters.start&&r.date<=filters.end&&(!filters.storeFormat||storeCatalog.some(s=>s.name===r.store&&s.format===filters.storeFormat))&&(!filters.store||r.store===filters.store)&&(!filters.channel||r.source===filters.channel)&&(!filters.satisfaction||(filters.satisfaction==='good'?r.score>=4:filters.satisfaction==='neutral'?r.score===3:r.score<=2))&&(!filters.replied||(filters.replied==='yes')===Boolean(r.reply)));
  const filterGroups=[
    {key:'channel',label:'渠道',options:[['','全部'],['淘宝闪购','淘宝闪购'],['京东到家','京东到家'],['美团外卖','美团外卖'],['小程序','小程序']]},
    {key:'satisfaction',label:'满意程度',options:[['','全部'],['good','好评(4-5星)'],['neutral','中评(3星)'],['bad','差评(1-2星)']]},
    {key:'replied',label:'是否回复',options:[['','全部'],['no','未回复'],['yes','已回复']]}
  ];
  let draftFilters={};
  new ResizeObserver(()=>{const bar=$('.or-filterbar');$('.or-sheet').style.setProperty('--or-date-top',`${bar.offsetTop+bar.offsetHeight}px`);['#orFilterDropdown','#orStoreDropdown'].forEach(id=>{if(!$(id).hidden)$(id).style.top=`${bar.offsetTop+bar.offsetHeight}px`;});}).observe($('.or-filterbar'));
  function renderFilterOptions(){
    $('.or-filter-options').innerHTML=filterGroups.map(group=>`<fieldset><legend>${group.label}</legend><div class="or-filter-grid">${group.options.map(([value,label])=>`<button type="button" data-filter-key="${group.key}" data-filter-value="${value}" aria-pressed="${draftFilters[group.key]===value}">${label}</button>`).join('')}</div></fieldset>`).join('');
  }
  function closeDropdown(){
    $('#orFilterDropdown').hidden=true;$('[data-or-filter="more"]').setAttribute('aria-expanded','false');$('.or-list').inert=false;
  }
  function toggleDropdown(){
    if(!$('#orFilterDropdown').hidden){closeDropdown();return;}
    closeStoreDropdown();hideSheet();draftFilters=Object.fromEntries(filterGroups.map(g=>[g.key,filters[g.key]]));renderFilterOptions();
    const bar=$('.or-filterbar');$('#orFilterDropdown').style.top=`${bar.offsetTop+bar.offsetHeight}px`;
    $('#orFilterDropdown').hidden=false;$('[data-or-filter="more"]').setAttribute('aria-expanded','true');$('.or-list').inert=true;
  }

  function toast(s){$('.or-toast').textContent=s;$('.or-toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('.or-toast').hidden=true,2000);}
  function productReaction(reaction){
    const hand='<path d="M7 10v11H3V10h4Zm0 0 4-8a3 3 0 0 1 3 3v4h5a2 2 0 0 1 2 2l-1.4 8a2 2 0 0 1-2 2H7"/>';
    return `<span class="or-product-reaction" role="img" aria-label="${reaction==='dislike'?'顾客点踩':'顾客点赞'}"><svg class="is-active ${reaction==='dislike'?'or-thumb-down':''}" viewBox="0 0 24 24" aria-hidden="true">${hand}</svg></span>`;
  }
  function ratingItem(label,value,id){
    const full=Number(value)===5;
    const star='M12 2.5 15 8.5 21.6 9.5 16.8 14.2 18 20.8 12 17.7 6 20.8 7.2 14.2 2.4 9.5 9 8.5Z';
    return `<div class="or-rating-item"><span>${label}</span><strong>${Number(value).toFixed(1)}</strong><svg class="or-rating-star" data-fill="${full?'full':'half'}" viewBox="0 0 24 24" role="img" aria-label="${full?'整星':'半星'}">${full?'':`<defs><clipPath id="or-star-${id}"><rect width="12" height="24"/></clipPath></defs>`}<path d="${star}" fill="currentColor" ${full?'':`clip-path="url(#or-star-${id})"`}/><path d="${star}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg></div>`;
  }
  function render(){
    const list=filtered();$('#orCount').textContent=`（共${list.length}条）`;
    $('#orDateLabel').textContent=`${filters.start} 至 ${filters.end}`;
    $('#orStoreLabel').textContent=filters.store||(filters.storeFormat?filters.storeFormat+'·全部门店':'全部门店');$('#orStoreLabel').title=$('#orStoreLabel').textContent;
    $('.or-list').innerHTML=list.map(r=>{
      const isExpanded=expanded.has(r.id),products=isExpanded?r.products:r.products.slice(0,2);
      return `<article class="or-card">
        <header class="or-card-head"><strong class="or-channel-badge" data-channel="${r.channel}">${r.channel}</strong><strong class="or-card-store">${esc(r.store)}</strong><time>${r.date}</time></header>
        <div class="or-card-body">
          <div class="or-rating">${ratingItem('总分',r.score,`score-${r.id}`)}${ratingItem('质量',r.quality,`quality-${r.id}`)}${ratingItem('包装',r.packing,`packing-${r.id}`)}</div>
          <p class="or-comment${r.comment?'':' or-muted'}">${r.comment?esc(r.comment):'顾客未填写评论'}</p>
          ${r.images.length?`<div class="or-review-images" aria-label="顾客评价图片">${r.images.map((src,index)=>`<button type="button" data-review-image="${index}" data-review-id="${r.id}" aria-label="查看第${index+1}张评价图片"><img src="${src}" alt="顾客评价示例图片 ${index+1}" loading="lazy"/></button>`).join('')}</div>`:''}
          ${r.reply?`<div class="or-reply"><strong>商家回复</strong><p>${esc(r.reply)}</p></div>`:''}
          <section class="or-products" aria-label="订单商品"><div class="or-product-list">${products.map(product=>`<div class="or-product"><span>${esc(product.name)}</span>${productReaction(product.reaction)}</div>`).join('')}</div>${r.products.length>2?`<button class="or-products-toggle" type="button" data-products="${r.id}" aria-expanded="${isExpanded}">${isExpanded?'收起':'展开'} ${isExpanded?'⌃':'⌄'}</button>`:''}</section>
          <footer class="or-actions"><button class="or-order-number" type="button" data-order="${r.id}" title="订单号：${r.order||'—'}" aria-label="查看订单号：${r.order||'—'}">订单号：${r.order||'—'}</button><button type="button" class="or-reply-button" ${r.reply?'disabled':`data-reply="${r.id}"`}>${r.reply?'已回复':'回复'}</button></footer>
        </div>
      </article>`;
    }).join('')+`<p class="or-end">${list.length?'已显示全部评价':'暂无符合条件的评价'}</p>`;
  }
  function hideSheet(){ $('.or-sheet').hidden=true;$('[data-or-filter="date"]').setAttribute('aria-expanded','false'); }
  function close(){ hideSheet();returnFocus?.focus(); }
  function sheet(title,html,fromTop=false){returnFocus=document.activeElement;$('.or-sheet').classList.toggle('or-date-sheet',fromTop);const bar=$('.or-filterbar');$('.or-sheet').style.setProperty('--or-date-top',`${bar.offsetTop+bar.offsetHeight}px`);$('[data-or-filter="date"]').setAttribute('aria-expanded',String(fromTop));$('#orSheetTitle').textContent=title;$('.or-sheet-body').innerHTML=html;$('.or-sheet').hidden=false;$('.or-sheet header button').focus();}
  function openFilters(kind){
    if(kind==='more'){toggleDropdown();return;}
    if(kind==='date'&&!$('.or-sheet').hidden&&$('.or-sheet').classList.contains('or-date-sheet')){close();return;}
    closeStoreDropdown();closeDropdown();
    let html='';
    if(kind==='date') html=`<div class="or-dates"><label>开始日期<input aria-label="开始日期" type="date" name="start" required value="${filters.start}"></label><label>结束日期<input aria-label="结束日期" type="date" name="end" required value="${filters.end}"></label></div>`;
    sheet({date:'评价时间',store:'选择门店',more:'筛选'}[kind],`<form class="or-form" data-kind="${kind}">${html}<p class="or-error" role="alert"></p><div class="or-form-actions"><button type="button" data-or-reset>重置</button><button type="submit">查询</button></div></form>`,true);
  }
  function renderStoreList(){
    const keyword=$('#orStoreKeyword').value.trim().toLowerCase();
    const matches=storeCatalog.filter(s=>(!draftBusiness||s.format===draftBusiness)&&s.name.toLowerCase().includes(keyword));
    $('.or-store-list').innerHTML=(keyword?'':`<button type="button" data-or-store="" aria-pressed="${draftStore===''}"><span>全部门店</span><i aria-hidden="true">✓</i></button>`)+matches.map(s=>`<button type="button" data-or-store="${esc(s.name)}" aria-pressed="${draftStore===s.name}"><span>${esc(s.name)}</span><i aria-hidden="true">✓</i></button>`).join('')+(matches.length?'':'<p class="or-end">暂无匹配门店，请更换关键字</p>');
    $('[data-or-store-clear]').hidden=!keyword;
  }
  function renderBusiness(){
    $('.or-business-options').innerHTML=businessFormats.map(format=>`<button type="button" data-or-business="${format}" aria-pressed="${draftBusiness===format}"><span>${format||'全部'}</span></button>`).join('');
  }
  function closeStoreDropdown(){ $('#orStoreDropdown').hidden=true;$('#orStoreSelect').setAttribute('aria-expanded','false');$('.or-list').inert=false; }
  function openStoreDropdown(){
    if(!$('#orStoreDropdown').hidden){closeStoreDropdown();return;}
    closeDropdown();hideSheet();draftStore=filters.store;draftBusiness=filters.storeFormat;$('#orStoreKeyword').value='';renderBusiness();renderStoreList();
    const bar=$('.or-filterbar');$('#orStoreDropdown').style.top=`${bar.offsetTop+bar.offsetHeight}px`;$('#orStoreDropdown').hidden=false;$('#orStoreSelect').setAttribute('aria-expanded','true');$('.or-list').inert=true;$('.or-store-list').scrollTop=0;
  }
  $('#orStoreSelect').addEventListener('click',openStoreDropdown);
  $('#orStoreKeyword').addEventListener('input',()=>{renderStoreList();$('.or-store-list').scrollTop=0;});
  function switchReviewTab(tab){
    closeStoreDropdown();closeDropdown();hideSheet();$('.or-toast').hidden=true;
    $('#orCityPanel').hidden=tab!=='city';$('#orMiniPanel').hidden=tab!=='mini';
    $('.or-review-tabs').querySelectorAll('button').forEach(button=>{const selected=button.dataset.reviewTab===tab;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1;});
  }
  $('.or-review-tabs').addEventListener('keydown',e=>{if(!['ArrowLeft','ArrowRight','Home','End'].includes(e.key))return;e.preventDefault();const tab=e.key==='Home'?'city':e.key==='End'?'mini':e.target.dataset.reviewTab==='city'?'mini':'city';switchReviewTab(tab);$(`[data-review-tab="${tab}"]`).focus();});
  function openPage(){setRetailUnionAppOpen(true);page.hidden=false;entry.hidden=true;closeStoreDropdown();closeDropdown();hideSheet();switchReviewTab('city');render();}
  entry.addEventListener('click',openPage);
  page.addEventListener('click',e=>{
    const b=e.target.closest('button');if(!b)return;
    if(b.dataset.reviewTab)switchReviewTab(b.dataset.reviewTab);
    if(b.hasAttribute('data-or-back')){closeStoreDropdown();closeDropdown();close();setRetailUnionAppOpen(true);}
    if(b.hasAttribute('data-or-store-cancel')){closeStoreDropdown();$('#orStoreSelect').focus();}
    if(b.hasAttribute('data-or-store-confirm')){filters.store=draftStore;filters.storeFormat=draftBusiness;closeStoreDropdown();expanded.clear();render();$('.or-list').scrollTop=0;$('#orStoreSelect').focus();}
    if(b.hasAttribute('data-or-business')){draftBusiness=b.dataset.orBusiness;draftStore='';renderBusiness();renderStoreList();$('.or-store-list').scrollTop=0;}
    if(b.hasAttribute('data-or-store')){draftStore=b.dataset.orStore;$('.or-store-list').querySelectorAll('button').forEach(option=>option.setAttribute('aria-pressed',String(option===b)));}
    if(b.hasAttribute('data-or-store-clear')){$('#orStoreKeyword').value='';renderStoreList();$('#orStoreKeyword').focus();}
    if(b.hasAttribute('data-or-close'))close();
    if(b.hasAttribute('data-or-filter-cancel'))closeDropdown();
    if(b.dataset.filterKey){draftFilters[b.dataset.filterKey]=b.dataset.filterValue;b.closest('.or-filter-grid').querySelectorAll('button').forEach(option=>option.setAttribute('aria-pressed',String(option===b)));}
    if(b.hasAttribute('data-or-filter-reset')){filterGroups.forEach(g=>draftFilters[g.key]='');renderFilterOptions();}
    if(b.hasAttribute('data-or-filter-apply')){Object.assign(filters,draftFilters);closeDropdown();render();$('.or-list').scrollTop=0;$('[data-or-filter="more"]').focus();}
    if(b.dataset.orFilter)openFilters(b.dataset.orFilter);
    if(b.hasAttribute('data-review-image')){const r=rows[Number(b.dataset.reviewId)],index=Number(b.dataset.reviewImage);sheet(`评价图片 ${index+1}/${r.images.length}`,`<div class="or-image-preview"><img src="${r.images[index]}" alt="顾客评价示例图片 ${index+1}"/></div>`);}
    if(b.hasAttribute('data-order')){const r=rows[Number(b.dataset.order)];sheet('订单号',`<p class="or-full-order">${esc(r.order||'暂无订单号')}</p>`);}
    if(b.hasAttribute('data-products')){const id=Number(b.dataset.products);expanded.has(id)?expanded.delete(id):expanded.add(id);const scroll=$('.or-list').scrollTop;render();$('.or-list').scrollTop=scroll;}
    if(b.hasAttribute('data-reply')){const id=Number(b.dataset.reply);sheet('回复评价',`<form class="or-form" data-reply-id="${id}"><label><textarea name="reply" maxlength="150" required placeholder="请输入回复内容（最多150字）" aria-label="回复内容"></textarea></label><p class="or-error" role="alert"></p><div class="or-form-actions"><button type="button" data-or-close>取消</button><button type="submit">确定</button></div></form>`);}
    if(b.hasAttribute('data-or-reset')){const form=b.closest('form');Array.from(form.elements).filter(el=>el.name).forEach(el=>el.value=defaults[el.name]||'');$('.or-error').textContent='';}
  });
  page.appSession={
    open:openPage,
    capture:()=>({filters:{...filters},expanded:[...expanded],tab:$('#orMiniPanel').hidden?'city':'mini',scroll:$('.or-list').scrollTop}),
    restore:s=>{
      if(!s||typeof s!=='object')return;
      const saved=s.filters||{};filters={...defaults};
      if(typeof saved.start==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(saved.start))filters.start=saved.start;
      if(typeof saved.end==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(saved.end))filters.end=saved.end;
      if(filters.start>filters.end){filters.start=defaults.start;filters.end=defaults.end;}
      if(storeCatalog.some(item=>item.name===saved.store))filters.store=saved.store;
      if(businessFormats.includes(saved.storeFormat))filters.storeFormat=saved.storeFormat;
      filterGroups.forEach(group=>{if(group.options.some(([value])=>value===saved[group.key]))filters[group.key]=saved[group.key];});
      expanded=new Set(Array.isArray(s.expanded)?s.expanded.filter(id=>rows.some(row=>row.id===id)):[]);
      switchReviewTab(s.tab==='mini'?'mini':'city');render();$('.or-list').scrollTop=Number.isFinite(s.scroll)?Math.max(0,s.scroll):0;
    }
  };
  page.addEventListener('submit',e=>{e.preventDefault();const form=e.target;if(!form.matches('.or-form'))return;const values=Object.fromEntries(new FormData(form));if(form.hasAttribute('data-reply-id')){if(!values.reply.trim()){$('.or-error').textContent='请输入回复内容';return;}if(values.reply.length>150){$('.or-error').textContent='回复内容最多150字';return;}rows[Number(form.dataset.replyId)].reply=values.reply.trim();close();render();toast('回复已保存');}else{if(values.start&&values.start>values.end){$('.or-error').textContent='开始日期不能晚于结束日期';return;}Object.assign(filters,values);close();render();$('.or-list').scrollTop=0;}});
  page.addEventListener('keydown',e=>{if(!$('#orStoreDropdown').hidden&&e.key==='Escape'){closeStoreDropdown();$('#orStoreSelect').focus();return;}if(!$('#orFilterDropdown').hidden&&e.key==='Escape'){closeDropdown();$('[data-or-filter="more"]').focus();return;}if($('.or-sheet').hidden)return;if(e.key==='Escape')close();if(e.key==='Tab'){const els=[...$('.or-sheet section').querySelectorAll('button,input,select,textarea')],first=els[0],last=els[els.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
})();
