(()=>{
  'use strict';

  const $=id=>document.getElementById(id);
  const clean=text=>String(text||'').replace(/\s+/g,' ').trim();
  const hasValue=id=>{const el=$(id);return !!el&&String(el.value??'').trim()!==''};

  function toast(text){
    const el=$('toast');
    if(!el)return;
    el.textContent=text;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),1800);
  }

  function refreshReportData(){
    const retirement=['age','retireAge','laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears'];
    const gap=['desiredSpend','otherIncome','inflationRate'];
    const reserve=['currentReserve','monthlyReserve','reserveRate'];
    if(retirement.some(hasValue))$('calcIncome')?.click();
    if(gap.some(hasValue))$('calcGap')?.click();
    if(reserve.some(hasValue))$('calcReserve')?.click();
  }

  function collectReport(){
    const summary=$('summaryContent');
    const sections=[...summary.querySelectorAll('.summary-section')].map(section=>({
      title:clean(section.querySelector('h3')?.textContent),
      lines:[...section.querySelectorAll('li')].map(li=>clean(li.textContent)).filter(Boolean)
    })).filter(section=>section.title||section.lines.length);
    if(!sections.length){
      const text=clean(summary.textContent);
      if(text)sections.push({title:'目前整理',lines:[text]});
    }

    const disclaimer=document.querySelector('.disclaimer');
    const disclaimerTitle=clean(disclaimer?.querySelector('h3')?.textContent)||'重要說明與免責聲明';
    const disclaimerLines=[...document.querySelectorAll('.disclaimer p')].map(p=>clean(p.textContent)).filter(Boolean);
    const name=clean($('clientName')?.value)||'試算';
    const meta=clean($('printMeta')?.textContent)||`${new Date().toLocaleDateString('zh-TW')}｜依目前已提供資料整理，僅供試算參考`;
    return {name,meta,sections,disclaimerTitle,disclaimerLines};
  }

  function wrapText(ctx,text,maxWidth){
    const source=clean(text);
    if(!source)return [''];
    const lines=[];
    let line='';
    for(const ch of source){
      const next=line+ch;
      if(line&&ctx.measureText(next).width>maxWidth){
        lines.push(line);
        line=ch;
      }else{
        line=next;
      }
    }
    if(line)lines.push(line);
    return lines;
  }

  function makeReportCanvases(report){
    const W=1240,H=1754,M=92,contentW=W-M*2;
    const pages=[];
    let canvas,ctx,y,pageNo=0;

    function newPage(){
      canvas=document.createElement('canvas');
      canvas.width=W;canvas.height=H;
      ctx=canvas.getContext('2d',{alpha:false});
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,W,H);
      ctx.textBaseline='top';
      pageNo+=1;
      y=82;
      if(pageNo===1){
        ctx.fillStyle='#9b5d51';ctx.fillRect(M,y,58,6);y+=24;
        ctx.fillStyle='#352d29';ctx.font='700 48px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
        ctx.fillText('未來生活試算重點',M,y);y+=66;
        ctx.fillStyle='#766a64';ctx.font='400 24px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
        wrapText(ctx,report.meta,contentW).forEach(line=>{ctx.fillText(line,M,y);y+=34});
        y+=22;
        ctx.fillStyle='#e6ddd6';ctx.fillRect(M,y,contentW,2);y+=34;
      }else{
        ctx.fillStyle='#6e625c';ctx.font='600 22px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
        ctx.fillText('未來生活試算重點',M,y);y+=36;
        ctx.fillStyle='#ece5df';ctx.fillRect(M,y,contentW,2);y+=30;
      }
      pages.push(canvas);
    }

    function ensureSpace(height){
      if(y+height>H-105)newPage();
    }

    function drawSection(section){
      const bodyFont='400 25px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
      const lineHeight=39;
      ctx.font=bodyFont;
      const wrapped=section.lines.map(line=>wrapText(ctx,line,contentW-44));
      const estimated=48+wrapped.reduce((sum,lines)=>sum+lines.length*lineHeight+14,0)+22;
      ensureSpace(Math.min(estimated,520));

      ctx.fillStyle='#9b5d51';ctx.font='700 31px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
      ctx.fillText(section.title||'試算整理',M,y);y+=47;
      ctx.fillStyle='#3f3733';ctx.font=bodyFont;
      for(const lines of wrapped){
        ensureSpace(lines.length*lineHeight+24);
        ctx.fillStyle='#9b5d51';ctx.beginPath();ctx.arc(M+8,y+14,5,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='#3f3733';
        lines.forEach((line,i)=>{ctx.fillText(line,M+30,y+i*lineHeight);});
        y+=lines.length*lineHeight+14;
      }
      y+=13;
      ctx.fillStyle='#eee7e2';ctx.fillRect(M,y,contentW,1);y+=30;
    }

    function drawDisclaimer(){
      ensureSpace(120);
      ctx.fillStyle='#5d514b';ctx.font='700 27px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
      ctx.fillText(report.disclaimerTitle,M,y);y+=44;
      ctx.font='400 19px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
      const lineHeight=31;
      for(const paragraph of report.disclaimerLines){
        const lines=wrapText(ctx,paragraph,contentW);
        ensureSpace(lines.length*lineHeight+22);
        ctx.fillStyle='#6d625d';
        lines.forEach((line,i)=>ctx.fillText(line,M,y+i*lineHeight));
        y+=lines.length*lineHeight+18;
      }
    }

    newPage();
    report.sections.forEach(drawSection);
    drawDisclaimer();

    pages.forEach((page,index)=>{
      const c=page.getContext('2d');
      c.fillStyle='#9a8e88';c.font='400 17px -apple-system,BlinkMacSystemFont,"PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif';
      c.textAlign='right';
      c.fillText(`${index+1} / ${pages.length}`,W-M,H-58);
      c.textAlign='left';
      c.fillText('未來生活試算｜僅供試算與溝通參考',M,H-58);
    });
    return pages;
  }

  function dataUrlToBytes(dataUrl){
    const base64=dataUrl.slice(dataUrl.indexOf(',')+1);
    const binary=atob(base64);
    const bytes=new Uint8Array(binary.length);
    for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);
    return bytes;
  }

  function buildPdf(canvases){
    const images=canvases.map(canvas=>({
      width:canvas.width,
      height:canvas.height,
      bytes:dataUrlToBytes(canvas.toDataURL('image/jpeg',0.90))
    }));
    const encoder=new TextEncoder();
    const chunks=[];let length=0;
    const pushBytes=bytes=>{chunks.push(bytes);length+=bytes.length};
    const push=text=>pushBytes(encoder.encode(text));
    const objectCount=2+images.length*3;
    const offsets=new Array(objectCount+1).fill(0);
    const startObj=n=>{offsets[n]=length;push(`${n} 0 obj\n`)};

    push('%PDF-1.4\n% Future Life Calculator\n');
    startObj(1);push('<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
    const kids=images.map((_,i)=>`${3+i*3} 0 R`).join(' ');
    startObj(2);push(`<< /Type /Pages /Kids [${kids}] /Count ${images.length} >>\nendobj\n`);

    images.forEach((image,i)=>{
      const pageObj=3+i*3,imgObj=4+i*3,contentObj=5+i*3,name=`Im${i+1}`;
      startObj(pageObj);
      push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /${name} ${imgObj} 0 R >> >> /Contents ${contentObj} 0 R >>\nendobj\n`);

      startObj(imgObj);
      push(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.bytes.length} >>\nstream\n`);
      pushBytes(image.bytes);
      push('\nendstream\nendobj\n');

      const stream=`q\n595.28 0 0 841.89 0 0 cm\n/${name} Do\nQ\n`;
      startObj(contentObj);
      push(`<< /Length ${encoder.encode(stream).length} >>\nstream\n${stream}endstream\nendobj\n`);
    });

    const xref=length;
    push(`xref\n0 ${objectCount+1}\n`);
    push('0000000000 65535 f \n');
    for(let i=1;i<=objectCount;i++)push(`${String(offsets[i]).padStart(10,'0')} 00000 n \n`);
    push(`trailer\n<< /Size ${objectCount+1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`);
    return new Blob(chunks,{type:'application/pdf'});
  }

  function safeFileName(name){
    return (name||'試算').replace(/[\\/:*?"<>|]/g,'-').replace(/\s+/g,' ').trim().slice(0,40)||'試算';
  }

  function downloadBlob(blob,fileName){
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=fileName;a.rel='noopener';
    document.body.appendChild(a);a.click();a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),3000);
  }

  function installDirectPdf(){
    const old=$('printBtn');
    if(!old||old.dataset.directPdf==='1')return;
    const btn=old.cloneNode(true);
    btn.dataset.directPdf='1';
    btn.textContent='產生 PDF';
    old.replaceWith(btn);

    btn.addEventListener('click',()=>{
      try{
        refreshReportData();
        const report=collectReport();
        const pages=makeReportCanvases(report);
        const pdf=buildPdf(pages);
        const fileName=`${safeFileName(report.name)}-未來生活試算.pdf`;
        const file=typeof File!=='undefined'?new File([pdf],fileName,{type:'application/pdf'}):null;
        const touchDevice=(navigator.maxTouchPoints||0)>0;
        if(touchDevice&&file&&navigator.share&&navigator.canShare?.({files:[file]})){
          navigator.share({title:'未來生活試算',files:[file]}).then(()=>toast('PDF 已產生')).catch(err=>{
            if(err?.name!=='AbortError'){
              downloadBlob(pdf,fileName);
              toast('PDF 已下載');
            }
          });
        }else{
          downloadBlob(pdf,fileName);
          toast('PDF 已產生');
        }
      }catch(error){
        console.error('PDF generation failed',error);
        toast('PDF 產生失敗，請重新整理後再試');
      }
    });
  }

  installDirectPdf();
})();
