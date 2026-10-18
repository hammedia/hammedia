/* Shared accessible controls; each star keeps its own story and visual language. */
(function () {
 'use strict';
 var body=document.body,star=body.dataset.starReference;if(!star)return;
 var reduce=matchMedia('(prefers-reduced-motion: reduce)');
 var stars=[['fountain-pens','만년필별'],['motorcycles','바이크별'],['travel','여행별'],['bicycles','자전거별'],['spaces','공간별'],['cars','자동차별'],['food','음식별'],['music-audio','음악·오디오별'],['cameras','카메라별']];
 var own=stars.find(function(s){return location.pathname.endsWith('/'+s[0]+'.html')});
 var header=document.createElement('header');header.className='star-reference-header';
 var home=document.createElement('a');home.href='../../#stars';home.textContent='HAM MEDIA';
 var name=document.createElement('span');name.textContent=own?own[1]:'';var menuButton=document.createElement('button');menuButton.type='button';menuButton.textContent='아홉 별';menuButton.setAttribute('aria-haspopup','dialog');header.append(home,name,menuButton);body.prepend(header);
 var openRoute=null;
 function showDialog(dialog,hash){openRoute={dialog:dialog,url:location.href,focus:document.activeElement,scroll:scrollY,state:history.state};history.pushState(Object.assign({},history.state,{starDialog:true}),'',hash);dialog.showModal()}
 function closeDialog(dialog){if(openRoute&&history.state?.starDialog)history.back();else dialog.close()}
 addEventListener('popstate',function(){if(!openRoute)return;var previous=openRoute;openRoute=null;previous.dialog.close();requestAnimationFrame(function(){previous.focus?.focus({preventScroll:true});window.scrollTo({top:previous.scroll,behavior:'instant'})})});
 function top(dialog,label){var bar=document.createElement('div');bar.className='star-dialog-top';var title=document.createElement('strong');title.textContent=label;var button=document.createElement('button');button.type='button';button.textContent='닫기';button.setAttribute('aria-label',label+' 닫기');button.onclick=function(){closeDialog(dialog)};bar.append(title,button);dialog.addEventListener('cancel',function(e){e.preventDefault();closeDialog(dialog)});return bar}
 if(typeof HTMLDialogElement!=='undefined'){
  var menu=document.createElement('dialog');menu.className='star-navigation-dialog';menu.setAttribute('aria-label','아홉 별');menu.id='star-navigation';menu.append(top(menu,'HAM MEDIA · 아홉 별'));var links=document.createElement('nav');links.setAttribute('aria-label','다른 별로');
  stars.forEach(function(s){var a=document.createElement('a');a.href=s[0]+'.html';a.textContent=s[1];if(own&&own[0]===s[0])a.setAttribute('aria-current','page');links.append(a)});menu.append(links);body.append(menu);menuButton.setAttribute('aria-controls','star-navigation');menuButton.onclick=function(){showDialog(menu,'#star-navigation')};
  links.addEventListener('click',function(e){var a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();var destination=a.href;if(openRoute)history.replaceState(openRoute.state,'',openRoute.url);openRoute=null;menu.close();location.assign(destination)});
  var viewer=document.createElement('dialog');viewer.className='star-photo-dialog';viewer.setAttribute('aria-label','사진 크게 보기');viewer.append(top(viewer,'사진 크게 보기'));var figure=document.createElement('figure'),img=document.createElement('img'),caption=document.createElement('figcaption');figure.append(img,caption);viewer.append(figure);var controls=document.createElement('div');controls.className='star-photo-controls';var previous=document.createElement('button'),next=document.createElement('button');previous.textContent='이전 사진';next.textContent='다음 사진';previous.type=next.type='button';controls.append(previous,next);viewer.append(controls);body.append(viewer);
  var photos=[],selected=0;
  function paintPhoto(index){selected=index;var item=photos[index];img.src=item.src;img.alt=item.alt;caption.textContent=(index+1)+' / '+photos.length+' · '+(item.caption||item.alt);previous.disabled=index===0;next.disabled=index===photos.length-1}
  function openPhotos(items,index){photos=items;paintPhoto(index);showDialog(viewer,'#photograph')}
  previous.onclick=function(){if(selected>0)paintPhoto(selected-1)};next.onclick=function(){if(selected<photos.length-1)paintPhoto(selected+1)};
  viewer.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'&&selected>0){e.preventDefault();paintPhoto(selected-1)}if(e.key==='ArrowRight'&&selected<photos.length-1){e.preventDefault();paintPhoto(selected+1)}});
  if(star==='camera'){
   var choices=Array.from(document.querySelectorAll('.selection-choice'));var enlarge=document.createElement('button');enlarge.className='star-photo-enlarge';enlarge.type='button';enlarge.textContent='선택한 사진 크게 보기';document.querySelector('.selection-stage-copy')?.append(enlarge);
   enlarge.onclick=function(){var items=choices.map(function(b){return {src:b.dataset.src,alt:b.dataset.alt,caption:b.dataset.reason}});var active=choices.findIndex(function(b){return b.getAttribute('aria-pressed')==='true'});openPhotos(items,Math.max(0,active))};
  }
  // The current archive grid/detail contract remains in main.js. Car has its own inline room contract.
  if(star==='car') document.querySelectorAll('.photo-card,.rep-figure').forEach(function(f){var image=f.querySelector('img');if(!image)return;f.tabIndex=0;f.setAttribute('role','button');f.setAttribute('aria-label',(image.alt||'사진')+' 크게 보기');var open=function(){var all=Array.from(document.querySelectorAll('.photo-card img,.rep-figure img'));openPhotos(all.map(function(i){return {src:i.currentSrc||i.src,alt:i.alt,caption:i.closest('figure')?.querySelector('figcaption')?.textContent.trim()}}),all.indexOf(image))};f.addEventListener('click',open);f.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}})});
 }
 // The car's existing manually selectable wall becomes a clear exhibition with explicit controls.
 if(star==='car'){
  var originals=Array.from(document.querySelectorAll('.live-frame'));
  if(originals.length){var exhibit=document.createElement('section');exhibit.className='car-memory-exhibit';exhibit.setAttribute('aria-label','길 위의 기억 고르기');var f=document.createElement('figure'),photo=document.createElement('img'),copy=document.createElement('figcaption'),title=document.createElement('strong'),description=document.createElement('span');photo.loading='lazy';copy.append(title,description);f.append(photo,copy);exhibit.append(f);var bar=document.createElement('div');bar.className='car-exhibit-controls';var prev=document.createElement('button'),nextCar=document.createElement('button'),dots=document.createElement('div');prev.type=nextCar.type='button';prev.textContent='이전 기억';nextCar.textContent='다음 기억';dots.className='car-exhibit-dots';dots.setAttribute('aria-label','기억 선택');bar.append(prev,dots,nextCar);exhibit.append(bar);var wall=document.querySelector('.live-wall-wrap');wall.after(exhibit);wall.hidden=true;var at=0;
   originals.forEach(function(frame,i){var dot=document.createElement('button');dot.type='button';dot.textContent=String(i+1).padStart(2,'0');dot.setAttribute('aria-label',(frame.dataset.s||'기억')+' 선택');dot.onclick=function(){select(i)};dots.append(dot)});
   function select(i){at=i;var source=originals[i],image=source.querySelector('img');photo.src=image?.src||source.dataset.src||getComputedStyle(source).backgroundImage.replace(/^url\(["']?|["']?\)$/g,'');photo.alt=source.dataset.s||image?.alt||'길 위의 기억';title.textContent=source.dataset.s||image?.alt||'길 위의 기억';description.textContent=source.dataset.f||'';prev.disabled=i===0;nextCar.disabled=i===originals.length-1;Array.from(dots.children).forEach(function(dot,n){dot.setAttribute('aria-pressed',String(n===i))});photo.style.animation='none';requestAnimationFrame(function(){photo.style.animation=''})}
   prev.onclick=function(){if(at>0)select(at-1)};nextCar.onclick=function(){if(at<originals.length-1)select(at+1)};select(0);
  }
 }
 var selectors={fountain:'.scene:not(.hero-scene)',motorcycle:'.bike-story-section',travel:'.journey-stop',bicycle:'.ride-stage',space:'.chapter',car:'.rep-figure,.car-group',food:'.scene-photo-page,.photo-strip',music:'.audio-v2-section',camera:'.section'};
 var scenes=Array.from(document.querySelectorAll(selectors[star]||'main>section'));scenes.forEach(function(s){s.dataset.refMotion=''});document.querySelector('h1')?.classList.add('ref-arrival');var queued=false;
 function paint(){queued=false;scenes.forEach(function(s){var r=s.getBoundingClientRect(),p=reduce.matches?1:Math.max(0,Math.min(1,(innerHeight-r.top)/(innerHeight*.65)));s.style.setProperty('--ref-progress',String(p))})}
 addEventListener('scroll',function(){if(!queued){queued=true;requestAnimationFrame(paint)}},{passive:true});addEventListener('resize',paint);reduce.addEventListener('change',paint);paint();
 // Explicit native controls survive a script/network failure. Only visible native clips auto-start muted.
 document.querySelectorAll('video').forEach(function(video){video.controls=true;video.muted=true;video.removeAttribute('autoplay');var visible=false,userPaused=false,automatic=false;
  video.addEventListener('pause',function(){if(!automatic&&visible&&!video.ended)userPaused=true});video.addEventListener('play',function(){if(!automatic)userPaused=false});
  function pause(){automatic=true;video.pause();video.muted=true;setTimeout(function(){automatic=false},0)}
  function play(){if(!visible||document.hidden||reduce.matches||userPaused)return;automatic=true;video.muted=true;var p=video.play();if(p)p.catch(function(){}).finally(function(){automatic=false})}
  if('IntersectionObserver'in window)new IntersectionObserver(function(entries){visible=entries[0].intersectionRatio>.5;if(visible)play();else pause()},{threshold:[0,.51,1]}).observe(video);
  document.addEventListener('visibilitychange',function(){if(document.hidden)pause();else play()});reduce.addEventListener('change',function(){if(reduce.matches)pause();else play()});if(reduce.matches)pause();
 });
})();
