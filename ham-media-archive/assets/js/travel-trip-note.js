const root = document.querySelector("[data-trip-note-experience]");

if (root) {
  const article = root.closest(".room-article-panel");
  const cards = Array.from(root.querySelectorAll("[data-trip-card]"));
  const progress = root.querySelector("[data-trip-progress]");
  const playButton = root.querySelector("[data-trip-play]");
  const pauseButton = root.querySelector("[data-trip-pause]");
  const replayButton = root.querySelector("[data-trip-replay]");
  const status = root.querySelector("[data-trip-status]");
  const saveButton = root.querySelector("[data-trip-save]");
  const saveStatus = root.querySelector("[data-trip-save-status]");
  const canvas = root.querySelector("[data-trip-canvas]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 12000;
  let elapsed = 0;
  let lastFrame = null;
  let frameRequest = 0;
  let inView = false;
  let everStarted = false;
  let running = false;

  function showStep(index) {
    cards.forEach((card, cardIndex) => {
      card.classList.toggle("is-active", cardIndex === index);
      if (cardIndex === index) card.setAttribute("aria-current", "step");
      else card.removeAttribute("aria-current");
    });
    if (progress) progress.style.width = `${Math.min(100, (index / Math.max(1, cards.length - 1)) * 100)}%`;
  }

  function canRun() {
    return !reducedMotion.matches && inView && !document.hidden && article && !article.hidden;
  }

  function stopFrame() {
    if (frameRequest) cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    lastFrame = null;
  }

  function finish() {
    running = false;
    elapsed = duration;
    stopFrame();
    showStep(cards.length - 1);
    if (pauseButton) pauseButton.disabled = true;
    if (playButton) playButton.disabled = true;
    if (status) status.textContent = "세 장의 기록을 모두 펼쳤습니다. 아래에 나의 다음 여행을 적어 보세요.";
  }

  function tick(now) {
    frameRequest = 0;
    if (!running || !canRun()) {
      if (running && !canRun()) {
        running = false;
        if (pauseButton) pauseButton.disabled = true;
        if (status) status.textContent = "화면을 벗어나 모션이 멈췄습니다. 원하면 다시 펼쳐 보세요.";
      }
      stopFrame();
      return;
    }
    if (lastFrame !== null) elapsed += Math.min(64, now - lastFrame);
    lastFrame = now;
    const step = Math.min(cards.length - 1, Math.floor((elapsed / duration) * cards.length));
    showStep(step);
    if (status) status.textContent = [
      "춘천의 사진과 짧은 메모를 펼칩니다.",
      "동해의 더운 날, 계획을 바꾸자는 메모를 봅니다.",
      "부산의 사진에는 다시 가자는 말이 남았습니다."
    ][step];
    if (elapsed >= duration) finish();
    else frameRequest = requestAnimationFrame(tick);
  }

  function play(fromStart = false) {
    if (reducedMotion.matches) {
      if (status) status.textContent = "모션을 줄이는 설정입니다. 세 장의 사진과 기록은 모두 정적으로 펼쳐져 있습니다.";
      return;
    }
    if (fromStart || elapsed >= duration) elapsed = 0;
    if (!canRun()) {
      if (status) status.textContent = "기록이 화면에 들어오면 펼쳐집니다.";
      return;
    }
    running = true;
    everStarted = true;
    if (playButton) playButton.disabled = true;
    if (pauseButton) pauseButton.disabled = false;
    if (status) status.textContent = "춘천의 사진과 짧은 메모를 펼칩니다.";
    stopFrame();
    frameRequest = requestAnimationFrame(tick);
  }

  function pause(message = "기록을 잠시 멈췄습니다.") {
    if (!running) return;
    running = false;
    stopFrame();
    if (playButton) playButton.disabled = false;
    if (pauseButton) pauseButton.disabled = true;
    if (status) status.textContent = message;
  }

  playButton?.addEventListener("click", () => play());
  pauseButton?.addEventListener("click", () => pause());
  replayButton?.addEventListener("click", () => {
    showStep(0);
    elapsed = 0;
    if (playButton) playButton.disabled = false;
    if (pauseButton) pauseButton.disabled = true;
    if (status) status.textContent = "처음 사진부터 다시 펼칩니다.";
    play();
  });

  if (reducedMotion.matches) {
    if (playButton) playButton.disabled = true;
    if (pauseButton) pauseButton.disabled = true;
    if (replayButton) replayButton.disabled = true;
    if (status) status.textContent = "모션을 줄이는 설정입니다. 세 장의 사진과 기록을 정적으로 보여줍니다.";
  } else {
    const observer = new IntersectionObserver((entries) => {
      const entry = entries[0];
      inView = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.12);
      if (inView && !everStarted) play(true);
      else if (!inView && running) pause("기록을 벗어나 모션을 멈췄습니다.");
    }, { threshold: [0, 0.12, 0.35] });
    observer.observe(root);
    const articleObserver = new MutationObserver(() => {
      if (article?.hidden) pause("문장을 접으며 기록 모션도 멈췄습니다.");
    });
    if (article) articleObserver.observe(article, { attributes: true, attributeFilter: ["hidden"] });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) pause("다른 화면으로 이동해 모션을 멈췄습니다.");
      else if (running && canRun()) frameRequest = requestAnimationFrame(tick);
    });
  }

  function wrapText(context, value, maxWidth) {
    const lines = [];
    const paragraphs = String(value || "").split(/\n/);
    for (const paragraph of paragraphs) {
      if (!paragraph) { lines.push(""); continue; }
      let line = "";
      for (const character of Array.from(paragraph)) {
        const next = line + character;
        if (line && context.measureText(next).width > maxWidth) {
          lines.push(line);
          line = character;
        } else line = next;
      }
      lines.push(line);
    }
    return lines;
  }

  function fitMemoText(context, value, maxWidth, maxHeight) {
    const original = String(value || "").trim();
    if (!original) return { lines: [], fontSize: 31, lineHeight: 41 };

    const layout = (text) => {
      for (let fontSize = 31; fontSize >= 16; fontSize -= 1) {
        const lineHeight = Math.round(fontSize * 1.32);
        context.font = `500 ${fontSize}px Pretendard, -apple-system, sans-serif`;
        const lines = wrapText(context, text, maxWidth);
        if (lines.length * lineHeight <= maxHeight) return { lines, fontSize, lineHeight };
      }
      return null;
    };

    return layout(original) || layout(original.replace(/\s*\n+\s*/g, " ").trim()) || {
      lines: wrapText(context, original.replace(/\s*\n+\s*/g, " ").trim(), maxWidth),
      fontSize: 16,
      lineHeight: 21
    };
  }

  function drawMemo() {
    const context = canvas?.getContext("2d");
    if (!context) return false;
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#f5f0e5";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = "#cbbca5";
    context.lineWidth = 3;
    context.strokeRect(34, 34, width - 68, height - 68);
    context.fillStyle = "#a96c35";
    context.font = "800 25px Pretendard, -apple-system, sans-serif";
    context.fillText("HAM MEDIA  /  여행별", 82, 118);
    context.fillStyle = "#17363a";
    context.font = "800 66px Pretendard, -apple-system, sans-serif";
    context.fillText("다음 여행 메모", 82, 230);
    context.fillStyle = "#68746e";
    context.font = "400 28px Pretendard, -apple-system, sans-serif";
    context.fillText("내가 적은 세 줄 · 빈칸을 남겨도 괜찮습니다.", 84, 292);
    const fields = [
      ["가장 보고 싶은 장면", root.querySelector("#trip-note-scene")?.value],
      ["함께할 사람", root.querySelector("#trip-note-companion")?.value],
      ["비워 둘 시간", root.querySelector("#trip-note-time")?.value]
    ];
    const starts = [410, 690, 970];
    for (const [index, [label, value]] of fields.entries()) {
      const top = starts[index];
      context.fillStyle = "#a96c35";
      context.font = "800 29px Pretendard, -apple-system, sans-serif";
      context.fillText(label, 84, top);
      context.strokeStyle = "#d6c8b2";
      context.lineWidth = 2;
      context.beginPath();
      context.moveTo(84, top + 26);
      context.lineTo(width - 84, top + 26);
      context.stroke();
      context.fillStyle = value?.trim() ? "#263b39" : "#a7a99f";
      const fit = fitMemoText(context, value, width - 168, index < 2 ? 180 : 378);
      context.font = `500 ${fit.fontSize}px Pretendard, -apple-system, sans-serif`;
      if (fit.lines.length) fit.lines.forEach((line, lineIndex) => context.fillText(line, 84, top + 82 + lineIndex * fit.lineHeight));
      else {
        context.beginPath();
        context.moveTo(84, top + 78);
        context.lineTo(width - 84, top + 78);
        context.stroke();
      }
    }
    context.fillStyle = "#a96c35";
    context.font = "500 18px Pretendard, -apple-system, sans-serif";
    context.fillText("https://hammedia.co.kr/ham-media-archive/pages/travel.html", 84, 1466);
    return true;
  }

  saveButton?.addEventListener("click", () => {
    if (!drawMemo()) {
      if (saveStatus) saveStatus.textContent = "PNG를 만들 수 없습니다. 브라우저의 Canvas 지원을 확인해 주세요.";
      return;
    }
    canvas.toBlob((blob) => {
      if (!blob) {
        if (saveStatus) saveStatus.textContent = "PNG를 만들지 못했습니다. 잠시 뒤 다시 눌러 주세요.";
        return;
      }
      const objectUrl = URL.createObjectURL(blob);
      const download = document.createElement("a");
      download.href = objectUrl;
      download.download = "hammedia-next-trip-note.png";
      download.hidden = true;
      document.body.append(download);
      download.click();
      download.remove();
      window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
      if (saveStatus) saveStatus.textContent = "여행 메모 PNG를 저장했습니다.";
    }, "image/png");
  });
}
