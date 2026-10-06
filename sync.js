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

  // 三大工具頁籤固定留在版面流程中，不使用 sticky/fixed。
  const guard=document.createElement('style');
  guard.textContent=`html body .tool-tabs{position:static!important;top:auto!important;right:auto!important;bottom:auto!important;left:auto!important;z-index:auto!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`;
  document.head.appendChild(guard);

  // 勞退雇主提繳比例：預設 6%，可直接手動輸入更高比例，不設上限。
  const STANDARD_EMPLOYER_RATE=6;
  let restoringSelfRate=false;

  function employerRate(){
    const n=parseFloat($('employerContribution')?.value);
    return Number.isFinite(n)?Math.max(STANDARD_EMPLOYER_RATE,n):STANDARD_EMPLOYER_RATE;
  }

  function personalRate(){
    const n=parseFloat($('selfContribution')?.value);
    return Number.isFinite(n)?Math.max(0,n):0;
  }

  function showToast(text){
    const el=$('toast');
    if(!el)return;
    el.textContent=text;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),1700);
  }

  function installEmployerRateField(){
    if($('employerContribution'))return;
    const wage=$('pensionWage');
    const wageField=wage?.closest('.field');
    if(!wageField)return;

    const hint=wageField.querySelector('.hint');
    if(hint)hint.textContent='以目前月提繳工資，搭配下方雇主提繳比例估算未來累積。';

    const field=document.createElement('div');
    field.className='field';
    field.innerHTML=`<label for="employerContribution">雇主提繳比例</label><div class="hint">預設 6%。可依實際情況直接手動輸入 6% 以上的比例，沒有設定上限。</div><input id="employerContribution" type="number" min="6" step="0.1" value="6" inputmode="decimal" aria-label="雇主提繳比例" placeholder="例如：6%">`;
    wageField.insertAdjacentElement('afterend',field);

    const input=$('employerContribution');
    const invalidate=()=>{
      if(restoringSelfRate)return;
      const self=$('selfContribution');
      self?.dispatchEvent(new Event('input',{bubbles:true}));
    };
    input.addEventListener('input',invalidate);
    input.addEventListener('change',invalidate);
    input.addEventListener('blur',()=>{
      const n=parseFloat(input.value);
      if(!Number.isFinite(n)||n<STANDARD_EMPLOYER_RATE){
        input.value=String(STANDARD_EMPLOYER_RATE);
        invalidate();
        showToast('一般勞退新制雇主提繳不得低於 6%，已調回 6%');
      }
    });
  }

  function decorateEmployerRate(){
    const result=$('incomeResult');
    if(result?.classList.contains('show')){
      const metric=[...result.querySelectorAll('.metric')].find(m=>m.querySelector('.k')?.textContent?.includes('勞退新制'));
      const sub=metric?.querySelector('.s');
      if(sub){
        const base=sub.textContent.replace(/｜雇主提繳.*$/,'').trim();
        sub.textContent=`${base}｜雇主提繳 ${employerRate()}%＋自提 ${personalRate()}%`;
      }
    }

    const summary=$('summaryContent');
    const pensionLine=[...(summary?.querySelectorAll('li')||[])].find(li=>li.textContent.trim().startsWith('勞退：'));
    if(pensionLine && !pensionLine.textContent.includes('雇主提繳')){
      pensionLine.append(document.createTextNode(` 雇主提繳 ${employerRate()}%｜自提 ${personalRate()}%。`));
    }
  }

  function installEmployerRateBridge(){
    const btn=$('calcIncome');
    const self=$('selfContribution');
    if(!btn||!self||btn.dataset.employerRateBridge==='1')return;
    btn.dataset.employerRateBridge='1';

    btn.addEventListener('click',()=>{
      const original=self.value;
      const combinedPersonalEquivalent=personalRate()+(employerRate()-STANDARD_EMPLOYER_RATE);
      restoringSelfRate=true;
      self.value=String(combinedPersonalEquivalent);
      restoringSelfRate=false;
      setTimeout(()=>{
        restoringSelfRate=true;
        self.value=original;
        restoringSelfRate=false;
        decorateEmployerRate();
      },0);
    },true);

    ['refreshSummaryBtn','copyBtn','downloadBtn','printBtn'].forEach(id=>{
      $(id)?.addEventListener('click',()=>setTimeout(decorateEmployerRate,0),true);
    });
  }

  installEmployerRateField();
  installEmployerRateBridge();

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
