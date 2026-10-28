(function(){
 'use strict';
 var video=document.getElementById('home-motor-video');if(!video)return;
 var figure=video.closest('figure'),overlay=figure.querySelector('.motor-overlay'),modes=document.querySelector('.motor-modes');
 var lang=document.documentElement.lang.slice(0,2),mode='structure',reduced=matchMedia('(prefers-reduced-motion: reduce)');
 var original=[].map.call(document.querySelectorAll('.motor-reading li'),function(li){return [li.querySelector('strong').textContent,li.querySelector('span').textContent]});
 var words={ko:[['모터를 이루는 부품','외피와 권선, 회전자를 차례로 봅니다.'],['전류에서 회전으로','권선의 순차 발광과 안쪽 회전자를 함께 봅니다.'],['회전이 축의 출력으로','에너지 흐름과 회전·냉각을 보여 줍니다.']],en:[['The parts of a motor','See the housing, windings and rotor.'],['From current to rotation','Watch the windings light up in sequence around the rotor.'],['Rotation becomes shaft output','Follow the energy, rotation and cooling.']],ja:[['モーターを構成する部品','外装・巻線・回転子を順に見ます。'],['電流から回転へ','巻線の順次発光と内側の回転子を見ます。'],['回転が軸の出力へ','エネルギーの流れ、回転と冷却を示します。']]}[lang];
 if(!words)return;
 modes.hidden=false;
 function step(){return mode==='structure'?(video.currentTime<2?0:video.currentTime<9.8?1:2):(video.currentTime<19?0:video.currentTime<28?1:2)}
 function sync(){var i=step(),copy=mode==='structure'?original:words;overlay.querySelector('[data-motor-count]').textContent='0'+(i+1)+' / 03';overlay.querySelector('[data-motor-heading]').textContent=copy[i][0];overlay.querySelector('[data-motor-copy]').textContent=copy[i][1];figure.style.setProperty('--motor-progress',String(video.currentTime/(mode==='structure'?12:40)));document.querySelectorAll('.motor-reading li').forEach(function(li,n){li.dataset.current=String(i===n);li.querySelector('strong').textContent=copy[n][0];li.querySelector('span').textContent=copy[n][1]})}
 modes.querySelectorAll('button').forEach(function(btn){btn.addEventListener('click',function(){if(mode===btn.dataset.motorMode)return;mode=btn.dataset.motorMode;var source=mode==='structure'?video.dataset.loopSrc:'services/assets/motion-use-20261021/motor-principle.mp4';video.pause();video.autoplay=false;video.removeAttribute('autoplay');video.src=source;video.currentTime=0;video.load();video.loop=!reduced.matches;sync();figure.scrollIntoView({block:'start',behavior:reduced.matches?'instant':'smooth'});modes.querySelectorAll('button').forEach(function(b){b.setAttribute('aria-pressed',String(b===btn))});if(!reduced.matches&&!document.hidden)video.play().catch(function(){video.controls=true})})});
 video.addEventListener('timeupdate',sync);video.addEventListener('seeked',sync);video.addEventListener('loadedmetadata',sync);sync();
})();
