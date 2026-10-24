(function(){
'use strict';
var root=document.querySelector('.home-experience');if(!root)return;
var lang=document.documentElement.lang.slice(0,2);
var w={ko:{pause:'움직임 멈추기',play:'움직임 재생'},en:{pause:'Pause motion',play:'Play motion'},ja:{pause:'動きを止める',play:'動きを再生'}}[lang];if(!w)return;
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
var purpose=root.querySelector('.home-purpose-chooser');if(purpose){var summary=purpose.querySelector('summary');purpose.addEventListener('keydown',function(event){if(event.key==='Escape'&&purpose.open){purpose.open=false;summary.focus({preventScroll:true})}});document.addEventListener('click',function(event){if(purpose.open&&!purpose.contains(event.target))purpose.open=false})}
})();
