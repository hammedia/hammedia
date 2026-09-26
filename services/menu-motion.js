(() => {
  'use strict';
  const root = document.querySelector('.hm-menu');
  if (!root) return;
  const q = selector => document.querySelector(selector);
  const stage = q('.hm-menu-stage');
  const choices = [...root.querySelectorAll('[data-hm-choice]')];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  const photo = '../customers/mapobada/promo-0903/photos/02_해산물모듬.jpg';
  const food = '../customers/mapobada/promo-0903/photos/01_모둠회.jpg';
  const options = {
    video: {category:'01 · 영상 제작',title:'보여주고 싶은 것을,\n보고 싶은 영상으로.',description:'사진과 이야기에서 출발해 기획·촬영·편집을 거쳐 매장과 채널에 맞는 영상을 만듭니다.',image:photo,alt:'마포바다 해산물 모둠 사진을 활용한 화면 구성 예시',fragment:food,fragmentA:'사진',fragmentB:'전하고 싶은 한마디',mediaLabel:'마포바다 실제 촬영 사진',mediaTitle:'오늘의 바다를\n보여주는 장면.',caption:'실제 마포바다 사진을 재구성한 예시입니다. 납품 영상의 원본이나 전후 비교가 아닙니다.',scopeTitle:'영상 한 편에 필요한 일',scope:'기획 · 촬영 또는 보유 자료 편집 · 자막 · 내보내기. 길이, 화면 비율, 수정 횟수와 공개 채널은 견적서에서 정합니다.',evidence:'#work',evidenceText:'실제 고객 작업 보기 ↗'},
    page: {category:'02 · 소개 페이지',title:'흩어진 안내를,\n하나의 페이지로.',description:'소개부터 조건, 일정, 문의까지. 읽는 사람이 다음 행동을 찾을 수 있는 페이지로 모읍니다.',image:'../examples/seasonal-event/preview.png',alt:'HAM MEDIA 가상 클리닉 이벤트 페이지 데모 화면',fragment:'../examples/seasonal-event/hero-model.webp',fragmentA:'행사 자료',fragmentB:'소개 · 조건 · 문의',mediaLabel:'가상 클리닉 · 제작 데모',mediaTitle:'소개부터\n문의까지.',caption:'HAM MEDIA가 만든 가상 클리닉 이벤트 페이지 데모입니다. 실제 고객 행사나 운영 성과가 아닙니다.',scopeTitle:'소개와 문의를 잇는 페이지',scope:'문장 정리 · 화면 구성 · 모바일 대응 · 문의 동선. 페이지 수, 제공 자료, 도메인·호스팅과 수정 범위는 견적서에서 정합니다.',evidence:'../examples/seasonal-event/',evidenceText:'실제 데모 페이지 열기 ↗'},
    document: {category:'03 · 문서·책 편집',title:'쌓아둔 내용을,\n읽히는 한 권으로.',description:'원고와 자료의 순서를 잡고, 읽는 목적에 맞춰 문장과 지면을 다듬습니다.',image:'../book/assets/cover.png',alt:'HAM MEDIA 바이브 코딩 실행서 실제 책 표지',fragment:'../book/assets/cover.png',fragmentA:'실제 책 표지',fragmentB:'원고 · 목차 · 지면',mediaLabel:'HAM MEDIA 자체 출판물',mediaTitle:'내용에\n순서를.',caption:'HAM MEDIA 자체 출판물의 실제 표지입니다. 고객 원고를 편집한 전후 사례는 아닙니다.',scopeTitle:'문서가 읽히기까지 필요한 일',scope:'자료 분류 · 목차와 흐름 · 원고 편집 · 지면 구성. 분량, 원고 상태, 최종 파일 형식과 인쇄 여부는 별도로 확인합니다.',evidence:'../book/preview/',evidenceText:'실제 책 미리보기 ↗'},
    monthly: {category:'04 · 월간 운영',title:'한 번의 제작을,\n꾸준한 소식으로.',description:'매달 필요한 자료와 일정부터 맞추고, 채널에 맞게 만들고 확인하며 다음 작업을 이어갑니다.',image:food,alt:'마포바다 모둠회 실제 사진을 활용한 월간 콘텐츠 구성 예시',fragment:photo,fragmentA:'이번 달의 자료',fragmentB:'사진 · 문장 · 일정',mediaLabel:'마포바다 실제 촬영 사진',mediaTitle:'가게의 소식이\n이어지도록.',caption:'실제 마포바다 사진을 활용한 콘텐츠 구성 예시입니다. 게시 횟수나 운영 성과를 나타내지 않습니다.',scopeTitle:'매달 함께 정할 운영 범위',scope:'월간 소재 정리 · 콘텐츠 제작 · 게시와 관리. 채널, 제작 수량, 게시 주기와 응대 범위를 먼저 정합니다. 매출이나 조회수는 약속하지 않습니다.',evidence:'#work',evidenceText:'현재 운영 사례 보기 ↗'},
    automation: {category:'05 · 반복 업무 정리',title:'매번 하는 일을,\n확인할 일로.',description:'지금 쓰는 문서와 도구에서 시작합니다. 반복 구간을 찾아 연결하고, 사람이 확인할 지점을 남깁니다.',image:photo,alt:'반복 업무 화면 구성 예시',fragment:'../book/assets/cover.png',fragmentA:'내 업무의 자료',fragmentB:'모으기 · 정리 · 확인',mediaLabel:'업무 흐름 구성 예시',mediaTitle:'확인할 일만,\n한눈에.',caption:'반복 업무를 설명하기 위한 화면 구성 예시입니다. 고객 데이터나 실제 자동 실행 결과가 아닙니다.',scopeTitle:'현재 업무를 확인한 뒤 만들기',scope:'반복 구간 조사 · 자료 형식 정리 · 도구 연결 · 사람이 확인할 단계. 계정 권한, 외부 서비스 비용과 유지관리 범위를 확인한 뒤 서면 견적을 드립니다.',evidence:'../erp/',evidenceText:'작은 ERP 체험판 보기 ↗'}
  };
  let selected = 'video';
  let paused = false;
  let running = false;
  const pause = q('[data-hm-pause]');
  const replay = q('[data-hm-replay]');
  function text(selector, value) { const el=q(selector); el.textContent=value; }
  function lines(selector, value) { const el=q(selector); el.replaceChildren(); value.split('\n').forEach((line,i)=>{if(i) el.append(document.createElement('br'));el.append(document.createTextNode(line));}); }
  function syncPause(){pause.setAttribute('aria-pressed',String(paused));pause.textContent=paused?'움직임 이어보기':running?'움직임 멈추기':'재생 완료';pause.disabled=!running;}
  function play(){
    stage.classList.remove('hm-menu-playing','hm-menu-paused'); paused=false;
    if(reduce.matches){running=false;syncPause();return;}
    // A one-shot sequence; no intervals or continuous scroll handlers.
    void stage.offsetWidth;
    stage.classList.add('hm-menu-playing');running=true;syncPause();
  }
  function choose(key, animate=true){
    if(!Object.hasOwn(options,key)) return;
    selected=key; const data=options[key];const index=Object.keys(options).indexOf(key);
    choices.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.hmChoice===key)));
    stage.dataset.hmScene=key;
    text('[data-hm-count]',`0${index+1} / 05`);text('[data-hm-category]',data.category);lines('[data-hm-title]',data.title);text('[data-hm-description]',data.description);
    const image=q('.hm-menu-main-image');image.src=data.image;image.alt=data.alt;
    q('.hm-menu-fragment-a img').src=data.fragment;
    text('[data-hm-fragment-a]',data.fragmentA);text('[data-hm-fragment-b]',data.fragmentB);text('[data-hm-media-label]',data.mediaLabel);lines('[data-hm-media-title]',data.mediaTitle);text('[data-hm-caption]',data.caption);
    q('.hm-menu-sheet').hidden=key!=='automation';
    const label=choices.find(button=>button.dataset.hmChoice===key).textContent;
    text('[data-hm-scope-label]',`선택한 부탁 · ${label}`);text('[data-hm-scope-title]',data.scopeTitle);text('[data-hm-scope]',data.scope);
    text('[data-hm-price]',key==='video'?'롱폼 편집 20만 원부터 · 촬영·원본 길이·수정 범위는 별도 확인':key==='monthly'?'월 50만 원부터 · 편수·채널·촬영 범위는 별도 확인':'범위 확인 후 서면 견적');
    const evidence=q('[data-hm-evidence]');evidence.href=data.evidence;evidence.textContent=data.evidenceText;
    q('#hm-menu-inquiry').value=`${label}\n상담하고 싶은 범위: ${data.scopeTitle}\n원하는 결과와 일정: `;
    text('[data-hm-copy-status]','아래 양식에 직접 붙여넣어 주세요. 아직 전송되지 않았습니다.');
    if(animate) play();
  }
  choices.forEach(button=>button.addEventListener('click',()=>choose(button.dataset.hmChoice)));
  pause.addEventListener('click',()=>{if(!running)return;paused=!paused;stage.classList.toggle('hm-menu-paused',paused);syncPause();});
  replay.addEventListener('click',play);
  stage.addEventListener('animationend',event=>{if(event.animationName==='hm-menu-assemble'){running=false;paused=false;syncPause();}});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&running&&!paused){paused=true;stage.classList.add('hm-menu-paused');syncPause();}});
  reduce.addEventListener('change',()=>{if(reduce.matches){stage.classList.remove('hm-menu-playing','hm-menu-paused');running=false;paused=false;syncPause();}});
  q('[data-hm-copy]').addEventListener('click',async()=>{
    const field=q('#hm-menu-inquiry');
    try {if(!navigator.clipboard)throw new Error('clipboard unavailable');await navigator.clipboard.writeText(field.value);text('[data-hm-copy-status]','복사했습니다. 아래 양식에 붙여넣고 원하는 결과와 일정을 적어주세요. 아직 전송되지 않았습니다.');}
    catch {field.focus();field.select();text('[data-hm-copy-status]','내용을 선택했습니다. 기기의 복사 기능으로 복사한 뒤 양식에 붙여넣어 주세요.');}
  });
  q('.hm-menu-choices').hidden=false;q('.hm-menu-controls').hidden=false;q('.hm-menu-contact').hidden=false;
  choose(selected,false);
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){if(entry.target===stage)play();else entry.target.classList.add('hm-menu-in-view');observer.unobserve(entry.target);}}),{threshold:.15});
    observer.observe(stage);observer.observe(q('.hm-menu-scope'));
  }else play();
})();
