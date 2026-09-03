(() => {
  const steps = [
    {
      speaker: '햄PD 작업 방식 · 기록 재구성',
      quote: '목적과 원본을 자기 말로 설명합니다',
      source: '홈페이지·포트폴리오·앱 작업 기록에서 반복 확인한 방식입니다. 햄PD의 실제 대화 원문은 아닙니다.',
      kicker: '기능 설명보다 하려는 일과 원본',
      title: '“누가, 어디서, 왜 멈췄는지”를 먼저 말합니다.',
      body: '햄PD는 코딩 문법을 외우지 않고 경험·사진·글·기존 파일을 AI 동료에게 건넨습니다.',
      action: '첫 결과 보기'
    },
    {
      speaker: 'AI의 첫 결과 · 기록 재구성',
      quote: '그럴듯하지만 햄PD가 말하지 않은 내용이 섞입니다',
      source: '실제 작업에서 반복된 실패 유형을 재구성했습니다. 특정 한 대화의 원문은 아닙니다.',
      kicker: '첫 결과를 지우지 않고 비교본으로 남깁니다',
      title: '처음 나온 결과를 숨기지 않고 함께 봅니다.',
      body: '그럴듯한 말, 빠진 증거, 반복되는 버튼처럼 실제 사용을 막는 지점을 눈으로 찾습니다.',
      action: '사람이 고치기'
    },
    {
      speaker: '햄PD의 교정 · 기록 재구성',
      quote: '처음 요청·실제 사실·쓸 사람을 기준으로 다시 고칩니다',
      source: '햄PD가 AI 결과의 부풀림·빠짐·잘못된 방향을 되돌린 작업 기록을 요약했습니다.',
      kicker: '현장 경험과 사용할 사람이 수정 기준입니다',
      title: '더 멋있는 말보다 사실인지, 상대가 쓸 수 있는지를 보고 다시 만듭니다.',
      body: '햄PD가 기준과 고칠 이유를 말하면 AI 동료가 같은 결과를 다시 만듭니다. 햄PD는 실제 화면을 열어 확인합니다.',
      action: '실제 결과 보기'
    },
    {
      speaker: '실제 결과 · 공개 화면',
      quote: '홈페이지·포트폴리오·앱을 직접 열어 결과를 확인합니다',
      source: '아래 결과 여섯 개의 공개 화면과 회사 작업 기록을 근거로 했습니다.',
      kicker: '화면이 보인다고 끝이 아닙니다',
      title: '처음 보는 사람이 무엇인지 알고 다음 행동을 하는지 봅니다.',
      body: '사람이 멈춘 곳과 틀리게 이해한 말을 기록해 다시 고치고, 결과·확인 증거·다음 행동을 함께 남깁니다.',
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
