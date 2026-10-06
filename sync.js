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

  function installCompactThemePicker(){
    if(document.getElementById('compactThemePickerStyle'))return;
    const style=document.createElement('style');
    style.id='compactThemePickerStyle';
    style.textContent=`
      html body .theme-picker-root{
        position:fixed!important;
        top:max(10px,env(safe-area-inset-top))!important;
        right:max(10px,env(safe-area-inset-right))!important;
        bottom:auto!important;
        left:auto!important;
        z-index:90!important;
        width:auto!important;
        height:auto!important;
        margin:0!important;
        padding:0!important;
        pointer-events:none;
      }
      html body .theme-picker-btn{
        pointer-events:auto;
        width:36px!important;
        height:36px!important;
        min-width:36px!important;
        min-height:36px!important;
        padding:0!important;
        margin:0!important;
        display:grid!important;
        place-items:center!important;
        gap:0!important;
        border-radius:50%!important;
        box-shadow:0 5px 16px rgba(45,35,31,.13)!important;
      }
      html body .theme-picker-btn svg{width:16px!important;height:16px!important}
      html body .theme-picker-btn [data-current-theme]{display:none!important}
      html body .theme-picker-panel{
        pointer-events:auto;
        top:43px!important;
        right:0!important;
        bottom:auto!important;
        left:auto!important;
        width:236px!important;
        max-width:calc(100vw - 20px)!important;
        margin:0!important;
        padding:10px!important;
        border-radius:15px!important;
        box-sizing:border-box!important;
      }
      html body .theme-picker-title{padding:1px 3px 8px!important;font-size:12px!important}
      html body .theme-picker-title small{font-size:10px!important}
      html body .theme-options{gap:6px!important}
      html body .theme-option{min-height:46px!important;padding:7px!important;border-radius:10px!important}
      html body .theme-option.active{padding:6px!important}
      html body .theme-swatch{width:21px!important;height:21px!important}
      @media(max-width:560px){
        html body .theme-picker-root{top:max(8px,env(safe-area-inset-top))!important;right:max(8px,env(safe-area-inset-right))!important}
        html body .theme-picker-btn{width:32px!important;height:32px!important;min-width:32px!important;min-height:32px!important}
        html body .theme-picker-btn svg{width:14px!important;height:14px!important}
        html body .theme-picker-panel{top:38px!important;width:226px!important;max-width:calc(100vw - 16px)!important}
      }
      @media print{html body .theme-picker-root{display:none!important}}
    `;
    document.head.appendChild(style);
  }
  installCompactThemePicker();

  window.addEventListener('load',()=>{
    if(document.querySelector('script[data-theme-loader]'))return;
    const script=document.createElement('script');
    script.src='./theme.js';
    script.dataset.themeLoader='true';
    document.body.appendChild(script);
  },{once:true});
})();
