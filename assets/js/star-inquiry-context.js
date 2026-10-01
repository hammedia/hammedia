(() => {
  'use strict';
  const KEY = 'ham_service_inquiry_v1';
  const TTL = 2 * 60 * 60 * 1000;
  const STARS = {"travel": {"label": "여행별", "articles": {"stop-father": "다시는 갈 수 없는 길.", "stop-place": "생각의 방향도 조금 바뀐다.", "stop-together": "우리는 밖으로 나왔다.", "stop-again": "또 가자, 부산.", "travel-room-in-a-trip-note": "다 넣지 않아도 남는 여행", "travel-place-note": "춘천의 강이 보이는 독채 펜션", "travel-seaside-note": "서해 바다의 추억"}}, "cameras": {"label": "카메라별", "articles": {"cameras-lenses-portraits-note": "중이 제 머리 못 깎는다", "camera-fear-starting-note": "두려움"}}, "music-audio": {"label": "음악·오디오별", "articles": {"music-audio-jarrett-cd-cover-note": "키스 자렛의 이름 아래, 하프시코드", "audio-delacasa-shinpo-note": "작은 볼륨에도 음악이 남도록", "audio-absorber-acoustics-talk-note": "흡음패널 한 장, 건축음향 박사님께 물었습니다", "audio-diy-absorber-panel-note": "10만 원 안쪽, 1m 천 한 장으로 만드는 흡음패널", "audio-memory-completes-sound-note": "소리의 완성은 장비가 아니라 기억이었습니다", "audio-hexa-ie8-memory-today-note": "기억의 소리와 오늘의 소리", "audio-beethoven-emperor-note": "베토벤 황제 2악장, 열 가지 잉크로 쓴 밤", "audio-brahms-piano-trios-note": "누군가의 다독거림이 듣고 싶을 때", "audio-keith-jarrett-career-note": "Keith Jarrett의 경력과 음악", "audio-matching-note": "오디오 매칭"}}, "fountain-pens": {"label": "만년필별", "articles": {"fountain-birthday-copying-room-note": "오늘은 기분 좋은 날", "fountain-pens-same-combination-note": "다음에 같은 조합으로 쓰려면", "fountain-hobby-essay": "취미라는 것에 대하여.", "fountain-beethoven-emperor-note": "베토벤 황제 2악장, 열 가지 잉크로 쓴 밤", "fountain-still-walking-note": "아직 걷는 중", "fountain-human-made-note": "사람은 사람이 만든 것에 약하다", "fountain-well-depth-note": "우물과 마음의 깊이", "fountain-happiness-note": "행복에 관한 짧은 글 중 1"}}, "motorcycles": {"label": "바이크별", "articles": {"motorcycles-coffee-stop-note": "커피 마시러 세운 바이크", "motorcycle-alive-note": "살아 있음을 확인하던 순간", "motorcycle-road-note": "길 위에서 확인한 감각"}}, "bicycles": {"label": "자전거별", "articles": {"bicycles-terrace-parking-note": "자전거 손님을 기다리던 테라스", "bicycle-trust-legs-note": "다리를 믿는 시간", "bicycle-top-tube-note": "몸이 기억한 번호"}}, "spaces": {"label": "공간별", "articles": {"spaces-waiting-chair-note": "사진으로는 알 수 없는 의자", "space-delacasa-music-note": "식사와 대화가 먼저인 자리", "space-detail-power-note": "디테일의 힘", "space-everyday-desk-note": "내가 요즘 가장 많이 사용하는 공간"}}, "cars": {"label": "자동차별", "articles": {"car-koni-suspension-note": "테슬라 모델 Y 롱레인지 코니 서스펜션", "cars-car-in-my-day-note": "차를 고르기 전, 내 하루를 먼저 그려보기"}}, "food": {"label": "음식별", "articles": {"food-choose-a-plate-note": "음식을 담기 전에 고르는 것", "food-article-delacasa": "델라카사 신포점", "food-article-plate": "철판 앞의 기억"}}};
  const CODES = {"travel": {"stop-father": "stop-father", "stop-place": "stop-place", "stop-together": "stop-together", "stop-again": "stop-again", "travel-room-in-a-trip-note": "room-in-a-trip", "travel-place-note": "place", "travel-seaside-note": "seaside"}, "cameras": {"cameras-lenses-portraits-note": "lenses-portraits", "camera-fear-starting-note": "fear-starting"}, "music-audio": {"music-audio-jarrett-cd-cover-note": "jarrett-cd-cover", "audio-delacasa-shinpo-note": "delacasa-shinpo", "audio-absorber-acoustics-talk-note": "absorber-acousti", "audio-diy-absorber-panel-note": "diy-absorber-pan", "audio-memory-completes-sound-note": "memory-completes", "audio-hexa-ie8-memory-today-note": "hexa-ie8-memory-", "audio-beethoven-emperor-note": "beethoven-empero", "audio-brahms-piano-trios-note": "brahms-piano-tri", "audio-keith-jarrett-career-note": "keith-jarrett-ca", "audio-matching-note": "matching"}, "fountain-pens": {"fountain-birthday-copying-room-note": "birthday-copying", "fountain-pens-same-combination-note": "pens-same-combin", "fountain-hobby-essay": "hobby-essay", "fountain-beethoven-emperor-note": "beethoven-empero", "fountain-still-walking-note": "still-walking", "fountain-human-made-note": "human-made", "fountain-well-depth-note": "well-depth", "fountain-happiness-note": "happiness"}, "motorcycles": {"motorcycles-coffee-stop-note": "coffee-stop", "motorcycle-alive-note": "alive", "motorcycle-road-note": "road"}, "bicycles": {"bicycles-terrace-parking-note": "terrace-parking", "bicycle-trust-legs-note": "trust-legs", "bicycle-top-tube-note": "top-tube"}, "spaces": {"spaces-waiting-chair-note": "waiting-chair", "space-delacasa-music-note": "delacasa-music", "space-detail-power-note": "detail-power", "space-everyday-desk-note": "everyday-desk"}, "cars": {"car-koni-suspension-note": "koni-suspension", "cars-car-in-my-day-note": "car-in-my-day"}, "food": {"food-choose-a-plate-note": "choose-a-plate", "food-article-delacasa": "article-delacasa", "food-article-plate": "article-plate"}};
  const HELP = {delegate:'대신 맡기기',together:'함께 만들기',learn:'직접 배우기'};
  const own = (o,k) => typeof k==='string' && Object.hasOwn(o,k);
  const fresh = x => x && Number.isFinite(x.at) && Date.now()-x.at>=0 && Date.now()-x.at<TTL;
  function visit(x) {
    if (!fresh(x) || !own(STARS,x.star)) return null;
    if (x.article && !own(STARS[x.star].articles,x.article)) return null;
    return {star:x.star,article:x.article||'',at:x.at};
  }
  function context(x) {
    const v=visit(x);
    return v && own(HELP,x.help) ? {...v,help:x.help,include:x.include!==false} : null;
  }
  function read() {
    try { const d=JSON.parse(sessionStorage.getItem(KEY)); return d?.version===1 ? d : {version:1,drafts:[]}; }
    catch { return {version:1,drafts:[]}; }
  }
  function write(d) {
    try {const raw=JSON.stringify(d);sessionStorage.setItem(KEY,raw);return sessionStorage.getItem(KEY)===raw;} catch {return false;}
  }
  function locationVisit() {
    const match=location.pathname.match(/^\/ham-media-archive\/pages\/([a-z-]+)\.html$/);
    if (!match || !own(STARS,match[1])) return null;
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return null;}
    return {star:match[1],article:own(STARS[match[1]].articles,id)?id:'',at:Date.now()};
  }
  function remember() {
    const v=locationVisit();if(!v)return;
    const d=read();d.starVisit=v;write(d);
  }
  remember(); window.addEventListener('hashchange',remember);
  // Shared room navigation uses replaceState; read its current hash on departure.
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[href]');if(!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || link.target==='_blank')return;
    const current=locationVisit();const d=read();if(current)d.starVisit=current;
    const help=link.dataset.starHelp;
    if(own(HELP,help)){
      const v=current||visit(d.starVisit);
      if(v) {d.starContext={...v,at:Date.now(),help,include:true};}
      else delete d.starContext;
      if(!write(d)) {
        // Navigation stays available; explain how to retain context manually.
        event.preventDefault();
        let note=document.getElementById('star-context-storage-note');
        if(!note){note=document.createElement('p');note.id='star-context-storage-note';note.setAttribute('role','status');link.after(note);}
        note.replaceChildren(document.createTextNode('이 탭에 출발 정보를 보관할 수 없습니다. 문의에 읽은 별·글과 원하는 도움을 함께 적어주세요. '));
        const fallback=document.createElement('a');fallback.href=link.href;fallback.textContent='출발 정보 없이 계속하기';note.append(fallback);
      }
    } else if(current)write(d);
  },true);
  function get(){return context(read().starContext);}
  function signature(c){return c ? [c.star,c.article,c.help].join('|') : '';}
  function source(base){
    const c=get();
    if(!c || !c.include)return base;
    const prefix=/^service-menu-(video|page|document|monthly|automation)$/.test(base||'')?base:'star-platform';
    return prefix+'|s='+c.star+'|a='+(c.article?CODES[c.star][c.article]:'room')+'|h='+c.help;
  }
  window.HamStarContext={get,signature,source,visit,context};
  const form=document.getElementById('quote-request-form');
  const box=document.getElementById('star-context-confirm');
  if(!form || !box)return;
  const c=get();
  if(c){
    box.hidden=false;
    const title=c.article?STARS[c.star].articles[c.article]:'별 첫 화면';
    document.getElementById('star-context-description').textContent=STARS[c.star].label+' · '+title+' → '+HELP[c.help];
    const link=document.getElementById('star-context-origin');
    link.href='/ham-media-archive/pages/'+c.star+'.html'+(c.article?'#'+c.article:'');
    const include=document.getElementById('star-context-include');include.checked=c.include;
    include.addEventListener('change',()=>{const d=read();const latest=context(d.starContext);if(latest){d.starContext={...latest,include:include.checked};if(!write(d))include.checked=latest.include;}});
  }
  form.addEventListener('quote-submitted',()=>{try{sessionStorage.removeItem(KEY);}catch{}box.hidden=true;});
})();
