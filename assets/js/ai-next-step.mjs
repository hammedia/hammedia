const el = (tag, value, className) => {
  const node = document.createElement(tag);
  if (value) node.textContent = value;
  if (className) node.className = className;
  return node;
};
const externalLink = (label, href) => {
  const node = el('a', label);
  node.href = href; node.target = '_blank'; node.rel = 'noopener noreferrer';
  return node;
};

export function aiStartingPoint() {
  const section = el('section', '', 'ai-start-point');
  section.setAttribute('aria-label', '처음 사용할 AI 고르기');
  section.append(el('h3', '쓰는 AI가 아직 없다면 하나만 고르세요'));
  section.append(el('p', '아래에서 AI를 새 탭으로 열고, 이 수업의 첫 문장을 내 이야기로 보내세요. 이미 쓰는 AI가 있으면 그대로 쓰면 됩니다.'));
  const links = el('div', '', 'ai-direct-links');
  links.append(externalLink('ChatGPT 열기', 'https://chatgpt.com/'), externalLink('Claude 열기', 'https://claude.ai/'), externalLink('Gemini 열기', 'https://gemini.google.com/'));
  section.append(links);
  section.append(el('p', '로그인·이용 한도·기능은 계정과 기기에 따라 다릅니다. 막히면 이미 쓸 수 있는 다른 AI로 같은 문장을 보내거나, 준비한 문장을 아래 메모에 남기고 나중에 이어가세요. 가입·결제가 오늘 수업의 조건은 아닙니다.'));
  section.append(el('p', 'AI에서 실제 답을 받은 뒤 이 탭으로 돌아오세요. 준비만 했다면 대화 완료로 표시하지 않습니다.', 'ai-small-note'));
  return section;
}

const updates = [
  { name: 'ChatGPT · 편집하고 미리보기', action: '내 안내문을 대화 안에서 편집할 수 있는 초안으로 만들어 달라고 하세요. 웹 화면이라면 미리보기를 요청하고, Preview가 보일 때 직접 열어 보세요.', condition: '편집·미리보기 버튼은 블록 종류, 계정·기기·플랜·설정에 따라 다릅니다.', source: 'https://help.openai.com/en/articles/20001246-working-with-writing-blocks-and-code-blocks-in-chatgpt' },
  { name: 'Claude · 아티팩트로 한 장 만들기', action: '내 원본으로 문서나 화면 아티팩트를 만들어 달라고 하세요. 열린 결과에서 한 부분을 고치고, 원본 사실이 유지됐는지 확인하세요.', condition: '아티팩트에는 파일 생성·편집 설정이 필요합니다. Docs·Slides·Design과 그 밖의 유료·베타 템플릿은 이용 범위가 다릅니다.', source: 'https://support.claude.com/en/articles/17153992-what-are-artifacts-and-how-do-i-use-them' },
  { name: 'Gemini · Canvas에서 직접 고치기', action: 'Canvas를 선택해 내 문서나 앱을 만들어 보세요. 고칠 문장·화면 부분을 선택하고 그 부분만 바꿔 달라고 하세요.', condition: 'Gemini 로그인이 필요합니다. 처음부터 모든 기능을 쓸 필요 없이 문서 한 장으로 시작하세요.', source: 'https://support.google.com/gemini/answer/16047321?hl=ko' }
];

export function aiUpdates({ classroom = false } = {}) {
  const section = el('section', '', 'ai-updates');
  section.setAttribute('aria-label', '요즘 AI로 바로 해볼 일');
  section.append(el('p', '공식 안내 확인 · 2026.11.15', 'ai-small-note'));
  section.append(el('h2', '요즘 AI로 바로 해볼 일'));
  section.append(el('p', '글만 받아 끝내지 말고, 내가 편집하고 눌러볼 결과를 요청해 보세요. 지금 쓰는 AI 하나로 시작하면 됩니다.'));
  const cards = el('div', '', 'ai-update-cards');
  updates.forEach((item) => {
    const details = el('details');
    details.append(el('summary', item.name), el('p', item.action), el('p', item.condition, 'ai-small-note'), externalLink('공식 사용 안내', item.source));
    cards.append(details);
  });
  section.append(cards);
  const next = el('a', classroom ? '원본과 원하는 화면을 준비해 아래에서 시작하기' : '5강에서 내 화면 만들기');
  next.href = classroom ? '#lesson-stage' : '/academy/classroom/?lesson=5';
  if (!classroom) section.append(next);
  section.append(el('p', '미리보기를 열었다고 공개·전송되거나 모든 기능이 작동하는 것은 아닙니다. 내가 할 행동 하나를 직접 해 본 뒤 결과를 확인하세요.', 'ai-small-note'));
  return section;
}

document.querySelectorAll('[data-ai-updates]').forEach((node) => node.append(aiUpdates()));
