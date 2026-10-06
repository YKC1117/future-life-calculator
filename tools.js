(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const qsa=sel=>[...document.querySelectorAll(sel)];
  const num=id=>{const n=parseFloat($(id)?.value);return Number.isFinite(n)?n:0};
  const fmt=n=>new Intl.NumberFormat('zh-TW',{maximumFractionDigits:1}).format(Number.isFinite(n)?n:0);
  const money=n=>new Intl.NumberFormat('zh-TW',{style:'currency',currency:'TWD',maximumFractionDigits:0}).format(Number.isFinite(n)?Math.round(n):0);

  // 三大工具切換
  const validTools=['retirement','life','compound'];
  function activateTool(name,updateHash=true){
    if(!validTools.includes(name))name='retirement';
    qsa('.tool-tab').forEach(btn=>{
      const active=btn.dataset.tool===name;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-selected',String(active));
    });
    qsa('.tool-panel').forEach(panel=>{
      const active=panel.dataset.panel===name;
      panel.hidden=!active;
      panel.classList.toggle('active',active);
    });
    if(name==='life')syncLifeAges();
    if(name==='compound')renderCompound();
    if(updateHash)history.replaceState(null,'',`#${name}`);
    window.scrollTo({top:0,behavior:'smooth'});
  }
  qsa('.tool-tab').forEach(btn=>btn.addEventListener('click',()=>activateTool(btn.dataset.tool)));
  const initial=location.hash.replace('#','');
  if(validTools.includes(initial))activateTool(initial,false);

  // 人生帳本
  const expenseIds=['lifeHouse','lifeCar','lifeLiving','lifeWedding','lifeBaby','lifeEducation','lifeParents','lifeTravel'];
  function syncLifeAges(){
    if($('age')?.value && !$('lifeAge')?.value)$('lifeAge').value=$('age').value;
    if($('retireAge')?.value && !$('lifeRetireAge')?.value)$('lifeRetireAge').value=$('retireAge').value;
  }
  function renderLife(){
    const income=num('lifeIncomeTotal');
    const expenses=expenseIds.reduce((sum,id)=>sum+num(id),0);
    const net=income-expenses;
    $('lifeIncomeDisplay').textContent=fmt(income);
    $('lifeExpenseTotal').textContent=fmt(expenses);
    $('lifeNetTotal').textContent=fmt(net);
    const box=$('lifeNetTotal').closest('.net-box');
    box.classList.toggle('negative',net<0);
    if(income===0&&expenses===0){
      $('lifeNetHint').textContent='填入收入與人生開銷後，這裡會自動更新。';
    }else if(net<0){
      $('lifeNetHint').textContent=`目前人生開銷比設定收入多約 ${fmt(Math.abs(net))} 萬元。`;
    }else{
      $('lifeNetHint').textContent=`扣除目前八項開銷後，約剩 ${fmt(net)} 萬元。`;
    }
  }
  ['lifeIncomeTotal',...expenseIds].forEach(id=>$(id)?.addEventListener('input',renderLife));
  $('applyLifeIncome')?.addEventListener('click',()=>{
    const monthly=num('lifeMonthlyIncome');
    const age=num('lifeAge');
    const retire=num('lifeRetireAge');
    if(monthly<=0||age<=0||retire<=age){
      const t=$('toast');
      if(t){t.textContent='請先填正確的月收入、目前年齡與退休年齡';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1700)}
      return;
    }
    $('lifeIncomeTotal').value=(monthly*12*(retire-age)/10000).toFixed(1).replace(/\.0$/,'');
    renderLife();
  });
  renderLife();

  // 複利矩陣與圖表
  const rates=[0.8,1.75,4,6,8,10];
  const years=[10,20,30];
  const colors=['#d7c24d','#91bd65','#63b3a1','#479786','#e17b63','#ef5147'];
  const future=(principal,rate,year)=>principal*Math.pow(1+rate/100,year);

  function renderMatrix(principal){
    const tbody=$('compoundMatrixBody');
    tbody.innerHTML=rates.map(rate=>{
      const cells=years.map(year=>{
        const value=future(principal,rate,year);
        const gain=value-principal;
        return `<td><span class="matrix-value">${money(value)}</span><span class="matrix-gain">+${money(gain).replace('NT$','')}</span></td>`;
      }).join('');
      return `<tr><th>${rate}%</th>${cells}</tr>`;
    }).join('');
  }

  function niceMax(value){
    if(value<=0)return 100000;
    const p=Math.pow(10,Math.floor(Math.log10(value)));
    const n=value/p;
    const step=n<=1?1:n<=2?2:n<=5?5:10;
    return step*p;
  }
  function shortMoney(value){
    if(value>=100000000)return `${fmt(value/100000000)}億`;
    if(value>=10000)return `${fmt(value/10000)}萬`;
    return fmt(value);
  }
  function renderChart(principal){
    const svg=$('compoundChart');
    const W=820,H=340,left=72,right=24,top=24,bottom=48;
    const chartW=W-left-right,chartH=H-top-bottom;
    const maxValue=niceMax(Math.max(...rates.map(r=>future(principal,r,30)))*1.04);
    let html='';
    for(let i=0;i<=4;i++){
      const y=top+chartH*(i/4);
      const value=maxValue*(1-i/4);
      html+=`<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" stroke="#e5e8e1" stroke-width="1"/>`;
      html+=`<text x="${left-10}" y="${y+4}" text-anchor="end" font-size="11" fill="#8b9691">${shortMoney(value)}</text>`;
    }
    [0,10,20,30].forEach(year=>{
      const x=left+chartW*(year/30);
      html+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${top+chartH}" stroke="#f0f1ec" stroke-width="1"/>`;
      html+=`<text x="${x}" y="${H-16}" text-anchor="middle" font-size="11" fill="#8b9691">${year}年</text>`;
    });
    rates.forEach((rate,idx)=>{
      const pts=[0,10,20,30].map(year=>{
        const x=left+chartW*(year/30);
        const value=year===0?principal:future(principal,rate,year);
        const y=top+chartH-(value/maxValue)*chartH;
        return [x,y];
      });
      const d=pts.map((p,i)=>`${i?'L':'M'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
      html+=`<path d="${d}" fill="none" stroke="${colors[idx]}" stroke-width="2.5" stroke-linecap="round"/>`;
      pts.forEach(p=>html+=`<circle cx="${p[0]}" cy="${p[1]}" r="3" fill="${colors[idx]}"/>`);
    });
    svg.innerHTML=html;
    $('compoundLegend').innerHTML=rates.map((r,i)=>`<span class="legend-item"><i class="legend-dot" style="background:${colors[i]}"></i>${r}%</span>`).join('');
  }
  function renderCompound(){
    const principal=Math.max(0,num('compoundPrincipal'));
    renderMatrix(principal);
    renderChart(principal);
  }
  $('compoundPrincipal')?.addEventListener('input',renderCompound);
  qsa('[data-principal]').forEach(btn=>btn.addEventListener('click',()=>{
    $('compoundPrincipal').value=btn.dataset.principal;
    renderCompound();
  }));
  renderCompound();
})();