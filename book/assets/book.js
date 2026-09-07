(()=>{
 const ids=['try-reality','try-result','try-material','try-judgment'];
 const fields=ids.map(id=>document.getElementById(id));
 const defaults=fields.map(el=>el.value);
 const labels=['내가 아는 현실','원하는 결과','AI가 읽을 재료','내가 마지막에 판단할 것'];
 const output=document.getElementById('try-request');
 const status=document.getElementById('try-status');
 const copy=document.getElementById('try-copy');
 function render(){
  const values=fields.map(el=>el.value.trim());
  output.value=labels.map((label,i)=>label+': '+(values[i]||'[직접 적어주세요]')).join('\n\n')+'\n\n이 내용을 바탕으로 원하는 결과의 초안을 만들어주세요.\n없는 정보·경력·가격은 추측하지 말고, 필요한 자료나 질문을 먼저 알려주세요.\n마지막 판단은 제가 직접 하겠습니다.';
  copy.disabled=values.some(v=>!v);
  status.textContent=copy.disabled?'빈칸을 채우면 요청서를 복사할 수 있습니다.':'내 요청서가 준비됐습니다. 복사해서 AI와 대화를 시작해보세요.';
 }
 fields.forEach(el=>el.addEventListener('input',render));
 document.getElementById('experience-form').addEventListener('submit',e=>e.preventDefault());
 document.getElementById('try-reset').addEventListener('click',()=>{fields.forEach((el,i)=>el.value=defaults[i]);render();status.textContent='책의 식당 예시로 되돌렸습니다.';});
 copy.addEventListener('click',async()=>{if(copy.disabled)return;try{await navigator.clipboard.writeText(output.value);status.textContent='요청서를 복사했습니다. 사용하는 AI의 대화창에 붙여넣으세요.';}catch{output.focus();output.select();status.textContent='요청서를 선택했습니다. 기기의 복사 기능으로 복사하세요.';}});
 render();
})();

// The worksheet is entirely local; progress follows the reader's own input.
(() => {
  const fields = [...document.querySelectorAll('#experience-form textarea')];
  const progress = document.getElementById('try-progress');
  const workspace = document.querySelector('.try-workspace');
  const update = () => {
    const filled = fields.filter(field => field.value.trim()).length;
    progress.textContent = `${filled} / 4칸 준비됨`;
    fields.forEach(field => field.classList.toggle('is-empty', !field.value.trim()));
    workspace.classList.remove('is-updated');
    requestAnimationFrame(() => workspace.classList.add('is-updated'));
  };
  fields.forEach(field => field.addEventListener('input', update));
  document.getElementById('try-reset').addEventListener('click', update);
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.12 });
    document.querySelectorAll('.case-image').forEach(element => observer.observe(element));
  }
})();
