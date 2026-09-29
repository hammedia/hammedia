// Approved book price changes at 2026-10-01 00:00 Asia/Seoul.
// The payment server independently computes the amount from the signed order time.
(() => {
  const changeAt = Date.parse('2026-10-01T00:00:00+09:00');

  function refreshPrice() {
    if (Date.now() < changeAt) return;
    const assurance = document.querySelector('[data-book-price-assurance]');
    const current = document.querySelector('[data-book-current-price]');
    const schedule = document.querySelector('[data-book-price-schedule]');
    const purchase = document.querySelector('[data-book-purchase-price]');
    const purchaseSchedule = document.querySelector('[data-book-purchase-schedule]');
    const gift = document.querySelector('[data-book-gift-price]');
    if (assurance) assurance.textContent = '책 전체 14,900원';
    if (current) current.textContent = '14,900원';
    if (schedule) schedule.textContent = '2026년 10월 1일부터';
    if (purchase?.firstChild?.nodeType === Node.TEXT_NODE) purchase.firstChild.nodeValue = '14,900';
    if (purchaseSchedule) purchaseSchedule.textContent = '2026년 10월 1일부터';
    if (gift?.firstChild?.nodeType === Node.TEXT_NODE) gift.firstChild.nodeValue = '이 책 선물하기 · 14,900원 ';
  }

  refreshPrice();
  if (Date.now() < changeAt) window.setTimeout(refreshPrice, changeAt - Date.now());
  document.addEventListener('visibilitychange', refreshPrice);
  window.addEventListener('pageshow', refreshPrice);
})();
