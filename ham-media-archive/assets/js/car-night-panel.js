(() => {
  const root = document.querySelector("[data-night-panel]");
  const details = root?.closest(".night-panel-entry");
  const stage = root?.querySelector("[data-night-panel-stage]");
  const caption = root?.querySelector("[data-night-panel-caption]");
  const canvasLabel = "NIGHT 버튼을 눌러 나이트 패널을 조작할 수 있는 3D 계기판 모형";
  if (!root || !details || !stage || !caption) return;

  let canvas = root.querySelector("[data-night-panel-canvas]");
  const fallbackImage = root.querySelector("[data-night-panel-fallback]");
  const loading = root.querySelector("[data-night-panel-loading]");
  const toggleButton = root.querySelector("[data-night-panel-toggle]");
  const toggleCopy = root.querySelector("[data-night-panel-toggle-copy]");
  const fuelButton = root.querySelector("[data-night-panel-fuel]");
  const replayButton = root.querySelector("[data-night-panel-replay]");
  const pauseButton = root.querySelector("[data-night-panel-pause]");
  const pauseBadge = root.querySelector("[data-night-panel-pause-badge]");
  const frameChoices = root.querySelector("[data-night-panel-frames]");
  const closeButton = root.querySelector("[data-night-panel-close]");
  const summary = details.querySelector("summary");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const frameSources = {
    normal: "../assets/images/cars/night-panel-frame-normal.webp",
    night: "../assets/images/cars/night-panel-frame-night.webp",
    fuel: "../assets/images/cars/night-panel-frame-fuel.webp",
  };
  const frameAlt = {
    normal: "기능 설명용 3D 계기판 모형, 일반 상태",
    night: "기능 설명용 3D 계기판 모형, 나이트 패널 상태. 140까지의 속도계 눈금과 필요한 표시등은 남고 보조 계기는 어둡습니다.",
    fuel: "기능 설명용 3D 계기판 모형, 연료 상태. 연료계와 연료 표시만 다시 켜집니다.",
  };
  const initial = {
    mode: "normal",
    tachNeedle: 0.28,
    tempNeedle: 0.58,
    fuelNeedle: 0.72,
    speedNeedle: 0.31,
    tachGlow: 1,
    tempGlow: 1,
    fuelGlow: 1,
    speedUpperGlow: 1,
    fuelWarning: 0,
    fuelPulse: 0,
    buttonDepth: 0,
  };

  let live = null;
  let threePromise = null;
  let observer = null;
  let isVisible = false;
  let storyPlaying = false;
  let storyTime = 0;
  let storyStarted = false;
  let transition = null;
  let lastState = { ...initial };
  let raf = 0;
  let previousFrameTime = 0;
  let returnScrollY = window.scrollY;
  let staticMode = false;


  const clamp01 = (value) => (value < 0 ? 0 : value > 1 ? 1 : value);
  const smooth = (start, end, value) => {
    const u = clamp01((value - start) / (end - start));
    return u * u * (3 - 2 * u);
  };
  const smoother = (start, end, value) => {
    const u = clamp01((value - start) / (end - start));
    return u * u * u * (u * (u * 6 - 15) + 10);
  };
  const lerp = (a, b, u) => a + (b - a) * u;
  const easeOutBack = (value) => {
    const u = clamp01(value);
    const c = 1.45;
    return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2);
  };

  function setCaption(text) {
    if (caption.textContent !== text) caption.textContent = text;
  }

  function setModeControls(mode) {
    const night = mode !== "normal";
    toggleButton.setAttribute("aria-pressed", String(night));
    toggleCopy.textContent = night ? "끄기" : "켜기";
    fuelButton.disabled = mode !== "night" || storyPlaying;
  }

  function selectStaticFrame(mode, message) {
    if (!fallbackImage) return;
    staticMode = true;
    storyPlaying = false;
    transition = null;
    if (live) disposeLive();
    canvas.hidden = true;
    fallbackImage.src = frameSources[mode];
    fallbackImage.alt = frameAlt[mode];
    fallbackImage.hidden = false;
    if (loading) loading.hidden = true;
    if (frameChoices) frameChoices.hidden = false;
    if (pauseBadge) pauseBadge.hidden = true;
    replayButton.textContent = "처음으로";
    pauseButton.textContent = "정지 화면";
    pauseButton.disabled = true;
    lastState = { ...initial, mode };
    if (mode === "night") {
      lastState.tachNeedle = 0;
      lastState.tempNeedle = 0;
      lastState.fuelNeedle = 0;
      lastState.tachGlow = 0;
      lastState.tempGlow = 0;
      lastState.fuelGlow = 0;
      lastState.speedUpperGlow = 0.14;
    } else if (mode === "fuel") {
      lastState.tachNeedle = 0;
      lastState.tempNeedle = 0;
      lastState.fuelNeedle = 0.12;
      lastState.tachGlow = 0;
      lastState.tempGlow = 0;
      lastState.fuelGlow = 1;
      lastState.speedUpperGlow = 0.14;
      lastState.fuelWarning = 1;
    }
    setModeControls(mode);
    if (message) setCaption(message);
    for (const button of root.querySelectorAll("[data-night-panel-frame]")) {
      button.setAttribute("aria-pressed", String(button.dataset.nightPanelFrame === mode));
    }
  }

  function setLiveControls(mode) {
    staticMode = false;
    if (frameChoices) frameChoices.hidden = true;
    if (replayButton) replayButton.textContent = "다시 보기";
    const canContinue = storyStarted && storyTime < 16 && !transition;
    pauseButton.disabled = !storyPlaying && !canContinue;
    pauseButton.textContent = storyPlaying ? "멈춤" : canContinue ? "계속" : "멈춤";
    setModeControls(mode);
  }

  function disposeLive() {
    stopLoop();
    if (!live) return;
    live.resizeObserver?.disconnect();
    const seen = new Set();
    live.scene.traverse((object) => {
      if (object.geometry && !seen.has(object.geometry)) {
        seen.add(object.geometry);
        object.geometry.dispose();
      }
      const materials = Array.isArray(object.material) ? object.material : [object.material];
      for (const material of materials) {
        if (!material || seen.has(material)) continue;
        seen.add(material);
        for (const value of Object.values(material)) {
          if (value?.isTexture && !seen.has(value)) {
            seen.add(value);
            value.dispose();
          }
        }
        material.dispose();
      }
    });
    live.environmentTarget?.dispose();
    live.renderer.dispose();
    live.renderer.forceContextLoss();
    live = null;

    const freshCanvas = canvas.cloneNode(false);
    freshCanvas.hidden = true;
    canvas.replaceWith(freshCanvas);
    canvas = freshCanvas;
    bindCanvasEvents();
  }

  function inStageViewport() {
    const rect = stage.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0 && rect.left < window.innerWidth && rect.right > 0;
  }

  function canRender() {
    return Boolean(live && details.open && isVisible && !document.hidden && !staticMode);
  }

  function stopLoop() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
    previousFrameTime = 0;
  }

  function startLoop() {
    if (!canRender() || raf) return;
    previousFrameTime = 0;
    raf = requestAnimationFrame(renderFrame);
  }

  function setGaugeNeedle(gauge, value) {
    const normalized = clamp01(value);
    const angle = Math.PI * 1.25 - normalized * Math.PI * 1.5;
    gauge.needle.rotation.z = angle - Math.PI / 2;
  }

  function setGlow(gauge, amount) {
    const value = clamp01(amount);
    gauge.scaleMaterial.opacity = value;
    gauge.needleMaterial.opacity = value;
    gauge.needleMaterial.emissiveIntensity = 0.82 * value;
    gauge.haloMaterial.opacity = 0.14 * value;
  }

  function applyState(state, time) {
    if (!live) return;
    lastState = state;
    setGaugeNeedle(live.gauges.tach, state.tachNeedle);
    setGaugeNeedle(live.gauges.temp, state.tempNeedle);
    setGaugeNeedle(live.gauges.fuel, state.fuelNeedle);
    setGaugeNeedle(live.gauges.speed, state.speedNeedle);
    setGlow(live.gauges.tach, state.tachGlow);
    setGlow(live.gauges.temp, state.tempGlow);
    setGlow(live.gauges.fuel, state.fuelGlow);
    live.gauges.speed.upperMaterial.opacity = state.speedUpperGlow;
    live.gauges.speed.haloMaterial.opacity = 0.12;
    if (live.gauges.fuel.pulseMaterial) live.gauges.fuel.pulseMaterial.opacity = 0.76 * clamp01(state.fuelPulse || 0);
    live.fuelLamp.material.emissiveIntensity = 1.25 * state.fuelWarning;
    live.fuelLamp.material.color.setRGB(
      lerp(0.01, 1, state.fuelWarning),
      lerp(0.005, 0.36, state.fuelWarning),
      lerp(0.002, 0.04, state.fuelWarning),
    );
    live.buttonTop.position.z = live.buttonBaseZ - state.buttonDepth * 0.065;
    const nightActive = state.mode !== "normal";
    live.buttonGlow.material.emissiveIntensity = nightActive ? 0.9 : 0.04;
    live.buttonGlow.material.color.set(nightActive ? "#ffc16c" : "#535956");
    live.buttonFace.material.emissiveIntensity = nightActive ? 0.62 : 0.06;
    live.buttonLabel.material.color.set(nightActive ? "#ffe0ad" : "#f4bd77");
    live.streetLight.position.x = -1.15 + 2.3 * smoother(0, 16, time || 0);
    if (time !== null && time !== undefined) {
      const move = smoother(0, 16, time);
      live.camera.position.x = lerp(live.cameraBase.x - 0.18, live.cameraBase.x + 0.18, move);
      live.camera.position.y = live.cameraBase.y + 0.05 * move;
      live.camera.position.z = live.cameraBase.z - 0.17 * move;
      live.camera.lookAt(live.cameraTarget);
    }
    setLiveControls(state.mode);
    if (live.renderer) live.renderer.render(live.scene, live.camera);
  }

  function storyCaption(time) {
    if (time < 3) return "밤길, 계기판 전부 켜짐";
    if (time < 4) return "NIGHT 버튼을 누릅니다";
    if (time < 5.85) return "보조 계기 바늘이 먼저 0으로 내려갑니다";
    if (time < 10) return "속도계의 140까지 눈금과 필요한 표시등은 남습니다";
    if (time < 12.5) return "연료 경고가 들어오면 연료계만 다시 켜집니다";
    if (time < 13.2) return "다시 눌러 다른 계기 바늘부터 돌아옵니다";
    if (time < 14) return "다른 계기 바늘이 돌아오고, 연료 경고는 남습니다";
    return "다른 계기는 켜지고, 연료 경고는 남습니다";
  }

  function storyState(time) {
    const state = { ...initial };
    const press = smooth(3.08, 3.2, time) * (1 - smooth(3.45, 3.58, time));
    const restorePress = smooth(12.48, 12.6, time) * (1 - smooth(12.86, 12.98, time));
    state.buttonDepth = Math.max(press, restorePress);
    state.speedNeedle = 0.31 + (time < 3 ? 0.004 * Math.sin(time * 2.6) : 0);

    const restoreNeedles = smooth(12.5, 13.18, time);
    state.tachNeedle = lerp(lerp(0.28, 0, easeOutBack((time - 4.0) / 0.42)), 0.28, restoreNeedles);
    state.tempNeedle = lerp(lerp(0.58, 0, easeOutBack((time - 4.12) / 0.42)), 0.58, restoreNeedles);
    state.fuelNeedle = lerp(0.72, 0, easeOutBack((time - 4.24) / 0.42));
    const switchOff = smooth(5.22, 5.84, time);
    state.tachGlow = 1 - switchOff;
    state.tempGlow = 1 - switchOff;
    state.fuelGlow = 1 - switchOff;
    state.speedUpperGlow = 1 - 0.86 * switchOff;

    const warning = smooth(9.95, 10.22, time);
    const fuelOn = smooth(10.27, 10.88, time);
    state.fuelWarning = warning;
    state.fuelGlow = lerp(state.fuelGlow, 1, fuelOn);
    state.fuelNeedle = lerp(state.fuelNeedle, 0.13, fuelOn);
    state.fuelPulse = smooth(10.27, 10.34, time) * (1 - smooth(10.75, 10.84, time));
    const restoreLights = smooth(13.22, 13.96, time);
    state.tachGlow = lerp(state.tachGlow, 1, restoreLights);
    state.tempGlow = lerp(state.tempGlow, 1, restoreLights);
    state.fuelGlow = lerp(state.fuelGlow, 1, restoreLights);
    state.speedUpperGlow = lerp(state.speedUpperGlow, 1, restoreLights);

    if (time < 3.2) state.mode = "normal";
    else if (time < 5.85) state.mode = "turning-off";
    else if (time < 10.2) state.mode = "night";
    else if (time < 12.5) state.mode = "fuel";
    else if (time < 13.96) state.mode = "restoring";
    else state.mode = "normal";
    return state;
  }

  function interpolateState(from, to, amount) {
    const state = { ...from, mode: to.mode };
    for (const key of [
      "tachNeedle", "tempNeedle", "fuelNeedle", "speedNeedle",
      "tachGlow", "tempGlow", "fuelGlow", "speedUpperGlow",
      "fuelWarning", "fuelPulse", "buttonDepth",
    ]) state[key] = lerp(from[key], to[key], amount);
    return state;
  }

  function transitionState(nowElapsed) {
    if (!transition) return lastState;
    const elapsed = nowElapsed;
    const duration = transition.kind === "fuel" ? 1.12 : transition.kind === "night" ? 1.5 : 1.5;
    const from = transition.from;
    let state = { ...from };
    if (transition.kind === "night") {
      const needleMove = easeOutBack(elapsed / 0.82);
      state.tachNeedle = lerp(from.tachNeedle, 0, needleMove);
      state.tempNeedle = lerp(from.tempNeedle, 0, needleMove);
      const fuelIsLow = from.fuelWarning > 0.05;
      state.fuelNeedle = lerp(from.fuelNeedle, fuelIsLow ? 0.13 : 0, needleMove);
      const dim = smooth(0.82, 1.5, elapsed);
      state.tachGlow = lerp(from.tachGlow, 0, dim);
      state.tempGlow = lerp(from.tempGlow, 0, dim);
      state.fuelGlow = lerp(from.fuelGlow, fuelIsLow ? 1 : 0, dim);
      state.speedUpperGlow = lerp(from.speedUpperGlow, 0.14, dim);
      state.fuelWarning = from.fuelWarning;
      state.fuelPulse = lerp(from.fuelPulse, 0, dim);
      state.buttonDepth = 1 - smooth(0, 0.22, elapsed);
      state.mode = elapsed < duration ? "turning-off" : "night";
    } else if (transition.kind === "normal") {
      const needleMove = smooth(0, 0.68, elapsed);
      state.tachNeedle = lerp(from.tachNeedle, 0.28, needleMove);
      state.tempNeedle = lerp(from.tempNeedle, 0.58, needleMove);
      const fuelIsLow = from.fuelWarning > 0.05;
      state.fuelNeedle = lerp(from.fuelNeedle, fuelIsLow ? 0.13 : 0.72, needleMove);
      const lightMove = smooth(0.68, 1.5, elapsed);
      state.tachGlow = lerp(from.tachGlow, 1, lightMove);
      state.tempGlow = lerp(from.tempGlow, 1, lightMove);
      state.fuelGlow = lerp(from.fuelGlow, 1, lightMove);
      state.speedUpperGlow = lerp(from.speedUpperGlow, 1, lightMove);
      state.fuelWarning = from.fuelWarning;
      state.fuelPulse = lerp(from.fuelPulse, 0, lightMove);
      state.buttonDepth = smooth(0, 0.18, elapsed);
      state.mode = elapsed < duration ? "restoring" : "normal";
    } else {
      const warning = smooth(0, 0.28, elapsed);
      const fuelMove = smooth(0.3, 0.88, elapsed);
      state.fuelWarning = lerp(from.fuelWarning, 1, warning);
      state.fuelNeedle = lerp(from.fuelNeedle, 0.13, easeOutBack(fuelMove));
      state.fuelGlow = fuelMove;
      state.fuelPulse = smooth(0.3, 0.38, elapsed) * (1 - smooth(0.82, 0.9, elapsed));
      state.mode = elapsed < duration ? "fuel" : "fuel";
    }
    if (elapsed >= duration) transition = null;
    return state;
  }

  function renderFrame(now) {
    raf = 0;
    if (!canRender()) return;
    if (!previousFrameTime) previousFrameTime = now;
    const delta = Math.min(0.05, Math.max(0, (now - previousFrameTime) / 1000));
    previousFrameTime = now;
    if (storyPlaying) {
      storyTime += delta;
      if (storyTime >= 16) {
        storyTime = 16;
        storyPlaying = false;
        storyStarted = true;
      }
      const state = storyState(storyTime);
      applyState(state, storyTime);
      setCaption(storyCaption(storyTime));
      if (!storyPlaying && storyTime >= 16) pauseButton.disabled = true;
    } else if (transition) {
      transition.elapsed += delta;
      const state = transitionState(transition.elapsed);
      applyState(state, null);
      if (!transition) {
        if (state.mode === "night") setCaption("나이트 패널 · 속도계 일부와 필요한 표시등은 남습니다");
        else if (state.mode === "fuel") setCaption("연료 표시가 켜지고 연료계가 돌아옵니다");
        else if (state.fuelWarning > 0.05) setCaption("일반 계기판 · 연료 경고와 낮은 연료량은 남습니다");
        else setCaption("일반 계기판 · 모든 바늘과 조명이 돌아왔습니다");
      }
    } else {
      applyState(lastState, null);
    }
    if (raf === 0 && (storyPlaying || transition)) raf = requestAnimationFrame(renderFrame);
  }

  function applyStaticModeMessage(mode) {
    if (mode === "normal") selectStaticFrame(mode, "움직임 없이 세 장면을 골라 볼 수 있습니다. 일반 계기판");
    else if (mode === "night") selectStaticFrame(mode, "속도계의 140까지 눈금과 필요한 표시등은 남습니다.");
    else selectStaticFrame(mode, "연료 표시가 켜지면 연료계만 다시 나타납니다.");
  }

  function toggleNight() {
    if (staticMode) {
      applyStaticModeMessage(lastState.mode === "normal" ? "night" : "normal");
      return;
    }
    if (!live) return;
    if (pauseBadge) pauseBadge.hidden = true;
    storyPlaying = false;
    storyStarted = false;
    storyTime = 0;
    const toNight = lastState.mode === "normal" || lastState.mode === "restoring";
    transition = {
      kind: toNight ? "night" : "normal",
      from: { ...lastState },
      elapsed: 0,
    };
    pauseButton.textContent = "멈춤";
    pauseButton.disabled = true;
    setCaption(toNight ? "NIGHT 버튼을 누릅니다" : "바늘이 먼저 돌아온 뒤 조명이 켜집니다");
    startLoop();
  }

  function triggerFuel() {
    if (staticMode) {
      if (lastState.mode === "night") applyStaticModeMessage("fuel");
      return;
    }
    if (!live || lastState.mode !== "night" || storyPlaying) return;
    if (pauseBadge) pauseBadge.hidden = true;
    storyStarted = false;
    pauseButton.textContent = "멈춤";
    pauseButton.disabled = true;
    transition = { kind: "fuel", from: { ...lastState }, elapsed: 0 };
    setCaption("연료 경고가 들어옵니다");
    startLoop();
  }

  function startStory() {
    if (staticMode) {
      applyStaticModeMessage("normal");
      return;
    }
    if (!live) return;
    if (pauseBadge) pauseBadge.hidden = true;
    transition = null;
    storyTime = 0;
    storyPlaying = true;
    storyStarted = true;
    pauseButton.disabled = false;
    pauseButton.textContent = "멈춤";
    setCaption("밤길, 계기판 전부 켜짐");
    startLoop();
  }

  function togglePause() {
    if (staticMode || !live) return;
    if (storyPlaying) {
      storyPlaying = false;
      transition = null;
      pauseButton.textContent = "계속";
      pauseButton.disabled = false;
      if (pauseBadge) pauseBadge.hidden = false;
      setCaption(storyCaption(storyTime));
    } else if (storyStarted && storyTime < 16 && !transition) {
      storyPlaying = true;
      pauseButton.textContent = "멈춤";
      if (pauseBadge) pauseBadge.hidden = true;
      setCaption(storyCaption(storyTime));
    }
    startLoop();
  }

  function onCanvasPointer(event) {
    if (!live) return;
    const rect = canvas.getBoundingClientRect();
    live.raycaster.setFromCamera(new live.THREE.Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    ), live.camera);
    const hit = live.raycaster.intersectObject(live.buttonFace, false)[0];
    if (hit) {
      event.preventDefault();
      toggleNight();
    }
  }

  function bindCanvasEvents() {
    if (!canvas) return;
    canvas.setAttribute("aria-label", canvasLabel);
    canvas.addEventListener("pointerup", onCanvasPointer);
    canvas.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        toggleNight();
      }
    });
  }

  function makeTexture(THREE, canvasElement) {
    const texture = new THREE.CanvasTexture(canvasElement);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = 4;
    return texture;
  }

  function makeScaleCanvas(kind, minValue, maxValue, step, labelStep, labels, overallMin = minValue, overallMax = maxValue) {
    const size = 1024;
    const canvasElement = document.createElement("canvas");
    canvasElement.width = size;
    canvasElement.height = size;
    const ctx = canvasElement.getContext("2d");
    const radius = size * 0.5;
    const start = Math.PI * 1.25;
    const sweep = Math.PI * 1.5;
    ctx.save();
    ctx.translate(radius, radius);
    ctx.lineCap = "round";
    const count = Math.round((maxValue - minValue) / step);
    for (let index = 0; index <= count; index += 1) {
      const value = minValue + index * step;
      const progress = (value - overallMin) / (overallMax - overallMin);
      const angle = start - progress * sweep;
      const major = index === count || Math.abs(value / labelStep - Math.round(value / labelStep)) < 0.001;
      const inner = radius * (major ? 0.76 : 0.82);
      const outer = radius * 0.91;
      ctx.beginPath();
      ctx.moveTo(Math.cos(angle) * inner, -Math.sin(angle) * inner);
      ctx.lineTo(Math.cos(angle) * outer, -Math.sin(angle) * outer);
      ctx.lineWidth = major ? 9 : 5;
      ctx.strokeStyle = "#7cff9a";
      ctx.stroke();
      if (major) {
        const textRadius = radius * 0.64;
        const x = Math.cos(angle) * textRadius;
        const y = -Math.sin(angle) * textRadius;
        let text = String(value);
        if (labels && Object.prototype.hasOwnProperty.call(labels, value)) text = labels[value];
        ctx.fillStyle = "#b6ffc4";
        ctx.font = kind === "speed" ? "700 59px Arial, sans-serif" : "700 61px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x, y);
      }
    }
    const labelText = kind === "speed" ? "km/h" : kind === "tach" ? "x1000 rpm" : kind === "fuel" ? "FUEL" : "TEMP";
    ctx.fillStyle = "rgba(165,255,185,.82)";
    ctx.font = "600 48px Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labelText, 0, radius * 0.37);
    ctx.restore();
    return canvasElement;
  }

  function makeDashTexture(THREE) {
    const surface = document.createElement("canvas");
    surface.width = 256;
    surface.height = 256;
    const ctx = surface.getContext("2d");
    ctx.fillStyle = "#151616";
    ctx.fillRect(0, 0, 256, 256);
    let seed = 17;
    for (let index = 0; index < 1800; index += 1) {
      seed = (seed * 48271) % 2147483647;
      const x = seed % 256;
      seed = (seed * 48271) % 2147483647;
      const y = seed % 256;
      const alpha = 0.012 + (seed % 8) / 1000;
      ctx.fillStyle = "rgba(225,230,224," + alpha.toFixed(3) + ")";
      ctx.fillRect(x, y, 1, 1);
    }
    return makeTexture(THREE, surface);
  }

  function addTextPlane(THREE, scene, text, width, height, x, y, z, color, opacity, fontSize = 48) {
    const image = document.createElement("canvas");
    image.width = 512;
    image.height = 128;
    const context = image.getContext("2d");
    context.clearRect(0, 0, image.width, image.height);
    context.fillStyle = color;
    context.font = `600 ${fontSize}px Arial, sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(text, image.width / 2, image.height / 2, 490);
    const texture = makeTexture(THREE, image);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity, depthWrite: false, side: THREE.DoubleSide });
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(width, height), material);
    mesh.position.set(x, y, z);
    scene.add(mesh);
    return mesh;
  }

  function makeGauge(THREE, scene, options) {
    const group = new THREE.Group();
    group.position.set(options.x, options.y, 0);
    scene.add(group);
    const radius = options.radius;
    const baseMaterial = new THREE.MeshPhysicalMaterial({ color: "#060908", metalness: 0.3, roughness: 0.32, clearcoat: 0.35, clearcoatRoughness: 0.24 });
    const face = new THREE.Mesh(new THREE.CircleGeometry(radius, 72), baseMaterial);
    face.position.z = 0.08;
    face.receiveShadow = true;
    group.add(face);

    const outerMaterial = new THREE.MeshStandardMaterial({ color: "#303638", metalness: 0.9, roughness: 0.23 });
    const bezel = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.035, options.bezel || 0.09, 10, 80), outerMaterial);
    bezel.position.z = 0.12;
    bezel.castShadow = true;
    group.add(bezel);
    const trimMaterial = new THREE.MeshStandardMaterial({ color: "#777e79", metalness: 0.85, roughness: 0.27 });
    const trim = new THREE.Mesh(new THREE.TorusGeometry(radius - 0.08, 0.018, 8, 72), trimMaterial);
    trim.position.z = 0.14;
    group.add(trim);

    const scaleCanvas = options.kind === "speed"
      ? makeScaleCanvas(options.kind, 0, options.max, options.step, options.labelStep, options.labels, 0, 260)
      : makeScaleCanvas(options.kind, 0, options.max, options.step, options.labelStep, options.labels);
    const scaleTexture = makeTexture(THREE, scaleCanvas);
    const scaleMaterial = new THREE.MeshBasicMaterial({ map: scaleTexture, transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide });
    const scale = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.91, 72), scaleMaterial);
    scale.position.z = 0.105;
    group.add(scale);

    let upperMaterial = null;
    if (options.kind === "speed") {
      const upperCanvas = makeScaleCanvas("speed", 160, 260, 10, 40, null, 0, 260);
      const upperTexture = makeTexture(THREE, upperCanvas);
      upperMaterial = new THREE.MeshBasicMaterial({ map: upperTexture, transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide });
      const upper = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.91, 72), upperMaterial);
      upper.position.z = 0.108;
      group.add(upper);
    }

    const needleMaterial = new THREE.MeshStandardMaterial({
      color: "#ff8a1e",
      emissive: "#ff5b0a",
      emissiveIntensity: 0.82,
      metalness: 0.45,
      roughness: 0.22,
      transparent: true,
      opacity: 1,
    });
    const needle = new THREE.Group();
    needle.position.z = 0.16;
    const pointerShape = new THREE.Shape();
    pointerShape.moveTo(-0.04, -0.18);
    pointerShape.lineTo(-0.028, radius * 0.68);
    pointerShape.quadraticCurveTo(0, radius * 0.78, 0.028, radius * 0.68);
    pointerShape.lineTo(0.04, -0.18);
    pointerShape.closePath();
    const pointer = new THREE.Mesh(new THREE.ShapeGeometry(pointerShape), needleMaterial);
    pointer.castShadow = true;
    pointer.position.z = 0.015;
    needle.add(pointer);
    const pivotMaterial = new THREE.MeshStandardMaterial({ color: "#c2c7c2", metalness: 0.86, roughness: 0.2 });
    const pivot = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.085, 24), pivotMaterial);
    pivot.rotation.x = Math.PI / 2;
    pivot.position.z = 0.04;
    pivot.castShadow = true;
    needle.add(pivot);
    group.add(needle);

    const haloMaterial = new THREE.MeshBasicMaterial({ color: "#7cff9a", transparent: true, opacity: 0.12, side: THREE.DoubleSide, depthWrite: false });
    const halo = new THREE.Mesh(new THREE.RingGeometry(radius * 0.88, radius * 0.93, 72), haloMaterial);
    halo.position.z = 0.115;
    group.add(halo);

    let pulseMaterial = null;
    if (options.kind === "fuel") {
      pulseMaterial = new THREE.MeshBasicMaterial({ color: "#ffc16c", transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false });
      const pulseRing = new THREE.Mesh(new THREE.TorusGeometry(radius + 0.105, 0.018, 8, 72), pulseMaterial);
      pulseRing.position.z = 0.248;
      group.add(pulseRing);
    }

    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: "#dfe9e2",
      metalness: 0.05,
      roughness: 0.13,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      transparent: true,
      opacity: 0.075,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
    const glass = new THREE.Mesh(new THREE.CircleGeometry(radius * 0.97, 72), glassMaterial);
    glass.position.z = 0.235;
    group.add(glass);
    return { group, needle, needleMaterial, scaleMaterial, upperMaterial, haloMaterial, pulseMaterial, radius };
  }

  function roundedShape(THREE, width, height, radius) {
    const shape = new THREE.Shape();
    const x = -width / 2;
    const y = -height / 2;
    shape.moveTo(x + radius, y);
    shape.lineTo(x + width - radius, y);
    shape.quadraticCurveTo(x + width, y, x + width, y + radius);
    shape.lineTo(x + width, y + height - radius);
    shape.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    shape.lineTo(x + radius, y + height);
    shape.quadraticCurveTo(x, y + height, x, y + height - radius);
    shape.lineTo(x, y + radius);
    shape.quadraticCurveTo(x, y, x + radius, y);
    return shape;
  }

  function createEnvironment(THREE, renderer, scene) {
    const image = document.createElement("canvas");
    image.width = 512;
    image.height = 256;
    const ctx = image.getContext("2d");
    const gradient = ctx.createLinearGradient(0, 0, 0, 256);
    gradient.addColorStop(0, "#090b0d");
    gradient.addColorStop(0.38, "#252b2c");
    gradient.addColorStop(0.5, "#737166");
    gradient.addColorStop(0.62, "#242626");
    gradient.addColorStop(1, "#060708");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 512, 256);
    ctx.fillStyle = "rgba(255,225,178,.74)";
    ctx.fillRect(76, 96, 168, 5);
    ctx.fillStyle = "rgba(228,238,235,.6)";
    ctx.fillRect(316, 83, 102, 4);
    const glow = ctx.createRadialGradient(156, 99, 4, 156, 99, 112);
    glow.addColorStop(0, "rgba(255,214,154,.36)");
    glow.addColorStop(1, "rgba(255,214,154,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(20, 0, 272, 224);
    const texture = makeTexture(THREE, image);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    const pmrem = new THREE.PMREMGenerator(renderer);
    pmrem.compileEquirectangularShader();
    const target = pmrem.fromEquirectangular(texture);
    texture.dispose();
    pmrem.dispose();
    scene.environment = target.texture;
    scene.environmentIntensity = 0.62;
    return target;
  }

  function createLiveScene(THREE) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: false,
      powerPreference: "low-power",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.08;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#0d0e10");
    const environmentTarget = createEnvironment(THREE, renderer, scene);
    scene.add(new THREE.HemisphereLight(0xc8d5d0, 0x171614, 1.55));
    const keyLight = new THREE.DirectionalLight(0xfff1d8, 2.2);
    keyLight.position.set(-4.5, 6.5, 7);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    Object.assign(keyLight.shadow.camera, { left: -7, right: 7, top: 6, bottom: -6, near: 0.1, far: 24 });
    keyLight.shadow.bias = -0.0008;
    scene.add(keyLight);
    const fill = new THREE.DirectionalLight(0x9ab2be, 0.75);
    fill.position.set(5, 2.5, 3.2);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x64736d, 1.15);
    rim.position.set(0, 3, -5);
    scene.add(rim);

    const dashTexture = makeDashTexture(THREE);
    const dashMaterial = new THREE.MeshPhysicalMaterial({
      color: "#111313",
      map: dashTexture,
      metalness: 0.16,
      roughness: 0.74,
      clearcoat: 0.16,
      clearcoatRoughness: 0.55,
    });
    const backing = new THREE.Mesh(
      new THREE.ExtrudeGeometry(roundedShape(THREE, 8.25, 4.22, 0.28), {
        depth: 0.42,
        bevelEnabled: true,
        bevelThickness: 0.055,
        bevelSize: 0.055,
        bevelSegments: 3,
        steps: 1,
      }),
      dashMaterial,
    );
    backing.position.set(0, 0.05, -0.46);
    backing.castShadow = true;
    backing.receiveShadow = true;
    scene.add(backing);

    const innerPanelMaterial = new THREE.MeshStandardMaterial({ color: "#080a09", metalness: 0.2, roughness: 0.63 });
    const innerPanel = new THREE.Mesh(new THREE.ShapeGeometry(roundedShape(THREE, 7.94, 3.93, 0.24)), innerPanelMaterial);
    innerPanel.position.set(0, 0.05, 0.005);
    innerPanel.receiveShadow = true;
    scene.add(innerPanel);

    const fastenerMaterial = new THREE.MeshStandardMaterial({ color: "#686e6a", metalness: 0.85, roughness: 0.31 });
    for (const [x, y] of [[-3.88, 1.83], [3.88, 1.83], [-3.88, -1.73], [3.88, -1.73]]) {
      const fastener = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.035, 16), fastenerMaterial);
      fastener.rotation.x = Math.PI / 2;
      fastener.position.set(x, y, 0.035);
      fastener.castShadow = true;
      scene.add(fastener);
    }

    const gauges = {
      tach: makeGauge(THREE, scene, { kind: "tach", x: -2.68, y: 0.57, radius: 1.16, max: 8, step: 0.5, labelStep: 2 }),
      speed: makeGauge(THREE, scene, { kind: "speed", x: 0, y: 0.58, radius: 1.58, max: 140, step: 10, labelStep: 40, labels: { 0: "0", 40: "40", 80: "80", 120: "120", 140: "140" }, bezel: 0.105 }),
      fuel: makeGauge(THREE, scene, { kind: "fuel", x: 2.73, y: 1.05, radius: 0.72, max: 1, step: 0.1, labelStep: 0.5, labels: { 0: "E", 0.5: "½", 1: "F" }, bezel: 0.065 }),
      temp: makeGauge(THREE, scene, { kind: "temp", x: 2.73, y: -0.28, radius: 0.72, max: 1, step: 0.1, labelStep: 0.5, labels: { 0: "C", 0.5: "90", 1: "H" }, bezel: 0.065 }),
    };
    const lampRingMaterial = new THREE.MeshStandardMaterial({ color: "#252b27", metalness: 0.68, roughness: 0.3 });
    const greenLampMaterial = new THREE.MeshStandardMaterial({ color: "#8cff9f", emissive: "#36ef69", emissiveIntensity: 1.05, roughness: 0.28 });
    for (const [x, label] of [[-0.45, "LIGHTS"], [0.48, "CRUISE"]]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 8, 24), lampRingMaterial);
      ring.position.set(x, 1.85, 0.08);
      scene.add(ring);
      const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.052, 16, 12), greenLampMaterial);
      lamp.position.set(x, 1.85, 0.105);
      scene.add(lamp);
      addTextPlane(THREE, scene, label, 0.58, 0.13, x, 1.67, 0.085, "#8cff9f", 0.82);
    }

    const fuelRing = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.027, 8, 24), lampRingMaterial);
    fuelRing.position.set(3.56, 1.67, 0.1);
    scene.add(fuelRing);
    const fuelLampMaterial = new THREE.MeshStandardMaterial({
      color: "#342611",
      emissive: "#ff8a1e",
      emissiveIntensity: 0,
      roughness: 0.28,
    });
    const fuelLamp = new THREE.Mesh(new THREE.SphereGeometry(0.07, 18, 14), fuelLampMaterial);
    fuelLamp.position.set(3.56, 1.67, 0.13);
    scene.add(fuelLamp);
    addTextPlane(THREE, scene, "FUEL", 0.42, 0.13, 3.56, 1.45, 0.11, "#ffc16c", 0.7);

    const buttonHousing = new THREE.Mesh(
      new THREE.CylinderGeometry(0.39, 0.42, 0.21, 48),
      new THREE.MeshStandardMaterial({ color: "#292d2c", metalness: 0.5, roughness: 0.4 }),
    );
    buttonHousing.rotation.x = Math.PI / 2;
    buttonHousing.position.set(0, -1.56, 0.12);
    buttonHousing.castShadow = true;
    scene.add(buttonHousing);
    const buttonGlowMaterial = new THREE.MeshStandardMaterial({ color: "#535956", emissive: "#ff8a1e", emissiveIntensity: 0.04, metalness: 0.52, roughness: 0.24 });
    const buttonGlow = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.028, 10, 42), buttonGlowMaterial);
    buttonGlow.position.set(0, -1.56, 0.24);
    scene.add(buttonGlow);
    const buttonTop = new THREE.Group();
    buttonTop.position.set(0, -1.56, 0.25);
    scene.add(buttonTop);
    const buttonFaceMaterial = new THREE.MeshStandardMaterial({
      color: "#151817",
      emissive: "#7b3509",
      emissiveIntensity: 0.22,
      metalness: 0.28,
      roughness: 0.32,
    });
    const buttonFace = new THREE.Mesh(new THREE.CylinderGeometry(0.295, 0.295, 0.13, 42), buttonFaceMaterial);
    buttonFace.rotation.x = Math.PI / 2;
    buttonFace.castShadow = true;
    buttonTop.add(buttonFace);
    const buttonLabel = addTextPlane(THREE, buttonTop, "NIGHT", 0.54, 0.2, 0, 0, 0.08, "#f4bd77", 0.94, 92);
    const buttonBaseZ = buttonTop.position.z;

    const reflectionCanvas = document.createElement("canvas");
    reflectionCanvas.width = 32;
    reflectionCanvas.height = 256;
    const reflectionContext = reflectionCanvas.getContext("2d");
    const reflectionGradient = reflectionContext.createLinearGradient(0, 0, 0, reflectionCanvas.height);
    reflectionGradient.addColorStop(0, "rgba(255,241,220,0)");
    reflectionGradient.addColorStop(0.22, "rgba(255,241,220,0.42)");
    reflectionGradient.addColorStop(0.5, "rgba(255,241,220,0.9)");
    reflectionGradient.addColorStop(0.76, "rgba(255,241,220,0.38)");
    reflectionGradient.addColorStop(1, "rgba(255,241,220,0)");
    reflectionContext.fillStyle = reflectionGradient;
    reflectionContext.fillRect(0, 0, reflectionCanvas.width, reflectionCanvas.height);
    const reflectionShape = new THREE.Shape();
    reflectionShape.moveTo(-2.52, 1.64);
    reflectionShape.lineTo(-2.04, 1.76);
    reflectionShape.lineTo(-0.76, -1.24);
    reflectionShape.lineTo(-1.28, -1.3);
    reflectionShape.closePath();
    const reflection = new THREE.Mesh(
      new THREE.ShapeGeometry(reflectionShape),
      new THREE.MeshBasicMaterial({ map: makeTexture(THREE, reflectionCanvas), color: "#fff1dc", transparent: true, opacity: 0.06, side: THREE.DoubleSide, depthWrite: false }),
    );
    reflection.position.z = 0.26;
    scene.add(reflection);

    const streetTextureCanvas = document.createElement("canvas");
    streetTextureCanvas.width = 256;
    streetTextureCanvas.height = 32;
    const streetCtx = streetTextureCanvas.getContext("2d");
    const streetGradient = streetCtx.createLinearGradient(0, 0, 0, 32);
    streetGradient.addColorStop(0, "rgba(255,177,100,0)");
    streetGradient.addColorStop(0.42, "rgba(255,192,117,.17)");
    streetGradient.addColorStop(0.56, "rgba(255,226,176,.3)");
    streetGradient.addColorStop(1, "rgba(255,177,100,0)");
    streetCtx.fillStyle = streetGradient;
    streetCtx.fillRect(0, 0, 256, 32);
    const streetTexture = makeTexture(THREE, streetTextureCanvas);
    const streetLight = new THREE.Mesh(
      new THREE.PlaneGeometry(11, 0.35),
      new THREE.MeshBasicMaterial({ map: streetTexture, transparent: true, depthWrite: false }),
    );
    streetLight.position.set(-1.15, -2.02, -0.85);
    scene.add(streetLight);

    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
    const cameraTarget = new THREE.Vector3(0, 0.02, -0.06);
    const raycaster = new THREE.Raycaster();
    const resize = () => {
      const bounds = stage.getBoundingClientRect();
      if (bounds.width < 1 || bounds.height < 1) return;
      renderer.setSize(bounds.width, bounds.height, false);
      camera.aspect = bounds.width / bounds.height;
      camera.updateProjectionMatrix();
      const targetWorldWidth = 9.0;
      const requiredHeight = targetWorldWidth / camera.aspect;
      const distance = requiredHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
      camera.position.set(-0.18, 1.34, distance);
      camera.lookAt(cameraTarget);
    };
    resize();

    return {
      THREE,
      renderer,
      scene,
      camera,
      cameraTarget,
      cameraBase: camera.position.clone(),
      raycaster,
      gauges,
      fuelLamp,
      buttonFace,
      buttonGlow,
      buttonLabel,
      buttonTop,
      buttonBaseZ,
      streetLight,
      environmentTarget,
      resize,
    };
  }

  async function ensureLiveScene() {
    if (live || staticMode) return;
    if (reduceMotion.matches) {
      selectStaticFrame("normal", "움직임 줄이기 설정에 따라 정지 장면으로 설명합니다.");
      return;
    }
    if (loading) loading.hidden = false;
    try {
      if (!threePromise) threePromise = import("../../jobs/pc-amp/shared/three.module.js");
      const THREE = await threePromise;
      if (!details.open || !inStageViewport()) {
        if (loading) loading.hidden = true;
        return;
      }
      live = createLiveScene(THREE);
      canvas.hidden = false;
      fallbackImage.hidden = true;
      if (loading) loading.hidden = true;
      staticMode = false;
      frameChoices.hidden = true;
      if (window.ResizeObserver) live.resizeObserver = new ResizeObserver(() => {
        if (!live) return;
        live.resize();
        live.cameraBase.copy(live.camera.position);
        if (!storyPlaying && !transition) live.renderer.render(live.scene, live.camera);
      });
      live.resizeObserver.observe(stage);
      if (!storyStarted) startStory();
      else applyState(lastState, null);
      startLoop();
    } catch (error) {
      console.warn("Night Panel 3D unavailable; showing the same scene as still frames.", error);
      if (loading) loading.hidden = true;
      selectStaticFrame("normal", "WebGL을 사용할 수 없어 같은 3D 장면의 정지 화면으로 보여드립니다.");
    }
  }

  function evaluateVisibility() {
    isVisible = inStageViewport();
    if (isVisible && details.open) {
      ensureLiveScene();
      startLoop();
    } else {
      stopLoop();
    }
  }

  function returnToQuestion() {
    if (!details.open) return;
    details.open = false;
    if (window.location.hash === "#night-panel") {
      const cleanUrl = new URL(window.location.href);
      cleanUrl.hash = "";
      window.history.replaceState(window.history.state, "", cleanUrl.pathname + cleanUrl.search);
    }
    summary.focus({ preventScroll: true });
    requestAnimationFrame(() => window.scrollTo({ top: returnScrollY, behavior: "auto" }));
  }

  function openFromHash() {
    if (window.location.hash !== "#night-panel" || details.open) return;
    returnScrollY = window.scrollY;
    details.open = true;
    requestAnimationFrame(() => {
      stage.scrollIntoView({ block: "center", behavior: "auto" });
      evaluateVisibility();
    });
  }

  toggleButton.addEventListener("click", toggleNight);
  fuelButton.addEventListener("click", triggerFuel);
  replayButton.addEventListener("click", startStory);
  pauseButton.addEventListener("click", togglePause);
  closeButton.addEventListener("click", returnToQuestion);
  for (const button of root.querySelectorAll("[data-night-panel-frame]")) {
    button.addEventListener("click", () => applyStaticModeMessage(button.dataset.nightPanelFrame));
  }
  summary.addEventListener("click", () => {
    if (!details.open) returnScrollY = window.scrollY;
  });
  details.addEventListener("toggle", () => {
    if (details.open) {
      requestAnimationFrame(() => {
        stage.scrollIntoView({ block: "center", behavior: "auto" });
        isVisible = inStageViewport();
        evaluateVisibility();
      });
    } else {
      disposeLive();
      staticMode = false;
      storyPlaying = false;
      transition = null;
      if (frameChoices) frameChoices.hidden = true;
      if (pauseBadge) pauseBadge.hidden = true;
      if (fallbackImage) fallbackImage.hidden = true;
      if (canvas) canvas.hidden = true;
      if (loading) loading.hidden = true;
      lastState = { ...initial };
      storyTime = 0;
      storyStarted = false;
      setCaption("밤길, 계기판 전부 켜짐");
      setModeControls("normal");
    }
  });
  details.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && details.open) {
      event.preventDefault();
      event.stopPropagation();
      returnToQuestion();
    }
  });
  window.addEventListener("hashchange", openFromHash);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopLoop();
    else evaluateVisibility();
  });
  window.addEventListener("resize", evaluateVisibility, { passive: true });
  if (window.IntersectionObserver) {
    observer = new IntersectionObserver((entries) => {
      isVisible = Boolean(entries[0]?.isIntersecting);
      if (isVisible && details.open) {
        ensureLiveScene();
        startLoop();
      } else stopLoop();
    }, { threshold: 0.08 });
    observer.observe(stage);
  } else {
    window.addEventListener("scroll", evaluateVisibility, { passive: true });
  }
  reduceMotion.addEventListener?.("change", (event) => {
    if (event.matches && details.open) selectStaticFrame("normal", "움직임 줄이기 설정에 따라 정지 장면으로 설명합니다.");
    else if (!event.matches && details.open) {
      staticMode = false;
      ensureLiveScene();
    }
  });

  bindCanvasEvents();
  setModeControls("normal");
  if (window.location.hash === "#night-panel") openFromHash();
})();
