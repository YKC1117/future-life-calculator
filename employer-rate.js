(()=>{
  'use strict';

  const $=id=>document.getElementById(id);
  const STANDARD_RATE=6;
  let restoring=false;
  let originalSelfValue=null;

  function toast(text){
    const el=$('toast');
    if(!el)return;
    el.textContent=text;
    el.classList.add('show');
    setTimeout(()=>el.classList.remove('show'),1700);
  }

  function rate(){
    const n=parseFloat($('employerContribution')?.value);
    return Number.isFinite(n)?Math.max(STANDARD_RATE,n):STANDARD_RATE;
  }

  function selfRate(){
    const n=parseFloat($('selfContribution')?.value);
    return Number.isFinite(n)?Math.max(0,n):0;
  }

  function invalidateRetirement(){
    const self=$('selfContribution');
    if(!self||restoring)return;
    self.dispatchEvent(new Event('input',{bubbles:true}));
  }

  function installField(){
    if($('employerContribution'))return;
    const wage=$('pensionWage');
    const pensionBox=$('laborPensionBox');
    const wageField=wage?.closest('.field');
    if(!wageField||!pensionBox)return;

    const oldHint=wageField.querySelector('.hint');
    if(oldHint)oldHint.textContent='以目前月提繳工資，搭配下方雇主提繳比例估算未來累積。';

    const field=document.createElement('div');
    field.className='field';
    field.innerHTML=`
      <label for="employerContribution">雇主提繳比例</label>
      <div class="hint">一般適用勞退新制的受僱勞工，雇主不得低於每月工資 6%；通常維持 6% 即可。</div>
      <input id="employerContribution" type="number" min="6" step="0.5" value="6" inputmode="decimal" aria-label="雇主提繳比例" placeholder="例如：6%">
    `;
    wageField.insertAdjacentElement('afterend',field);

    const input=$('employerContribution');
    input.addEventListener('input',invalidateRetirement);
    input.addEventListener('change',invalidateRetirement);
    input.addEventListener('blur',()=>{
      const n=parseFloat(input.value);
      if(!Number.isFinite(n)||n<STANDARD_RATE){
        input.value=String(STANDARD_RATE);
        invalidateRetirement();
        toast('一般勞退新制雇主提繳不得低於 6%，已調回 6%');
      }
    });
  }

  function decoratePensionResult(){
    const result=$('incomeResult');
    if(!result?.classList.contains('show'))return;
    const metrics=[...result.querySelectorAll('.metric')];
    const pensionMetric=metrics.find(metric=>metric.querySelector('.k')?.textContent?.includes('勞退新制'));
    const sub=pensionMetric?.querySelector('.s');
    if(!sub)return;
    const base=sub.textContent.replace(/｜雇主提繳.*$/,'').trim();
    sub.textContent=`${base}｜雇主提繳 ${rate()}%＋自提 ${selfRate()}%`;
  }

  function decorateSummary(){
    const sections=[...document.querySelectorAll('#summaryContent .summary-section')];
    const retirement=sections.find(section=>section.querySelector('h3')?.textContent?.includes('退休收入'));
    if(!retirement)return;
    const laborPensionLine=[...retirement.querySelectorAll('li')].find(li=>li.textContent.trim().startsWith('勞退：'));
    if(!laborPensionLine)return;
    const clean=laborPensionLine.textContent.replace(/（雇主提繳[^）]*）/g,'').trim();
    laborPensionLine.textContent=`${clean}（雇主提繳 ${rate()}%、個人自提 ${selfRate()}%）`;
  }

  function installCalculationBridge(){
    const btn=$('calcIncome');
    const self=$('selfContribution');
    if(!btn||!self||btn.dataset.employerRateBridge==='1')return;
    btn.dataset.employerRateBridge='1';

    // app.js 原本將雇主提繳固定為 6%。在計算開始前，把高於 6% 的部分暫時併入計算值。
    btn.addEventListener('click',()=>{
      originalSelfValue=self.value;
      const employer=rate();
      const personal=selfRate();
      restoring=true;
      self.value=String(personal+(employer-STANDARD_RATE));
      restoring=false;
    },true);

    // app.js 完成計算後立刻還原使用者看到的自提比例，並把雇主比例補進結果與摘要。
    btn.addEventListener('click',()=>{
      if(originalSelfValue!==null){
        restoring=true;
        self.value=originalSelfValue;
        restoring=false;
        originalSelfValue=null;
      }
      decoratePensionResult();
      decorateSummary();
    });
  }

  installField();
  installCalculationBridge();
})();
