(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const val=id=>{const n=parseFloat($(id)?.value);return Number.isFinite(n)?n:0};
  const filled=id=>!!$(id)&&String($(id).value).trim()!=='';
  const money=n=>new Intl.NumberFormat('zh-TW',{style:'currency',currency:'TWD',maximumFractionDigits:0}).format(Math.round(Number.isFinite(n)?n:0));
  const toast=text=>{const el=$('toast');if(!el)return;el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)};
  const futureValue=(principal,monthly,annualRate,years)=>{
    const months=Math.max(0,years*12),r=annualRate/12;
    if(months===0)return principal;
    if(Math.abs(r)<1e-12)return principal+monthly*months;
    const growth=Math.pow(1+r,months);
    return principal*growth+monthly*((growth-1)/r);
  };

  function seedExpense(){
    if(!filled('lifeCurrentAge')&&filled('age'))$('lifeCurrentAge').value=$('age').value;
  }
  function calcExpense(){
    const ids=['lifeHousing','lifeFood','lifeTransport','lifeInsurance','lifeFamily','lifeOther'];
    if(!ids.some(filled)){toast('先填一兩項每月開銷就可以試算');return;}
    const monthly=ids.reduce((sum,id)=>sum+val(id),0);
    const annual=monthly*12;
    const current=filled('lifeCurrentAge')?val('lifeCurrentAge'):null;
    const until=filled('lifeUntilAge')?val('lifeUntilAge'):null;
    let years=null,total=null;
    if(current!==null&&until!==null&&until>current){years=until-current;total=annual*years;}
    const third=total!==null?`<div class="tool-metric"><span>從現在到 ${until} 歲</span><strong>${money(total)}</strong></div>`:`<div class="tool-metric"><span>長期總額</span><strong>可再填年齡</strong></div>`;
    $('expenseResult').innerHTML=`<div class="tool-metrics"><div class="tool-metric"><span>每月必要開銷</span><strong>${money(monthly)}</strong></div><div class="tool-metric"><span>每年約需要</span><strong>${money(annual)}</strong></div>${third}</div><div class="tool-explain">${years!==null?`若生活型態維持相近，從現在到 ${until} 歲共約 ${years} 年，單純以今天金額直算約 ${money(total)}。`:'目前先看每月與每年；補上目前年齡與估算到幾歲，就能再看長期總額。'}<br><small>此區未納入通膨、收入成長與生活型態變化，只用來快速看「基本生活要多少」。</small></div>`;
    $('expenseResult').classList.add('show');
  }

  function seedCompound(){
    const map=[['compoundPrincipal','currentReserve'],['compoundMonthly','monthlyReserve'],['compoundYears','reserveYears'],['compoundRate','reserveRate']];
    map.forEach(([to,from])=>{if(!filled(to)&&filled(from))$(to).value=$(from).value;});
  }
  function calcCompound(){
    const hasAny=['compoundPrincipal','compoundMonthly','compoundYears','compoundRate'].some(filled);
    if(!hasAny){toast('先填本金、每月投入、年數或報酬率');return;}
    if(!filled('compoundYears')){toast('至少要填投資／準備年數');return;}
    const principal=val('compoundPrincipal'),monthly=val('compoundMonthly'),years=val('compoundYears'),rate=filled('compoundRate')?val('compoundRate')/100:0;
    if(years<=0){toast('年數請填大於 0');return;}
    const final=futureValue(principal,monthly,rate,years);
    const invested=principal+monthly*years*12;
    const growth=final-invested;
    const multiplier=invested>0?final/invested:null;
    $('compoundResult').innerHTML=`<div class="tool-metrics"><div class="tool-metric"><span>自己投入</span><strong>${money(invested)}</strong></div><div class="tool-metric"><span>${years} 年後情境估值</span><strong>${money(final)}</strong></div><div class="tool-metric"><span>其中複利成長</span><strong>${money(growth)}</strong></div></div><div class="tool-explain">以年化 ${(rate*100).toFixed(1)}% 情境試算，${multiplier!==null?`期末約為累積投入的 <strong>${multiplier.toFixed(2)} 倍</strong>。`:`目前沒有投入金額。`} 報酬率只是假設值，不代表任何商品的實際或保證結果。</div>`;
    $('compoundResult').classList.add('show');
  }

  $('expenseTool')?.addEventListener('toggle',e=>{if(e.target.open)seedExpense();});
  $('compoundTool')?.addEventListener('toggle',e=>{if(e.target.open)seedCompound();});
  $('calcExpense')?.addEventListener('click',calcExpense);
  $('calcCompound')?.addEventListener('click',calcCompound);
})();
