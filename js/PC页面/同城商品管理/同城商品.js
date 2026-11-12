// 仅使用用户 HTML 保存的十条商品；不执行参考 HTML 的脚本或连接生产服务。
const ccSeed = [["春沐源青霞番茄约250g/盒", "11000543", "2109514", "250g", "盒", "时令上新,葡提莓果", "浆果", [5, 5, 7, 7], "2026-11-09 10:53"], ["春沐源小桔灯番茄约250g/盒", "11000652", "2101427", "250g", "盒", "时令上新,葡提莓果", "浆果", [5, 5, 7, 7], "2026-11-09 10:45"], ["超级柿子白芯芭乐约500g/盒", "11001066", "2101969", "500g", "盒", "时令上新,热带水果", "热带水果", [6, 6, 8, 8], "2026-11-09 10:38"], ["尝鲜 双J车厘子约250g/盒", "11000444", "2104852", "250g", "盒", "时令上新,葡提莓果", "浆果", [8, 8, 10], "2026-11-09 10:17"], ["去皮红肉菠萝蜜约500g/份", "11002800", "3000110028007", "500g", "份", "鲜果果切", "热带水果", [1, 1, 1, 1], "2026-11-07 16:29"], ["去皮红肉菠萝蜜约200g/份", "11002799", "3000110027994", "200g", "份", "鲜果果切", "热带水果", [1, 1, 1, 1], "2026-11-07 16:28"], ["尝鲜 单J车厘子约200g/盒", "11000926", "2109350", "300g", "盒", "鲜果果切", "浆果", [8, 8, 10], "2026-11-07 13:51"], ["无硫泰国龙眼约500g/盒", "11001054", "2106155", "500g", "盒", "鲜果果切", "热带水果", [8, 8, 10, 10], "2026-11-07 13:44"], ["鲜切 去皮去节 甘蔗约300g/盒", "11002372", "6977225302049", "300g", "盒", "鲜果果切", "其他水果", [4, 4, 4], "2026-11-07 13:36"], ["鲜切 去皮去节 甘蔗约500g/盒", "11002371", "6977225300922", "500g", "盒", "鲜果果切", "其他水果", [4, 4, 4], "2026-11-07 13:32"]];
const ccPage = document.getElementById('cityCatalogPage');
const ccEl = id => document.getElementById(id);
const ccEscape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ccState = {tab:'all',page:1,size:10,filters:{},category:'',categoryCollapsed:false,expandedCategories:new Set(['新鲜水果','蔬菜豆制品','肉禽蛋品']),changed:false,logs:[],products:ccSeed.map((r,i)=>({id:i+1,name:r[0],code:r[1],barcode:r[2],weight:r[3],unit:r[4],front:r[5],back:r[6],stores:r[7],updated:r[8],spec:'--',status:'售卖',syncName:i===4||i===5?'启用':'停用',syncImage:'启用',combo:i===4||i===5,issue:[3,6,8,9].includes(i),photo:[4,5].includes(i)?'':`./assets/city-product-catalog/product-${i+1}.jpg`}))};
function ccToast(message){ccEl('ccToast').textContent=message;ccEl('ccToast').hidden=false;clearTimeout(ccToast.timer);ccToast.timer=setTimeout(()=>ccEl('ccToast').hidden=true,2800);}

const ccExampleIssues = [
  {channel: '京东', items: [{title: '商品其他异常', message: '更新失败'}]},
  {channel: '美团', items: [{title: '商品曝光异常', message: '重量错误：与商品名称描述不一致'}]},
  {channel: '淘宝闪购', items: [{title: '商品其他异常', message: '图片数量不能少于2张'}]}
];
ccState.products.find(product => product.code === '11000444').issues = ccExampleIssues;

function ccIssueCount(product) {
  return product.issues?.reduce((count, group) => count + group.items.length, 0) ?? Number(product.issue);
}

function ccIssueDetails(groups, collapsed = false) {
  const extra = ' data-ccc-extra-issue hidden';
  return groups.map(({channel, items}, groupIndex) => `<section class="cc-product-issue-group"${collapsed && groupIndex > 0 ? extra : ''}>
    <strong>${ccEscape(channel)}渠道下存在${items.length}个问题</strong>
    <ul>${items.map(({title, message}, index) => `<li${collapsed && groupIndex === 0 && index > 0 ? extra : ''}>
      <span>【${ccEscape(title)}】</span>${ccEscape(message)}
    </li>`).join('')}</ul>
  </section>`).join('');
}
function ccFiltered(ignoreCategory=false){const f=ccState.filters;return ccState.products.filter(p=>(ignoreCategory||ccMatchesCategory(p,ccState.category))&&(!f.code||p.code===f.code)&&(!f.barcode||p.barcode.includes(f.barcode))&&(!f.name||p.name.includes(f.name))&&(!f.front||p.front.split(',').includes(f.front))&&(!f.back||p.back===f.back)&&(!f.status||p.status===f.status)&&(!f.type||(p.combo?'组合商品':'普通商品')===f.type)&&(!f.syncName||p.syncName===f.syncName)&&(!f.syncImage||p.syncImage===f.syncImage));}
function ccHasFilter(){return Object.values(ccState.filters).some(Boolean);}
function ccRowsForTab(){return ccFiltered().filter(p=>ccState.tab==='all'||p.issue);}
function ccSnapshot(){return !ccHasFilter()&&!ccState.changed;}
function ccTotal(){return ccSnapshot()?ccCategoryTabTotal(ccState.tab):ccRowsForTab().length;}
function ccVisible(){return ccRowsForTab().slice((ccState.page-1)*ccState.size,ccState.page*ccState.size);}
function ccLog(p,action){ccState.logs.unshift({code:p.code,action,time:new Date().toLocaleString('zh-CN',{hour12:false})});ccState.changed=true;p.updated=new Date().toLocaleString('sv-SE').slice(0,16);}
function ccRender(){
  const total=ccTotal(),max=Math.max(1,Math.ceil(total/ccState.size));ccState.page=Math.min(max,ccState.page);const rows=ccVisible();
  ccRenderCategories();
  const filtered=ccFiltered();ccEl('ccTabs').innerHTML=[['all','全部商品',ccSnapshot()?ccCategoryTabTotal('all'):filtered.length],['issue','异常商品',ccSnapshot()?ccCategoryTabTotal('issue'):filtered.filter(p=>p.issue).length]].map(([key,name,count])=>`<button type="button" role="tab" data-cc-tab="${key}" aria-selected="${ccState.tab===key}">${name}（<span>${count}</span>）</button>`).join('');
  ccEl('ccRows').innerHTML=rows.map(p=>`<tr><td><div class="cc-product">${p.photo?`<img class="cc-photo" src="${ccEscape(p.photo)}" alt="${ccEscape(p.name)}" />`:'<span class="cc-photo cc-photo-empty">暂无图片</span>'}<div><strong class="cc-product-name">${p.combo?'<span class="cc-combo">组</span>':''}${ccEscape(p.name)}</strong><div class="cc-muted">编码：<button type="button" class="cc-link" data-cc-detail="${p.id}">${ccEscape(p.code)}</button></div><div class="cc-muted">条码：${ccEscape(p.barcode)}</div>${p.issue?`<button type="button" class="cc-issue" data-cc-issue="${p.id}">商品有${ccIssueCount(p)}个问题 ›</button>`:''}</div></div></td><td><div>规格：${ccEscape(p.spec||'--')}</div><div>单位：${ccEscape(p.unit||'--')}</div><div>重量：${ccEscape(p.weight||'--')}</div></td><td>${ccEscape(p.front)||'—'}</td><td>${ccEscape(p.back)||'—'}</td><td><span class="cc-status ${p.status==='售卖'?'cc-sale':'cc-offline'}">${p.status}</span></td><td><div class="cc-sync">${[['syncName','名称'],['syncImage','主图']].map(([key,title])=>`<div class="cc-sync-item"><span>${title}：</span><span class="${p[key]==='停用'?'cc-sync-disabled':'cc-sync-enabled'}">${p[key]}</span></div>`).join('')}</div></td><td>${p.stores.map((count,i)=>`<div class="cc-channel"><b>${['美','淘','京','抖'][i]}</b><button type="button" class="cc-link" data-cc-stores="${p.id}:${i}">${count} 家</button></div>`).join('')||'—'}</td><td></td><td>${ccEscape(p.updated)}</td><td><div class="cc-row-actions"><button type="button" class="cc-link" data-cc-edit="${p.id}">编辑</button><button type="button" class="cc-link" data-cc-delete="${p.id}">删除</button><button type="button" class="cc-link" data-cc-row-more="${p.id}">更多</button></div></td></tr>`).join('')||`<tr><td colspan="10" class="cc-empty">${ccSnapshot()&&ccState.page>1?'当前页暂无已保存的演示商品':ccState.category?'该类目暂无符合条件的演示商品':'暂无符合条件的商品'}</td></tr>`;
  const pages=max<=7?Array.from({length:max},(_,i)=>i+1):[...new Set([1,Math.max(2,ccState.page-1),Math.max(3,ccState.page),Math.min(max-1,Math.max(4,ccState.page+1)),max])].sort((a,b)=>a-b);
  let last=0;ccEl('ccPagination').innerHTML=`<span>共 ${total} 条</span><select id="ccPageSize" aria-label="同城商品每页条数">${[10,20,50].map(n=>`<option value="${n}" ${ccState.size===n?'selected':''}>${n}条/页</option>`).join('')}</select><button type="button" data-cc-page="${ccState.page-1}" aria-label="上一页" ${ccState.page===1?'disabled':''}>‹</button>${pages.map(n=>{const gap=last&&n-last>1?'<span>…</span>':'';last=n;return `${gap}<button type="button" data-cc-page="${n}" ${n===ccState.page?'aria-current="page"':''}>${n}</button>`;}).join('')}<button type="button" data-cc-page="${ccState.page+1}" aria-label="下一页" ${ccState.page===max?'disabled':''}>›</button><label>前往 <input id="ccJump" type="number" value="${ccState.page}" min="1" max="${max}" aria-label="同城商品跳转页码" /> 页</label>`;
}
function openCityCatalogPage(shouldAddTab=true){
  if(shouldAddTab)addOrActivateTab('同城商品');leaveTongchengAppPage();leaveCustomTaskPage();document.body.classList.remove('unified-category-mode');unifiedCategorySidebar.hidden=true;
  [...ccPage.parentElement.children].forEach(el=>{if(el.tagName==='SECTION')el.hidden=el!==ccPage;});ccPage.hidden=false;pageTabs.hidden=false;tongchengMenu.hidden=true;interfaceMenu.hidden=true;legacyMenu.hidden=true;
  document.querySelectorAll('#tongchengMenu [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='同城商品'));document.querySelectorAll('.side-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav==='同城'));ccRender();
}
function ccModal(title,content){ccEl('ccMoreMenu').hidden=true;ccEl('ccMore').setAttribute('aria-expanded','false');ccEl('ccBatchMenu').hidden=true;ccEl('ccBatch').setAttribute('aria-expanded','false');ccEl('ccDialogTitle').textContent=title;ccEl('ccDialogContent').innerHTML=content;ccEl('ccDialog').showModal();}
const ccNotice = text => `<div class="cc-notice"><span aria-hidden="true">i</span><span>${ccEscape(text)}</span></div>`;
function ccFooter(label='确定'){return `<footer><button type="button" data-cc-close>取消</button><button type="submit" class="cc-primary">${label}</button></footer>`;}
function ccDelete(ids){const items=ccState.products.filter(p=>ids.includes(p.id));if(!items.length){ccToast('请选择有效商品');return;}ccModal('删除线上商品',`<form id="ccDeleteForm" data-ids="${items.map(p=>p.id).join(',')}"><p>确定删除${items.length===1?'“'+ccEscape(items[0].name)+'”':`所选 ${items.length} 件商品`}？</p>${ccNotice('此操作仅移除本页演示数据，刷新页面可恢复。')}${ccFooter('确认删除')}</form>`);}
function ccMoreForRow(p){ccModal('更多操作',`<div class="cc-detail-list"><button type="button" data-cc-status="${p.id}">${p.status==='售卖'?'下架商品':'上架商品'}</button><button type="button" data-cc-log="${p.id}">商品日志</button><button type="button" data-cc-stores="${p.id}:-1">查看铺品门店</button></div>`);}
const ccMoreGroups=[['商品导出','导出异常信息'],['设置前台类目','设置平台类目','设置包装费','设置商品信息','设置角标'],['自定义渠道商品名称','商品日志'],['删除线上商品']];
ccEl('ccMoreMenu').innerHTML=ccMoreGroups.map(group=>group.map(name=>`<button type="button" data-cc-action="${name}" class="${name==='删除线上商品'?'cc-danger':''}">${name}</button>`).join('')).join('<hr/>');
ccEl('ccFilters').addEventListener('submit',event=>{event.preventDefault();ccState.filters=Object.fromEntries([...new FormData(event.target)].map(([k,v])=>[k,String(v).trim()]));ccState.page=1;ccRender();ccToast(`查询完成，匹配 ${ccRowsForTab().length} 条已保存商品`);});
ccEl('ccFilters').addEventListener('reset',()=>{ccState.filters={};ccState.category='';ccState.page=1;ccRender();ccToast('已重置全部查询条件');});
ccEl('ccExpand').addEventListener('click',()=>{const expanded=ccEl('ccExpand').getAttribute('aria-expanded')!=='true';ccEl('ccExpand').setAttribute('aria-expanded',expanded);ccEl('ccExpand').textContent=expanded?'⌃':'⌄';ccEl('ccExpand').setAttribute('aria-label',expanded?'收起筛选':'展开筛选');ccEl('ccAdvanced').hidden=!expanded;ccEl('ccFilters').querySelector('[name=name]').closest('label').classList.toggle('cc-visible',expanded);});
ccEl('ccBatchCreate').addEventListener('click',()=>ccModal('批量创建商品',`<form id="ccBatchForm"><p>每行一条商品，按“商品编码,商品名称,商品条码”填写。</p><textarea name="products" required aria-label="批量商品内容" placeholder="例如：11003001,演示商品,6901234567890"></textarea>${ccNotice('仅在当前页面创建演示商品；编码不可重复。')}${ccFooter('创建')}</form>`));
ccEl('ccMore').addEventListener('click',()=>{const menu=ccEl('ccMoreMenu');menu.hidden=!menu.hidden;ccEl('ccMore').setAttribute('aria-expanded',!menu.hidden);});
ccPage.addEventListener('change',event=>{
  const el=event.target;
  if(el.id==='ccPageSize'){ccState.size=Number(el.value);ccState.page=1;ccRender();}
  if(el.id==='ccJump'){const n=Number(el.value);if(!Number.isInteger(n)||n<1||n>Number(el.max)){el.value=ccState.page;ccToast('请输入有效页码');return;}ccState.page=n;ccRender();}
});
ccPage.addEventListener('click',event=>{
  const b=event.target.closest('button');if(!b)return;
  const lookup=id=>ccState.products.find(p=>p.id===Number(id));
  if(b.hasAttribute('data-cc-category')){ccState.category=b.dataset.ccCategory;ccState.page=1;ccRender();}
  if(b.hasAttribute('data-cc-branch')){const key=b.dataset.ccBranch;ccState.expandedCategories.has(key)?ccState.expandedCategories.delete(key):ccState.expandedCategories.add(key);ccRenderCategories();}
  if(b.hasAttribute('data-cc-close'))ccEl('ccDialog').close();
  if(b.dataset.ccTab){ccState.tab=b.dataset.ccTab;ccState.page=1;ccRender();}
  if(b.dataset.ccPage){ccState.page=Number(b.dataset.ccPage);ccRender();}
  if(b.dataset.ccEdit)ccEditor(lookup(b.dataset.ccEdit));
  if(b.dataset.ccDelete)ccDelete([Number(b.dataset.ccDelete)]);
  if(b.dataset.ccRowMore)ccMoreForRow(lookup(b.dataset.ccRowMore));
  if(b.dataset.ccDetail){const p=lookup(b.dataset.ccDetail);ccModal('商品信息',`<dl class="cc-detail-list">${[['商品名称',p.name],['商品编码',p.code],['商品条码',p.barcode],['规格',p.spec],['单位',p.unit],['重量',p.weight],['前台类目',p.front],['后台类目',p.back]].map(([k,v])=>`<dt>${k}</dt><dd>${ccEscape(v)||'—'}</dd>`).join('')}</dl>`);}
  if(b.dataset.ccIssue){const p=lookup(b.dataset.ccIssue);ccModal('异常信息',`<p>${ccEscape(p.name)}（${p.code}）</p>${p.issues ? ccIssueDetails(p.issues) : ccNotice('暂未取得问题分类、详情和所属渠道。')}`);}
  if(b.dataset.ccStores){const [id,index]=b.dataset.ccStores.split(':'),p=lookup(id);ccModal('铺品门店',`<p>${ccEscape(p.name)}</p>${p.stores.map((n,i)=>(Number(index)<0||Number(index)===i)?`<p>${['美团','淘宝','京东','抖店'][i]}：${n} 家</p>`:'').join('')}${ccNotice('参考 HTML 仅保存各渠道门店数量，未保存门店名称及明细。')}`);}
  if(b.dataset.ccLog){const p=lookup(b.dataset.ccLog),logs=ccState.logs.filter(log=>log.code===p.code);ccModal('商品日志',logs.length?logs.map(log=>`<p>${ccEscape(log.time)}　${ccEscape(log.action)}</p>`).join(''):ccNotice('当前会话暂无操作日志。'));}
  if(b.dataset.ccStatus){const p=lookup(b.dataset.ccStatus);ccEl('ccDialog').close();ccModal('设置商品状态',`<form id="ccStatusForm" data-id="${p.id}"><p>确认将“${ccEscape(p.name)}”${p.status==='售卖'?'下架':'上架'}？</p>${ccFooter('确认')}</form>`);}
  if(b.dataset.ccAction){const action=b.dataset.ccAction;ccEl('ccMoreMenu').hidden=true;ccEl('ccMore').setAttribute('aria-expanded','false');
    if(action.includes('导出')){const rows=ccRowsForTab().filter(p=>(action!=='导出异常信息'||p.issue));ccToast(rows.length?`已触发导出演示，包含 ${rows.length} 条本地样例${action==='导出异常信息'?'异常记录':'商品'}（本地演示）`:'暂无可导出的商品');return;}
    if(action==='删除线上商品'){ccPickTargets(action);return;}
    if(action==='商品日志'){ccModal('商品日志',ccState.logs.length?ccState.logs.map(log=>`<p>${ccEscape(log.time)}　${log.code}　${ccEscape(log.action)}</p>`).join(''):ccNotice('当前会话暂无操作日志。'));return;}
    if(['设置商品信息','设置前台类目'].includes(action)){ccPickTargets(action);return;}
    ccModal(action,ccNotice('参考 HTML 未保存此操作的表单与业务规则，当前保留操作入口，不执行实际渠道设置。'));
  }
});
ccPage.addEventListener('submit',event=>{
  const form=event.target;if(form.id==='ccFilters'||form.id==='ccCreateForm')return;event.preventDefault();const data=Object.fromEntries(new FormData(form));
  if(form.id==='ccBatchForm'){
    const lines=data.products.trim().split(/\r?\n/).map(line=>line.split(/[,，]/).map(v=>v.trim()));const codes=new Set(ccState.products.map(p=>p.code));
    for(const line of lines){if(line.length!==3||!/^\d+$/.test(line[0])||!line[1]||!line[2]||codes.has(line[0])){ccToast('请检查每行格式，编码须为数字且不能重复');return;}codes.add(line[0]);}
    let id=Math.max(0,...ccState.products.map(p=>p.id));const batch=lines.map(([code,name,barcode])=>{const p={id:++id,code,name,barcode,spec:'--',unit:'--',weight:'--',front:'',back:'',status:'售卖',syncName:'停用',syncImage:'启用',combo:false,issue:false,photo:'',stores:[]};ccLog(p,'批量创建商品');return p;});ccState.products.unshift(...batch);
  }
  if(form.id==='ccDeleteForm'){const ids=form.dataset.ids.split(',').map(Number);ccState.products.filter(p=>ids.includes(p.id)).forEach(p=>ccLog(p,'删除线上商品'));ccState.products=ccState.products.filter(p=>!ids.includes(p.id));}
  if(form.id==='ccStatusForm'){const p=ccState.products.find(p=>p.id===Number(form.dataset.id));p.status=p.status==='售卖'?'下架':'售卖';ccLog(p,`商品状态设为${p.status}`);}
  if(form.id==='ccTargetForm'){
    const codes=data.codes.split(/[,，\s]+/).filter(Boolean),items=ccState.products.filter(p=>codes.includes(p.code));
    if(!codes.length||items.length!==new Set(codes).size){ccToast('请输入当前样例中存在的商品编码');return;}
    const action=form.dataset.action;
    if(action==='设置商品信息'&&items.length!==1){ccToast('编辑商品信息请填写一个商品编码');return;}
    ccEl('ccDialog').close();
    if(action==='删除线上商品'){ccDelete(items.map(p=>p.id));return;}
    if(action==='设置商品信息'){ccEditor(items[0]);return;}
    items.forEach(p=>{p.front=data.front.trim();ccLog(p,'设置前台类目');});
  }
  ccState.page=1;ccEl('ccDialog').close();ccRender();ccToast('操作成功，已更新本页演示数据');
});
document.addEventListener('click',event=>{if(!event.target.closest('.cc-batch-wrap')){ccEl('ccBatchMenu').hidden=true;ccEl('ccBatch').setAttribute('aria-expanded','false');}if(!event.target.closest('.cc-more-wrap')){ccEl('ccMoreMenu').hidden=true;ccEl('ccMore').setAttribute('aria-expanded','false');}});
ccPage.addEventListener('keydown',event=>{if(event.key==='Escape'){ccEl('ccBatchMenu').hidden=true;ccEl('ccBatch').setAttribute('aria-expanded','false');ccEl('ccMoreMenu').hidden=true;ccEl('ccMore').setAttribute('aria-expanded','false');}});
// 类目名称取自用户截图；括号数量按用户授权配置演示值，不使用截图中的类目编码。
const ccCategories = [
  {name:'新鲜水果',count:2360,children:[['时令上新',180],['柑橘橙柚',220],['榴莲荔枝',150],['西瓜蜜瓜',240],['热带水果',360],['葡提莓果',420],['桃李杏枣',150],['苹果蕉梨',240],['鲜果果切',160],['水果礼盒',100],['鲜花绿植',140]]},
  {name:'蔬菜豆制品',count:1840,children:[['叶菜青菜',380],['番茄瓜果',360],['土豆茭白',240],['香菇菌菇',280],['豆腐千张',220],['葱姜调味',180],['豆芽豆苗',180]]},
  {name:'肉禽蛋品',count:2160,children:[['黑猪猪肉',200],['每日鲜宰热气猪肉',360],['精切猪肉',280],['烧烤烤肉',160],['联家牛肉',220],['品质牛排',180],['鸡蛋蛋类',200],['鸡鸭禽类',160],['整鸡整鸭',200],['鲜切羊肉',120],['兔肉其他',80]]},
  ...[['海鲜水产',920],['火锅到家',680],['乳品烘焙',1470],['熟食面点',780],['粮油调味',1020],['冰淇淋零食',960],['酒水饮料',1280],['家清纸品',550],['美妆个护',200],['母婴用品',120],['粽香情浓',88],['礼遇中秋',100]].map(([name,count])=>({name,count,children:name==='冰淇淋零食'?[['薯片膨化',0]]:[]}))
];
function ccMatchesCategory(product,key){
  if(!key)return true;
  const tags=product.front.split(/[,，]/).map(s=>s.trim()),root=ccCategories.find(c=>c.name===key);
  return tags.includes(key)||Boolean(root&&root.children.some(([name])=>tags.includes(name)));
}
function ccCategoryCount(key){
  const root=ccCategories.find(c=>c.name===key),child=ccCategories.flatMap(c=>c.children).find(([name])=>name===key);
  const base=!key?14528:root?root.count:child?child[1]:0;
  // 会话内新增、删除或重新分类时，在全量演示基数上调整可见样例的变化量。
  const current=ccState.products.filter(p=>ccMatchesCategory(p,key)).length;
  const original=ccSeed.filter(r=>ccMatchesCategory({front:r[5]},key)).length;
  return Math.max(0,base+current-original);
}
function ccCategoryTabTotal(tab){const total=ccCategoryCount(ccState.category);return tab==='all'?total:ccState.category?Math.round(total*8287/14528):8287;}
function ccRenderCategories(){
  const tree=ccEl('ccCategoryTree'),scroll=ccEl('ccCategorySidebar').scrollTop;
  const categoryButton=(name,key)=>`<button type="button" class="cc-category-item ${ccState.category===key?'cc-category-active':''}" data-cc-category="${ccEscape(key)}" aria-pressed="${ccState.category===key}" title="${ccEscape(name)}（${ccCategoryCount(key)}）"><span>${ccEscape(name)}</span><span class="cc-category-count">（${ccCategoryCount(key)}）</span></button>`;
  const allCategories = ccEl('ccAllCategories');
  const allSelected = ccState.category === '';
  allCategories.classList.toggle('cc-category-active', allSelected);
  allCategories.setAttribute('aria-pressed', allSelected);
  allCategories.querySelector('.cc-category-count').textContent = `（${ccCategoryCount('')}）`;
  tree.innerHTML=`<ul>${ccCategories.map(root=>{const expanded=ccState.expandedCategories.has(root.name);return `<li><div class="cc-category-root"><button type="button" class="cc-category-branch" data-cc-branch="${root.name}" aria-label="${expanded?'收起':'展开'}${root.name}" aria-expanded="${expanded}">${expanded?'▾':'▸'}</button>${categoryButton(root.name,root.name)}</div>${expanded?root.children.length?`<ul class="cc-category-children">${root.children.map(([name])=>`<li>${categoryButton(name,name)}</li>`).join('')}</ul>`:'<div class="cc-category-missing">暂无下级类目资料</div>':''}</li>`;}).join('')}</ul>`;
  ccEl('ccCategorySidebar').scrollTop=scroll;
}
ccEl('ccCategoryToggle').addEventListener('click',()=>{
  ccState.categoryCollapsed=!ccState.categoryCollapsed;
  ccEl('ccCategorySidebar').hidden=ccState.categoryCollapsed;
  ccEl('ccAllCategories').hidden=ccState.categoryCollapsed;
  ccEl('ccProductLayout').classList.toggle('cc-categories-collapsed',ccState.categoryCollapsed);
  ccEl('ccCategoryToggle').setAttribute('aria-expanded',!ccState.categoryCollapsed);
  ccEl('ccCategoryToggle').setAttribute('aria-label',ccState.categoryCollapsed?'展开前台类目':'收起前台类目');
});

ccRender();

function ccPickTargets(action){
  ccModal(action,`<form id="ccTargetForm" data-action="${action}"><label class="cc-field"><span>商品编码：</span><input name="codes" required placeholder="多个编码以逗号分隔" /></label>${action==='设置前台类目'?'<label class="cc-field"><span>前台类目：</span><input name="front" required /></label>':''}${ccFooter('下一步')}</form>`);
}
ccEl('ccBatch').addEventListener('click',()=>{const open=ccEl('ccBatchMenu').hidden;ccEl('ccBatchMenu').hidden=!open;ccEl('ccBatch').setAttribute('aria-expanded',open);ccEl('ccMoreMenu').hidden=true;ccEl('ccMore').setAttribute('aria-expanded','false');});
// Freeze all rendered widths when a resize starts, then adjust only the chosen column.
(() => {
  const table=ccPage.querySelector('.cc-table'),cols=[...table.querySelectorAll('col')],heads=[...table.querySelectorAll('th')];
  const minWidths=[200,100,100,100,90,130,100,90,120,80];
  const currentWidths=()=>heads.map(h=>h.getBoundingClientRect().width);
  const apply=widths=>{cols.forEach((col,i)=>col.style.width=widths[i]+'px');table.style.width=widths.reduce((a,b)=>a+b,0)+'px';table.style.minWidth=table.style.width;};
  table.querySelectorAll('.cc-column-resize').forEach((handle,index)=>{
    let startX=0,widths=null;
    handle.setAttribute('aria-valuemin',minWidths[index]);
    handle.setAttribute('aria-valuenow',parseFloat(cols[index].style.width));
    const finish=()=>{widths=null;document.body.classList.remove('cc-resizing');};
    handle.addEventListener('pointerdown',event=>{if(event.button!==0)return;event.preventDefault();widths=currentWidths();startX=event.clientX;handle.setPointerCapture(event.pointerId);document.body.classList.add('cc-resizing');});
    handle.addEventListener('pointermove',event=>{if(!widths)return;const next=[...widths];next[index]=Math.max(minWidths[index],widths[index]+event.clientX-startX);apply(next);handle.setAttribute('aria-valuenow',Math.round(next[index]));});
    handle.addEventListener('pointerup',finish);handle.addEventListener('pointercancel',finish);handle.addEventListener('lostpointercapture',finish);
    handle.addEventListener('keydown',event=>{if(!['ArrowLeft','ArrowRight'].includes(event.key))return;event.preventDefault();const next=currentWidths();next[index]=Math.max(minWidths[index],next[index]+(event.key==='ArrowRight'?16:-16));apply(next);handle.setAttribute('aria-valuenow',Math.round(next[index]));});
  });
})();
