(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const state={income:null,gap:null,reserve:null};
  const N=id=>{const el=$(id);const n=parseFloat(el?.value);return Number.isFinite(n)?n:0};
  const filled=id=>{const el=$(id);return !!el && String(el.value).trim()!==''};
  const money=n=>Number.isFinite(n)?new Intl.NumberFormat('zh-TW',{style:'currency',currency:'TWD',maximumFractionDigits:0}).format(Math.round(n)):'—';
  const pct=n=>`${Math.round(n*100)}%`;
  function toast(text){const el=$('toast');if(!el)return;el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)}
  function futureValue(principal,monthly,annualRate,years){const months=Math.max(0,years*12);const r=annualRate/12;if(months===0)return principal;if(Math.abs(r)<1e-12)return principal+monthly*months;return principal*Math.pow(1+r,months)+monthly*((Math.pow(1+r,months)-1)/r)}
  function laborInsuranceMonthly(avgSalary,years,adjustYears){const a=avgSalary*years*0.00775+3000;const b=avgSalary*years*0.0155;const base=Math.max(a,b);const adj=Math.max(-.20,Math.min(.20,adjustYears*.04));return {a,b,base,monthly:base*(1+adj),adj}}
  function laborPensionQuick(currentBalance,wage,years,employerRate,selfRate,annualReturn){const monthlyContribution=wage*(employerRate+selfRate);const projected=futureValue(currentBalance,monthlyContribution,annualReturn,years);return {monthlyContribution,projected,monthly:projected/240}}
  function nationalPensionMonthly(years,mode){const insured=21103;const a=insured*years*0.0065+4049;const b=insured*years*0.013;return {insured,a,b,monthly:mode==='b'?b:Math.max(a,b)}}

  function toggleSource(checkId,boxId){const c=$(checkId),box=$(boxId);if(!c||!box)return;const sync=()=>box.classList.toggle('off',!c.checked);c.addEventListener('change',sync);sync()}
  toggleSource('useLaborInsurance','laborInsuranceBox');toggleSource('useLaborPension','laborPensionBox');toggleSource('useNationalPension','nationalPensionBox');

  function sourceMetric(label,value,sub){
    const text=Number.isFinite(value)?money(value):'尚未估算';
    return `<div class="metric"><div class="k">${label}</div><div class="v">${text}</div><div class="s">${sub}</div></div>`;
  }

  function calcIncome(){
    const age=filled('age')?N('age'):null;
    const retireAge=filled('retireAge')?N('retireAge'):null;
    let yearsToRetire=null;
    if(age!==null && retireAge!==null){
      if(retireAge>age) yearsToRetire=retireAge-age;
      else toast('退休年齡需大於目前年齡；其他已填資料仍會先整理');
    }

    let labor=null,pension=null,national=null;
    const missing=[];

    if($('useLaborInsurance').checked){
      if(filled('laborSalary') && filled('laborYears')){
        labor=laborInsuranceMonthly(N('laborSalary'),N('laborYears'),N('laborAdjustYears')).monthly;
      }else if(filled('laborSalary') || filled('laborYears')){
        missing.push('勞保尚缺平均投保薪資或年資');
      }
    }

    if($('useLaborPension').checked){
      if(filled('pensionBalance') && filled('pensionWage') && yearsToRetire!==null){
        pension=laborPensionQuick(N('pensionBalance'),N('pensionWage'),yearsToRetire,.06,N('selfContribution')/100,N('pensionReturn')/100).monthly;
      }else if(filled('pensionBalance') || filled('pensionWage')){
        missing.push('勞退尚缺專戶、月提繳工資或退休年數');
      }
    }

    if($('useNationalPension').checked){
      if(filled('nationalYears')){
        national=nationalPensionMonthly(N('nationalYears'),$('nationalMode').value).monthly;
      }else{
        missing.push('國民年金尚缺年資');
      }
    }

    const known=[labor,pension,national].filter(Number.isFinite);
    const total=known.reduce((a,b)=>a+b,0);
    const anyInput=[age,retireAge].some(v=>v!==null) || ['laborSalary','laborYears','pensionBalance','pensionWage','nationalYears'].some(filled);
    if(!anyInput && !known.length){toast('目前還沒有可整理的退休資料');renderSummary();return}

    state.income={age,retireAge,yearsToRetire,labor,pension,national,total,knownCount:known.length,missing};
    const totalLabel=known.length?money(total):'尚未估算';
    $('incomeResult').innerHTML=`<div class="metric-grid">${sourceMetric('勞保老年年金',labor,Number.isFinite(labor)?'每月快估':'可先補薪資與年資')}${sourceMetric('勞退新制',pension,Number.isFinite(pension)?'每月方向估算':'可先補專戶、工資與退休年數')}${sourceMetric('國民年金',national,Number.isFinite(national)?'每月快估':'可先補國保年資')}</div><div class="focus"><strong>${known.length?'目前已完成項目合計：':'目前資料：'}</strong>${known.length?`每月約 <strong>${totalLabel}</strong>。`: '已保留目前填寫內容，尚不足以計算月領金額。'}${missing.length?`<br><span style="color:#8b7c75">尚未估算：${missing.join('；')}。</span>`:''}</div>`;
    $('incomeResult').classList.add('show');
    if(yearsToRetire!==null && !filled('reserveYears'))$('reserveYears').value=yearsToRetire;
    renderSummary();
  }

  function calcGap(){
    const hasSpend=filled('desiredSpend');
    const hasOther=filled('otherIncome');
    if(!hasSpend && !hasOther){toast('目前還沒有生活需求或其他收入資料');renderSummary();return}

    const desired=hasSpend?N('desiredSpend'):null;
    const other=hasOther?N('otherIncome'):0;
    const years=state.income?.yearsToRetire ?? ((filled('retireAge')&&filled('age')&&N('retireAge')>N('age'))?N('retireAge')-N('age'):null);
    const inflation=filled('inflationRate')?N('inflationRate')/100:0;
    const futureSpend=desired!==null ? ((inflation>0&&years!==null)?desired*Math.pow(1+inflation,years):desired) : null;
    const pensionIncome=state.income?.knownCount?state.income.total:null;
    const totalIncome=(pensionIncome??0)+other;
    const incomeIncomplete=!state.income || state.income.knownCount<[$('useLaborInsurance').checked,$('useLaborPension').checked,$('useNationalPension').checked].filter(Boolean).length;
    const gap=futureSpend!==null?Math.max(0,futureSpend-totalIncome):null;
    const surplus=futureSpend!==null?Math.max(0,totalIncome-futureSpend):null;
    const simple20=gap!==null?gap*240:null;
    const replacement=(futureSpend&&futureSpend>0)?totalIncome/futureSpend:null;
    state.gap={desired,futureSpend,other,pensionIncome,totalIncome,gap,surplus,simple20,replacement,inflation,incomeIncomplete};

    if(futureSpend===null){
      $('gapResult').innerHTML=`<div class="focus"><strong>目前已記錄：</strong>其他固定收入約 ${money(other)}/月。退休生活費尚未填寫，因此暫不計算生活缺口。</div>`;
    }else{
      $('gapResult').innerHTML=`<div class="metric-grid"><div class="metric"><div class="k">目前已知退休收入</div><div class="v">${money(totalIncome)}</div><div class="s">退休制度已估項目＋其他收入</div></div><div class="metric"><div class="k">退休每月需要</div><div class="v">${money(futureSpend)}</div><div class="s">${inflation>0?'已納入通膨':'以今天金額估算'}</div></div><div class="metric"><div class="k">目前可見差額</div><div class="v">${money(gap)}</div><div class="s">${replacement!==null?`收入替代約 ${pct(replacement)}`:'依目前已知資料'}</div></div></div><div class="focus">${gap>0?`依目前已知資料，20 年直算的生活差額約 <strong>${money(simple20)}</strong>。`:`依目前已知資料，退休收入大致可覆蓋設定的生活費。`}${incomeIncomplete?`<br><span style="color:#8b7c75">尚有退休收入項目未完成，因此這個差額可能還會改變。</span>`:''}</div>`;
    }
    $('gapResult').classList.add('show');renderSummary();
  }

  function calcReserve(){
    const hasCurrent=filled('currentReserve'),hasMonthly=filled('monthlyReserve'),hasYears=filled('reserveYears'),hasRate=filled('reserveRate');
    if(!hasCurrent && !hasMonthly && !hasYears && !hasRate){toast('目前還沒有未來準備資料');renderSummary();return}
    if(!hasYears || !hasRate){
      state.reserve={current:hasCurrent?N('currentReserve'):null,monthly:hasMonthly?N('monthlyReserve'):null,years:hasYears?N('reserveYears'):null,rate:hasRate?N('reserveRate')/100:null,final:null,invested:null,growth:null,target:state.gap?.simple20??null,coverage:null};
      $('reserveResult').innerHTML=`<div class="focus"><strong>目前資料已保留：</strong>${hasCurrent?`目前準備 ${money(N('currentReserve'))}`:''}${hasCurrent&&hasMonthly?'；':''}${hasMonthly?`每月準備 ${money(N('monthlyReserve'))}`:''}。要估算未來金額，再補「準備年數」與「預估年化報酬率」即可。</div>`;
      $('reserveResult').classList.add('show');renderSummary();return;
    }
    const current=hasCurrent?N('currentReserve'):0,monthly=hasMonthly?N('monthlyReserve'):0,years=N('reserveYears'),rate=N('reserveRate')/100;
    const final=futureValue(current,monthly,rate,years),invested=current+monthly*years*12,growth=final-invested;
    const target=state.gap?.simple20??null,coverage=(target&&target>0)?final/target:null;
    state.reserve={current,monthly,years,rate,final,invested,growth,target,coverage};
    $('reserveResult').innerHTML=`<div class="metric-grid"><div class="metric"><div class="k">自己累積投入</div><div class="v">${money(invested)}</div></div><div class="metric"><div class="k">期末情境估值</div><div class="v">${money(final)}</div></div><div class="metric"><div class="k">其中情境成長</div><div class="v">${money(growth)}</div><div class="s">非保證報酬</div></div></div><div class="focus">${coverage!==null?`若與前一步 20 年粗估缺口相比，目前情境約可準備到 <strong>${pct(coverage)}</strong>。`:`以年化 ${(rate*100).toFixed(1)}% 做純情境試算，${years} 年後約為 <strong>${money(final)}</strong>。`}</div>`;
    $('reserveResult').classList.add('show');renderSummary();
  }

  function renderSummary(){
    const parts=[];
    const incomeInputs=['age','retireAge','laborSalary','laborYears','pensionBalance','pensionWage','nationalYears'].some(filled);
    if(state.income || incomeInputs){
      const lines=[];
      const s=state.income;
      if(filled('age'))lines.push(`目前年齡：${N('age')} 歲。`);
      if(filled('retireAge'))lines.push(`預計退休年齡：${N('retireAge')} 歲。`);
      if(s?.yearsToRetire!==null && s?.yearsToRetire!==undefined)lines.push(`距離預計退休約 ${s.yearsToRetire} 年。`);
      if($('useLaborInsurance').checked && (filled('laborSalary')||filled('laborYears')||Number.isFinite(s?.labor))){
        const raw=[]; if(filled('laborSalary'))raw.push(`平均投保薪資 ${money(N('laborSalary'))}`); if(filled('laborYears'))raw.push(`年資 ${N('laborYears')} 年`);
        lines.push(`勞保：${Number.isFinite(s?.labor)?`月領快估約 ${money(s.labor)}`:'尚未完成估算'}${raw.length?`（${raw.join('、')}）`:''}。`);
      }
      if($('useLaborPension').checked && (filled('pensionBalance')||filled('pensionWage')||Number.isFinite(s?.pension))){
        const raw=[]; if(filled('pensionBalance'))raw.push(`目前專戶 ${money(N('pensionBalance'))}`); if(filled('pensionWage'))raw.push(`月提繳工資 ${money(N('pensionWage'))}`);
        lines.push(`勞退：${Number.isFinite(s?.pension)?`月領方向估算約 ${money(s.pension)}`:'尚未完成估算'}${raw.length?`（${raw.join('、')}）`:''}。`);
      }
      if($('useNationalPension').checked && (filled('nationalYears')||Number.isFinite(s?.national))){
        lines.push(`國民年金：${Number.isFinite(s?.national)?`月領快估約 ${money(s.national)}`:'尚未完成估算'}${filled('nationalYears')?`（年資 ${N('nationalYears')} 年）`:''}。`);
      }
      if(s?.knownCount>0)lines.push(`<strong>目前已完成項目合計約 ${money(s.total)}/月。</strong>`);
      parts.push(`<section class="summary-section"><h3>退休收入</h3><ul>${lines.map(x=>`<li>${x}</li>`).join('')}</ul></section>`);
    }

    if(state.gap || filled('desiredSpend') || filled('otherIncome') || (filled('inflationRate') && N('inflationRate')!==0)){
      const lines=[]; const s=state.gap;
      if(filled('desiredSpend'))lines.push(`退休後每月生活費目標：${money(N('desiredSpend'))}。`);
      if(filled('otherIncome'))lines.push(`其他固定收入：約 ${money(N('otherIncome'))}/月。`);
      if(filled('inflationRate') && N('inflationRate')!==0)lines.push(`通膨情境：${N('inflationRate')}%。`);
      if(s?.futureSpend!==null && s?.futureSpend!==undefined)lines.push(`依目前條件換算的退休每月需要：約 ${money(s.futureSpend)}。`);
      if(s?.gap!==null && s?.gap!==undefined)lines.push(s.gap>0?`目前可見每月差額約 ${money(s.gap)}；20 年直算約 ${money(s.simple20)}。`:`依目前已知資料，退休收入大致可覆蓋設定生活費。`);
      if(s?.incomeIncomplete)lines.push(`尚有退休收入項目未完成，差額仍可能調整。`);
      parts.push(`<section class="summary-section"><h3>退休生活</h3><ul>${lines.map(x=>`<li>${x}</li>`).join('')}</ul></section>`);
    }

    if(state.reserve || ['currentReserve','monthlyReserve','reserveYears','reserveRate'].some(filled)){
      const lines=[]; const s=state.reserve;
      if(filled('currentReserve'))lines.push(`目前已準備：${money(N('currentReserve'))}。`);
      if(filled('monthlyReserve'))lines.push(`每月持續準備：${money(N('monthlyReserve'))}。`);
      if(filled('reserveYears'))lines.push(`規劃期間：${N('reserveYears')} 年。`);
      if(filled('reserveRate'))lines.push(`年化報酬情境：${N('reserveRate')}%（僅為試算假設）。`);
      if(Number.isFinite(s?.final))lines.push(`<strong>期末情境估值約 ${money(s.final)}。</strong>`);
      parts.push(`<section class="summary-section"><h3>未來準備</h3><ul>${lines.map(x=>`<li>${x}</li>`).join('')}</ul></section>`);
    }

    if(!parts.length)parts.push('<div class="empty">目前尚未填寫資料。只要填任一欄位，就可以整理成現有資訊摘要。</div>');
    $('summaryContent').innerHTML=parts.join('');
    const name=$('clientName').value.trim();$('printMeta').textContent=`${name?name+'｜':''}${new Date().toLocaleDateString('zh-TW')}｜依目前已提供資料整理，僅供試算參考`;
  }

  function summaryText(){
    renderSummary();
    const name=$('clientName').value.trim();
    const lines=[`${name?name+'｜':''}未來生活試算重點`];
    const text=$('summaryContent').innerText.trim();
    if(text)lines.push(text);
    lines.push('※本整理依目前已提供資料產生；未填欄位不代表為 0。所有試算僅供退休與財務觀念參考，實際退休給付與核定金額以主管機關及正式核定結果為準；非投資建議或保證收益。');
    return lines.join('\n\n');
  }
  function copySummary(){renderSummary();const text=summaryText();if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(()=>toast('重點已複製')).catch(()=>fallbackCopy(text))}else fallbackCopy(text)}
  function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('重點已複製')}catch(e){toast('請手動複製重點')}ta.remove()}
  function downloadReport(){renderSummary();const name=$('clientName').value.trim()||'試算';const content=$('summaryContent').innerHTML;const disclaimer=document.querySelector('.disclaimer').outerHTML;const html=`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>${name}－未來生活試算</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;max-width:820px;margin:36px auto;padding:0 18px;color:#3e342f;line-height:1.7}.summary{display:grid;grid-template-columns:1fr 1fr;gap:10px}.summary-section,.disclaimer{border:1px solid #e7ddd4;border-radius:14px;padding:14px}.summary-section h3,.disclaimer h3{margin-top:0}.summary-section li,.disclaimer p{font-size:13px}.disclaimer{margin-top:16px;background:#f7f6f5}@media(max-width:700px){.summary{grid-template-columns:1fr}}</style><h1>未來生活試算重點</h1><p>${name}｜${new Date().toLocaleDateString('zh-TW')}</p><div class="summary">${content}</div>${disclaimer}</html>`;const blob=new Blob([html],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${name}-未來生活試算.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);toast('已產生報告')}

  $('calcIncome').addEventListener('click',calcIncome);$('calcGap').addEventListener('click',calcGap);$('calcReserve').addEventListener('click',calcReserve);$('clientName').addEventListener('input',renderSummary);$('refreshSummaryBtn').addEventListener('click',()=>{renderSummary();toast('已依目前資料整理')});$('printBtn').addEventListener('click',()=>{renderSummary();window.print()});$('copyBtn').addEventListener('click',copySummary);$('downloadBtn').addEventListener('click',downloadReport);
  document.querySelectorAll('input,select').forEach(el=>{if(el.id!=='clientName')el.addEventListener('input',()=>renderSummary())});
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.protocol==='http:'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
  renderSummary();
})();
