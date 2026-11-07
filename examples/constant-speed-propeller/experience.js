(() => {
'use strict';
const $=id=>document.getElementById(id), status=$('load-status'), start=$('start'), pause=$('pause'), exit=$('exit'), reduce=$('reduce-motion');
const preference=matchMedia('(prefers-reduced-motion: reduce)');reduce.checked=preference.matches;
let machine=null,generation=0,loading=false,lastPaint=0,video=document.querySelector('video');
const names={hero:'전체 구조',front:'정면',side:'옆면',hub:'허브 가까이',governor:'거버너 가까이',top:'위에서'};
function enabled(value){$('machine-controls').disabled=!value;$('view').disabled=!value;$('zoom').disabled=!value;$('previous-view').disabled=!value;$('next-view').disabled=!value;}
function controls(c){$('rpm').value=c.sel;$('airspeed').value=c.kt;$('throttle').value=c.thr;values();}
function values(){$('rpm-value').textContent=$('rpm').value+' RPM';$('airspeed-value').textContent=Math.round($('airspeed').value)+' kt';$('throttle-value').textContent=Math.round($('throttle').value*100)+'%';}
function state(s){if(performance.now()-lastPaint<100&&s.running)return;lastPaint=performance.now();$('selected-rpm').textContent=Math.round(s.sel);$('actual-rpm').textContent=Math.round(s.rpm);$('blade-angle').textContent=s.beta.toFixed(1)+'°';$('valve').textContent=(s.x>=0?'+':'')+s.x.toFixed(2);const message=!s.oil?'유압 상실 · 이 무평형추 허브에서는 저피치로 움직입니다.':s.cond[0].startsWith('On the low')?'저피치 스톱 · 거버너의 조절 범위 밖입니다.':s.cond[0].startsWith('On the high')?'고피치 스톱 · 거버너의 조절 범위 밖입니다.':s.x>.12?'과회전 · 밸브가 올라가 오일이 들어가고 피치가 커집니다.':s.x<-.12?'저회전 · 오일이 빠지고 피치가 작아집니다.':'정속 · 플라이웨이트와 스프링이 균형을 이룹니다.';$('mechanism-state').textContent=message;if(s.tour)controls(s.ctl);window.propExperienceState={rpm:s.rpm,selected:s.sel,beta:s.beta,valve:s.x,oil:s.oil,time:s.time,tour:s.tour,running:s.running,reduced:s.reduced};}
function stop(){machine?.pause();pause.textContent='작동 다시 시작';if(machine)status.textContent='멈춤 · 기계 계산과 화면 움직임을 멈췄습니다.';}
function close(){generation++;loading=false;if(machine){machine.dispose();machine=null;}$('canvas-host').replaceChildren();$('poster').hidden=false;start.hidden=false;start.disabled=false;pause.hidden=true;exit.hidden=true;enabled(false);status.textContent='체험 종료 · 다시 시작할 수 있습니다.';window.propExperienceState=null;}
function failure(error){close();$('fallback').hidden=false;status.textContent='3D를 열지 못했습니다. 아래 영상과 설명을 이용해 주세요.';console.warn('Propeller experience unavailable',error?.message||error);}
start.addEventListener('click',async()=>{if(loading||machine)return;const own=++generation;loading=true;start.disabled=true;status.textContent='3D를 준비하고 있습니다…';$('fallback').hidden=true;video.pause();const canvas=document.createElement('canvas');canvas.setAttribute('aria-label','정속 프로펠러 3D 도해. 시점과 확대는 아래 조작부로 선택할 수 있습니다.');canvas.setAttribute('aria-describedby','canvas-help');$('canvas-host').replaceChildren(canvas);let timer=setTimeout(()=>{if(loading&&own===generation)failure(new Error('Loading timeout'));},30000);try{const {createExperience}=await import('./engine.js?v=1');if(own!==generation)return;const ready=await createExperience(canvas,state,failure,reduce.checked);if(own!==generation){ready.dispose();return;}machine=ready;controls({sel:2400,kt:128,thr:.66});$('preset').value='cruise';$('view').value='hero';$('zoom').value=1;$('oil-loss').checked=false;document.querySelectorAll('[data-display]').forEach(i=>i.checked=i.dataset.display==='cowling');$('stage-view').textContent='전체 구조';$('poster').hidden=true;start.hidden=true;pause.hidden=false;exit.hidden=false;enabled(true);loading=false;machine.play();pause.textContent='작동 멈추기';status.textContent='작동 중 · RPM이나 속도를 바꿔 보세요.';$("stage").scrollIntoView({block:"start",behavior:"instant"});pause.focus({preventScroll:true});}catch(e){if(own===generation)failure(e);}finally{clearTimeout(timer);if(own===generation){loading=false;start.disabled=false;}}});
pause.addEventListener('click',()=>{if(!machine)return;if(machine.status().running)stop();else{machine.play();pause.textContent='작동 멈추기';status.textContent='작동 중';}});
exit.addEventListener('click',()=>{close();start.focus();});
document.querySelectorAll('[data-control]').forEach(i=>i.addEventListener('input',()=>{values();machine?.set(i.dataset.control,i.value);$('preset').selectedIndex=-1;}));
$('preset').addEventListener('change',()=>{machine?.preset($('preset').value);if(machine)controls(machine.status().ctl);$('oil-loss').checked=false;});
$('view').addEventListener('change',()=>{machine?.view($('view').value);$('stage-view').textContent=names[$('view').value];$('zoom').value=1;});
for(const [id,delta] of [['previous-view',-1],['next-view',1]])$(id).addEventListener('click',()=>{const v=$('view');v.selectedIndex=(v.selectedIndex+delta+v.options.length)%v.options.length;v.dispatchEvent(new Event('change'));});
$('zoom').addEventListener('input',()=>machine?.zoom(Number($('zoom').value)));
document.querySelectorAll('[data-display]').forEach(i=>i.addEventListener('change',()=>machine?.display(i.dataset.display,i.checked)));
$('oil-loss').addEventListener('change',()=>machine?.oil(!$('oil-loss').checked));
reduce.addEventListener('change',()=>{machine?.reduce(reduce.checked);$('tour').disabled=reduce.checked;});$('tour').disabled=reduce.checked;
preference.addEventListener('change',e=>{reduce.checked=e.matches;machine?.reduce(e.matches);$('tour').disabled=e.matches;});
$('tour').addEventListener('click',()=>{if(reduce.checked)return;machine?.tour();pause.textContent='작동 멈추기';status.textContent='원본 자동투어 · 직접 조작하면 수동으로 돌아옵니다.';});
$('reset').addEventListener('click',()=>{lastPaint=0;machine?.reset();machine?.view('hero');for(const i of document.querySelectorAll('[data-display]')){i.checked=i.dataset.display==='cowling';machine?.display(i.dataset.display,i.checked);}machine?.oil(true);$('oil-loss').checked=false;$('view').value='hero';$('stage-view').textContent='전체 구조';$('zoom').value=1;$('preset').value='cruise';if(machine)controls(machine.status().ctl);status.textContent='순항 초기값으로 돌아왔습니다.';});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
window.addEventListener('pagehide',()=>{close();video.pause();});
video.addEventListener('play',stop);
values();
})();