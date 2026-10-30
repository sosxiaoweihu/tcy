(() => {
  const page = document.getElementById('cityProductsPage');
  const entry = document.getElementById('openCityProducts');
  const $ = s => page.querySelector(s);
  const categories = ['水果类','蔬菜类','肉品类','家禽类','水产类','蛋品类','散称干货类','熟食类','烘焙类','面点类','腌腊类','豆制品类'];
  const channels = ['京东到家','美团外卖','饿百','抖店','自营'];
  const seed = [
    {id:0,name:'迷彩千禧小番茄约400g',code:'11001815',barcode:'3112000304303',price:'11.90',stock:0},
    {id:1,name:'越南白心火龙果约550g/个',code:'11001874',barcode:'3112000202388',price:'4.71',stock:999,tags:channels},
    {id:2,name:'国产红心火龙果径约60mm约550g/个',code:'11001883',barcode:'3112000202555',price:'6.14',stock:999},
    {id:3,name:'黄金百香果2粒装约110g',code:'11001058',barcode:'2104290',price:'4.90',stock:999},
    {id:4,name:'上好佳能薯片-美滋番茄味85g',code:'32600205',barcode:'6926265352224',price:'7.10',stock:24,tags:channels,searchOnly:true},
    {id:5,name:'今麦郎拉面范浓情番茄牛肉面五连包131g*5',code:'35001046',barcode:'6921555574706',price:'25.90',stock:5,tags:['美团外卖','饿百','抖店','自营'],searchOnly:true},
    {id:6,name:'洽洽喀吱脆鸡汁番茄薯片51g',code:'32600267',barcode:'6921487839267',price:'3.70',stock:71,tags:channels,searchOnly:true},
    {id:7,name:'统一茄皇番茄鸡蛋面桶120g',code:'35000413',barcode:'6925303795214',price:'6.25',stock:69,tags:channels,searchOnly:true}
  ];
  const searchOrder = [4,5,0,6,7,1,2,3];
  const detailChannels = ['自营','京东到家','美团外卖','饿百','抖店'];
  const specs = ['约400g','约550g/个','约550g/个','约110g','85g','131g*5','51g','120g'];
  const units = ['盒','个','个','盒','罐','包','袋','桶'];
  const stores = ['联家西藏路店','联家长江路店','联家望江路店'];
  const data = new Map(stores.map(s => [s,seed.map(p=>({...p,available:![0,2].includes(p.id),paused:[0,2].includes(p.id),
    channelStates:detailChannels.filter(name=>!p.tags||p.tags.includes(name)).map(name=>({name,price:p.id===4?['6.50','6.50','7.20','8.60','7.10'][detailChannels.indexOf(name)]:p.price,available:![0,2].includes(p.id)}))
  }))]));
  let store=stores[0],category=categories[0],status='全部',keyword='',results=false,selected=new Set(),visible=[],timer;
  let detailProduct=null,draftChannels=[],listScroll=0,detailTriggerId=null;
  function toast(message){$('.cp-toast').textContent=message;$('.cp-toast').hidden=false;clearTimeout(timer);timer=setTimeout(()=>$('.cp-toast').hidden=true,1800);}
  function render(){
    const products=data.get(store),down=products.filter(p=>!p.searchOnly&&!p.available).length;
    page.classList.toggle('cp-results',results);
    page.classList.toggle('cp-detail-open',!!detailProduct);
    page.setAttribute('aria-label',detailProduct?'商品详情':results?'商品搜索与批量管理':'商品管理');
    $('.cp-title h1').textContent=detailProduct?'商品详情':results?'搜索':'商品管理';
    $('[data-cp-back]').setAttribute('aria-label',detailProduct?'返回商品列表':results?'返回商品管理':'返回全部工具');
    $('[data-cp-search-close]').hidden=!(results||detailProduct);
    $('[data-cp-search-close]').setAttribute('aria-label',detailProduct?'关闭商品详情':'关闭搜索结果');
    $('.cp-search').hidden=!!detailProduct;
    $('.cp-main').hidden=!!detailProduct;
    $('.cp-detail').hidden=!detailProduct;
    $('.cp-tabs').hidden=results||!!detailProduct;
    $('.cp-categories').hidden=results;
    $('.cp-content>header').hidden=results;
    $('.cp-footer').hidden=results||!!detailProduct;
    $('.cp-tabs').innerHTML=[['全部',8373],['可售',7884-down],['禁售',489+down],['售罄',1574]].map(([s,n])=>`<button type="button" data-status="${s}" class="${status===s?'active':''}" aria-pressed="${status===s}">${s} ${n}</button>`).join('');
    $('.cp-categories').innerHTML=categories.map(c=>`<button type="button" data-category="${c}" class="${c===category?'active':''}" aria-pressed="${c===category}">${c}</button>`).join('');
    $('#cpCategoryTitle').textContent=category;
    // 搜索和批量管理查询当前门店全部商品，不继承管理页的分类、售卖状态。
    visible=results
      ?searchOrder.map(id=>products.find(p=>p.id===id)).filter(p=>!keyword||[p.name,p.code,p.barcode].some(v=>v.toLowerCase().includes(keyword.toLowerCase())))
      :products.filter(p=>!p.searchOnly&&category==='水果类'&&(status==='全部'||status==='可售'&&p.available||status==='禁售'&&!p.available||status==='售罄'&&p.stock===0));
    $('.cp-list').innerHTML=visible.length?visible.map(p=>{
      const [whole,cents]=p.price.split('.');
      return `<article class="cp-card" data-cp-product-id="${p.id}">${results?`<input class="cp-check" type="checkbox" data-id="${p.id}" aria-label="选择${p.name}" ${selected.has(p.id)?'checked':''}>`:''}<div class="cp-photo cp-photo-${p.id}" role="img" aria-label="${p.name}"></div><div class="cp-info"><h2><button type="button" class="cp-detail-link" data-cp-detail="${p.id}" aria-label="查看${p.name}详情">${p.name}</button></h2><div class="cp-meta">商品编码: ${p.code}</div><div class="cp-meta">条形码: ${p.barcode}</div>${p.tags?`<div class="cp-tags">${p.tags.map(t=>`<span>${t}</span>`).join('')}</div>`:''}<div class="cp-price-row"><span class="cp-price">¥<b>${whole}</b>.${cents}</span><span class="cp-stock">库存${p.stock}件</span></div></div>${results?'':`<div class="cp-actions"><button type="button" data-action="up" data-id="${p.id}">上架</button><button type="button" data-action="down" data-id="${p.id}">下架</button><button type="button" data-action="pause" data-id="${p.id}" class="${p.paused?'active':''}">临时下架</button></div>`}</article>`;
    }).join(''):'<p class="cp-empty">暂无符合条件的商品</p>';
    $('.cp-batch').hidden=!results||!!detailProduct;
    $('[data-cp-selected]').textContent=`已选${selected.size}件`;
    const all=$('[data-cp-all]');
    all.checked=visible.length>0&&visible.every(p=>selected.has(p.id));
    all.indeterminate=selected.size>0&&!all.checked;
    $('#cpStoreName').textContent=store;
    if(detailProduct)renderDetail();
  }
  function renderDetail(){
    const p=detailProduct;
    $('.cp-detail-summary').innerHTML=`<div class="cp-photo cp-photo-${p.id}" role="img" aria-label="${p.name}"></div><div class="cp-detail-info"><h2>${p.name}</h2><p>商品编码: ${p.code}</p><p>条形码: ${p.barcode}</p><p>规格: ${specs[p.id]}</p><p>单位: ${units[p.id]}</p></div>`;
    $('.cp-detail-channels tbody').innerHTML=draftChannels.map((c,i)=>`<tr><td>${c.name}</td><td>¥${c.price}</td><td><label class="cp-channel-status"><span>${c.available?'上架':'下架'}</span><input type="checkbox" role="switch" data-cp-channel="${i}" aria-label="${c.name}上下架" ${c.available?'checked':''}></label></td></tr>`).join('');
    $('#cpDetailStock').value=p.stock;
    $('#cpDetailStock').removeAttribute('aria-invalid');
  }
  function openDetail(id){
    detailProduct=data.get(store).find(p=>p.id===id);if(!detailProduct)return;
    detailTriggerId=id;listScroll=$('.cp-content').scrollTop;
    draftChannels=detailProduct.channelStates.map(c=>({...c}));
    $('.cp-toast').hidden=true;render();$('.cp-detail-content').scrollTop=0;
    $('[data-cp-back]').focus({preventScroll:true});
  }
  function closeDetail(){
    detailProduct=null;draftChannels=[];$('.cp-toast').hidden=true;render();
    $(`[data-cp-detail="${detailTriggerId}"]`)?.focus({preventScroll:true});
    $('.cp-content').scrollTop=listScroll;
  }
  function openResults(value){
    keyword=value.trim();results=true;selected.clear();$('.cp-search input').value=keyword;render();$('.cp-content').scrollTop=0;
  }
  function leaveResults(){
    results=false;keyword='';selected.clear();$('.cp-search input').value='';render();$('.cp-content').scrollTop=0;
  }
  function changeAvailability(product,action){product.available=action==='up';product.paused=action==='pause';product.channelStates.forEach(c=>c.available=product.available);}
  function openPage(){detailProduct=null;draftChannels=[];setRetailUnionAppOpen(true);entry.hidden=true;[openRetailUnionApp,closeRetailUnionApp,openThirdPartyOrder,openImMessage,openProductRecord,document.getElementById('openOrderReviews')].forEach(b=>b.hidden=true);page.hidden=false;leaveResults();}
  entry.addEventListener('click',openPage);
  $('[data-cp-back]').addEventListener('click',()=>{if(detailProduct){closeDetail();return;}if(results){leaveResults();return;}selected.clear();$('.cp-sheet').hidden=true;setRetailUnionAppOpen(true);});
  $('[data-cp-search-close]').addEventListener('click',()=>detailProduct?closeDetail():leaveResults());
  $('.cp-search').addEventListener('submit',e=>{e.preventDefault();openResults($('.cp-search input').value);});
  page.addEventListener('click',e=>{
    const card=e.target.closest('[data-cp-product-id]');
    if(card&&!e.target.closest('input,.cp-actions')){openDetail(Number(card.dataset.cpProductId));return;}
    const b=e.target.closest('button');if(!b)return;
    if(b.hasAttribute('data-cp-detail-cancel')){closeDetail();return;}
    if(b.hasAttribute('data-cp-detail-pause')&&detailProduct){
      changeAvailability(detailProduct,'pause');
      draftChannels=detailProduct.channelStates.map(c=>({...c}));
      $('.cp-detail-channels tbody').querySelectorAll('[data-cp-channel]').forEach(input=>{input.checked=false;input.previousElementSibling.textContent='下架';});
      toast('商品已临时下架');return;
    }
    if(b.hasAttribute('data-cp-save-channels')&&detailProduct){
      detailProduct.channelStates=draftChannels.map(c=>({...c}));
      detailProduct.available=draftChannels.some(c=>c.available);detailProduct.paused=false;
      toast('渠道上下架已保存');return;
    }
    if(b.hasAttribute('data-cp-save-stock')&&detailProduct){
      const input=$('#cpDetailStock'),value=input.value.trim();
      if(!/^\d+$/.test(value)||!Number.isSafeInteger(Number(value))){input.setAttribute('aria-invalid','true');input.focus();toast('请输入大于或等于0的整数库存');return;}
      detailProduct.stock=Number(value);input.removeAttribute('aria-invalid');toast('库存已保存');return;
    }
    if(b.dataset.status){status=b.dataset.status;selected.clear();render();$('.cp-content').scrollTop=0;}
    if(b.dataset.category){category=b.dataset.category;selected.clear();render();$('.cp-content').scrollTop=0;}
    if(b.hasAttribute('data-cp-batch'))openResults('');
    if(b.dataset.action){const p=data.get(store).find(p=>p.id===Number(b.dataset.id));changeAvailability(p,b.dataset.action);render();toast(b.dataset.action==='up'?'商品已上架':b.dataset.action==='down'?'商品已下架':'商品已临时下架');}
    if(b.dataset.cpBatchAction){
      if(!selected.size){toast('请先选择商品');return;}
      const action=b.dataset.cpBatchAction,count=selected.size;
      data.get(store).filter(p=>selected.has(p.id)).forEach(p=>changeAvailability(p,action));
      selected.clear();render();toast(`已${action==='up'?'上架':action==='down'?'下架':'临时下架'}${count}件商品`);
    }
    if(b.hasAttribute('data-cp-store')){$('.cp-stores').innerHTML=stores.map(s=>`<button type="button" data-store="${s}" class="${store===s?'active':''}">${s}${store===s?'　✓':''}</button>`).join('');$('.cp-sheet').hidden=false;}
    if(b.hasAttribute('data-cp-close')||b.classList.contains('cp-mask'))$('.cp-sheet').hidden=true;
    if(b.dataset.store){store=b.dataset.store;selected.clear();$('.cp-sheet').hidden=true;render();toast('已切换至'+store);}
  });
  page.addEventListener('change',e=>{if(e.target.hasAttribute('data-cp-channel')&&detailProduct){draftChannels[Number(e.target.dataset.cpChannel)].available=e.target.checked;e.target.previousElementSibling.textContent=e.target.checked?'上架':'下架';}if(e.target.matches('.cp-check')){const id=Number(e.target.dataset.id);e.target.checked?selected.add(id):selected.delete(id);render();}if(e.target.hasAttribute('data-cp-all')){selected=e.target.checked?new Set(visible.map(p=>p.id)):new Set();render();}});
  page.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('.cp-sheet').hidden)$('.cp-sheet').hidden=true;else if(detailProduct)closeDetail();else if(results)leaveResults();}});
  page.appSession={
    open:openPage,
    capture:()=>({
      store,category,status,keyword,results,input:$('.cp-search input').value,selected:[...selected],
      scroll:detailProduct?listScroll:$('.cp-content').scrollTop,
      detail:detailProduct?.id??null,detailScroll:$('.cp-detail-content').scrollTop,
      stockDraft:detailProduct?$('#cpDetailStock').value:null,channelDraft:draftChannels.map(c=>({name:c.name,available:c.available})),
      products:[...data].map(([name,products])=>({name,products:products.map(p=>({id:p.id,stock:p.stock,available:p.available,paused:p.paused,channels:p.channelStates.map(c=>({name:c.name,available:c.available}))}))}))
    }),
    restore:s=>{
      if(!s||typeof s!=='object')return;
      if(Array.isArray(s.products))s.products.forEach(savedStore=>{
        const products=data.get(savedStore?.name);if(!products||!Array.isArray(savedStore.products))return;
        savedStore.products.forEach(saved=>{
          const p=products.find(p=>p.id===saved?.id);if(!p)return;
          if(Number.isSafeInteger(saved.stock)&&saved.stock>=0)p.stock=saved.stock;
          if(typeof saved.available==='boolean')p.available=saved.available;
          if(typeof saved.paused==='boolean')p.paused=saved.paused;
          if(Array.isArray(saved.channels))p.channelStates.forEach(c=>{const channel=saved.channels.find(item=>item?.name===c.name);if(typeof channel?.available==='boolean')c.available=channel.available;});
        });
      });
      store=stores.includes(s.store)?s.store:stores[0];
      category=categories.includes(s.category)?s.category:categories[0];
      status=['全部','可售','禁售','售罄'].includes(s.status)?s.status:'全部';
      keyword=typeof s.keyword==='string'?s.keyword.slice(0,200):'';results=s.results===true;
      detailProduct=null;draftChannels=[];
      $('.cp-search input').value=typeof s.input==='string'?s.input.slice(0,200):keyword;
      selected=new Set();render();
      selected=new Set(results&&Array.isArray(s.selected)?s.selected.filter(id=>visible.some(p=>p.id===id)):[]);render();
      $('.cp-content').scrollTop=Number.isFinite(s.scroll)?Math.max(0,s.scroll):0;
      if(s.detail!==null&&data.get(store).some(p=>p.id===s.detail)){
        openDetail(s.detail);
        if(Array.isArray(s.channelDraft))draftChannels.forEach(c=>{const saved=s.channelDraft.find(item=>item?.name===c.name);if(typeof saved?.available==='boolean')c.available=saved.available;});
        renderDetail();
        if(typeof s.stockDraft==='string')$('#cpDetailStock').value=s.stockDraft.slice(0,30);
        $('.cp-detail-content').scrollTop=Number.isFinite(s.detailScroll)?Math.max(0,s.detailScroll):0;
      }
    }
  };
  // 隐藏入口随其他 App 功能页同步，避免透明点击区域遮挡功能内容。
  new MutationObserver(()=>{entry.hidden=tongchengAppScreen.hidden||!tongchengAppScreen.closest('.tongcheng-app-screen').classList.contains('retail-union-open')||!page.hidden;}).observe(tongchengAppScreen,{attributes:true,attributeFilter:['hidden']});
  render();
})();
