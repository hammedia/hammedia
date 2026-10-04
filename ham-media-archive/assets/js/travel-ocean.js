/* Original HAM MEDIA ocean study. Native WebGL, no library or external assets. */
(() => {
  'use strict';
  const section = document.getElementById('travel-ocean');
  if (!section) return;
  const canvas = section.querySelector('canvas');
  const button = section.querySelector('.ocean-interlude__toggle');
  const label = section.querySelector('.ocean-interlude__toggle-label');
  const icon = section.querySelector('.ocean-interlude__toggle-icon');
  const status = section.querySelector('.ocean-interlude__status');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 760px), (pointer: coarse)');
  let wantsMotion = !reduced.matches && !mobile.matches;
  let visible = false;
  let pageActive = true;
  let frame = 0;
  let lastDraw = 0;
  let time = 0;
  let gl = null;
  let program = null;
  let buffer = null;
  let timeUniform;
  let sizeUniform;
  let failed = false;
  let initialized = false;
  let needsSize = true;

  const vertexSource = `
    attribute vec2 position;
    void main() { gl_Position = vec4(position, 0.0, 1.0); }
  `;
  const fragmentSource = `
    #ifdef GL_FRAGMENT_PRECISION_HIGH
    precision highp float;
    #else
    precision mediump float;
    #endif
    uniform vec2 resolution;
    uniform float time;
    vec3 sunlight() { return normalize(vec3(min(0.35, resolution.x / resolution.y * 0.18), 0.13, -0.93)); }
    float waves(vec2 p) {
      float t = time * 0.32;
      float distanceFromEye = length(p - vec2(0.0, 5.0));
      float detail = 1.0 - smoothstep(8.0, 60.0, distanceFromEye);
      float w = sin(p.x * 0.72 + p.y * 0.83 + t) * 0.15;
      w += sin(p.x * -1.22 + p.y * 1.55 - t * 1.2) * 0.075;
      w += sin(p.x * 2.63 + p.y * 2.2 + t * 1.7 + w) * 0.035 * detail;
      w += sin(p.x * -4.6 + p.y * 3.8 - t * 1.8) * 0.017 * detail * detail;
      w += sin(p.x * 8.2 + p.y * 6.2 + t * 2.1) * 0.006 * detail * detail;
      return w * (1.0 - smoothstep(40.0, 160.0, distanceFromEye));
    }
    vec3 sky(vec3 rd) {
      float h = max(rd.y, 0.0);
      vec3 col = mix(vec3(0.82, 0.80, 0.72), vec3(0.43, 0.61, 0.67), pow(h, 0.48));
      float light = max(dot(rd, sunlight()), 0.0);
      col += vec3(0.23, 0.14, 0.06) * pow(light, 18.0);
      col += vec3(0.42, 0.26, 0.09) * (1.0 - smoothstep(0.014, 0.020, length(rd - sunlight())));
      return col;
    }
    void main() {
      vec2 uv = (gl_FragCoord.xy / resolution.xy - 0.5) * 2.0;
      uv.x *= resolution.x / resolution.y;
      vec3 eye = vec3(0.0, 3.0, 5.0);
      vec3 rd = normalize(vec3(uv.x * 0.65, uv.y * 0.65 - 0.07, -1.5));
      vec3 col = sky(rd);
      if (rd.y < -0.001) {
        float distanceToWater = min(500.0, -eye.y / rd.y);
        vec3 p = eye + rd * distanceToWater;
        for (int i = 0; i < 3; i++) {
          distanceToWater = clamp((waves(p.xz) - eye.y) / rd.y, 0.0, 500.0);
          p = eye + rd * distanceToWater;
        }
        float e = 0.08 + distanceToWater * 0.002;
        float h = waves(p.xz);
        vec3 n = normalize(vec3(h - waves(p.xz + vec2(e, 0.0)), e, h - waves(p.xz + vec2(0.0, e))));
        vec3 reflection = reflect(rd, n);
        float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0) * 0.72 + 0.15;
        vec3 deep = vec3(0.035, 0.20, 0.25);
        vec3 shallow = vec3(0.10, 0.35, 0.37);
        vec3 water = mix(deep, shallow, n.y * 0.55 + h * 0.35);
        col = mix(water, sky(reflection), fresnel);
        float shine = pow(max(dot(reflection, sunlight()), 0.0), 170.0);
        col += vec3(1.0, 0.76, 0.40) * shine * 0.65;
        float mist = 1.0 - exp(-distanceToWater * 0.005);
        col = mix(col, vec3(0.65, 0.73, 0.70), mist * 0.78);
        col = mix(col, sky(vec3(rd.x, 0.0, rd.z)), smoothstep(-0.022, -0.001, rd.y));
      }
      float vignette = 1.0 - 0.10 * pow(length(uv * vec2(0.35, 0.55)), 1.5);
      gl_FragColor = vec4(col * vignette, 1.0);
    }
  `;

  function setStatus(message) {
    if (status.textContent !== message) status.textContent = message;
  }
  function stopFrame() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastDraw = 0;
  }
  function dispose() {
    if (!gl) return;
    if (program) gl.deleteProgram(program);
    if (buffer) gl.deleteBuffer(buffer);
    program = null;
    buffer = null;
  }
  function fallback() {
    failed = true;
    wantsMotion = false;
    stopFrame();
    dispose();
    section.removeAttribute('data-ocean-ready');
    section.dataset.oceanState = 'fallback';
    button.hidden = false;
    button.setAttribute('aria-pressed', 'false');
    button.setAttribute('aria-disabled', 'true');
    label.textContent = '고요한 바다';
    icon.textContent = '≈';
    setStatus('이 환경에서는 정지된 바다로 보여드립니다');
  }
  function compile(type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      gl.deleteShader(shader);
      throw new Error('Ocean shader unavailable');
    }
    return shader;
  }
  function init() {
    if (initialized || failed) return;
    initialized = true;
    try {
      gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' });
      if (!gl) throw new Error('WebGL unavailable');
      const vertex = compile(gl.VERTEX_SHADER, vertexSource);
      let fragment;
      try { fragment = compile(gl.FRAGMENT_SHADER, fragmentSource); }
      catch (error) { gl.deleteShader(vertex); throw error; }
      program = gl.createProgram();
      gl.attachShader(program, vertex);
      gl.attachShader(program, fragment);
      gl.linkProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error('Ocean program unavailable');
      gl.useProgram(program);
      buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
      const position = gl.getAttribLocation(program, 'position');
      gl.enableVertexAttribArray(position);
      gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);
      timeUniform = gl.getUniformLocation(program, 'time');
      sizeUniform = gl.getUniformLocation(program, 'resolution');
      draw();
      section.setAttribute('data-ocean-ready', '');
      button.hidden = false;
    } catch (error) {
      section.dataset.oceanFallback = error.message;
      fallback();
    }
  }
  function draw() {
    if (!gl || failed || !visible || document.hidden || !pageActive) return;
    if (needsSize) {
      const rect = section.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, mobile.matches ? 1 : 1.35);
      const scale = Math.min(1, 1600 / Math.max(1, rect.width * ratio));
      canvas.width = Math.max(1, Math.round(rect.width * ratio * scale));
      canvas.height = Math.max(1, Math.round(rect.height * ratio * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(sizeUniform, canvas.width, canvas.height);
      needsSize = false;
    }
    gl.uniform1f(timeUniform, time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  function tick(now) {
    frame = 0;
    if (!wantsMotion || !visible || document.hidden || !pageActive || failed) return;
    if (!lastDraw || now - lastDraw >= 32) {
      if (lastDraw) time += Math.min((now - lastDraw) / 1000, 0.07);
      lastDraw = now;
      draw();
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (failed) return;
    const running = wantsMotion && visible && !document.hidden && pageActive;
    section.dataset.oceanState = running ? 'playing' : wantsMotion ? 'suspended' : 'paused';
    button.setAttribute('aria-pressed', String(wantsMotion));
    label.textContent = wantsMotion ? '움직임 멈추기' : '바다 움직이기';
    icon.textContent = wantsMotion ? 'Ⅱ' : '▷';
    if (running) {
      setStatus('잔물결이 천천히 움직이고 있습니다');
      if (!frame) frame = requestAnimationFrame(tick);
    } else {
      stopFrame();
      setStatus(wantsMotion ? '화면으로 돌아오면 이어집니다' : reduced.matches ? '움직임 줄이기 설정에 맞춰 멈췄습니다' : '고요한 바다를 보고 있습니다');
    }
  }
  button.addEventListener('click', () => {
    if (failed) return;
    wantsMotion = !wantsMotion;
    sync();
  });
  if (!('IntersectionObserver' in window)) { fallback(); return; }
  const observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting && entries[0].intersectionRatio > 0;
    if (visible && !document.hidden && pageActive) { init(); draw(); }
    sync();
  }, { threshold: [0, 0.01] });
  observer.observe(section);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && visible) { init(); draw(); }
    sync();
  });
  function resized() {
    needsSize = true;
    if (visible && !document.hidden) draw();
  }
  if ('ResizeObserver' in window) new ResizeObserver(resized).observe(section);
  else addEventListener('resize', resized, { passive: true });
  reduced.addEventListener('change', () => {
    if (reduced.matches) wantsMotion = false;
    sync();
  });
  mobile.addEventListener('change', () => {
    if (mobile.matches) wantsMotion = false;
    resized();
    sync();
  });
  canvas.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    fallback();
  });
  addEventListener('pagehide', () => { pageActive = false; sync(); });
  addEventListener('pageshow', () => { pageActive = true; if (visible && !document.hidden) { init(); draw(); } sync(); });
  sync();
  // Honor the explicit scene deep link after images and fonts have settled.
  if (location.hash === '#travel-ocean') {
    const reachScene = () => {
      if (location.hash === '#travel-ocean') section.scrollIntoView({ behavior: 'auto', block: 'start' });
    };
    if (document.readyState === 'complete') reachScene();
    else addEventListener('load', reachScene, { once: true });
  }
})();
