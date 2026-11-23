const localized = {
  en: {
    title: 'Della Casa', home: 'Back to home', lead: 'The first Madang story is just beyond the yellow door.',
    open: 'Open the door', welcome: 'Make yourself at home', inside: 'The story begins in Madang.',
    episode: 'Madang · Episode 1', play: 'Watch the story', room: 'Explore the 3D space',
    homePath: '/index_en.html',
  },
  ja: {
    title: 'デルラカーサ', home: 'ホームに戻る', lead: '黄色い扉の向こうに、マダンの最初の物語が待っています。',
    open: '扉を開ける', welcome: 'ごゆっくりどうぞ', inside: 'マダンから物語が始まります。',
    episode: 'マダン 第1話', play: '作品を見る', room: '3D空間を見て回る',
    homePath: '/index_jp.html',
  },
};

const language = new URLSearchParams(location.search).get('lang');
if (language === 'en' || language === 'ja') {
  const labels = localized[language];
  document.documentElement.lang = language;
  document.title = labels.title + ' · HAM MEDIA';
  document.querySelectorAll('[data-copy]').forEach(node => {
    node.textContent = labels[node.dataset.copy];
  });
  document.querySelectorAll('.house-header a').forEach(link => {
    link.href = labels.homePath;
  });
}

const house = document.querySelector('.house');
const arrival = document.querySelector('.arrival');
const button = document.querySelector('.door-button');
const motion = document.querySelector('.door-motion');
const inside = document.querySelector('.inside');
const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
let fallbackTimer;

function reveal() {
  clearTimeout(fallbackTimer);
  motion.pause();
  house.dataset.state = 'open';
  button.setAttribute('aria-expanded', 'true');
  button.removeAttribute('aria-busy');
  inside.hidden = false;
  arrival.hidden = true;
  document.querySelector('#inside-title').focus({preventScroll:true});
  window.scrollTo(0,0);
}

button.addEventListener('click', () => {
  if (house.dataset.state !== 'closed') return;
  if (motionPreference.matches) {
    reveal();
    return;
  }

  house.dataset.state = 'loading';
  button.setAttribute('aria-busy', 'true');
  fallbackTimer = setTimeout(reveal, 2400);
  motion.play().catch(reveal);
});

motion.addEventListener('playing', () => {
  if (house.dataset.state === 'loading') house.dataset.state = 'moving';
});
motion.addEventListener('ended', reveal);
motion.addEventListener('error', () => {
  if (['loading','moving'].includes(house.dataset.state)) reveal();
});
motionPreference.addEventListener('change', event => {
  if (event.matches && ['loading','moving'].includes(house.dataset.state)) reveal();
});

button.hidden = false;
