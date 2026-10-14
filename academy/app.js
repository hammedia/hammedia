(() => {
  const steps = [
    {
      speaker: '1 · 요청 — 햄PD가 실제로 한 말',
      quote: '「내가 너네에게 했던 말들이 강의에 쓰이면 될꺼 같아」',
      source: '계속 내놓지 못한 강의의 원인을 찾다가, 자기가 실제로 결과를 만든 방법을 강의의 중심에 두자고 한 말입니다.',
      kicker: '이 수업을 다시 만들 때 오간 실제 장면',
      title: '코딩 문법이 아니라, 하려는 일을 자기 말로 합니다.',
      body: '햄PD는 코딩을 배운 뒤 결과를 만든 사람이 아닙니다. 오래 해온 일을 자기 말로 설명했고, AI의 결과가 생각과 다를 때마다 다시 말했습니다.',
      action: '부족했던 첫 결과 보기'
    },
    {
      speaker: '2 · AI와 만든 첫 결과',
      quote: '7강 × 6장면, 모두 42장면이었습니다. 자동 검사도 통과했습니다.',
      source: '당시 AI가 쓴 첫 답의 원문은 남아 있지 않아, 그때 나온 결과물로 보여 드립니다.',
      kicker: '통과했지만 부족했던 첫 결과',
      title: '카드·도구·화면이 앞에 서고, 수강생이 가져갈 내 결과물 하나가 없었습니다.',
      body: '햄PD가 실제로 결과를 만든 대화와 판단보다 카드·도구·화면이 앞에 섰습니다. 이 첫 결과를 숨기지 않고 비교본으로 남깁니다.',
      action: '햄PD가 짚은 말 보기'
    },
    {
      speaker: '3 · 햄PD가 짚은 말',
      quote: '「내 생각을 설명한다 → AI와 같이 만든다 → 내가 판단한다 → 실제 결과물이 나온다.」',
      source: '햄PD가 쓴 글의 마지막 줄입니다. 앞에서 「프롬프트 잘 쓰기」「AI 기능 많이 알기」「코딩 배우기」를 각각 X로 지웠습니다.',
      kicker: '무엇을 가르칠지의 기준을 바꾼 말',
      title: 'AI 기능이 아니라, 내 생각을 설명하고 내가 판단하는 순서를 가르칩니다.',
      body: '기준이 바뀌자 수업의 중심이 카드·도구에서 수강생 자신의 결과로 옮겨 갔습니다.',
      action: '바뀐 결과 보기'
    },
    {
      speaker: '4 · 바뀐 결과',
      quote: '사람마다 내용은 달라도, 한 페이지 결과물 하나를 끝냅니다.',
      source: '지금 보고 계신 수업 구조가 그 결과입니다. 1강에서 같은 순서를 직접 해볼 수 있습니다.',
      kicker: '내 경험 → 결과 약속 → 첫 결과 → 전문가의 눈으로 고치기 → 실제로 만들기 → 확인 → 이어가기',
      title: '그 순서가 일곱 시간이 됐습니다.',
      body: '첫 시도를 지우지 않고, 질문과 교정을 거쳐 같은 일을 다시 해보면서 처음 답과 달라진 곳을 직접 확인합니다.',
      action: '처음부터 다시 보기'
    }
  ];

  const stage = document.querySelector('[data-dialogue-stage]');
  if (stage) {
    const buttons = [...stage.querySelectorAll('[data-step-button]')];
    const speaker = stage.querySelector('[data-dialogue-speaker]');
    const quote = stage.querySelector('[data-dialogue-quote]');
    const source = stage.querySelector('[data-dialogue-source]');
    const kicker = stage.querySelector('[data-dialogue-kicker]');
    const title = stage.querySelector('[data-dialogue-title]');
    const body = stage.querySelector('[data-dialogue-body]');
    const next = stage.querySelector('[data-next-step]');
    const progress = stage.querySelector('[data-progress-bar]');
    let current = 0;

    const render = (index, moveFocus = false) => {
      current = index;
      const step = steps[current];
      speaker.textContent = step.speaker;
      quote.textContent = step.quote;
      source.textContent = step.source;
      kicker.textContent = step.kicker;
      title.textContent = step.title;
      body.textContent = step.body;
      next.firstChild.textContent = `${step.action} `;
      progress.style.width = `${(current + 1) * 25}%`;
      buttons.forEach((button, buttonIndex) => {
        if (buttonIndex === current) button.setAttribute('aria-current', 'step');
        else button.removeAttribute('aria-current');
      });
      if (moveFocus) title.focus?.();
    };

    buttons.forEach((button, index) => button.addEventListener('click', () => render(index)));
    next.addEventListener('click', () => render((current + 1) % steps.length));
  }

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealTargets = document.querySelectorAll('.evidence-card, .hour-flow li, .method-steps article');
  revealTargets.forEach((target) => target.setAttribute('data-reveal', ''));

  document.querySelectorAll('.evidence-card').forEach((card) => {
    card.addEventListener('focus', () => {
      if (!window.matchMedia('(max-width: 760px)').matches) return;
      card.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'auto' });
    });
  });

  if (reduced || !('IntersectionObserver' in window)) {
    revealTargets.forEach((target) => target.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((target) => observer.observe(target));
  }
  document.querySelectorAll('[data-youtube-id]').forEach((frame) => {
    const button = frame.querySelector('.video-play');
    if (!button) return;
    button.addEventListener('click', () => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(frame.dataset.youtubeId)}?autoplay=1&rel=0`;
      iframe.title = frame.dataset.youtubeTitle || '영상';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      frame.replaceChildren(iframe);
      iframe.focus();
    });
  });
})();
