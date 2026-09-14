'use strict';

let works=[];
let currentFilter='all';
let currentSignal='all';

const EXPERIMENTS=[
 {
  id:'public-photo-footprint',
  number:'01',
  label:'공개 흔적 점검',
  title:'인터넷 속 내 사진과 흔적, 어디까지 찾을 수 있을까?',
  hook:'“전부 찾아준다”는 말을 믿기 전에, 검색어와 출처를 남겨 내가 직접 확인합니다.',
  time:'약 15분',
  input:'내 셀카 1장 · 내 이름/활동명',
  status:'안전하게 다시 쓴 실험판',
  boundary:'반드시 자기 자신의 공개 흔적만 확인하세요. 얼굴만으로 동일인이라고 단정하거나 다른 사람을 추적하지 않습니다. 검색 결과가 없다는 말도 인터넷에 사진이 없다는 증거는 아닙니다.',
  prompts:[
   {title:'검색 기준 만들기',text:'[내 셀카 한 장을 첨부]\n이 사진에서 내가 직접 확인할 수 있는 비민감한 시각적 특징만 정리해줘. 얼굴형, 헤어스타일, 안경, 눈에 띄는 의상이나 소품처럼 검색 확인에 도움이 되는 특징만 써줘. 인종, 건강, 성격, 나이처럼 민감하거나 추측이 필요한 속성은 제외하고, 사진만으로 확실하지 않은 것은 “확인 불가”라고 적어줘.'},
   {title:'내 공개 이름으로 검색하기',text:'내가 공개적으로 사용하는 정보는 다음과 같아.\n- 이름 또는 활동명: [직접 입력]\n- 활동 분야/회사/지역: [공개해도 되는 범위만 입력]\n\n이 정보와 앞에서 정리한 비민감한 특징을 바탕으로 웹 검색어 조합 12개를 만들어줘. 한글/영문 표기, 활동명, 행사명, 사이트 범위를 섞되 개인정보를 새로 추측하지 마. 가능하면 각 검색어로 웹을 검색하고, 실제로 연 출처 링크만 돌려줘.'},
   {title:'찾은 결과를 내가 판정하기',text:'찾은 링크를 표로 정리해줘. 열은 “출처·게시 날짜·사진이 있는 위치·일치해 보이는 근거·내가 확인할 질문·판정”으로 만들어줘. 판정은 비워두고 내가 직접 ‘나/불확실/아님’ 중 하나를 적게 해줘. 얼굴만 보고 같은 사람이라고 확정하지 말고, 열 수 없거나 출처를 확인하지 못한 링크는 찾았다고 쓰지 마.'}
  ],
  checks:['모든 결과에 실제로 열리는 출처 링크가 있는가','내가 직접 보아도 본인이 맞는가','다른 사람의 사진이나 비공개 정보가 섞이지 않았는가','못 찾은 범위를 “없다”라고 단정하지 않았는가'],
  source:'HAM MEDIA 편집 원칙: 찾았다는 말보다 출처와 본인 확인이 먼저입니다.'
 },
 {
  id:'memory-mirror',
  number:'02',
  label:'대화 기억 점검',
  title:'ChatGPT가 기억하는 나는 정말 나와 닮았을까?',
  hook:'그럴듯한 성격 풀이 대신, 대화에서 실제로 반복된 말과 AI의 추측을 분리합니다.',
  time:'약 10분',
  input:'평소 사용하던 ChatGPT 대화',
  status:'자기 발견 · 검증형',
  boundary:'대화 기억과 개인화 설정에 따라 답이 달라집니다. AI의 해석은 진단이나 사실 판정이 아닙니다. 민감한 대화를 넣고 싶지 않다면 새 대화에서 직접 고른 글만 붙여넣으세요.',
  prompts:[
   {title:'반복된 나를 찾기',text:'지금까지 내가 이 대화와 기억에 남긴 내용만 근거로, 반복해서 드러난 관심사·일하는 방식·중요하게 여기는 기준을 최대 7개 정리해줘. 각 항목마다 근거가 된 내 말이나 대화 장면을 짧게 설명하고, 근거를 찾지 못한 내용은 만들지 마.'},
   {title:'관찰과 추측 가르기',text:'방금 정리한 내용을 “내가 직접 말한 사실 / 대화에서 관찰한 반복 / 네가 추측한 해석 / 아직 모르는 것” 네 칸으로 다시 나눠줘. 추측에는 확신도를 낮음·중간·높음으로 표시하고, 민감한 성격·건강·정치·경제 상태는 추측하지 마.'},
   {title:'내가 틀렸다고 말할 자리 만들기',text:'내가 확인할 수 있도록 가장 중요한 해석 3개만 골라 질문으로 바꿔줘. 질문마다 “맞다 / 일부만 맞다 / 아니다”로 답할 수 있게 하고, 내가 답하면 처음 분석에서 무엇을 고쳐야 하는지 한 문단으로 다시 써줘.'}
  ],
  checks:['근거 없는 칭찬이나 운세 같은 문장이 빠졌는가','내가 말한 사실과 AI의 해석이 분리됐는가','틀렸다고 답할 수 있는 질문이 있는가','결과를 자기소개나 평가에 그대로 쓰기 전에 내가 수정했는가'],
  source:'최근의 자기 묘사 유행을 HAM MEDIA식 사실 대조로 바꾼 실험입니다.'
 },
 {
  id:'past-meets-present',
  number:'03',
  label:'기억 장면 만들기',
  title:'어린 나와 지금의 나를 한 장면에서 만나게 하기',
  hook:'유행하는 합성 사진을 흉내 내는 데서 끝내지 않고, 두 시절의 실제 표정과 관계를 한 장면으로 만듭니다.',
  time:'약 10분',
  input:'어린 시절 사진 1장 · 현재 사진 1장',
  status:'HAM MEDIA 제작 경험 반영',
  boundary:'본인 또는 사용 허락을 받은 사람의 사진만 올리세요. 원본 사진은 보관하고, 생성 결과가 실제 과거의 기록인 것처럼 설명하지 않습니다.',
  prompts:[
   {title:'두 사진을 먼저 읽기',text:'[어린 시절 사진 1장과 현재 사진 1장을 첨부]\n두 사진에서 확인되는 사람의 표정, 시선, 자세, 옷, 조명과 사진의 시대감만 각각 정리해줘. 보이지 않는 기억이나 감정을 지어내지 말고, 같은 사람인지도 내가 제공한 설명을 기준으로만 다뤄줘.'},
   {title:'한 장면으로 만나기',text:'두 사진 속 인물을 같은 공간에 자연스럽게 배치한 한 장의 사진을 만들어줘. 어린 나는 화면 왼쪽, 지금의 나는 오른쪽에 두고 서로를 편안하게 바라보게 해줘. 얼굴의 핵심 특징과 각 시절의 나이는 원본을 따르고, 과도한 미용 보정은 하지 마. 오래 보관한 가족 앨범의 한 장처럼 절제된 색과 자연스러운 빛을 사용해줘.'},
   {title:'한 가지만 고쳐 다시 만들기',text:'첫 결과에서 원본과 가장 달라진 한 가지를 먼저 짚어줘. [얼굴 / 나이 / 손 / 시선 / 옷 / 배경] 중 내가 고른 한 항목만 원본에 더 가깝게 고치고, 나머지 구도와 빛은 유지해서 다시 만들어줘.'}
  ],
  checks:['두 시절의 얼굴과 나이가 서로 섞이지 않았는가','손·시선·접촉이 자연스러운가','첫 결과에서 한 가지만 고쳐 비교했는가','생성 이미지임을 다른 사람에게 숨기지 않았는가'],
  source:'기존 갤러리의 “예전 나와 지금 나를 한 장에” 제작 경험을 3단계 실험으로 다시 풀었습니다.'
 }
];

const grid=document.querySelector('#grid');
const countEl=document.querySelector('#count');

function track(name,params={}){
 if(typeof window.gtag==='function')window.gtag('event',name,params);
}

function renderExperiments(){
 const container=document.querySelector('#experiment-grid');
 if(!container)return;
 EXPERIMENTS.forEach(exp=>{
  const article=document.createElement('article');
  article.className='experiment-card';
  article.innerHTML='<p class="experiment-number">EXPERIMENT '+exp.number+'</p><p class="experiment-label">'+exp.label+'</p><h3>'+exp.title+'</h3><p class="experiment-card-hook">'+exp.hook+'</p><dl><div><dt>준비</dt><dd>'+exp.input+'</dd></div><div><dt>시간</dt><dd>'+exp.time+'</dd></div></dl><p class="experiment-status">'+exp.status+'</p><button type="button" class="experiment-open" data-experiment="'+exp.id+'">프롬프트 3개로 시작 <span aria-hidden="true">↗</span></button>';
  container.append(article);
 });
}

renderExperiments();

const FORMAT={stamp:'스티커',reply:'반응',four:'네컷',three:'세 컷',restore:'사진 복원',transform:'모습 바꾸기',archive:'기록 상자',board:'광고 시안판'};
const SUBJECT={me:'나',pet:'반려동물',pair:'나와 반려동물',none:'사진 없이'};

function photoLabel(w){
 return w.photos===0?'사진 없음':'사진 '+w.photos+'장';
}
function subjectLabel(w){
 if(w.photos===0)return SUBJECT.none;
 if(w.filter.includes('photo')&&w.filter.includes('pet'))return SUBJECT.pair;
 return w.filter.includes('pet')?SUBJECT.pet:SUBJECT.me;
}

function cardHTML(w,index){
 const format=(w.format&&FORMAT[w.format])?FORMAT[w.format]:'이미지';
 const lang=w.lang==='en'?'영어':'한국어';
 return '<button class=\'frame\' data-id=\''+w.id+'\' aria-label=\''+w.title+' 크게 보기\'>'+
  '<img src=\''+w.image+'\' alt=\''+w.title+' — 생성 예시\' loading=\'lazy\'>'+
  '<span class=\'peek\'>작품 열기 ↗</span></button>'+
  '<div class=\'card-copy\'><p class=\'card-index\'>'+String(index+1).padStart(2,'0')+'</p><div>'+
  '<h3 class=\'card-title\'>'+w.title+'</h3>'+
  '<p class=\'card-meta\'>'+format+' · '+photoLabel(w)+' · '+lang+'</p>'+
  '<p class=\'card-evidence\'>'+(w.evidence||'HAM MEDIA 제작')+'</p></div></div>';
}

function matches(w){
 const inputOK=currentFilter==='all'||(Array.isArray(w.filter)&&w.filter.includes(currentFilter));
 const signalOK=currentSignal==='all'||w.signal===currentSignal;
 return inputOK&&signalOK;
}

function bindSignal(){
 document.querySelectorAll('.signal').forEach(btn=>{
  btn.addEventListener('click',()=>{
   currentSignal=btn.dataset.s;
   document.querySelectorAll('.signal').forEach(b=>{
    const on=b===btn;
    b.classList.toggle('is-on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
   });
   render();
  });
 });
}

function render(){
 const list=works.filter(matches);
 grid.innerHTML='';
 if(!list.length){
  grid.innerHTML='<p class=\'empty\'>이 조건에 맞는 작품이 없습니다. 다른 유형을 선택해 보세요.</p>';
 }else{
  list.forEach(w=>{
   const card=document.createElement('article');
   card.className='card '+w.id;
   card.innerHTML=cardHTML(w,works.indexOf(w));
   grid.append(card);
  });
 }
 countEl.textContent=list.length+'개 작품';
}

function bindFilter(){
 document.querySelectorAll('.filter').forEach(btn=>{
  btn.addEventListener('click',()=>{
   currentFilter=btn.dataset.f;
   document.querySelectorAll('.filter').forEach(b=>{
    const on=b===btn;
    b.classList.toggle('is-on',on);
    b.setAttribute('aria-pressed',on?'true':'false');
   });
   render();
  });
 });
}

fetch('catalog.json?v=20260915b')
 .then(r=>{if(!r.ok)throw 0;return r.json();})
 .then(data=>{
  works=Array.isArray(data)?data:(data&&Array.isArray(data.entries)?data.entries:[]);
  render();
  bindFilter();
  bindSignal();
  document.querySelectorAll('.hero-open').forEach(button=>{button.disabled=false;});
 })
 .catch(()=>{
  grid.innerHTML='<p class=\'empty\'>작품 목록을 불러오지 못했습니다. 잠시 후 새로고침해주세요.</p>';
  countEl.textContent='';
 });

/* dialog */
const dialog=document.querySelector('#work-dialog');
const dialogImage=document.querySelector('#dialog-image');
const dialogTitle=document.querySelector('#dialog-title');
const dialogOutcome=document.querySelector('#dialog-outcome');
const dialogEvidence=document.querySelector('#dialog-evidence');
const dialogChips=document.querySelector('#dialog-chips');
const dialogVariants=document.querySelector('#dialog-variants');
const inputsStep=document.querySelector('#inputs-step');
const dialogInputs=document.querySelector('#dialog-inputs');
const dialogSteps=document.querySelector('#dialog-steps');
const changeableStep=document.querySelector('#changeable-step');
const dialogChangeable=document.querySelector('#dialog-changeable');
const captionsStep=document.querySelector('#captions-step');
const dialogCaptionFields=document.querySelector('#dialog-caption-fields');
const promptText=document.querySelector('#prompt-text');
const copyBtn=document.querySelector('#copy-prompt');
const promptStatus=document.querySelector('#prompt-status');
let lastFocus=null,statusTimer=null,scrollY=0,currentWork=null;

function renderVariant(w,variantIndex=0){
 const variants=Array.isArray(w.variants)?w.variants:[];
 const variant=variants[variantIndex]||null;
 const view=variant?{...w,...variant}:w;

 dialogTitle.textContent=view.title||w.title;
 dialogImage.src=view.image||w.image;
 dialogImage.alt=(view.title||w.title)+' — 생성 예시 크게 보기';
 dialogOutcome.textContent=view.outcome||w.outcome||'';
 dialogEvidence.textContent=view.evidence||w.evidence||'HAM MEDIA 제작';

 dialogSteps.innerHTML='';
 (Array.isArray(view.steps)?view.steps:[]).forEach(s=>{
  const li=document.createElement('li');li.textContent=s;dialogSteps.append(li);
 });

 const inputs=Array.isArray(view.inputs)?view.inputs:(Array.isArray(w.inputs)?w.inputs:[]);
 dialogInputs.innerHTML='';
 inputs.forEach(s=>{const li=document.createElement('li');li.textContent=s;dialogInputs.append(li);});
 inputsStep.hidden=!inputs.length;

 if(view.changeable){dialogChangeable.textContent=view.changeable;changeableStep.hidden=false;}
 else{changeableStep.hidden=true;}

 const captions=Array.isArray(view.captions)?view.captions:(Array.isArray(w.captions)?w.captions:[]);
 const template=view.prompt_template||w.prompt_template||'';
 dialogCaptionFields.innerHTML='';
 const updatePrompt=()=>{
  let value=template;
  [...dialogCaptionFields.querySelectorAll('input')].forEach((input,index)=>{
   value=value.replaceAll(`{{caption${index+1}}}`,input.value.trim());
  });
  promptText.value=value;
 };
 if(captions.length&&template){
  captions.forEach((caption,index)=>{
   const label=document.createElement('label');label.className='caption-field';
   const span=document.createElement('span');span.textContent=`${index+1}컷 대사`;
   const input=document.createElement('input');input.type='text';input.value=caption;input.maxLength=40;input.autocomplete='off';
   input.addEventListener('input',updatePrompt);label.append(span,input);dialogCaptionFields.append(label);
  });
  captionsStep.hidden=false;
 }else{captionsStep.hidden=true;}

 const p=template?(updatePrompt(),promptText.value):(view.prompt||w.prompt||'');
 promptText.value=p;promptText.disabled=!p.trim();copyBtn.disabled=!p.trim();
 copyBtn.textContent='프롬프트 복사';copyBtn.classList.remove('done','fail');
 promptStatus.hidden=true;promptStatus.textContent='';

 [...dialogVariants.querySelectorAll('.variant')].forEach((button,index)=>{
  const on=index===variantIndex;button.classList.toggle('is-on',on);button.setAttribute('aria-pressed',on?'true':'false');
 });
}

function openWork(id){
 const w=works.find(x=>x.id===id);
 if(!w)return;
 lastFocus=document.activeElement;
 scrollY=window.scrollY;
 document.body.classList.add('dialog-open');

 currentWork=w;
 track('select_content',{content_type:'prompt_work',content_id:w.id});

 let chips='';
 if(w.format&&FORMAT[w.format])chips+='<span class=\'chip\'>'+FORMAT[w.format]+'</span>';
 chips+='<span class=\'chip\'>'+photoLabel(w)+'</span>';
 chips+='<span class=\'chip lang\'>'+(w.lang==='en'?'영어 프롬프트':'한국어 프롬프트')+'</span>';
 chips+='<span class=\'chip\'>'+subjectLabel(w)+'</span>';
 dialogChips.innerHTML=chips;

 const variants=Array.isArray(w.variants)?w.variants:[];
 dialogVariants.innerHTML='';
 variants.forEach((variant,index)=>{
  const button=document.createElement('button');
  button.type='button';button.className='variant';button.textContent=variant.label||variant.title||('방식 '+(index+1));
  button.setAttribute('aria-pressed',index===0?'true':'false');
  button.addEventListener('click',()=>renderVariant(w,index));dialogVariants.append(button);
 });
 dialogVariants.hidden=variants.length<2;
 renderVariant(w,0);

 dialog.showModal();
 dialog.querySelector('.close-dialog').focus();
}

document.addEventListener('click',e=>{
 const opener=e.target.closest('.frame,.hero-open');
 if(opener&&opener.dataset.id)openWork(opener.dataset.id);
});

document.querySelector('.close-dialog').addEventListener('click',()=>dialog.close());
dialog.addEventListener('click',e=>{if(e.target===dialog)dialog.close();});
dialog.addEventListener('close',()=>{
 document.body.classList.remove('dialog-open');
 window.scrollTo(0,scrollY);
 if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();
 promptText.value='';
 currentWork=null;
});

async function copyText(text){
 let ok=false;
 try{await navigator.clipboard.writeText(text);ok=true;}
 catch(_){
  try{
   const a=document.createElement('textarea');
   a.value=text;a.style.position='fixed';a.style.top='0';a.style.opacity='0';
   dialog.append(a);a.select();
   ok=document.execCommand('copy');
   a.remove();
  }catch(_2){ok=false;}
 }
 promptStatus.hidden=false;
 if(ok){
  copyBtn.textContent='복사 완료 ✓';
  copyBtn.classList.add('done');copyBtn.classList.remove('fail');
  promptStatus.textContent='복사했습니다. 이미지 생성 화면에 붙여넣으세요.';
 }else{
  copyBtn.textContent='복사 실패';
  copyBtn.classList.add('fail');
  promptStatus.textContent='자동 복사가 안 됐습니다. 프롬프트를 선택해 직접 복사해 주세요.';
 }
 clearTimeout(statusTimer);
 statusTimer=setTimeout(()=>{
  copyBtn.textContent='프롬프트 복사';
  copyBtn.classList.remove('done','fail');
  promptStatus.hidden=true;promptStatus.textContent='';
 },3000);
}

copyBtn.addEventListener('click',()=>{
 if(copyBtn.disabled)return;
 const p=promptText.value;
 if(typeof p==='string'&&p.trim()){
  track('prompt_copy',{content_type:'prompt_work',content_id:currentWork?currentWork.id:'unknown'});
  copyText(p);
 }
});

/* experiments */
const experimentDialog=document.querySelector('#experiment-dialog');
const experimentTitle=document.querySelector('#experiment-title');
const experimentIndex=document.querySelector('#experiment-index');
const experimentHook=document.querySelector('#experiment-hook');
const experimentBoundary=document.querySelector('#experiment-boundary');
const experimentPrompts=document.querySelector('#experiment-prompts');
const experimentChecks=document.querySelector('#experiment-checks');
const experimentSource=document.querySelector('#experiment-source');
let experimentFocus=null;

function openExperiment(id){
 const exp=EXPERIMENTS.find(item=>item.id===id);
 if(!exp)return;
 experimentFocus=document.activeElement;
 experimentIndex.textContent='AI EXPERIMENT '+exp.number+' · '+exp.label;
 experimentTitle.textContent=exp.title;
 experimentHook.textContent=exp.hook;
 experimentBoundary.textContent=exp.boundary;
 experimentPrompts.innerHTML='';
 exp.prompts.forEach((prompt,index)=>{
  const li=document.createElement('li');
  const heading=document.createElement('div');heading.className='experiment-prompt-head';
  const h3=document.createElement('h3');h3.textContent=(index+1)+'. '+prompt.title;
  const button=document.createElement('button');button.type='button';button.className='copy-experiment';button.textContent='이 문장 복사';
  const pre=document.createElement('pre');pre.textContent=prompt.text;
  button.addEventListener('click',async()=>{
   track('prompt_copy',{content_type:'ai_experiment',content_id:exp.id,prompt_step:index+1});
   await copyTextForButton(prompt.text,button);
  });
  heading.append(h3,button);li.append(heading,pre);experimentPrompts.append(li);
 });
 experimentChecks.innerHTML='';
 exp.checks.forEach(check=>{const li=document.createElement('li');li.textContent=check;experimentChecks.append(li);});
 experimentSource.textContent=exp.source;
 track('select_content',{content_type:'ai_experiment',content_id:exp.id});
 experimentDialog.showModal();
 experimentDialog.querySelector('.close-experiment').focus();
}

async function copyTextForButton(value,button){
 let ok=false;
 try{await navigator.clipboard.writeText(value);ok=true;}
 catch(_){
  const area=document.createElement('textarea');area.value=value;area.style.position='fixed';area.style.opacity='0';
  experimentDialog.append(area);area.select();ok=document.execCommand('copy');area.remove();
 }
 const original='이 문장 복사';button.textContent=ok?'복사 완료 ✓':'직접 선택해 주세요';
 button.classList.toggle('done',ok);
 setTimeout(()=>{button.textContent=original;button.classList.remove('done');},2400);
}

document.addEventListener('click',event=>{
 const opener=event.target.closest('.experiment-open');
 if(opener)openExperiment(opener.dataset.experiment);
});
document.querySelector('.close-experiment').addEventListener('click',()=>experimentDialog.close());
experimentDialog.addEventListener('click',event=>{if(event.target===experimentDialog)experimentDialog.close();});
experimentDialog.addEventListener('close',()=>{if(experimentFocus&&typeof experimentFocus.focus==='function')experimentFocus.focus();});
