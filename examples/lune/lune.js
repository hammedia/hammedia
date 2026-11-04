
(function(){
"use strict";
var LOOKS=[
 {name:"Beige Trench Set",img:"assets/looks/look0_front.webp",
  desc:"크롭 트렌치와 플리츠 미니",
  hot:[{x:58,y:30,p:0},{x:51,y:47,p:1},{x:50,y:91,p:2},{x:39,y:45,p:3}],
  items:[["p0_trench","크롭 베이지 트렌치",189000],["p0_skirt","네이비 플리츠 미니스커트",98000],["p0_loafers","블랙 플랫폼 로퍼",128000],["p0_bag","브라운 크로스바디백",79000]]},
 {name:"Cream Knit Casual",img:"assets/looks/look1_front.webp",
  desc:"크림 니트와 와이드 데님",
  hot:[{x:34,y:33,p:0},{x:50,y:62,p:1},{x:67,y:90,p:2}],
  items:[["p1_cardigan","크림 니트 카디건",129000],["p1_denim","라이트 워시 와이드 데님",98000],["p1_sneakers","화이트 스니커즈",89000],["p1_tote","크림 토트백",59000]]},
 {name:"Olive Shirt Dress",img:"assets/looks/look2_front.webp",
  desc:"올리브 셔츠 원피스",
  hot:[{x:50,y:35,p:0},{x:50,y:50,p:1},{x:50,y:91,p:2},{x:39,y:55,p:3}],
  items:[["p2_dress","올리브 셔츠 원피스",159000],["p2_belt","브라운 벨트",39000],["p2_loafers","브라운 로퍼",118000],["p2_bag","브라운 백",79000]]},
 {name:"Charcoal Winter",img:"assets/looks/look3_front.webp",
  desc:"차콜 터틀넥과 카멜 울 스커트",
  hot:[{x:50,y:28,p:0},{x:50,y:62,p:1},{x:50,y:92,p:2}],
  items:[["p3_turtleneck","차콜 터틀넥",89000],["p3_skirt","카멜 울 미디스커트",149000],["p3_boots","블랙 앵클부츠",198000]]},
 {name:"Ivory Silk Evening",img:"assets/looks/look4_front.webp",
  desc:"아이보리 실크 블라우스",
  hot:[{x:50,y:30,p:0},{x:50,y:66,p:1},{x:50,y:92,p:2},{x:40,y:18,p:99}],
  items:[["p4_blouse","아이보리 실크 블라우스",119000],["p4_trousers","블랙 와이드 트라우저",139000],["p4_slingback","누드 슬링백",159000]]}
];
var COLORS=[["#1b1713","블랙"],["#d9c7a8","베이지"],["#f1ebe0","아이보리"],["#6b5a3e","브라운"]];
var SIZES=["XS","S","M","L"];
var fmt=function(n){return "₩"+n.toLocaleString("ko-KR")};
var $=function(s,r){return (r||document).querySelector(s)};
var reduce=window.matchMedia("(prefers-reduced-motion: reduce)").matches;

var cur=0,N=LOOKS.length,cart=[],toastT,lastFocus=null;
var stage=$("#stage");
var cards=[];

/* build stage */
LOOKS.forEach(function(L,i){
  var c=document.createElement("div");
  c.className="card";c.setAttribute("role","group");c.setAttribute("aria-roledescription","slide");
  c.setAttribute("aria-label",(i+1)+" / "+N+" "+L.name);
  var f=document.createElement("div");f.className="frame";
  var img=new Image();img.width=864;img.height=1152;img.alt="AI 캐릭터 윤도해 착용 · "+L.name;img.decoding="async";
  img.loading=i===0?"eager":"lazy";if(i===0)img.fetchPriority="high";img.src=L.img;img.draggable=false;
  img.onerror=function(){c.classList.add("noimg")};
  var ph=document.createElement("div");ph.className="ph";ph.textContent="이미지 준비 중 · "+L.img;
  var sh=document.createElement("div");sh.className="shade";
  var ix=document.createElement("div");ix.className="idx";ix.textContent=String(i+1).padStart(2,"0");
  f.appendChild(img);f.appendChild(ph);f.appendChild(sh);f.appendChild(ix);c.appendChild(f);
  var hs=document.createElement("div");hs.className="hotspots";
  L.hot.forEach(function(h){
    if(!L.items[h.p])return;
    var it=L.items[h.p];
    var b=document.createElement("button");b.className="hot";
    b.style.left=h.x+"%";b.style.top=h.y+"%";
    b.innerHTML='<span class="dot"></span><span class="tip">'+it[1]+'</span>';
    b.tabIndex=-1;
    b.addEventListener("click",function(e){e.stopPropagation();if(i===cur)openQuick(i,h.p)});
    hs.appendChild(b);
  });
  c.appendChild(hs);
  c.addEventListener("click",function(){if(i!==cur)go(i)});
  stage.appendChild(c);cards.push(c);
});

/* dots */
var dots=$("#dots");
LOOKS.forEach(function(L,i){
  var b=document.createElement("button");
  b.setAttribute("aria-label","룩 "+(i+1)+" "+L.name);
  b.innerHTML="<span></span>";
  b.addEventListener("click",function(){go(i)});
  dots.appendChild(b);
});

function off(i){ // shortest circular offset
  var d=i-cur;
  if(d>N/2)d-=N;if(d<-N/2)d+=N;
  return d;
}
function layout(){
  var w=stage.clientWidth;
  var mob=w<900;
  var gap=mob?w*.52:w*.27;
  cards.forEach(function(c,i){
    var d=off(i),a=Math.abs(d);
    var x=d*gap;
    var z=-a*(mob?150:260);
    var ry=-d*(mob?14:20);
    var sc=1-a*.04;
    c.style.transform="translate3d("+x+"px,calc(-50% + "+(a*14)+"px),"+z+"px) rotateY("+ry+"deg) scale("+sc+")";
    c.style.opacity=a>2?0:(a===0?1:Math.max(.0,.62-(a-1)*.3));
    
    c.style.zIndex=String(50-a*5);
    c.style.pointerEvents=a>2?"none":"auto";
    c.classList.toggle("active",a===0);
    c.setAttribute("aria-hidden",a===0?"false":"true");
    Array.prototype.forEach.call(c.querySelectorAll(".hot"),function(h){h.tabIndex=a===0?0:-1});
  });
}
var px=0;
function update(){
  var L=LOOKS[cur];
  $("#lookNo").textContent=String(cur+1).padStart(2,"0");
  $("#lookName").textContent=L.name;
  Array.prototype.forEach.call(dots.children,function(b,i){b.setAttribute("aria-current",i===cur?"true":"false")});
  $("#railEyebrow").textContent="Look "+String(cur+1).padStart(2,"0")+" · Shop the look";
  $("#railTitle").textContent=L.name+" · 이 룩의 아이템";
  renderRail();
  layout();
}
function go(i){cur=((i%N)+N)%N;update()}
function step(d){go(cur+d)}

/* rail */
function thumb(id,alt){
  var wrap=document.createElement("div");wrap.className="pimg";
  var im=new Image();im.width=640;im.height=800;im.alt=alt;im.loading="eager";im.decoding="async";im.src="assets/products/"+id+".webp";
  im.onerror=function(){wrap.classList.add("noimg")};im.onload=function(){wrap.classList.remove("noimg")};
  var fb=document.createElement("div");fb.className="fb";fb.textContent="이미지 준비 중";
  wrap.appendChild(im);wrap.appendChild(fb);return wrap;
}
function renderRail(){
  var r=$("#rail");r.innerHTML="";r.scrollLeft=0;
  LOOKS[cur].items.forEach(function(it,pi){
    var b=document.createElement("button");b.className="pcard";
    b.setAttribute("aria-label",it[1]+(it[0]==="p1_tote"?" 코디에 더할 예시 · 착장 사진에는 미포함":"")+" 예시가"+fmt(it[2])+" 상세 보기");
    b.appendChild(thumb(it[0],""));
    var n=document.createElement("div");n.className="pname";n.textContent=it[1];
    var p=document.createElement("div");p.className="pprice";p.innerHTML="<em>예시가</em>"+fmt(it[2]);
    b.appendChild(n);if(it[0]==="p1_tote"){var note=document.createElement("small");note.className="extra-item";note.textContent="코디에 더할 예시 · 착장 사진에는 미포함";b.appendChild(note)}b.appendChild(p);var hint=document.createElement("span");hint.className="sr-only";hint.textContent=" 상세 보기";b.appendChild(hint);
    b.addEventListener("click",function(){openQuick(cur,pi)});
    r.appendChild(b);
  });
  if(!reduce){r.classList.remove("swap");void r.offsetWidth;r.classList.add("swap")}
}

/* collection grid */
var g=$("#grid");
LOOKS.forEach(function(L,i){
  var b=document.createElement("button");b.className="gitem rv";
  b.setAttribute("aria-label","룩 "+(i+1)+" "+L.name+" 보기");
  var im=new Image();im.alt="AI 캐릭터 윤도해 · "+L.desc;im.width=864;im.height=1152;im.loading="lazy";im.decoding="async";im.src=L.img;
  im.onerror=function(){b.classList.add("noimg")};
  b.appendChild(im);
  var cap=document.createElement("div");cap.className="cap";
  cap.innerHTML="<b>Look "+String(i+1).padStart(2,"0")+"</b><span>"+L.name+" · "+L.desc+"</span>";
  b.appendChild(cap);
  var v=document.createElement("span");v.className="view";v.textContent="VIEW";b.appendChild(v);
  b.addEventListener("click",function(){go(i);$("#hero").scrollIntoView({behavior:reduce?"auto":"smooth"});dots.children[i].focus({preventScroll:true})});
  g.appendChild(b);
});

/* quick view */
var qState={look:0,pi:0,color:0,size:null};
function openQuick(li,pi){
  if(modalClosing){pendingModal={id:"quick",look:li,pi:pi,focus:document.activeElement};return}
  var it=LOOKS[li].items[pi];if(!it)return;
  qState={look:li,pi:pi,color:0,size:null};
  var img=$("#qImgEl");var box=$("#qImg");box.classList.remove("noimg");
  img.onerror=function(){box.classList.add("noimg")};
  img.src="assets/products/"+it[0]+".webp";img.alt=it[1];
  $("#qName").textContent=it[1];$("#qPrice").textContent=fmt(it[2]);
  $("#qErr").textContent="";
  var cw=$("#qColors");cw.innerHTML="";
  COLORS.forEach(function(c,ci){
    var b=document.createElement("button");b.className="swatch";b.style.background=c[0];
    b.setAttribute("aria-label",c[1]);b.setAttribute("aria-pressed",ci===0?"true":"false");
    b.addEventListener("click",function(){
      qState.color=ci;$("#qColorName").textContent=c[1];
      Array.prototype.forEach.call(cw.children,function(x,xi){x.setAttribute("aria-pressed",xi===ci?"true":"false")});
    });
    cw.appendChild(b);
  });
  $("#qColorName").textContent=COLORS[0][1];
  var sw=$("#qSizes");sw.innerHTML="";
  var sizes=/_bag|_tote|_belt/.test(it[0])?["ONE SIZE"]:/_loafers|_sneakers|_boots|_slingback/.test(it[0])?["230","240","250"]:SIZES;
  sizes.forEach(function(s){
    var b=document.createElement("button");b.className="size";b.textContent=s;b.setAttribute("aria-pressed","false");
    b.addEventListener("click",function(){
      qState.size=s;$("#qErr").textContent="";
      Array.prototype.forEach.call(sw.children,function(x){x.setAttribute("aria-pressed",x===b?"true":"false")});
    });
    sw.appendChild(b);
  });
  openDrawer($("#quick"));
}
$("#qAdd").addEventListener("click",function(){
  if(!qState.size){$("#qErr").textContent="사이즈를 선택해 주세요.";return}
  var it=LOOKS[qState.look].items[qState.pi];
  var col=COLORS[qState.color][1];
  var key=it[0]+"|"+col+"|"+qState.size;
  var f=cart.filter(function(c){return c.key===key})[0];
  if(f&&f.qty>=99){$("#qErr").textContent="같은 선택은 최대 99개까지 담을 수 있습니다.";return}
  if(f)f.qty++;else cart.push({key:key,id:it[0],name:it[1],price:it[2],color:col,size:qState.size,qty:1});
  renderCart();toast("가상 장바구니에 담았습니다. 상단에서 선택한 상품을 확인하세요.");
  closeDrawers();
});

/* cart */
function renderCart(){
  var body=$("#cartBody");body.innerHTML="";
  var n=0,t=0;
  if(!cart.length){body.innerHTML='<div class="empty">아직 고른 상품이 없습니다.<br><small>룩의 포인트나 상품 사진을 눌러 골라보세요.</small></div>'}
  cart.forEach(function(c,i){
    n+=c.qty;t+=c.qty*c.price;
    var row=document.createElement("div");row.className="ci";
    var th=document.createElement("div");th.className="t";
    var im=new Image();im.alt=c.name;im.src="assets/products/"+c.id+".webp";im.onerror=function(){im.style.display="none"};th.appendChild(im);
    var mid=document.createElement("div");
    mid.innerHTML="<b>"+c.name+"</b><small>"+c.color+" / "+c.size+" · 예시가 "+fmt(c.price)+"</small>";
    var q=document.createElement("div");q.className="qty";
    var m=document.createElement("button");m.textContent="−";m.dataset.action="minus";m.setAttribute("aria-label",c.name+" 수량 감소");
    var s=document.createElement("span");s.textContent=c.qty;
    var p=document.createElement("button");p.textContent="+";p.dataset.action="plus";p.setAttribute("aria-label",c.name+" 수량 증가");p.disabled=c.qty>=99;
    m.onclick=function(){c.qty--;if(c.qty<1)cart.splice(i,1);renderCart();restoreCartFocus(i,"minus")};
    p.onclick=function(){c.qty=Math.min(99,c.qty+1);renderCart();restoreCartFocus(i,"plus")};
    q.appendChild(m);q.appendChild(s);q.appendChild(p);mid.appendChild(q);
    var right=document.createElement("div");
    right.innerHTML="<div style='font-size:14px'>"+fmt(c.price*c.qty)+"</div>";
    var rm=document.createElement("button");rm.className
="rm";rm.textContent="삭제";rm.dataset.action="remove";rm.setAttribute("aria-label",c.name+" 삭제");
    rm.onclick=function(){cart.splice(i,1);renderCart();restoreCartFocus(i,"remove")};
    right.appendChild(rm);
    row.appendChild(th);row.appendChild(mid);row.appendChild(right);
    body.appendChild(row);
  });
  $("#cartCount").textContent=n;
  $("#cartTotal").textContent=fmt(t);
}

/* Native dialog + one reversible history entry per open surface. */
var modalToken="lune-"+Math.random().toString(36).slice(2),modalClosing=false,pendingModal=null;
var openEl=null;
function restoreCartFocus(i,action){
  var rows=$("#cartBody").querySelectorAll(".ci");
  var row=rows[Math.min(i,rows.length-1)];
  var b=row&&row.querySelector('[data-action="'+action+'"]');
  (b&&!b.disabled?b:row&&row.querySelector("button:not([disabled])")||$("#cartDrawer [data-close]")).focus({preventScroll:true});
}
function closeVisual(){
  if(!openEl)return;
  openEl.close();openEl=null;
  document.body.style.overflow="";
  if(lastFocus&&lastFocus.isConnected)lastFocus.focus({preventScroll:true});
  lastFocus=null;
}
function openDrawer(d){
  if(modalClosing){pendingModal={id:d.id,look:qState.look,pi:qState.pi,focus:document.activeElement};return}
  if(!openEl)lastFocus=document.activeElement;
  else openEl.close();
  openEl=d;
  document.body.style.overflow="hidden";
  d.showModal();
  var marker={owner:modalToken,id:d.id,look:qState.look,pi:qState.pi};
  if(history.state&&history.state.lune&&history.state.lune.owner===modalToken)history.replaceState(Object.assign({},history.state,{lune:marker}),"");
  else history.pushState(Object.assign({},history.state,{lune:marker}),"");
  (d.id==="quick"?$("#qName"):$("#cartTitle")).focus({preventScroll:true});
}
function closeDrawers(){
  if(!openEl||modalClosing)return;
  var own=history.state&&history.state.lune&&history.state.lune.owner===modalToken;
  closeVisual();
  if(own){modalClosing=true;history.back()}
}
window.addEventListener("popstate",function(e){
  modalClosing=false;
  var m=e.state&&e.state.lune;
  if(m&&m.owner===modalToken){
    if(m.id==="quick")openQuick(m.look,m.pi);
    else {renderCart();openDrawer($("#cartDrawer"))}
  }else closeVisual();
  if(pendingModal){var p=pendingModal;pendingModal=null;if(p.focus&&p.focus.isConnected)p.focus.focus({preventScroll:true});if(p.id==="quick")openQuick(p.look,p.pi);else{renderCart();openDrawer($("#cartDrawer"))}}
});
document.querySelectorAll("dialog.drawer").forEach(function(d){
  d.addEventListener("cancel",function(e){e.preventDefault();closeDrawers()});
  d.addEventListener("click",function(e){if(e.target===d){var r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDrawers()}});
});
document.querySelectorAll("[data-close]").forEach(function(b){b.addEventListener("click",closeDrawers)});
$("#cartOpen").addEventListener("click",function(){renderCart();openDrawer($("#cartDrawer"))});
$("#stage").addEventListener("keydown",function(e){
  if(openEl)return;
  if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
    e.preventDefault();step(e.key==="ArrowLeft"?-1:1);dots.children[cur].focus({preventScroll:true});
  }
});
dots.addEventListener("keydown",function(e){if(e.key==="ArrowLeft"||e.key==="ArrowRight"){e.preventDefault();step(e.key==="ArrowLeft"?-1:1);dots.children[cur].focus()}});
/* toast */
function toast(msg){
  var t=$("#toast");t.textContent=msg;t.classList.add("on");
  clearTimeout(toastT);
  toastT=setTimeout(function(){t.classList.remove("on")},2800);
}

/* arrows */
$("#prev").addEventListener("click",function(){step(-1)});
$("#next").addEventListener("click",function(){step(1)});

/* drag / swipe on stage */
var dragX=null,dragY=null,dragMoved=false;
stage.addEventListener("pointerdown",function(e){
  if(e.target.closest&&e.target.closest(".hot"))return;
  dragX=e.clientX;dragY=e.clientY;dragMoved=false;
});
stage.addEventListener("pointermove",function(e){
  if(dragX===null)return;
  if(Math.abs(e.clientX-dragX)>8)dragMoved=true;
});
function endDrag(e){
  if(dragX===null)return;
  var dx=e.clientX-dragX,dy=e.clientY-dragY;
  dragX=null;
  if(Math.abs(dx)>50&&Math.abs(dx)>Math.abs(dy)*1.4){step(dx<0?1:-1)}
}
stage.addEventListener("pointerup",endDrag);
stage.addEventListener("pointercancel",function(){dragX=null;dragY=null;dragMoved=false});
stage.addEventListener("pointerleave",function(e){if(dragX!==null)endDrag(e)});
/* swallow click after a drag so a swipe doesn't also select a side card */
stage.addEventListener("click",function(e){
  if(dragMoved){e.stopPropagation();e.preventDefault();dragMoved=false}
},true);

/* resize */
var rt;
window.addEventListener("resize",function(){
  clearTimeout(rt);rt=setTimeout(layout,80);
});

/* reveal on scroll */
var rvEls=document.querySelectorAll(".rv");
if("IntersectionObserver" in window&&!reduce){
  var io=new IntersectionObserver(function(es){
    es.forEach(function(en){
      if(en.isIntersecting){en.target.classList.add("in");io.unobserve(en.target)}
    });
  },{threshold:.12,rootMargin:"0px 0px -6% 0px"});
  Array.prototype.forEach.call(rvEls,function(el){io.observe(el)});
}else{
  Array.prototype.forEach.call(rvEls,function(el){el.classList.add("in")});
}

/* init */
renderCart();
update();
})();
