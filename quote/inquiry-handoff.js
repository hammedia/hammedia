(() => {
  'use strict';
  const key='ham_service_inquiry_v1';
  const names={video:'영상 제작',page:'소개 페이지',document:'문서·책 편집',monthly:'월간 운영',automation:'반복 업무 정리'};
  const source=new URLSearchParams(location.search).get('source')||'';
  const selected=source.replace(/^service-menu-/,'');
  if(!source.startsWith('service-menu-')||!Object.hasOwn(names,selected)) return;
  const status=document.getElementById('inquiry-handoff-status');
  const form=document.getElementById('quote-request-form');
  let draft;
  try { draft=JSON.parse(sessionStorage.getItem(key)); } catch {}
  status.hidden=false;
  if(draft?.version!==1||draft.selected!==selected||!Array.isArray(draft.drafts)){
    status.textContent=`${names[selected]} 문의입니다. 이어받은 본문이 없으니 아래에 적어주세요.`;
    return;
  }
  const original=draft.drafts.find(row=>Array.isArray(row)&&row[0]===selected)?.[1];
  if(typeof original!=='string') return;
  const ids=['q1','q2','q3','q4','q5','qc'];
  const fields=ids.map(id=>document.getElementById(id));
  document.getElementById('inquiry-original').hidden=false;
  document.getElementById('inquiry-original').open=original.length>fields[0].maxLength;
  document.getElementById('inquiry-original-text').textContent=original;
  fields.forEach(field=>{if(!field.value){const restored=draft.quote?.[field.id];if(field.id==='q1')field.value=draft.quoteOriginal===original&&typeof restored==='string'?restored:original;else if(typeof restored==='string')field.value=restored;}});
  function report(){
    status.textContent=fields[0].value.length>fields[0].maxLength
      ? `${names[selected]} 내용을 그대로 가져왔습니다. 첫 항목은 ${fields[0].maxLength}자 이내로 정리해주세요. 원문은 아래에 보존했습니다.`
      : `${names[selected]} 내용을 가져왔습니다. 나머지 항목을 확인한 뒤 보내주세요. 아직 전송되지 않았습니다.`;
  }
  function save(){
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
    status.textContent='문의가 접수되어 이 탭에 보관한 초안을 지웠습니다.';
  });
  report();
})();
