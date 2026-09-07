(() => {
  const container = document.querySelector('[data-book-reviews]');
  const retry = document.querySelector('[data-reviews-retry]');
  if (!container) return;
  let generation = 0;
  async function load() {
    const current = ++generation;
    retry.hidden = true;
    const controller = new AbortController(); const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch('https://hammedia-payment.vercel.app/api/book/reviews', { cache: 'no-store', signal: controller.signal });
      const data = await response.json();
      if (!response.ok || !data.ok || !Array.isArray(data.reviews)) throw new Error('unavailable');
      if (current !== generation) return;
      container.replaceChildren();
      if (!data.reviews.length) {
        const empty = document.createElement('p'); empty.textContent = '독자들의 첫 이야기를 기다리고 있습니다.'; container.append(empty);
      }
      for (const review of data.reviews) {
        const quote = document.createElement('blockquote'); const text = document.createElement('p'); const label = document.createElement('cite');
        text.textContent = review.text; label.textContent = '책을 읽은 독자'; quote.append(text, label); container.append(quote);
      }
    } catch {
      if (current !== generation) return;
      container.textContent = '후기를 잠시 불러오지 못했습니다. 다시 눌러주세요.'; retry.hidden = false;
    } finally { clearTimeout(timeout); }
  }
  retry.addEventListener('click', load);
  document.addEventListener('visibilitychange', () => { if (!document.hidden) load(); });
  window.addEventListener('pageshow', event => { if (event.persisted) load(); });
  load();
})();
