(function () {
  "use strict";

  var page = document.querySelector(".audio-style-page");
  if (!page) return;

  Array.prototype.forEach.call(page.querySelectorAll(".audio-v2-video-launch"), function (button) {
    button.addEventListener("click", function () {
      var videoId = button.getAttribute("data-youtube-id");
      var title = button.getAttribute("data-youtube-title") || "우리끼리오디오 영상";
      if (!videoId) return;

      var frame = document.createElement("iframe");
      frame.className = "audio-v2-video-frame";
      frame.title = title;
      frame.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(videoId) + "?autoplay=1&rel=0";
      frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      frame.allowFullscreen = true;
      button.replaceWith(frame);
    });
  });

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hero = page.querySelector(".audio-v2-hero");
  var heroPhoto = page.querySelector(".audio-v2-hero-photo");
  var heroVeil = page.querySelector(".audio-v2-hero-veil");
  var signalStage = page.querySelector(".audio-v2-signal-stage");
  var orbit = page.querySelector(".audio-v2-record-orbit");
  var spectrumBars = page.querySelectorAll(".audio-v2-spectrum i");
  var rail = document.querySelector(".audio-v2-vu-rail");
  var railFill = rail && rail.querySelector(".audio-v2-vu-fill");
  var railNeedle = rail && rail.querySelector(".audio-v2-vu-needle");
  var essay = page.querySelector(".audio-v2-essay");

  if (reduceMotion) {
    document.documentElement.classList.add("audio-motion-reduced");
    return;
  }

  document.documentElement.classList.add("has-audio-motion");

  function nativeReveal(elements) {
    var list = Array.prototype.slice.call(elements);
    if (!("IntersectionObserver" in window) || !("animate" in Element.prototype)) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.animate(
          [
            { opacity: 0, transform: "translateY(18px)" },
            { opacity: 1, transform: "translateY(0)" }
          ],
          { duration: 720, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }
        );
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14 });

    list.forEach(function (element) { observer.observe(element); });
  }

  if (!window.gsap || !window.ScrollTrigger) {
    nativeReveal(page.querySelectorAll(".audio-v2-ledger-row, .audio-v2-scene, .audio-v2-steps li, .audio-v2-map-frame"));
    return;
  }

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  gsap.registerPlugin(ScrollTrigger);

  gsap.set([heroPhoto, orbit], { force3D: true });

  var intro = gsap.timeline({ defaults: { ease: "power3.out" } });
  intro
    .from(heroPhoto, { opacity: 0.35, duration: 1.35, ease: "power2.out" })
    .from(signalStage, { scale: 0.72, y: 18, opacity: 0, duration: 1.25 }, 0.15)
    .from(".audio-v2-eyebrow", { y: 18, opacity: 0, duration: 0.65 }, 0.2)
    .from(".audio-v2-hero h1", { y: 42, opacity: 0, duration: 0.9 }, 0.3)
    .from(".audio-v2-lead", { y: 28, opacity: 0, duration: 0.8 }, 0.48)
    .from(".audio-v2-door", { y: 18, opacity: 0, duration: 0.56, stagger: 0.085 }, 0.68)
    .from(".audio-v2-hero-meta > *", { y: 14, opacity: 0, duration: 0.5, stagger: 0.1 }, 0.9)
    .from(".audio-v2-spectrum", { scaleX: 0.35, opacity: 0, duration: 0.8 }, 0.62);

  if (orbit) {
    gsap.to(orbit, { rotation: 360, duration: 38, ease: "none", repeat: -1 });
  }

  spectrumBars.forEach(function (bar, index) {
    var low = 0.3 + ((index * 7) % 5) * 0.08;
    var high = 0.72 + ((index * 3) % 4) * 0.08;
    gsap.fromTo(bar, { scaleY: low }, {
      scaleY: high,
      duration: 0.28 + (index % 4) * 0.08,
      repeat: -1,
      yoyo: true,
      ease: "power1.inOut",
      delay: index * 0.035
    });
  });

  var lamp = page.querySelector(".audio-v2-signal-lamp");
  if (lamp) gsap.to(lamp, { opacity: 0.38, duration: 0.8, repeat: -1, yoyo: true, ease: "sine.inOut" });

  if (hero && heroVeil && window.matchMedia("(pointer:fine)").matches) {
    var spotX = gsap.quickTo(heroVeil, "--audio-spot-x", { duration: 0.8, ease: "power3.out" });
    var spotY = gsap.quickTo(heroVeil, "--audio-spot-y", { duration: 0.8, ease: "power3.out" });
    hero.addEventListener("pointermove", function (event) {
      var bounds = hero.getBoundingClientRect();
      spotX((((event.clientX - bounds.left) / bounds.width) * 100).toFixed(1) + "%");
      spotY((((event.clientY - bounds.top) / bounds.height) * 100).toFixed(1) + "%");
    }, { passive: true });
  }

  gsap.to(heroPhoto, {
    scale: 1.2,
    yPercent: 8,
    ease: "none",
    scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: 0.8 }
  });

  function revealEach(selector, options) {
    gsap.utils.toArray(selector).forEach(function (element, index) {
      var settings = options || {};
      gsap.from(element, {
        y: settings.y || 34,
        opacity: 0,
        rotationX: settings.rotationX || 0,
        transformOrigin: "50% 100%",
        duration: settings.duration || 0.85,
        delay: (index % (settings.group || 3)) * (settings.stagger || 0.08),
        ease: settings.ease || "power3.out",
        scrollTrigger: { trigger: element, start: settings.start || "top 88%", once: true }
      });
    });
  }

  revealEach(".audio-v2-ledger-row", { y: 26, stagger: 0.1 });
  gsap.utils.toArray(".audio-v2-ledger-row").forEach(function (row, index) {
    gsap.to(row, {
      "--audio-level": 0.55 + index * 0.2,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: row, start: "top 86%", once: true }
    });
  });

  var quote = page.querySelector(".audio-v2-quote");
  if (quote) {
    gsap.from(quote, {
      x: -30,
      opacity: 0,
      duration: 0.9,
      ease: "power3.out",
      scrollTrigger: { trigger: quote, start: "top 82%", once: true }
    });
    gsap.fromTo(quote, { "--audio-wipe-scale": 0 }, {
      "--audio-wipe-scale": 1,
      duration: 0.72,
      ease: "power3.out",
      scrollTrigger: { trigger: quote, start: "top 82%", once: true }
    });
  }

  gsap.utils.toArray(".audio-v2-scene").forEach(function (scene, index) {
    var image = scene.querySelector("img");
    gsap.from(scene, {
      y: 58,
      opacity: 0,
      rotationY: index === 1 ? -6 : 4,
      duration: 1.05,
      ease: "power3.out",
      scrollTrigger: { trigger: scene, start: "top 88%", once: true }
    });
    if (image) {
      gsap.fromTo(image, { scale: 1.12 }, {
        scale: 1,
        ease: "none",
        scrollTrigger: { trigger: scene, start: "top bottom", end: "bottom top", scrub: 0.65 }
      });
    }
  });

  revealEach(".audio-v2-steps li", { y: 40, rotationX: -8, stagger: 0.12, duration: 0.95 });

  var mapFrame = page.querySelector(".audio-v2-map-frame");
  if (mapFrame) {
    gsap.fromTo(mapFrame, { "--audio-map-pulse": 0.58, opacity: 0.25 }, {
      "--audio-map-pulse": 1,
      opacity: 1,
      duration: 1.25,
      ease: "power3.out",
      scrollTrigger: { trigger: mapFrame, start: "top 84%", once: true }
    });
  }

  if (rail && railFill && railNeedle && window.matchMedia("(min-width: 769px)").matches) {
    var railState = { progress: 0 };
    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: function (self) {
        gsap.to(railState, {
          progress: self.progress,
          duration: Math.abs(self.getVelocity()) > 900 ? 0.18 : 0.7,
          ease: Math.abs(self.getVelocity()) > 900 ? "power2.out" : "elastic.out(1, 0.5)",
          overwrite: true,
          onUpdate: function () {
            railFill.style.transform = "scaleY(" + railState.progress.toFixed(4) + ")";
            railNeedle.style.top = (100 - railState.progress * 100).toFixed(2) + "%";
          }
        });
      }
    });

    if (essay) {
      ScrollTrigger.create({
        trigger: essay,
        start: "top 65%",
        end: "bottom 35%",
        toggleClass: { targets: rail, className: "is-muted" }
      });
    }

  }

  var roomPanels = page.querySelectorAll(".room-house-panel");
  var syncRoomState = function () {
    var roomOpen = Array.prototype.some.call(roomPanels, function (panel) { return !panel.hidden; });
    if (rail) rail.classList.toggle("is-room-open", roomOpen);
    requestAnimationFrame(function () { ScrollTrigger.refresh(); });
  };
  var roomObserver = new MutationObserver(syncRoomState);
  roomPanels.forEach(function (panel) {
    roomObserver.observe(panel, { attributes: true, attributeFilter: ["hidden"] });
  });
  syncRoomState();

  document.addEventListener("visibilitychange", function () {
    gsap.globalTimeline.timeScale(document.hidden ? 0 : 1);
  });
}());
