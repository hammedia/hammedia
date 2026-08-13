// 햄집사 — 스크롤 시네마 엔진 (의존성 0)
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ── 장면 1: 20 → 74 → 51.8 → 54.1 → 결론 ── */
  var hero = document.getElementById("academy-cinema");
  if (hero) runHero(hero, reduced);

  function runHero(el, prefersReducedMotion) {
    var beats = Array.prototype.slice.call(el.querySelectorAll(".hero-beat"));
    var progress = Array.prototype.slice.call(el.querySelectorAll(".hero-progress span"));
    var last = beats.length - 1;
    var current = 0;
    var timer = null;
    var wheelLocked = false;

    function show(index) {
      if (timer) { clearTimeout(timer); timer = null; }
      current = Math.max(0, Math.min(index, last));
      el.setAttribute("data-active", String(current));

      beats.forEach(function (beat, i) {
        var active = i === current;
        beat.classList.toggle("is-active", active);
        beat.setAttribute("aria-hidden", active ? "false" : "true");
      });
      progress.forEach(function (bar, i) {
        bar.classList.toggle("is-past", i < current);
        bar.classList.toggle("is-active", i === current);
      });

      if (current === last) {
        el.classList.remove("is-running");
        el.classList.add("is-complete");
        document.body.classList.remove("hero-cinema-active");
        return;
      }

      el.classList.add("is-running");
      el.classList.remove("is-complete");
      document.body.classList.add("hero-cinema-active");
      timer = setTimeout(function () { show(current + 1); }, Number(beats[current].getAttribute("data-duration")) || 2800);
    }

    function advance() {
      if (current < last) show(current + 1);
    }

    if (prefersReducedMotion) {
      show(last);
      return;
    }

    el.addEventListener("pointerup", function (event) {
      if (event.target.closest("a")) return;
      advance();
    });
    el.querySelectorAll(".cinema-skip, .cinema-cta").forEach(function (link) {
      link.addEventListener("click", function () { show(last); });
    });
    window.addEventListener("wheel", function (event) {
      if (current === last || el.getBoundingClientRect().bottom <= 0) return;
      event.preventDefault();
      if (wheelLocked) return;
      wheelLocked = true;
      advance();
      setTimeout(function () { wheelLocked = false; }, 450);
    }, { passive: false, capture: true });
    window.addEventListener("keydown", function (event) {
      if (current === last || el.getBoundingClientRect().bottom <= 0) return;
      if (["ArrowDown", "ArrowRight", "PageDown", " "].indexOf(event.key) === -1) return;
      event.preventDefault();
      advance();
    });

    show(0);
  }

  /* ── 코드 비: 이 페이지 자신의 소스가 배경으로 흐른다 ── */
  var rain = document.getElementById("codeRain");
  if (rain) {
    fetch("cinema.js").then(function (r) { return r.text(); }).then(function (t1) {
      fetch("index.html").then(function (r) { return r.text(); }).then(function (t2) {
        var src = (t2.slice(0, 4000) + "\n\n" + t1.slice(0, 3000)).replace(/</g, "‹");
        rain.textContent = src + "\n" + src;
      });
    }).catch(function () {});
  }

  if (reduced) { typeAllInstant(); return; }

  /* ── 핀 장면: 섹션 높이를 박자 수로 늘리고, 진행도로 박자를 갈아끼운다 ── */
  var scenes = [];
  document.querySelectorAll(".scene[data-beats]").forEach(function (sc) {
    var beats = parseInt(sc.getAttribute("data-beats"), 10);
    sc.style.height = (beats * 120 + 100) + "vh";
    scenes.push({
      el: sc,
      beats: beats,
      beatEls: sc.querySelectorAll(".beat"),
      rain: sc.querySelector(".code-rain"),
      card: sc.querySelector(".morning-card")
    });
  });

  var vh = window.innerHeight;
  window.addEventListener("resize", function () { vh = window.innerHeight; });

  var typed = false;

  function frame() {
    var y = window.scrollY;
    scenes.forEach(function (s) {
      var rect = s.el.getBoundingClientRect();
      var total = s.el.offsetHeight - vh;
      var p = Math.min(1, Math.max(0, -rect.top / total)); // 0~1 장면 진행도

      // 박자 크로스페이드
      var span = 1 / s.beats;
      s.beatEls.forEach(function (b, i) {
        var local = (p - i * span) / span;      // 이 박자 안에서 0~1
        var op = 0, ty = 28;
        if (local > -0.15 && local < 1.15) {
          var inP  = Math.min(1, Math.max(0, local / 0.35));
          var outP = Math.min(1, Math.max(0, (local - (i === s.beats - 1 ? 1.2 : 0.75)) / 0.25));
          op = inP * (1 - outP);
          ty = (1 - inP) * 28 - outP * 20;
        }
        b.style.opacity = op;
        b.style.transform = "translateY(" + ty + "px)";
      });

      // 코드 비 (리빌 장면)
      if (s.rain) {
        var visible = p > 0.05 && p < 0.98;
        s.rain.style.opacity = visible ? 0.55 : 0;
        s.rain.style.transform = "translateY(" + (-p * 42) + "%)";
      }

      // 아침 한 장 카드
      if (s.card) {
        var cp = Math.min(1, Math.max(0, (p - 0.1) / 0.3));
        s.card.style.opacity = cp;
        s.card.style.transform = "translateY(" + ((1 - cp) * 40) + "px)";
        if (cp > 0.9 && !typed) { typed = true; typeLines(s.card); }
      }
    });
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  /* ── 타자 효과: 아침 한 장이 눈앞에서 써진다 ── */
  function typeLines(card) {
    var lines = card.querySelectorAll(".mc-line");
    var li = 0;
    function typeLine() {
      if (li >= lines.length) return;
      var el = lines[li];
      var htmlSrc = el.getAttribute("data-type");
      var plain = htmlSrc.replace(/<[^>]+>/g, "");
      var ci = 0;
      el.innerHTML = '<span class="cursor"></span>';
      var iv = setInterval(function () {
        ci++;
        var done = ci >= plain.length;
        el.innerHTML = renderTyped(htmlSrc, ci) + (done ? "" : '<span class="cursor"></span>');
        if (done) {
          clearInterval(iv);
          li++;
          setTimeout(typeLine, 350);
        }
      }, 28);
    }
    typeLine();
  }

  // 태그를 보존하며 앞에서 n글자까지만 렌더
  function renderTyped(src, n) {
    var out = "", count = 0, inTag = false;
    for (var i = 0; i < src.length; i++) {
      var ch = src[i];
      if (ch === "<") inTag = true;
      if (inTag) { out += ch; if (ch === ">") inTag = false; continue; }
      if (count < n) { out += ch; count++; }
      else break;
    }
    return out;
  }

  function typeAllInstant() {
    document.querySelectorAll(".mc-line").forEach(function (el) {
      el.innerHTML = el.getAttribute("data-type");
    });
  }

  /* ── 영상: 화면에 들어오면 재생을 다시 시도한다 (사파리 절전 대비) ── */
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting && v.paused) {
        var p = v.play(); if (p && p.catch) p.catch(function () {});
      }
    });
  }, { threshold: 0.2 });
  document.querySelectorAll(".academy-cinema video").forEach(function (v) { vio.observe(v); });

  /* ── 흐름 섹션 등장 ── */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add("on"); io.unobserve(e.target); }
    });
  }, { threshold: 0.18 });
  document.querySelectorAll(".io").forEach(function (el) { io.observe(el); });
})();
