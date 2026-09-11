'use strict';

/* ---- 갤러리 데이터: catalog.json 에서 전부 로드 (하드코딩 프롬프트 없음) ---- */
let works=[];

const grid=document.querySelector('#grid');

function render(){
 grid.innerHTML='';
 works.forEach(w=>{
  const card=document.createElement('article');
  card.className='card';
  card.innerHTML=
   '<button class="frame" data-id="'+w.id+'" aria-label="'+w.title+' 크게 보기">'+
   '<img src="'+w.image+'" alt="'+w.title+' — 생성 예시" loading="lazy">'+
   '<span class="peek">크게 보기 ↗</span></button>'+
   '<p class="card-title">'+w.title+'</p>';
  grid.append(card);
 });
}

fetch('catalog.json')
 .then(r=>{if(!r.ok)throw 0;return r.json();})
 .then(data=>{
  if(Array.isArray(data)){works=data;}
  else if(data&&Array.isArray(data.entries)){works=data.entries;}
  else{works=[];}
  render();
 })
 .catch(()=>{
  grid.innerHTML='<p class="head-sub">작품 목록을 불러오지 못했습니다. 잠시 후 새로고침해주세요.</p>';
 });

/* ---- 팝업: 큰 이미지 + 사용방법 + 대사 입력 + 전체 프롬프트 + 복사 ---- */
const dialog=document.querySelector('#work-dialog');
const dialogImage=document.querySelector('#dialog-image');
const dialogTitle=document.querySelector('#dialog-title');
const dialogHowto=document.querySelector('#dialog-howto');
const promptText=document.querySelector('#prompt-text');
const copyBtn=document.querySelector('#copy-prompt');
const promptStatus=document.querySelector('#prompt-status');
const captionEdits=document.querySelector('#caption-edits');
const captionNote=document.querySelector('#caption-note');
let lastFocus=null,closeTimer=null,currentTemplate='',currentCaps=[];

function buildPrompt(template,caps){
 let p=template;
 caps.forEach((c,i)=>{
  p=p.split('{{caption'+(i+1)+'}}').join(c);
 });
 return p;
}

function refreshPromptFromCaps(){
 if(!currentTemplate)return;
 promptText.value=buildPrompt(currentTemplate,currentCaps);
}

function openWork(id){
 const w=works.find(x=>x.id===id);
 if(!w)return;
 lastFocus=document.activeElement;
 dialogTitle.textContent=w.title;
 dialogImage.src=w.image;
 dialogImage.alt=w.title;
 dialogImage.style.width='100%';
 dialogImage.style.height='auto';
 dialogImage.style.objectFit='unset';
 dialogHowto.textContent='사용방법: '+w.instructions;
 captionEdits.innerHTML='';
 currentTemplate='';currentCaps=[];

 const caps=Array.isArray(w.captions)?w.captions:null;
 if(caps&&w.prompt_template){
  currentTemplate=w.prompt_template;
  currentCaps=caps.slice();
  caps.forEach((c,i)=>{
   const lab=document.createElement('label');
   lab.className='caption-label';
   lab.setAttribute('for','caption-input-'+(i+1));
   lab.textContent='대사 '+(i+1);
   const inp=document.createElement('input');
   inp.type='text';
   inp.id='caption-input-'+(i+1);
   inp.className='caption-input';
   inp.value=c;
   inp.spellcheck=false;
   inp.addEventListener('input',()=>{
    currentCaps[i]=inp.value;
    refreshPromptFromCaps();
   });
   captionEdits.append(lab,inp);
  });
  captionEdits.hidden=false;
  captionNote.hidden=false;
 }

 currentPromptBuild();

 function currentPromptBuild(){
  const p=currentTemplate?buildPrompt(currentTemplate,currentCaps):(w.prompt||'');
  if(p.trim()!==''){
   promptText.value=p;
   promptText.disabled=false;
   copyBtn.disabled=false;
   copyBtn.textContent='프롬프트 복사';
   promptStatus.hidden=true;
   promptStatus.textContent='';
  }
 }

 dialog.showModal();
 dialog.querySelector('.close-dialog').focus();
}

grid.addEventListener('click',e=>{
 const frame=e.target.closest('.frame');
 if(frame)openWork(frame.dataset.id);
});

function closeDialog(){
 dialog.close();
}
document.querySelector('.close-dialog').addEventListener('click',closeDialog);
dialog.addEventListener('click',e=>{if(e.target===dialog)closeDialog();});
dialog.addEventListener('cancel',e=>{e.preventDefault();closeDialog();});
dialog.addEventListener('close',()=>{
 if(dialog.open)return;
 if(lastFocus&&typeof lastFocus.focus==='function')lastFocus.focus();
 promptText.value='';
 captionEdits.innerHTML='';
 captionEdits.hidden=true;
 captionNote.hidden=true;
 currentTemplate='';currentCaps=[];
});

/* ---- 팝업 안 복사: 프롬프트 전문 그대로 ---- */
async function copyText(text){
 let ok=true;
 try{await navigator.clipboard.writeText(text);}
 catch{
  const a=document.createElement('textarea');a.value=text;a.style.position='fixed';a.style.top='0';dialog.append(a);a.select();
  ok=document.execCommand('copy');a.remove();
 }
 if(ok){
  copyBtn.textContent='복사 완료 ✓';copyBtn.classList.add('done');
  clearTimeout(closeTimer);
  closeTimer=setTimeout(()=>{copyBtn.textContent='프롬프트 복사';copyBtn.classList.remove('done');},2000);
 }
}
copyBtn.addEventListener('click',()=>{
 if(copyBtn.disabled)return;
 const p=promptText.value;
 if(typeof p==='string'&&p.trim())copyText(p);
});
