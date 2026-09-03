(() => {
  const steps = [
    {
      speaker: '대상 요약',
      quote: '전문성과 아이디어는 있지만 도구 앞에서 멈춘 사람',
      source: '아카데미가 돕고 싶은 사람을 한 문장으로 정리했습니다.',
      kicker: '설명은 기능이 아니라 막힌 장면부터',
      title: '“누가, 어디서, 왜 멈췄는지”를 먼저 말합니다.',
      body: '잘 만든 질문을 외우지 않습니다. 내가 보고 느낀 문제를 내 말로 설명하는 것부터 시작합니다.',
      action: '첫 결과 보기'
    },
    {
      speaker: '첫 결과 예시',
      quote: '정보는 많지만, 다음 행동이 보이지 않는 첫 결과',
      source: '수업 흐름을 설명하기 위한 예시이며 햄PD 발언이 아닙니다.',
      kicker: 'AI의 첫 결과는 정답이 아니라 비교본',
      title: '처음 나온 결과를 숨기지 않고 함께 봅니다.',
      body: '그럴듯한 말, 빠진 증거, 반복되는 버튼처럼 실제 사용을 막는 지점을 눈으로 찾습니다.',
      action: '사람이 고치기'
    },
    {
      speaker: '교정 기준',
      quote: '쓸 수 있는 선택지를 만든 뒤 목적에 맞는 것을 고르는 단계',
      source: '수업 흐름을 설명하기 위한 기준이며 햄PD 발언이 아닙니다.',
      kicker: '경험과 목적이 수정 기준이 됩니다',
      title: '내가 아는 일과 상대가 해야 할 행동으로 다시 고칩니다.',
      body: '모든 기능을 넣지 않습니다. 목적에 맞는 대표 효과 하나와 보조 효과만 선택합니다.',
      action: '실제 결과 보기'
    },
    {
      speaker: '결과 상태',
      quote: '처음 온 사람도 목적과 다음 행동을 이해할 수 있는 결과',
      source: '수업 흐름을 설명하기 위한 결과 상태이며 햄PD 발언이 아닙니다.',
      kicker: '끝은 결과와 다음 시작점',
      title: '상대가 열어 보고, 이해하고, 다음 행동을 할 수 있습니다.',
      body: '결과와 근거, 사람이 고친 곳, 남은 일을 함께 남겨 다음 날 같은 설명부터 반복하지 않습니다.',
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
})();
