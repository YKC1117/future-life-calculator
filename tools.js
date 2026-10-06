(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const qsa=sel=>[...document.querySelectorAll(sel)];
  const num=id=>{const n=parseFloat($(id)?.value);return Number.isFinite(n)?n:0};
  const fmt=n=>new Intl.NumberFormat('zh-TW',{maximumFractionDigits:1}).format(Number.isFinite(n)?n:0);
  const money=n=>new Intl.NumberFormat('zh-TW',{style:'currency',currency:'TWD',maximumFractionDigits:0}).format(Number.isFinite(n)?Math.round(n):0);

  // 保留三工具切換的好用邏輯，但建立自己的視覺語言與文案。
  function applyIdentity(){
    document.body.classList.add('future-life-brand');

    const tabMeta={
      retirement:{no:'01',title:'退休規劃'},
      life:{no:'02',title:'人生帳本'},
      compound:{no:'03',title:'複利成長'}
    };
    qsa('.tool-tab').forEach(btn=>{
      const meta=tabMeta[btn.dataset.tool];
      if(!meta)return;
      const small=btn.querySelector('small');
      const strong=btn.querySelector('strong');
      if(small)small.textContent=meta.no;
      if(strong)strong.textContent=meta.title;
    });

    const retirement=$('panel-retirement');
    const life=$('panel-life');
    const compound=$('panel-compound');
    if(retirement){
      const eye=retirement.querySelector('.panel-heading .eyebrow');
      const h=retirement.querySelector('.panel-heading h2');
      if(eye)eye.textContent='退休現金流';
      if(h)h.textContent='先看退休後，每月有多少底氣';
    }
    if(life){
      const eye=life.querySelector('.panel-heading .eyebrow');
      const h=life.querySelector('.panel-heading h2');
      if(eye)eye.textContent='人生支出盤點';
      if(h)h.textContent='把人生大事，先放進帳本裡';
    }
    if(compound){
      const eye=compound.querySelector('.panel-heading .eyebrow');
      const h=compound.querySelector('.panel-heading h2');
      if(eye)eye.textContent='時間 × 複利';
      if(h)h.textContent='看看不同時間，資金會走到哪裡';
    }

    const style=document.createElement('style');
    style.id='futureLifeIdentity';
    style.textContent=`
      .future-life-brand{
        --brand-clay:#9b5d51;
        --brand-clay-dark:#76443c;
        --brand-clay-soft:#f5e8e2;
        --brand-pine:#536b60;
        --brand-pine-soft:#eaf0ec;
        --brand-sand:#c49a5a;
        --brand-cream:#fbf7f2;
        --brand-paper:#fffdfa;
        --brand-line:#e8ddd4;
        --brand-ink:#3f342f;
        background:linear-gradient(180deg,#f6eee7 0,#faf7f3 260px,#f7f5f1 100%);
        color:var(--brand-ink);
      }
      .future-life-brand .shell{width:min(1080px,calc(100% - 28px));padding-top:20px}
      .future-life-brand .site-head{padding:8px 4px 18px;position:relative}
      .future-life-brand .site-head::before{content:"";display:block;width:46px;height:4px;border-radius:999px;background:linear-gradient(90deg,var(--brand-clay),var(--brand-sand));margin-bottom:13px}
      .future-life-brand .site-head h1{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;color:#443630;font-size:31px;font-weight:900;letter-spacing:-.03em}
      .future-life-brand .site-head p{font-size:15px;color:#7d6d66;max-width:720px}

      .future-life-brand .tool-tabs{gap:10px;background:transparent;border:0;padding:0;box-shadow:none;margin-bottom:16px}
      .future-life-brand .tool-tab{min-height:76px;background:rgba(255,253,250,.9);border:1px solid var(--brand-line);border-radius:16px;align-items:flex-start;padding:12px 17px;box-shadow:0 5px 16px rgba(91,62,48,.05);position:relative;overflow:hidden}
      .future-life-brand .tool-tab::after{content:"";position:absolute;right:-18px;bottom:-26px;width:74px;height:74px;border-radius:50%;background:rgba(155,93,81,.06)}
      .future-life-brand .tool-tab small{font-size:12px;font-weight:900;color:#b19384;letter-spacing:.14em;z-index:1}
      .future-life-brand .tool-tab strong{font-size:18px;color:#5b4b44;z-index:1}
      .future-life-brand .tool-tab.active{background:linear-gradient(135deg,var(--brand-clay-dark),var(--brand-clay));border:1px solid var(--brand-clay-dark);box-shadow:0 8px 20px rgba(118,68,60,.18)}
      .future-life-brand .tool-tab.active small{color:#f0d8cf}
      .future-life-brand .tool-tab.active strong{color:#fff}
      .future-life-brand .tool-tab.active::after{background:rgba(255,255,255,.08)}

      .future-life-brand .tool-panel{background:rgba(255,253,250,.97);border:1px solid var(--brand-line);border-radius:22px;padding:38px 44px;box-shadow:0 14px 34px rgba(91,62,48,.07)}
      .future-life-brand .panel-heading{border-bottom:0;align-items:center;padding:0 0 20px;margin-bottom:14px;position:relative}
      .future-life-brand .panel-heading::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:linear-gradient(90deg,var(--brand-clay),var(--brand-line) 42%,transparent)}
      .future-life-brand .panel-heading h2{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;color:#493932;font-size:30px;font-weight:900;letter-spacing:-.025em}
      .future-life-brand .panel-heading p{color:#8a7b74}
      .future-life-brand .eyebrow{background:var(--brand-clay-soft);color:var(--brand-clay-dark);font-size:12px;padding:6px 10px}
      .future-life-brand .eyebrow.mint{background:var(--brand-pine-soft);color:var(--brand-pine)}

      .future-life-brand .card{border-bottom:1px solid var(--brand-line);padding:26px 0 30px}
      .future-life-brand .section-title>span{display:inline-grid;place-items:center;min-width:34px;height:34px;border-radius:50%;background:#f6eee8;color:var(--brand-clay);padding:0;font-size:12px}
      .future-life-brand .section-title h3{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif;color:#4b3c35;font-size:24px;font-weight:900}
      .future-life-brand .section-title p{color:#94857e}
      .future-life-brand .field label{color:#554842}
      .future-life-brand input,.future-life-brand select{border-bottom-color:#cdbfb5;color:#483b35}
      .future-life-brand input:focus,.future-life-brand select:focus{border-bottom-color:var(--brand-clay);background:#fffaf7}
      .future-life-brand .source{background:#fffaf6;border-color:var(--brand-line);border-radius:14px}
      .future-life-brand .source-head strong{color:#50413b}
      .future-life-brand .switch input{accent-color:var(--brand-clay)}
      .future-life-brand .advanced,.future-life-brand .life-auto{background:#fbf7f2;border-color:var(--brand-line);border-radius:12px}
      .future-life-brand .btn{border-radius:12px;border-color:#dacdc4;background:#fff;color:#5b4b44}
      .future-life-brand .btn.primary{background:linear-gradient(135deg,var(--brand-clay-dark),var(--brand-clay));border-color:transparent}
      .future-life-brand .result{background:#fffaf6;border-color:var(--brand-line);border-radius:14px}
      .future-life-brand .metric .v{color:var(--brand-clay-dark)}
      .future-life-brand .focus{border-top-color:var(--brand-line)}

      /* 人生帳本：保留好讀的直式帳本，但改成我們的暖色＋生活階段感。 */
      .future-life-brand .income-total-box{background:linear-gradient(135deg,#6f5149,#8f6257);border-radius:16px;box-shadow:0 8px 22px rgba(103,72,61,.13)}
      .future-life-brand .income-total-box strong{font-family:Georgia,"Times New Roman",serif}
      .future-life-brand .inline-money input{border-bottom-color:#e7c787}
      .future-life-brand .inline-money span,.future-life-brand .income-total-box strong em{color:#f3d08f}
      .future-life-brand .ledger-list{border-top-color:#d9c9bd}
      .future-life-brand .ledger-row{grid-template-columns:48px 1fr 190px;border-bottom-color:#eadfd7;min-height:66px}
      .future-life-brand .ledger-no{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#f4e8df;color:var(--brand-clay);font-size:11px}
      .future-life-brand .ledger-row>strong{color:#594b45;font-weight:700}
      .future-life-brand .ledger-input input{border-bottom-color:#cdbfb5}
      .future-life-brand .ledger-sum{border-bottom-color:#8f746a;padding:16px 0}
      .future-life-brand .net-box{border:0;background:linear-gradient(180deg,#f4f0e9,#fffdf9);border-radius:16px;padding:25px 18px;box-shadow:inset 0 0 0 1px #dfd5cb}
      .future-life-brand .net-box small{color:#6f655f}
      .future-life-brand .net-box strong{color:var(--brand-pine);font-size:44px}
      .future-life-brand .net-box p{color:#9b7c54}
      .future-life-brand .net-box.negative strong{color:#b65f55}

      /* 複利：保留矩陣＋圖表的好用結構，但避免與範例的黃綠配置雷同。 */
      .future-life-brand .principal-box{background:linear-gradient(135deg,#f8ebe6,#f5efe6);border-color:#ead2c6;border-radius:16px;padding:22px 24px}
      .future-life-brand .principal-box>label{color:#8d6b60}
      .future-life-brand .principal-input{border-bottom-color:#d4b3a6}
      .future-life-brand .principal-input input{color:#6c463c}
      .future-life-brand .quick-money button{background:#fffaf6;border-color:#dfc8bd;color:#72564d}
      .future-life-brand .quick-money button:hover{background:#f4e5de}
      .future-life-brand .matrix-wrap{border-color:#d8d1c7;border-radius:14px;box-shadow:0 5px 16px rgba(91,62,48,.04)}
      .future-life-brand .compound-matrix thead th{background:#eee8e1;color:#675951}
      .future-life-brand .compound-matrix thead th:first-child{background:var(--brand-pine);color:#fff}
      .future-life-brand .compound-matrix tbody th{background:#dce7e0;color:#41594f}
      .future-life-brand .compound-matrix th,.future-life-brand .compound-matrix td{border-color:#e4ddd5}
      .future-life-brand .matrix-value{color:#4f4b46}
      .future-life-brand .matrix-gain{color:#a75c51}
      .future-life-brand .chart-card{border-color:#ded3c9;border-radius:16px;background:#fffdfa}
      .future-life-brand .chart-title h3{color:#51433d}
      .future-life-brand .chart-legend{border-top-color:#e8dfd7}

      .future-life-brand .summary-section{background:#fffaf6;border-color:var(--brand-line);border-radius:14px}
      .future-life-brand .disclaimer{background:#f1eee9;border-color:#ddd5ce;border-radius:14px}

      @media(max-width:720px){
        .future-life-brand .tool-tabs{position:sticky;top:6px;z-index:30;padding:5px;background:rgba(247,243,238,.9);backdrop-filter:blur(10px);border-radius:16px}
        .future-life-brand .tool-tab{min-height:62px;padding:9px 11px;border-radius:12px}
        .future-life-brand .tool-tab strong{font-size:14px}
        .future-life-brand .tool-tab small{font-size:10px}
        .future-life-brand .tool-panel{padding:26px 17px;border-radius:18px}
        .future-life-brand .panel-heading h2{font-size:25px}
        .future-life-brand .ledger-row{grid-template-columns:38px 1fr 124px}
        .future-life-brand .ledger-input input{width:86px}
        .future-life-brand .income-total-box{border-radius:14px}
      }
      @media(max-width:430px){
        .future-life-brand .site-head h1{font-size:25px}
        .future-life-brand .tool-tabs{gap:5px}
        .future-life-brand .tool-tab{padding:8px 9px}
        .future-life-brand .tool-tab strong{font-size:13px}
        .future-life-brand .tool-panel{padding:23px 14px}
      }
    `;
    document.head.appendChild(style);
  }
  applyIdentity();

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
  const colors=['#c7a45d','#91a27b','#6f9486','#547b70','#b97a6a','#9b5d51'];
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
      html+=`<line x1="${left}" y1="${y}" x2="${W-right}" y2="${y}" stroke="#ece6e0" stroke-width="1"/>`;
      html+=`<text x="${left-10}" y="${y+4}" text-anchor="end" font-size="11" fill="#958982">${shortMoney(value)}</text>`;
    }
    [0,10,20,30].forEach(year=>{
      const x=left+chartW*(year/30);
      html+=`<line x1="${x}" y1="${top}" x2="${x}" y2="${top+chartH}" stroke="#f2eeea" stroke-width="1"/>`;
      html+=`<text x="${x}" y="${H-16}" text-anchor="middle" font-size="11" fill="#958982">${year}年</text>`;
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