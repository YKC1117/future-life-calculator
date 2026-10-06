(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const retirementIds=['age','retireAge','laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears','birthROC','laborClaimAge','selfContribution','pensionReturn','nationalMode','useLaborInsurance','useLaborPension','useNationalPension'];
  const retirementValueIds=['age','retireAge','laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears'];
  const gapIds=['desiredSpend','otherIncome','inflationRate'];
  const reserveIds=['currentReserve','monthlyReserve','reserveYears','reserveRate'];
  const reserveValueIds=['currentReserve','monthlyReserve','reserveRate'];
  const filled=id=>{const el=$(id);return !!el&&String(el.value).trim()!==''};
  const hasAny=ids=>ids.some(filled);
  const click=id=>{const el=$(id);if(el)el.click()};
  const shown=id=>$(id)?.classList.contains('show');
  let timer=null;

  function refreshVisible(changedId){
    clearTimeout(timer);
    timer=setTimeout(()=>{
      if(retirementIds.includes(changedId)&&shown('incomeResult')){
        click('calcIncome');
        if(shown('gapResult'))click('calcGap');
      }else if(gapIds.includes(changedId)&&shown('gapResult')){
        click('calcGap');
      }else if(reserveIds.includes(changedId)&&shown('reserveResult')){
        click('calcReserve');
      }
    },180);
  }

  document.addEventListener('input',e=>refreshVisible(e.target?.id),true);
  document.addEventListener('change',e=>refreshVisible(e.target?.id),true);

  $('calcGap')?.addEventListener('click',()=>{
    if(hasAny(retirementValueIds))click('calcIncome');
  },true);

  function refreshAllAvailable(){
    if(hasAny(retirementValueIds))click('calcIncome');
    if(hasAny(gapIds))click('calcGap');
    if(hasAny(reserveValueIds))click('calcReserve');
  }

  ['refreshSummaryBtn','printBtn','copyBtn','downloadBtn'].forEach(id=>{
    $(id)?.addEventListener('click',refreshAllAvailable,true);
  });

  function installSimpleHeaderStyles(){
    if(document.getElementById('simpleHeaderThemeStyle'))return;
    const style=document.createElement('style');
    style.id='simpleHeaderThemeStyle';
    style.textContent=`
      /* 手機與平板不再讓三個工具頁籤懸浮，捲動時跟著頁面走。 */
      html body.future-life-brand .tool-tabs{
        position:static!important;
        top:auto!important;
        z-index:auto!important;
        backdrop-filter:none!important;
        -webkit-backdrop-filter:none!important;
      }
      .site-head-toprow{
        display:flex;
        align-items:flex-start;
        justify-content:space-between;
        gap:10px;
        width:100%;
      }
      .site-head-toprow>h1{min-width:0;flex:1 1 auto}
      .site-head-toprow .theme-picker-root{
        position:relative!important;
        inset:auto!important;
        top:auto!important;
        right:auto!important;
        bottom:auto!important;
        left:auto!important;
        z-index:12!important;
        width:auto!important;
        height:auto!important;
        margin:1px 0 0!important;
        padding:0!important;
        flex:0 0 auto;
      }
      .site-head-toprow .theme-picker-btn{
        width:30px!important;
        height:30px!important;
        min-width:30px!important;
        min-height:30px!important;
        padding:0!important;
        margin:0!important;
        display:grid!important;
        place-items:center!important;
        gap:0!important;
        border-radius:8px!important;
        box-shadow:none!important;
        background:transparent!important;
      }
      .site-head-toprow .theme-picker-btn:hover{background:var(--theme-soft,#f5e8e2)!important}
      .site-head-toprow .theme-picker-btn svg{width:15px!important;height:15px!important}
      .site-head-toprow .theme-picker-btn span{display:none!important}
      .site-head-toprow .theme-picker-panel{
        position:absolute!important;
        top:36px!important;
        right:0!important;
        bottom:auto!important;
        left:auto!important;
        width:224px!important;
        max-width:calc(100vw - 20px)!important;
        margin:0!important;
        padding:9px!important;
        border-radius:13px!important;
        box-sizing:border-box!important;
      }
      .site-head-toprow .theme-picker-title{padding:1px 3px 7px!important;font-size:12px!important}
      .site-head-toprow .theme-picker-title small{font-size:9px!important}
      .site-head-toprow .theme-options{gap:5px!important}
      .site-head-toprow .theme-option{min-height:43px!important;padding:6px!important;border-radius:9px!important}
      .site-head-toprow .theme-option.active{padding:5px!important}
      .site-head-toprow .theme-swatch{width:19px!important;height:19px!important}
      @media(max-width:560px){
        .site-head-toprow{gap:7px}
        .site-head-toprow .theme-picker-root{margin-top:0!important}
        .site-head-toprow .theme-picker-btn{width:27px!important;height:27px!important;min-width:27px!important;min-height:27px!important;border-radius:7px!important}
        .site-head-toprow .theme-picker-btn svg{width:13px!important;height:13px!important}
        .site-head-toprow .theme-picker-panel{top:33px!important;width:216px!important;max-width:calc(100vw - 16px)!important}
      }
      @media print{.site-head-toprow .theme-picker-root{display:none!important}}
    `;
    document.head.appendChild(style);
  }

  function placeThemePickerInHeader(){
    const root=document.querySelector('.theme-picker-root');
    const header=document.querySelector('.site-head');
    const title=header?.querySelector('h1');
    if(!root||!header||!title)return;

    let row=header.querySelector('.site-head-toprow');
    if(!row){
      row=document.createElement('div');
      row.className='site-head-toprow';
      header.insertBefore(row,title);
      row.appendChild(title);
    }
    row.appendChild(root);
    installSimpleHeaderStyles();
  }

  window.addEventListener('load',()=>{
    const existing=document.querySelector('script[data-theme-loader]');
    if(existing){
      if(document.querySelector('.theme-picker-root'))placeThemePickerInHeader();
      else existing.addEventListener('load',()=>requestAnimationFrame(placeThemePickerInHeader),{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src='./theme.js';
    script.dataset.themeLoader='true';
    script.addEventListener('load',()=>requestAnimationFrame(placeThemePickerInHeader),{once:true});
    document.body.appendChild(script);
  },{once:true});
})();
