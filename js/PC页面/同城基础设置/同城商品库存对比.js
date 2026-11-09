// 参考截图的本地演示数据，不连接实际库存服务。
const inventoryComparePage = document.getElementById('inventoryComparePage');
const icById = id => document.getElementById(id);
const icEscape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icColumns = [
  ['seq','序号',64],['channel','渠道',110],['storeCode','门店编码',100],['store','门店名称',190],
  ['code','商品编码',120],['name','商品名称',240],['updated','中台库存更新时间',190],['center','中台库存',125],
  ['ratio','库存比例',105],['available','同城可售库存',130],['platform','平台库存',125],['erp','ERP库存',125],
  ['centerMatch','中台库存比对',130],['platformMatch','平台库存比对',130],['erpMatch','ERP库存比对',130],
  ['centerDiff','中台库存差异',130],['platformDiff','平台库存差异',130],['erpDiff','ERP库存差异',130],
  ['mode','销售模式',130],['creator','商品创建人',120],['actual','中台实库',125]
];
const icSeed = [
  ['美团外卖','1036','务川麒龙城市广场店','112110198','单冻龙虾尾500g','2026-11-07 23:12:25',23,90,20,33],
  ['京东到家','2010','美的林城阳关站店','112700059','秘制坨坨肉350g','2026-11-08 05:20:11',1,90,0,2],
  ['饿百','1093','遵义思乐为置地广场店','112700059','秘制坨坨肉350g','2026-11-07 23:11:31',4,90,3,6],
  ['饿百','1005','南浦路店','112700059','秘制坨坨肉350g','2026-11-08 08:38:12',9,90,8,13],
  ['饿百','2002','花果园U区店','123200003','笨豆芽(黄)350g','2026-11-08 19:02:54',2,70,1,3],
  ['饿百','1029','合力连锁瓮安店','123200003','笨豆芽(黄)350g','2026-11-08 23:59:18',0,70,0,0],
  ['美团外卖','1040','凯里国贸店','123200003','笨豆芽(黄)350g','2026-11-08 22:15:46',0,70,0,0],
  ['饿百','1033','合力连锁正安店','123200003','笨豆芽(黄)350g','2026-11-07 22:34:57',0,70,0,0],
  ['饿百','1028','合力连锁松桃店','126410036','沈师傅鸡蛋干150g','2026-11-09 01:59:02',23,90,20,34],
  ['京东到家','1016','合力连锁花溪店','126410036','沈师傅鸡蛋干150g','2026-11-09 00:39:55',28,90,25,41],
  ['饿百','1011','万科城店','127010119','(芸岭鲜生)有机西芹（散枝）400g','2026-11-08 06:10:14',0,70,0,0],
  ['京东到家','1062','遵义日月星城店','128010397','黔鲜惠鲜花生毛豆角组合500g','2026-11-07 22:38:59',0,70,0,0],
  ['京东到家','3001','万科麓山店','128010493','（供港）有机水果甘蓝750g','2026-11-09 01:35:54',0,70,0,0],
  ['美团外卖','1046','合力连锁金沙店','136510016','佳沃椰青','2026-11-08 06:24:41',0,70,0,0],
  ['饿百','1093','遵义思乐为置地广场店','136510016','佳沃椰青','2026-11-07 22:32:12',0,70,0,0]
];
const icData = Array.from({length:30},(_,index) => {
  const [channel,storeCode,store,code,name,updated,stock,ratio,available,erp] = icSeed[index % icSeed.length];
  const center = index < 15 ? stock : stock + 5;
  const sale = index < 15 ? available : Math.floor(center * ratio / 100);
  const platform = index >= 15 && index % 3 === 0 ? sale + 2 : sale;
  const actual = index >= 15 && index % 4 === 0 ? center + 1 : center;
  const erpStock = index < 15 ? erp : center + (index % 5 === 0 ? 0 : 3);
  return {seq:index+1,channel,storeCode,store,code,name,updated,center,ratio,available:sale,platform,erp:erpStock,actual,
    centerMatch:center === actual ? '成功':'失败', platformMatch:platform === sale ? '成功':'失败',erpMatch:erpStock === actual ? '成功':'失败',
    centerDiff:actual-center,platformDiff:platform-sale,erpDiff:erpStock-actual,mode:'A进A出生鲜',creator:'admin',format:'标超店',sync:index >= 15 && index % 5 === 0 ? '停用':'启用',date:'2026-11-08',region:index % 2 === 0 ? '贵阳区域':'遵义区域'};
});
const icState = {page:1,size:15,filters:{format:'标超店',date:'2026-11-08'},hidden:new Set(),exports:[],region:''};
const icNumeric = new Set(['center','available','platform','erp','actual','centerDiff','platformDiff','erpDiff']);
function icToast(message) {
  const toast=icById('icToast');toast.textContent=message;toast.hidden=false;
  clearTimeout(icToast.timer);icToast.timer=setTimeout(()=>toast.hidden=true,2400);
}
function icFiltered() {
  const filters=icState.filters;
  const codes = (filters.code || '').split(/[\s,，;；]+/).filter(Boolean);
  return icData.filter(row => Object.entries(filters).every(([key,value]) => {
    if(value==='')return true;
    if(key==='code')return codes.some(code=>row.code.includes(code));
    if(['centerDiff','platformDiff','erpDiff'].includes(key))return row[key]>Number(value);
    return String(row[key])===value;
  }));
}
function icCell(row,key) {
  if(key==='ratio')return row.ratio.toFixed(2)+'%';
  if(icNumeric.has(key))return key==='centerDiff'?String(row[key]):row[key].toFixed(4);
  return String(row[key]);
}
function renderInventoryCompare() {
  const rows=icFiltered(),columns=icColumns.filter(([key])=>!icState.hidden.has(key));
  const max=Math.max(1,Math.ceil(rows.length/icState.size));icState.page=Math.max(1,Math.min(max,icState.page));
  const table=inventoryComparePage.querySelector('.ic-table');table.style.width=columns.reduce((n,c)=>n+c[2],0)+'px';
  icById('icCols').innerHTML=columns.map(([,label,width])=>`<col style="width:${width}px">`).join('');
  icById('icHead').innerHTML='<tr>'+columns.map(([,label])=>`<th scope="col">${label}</th>`).join('')+'</tr>';
  icById('icRows').innerHTML=rows.slice((icState.page-1)*icState.size,icState.page*icState.size).map(row=>'<tr>'+columns.map(([key])=>`<td class="${icNumeric.has(key)?'ic-number':['store','name'].includes(key)?'ic-text':''}" title="${icEscape(icCell(row,key))}">${icEscape(icCell(row,key))}</td>`).join('')+'</tr>').join('') || `<tr><td colspan="${columns.length}" class="ic-empty">暂无符合条件的库存对比数据</td></tr>`;
  icById('icSummary').innerHTML='<tr>'+columns.map(([key],index)=>`<td class="${icNumeric.has(key)?'ic-number':''}">${index===0?'合计':key==='channel'?`共 ${rows.length} 条`:icNumeric.has(key)?icCell({[key]:rows.reduce((n,row)=>n+row[key],0)},key):''}</td>`).join('')+'</tr>';
  icById('icCount').textContent=`共 ${rows.length} 条`;icById('icTotal').textContent=`共 ${rows.length} 条`;
  icById('icPages').innerHTML=`<button type="button" data-ic-page="${icState.page-1}" aria-label="上一页" ${icState.page===1?'disabled':''}>‹</button>${Array.from({length:max},(_,i)=>`<button type="button" data-ic-page="${i+1}" ${icState.page===i+1?'class="active" aria-current="page"':''}>${i+1}</button>`).join('')}<button type="button" data-ic-page="${icState.page+1}" aria-label="下一页" ${icState.page===max?'disabled':''}>›</button>`;
  icById('icJump').value=icState.page;icById('icJump').max=max;
}
function openInventoryComparePage(shouldAddTab=true) {
  if(shouldAddTab)addOrActivateTab('同城商品库存对比');
  leaveTongchengAppPage();leaveCustomTaskPage();document.body.classList.remove('unified-category-mode');unifiedCategorySidebar.hidden=true;
  [...inventoryComparePage.parentElement.children].forEach(element=>{if(element.tagName==='SECTION')element.hidden=element!==inventoryComparePage;});
  inventoryComparePage.hidden=false;pageTabs.hidden=false;tongchengMenu.hidden=true;interfaceMenu.hidden=true;legacyMenu.hidden=true;
  document.querySelectorAll('#tongchengMenu [data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page==='同城商品库存对比'));
  document.querySelectorAll('.side-nav [data-nav]').forEach(button=>button.classList.toggle('active',button.dataset.nav==='同城'));
  renderInventoryCompare();
}
function icDialog(title,body,confirm) {
  icById('icDialogTitle').textContent=title;icById('icDialogBody').innerHTML=body+'<p class="ic-error" id="icDialogError" role="alert"></p>';
  icById('icDialogForm').onsubmit=async event=>{event.preventDefault();const button=event.submitter;if(button)button.disabled=true;try{if(await confirm()!==false)icById('icDialog').close();}catch(error){icById('icDialogError').textContent=error.message;}finally{if(button)button.disabled=false;}};
  icById('icDialog').showModal();
}
function icSetCodes(text) {
  const codes=[...new Set(text.replace(/^\uFEFF/,'').replace(/^商品编码[^\S\r\n]*(?:\r?\n|,)/,'').split(/[\s,，;；]+/).map(value=>value.replace(/^"|"$/g,'')).filter(Boolean))];
  if(!codes.length || codes.some(value=>!/^\d+$/.test(value))){icById('icDialogError').textContent='请填写数字商品编码，用换行或逗号分隔。';return false;}
  icById('inventoryCompareFilters').elements.code.value=codes.join(',');icToast(`已填入 ${codes.length} 个商品编码，请点击查询`);
}
function icExport() {
  const rows=icFiltered();if(!rows.length){icToast('暂无可导出的数据');return;}
  const columns=icColumns.filter(([key])=>!icState.hidden.has(key));
  const csv=[columns.map(c=>c[1]),...rows.map(row=>columns.map(([key])=>icCell(row,key)))].map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const name=`同城商品库存对比_${icState.exports.length+1}.csv`;
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  icState.exports.unshift({name,count:rows.length,time:new Date().toLocaleTimeString('zh-CN')});icToast(`已导出 ${rows.length} 条库存对比数据`);
}
icById('inventoryCompareFilters').elements.store.append(...[...new Map(icData.map(row=>[row.storeCode,row])).values()].map(row=>new Option(`${row.storeCode}_${row.store}`,row.store)));
icById('inventoryCompareFilters').addEventListener('submit',event=>{
  event.preventDefault();icState.filters=Object.fromEntries(new FormData(event.target));
  if(icState.region)icState.filters.region=icState.region;
  icState.page=1;renderInventoryCompare();icToast(`查询完成，共 ${icFiltered().length} 条`);
});
icById('inventoryCompareFilters').addEventListener('reset',()=>{
  icState.filters={format:'标超店',date:'2026-11-08'};icState.region='';icState.page=1;
  inventoryComparePage.querySelector('[data-ic-action="region"]').textContent='区域';renderInventoryCompare();icToast('已重置查询条件');
});
icById('icExpand').addEventListener('click',event=>{
  const button=event.currentTarget,expanded=button.getAttribute('aria-expanded')!=='true';
  button.setAttribute('aria-expanded',expanded);button.innerHTML=expanded?'收起 <span aria-hidden="true">⌃</span>':'展开 <span aria-hidden="true">⌄</span>';icById('icAdvanced').hidden=!expanded;
});
icById('icPageSize').addEventListener('change',event=>{icState.size=Number(event.target.value);icState.page=1;renderInventoryCompare();});
icById('icJump').addEventListener('change',event=>{
  const n=Number(event.target.value);if(!Number.isInteger(n)||n<1||n>Number(event.target.max)){event.target.value=icState.page;icToast('请输入有效页码');return;}icState.page=n;renderInventoryCompare();
});
inventoryComparePage.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.icPage){icState.page=Number(button.dataset.icPage);renderInventoryCompare();}
  const action=button.dataset.icAction;
  if(action==='close')icById('icDialog').close();
  if(action==='export')icExport();
  if(action==='codes')icDialog('批量输入商品编码',`<p>每行一个商品编码，也可用逗号分隔。</p><textarea id="icCodeBatch" aria-label="批量商品编码" placeholder="112110198\n112700059">${icEscape(icById('inventoryCompareFilters').elements.code.value)}</textarea>`,()=>icSetCodes(icById('icCodeBatch').value));
  if(action==='import')icDialog('批量导入商品编码','<p>请选择 CSV 或 TXT 文件，首行可填写“商品编码”，其余每行一个数字编码。</p><input id="icCodeFile" type="file" accept=".csv,.txt" aria-label="商品编码文件" required />',async()=>{
    const file=icById('icCodeFile').files[0];if(!file)return false;
    if(!/\.(csv|txt)$/i.test(file.name)||file.size>1024*1024){icById('icDialogError').textContent='请选择不超过 1MB 的 CSV 或 TXT 文件。';return false;}
    return icSetCodes(await file.text());
  });
  if(action==='region')icDialog('选择门店区域','<label>门店区域 <select id="icRegion"><option value="">全部区域</option><option>贵阳区域</option><option>遵义区域</option></select></label>',()=>{icState.region=icById('icRegion').value;button.textContent=icState.region||'区域';icToast('区域已选择，请点击查询');});
  if(action==='region')icById('icRegion').value=icState.region;
  if(action==='options')icDialog('显示列设置','<div class="ic-column-options">'+icColumns.map(([key,label])=>`<label><input type="checkbox" value="${key}" ${icState.hidden.has(key)?'':'checked'} ${key==='seq'?'disabled':''} />${label}</label>`).join('')+'</div>',()=>{icState.hidden=new Set([...icById('icDialogBody').querySelectorAll('input:not(:checked)')].map(input=>input.value));renderInventoryCompare();icToast('显示列已更新');});
  if(action==='exports')icDialog('查看导出',icState.exports.length?icState.exports.map(item=>`<p><strong>${icEscape(item.name)}</strong><br>${item.count} 条 · ${icEscape(item.time)} · 已下载</p>`).join(''):'<p>暂无导出记录，请先点击“导出”。</p>',()=>true);
});
renderInventoryCompare();
