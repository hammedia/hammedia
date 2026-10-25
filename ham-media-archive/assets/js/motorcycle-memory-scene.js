const root = document.getElementById("motorcycle-memory-scene");

if (root) {
  const art = root.querySelector("[data-memory-art]");
  const photoStack = root.querySelector("[data-memory-photo-stack]");
  const photos = Array.from(root.querySelectorAll("[data-memory-photo]"));
  const line = root.querySelector("[data-memory-line-path]");
  const point = root.querySelector("[data-memory-point]");
  const description = root.querySelector("[data-memory-description]");
  const captionKicker = root.querySelector("[data-memory-caption-kicker]");
  const captionTitle = root.querySelector("[data-memory-caption-title]");
  const photoTag = root.querySelector("[data-memory-photo-tag]");
  const status = root.querySelector("[data-memory-status]");
  const choiceButtons = Array.from(root.querySelectorAll("[data-memory-choice]"));
  const playButton = root.querySelector("[data-memory-play]");
  const pauseButton = root.querySelector("[data-memory-pause]");
  const replayButton = root.querySelector("[data-memory-replay]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const duration = 12000;
  const thenDuration = 4000;
  const photoMoments = [
    {
      key: "road",
      at: 4000,
      end: 6700,
      tag: "그 뒤 · 산길",
      kicker: "그 뒤",
      title: "굽은 산길에 남긴 바이크 사진.",
      description: "자전거로 넘었던 고갯길의 기억 뒤로, 바이크를 타던 시간이 이어집니다."
    },
    {
      key: "sea",
      at: 6700,
      end: 9400,
      tag: "그 뒤 · 동해",
      kicker: "그 뒤",
      title: "동해 바닷가에 세워 둔 붉은 바이크.",
      description: "사진 메모에는 ‘동해 바다.’라고 적혀 있습니다. 고갯길 이야기와 나란히 남은, 바이크와 바다의 사진입니다."
    },
    {
      key: "still",
      at: 9400,
      end: duration,
      tag: "마지막 장면 · 카페 앞",
      kicker: "그 뒤 · 멈춘 순간",
      title: "카페 유리 앞에 세운 바이크.",
      description: "헬멧과 장갑을 두고 잠시 멈춘 장면입니다."
    }
  ];
  let elapsed = 0;
  let startedAt = 0;
  let playing = false;
  let visible = false;
  let frame = 0;
  let staticChoice = "then";
  let lastMoment = "";

  const setStatus = (message) => {
    if (status) status.textContent = message;
  };

  const cancelFrame = () => {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
  };

  const setLineProgress = (time, complete = false) => {
    if (!line) return;
    const fraction = complete ? 1 : Math.max(0, Math.min(1, time / thenDuration));
    line.style.strokeDashoffset = String(1000 * (1 - fraction));
    if (point) {
      try {
        const current = line.getPointAtLength(line.getTotalLength() * fraction);
        point.setAttribute("cx", current.x.toFixed(2));
        point.setAttribute("cy", current.y.toFixed(2));
      } catch {
        // The static SVG remains legible if path measurement is unavailable.
      }
    }
  };

  const syncChoiceButtons = (moment) => {
    choiceButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.memoryChoice === moment));
    });
  };

  const setPhoto = (moment) => {
    const item = photoMoments.find((entry) => entry.key === moment) || photoMoments[0];
    const changed = lastMoment !== item.key;
    if (changed) photoStack?.classList.add("is-changing");
    photos.forEach((photo) => {
      const shouldHide = photo.dataset.memoryPhoto !== item.key;
      if (photo.hidden !== shouldHide) photo.hidden = shouldHide;
    });
    if (changed && photoStack) requestAnimationFrame(() => photoStack.classList.remove("is-changing"));
    if (lastMoment !== item.key) {
      lastMoment = item.key;
      if (photoTag) photoTag.textContent = item.tag;
      if (captionKicker) captionKicker.textContent = item.kicker;
      if (captionTitle) captionTitle.textContent = item.title;
      if (description) description.textContent = item.description;
      syncChoiceButtons("after");
      if (playing) setStatus(`${item.tag}: ${item.title}`);
    }
  };

  const showThen = (time, complete = false) => {
    if (art?.hidden) art.hidden = false;
    if (photoStack && !photoStack.hidden) photoStack.hidden = true;
    setLineProgress(time, complete);
    if (lastMoment !== "then") {
      lastMoment = "then";
      if (captionKicker) captionKicker.textContent = "그때";
      if (captionTitle) captionTitle.textContent = "꼭 나도 바이크로 미시령을 오르기로 했다.";
      if (description) description.textContent = "원문에는 ‘그렇게 추월하던 바이크를 보며, 꼭 나도 바이크로 미시령을 오르기로 했다’고 적혀 있습니다. 그 결심을 선 하나로 그렸습니다.";
      syncChoiceButtons("then");
      if (playing) setStatus("그때: 자전거로 고갯길을 넘으며 마음먹었던 순간.");
    }
  };

  const render = (time, choice = null) => {
    if (choice === "then" || (!choice && time < thenDuration)) {
      showThen(time, choice === "then");
      return;
    }
    const moment = photoMoments.find((entry) => time < entry.end) || photoMoments[photoMoments.length - 1];
    if (art && !art.hidden) art.hidden = true;
    if (photoStack?.hidden) photoStack.hidden = false;
    setPhoto(moment.key);
  };

  const syncControls = () => {
    const motionOff = reduceMotion.matches;
    if (playButton) {
      playButton.disabled = playing || motionOff;
      playButton.textContent = motionOff ? "시점 선택으로 보기" : playing ? "재생 중" : "12초로 보기";
    }
    if (pauseButton) pauseButton.disabled = !playing;
    if (replayButton) replayButton.disabled = motionOff;
    choiceButtons.forEach((button) => { button.disabled = false; });
    root.classList.toggle("is-playing", playing);
    root.classList.toggle("is-paused", !playing);
  };

  const pause = (message = "장면을 멈췄습니다. 다시 보거나 시점을 직접 고를 수 있습니다.") => {
    if (!playing) return;
    playing = false;
    cancelFrame();
    staticChoice = null;
    setStatus(message);
    syncControls();
  };

  const finish = () => {
    playing = false;
    elapsed = duration;
    staticChoice = null;
    render(duration);
    cancelFrame();
    setStatus("12초 장면을 마쳤습니다. 그때의 결심에서 그 뒤에 남은 사진으로 이어졌습니다.");
    syncControls();
  };

  const tick = (now) => {
    if (!playing || !visible || document.visibilityState !== "visible") {
      frame = 0;
      return;
    }
    elapsed = Math.min(duration, Math.max(0, now - startedAt));
    render(elapsed);
    if (elapsed >= duration) {
      finish();
      return;
    }
    frame = requestAnimationFrame(tick);
  };

  const play = () => {
    if (playing || reduceMotion.matches) return;
    elapsed = 0;
    staticChoice = null;
    startedAt = performance.now();
    playing = true;
    lastMoment = "";
    render(0);
    setStatus("그때의 선에서 시작해, 기록에 남은 바이크 사진 세 장으로 이어집니다.");
    syncControls();
    if (visible && document.visibilityState === "visible") frame = requestAnimationFrame(tick);
  };

  const choose = (moment) => {
    if (playing) pause("시점을 바꿔 장면을 멈췄습니다.");
    if (moment === "then") {
      elapsed = 0;
      staticChoice = "then";
      lastMoment = "";
      render(0, "then");
      setStatus("그때를 보고 있습니다. 선은 기억을 그린 그림이며 실제 경로가 아닙니다.");
    } else {
      elapsed = thenDuration;
      staticChoice = "after";
      lastMoment = "";
      render(thenDuration, "after");
      setStatus("그 뒤에 남은 실제 산길 사진을 보고 있습니다.");
    }
    syncControls();
  };

  playButton?.addEventListener("click", play);
  pauseButton?.addEventListener("click", () => pause());
  replayButton?.addEventListener("click", play);
  choiceButtons.forEach((button) => {
    button.addEventListener("click", () => choose(button.dataset.memoryChoice));
  });

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    visible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= .16);
    if (!visible) pause("화면 밖으로 나가 장면을 멈췄습니다. 버튼으로 다시 이어 보세요.");
    else if (playing && !frame && document.visibilityState === "visible") frame = requestAnimationFrame(tick);
  }, { threshold: [.05, .16, .3] });
  observer.observe(root);

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") pause("다른 탭으로 이동해 장면을 멈췄습니다.");
  });
  reduceMotion.addEventListener?.("change", () => {
    if (!reduceMotion.matches) return;
    pause("감속 설정을 따라 정지 장면을 보여줍니다. 시점을 직접 고를 수 있습니다.");
    render(elapsed, staticChoice || "then");
    setStatus("감속 설정을 따라 정지 장면을 보여줍니다. 시점을 직접 고를 수 있습니다.");
    syncControls();
  });

  if (art) art.hidden = false;
  if (photoStack) photoStack.hidden = true;
  photos.forEach((photo) => { photo.hidden = true; });
  render(0, "then");
  syncControls();
  if (reduceMotion.matches) setStatus("감속 설정을 따라 정지 장면을 보여줍니다. 시점을 직접 고를 수 있습니다.");
}
