(function(){
'use strict';
var root=document.querySelector('.home-experience');if(!root)return;
var lang=document.documentElement.lang.slice(0,2);
var w={ko:{pause:'움직임 멈추기',play:'움직임 재생',menu:'메뉴',close:'닫기',routes:[['작업과 맡기는 방법','services/'],['글과 아홉 별','#stories'],['함께 만드는 동료','#colleagues-title'],['책과 무료 실습','#book-film'],['만들고 싶은 일 이야기하기','quote/']]},en:{pause:'Pause motion',play:'Play motion',menu:'Menu',close:'Close',routes:[['Work & services (Korean)','services/'],['Stories & nine stars','#stories'],['AI colleagues','#colleagues-title'],['Book & free exercise','#book-film'],['Tell us your idea (Korean)','quote/']]},ja:{pause:'動きを止める',play:'動きを再生',menu:'メニュー',close:'閉じる',routes:[['仕事と依頼方法（韓国語）','services/'],['物語と九つの星','#stories'],['一緒につくる仲間','#colleagues-title'],['本と無料実習','#book-film'],['つくりたいことを話す（韓国語）','quote/']]}}[lang];if(!w)return;
var reduce=matchMedia('(prefers-reduced-motion: reduce)');
root.querySelectorAll('[data-home-loop]').forEach(function(video){
var button=root.querySelector('[data-loop-toggle][aria-controls="'+video.id+'"]');var visible=false,userPaused=false;button.hidden=false;
video.muted=true;video.defaultMuted=true;video.playsInline=true;
function update(){button.textContent=video.paused?w.play:w.pause;button.setAttribute('aria-pressed',String(!video.paused));}
function load(){if(!video.getAttribute('src')){video.src=video.dataset.loopSrc;video.load();}}
function start(manual){if(document.hidden||!visible||(!manual&&(reduce.matches||userPaused)))return;load();video.muted=true;video.loop=!reduce.matches;var promise=video.play();if(promise)promise.catch(update);}
button.addEventListener('click',function(){if(video.paused){userPaused=false;start(true)}else{userPaused=true;video.pause()}});
video.addEventListener('play',update);video.addEventListener('pause',update);video.addEventListener('ended',update);video.addEventListener('error',function(){video.controls=true;update()});update();
if('IntersectionObserver'in window){new IntersectionObserver(function(entries){var e=entries[0];visible=e.isIntersecting&&e.intersectionRatio>.2;if(visible)start(false);else video.pause()},{threshold:[0,.21]}).observe(video)}else{visible=true;start(false)}
document.addEventListener('visibilitychange',function(){if(document.hidden)video.pause();else start(false)});
reduce.addEventListener('change',function(){if(reduce.matches){video.autoplay=false;video.pause();video.loop=false;}else{video.loop=true;start(false)}});
});
var optionalKey='ham_home_optional_v1:'+location.pathname;var optional=Array.from(root.querySelectorAll('.home-more-stories,.home-footer-more'));var saved;try{saved=JSON.parse(sessionStorage.getItem(optionalKey)||'null')}catch(e){}if(Array.isArray(saved))optional.forEach(function(d,i){d.open=!!saved[i]});optional.forEach(function(d){d.addEventListener('toggle',function(){try{sessionStorage.setItem(optionalKey,JSON.stringify(optional.map(function(n){return n.open})))}catch(e){}})});
function showTarget(){var id;try{id=decodeURIComponent(location.hash.slice(1))}catch(e){return}var target=document.getElementById(id);if(!target)return;var p=target.closest('details');while(p){p.open=true;p=p.parentElement.closest('details')}}showTarget();addEventListener('hashchange',showTarget);
if(!window.HTMLDialogElement)return;
var header=root.querySelector('.hub-header');var trigger=document.createElement('button');trigger.type='button';trigger.className='home-menu-trigger';trigger.textContent=w.menu;trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','home-navigation');trigger.setAttribute('aria-expanded','false');header.append(trigger);root.classList.add('js-menu-ready');
var dialog=document.createElement('dialog');dialog.id='home-navigation';dialog.className='home-navigation-dialog';dialog.setAttribute('aria-label',w.menu);
var top=document.createElement('div');top.className='home-navigation-top';var brand=document.createElement('strong');brand.textContent='HAM MEDIA';var close=document.createElement('button');close.type='button';close.textContent=w.close+' ×';top.append(brand,close);var nav=document.createElement('nav');nav.className='home-navigation-links';w.routes.forEach(function(r){var a=document.createElement('a');a.textContent=r[0];a.href=r[1];nav.append(a)});dialog.append(top,nav);root.append(dialog);
var from;
trigger.addEventListener('click',function(){from=location.href;history.pushState({hamHomeMenu:true},'','#navigation');dialog.showModal();trigger.setAttribute('aria-expanded','true');close.focus()});
function dismiss(){if(history.state&&history.state.hamHomeMenu)history.back();else dialog.close()}
close.addEventListener('click',dismiss);dialog.addEventListener('cancel',function(e){e.preventDefault();dismiss()});addEventListener('popstate',function(){if(dialog.open)dialog.close()});dialog.addEventListener('close',function(){trigger.setAttribute('aria-expanded','false');trigger.focus({preventScroll:true})});
nav.addEventListener('click',function(e){var a=e.target.closest('a');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;e.preventDefault();var href=a.href;history.replaceState(null,'',from||location.pathname);dialog.close();location.assign(href)});
})();
