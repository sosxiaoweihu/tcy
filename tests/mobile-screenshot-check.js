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
      ['同城商品监控筛选明细',async()=>{click('[data-pm-filter="channel"]');click('[data-pm-value="美团"]');click('[data-pm-status="off"]');if($('#pmAllDetails').hidden||$('#pmAllRows .pm-row')?.dataset.pmProduct!=='cola'||$('#pmAllRows').children.length!==1)throw new Error('渠道及状态筛选未生效');}],
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
