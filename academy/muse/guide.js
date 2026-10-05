(() => {
  const editor = document.getElementById('first-prompt');
  const drafts = {
    shop: editor.value,
    photo: '내 사진을 설명하는 짧은 글을 만들고 싶습니다.\n사진에 보이는 것은 [직접 적은 설명]입니다.\n내가 기억하고 싶은 이유는 [이유]입니다.\n[나중의 나 / 지인 / 방문자]가 읽을 2문장으로 정리해주세요.\n내가 말하지 않은 인물, 장소, 날짜, 감정은 만들지 마세요.\n결과는 이 대화에서 보여주세요. 외부에 게시하거나 보내지는 마세요.',
    study: '나는 [배우는 주제]를 공부하고 있습니다.\n오늘 적은 메모는 다음과 같습니다.\n[내 메모 3줄]\n이 메모를 바탕으로 핵심 3가지와 내일 해볼 작은 연습 1개로 정리해주세요.\n메모에 없는 설명을 더한다면 추가 설명이라고 구분해주세요.\n어려운 말은 쉬운 말로 풀어주세요.\n결과는 이 대화에서 보여주세요. 외부에 게시하거나 보내지는 마세요.'
  };
  const labels = {shop:'가게 소개', photo:'사진 설명', study:'배운 내용 정리'};
  const hints = {shop:'확인할 것: 실제 제공하지 않는 서비스나 근거 없는 표현이 들어가지 않았나요?', photo:'사진을 올리지 않아도 보이는 것을 글로 설명할 수 있습니다. 사진에 없는 내용이나 내가 느끼지 않은 감정이 생기지 않았는지 확인하세요.', study:'확인할 것: 원래 메모와 뜻이 같은가요? 추가된 설명은 사실인지 확인할 수 있나요?'};
  let current = 'shop';
  document.querySelectorAll('[data-choice]').forEach(button => button.addEventListener('click', () => {
    drafts[current] = editor.value;
    current = button.dataset.choice;
    editor.value = drafts[current];
    document.getElementById('prompt-label').textContent = labels[current] + ' 요청문 · 빈칸을 바꿔보세요';
    document.getElementById('check-hint').textContent = hints[current];
    document.querySelectorAll('[data-choice]').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
  }));
  let timer;
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const input = document.getElementById(button.dataset.copy);
    const status = document.getElementById('copy-status');
    clearTimeout(timer);
    try {
      await navigator.clipboard.writeText(input.value);
      status.textContent = '복사했습니다. Muse Chat 또는 평소 쓰는 AI에 붙여넣으세요.';
    } catch {
      input.focus(); input.select();
      status.textContent = '문장을 선택했습니다. 기기의 복사 메뉴로 복사해주세요.';
    }
    timer = setTimeout(() => {status.textContent = '';}, 7000);
  }));
})();
