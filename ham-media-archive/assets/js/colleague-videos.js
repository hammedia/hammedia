(function () {
  'use strict';
  var section = document.querySelector('.colleague-profiles');
  if (!section) return;
  var lang = document.documentElement.lang.slice(0, 2);
  var words = {
    ko: ['재생', '일시 정지', '소리 켜기', '소리 끄기'],
    en: ['Play', 'Pause', 'Sound on', 'Sound off'],
    ja: ['再生', '一時停止', '音声をオン', '音声をオフ']
  }[lang] || ['Play', 'Pause', 'Sound on', 'Sound off'];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var api, active;
  var keepHomePoster = !!document.querySelector('.home-experience');
  var cards = Array.from(section.querySelectorAll('.colleague-player')).map(function (box, index) {
    var link = box.querySelector('.colleague-video-launch');
    var controls = document.createElement('div');
    controls.className = 'colleague-video-controls';
    var play = document.createElement('button');
    var sound = document.createElement('button');
    play.type = sound.type = 'button';
    play.textContent = words[0]; sound.textContent = words[2];
    sound.setAttribute('aria-pressed', 'false');
    controls.append(play, sound); box.after(controls);
    var card = {box: box, link: link, index: index, play: play, sound: sound,
      visible: false, ready: false, paused: false, ended: false, player: null};
    play.addEventListener('click', function () {
      if (card.ready && card.player.getPlayerState() === 1) {
        card.paused = true; stop(card);
      } else { card.paused = false; card.ended = false; start(card); }
    });
    sound.addEventListener('click', function () {
      var audible = card.ready && !card.player.isMuted();
      if (audible) { card.player.mute(); update(card); }
      else { card.paused = false; card.ended = false; start(card, true); }
    });
    link.addEventListener('click', function (event) {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault(); card.paused = false; card.ended = false; start(card);
    });
    return card;
  });
  function update(card) {
    if (!card.ready) return;
    var playing = card.player.getPlayerState() === 1;
    card.play.textContent = playing ? words[1] : words[0];
    card.sound.textContent = card.player.isMuted() ? words[2] : words[3];
    card.sound.setAttribute('aria-pressed', String(!card.player.isMuted()));
  }
  function loadAPI() {
    if (window.YT && window.YT.Player) return Promise.resolve();
    if (!api) api = new Promise(function (resolve, reject) {
      var previous = window.onYouTubeIframeAPIReady;
      var timeout = setTimeout(function () { reject(new Error('YouTube API timeout')); }, 15000);
      window.onYouTubeIframeAPIReady = function () {
        clearTimeout(timeout); if (previous) previous(); resolve();
      };
      var script = document.createElement('script');
      script.src = 'https://www.youtube.com/iframe_api'; script.async = true;
      script.onerror = function () { clearTimeout(timeout); reject(new Error('YouTube API unavailable')); };
      document.head.append(script);
    });
    return api;
  }
  function stop(card) {
    if (card.ready) {
      var state = card.player.getPlayerState();
      if (state === 1 || state === 3) card.suspending = true;
      card.player.mute(); card.player.pauseVideo(); update(card);
    }
    card.wantSound = false;
  }
  function start(card, sound) {
    cards.forEach(function (other) { if (other !== card) stop(other); });
    active = card; card.wantSound = !!sound;
    function play() {
      if (active !== card || document.hidden || !card.visible) return;
      card.player.mute();
      if (card.wantSound) { card.player.setVolume(100); card.player.unMute(); }
      card.player.playVideo(); update(card);
    }
    if (card.ready) { play(); return; }
    if (card.loading) return;
    card.loading = true;
    loadAPI().then(function () {
      var frame = document.createElement('iframe');
      frame.id = 'colleague-youtube-' + card.index;
      frame.title = card.link.getAttribute('aria-label');
      frame.src = 'https://www.youtube-nocookie.com/embed/' + card.link.dataset.youtubeId +
        '?enablejsapi=1&mute=1&playsinline=1&rel=0&origin=' + encodeURIComponent(location.origin);
      frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      frame.referrerPolicy = 'strict-origin-when-cross-origin'; frame.allowFullscreen = true;
      if (keepHomePoster) {
        card.link.style.cssText = 'position:absolute;inset:0;z-index:2';
        frame.tabIndex = -1;
        card.box.appendChild(frame);
      } else card.box.replaceChildren(frame);
      card.player = new YT.Player(frame, {events: {
        onReady: function () { card.ready = true; card.player.mute(); play(); },
        onStateChange: function (event) {
          if (keepHomePoster && event.data === 1) {
            card.link.style.cssText = '';
            frame.removeAttribute('tabindex'); card.link.hidden = true;
          }
          if (event.data === 1 || event.data === 3) {
            if (!card.visible || document.hidden) { stop(card); return; }
            if (active !== card) {
              // Buffering marks a native play request before playback starts.
              // Ignore late events from a player we have just asked to pause.
              if (card.suspending) { stop(card); return; }
              active = card; card.paused = false;
              cards.forEach(function (other) { if (other !== card) stop(other); });
            }
          }
          if (event.data === 2) {
            if (card.suspending) card.suspending = false;
            else if (active === card && card.visible && !document.hidden) card.paused = true;
          }
          if (event.data === 0) { card.ended = true; choose(); }
          update(card);
        },
        onAutoplayBlocked: function () { update(card); },
        onError: function () {
          stop(card); card.ready = false; card.player.destroy();
          card.link.hidden = false; card.link.style.cssText = '';
          card.box.replaceChildren(card.link.cloneNode(true));
          card.play.parentElement.hidden = true;
        }
      }});
    }).catch(function () {
      card.loading = false;
      // The existing direct YouTube link remains usable even if the API is blocked.
      card.link.replaceWith(card.link.cloneNode(true));
      card.play.parentElement.hidden = true;
    });
  }
  function choose() {
    if (document.hidden || reduced.matches) return;
    if (active && active.visible && !active.ended) {
      if (active.ready && !active.paused && active.player.getPlayerState() === 2) start(active);
      return;
    }
    var next = cards.find(function (card) { return card.visible && !card.paused && !card.ended; });
    if (next) start(next);
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var card = cards.find(function (item) { return item.box === entry.target; });
        var visible = entry.isIntersecting && entry.intersectionRatio > 0.5;
        if (!visible && card.visible) { stop(card); card.ended = false; }
        card.visible = visible;
      });
      choose();
    }, {threshold: [0, 0.51]});
    cards.forEach(function (card) { observer.observe(card.box); });
  } else { cards.forEach(function (card) { card.visible = true; }); }
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) cards.forEach(stop);
    else if (active && active.visible && !active.paused && !active.ended) start(active);
    else choose();
  });
  setInterval(function () {
    if (!document.hidden) cards.forEach(function (card) { if (card.ready && card.visible) update(card); });
  }, 500);
  reduced.addEventListener('change', function () {
    if (reduced.matches) cards.forEach(stop); else choose();
  });
}());
