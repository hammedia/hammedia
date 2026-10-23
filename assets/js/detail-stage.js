(() => {
  'use strict';

  const PHOTO = 'detail-power-dellacasa-01-sign-clock.jpeg';
  const PARTS = [
    { key: 'text', x: .04, y: .62, w: .51, h: .09, pair: 'detail-power-dellacasa-03-card.jpeg' },
    { key: 'clock', x: .05, y: .13, w: .22, h: .20, pair: null },
    { key: 'light', x: .60, y: .02, w: .085, h: .96, pair: 'detail-power-dellacasa-02-exterior.jpeg', assemblyWindow: { x: .52, w: .20, centerY: .42 } },
    { key: 'wall', x: .72, y: .14, w: .19, h: .44, pair: PHOTO, pairCrop: true, assemblyWindow: { x: .72, w: .20, centerY: .36 } }
  ];
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function photoUrl(base, file) {
    return new URL(`${base}${file}`, document.baseURI).href;
  }

  function crop(el, part, base) {
    el.style.backgroundImage = `url("${photoUrl(base, PHOTO)}")`;
    el.style.backgroundSize = `${100 / part.w}% ${100 / part.h}%`;
    const px = part.w === 1 ? 0 : part.x / (1 - part.w) * 100;
    const py = part.h === 1 ? 0 : part.y / (1 - part.h) * 100;
    el.style.backgroundPosition = `${px}% ${py}%`;
  }

  function metadata(host, key) {
    const selector = `[data-part-copy="${key}"]`;
    return host.querySelector(selector);
  }

  function setupScrollScene(scene) {
    const frame = scene.querySelector('.detail-photo-frame');
    const photo = frame && frame.querySelector('img');
    const stage = scene.querySelector('.detail-stage');
    const card = scene.querySelector('.detail-story-card');
    const base = scene.dataset.photoBase || 'assets/images/spaces/';
    if (!frame || !photo || !stage || !card) return;

    const layers = PARTS.map(part => {
      const copy = metadata(scene, part.key);
      if (!copy) return null;
      const el = document.createElement('div');
      el.className = 'detail-part';
      el.setAttribute('aria-hidden', 'true');
      el.innerHTML = `<span>${copy.dataset.name || ''}</span>`;
      crop(el, part, base);
      stage.append(el);
      return el;
    });
    scene.dataset.enhanced = 'true';

    let active = false;
    let raf = 0;
    let last = -1;
    const smooth = (a, b, t) => {
      const v = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return v * v * (3 - 2 * v);
    };

    function render(progress) {
      if (Math.abs(progress - last) < .001) return;
      last = progress;
      const rect = frame.getBoundingClientRect();
      const parent = stage.getBoundingClientRect();
      const baseSize = Math.min(rect.width, rect.height);
      const left = rect.left - parent.left + (rect.width - baseSize) / 2;
      const top = rect.top - parent.top + (rect.height - baseSize) / 2;
      const arrange = smooth(.48, .88, progress);
      const lift = smooth(.1, .48, progress);
      photo.style.opacity = String(1 - .93 * arrange);
      photo.style.transform = `rotateY(${-8 * lift}deg) scale(${1 - .12 * lift})`;
      card.style.opacity = String(arrange);
      card.style.transform = `translateY(${20 * (1 - arrange)}px)`;

      PARTS.forEach((part, index) => {
        const el = layers[index];
        if (!el) return;
        const localLift = smooth(.12 + index * .055, .36 + index * .055, progress);
        const startX = left + part.x * baseSize;
        const startY = top + part.y * baseSize;
        const startW = part.w * baseSize;
        const startH = part.h * baseSize;
        const cardWidth = card.clientWidth;
        const cardHeight = card.clientHeight;
        const gap = 12;
        const rowGap = 32;
        const pad = parent.width < 600 ? 12 : 18;
        const targetW = (cardWidth - pad * 2 - gap) / 2;
        const heading = card.querySelector('h3');
        const titleBottom = heading ? heading.offsetTop + heading.offsetHeight : 92;
        const firstRowTop = card.offsetTop + titleBottom + 16;
        const lastRowBottom = card.offsetTop + cardHeight - pad;
        const targetH = Math.max(50, (lastRowBottom - firstRowTop - rowGap) / 2);
        const endX = card.offsetLeft + pad + (index % 2) * (targetW + gap);
        const endY = firstRowTop + Math.floor(index / 2) * (targetH + rowGap);
        const nowW = startW + (targetW - startW) * arrange;
        const nowH = startH + (targetH - startH) * arrange;
        el.style.left = `${startX + (endX - startX) * arrange}px`;
        el.style.top = `${startY + (endY - startY) * arrange}px`;
        el.style.width = `${nowW}px`;
        el.style.height = `${nowH}px`;

        const initialCenterX = part.x + part.w / 2;
        const initialCenterY = part.y + part.h / 2;
        const window = part.assemblyWindow;
        const finalCenterX = window ? window.x + window.w / 2 : initialCenterX;
        const centerX = initialCenterX + (finalCenterX - initialCenterX) * arrange;
        const centerY = initialCenterY + ((window ? window.centerY : initialCenterY) - initialCenterY) * arrange;
        let winW = part.w + ((window ? window.w : Math.max(.42, part.w)) - part.w) * arrange;
        let winH = winW * nowH / Math.max(1, nowW);
        if (winH > 1) {
          winH = 1;
          winW = nowW / Math.max(1, nowH);
        }
        crop(el, {
          x: Math.max(0, Math.min(1 - winW, centerX - winW / 2)),
          y: Math.max(0, Math.min(1 - winH, centerY - winH / 2)),
          w: winW,
          h: winH
        }, base);
        el.style.opacity = String(localLift);
        el.style.transform = `translateZ(${100 * localLift * (1 - arrange)}px) rotateY(${-5 * localLift * (1 - arrange)}deg) scale(${1 + .04 * localLift * (1 - arrange)})`;
      });
      scene.dataset.progress = progress.toFixed(2);
    }

    function stop() {
      active = false;
      cancelAnimationFrame(raf);
    }
    function tick() {
      if (!active || motion.matches) return;
      const bounds = scene.getBoundingClientRect();
      const travel = bounds.height - innerHeight;
      render(Math.max(0, Math.min(1, -bounds.top / Math.max(1, travel))));
      raf = requestAnimationFrame(tick);
    }
    function start() {
      active = true;
      cancelAnimationFrame(raf);
      tick();
    }
    function resize() {
      last = -1;
      if (motion.matches) render(1);
    }

    if (motion.matches) {
      render(1);
    } else if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting) start();
        else stop();
      }, { rootMargin: '120px' });
      observer.observe(scene);
    } else {
      render(1);
    }
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
    motion.addEventListener?.('change', () => {
      last = -1;
      if (motion.matches) {
        stop();
        render(1);
      } else if (active) start();
    });
  }

  function setupTapScene(host) {
    const stage = host.querySelector('.detail-stage');
    const cropBox = host.querySelector('.detail-tap-crop');
    const pair = host.querySelector('.detail-pair');
    const title = host.querySelector('[data-detail-title]');
    const quote = host.querySelector('[data-detail-quote]');
    const source = host.querySelector('[data-detail-source]');
    const buttons = [...host.querySelectorAll('[data-part]')];
    const base = host.dataset.photoBase || '../assets/images/spaces/';
    if (!stage || !cropBox || !pair || !title || !quote || !source || !buttons.length) return;

    const parts = Object.fromEntries(PARTS.map(part => [part.key, part]));
    const copies = Object.fromEntries(buttons.map(button => [button.dataset.part, button]));
    const sourcePhoto = photoUrl(base, PHOTO);
    stage.querySelector('.detail-photo-frame img')?.setAttribute('src', sourcePhoto);
    stage.querySelectorAll('.detail-hotspot').forEach(button => {
      button.setAttribute('aria-label', button.dataset.name || button.textContent.trim());
    });
    host.dataset.enhanced = 'true';

    function choose(key) {
      const part = parts[key];
      const copy = copies[key];
      if (!part || !copy) return;
      host.dataset.open = 'true';
      host.dataset.selected = key;
      crop(cropBox, part, base);
      const fit = Math.min((stage.clientWidth * .38) / part.w, (stage.clientHeight * (part.pair ? .33 : .48)) / part.h);
      cropBox.style.width = `${part.w * fit}px`;
      cropBox.style.height = `${part.h * fit}px`;
      cropBox.setAttribute('aria-label', copy.dataset.detailAlt || copy.dataset.name || copy.textContent.trim());
      cropBox.classList.toggle('is-clock', key === 'clock');

      if (part.pair) {
        pair.style.backgroundImage = `url("${photoUrl(base, part.pair)}")`;
        pair.style.backgroundPosition = 'center center';
        pair.style.backgroundSize = 'contain';
        pair.style.width = '';
        pair.style.height = '';
        pair.style.padding = '';
        pair.setAttribute('aria-label', copy.dataset.pairAlt || '');
        pair.removeAttribute('aria-hidden');
        pair.classList.add('is-open');
        if (part.pairCrop) {
          const cropHeight = stage.clientHeight * .48;
          const cropWidth = cropHeight * part.w / part.h;
          pair.style.width = `${cropWidth}px`;
          pair.style.height = `${cropHeight}px`;
          pair.style.padding = '0';
          crop(pair, part, base);
        }
      } else {
        pair.classList.remove('is-open');
        pair.style.backgroundImage = '';
        pair.removeAttribute('aria-label');
        pair.setAttribute('aria-hidden', 'true');
      }
      title.textContent = copy.dataset.name || copy.textContent.trim();
      quote.textContent = copy.dataset.quote || '';
      source.textContent = copy.dataset.source || '';
      buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.part === key)));
      if (stage.getBoundingClientRect().top < 72) {
        stage.scrollIntoView({ block: 'start', behavior: motion.matches ? 'auto' : 'smooth' });
      }
    }

    function reset() {
      host.dataset.open = 'false';
      delete host.dataset.selected;
      pair.classList.remove('is-open');
      pair.style.backgroundImage = '';
      pair.style.backgroundPosition = '';
      pair.style.backgroundSize = '';
      pair.style.width = '';
      pair.style.height = '';
      pair.style.padding = '';
      pair.removeAttribute('aria-label');
      pair.setAttribute('aria-hidden', 'true');
      cropBox.style.backgroundImage = '';
      title.textContent = host.dataset.resetTitle || '';
      quote.textContent = host.dataset.resetQuote || '';
      source.textContent = host.dataset.resetSource || '';
      buttons.forEach(button => button.setAttribute('aria-pressed', 'false'));
    }

    buttons.forEach(button => button.addEventListener('click', () => choose(button.dataset.part)));
    host.querySelector('[data-detail-reset]')?.addEventListener('click', reset);
    host.addEventListener('keydown', event => {
      if (event.key === 'Escape' && host.dataset.open === 'true') reset();
    });
  }

  document.querySelectorAll('[data-scroll-scene]').forEach(setupScrollScene);
  document.querySelectorAll('[data-tap-scene]').forEach(setupTapScene);
})();
