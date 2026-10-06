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

  // 直接禁止三大工具頁籤使用 sticky/fixed，避免手機畫面被遮住。
  const guard=document.createElement('style');
  guard.textContent=`html body .tool-tabs{position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;z-index:auto!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`;
  document.head.appendChild(guard);

  function loadScript(src,dataKey){
    if(document.querySelector(`script[${dataKey}]`))return;
    const script=document.createElement('script');
    script.src=src;
    script.setAttribute(dataKey,'true');
    document.body.appendChild(script);
  }

  window.addEventListener('load',()=>{
    loadScript('./theme.js?v=12','data-theme-loader');
    loadScript('./pdf.js?v=13','data-pdf-loader');
  },{once:true});
})();
