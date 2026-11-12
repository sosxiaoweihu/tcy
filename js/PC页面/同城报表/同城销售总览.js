// 表格和指标取自用户提供的 HTML 快照；不加载参考页面的脚本或远端服务。
const sovSource = {"channel": {"headers": ["序号", "渠道", "占比", "销售金额", "订单数", "客单价", "佣金+履约服务费", "优惠金额", "配送费"], "rows": [["1", "饿了么", "38.77%", "1005.13", "27", "37.23", "127.92", "346.52", "123"], ["2", "美团外卖", "61.23%", "1587.44", "34", "46.69", "197.01", "292.86", "155.5"]]}, "store": {"headers": ["序号", "门店名称", "销售金额", "订单数", "客单价", "环比"], "rows": [["1", "鹏泰百货南康一店", "1097.75", "22", "49.9", "0.00%"], ["2", "鹏泰超市南康三店", "780.32", "19", "41.07", "0.00%"], ["3", "鹏泰百货南康二店", "298.82", "8", "37.35", "0.00%"], ["4", "鹏泰超市塔坳店", "231.55", "7", "33.08", "0.00%"], ["5", "鹏泰百货上犹店", "184.13", "5", "36.83", "0.00%"]]}, "category": {"headers": ["序号", "品类", "销售金额", "订单数", "环比"], "rows": [["1", "生鲜", "2171.78", "296", "0.00%"], ["2", "食品", "701.25", "41", "0.00%"], ["3", "用品", "114.77", "4", "0.00%"], ["4", "专柜", "3.4", "1", "0.00%"]]}, "product": {"headers": ["序号", "商品", "销售金额", "销售数量", "环比"], "rows": [["1", "精品排骨 300g 新鲜", "266.01", "19", "0.00%"], ["2", "牛里脊肉 300g 新鲜", "204.35", "6", "0.00%"], ["3", "前腿瘦肉 400g 新鲜", "136.42", "13", "0.00%"], ["4", "基围虾 400g 新鲜", "91.78", "3", "0.00%"], ["5", "五花肉 600g 新鲜", "76.14", "6", "0.00%"], ["6", "白壳鸡蛋（板）", "75.45", "4", "0.00%"], ["7", "超能植愈香氛天然皂粉(带嘴)1.38kg", "71.6", "2", "0.00%"], ["8", "牛肉 吊龙 250g 新鲜", "60.52", "2", "0.00%"], ["9", "康师傅 经典红烧牛肉面 113g/桶", "59.52", "12", "0.00%"], ["10", "中粮福临门 丝苗米 5kg/袋", "58.6", "1", "0.00%"], ["11", "金元宝 优选丝苗米 10kg/袋", "55.1", "1", "0.00%"], ["12", "鲈鱼 400g 新鲜", "49.62", "3", "0.00%"], ["13", "麻鸭 800g 新鲜", "45.21", "2", "0.00%"]]}};
const sovPage = document.getElementById('salesOverviewPage');
const sovEl = id => document.getElementById(id);
const sovEscape = value => String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const sovDefaultRange = () => ({start:'2026-11-10',end:'2026-11-10',period:'今日'});
const sovState = {ranges:{Query:sovDefaultRange(),Compare:sovDefaultRange()},applied:{channel:'',store:'',query:sovDefaultRange(),compare:sovDefaultRange()},panels:Object.fromEntries(Object.keys(sovSource).map(key=>[key,{page:1,size:key==='product'?10:20,sort:-1,direction:1}])),calendarKey:'Query'};
const sovWidths={channel:[64,115,90,120,90,100,170,120,100],store:[64,210,120,90,100,100],category:[64,140,120,90,100],product:[64,300,120,100,100]};
function sovToast(message){const el=sovEl('sovToast');el.textContent=message;el.hidden=false;clearTimeout(sovToast.timer);sovToast.timer=setTimeout(()=>el.hidden=true,2500);}
function sovSnapshotAvailable(){const r=sovState.applied.query;return r.start==='2026-11-10'&&r.end==='2026-11-10';}
function sovPanelRows(key){
  if(!sovSnapshotAvailable())return [];
  const {channel,store}=sovState.applied;
  if(channel&&store)return [];
  if(key==='channel')return store?[]:sovSource.channel.rows.filter(row=>!channel||row[1]===channel).map(row=>channel?[row[0],row[1],'100.00%',...row.slice(3)]:row);
  if(key==='store')return channel?[]:sovSource.store.rows.filter(row=>!store||row[1]===store);
  return channel||store?[]:sovSource[key].rows;
}
function sovPanelSorted(key){
  const rows=sovPanelRows(key).map(row=>[...row]),state=sovState.panels[key];
  if(state.sort>=0)rows.sort((a,b)=>(parseFloat(a[state.sort])-parseFloat(b[state.sort]))*state.direction);
  return rows;
}
function sovMetricValues(){
  const {channel,store,compare}=sovState.applied;
  if(!sovSnapshotAvailable()||(channel&&store))return {};
  const comparable=compare.start==='2026-11-10'&&compare.end==='2026-11-10';
  if(!channel&&!store)return {sales:'2592.57',orders:'61',average:'42.50',refund:'-11.90',total:'3624.50',fee:'324.93',discount:'639.38',refundOrders:'2',merchant:'428.50',platform:'210.88',ratio:comparable?'0.00%':'—'};
  if(channel){const row=sovPanelRows('channel')[0];if(!row)return {};return {sales:row[3],orders:row[4],average:row[5],fee:row[6],discount:row[7],ratio:comparable?'0.00%':'—'};}
  const row=sovPanelRows('store')[0];return row?{sales:row[2],orders:row[3],average:row[4],ratio:comparable?'0.00%':'—'}:{};
}
function sovRenderMetrics(){
  const values=sovMetricValues();
  ['sales','orders','average','refund','total','fee','discount','refundOrders'].forEach(key=>sovEl('sovMetric_'+key).textContent=values[key]===undefined?'—':['orders','refundOrders'].includes(key)?values[key]:Number(values[key]).toFixed(2));
  sovPage.querySelectorAll('[data-sov-ratio]').forEach(el=>el.textContent=values[el.dataset.sovRatio]===undefined?'—':values.ratio||'—');
  sovEl('sovMerchantDiscount').textContent=values.merchant||'—';sovEl('sovPlatformDiscount').textContent=values.platform||'—';
}
function sovRenderPanel(key){
  const source=sovSource[key],state=sovState.panels[key],rows=sovPanelSorted(key),max=Math.max(1,Math.ceil(rows.length/state.size));state.page=Math.max(1,Math.min(max,state.page));
  const head=sovEl('sov'+key+'Head'),table=head.closest('table');table.style.minWidth=sovWidths[key].reduce((n,w)=>n+w,0)+'px';
  head.innerHTML='<tr>'+source.headers.map((title,i)=>`<th scope="col" style="width:${sovWidths[key][i]}px" aria-sort="${state.sort===i?(state.direction===1?'ascending':'descending'):'none'}">${i>1?`<button type="button" data-sov-sort="${key}:${i}" aria-label="${sovEscape(sovEl('sov'+key+'Title').textContent)}按${sovEscape(title)}排序">${sovEscape(title)} <span aria-hidden="true">${state.sort===i?(state.direction===1?'↑':'↓'):'↕'}</span></button>`:sovEscape(title)}</th>`).join('')+'</tr>';
  sovEl('sov'+key+'Rows').innerHTML=rows.slice((state.page-1)*state.size,state.page*state.size).map(row=>'<tr>'+row.map((value,i)=>`<td class="${i===1?'sov-text':''}" title="${sovEscape(value)}">${sovEscape(value)}</td>`).join('')+'</tr>').join('')||`<tr><td colspan="${source.headers.length}" class="sov-empty">暂无符合条件的数据</td></tr>`;
  sovEl('sov'+key+'Count').textContent=`共 ${rows.length} 条`;
  sovEl('sov'+key+'Pagination').innerHTML=`<span>共 ${rows.length} 条</span><button type="button" data-sov-page="${key}:${state.page-1}" aria-label="${sovEl('sov'+key+'Title').textContent}上一页" ${state.page===1?'disabled':''}>‹</button>${Array.from({length:max},(_,i)=>`<button type="button" data-sov-page="${key}:${i+1}" ${state.page===i+1?'aria-current="page"':''}>${i+1}</button>`).join('')}<button type="button" data-sov-page="${key}:${state.page+1}" aria-label="${sovEl('sov'+key+'Title').textContent}下一页" ${state.page===max?'disabled':''}>›</button><label>前往 <input type="number" data-sov-jump="${key}" value="${state.page}" min="1" max="${max}" aria-label="${sovEl('sov'+key+'Title').textContent}跳转页码" /> 页</label>`;
}
function sovSvg(width,label,content){return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} 300" role="img" aria-label="${sovEscape(label)}"><title>${sovEscape(label)}</title>${content}</svg>`;}
function sovLegend(x,y,color,label){return `<rect x="${x}" y="${y-10}" width="16" height="10" rx="2" fill="${color}"/><text x="${x+23}" y="${y}">${label}</text>`;}
function sovEmptyChart(id){sovEl(id).innerHTML='<div class="sov-empty">暂无当前筛选条件的图表数据</div>';}
function sovRenderCharts(){
  if(sovPage.hidden)return;
  const a=sovState.applied,values=sovMetricValues(),baseline=sovSnapshotAvailable()&&!a.channel&&!a.store&&a.query.start==='2026-11-10'&&a.query.end==='2026-11-10'&&a.compare.start==='2026-11-10'&&a.compare.end==='2026-11-10';
  let width=Math.max(280,sovEl('sovHourlyChart').clientWidth),plotWidth=width-56,plotHeight=210;
  if(baseline){
    // 曲线绘图区来自原 HTML 保存的画布，不补造无法从快照取得的逐时订单数据。
    const axes=Array.from({length:6},(_,i)=>`<text x="34" y="${45+i*42}" text-anchor="end">${800-i*200}</text>`).join('');
    const hours=Array.from({length:9},(_,i)=>i===8?23:i*3).map(hour=>`<text x="${43+hour/23*(plotWidth-14)}" y="278" text-anchor="middle">${hour}</text>`).join('');
    sovEl('sovHourlyChart').innerHTML=sovSvg(width,'当期与环期：2026-11-10逐时趋势',sovLegend(Math.max(42,width/2-90),18,'#3385ff','当期')+sovLegend(Math.max(132,width/2),18,'#38c9ac','环期')+axes+`<svg x="40" y="40" width="${plotWidth}" height="${plotHeight}" viewBox="120 60 948 510" preserveAspectRatio="none"><image href="./assets/sales-overview-hourly-reference.png" width="1188" height="630"/></svg>`+hours);
  }else sovEmptyChart('sovHourlyChart');
  width=Math.max(280,sovEl('sovDailyChart').clientWidth);plotWidth=width-90;plotHeight=210;
  if(values.sales!==undefined){
    const sales=Number(values.sales),orders=Number(values.orders),salesMax=Math.max(500,Math.ceil(sales/500)*500),orderMax=baseline?120:Math.max(20,Math.ceil(orders/20)*20),barWidth=Math.min(180,plotWidth*.26);
    let content=sovLegend(width/2-110,18,'#3385ff','销售金额')+sovLegend(width/2+10,18,'#38c9ac','销售笔数');
    for(let i=0;i<=6;i++){const y=40+i*plotHeight/6;content+=`<line x1="45" y1="${y}" x2="${width-45}" y2="${y}" stroke="var(--color-border-default)"/><text x="38" y="${y+4}" text-anchor="end">${Math.round(salesMax*(1-i/6)).toLocaleString('en-US')}</text><text x="${width-38}" y="${y+4}">${Math.round(orderMax*(1-i/6))}</text>`;}
    content+=`<rect x="${45+plotWidth*.3-barWidth/2}" y="${250-sales/salesMax*plotHeight}" width="${barWidth}" height="${sales/salesMax*plotHeight}" fill="#3385ff"><title>销售金额：${sales.toFixed(2)}</title></rect><rect x="${45+plotWidth*.7-barWidth/2}" y="${250-orders/orderMax*plotHeight}" width="${barWidth}" height="${orders/orderMax*plotHeight}" fill="#38c9ac"><title>销售笔数：${orders}</title></rect><text x="${width/2}" y="280" text-anchor="middle">2026-11-10</text>`;
    sovEl('sovDailyChart').innerHTML=sovSvg(width,`销售金额 ${sales.toFixed(2)}；销售笔数 ${orders}`,content);
  }else sovEmptyChart('sovDailyChart');
  const channelRows=sovPanelRows('channel');width=Math.max(280,sovEl('sovChannelChart').clientWidth);
  if(channelRows.length){
    const total=channelRows.reduce((n,row)=>n+Number(row[3]),0),cx=width/2,cy=155,r=86;let angle=-Math.PI/2,content='';
    channelRows.forEach((row,i)=>{
      const color=i===0?'#3385ff':'#38c9ac',fraction=Number(row[3])/total,end=angle+fraction*Math.PI*2;
      content+=sovLegend(Math.max(10,cx-104)+i*120,18,color,row[1]);
      if(channelRows.length===1)content+=`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${color}"><title>${row[1]}：100.00%</title></circle>`;
      else content+=`<path d="M ${cx} ${cy} L ${cx+r*Math.cos(angle)} ${cy+r*Math.sin(angle)} A ${r} ${r} 0 ${fraction>.5?1:0} 1 ${cx+r*Math.cos(end)} ${cy+r*Math.sin(end)} Z" fill="${color}"><title>${row[1]}：${(fraction*100).toFixed(2)}%</title></path>`;
      content+=`<text x="${cx}" y="${270+i*19}" text-anchor="middle">${row[1]} ${(fraction*100).toFixed(2)}%</text>`;angle=end;
    });sovEl('sovChannelChart').innerHTML=sovSvg(width,'渠道销售占比',content);
  }else sovEmptyChart('sovChannelChart');
}
function sovRender(){sovRenderMetrics();Object.keys(sovSource).forEach(sovRenderPanel);sovRenderCharts();}
function openSalesOverviewPage(shouldAddTab=true){
  if(shouldAddTab)addOrActivateTab('同城销售总览');leaveTongchengAppPage();leaveCustomTaskPage();document.body.classList.remove('unified-category-mode');unifiedCategorySidebar.hidden=true;
  [...sovPage.parentElement.children].forEach(el=>{if(el.tagName==='SECTION')el.hidden=el!==sovPage;});
  sovPage.hidden=false;pageTabs.hidden=false;tongchengMenu.hidden=true;interfaceMenu.hidden=true;legacyMenu.hidden=true;
  document.querySelectorAll('#tongchengMenu [data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page==='同城销售总览'));
  document.querySelectorAll('.side-nav [data-nav]').forEach(button=>button.classList.toggle('active',button.dataset.nav==='同城'));sovRender();
}
function sovDateString(date){return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
function sovSetPeriod(key,period){
  const today=new Date(2026,10,10,12),start=new Date(today),end=new Date(today),weekday=(today.getDay()+6)%7;
  if(period==='昨天'){start.setDate(today.getDate()-1);end.setDate(today.getDate()-1);}
  if(period==='本周')start.setDate(today.getDate()-weekday);
  if(period==='上周'){start.setDate(today.getDate()-weekday-7);end.setDate(today.getDate()-weekday-1);}
  if(period==='本月')start.setDate(1);
  if(period==='上月'){start.setMonth(today.getMonth()-1,1);end.setDate(0);}
  if(period==='本年')start.setMonth(0,1);
  sovState.ranges[key]={start:sovDateString(start),end:sovDateString(end),period};sovUpdateDates();
}
function sovUpdateDates(){for(const key of ['Query','Compare']){const r=sovState.ranges[key];sovEl('sov'+key+'Range').textContent=`${r.start} — ${r.end}`;sovEl('sov'+key+'Period').value=r.period;}}
let sovCalendarMonth=new Date(2026,9,1,12),sovDraftStart='',sovDraftEnd='';
function sovCloseCalendar(){sovEl('sovCalendar').hidden=true;for(const key of ['Query','Compare'])sovEl('sov'+key+'Range').setAttribute('aria-expanded','false');sovUpdateDates();}
function sovOpenCalendar(key){
  sovState.calendarKey=key;const r=sovState.ranges[key];sovDraftStart=r.start;sovDraftEnd=r.end;sovCalendarMonth=new Date(r.start+'T12:00:00');sovCalendarMonth.setDate(1);sovCalendarMonth.setMonth(sovCalendarMonth.getMonth()-1);
  sovEl('sovCalendarTitle').textContent=key==='Query'?'选择查询时间':'选择对比时间';sovEl('sovCalendar').hidden=false;sovEl('sov'+key+'Range').setAttribute('aria-expanded','true');sovRenderCalendar();
}
function sovRenderCalendar(){
  sovEl('sovMonths').innerHTML=[0,1].map(offset=>{const month=new Date(sovCalendarMonth.getFullYear(),sovCalendarMonth.getMonth()+offset,1,12),year=month.getFullYear(),m=month.getMonth(),empty=(month.getDay()+6)%7,days=new Date(year,m+1,0).getDate();return `<div class="sov-month"><h3>${year}年 ${m+1}月</h3><div class="sov-days">${['一','二','三','四','五','六','日'].map(d=>`<span>${d}</span>`).join('')}${'<span></span>'.repeat(empty)}${Array.from({length:days},(_,i)=>{const date=sovDateString(new Date(year,m,i+1,12)),selected=date===sovDraftStart||date===sovDraftEnd;return `<button type="button" data-sov-date="${date}" aria-label="${date}" aria-pressed="${selected}" class="${selected?'sov-selected':sovDraftStart&&sovDraftEnd&&date>sovDraftStart&&date<sovDraftEnd?'sov-in-range':''}">${i+1}</button>`;}).join('')}</div></div>`;}).join('');sovEl('sovDraftRange').textContent=sovDraftStart?(sovDraftEnd?`${sovDraftStart} 至 ${sovDraftEnd}`:`${sovDraftStart}，请选择结束日期`):'请选择起止日期';
}
const sovForm=sovEl('sovFilters');
sovSource.store.rows.forEach(row=>sovEl('sovStore').add(new Option(row[1],row[1])));
sovForm.addEventListener('submit',event=>{
  event.preventDefault();const form=Object.fromEntries(new FormData(sovForm));sovState.applied={...form,query:{...sovState.ranges.Query},compare:{...sovState.ranges.Compare}};
  Object.values(sovState.panels).forEach(p=>p.page=1);sovCloseCalendar();sovRender();
  sovToast(form.channel&&form.store?'当前快照暂无渠道与门店交叉明细':!sovSnapshotAvailable()?'查询完成，所选日期暂无样例数据':'查询完成，已更新当前可用样例');
});
sovForm.addEventListener('reset',()=>{
  sovState.ranges={Query:sovDefaultRange(),Compare:sovDefaultRange()};sovState.applied={channel:'',store:'',query:sovDefaultRange(),compare:sovDefaultRange()};Object.values(sovState.panels).forEach(p=>{p.page=1;p.sort=-1;p.direction=1;});sovCloseCalendar();sovRender();sovToast('已重置查询条件');
});
sovEl('sovExpand').addEventListener('click',event=>{const button=event.currentTarget,expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',expanded);button.textContent=expanded?'收起 ⌃':'展开 ⌄';sovEl('sovAdvanced').hidden=!expanded;sovCloseCalendar();});
sovForm.querySelectorAll('[data-sov-period]').forEach(select=>select.addEventListener('change',()=>{const key=select.dataset.sovPeriod;if(select.value==='自定义')sovOpenCalendar(key);else {sovSetPeriod(key,select.value);sovCloseCalendar();}}));
sovEl('sovDateCancel').addEventListener('click',sovCloseCalendar);
sovEl('sovDateConfirm').addEventListener('click',()=>{if(!sovDraftStart||!sovDraftEnd){sovToast('请选择完整的起止日期');return;}sovState.ranges[sovState.calendarKey]={start:sovDraftStart,end:sovDraftEnd,period:'自定义'};sovCloseCalendar();});
sovEl('sovRegionButton').addEventListener('click',()=>sovEl('sovRegionDialog').showModal());
sovPage.addEventListener('change',event=>{const key=event.target.dataset.sovJump;if(!key)return;const page=Number(event.target.value);if(!Number.isInteger(page)||page<1||page>Number(event.target.max)){event.target.value=sovState.panels[key].page;sovToast('请输入有效页码');return;}sovState.panels[key].page=page;sovRenderPanel(key);});
sovPage.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.dataset.sovRange)sovEl('sovCalendar').hidden||sovState.calendarKey!==button.dataset.sovRange?sovOpenCalendar(button.dataset.sovRange):sovCloseCalendar();
  if(button.dataset.sovMonth){sovCalendarMonth.setMonth(sovCalendarMonth.getMonth()+Number(button.dataset.sovMonth));sovRenderCalendar();}
  if(button.dataset.sovDate){const date=button.dataset.sovDate;if(!sovDraftStart||sovDraftEnd){sovDraftStart=date;sovDraftEnd='';}else {sovDraftEnd=date;if(date<sovDraftStart)[sovDraftStart,sovDraftEnd]=[date,sovDraftStart];}sovRenderCalendar();}
  if(button.dataset.sovPage){const [key,page]=button.dataset.sovPage.split(':');sovState.panels[key].page=Number(page);sovRenderPanel(key);}
  if(button.dataset.sovSort){const [key,index]=button.dataset.sovSort.split(':'),state=sovState.panels[key];state.direction=state.sort===Number(index)?-state.direction:1;state.sort=Number(index);state.page=1;sovRenderPanel(key);}
  if(button.dataset.sovExport){const key=button.dataset.sovExport,rows=sovPanelSorted(key);if(!rows.length){sovToast('暂无可导出的数据');return;}const csv=[sovSource[key].headers,...rows].map(row=>row.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\r\n'),url=URL.createObjectURL(new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'})),link=document.createElement('a');link.href=url;link.download='同城销售总览_'+sovEl('sov'+key+'Title').textContent+'.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);sovToast(`已导出 ${rows.length} 条${sovEl('sov'+key+'Title').textContent}数据`);}
});
document.addEventListener('click',event=>{if(!sovEl('sovCalendar').hidden&&!event.composedPath().includes(sovEl('sovCalendar'))&&!event.target.closest('[data-sov-range],[data-sov-period]'))sovCloseCalendar();});
sovPage.addEventListener('keydown',event=>{if(event.key==='Escape')sovCloseCalendar();});
new ResizeObserver(()=>sovRenderCharts()).observe(sovPage);
sovRender();
