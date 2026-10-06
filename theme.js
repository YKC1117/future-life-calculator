(()=>{
  'use strict';

  const STORAGE_KEY='futureLifeTheme';
  const THEME_META={
    auto:{label:'自動',desc:'跟隨裝置',swatch:'linear-gradient(135deg,#fbf7f2 50%,#232422 50%)'},
    warm:{label:'暖白',desc:'溫暖柔和',swatch:'#9b5d51'},
    dark:{label:'深色',desc:'夜間舒適',swatch:'#252624'},
    forest:{label:'森林綠',desc:'沉穩自然',swatch:'#527260'},
    blue:{label:'霧藍',desc:'清爽安定',swatch:'#607b96'},
    rose:{label:'玫瑰棕',desc:'柔和雅緻',swatch:'#a66776'}
  };
  const VALID=Object.keys(THEME_META);
  const media=window.matchMedia?.('(prefers-color-scheme: dark)');

  const css=`
    .theme-picker-root{position:fixed;right:max(14px,env(safe-area-inset-right));bottom:max(16px,env(safe-area-inset-bottom));z-index:80;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","Noto Sans TC","PingFang TC","Microsoft JhengHei",sans-serif}
    .theme-picker-btn{display:flex;align-items:center;gap:7px;min-height:44px;padding:9px 13px;border:1px solid var(--theme-line,#e4d8cf);border-radius:999px;background:var(--theme-paper,#fffdfa);color:var(--theme-ink,#493932);box-shadow:0 8px 24px rgba(54,42,36,.14);font-size:13px;font-weight:800;cursor:pointer}
    .theme-picker-btn svg{width:17px;height:17px;display:block}.theme-picker-btn:focus-visible{outline:3px solid color-mix(in srgb,var(--theme-accent,#9b5d51) 30%,transparent);outline-offset:2px}
    .theme-picker-panel{position:absolute;right:0;bottom:53px;width:252px;padding:12px;border:1px solid var(--theme-line,#e4d8cf);border-radius:18px;background:var(--theme-paper,#fffdfa);box-shadow:0 14px 42px rgba(43,34,30,.2);color:var(--theme-ink,#493932)}
    .theme-picker-panel[hidden]{display:none}.theme-picker-title{display:flex;justify-content:space-between;align-items:center;padding:2px 4px 10px;font-size:13px;font-weight:900}.theme-picker-title small{font-size:11px;color:var(--theme-muted,#8b7c75);font-weight:500}
    .theme-options{display:grid;grid-template-columns:1fr 1fr;gap:7px}.theme-option{display:flex;align-items:center;gap:8px;min-height:52px;padding:8px;border:1px solid var(--theme-line,#e4d8cf);border-radius:12px;background:var(--theme-surface,#fffaf6);color:var(--theme-ink,#493932);text-align:left;cursor:pointer}.theme-option:hover{border-color:var(--theme-accent,#9b5d51)}.theme-option.active{border:2px solid var(--theme-accent,#9b5d51);padding:7px;background:var(--theme-soft,#f5e8e2)}
    .theme-swatch{width:24px;height:24px;border-radius:50%;border:2px solid rgba(255,255,255,.75);box-shadow:0 0 0 1px rgba(0,0,0,.12);flex:0 0 auto}.theme-option strong{display:block;font-size:12px;line-height:1.25}.theme-option small{display:block;margin-top:2px;color:var(--theme-muted,#8b7c75);font-size:10px;line-height:1.2}

    html[data-theme="warm"]{--theme-bg:#f7f3ee;--theme-paper:#fffdfa;--theme-surface:#fffaf6;--theme-soft:#f5e8e2;--theme-line:#e8ddd4;--theme-ink:#493932;--theme-muted:#8a7b74;--theme-accent:#9b5d51;--theme-accent-dark:#76443c;--theme-secondary:#536b60;--theme-accent-rgb:155,93,81}
    html[data-theme="forest"]{--theme-bg:#eef2ee;--theme-paper:#fbfdfa;--theme-surface:#f5f9f6;--theme-soft:#e5efe9;--theme-line:#d8e2da;--theme-ink:#31443b;--theme-muted:#718079;--theme-accent:#527260;--theme-accent-dark:#385346;--theme-secondary:#9a7448;--theme-accent-rgb:82,114,96}
    html[data-theme="blue"]{--theme-bg:#edf2f6;--theme-paper:#fbfcfd;--theme-surface:#f5f8fb;--theme-soft:#e7edf3;--theme-line:#d6e0e8;--theme-ink:#344553;--theme-muted:#73818c;--theme-accent:#607b96;--theme-accent-dark:#435d75;--theme-secondary:#8d765b;--theme-accent-rgb:96,123,150}
    html[data-theme="rose"]{--theme-bg:#f6eff1;--theme-paper:#fffafb;--theme-surface:#fcf5f7;--theme-soft:#f2e3e7;--theme-line:#ead9de;--theme-ink:#4d3c42;--theme-muted:#88767c;--theme-accent:#a66776;--theme-accent-dark:#7d4b58;--theme-secondary:#88705d;--theme-accent-rgb:166,103,118}
    html[data-theme="dark"]{color-scheme:dark;--theme-bg:#171817;--theme-paper:#232422;--theme-surface:#2a2b28;--theme-soft:#352c2a;--theme-line:#3e403c;--theme-ink:#eee8e3;--theme-muted:#aaa39e;--theme-accent:#d18a78;--theme-accent-dark:#b76d5e;--theme-secondary:#91aa9a;--theme-accent-rgb:209,138,120}

    html[data-theme] body.future-life-brand{background:linear-gradient(180deg,color-mix(in srgb,var(--theme-accent) 9%,var(--theme-bg)) 0,var(--theme-bg) 280px,var(--theme-bg) 100%)!important;color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .site-head h1,html[data-theme] body.future-life-brand .panel-heading h2,html[data-theme] body.future-life-brand .section-title h3,html[data-theme] body.future-life-brand .field label,html[data-theme] body.future-life-brand .source-head strong,html[data-theme] body.future-life-brand .ledger-row>strong,html[data-theme] body.future-life-brand .ledger-name strong,html[data-theme] body.future-life-brand .chart-title h3,html[data-theme] body.future-life-brand .summary-section h3{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .site-head p,html[data-theme] body.future-life-brand .panel-heading p,html[data-theme] body.future-life-brand .section-title p,html[data-theme] body.future-life-brand .hint,html[data-theme] body.future-life-brand .ledger-name small,html[data-theme] body.future-life-brand .chart-title p,html[data-theme] body.future-life-brand .panel-footnote{color:var(--theme-muted)!important}
    html[data-theme] body.future-life-brand .site-head::before{background:linear-gradient(90deg,var(--theme-accent),var(--theme-secondary))!important}
    html[data-theme] body.future-life-brand .tool-panel{background:var(--theme-paper)!important;border-color:var(--theme-line)!important;box-shadow:0 14px 34px rgba(var(--theme-accent-rgb),.08)!important}
    html[data-theme] body.future-life-brand .tool-tab{background:var(--theme-paper)!important;border-color:var(--theme-line)!important;box-shadow:0 5px 16px rgba(var(--theme-accent-rgb),.06)!important}
    html[data-theme] body.future-life-brand .tool-tab small{color:var(--theme-muted)!important}html[data-theme] body.future-life-brand .tool-tab strong{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .tool-tab.active{background:linear-gradient(135deg,var(--theme-accent-dark),var(--theme-accent))!important;border-color:var(--theme-accent-dark)!important;box-shadow:0 8px 20px rgba(var(--theme-accent-rgb),.22)!important}html[data-theme] body.future-life-brand .tool-tab.active small{color:rgba(255,255,255,.72)!important}html[data-theme] body.future-life-brand .tool-tab.active strong{color:#fff!important}
    html[data-theme] body.future-life-brand .panel-heading::after{background:linear-gradient(90deg,var(--theme-accent),var(--theme-line) 45%,transparent)!important}
    html[data-theme] body.future-life-brand .eyebrow,html[data-theme] body.future-life-brand .section-title>span,html[data-theme] body.future-life-brand .ledger-no{background:var(--theme-soft)!important;color:var(--theme-accent)!important}
    html[data-theme] body.future-life-brand .eyebrow.mint{background:color-mix(in srgb,var(--theme-secondary) 14%,var(--theme-paper))!important;color:var(--theme-secondary)!important}
    html[data-theme] body.future-life-brand .card{border-bottom-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand input,html[data-theme] body.future-life-brand select{color:var(--theme-ink)!important;border-bottom-color:color-mix(in srgb,var(--theme-muted) 58%,var(--theme-line))!important;background:transparent!important}
    html[data-theme] body.future-life-brand input:focus,html[data-theme] body.future-life-brand select:focus{border-bottom-color:var(--theme-accent)!important;background:color-mix(in srgb,var(--theme-accent) 5%,var(--theme-paper))!important}
    html[data-theme] body.future-life-brand input::placeholder{color:color-mix(in srgb,var(--theme-muted) 70%,transparent)!important}
    html[data-theme] body.future-life-brand .source,html[data-theme] body.future-life-brand .advanced,html[data-theme] body.future-life-brand .life-auto,html[data-theme] body.future-life-brand .result,html[data-theme] body.future-life-brand .summary-section{background:var(--theme-surface)!important;border-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand .advanced summary,html[data-theme] body.future-life-brand .life-auto summary{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .btn{background:var(--theme-paper)!important;color:var(--theme-ink)!important;border-color:var(--theme-line)!important}html[data-theme] body.future-life-brand .btn.primary{background:linear-gradient(135deg,var(--theme-accent-dark),var(--theme-accent))!important;color:#fff!important;border-color:transparent!important}
    html[data-theme] body.future-life-brand .income-total-box{background:linear-gradient(135deg,var(--theme-accent-dark),var(--theme-accent))!important;box-shadow:0 8px 22px rgba(var(--theme-accent-rgb),.18)!important}.future-life-brand .income-total-box,.future-life-brand .income-total-box input{color:#fff!important}
    html[data-theme] body.future-life-brand .ledger-list,html[data-theme] body.future-life-brand .ledger-row{border-color:var(--theme-line)!important}html[data-theme] body.future-life-brand .ledger-sum{border-bottom-color:var(--theme-accent)!important}html[data-theme] body.future-life-brand .ledger-sum strong{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .net-box{background:linear-gradient(180deg,color-mix(in srgb,var(--theme-secondary) 8%,var(--theme-surface)),var(--theme-paper))!important;box-shadow:inset 0 0 0 1px var(--theme-line)!important}.future-life-brand .net-box strong{color:var(--theme-secondary)!important}
    html[data-theme] body.future-life-brand .principal-box{background:linear-gradient(135deg,var(--theme-soft),color-mix(in srgb,var(--theme-secondary) 7%,var(--theme-paper)))!important;border-color:var(--theme-line)!important}.future-life-brand .principal-box>label{color:var(--theme-muted)!important}.future-life-brand .principal-input{border-bottom-color:var(--theme-accent)!important}.future-life-brand .principal-input input{color:var(--theme-ink)!important}
    html[data-theme] body.future-life-brand .quick-money button{background:var(--theme-paper)!important;border-color:var(--theme-line)!important;color:var(--theme-ink)!important}.future-life-brand .quick-money button:hover{background:var(--theme-soft)!important}
    html[data-theme] body.future-life-brand .matrix-wrap,html[data-theme] body.future-life-brand .chart-card{border-color:var(--theme-line)!important;background:var(--theme-paper)!important}.future-life-brand .compound-matrix{background:var(--theme-paper)!important}.future-life-brand .compound-matrix th,.future-life-brand .compound-matrix td{border-color:var(--theme-line)!important}.future-life-brand .compound-matrix thead th{background:color-mix(in srgb,var(--theme-secondary) 12%,var(--theme-paper))!important;color:var(--theme-ink)!important}.future-life-brand .compound-matrix thead th:first-child{background:var(--theme-secondary)!important;color:#fff!important}.future-life-brand .compound-matrix tbody th{background:color-mix(in srgb,var(--theme-secondary) 17%,var(--theme-paper))!important;color:var(--theme-ink)!important}.future-life-brand .matrix-value{color:var(--theme-ink)!important}.future-life-brand .matrix-gain{color:var(--theme-accent)!important}.future-life-brand .chart-legend{border-top-color:var(--theme-line)!important}
    html[data-theme] body.future-life-brand .disclaimer{background:color-mix(in srgb,var(--theme-muted) 8%,var(--theme-paper))!important;border-color:var(--theme-line)!important;color:var(--theme-muted)!important}.future-life-brand .disclaimer h3,.future-life-brand .disclaimer strong{color:var(--theme-ink)!important}.future-life-brand .disclaimer a{color:var(--theme-accent)!important}
    html[data-theme="dark"] body.future-life-brand .tool-tabs{background:rgba(23,24,23,.88)!important}html[data-theme="dark"] body.future-life-brand .metric .v{color:#e6b0a3!important}html[data-theme="dark"] body.future-life-brand .metric,html[data-theme="dark"] body.future-life-brand .focus{border-color:var(--theme-line)!important}

    @media(max-width:720px){.theme-picker-root{right:max(10px,env(safe-area-inset-right));bottom:max(12px,env(safe-area-inset-bottom))}.theme-picker-btn{min-height:42px;padding:8px 11px}.theme-picker-panel{width:min(252px,calc(100vw - 20px))}}
    @media print{.theme-picker-root{display:none!important}html[data-theme] body.future-life-brand{background:#fff!important;color:#333!important}.future-life-brand .summary-section{background:#fff!important;border-color:#ccc!important}.future-life-brand .summary-section h3,.future-life-brand .summary-section li,.future-life-brand .print-only{color:#222!important}}
  `;

  function resolveTheme(choice){
    return choice==='auto'?(media?.matches?'dark':'warm'):choice;
  }

  function updateMetaColor(theme){
    const map={warm:'#9b5d51',dark:'#232422',forest:'#527260',blue:'#607b96',rose:'#a66776'};
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.setAttribute('content',map[theme]||map.warm);
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
    const label=document.querySelector('[data-current-theme]');
    if(label)label.textContent=THEME_META[choice].label;
  }

  function savedTheme(){
    try{const value=localStorage.getItem(STORAGE_KEY);return VALID.includes(value)?value:'warm'}catch{return 'warm'}
  }

  function buildPicker(){
    if(document.querySelector('.theme-picker-root'))return;
    const root=document.createElement('div');
    root.className='theme-picker-root no-print';
    root.innerHTML=`
      <button class="theme-picker-btn" type="button" aria-expanded="false" aria-controls="themePickerPanel">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 3a9 9 0 1 0 0 18h1.2a2.3 2.3 0 0 0 0-4.6h-.7a1.35 1.35 0 0 1 0-2.7H15A6 6 0 0 0 15 3h-3Zm-4.4 5.1a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Zm-2 4.2a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Zm2.2 4.1a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Zm4.1-8.9a1.15 1.15 0 1 1 0-2.3 1.15 1.15 0 0 1 0 2.3Z"/></svg>
        <span>配色・<b data-current-theme>暖白</b></span>
      </button>
      <div class="theme-picker-panel" id="themePickerPanel" hidden>
        <div class="theme-picker-title"><span>選擇畫面配色</span><small>只記在這台裝置</small></div>
        <div class="theme-options">
          ${VALID.map(key=>{const t=THEME_META[key];return `<button type="button" class="theme-option" data-theme-choice="${key}" aria-pressed="false"><i class="theme-swatch" style="background:${t.swatch}"></i><span><strong>${t.label}</strong><small>${t.desc}</small></span></button>`}).join('')}
        </div>
      </div>`;
    document.body.appendChild(root);

    const trigger=root.querySelector('.theme-picker-btn');
    const panel=root.querySelector('.theme-picker-panel');
    const close=()=>{panel.hidden=true;trigger.setAttribute('aria-expanded','false')};
    trigger.addEventListener('click',()=>{
      const opening=panel.hidden;
      panel.hidden=!opening;
      trigger.setAttribute('aria-expanded',String(opening));
    });
    root.querySelectorAll('.theme-option').forEach(btn=>btn.addEventListener('click',()=>{
      applyTheme(btn.dataset.themeChoice,true);
      close();
    }));
    document.addEventListener('pointerdown',e=>{if(!root.contains(e.target))close()});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
  }

  const style=document.createElement('style');
  style.id='futureLifeThemeStyles';
  style.textContent=css;
  document.head.appendChild(style);
  buildPicker();
  const initial=savedTheme();
  applyTheme(initial,false);

  media?.addEventListener?.('change',()=>{
    if(document.documentElement.dataset.themeChoice==='auto')applyTheme('auto',false);
  });
})();
