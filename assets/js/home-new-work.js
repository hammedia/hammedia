/* Latest work reads the existing publication projection; the featured project stays editorial. */
(function(){
'use strict';
const menu=document.querySelector('.home-mobile-menu');if(menu){menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.open=false;}));menu.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open){menu.open=false;menu.querySelector('summary').focus();event.preventDefault();event.stopPropagation();}});}
const root=document.querySelector('#home-latest');if(!root)return;
const list=root.querySelector('[data-latest-list]');
const lang=document.documentElement.lang.toLowerCase();
const labels=lang.startsWith('en')?{loading:'Loading recent work.',empty:'The recent list is empty. All published work is still available.',error:'The recent list is unavailable. Explore all published work below.',all:'All published work',date:'Recorded'}:lang.startsWith('ja')?{loading:'最近の作品を読み込んでいます。',empty:'最近の一覧は空です。公開作品は引き続きご覧いただけます。',error:'最近の一覧を読み込めませんでした。公開作品をご覧ください。',all:'公開作品をすべて見る',date:'記録'}:{loading:'최신 작품을 불러오는 중입니다.',empty:'최근 목록이 비어 있습니다. 전체 공개 작품은 계속 볼 수 있습니다.',error:'최신 목록을 불러오지 못했습니다. 전체 공개 작품에서 만나보세요.',all:'작품 모두 보기',date:'기록'};
function message(text,state){const p=document.createElement('p');p.textContent=text;p.setAttribute('role','status');const a=document.createElement('a');a.href='/ham-media-archive/pages/colleagues.html#works';a.textContent=labels.all+' ↗';list.replaceChildren(p,a);root.dataset.highlightsStatus=state;}
message(labels.loading,'loading');
const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),6000);
fetch('/ham-media-archive/pages/colleagues.html',{cache:'no-cache',signal:controller.signal}).then(r=>{if(!r.ok)throw new Error('catalog unavailable');return r.text();}).then(raw=>{
 if(raw.length>1000000)throw new Error('projection too large');
 const matches=[...raw.matchAll(/<script type="application\/json" id="home-highlights-source">([\s\S]*?)<\/script>/g)];
 if(matches.length!==1||matches[0][1].length>50000)throw new Error('projection unavailable');
 const data=JSON.parse(matches[0][1]);
 if(data.schema!=='ham-home-highlights/1'||typeof data.version!=='string'||!/^[0-9a-f]{16}$/.test(data.version)||!Array.isArray(data.items)||data.items.length>200)throw new Error('projection invalid');
 const ids=new Set(),videos=new Set();
 const items=data.items.map(w=>{
  if(!w||!/^[-_A-Za-z0-9]{1,80}$/.test(w.id)||ids.has(w.id)||!/^[-_A-Za-z0-9]{11}$/.test(w.video_id)||typeof w.title!=='string'||!w.title.trim()||w.title.length>1600||typeof w.summary!=='string'||w.summary.length>1600)throw new Error('item invalid');ids.add(w.id);
  const at=typeof w.recorded_at==='string'?Date.parse(w.recorded_at):NaN;
  if(!Number.isFinite(at)||at>Date.now()+60000)throw new Error('date invalid');return {...w,at};
 }).sort((a,b)=>b.at-a.at||a.id.localeCompare(b.id)).filter(w=>{if(videos.has(w.video_id))return false;videos.add(w.video_id);return true;}).slice(0,2);
 if(!items.length){message(labels.empty,'empty');return;}
 list.replaceChildren();for(const w of items){const a=document.createElement('a');a.className='home-latest-item';a.href='/ham-media-archive/pages/colleagues.html#work-'+encodeURIComponent(w.id);const im=document.createElement('img');im.src='https://i.ytimg.com/vi/'+w.video_id+'/hqdefault.jpg';im.alt='';im.width=480;im.height=360;im.loading='lazy';im.referrerPolicy='no-referrer';im.addEventListener('error',()=>{im.hidden=true;a.style.gridTemplateColumns='1fr';});const body=document.createElement('div'),title=document.createElement('h3'),date=document.createElement('span');title.textContent=w.title;const kst=new Date(w.at+9*3600000);date.textContent=labels.date+' '+kst.toISOString().slice(0,10).replaceAll('-','.');body.append(title,date);a.append(im,body);list.append(a);}
 root.dataset.highlightsVersion=data.version;root.dataset.highlightsStatus='current';
}).catch(()=>message(labels.error,'fallback')).finally(()=>clearTimeout(timeout));
})();
