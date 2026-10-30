(() => {
  'use strict';
  const key = 'ham-work-practice-handoff-v1';
  const version = 1;
  const returnKey = key + '-return:' + location.pathname;
  const pagePath = location.pathname.replace(/index\.html$/, '');
  const locale = document.documentElement.lang.startsWith('ja') ? 'ja' : document.documentElement.lang.startsWith('en') ? 'en' : 'ko';
  const copy = {
    ko: {
      create: {title:'내 경험으로 첫 요청 만들기', goal:'이번에 필요한 결과', material:'그 결과에 쓸 내 경험·자료', goalHint:'예: 신입 직원이 첫날 바로 따라 할 안내문 한 장', materialHint:'예: 카페 운영 8년. 신입이 바쁜 시간에 순서를 놓쳐, 첫 주 업무를 하루 세 칸으로 나눴습니다.', exampleGoal:'신입 직원이 첫날 바로 따라 할 안내문 한 장을 만들고 싶습니다.', exampleMaterial:'카페를 8년 운영했습니다. 신입이 바쁜 시간에 순서를 놓쳤고, 첫 주 업무를 하루 세 칸으로 나눠 가르쳤습니다. 아직 손님 응대 문구는 정하지 않았습니다.', output:'쓰던 AI에 붙여넣을 첫 요청', next:'이 내용으로 경험 작업지 이어 쓰기', sampleNext:'이 예시로 경험 작업지 열기', boundary:'입력한 두 가지를 요청문으로 묶습니다. AI 답이나 완성 안내문을 생성하는 기능은 아닙니다.'},
      check: {title:'AI 완료보고에서 확인할 것 찾기', goal:'원래 원했던 실제 결과', material:'AI의 완료보고', goalHint:'예: 휴대폰에서도 예약 버튼을 누르고 결과를 확인할 수 있어야 합니다.', materialHint:'예: 예약 페이지를 만들고 배포까지 끝냈습니다. 이제 사용할 수 있습니다.', exampleGoal:'휴대폰에서 예약 버튼을 누르고, 예약 결과를 다시 확인할 수 있어야 합니다.', exampleMaterial:'예약 페이지를 만들고 배포까지 끝냈습니다. 이제 사용할 수 있습니다.', output:'보고와 함께 확인할 질문', next:'이 내용으로 증거표 이어 쓰기', sampleNext:'이 예시로 증거표 열기', boundary:'보고서의 진위를 자동 판정하지 않습니다. 아직 확인하지 않은 근거를 질문으로 남깁니다.'},
      sampleNote:'아래 결과는 별도 예시입니다. 입력칸의 내 내용은 유지했습니다. 내 입력 보기로 돌아갈 수 있습니다.', sample:'예시 결과 · 내 내용을 적으면 바뀝니다', own:'내 입력으로 만든 요청', showSample:'예시 보기', showOwn:'내 입력 보기', copySample:'예시 문장 복사', copyOwn:'내 문장 복사', saveSample:'예시 파일 저장', saveOwn:'내 파일 저장', copied:'복사했습니다. 쓰던 AI에 붙여넣고 내용을 확인하세요.', failed:'자동 복사가 안 됐습니다. 아래 문장을 선택해 직접 복사하세요.', download:'다운로드를 시작했습니다. 브라우저에서 저장을 확인하세요.', saveFailed:'다운로드를 시작하지 못했습니다. 문장을 복사하거나 아래 내용을 직접 가져가세요.', empty:'원하는 결과와 사용할 자료를 적거나 예시를 먼저 살펴보세요.', transferFailed:'브라우저가 임시 전달을 막았습니다. 문장을 복사하거나 파일로 저장한 뒤 아래 도구에 직접 붙여넣으세요.', direct:'내용 없이 도구 열기', unspecified:'아직 입력하지 않음', example:'예시', createHeader:'첫 요청', checkHeader:'완료보고 확인 질문'
    },
    en: {
      create: {title:'Make a first request from your experience', goal:'What would you like to make?', material:'Experience or facts you can use', goalHint:'For example: a one-page first-day guide for a new employee', materialHint:'For example: I ran a café for eight years and split each day into three tasks to help new staff.', exampleGoal:'I want a one-page guide a new employee can follow on their first day.', exampleMaterial:'I ran a café for eight years. New staff lost track of tasks during busy hours, so I split the first week into three tasks per day. Customer-service wording has not been agreed yet.', output:'A first request to paste into your AI', next:'Continue in the experience worksheet (Korean)', sampleNext:'Open this example in the worksheet (Korean)', boundary:'This combines your two inputs into a request. It does not run AI or create the finished guide.'},
      check: {title:'Turn an AI completion report into questions', goal:'What result did you originally need?', material:'The AI completion report', goalHint:'For example: I need to make a booking on a phone and check the result.', materialHint:'For example: The booking page is built and deployed. It is ready to use.', exampleGoal:'A customer must be able to make a booking on a phone and check the booking result.', exampleMaterial:'The booking page is built and deployed. It is ready to use.', output:'Questions to check alongside the report', next:'Continue in the evidence worksheet (Korean)', sampleNext:'Open this example in the evidence worksheet (Korean)', boundary:'This does not judge whether the report is true. It leaves unverified evidence as questions.'},
      sampleNote:'The result below is a separate example. Your own inputs are kept above. Use View my inputs to return to them.', sample:'Example · type your own details to change it', own:'Request made from your inputs', showSample:'View example', showOwn:'View my inputs', copySample:'Copy example', copyOwn:'Copy my text', saveSample:'Download example', saveOwn:'Download my file', copied:'Copied. Paste it into your AI and review the text.', failed:'Automatic copy failed. Select the text below and copy it directly.', download:'Download requested. Check the saved file in your browser.', saveFailed:'Download could not start. Copy the text or select it directly below.', empty:'Enter your result and source material, or look at the example first.', transferFailed:'Your browser blocked the temporary handoff. Copy or download the text, then paste it into the worksheet.', direct:'Open worksheet without transferring', unspecified:'Not entered yet', example:'Example', createHeader:'First request', checkHeader:'Completion report questions'
    },
    ja: {
      create: {title:'自分の経験から、最初の依頼文をつくる', goal:'今回ほしい結果', material:'その結果に使える経験・資料', goalHint:'例：新人が初日にそのまま使える、一枚の案内文', materialHint:'例：カフェを8年運営。忙しい時間に新人が迷わないよう、一日の仕事を三つに分けました。', exampleGoal:'新人が初日にそのまま使える、一枚の案内文をつくりたいです。', exampleMaterial:'カフェを8年運営しました。忙しい時間に新人が順番を見失ったため、最初の一週間の仕事を一日三つに分けて教えました。接客の言葉はまだ決めていません。', output:'使っているAIに貼り付ける最初の依頼', next:'この内容で経験ワークシートを続ける（韓国語）', sampleNext:'この例でワークシートを開く（韓国語）', boundary:'二つの入力を依頼文にまとめます。AIを実行したり、完成した案内文を自動生成したりはしません。'},
      check: {title:'AIの完了報告で、確認することを見つける', goal:'最初にほしかった実際の結果', material:'AIの完了報告', goalHint:'例：スマートフォンで予約し、予約結果を確認できること。', materialHint:'例：予約ページの制作と公開が終わりました。利用できます。', exampleGoal:'スマートフォンで予約ボタンを押し、予約結果をもう一度確認できること。', exampleMaterial:'予約ページの制作と公開が終わりました。利用できます。', output:'報告と一緒に確認する質問', next:'この内容で証拠表を続ける（韓国語）', sampleNext:'この例で証拠表を開く（韓国語）', boundary:'報告の真偽を自動判定しません。未確認の証拠は質問として残します。'},
      sampleNote:'下の結果は別の例です。入力欄の自分の内容は残しています。「自分の入力を見る」で戻れます。', sample:'例の結果 · 自分の内容を書くと変わります', own:'自分の入力からつくった依頼', showSample:'例を見る', showOwn:'自分の入力を見る', copySample:'例の文をコピー', copyOwn:'自分の文をコピー', saveSample:'例を保存', saveOwn:'自分のファイルを保存', copied:'コピーしました。使っているAIに貼り付け、内容を確認してください。', failed:'自動コピーができませんでした。下の文を選択してコピーしてください。', download:'ダウンロードを開始しました。ブラウザーで保存を確認してください。', saveFailed:'ダウンロードを開始できませんでした。下の文をコピーしてお使いください。', empty:'ほしい結果と資料を書くか、先に例をご覧ください。', transferFailed:'ブラウザーが一時的な引き継ぎを止めました。文をコピー・保存し、次のツールに貼り付けてください。', direct:'内容を渡さずにツールを開く', unspecified:'まだ入力していません', example:'例', createHeader:'最初の依頼', checkHeader:'完了報告の確認質問'
    }
  }[locale];

  function requestText(mode, goal, material, sample) {
    const missing = copy.unspecified;
    if (!goal.trim()) goal='';
    if (!material.trim()) material='';
    const prefix = sample ? `${copy.example} · ` : '';
    if (locale === 'en') {
      if (mode === 'create') return `${prefix}${copy.createHeader}\n\n[Result I need]\n${goal || missing}\n\n[My experience and source facts]\n${material || missing}\n\nUse the facts I gave you to make a first draft that I can actually use. Keep my purpose and corrections together. Do not invent names, prices, benefits or evidence. If information is missing, leave that gap visible and ask only what would materially change the result. Finish what you can with the information available.\n\nGive me the draft first, followed by what I need to verify. Do not claim to have published, sent or saved anything unless you actually did so within the scope I entrusted to you.`;
      return `${prefix}${copy.checkHeader}\n\n[Result I originally needed]\n${goal || missing}\n\n[AI completion report]\n${material || missing}\n\nI have not verified the evidence below yet. Show me what I can open and check:\n1. Which files or content changed, and what was preserved?\n2. Which tests actually ran, and what was their output?\n3. Where can I use the real result and check it against my original purpose?\n4. What happens on a phone, with empty input, or when something fails?\n5. Has a user actually tried and accepted it, or is that still unverified?\n\nSeparate production, tests, publication and actual use. Keep working on gaps you can check yourself within the entrusted scope. Do not turn a claim in the report into verified success.`;
    }
    if (locale === 'ja') {
      if (mode === 'create') return `${prefix}${copy.createHeader}\n\n[今回ほしい結果]\n${goal || missing}\n\n[私の経験・確認できる資料]\n${material || missing}\n\n伝えた事実から、実際に使える最初の案をつくってください。最初の目的と後からの修正を一緒に反映してください。名前・価格・特典・根拠を作り足さないでください。不足は見える形で残し、結果を大きく変える点だけ質問してください。今ある情報でできる部分は仕上げてください。\n\n使う本文を先に示し、その後に私が確認する点を短く付けてください。任せた範囲で実行・確認していない公開・送信・保存を、済んだと言わないでください。`;
      return `${prefix}${copy.checkHeader}\n\n[最初にほしかった結果]\n${goal || missing}\n\n[AIの完了報告]\n${material || missing}\n\n次の証拠はまだ確認していません。実際に開いて確かめられるものを示してください。\n1. どのファイル・内容が変わり、何を残しましたか。\n2. どのテストを実行し、どんな出力がありましたか。\n3. 実際の結果をどこで使い、最初の目的と比べられますか。\n4. スマートフォン・空の入力・失敗時はどうなりますか。\n5. 利用者が実際に使って受け入れましたか。それとも未確認ですか。\n\n制作・テスト・公開・実際の使用を分けてください。任せた範囲で自分が確認できる不足は続けて確認し、報告の言葉だけで成功にしないでください。`;
    }
    if (mode === 'create') return `${prefix}${copy.createHeader}\n\n[이번에 필요한 결과]\n${goal || missing}\n\n[내 경험·확인할 수 있는 자료]\n${material || missing}\n\n내가 준 사실로 실제로 쓸 첫 초안을 만들어줘. 처음 목적과 나중에 바로잡은 내용을 함께 반영해줘. 이름·가격·혜택·근거를 지어내지 마. 부족한 정보는 빈칸으로 보이게 남기고 결과를 크게 바꿀 것만 물어봐. 지금 가진 정보로 만들 수 있는 부분은 끝내줘.\n\n실제로 쓸 본문을 먼저 주고, 내가 확인해야 할 것을 짧게 붙여줘. 내가 맡긴 범위에서 실행·확인하지 않은 공개·발송·저장을 했다고 말하지 마.`;
    return `${prefix}${copy.checkHeader}\n\n[원래 원했던 실제 결과]\n${goal || missing}\n\n[AI의 완료보고]\n${material || missing}\n\n아래 근거는 아직 확인하지 않았어. 내가 열고 직접 대조할 수 있는 것을 보여줘.\n1. 바꾼 파일·본문과 실제 차이는 무엇이고, 무엇을 유지했나?\n2. 실제로 실행한 시험과 그 출력은 무엇인가?\n3. 실제 결과를 어느 주소·파일에서 써보고 원래 목적과 비교할 수 있나?\n4. 휴대폰·빈 입력·실패할 때는 어떻게 되나?\n5. 사용자가 실제로 써보고 받아들인 것인가, 아직 미확인인가?\n\n제작·시험·공개·실제 사용을 나눠 답해줘. 맡긴 범위에서 네가 확인할 수 있는 빈칸은 이어서 확인하고, 보고서에 적었다는 이유로 성공 처리하지 마.`;
  }

  async function copyText(value, parent) {
    try { await navigator.clipboard.writeText(value); return true; }
    catch (_) {
      let area;
      try { area=document.createElement('textarea'); area.value=value; area.readOnly=true; area.style.cssText='position:fixed;opacity:0'; parent.append(area); area.select(); return document.execCommand('copy') === true; }
      catch (_) { return false; }
      finally { area?.remove(); }
    }
  }
  function track(mode, action) {
    if (!['create','check'].includes(mode) || !['example','copy','download_request','open_tool'].includes(action)) return;
    if (!document.querySelector('script[data-ham-analytics]') || window.gtag?.hamPlaceholder || window['ga-disable-G-TEBKMGWPQS']) return;
    try { window.gtag('event','home_practice_use',{practice_mode:mode,practice_action:action,source_page:location.pathname}); } catch (_) {}
  }
  function transfer(payload, anchor, status) {
    try {
      const raw=JSON.stringify(payload); sessionStorage.setItem(key,raw);
      if (sessionStorage.getItem(key)!==raw) throw Error('storage');
      location.assign(anchor.href);
    } catch (_) {
      try { sessionStorage.removeItem(key); } catch (_) {}
      status.textContent=copy.transferFailed;
      const link=document.createElement('a');link.href=anchor.href;link.textContent=copy.direct;link.className='practice-direct';link.addEventListener('click',()=>{try{sessionStorage.removeItem(key);}catch(_){}});status.append(' ',link);
    }
  }
  function payload(mode, goal, material, text, sample) { return {version,target:mode==='create'?'experience':'review',mode,goal,material,text,sample}; }

  function initPractice(section) {
    let mode='create', sample=true;
    const values={create:{goal:'',material:''},check:{goal:'',material:''}};
    const goal=section.querySelector('[data-practice-goal]'), material=section.querySelector('[data-practice-material]');
    const output=section.querySelector('[data-practice-output]'), status=section.querySelector('[data-practice-status]');
    const example=section.querySelector('[data-practice-example]'), next=section.querySelector('[data-practice-next]');
    const copyButton=section.querySelector('[data-practice-copy]'), saveButton=section.querySelector('[data-practice-save]');
    const navigation={ko:{edit:'내 내용으로 바꾸기 ↓',result:'바뀐 결과 보기 ↑'},en:{edit:'Use my own details ↓',result:'See the updated result ↑'},ja:{edit:'自分の内容に変える ↓',result:'変更した結果を見る ↑'}}[locale];
    const result=section.querySelector('.practice-result'), inputs=section.querySelector('.practice-inputs');
    section.querySelector('.practice-layout').prepend(result);
    const edit=document.createElement('button');edit.type='button';edit.className='practice-edit';edit.textContent=navigation.edit;
    edit.addEventListener('click',()=>{goal.focus({preventScroll:true});inputs.scrollIntoView({block:'start',behavior:'auto'});});
    result.querySelector('.practice-actions').append(edit);
    const showResult=document.createElement('button');showResult.type='button';showResult.className='practice-show-result';showResult.textContent=navigation.result;
    showResult.addEventListener('click',()=>{output.focus({preventScroll:true});result.scrollIntoView({block:'start',behavior:'auto'});});inputs.append(showResult);
    result.querySelector('[data-practice-output-title]').after(section.querySelector('[data-practice-boundary]'));
    const sourceNote=document.createElement('p');sourceNote.className='practice-source-note';sourceNote.textContent=copy.sampleNote;example.after(sourceNote);
    function current() { const c=copy[mode];return sample?{goal:c.exampleGoal,material:c.exampleMaterial}:values[mode]; }
    function render() {
      const c=copy[mode], v=current(), empty=!v.goal.trim()&&!v.material.trim();
      section.querySelector('[data-practice-title]').textContent=c.title;
      section.querySelector('[data-practice-goal-label]').textContent=c.goal;
      section.querySelector('[data-practice-material-label]').textContent=c.material;
      goal.placeholder=c.goalHint;material.placeholder=c.materialHint;
      section.querySelector('[data-practice-output-title]').textContent=c.output;
      section.querySelector('[data-practice-kind]').textContent=sample?copy.sample:copy.own;
      section.querySelector('[data-practice-boundary]').textContent=c.boundary;
      output.value=empty?'':requestText(mode,v.goal,v.material,sample);
      output.placeholder=copy.empty;copyButton.disabled=empty;saveButton.disabled=empty;
      copyButton.textContent=sample?copy.copySample:copy.copyOwn;saveButton.textContent=sample?copy.saveSample:copy.saveOwn;
      example.textContent=sample?copy.showOwn:copy.showSample;example.setAttribute('aria-pressed',String(sample));
      sourceNote.hidden=!(sample&&(values[mode].goal.trim()||values[mode].material.trim()));
      next.href=mode==='create'?'/tools/experience-sheet/?from=home-practice':'/tools/dev-literacy/?from=home-practice';
      next.textContent=sample?c.sampleNext:c.next;
      section.querySelectorAll('[data-practice-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.practiceMode===mode)));
    }
    section.querySelectorAll('[data-practice-mode]').forEach(button=>button.addEventListener('click',()=>{
      if(button.dataset.practiceMode===mode)return;
      values[mode]={goal:goal.value,material:material.value};mode=button.dataset.practiceMode;
      goal.value=values[mode].goal;material.value=values[mode].material;sample=!goal.value&&!material.value;
      status.textContent='';render();
    }));
    [goal,material].forEach(field=>field.addEventListener('input',()=>{values[mode]={goal:goal.value,material:material.value};sample=false;status.textContent='';render();}));
    example.addEventListener('click',()=>{sample=!sample;status.textContent='';render();if(sample)track(mode,'example');});
    copyButton.addEventListener('click',async()=>{const ok=await copyText(output.value,section);status.textContent=ok?copy.copied:copy.failed;if(ok)track(mode,'copy');});
    saveButton.addEventListener('click',()=>{
      const stamp=new Intl.DateTimeFormat('sv-SE',{timeZone:'Asia/Seoul',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
      const body=output.value+`\n\n${stamp} · HAM MEDIA · https://hammedia.co.kr/#try-my-work\n`;
      let url, a;
      try {
        url=URL.createObjectURL(new Blob(['\ufeff'+body],{type:'text/plain;charset=utf-8'}));
        a=document.createElement('a');a.href=url;a.download=`${stamp.replaceAll('-','')}_HAM_${sample?'example_':''}${mode==='create'?'first-request':'evidence-questions'}.txt`;
        document.body.append(a);a.click();status.textContent=copy.download;track(mode,'download_request');
      } catch (_) { status.textContent=copy.saveFailed; }
      finally { a?.remove();if(url)setTimeout(()=>URL.revokeObjectURL(url),1000); }
    });
    next.addEventListener('click',event=>{
      event.preventDefault();const v=current();
      if(!v.goal.trim()&&!v.material.trim()){status.textContent=copy.empty;goal.focus();return;}
      try{sessionStorage.setItem(returnKey,JSON.stringify({version,mode,sample,values}));}catch(_){}
      track(mode,'open_tool');transfer(payload(mode,v.goal,v.material,output.value,sample),next,status);
    });
    function restoreReturn(consume) {
      try {
        const saved=JSON.parse(sessionStorage.getItem(returnKey));
        if(saved?.version!==version||!['create','check'].includes(saved.mode)||typeof saved.sample!=='boolean'||!['create','check'].every(m=>['goal','material'].every(k=>typeof saved.values?.[m]?.[k]==='string')))return false;
        mode=saved.mode;sample=saved.sample;Object.assign(values,saved.values);
        goal.value=values[mode].goal;material.value=values[mode].material;render();
        if(consume)sessionStorage.removeItem(returnKey);
        return true;
      } catch (_) { return false; }
    }
    window.addEventListener('pageshow',()=>{
      if(!restoreReturn(true)){
        values[mode]={goal:goal.value,material:material.value};
        if(goal.value.trim()||material.value.trim())sample=false;
        render();
      }
    });
    if(!restoreReturn(false))render();section.dataset.practiceReady='true';
  }

  function receive() {
    const target=pagePath==='/tools/experience-sheet/'?'experience':pagePath==='/tools/dev-literacy/'?'review':null;
    if(!target)return;
    let incoming;
    try { const raw=sessionStorage.getItem(key);if(!raw)return;incoming=JSON.parse(raw); }
    catch (_) { return; }
    if(incoming?.version!==version||incoming.target!==target||!['create','check'].includes(incoming.mode)||!['goal','material','text'].every(k=>typeof incoming[k]==='string'))return;
    const container=target==='experience'?document.getElementById('goal').closest('section'):document.querySelector('.review-workbench');
    const pairs=target==='experience'?[['goal',incoming.goal],['f1',incoming.material]]:[['review-expected',incoming.goal],['review-report',incoming.material]];
    const scope=target==='experience'?document.getElementById('main'):container;
    const occupied=Array.from(scope.querySelectorAll('textarea:not([readonly])')).some(el=>el.value.trim())||Array.from(scope.querySelectorAll('[data-evidence-status]')).some(el=>el.value!=='unchecked');
    const box=document.createElement('aside');box.className='practice-import';box.setAttribute('aria-label','홈에서 가져온 작업');
    const title=document.createElement('strong');title.textContent=incoming.sample?'홈의 예시를 가져왔습니다. 내 상황에 맞게 고쳐 쓰세요.':'홈에서 적은 작업을 가져왔습니다.';
    const note=document.createElement('p');note.textContent=occupied?'쓰던 입력과 증거 상태를 유지했습니다. 아래 내용을 보거나 빈칸에만 가져올 수 있습니다.':'입력한 내용으로 이어 시작합니다. 결과와 사실은 직접 확인하세요.';
    const details=document.createElement('details'), summary=document.createElement('summary');summary.textContent='가져온 전체 내용 보기';
    const text=document.createElement('textarea');text.readOnly=true;text.rows=5;text.value=incoming.text;text.setAttribute('aria-label','홈에서 가져온 전체 내용');details.append(summary,text);
    box.append(title,note,details);
    function applyEmpty() {
      let count=0;
      pairs.forEach(([id,value])=>{const field=document.getElementById(id);if(!field.value.trim()&&value){field.value=value;field.dispatchEvent(new Event('input',{bubbles:true}));count++;}});
      return count;
    }
    if(occupied){const merge=document.createElement('button');merge.type='button';merge.textContent='빈칸에만 가져오기';merge.addEventListener('click',()=>{note.textContent=applyEmpty()?'빈칸만 채웠습니다. 쓰던 내용과 증거 상태는 그대로입니다.':'채울 빈칸이 없어 쓰던 내용을 모두 유지했습니다. 가져온 전체 내용을 직접 비교하세요.';merge.disabled=true;});box.append(merge);}else applyEmpty();
    const button=document.createElement('button');button.type='button';button.textContent='가져온 내용 복사';button.addEventListener('click',async()=>{const ok=await copyText(incoming.text,box);note.textContent=ok?'가져온 내용을 복사했습니다. 쓰던 내용과 비교해 필요한 부분을 붙여넣으세요.':'자동 복사가 안 됐습니다. 가져온 전체 내용을 선택해 직접 복사하세요.';if(ok)window.HAMPrivacy?.trackToolOutput('copy',incoming.mode==='check'?'md':'txt');});box.append(button);
    container.before(box);
    try{sessionStorage.removeItem(key);}catch(_){}
  }

  function addReviewBridge() {
    if(pagePath!=='/tools/experience-sheet/')return;
    const final=document.getElementById('final-version').closest('section'), details=document.createElement('details');details.className='practice-followup';
    const summary=document.createElement('summary');summary.textContent='AI로 홈페이지·앱을 만들고 있나요?';
    const p=document.createElement('p');p.textContent='원하는 결과와 위에 붙인 AI 답을 증거표로 가져갈 수 있습니다. 답이 완료보고인지 직접 확인하고, 실제 화면·시험을 본 뒤 상태를 고르세요. 글·안내문 작업에 꼭 필요한 과정은 아닙니다.';
    const a=document.createElement('a');a.href='/tools/dev-literacy/?from=experience-sheet';a.textContent='현재 목표·AI 답으로 증거표 이어 쓰기';
    const status=document.createElement('p');status.className='practice-bridge-status';status.setAttribute('role','status');
    a.addEventListener('click',event=>{event.preventDefault();const goal=document.getElementById('goal').value,report=document.getElementById('ai-answer').value;if(!goal.trim()&&!report.trim()){status.textContent='먼저 원하는 결과나 AI 답을 적어주세요.';return;}const text=requestText('check',goal,report,false);transfer(payload('check',goal,report,text,false),a,status);});
    details.append(summary,p,a,status);final.append(details);
  }
  function revealPractice(){
    if(location.hash!=='#try-my-work')return;
    const target=document.getElementById('try-my-work');if(!target)return;
    if(target.matches('details'))target.open=true;
    requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'auto'}));
  }
  function start(){document.querySelectorAll('[data-work-practice]').forEach(initPractice);receive();addReviewBridge();revealPractice();document.fonts?.ready.then(revealPractice);}
  window.addEventListener('hashchange',revealPractice);

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
