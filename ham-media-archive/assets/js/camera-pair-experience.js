const root = document.getElementById("camera-pair-experience");
const canvas = root?.querySelector("[data-camera-pair-canvas]");
const photoDetail = document.querySelector("#camera-photo-room .room-house-photo-detail");

if (photoDetail) {
  const addSceneLink = () => {
    const actions = photoDetail.querySelector(".room-gallery-detail-actions");
    if (!actions || actions.querySelector(".camera-detail-experience-link")) return;
    const link = document.createElement("a");
    link.className = "room-gallery-detail-button camera-detail-experience-link";
    link.href = "#camera-pair-experience";
    link.textContent = "두 렌즈의 시선 보기";
    const index = actions.querySelector(".room-gallery-detail-index");
    actions.insertBefore(link, index || null);
  };
  new MutationObserver(addSceneLink).observe(photoDetail, { childList: true, subtree: true });
  addSceneLink();
}

if (root && canvas) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pictures = [
    {
      state: "첫 번째 시선",
      title: "백마가 50mm를 봅니다.",
      description: "100mm 마크로 렌즈를 부르는 별명인 ‘백마’로 50mm 렌즈를 가까이 찍었습니다. 초점 링과 눈금이 사진에 남았습니다.",
      caption: "백마로 찍은 50mm",
      leftLabel: "백마 · 찍는 렌즈",
      rightLabel: "50mm · 찍히는 대상",
      direction: "→",
      photo: "../assets/images/cameras/camera-original-20260604-002-cyworld-image-002.jpg",
      alt: "백마로 찍은 50mm 렌즈의 초점 링과 거리 눈금",
    },
    {
      state: "돌아온 시선",
      title: "이번에는 50mm가 백마를 봅니다.",
      description: "책 위에 세워 둔 100mm 렌즈를 50mm 렌즈로 찍었습니다. 서로의 프레임 안에 들어온 두 렌즈가 제목의 농담을 만듭니다.",
      caption: "50mm로 찍은 백마",
      leftLabel: "백마 · 찍히는 대상",
      rightLabel: "50mm · 찍는 렌즈",
      direction: "←",
      photo: "../assets/images/cameras/camera-original-20260604-018-ef50mm1.4.jpg",
      alt: "50mm로 찍은 책 위의 백마 렌즈",
    },
    {
      state: "거울 안의 사람",
      title: "보는 사람도 프레임 안에 들어옵니다.",
      description: "마지막 거울 사진에는 촬영 렌즈가 적혀 있지 않습니다. 렌즈를 단정하지 않고, 카메라를 든 사람까지 한 장에 남은 사실로 닫습니다.",
      caption: "보는 사람과 찍는 사람이 같은 프레임 안에",
      leftLabel: "",
      rightLabel: "",
      direction: "설명용 렌즈 · 거울",
      photo: "../assets/images/cameras/gallery-camera-self-portrait.jpg",
      alt: "거울 앞에서 카메라를 든 사람의 자화상",
    },
  ];
  let index = 0;
  let renderer;
  let scene;
  let camera;
  let stageGroup;
  let lensA;
  let lensB;
  let mirror;
  let mirrorLensOutline;
  let beamA;
  let beamB;
  let active = false;
  let autoPlaying = false;
  let photoMode = false;
  let elapsed = 0;
  let raf = 0;
  let lastFrame = 0;
  let resizeObserver;

  const setText = (selector, value) => {
    const node = root.querySelector(selector);
    if (node) node.textContent = value;
  };

  const setStatus = (value) => setText("[data-camera-pair-status]", value);

  const isRootVisible = () => {
    const rect = root.getBoundingClientRect();
    const overlap = Math.max(0, Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0));
    return overlap / Math.max(rect.height, 1) > .2;
  };

  const setPhotoMode = (value) => {
    photoMode = Boolean(value);
    const image = root.querySelector("[data-camera-pair-image]");
    const stage = root.querySelector(".camera-pair-stage");
    const button = root.querySelector("[data-camera-pair-view]");
    if (image && stage) {
      image.hidden = !photoMode;
      image.classList.toggle("is-visible", photoMode);
      stage.classList.toggle("is-matchcut", photoMode);
    }
    if (button) {
      button.textContent = photoMode ? "설명 모형 보기" : "실제 사진 보기";
      button.setAttribute("aria-pressed", String(photoMode));
    }
  };

  const updateCopy = () => {
    const item = pictures[index];
    setText("[data-camera-pair-counter]", `0${index + 1} / 03`);
    setText("[data-camera-pair-caption]", item.caption);
    setText("[data-camera-pair-state]", item.state);
    setText("[data-camera-pair-title]", item.title);
    setText("[data-camera-pair-description]", item.description);
    setText("[data-camera-pair-left]", item.leftLabel);
    setText("[data-camera-pair-right]", item.rightLabel);
    setText("[data-camera-pair-direction]", item.direction);
    const labels = root.querySelector("[data-camera-pair-labels]");
    labels?.classList.toggle("is-mirror", index === 2);
    if (canvas) canvas.setAttribute("aria-label", `설명 모형: ${item.title} ${item.description}`);
    const prev = root.querySelector("[data-camera-pair-prev]");
    if (prev) prev.disabled = index === 0;
    const image = root.querySelector("[data-camera-pair-image]");
    if (image) {
      image.src = item.photo;
      image.alt = item.alt;
    }
    setPhotoMode(false);
  };

  const showStatic = () => {
    root.classList.add("is-static");
    canvas.setAttribute("hidden", "");
    root.querySelectorAll(".camera-pair-controls button").forEach((button) => { button.disabled = true; });
    setStatus("설명 모형을 열지 못했습니다. 아래 실제 사진과 캡션을 볼 수 있습니다.");
  };

  const resize = () => {
    if (!renderer || !camera) return;
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const ratio = width / height;
    camera.aspect = ratio;
    camera.fov = ratio < 1.05 ? 48 : 36;
    camera.position.set(0, ratio < 1.05 ? 5.1 : 4.1, ratio < 1.05 ? 8.4 : 7.2);
    camera.lookAt(0, 0.7, 0);
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
    render();
  };

  const render = () => {
    if (!renderer || !scene || !camera) return;
    renderer.render(scene, camera);
  };

  const makeLens = (THREE, name, x, tint, barrelScale = 1) => {
    const group = new THREE.Group();
    group.position.set(x, 0.9, 0.05);
    group.rotation.y = x < 0 ? Math.PI / 2 - .24 : -Math.PI / 2 + .24;
    const body = new THREE.MeshPhysicalMaterial({ color: 0x171a1a, metalness: 0.74, roughness: 0.32, envMapIntensity: 1.25, clearcoat: 0.32, clearcoatRoughness: 0.28 });
    const silver = new THREE.MeshPhysicalMaterial({ color: tint, metalness: 0.91, roughness: 0.23, envMapIntensity: 1.55, clearcoat: 0.2 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x080c0d, metalness: 0.32, roughness: 0.18 });
    const glass = new THREE.MeshPhysicalMaterial({ color: 0x53656a, metalness: 0.52, roughness: 0.09, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.9 });
    const cyl = (radiusTop, radiusBottom, length, z, material, segments = 64) => {
      const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, length, segments), material);
      mesh.rotation.x = Math.PI / 2;
      mesh.position.z = z;
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      return mesh;
    };
    cyl(0.38, 0.35, 0.72, -0.02, body);
    cyl(0.34, 0.31, 0.15, -0.46, silver);
    cyl(0.29, 0.27, 0.12, -0.59, dark);
    cyl(0.37, 0.35, 0.12, 0.4, silver);
    cyl(0.315, 0.315, 0.025, 0.466, dark);
    const lensGlass = new THREE.Mesh(new THREE.CircleGeometry(0.277, 64), glass);
    lensGlass.position.z = 0.482;
    group.add(lensGlass);
    for (let i = 0; i < 7; i += 1) {
      const groove = new THREE.Mesh(new THREE.TorusGeometry(i % 2 ? 0.357 : 0.365, 0.008, 5, 64), i % 2 ? dark : silver);
      groove.position.z = -0.25 + i * 0.058;
      group.add(groove);
    }
    const frontRing = new THREE.Mesh(new THREE.TorusGeometry(0.318, 0.013, 8, 72), silver);
    frontRing.position.z = 0.481;
    group.add(frontRing);
    const brandless = new THREE.Mesh(new THREE.BoxGeometry(0.23, 0.025, 0.035), dark);
    brandless.position.set(0, 0.24, -0.04);
    group.add(brandless);
    group.scale.z = barrelScale;
    group.userData.label = name;
    return group;
  };

  const makeBeam = (THREE, from, to, material) => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);
    const delta = new THREE.Vector3().subVectors(b, a);
    const geometry = new THREE.ConeGeometry(0.48, delta.length(), 48, 1, true);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(a).add(b).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), delta.clone().normalize().negate());
    mesh.visible = false;
    return mesh;
  };

  const init = async () => {
    try {
      canvas.hidden = false;
      const THREE = await import("../../jobs/pc-amp/shared/three.module.js");
      renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.08;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0x171918);
      scene.fog = new THREE.FogExp2(0x171918, 0.045);
      camera = new THREE.PerspectiveCamera(38, 1.62, 0.1, 40);
      camera.position.set(0, 4.1, 7.2);
      camera.lookAt(0, 0.7, 0);

      const env = document.createElement("canvas");
      env.width = 512;
      env.height = 256;
      const ctx = env.getContext("2d");
      const gradient = ctx.createLinearGradient(0, 0, 0, 256);
      gradient.addColorStop(0, "#e1d8c9"); gradient.addColorStop(.23, "#899296"); gradient.addColorStop(.52, "#3c4545"); gradient.addColorStop(1, "#111515");
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 512, 256);
      ctx.fillStyle = "rgba(255,247,230,.85)"; ctx.fillRect(70, 32, 82, 6); ctx.fillRect(322, 24, 128, 8);
      ctx.fillStyle = "rgba(255,255,255,.27)"; ctx.fillRect(80, 38, 5, 115); ctx.fillRect(400, 33, 8, 105);
      const envTexture = new THREE.CanvasTexture(env);
      envTexture.mapping = THREE.EquirectangularReflectionMapping;
      envTexture.colorSpace = THREE.SRGBColorSpace;
      scene.environment = envTexture;
      scene.environmentIntensity = 1.15;

      scene.add(new THREE.HemisphereLight(0xe1e4df, 0x24211e, 2.1));
      const key = new THREE.DirectionalLight(0xffead0, 3.3);
      key.position.set(-4, 7, 6); key.castShadow = true; key.shadow.mapSize.set(1024, 1024); scene.add(key);
      const fill = new THREE.DirectionalLight(0xc6d3d6, 1.55); fill.position.set(4, 3, -3); scene.add(fill);
      const rim = new THREE.PointLight(0xd0a366, 90, 10, 2); rim.position.set(0, 3.8, -1.5); scene.add(rim);

      stageGroup = new THREE.Group(); scene.add(stageGroup);
      stageGroup.scale.setScalar(1.13);
      const book = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.16, 2.9), new THREE.MeshStandardMaterial({ color: 0x777064, roughness: .84 }));
      book.position.set(0, .38, -.1); book.receiveShadow = true; stageGroup.add(book);
      const tabletop = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ color: 0x222421, roughness: .88 }));
      tabletop.rotation.x = -Math.PI / 2; tabletop.position.y = .28; tabletop.receiveShadow = true; stageGroup.add(tabletop);
      lensA = makeLens(THREE, "100mm 마크로 렌즈", -1.08, 0xc2c6c5, 1.6);
      lensB = makeLens(THREE, "50mm 렌즈", 1.08, 0xc9bca6);
      stageGroup.add(lensA, lensB);

      const mirrorMaterial = new THREE.MeshPhysicalMaterial({ color: 0xa2aaab, metalness: .92, roughness: .13, envMapIntensity: 1.55, clearcoat: .9, clearcoatRoughness: .08, side: THREE.DoubleSide });
      mirror = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 1.55), mirrorMaterial);
      mirror.position.set(0, 1.72, -1.2); mirror.rotation.y = .18; mirror.visible = false; stageGroup.add(mirror);
      const mirrorFrame = new THREE.Mesh(new THREE.BoxGeometry(2.02, 1.67, .09), new THREE.MeshStandardMaterial({ color: 0x5d5140, metalness: .72, roughness: .35 }));
      mirrorFrame.position.copy(mirror.position); mirrorFrame.position.z -= .07; mirrorFrame.rotation.y = .18; mirrorFrame.visible = false; stageGroup.add(mirrorFrame); mirror.userData.frame = mirrorFrame;

      mirrorLensOutline = new THREE.Group();
      mirrorLensOutline.position.set(0, 1.72, -1.12);
      mirrorLensOutline.rotation.y = .18;
      const reflectionInk = new THREE.MeshBasicMaterial({ color: 0xe6d0a7, transparent: true, opacity: .28, depthWrite: false });
      mirrorLensOutline.add(
        new THREE.Mesh(new THREE.TorusGeometry(.31, .009, 6, 64), reflectionInk),
        new THREE.Mesh(new THREE.TorusGeometry(.255, .006, 6, 64), reflectionInk.clone())
      );
      mirrorLensOutline.visible = false;
      stageGroup.add(mirrorLensOutline);

      const beamMaterial = new THREE.MeshBasicMaterial({ color: 0xe2b86f, transparent: true, opacity: .27, side: THREE.DoubleSide, depthWrite: false });
      beamA = makeBeam(THREE, [-.61, .9, .17], [.61, .9, .17], beamMaterial);
      beamB = makeBeam(THREE, [.61, .9, .17], [-.61, .9, .17], beamMaterial.clone());
      stageGroup.add(beamA, beamB);

      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(canvas);
      window.addEventListener("resize", resize, { passive: true });
      root.classList.add("is-webgl-ready");
      resize();
      applyStage();
      setActive(document.visibilityState === "visible" && isRootVisible());
    } catch (error) {
      console.warn("Camera pair scene fell back to the source photographs.", error);
      showStatic();
    }
  };

  const applyStage = () => {
    if (!stageGroup) return;
    if (lensA) lensA.visible = index !== 2;
    if (lensB) lensB.visible = true;
    if (beamA) beamA.visible = index === 0;
    if (beamB) beamB.visible = index === 1;
    if (mirror) {
      mirror.visible = index === 2;
      mirror.userData.frame.visible = index === 2;
    }
    if (mirrorLensOutline) mirrorLensOutline.visible = index === 2;
    if (index === 0) { lensA.position.set(-1.08, .9, .05); lensB.position.set(1.08, .9, .05); lensA.rotation.set(0, Math.PI / 2 - .24, 0); lensB.rotation.set(0, -Math.PI / 2 + .24, 0); }
    if (index === 1) { lensA.position.set(-1.08, .9, .05); lensB.position.set(1.08, .9, .05); lensA.rotation.set(0, Math.PI / 2 - .24, 0); lensB.rotation.set(0, -Math.PI / 2 + .24, 0); }
    if (index === 2) { lensB.position.set(0, .9, 1.16); lensB.rotation.set(0, Math.PI, 0); }
    render();
    updateCopy();
  };

  const setActive = (value) => {
    active = value;
    if (active && !reduceMotion.matches && !raf) {
      lastFrame = performance.now();
      raf = requestAnimationFrame(tick);
    } else if (!active && raf) {
      cancelAnimationFrame(raf); raf = 0;
    }
    if (!active && autoPlaying) stopAuto("화면 밖에서는 자동 장면을 멈췄습니다.");
    if (!active) render();
  };

  const stopAuto = (message = "") => {
    autoPlaying = false;
    elapsed = 0;
    root.setAttribute("data-auto-playing", "false");
    const button = root.querySelector("[data-camera-pair-stop]");
    if (button) button.disabled = true;
    if (message) setStatus(message);
  };

  const startAuto = () => {
    index = 0;
    elapsed = 0;
    if (reduceMotion.matches) {
      autoPlaying = false;
      root.setAttribute("data-auto-playing", "false");
      applyStage();
      setStatus("감속 설정에 따라 자동 움직임을 멈췄습니다. 장면과 사진을 직접 골라 볼 수 있습니다.");
      return;
    }
    autoPlaying = true;
    root.setAttribute("data-auto-playing", "true");
    const button = root.querySelector("[data-camera-pair-stop]");
    if (button) button.disabled = false;
    setStatus("15초 동안 설명 모형과 실제 사진이 차례로 이어집니다. 자동 전환을 멈출 수 있습니다.");
    applyStage();
    if (active && !reduceMotion.matches && !raf) raf = requestAnimationFrame(tick);
  };

  function tick(now) {
    if (!active || !renderer) { raf = 0; return; }
    const delta = Math.min(.08, Math.max(0, (now - lastFrame) / 1000));
    lastFrame = now;
    if (autoPlaying && !reduceMotion.matches) {
      elapsed += delta;
      const nextIndex = Math.min(2, Math.floor(elapsed / 5));
      if (nextIndex !== index) { index = nextIndex; applyStage(); }
      const stageElapsed = elapsed - nextIndex * 5;
      const photoShouldShow = stageElapsed >= 3.2;
      if (photoShouldShow !== photoMode) setPhotoMode(photoShouldShow);
      if (elapsed >= 15) {
        stopAuto("세 장면을 모두 보았습니다. 실제 사진과 설명 모형을 골라 다시 볼 수 있습니다.");
        setPhotoMode(true);
      }
    }
    const sway = reduceMotion.matches ? 0 : Math.sin(now * .00055) * .035;
    if (lensA && lensA.visible) lensA.rotation.z = sway;
    if (lensB && lensB.visible && index !== 2) lensB.rotation.z = -sway * .72;
    render();
    raf = requestAnimationFrame(tick);
  }

  root.querySelector("[data-camera-pair-prev]")?.addEventListener("click", () => {
    stopAuto("자동 전환을 멈췄습니다. 장면과 사진을 직접 고를 수 있습니다."); index = Math.max(0, index - 1); applyStage();
  });
  root.querySelector("[data-camera-pair-next]")?.addEventListener("click", () => {
    stopAuto("자동 전환을 멈췄습니다. 장면과 사진을 직접 고를 수 있습니다."); index = (index + 1) % pictures.length; applyStage();
  });
  root.querySelector("[data-camera-pair-view]")?.addEventListener("click", () => {
    stopAuto("자동 전환을 멈췄습니다. 설명 모형과 실제 사진을 직접 고릅니다.");
    setPhotoMode(!photoMode);
  });
  root.querySelector("[data-camera-pair-stop]")?.addEventListener("click", () => {
    stopAuto("자동 전환을 멈췄습니다. 장면과 사진을 직접 고를 수 있습니다.");
  });
  root.querySelector("[data-camera-pair-replay]")?.addEventListener("click", startAuto);

  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    if (entry?.isIntersecting && entry.intersectionRatio > .2) {
      setActive(true);
      if (!reduceMotion.matches && !autoPlaying && index === 0 && !root.dataset.hasEntered) {
        root.dataset.hasEntered = "true";
        startAuto();
      }
    } else setActive(false);
  }, { threshold: [.15, .25] });
  observer.observe(root);
  document.addEventListener("visibilitychange", () => setActive(document.visibilityState === "visible" && isRootVisible()));
  reduceMotion.addEventListener?.("change", () => {
    if (reduceMotion.matches) { stopAuto("감속 설정에 따라 자동 움직임을 멈췄습니다. 장면과 사진은 직접 고를 수 있습니다."); if (raf) cancelAnimationFrame(raf); raf = 0; render(); }
    else if (active && !raf) raf = requestAnimationFrame(tick);
  });

  updateCopy();
  init();
}
