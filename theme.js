(()=>{
  'use strict';

  const STORAGE_KEY='futureLifeTheme';
  const THEMES={
    auto:{label:'自動',desc:'跟隨裝置',swatch:'linear-gradient(135deg,#fbf7f2 50%,#232422 50%)'},
    warm:{label:'暖白',desc:'溫暖柔和',swatch:'#9b5d51'},
    dark:{label:'深色',desc:'夜間舒適',swatch:'#252624'},
    forest:{label:'森林綠',desc:'沉穩自然',swatch:'#527260'},
    blue:{label:'霧藍',desc:'清爽安定',swatch:'#607b96'},
    rose:{label:'玫瑰棕',desc:'柔和雅緻',swatch:'#a66776'}
  };
  const VALID=Object.keys(THEMES);
  const media=window.matchMedia?.('(prefers-color-scheme: dark)');

  const css=`
    html[data-theme="warm"]{--theme-bg:#f7f3ee;--theme-paper:#fffdfa;--theme-surface:#fffaf6;--theme-soft:#f5e8e2;--theme-line:#e8ddd4;--theme-ink:#493932;--theme-muted:#8a7b74;--theme-accent:#9b5d51;--theme-accent-dark:#76443c;--theme-secondary:#536b60;--theme-accent-rgb:155,93,81}
    html[data-theme="forest"]{--theme-bg:#eef2ee;--theme-paper:#fbfdfa;--theme-surface:#f5f9f6;--theme-soft:#e5efe9;--theme-line:#d8e2da;--theme-ink:#31443b;--theme-muted:#718079;--theme-accent:#527260;--theme-accent-dark:#385346;--theme-secondary:#9a7448;--theme-accent-rgb:82,114,96}
    html[data-theme="blue"]{--theme-bg:#edf2f6;--theme-paper:#fbfcfd;--theme-surface:#f5f8fb;--theme-soft:#e7edf3;--theme-line:#d6e0e8;--theme-ink:#344553;--theme-muted:#73818c;--theme-accent:#607b96;--theme-accent-dark:#435d75;--theme-secondary:#8d765b;--theme-accent-rgb:96,123,150}
    html[data-theme="rose"]{--theme-bg:#f6eff1;--theme-paper:#fffafb;--theme-surface:#fcf5f7;--theme-soft:#f2e3e7;--theme-line:#ead9de;--theme-ink:#4d3c42;--theme-muted:#88767c;--theme-accent:#a66776;--theme-accent-dark:#7d4b58;--theme-secondary:#88705d;--theme-accent-rgb:166,103,118}
    html[data-theme="dark"]{color-scheme:dark;--theme-bg:#171817;--theme-paper:#232422;--theme-surface:#2a2b28;--theme-soft:#352c2a;--theme-line:#3e403c;--theme-ink:#eee8e3;--theme-muted:#aaa39e;--theme-accent:#d18a78;--theme-accent-dark:#b76d5e;--theme-secondary:#91aa9a;--theme-accent-rgb:209,138,120}

    html[data-theme] body.future-life-brand{background:linear-gradient(180deg,color-mix(in srgb,var(--theme-accent) 9%,var(--theme-bg)) 0,var(--theme-bg) 280px,var(--theme-bg) 100%)!important;color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .site-head h1,
    html[data-theme] body.future-life-brand .panel-heading h2,
    html[data-theme] body.future-life-brand .section-title h3,
    html[data-theme] body.future-life-brand .field label,
    html[data-theme] body.future-life-brand .source-head strong,
    html[data-theme] body.future-life-brand .ledger-name strong,
    html[data-theme] body.future-life-brand .chart-title h3,
    html[data-theme] body.future-life-brand .summary-section h3{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .site-head p,
    html[data-theme] body.future-life-brand .panel-heading p,
    html[data-theme] body.future-life-brand .section-title p,
    html[data-theme] body.future-life-brand .hint,
    html[data-theme] body.future-life-brand .ledger-name small,
    html[data-theme] body.future-life-brand .chart-title p,
    html[data-theme] body.future-life-brand .panel-footnote{color:var(--theme-muted)!important}
    html[data-theme] body.future-life-brand .site-head::before{background:linear-gradient(90deg,var(--theme-accent),var(--theme-secondary))!important}
    html[data-theme] body.future-life-brand .tool-panel{background:var(--theme-paper)!important;border-color:var(--theme-line)!important;box-shadow:0 14px 34px rgba(var(--theme-accent-rgb),.08)!important}
    html[data-theme] body.future-life-brand .tool-tab{background:var(--theme-paper)!important;border-color:var(--theme-line)!important;box-shadow:0 5px 16px rgba(var(--theme-accent-rgb),.06)!important}
    html[data-theme] body.future-life-brand .tool-tab small{color:var(--theme-muted)!important}
    html[data-theme] body.future-life-brand .tool-tab strong{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .tool-tab.active{background:linear-gradient(135deg,var(--theme-accent-dark),var(--theme-accent))!important;border-color:var(--theme-accent-dark)!important;box-shadow:0 8px 20px rgba(var(--theme-accent-rgb),.22)!important}
    html[data-theme] body.future-life-brand .tool-tab.active small{color:rgba(255,255,255,.72)!important}
    html[data-theme] body.future-life-brand .tool-tab.active strong{color:#fff!important}
    html[data-theme] body.future-life-brand .panel-heading::after{background:linear-gradient(90deg,var(--theme-accent),var(--theme-line) 45%,transparent)!important}
    html[data-theme] body.future-life-brand .eyebrow,
    html[data-theme] body.future-life-brand .section-title>span,
    html[data-theme] body.future-life-brand .ledger-no{background:var(--theme-soft)!important;color:var(--theme-accent)!important}
    html[data-theme] body.future-life-brand .eyebrow.mint{background:color-mix(in srgb,var(--theme-secondary) 14%,var(--theme-paper))!important;color:var(--theme-secondary)!important}
    html[data-theme] body.future-life-brand .card{border-bottom-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand input,
    html[data-theme] body.future-life-brand select{color:var(--theme-ink)!important;border-bottom-color:color-mix(in srgb,var(--theme-muted) 58%,var(--theme-line))!important;background:transparent!important}
    html[data-theme] body.future-life-brand input:focus,
    html[data-theme] body.future-life-brand select:focus{border-bottom-color:var(--theme-accent)!important;background:color-mix(in srgb,var(--theme-accent) 5%,var(--theme-paper))!important}
    html[data-theme] body.future-life-brand .source,
    html[data-theme] body.future-life-brand .advanced,
    html[data-theme] body.future-life-brand .life-auto,
    html[data-theme] body.future-life-brand .result,
    html[data-theme] body.future-life-brand .summary-section{background:var(--theme-surface)!important;border-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand .btn{background:var(--theme-paper)!important;color:var(--theme-ink)!important;border-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand .btn.primary{background:linear-gradient(135deg,var(--theme-accent-dark),var(--theme-accent))!important;color:#fff!important;border-color:transparent!important}
    html[data-theme] body.future-life-brand .income-total-box{background:linear-gradient(135deg,var(--theme-accent-dark),var(--theme-accent))!important;box-shadow:0 8px 22px rgba(var(--theme-accent-rgb),.18)!important}
    html[data-theme] body.future-life-brand .ledger-list,
    html[data-theme] body.future-life-brand .ledger-row{border-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand .net-box{background:linear-gradient(180deg,color-mix(in srgb,var(--theme-secondary) 8%,var(--theme-surface)),var(--theme-paper))!important;box-shadow:inset 0 0 0 1px var(--theme-line)!important}
    html[data-theme] body.future-life-brand .net-box strong{color:var(--theme-secondary)!important}
    html[data-theme] body.future-life-brand .principal-box{background:linear-gradient(135deg,var(--theme-soft),color-mix(in srgb,var(--theme-secondary) 7%,var(--theme-paper)))!important;border-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand .quick-money button{background:var(--theme-paper)!important;border-color:var(--theme-line)!important;color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .matrix-wrap,
    html[data-theme] body.future-life-brand .chart-card{border-color:var(--theme-line)!important;background:var(--theme-paper)!important}
    html[data-theme] body.future-life-brand .compound-matrix{background:var(--theme-paper)!important}
    html[data-theme] body.future-life-brand .compound-matrix th,
    html[data-theme] body.future-life-brand .compound-matrix td{border-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand .compound-matrix thead th{background:color-mix(in srgb,var(--theme-secondary) 12%,var(--theme-paper))!important;color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .compound-matrix thead th:first-child{background:var(--theme-secondary)!important;color:#fff!important}
    html[data-theme] body.future-life-brand .compound-matrix tbody th{background:color-mix(in srgb,var(--theme-secondary) 17%,var(--theme-paper))!important;color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .matrix-value{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .matrix-gain{color:var(--theme-accent)!important}
    html[data-theme] body.future-life-brand .disclaimer{background:color-mix(in srgb,var(--theme-muted) 8%,var(--theme-paper))!important;border-color:var(--theme-line)!important;color:var(--theme-muted)!important}
    html[data-theme] body.future-life-brand .disclaimer h3,
    html[data-theme] body.future-life-brand .disclaimer strong{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .disclaimer a{color:var(--theme-accent)!important}

    /* 這兩個控制都只存在首頁原本版面，不再黏在螢幕上。 */
    html body.future-life-brand .tool-tabs{position:static!important;top:auto!important;bottom:auto!important;z-index:auto!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
    .site-head-toprow{display:flex;align-items:flex-start;justify-content:space-between;gap:10px;width:100%}
    .site-head-toprow>h1{flex:1 1 auto;min-width:0}
    .site-head-toprow .theme-picker-root{position:relative!important;inset:auto!important;display:block;flex:0 0 auto;margin:1px 0 0!important;padding:0!important;z-index:12!important;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
    .site-head-toprow .theme-picker-btn{width:28px;height:28px;min-width:28px;min-height:28px;padding:0;margin:0;display:grid;place-items:center;border:1px solid var(--theme-line,#e4d8cf);border-radius:8px;background:transparent;color:var(--theme-ink,#493932);box-shadow:none;cursor:pointer}
    .site-head-toprow .theme-picker-btn:hover{background:var(--theme-soft,#f5e8e2)}
    .site-head-toprow .theme-picker-btn svg{width:14px;height:14px;display:block}
    .theme-picker-panel{position:absolute;top:34px;right:0;width:224px;max-width:calc(100vw - 20px);padding:9px;border:1px solid var(--theme-line,#e4d8cf);border-radius:13px;background:var(--theme-paper,#fffdfa);box-shadow:0 12px 30px rgba(43,34,30,.16);color:var(--theme-ink,#493932);box-sizing:border-box}
    .theme-picker-panel[hidden]{display:none}
    .theme-picker-title{display:flex;justify-content:space-between;align-items:center;padding:1px 3px 7px;font-size:12px;font-weight:900}
    .theme-picker-title small{font-size:9px;color:var(--theme-muted,#8b7c75);font-weight:500}
    .theme-options{display:grid;grid-template-columns:1fr 1fr;gap:5px}
    .theme-option{display:flex;align-items:center;gap:7px;min-height:43px;padding:6px;border:1px solid var(--theme-line,#e4d8cf);border-radius:9px;background:var(--theme-surface,#fffaf6);color:var(--theme-ink,#493932);text-align:left;cursor:pointer}
    .theme-option.active{border:2px solid var(--theme-accent,#9b5d51);padding:5px;background:var(--theme-soft,#f5e8e2)}
    .theme-swatch{width:19px;height:19px;border-radius:50%;border:2px solid rgba(255,255,255,.75);box-shadow:0 0 0 1px rgba(0,0,0,.12);flex:0 0 auto}
    .theme-option strong{display:block;font-size:11px;line-height:1.2}
    .theme-option small{display:block;margin-top:2px;color:var(--theme-muted,#8b7c75);font-size:9px;line-height:1.2}
    @media(max-width:560px){.site-head-toprow{gap:6px}.site-head-toprow .theme-picker-btn{width:26px;height:26px;min-width:26px;min-height:26px;border-radius:7px}.site-head-toprow .theme-picker-btn svg{width:12px;height:12px}.theme-picker-panel{top:32px;width:214px;max-width:calc(100vw - 16px)}}
    @media print{.theme-picker-root{display:none!important}html[data-theme] body.future-life-brand{background:#fff!important;color:#333!important}.future-life-brand .summary-section{background:#fff!important;border-color:#ccc!important}}
  `;

  function resolveTheme(choice){return choice==='auto'?(media?.matches?'dark':'warm'):choice}
  function savedTheme(){try{const v=localStorage.getItem(STORAGE_KEY);return VALID.includes(v)?v:'warm'}catch{return 'warm'}}
  function updateMetaColor(theme){
    const map={warm:'#9b5d51',dark:'#232422',forest:'#527260',blue:'#607b96',rose:'#a66776'};
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',map[theme]||map.warm);
  }
  function applyTheme(choice,save=true){
    if(!VALID.includes(choice))choice='warm';
    const resolved=resolveTheme(choice);
    document.documentElement.dataset.themeChoice=choice;
    document.documentElement.dataset.theme=resolved;
    updateMetaColor(resolved);
    if(save){try{localStorage.setItem(STORAGE_KEY,choice)}catch{}}
    document.querySelectorAll('.theme-option').forEach(btn=>{
      const active=btn.dataset.themeChoice===choice;
      btn.classList.toggle('active',active);
      btn.setAttribute('aria-pressed',String(active));
    });
  }

  function buildPicker(){
    if(document.querySelector('.theme-picker-root'))return;
    const header=document.querySelector('.site-head');
    const title=header?.querySelector('h1');
    if(!header||!title)return;

    let row=header.querySelector('.site-head-toprow');
    if(!row){
      row=document.createElement('div');
      row.className='site-head-toprow';
      header.insertBefore(row,title);
      row.appendChild(title);
    }

    const root=document.createElement('div');
    root.className='theme-picker-root no-print';
    root.innerHTML=`
      <button class="theme-picker-btn" type="button" aria-label="選擇配色" aria-expanded="false" aria-controls="themePickerPanel">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 0 18h1.2a2.3 2.3 0 0 0 0-4.6h-.7a1.35 1.35 0 0 1 0-2.7H15A6 6 0 0 0 15 3h-3Zm-4.4 5.1a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Zm-2 4.2a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Zm2.2 4.1a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Zm4.1-8.9a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Z"/></svg>
      </button>
      <div class="theme-picker-panel" id="themePickerPanel" hidden>
        <div class="theme-picker-title"><span>畫面配色</span><small>只記在這台裝置</small></div>
        <div class="theme-options">
          ${VALID.map(key=>{const t=THEMES[key];return `<button type="button" class="theme-option" data-theme-choice="${key}" aria-pressed="false"><i class="theme-swatch" style="background:${t.swatch}"></i><span><strong>${t.label}</strong><small>${t.desc}</small></span></button>`}).join('')}
        </div>
      </div>`;
    row.appendChild(root);

    const trigger=root.querySelector('.theme-picker-btn');
    const panel=root.querySelector('.theme-picker-panel');
    const close=()=>{panel.hidden=true;trigger.setAttribute('aria-expanded','false')};
    trigger.addEventListener('click',()=>{
      const opening=panel.hidden;
      panel.hidden=!opening;
      trigger.setAttribute('aria-expanded',String(opening));
    });
    root.querySelectorAll('.theme-option').forEach(btn=>btn.addEventListener('click',()=>{applyTheme(btn.dataset.themeChoice,true);close()}));
    document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  const style=document.createElement('style');
  style.id='futureLifeThemeStyles';
  style.textContent=css;
  document.head.appendChild(style);
  buildPicker();
  applyTheme(savedTheme(),false);
  media?.addEventListener?.('change',()=>{if(document.documentElement.dataset.themeChoice==='auto')applyTheme('auto',false)});
})();
