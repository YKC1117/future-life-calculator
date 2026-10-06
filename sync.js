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

  function placeThemePickerInHeader(){
    const root=document.querySelector('.theme-picker-root');
    const header=document.querySelector('.site-head');
    if(!root||!header)return;
    if(root.parentElement!==header)header.appendChild(root);
    if(document.getElementById('compactThemePickerStyle'))return;
    const style=document.createElement('style');
    style.id='compactThemePickerStyle';
    style.textContent=`
      .site-head{position:relative}
      .site-head .theme-picker-root{
        position:absolute!important;
        top:5px!important;
        right:2px!important;
        bottom:auto!important;
        left:auto!important;
        z-index:8!important;
        width:auto!important;
        height:auto!important;
        margin:0!important;
        padding:0!important;
      }
      .site-head .theme-picker-btn{
        width:34px!important;
        height:34px!important;
        min-width:34px!important;
        min-height:34px!important;
        padding:0!important;
        margin:0!important;
        display:grid!important;
        place-items:center!important;
        gap:0!important;
        border-radius:10px!important;
        box-shadow:0 3px 10px rgba(45,35,31,.10)!important;
      }
      .site-head .theme-picker-btn svg{width:15px!important;height:15px!important}
      .site-head .theme-picker-btn span{display:none!important}
      .site-head .theme-picker-panel{
        top:40px!important;
        right:0!important;
        bottom:auto!important;
        left:auto!important;
        width:232px!important;
        max-width:calc(100vw - 20px)!important;
        margin:0!important;
        padding:10px!important;
        border-radius:15px!important;
        box-sizing:border-box!important;
      }
      .site-head .theme-picker-title{padding:1px 3px 8px!important;font-size:12px!important}
      .site-head .theme-picker-title small{font-size:10px!important}
      .site-head .theme-options{gap:6px!important}
      .site-head .theme-option{min-height:46px!important;padding:7px!important;border-radius:10px!important}
      .site-head .theme-option.active{padding:6px!important}
      .site-head .theme-swatch{width:21px!important;height:21px!important}
      @media(max-width:560px){
        .site-head .theme-picker-root{top:2px!important;right:1px!important}
        .site-head .theme-picker-btn{width:31px!important;height:31px!important;min-width:31px!important;min-height:31px!important;border-radius:9px!important}
        .site-head .theme-picker-btn svg{width:14px!important;height:14px!important}
        .site-head .theme-picker-panel{top:37px!important;width:222px!important;max-width:calc(100vw - 18px)!important}
      }
      @media print{.site-head .theme-picker-root{display:none!important}}
    `;
    document.head.appendChild(style);
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
