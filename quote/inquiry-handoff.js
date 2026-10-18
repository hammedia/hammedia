(() => {
  'use strict';
  const key='ham_service_inquiry_v1';
  const names={video:'영상 제작',page:'소개 페이지',document:'문서·책 편집',monthly:'월간 운영',automation:'반복 업무 정리'};
  const params=new URLSearchParams(location.search);
  const source=params.get('source')||'';
  const cases={
    mapobada:{name:'마포바다 홈페이지',href:'/services/#web-mapobada',text:'마포바다 홈페이지 사례를 보고 문의합니다.\n우리 가게의 소개와 메뉴, 찾아오는 길을 한곳에서 볼 수 있는 웹사이트를 만들고 싶습니다.'},
    hammedia:{name:'HAM MEDIA 자사 홈페이지',href:'/services/#web-hammedia',text:'HAM MEDIA 자사 홈페이지 사례를 보고 문의합니다.\n글과 작업 사례를 살리면서 서비스와 문의로 이어지는 웹사이트를 만들고 싶습니다.'}
  };
  const caseId=params.get('case');
  const caseStudy=params.get('service')==='page'&&Object.hasOwn(cases,caseId||'')?cases[caseId]:null;
  const selected=source.replace(/^service-menu-/,'');
  const service=source.startsWith('service-menu-')&&Object.hasOwn(names,selected);
  const star=window.HamStarContext?.get();
  if(!service&&!star&&!caseStudy)return;
  const status=document.getElementById('inquiry-handoff-status');
  const form=document.getElementById('quote-request-form');
  let draft;
  try { draft=JSON.parse(sessionStorage.getItem(key)); } catch {}
  status.hidden=false;
  if(service&&(draft?.version!==1||draft.selected!==selected||!Array.isArray(draft.drafts))){
    status.textContent=`${names[selected]} 문의입니다. 이어받은 본문이 없으니 아래에 적어주세요.`;
    return;
  }
  draft=draft?.version===1?draft:{version:1,drafts:[]};
  const signature=(window.HamStarContext?.signature(star)||'')+(caseStudy?'|case='+caseId:'');
  const original=caseStudy?caseStudy.text:service?draft.drafts.find(row=>Array.isArray(row)&&row[0]===selected)?.[1]:'';
  const caseBox=document.getElementById('inquiry-case');
  if(caseStudy&&caseBox){
    caseBox.hidden=false;
    document.getElementById('inquiry-case-name').textContent=caseStudy.name;
    document.getElementById('inquiry-case-link').href=caseStudy.href;
  }
  if(typeof original!=='string') return;
  const ids=['q1','q2','q3','q4','q5','qc'];
  const fields=ids.map(id=>document.getElementById(id));
  document.getElementById('inquiry-original').hidden=!service;
  document.getElementById('inquiry-original').open=original.length>fields[0].maxLength;
  document.getElementById('inquiry-original-text').textContent=original;
  fields.forEach(field=>{if(!field.value){const restored=(draft.quoteContext||'')===signature?draft.quote?.[field.id]:null;if(field.id==='q1')field.value=draft.quoteOriginal===original&&typeof restored==='string'?restored:original;else if(typeof restored==='string')field.value=restored;}});
  function report(){
    if(caseStudy){status.textContent='원하는 일에 맞게 고쳐주세요. 아직 전송되지 않았습니다.';return;}
    if(!service){status.textContent='출발 정보를 이어받았습니다. 아래 내용을 확인하고 적어주세요. 아직 전송되지 않았습니다.';return;}
    status.textContent=fields[0].value.length>fields[0].maxLength
      ? `${service?names[selected]:'문의'} 내용을 그대로 가져왔습니다. 첫 항목은 ${fields[0].maxLength}자 이내로 정리해주세요. 원문은 아래에 보존했습니다.`
      : `${service?names[selected]:'문의'} 내용을 가져왔습니다. 나머지 항목을 확인한 뒤 보내주세요. 아직 전송되지 않았습니다.`;
  }
  function save(){
    let latest;try{latest=JSON.parse(sessionStorage.getItem(key));}catch{}
    draft.starVisit=window.HamStarContext?.visit(latest?.starVisit);draft.starContext=window.HamStarContext?.context(latest?.starContext);
    draft.quoteContext=signature;
    draft.quoteOriginal=original;
    draft.quote=Object.fromEntries(fields.map(field=>[field.id,field.value]));
    try { sessionStorage.setItem(key,JSON.stringify(draft)); }
    catch { status.textContent='현재 입력은 남아 있지만 새로고침하면 복원되지 않을 수 있습니다. 페이지를 닫기 전에 내용을 복사해주세요.';return; }
    report();
  }
  fields.forEach(field=>field.addEventListener('input',save));
  form.addEventListener('quote-submitted',()=>{
    try { sessionStorage.removeItem(key); } catch {}
    document.getElementById('inquiry-original-text').textContent='';
    document.getElementById('inquiry-original').hidden=true;
    if(caseBox)caseBox.hidden=true;
    status.textContent='문의가 접수되어 이 탭에 보관한 초안을 지웠습니다.';
  });
  report();
})();
