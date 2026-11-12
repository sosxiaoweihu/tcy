// 仅使用参考 HTML 中保存的明细，不加载原页面脚本或远端服务。
const ar2Source = [{"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100002", "name": "七喜 冰爽柠檬味汽水330ml", "front": "wjh17", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100002", "name": "七喜 冰爽柠檬味汽水330ml", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "720.00", "sales": "1", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100003", "name": "美年达橙330ML", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100003", "name": "美年达橙330ML", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100004", "name": "美年达苹果味330ML", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100004", "name": "美年达苹果味330ML", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100005", "name": "美年达葡萄味330ML", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100005", "name": "美年达葡萄味330ML", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100010", "name": "美年达橙味PET300ml*12", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100010", "name": "美年达橙味PET300ml*12", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100014", "name": "百事SLEEK CAN 330ml", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100014", "name": "百事SLEEK CAN 330ml", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100015", "name": "美年达SLEEK CAN 330ml", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "0.00", "sales": "0", "rate": "0.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100015", "name": "美年达SLEEK CAN 330ml", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "0.00", "sales": "0", "rate": "0.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100016", "name": "百事无糖SLEEK CAN 330ml", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100016", "name": "百事无糖SLEEK CAN 330ml", "front": "油", "back": "可乐", "channel": "饿百", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}, {"storeCode": "2005", "store": "鹏泰百货南康一店", "code": "101010100023", "name": "七喜 柠檬味汽水550ML", "front": "低温鲜奶", "back": "可乐", "channel": "美团外卖", "expected": "720", "actual": "720.00", "sales": "0", "rate": "100.00%"}];
const ar2Page = document.getElementById('absenceReport2Page');
const ar2El = id => document.getElementById(id);
const ar2Escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ar2State = {view:'detail', sort:'', direction:1, page:1, size:20, filters:{}, start:'2026-10-12', end:'2026-11-10', region:'', custom:false, period:'近30日'};
const ar2Columns = {
  detail:[['storeCode','门店编码',100],['store','门店名称',180],['code','商品编码',145],['name','商品名称',260],['front','前台类目',120],['back','后台类目',120],['channel','渠道',120],['expected','应出勤时长(h)',140],['actual','实际出勤时长(h)',150],['sales','销售数量',100],['rate','出勤率',110]],
  store:[['storeCode','门店编码',110],['store','门店名称',220],['channel','渠道',130],['count','商品组合数',130],['expected','应出勤时长(h)',160],['actual','实际出勤时长(h)',160],['sales','销售数量',120],['rate','出勤率',120]],
  category:[['front','前台类目',160],['back','后台类目',160],['channel','渠道',130],['count','商品组合数',130],['expected','应出勤时长(h)',160],['actual','实际出勤时长(h)',160],['sales','销售数量',120],['rate','出勤率',120]]
};
function ar2Toast(message) {
  const toast=ar2El('ar2Toast'); toast.textContent=message; toast.hidden=false;
  clearTimeout(ar2Toast.timer); ar2Toast.timer=setTimeout(()=>toast.hidden=true,2600);
}
function ar2Filtered() {
  const hours=(new Date(ar2State.end+'T12:00:00')-new Date(ar2State.start+'T12:00:00'))/86400000*24+24;
  return ar2Source.filter(row=>Object.entries(ar2State.filters).every(([key,value])=> !value || (key==='code'?row.code.includes(value):String(row[key])===value))).map(row=>({
    ...row, expected:hours, actual:hours*parseFloat(row.rate)/100, sales:Number(row.sales)
  }));
}
function ar2RowsForView() {
  const rows=ar2Filtered(); if(ar2State.view==='detail')return rows;
  const keys=ar2State.view==='store'?['storeCode','store','channel']:['front','back','channel'];
  const groups=new Map();
  rows.forEach(row=>{
    const key=JSON.stringify(keys.map(k=>row[k]));
    if(!groups.has(key))groups.set(key,{...row,count:0,expected:0,actual:0,sales:0});
    const group=groups.get(key); group.count++; group.expected+=row.expected;group.actual+=row.actual;group.sales+=row.sales;
  });
  return [...groups.values()].map(row=>({...row,rate:(row.expected?row.actual/row.expected*100:0).toFixed(2)+'%'}));
}
function ar2SortedRows() {
  const rows=ar2RowsForView(),key=ar2State.sort;
  return key?rows.sort((a,b)=>(parseFloat(a[key])-parseFloat(b[key]))*ar2State.direction):rows;
}
function ar2Cell(row,key) {
  return key==='actual'?Number(row[key]).toFixed(2):String(row[key]);
}
function ar2Render() {
  const rows=ar2SortedRows(), columns=ar2Columns[ar2State.view];
  const max=Math.max(1,Math.ceil(rows.length/ar2State.size));ar2State.page=Math.max(1,Math.min(max,ar2State.page));
  ar2El('ar2Head').innerHTML='<tr>'+columns.map(([key,title,width])=>`<th scope="col" aria-sort="${ar2State.sort===key?(ar2State.direction===1?'ascending':'descending'):'none'}" style="width:${width}px" class="${['store','name','front','back'].includes(key)?'ar2-text':''}">${['expected','actual','sales','rate'].includes(key)?`<button type="button" data-ar2-sort="${key}" aria-label="按${title}排序">${title} <span aria-hidden="true">${ar2State.sort===key?(ar2State.direction===1?'↑':'↓'):'↕'}</span></button>`:title}</th>`).join('')+'</tr>';
  const table=ar2Page.querySelector('table');table.style.minWidth=columns.reduce((n,c)=>n+c[2],0)+'px';
  ar2El('ar2Rows').innerHTML=rows.slice((ar2State.page-1)*ar2State.size,ar2State.page*ar2State.size).map(row=>'<tr>'+columns.map(([key])=>`<td class="${['store','name','front','back'].includes(key)?'ar2-text':''} ${key==='rate'&&parseFloat(row.rate)<60?'ar2-danger':''}" title="${ar2Escape(ar2Cell(row,key))}">${ar2Escape(ar2Cell(row,key))}</td>`).join('')+'</tr>').join('')||`<tr><td colspan="${columns.length}" class="ar2-empty">暂无符合条件的出勤记录</td></tr>`;
  ar2El('ar2Total').textContent=`共 ${rows.length} 条`;ar2El('ar2Count').textContent=`共 ${rows.length} 条`;
  ar2El('ar2Pages').innerHTML=`<button type="button" data-ar2-page="${ar2State.page-1}" aria-label="上一页" ${ar2State.page===1?'disabled':''}>‹</button>`+Array.from({length:max},(_,i)=>`<button type="button" data-ar2-page="${i+1}" ${ar2State.page===i+1?'aria-current="page"':''}>${i+1}</button>`).join('')+`<button type="button" data-ar2-page="${ar2State.page+1}" aria-label="下一页" ${ar2State.page===max?'disabled':''}>›</button>`;
  ar2El('ar2Jump').value=ar2State.page;ar2El('ar2Jump').max=max;
  ar2Page.querySelectorAll('[data-ar2-view]').forEach(button=>{
    const selected=button.dataset.ar2View===ar2State.view;button.setAttribute('aria-selected',selected);button.tabIndex=selected?0:-1;
    if(selected)ar2El('ar2TablePanel').setAttribute('aria-labelledby',button.id);
  });
}
function ar2Metrics(snapshot=false) {
  let values;
  if(snapshot)values=['67.80%','-24.99%','10117','11536','2815','24.40%','87.70%'];
  else {
    const rows=ar2Filtered(),expected=rows.reduce((n,r)=>n+r.expected,0),actual=rows.reduce((n,r)=>n+r.actual,0),warning=rows.filter(r=>parseFloat(r.rate)<60).length;
    values=[(expected?actual/expected*100:0).toFixed(2)+'%','—',String(rows.filter(r=>r.actual>0).length),String(rows.length),String(warning),(rows.length?warning/rows.length*100:0).toFixed(2)+'%','—'];
  }
  ['Overall','Compare','Attended','Combinations','Warning','WarningRate','Coverage'].forEach((key,i)=>ar2El('ar2'+key).textContent=values[i]);

}
function openAbsenceReport2Page(shouldAddTab=true) {
  if(shouldAddTab)addOrActivateTab('同城缺勤报表2');
  leaveTongchengAppPage();leaveCustomTaskPage();document.body.classList.remove('unified-category-mode');unifiedCategorySidebar.hidden=true;
  [...ar2Page.parentElement.children].forEach(element=>{if(element.tagName==='SECTION')element.hidden=element!==ar2Page;});
  ar2Page.hidden=false; pageTabs.hidden=false;tongchengMenu.hidden=true;interfaceMenu.hidden=true;legacyMenu.hidden=true;
  document.querySelectorAll('#tongchengMenu [data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page==='同城缺勤报表2'));
  document.querySelectorAll('.side-nav [data-nav]').forEach(button=>button.classList.toggle('active',button.dataset.nav==='同城'));
  ar2Render();
}
function ar2FormatDate(date) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function ar2QuickPeriod(period) {
  const today=new Date(2026,10,10,12),start=new Date(today),end=new Date(today);
  const weekday=(today.getDay()+6)%7;
  if(period==='近30日')start.setDate(today.getDate()-29);
  if(period==='昨天'){start.setDate(today.getDate()-1);end.setDate(today.getDate()-1);}
  if(period==='本周')start.setDate(today.getDate()-weekday);
  if(period==='上周'){start.setDate(today.getDate()-weekday-7);end.setDate(today.getDate()-weekday-1);}
  if(period==='本月')start.setDate(1);
  if(period==='上月'){start.setMonth(today.getMonth()-1,1);end.setDate(0);}
  if(period==='本年')start.setMonth(0,1);
  ar2State.start=ar2FormatDate(start);ar2State.end=ar2FormatDate(end);ar2State.custom=false;ar2State.period=period;ar2UpdateRange();
}
function ar2UpdateRange(){ar2El('ar2DateRange').textContent=`${ar2State.start} — ${ar2State.end}`;}
let ar2CalendarMonth=new Date(2026,9,1,12),ar2DraftStart='',ar2DraftEnd='';
function ar2CloseCalendar(){ar2El('ar2Period').value=ar2State.period;ar2El('ar2Calendar').hidden=true;ar2El('ar2DateRange').setAttribute('aria-expanded','false');}
function ar2OpenCalendar(){
  ar2DraftStart=ar2State.start;ar2DraftEnd=ar2State.end;ar2CalendarMonth=new Date(ar2State.start+'T12:00:00');ar2CalendarMonth.setDate(1);
  ar2El('ar2Calendar').hidden=false;ar2El('ar2DateRange').setAttribute('aria-expanded','true');ar2RenderCalendar();
}
function ar2RenderCalendar(){
  ar2El('ar2Months').innerHTML=[0,1].map(offset=>{
    const month=new Date(ar2CalendarMonth.getFullYear(),ar2CalendarMonth.getMonth()+offset,1,12),year=month.getFullYear(),m=month.getMonth();
    const empty=(month.getDay()+6)%7,days=new Date(year,m+1,0).getDate();
    return `<div class="ar2-month"><h3>${year}年 ${m+1}月</h3><div class="ar2-days">${['一','二','三','四','五','六','日'].map(d=>`<span>${d}</span>`).join('')}${'<span></span>'.repeat(empty)}${Array.from({length:days},(_,i)=>{
      const date=ar2FormatDate(new Date(year,m,i+1,12)),selected=date===ar2DraftStart||date===ar2DraftEnd;
      return `<button type="button" data-ar2-date="${date}" aria-label="${date}" aria-pressed="${selected}" class="${selected?'selected':ar2DraftStart&&ar2DraftEnd&&date>ar2DraftStart&&date<ar2DraftEnd?'in-range':''}">${i+1}</button>`;
    }).join('')}</div></div>`;
  }).join('');ar2El('ar2DraftRange').textContent=ar2DraftStart?(ar2DraftEnd?`${ar2DraftStart} 至 ${ar2DraftEnd}`:`${ar2DraftStart}，请选择结束日期`):'请选择起止日期';
}
const ar2Form=ar2El('ar2Filters');
ar2Form.addEventListener('submit',event=>{
  event.preventDefault();ar2State.filters=Object.fromEntries(new FormData(ar2Form));delete ar2State.filters.period;
  ar2State.page=1;ar2Render();ar2Metrics(Object.values(ar2State.filters).every(v=>!v)&&ar2State.start==='2026-10-12'&&ar2State.end==='2026-11-10');ar2CloseCalendar();ar2Toast(`查询完成，共 ${ar2Filtered().length} 条样例明细`);
});
ar2Form.addEventListener('reset',()=>{
  ar2State.filters={};ar2State.page=1;ar2State.sort='';ar2State.direction=1;ar2State.region='';ar2QuickPeriod('近30日');ar2El('ar2RegionButton').textContent='区域';ar2El('ar2Region').value='';
  ar2CloseCalendar();ar2Render();ar2Metrics(true);ar2Toast('已重置查询条件');
});
ar2El('ar2Expand').addEventListener('click',event=>{
  const button=event.currentTarget,expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',expanded);button.textContent=expanded?'收起 ⌃':'展开 ⌄';ar2El('ar2Advanced').hidden=!expanded;ar2CloseCalendar();
});
ar2El('ar2Period').addEventListener('change',event=>{if(event.target.value==='自定义')ar2OpenCalendar();else {ar2QuickPeriod(event.target.value);ar2CloseCalendar();}});
ar2El('ar2DateRange').addEventListener('click',()=>ar2El('ar2Calendar').hidden?ar2OpenCalendar():ar2CloseCalendar());
ar2El('ar2DateCancel').addEventListener('click',ar2CloseCalendar);
ar2El('ar2DateConfirm').addEventListener('click',()=>{
  if(!ar2DraftStart||!ar2DraftEnd){ar2Toast('请选择完整的起止日期');return;}
  ar2State.start=ar2DraftStart;ar2State.end=ar2DraftEnd;ar2State.custom=true;ar2State.period='自定义';ar2El('ar2Period').value='自定义';ar2UpdateRange();ar2CloseCalendar();
});
ar2El('ar2RegionButton').addEventListener('click',()=>{ar2El('ar2Region').value=ar2State.region;ar2El('ar2RegionDialog').showModal();});
ar2El('ar2RegionDialog').addEventListener('close',event=>{
  if(event.target.returnValue==='confirm'){ar2State.region=ar2El('ar2Region').value;ar2El('ar2RegionButton').textContent=ar2State.region||'区域';ar2Toast(ar2State.region?'已选择南康区域，包含鹏泰百货南康一店':'已选择全部区域');}
});
ar2El('ar2PageSize').addEventListener('change',event=>{ar2State.size=Number(event.target.value);ar2State.page=1;ar2Render();});
ar2El('ar2Jump').addEventListener('change',event=>{const page=Number(event.target.value);if(!Number.isInteger(page)||page<1||page>Number(event.target.max)){event.target.value=ar2State.page;ar2Toast('请输入有效页码');return;}ar2State.page=page;ar2Render();});
ar2Page.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.ar2Sort){ar2State.direction=ar2State.sort===button.dataset.ar2Sort?-ar2State.direction:1;ar2State.sort=button.dataset.ar2Sort;ar2State.page=1;ar2Render();}
  if(button.dataset.ar2View){ar2State.view=button.dataset.ar2View;ar2State.page=1;ar2Render();}
  if(button.dataset.ar2Page){ar2State.page=Number(button.dataset.ar2Page);ar2Render();}
  if(button.dataset.ar2Month){ar2CalendarMonth.setMonth(ar2CalendarMonth.getMonth()+Number(button.dataset.ar2Month));ar2RenderCalendar();}
  if(button.dataset.ar2Date){const date=button.dataset.ar2Date;if(!ar2DraftStart||ar2DraftEnd){ar2DraftStart=date;ar2DraftEnd='';}else {ar2DraftEnd=date;if(date<ar2DraftStart)[ar2DraftStart,ar2DraftEnd]=[date,ar2DraftStart];}ar2RenderCalendar();}
});
ar2Page.querySelector('[role="tablist"]').addEventListener('keydown',event=>{
  const buttons=[...ar2Page.querySelectorAll('[data-ar2-view]')],index=buttons.indexOf(document.activeElement);if(index<0)return;
  let next;if(event.key==='ArrowRight')next=(index+1)%buttons.length;if(event.key==='ArrowLeft')next=(index+buttons.length-1)%buttons.length;if(event.key==='Home')next=0;if(event.key==='End')next=buttons.length-1;
  if(next!==undefined){event.preventDefault();buttons[next].click();buttons[next].focus();}
});
ar2El('ar2Export').addEventListener('click',()=>{
  const rows=ar2SortedRows();if(!rows.length){ar2Toast('暂无可导出的数据');return;}
  const columns=ar2Columns[ar2State.view],name=ar2Page.querySelector('[data-ar2-view][aria-selected="true"]').textContent;
  const csv=[columns.map(c=>c[1]),...rows.map(row=>columns.map(([key])=>ar2Cell(row,key)))].map(row=>row.map(value=>'"'+String(value).replace(/"/g,'""')+'"').join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download=`同城缺勤报表2_${name}.csv`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);ar2Toast(`已导出${name}，共 ${rows.length} 条`);
});
document.addEventListener('click',event=>{if(!ar2El('ar2Calendar').hidden&&!event.composedPath().includes(ar2El('ar2Calendar'))&&event.target!==ar2El('ar2DateRange')&&event.target!==ar2El('ar2Period'))ar2CloseCalendar();});
ar2Page.addEventListener('keydown',event=>{if(event.key==='Escape')ar2CloseCalendar();});
ar2Render();

// 指标释义以小问号浮层展示，支持鼠标和键盘，避免遮挡时越出视口。
function ar2HideMetricHelp() {
  ar2Page.querySelectorAll('.ar2-metric-help').forEach(help => {
    help.querySelector('[role="tooltip"]').hidden = true;
    help.querySelector('button').setAttribute('aria-expanded', 'false');
  });
}
function ar2ShowMetricHelp(help) {
  ar2HideMetricHelp();
  const button = help.querySelector('button'), tooltip = help.querySelector('[role="tooltip"]');
  tooltip.hidden = false;
  button.setAttribute('aria-expanded', 'true');
  const anchor = button.getBoundingClientRect(), box = tooltip.getBoundingClientRect(), margin = 16;
  tooltip.style.left = Math.max(margin, Math.min(anchor.left, window.innerWidth - box.width - margin)) + 'px';
  const below = anchor.bottom + 8;
  tooltip.style.top = Math.max(margin, below + box.height <= window.innerHeight - margin ? below : anchor.top - box.height - 8) + 'px';
}
ar2Page.querySelectorAll('.ar2-metric-help').forEach(help => {
  help.addEventListener('mouseenter', () => ar2ShowMetricHelp(help));
  help.addEventListener('mouseleave', ar2HideMetricHelp);
  help.addEventListener('focusin', () => ar2ShowMetricHelp(help));
  help.addEventListener('focusout', ar2HideMetricHelp);
});
ar2Page.addEventListener('keydown', event => { if (event.key === 'Escape') ar2HideMetricHelp(); });
window.addEventListener('resize', ar2HideMetricHelp);
window.addEventListener('scroll', ar2HideMetricHelp, true);
