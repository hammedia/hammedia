import { scenes } from './try-scenes.mjs?v=20261115';
const choices = [...document.querySelectorAll('[data-scene]')];
const panel = document.querySelector('#scene-demo');
const conversation = document.querySelector('#demo-conversation');
const next = document.querySelector('#demo-next');
const finish = document.querySelector('#demo-finish');
let selected = null;
let step = 0;
let finished = false;
const track = action => window.HAMPrivacy?.trackAcademy?.(action, selected);
function line(label, copy, kind) {
  const row = document.createElement('div'); row.className = `demo-line ${kind}`;
  const speaker = document.createElement('strong'); speaker.textContent = label;
  const content = document.createElement('p'); content.textContent = copy;
  row.append(speaker, content); return row;
}
function render() {
  const scene = scenes[selected];
  panel.hidden = false;
  document.querySelector('#demo-title').textContent = scene.title;
  document.querySelector('#demo-progress').textContent = ['1 / 3 · 첫 답을 읽어보세요', '2 / 3 · 내가 더 말한 상황', '3 / 3 · 바뀐 답과 이유'][step];
  conversation.replaceChildren(line('내 첫 말', scene.request, 'person'), line('AI의 첫 답 · 가상', scene.first, 'answer'));
  if (step >= 1) conversation.append(line('내가 한 문장 더', scene.addition, 'person added'));
  if (step === 2) conversation.append(line('바뀐 답 · 가상', scene.after, 'answer changed'));
  next.hidden = step === 2;
  next.textContent = step === 0 ? '내가 한 문장 더 말해보기' : '이 말을 더하면 답은?';
  finish.hidden = step !== 2;
  document.querySelector('#demo-reason').textContent = scene.reason;
  document.querySelector('#demo-lesson').href = `/academy/classroom/?scene=${selected}`;
}
choices.forEach(button => button.addEventListener('click', () => {
  selected = button.dataset.scene; step = 0; finished = false;
  choices.forEach(choice => choice.setAttribute('aria-pressed', String(choice === button)));
  render(); track('scene_select'); document.querySelector('#demo-title').focus({preventScroll:true});
  panel.scrollIntoView({block:'start',behavior:'instant'});
}));
next.addEventListener('click', () => {
  step = Math.min(2, step + 1); render();
  conversation.querySelector(step === 1 ? '.added' : '.changed')?.scrollIntoView({block:'start',behavior:'instant'});
  if (step === 2) {
    if (!finished) { track('scene_finish'); finished = true; }
    document.querySelector('#demo-lesson').focus({preventScroll:true});
  }
});
document.querySelector('#demo-restart').addEventListener('click', () => {
  step = 0; render(); next.focus({preventScroll:true});
  panel.scrollIntoView({block:'start',behavior:'instant'});
});
try {
  const saved = JSON.parse(localStorage.getItem('ham-academy-barunsaenghwal-seven-hour-v1'));
  if (saved?.artifactId && saved?.lessons) {
    const response = await fetch('classroom/data/course.json', {cache:'no-store'});
    if (response.ok && saved.courseVersion === (await response.json()).courseVersion) {
      document.querySelector('[data-learner-return]').hidden = false;
    }
  }
} catch { /* The experience works even when device storage is unavailable. */ }
