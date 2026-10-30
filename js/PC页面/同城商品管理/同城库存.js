const cityInventoryPage = document.getElementById('cityInventoryPage');
const inventorySeed = [
  ['35100761','麦堡卤料30g','6920065852120',22,true],
  ['34100209','迎驾贡酒6 42%vol 500ml','6922408718681',130,true],
  ['33800332','稻香村苏式五仁月饼（卷装）310g','6935820221011',0,false],
  ['33800331','稻香村苏式椒盐月饼（卷装）310g','6935820219315',0,false],
  ['33800305','稻香村苏式板栗月饼（卷装）310g','6935820249848',56,true],
  ['11101743','青茄400-450g/个','3000111017437',348,false],
  ['35001116','白象大辣椒火鸡拌面119g','6935270639015',10,true],
  ['11101742','新鲜带壳花生250-270g','3000111017420',582,false],
  ['33800304','稻香村苏式蛋黄月饼（卷装）310g','6935820249831',59,true],
  ['33800330','稻香村苏式低糖荞麦五仁月饼（卷装）310g','6935820241071',0,false]
];
// 第一页复刻参考图，其余页提供可翻页的本地原型数据。
const inventoryProducts = Array.from({length:8756},(_,i)=>{
  const [code,name,barcode,stock,sync]=inventorySeed[i%10];
  return {id:i,code:i<10?code:String(36000000+i),name,barcode:i<10?barcode:String(6935800000000+i),stock,sync,ratio:100,safety:0,online:sync?stock:999,logs:[],lastAvailable:sync?stock:999};
});
const inventoryState={page:1,code:'',name:'',store:'1001'};
const inventoryById=id=>document.getElementById(id);
const inventoryEscape=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function inventoryToast(message){const toast=inventoryById('inventoryToast');toast.textContent=message;toast.hidden=false;clearTimeout(inventoryToast.timer);inventoryToast.timer=setTimeout(()=>toast.hidden=true,2200);}
function inventoryFiltered(){return inventoryProducts.filter(p=>p.code.includes(inventoryState.code)&&p.name.includes(inventoryState.name));}
function inventoryLog(p,message){
  const available=Math.max(0,p.online-p.safety);
  p.logs.unshift({type:message,feature:message,client:'管理后台',delta:available-p.lastAvailable,available,online:p.online,ratio:p.ratio,safety:p.safety,result:'成功',operator:'肖伟虎',time:new Date().toLocaleString('sv-SE')});
  p.lastAvailable=available;
}
function inventoryRecalculate(p){if(p.sync)p.online=Math.floor(p.stock*p.ratio/100);}
function inventoryEditButton(p,key,label){return `<button class="inventory-edit" data-inventory-edit="${key}" data-id="${p.id}" aria-label="编辑${label} ${p.code}"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M9 3H2v15h15v-8M7 10l9-9 3 3-9 9-4 1zM14 3l3 3"/></svg></button>`;}
function renderInventory(){
  const rows=inventoryFiltered(),max=Math.max(1,Math.ceil(rows.length/10));inventoryState.page=Math.min(max,Math.max(1,inventoryState.page));
  inventoryById('inventoryRows').innerHTML=rows.slice((inventoryState.page-1)*10,inventoryState.page*10).map(p=>`<tr class="${[4,8].includes(p.id)?'inventory-highlight':''}"><td>商品编码：${p.code}<br>商品名称：${inventoryEscape(p.name)}<br>商品条码：${p.barcode}</td><td>联家恒通店<br>1001</td><td>${p.stock}</td><td>${p.ratio}%${inventoryEditButton(p,'ratio','库存比例')}</td><td>${p.online}</td><td>${p.safety}${inventoryEditButton(p,'safety','安全库存')}</td><td>${Math.max(0,p.online-p.safety)}${inventoryEditButton(p,'available','线上可售库存')}</td><td>${p.sync?'启用':'停用'}</td><td><button class="inventory-link" data-inventory-toggle="${p.id}">${p.sync?'停用':'启用'}线下库存</button><button class="inventory-link" data-inventory-logs="${p.id}">操作日志</button></td></tr>`).join('')||'<tr><td colspan="9" class="inventory-empty">暂无符合条件的库存数据</td></tr>';
  inventoryById('inventoryTotal').textContent=`共 ${rows.length} 条`;
  const start=Math.max(1,Math.min(inventoryState.page-2,max-5)),pages=Array.from({length:Math.min(6,max)},(_,i)=>start+i);
  inventoryById('inventoryPages').innerHTML=`<button data-inventory-page="${inventoryState.page-1}" aria-label="上一页" ${inventoryState.page===1?'disabled':''}>‹</button>${start>1?'<button data-inventory-page="1">1</button><span>…</span>':''}${pages.map(n=>`<button data-inventory-page="${n}" class="${n===inventoryState.page?'active':''}">${n}</button>`).join('')}${pages.at(-1)<max?`<span>…</span><button data-inventory-page="${max}">${max}</button>`:''}<button data-inventory-page="${inventoryState.page+1}" aria-label="下一页" ${inventoryState.page===max?'disabled':''}>›</button>`;
  inventoryById('inventoryJump').value=inventoryState.page;inventoryById('inventoryJump').max=max;
}
function openCityInventoryPage(shouldAddTab=true){
  if(shouldAddTab)addOrActivateTab('同城库存');
  leaveTongchengAppPage();leaveCustomTaskPage();document.body.classList.remove('unified-category-mode');
  [...cityInventoryPage.parentElement.children].forEach(el=>{if(el.tagName==='SECTION')el.hidden=el!==cityInventoryPage;});
  cityInventoryPage.hidden=false;pageTabs.hidden=false;tongchengMenu.hidden=true;interfaceMenu.hidden=true;legacyMenu.hidden=true;
  document.querySelectorAll('#tongchengMenu [data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page==='同城库存'));
  document.querySelectorAll('.side-nav [data-nav]').forEach(b=>b.classList.toggle('active',b.dataset.nav==='同城'));renderInventory();
}
function inventoryDialog(title,body,onConfirm){
  const dialog=inventoryById('inventoryDialog');inventoryById('inventoryDialogTitle').textContent=title;inventoryById('inventoryDialogBody').innerHTML=body;
  inventoryById('inventoryConfirm').onclick=async e=>{e.preventDefault();if(!dialog.querySelector('form').reportValidity())return;try{if(await onConfirm()!==false)dialog.close();}catch(err){inventoryToast(err.message);}};
  dialog.showModal();
}
function inventoryDownload(text,name){const url=URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
inventoryById('inventoryFilters').addEventListener('submit',e=>{e.preventDefault();Object.assign(inventoryState,{page:1,code:inventoryById('inventoryCode').value.trim(),name:inventoryById('inventoryName').value.trim(),store:inventoryById('inventoryStore').value});renderInventory();inventoryToast('查询完成');});
inventoryById('inventoryFilters').addEventListener('reset',()=>{Object.assign(inventoryState,{page:1,code:'',name:'',store:'1001'});inventoryById('inventoryStoreTag').hidden=false;renderInventory();inventoryToast('已重置查询条件');});
inventoryById('inventoryStore').addEventListener('change',e=>inventoryById('inventoryStoreTag').hidden=!e.target.value);
inventoryById('inventoryJump').addEventListener('change',e=>{const n=Number(e.target.value);if(!Number.isInteger(n)||n<1||n>Number(e.target.max)){e.target.value=inventoryState.page;inventoryToast('请输入有效页码');return;}inventoryState.page=n;renderInventory();});
cityInventoryPage.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.inventoryPage){inventoryState.page=Number(b.dataset.inventoryPage);renderInventory();}
  if(b.dataset.inventoryEdit){const p=inventoryProducts[Number(b.dataset.id)],key=b.dataset.inventoryEdit,label={ratio:'库存比例',safety:'安全库存',available:'线上可售库存'}[key];inventoryDialog(`编辑${label}`,`<p>${inventoryEscape(p.name)}（${p.code}）</p><label>${label}${key==='ratio'?'（%）':''}<input id="inventoryEditValue" type="number" min="0" ${key==='ratio'?'max="100"':''} step="1" required value="${key==='available'?Math.max(0,p.online-p.safety):p[key]}" /></label>${key==='available'?'<small>保存可售库存后，将停用该商品的线下库存同步。</small>':''}`,()=>{const n=Number(inventoryById('inventoryEditValue').value);if(key==='available'){p.sync=false;p.online=n+p.safety;}else{p[key]=n;inventoryRecalculate(p);}inventoryLog(p,`${label}修改为 ${n}${key==='ratio'?'%':''}`);renderInventory();inventoryToast('保存成功');});}
  if(b.dataset.inventoryToggle){const p=inventoryProducts[Number(b.dataset.inventoryToggle)];p.sync=!p.sync;inventoryRecalculate(p);inventoryLog(p,`${p.sync?'启用':'停用'}线下库存`);renderInventory();inventoryToast('库存同步状态已更新');}
  if(b.dataset.inventoryLogs) openCityInventoryLogPage(Number(b.dataset.inventoryLogs));
  const action=b.dataset.inventoryAction;
  if(action==='clear-store'){inventoryById('inventoryStore').value='';inventoryById('inventoryStoreTag').hidden=true;}
  if(action==='export'){const lines=[['商品编码','商品名称','商品条码','门店编码','门店名称','门店库存','库存比例','线上库存','安全库存','线上可售库存','接收库存同步'],...inventoryFiltered().map(p=>[p.code,p.name,p.barcode,'1001','联家恒通店',p.stock,p.ratio+'%',p.online,p.safety,Math.max(0,p.online-p.safety),p.sync?'启用':'停用'])];inventoryDownload(lines.map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n'),'同城库存.csv');inventoryToast('库存已导出');}
  if(action==='sync'){const rows=inventoryFiltered();inventoryDialog('设置库存同步',`<p>将为当前查询结果中的 ${rows.length} 条商品设置接收库存同步。</p><select id="inventorySyncValue"><option value="on">启用</option><option value="off">停用</option></select>`,()=>{const on=inventoryById('inventorySyncValue').value==='on';rows.forEach(p=>{p.sync=on;inventoryRecalculate(p);inventoryLog(p,`批量${on?'启用':'停用'}库存同步`);});renderInventory();inventoryToast('库存同步设置成功');});}
  if(action==='template')inventoryDownload('商品编码,线上可售库存\r\n35100761,22','库存导入模板.csv');
  if(action==='import')inventoryDialog('批量导入库存','<p>上传 CSV 文件，包含“商品编码,线上可售库存”两列。导入后停用对应商品的线下库存同步。</p><p><button type="button" class="btn" data-inventory-action="template">下载导入模板</button></p><input id="inventoryImportFile" type="file" accept=".csv" required /><p id="inventoryImportError" role="alert"></p>',async()=>{
    const file=inventoryById('inventoryImportFile').files[0];if(!file)return false;
    const lines=(await file.text()).replace(/^\uFEFF/,'').trim().split(/\r?\n/).map(line=>line.split(',').map(v=>v.trim().replace(/^"|"$/g,'')));
    const error=msg=>{inventoryById('inventoryImportError').textContent=msg;return false;};
    if(lines[0]?.join(',')!=='商品编码,线上可售库存'||lines.length<2)return error('请使用模板中的两列表头，并至少填写一条数据。');
    const updates=[],seen=new Set();for(let i=1;i<lines.length;i++){const [code,value]=lines[i],p=inventoryProducts.find(p=>p.code===code),n=Number(value);if(lines[i].length!==2||!p||!/^\d+$/.test(value)||!Number.isSafeInteger(n)||seen.has(code))return error(`第 ${i+1} 行无效：请检查商品编码、非负整数库存及重复编码。`);seen.add(code);updates.push([p,n]);}
    updates.forEach(([p,n])=>{p.sync=false;p.online=n+p.safety;inventoryLog(p,`导入线上可售库存 ${n}`);});renderInventory();inventoryToast(`已导入 ${updates.length} 条库存`);
  });
});
renderInventory();
