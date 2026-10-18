(function () {
  'use strict';
  var root = document.querySelector('.home-reference');
  if (!root || !window.HTMLDialogElement) return;
  var lang = document.documentElement.lang.slice(0, 2);
  var text = {
    ko: {menu:'메뉴', close:'닫기', photo:'사진 보기', pause:'영상 멈추기', play:'영상 재생', routes:[['글과 사진','#stories','마음이 가는 한 편부터'],['아홉 별','#stars','좋아하는 것들이 이어진 세계'],['함께 만드는 일','services/','실제 작업과 맡기는 방법'],['AI 동료','#colleagues-title','이야기로 만나고, 필요한 일로'],['햄집사','https://hamjipsa.hammedia.co.kr/','정리되지 않은 이야기부터'],['직접 해보기','book/#book-try','내 경험으로 해보는 무료 실습']]},
    en: {menu:'Menu',close:'Close',photo:'View photograph',pause:'Pause video',play:'Play video',routes:[['Words and photographs','#stories','Begin with a story'],['Nine stars','#stars','A world made of things we love'],['Work together','services/','Existing work and ways to collaborate'],['AI colleagues','#colleagues-title','Meet through their stories'],['Hamjipsa','https://hamjipsa.hammedia.co.kr/','Start with an unfinished thought (Korean)'],['Try it yourself','book/#book-try','A free exercise using your experience (Korean)']]},
    ja: {menu:'メニュー',close:'閉じる',photo:'写真を見る',pause:'動画を一時停止',play:'動画を再生',routes:[['文章と写真','#stories','気になる物語から'],['九つの星','#stars','好きなものがつながる世界'],['一緒につくる仕事','services/','実際の仕事と依頼方法（韓国語）'],['AIの仲間','#colleagues-title','物語を通して出会う'],['ハムジプサ','https://hamjipsa.hammedia.co.kr/','まとまらない話から（韓国語）'],['自分で試す','book/#book-try','経験を使った無料実習（韓国語）']]}
  }[lang];
  if (!text) return;
  var header = root.querySelector('.hub-header');
  var trigger = document.createElement('button');
  trigger.className='home-menu-trigger'; trigger.type='button'; trigger.textContent=text.menu;
  trigger.setAttribute('aria-haspopup','dialog'); trigger.setAttribute('aria-controls','home-navigation');
  var menu=document.createElement('dialog'); menu.id='home-navigation'; menu.className='home-navigation-dialog';menu.setAttribute('aria-label',text.menu);
  var top=document.createElement('div');top.className='home-navigation-top';var brand=document.createElement('strong');brand.textContent='HAM MEDIA';var close=document.createElement('button');close.type='button';close.textContent=text.close+' ×';top.append(brand,close);
  var routes=document.createElement('nav');routes.className='home-navigation-links';routes.setAttribute('aria-label',text.menu);
  text.routes.forEach(function(r){var a=document.createElement('a');a.href=r[1];a.textContent=r[0];var small=document.createElement('small');small.textContent=r[2];a.append(small);routes.append(a)});
  menu.append(top,routes);root.append(menu);header.append(trigger);var previousFocus,previousScroll,dialogRoute;
  function openDialog(d,hash){previousFocus=document.activeElement;previousScroll=scrollY;dialogRoute={dialog:d,url:location.href};history.pushState({hamDialog:true},'',hash);d.showModal()}
  function closeDialog(d){if(dialogRoute&&dialogRoute.dialog===d&&history.state&&history.state.hamDialog)history.back();else d.close()}
  addEventListener('popstate',function(){if(dialogRoute){var d=dialogRoute.dialog;dialogRoute=null;if(d.open)d.close()}});
  menu.addEventListener('cancel',function(e){e.preventDefault();closeDialog(menu)});
  trigger.addEventListener('click',function(){openDialog(menu,'#navigation');trigger.setAttribute('aria-expanded','true');close.focus()});
  close.addEventListener('click',function(){closeDialog(menu)});
  menu.addEventListener('close',function(){trigger.setAttribute('aria-expanded','false');if(previousFocus)previousFocus.focus({preventScroll:true})});
  routes.addEventListener('click',function(e){var a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();var url=a.href;if(dialogRoute)history.replaceState(null,'',dialogRoute.url);dialogRoute=null;menu.close();location.replace(url)});
  var viewer=document.createElement('dialog');viewer.className='home-photo-dialog';viewer.setAttribute('aria-label',text.photo);
  var viewerTop=top.cloneNode(true);var figure=document.createElement('figure');var image=document.createElement('img');var caption=document.createElement('figcaption');figure.append(image,caption);viewer.append(viewerTop,figure);root.append(viewer);
  root.querySelectorAll('[data-view-photo]').forEach(function(a){a.addEventListener('click',function(e){if(e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();image.src=a.href;image.alt=root.querySelector('.home-studio-scene video').getAttribute('aria-label');caption.textContent=image.alt;openDialog(viewer,'#studio-photo');viewerTop.querySelector('button').focus()})});
  viewerTop.querySelector('button').addEventListener('click',function(){closeDialog(viewer)});viewer.addEventListener('cancel',function(e){e.preventDefault();closeDialog(viewer)});
  viewer.addEventListener('close',function(){if(previousFocus)previousFocus.focus({preventScroll:true});window.scrollTo(0,previousScroll)});
  var reduce=matchMedia('(prefers-reduced-motion: reduce)');
  root.querySelectorAll('[data-scene-video]').forEach(function(video){
    var button=root.querySelector('[data-scene-toggle][aria-controls="'+video.id+'"]');var userPaused=false,visible=false;button.hidden=false;
    function update(){button.textContent=video.paused?text.play:text.pause}
    function play(){if(!visible||document.hidden||reduce.matches||userPaused)return;video.muted=true;var promise=video.play();if(promise)promise.catch(update)}
    button.addEventListener('click',function(){if(video.paused){userPaused=false;video.muted=true;video.play().catch(update)}else{userPaused=true;video.pause()}});
    video.addEventListener('pause',update);video.addEventListener('play',update);video.addEventListener('ended',update);video.addEventListener('error',update);update();
    if('IntersectionObserver'in window){var observer=new IntersectionObserver(function(entries){visible=entries[0].isIntersecting&&entries[0].intersectionRatio>.4;if(visible)play();else video.pause()},{threshold:[0,.41]});observer.observe(video)}
    document.addEventListener('visibilitychange',function(){if(document.hidden)video.pause();else play()});
    reduce.addEventListener('change',function(){if(reduce.matches)video.pause();else play()});
  });
  var scenes=Array.from(root.querySelectorAll('[data-motion-scene]'));var ticking=false;
  function paint(){ticking=false;if(reduce.matches)return;scenes.forEach(function(s){var r=s.getBoundingClientRect();var p=Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight+r.height)));s.style.setProperty('--scene-progress',p.toFixed(4))})}
  addEventListener('scroll',function(){if(!ticking){ticking=true;requestAnimationFrame(paint)}},{passive:true});addEventListener('resize',paint);reduce.addEventListener('change',paint);paint();root.classList.add('experience-ready');
}());
