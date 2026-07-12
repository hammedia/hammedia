const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector("#site-nav");

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const isOpen = siteNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      siteNav.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const starTrackingLabels = {
  fountain: "만년필별",
  motorcycle: "바이크별",
  travel: "여행별",
  bike: "자전거별",
  space: "공간별",
  car: "자동차별",
  food: "음식별",
  audio: "음악·오디오별",
  camera: "카메라별"
};

const starIdAliases = {
  bicycle: "bike",
  "music-audio": "audio"
};

function trackHamEvent(eventName, params = {}) {
  if (typeof window.gtag !== "function") return;

  window.gtag("event", eventName, {
    transport_type: "beacon",
    source_page: window.location.pathname || "/",
    ...params
  });
}

function cleanTrackingText(text = "") {
  return text.replace(/\s+/g, " ").trim();
}

function normalizeStarId(rawStarId = "") {
  return starIdAliases[rawStarId] || rawStarId;
}

function getHomeStarTrackingData(star) {
  const starId = normalizeStarId(star?.dataset.star || "");
  const starLabel = cleanTrackingText(star?.querySelector(".star-label")?.textContent || starTrackingLabels[starId] || starId);

  return {
    star_id: starId,
    star_label: starLabel
  };
}

function getHousePageStarTrackingData(housePage) {
  const articleTarget = housePage?.dataset.articleHouseTarget || "";
  const rawStarId = articleTarget.replace(/-writing-room$/, "");
  const starId = normalizeStarId(rawStarId);

  return {
    star_id: starId,
    star_label: starTrackingLabels[starId] || cleanTrackingText(document.title.replace(/\|.*$/, "")) || starId
  };
}

function getEntryTrackingData(targetId = "", fallbackLabel = "") {
  if (targetId.includes("writing")) {
    return { entry_type: "sentence", entry_label: "문장" };
  }

  if (targetId.includes("photo")) {
    return { entry_type: "scene", entry_label: "장면" };
  }

  if (targetId.includes("map")) {
    return { entry_type: "map", entry_label: "지도" };
  }

  return {
    entry_type: "constellation",
    entry_label: cleanTrackingText(fallbackLabel) || "별자리"
  };
}

function trackStarEntryClick(housePage, targetId, fallbackLabel = "") {
  if (!housePage || !targetId) return;

  trackHamEvent("star_entry_click", {
    ...getHousePageStarTrackingData(housePage),
    ...getEntryTrackingData(targetId, fallbackLabel),
    target_id: targetId
  });
}

function getBusinessCtaData(link) {
  const href = link?.getAttribute("href") || "";
  const targetUrl = link?.href || href;
  const label = cleanTrackingText(link?.textContent || link?.getAttribute("aria-label") || "");

  if (!href || href.startsWith("#")) return null;

  if (href.startsWith("mailto:")) {
    return {
      eventName: "contact_click",
      params: {
        contact_type: "email",
        cta_label: label,
        target_url: targetUrl
      }
    };
  }

  if (targetUrl.includes("tally.so/")) {
    return {
      eventName: "contact_click",
      params: {
        contact_type: "form",
        cta_label: label,
        target_url: targetUrl
      }
    };
  }

  const ctaMap = [
    { id: "academy", test: (url) => url.includes("/academy/") },
    { id: "portfolio", test: (url) => url.includes("/portfolio/") },
    { id: "work", test: (url) => url.includes("ham-media-work.html") },
    { id: "contact", test: (url) => url.includes("contact.html") }
  ];
  const match = ctaMap.find((item) => item.test(targetUrl));
  if (!match) return null;

  return {
    eventName: "business_cta_click",
    params: {
      cta_id: match.id,
      cta_label: label,
      target_url: targetUrl
    }
  };
}

document.addEventListener("click", (event) => {
  const starListLink = event.target.closest(".room-house-page a[href='#star-list']");
  if (starListLink) {
    trackStarEntryClick(starListLink.closest(".room-house-page"), "star-list", starListLink.textContent);
    return;
  }

  const ctaLink = event.target.closest("a[href]");
  const ctaData = getBusinessCtaData(ctaLink);
  if (!ctaData) return;

  trackHamEvent(ctaData.eventName, ctaData.params);
});

document.querySelectorAll(".world-door, .contact-link, .back-link").forEach((target) => {
  target.addEventListener("pointerdown", () => {
    target.classList.remove("is-rippling");
    window.requestAnimationFrame(() => {
      target.classList.add("is-rippling");
    });
  });

  target.addEventListener("transitionend", (event) => {
    if (event.propertyName === "opacity") {
      target.classList.remove("is-rippling");
    }
  });
});

const constellationInkColors = {
  fountain: "#0B0F14",
  motorcycle: "#0F0C0B",
  travel: "#4F6472",
  bike: "#3F4347",
  space: "#2B2B2A",
  car: "#0D0E10",
  food: "#F5F0E8",
  audio: "#111318",
  camera: "#0B0D0F"
};

const constellationStars = Array.from(document.querySelectorAll(".constellation-star"));
const constellationWindow = document.querySelector(".constellation-window");
let activeStar = null;
let isEnteringStar = false;
let starEnterTimer = null;

function createBackgroundStars() {
  if (!constellationWindow || constellationWindow.querySelector(".bg-star")) return;

  const clusters = [
    { x: 22, y: 24, spread: 16 },
    { x: 74, y: 20, spread: 20 },
    { x: 38, y: 74, spread: 18 },
    { x: 82, y: 72, spread: 14 }
  ];

  for (let i = 0; i < 112; i += 1) {
    const star = document.createElement("span");
    const cluster = Math.random() < 0.58
      ? clusters[Math.floor(Math.random() * clusters.length)]
      : null;
    const left = cluster
      ? cluster.x + (Math.random() - 0.5) * cluster.spread
      : Math.random() * 100;
    const top = cluster
      ? cluster.y + (Math.random() - 0.5) * cluster.spread
      : Math.random() * 100;
    const size = 1 + Math.random() * 1.5;

    star.className = "bg-star";
    star.style.left = `${Math.max(0, Math.min(100, left))}%`;
    star.style.top = `${Math.max(0, Math.min(100, top))}%`;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.opacity = `${0.12 + Math.random() * 0.33}`;
    constellationWindow.appendChild(star);
  }
}

function createUniverseExperience() {
  const spaceCanvas = document.querySelector("#universe-space");
  const inkCanvas = document.querySelector("#universe-ink");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  if (!spaceCanvas || !inkCanvas) {
    return { enter: (_source, _color, done) => done(), reset: () => {} };
  }

  const spaceContext = spaceCanvas.getContext("2d");
  const starLayers = [
    { count: 420, size: [0.4, 1.1], parallax: 10, drift: 0.0022, twinkle: 0.7 },
    { count: 220, size: [0.7, 1.7], parallax: 22, drift: 0.0042, twinkle: 1 },
    { count: 90, size: [1, 2.5], parallax: 40, drift: 0.0075, twinkle: 1.4 }
  ];
  const starFields = starLayers.map((layer) => Array.from({ length: layer.count }, () => ({
    x: Math.random(),
    y: Math.random(),
    radius: layer.size[0] + Math.random() * (layer.size[1] - layer.size[0]),
    phase: Math.random() * Math.PI * 2,
    speed: 0.5 + Math.random() * 1.5,
    color: Math.random() < 0.08 ? "#ffd9b0" : (Math.random() < 0.12 ? "#bcd2ff" : "#eef2ff")
  })));
  const nebulaCanvas = document.createElement("canvas");
  nebulaCanvas.width = 512;
  nebulaCanvas.height = 512;
  const nebulaContext = nebulaCanvas.getContext("2d");
  const nebulaBlobs = [
    [180, 170, 150, "38,52,120", 0.55], [330, 140, 120, "70,40,110", 0.42],
    [140, 330, 140, "22,78,105", 0.4], [360, 330, 150, "88,34,86", 0.32],
    [255, 250, 210, "30,40,88", 0.35], [90, 120, 90, "18,60,80", 0.3]
  ];
  nebulaBlobs.forEach(([x, y, radius, rgb, alpha]) => {
    const gradient = nebulaContext.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, `rgba(${rgb},${alpha})`);
    gradient.addColorStop(1, `rgba(${rgb},0)`);
    nebulaContext.fillStyle = gradient;
    nebulaContext.fillRect(0, 0, 512, 512);
  });

  let width = 0;
  let height = 0;
  let pointerX = 0.5;
  let pointerY = 0.5;
  let lastFrame = performance.now();
  let universeTime = 0;
  let meteor = null;
  let meteorWait = 3;
  let transitionFrame = 0;
  let transitionDone = null;
  let transitionStart = 0;
  let transitionOrigin = [0.5, 0.5];
  let inkLight = [0.75, 0.82, 1];
  let inkDeep = [0.32, 0.57, 0.87];
  let swirlDirection = 1;

  function resizeSpace() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    spaceCanvas.width = Math.round(width * dpr);
    spaceCanvas.height = Math.round(height * dpr);
    spaceContext.setTransform(dpr, 0, 0, dpr, 0, 0);
    resizeFluid();
  }

  function drawSpace(now) {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    universeTime += dt;
    if (!document.hidden && !reducedMotion.matches) {
      spaceContext.fillStyle = "#05070f";
      spaceContext.fillRect(0, 0, width, height);
      const px = pointerX - 0.5;
      const py = pointerY - 0.5;
      const nebulaSize = Math.max(width, height) * 1.4;
      spaceContext.save();
      spaceContext.globalCompositeOperation = "screen";
      spaceContext.globalAlpha = 0.88;
      spaceContext.translate(width / 2 - px * 26, height / 2 - py * 26);
      spaceContext.rotate(universeTime * 0.004);
      spaceContext.drawImage(nebulaCanvas, -nebulaSize / 2, -nebulaSize / 2, nebulaSize, nebulaSize);
      spaceContext.restore();

      starLayers.forEach((layer, layerIndex) => {
        starFields[layerIndex].forEach((star) => {
          star.x = (star.x + layer.drift * dt) % 1;
          const x = star.x * width - px * layer.parallax;
          const y = star.y * height - py * layer.parallax;
          spaceContext.globalAlpha = 0.55 + 0.45 * Math.sin(universeTime * star.speed * layer.twinkle + star.phase);
          spaceContext.fillStyle = star.color;
          spaceContext.beginPath();
          spaceContext.arc(x, y, star.radius, 0, Math.PI * 2);
          spaceContext.fill();
        });
      });
      spaceContext.globalAlpha = 1;
      meteorWait -= dt;
      if (!meteor && meteorWait <= 0) {
        meteorWait = 6 + Math.random() * 9;
        const angle = Math.PI * (0.15 + Math.random() * 0.2);
        meteor = { x: Math.random() * width * 0.8, y: Math.random() * height * 0.3, vx: Math.cos(angle) * 900, vy: Math.sin(angle) * 900, life: 0.8 };
      }
      if (meteor) {
        meteor.x += meteor.vx * dt;
        meteor.y += meteor.vy * dt;
        meteor.life -= dt;
        const gradient = spaceContext.createLinearGradient(meteor.x, meteor.y, meteor.x - meteor.vx * 0.09, meteor.y - meteor.vy * 0.09);
        gradient.addColorStop(0, "rgba(255,255,255,.95)");
        gradient.addColorStop(1, "rgba(255,255,255,0)");
        spaceContext.strokeStyle = gradient;
        spaceContext.lineWidth = 1.6;
        spaceContext.beginPath();
        spaceContext.moveTo(meteor.x, meteor.y);
        spaceContext.lineTo(meteor.x - meteor.vx * 0.09, meteor.y - meteor.vy * 0.09);
        spaceContext.stroke();
        if (meteor.life <= 0) meteor = null;
      }
    }
    requestAnimationFrame(drawSpace);
  }

  window.addEventListener("pointermove", (event) => {
    pointerX = event.clientX / Math.max(width, 1);
    pointerY = event.clientY / Math.max(height, 1);
  }, { passive: true });

  const gl = inkCanvas.getContext("webgl2", { alpha: true, premultipliedAlpha: true, depth: false, stencil: false, antialias: false });
  let fluidReady = Boolean(gl && gl.getExtension("EXT_color_buffer_float"));
  let quad;
  let vertexShader;
  let programs = {};
  let simWidth = 0;
  let simHeight = 0;
  let dyeWidth = 0;
  let dyeHeight = 0;
  let velocity;
  let dye;
  let pressure;
  let divergence;
  let curl;

  function compileShader(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
    return shader;
  }

  function createProgram(fragmentSource) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, compileShader(gl.FRAGMENT_SHADER, fragmentSource));
    gl.bindAttribLocation(program, 0, "aPos");
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    const uniforms = {};
    for (let index = 0; index < gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS); index += 1) {
      const info = gl.getActiveUniform(program, index);
      uniforms[info.name] = gl.getUniformLocation(program, info.name);
    }
    return { program, uniforms };
  }

  function initPrograms() {
    vertexShader = compileShader(gl.VERTEX_SHADER, `#version 300 es
      precision highp float; in vec2 aPos; out vec2 vUv; out vec2 vL; out vec2 vR; out vec2 vT; out vec2 vB; uniform vec2 texel;
      void main(){ vUv=aPos*.5+.5; vL=vUv-vec2(texel.x,0.); vR=vUv+vec2(texel.x,0.); vT=vUv+vec2(0.,texel.y); vB=vUv-vec2(0.,texel.y); gl_Position=vec4(aPos,0.,1.); }`);
    const head = `#version 300 es
      precision highp float; precision highp sampler2D; in vec2 vUv; in vec2 vL; in vec2 vR; in vec2 vT; in vec2 vB; out vec4 frag;`;
    programs.splat = createProgram(head + `uniform sampler2D uTarget; uniform float aspect; uniform vec2 point; uniform vec3 color; uniform float radius;
      void main(){ vec2 d=vUv-point; d.x*=aspect; float a=exp(-dot(d,d)/radius); frag=vec4(texture(uTarget,vUv).xyz+color*a,1.); }`);
    programs.advect = createProgram(head + `uniform sampler2D uVel; uniform sampler2D uSrc; uniform float dt; uniform float diss; uniform vec2 texel;
      void main(){ vec2 coord=vUv-dt*texture(uVel,vUv).xy*texel; frag=texture(uSrc,coord)*(1./(1.+diss*dt)); }`);
    programs.divergence = createProgram(head + `uniform sampler2D uVel; void main(){ float l=texture(uVel,vL).x,r=texture(uVel,vR).x,t=texture(uVel,vT).y,b=texture(uVel,vB).y; frag=vec4(.5*(r-l+t-b),0.,0.,1.); }`);
    programs.curl = createProgram(head + `uniform sampler2D uVel; void main(){ float l=texture(uVel,vL).y,r=texture(uVel,vR).y,t=texture(uVel,vT).x,b=texture(uVel,vB).x; frag=vec4(r-l-t+b,0.,0.,1.); }`);
    programs.vorticity = createProgram(head + `uniform sampler2D uVel; uniform sampler2D uCurl; uniform float amount; uniform float dt;
      void main(){ float l=texture(uCurl,vL).x,r=texture(uCurl,vR).x,t=texture(uCurl,vT).x,b=texture(uCurl,vB).x,c=texture(uCurl,vUv).x; vec2 f=.5*vec2(abs(t)-abs(b),abs(r)-abs(l)); f/=(length(f)+1e-4); f*=amount*c; f.y*=-1.; frag=vec4(texture(uVel,vUv).xy+f*dt,0.,1.); }`);
    programs.pressure = createProgram(head + `uniform sampler2D uPressure; uniform sampler2D uDivergence;
      void main(){ float l=texture(uPressure,vL).x,r=texture(uPressure,vR).x,t=texture(uPressure,vT).x,b=texture(uPressure,vB).x; frag=vec4((l+r+t+b-texture(uDivergence,vUv).x)*.25,0.,0.,1.); }`);
    programs.gradient = createProgram(head + `uniform sampler2D uPressure; uniform sampler2D uVel;
      void main(){ float l=texture(uPressure,vL).x,r=texture(uPressure,vR).x,t=texture(uPressure,vT).x,b=texture(uPressure,vB).x; frag=vec4(texture(uVel,vUv).xy-vec2(r-l,t-b),0.,1.); }`);
    programs.show = createProgram(head + `uniform sampler2D uDye; uniform vec3 inkA; uniform vec3 inkB; uniform float fill;
      void main(){ float d=texture(uDye,vUv).x; float a=max(1.-exp(-d*1.5),fill); a=clamp(a,0.,1.); vec3 col=mix(inkA,inkB,smoothstep(.12,.92,a)); frag=vec4(col*a,a); }`);
    quad = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  }

  function createFbo(w, h, internal, format, filter) {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, gl.HALF_FLOAT, null);
    const framebuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    return { texture, framebuffer, w, h, attach(unit) { gl.activeTexture(gl.TEXTURE0 + unit); gl.bindTexture(gl.TEXTURE_2D, texture); return unit; } };
  }

  function createDoubleFbo(w, h, internal, format, filter) {
    let read = createFbo(w, h, internal, format, filter);
    let write = createFbo(w, h, internal, format, filter);
    return { get read() { return read; }, get write() { return write; }, swap() { [read, write] = [write, read]; } };
  }

  function blit(target) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, target ? target.framebuffer : null);
    gl.viewport(0, 0, target ? target.w : gl.drawingBufferWidth, target ? target.h : gl.drawingBufferHeight);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  function initFluid() {
    const aspect = gl.drawingBufferWidth / Math.max(gl.drawingBufferHeight, 1);
    const sim = 120;
    const dyeSize = Math.min(1024, Math.max(gl.drawingBufferWidth, gl.drawingBufferHeight));
    simWidth = aspect >= 1 ? Math.round(sim * aspect) : sim;
    simHeight = aspect >= 1 ? sim : Math.round(sim / aspect);
    dyeWidth = aspect >= 1 ? dyeSize : Math.round(dyeSize * aspect);
    dyeHeight = aspect >= 1 ? Math.round(dyeSize / aspect) : dyeSize;
    velocity = createDoubleFbo(simWidth, simHeight, gl.RG16F, gl.RG, gl.LINEAR);
    dye = createDoubleFbo(dyeWidth, dyeHeight, gl.R16F, gl.RED, gl.LINEAR);
    pressure = createDoubleFbo(simWidth, simHeight, gl.R16F, gl.RED, gl.NEAREST);
    divergence = createFbo(simWidth, simHeight, gl.R16F, gl.RED, gl.NEAREST);
    curl = createFbo(simWidth, simHeight, gl.R16F, gl.RED, gl.NEAREST);
  }

  function resizeFluid() {
    if (!fluidReady) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    inkCanvas.width = Math.round(window.innerWidth * dpr);
    inkCanvas.height = Math.round(window.innerHeight * dpr);
    try {
      if (!vertexShader) initPrograms();
      initFluid();
    } catch (_error) {
      fluidReady = false;
      inkCanvas.classList.remove("is-active");
    }
  }

  function use(program, texelWidth, texelHeight) {
    gl.useProgram(program.program);
    if (program.uniforms.texel) gl.uniform2f(program.uniforms.texel, texelWidth, texelHeight);
  }

  function splat(x, y, forceX, forceY, radius, amount) {
    const program = programs.splat;
    use(program, 1 / simWidth, 1 / simHeight);
    gl.uniform1f(program.uniforms.aspect, inkCanvas.width / Math.max(inkCanvas.height, 1));
    gl.uniform2f(program.uniforms.point, x, y);
    gl.uniform1f(program.uniforms.radius, radius / 100);
    gl.uniform3f(program.uniforms.color, forceX, forceY, 0);
    gl.uniform1i(program.uniforms.uTarget, velocity.read.attach(0));
    blit(velocity.write);
    velocity.swap();
    gl.uniform3f(program.uniforms.color, amount, 0, 0);
    gl.uniform1i(program.uniforms.uTarget, dye.read.attach(0));
    blit(dye.write);
    dye.swap();
  }

  function stepFluid(dt) {
    gl.disable(gl.BLEND);
    use(programs.curl, 1 / simWidth, 1 / simHeight);
    gl.uniform1i(programs.curl.uniforms.uVel, velocity.read.attach(0));
    blit(curl);
    use(programs.vorticity, 1 / simWidth, 1 / simHeight);
    gl.uniform1i(programs.vorticity.uniforms.uVel, velocity.read.attach(0));
    gl.uniform1i(programs.vorticity.uniforms.uCurl, curl.attach(1));
    gl.uniform1f(programs.vorticity.uniforms.amount, 22);
    gl.uniform1f(programs.vorticity.uniforms.dt, dt);
    blit(velocity.write);
    velocity.swap();
    use(programs.divergence, 1 / simWidth, 1 / simHeight);
    gl.uniform1i(programs.divergence.uniforms.uVel, velocity.read.attach(0));
    blit(divergence);
    use(programs.pressure, 1 / simWidth, 1 / simHeight);
    gl.uniform1i(programs.pressure.uniforms.uDivergence, divergence.attach(1));
    for (let index = 0; index < 20; index += 1) {
      gl.uniform1i(programs.pressure.uniforms.uPressure, pressure.read.attach(0));
      blit(pressure.write);
      pressure.swap();
    }
    use(programs.gradient, 1 / simWidth, 1 / simHeight);
    gl.uniform1i(programs.gradient.uniforms.uPressure, pressure.read.attach(0));
    gl.uniform1i(programs.gradient.uniforms.uVel, velocity.read.attach(1));
    blit(velocity.write);
    velocity.swap();
    use(programs.advect, 1 / simWidth, 1 / simHeight);
    gl.uniform1f(programs.advect.uniforms.dt, dt);
    gl.uniform1f(programs.advect.uniforms.diss, 0.15);
    gl.uniform1i(programs.advect.uniforms.uVel, velocity.read.attach(0));
    gl.uniform1i(programs.advect.uniforms.uSrc, velocity.read.attach(0));
    blit(velocity.write);
    velocity.swap();
    gl.uniform1f(programs.advect.uniforms.diss, 0);
    gl.uniform1i(programs.advect.uniforms.uVel, velocity.read.attach(0));
    gl.uniform1i(programs.advect.uniforms.uSrc, dye.read.attach(1));
    blit(dye.write);
    dye.swap();
  }

  function showFluid(fill) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    use(programs.show, 1 / dyeWidth, 1 / dyeHeight);
    gl.uniform3f(programs.show.uniforms.inkA, ...inkLight);
    gl.uniform3f(programs.show.uniforms.inkB, ...inkDeep);
    gl.uniform1f(programs.show.uniforms.fill, fill);
    gl.uniform1i(programs.show.uniforms.uDye, dye.read.attach(0));
    blit(null);
  }

  function hexToInk(hex) {
    const value = Number.parseInt(hex.slice(1), 16);
    const base = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => channel / 255);
    const waterEdge = base.map((channel) => channel + (1 - channel) * 0.38);
    return { deep: base, light: waterEdge };
  }

  function animateTransition(now) {
    const elapsed = (now - transitionStart) / 1000;
    const progress = Math.min(elapsed / 2.6, 1);
    const [originX, originY] = transitionOrigin;
    splat(originX, originY, 0, 0, 0.25 + progress * 1.1, 0.9 * 0.016 * 22);
    for (let arm = 0; arm < 3; arm += 1) {
      const angle = universeTime * 1.9 * swirlDirection + arm * (Math.PI * 2 / 3);
      const reach = 0.06 + progress * 0.42;
      const x = originX + Math.cos(angle) * reach;
      const y = originY + Math.sin(angle) * reach * 0.9;
      const tangent = angle + Math.PI / 2 * swirlDirection;
      splat(x, y, Math.cos(tangent) * 130 + Math.cos(angle) * 80, Math.sin(tangent) * 130 + Math.sin(angle) * 80, 0.3, 0.5 * 0.016 * 14);
    }
    stepFluid(0.016);
    const fill = progress < 0.72 ? 0 : Math.min(1, (progress - 0.72) / 0.28);
    showFluid(fill);
    if (progress < 1) {
      transitionFrame = requestAnimationFrame(animateTransition);
    } else if (transitionDone) {
      transitionDone();
    }
  }

  function enter(source, color, done) {
    if (!fluidReady || reducedMotion.matches) {
      done();
      return;
    }
    const rect = source?.getBoundingClientRect();
    transitionOrigin = rect
      ? [(rect.left + rect.width / 2) / window.innerWidth, 1 - (rect.top + rect.height / 2) / window.innerHeight]
      : [0.5, 0.5];
    const ink = hexToInk(color);
    inkDeep = ink.deep;
    inkLight = ink.light;
    swirlDirection = Math.random() < 0.5 ? -1 : 1;
    initFluid();
    transitionDone = done;
    transitionStart = performance.now();
    inkCanvas.classList.add("is-active");
    transitionFrame = requestAnimationFrame(animateTransition);
  }

  function reset() {
    cancelAnimationFrame(transitionFrame);
    transitionDone = null;
    inkCanvas.classList.remove("is-active");
    if (fluidReady) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
    }
  }

  window.addEventListener("resize", resizeSpace);
  window.addEventListener("pageshow", reset);
  resizeSpace();
  requestAnimationFrame(drawSpace);
  return { enter, reset };
}

const universeExperience = createUniverseExperience();

function enterStarRoom(href) {
  if (isEnteringStar) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    window.location.href = href;
    return;
  }

  isEnteringStar = true;
  const source = activeStar?.querySelector(".star-light") || activeStar;
  const color = constellationInkColors[activeStar?.dataset.star] || "#7EB5E8";
  universeExperience.enter(source, color, () => {
    window.location.href = href;
  });
}

function resetStarEnterTransition() {
  isEnteringStar = false;
  if (starEnterTimer) {
    window.clearTimeout(starEnterTimer);
    starEnterTimer = null;
  }
  document.querySelectorAll(".star-enter-veil").forEach((veil) => veil.remove());
  universeExperience.reset?.();
}

window.addEventListener("pagehide", resetStarEnterTransition);
window.addEventListener("pageshow", resetStarEnterTransition);
window.addEventListener("popstate", resetStarEnterTransition);


if (constellationStars.length) {
  createBackgroundStars();

  constellationStars.forEach((star) => {
    star.addEventListener("click", (event) => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      activeStar = star;
      trackHamEvent("home_star_select", getHomeStarTrackingData(star));
      trackHamEvent("home_star_enter", {
        ...getHomeStarTrackingData(star),
        target_url: star.href
      });
      enterStarRoom(star.href);
    });
  });
}

function findRoomGallerySection(roomPage) {
  return Array.from(roomPage.querySelectorAll("section")).find((section) =>
    Array.from(section.classList).some((className) => className.endsWith("-gallery"))
  );
}

function findRoomGalleryGrid(gallerySection) {
  return Array.from(gallerySection.querySelectorAll("div")).find((element) =>
    Array.from(element.classList).some((className) => className.endsWith("-gallery-grid"))
  );
}

function buildRoomEntryNavigation() {
  const roomPage = document.querySelector(".room-page:not(.memory-room)");
  if (!roomPage || roomPage.classList.contains("room-house-page") || roomPage.querySelector(".room-entry-nav")) return;

  const roomHero = roomPage.querySelector(".room-hero");
  const roomPosts = roomPage.querySelector(".room-posts");
  const roomGallery = findRoomGallerySection(roomPage);

  if (!roomHero || (!roomPosts && !roomGallery)) return;

  const nav = document.createElement("nav");
  nav.className = "room-entry-nav";
  nav.setAttribute("aria-label", "별 안 보기");

  if (roomPosts) {
    roomPosts.id = roomPosts.id || "room-writing";
    const postCount = roomPosts.querySelectorAll(".room-post").length;
    const writingLink = document.createElement("a");
    writingLink.className = "room-entry-link";
    writingLink.href = `#${roomPosts.id}`;
    writingLink.innerHTML = `<strong>글</strong><span>${postCount}개 기록 보기</span>`;
    nav.appendChild(writingLink);
  }

  if (roomGallery) {
    roomGallery.id = roomGallery.id || "room-photos";
    const photoCount = roomGallery.querySelectorAll("figure").length;
    const photoLink = document.createElement("a");
    photoLink.className = "room-entry-link";
    photoLink.href = `#${roomGallery.id}`;
    photoLink.innerHTML = `<strong>사진</strong><span>${photoCount}장 보기</span>`;
    nav.appendChild(photoLink);
  }

  roomHero.insertAdjacentElement("afterend", nav);
}

function openGalleryDetail(detail, figure, image, captionText) {
  detail.replaceChildren();

  const detailImage = image.cloneNode(false);
  detailImage.className = "room-gallery-detail-photo";
  limitDetailImageToAvailableSpace(detailImage, image);

  const detailCopy = document.createElement("p");
  detailCopy.className = "room-gallery-detail-copy";
  detailCopy.textContent = captionText || image.alt || "아직 기록할 기억을 기다리는 사진입니다.";

  detail.append(detailImage, detailCopy);
  detail.hidden = false;

  figure.parentElement
    ?.querySelectorAll(".room-memory-clickable.is-active")
    .forEach((activeFigure) => activeFigure.classList.remove("is-active"));
  figure.classList.add("is-active");

  detail.scrollIntoView({
    behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    block: "nearest"
  });
}

function limitDetailImageToAvailableSpace(detailImage, sourceImage, maxWidthLimit = "") {
  const applyLimit = () => {
    const naturalWidth = sourceImage.naturalWidth || detailImage.naturalWidth;
    const naturalHeight = sourceImage.naturalHeight || detailImage.naturalHeight;
    if (!naturalWidth || !naturalHeight) return;
    detailImage.style.display = "block";
    detailImage.style.width = "auto";
    detailImage.style.height = "auto";
    detailImage.style.maxWidth = maxWidthLimit
      ? `min(100%, ${maxWidthLimit}, ${naturalWidth}px)`
      : `min(100%, ${naturalWidth}px)`;
    detailImage.style.maxHeight = `min(72vh, ${naturalHeight}px)`;
    detailImage.style.objectFit = "contain";
    detailImage.style.marginLeft = "auto";
    detailImage.style.marginRight = "auto";
  };

  applyLimit();
  detailImage.addEventListener("load", applyLimit, { once: true });
}

function buildRoomGalleryDetails() {
  const roomPage = document.querySelector(".room-page:not(.memory-room)");
  if (!roomPage || roomPage.classList.contains("room-house-page")) return;

  const roomGallery = findRoomGallerySection(roomPage);
  if (!roomGallery || roomGallery.querySelector(".room-gallery-detail")) return;

  const galleryGrid = findRoomGalleryGrid(roomGallery);
  if (!galleryGrid) return;

  const detail = document.createElement("aside");
  detail.className = "room-gallery-detail";
  detail.hidden = true;
  detail.setAttribute("aria-live", "polite");
  galleryGrid.insertAdjacentElement("afterend", detail);

  galleryGrid.querySelectorAll("figure").forEach((figure, index) => {
    const image = figure.querySelector("img");
    if (!image) return;

    const caption = figure.querySelector("figcaption");
    const captionText = caption?.textContent.trim() || "";

    figure.classList.add("room-memory-clickable");
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `${image.alt || `사진 ${index + 1}`} 크게 보기`);

    const open = () => openGalleryDetail(detail, figure, image, captionText);

    figure.addEventListener("click", open);
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

buildRoomEntryNavigation();
buildRoomGalleryDetails();

function getRoomSortOrder(element) {
  return Number(element.dataset.sortOrder || 0);
}

function sortRoomElements(container, selector, mode) {
  const elements = Array.from(container.querySelectorAll(selector));

  elements.forEach((element, index) => {
    if (!element.dataset.sortOrder) {
      element.dataset.sortOrder = String(index + 1);
    }
  });

  const sortedElements = elements.sort((a, b) => {
    if (mode === "latest") {
      const dateCompare = (b.dataset.homepageDate || "").localeCompare(a.dataset.homepageDate || "");
      if (dateCompare !== 0) return dateCompare;
    }

    return getRoomSortOrder(a) - getRoomSortOrder(b);
  });

  sortedElements.forEach((element) => {
    container.append(element);
  });

  return sortedElements;
}

function updateRoomSortButtons(sortControl, mode) {
  sortControl.querySelectorAll("[data-sort-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.sortMode === mode));
  });
}

function buildRoomHouse() {
  const housePage = document.querySelector(".room-house-page");
  if (!housePage) return;

  const doors = Array.from(housePage.querySelectorAll(".room-house-door[data-house-target]"));
  const panels = Array.from(housePage.querySelectorAll(".room-house-panel"));
  const houseNav = housePage.querySelector(".room-house-nav");
  const articleList = housePage.querySelector(".room-article-list");
  const articlePanelsContainer = housePage.querySelector(".room-article-panels");
  let articleLinks = Array.from(housePage.querySelectorAll(".room-article-link[data-article-target]"));
  let articlePanels = Array.from(housePage.querySelectorAll(".room-article-panel"));
  const articleBackButtons = Array.from(housePage.querySelectorAll(".room-article-back"));
  const photoDetail = housePage.querySelector(".room-house-photo-detail");
  const photoPanel = housePage.querySelector("[id$='photo-room']");
  const photoGrid = photoPanel?.querySelector(".room-house-photo-grid");
  let photoFigures = Array.from(photoGrid?.querySelectorAll("figure") || housePage.querySelectorAll(".room-house-photo"));

  const articleNavLabel = housePage.dataset.articleNavLabel || "글 이동";
  const articleListLabel = housePage.dataset.articleListLabel || "글 목록";
  const articlePrevLabel = housePage.dataset.articlePrevLabel || "이전 글";
  const articleNextLabel = housePage.dataset.articleNextLabel || "다음 글";
  const photoListLabel = housePage.dataset.photoListLabel || "사진 목록";
  const hasContextNav = housePage.dataset.roomContextNav === "true";
  const contextTargets = {
    article: housePage.dataset.articleHouseTarget || housePage.querySelector("[id$='writing-room']")?.id || "",
    photo: housePage.dataset.photoHouseTarget || photoPanel?.id || "",
    map: housePage.dataset.mapHouseTarget || housePage.querySelector("[id$='map-room']")?.id || "",
    stars: housePage.dataset.starListTarget || "star-list"
  };

  function syncArticleCollections() {
    articleLinks = Array.from(housePage.querySelectorAll(".room-article-link[data-article-target]"));
    articlePanels = Array.from(housePage.querySelectorAll(".room-article-panel"));
  }

  function syncPhotoFigures() {
    photoFigures = Array.from(photoGrid?.querySelectorAll("figure") || housePage.querySelectorAll(".room-house-photo"));
  }

  function closeArticles() {
    articlePanels.forEach((panel) => {
      panel.hidden = true;
      panel.closest(".room-house-panel")?.classList.remove("is-detail-mode");
    });
    if (!photoPanel?.classList.contains("is-photo-detail-mode")) {
      housePage.classList.remove("is-reading-mode");
    }
    if (articleList) articleList.hidden = false;
    articleLinks.forEach((link) => {
      link.classList.remove("is-active");
      link.setAttribute("aria-expanded", "false");
    });
  }

  function closePhotoDetail() {
    if (photoDetail) {
      photoDetail.hidden = true;
      photoDetail.replaceChildren();
    }
    photoPanel?.classList.remove("is-photo-detail-mode");
    if (!articlePanels.some((panel) => !panel.hidden)) {
      housePage.classList.remove("is-reading-mode");
    }
    if (photoGrid) photoGrid.hidden = false;
    photoFigures.forEach((figure) => figure.classList.remove("is-active"));
  }

  function closePanels() {
    panels.forEach((panel) => {
      panel.hidden = true;
    });
    closeArticles();
    closePhotoDetail();
    doors.forEach((door) => {
      door.classList.remove("is-active");
      door.setAttribute("aria-expanded", "false");
    });
  }

  function scrollToElement(element, block = "start") {
    element?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block
    });
  }

  function openHousePanel(panelId) {
    if (!panelId) return false;
    const target = document.getElementById(panelId);
    if (!target || !housePage.contains(target)) return false;

    closePanels();
    target.hidden = false;
    syncPanelContextNav(target);
    doors.forEach((door) => {
      const isActive = door.dataset.houseTarget === panelId;
      door.classList.toggle("is-active", isActive);
      door.setAttribute("aria-expanded", String(isActive));
    });
    scrollToElement(target);
    return true;
  }

  function scrollToStarList() {
    const starList = document.getElementById(contextTargets.stars);
    closePanels();
    scrollToElement(starList);
  }

  function createContextNav(currentSection) {
    if (!hasContextNav) return null;

    const nav = document.createElement("nav");
    nav.className = "room-context-nav";
    nav.setAttribute("aria-label", "별 안의 입구");

    const createButton = (label, section, action) => {
      const button = document.createElement("button");
      button.className = "room-gallery-detail-button";
      button.type = "button";
      button.dataset.roomSection = section;
      button.textContent = label;
      if (section === currentSection) {
        button.setAttribute("aria-current", "page");
      }
      button.addEventListener("click", () => {
        const targetMap = {
          article: contextTargets.article,
          photo: contextTargets.photo,
          map: contextTargets.map,
          stars: contextTargets.stars
        };
        trackStarEntryClick(housePage, targetMap[section] || section, label);
        action();
      });
      return button;
    };

    nav.append(
      createButton("문장", "article", () => {
        if (currentSection === "article") {
          returnToArticleList();
          return;
        }
        openHousePanel(contextTargets.article);
      }),
      createButton("장면", "photo", () => {
        if (currentSection === "photo") {
          closePhotoDetail();
          scrollToElement(photoGrid);
          return;
        }
        openHousePanel(contextTargets.photo);
      }),
      createButton("지도", "map", () => {
        if (currentSection === "map") {
          scrollToElement(document.getElementById(contextTargets.map));
          return;
        }
        openHousePanel(contextTargets.map);
      })
    );

    const starLink = document.createElement("button");
    starLink.className = "room-gallery-detail-button";
    starLink.type = "button";
    starLink.dataset.roomSection = "stars";
    starLink.textContent = "별자리";
    starLink.addEventListener("click", () => {
      trackStarEntryClick(housePage, contextTargets.stars, "별자리");
      scrollToStarList();
    });
    nav.append(starLink);

    return nav;
  }

  function getPanelContextSection(panel) {
    if (panel.id === contextTargets.article) return "article";
    if (panel.id === contextTargets.photo) return "photo";
    if (panel.id === contextTargets.map) return "map";
    return "";
  }

  function syncPanelContextNav(panel) {
    if (!hasContextNav || !panel) return;

    const header = panel.querySelector(":scope > .room-house-panel-header");
    const currentSection = getPanelContextSection(panel);
    if (!header || !currentSection) return;

    header.querySelector(":scope > .room-context-nav")?.remove();

    const contextNav = createContextNav(currentSection);
    if (!contextNav) return;

    const backButton = header.querySelector(":scope > .room-house-back");
    if (backButton) {
      header.insertBefore(contextNav, backButton);
      return;
    }

    header.append(contextNav);
  }

  function sortArticles(mode) {
    if (!articleList || !articlePanelsContainer) return;

    const sortedLinks = sortRoomElements(articleList, ".room-article-link[data-article-target]", mode);

    sortedLinks.forEach((link) => {
      const panel = housePage.querySelector(`#${link.dataset.articleTarget}`);
      if (panel) {
        articlePanelsContainer.append(panel);
      }
    });

    syncArticleCollections();
    rebuildArticleBottomNav();
  }

  function sortPhotos(mode) {
    if (!photoGrid) return;

    closePhotoDetail();
    sortRoomElements(photoGrid, "figure", mode);
    syncPhotoFigures();
  }

  function setupSortControls() {
    const sortControls = Array.from(housePage.querySelectorAll(".room-sort-control[data-sort-target]"));

    sortControls.forEach((sortControl) => {
      const target = sortControl.dataset.sortTarget;
      const defaultButton = sortControl.querySelector('[data-sort-mode][aria-pressed="true"]') || sortControl.querySelector("[data-sort-mode]");
      const defaultMode = defaultButton?.dataset.sortMode || "latest";

      const applySortMode = (mode) => {
        updateRoomSortButtons(sortControl, mode);

        if (target === "articles") {
          closeArticles();
          sortArticles(mode);
        }

        if (target === "photos") {
          sortPhotos(mode);
        }
      };

      sortControl.querySelectorAll("[data-sort-mode]").forEach((button) => {
        button.addEventListener("click", () => {
          applySortMode(button.dataset.sortMode || "latest");
        });
      });

      applySortMode(defaultMode);
    });
  }

  doors.forEach((door) => {
    const target = housePage.querySelector(`#${door.dataset.houseTarget}`);
    if (!target) return;

    door.setAttribute("aria-expanded", "false");
    door.addEventListener("click", () => {
      const isOpen = !target.hidden;
      if (isOpen) {
        closePanels();
        return;
      }
      trackStarEntryClick(housePage, door.dataset.houseTarget, door.textContent);
      openHousePanel(door.dataset.houseTarget);
    });
  });

  housePage.querySelectorAll(".room-house-back").forEach((button) => {
    button.addEventListener("click", () => {
      closePanels();
      houseNav?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "center"
      });
    });
  });

  function returnToArticleList() {
    closeArticles();
    articleList?.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  function openArticleAt(index) {
    const link = articleLinks[index];
    const target = link ? housePage.querySelector(`#${link.dataset.articleTarget}`) : null;
    if (!target) return;

    closePhotoDetail();
    closeArticles();
    if (articleList) articleList.hidden = true;
    target.hidden = false;
    target.closest(".room-house-panel")?.classList.add("is-detail-mode");
    housePage.classList.add("is-reading-mode");
    link.classList.add("is-active");
    link.setAttribute("aria-expanded", "true");
    target.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  function openArticleById(articleId) {
    syncArticleCollections();
    const index = articleLinks.findIndex((link) => link.dataset.articleTarget === articleId);
    if (index < 0) return false;

    const link = articleLinks[index];
    const target = housePage.querySelector(`#${link.dataset.articleTarget}`);
    const parentPanel = target?.closest(".room-house-panel");
    if (!target || !parentPanel) return false;

    closePanels();
    parentPanel.hidden = false;

    const door = doors.find((button) => button.dataset.houseTarget === parentPanel.id);
    if (door) {
      door.classList.add("is-active");
      door.setAttribute("aria-expanded", "true");
    }

    openArticleAt(index);
    return true;
  }

  function openArticleFromHash() {
    const articleId = decodeURIComponent(window.location.hash.replace(/^#/, ""));
    if (!articleId) return;
    openArticleById(articleId);
  }

  function rebuildArticleBottomNav() {
    articlePanels.forEach((panel) => {
      panel.querySelector(":scope > .room-article-bottom-nav")?.remove();
      panel.querySelector(":scope > .room-context-nav")?.remove();
      if (hasContextNav) {
        panel.querySelector(":scope > .room-article-back")?.remove();
      }
    });

    articlePanels.forEach((panel, index) => {
      const contextNav = createContextNav("article");
      if (contextNav) {
        panel.prepend(contextNav);
      }

      const nav = document.createElement("nav");
      nav.className = "room-article-bottom-nav";
      nav.setAttribute("aria-label", articleNavLabel);

      const listButton = document.createElement("button");
      listButton.type = "button";
      listButton.textContent = articleListLabel;
      listButton.addEventListener("click", returnToArticleList);

      const previousButton = document.createElement("button");
      previousButton.type = "button";
      previousButton.textContent = articlePrevLabel;
      previousButton.disabled = index === 0;
      previousButton.addEventListener("click", () => openArticleAt(index - 1));

      const nextButton = document.createElement("button");
      nextButton.type = "button";
      nextButton.textContent = articleNextLabel;
      nextButton.disabled = index === articlePanels.length - 1;
      nextButton.addEventListener("click", () => openArticleAt(index + 1));

      nav.append(listButton, previousButton, nextButton);
      panel.append(nav);
    });
  }

  setupSortControls();
  rebuildArticleBottomNav();

  articleLinks.forEach((link) => {
    const target = housePage.querySelector(`#${link.dataset.articleTarget}`);
    if (!target) return;

    link.setAttribute("aria-expanded", "false");
    link.addEventListener("click", () => {
      syncArticleCollections();
      const index = articleLinks.indexOf(link);
      openArticleAt(index);
    });
  });

  articleBackButtons.forEach((button) => {
    button.addEventListener("click", returnToArticleList);
  });

  function openHousePhoto(index) {
    const figure = photoFigures[index];
    const image = figure?.querySelector("img");
    if (!figure || !image || !photoDetail) return;

    const captionText = figure.dataset.memory || figure.querySelector("figcaption")?.textContent.trim() || image.alt || "아직 기록할 기억을 기다리는 사진입니다.";

    photoDetail.replaceChildren();

    const actions = document.createElement("div");
    actions.className = "room-gallery-detail-actions";

    const backButton = document.createElement("button");
    backButton.className = "room-gallery-detail-button";
    backButton.type = "button";
    backButton.textContent = photoListLabel;
    backButton.addEventListener("click", () => {
      closePhotoDetail();
      photoGrid?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
    });

    const indexLabel = document.createElement("span");
    indexLabel.className = "room-gallery-detail-index";
    indexLabel.textContent = `${index + 1} / ${photoFigures.length}`;
    const contextNav = createContextNav("photo");
    if (contextNav) {
      actions.classList.add("is-index-only");
      actions.append(indexLabel);
    } else {
      actions.append(backButton, indexLabel);
    }

    const detailImage = image.cloneNode(false);
    detailImage.className = "room-gallery-detail-photo";
    const displayMode = figure.dataset.displayMode || "";
    const isArchiveLow = displayMode === "archive-low";
    const archiveMaxWidth = figure.dataset.archiveMaxWidth;
    if (isArchiveLow && archiveMaxWidth) {
      detailImage.style.setProperty("--archive-max-width", archiveMaxWidth);
    }
    limitDetailImageToAvailableSpace(detailImage, image, isArchiveLow ? archiveMaxWidth : "");
    photoDetail.classList.toggle("is-archive-low", isArchiveLow);

    const detailCopy = document.createElement("p");
    detailCopy.className = "room-gallery-detail-copy";
    detailCopy.textContent = captionText;

    const nav = document.createElement("div");
    nav.className = "room-gallery-detail-nav";

    const previousButton = document.createElement("button");
    previousButton.className = "room-gallery-detail-button";
    previousButton.type = "button";
    previousButton.textContent = "이전";
    previousButton.disabled = index === 0;
    previousButton.addEventListener("click", () => openHousePhoto(index - 1));

    const nextButton = document.createElement("button");
    nextButton.className = "room-gallery-detail-button";
    nextButton.type = "button";
    nextButton.textContent = "다음";
    nextButton.disabled = index === photoFigures.length - 1;
    nextButton.addEventListener("click", () => openHousePhoto(index + 1));

    nav.append(previousButton, nextButton);
    photoDetail.append(...[contextNav, actions, detailImage, detailCopy, nav].filter(Boolean));
    photoDetail.hidden = false;
    photoPanel?.classList.add("is-photo-detail-mode");
    housePage.classList.add("is-reading-mode");
    if (photoGrid) photoGrid.hidden = true;

    photoFigures.forEach((activeFigure) => activeFigure.classList.remove("is-active"));
    figure.classList.add("is-active");

    photoDetail.scrollIntoView({
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
      block: "start"
    });
  }

  photoFigures.forEach((figure) => {
    const image = figure.querySelector("img");
    if (!image || !photoDetail) return;

    figure.classList.add("room-house-photo", "room-memory-clickable");
    figure.tabIndex = 0;
    figure.setAttribute("role", "button");
    figure.setAttribute("aria-label", `${image.alt || "사진"} 크게 보기`);

    const open = () => {
      syncPhotoFigures();
      openHousePhoto(photoFigures.indexOf(figure));
    };

    figure.addEventListener("click", open);
    figure.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });

  openArticleFromHash();
  window.addEventListener("hashchange", openArticleFromHash);
}

buildRoomHouse();
