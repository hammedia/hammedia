const stage = document.querySelector("[data-space-eye-stage]");

if (stage) {
  const canvas = stage.querySelector("[data-space-eye-canvas]");
  const controls = Array.from(document.querySelectorAll("[data-space-eye-view]"));
  const status = document.querySelector("[data-space-eye-status]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let visible = false;
  let started = false;
  let renderer;
  let scene;
  let camera;
  let THREE;
  let initPromise;
  let targetLook = null;
  let transitionFrame = 0;
  let seatedHead;

  function selectedView() {
    return stage.dataset.view === "seated" ? "seated" : "standing";
  }

  function syncControls(view) {
    stage.dataset.view = view;
    controls.forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.spaceEyeView === view)));
    if (status) status.textContent = view === "seated"
      ? "앉은 사람의 시점에서 탁자 위 범용 판을 보는 모형입니다."
      : "바깥에서 좌석과 탁자를 보는 모형입니다.";
    if (canvas) canvas.setAttribute("aria-label", view === "seated"
      ? "앉은 사람의 머리 위치에서 탁자 위 범용 판을 보는 설명용 3D 모형"
      : "바깥에서 좌석과 탁자를 보는 설명용 3D 모형");
  }

  const cameraViews = {
    standing: { position: [3.15, 3.25, 5.05], target: [0, 1.02, 0] },
    seated: { position: [-0.84, 1.56, 0.19], target: [0.72, 1.08, 0.34] }
  };

  function renderIfVisible() {
    if (renderer && visible && !document.hidden) renderer.render(scene, camera);
  }

  function applyCamera(view, animate = false) {
    if (!camera || !THREE) return;
    const destination = cameraViews[view];
    const nextPosition = new THREE.Vector3(...destination.position);
    const nextLook = new THREE.Vector3(...destination.target);
    if (!animate || reducedMotion.matches || !visible || document.hidden) {
      if (transitionFrame) cancelAnimationFrame(transitionFrame);
      transitionFrame = 0;
      camera.position.copy(nextPosition);
      camera.lookAt(nextLook);
      targetLook = nextLook;
      renderIfVisible();
      return;
    }
    if (transitionFrame) cancelAnimationFrame(transitionFrame);
    const fromPosition = camera.position.clone();
    const fromLook = targetLook ? targetLook.clone() : new THREE.Vector3(...cameraViews.standing.target);
    const startedAt = performance.now();
    const duration = 620;
    const step = (now) => {
      transitionFrame = 0;
      if (!visible || document.hidden) {
        camera.position.copy(nextPosition);
        camera.lookAt(nextLook);
        targetLook = nextLook;
        return;
      }
      const progress = Math.min(1, (now - startedAt) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(fromPosition, nextPosition, eased);
      const currentLook = fromLook.clone().lerp(nextLook, eased);
      camera.lookAt(currentLook);
      targetLook = currentLook;
      renderIfVisible();
      if (progress < 1) transitionFrame = requestAnimationFrame(step);
      else targetLook = nextLook;
    };
    transitionFrame = requestAnimationFrame(step);
  }

  function box(w, h, d, material, x, y, z, radius = 0) {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);
    return mesh;
  }

  function contact(x, z, width, depth, alpha = 0.28) {
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const context = shadowCanvas.getContext("2d");
    const gradient = context.createRadialGradient(64, 64, 8, 64, 64, 62);
    gradient.addColorStop(0, `rgba(20,25,26,${alpha})`);
    gradient.addColorStop(0.62, `rgba(20,25,26,${alpha * 0.33})`);
    gradient.addColorStop(1, "rgba(20,25,26,0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    const texture = new THREE.CanvasTexture(shadowCanvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    const shadow = new THREE.Mesh(new THREE.PlaneGeometry(width, depth), new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false }));
    shadow.rotation.x = -Math.PI / 2;
    shadow.position.set(x, 0.014, z);
    scene.add(shadow);
  }

  function cylinderBetween(from, to, radius, material) {
    const start = new THREE.Vector3(...from);
    const end = new THREE.Vector3(...to);
    const direction = new THREE.Vector3().subVectors(end, start);
    const geometry = new THREE.CapsuleGeometry(radius, Math.max(0.02, direction.length() - radius * 2), 4, 8);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(start).add(end).multiplyScalar(0.5);
    mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
    mesh.castShadow = true;
    scene.add(mesh);
    return mesh;
  }

  function sofa(x, z, scale = 1, material) {
    const seat = new THREE.Group();
    const width = 1.18 * scale;
    const cushion = box(width, 0.2 * scale, 0.88 * scale, material, x, 0.56 * scale, z);
    const back = box(width * 0.96, 1.05 * scale, 0.18 * scale, material, x, 1.13 * scale, z - 0.38 * scale);
    back.rotation.x = -0.08;
    const frame = new THREE.MeshStandardMaterial({ color: 0x6b655d, roughness: 0.68 });
    for (const dx of [-0.49, 0.49]) {
      for (const dz of [-0.34, 0.34]) {
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.065, 0.55 * scale, 12), frame);
        leg.position.set(x + dx * scale, 0.28 * scale, z + dz * scale);
        leg.castShadow = true;
        scene.add(leg);
      }
    }
    seat.add(cushion, back);
    scene.add(seat);
    contact(x, z, 1.8 * scale, 1.45 * scale);
  }

  function person(x, z, material) {
    const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.21, 0.45, 8, 12), material);
    torso.position.set(x, 1.16, z + 0.05);
    torso.rotation.z = -0.07;
    torso.castShadow = true;
    scene.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 18), material);
    head.position.set(x + 0.01, 1.65, z + 0.06);
    head.castShadow = true;
    scene.add(head);
    cylinderBetween([x, 0.96, z + 0.12], [x + 0.57, 0.82, z + 0.2], 0.11, material);
    cylinderBetween([x + 0.57, 0.82, z + 0.2], [x + 0.7, 0.3, z + 0.28], 0.085, material);
    cylinderBetween([x + 0.04, 0.96, z - 0.1], [x + 0.57, 0.82, z - 0.02], 0.11, material);
    cylinderBetween([x + 0.57, 0.82, z - 0.02], [x + 0.7, 0.3, z + 0.02], 0.085, material);
    cylinderBetween([x - 0.12, 1.32, z + 0.12], [x + 0.34, 1.06, z + 0.18], 0.075, material);
    cylinderBetween([x + 0.34, 1.06, z + 0.18], [x + 0.57, 1.02, z + 0.22], 0.055, material);
    cylinderBetween([x + 0.1, 1.31, z - 0.08], [x + 0.44, 1.06, z - 0.02], 0.075, material);
    cylinderBetween([x + 0.44, 1.06, z - 0.02], [x + 0.57, 1.02, z + 0.02], 0.055, material);
    return head;
  }

  function lights() {
    scene.add(new THREE.HemisphereLight(0xfaf5eb, 0x8c8072, 2.05));
    const key = new THREE.DirectionalLight(0xfff2df, 3.1);
    key.position.set(-3.4, 5.2, 4.2);
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    key.shadow.camera.left = -4;
    key.shadow.camera.right = 4;
    key.shadow.camera.top = 4;
    key.shadow.camera.bottom = -4;
    key.shadow.bias = -0.0004;
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xe3eff5, 1.25);
    fill.position.set(3.6, 3.3, -3.5);
    scene.add(fill);
  }

  function persp(aspect) {
    const view = new THREE.PerspectiveCamera(36, aspect, 0.1, 100);
    const setting = cameraViews[selectedView()];
    view.position.set(...setting.position);
    view.lookAt(...setting.target);
    view.updateMatrixWorld();
    return view;
  }

  function buildModel() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xeae4da);
    scene.fog = new THREE.Fog(0xeae4da, 8, 18);
    lights();
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0xcfc2b1, roughness: 0.92 });
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xeeeae2, roughness: 0.96 });
    const seatMaterial = new THREE.MeshStandardMaterial({ color: 0x829391, roughness: 0.88 });
    const personMaterial = new THREE.MeshStandardMaterial({ color: 0x5e6665, roughness: 0.86 });
    const tableMaterial = new THREE.MeshStandardMaterial({ color: 0xa38159, roughness: 0.72 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(5.8, 4), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);
    box(5.6, 2.7, 0.12, wallMaterial, 0, 1.34, -1.55);
    sofa(-0.92, -0.04, 1, seatMaterial);
    seatedHead = person(-0.92, 0.12, personMaterial);
    seatedHead.visible = selectedView() !== "seated";
    box(1.16, 0.1, 0.78, tableMaterial, 0.72, 1.03, 0.34);
    const boardFrame = new THREE.MeshStandardMaterial({ color: 0x4f5a55, roughness: 0.67 });
    const boardSurface = new THREE.MeshStandardMaterial({ color: 0xc4cec4, roughness: 0.78 });
    box(0.62, 0.035, 0.42, boardFrame, 0.72, 1.105, 0.34);
    box(0.54, 0.009, 0.34, boardSurface, 0.72, 1.127, 0.34);
    const tableLegMaterial = new THREE.MeshStandardMaterial({ color: 0x75634f, roughness: 0.78 });
    for (const x of [0.24, 1.2]) for (const z of [0.05, 0.63]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 1.02, 12), tableLegMaterial);
      leg.position.set(x, 0.51, z);
      leg.castShadow = true;
      scene.add(leg);
    }
    contact(0.72, 0.34, 1.65, 1.12, 0.24);
    const windowFrame = new THREE.MeshStandardMaterial({ color: 0xd4cdc0, roughness: 0.76 });
    box(1.3, 1.25, 0.05, windowFrame, 1.75, 1.55, -1.46);
    const windowGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.12, 1.06), new THREE.MeshBasicMaterial({ color: 0xcbd9d7 }));
    windowGlass.position.set(1.75, 1.55, -1.42);
    scene.add(windowGlass);
  }

  function resize() {
    if (!renderer || !stage) return;
    const rect = stage.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) return;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(rect.width, rect.height, false);
    camera.aspect = rect.width / rect.height;
    camera.updateProjectionMatrix();
    renderIfVisible();
  }

  async function initialize() {
    if (started) return Promise.resolve(true);
    if (initPromise) return initPromise;
    initPromise = (async () => {
      try {
        THREE = await import("../../jobs/pc-amp/shared/three.module.js");
        renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "low-power" });
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        renderer.toneMapping = THREE.ACESFilmicToneMapping;
        renderer.toneMappingExposure = 1;
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        buildModel();
        camera = persp(Math.max(1, stage.clientWidth / stage.clientHeight));
        targetLook = new THREE.Vector3(...cameraViews[selectedView()].target);
        stage.classList.add("is-webgl");
        started = true;
        resize();
        stage.querySelector("canvas")?.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          stage.classList.remove("is-webgl");
          if (status) status.textContent = "3D 모형을 정적 그림으로 보여줍니다.";
        });
        return true;
      } catch (error) {
        console.warn("Space view model unavailable; keeping its static illustration.", error);
        stage.classList.remove("is-webgl");
        if (status) status.textContent = "3D 모형을 불러오지 못해 정적 그림으로 보여줍니다.";
        return false;
      }
    })();
    return initPromise;
  }

  function setView(view) {
    if (!cameraViews[view]) return;
    const oldView = selectedView();
    syncControls(view);
    if (seatedHead) seatedHead.visible = view !== "seated";
    if (oldView === view) return;
    if (visible && !document.hidden) initialize().then((ready) => {
      if (ready) applyCamera(view, true);
    });
  }

  controls.forEach((button) => button.addEventListener("click", () => setView(button.dataset.spaceEyeView)));
  syncControls("standing");
  const observer = new IntersectionObserver((entries) => {
    const entry = entries[0];
    visible = Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.1);
    if (!visible) {
      if (transitionFrame) cancelAnimationFrame(transitionFrame);
      transitionFrame = 0;
      if (camera) applyCamera(selectedView(), false);
      return;
    }
    initialize().then((ready) => { if (ready) renderIfVisible(); });
  }, { threshold: [0, 0.1, 0.35] });
  observer.observe(stage);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(stage);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && transitionFrame) {
      cancelAnimationFrame(transitionFrame);
      transitionFrame = 0;
      if (camera) applyCamera(selectedView(), false);
    } else if (!document.hidden && visible) renderIfVisible();
  });
}
