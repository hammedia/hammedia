import * as THREE from './shared/three.module.js';

/* Existing r186.1 runtime, finite updates only. Explanatory geometry, not CAD. */
export function createScene({onPort}) {
  const canvas=document.querySelector('#scene'), host=document.querySelector('#viewport');
  const renderer=new THREE.WebGLRenderer({canvas,antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.outputColorSpace=THREE.SRGBColorSpace;
  renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.2;
  renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const scene=new THREE.Scene();scene.background=new THREE.Color('#f5f3ee');
  const camera=new THREE.PerspectiveCamera(34,1,.1,100);
  scene.add(new THREE.HemisphereLight(0xffffff,0x8c8171,2.4));
  const key=new THREE.DirectionalLight(0xffffff,3.2);key.position.set(-5,9,8);key.castShadow=true;key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-11,right:11,top:10,bottom:-10});key.shadow.bias=-.001;scene.add(key);
  const fill=new THREE.DirectionalLight(0xe0ebff,1.5);fill.position.set(8,5,-4);scene.add(fill);
  const material=(color,metalness=0,roughness=.5)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
  const silver=material('#adb4ba',.72,.27),black=material('#252a2b',.25,.4),rubber=material('#181c1c',0,.8),gold=material('#c6a457',.75,.25),red=material('#a92026',.15,.4),ivory=material('#edeae3');
  const pickable=[];const portAnchors={};let current={};let frame=0;let animation=null;
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  function box(w,h,d,mat,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  function cylinder(r,depth,mat,x,y,z,parent=scene){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,depth,40),mat);m.rotation.x=Math.PI/2;m.position.set(x,y,z);m.castShadow=true;parent.add(m);return m;}
  function text(message,w,x,y,z,size=90,parent=scene,color='#f5f3ee'){
    const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d');ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`600 ${size}px -apple-system, "Apple SD Gothic Neo", sans-serif`;ctx.fillText(message,512,128,980);
    const texture=new THREE.CanvasTexture(c);texture.colorSpace=THREE.SRGBColorSpace;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/4),new THREE.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false}));m.position.set(x,y,z);parent.add(m);return m;
  }
  const floor=box(25,.1,16,material('#e6e0d4',0,.95),0,-.12,0);floor.receiveShadow=true;
  // Amp rear panel faces the viewer. Layout is deliberately schematic and labelled.
  const amp=new THREE.Group();scene.add(amp);
  const shape=new THREE.Shape();const w=4.7,h=1.05,r=.17;
  shape.moveTo(-w/2+r,0);shape.lineTo(w/2-r,0);shape.quadraticCurveTo(w/2,0,w/2,r);shape.lineTo(w/2,h-r);shape.quadraticCurveTo(w/2,h,w/2-r,h);shape.lineTo(-w/2+r,h);shape.quadraticCurveTo(-w/2,h,-w/2,h-r);shape.lineTo(-w/2,r);shape.quadraticCurveTo(-w/2,0,-w/2+r,0);
  const body=new THREE.Mesh(new THREE.ExtrudeGeometry(shape,{depth:2.75,bevelEnabled:true,bevelThickness:.04,bevelSize:.04,bevelSegments:3,steps:1}),silver);body.position.set(0,.12,-2.15);body.castShadow=true;body.receiveShadow=true;amp.add(body);
  box(4.52,.83,.05,black,0,.65,.65,amp);text('WiiM Amp · 설명 모형',3.3,0,1.24,.2,64,amp,'#363a3b');
  const speakerGroup=new THREE.Group();amp.add(speakerGroup);
  const speakerXs=[-1.95,-1.58,-1.12,-.75];
  speakerXs.forEach((x,i)=>{cylinder(.125,.16,i%2?rubber:red,x,.63,.76,speakerGroup);cylinder(.055,.19,gold,x,.63,.83,speakerGroup);text(i%2?'−':'+',.17,x,.64,.94,140,speakerGroup);});
  text('L + / −      R + / −',1.65,-1.36,.97,.7,60,amp);text('SPEAKER OUT',1.75,-1.36,.29,.7,65,amp);
  [-.15,.25].forEach((x,i)=>{cylinder(.132,.14,i?red:ivory,x,.65,.76,amp);cylinder(.068,.16,gold,x,.65,.82,amp);cylinder(.036,.18,rubber,x,.65,.87,amp);});
  text('L     R',.78,.06,.99,.7,72,amp);text('LINE IN',.83,.06,.29,.7,72,amp);
  box(.27,.23,.12,material('#686d6b'),.87,.65,.75,amp);box(.13,.12,.13,rubber,.87,.66,.82,amp);text('OPTICAL',.7,.87,.29,.7,65,amp);
  cylinder(.105,.12,black,1.43,.65,.76,amp);cylinder(.045,.14,gold,1.43,.65,.83,amp);text('SUB',.43,1.43,.29,.7,70,amp);
  box(.25,.12,.12,rubber,1.87,.66,.77,amp);text('USB',.42,1.87,.29,.7,70,amp);
  box(.46,.14,.1,rubber,1.83,.98,.77,amp);text('ARC',.4,1.83,1.21,.7,70,amp);
  portAnchors.line=new THREE.Vector3(.06,.65,.94);portAnchors.speaker=new THREE.Vector3(-1.35,.65,.94);
  // Wood speakers: generic passive units, not an Eltax product reproduction.
  const grain=document.createElement('canvas');grain.width=128;grain.height=256;const g=grain.getContext('2d');g.fillStyle='#bca17b';g.fillRect(0,0,128,256);for(let i=0;i<55;i++){g.strokeStyle=`rgba(76,44,18,${.025+(i%5)*.009})`;g.lineWidth=1+(i%3);g.beginPath();g.moveTo(i*2.6,0);g.bezierCurveTo(i*2.6-4,90,i*2.6+5,180,i*2.6,256);g.stroke();}
  const wood=new THREE.CanvasTexture(grain);wood.colorSpace=THREE.SRGBColorSpace;const woodMat=new THREE.MeshStandardMaterial({map:wood,roughness:.85});
  const speakers=[];
  for(const [x,label] of [[-5.6,'왼쪽 L'],[5.6,'오른쪽 R']]){
    const group=new THREE.Group();group.position.set(x,0,-1.4);scene.add(group);box(1.5,2.75,1.5,woodMat,0,1.38,0,group);box(1.26,2.5,.055,black,0,1.38,.78,group);cylinder(.49,.09,rubber,0,1.05,.85,group);cylinder(.37,.1,material('#424746'),0,1.05,.91,group);cylinder(.17,.12,black,0,1.05,.98,group);cylinder(.2,.1,rubber,0,2.06,.86,group);cylinder(.13,.12,material('#646a68',.25),0,2.06,.92,group);text(label,1.8,0,3.1,.7,100,group,'#252a2b');speakers.push(group);
  }
  // Generic computer and clearly marked headphone output.
  const pc=new THREE.Group();pc.position.set(-4.2,0,3.4);pc.rotation.y=.12;scene.add(pc);
  box(2.35,.11,1.4,silver,0,.1,0,pc);box(2.35,1.5,.1,black,0,.88,-.6,pc);box(2.1,1.26,.02,material('#bdd6dc',.1,.3),0,.89,-.54,pc);text('PC',1.15,0,.9,-.51,140,pc,'#283c43');box(.8,.04,.38,black,0,.18,.2,pc);cylinder(.08,.05,black,1.03,.17,.74,pc);
  pc.updateWorldMatrix(true,false);portAnchors.pc=new THREE.Vector3(1.03,.17,.78).applyMatrix4(pc.matrixWorld);
  // Cables are separate input vs amplified output routes; never RCA into speaker posts.
  const inputCables=new THREE.Group(),outCables=new THREE.Group();scene.add(inputCables,outCables);
  const routes=[];
  function cable(points,color,group,radius=.035){const curve=new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p)));const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,56,radius,8,false),material(color,.05,.5));mesh.castShadow=true;group.add(mesh);routes.push({curve,group});return mesh;}
  const junction=[-1.65,.15,3.1];
  cable([[-3.15,.19,4.18],[-2.9,.16,4.6],[-2.15,.1,4.35],junction],'#343c3b',inputCables,.05);
  cable([junction,[-.8,.14,2.7],[-.15,.3,1.5],[-.15,.65,.94]],'#eae6db',inputCables,.05);
  cable([junction,[.0,.12,3.1],[.45,.28,1.7],[.25,.65,.94]],'#b31c24',inputCables,.045);
  [-.15,.25].forEach((x,i)=>{cylinder(.087,.32,i?red:ivory,x,.65,1.08,inputCables);});
  [[-5.6,-1.95,-1.58],[5.6,-1.12,-.75]].forEach(([speakerX,plus,minus])=>{
    cable([[plus,.63,.96],[plus,.2,1.7],[speakerX*.66,.12,1.8],[speakerX,.18,-.4]],'#a32429',outCables,.04);
    cable([[minus,.63,.96],[minus,.16,1.95],[speakerX*.66+.16,.1,2.0],[speakerX+.16,.18,-.4]],'#303536',outCables,.04);
  });
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.09,16,12),new THREE.MeshBasicMaterial({color:'#00704a'}));scene.add(dot);dot.visible=false;
  // Raycaster supplements the accessible HTML buttons; the text buttons remain the primary targets.
  function hitBox(port,x,y,z,w,h){const hit=box(w,h,.2,new THREE.MeshBasicMaterial({transparent:true,opacity:0,depthWrite:false}),x,y,z);hit.userData.port=port;pickable.push(hit);}
  hitBox('line',.06,.66,.98,.85,.7);hitBox('speaker',-1.36,.66,.98,1.95,.7);hitBox('usb',1.88,.66,.98,.35,.22);hitBox('hdmi',1.83,.98,.98,.5,.18);hitBox('sub',1.43,.65,.98,.3,.3);hitBox('pc',-3.2,.3,4.2,.6,.6);
  const target=new THREE.Vector3(0,.75,.4),raycaster=new THREE.Raycaster();
  function positions(){const rect=host.getBoundingClientRect();document.querySelectorAll('.hotspot').forEach((b,index)=>{const p=portAnchors[b.dataset.port].clone().project(camera);const hidden=p.z>1||Math.abs(p.x)>.95||Math.abs(p.y)>.95;b.hidden=hidden;const labelX=rect.width*[.18,.50,.82][index],labelY=30;const x=(p.x*.5+.5)*rect.width,y=(-p.y*.5+.5)*rect.height;b.style.left=labelX+'px';b.style.top=labelY+'px';const line=document.querySelector('[data-line="'+b.dataset.port+'"]'),dot=document.querySelector('[data-dot="'+b.dataset.port+'"]');line.setAttribute('x1',labelX);line.setAttribute('y1',labelY+18);line.setAttribute('x2',x);line.setAttribute('y2',y);dot.setAttribute('cx',x);dot.setAttribute('cy',y);line.style.display=dot.style.display=hidden?'none':'';});}
  function draw(){renderer.render(scene,camera);positions();}
  function resize(){const {width,height}=host.getBoundingClientRect();renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();draw();}
  const observer=new ResizeObserver(resize);observer.observe(host);
  function stop(){cancelAnimationFrame(frame);frame=0;animation=null;dot.visible=false;}
  function move(to,look,animate=true){stop();const from=camera.position.clone(),old=target.clone();const start=performance.now();
    if(reduced.matches||!animate){camera.position.copy(to);target.copy(look);camera.lookAt(target);draw();return;}
    animation='camera';function tick(now){const t=Math.min(1,(now-start)/650),u=t*t*(3-2*t);camera.position.lerpVectors(from,to,u);target.lerpVectors(old,look,u);camera.lookAt(target);draw();if(t<1&&!document.hidden)frame=requestAnimationFrame(tick);else{frame=0;animation=null;}}frame=requestAnimationFrame(tick);
  }
  const overview=(animate=true)=>{const narrow=host.clientWidth<500;move(new THREE.Vector3(6.5,narrow?11:7.0,narrow?20:14.3),new THREE.Vector3(0,.8,.7),animate);};
  function focus(port,close){if(!close){draw();return;}let look=new THREE.Vector3(.2,.72,.8),pos=new THREE.Vector3(.2,3.4,7.3);if(port==='pc'){look=new THREE.Vector3(-4.0,.55,3.55);pos=new THREE.Vector3(-1.4,4.7,9.8);}else if(port==='speaker'){look.set(-1.3,.65,.8);pos.set(-2.8,3.3,7.6);}move(pos,look);}
  function pulse(which){stop();const available=routes.filter(r=>r.group.visible&&(which==='all'||which==='input'&&r.group===inputCables||which==='speaker'&&r.group===outCables));if(!available.length)return;const route=available[0];if(reduced.matches){draw();return;}animation='signal';const start=performance.now();dot.visible=true;function tick(now){const u=(now-start)/1500;if(u>=1||document.hidden){dot.visible=false;frame=0;animation=null;draw();return;}const index=Math.min(available.length-1,Math.floor(u*available.length));dot.position.copy(available[index].curve.getPointAt((u*available.length)%1));draw();frame=requestAnimationFrame(tick);}frame=requestAnimationFrame(tick);}
  canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new THREE.Vector2((e.clientX-r.left)/r.width*2-1,-((e.clientY-r.top)/r.height)*2+1),camera);const hit=raycaster.intersectObjects(pickable)[0];if(hit)onPort(hit.object.userData.port);});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();draw();}});reduced.addEventListener('change',()=>{stop();draw();});
  inputCables.visible=false;outCables.visible=false;camera.position.set(9.3,9.5,18);camera.lookAt(target);resize();overview();
  document.body.dataset.renderer='webgl';
  return {setState(s){current=s;inputCables.visible=s.cable&&s.pc==='analog';outCables.visible=s.speaker&&s.off;if(!s.ready&&animation==='signal')stop();draw();},focus,pulse,view(mode,animate=true){mode==='rear'?move(new THREE.Vector3(.1,3.4,8.0),new THREE.Vector3(0,.62,.6),animate):overview(animate);},getDiagnostics(){return {revision:THREE.REVISION,animation,pendingFrame:!!frame,cables:{input:inputCables.visible,speaker:outCables.visible},ready:current.ready};}};
}
