(function(){
 'use strict';
 var video=document.getElementById('home-motor-video');if(!video)return;
 var figure=video.closest('figure'),overlay=figure.querySelector('.motor-overlay'),modes=document.querySelector('.motor-modes'),pointer=figure.querySelector('.motor-pointer');
 var lang=document.documentElement.lang.slice(0,2),mode='structure',reduced=matchMedia('(prefers-reduced-motion: reduce)');
 var original=[].map.call(document.querySelectorAll('.motor-reading li'),function(li){return [li.querySelector('strong').textContent,li.querySelector('span').textContent]});
 var words={
  ko:[['겉을 열어, 안쪽 부품부터','전선을 감은 부분과 안에서 도는 부분을 펼쳐 봅니다.'],['전기의 힘으로 안쪽이 돌고','전기의 흐름은 빛으로, 회전은 움직임으로 보여줍니다.'],['회전하는 힘을 바깥으로','가운데 축을 통해 회전의 힘이 전해지는 길을 봅니다.']],
  en:[['Open it and see the parts','Separate the wire windings and the part that turns inside.'],['Electricity makes the inside turn','Light shows the current; movement shows the rotation.'],['Turning force reaches the outside','Follow the turning force along the central shaft.']],
  ja:[['外装を開き、内側の部品から','巻いた電線と、内側で回る部分を広げて見ます。'],['電気の力で、内側が回る','電気の流れは光で、回転は動きで見せます。'],['回る力を、外側へ','中央の軸を通して力が伝わる道筋を見ます。']]
 }[lang];
 if(!words)return;
 modes.hidden=false;
 function step(){return mode==='structure'?(video.currentTime<4.2?0:video.currentTime<9.8?1:2):(video.currentTime<19?0:video.currentTime<28?1:2)}
 function point(){
  if(!pointer)return;
  var v=video.getBoundingClientRect(),f=figure.getBoundingClientRect(),vw=video.videoWidth||1280,vh=video.videoHeight||574;
  if(!v.width||!v.height)return;
  var scale=Math.min(v.width/vw,v.height/vh),dw=vw*scale,dh=vh*scale;
  pointer.style.left=(v.left-f.left+(v.width-dw)/2)+'px';pointer.style.top=(v.top-f.top+(v.height-dh)/2)+'px';pointer.style.width=dw+'px';pointer.style.height=dh+'px';pointer.setAttribute('viewBox','0 0 '+vw+' '+vh);
  var targets=mode==='structure'?[[.55,.45],[.62,.5],[.4,.51]]:[[.54,.47],[.52,.49],[.65,.49]],target=targets[step()],x=vw*target[0],y=vh*target[1];
  pointer.querySelector('path').setAttribute('d','M '+vw*.18+' '+vh*.2+' L '+vw*.28+' '+vh*.2+' L '+x+' '+y);
  var ring=pointer.querySelector('.pointer-ring');ring.setAttribute('cx',x);ring.setAttribute('cy',y);ring.setAttribute('r',vw*.035);
  var dot=pointer.querySelector('.pointer-dot');dot.setAttribute('cx',x);dot.setAttribute('cy',y);dot.setAttribute('r',vw*.0045);pointer.removeAttribute('hidden');
 }
 function sync(){
  var i=step(),copy=mode==='structure'?original:words;
  overlay.querySelector('[data-motor-count]').textContent='0'+(i+1)+' / 03';overlay.querySelector('[data-motor-heading]').textContent=copy[i][0];overlay.querySelector('[data-motor-copy]').textContent=copy[i][1];figure.style.setProperty('--motor-progress',String(video.currentTime/(video.duration|| (mode==='structure'?12:40))));
  document.querySelectorAll('.motor-reading li').forEach(function(li,n){li.dataset.current=String(i===n);li.querySelector('strong').textContent=copy[n][0];li.querySelector('span').textContent=copy[n][1]});point();
 }
 modes.querySelectorAll('button').forEach(function(btn){btn.addEventListener('click',function(){
  if(mode===btn.dataset.motorMode)return;
  mode=btn.dataset.motorMode;video.pause();video.autoplay=false;video.removeAttribute('autoplay');video.src=mode==='structure'?video.dataset.loopSrc:'services/assets/motion-use-20261021/motor-principle.mp4';video.currentTime=0;video.load();video.loop=!reduced.matches;sync();
  figure.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});modes.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b===btn))});if(!reduced.matches&&!document.hidden)video.play().catch(function(){video.controls=true});
 })});
 video.addEventListener('timeupdate',sync);video.addEventListener('seeked',sync);video.addEventListener('loadedmetadata',sync);addEventListener('resize',point);if('ResizeObserver' in window)new ResizeObserver(point).observe(figure);sync();
})();
