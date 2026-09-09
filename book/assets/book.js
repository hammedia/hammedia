(()=>{
'use strict';
const $=id=>document.getElementById(id);
const story=$('try-story'), next=$('story-next'), reason=$('direction-reason');
const fields=['try-reality','try-result','try-material','try-judgment'].map($);
const output=$('try-request'), copy=$('try-copy'), status=$('try-status');
const cards=[...document.querySelectorAll('[data-direction]')];
let selected='', appliedStory='', generated=[], opened=false, pendingChange=null;
function confirmChange(action){pendingChange=action;$('replace-confirm').hidden=false;$('replace-keep').focus();}
$('replace-keep').addEventListener('click',()=>{pendingChange=null;$('replace-confirm').hidden=true;$('direction-status').textContent='직접 쓴 내용을 그대로 유지했습니다.';});
$('replace-apply').addEventListener('click',()=>{const action=pendingChange;pendingChange=null;$('replace-confirm').hidden=true;if(action)action();});
const templates={
 conversation:{result:'이 경험을 바탕으로 상대가 스스로 생각하고 다음 행동 하나를 정하도록 돕는 짧은 대화 안내.',judgment:'상대가 자기 생각을 말하고, 다음 행동을 구체적으로 정할 수 있는가.'},
 guide:{result:'처음 접하는 사람이 이 경험에서 필요한 내용을 이해하고 직접 해볼 수 있는 안내 한 장.',judgment:'처음 보는 사람이 추가 설명 없이 이해하고, 다음에 할 일을 알 수 있는가.'},
 checklist:{result:'이 경험에서 놓치기 쉬운 것을 돌아보고 다음에 바꿀 행동 하나를 정하는 짧은 점검표.',judgment:'체크 표시만 하고 끝내지 않고, 실제로 바꿀 행동과 확인할 때를 정할 수 있는가.'},
 own:{result:'',judgment:''}
};
const example='직원에게 늘 하던 말이 있다. 우리가 손님이어도 부담되는 돈인데, 그 가격에 맞는 음식과 서비스를 드렸는지 돌아보자고 했다. 업무 시작 전에는 어떤 서비스를 제공할지 스스로 생각하게 했다. 마친 뒤에는 “오늘 손님들은 만족했나?”, “아쉬운 순간은 없었나?”를 물었다. 아쉬운 일이 생기면 “네가 다른 식당에서 이런 음식이나 서비스를 받았다면 어땠을까?”, “그러면 어떻게 하면 더 좋았을까?” 하고 생각을 나눴다.';
function focusPanel(id,heading){$(id).hidden=false;$(heading).focus({preventScroll:true});$(heading).scrollIntoView({block:'start',behavior:'auto'});}
function recommend(){
 const text=story.value.trim();let key='';
 if(/직원|스스로|생각|판단|돌아보|서비스/.test(text)) key='conversation';
 else if(/설명|질문|처음|안내|방법/.test(text)) key='guide';
 else if(/반복|누락|실수|점검|놓치/.test(text)) key='checklist';
 cards.forEach(card=>{card.classList.toggle('is-suggested',card.dataset.direction===key);const old=card.querySelector('.suggestion-tag');if(old)old.remove();if(card.dataset.direction===key){const tag=document.createElement('span');tag.className='suggestion-tag';tag.textContent='먼저 살펴볼 예시';card.prepend(tag);}});
 reason.textContent=key==='conversation'?'생각·판단·서비스와 관련된 말이 있어, 먼저 “함께 돌아보는 대화 안내”를 살펴볼 수 있어요.':key==='guide'?'설명·질문·안내와 관련된 말이 있어, 먼저 “쉽게 이해하는 안내 한 장”을 살펴볼 수 있어요.':key==='checklist'?'반복·실수·점검과 관련된 말이 있어, 먼저 “행동을 바꾸는 점검표”를 살펴볼 수 있어요.':'꼭 맞는 형태를 지금 정할 필요는 없어요. 아래 출발점을 비교하거나 AI와 먼저 이야기해보세요.';
}
function render(){
 const values=fields.map(el=>el.value.trim());
 output.value='내가 아는 현실:\n'+(values[0]||'[경험을 적어주세요]')+'\n\n원하는 결과:\n'+(values[1]||'[누구에게 어떤 도움이 될지 적어주세요]')+'\n\nAI가 읽을 재료:\n'+(values[2]||'위에 적은 경험 원문. 추가 자료는 아직 제공하지 않았습니다. 필요한 자료가 있으면 먼저 알려주세요.')+'\n\n내가 마지막에 판단할 것:\n'+(values[3]||'아직 정하지 않았습니다. 도움이 됐는지 확인할 기준을 먼저 제안해주세요.')+'\n\n이 방향에 맞는 작은 초안을 만들어주세요. 설명한 경험의 뜻을 임의로 바꾸거나, 반성·형식적인 확인만 하게 만들지 마세요.\n없는 사실·경력·가격·고객 반응·실행 성과는 추측하지 마세요. 판단에 꼭 필요한 정보가 빠졌다면 쉬운 질문 하나씩 먼저 물어주세요.\n마지막 판단과 실제 적용은 제가 합니다.';
 copy.disabled=!values[0]||!values[1];
 $('try-progress').textContent=(values.filter(Boolean).length)+' / 4칸 · 뒤 두 칸은 선택';
 status.textContent=copy.disabled?'경험과 원하는 결과를 적어주세요. 방향이 어렵다면 위의 “아직 모르겠어요”로 시작할 수 있어요.':'요청서가 준비됐습니다. 내 뜻과 다른 문장이 없는지 읽고 복사하세요.';
 fields.forEach(el=>el.classList.toggle('is-empty',!el.value.trim()));
}
function renderExplore(){
 $('explore-request').value='내가 해온 경험입니다.\n\n'+story.value.trim()+'\n\n아직 무엇을 만들어야 할지 모르겠습니다. 경험의 뜻을 먼저 짧게 짚고, 누구에게 어떤 도움이 될 수 있을지 서로 다른 방향 세 가지를 제안해주세요. 각 방향에 도움받는 사람·바뀔 행동·작게 만들 결과물·추천 이유를 붙여주세요.\n가장 적합한 방향 하나와 이유도 말해주세요. 제가 고르기 전에는 완성본을 만들지 마세요. 꼭 필요한 정보만 쉬운 질문 하나씩 물어주세요.\n제가 방향을 고르면 “내가 아는 현실 / 원하는 결과 / AI가 읽을 재료 / 내가 마지막에 판단할 것” 네 가지로 함께 정리해주세요. 없는 사실·고객 반응·성과는 추측하지 마세요. 마지막 판단은 제가 합니다.';
 $('explore-copy').disabled=!story.value.trim();
}
function storyChanged(){
 const valid=!!story.value.trim(); next.disabled=!valid;$('story-count').textContent=story.value.length+' / 2,000자';
 if(opened)recommend();renderExplore();
 if(generated.length && appliedStory!==story.value.trim()){
  if(fields[0].value===appliedStory){fields[0].value=story.value.trim();appliedStory=story.value.trim();if(generated.length)generated[0]=fields[0].value;render();}
  else {$('direction-status').textContent='경험 원문을 바꿨습니다. 아래에서 직접 고친 “내가 아는 현실”은 유지했으니 서로 맞는지 확인하세요.';}
 }
}
next.addEventListener('click',()=>{if(next.disabled)return;opened=true;recommend();focusPanel('direction-panel','direction-heading');});
story.addEventListener('input',storyChanged);
$('story-example').addEventListener('click',()=>{const apply=()=>{story.value=example;storyChanged();story.focus();};if(story.value.trim()){confirmChange(apply);return;}apply();});
function choose(key,force=false){
 if(!story.value.trim())return;
 if(!force && generated.length && fields.some((el,i)=>el.value!==generated[i])){confirmChange(()=>choose(key,true));return;}
 selected=key;const chosen=templates[key];
 fields[0].value=story.value.trim();fields[1].value=chosen.result;fields[2].value='위에 적은 경험 원문. 추가 자료는 아직 제공하지 않았습니다.';fields[3].value=chosen.judgment;
 appliedStory=story.value.trim();generated=fields.map(el=>el.value);
 cards.forEach(card=>card.setAttribute('aria-pressed',String(card.dataset.direction===selected)));
 $('explore-panel').hidden=true;$('direction-status').textContent='선택한 방향의 예시를 넣었습니다. 경험의 뜻과 맞게 고쳐보세요.';render();focusPanel('worksheet-panel','worksheet-heading');
 if(key==='own')fields[1].focus();
}
cards.forEach(card=>card.addEventListener('click',()=>choose(card.dataset.direction)));
$('direction-own').addEventListener('click',()=>choose('own'));
$('direction-explore').addEventListener('click',()=>{if(!story.value.trim())return;renderExplore();$('worksheet-panel').hidden=true;focusPanel('explore-panel','explore-heading');$('explore-status').textContent='선택을 못 해도 괜찮습니다. 이 요청서로 AI와 먼저 대화해보세요.';});
fields.forEach(el=>el.addEventListener('input',render));$('experience-form').addEventListener('submit',e=>e.preventDefault());
async function copyText(area,button,message){if(button.disabled)return;try{await navigator.clipboard.writeText(area.value);message.textContent='복사했습니다. 사용하는 AI의 대화창에 붙여넣으세요.';}catch{area.focus();area.select();message.textContent='자동 복사가 안 되어 요청서 전체를 선택했습니다. 기기의 복사 기능으로 복사하세요.';}}
copy.addEventListener('click',()=>copyText(output,copy,status));
$('explore-copy').addEventListener('click',()=>copyText($('explore-request'),$('explore-copy'),$('explore-status')));
render();storyChanged();
if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('is-visible');observer.unobserve(entry.target);}}),{threshold:.12});document.querySelectorAll('.case-image').forEach(el=>observer.observe(el));}
})();
// Direct links from the free preview reveal the complete, already-present chapter.
(() => {
  const revealChapter = () => {
    if (location.hash === '#free-chapter') {
      const chapter = document.getElementById('free-chapter');
      chapter.open = true;
      chapter.scrollIntoView({block:'start'});
    }
  };
  document.querySelectorAll('a[href="#free-chapter"]').forEach(link => {
    link.addEventListener('click', () => { document.getElementById('free-chapter').open = true; });
  });
  window.addEventListener('hashchange', revealChapter);
  revealChapter();
})();
