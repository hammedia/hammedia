/* Original HAM MEDIA time-aware ocean. No external graphics dependencies. */
(() => {
  'use strict';
  const root = document.getElementById('travel-ocean');
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const glCanvas = $('.ocean-world__webgl');
  const rippleCanvas = $('.ocean-world__ripples');
  const poster = $('.ocean-world__poster img');
  const posterSource = $('.ocean-world__poster source');
  const toggle = $('.ocean-world__motion');
  const motionLabel = $('.ocean-world__motion-label');
  const motionIcon = $('.ocean-world__motion-icon');
  const phaseButtons = [...root.querySelectorAll('[data-ocean-phase]')];
  const destination = $('#ocean-destination');
  const status = $('#ocean-status');
  const forecastLabel = $('#ocean-forecast');
  const weatherSource = $('#ocean-weather-source');
  const memory = $('#ocean-memory');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px), (pointer: coarse)');
  const places = {
    busan: { name:'부산', zone:'Asia/Seoul', lat:35.18, lon:129.08, photo:'travel/gallery-img-5134.jpg', title:'또 가자, 부산.', href:'#stop-again' },
    donghae: { name:'동해', weatherName:'동해시', zone:'Asia/Seoul', lat:37.52, lon:129.11, photo:'travel/gallery-img-0182.jpg', title:'동해 바다에 남은 기억', href:'#travel-photo-room', gallery:true },
    chuncheon: { name:'춘천', zone:'Asia/Seoul', lat:37.88, lon:127.73, photo:'travel/essay-place-car-stay.jpg', title:'강이 보이는 하얀 집', href:'#travel-place-note' },
    seattle: { name:'시애틀', zone:'America/Los_Angeles', lat:47.61, lon:-122.33, photo:'cameras/camera-original-20260604-028-40mm4l.jpg', title:'시애틀에서 보고 배운 것', href:'#travel-photo-room', gallery:true },
    washington: { name:'워싱턴 D.C.', zone:'America/New_York', lat:38.90, lon:-77.04, photo:'travel/gallery-img-3233.jpg', title:'여동생 가족과 함께한 여행', href:'#travel-photo-room', gallery:true }
  };
  const phaseNames = {day:'낮',sunset:'노을',night:'밤'};
  const phaseNumbers = {day:0,sunset:1,night:2};
  let placeKey = 'device';
  let phaseMode = 'auto';
  let scene = '';
  let weather = null;
  let weatherSequence = 0;
  let visible = false;
  let active = true;
  let wantsMotion = !reduced.matches && !mobile.matches;
  let initialized = false;
  let renderer = 'poster';
  let gl = null;
  let program = null;
  let buffer = null;
  let uniforms = {};
  let ctx = null;
  let frame = 0;
  let lastFrame = 0;
  let elapsed = 0;
  let clockTimer = 0;
  let needsSize = true;
  let width = 0;
  let height = 0;
  const vertexSource = 'attribute vec2 position; void main(){gl_Position=vec4(position,0.0,1.0);}';
  const fragmentSource = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#define OCEAN_HIGHP 1
#else
precision mediump float;
#endif

// HAM MEDIA — open water. Original analytic ocean / atmosphere, no textures.
// phase: 0 clear afternoon, 1 sunset, 2 moonlight; fractional values crossfade.
uniform vec2 resolution;
uniform float time;
uniform float phase;
uniform float cloudCover;
uniform float rain;

float hash21(vec2 p) {
#ifdef OCEAN_HIGHP
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
#else
  // Keep every intermediate below 1024; large polynomial hashes collapse to
  // integral values with genuine half precision, erasing clouds and stars.
  p = mod(p, 71.0);
  return fract(sin(dot(p, vec2(2.173, 7.823))) * 37.719);
#endif
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
             mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float n = 0.0, a = 0.5;
  mat2 r = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 5; i++) {
    n += noise(p) * a;
    p = r * p * 2.03 + vec2(7.7, 3.4);
    a *= 0.5;
  }
  return n;
}
vec3 palette(vec3 a, vec3 b, vec3 c) {
  return mix(mix(a, b, clamp(phase, 0.0, 1.0)), c, clamp(phase - 1.0, 0.0, 1.0));
}
vec3 lightDirection() {
  float elevation = mix(0.24, 0.045, clamp(phase, 0.0, 1.0));
  elevation = mix(elevation, 0.27, clamp(phase - 1.0, 0.0, 1.0));
  return normalize(vec3(0.28 * resolution.x / resolution.y * 1.5, elevation, -1.0));
}
vec3 clearSky(vec3 rd, bool showDisc) {
  float h = max(rd.y, 0.0);
  float zenith = pow(clamp(h * 1.95, 0.0, 1.0), 0.48);
  vec3 horizon = palette(vec3(0.66, 0.85, 0.94), vec3(0.99, 0.53, 0.25), vec3(0.060, 0.108, 0.17));
  vec3 top = palette(vec3(0.070, 0.38, 0.65), vec3(0.19, 0.24, 0.41), vec3(0.010, 0.022, 0.054));
  vec3 col = mix(horizon, top, zenith);
  vec3 sun = lightDirection();
  float d = length(rd - sun);
  float night = clamp(phase - 1.0, 0.0, 1.0);
  vec3 halo = palette(vec3(0.32, 0.34, 0.29), vec3(0.82, 0.33, 0.09), vec3(0.13, 0.18, 0.25));
  col += halo * exp(-d * mix(8.0, 13.0, night)) * (1.0 - rain * 0.8);
  float radius = mix(0.019, 0.014, night);
  float discDistance = length(rd.xy / max(-rd.z, 0.1) - sun.xy / (-sun.z));
  float disc = 1.0 - smoothstep(radius * 1.18, radius * 1.18 + 0.0018, discDistance);
  vec3 sunColor = palette(vec3(1.0, 0.96, 0.80), vec3(1.0, 0.89, 0.58), vec3(0.84, 0.91, 0.97));
  col = mix(col, sunColor, disc * (showDisc ? 1.0 - rain * 0.85 : 0.0));
  return col;
}
vec3 sky(vec3 rd, bool detailed) {
  vec3 col = clearSky(rd, detailed);
  float h = max(rd.y, 0.0);
  float night = clamp(phase - 1.0, 0.0, 1.0);
  if (detailed && night > 0.01) {
    vec2 starUV = vec2(atan(rd.x, -rd.z), rd.y) * vec2(108.0, 92.0);
    vec2 cell = floor(starUV), point = fract(starUV) - 0.5;
    float seed = hash21(cell + 21.0);
    float star = (1.0 - smoothstep(0.02, 0.13, length(point))) * step(0.974, seed);
    col += vec3(0.67, 0.80, 0.96) * star * night * smoothstep(0.02, 0.18, h) * (0.35 + seed * 0.6);
  }
  vec2 cp = vec2(rd.x, rd.z) / (h + 0.18) * 1.12;
  cp.x += mod(time, 7200.0) * 0.0025;
  cp += vec2(12.8, 3.0);
  float broad = fbm(cp * 0.86);
  float fine = noise(cp * 11.0 + broad * 1.8);
  float field = broad * 0.82 + fine * 0.12 + noise(cp * 26.0 + broad) * 0.06;
  float threshold = mix(0.68, 0.35, clamp(cloudCover, 0.0, 1.0));
  float density = smoothstep(threshold, threshold + 0.13, field);
  density *= smoothstep(0.008, 0.055, h);
  float illuminated = clamp((broad - fbm(cp * 0.86 + vec2(-0.11, 0.08))) * 5.0 + 0.60, 0.0, 1.0);
  illuminated *= 0.82 + fine * 0.22;
  vec3 shadow = palette(vec3(0.52, 0.67, 0.78), vec3(0.35, 0.30, 0.38), vec3(0.028, 0.052, 0.093));
  vec3 bright = palette(vec3(1.0, 0.99, 0.95), vec3(1.0, 0.70, 0.46), vec3(0.13, 0.19, 0.27));
  float light = max(dot(rd, lightDirection()), 0.0);
  vec3 cloud = mix(shadow, bright, clamp(illuminated * 0.66 + 0.24 + pow(light, 16.0) * 0.14, 0.0, 1.0));
  col = mix(col, cloud, density * (detailed ? 0.90 + rain * 0.08 : 0.38));
  col = mix(col, palette(vec3(0.37, 0.47, 0.53), vec3(0.30, 0.28, 0.33), vec3(0.03, 0.05, 0.075)), rain * 0.53);
  return col;
}

// All wave frequencies are spatially filtered towards the horizon. The rotated
// spectrum and small phase feedback break the repetitive crossed-sine pattern.
vec3 waveField(vec2 p, float distanceToEye) {
  float t = mod(time, 7200.0) * 0.46;
  vec2 q = p;
  q += vec2(sin(p.y * 0.22 + t * 0.19), sin(p.x * 0.19 - t * 0.16)) * 0.48;
  vec2 direction = normalize(vec2(0.84, 0.54));
  float frequency = 1.1, amplitude = 0.125, speed = 0.78;
  vec3 sum = vec3(0.0);
  mat2 turn = mat2(0.54, -0.84, 0.84, 0.54);
  for (int i = 0; i < 9; i++) {
    float footprint = (distanceToEye / max(resolution.y, 353.0)) * distanceToEye * frequency / 1.7;
    float attenuation = (1.0 - smoothstep(0.8, 5.5, footprint)) * (1.0 - smoothstep(90.0, 230.0, distanceToEye));
    float theta = dot(q, direction) * frequency + t * speed;
    float s = sin(theta), c = cos(theta);
    float crest = exp(s - 1.0);
    float a = amplitude * attenuation;
    sum.x += (crest - 0.465) * a;
    sum.yz += direction * (c * crest * frequency * a);
    q -= direction * c * amplitude * 0.95;
    direction = turn * direction;
    frequency *= 1.79;
    amplitude *= 0.50;
    speed *= 1.13;
  }
  return sum;
}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  float aspect = resolution.x / resolution.y;
  vec3 rd = normalize(vec3((uv.x - 0.5) * aspect * 1.5, (uv.y - 0.57) * 1.5, -1.0));
  vec3 col;
  if (rd.y >= -0.001) {
    col = sky(rd, true);
  } else {
    float dist = min(240.0, 1.7 / max(-rd.y, 0.007));
    vec2 p = rd.xz * dist;
    vec3 w = waveField(p, dist);
    dist = clamp((1.7 - w.x) / max(-rd.y, 0.007), 0.0, 240.0);
    p = rd.xz * dist;
    w = waveField(p, dist);
    vec3 n = normalize(vec3(-w.y, 1.0, -w.z));
    vec3 reflected = reflect(rd, n);
    reflected.y = max(0.008, reflected.y);
    float facing = clamp(dot(n, -rd), 0.0, 1.0);
    float fresnel = 0.035 + 0.965 * pow(1.0 - facing, 4.0);
    vec3 deep = palette(vec3(0.008, 0.105, 0.17), vec3(0.020, 0.072, 0.102), vec3(0.008, 0.026, 0.046));
    vec3 lit = palette(vec3(0.015, 0.30, 0.39), vec3(0.095, 0.17, 0.19), vec3(0.023, 0.077, 0.12));
    float swell = clamp(w.x * 2.5 + n.y * 0.23 + dot(n, lightDirection()) * 0.26, 0.0, 1.0);
    vec3 body = mix(deep, lit, swell);
    col = mix(body, sky(normalize(reflected), false), clamp(fresnel * 0.92 + 0.09, 0.0, 1.0));
    float sunDistance = length(normalize(reflected) - lightDirection());
    float wide = exp(-sunDistance * sunDistance * 18.0);
    float shine = exp(-sunDistance * sunDistance * 950.0);
    vec3 beam = palette(vec3(1.0, 0.98, 0.88), vec3(1.0, 0.54, 0.20), vec3(0.42, 0.64, 0.83));
    col += beam * (shine * 0.93 + wide * 0.032) * (1.0 - rain * 0.85);
    float foam = smoothstep(0.31, 0.39, length(w.yz)) * smoothstep(0.02, 0.09, w.x);
    col += palette(vec3(0.20, 0.33, 0.34), vec3(0.15, 0.13, 0.105), vec3(0.025, 0.06, 0.09)) * foam * 0.18;
    float haze = 1.0 - exp(-dist * 0.004);
    col = mix(col, clearSky(vec3(rd.x, 0.0, rd.z), false), haze * 0.54);
    col = mix(col, clearSky(normalize(vec3(rd.x, 0.0, rd.z)), false), smoothstep(-0.008, -0.001, rd.y));
  }
  // Thin distant headlands add scale without competing with the memory title.
  float coast = max(0.0, 0.012 * (1.0 - smoothstep(0.0, 0.24, uv.x)) * (0.5 + noise(vec2(uv.x * 37.0, 4.2))));
  coast += max(0.0, 0.007 * smoothstep(0.82, 1.0, uv.x) * noise(vec2(uv.x * 51.0, 8.1)));
  float land = (1.0 - smoothstep(0.57 + coast - 0.001, 0.57 + coast + 0.001, uv.y)) * smoothstep(0.568, 0.571, uv.y);
  col = mix(col, palette(vec3(0.23, 0.40, 0.48), vec3(0.22, 0.25, 0.29), vec3(0.025, 0.045, 0.07)), land * 0.65);
  float vignette = 1.0 - 0.10 * dot((uv - 0.5) * vec2(0.85, 0.65), (uv - 0.5) * vec2(0.85, 0.65));
  col *= vignette;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

  function announce(text) { if (status.textContent !== text) status.textContent = text; }
  function localTime() {
    const zone = places[placeKey]?.zone;
    const parts = new Intl.DateTimeFormat('en-GB',{hour:'2-digit',minute:'2-digit',hourCycle:'h23',...(zone ? {timeZone:zone}: {})}).formatToParts(new Date());
    const hour = Number(parts.find(p=>p.type==='hour')?.value || 0);
    const minute = parts.find(p=>p.type==='minute')?.value || '00';
    return {hour,clock:String(hour).padStart(2,'0')+':'+minute};
  }
  function chooseScene(hour) {
    if (phaseMode !== 'auto') return phaseMode;
    if ((hour>=5&&hour<7)||(hour>=17&&hour<19)) return 'sunset';
    return hour>=7&&hour<17 ? 'day':'night';
  }
  function updateTime() {
    const time = localTime();
    $('#ocean-clock').textContent = time.clock;
    $('#ocean-clock').dateTime = time.clock;
    $('#ocean-place').textContent = places[placeKey] ? places[placeKey].name+' 현지시간' : placeKey==='nearby' ? '내 주변 · 기기 시간' : '내 기기 시간';
    const next = chooseScene(time.hour);
    $('#ocean-time-note').textContent = phaseMode==='auto' ? (time.hour>=5&&time.hour<7 ? '이른 아침':phaseNames[next]) : '상상 속 '+phaseNames[next];
    if (next !== scene) {
      scene = next;
      root.dataset.scene = next;
      posterSource.srcset = '../assets/images/travel/ocean-'+next+'-mobile.webp';
      poster.src = '../assets/images/travel/ocean-'+next+'.webp';
    }
    phaseButtons.forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.oceanPhase===phaseMode)));
    draw();
    updateStatus();
  }
  function updateStatus() {
    const mode = phaseMode==='auto' ? '시간에 반응하는 바다 연출' : '상상 모드 · '+phaseNames[scene];
    const motion = wantsMotion ? (visible&&!document.hidden&&active ? '천천히 움직이는 중':'화면으로 돌아오면 이어집니다') : reduced.matches ? '움직임 줄이기 설정으로 정지' : '움직임을 멈춘 상태';
    announce(mode+' · '+motion);
  }
  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0; lastFrame = 0;
  }
  function updateClockTimer() {
    clearTimeout(clockTimer); clockTimer = 0;
    if (visible&&!document.hidden&&active) clockTimer = setTimeout(()=>{updateTime();updateClockTimer();},60000);
  }
  function sync() {
    const running = wantsMotion&&visible&&!document.hidden&&active;
    root.dataset.motion = running?'playing':wantsMotion?'suspended':'paused';
    toggle.setAttribute('aria-pressed',String(wantsMotion));
    motionLabel.textContent = wantsMotion?'멈추기':'움직이기';
    motionIcon.textContent = wantsMotion?'Ⅱ':'▷';
    if (running&&!frame) frame=requestAnimationFrame(tick);
    if (!running) stop();
    updateStatus(); updateClockTimer();
  }
  function shader(type, source) {
    const s=gl.createShader(type); gl.shaderSource(s,source); gl.compileShader(s);
    if (!gl.getShaderParameter(s,gl.COMPILE_STATUS)) { gl.deleteShader(s); throw new Error('Shader unavailable'); }
    return s;
  }
  function disposeGL() {
    if (gl&&program) gl.deleteProgram(program);
    if (gl&&buffer) gl.deleteBuffer(buffer);
    program=null; buffer=null;
  }
  function useLightweightRenderer(reason) {
    disposeGL();
    try { ctx=rippleCanvas.getContext('2d',{alpha:true}); } catch (_) { ctx=null; }
    renderer=ctx?'canvas2d':'poster';
    root.dataset.renderer=renderer;
    root.dataset.renderNote=reason;
    needsSize=true;
  }
  function init() {
    if (initialized) return;
    initialized=true;
    try {
      gl=glCanvas.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,powerPreference:'low-power'});
      if (!gl) throw new Error('WebGL unavailable');
      const v=shader(gl.VERTEX_SHADER,vertexSource); let f;
      try { f=shader(gl.FRAGMENT_SHADER,fragmentSource); } catch(error){gl.deleteShader(v);throw error;}
      program=gl.createProgram(); gl.attachShader(program,v);gl.attachShader(program,f);gl.linkProgram(program);gl.deleteShader(v);gl.deleteShader(f);
      if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error('Program unavailable');
      gl.useProgram(program);buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
      const position=gl.getAttribLocation(program,'position');gl.enableVertexAttribArray(position);gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      for(const name of ['resolution','time','phase','cloudCover','rain']) uniforms[name]=gl.getUniformLocation(program,name);
      renderer='webgl';root.dataset.renderer=renderer;
    } catch(error) { useLightweightRenderer(error.message); }
    needsSize=true;
  }
  function size() {
    if(!needsSize) return;
    const rect=root.getBoundingClientRect();width=Math.max(1,Math.round(rect.width));height=Math.max(1,Math.round(rect.height));
    if(renderer==='webgl') {
      const ratio=Math.min(devicePixelRatio||1,mobile.matches?1:1.15);
      const scale=Math.min(1,1600/(width*ratio));
      glCanvas.width=Math.round(width*ratio*scale);glCanvas.height=Math.round(height*ratio*scale);
      gl.viewport(0,0,glCanvas.width,glCanvas.height);gl.uniform2f(uniforms.resolution,glCanvas.width,glCanvas.height);
    } else if(ctx) { rippleCanvas.width=width;rippleCanvas.height=height; }
    needsSize=false;
  }
  function drawLightweight() {
    if(!ctx) return;
    ctx.clearRect(0,0,width,height);
    const color=scene==='sunset'?'244,174,109':scene==='night'?'167,204,235':'197,235,240';
    const horizon=height*.43;
    // Original, low-frequency glints over the matching shader still. No image warping.
    for(let row=0;row<30;row++) {
      const depth=(row+1)/31;
      const y=horizon+Math.pow(depth,1.5)*(height-horizon);
      const center=width*(.72+Math.sin(row*4.2+elapsed*.19)*.07*depth);
      const length=width*(.013+depth*.12)*(1+.45*Math.sin(row*8.1+elapsed*.37));
      ctx.beginPath();ctx.strokeStyle='rgba('+color+','+(0.018+depth*.035)+')';ctx.lineWidth=.4+depth*.9;
      for(let segment=0;segment<=10;segment++) {
        const x=center-length/2+length*segment/10;
        const wave=Math.sin(segment*.83+row*2.4+elapsed*.48)*(1+depth*2.5);
        if(segment===0)ctx.moveTo(x,y+wave);else ctx.lineTo(x,y+wave);
      }
      ctx.stroke();
    }
    if(weather?.rain>0.05) {
      ctx.strokeStyle='rgba(215,232,238,'+(.08+weather.rain*.1)+')';ctx.lineWidth=.7;
      for(let i=0;i<Math.round(45*weather.rain);i++) {const x=(i*83.91+elapsed*31)%width;const y=(i*197.7+elapsed*260)%height;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+18);ctx.stroke();}
    }
  }
  function draw() {
    if(!initialized||!visible||document.hidden||!active) return;
    size();
    if(renderer==='webgl') {
      gl.uniform1f(uniforms.time,elapsed);gl.uniform1f(uniforms.phase,phaseNumbers[scene]??1);
      gl.uniform1f(uniforms.cloudCover,weather?.cloudCover??.42);gl.uniform1f(uniforms.rain,weather?.rain??0);
      gl.drawArrays(gl.TRIANGLES,0,6);
    } else drawLightweight();
  }
  function tick(now) {
    frame=0;
    if(!wantsMotion||!visible||document.hidden||!active) return;
    const interval=renderer==='webgl'?34:83;
    if(!lastFrame||now-lastFrame>=interval) {if(lastFrame)elapsed=(elapsed+Math.min((now-lastFrame)/1000,.15))%7200;lastFrame=now;draw();}
    frame=requestAnimationFrame(tick);
  }
  function resetWeather() {
    weatherSequence++;weather=null;weatherSource.hidden=true;root.style.setProperty('--cloud-opacity','.20');root.style.setProperty('--weather-haze','0');
  }
  async function loadForecast(coords,name) {
    const seq=++weatherSequence;
    root.dataset.forecast='loading';forecastLabel.textContent=name+' 예보를 불러오는 중';
    try {
      if(!window.HamOceanWeather) throw new Error('예보 연결을 사용할 수 없습니다');
      const result=await window.HamOceanWeather.getForecast(coords);
      if(seq!==weatherSequence) return;
      weather=result;
      forecastLabel.textContent=Math.round(result.temperature)+'° · '+result.description;
      weatherSource.hidden=false;
      const updated=new Intl.DateTimeFormat('ko-KR',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit',...(places[placeKey]?.zone?{timeZone:places[placeKey].zone}:{})}).format(new Date(result.updatedAt));
      $('#ocean-weather-updated').textContent=(places[placeKey]?.weatherName||name)+' · '+updated+' 갱신';
      root.style.setProperty('--cloud-opacity',String(.10+result.cloudCover*.35));
      root.style.setProperty('--weather-haze',String(result.cloudCover*.24));
      root.dataset.forecast='ready';draw();
    } catch(_) {
      if(seq!==weatherSequence) return;
      weather=null;root.dataset.forecast='unavailable';weatherSource.hidden=true;
      forecastLabel.textContent='예보를 불러오지 못했습니다';
      announce('날씨 연결을 사용할 수 없어 시간과 선택한 분위기로 보여드립니다');
    }
  }
  function changePlace(key) {
    placeKey=key;resetWeather();
    const place=places[key];
    memory.hidden=!place;
    if(place) {
      memory.href=place.href;memory.querySelector('img').src='../assets/images/'+place.photo;
      memory.querySelector('img').alt=place.name+'에서 남긴 실제 여행사진';
      $('#ocean-memory-title').textContent=place.title;
      loadForecast({lat:place.lat,lon:place.lon},place.weatherName||place.name);
    } else forecastLabel.textContent='날씨를 보려면 도시를 골라보세요';
    updateTime();
  }
  destination.addEventListener('change',()=>changePlace(destination.value));
  phaseButtons.forEach(button=>button.addEventListener('click',()=>{phaseMode=button.dataset.oceanPhase;updateTime();}));
  toggle.addEventListener('click',()=>{wantsMotion=!wantsMotion;sync();});
  memory.addEventListener('click',event=>{
    const place=places[placeKey];if(!place?.gallery)return;
    event.preventDefault();
    document.querySelector('.star-room-nav [data-house-target="travel-photo-room"]')?.click();
    const photo=[...document.querySelectorAll('#travel-photo-room img')].find(img=>(img.getAttribute('src')||'').endsWith(place.photo));
    photo?.closest('figure')?.click();
  });
  const dialog=$('#ocean-location-dialog');
  $('#ocean-nearby').addEventListener('click',()=>{
    if(!navigator.geolocation) {announce('이 브라우저에서는 위치를 사용할 수 없습니다. 도시를 직접 골라주세요');destination.focus();return;}
    dialog.returnValue='';dialog.showModal();
  });
  dialog.addEventListener('close',()=>{
    if(dialog.returnValue!=='confirm') {destination.focus();return;}
    const seq=++weatherSequence;
    forecastLabel.textContent='브라우저의 위치 동의를 기다리는 중';
    navigator.geolocation.getCurrentPosition(position=>{
      if(seq!==weatherSequence)return;
      // Only rounded, approximate coordinates leave this one callback. Never persist precise location.
      const coords={lat:Math.round(position.coords.latitude*100)/100,lon:Math.round(position.coords.longitude*100)/100};
      placeKey='nearby';destination.value='nearby';memory.hidden=true;resetWeather();updateTime();loadForecast(coords,'내 주변');
    },()=>{
      if(seq!==weatherSequence)return;
      forecastLabel.textContent='위치 대신 도시를 직접 골라주세요';announce('위치를 받지 않았습니다. 도시 선택은 그대로 사용할 수 있습니다');
    },{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  });
  const onVisibility=()=>{if(visible&&!document.hidden&&active){init();updateTime();draw();}sync();};
  if('IntersectionObserver'in window) {
    new IntersectionObserver(entries=>{visible=entries[0].isIntersecting&&entries[0].intersectionRatio>0;onVisibility();},{threshold:[0,.01]}).observe(root);
  } else {
    const checkVisibility=()=>{const rect=root.getBoundingClientRect();const next=rect.top<innerHeight&&rect.bottom>0;if(next!==visible){visible=next;onVisibility();}};
    addEventListener('scroll',checkVisibility,{passive:true});addEventListener('resize',checkVisibility,{passive:true});checkVisibility();
  }
  document.addEventListener('visibilitychange',onVisibility);
  const resized=()=>{needsSize=true;draw();};
  if('ResizeObserver'in window)new ResizeObserver(resized).observe(root);else addEventListener('resize',resized,{passive:true});
  reduced.addEventListener('change',()=>{if(reduced.matches)wantsMotion=false;sync();});
  mobile.addEventListener('change',()=>{if(mobile.matches)wantsMotion=false;needsSize=true;draw();sync();});
  glCanvas.addEventListener('webglcontextlost',event=>{event.preventDefault();useLightweightRenderer('WebGL context lost');draw();sync();});
  addEventListener('pagehide',()=>{active=false;sync();});
  addEventListener('pageshow',()=>{active=true;onVisibility();});
  updateTime();sync();
})();
