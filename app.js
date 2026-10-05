(()=>{
  'use strict';
  const $=id=>document.getElementById(id);
  const state={income:null,gap:null,reserve:null};
  const N=id=>{const el=$(id);const n=parseFloat(el?.value);return Number.isFinite(n)?n:0};
  const filled=id=>{const el=$(id);return !!el && String(el.value).trim()!==''};
  const money=n=>Number.isFinite(n)?new Intl.NumberFormat('zh-TW',{style:'currency',currency:'TWD',maximumFractionDigits:0}).format(Math.round(n)):'—';
  const pct=n=>`${Math.round(n*100)}%`;
  const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));

  function toast(text){const el=$('toast');if(!el)return;el.textContent=text;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),1600)}
  function futureValue(principal,monthly,annualRate,years){const months=Math.max(0,years*12);const r=annualRate/12;if(months===0)return principal;if(Math.abs(r)<1e-12)return principal+monthly*months;return principal*Math.pow(1+r,months)+monthly*((Math.pow(1+r,months)-1)/r)}
  function laborInsuranceMonthly(avgSalary,years,adjustYears){const a=avgSalary*years*0.00775+3000;const b=avgSalary*years*0.0155;const base=Math.max(a,b);const adj=clamp(adjustYears*.04,-.20,.20);return {a,b,base,monthly:base*(1+adj),adj}}
  function legalLaborAge(rocBirthYear){if(!Number.isFinite(rocBirthYear))return null;if(rocBirthYear<=46)return 60;if(rocBirthYear===47)return 61;if(rocBirthYear===48)return 62;if(rocBirthYear===49)return 63;if(rocBirthYear===50)return 64;return 65}

  // 內政部111年全國簡易生命表（全體）平均餘命；勞退規定採四捨五入至整數。
  const lifeExpectancy111={
    60:23.47,61:22.65,62:21.83,63:21.02,64:20.21,65:19.41,66:18.62,67:17.84,68:17.06,69:16.30,
    70:15.55,71:14.82,72:14.10,73:13.39,74:12.70,75:12.02,76:11.35,77:10.70,78:10.06,79:9.44,
    80:8.82,81:8.21,82:7.62,83:7.03,84:6.44,85:5.85
  };
  function laborPensionRemainingLife(age){
    const a=Math.round(age);
    if(a<60||a>85||!lifeExpectancy111[a])return null;
    return Math.round(lifeExpectancy111[a]);
  }
  function annuityPresentValueFactor(remainingYears,annualRate=.011473){
    if(!Number.isFinite(remainingYears)||remainingYears<=0)return null;
    const m=Math.pow(1+annualRate,1/12)-1;
    return ((1-Math.pow(1/(1+annualRate),remainingYears))/(12*m))*Math.pow(1+annualRate,1/12);
  }
  function laborPensionQuick(currentBalance,wage,yearsToRetire,employerRate,selfRate,annualReturn,claimAge){
    const monthlyContribution=wage*(employerRate+selfRate);
    const projected=futureValue(currentBalance,monthlyContribution,annualReturn,yearsToRetire);
    const remainingLife=laborPensionRemainingLife(claimAge);
    const factor=annuityPresentValueFactor(remainingLife,.011473);
    return {monthlyContribution,projected,remainingLife,factor,monthly:factor?projected/factor/12:null};
  }
  function nationalPensionMonthly(years,mode){const insured=21103;const a=insured*years*0.0065+4049;const b=insured*years*0.013;return {insured,a,b,monthly:mode==='b'?b:Math.max(a,b),modeUsed:mode==='b'?'B':'A/B擇優'}}

  function toggleSource(checkId,boxId){const c=$(checkId),box=$(boxId);if(!c||!box)return;const sync=()=>box.classList.toggle('off',!c.checked);c.addEventListener('change',sync);sync()}
  toggleSource('useLaborInsurance','laborInsuranceBox');toggleSource('useLaborPension','laborPensionBox');toggleSource('useNationalPension','nationalPensionBox');

  function sourceMetric(label,value,sub){
    const text=Number.isFinite(value)?money(value):'尚未估算';
    return `<div class="metric"><div class="k">${label}</div><div class="v">${text}</div><div class="s">${sub}</div></div>`;
  }

  function calcIncome(){
    const age=filled('age')?N('age'):null;
    const retireAge=filled('retireAge')?N('retireAge'):null;
    let yearsToRetire=null;
    if(age!==null && retireAge!==null){
      if(retireAge>age) yearsToRetire=retireAge-age;
      else toast('退休年齡需大於目前年齡；其他已填資料仍會先整理');
    }

    let labor=null,laborStartAge=null,laborLegalAge=null,laborClaimAge=null,laborAdjYears=null;
    let pension=null,pensionProjected=null,pensionRemainingLife=null;
    let national=null,nationalModeUsed=null;
    const missing=[],notes=[];

    if($('useLaborInsurance').checked){
      if(filled('laborSalary') && filled('laborYears')){
        const ly=N('laborYears');
        if(ly<15){
          const ny=($('useNationalPension').checked && filled('nationalYears'))?N('nationalYears'):0;
          if(ny>0 && ly+ny>=15){
            laborStartAge=65;
            laborClaimAge=65;
            laborAdjYears=0;
            labor=laborInsuranceMonthly(N('laborSalary'),ly,0).monthly;
            notes.push('勞保年資未滿15年，但本次填寫之勞保＋國保年資合計已滿15年；依現行規定以65歲可請領勞保老年年金的情境估算，且不套用展延加給。');
          }else{
            missing.push('勞保年資未滿15年，原則上不能單獨請領老年年金；若65歲時併國保年資合計滿15年，可能符合勞保老年年金請領條件');
          }
        }else{
          const birthROC=filled('birthROC')?N('birthROC'):null;
          const approxBirthROC=birthROC===null && age!==null ? (new Date().getFullYear()-1911-age) : null;
          laborLegalAge=legalLaborAge(birthROC??approxBirthROC);
          if(birthROC===null && Number.isFinite(approxBirthROC)) notes.push(`未填出生年次，先依目前年齡概估約為民國 ${approxBirthROC} 年次；若生日尚未到，實際年次可能差 1 年。`);
          laborClaimAge=filled('laborClaimAge')?N('laborClaimAge'):retireAge;
          let effectiveClaimAge=laborClaimAge;
          let adjust=0;
          if(Number.isFinite(laborLegalAge) && Number.isFinite(laborClaimAge)){
            const earliest=laborLegalAge-5;
            if(laborClaimAge<earliest){
              effectiveClaimAge=earliest;
              adjust=-5;
              notes.push(`依出生年次推估勞保法定請領年齡為 ${laborLegalAge} 歲，最早約 ${earliest} 歲可提前請領；若更早退休，該筆收入仍須等到可請領年齡才開始。`);
            }else{
              adjust=clamp(laborClaimAge-laborLegalAge,-5,5);
            }
          }else{
            notes.push('目前資料不足以判斷勞保法定請領年齡，因此暫不套用提前減給／延後增給；可補上目前年齡或出生年次。');
          }
          laborAdjYears=adjust;
          laborStartAge=Number.isFinite(effectiveClaimAge)?effectiveClaimAge:(retireAge??laborLegalAge);
          labor=laborInsuranceMonthly(N('laborSalary'),ly,adjust).monthly;
        }
      }else if(filled('laborSalary') || filled('laborYears')){
        missing.push('勞保尚缺最高60個月平均投保薪資或年資');
      }
    }

    if($('useLaborPension').checked){
      const pensionHasAny=['pensionBalance','pensionWage','pensionYears'].some(filled);
      if(filled('pensionBalance') && filled('pensionWage') && filled('pensionYears') && yearsToRetire!==null && retireAge!==null){
        const py=N('pensionYears');
        const projection=laborPensionQuick(N('pensionBalance'),N('pensionWage'),yearsToRetire,.06,N('selfContribution')/100,N('pensionReturn')/100,retireAge);
        pensionProjected=projection.projected;
        pensionRemainingLife=projection.remainingLife;
        if(py<15){
          missing.push('勞退新制預估提繳年資未滿15年，原則上應請領一次退休金，不列月退休金');
        }else if(retireAge<60){
          missing.push('勞退月退休金原則上須年滿60歲；未滿60歲僅特定喪失工作能力情形可提前請領');
        }else if(!Number.isFinite(projection.monthly)){
          missing.push('勞退月退休金目前僅支援60～85歲的現行生命表方向估算');
        }else{
          pension=projection.monthly;
          notes.push(`勞退首期月退依現行1.1473%利率及111年全國簡易生命表方向估算（退休年齡 ${retireAge} 歲，平均餘命約 ${pensionRemainingLife} 年）。`);
        }
      }else if(pensionHasAny){
        missing.push('勞退尚缺專戶、月提繳工資、預估提繳年資或退休年數');
      }
    }

    if($('useNationalPension').checked){
      if(filled('nationalYears')){
        const forceB=Number.isFinite(labor);
        const chosenMode=forceB?'b':$('nationalMode').value;
        const np=nationalPensionMonthly(N('nationalYears'),chosenMode);
        national=np.monthly;nationalModeUsed=np.modeUsed;
        if(forceB)notes.push('因本次同時估算勞保老年年金，國保老年年金依現行規定以 B 式估算。');
      }else{
        missing.push('國民年金尚缺年資');
      }
    }

    const sources=[];
    if(Number.isFinite(labor))sources.push({name:'勞保老年年金',amount:labor,startAge:laborStartAge});
    if(Number.isFinite(pension))sources.push({name:'勞退新制',amount:pension,startAge:retireAge});
    if(Number.isFinite(national))sources.push({name:'國民年金',amount:national,startAge:65});
    const totalEventually=sources.reduce((a,s)=>a+s.amount,0);
    const totalAtRetire=retireAge!==null?sources.filter(s=>!Number.isFinite(s.startAge)||s.startAge<=retireAge).reduce((a,s)=>a+s.amount,0):totalEventually;
    const laterSources=retireAge!==null?sources.filter(s=>Number.isFinite(s.startAge)&&s.startAge>retireAge):[];
    const anyInput=[age,retireAge].some(v=>v!==null) || ['laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears'].some(filled);
    if(!anyInput && !sources.length){toast('目前還沒有可整理的退休資料');renderSummary();return}

    state.income={age,retireAge,yearsToRetire,labor,laborStartAge,laborLegalAge,laborClaimAge,laborAdjYears,pension,pensionProjected,pensionRemainingLife,national,nationalModeUsed,totalAtRetire,totalEventually,knownCount:sources.length,missing,notes,laterSources};

    const laborSub=Number.isFinite(labor)?`${Number.isFinite(laborStartAge)?`約 ${laborStartAge} 歲起・`:''}每月快估`:($('useLaborInsurance').checked?'可先補薪資與年資':'未納入');
    const pensionSub=Number.isFinite(pension)?'首期月退方向估算':(Number.isFinite(pensionProjected)?`專戶退休時約 ${money(pensionProjected)}`:($('useLaborPension').checked?'可先補勞退資料':'未納入'));
    const nationalSub=Number.isFinite(national)?`65歲起・${nationalModeUsed==='B'?'B式':'A/B擇優'}`:($('useNationalPension').checked?'可先補國保年資':'未納入');
    const timingText=retireAge!==null?`退休當下（${retireAge}歲）已知合計約 <strong>${money(totalAtRetire)}</strong>/月。`:`目前已估項目合計約 <strong>${money(totalEventually)}</strong>/月（尚未檢核各項開始請領時點）。`;
    const laterText=laterSources.length?`<br><span style="color:#8b7c75">較晚開始：${laterSources.map(s=>`${s.name}約 ${s.startAge} 歲起`).join('；')}。全部已估項目開始後合計約 ${money(totalEventually)}/月。</span>`:'';
    const noteText=[...notes,...missing].length?`<br><span style="color:#8b7c75">${[...notes,...missing].join('；')}</span>`:'';
    $('incomeResult').innerHTML=`<div class="metric-grid">${sourceMetric('勞保老年年金',labor,laborSub)}${sourceMetric('勞退新制',pension,pensionSub)}${sourceMetric('國民年金',national,nationalSub)}</div><div class="focus"><strong>目前試算：</strong>${sources.length?timingText:'已保留目前填寫內容，尚不足以計算月領金額。'}${laterText}${noteText}</div>`;
    $('incomeResult').classList.add('show');
    if(yearsToRetire!==null && !filled('reserveYears'))$('reserveYears').value=yearsToRetire;
    renderSummary();
  }

  function calcGap(){
    const hasSpend=filled('desiredSpend');
    const hasOther=filled('otherIncome');
    if(!hasSpend && !hasOther){toast('目前還沒有生活需求或其他收入資料');renderSummary();return}

    const desired=hasSpend?N('desiredSpend'):null;
    const other=hasOther?N('otherIncome'):0;
    const years=state.income?.yearsToRetire ?? ((filled('retireAge')&&filled('age')&&N('retireAge')>N('age'))?N('retireAge')-N('age'):null);
    const inflation=filled('inflationRate')?N('inflationRate')/100:0;
    const futureSpend=desired!==null ? ((inflation>0&&years!==null)?desired*Math.pow(1+inflation,years):desired) : null;
    const pensionIncome=state.income?.knownCount?state.income.totalAtRetire:null;
    const totalIncome=(pensionIncome??0)+other;
    const activeSourceCount=[$('useLaborInsurance').checked,$('useLaborPension').checked,$('useNationalPension').checked].filter(Boolean).length;
    const incomeIncomplete=!state.income || state.income.knownCount<activeSourceCount;
    const gap=futureSpend!==null?Math.max(0,futureSpend-totalIncome):null;
    const surplus=futureSpend!==null?Math.max(0,totalIncome-futureSpend):null;
    const simple20=gap!==null?gap*240:null;
    const replacement=(futureSpend&&futureSpend>0)?totalIncome/futureSpend:null;
    const laterSources=state.income?.laterSources??[];
    state.gap={desired,futureSpend,other,pensionIncome,totalIncome,gap,surplus,simple20,replacement,inflation,incomeIncomplete,laterSources};

    if(futureSpend===null){
      $('gapResult').innerHTML=`<div class="focus"><strong>目前已記錄：</strong>其他固定收入約 ${money(other)}/月。退休生活費尚未填寫，因此暫不計算生活缺口。</div>`;
    }else{
      $('gapResult').innerHTML=`<div class="metric-grid"><div class="metric"><div class="k">退休當下已知收入</div><div class="v">${money(totalIncome)}</div><div class="s">已到可請領時點的退休收入＋其他收入</div></div><div class="metric"><div class="k">退休每月需要</div><div class="v">${money(futureSpend)}</div><div class="s">${inflation>0?'已納入通膨':'以今天金額估算'}</div></div><div class="metric"><div class="k">目前可見差額</div><div class="v">${money(gap)}</div><div class="s">${replacement!==null?`收入替代約 ${pct(replacement)}`:'依目前已知資料'}</div></div></div><div class="focus">${gap>0?`依目前已知資料，20 年直算的生活差額約 <strong>${money(simple20)}</strong>。`:`依目前已知資料，退休收入大致可覆蓋設定的生活費。`}${laterSources.length?`<br><span style="color:#8b7c75">${laterSources.map(s=>`${s.name}約 ${s.startAge} 歲後才開始`).join('；')}，之後可再補上這些收入。</span>`:''}${incomeIncomplete?`<br><span style="color:#8b7c75">尚有退休收入項目未完成，因此這個差額可能還會改變。</span>`:''}</div>`;
    }
    $('gapResult').classList.add('show');renderSummary();
  }

  function calcReserve(){
    const hasCurrent=filled('currentReserve'),hasMonthly=filled('monthlyReserve'),hasYears=filled('reserveYears'),hasRate=filled('reserveRate');
    if(!hasCurrent && !hasMonthly && !hasYears && !hasRate){toast('目前還沒有未來準備資料');renderSummary();return}
    if(!hasYears || !hasRate){
      state.reserve={current:hasCurrent?N('currentReserve'):null,monthly:hasMonthly?N('monthlyReserve'):null,years:hasYears?N('reserveYears'):null,rate:hasRate?N('reserveRate')/100:null,final:null,invested:null,growth:null,target:state.gap?.simple20??null,coverage:null};
      $('reserveResult').innerHTML=`<div class="focus"><strong>目前資料已保留：</strong>${hasCurrent?`目前準備 ${money(N('currentReserve'))}`:''}${hasCurrent&&hasMonthly?'；':''}${hasMonthly?`每月準備 ${money(N('monthlyReserve'))}`:''}。要估算未來金額，再補「準備年數」與「預估年化報酬率」即可。</div>`;
      $('reserveResult').classList.add('show');renderSummary();return;
    }
    const current=hasCurrent?N('currentReserve'):0,monthly=hasMonthly?N('monthlyReserve'):0,years=N('reserveYears'),rate=N('reserveRate')/100;
    const final=futureValue(current,monthly,rate,years),invested=current+monthly*years*12,growth=final-invested;
    const target=state.gap?.simple20??null,coverage=(target&&target>0)?final/target:null;
    state.reserve={current,monthly,years,rate,final,invested,growth,target,coverage};
    $('reserveResult').innerHTML=`<div class="metric-grid"><div class="metric"><div class="k">自己累積投入</div><div class="v">${money(invested)}</div></div><div class="metric"><div class="k">期末情境估值</div><div class="v">${money(final)}</div></div><div class="metric"><div class="k">其中情境成長</div><div class="v">${money(growth)}</div><div class="s">非保證報酬</div></div></div><div class="focus">${coverage!==null?`若與前一步 20 年粗估缺口相比，目前情境約可準備到 <strong>${pct(coverage)}</strong>。`:`以年化 ${(rate*100).toFixed(1)}% 做純情境試算，${years} 年後約為 <strong>${money(final)}</strong>。`}</div>`;
    $('reserveResult').classList.add('show');renderSummary();
  }

  function renderSummary(){
    const parts=[];
    const incomeInputs=['age','retireAge','birthROC','laborClaimAge','laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears'].some(filled);
    if(state.income || incomeInputs){
      const lines=[];const s=state.income;
      if(filled('age'))lines.push(`目前年齡：${N('age')} 歲。`);
      if(filled('retireAge'))lines.push(`預計退休年齡：${N('retireAge')} 歲。`);
      if(filled('birthROC'))lines.push(`出生年次（試算用）：民國 ${N('birthROC')} 年。`);
      if(filled('laborClaimAge'))lines.push(`預計勞保請領年齡：${N('laborClaimAge')} 歲。`);
      if(s?.yearsToRetire!==null && s?.yearsToRetire!==undefined)lines.push(`距離預計退休約 ${s.yearsToRetire} 年。`);
      if($('useLaborInsurance').checked && (filled('laborSalary')||filled('laborYears')||Number.isFinite(s?.labor))){
        const raw=[];if(filled('laborSalary'))raw.push(`最高60個月平均投保薪資 ${money(N('laborSalary'))}`);if(filled('laborYears'))raw.push(`年資 ${N('laborYears')} 年`);
        lines.push(`勞保：${Number.isFinite(s?.labor)?`月領快估約 ${money(s.labor)}${Number.isFinite(s?.laborStartAge)?`，約 ${s.laborStartAge} 歲起`:''}`:'尚未完成估算'}${raw.length?`（${raw.join('、')}）`:''}。`);
      }
      if($('useLaborPension').checked && (filled('pensionBalance')||filled('pensionWage')||filled('pensionYears')||Number.isFinite(s?.pension))){
        const raw=[];if(filled('pensionBalance'))raw.push(`目前專戶 ${money(N('pensionBalance'))}`);if(filled('pensionWage'))raw.push(`月提繳工資 ${money(N('pensionWage'))}`);if(filled('pensionYears'))raw.push(`退休時提繳年資 ${N('pensionYears')} 年`);
        let text=Number.isFinite(s?.pension)?`首期月退方向估算約 ${money(s.pension)}`:'尚未完成月退估算';
        if(!Number.isFinite(s?.pension)&&Number.isFinite(s?.pensionProjected))text+=`；退休時專戶情境約 ${money(s.pensionProjected)}`;
        lines.push(`勞退：${text}${raw.length?`（${raw.join('、')}）`:''}。`);
      }
      if($('useNationalPension').checked && (filled('nationalYears')||Number.isFinite(s?.national))){
        lines.push(`國民年金：${Number.isFinite(s?.national)?`65歲起月領快估約 ${money(s.national)}（${s.nationalModeUsed==='B'?'B式':'A/B擇優'}）`:'尚未完成估算'}${filled('nationalYears')?`（年資 ${N('nationalYears')} 年）`:''}。`);
      }
      if(s?.knownCount>0){
        if(s.retireAge!==null)lines.push(`<strong>退休當下已到請領時點的已估收入合計約 ${money(s.totalAtRetire)}/月。</strong>`);
        if(Math.abs((s.totalEventually??0)-(s.totalAtRetire??0))>1)lines.push(`全部已估項目開始後，合計約 ${money(s.totalEventually)}/月。`);
      }
      if(s?.missing?.length)lines.push(`尚未完整估算：${s.missing.join('；')}。`);
      parts.push(`<section class="summary-section"><h3>退休收入</h3><ul>${lines.map(x=>`<li>${x}</li>`).join('')}</ul></section>`);
    }

    if(state.gap || filled('desiredSpend') || filled('otherIncome') || (filled('inflationRate') && N('inflationRate')!==0)){
      const lines=[];const s=state.gap;
      if(filled('desiredSpend'))lines.push(`退休後每月生活費目標：${money(N('desiredSpend'))}。`);
      if(filled('otherIncome'))lines.push(`其他固定收入：約 ${money(N('otherIncome'))}/月。`);
      if(filled('inflationRate') && N('inflationRate')!==0)lines.push(`通膨情境：${N('inflationRate')}%。`);
      if(s?.futureSpend!==null && s?.futureSpend!==undefined)lines.push(`依目前條件換算的退休每月需要：約 ${money(s.futureSpend)}。`);
      if(s?.gap!==null && s?.gap!==undefined)lines.push(s.gap>0?`退休當下目前可見每月差額約 ${money(s.gap)}；20 年直算約 ${money(s.simple20)}。`:`依目前已知資料，退休當下收入大致可覆蓋設定生活費。`);
      if(s?.laterSources?.length)lines.push(`${s.laterSources.map(x=>`${x.name}約 ${x.startAge} 歲後才開始`).join('；')}。`);
      if(s?.incomeIncomplete)lines.push('尚有退休收入項目未完成，差額仍可能調整。');
      parts.push(`<section class="summary-section"><h3>退休生活</h3><ul>${lines.map(x=>`<li>${x}</li>`).join('')}</ul></section>`);
    }

    if(state.reserve || ['currentReserve','monthlyReserve','reserveYears','reserveRate'].some(filled)){
      const lines=[];const s=state.reserve;
      if(filled('currentReserve'))lines.push(`目前已準備：${money(N('currentReserve'))}。`);
      if(filled('monthlyReserve'))lines.push(`每月持續準備：${money(N('monthlyReserve'))}。`);
      if(filled('reserveYears'))lines.push(`規劃期間：${N('reserveYears')} 年。`);
      if(filled('reserveRate'))lines.push(`年化報酬情境：${N('reserveRate')}%（僅為試算假設）。`);
      if(Number.isFinite(s?.final))lines.push(`<strong>期末情境估值約 ${money(s.final)}。</strong>`);
      parts.push(`<section class="summary-section"><h3>未來準備</h3><ul>${lines.map(x=>`<li>${x}</li>`).join('')}</ul></section>`);
    }

    if(!parts.length)parts.push('<div class="empty">目前尚未填寫資料。只要填任一欄位，就可以整理成現有資訊摘要。</div>');
    $('summaryContent').innerHTML=parts.join('');
    const name=$('clientName').value.trim();$('printMeta').textContent=`${name?name+'｜':''}${new Date().toLocaleDateString('zh-TW')}｜依目前已提供資料整理，僅供試算參考`;
  }

  function summaryText(){renderSummary();const name=$('clientName').value.trim();const lines=[`${name?name+'｜':''}未來生活試算重點`];const text=$('summaryContent').innerText.trim();if(text)lines.push(text);lines.push('※本整理依目前已提供資料產生；未填欄位不代表為 0。所有試算僅供退休與財務觀念參考，實際退休給付與核定金額以主管機關及正式核定結果為準；非投資建議或保證收益。');return lines.join('\n\n')}
  function copySummary(){renderSummary();const text=summaryText();if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(text).then(()=>toast('重點已複製')).catch(()=>fallbackCopy(text))}else fallbackCopy(text)}
  function fallbackCopy(text){const ta=document.createElement('textarea');ta.value=text;ta.style.position='fixed';ta.style.opacity='0';document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast('重點已複製')}catch(e){toast('請手動複製重點')}ta.remove()}
  function downloadReport(){renderSummary();const name=$('clientName').value.trim()||'試算';const content=$('summaryContent').innerHTML;const disclaimer=document.querySelector('.disclaimer').outerHTML;const html=`<!doctype html><html lang="zh-Hant"><meta charset="utf-8"><title>${name}－未來生活試算</title><style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans TC',sans-serif;max-width:820px;margin:36px auto;padding:0 18px;color:#3e342f;line-height:1.7}.summary{display:grid;grid-template-columns:1fr 1fr;gap:10px}.summary-section,.disclaimer{border:1px solid #e7ddd4;border-radius:14px;padding:14px}.summary-section h3,.disclaimer h3{margin-top:0}.summary-section li,.disclaimer p{font-size:13px}.disclaimer{margin-top:16px;background:#f7f6f5}@media(max-width:700px){.summary{grid-template-columns:1fr}}</style><h1>未來生活試算重點</h1><p>${name}｜${new Date().toLocaleDateString('zh-TW')}</p><div class="summary">${content}</div>${disclaimer}</html>`;const blob=new Blob([html],{type:'text/html;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`${name}-未來生活試算.html`;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),500);toast('已產生報告')}

  const incomeInputIds=['age','retireAge','laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears','birthROC','laborClaimAge','selfContribution','pensionReturn','nationalMode','useLaborInsurance','useLaborPension','useNationalPension'];
  const gapInputIds=['desiredSpend','otherIncome','inflationRate'];
  const reserveInputIds=['currentReserve','monthlyReserve','reserveYears','reserveRate'];
  const hasAny=ids=>ids.some(filled);
  const hideResult=id=>{const el=$(id);if(el)el.classList.remove('show')};
  function invalidateFor(id){
    if(incomeInputIds.includes(id)){state.income=null;state.gap=null;state.reserve=null;hideResult('incomeResult');hideResult('gapResult');hideResult('reserveResult')}
    if(gapInputIds.includes(id)){state.gap=null;state.reserve=null;hideResult('gapResult');hideResult('reserveResult')}
    if(reserveInputIds.includes(id)){state.reserve=null;hideResult('reserveResult')}
  }
  function refreshAvailable(showToast=true){
    if(hasAny(['age','retireAge','laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears']))calcIncome();
    if(hasAny(gapInputIds))calcGap();
    if(hasAny(['currentReserve','monthlyReserve','reserveRate']))calcReserve();
    renderSummary();
    if(showToast)toast('已依目前資料整理');
  }

  const originalCalcGap=calcGap;
  calcGap=function(){
    if(!state.income && hasAny(['age','retireAge','laborSalary','laborYears','pensionBalance','pensionWage','pensionYears','nationalYears']))calcIncome();
    return originalCalcGap();
  };

  $('calcIncome').addEventListener('click',calcIncome);$('calcGap').addEventListener('click',calcGap);$('calcReserve').addEventListener('click',calcReserve);$('clientName').addEventListener('input',renderSummary);$('refreshSummaryBtn').addEventListener('click',()=>refreshAvailable(true));$('printBtn').addEventListener('click',()=>{refreshAvailable(false);window.print()});$('copyBtn').addEventListener('click',()=>{refreshAvailable(false);copySummary()});$('downloadBtn').addEventListener('click',()=>{refreshAvailable(false);downloadReport()});
  document.querySelectorAll('input,select').forEach(el=>{if(el.id!=='clientName')el.addEventListener('input',()=>{invalidateFor(el.id);renderSummary()})});
  if('serviceWorker' in navigator && (location.protocol==='https:'||location.protocol==='http:'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
  renderSummary();
})();
