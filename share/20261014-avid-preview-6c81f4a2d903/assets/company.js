const form=document.querySelector('#company-form'),out=document.querySelector('#company-request'),status=document.querySelector('#company-status');
form.hidden=false;
form.addEventListener('submit',e=>{e.preventDefault();if(!form.reportValidity())return;const data=new FormData(form);out.value=`공간 용도: ${data.get('use')}\n필요한 작업과 지금 상황: ${data.get('work')}\n\n확인하고 싶은 내용: 수행 공정, 별도 공정, 현장 확인과 완료 기준.\n\n이 문안은 시안의 상담 준비 메모이며 발송되지 않았습니다.`;out.hidden=false;document.querySelector('#copy-company').hidden=false;status.textContent='상담 준비 메모를 만들었습니다. 이 화면에서는 발송하지 않습니다.';out.focus();});
document.querySelector('#copy-company').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(out.value);status.textContent='복사했습니다. 연락처는 확인 후 연결할 예정입니다.';}catch{out.focus();out.select();status.textContent='문안을 선택했습니다. 기기의 복사 기능을 사용해 주세요.';}});

const experience=document.querySelector('.experience'),experienceButtons=[...document.querySelectorAll('[data-mode].experience-tab')];
const experienceContent={life:['같은 공간, 서로 다른 하루.','함께 앉는 자리와 혼자 쉬는 자리. 공간을 고르기 전에 어떤 시간을 보내고 싶은지부터 떠올려 봅니다.'],flow:['테이블을 바꾸면, 오가는 여유가 보입니다.','큰 테이블과 작은 원형 테이블을 번갈아 보세요. 가구 옆으로 다가가고 자리에 앉는 여유를 비교하는 개념 예시이며, 실제 치수·보행 검증은 아닙니다.'],light:['빛이 닿는 자리에서, 공간의 표정이 바뀝니다.','창에서 들어오는 빛과 앉는 자리를 함께 봅니다. 밝기 변화는 분위기를 살펴보기 위한 표현이며 실제 일조·조도 분석이 아닙니다.'],material:['닿고, 기대고, 매일 바라보는 재료.','원목 테이블과 패브릭 질감을 가까이 살펴보세요. 이 장면의 재료는 공간 제안이며 실제 마감 기록은 다음 프로젝트에서 확인할 수 있습니다.']};
function chooseExperience(mode){experience.dataset.mode=mode;experienceButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));const text=experienceContent[mode];document.querySelector('#experience-heading').textContent=text[0];document.querySelector('#experience-copy').textContent=text[1];document.querySelector('.live-index').textContent={life:'01 · LIVING',flow:'02 · FLOW',light:'03 · LIGHT',material:'04 · MATERIAL'}[mode];}
experienceButtons.forEach(b=>b.addEventListener('click',()=>chooseExperience(b.dataset.mode)));chooseExperience('life');
const layoutButtons=[...document.querySelectorAll('[data-layout]')];
function chooseLayout(layout){experience.dataset.layout=layout;layoutButtons.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===layout)));}
layoutButtons.forEach(b=>b.addEventListener('click',()=>chooseLayout(b.dataset.layout)));chooseLayout('after');
