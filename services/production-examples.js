(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const players = [...document.querySelectorAll('[data-production-player]')];
  const state = new Map();
  players.forEach(figure => {
    const video = figure.querySelector('video');
    const button = figure.querySelector('[data-example-play]');
    const status = figure.querySelector('[data-example-status]');
    const record = {started:false, visible:false};
    state.set(figure,record);
    button.hidden = false;
    function sync(){
      button.textContent = video.ended ? '다시 보기' : video.paused ? (record.started?'이어서 보기':button.dataset.label) : '멈추기';
      button.setAttribute('aria-pressed',String(!video.paused));
    }
    async function play(manual){
      if(!manual && (reduce.matches || record.started))return;
      if(video.ended)video.currentTime=0;
      if(!video.getAttribute('src')){video.src=video.dataset.src;video.controls=true;video.load();}
      try{await video.play();status.textContent='';}
      catch{status.textContent='재생 버튼이나 아래 영상 파일 열기를 이용해주세요.';}
      sync();
    }
    record.play=play;
    button.addEventListener('click',()=>video.paused?play(true):video.pause());
    video.addEventListener('play',()=>{
      record.started=true;
      players.forEach(other=>{if(other!==figure)other.querySelector('video').pause();});
      sync();
    });
    ['pause','ended','loadedmetadata'].forEach(name=>video.addEventListener(name,sync));
    video.addEventListener('error',()=>{status.textContent='영상을 읽지 못했습니다. 아래 영상 파일 열기를 이용해주세요.';sync();});
  });
  if('IntersectionObserver' in window){
    const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
      const record=state.get(entry.target);record.visible=entry.isIntersecting&&entry.intersectionRatio>=.5;
      const video=entry.target.querySelector('video');
      if(!record.visible)video.pause();
      else if(entry.target.dataset.autostart==='muted'&&!document.hidden)record.play(false);
    }),{threshold:[0,.5]});
    players.forEach(figure=>observer.observe(figure));
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden)players.forEach(figure=>figure.querySelector('video').pause());});
  reduce.addEventListener('change',()=>{if(reduce.matches)players.forEach(figure=>figure.querySelector('video').pause());});
})();
