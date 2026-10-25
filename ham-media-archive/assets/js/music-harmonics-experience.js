const musicHarmonics = document.querySelector("[data-star-experience][data-audio-harmonics]");

if (musicHarmonics) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  const rangeInputs = [...musicHarmonics.querySelectorAll("[data-harmonic-weight]")];
  const rangeOutputs = [...musicHarmonics.querySelectorAll("[data-harmonic-output]")];
  const wavePaths = [...musicHarmonics.querySelectorAll("[data-wave]")];
  const startButton = musicHarmonics.querySelector("[data-harmonic-start]");
  const stopButton = musicHarmonics.querySelector("[data-harmonic-stop]");
  const statusLine = musicHarmonics.querySelector("[data-harmonic-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let audioContext = null;
  let masterGain = null;
  let oscillators = [];
  let partialGains = [];
  let gainRamps = [];
  let stopTimer = 0;
  let animationFrame = 0;
  let visualPhaseOriginMs = 0;
  let isRunning = false;
  let isStarting = false;
  let isStopping = false;
  let isInView = false;

  const readWeights = () => rangeInputs.map((input) => Math.max(0, Math.min(1, Number(input.value) || 0)));
  const normalizedWeights = () => {
    const weights = readWeights();
    const norm = Math.hypot(...weights);
    return norm > 0 ? weights.map((weight) => weight / norm) : [0, 0, 0];
  };
  const targetGains = () => normalizedWeights().map((weight) => 0.04 * Math.SQRT2 * weight);

  const setStatus = (text) => {
    statusLine.textContent = text;
  };

  const displayPhaseNow = () => {
    if (!visualPhaseOriginMs) return 0;
    const elapsedMs = Math.max(0, performance.now() - visualPhaseOriginMs);
    return (elapsedMs * 0.0005 * Math.PI * 2) % (Math.PI * 2);
  };

  const drawWaves = (basePhase = 0) => {
    const weights = normalizedWeights();
    const scale = 42 * Math.sqrt(2 / 6);
    const samples = 112;
    const width = 720;
    const center = 38;
    const pathData = new Map();
    const componentPaths = [[], [], []];
    const mixPath = [];

    for (let sample = 0; sample <= samples; sample += 1) {
      const x = (width * sample) / samples;
      const phase = basePhase + (Math.PI * 2 * sample) / samples;
      for (let index = 0; index < 3; index += 1) {
        const value = scale * weights[index] * Math.sin(phase * (index + 1));
        componentPaths[index].push(`${sample === 0 ? "M" : "L"}${x.toFixed(1)} ${(center - value).toFixed(2)}`);
      }
      const mixed = weights.reduce((sum, weight, index) => sum + weight * Math.sin(phase * (index + 1)), 0);
      mixPath.push(`${sample === 0 ? "M" : "L"}${x.toFixed(1)} ${(center - scale * mixed).toFixed(2)}`);
    }

    componentPaths.forEach((segments, index) => pathData.set(String(index), segments.join(" ")));
    pathData.set("mix", mixPath.join(" "));
    wavePaths.forEach((path) => {
      const next = pathData.get(path.dataset.wave);
      if (next) path.setAttribute("d", next);
    });
  };

  const requestWaveFrame = () => {
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    drawWaves(isRunning ? displayPhaseNow() : 0);
    if (!isRunning || !isInView || document.hidden || reducedMotion.matches) return;
    animationFrame = requestAnimationFrame(requestWaveFrame);
  };

  const weightAt = (state, now) => {
    const progress = Math.max(0, Math.min(1, (now - state.startedAt) / 0.3));
    return state.from + (state.to - state.from) * progress;
  };

  const rampPartialGain = (gainNode, state, target, now) => {
    const current = weightAt(state, now);
    const parameter = gainNode.gain;
    parameter.cancelScheduledValues(now);
    parameter.setValueAtTime(current, now);
    parameter.linearRampToValueAtTime(target, now + 0.3);
    state.from = current;
    state.to = target;
    state.startedAt = now;
  };

  const cleanClosedContext = () => {
    if (stopTimer) window.clearTimeout(stopTimer);
    stopTimer = 0;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    audioContext = null;
    masterGain = null;
    oscillators = [];
    partialGains = [];
    gainRamps = [];
    visualPhaseOriginMs = 0;
    isRunning = false;
    isStarting = false;
    isStopping = false;
    startButton.disabled = !AudioContextClass;
    stopButton.disabled = true;
    requestWaveFrame();
  };

  const stopAudio = (message = "소리를 천천히 멈췄습니다.") => {
    if (!audioContext || !isRunning || isStopping) return;
    isRunning = false;
    isStopping = true;
    if (animationFrame) cancelAnimationFrame(animationFrame);
    animationFrame = 0;
    const now = audioContext.currentTime;
    const masterParameter = masterGain.gain;
    masterParameter.cancelScheduledValues(now);
    masterParameter.setValueAtTime(masterParameter.value, now);
    masterParameter.linearRampToValueAtTime(0, now + 0.3);
    oscillators.forEach((oscillator) => {
      try { oscillator.stop(now + 0.31); } catch {}
    });
    startButton.disabled = true;
    stopButton.disabled = true;
    setStatus(message);
    drawWaves(displayPhaseNow());
    stopTimer = window.setTimeout(() => {
      const contextToClose = audioContext;
      if (contextToClose) contextToClose.close().catch(() => {});
      cleanClosedContext();
      setStatus("소리를 멈췄습니다. 다시 들으려면 ‘작게 듣기’를 누르세요.");
    }, 360);
  };

  const hardStopAudio = () => {
    const contextToClose = audioContext;
    if (!contextToClose) {
      isStarting = false;
      return;
    }
    if (!contextToClose) return;
    if (stopTimer) window.clearTimeout(stopTimer);
    stopTimer = 0;
    try {
      const now = contextToClose.currentTime;
      if (masterGain) masterGain.gain.setValueAtTime(0, now);
      oscillators.forEach((oscillator) => {
        try { oscillator.stop(); } catch {}
      });
    } catch {}
    contextToClose.close().catch(() => {});
    cleanClosedContext();
  };

  const startAudio = async () => {
    if (!AudioContextClass || isRunning || isStarting || isStopping) return;
    isStarting = true;
    startButton.disabled = true;
    try {
      const context = new AudioContextClass();
      audioContext = context;
      await context.resume();
      if (audioContext !== context || document.hidden || !isInView) {
        if (audioContext === context) hardStopAudio();
        return;
      }
      const now = context.currentTime;
      const startAt = now + 0.02;
      const master = context.createGain();
      master.gain.setValueAtTime(1, now);
      master.connect(context.destination);
      masterGain = master;
      const frequencies = [220, 440, 660];
      const targets = targetGains();
      oscillators = [];
      partialGains = [];
      gainRamps = [];

      frequencies.forEach((frequency, index) => {
        const oscillator = context.createOscillator();
        const partialGain = context.createGain();
        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(frequency, startAt);
        partialGain.gain.setValueAtTime(0, startAt);
        partialGain.gain.linearRampToValueAtTime(targets[index], startAt + 0.3);
        oscillator.connect(partialGain);
        partialGain.connect(master);
        oscillator.start(startAt);
        oscillators.push(oscillator);
        partialGains.push(partialGain);
        gainRamps.push({ from: 0, to: targets[index], startedAt: startAt });
      });

      visualPhaseOriginMs = performance.now() + 20;
      isRunning = true;
      isStarting = false;
      startButton.disabled = true;
      stopButton.disabled = false;
      const silence = targets.every((gain) => gain === 0);
      setStatus(silence
        ? "합성음을 시작했습니다. 현재 세 겹의 비율은 모두 0이어서 조용합니다."
        : "220Hz 기본음과 두 배음을 작은 기준 신호로 합성 중입니다.");
      requestWaveFrame();
    } catch {
      if (audioContext) audioContext.close().catch(() => {});
      cleanClosedContext();
      isStarting = false;
      setStatus("이 브라우저에서 합성음을 시작하지 못했습니다. 파형과 기존 청취 기록은 그대로 볼 수 있습니다.");
    }
  };

  rangeInputs.forEach((input, index) => {
    input.disabled = false;
    input.addEventListener("input", () => {
      const value = Number(input.value);
      rangeOutputs[index].value = value.toFixed(2);
      rangeOutputs[index].textContent = value.toFixed(2);
      requestWaveFrame();
      if (audioContext && isRunning) {
        const now = audioContext.currentTime;
        const targets = targetGains();
        partialGains.forEach((gainNode, gainIndex) => rampPartialGain(gainNode, gainRamps[gainIndex], targets[gainIndex], now));
        setStatus(targets.every((gain) => gain === 0)
          ? "각 겹의 양이 0입니다. 합성음은 조용합니다."
          : "비율을 바꿔 세 겹의 합성음을 듣고 있습니다.");
      }
    });
  });

  startButton.addEventListener("click", () => { void startAudio(); });
  stopButton.addEventListener("click", () => stopAudio());
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (isStarting) hardStopAudio();
      else stopAudio("다른 탭으로 이동해 소리를 멈추고 있습니다.");
    }
  });
  window.addEventListener("pagehide", hardStopAudio);
  reducedMotion.addEventListener?.("change", requestWaveFrame);

  const visibilityObserver = new IntersectionObserver((entries) => {
    const entry = entries[0];
    isInView = Boolean(entry?.isIntersecting);
    document.body.classList.toggle("audio-harmonics-visible", isInView);
    if (!isInView) {
      if (isStarting) hardStopAudio();
      else stopAudio("화면을 벗어나 소리를 멈추고 있습니다.");
    }
    requestWaveFrame();
  }, { threshold: 0 });
  visibilityObserver.observe(musicHarmonics);

  startButton.disabled = !AudioContextClass;
  stopButton.disabled = true;
  if (!AudioContextClass) setStatus("이 브라우저에는 Web Audio가 없어 파형만 표시합니다.");
  rangeOutputs.forEach((output, index) => {
    const value = Number(rangeInputs[index].value);
    output.value = value.toFixed(2);
    output.textContent = value.toFixed(2);
  });
  requestWaveFrame();
}
