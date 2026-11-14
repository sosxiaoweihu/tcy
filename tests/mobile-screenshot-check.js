(() => {
  const frame=document.getElementById('preview'),run=document.getElementById('run'),summary=document.getElementById('summary'),results=document.getElementById('results');
  const settle=()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  let loaded=false,completed=false;
  frame.src=`../index.html?screenshot-check=1&run=${Date.now()}`;
  frame.addEventListener('load',()=>{loaded=true;run.disabled=false;summary.textContent='准备完成';if(new URLSearchParams(location.search).get('autorun')==='1')run.click();});
  run.addEventListener('click',async()=>{
    if(completed){location.reload();return;}
    if(!loaded||run.disabled)return;
    run.disabled=true;results.replaceChildren();
    const app=frame.contentWindow,doc=app.document,$=s=>doc.querySelector(s);
    const click=s=>{const button=$(s);if(!button)throw new Error(`缺少测试入口：${s}`);button.click();};
    const tool=async entry=>{click('[data-app-tab="tools"]');await settle();click(entry);await settle();};
    const cases=[
      ['全部工具',async()=>{if($('[data-app-tab="home"]'))throw new Error('已移除的 App首页 不应出现');if(!$('#tongchengAppScreen').src.endsWith('/retail-union-tools.png'))throw new Error('首次进入 App 应直接显示全部工具');click('[data-app-tab="tools"]');}],
      ['同城商品监控总览',async()=>{await tool('#openProductMonitor');if(app.getTongchengAppScreenshotTarget().id!=='productMonitorPage'||$('[data-pm-product="cola"]').textContent.indexOf('可乐 500ml')<0)throw new Error('未打开商品监控总览');}],
      ['同城商品监控统计规则',async()=>{
        click('[data-pm-action="help"]');
        const rules = $('#pmSheetBody .pm-rules');
        if ($('#pmOverlay').hidden || $('#pmSheetTitle').textContent !== '统计规则说明' ||
            rules.querySelectorAll('h3').length !== 3 || rules.querySelectorAll('dt').length !== 8) throw new Error('统计规则弹层内容不完整');
      }],
      ['同城商品监控明细下滑分页',async()=>{
        click('#pmOverlay .pm-sheet [data-pm-action="dismiss"]');
        const scroll = $('#productMonitorPage .pm-scroll');
        const rows = $('#pmRows');
        if (rows.children.length !== 10 || $('#productMonitorPage .pm-all')) throw new Error('明细首批应显示 10 条');
        scroll.scrollTop = scroll.scrollHeight;
        await settle();
        const ids = [...rows.children].map(row => row.dataset.pmProduct);
        if (ids.length !== 16 || new Set(ids).size !== ids.length) throw new Error('下滑未正确追加剩余明细');
        scroll.scrollTop = scroll.scrollHeight;
        await settle();
      }],
      ['同城商品监控门店底部弹层',async()=>{
        $('#productMonitorPage .pm-scroll').scrollTop = 0;
        click('[data-pm-filter="store"]');
        click('[data-pm-format="恺源"]');
        if (!$('[data-pm-action="confirm-store"]').disabled) throw new Error('无可选门店时应禁止确认');
        click('[data-pm-format="大卖场"]');
        click('[data-pm-store-option="家得福黄浦银都城店"]');
        if ($('#pmStoreValue').textContent !== '经开万达店') throw new Error('确认前不应更新当前门店');
        await settle();
        await Promise.allSettled($('#pmStoreDialog').getAnimations().map(animation => animation.finished));
      }],
      ['同城商品监控日期下拉',async()=>{
        click('#pmStoreDialog [data-pm-action="cancel-store"]');
        if ($('#pmStoreValue').textContent !== '经开万达店' || $('#pmPeriodValue').textContent !== '昨日') throw new Error('门店或日期默认选项不正确');
        click('[data-pm-filter="period"]');
        const options = [...doc.querySelectorAll('#pmFilterMenu button')];
        if ($('#pmFilterMenu').hidden || options.map(button => button.textContent).join('、') !== '昨日、近七天' || options[0].getAttribute('aria-pressed') !== 'true') throw new Error('日期选项或默认勾选不正确');
      }],
      ['同城商品监控渠道下拉',async()=>{
        click('[data-pm-value="week"]');
        if ($('#pmPeriodValue').textContent !== '近七天') throw new Error('近七天未选中');
        click('[data-pm-filter="period"]');
        click('[data-pm-value="yesterday"]');
        click('[data-pm-filter="channel"]');
        const options = [...doc.querySelectorAll('#pmFilterMenu button')];
        if ($('#pmFilterMenu').hidden || options.map(button => button.textContent).join('、') !== '全部渠道、美团外卖、淘宝闪购、抖店、京东秒送' || options[0].getAttribute('aria-pressed') !== 'true') throw new Error('渠道选项或默认勾选不正确');
      }],
      ['同城商品监控筛选明细',async()=>{
        click('[data-pm-value="美团外卖"]');
        click('[data-pm-status="off"]');
        const rows = [...doc.querySelectorAll('#pmAllRows .pm-row')];
        if ($('#pmAllDetails').hidden || rows[0]?.dataset.pmProduct !== 'cola' ||
            rows.some(row => row.querySelector('.pm-channel-name')?.textContent !== '美团外卖' || !row.querySelector('.pm-badge[data-pm-status="off"]'))) throw new Error('渠道及状态筛选未生效');
      }],
      ['同城商品监控SKU下载菜单',async()=>{
        click('[data-pm-action="back"]');
        click('#pmSkuMore');
        if ($('#pmSkuActions').hidden || $('[data-pm-action="download-sku"]').textContent !== '下载') throw new Error('未展开监控 SKU 下载菜单');
      }],
      ['同城商品监控下架明细下载菜单',async()=>{
        click('#pmOverview [aria-controls="pmOverviewDownload"]');
        $('#pmRows .pm-row').scrollIntoView({block:'center'});
        const title = $('#pmRows .pm-row-copy strong');
        if ($('#pmOverviewDownload').hidden || title.scrollWidth <= title.clientWidth ||
            $('#pmRows .pm-channel-name').textContent !== '美团外卖') throw new Error('下载菜单、商品名称省略或渠道文字显示异常');
      }],
      ['同城商品管理',async()=>tool('#openCityProducts')],
      ['商品搜索结果',async()=>{const form=$('.cp-search');form.querySelector('input').value='番茄';form.dispatchEvent(new app.Event('submit',{bubbles:true,cancelable:true}));}],
      ['批量管理全选',async()=>{click('[data-cp-back]');click('[data-cp-batch]');click('[data-cp-all]');}],
      ['商品详情开关上架',async()=>click('[data-cp-detail="1"]')],
      ['商品详情临时下架',async()=>click('[data-cp-detail-pause]')],
      ['同城商品档案列表',async()=>tool('#openProductRecord')],
      ['同城商品档案详情',async()=>click('[data-product-record-product]')],
      ['评价列表含星级及图片',async()=>tool('#openOrderReviews')],
      ['IM消息列表',async()=>tool('#openImMessage')],
      ['IM会话详情',async()=>click('[data-im-conversation]')],
      ['三方订单列表',async()=>tool('#openThirdPartyOrder')],
      ['三方订单返图',async()=>click('[data-open-third-party-photo]')]
    ];
    let passed=0;
    try{
      click('[data-nav="同城App"]');await settle();
      for(const [name,prepare] of cases){
        const section=document.createElement('section');section.className='case';
        const copy=document.createElement('div'),title=document.createElement('h2'),status=document.createElement('p');title.textContent=name;copy.append(title,status);section.append(copy);results.append(section);
        summary.textContent=`正在检查：${name}`;
        try{
          await prepare();await settle();
          const target=app.getTongchengAppScreenshotTarget(),rect=target.getBoundingClientRect();
          if(!rect.width||!rect.height)throw new Error('截图目标不可见');
          const blob=await app.createTongchengAppScreenshot(target);
          if(blob.type!=='image/png'||blob.size<1000)throw new Error(`PNG 无效：${blob.type}，${blob.size}字节`);
          const bitmap=await createImageBitmap(blob);
          const width=bitmap.width,height=bitmap.height;
          if(Math.abs(width-rect.width*2)>3||Math.abs(height-rect.height*2)>3)throw new Error(`尺寸异常：${width}×${height}，目标${rect.width}×${rect.height}`);
          if(height/width<1.8||height/width>2.4)throw new Error('截图包含手机外内容或被截断');
          const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);bitmap.close();
          const pixels=ctx.getImageData(0,0,width,height).data,colors=new Set();let opaque=0;
          for(let i=0;i<pixels.length;i+=64){if(pixels[i+3]>200)opaque++;colors.add(`${pixels[i]>>4},${pixels[i+1]>>4},${pixels[i+2]>>4}`);}
          if(colors.size<20||opaque<width*height/64)throw new Error('图片为空白或主要内容透明');
          const dataUrl=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(blob);});
          const image=document.createElement('img');image.alt=`${name}实际生成PNG`;image.src=dataUrl;section.append(image);
          const link=document.createElement('a');link.href=dataUrl;link.download=`${name}.png`;link.textContent='下载实际 PNG';copy.append(link);
          status.className='pass';status.textContent=`通过 · ${width}×${height} · ${blob.size}字节 · ${colors.size}种采样颜色`;passed++;
        }catch(error){status.className='fail error';status.textContent=`失败：${error.stack||error.message||error}`;}
        summary.textContent=`已检查${results.children.length}/${cases.length}，通过${passed}项`;
      }
      summary.className=passed===cases.length?'pass':'fail';summary.textContent=`${passed===cases.length?'全部通过':'存在失败'}：${passed}/${cases.length} 项真实 PNG 检查通过`;
    }catch(error){summary.className='fail';summary.textContent=error.stack||error.message;}
    finally{completed=true;run.disabled=false;run.textContent="重新检查";}
  });
})();
