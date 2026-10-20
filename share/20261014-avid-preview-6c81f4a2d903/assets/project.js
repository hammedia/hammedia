const dialog = document.querySelector('#diagram-dialog');
let opener;
document.querySelectorAll('[data-enlarge]').forEach(button=>{button.hidden=false;button.addEventListener('click',()=>{opener=button;dialog.querySelector('img').src=matchMedia('(max-width:860px)').matches?button.dataset.mobile:button.dataset.enlarge;dialog.querySelector('img').alt=button.dataset.label;dialog.querySelector('#dialog-title').textContent=button.dataset.label;dialog.showModal();});});
dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>opener?.focus());
// Load one process asset only, selected for the current screen at page entry.
const processVideo=document.querySelector('[data-process]');
if(processVideo){const mobile=matchMedia('(max-width:860px)').matches;processVideo.src=mobile?processVideo.dataset.mobile:processVideo.dataset.desktop;processVideo.classList.toggle('portrait',mobile);processVideo.load();}
const heroVideo=document.querySelector('[data-hero]');
if(heroVideo && !matchMedia('(prefers-reduced-motion:reduce)').matches){heroVideo.play().catch(()=>{});}
const form=document.querySelector('#request-form'), output=document.querySelector('#request-text'), result=document.querySelector('.worksheet-result');
form.hidden=false;result.hidden=false;
let lastGenerated='', priorCount=0;
const generateButton=form.querySelector('button');
output.addEventListener('input',()=>{generateButton.textContent=output.value.trim()&&output.value!==lastGenerated?'수정문을 남기고 다시 만들기':'상담 준비 요청문 만들기';});
form.addEventListener('submit',event=>{event.preventDefault();if(!form.reportValidity())return;let preserved=false;if(output.value.trim()&&output.value!==lastGenerated){const detail=document.createElement('details'),summary=document.createElement('summary'),previous=document.createElement('textarea');summary.textContent=`이전 작성문 ${++priorCount} 보기`;previous.value=output.value;previous.readOnly=true;previous.setAttribute('aria-label',`보존한 이전 작성문 ${priorCount}`);detail.append(summary,previous);document.querySelector('#previous-requests').append(detail);preserved=true;}const d=new FormData(form);output.value=`내장공사 상담을 준비하고 있습니다.\n\n공간의 용도: ${d.get('use')}\n먼저 해결하고 싶은 점: ${d.get('concern')}\n공간 크기: ${String(d.get('size')).trim()||'아직 확인 전'}\n\n현장 조건에 맞춰 바닥·벽·천장의 구조, 문과 설비의 연결, 맡길 공정의 범위를 함께 검토하고 싶습니다.\n필요한 현장 확인과 완료 기준, 견적에 포함되는 공정과 별도 공정을 알려주세요.\n\n※ 이 문안은 시안에서 작성한 상담 준비 초안이며 발송되지 않았습니다.`;lastGenerated=output.value;generateButton.textContent='상담 준비 요청문 만들기';document.querySelector('#request-status').textContent=preserved?'새 요청문을 만들었습니다. 직접 고친 문안은 아래 이전 작성문에 남겼습니다.':'요청문을 만들었습니다. 내용을 고친 뒤 복사할 수 있습니다.';output.focus();});
document.querySelector('#copy-request').addEventListener('click',async()=>{const status=document.querySelector('#request-status');if(!output.value.trim()){status.textContent='먼저 공간 정보를 선택하고 요청문을 만들어 주세요.';form.querySelector('select').focus();return;}try{await navigator.clipboard.writeText(output.value);status.textContent='복사했습니다. 이 화면에서는 발송하지 않습니다.';}catch{output.focus();output.select();status.textContent='요청문을 선택했습니다. 기기의 복사 기능을 사용해 주세요.';}});
