const bicycleTerraceExperience = document.querySelector("[data-bicycle-terrace]");

if (bicycleTerraceExperience) {
  const bicycleStage = bicycleTerraceExperience.querySelector("[data-bicycle-climb-stage]");
  const bicycleCaption = bicycleTerraceExperience.querySelector("[data-bicycle-climb-caption]");
  const bicyclePedal = bicycleTerraceExperience.querySelector("[data-bicycle-pedal]");
  const bicycleArrive = bicycleTerraceExperience.querySelector("[data-bicycle-arrive]");
  const bicycleReplay = bicycleTerraceExperience.querySelector("[data-bicycle-replay]");
  const bicycleArrival = bicycleTerraceExperience.querySelector("[data-bicycle-arrival]");
  const bicycleRider = bicycleTerraceExperience.querySelector("[data-bicycle-rider]");
  const bicyclePath = bicycleTerraceExperience.querySelector("[data-bicycle-climb-path]");
  const bicycleBreath = bicycleTerraceExperience.querySelector(".bicycle-climb-breath");
  const bicycleReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let bicycleProgress = 0;
  let bicycleHolding = false;
  let bicycleFrame = 0;
  let bicycleLastTime = 0;
  let bicycleLastCaption = "";
  let bicycleInView = false;

  const bicycleSetCaption = (text) => {
    if (text === bicycleLastCaption) return;
    bicycleLastCaption = text;
    bicycleCaption.textContent = text;
  };

  const bicycleRender = () => {
    bicycleStage.style.setProperty("--ride-progress", String(bicycleProgress));
    const point = bicyclePath.getPointAtLength(bicyclePath.getTotalLength() * bicycleProgress);
    const viewBox = bicyclePath.ownerSVGElement.viewBox.baseVal;
    bicycleRider.style.left = `${(point.x / viewBox.width) * 100}%`;
    bicycleRider.style.top = `${(point.y / viewBox.height) * 100}%`;
    const breathScale = bicycleHolding && !bicycleReducedMotion.matches
      ? 0.76 + Math.sin(bicycleProgress * Math.PI * 14) * 0.24
      : 1;
    bicycleBreath.style.setProperty("--breath-scale", String(breathScale));

    if (bicycleProgress >= 1) {
      bicycleSetCaption("테라스에 닿았습니다.");
      const arrivalWasHidden = bicycleArrival.hidden;
      bicycleArrival.hidden = false;
      if (arrivalWasHidden) {
        requestAnimationFrame(() => {
          bicycleArrival.scrollIntoView({ behavior: "smooth", block: "center" });
          bicycleArrival.focus({ preventScroll: true });
        });
      }
      bicyclePedal.disabled = true;
      bicycleArrive.disabled = true;
      bicycleReplay.hidden = false;
      bicycleReplay.disabled = false;
    } else if (bicycleProgress >= 0.55) {
      bicycleArrival.hidden = true;
      bicycleSetCaption("언덕을 오르는 중입니다. 준비된 테라스가 가까워집니다.");
    } else if (bicycleProgress > 0.02) {
      bicycleArrival.hidden = true;
      bicycleSetCaption("길 쪽에서는 이 언덕을 넘어올 손님을 떠올립니다.");
    } else {
      bicycleArrival.hidden = true;
      bicycleSetCaption("주인은 자전거를 세울 자리를 마련했습니다. 길 쪽에서는 언덕을 올라오는 손님을 떠올립니다.");
    }
  };

  const bicycleFinishHold = () => {
    if (!bicycleHolding) return;
    bicycleHolding = false;
    if (bicycleFrame) cancelAnimationFrame(bicycleFrame);
    bicycleFrame = 0;
    bicycleLastTime = 0;
    bicycleBreath.style.setProperty("--breath-scale", "1");
  };

  const bicycleStep = (timestamp) => {
    if (!bicycleHolding || !bicycleInView || document.hidden) {
      bicycleFinishHold();
      return;
    }
    if (!bicycleLastTime) bicycleLastTime = timestamp;
    const elapsed = Math.min(64, timestamp - bicycleLastTime);
    bicycleLastTime = timestamp;
    bicycleProgress = Math.min(1, bicycleProgress + elapsed / 14000);
    bicycleRender();
    if (bicycleProgress < 1) {
      bicycleFrame = requestAnimationFrame(bicycleStep);
    } else {
      bicycleFinishHold();
    }
  };

  const bicycleStartHold = () => {
    if (bicycleProgress >= 1 || !bicycleInView || bicycleTerraceExperience.closest("[hidden]")) return;
    if (bicycleReducedMotion.matches) {
      bicycleProgress = 1;
      bicycleRender();
      return;
    }
    if (bicycleHolding) return;
    bicycleHolding = true;
    bicycleFrame = requestAnimationFrame(bicycleStep);
  };

  const bicycleComplete = () => {
    bicycleFinishHold();
    bicycleProgress = 1;
    bicycleRender();
  };

  const bicycleReset = () => {
    bicycleFinishHold();
    bicycleProgress = 0;
    bicyclePedal.disabled = false;
    bicycleArrive.disabled = false;
    bicycleReplay.hidden = true;
    bicycleReplay.disabled = true;
    bicycleRender();
  };

  bicyclePedal.disabled = false;
  bicycleArrive.disabled = false;
  bicycleReplay.disabled = true;
  bicycleTerraceExperience.classList.add("has-bicycle-motion");
  bicyclePedal.addEventListener("pointerdown", (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    try { bicyclePedal.setPointerCapture(event.pointerId); } catch {}
    bicycleStartHold();
  });
  bicyclePedal.addEventListener("pointerup", bicycleFinishHold);
  bicyclePedal.addEventListener("pointercancel", bicycleFinishHold);
  bicyclePedal.addEventListener("lostpointercapture", bicycleFinishHold);
  bicyclePedal.addEventListener("contextmenu", (event) => event.preventDefault());
  bicyclePedal.addEventListener("keydown", (event) => {
    if (event.code !== "Space" || event.repeat) return;
    event.preventDefault();
    bicycleStartHold();
  });
  bicyclePedal.addEventListener("keyup", (event) => {
    if (event.code === "Space") {
      event.preventDefault();
      bicycleFinishHold();
    }
  });
  bicyclePedal.addEventListener("blur", bicycleFinishHold);
  window.addEventListener("blur", bicycleFinishHold);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) bicycleFinishHold();
  });
  bicycleArrive.addEventListener("click", bicycleComplete);
  bicycleReplay.addEventListener("click", bicycleReset);

  const bicycleObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      bicycleInView = entry.isIntersecting && entry.intersectionRatio > 0;
      if (!bicycleInView) bicycleFinishHold();
    });
  }, { threshold: [0, 0.08] });
  bicycleObserver.observe(bicycleTerraceExperience);

  const bicycleResizeObserver = new ResizeObserver(() => bicycleRender());
  bicycleResizeObserver.observe(bicycleStage);

  bicycleRender();
}
