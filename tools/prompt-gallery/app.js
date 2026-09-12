'use strict';

let works=[];
let currentFilter='all';

const grid=document.querySelector('#grid');
const countEl=document.querySelector('#count');

const FORMAT={stamp:'스티커',reply:'반응',four:'네컷',three:'세 컷',restore:'사진 복원',transform:'모습 바꾸기',archive:'기록 상자'};
const SUBJECT={me:'나',pet:'반려동물',pair:'나와 반려동물',none:'사진 없이'};

function photoLabel(w){
 return w.photos===0?'사진 없음':'사진 '+w.photos+'장';
}
function subjectLabel(w){
 if(w.photos===0)return SUBJECT.none;
 if(w.filter.includes('photo')&&w.filter.includes('pet'))return SUBJECT.pair;
 return w.filter.includes('pet')?SUBJECT.pet:SUBJECT.me;
}

function badges(w){
 let h='<p class=\'card-meta\'>';
 if(w.format&&FORMAT[w.format])h+='<span class=\'badge\'>'+FORMAT[w.format]+'</span>';
 h+='<span class=\'badge\'>'+photoLabel(w)+'</span>';
 h+='<span class=\'badge lang\'>'+(w.lang==='en'?'영어':'한국어')+'</span>';
 h+='<span class=\'badge subject\'>'+subjectLabel(w)+'</span>';
 return h+'</p>';
}

function cardHTML(w){
 return '<button class=\'frame\' data-id=\''+w.id+'\' aria-label=\''+w.title+' 크게 보기\'>'+
  '<img src=\''+w.image+'\' alt=\''+w.title+' — 생성 예시\' loading=\'lazy\'>'+
  '<span class=\'peek\'>크게 보기 ↗</span></button>'+
  '<p class=\'card-title\'>'+w.title+'</p>'+badges(w);
}

function matches(w){
 if(currentFilter==='all')return true;
 return Array.isArray(w.filter)&&w.filter.includes(currentFilter);
}

function render(){
 const list=works.filter(matches);
 grid.innerHTML='';
 if(!list.length){
  grid.innerHTML='<p class=\'empty\'>이 조건에 맞는 작품이 없습니다. 다른 유형을 선택해 보세요.</p>';
 }else{
  list.forEach(w=>{
   const card=document.createElement('article');
   card.className='card';
   card.innerHTML=cardHTML(w);
   grid.append(card);
  });
 }
 countEl.textContent='총 '+list.length+'개 작품';
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

fetch('catalog.json')
 .then(r=>{if(!r.ok)throw 0;return r.json();})
 .then(data=>{
  works=Array.isArray(data)?data:(data&&Array.isArray(data.entries)?data.entries:[]);
  render();
  bindFilter();
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
 const opener=e.target.closest('.frame');
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
  promptStatus.textContent='복사되었습니다. 이미지를 만드는 AI 칸에 붙여넣으세요.';
 }else{
  copyBtn.textContent='복사 실패';
  copyBtn.classList.add('fail');
  promptStatus.textContent='복사가 막혔습니다. 아래 텍스트를 직접 선택해 복사해 주세요.';
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
 if(typeof p==='string'&&p.trim())copyText(p);
});
