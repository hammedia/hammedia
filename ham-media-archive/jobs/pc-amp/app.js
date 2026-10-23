/* One explanation model; no device access, network submission, or persistence. */
const $ = (s) => document.querySelector(s);
const state = {step:0, pc:'unknown', cable:false, off:false, speaker:false, input:'unknown', output:'unknown', pcOutput:'unknown', view:'overview', port:'pc'};
let model = null;
const steps = [
  ['PC에서 소리가 나오는 곳', 'PC의 3.5mm 헤드폰·Line Out이 정상 작동하는 경우의 연결입니다. 아래 선택은 설명 모형의 조건이며 실제 PC를 검사하지 않습니다.'],
  ['한쪽은 하나, 반대쪽은 둘', '3.5mm 스테레오 수 → RCA 수 2개 케이블입니다. 흰색은 왼쪽 L, 빨강은 오른쪽 R. 앰프의 LINE IN으로 들어갑니다.'],
  ['두 스피커에는 각각 한 쌍', '앰프 전원을 끈 뒤 연결합니다. 왼쪽 L·오른쪽 R 각각에 +/− 두 가닥이 필요합니다. 빨강/검정은 좌우가 아니라 극성입니다.'],
  ['선 다음에는 입력과 출력', '아래는 설정 위치를 익히는 예시입니다. 실제 앱이나 PC 설정을 바꾸지 않습니다. PC 운영체제는 확인 전입니다.'],
  ['이제, 소리가 가는 길', '모형에서 고른 연결과 설정을 함께 확인합니다. 실제 소리·설치 성공은 현장에서 낮은 음량부터 좌우를 들어 확인해야 합니다.']
];
const portInfo = {
  pc:['PC 3.5mm 출력', '헤드폰 / Line Out 표시를 찾으세요. 마이크 입력과 다릅니다. 실제 이어폰으로 소리가 나는지 먼저 확인합니다.'],
  line:['LINE IN · 앰프로 들어오는 소리', 'RCA 흰색 L과 빨강 R을 한 쌍으로 꽂습니다. SUB OUT은 출력이므로 이 케이블의 도착지가 아닙니다.'],
  speaker:['Speaker Out · 스피커로 나가는 소리', '전원을 끄고 왼쪽·오른쪽 각각 +/−를 연결합니다. 헐거운 선이나 노출된 구리선이 서로 닿지 않게 확인합니다.'],
  usb:['USB · PC 오디오 입력이 아닙니다', 'WiiM Amp의 USB는 PC USB 오디오 입력을 지원하지 않습니다. USB 저장장치 재생·USB 오디오 출력과 구별합니다.'],
  hdmi:['HDMI ARC · 일반 PC HDMI와 다릅니다', 'Amp의 ARC 입력은 ARC 지원 TV 연결용입니다. 일반 PC HDMI 출력을 그대로 꽂는 연결을 정답으로 안내하지 않습니다.'],
  sub:['SUB OUT · 입력이 아닙니다', '능동 서브우퍼로 소리를 내보내는 출력입니다. PC의 빨강·흰색 RCA 선은 LINE IN에 연결합니다.']
};
function ready(){return state.pc==='analog' && state.cable && state.off && state.speaker && state.input==='line' && state.output==='speaker' && state.pcOutput==='analog';}
function feedback(text, warning=false){$('#feedback').textContent=text;$('#feedback').classList.toggle('warning',warning);}
function drawing(kind){
  const common='<svg viewBox="0 0 420 112" role="img" aria-label="'+(kind==='pc'?'3.5mm 스테레오 출력과 케이블':kind==='speaker'?'좌우 각각 플러스 마이너스로 연결':kind==='settings'?'PC 출력, 앰프 입력과 출력 설정':'흰색 L, 빨강 R을 LINE IN에 연결')+'">';
  if(kind==='pc') return common+'<rect x="22" y="22" width="95" height="65" rx="9" fill="#c9cfd1"/><circle cx="86" cy="55" r="12" fill="#353b3b"/><circle cx="86" cy="55" r="5" fill="#090d0f"/><path d="M103 55 H190" stroke="#343c3d" stroke-width="9"/><path d="M190 55 H260" stroke="#c5a85c" stroke-width="8"/><path d="M220 50 V60 M232 50 V60" stroke="#222" stroke-width="3"/><text x="150" y="91">3.5mm 스테레오 수 (TRS)</text><text x="289" y="58">소리 출력</text></svg>';
  if(kind==='speaker')return common+'<text x="28" y="24">왼쪽 L</text><text x="255" y="24">오른쪽 R</text><path d="M47 48 H143 M47 78 H143 M273 48 H369 M273 78 H369" stroke="#333" stroke-width="5"/><path d="M47 48 H143 M273 48 H369" stroke="#b31c24" stroke-width="5"/>'+[47,143,273,369].map(x=>'<circle cx="'+x+'" cy="48" r="10" fill="#b31c24"/><circle cx="'+x+'" cy="78" r="10" fill="#303132"/><text x="'+x+'" y="52" text-anchor="middle" fill="white">+</text><text x="'+x+'" y="82" text-anchor="middle" fill="white">−</text>').join('')+'<text x="80" y="105">+ → + / − → −</text><text x="294" y="105">+ → + / − → −</text></svg>';
  if(kind==='settings')return common+'<rect x="16" y="18" width="110" height="72" rx="8" fill="#e0e7e4"/><rect x="155" y="18" width="110" height="72" rx="8" fill="#e0e7e4"/><rect x="294" y="18" width="110" height="72" rx="8" fill="#e0e7e4"/><text x="71" y="45" text-anchor="middle">PC 출력</text><text x="71" y="68" text-anchor="middle">아날로그</text><text x="210" y="45" text-anchor="middle">Amp 입력</text><text x="210" y="68" text-anchor="middle">Line In</text><text x="349" y="45" text-anchor="middle">Amp 출력</text><text x="349" y="68" text-anchor="middle">Speaker Out</text><path d="M131 54 H149 M270 54 H288" stroke="#00704a" stroke-width="3"/></svg>';
  if(['usb','hdmi','sub'].includes(kind))return common+'<rect x="42" y="24" width="86" height="58" rx="8" fill="#b8bfc1"/><text x="85" y="59" text-anchor="middle">'+({usb:'USB',hdmi:'HDMI ARC',sub:'SUB OUT'}[kind])+'</text><path d="M160 55 H230" stroke="#8c2020" stroke-width="3" stroke-dasharray="7 5"/><path d="M190 42 L211 68 M211 42 L190 68" stroke="#8c2020" stroke-width="3"/><text x="255" y="60">この経路では使いません</text></svg>'.replace('この経路では使いません','이 경로에 쓰지 않음');
  return common+'<path d="M20 56 H110 Q140 56 160 35 H245 M110 56 Q140 56 160 78 H245" stroke="#333" stroke-width="6" fill="none"/><path d="M180 35 H245" stroke="#fff" stroke-width="9"/><path d="M180 78 H245" stroke="#b31c24" stroke-width="9"/><rect x="260" y="12" width="140" height="88" rx="12" fill="#b5bdc0"/><circle cx="290" cy="35" r="12" fill="#fff" stroke="#4a423c"/><circle cx="290" cy="78" r="12" fill="#b31c24"/><circle cx="290" cy="35" r="4" fill="#333"/><circle cx="290" cy="78" r="4" fill="#333"/><text x="315" y="38">L · 흰색</text><text x="315" y="81">R · 빨강</text><text x="34" y="99">3.5mm → RCA 2개</text></svg>';
}
function settingsHTML(){return '<div class="settings"><label>WiiM Home · 기기 설정 → 소리 → 오디오 입력<select data-setting="input"><option value="unknown">아직 선택 전</option><option value="line">Line In</option><option value="optical">Optical In</option><option value="arc">HDMI ARC</option></select></label><label>WiiM Home · 오디오 출력<select data-setting="output"><option value="unknown">아직 선택 전</option><option value="speaker">Speaker Out</option><option value="bluetooth">Bluetooth</option><option value="usb">USB Out</option></select></label><label>PC · 실제 연결한 소리 출력 장치<select data-setting="pcOutput"><option value="unknown">운영체제·출력 장치 확인 전</option><option value="analog">3.5mm에 연결된 스피커 / 헤드폰</option><option value="hdmi">모니터 / HDMI 디지털 출력</option></select></label><p class="small">Windows 예: 설정 → 시스템 → 소리 → 출력. 장치 이름은 PC마다 다릅니다. ‘WiiM Amp’가 자동으로 생기는 설정이 아닙니다.</p></div>';}
function render(){
  const s=state.step;$('#step-number').textContent=`0${s+1} / 05`;$('#step-title').textContent=steps[s][0];$('#step-description').textContent=steps[s][1];
  $('#scene-caption').textContent=['PC의 소리 출력부터 찾습니다','RCA 두 갈래를 LINE IN으로','L·R 스피커 각각 + / −','입력과 출력 설정을 맞춥니다','모형의 전체 경로를 확인합니다'][s];
  document.querySelectorAll('[data-step]').forEach(b=>b.setAttribute('aria-current',Number(b.dataset.step)===s?'step':'false'));
  $('#detail-drawing').innerHTML=drawing(s===0?'pc':s===2?'speaker':s===3?'settings':'line');
  const controls=$('#controls');
  if(s===0)controls.innerHTML='<div class="options"><button class="choice" data-pc="analog" aria-pressed="'+(state.pc==='analog')+'">3.5mm 소리 출력이 있는 경우<small>헤드폰 / Line Out · 정상 출력 조건으로 따라보기</small></button><button class="choice" data-pc="unknown" aria-pressed="'+(state.pc==='unknown')+'">아직 모르겠어요<small>PC의 단자와 이어폰 재생부터 확인</small></button><button class="choice" data-pc="none" aria-pressed="'+(state.pc==='none')+'">이 출력을 찾을 수 없어요<small>USB·HDMI를 대신 꽂지 않고 확인할 항목 보기</small></button></div>';
  else if(s===1)controls.innerHTML='<button class="choice" id="connect-cable" aria-pressed="'+state.cable+'">'+(state.cable?'✓ RCA 흰 L · 빨강 R 연결됨':'3.5mm → RCA 선을 LINE IN에 연결')+'</button><p class="small">한 개의 스테레오 케이블이 두 갈래로 나뉩니다. 흰색/빨강은 좌/우 채널입니다. 케이블 규격이나 방향이 다른 제품과 구별하세요.</p>';
  else if(s===2)controls.innerHTML='<label class="check"><input type="checkbox" id="power-off" '+(state.off?'checked':'')+'>배선 전 앰프 전원을 끄는 순서를 확인했습니다.</label><button class="choice" id="connect-speaker" aria-pressed="'+state.speaker+'" '+(!state.off?'disabled':'')+'>'+(state.speaker?'✓ L·R 각각 +/− 한 쌍 연결됨':'왼쪽 L · 오른쪽 R의 +/− 연결')+'</button><p class="small">스피커의 +는 앰프 +에, −는 −에 연결합니다. 실제 스피커 후면·허용 부하·선의 단락은 현장에서 확인해야 합니다.</p>';
  else if(s===3){controls.innerHTML=settingsHTML();controls.querySelectorAll('select').forEach(e=>e.value=state[e.dataset.setting]);}
  else controls.innerHTML='<ul class="summary-list">'+[
    [state.pc==='analog','PC 3.5mm 아날로그 출력 조건'],[state.cable,'RCA 흰 L · 빨강 R → LINE IN'],[state.off&&state.speaker,'전원 OFF 순서 · 두 스피커 +/−'],[state.input==='line'&&state.output==='speaker','Amp 입력 Line In · 출력 Speaker Out'],[state.pcOutput==='analog','PC의 실제 아날로그 출력 장치']
  ].map(([ok,t])=>'<li><b>'+(ok?'✓':'○')+'</b><span>'+t+(ok?'':' — 선택 전 / 다른 선택')+'</span></li>').join('')+'</ul><p class="small">'+(ready()?'설명 모형의 경로가 이어졌습니다. 실제 배선 후 낮은 음량부터 좌우를 듣고, 재부팅 뒤 같은 설정으로 다시 확인하세요.':'모형의 모든 조건이 맞아야 신호 흐름을 볼 수 있습니다. 위 순서에서 선택 전인 부분을 확인하세요.')+'</p><button class="choice" id="show-flow" '+(!ready()?'disabled':'')+'>가상 신호의 경로 한 번 보기</button>';
  $('#previous').disabled=s===0;$('#next').hidden=s===4;$('#next').innerHTML=['다음: 입력 연결','다음: 두 스피커','다음: 앱·PC 설정','다음: 흐름 확인'][s]+' <span>→</span>';
  $('#next').disabled=s===0?state.pc!=='analog':s===1?!state.cable:s===2?!(state.off&&state.speaker):false;
  feedback(s===0&&state.pc==='unknown'?'아직 PC 출력을 확인하지 않았습니다. 모형의 다른 단계는 위 순서 버튼으로 살펴볼 수 있습니다.':s===0&&state.pc==='none'?'실제 PC의 단자·모델 확인이 먼저입니다. 아래 ‘PC 출력을 찾을 수 없어요’에서 대안을 확인하세요.':s===4?(ready()?'설명 모형만 연결됐습니다. 실제 기기의 재생 확인은 별도입니다.':'미확인 조건이 있어 가상 신호를 표시하지 않습니다.'):'',s===0&&state.pc==='none');
  sync();
}
function sync(){
  const active=ready();$('#route-pc').textContent=state.pc==='analog'?'PC · 3.5mm':state.pc==='none'?'PC 출력 없음 / 확인 필요':'PC 출력 확인 전';$('#wire-in').classList.toggle('connected',state.cable&&state.pc==='analog');$('#wire-out').classList.toggle('connected',state.speaker&&state.off);$('#route-speaker').textContent=state.speaker?'L +/− · R +/−':'좌·우 스피커';
  $('#signal-status').textContent=active?'모형 연결·설정이 이어졌습니다. 움직이는 표시는 가상 신호이며 실제 재생을 확인한 것이 아닙니다.':state.pc!=='analog'?'PC 출력이 확인되지 않았습니다. 현장 연결 성공으로 표시하지 않습니다.':'선과 설정을 순서대로 선택하세요. 현재 화면은 기기를 제어하지 않습니다.';
  document.querySelectorAll('[data-port]').forEach(e=>e.classList.toggle('active',e.dataset.port===state.port));
  model?.setState({...state,ready:active});
}
function go(step){state.step=step;state.port=['pc','line','speaker','line','speaker'][step];render();model?.focus(state.port,false);$('#step-title').focus({preventScroll:true});const box=$('#step-title').getBoundingClientRect();if(matchMedia('(max-width:720px)').matches||box.top<24||box.bottom>innerHeight-90)document.querySelector('.inspector').scrollIntoView({block:'start',behavior:'instant'});}
function selectPort(port){
  state.port=port;if(port==='pc')state.step=0;if(port==='line')state.step=1;if(port==='speaker')state.step=2;
  render();$('#detail-drawing').innerHTML=drawing(port);feedback(portInfo[port][1],['usb','hdmi','sub'].includes(port));$('#scene-caption').textContent=portInfo[port][0];model?.focus(port,true);sync();if(matchMedia('(max-width:720px)').matches){$('#step-title').focus({preventScroll:true});document.querySelector('.inspector').scrollIntoView({block:'start',behavior:'instant'});}
}
document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.step!==undefined)return go(Number(b.dataset.step));
  if(b.dataset.port)return selectPort(b.dataset.port);
  if(b.dataset.pc){state.pc=b.dataset.pc;render();document.querySelector('[data-pc="'+state.pc+'"]').focus({preventScroll:true});return;}
  if(b.id==='next')return go(Math.min(4,state.step+1));if(b.id==='previous')return go(Math.max(0,state.step-1));
  if(b.id==='connect-cable'){state.cable=!state.cable;render();$('#connect-cable').focus({preventScroll:true});return;}
  if(b.id==='connect-speaker'){if(!state.off)return;state.speaker=!state.speaker;render();$('#connect-speaker').focus({preventScroll:true});return;}
  if(b.id==='overview'||b.id==='rear'){state.view=b.id;$('#overview').setAttribute('aria-pressed',b.id==='overview');$('#rear').setAttribute('aria-pressed',b.id==='rear');model?.view(b.id);return;}
  if(b.id==='show-flow'&&ready()){state.view='overview';$('#overview').setAttribute('aria-pressed','true');$('#rear').setAttribute('aria-pressed','false');model?.view('overview',false);document.querySelector('.view-head').scrollIntoView({block:'start',behavior:'instant'});model?.pulse('all');feedback('PC → LINE IN → Speaker Out → 좌우 스피커. 가상 신호 한 번 보기입니다. 실제 소리는 재생하지 않습니다.');return;}
  if(b.id==='reset'){Object.assign(state,{step:0,pc:'unknown',cable:false,off:false,speaker:false,input:'unknown',output:'unknown',pcOutput:'unknown',view:'overview',port:'pc'});go(0);$('#overview').setAttribute('aria-pressed','true');$('#rear').setAttribute('aria-pressed','false');model?.view('overview');}
  if(b.dataset.helpStep)go(Number(b.dataset.helpStep));
});
document.addEventListener('change',e=>{
  if(e.target.id==='power-off'){state.off=e.target.checked;if(!state.off)state.speaker=false;render();$('#power-off').focus({preventScroll:true});}
  if(e.target.dataset.setting){state[e.target.dataset.setting]=e.target.value;sync();const wrong=state.input==='optical'||state.input==='arc'||state.output==='bluetooth'||state.output==='usb'||state.pcOutput==='hdmi';feedback(wrong?'이 설명은 RCA 아날로그 연결입니다. Amp 입력 Line In·출력 Speaker Out과 PC의 3.5mm 출력 장치를 고르세요.':ready()?'설명 모형의 연결과 설정이 맞습니다. 다음에서 전체 경로를 확인하세요.':'아직 선택하지 않은 설정이 있습니다.',wrong);}
});
const diagnosis={
  silent:'<ol><li>PC에 이어폰을 꽂아 자체 재생·음소거·실제 출력 장치를 확인합니다. <button data-help-step="0">PC 출력 보기</button></li><li>3.5mm와 RCA가 앰프 LINE IN에 단단히 꽂혔는지 확인합니다. <button data-help-step="1">선 경로 보기</button></li><li>Amp 입력 Line In·음소거 해제, 낮은 볼륨부터 확인합니다.</li><li>Amp 출력이 Speaker Out인지 확인합니다. <button data-help-step="3">설정 보기</button></li><li>앰프 전원을 끄고 양쪽 스피커 +/− 배선과 단락을 확인합니다. <button data-help-step="2">스피커 배선 보기</button></li></ol>',
  one:'<ol><li>PC 자체 이어폰 재생에서도 한쪽만 들리는지와 좌우 밸런스를 확인합니다.</li><li>RCA 흰 L·빨강 R이 모두 LINE IN에 제대로 꽂혔는지 확인합니다.</li><li>앰프 전원을 끈 뒤 소리가 안 나는 쪽의 +/− 한 쌍, 느슨한 접점과 단락을 확인합니다. <button data-help-step="2">두 스피커 보기</button></li></ol>',
  bass:'<ol><li>PC 음원·밸런스와 스피커 배치를 확인합니다.</li><li>앰프 전원을 끄고 두 스피커 모두 +→+·−→−인지 확인합니다. 한쪽 극성이 반대면 위상·저음 문제가 생길 수 있습니다. 반드시 무음이 되는 것은 아닙니다. <button data-help-step="2">극성 확대 보기</button></li><li>실제 소리와 설치 환경을 확인한 뒤 다른 원인을 검토합니다. 이 모형은 원인을 진단하지 않습니다.</li></ol>',
  noport:'<ol><li>PC의 정확한 모델과 실제 출력 표시를 확인합니다. 마이크 입력은 소리 출력이 아닙니다.</li><li>광출력 S/PDIF OUT이 실제로 있다면 TOSLINK → Optical In, 2채널 PCM 경로를 검토합니다.</li><li>두 출력이 없다면 호환 USB 오디오 출력 장치 등 별도 경로 검토가 필요합니다. 특정 어댑터를 구입하라고 정하지 않습니다. Amp에 USB를 직접 꽂거나 일반 HDMI→ARC로 대체하지 마세요.</li></ol>'
};
$('#symptom').addEventListener('change',e=>$('#diagnosis').innerHTML=diagnosis[e.target.value]);$('#diagnosis').innerHTML=diagnosis.silent;
// Match keyboard/read order to the mobile visual order; restore the desktop grouping.
const mobileLayout=matchMedia('(max-width:720px)');
const supplemental=[document.querySelector('.port-strip'),document.querySelector('.route'),$('#signal-status')];
function arrangeReadingOrder(){const parent=document.querySelector(mobileLayout.matches?'.workbench':'.visual');supplemental.forEach(node=>parent.appendChild(node));}
mobileLayout.addEventListener('change',arrangeReadingOrder);arrangeReadingOrder();
render();
import('./scene.js').then(m=>{model=m.createScene({onPort:selectPort});sync();}).catch(error=>{document.body.dataset.renderer='fallback';$('#scene').hidden=true;$('#hotspots').hidden=true;$('#fallback').hidden=false;console.info('3D unavailable; accessible diagram active:',error.message);});
window.connectionModel={getState:()=>({...state,ready:ready()}),getDiagnostics:()=>model?.getDiagnostics()||{renderer:'fallback'},selectPort};
