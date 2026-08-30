/**
 * Shared star record board contract.
 * Required card fields: data-record-id, data-record-kind(sentence|scene),
 * data-record-target. Optional: data-record-index and data-record-tags.
 */
(function buildStarRecordBoards() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  document.querySelectorAll("[data-star-record-board]").forEach((board) => {
    const filters = Array.from(board.querySelectorAll(".star-record-filter[data-record-filter]"));
    const cards = Array.from(board.querySelectorAll(".star-record-card[data-record-kind]"));
    const count = board.querySelector("[data-record-count]");
    const announcement = board.querySelector("[data-record-announcement]");

    function updateCount(visibleCards, label) {
      if (count) count.textContent = `${String(visibleCards).padStart(2, "0")} / ${String(cards.length).padStart(2, "0")} records`;
      if (announcement) announcement.textContent = `${label} 기록 ${visibleCards}개를 보여줍니다.`;
    }

    function applyFilter(filter) {
      let visibleCards = 0;
      cards.forEach((card) => {
        const visible = filter === "all" || card.dataset.recordKind === filter;
        card.hidden = !visible;
        if (visible) visibleCards += 1;
      });

      filters.forEach((button) => {
        button.setAttribute("aria-pressed", String(button.dataset.recordFilter === filter));
      });

      const current = filters.find((button) => button.dataset.recordFilter === filter);
      updateCount(visibleCards, current?.textContent?.trim() || "전체");
    }

    function clickRouteButton(target) {
      const routeButton = document.querySelector(`.room-house-door[data-house-target="${target}"]`);
      if (!routeButton) return false;
      routeButton.click();
      return true;
    }

    function openRecord(card) {
      const kind = card.dataset.recordKind;
      const target = card.dataset.recordTarget;
      const panelTarget = kind === "sentence" ? "fountain-writing-room" : "fountain-photo-room";
      if (!target || !clickRouteButton(panelTarget)) return;

      window.setTimeout(() => {
        const selector = kind === "sentence"
          ? `.room-article-link[data-record-id="${target}"]`
          : `.room-house-photo[data-record-id="${target}"]`;
        const detailTrigger = document.querySelector(selector);
        if (!detailTrigger) return;
        detailTrigger.click();
        history.replaceState(null, "", `#record-${card.dataset.recordId || target}`);
      }, reduceMotion ? 0 : 180);
    }

    filters.forEach((button) => {
      button.addEventListener("click", () => applyFilter(button.dataset.recordFilter || "all"));
    });

    cards.forEach((card) => {
      card.addEventListener("click", () => openRecord(card));
    });

    if (!reduceMotion) {
      board.addEventListener("pointermove", (event) => {
        const bounds = board.getBoundingClientRect();
        const x = ((event.clientX - bounds.left) / bounds.width) * 100;
        const y = ((event.clientY - bounds.top) / bounds.height) * 100;
        board.style.setProperty("--record-mx", `${x.toFixed(1)}%`);
        board.style.setProperty("--record-my", `${y.toFixed(1)}%`);
      }, { passive: true });
    }

    applyFilter("all");
  });
})();
