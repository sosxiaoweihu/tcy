const cityInventoryLogPage=document.getElementById('cityInventoryLogPage');
const inventoryLogDefault={start:'2026-09-03T00:00:00',end:'2026-09-09T23:59:59'};
const inventoryLogState={productId:0,result:'',...inventoryLogDefault};
function inventoryLogSeed(product){
  const base=product.id===8?58:Math.max(0,(inventorySeed[product.id%10][4]?inventorySeed[product.id%10][3]:999)-1);
  return [
    [-1,base,'2026-09-09 11:12:58'],[-1,base+1,'2026-09-08 14:03:00'],
    [36,base+2,'2026-09-08 11:25:03'],[-1,Math.max(0,base-34),'2026-09-08 11:05:21'],
    [-1,Math.max(0,base-33),'2026-09-08 10:36:08'],[-1,Math.max(0,base-32),'2026-09-07 16:28:31'],
    [20,Math.max(0,base-31),'2026-09-07 09:15:10']
  ].map(([delta,available,time],index)=>({type:'修改线下库存',feature:'批量修改线下库存',client:'ERP系统',delta,available,online:available,ratio:100,safety:0,result:'成功',operator:'system',time,index}));
}
function inventoryLogNotify(message){const el=inventoryById('inventoryLogFeedback');el.textContent=message;el.hidden=false;clearTimeout(inventoryLogNotify.timer);inventoryLogNotify.timer=setTimeout(()=>el.hidden=true,2000);}
function renderInventoryLogs(){
  const product=inventoryProducts[inventoryLogState.productId];
  const start=inventoryLogState.start.replace('T',' '),end=inventoryLogState.end.replace('T',' ');
  const rows=[...product.logs,...inventoryLogSeed(product)].filter(row=>(!inventoryLogState.result||row.result===inventoryLogState.result)&&row.time>=start&&row.time<=end).sort((a,b)=>b.time.localeCompare(a.time));
  cityInventoryLogPage.dataset.productCode=product.code;
  cityInventoryLogPage.setAttribute('aria-label',`同城库存操作日志 ${product.code} ${product.name}`);
  inventoryById('inventoryLogRows').innerHTML=rows.map(row=>{
    const channels=row.index===0||row.index===4?['京东到家','美团外卖','饿百']:row.index===3?['饿百','美团外卖','京东到家']:['饿百','京东到家','美团外卖'];
    return `<tr><td><div title="${inventoryEscape(row.type)}">操作类型：${inventoryEscape(row.type)}</div><div title="${inventoryEscape(row.feature)}">系统功能：${inventoryEscape(row.feature)}</div><div>　操作端：${inventoryEscape(row.client)}</div></td><td>${row.delta}</td><td>${row.available}</td><td>${row.online}</td><td>${row.ratio}%</td><td>${row.safety}</td><td>${channels.map(channel=>`${channel}：${row.result}`).join('<br>')}</td><td class="inventory-log-document">${inventoryEscape(row.documentNo || '—')}</td><td>${inventoryEscape(row.operator)}</td><td>${row.time}</td></tr>`;
  }).join('')||'<tr><td colspan="10" class="inventory-log-empty">暂无符合条件的操作日志</td></tr>';
}
function inventoryLogUpdateDateText(){inventoryById('inventoryLogDateText').textContent=`${inventoryLogState.start.replace('T',' ').slice(0,13)} 至 ${inventoryLogState.end.replace('T',' ').slice(0,13)}`;inventoryById('inventoryLogDateButton').title=`${inventoryLogState.start.replace('T',' ')} 至 ${inventoryLogState.end.replace('T',' ')}`;}
function inventoryLogCloseDates(){inventoryById('inventoryLogDatePanel').hidden=true;inventoryById('inventoryLogDateButton').setAttribute('aria-expanded','false');}
function openCityInventoryLogPage(productId,shouldAddTab=true){
  if(productId!==undefined){inventoryLogState.productId=productId;Object.assign(inventoryLogState,{result:'',...inventoryLogDefault});inventoryById('inventoryLogResult').value='';}
  openCityInventoryPage(false);
  if(shouldAddTab)addOrActivateTab('同城库存操作日志');
  cityInventoryPage.hidden=true;cityInventoryLogPage.hidden=false;
  inventoryLogCloseDates();inventoryLogUpdateDateText();renderInventoryLogs();
}
inventoryById('inventoryLogFilters').addEventListener('submit',event=>{event.preventDefault();inventoryLogState.result=inventoryById('inventoryLogResult').value;inventoryLogCloseDates();renderInventoryLogs();inventoryLogNotify('查询完成');});
inventoryById('inventoryLogFilters').addEventListener('reset',()=>{Object.assign(inventoryLogState,{result:'',...inventoryLogDefault});inventoryLogCloseDates();inventoryLogUpdateDateText();renderInventoryLogs();inventoryLogNotify('已重置查询条件');});
inventoryById('inventoryLogDateButton').addEventListener('click',()=>{
  const panel=inventoryById('inventoryLogDatePanel');if(!panel.hidden){inventoryLogCloseDates();return;}
  inventoryById('inventoryLogStart').value=inventoryLogState.start;inventoryById('inventoryLogEnd').value=inventoryLogState.end;inventoryById('inventoryLogDateError').textContent='';panel.hidden=false;inventoryById('inventoryLogDateButton').setAttribute('aria-expanded','true');
});
inventoryById('inventoryLogDateCancel').addEventListener('click',inventoryLogCloseDates);
inventoryById('inventoryLogDateApply').addEventListener('click',()=>{
  let start=inventoryById('inventoryLogStart').value,end=inventoryById('inventoryLogEnd').value;
  if(!start||!end||start>end){inventoryById('inventoryLogDateError').textContent='请选择有效时间，结束时间不能早于开始时间。';return;}
  if(start.length===16)start+=':00';if(end.length===16)end+=':00';
  Object.assign(inventoryLogState,{start,end});inventoryLogUpdateDateText();inventoryLogCloseDates();
});
document.addEventListener('click',event=>{if(!event.target.closest('.inventory-log-time'))inventoryLogCloseDates();});
cityInventoryLogPage.addEventListener('keydown',event=>{if(event.key==='Escape')inventoryLogCloseDates();});
