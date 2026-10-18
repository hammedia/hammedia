(function () {
  'use strict';
  var section = document.querySelector('.colleague-profiles');
  if (!section) return;
  var launchers = new Map();
  section.querySelectorAll('.colleague-player').forEach(function (player) {
    launchers.set(player, player.querySelector('.colleague-video-launch'));
  });
  section.addEventListener('click', function (event) {
    var launch = event.target.closest('.colleague-video-launch');
    if (!launch || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    var id = launch.dataset.youtubeId;
    if (!/^[a-zA-Z0-9_-]{11}$/.test(id || '')) return;
    event.preventDefault();
    // One film at a time; the original link remains the no-JS / new-tab route.
    launchers.forEach(function (saved, player) {
      if (player.querySelector('iframe')) player.replaceChildren(saved);
    });
    var frame = document.createElement('iframe');
    frame.title = launch.getAttribute('aria-label');
    frame.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&playsinline=1&rel=0';
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.referrerPolicy = 'strict-origin-when-cross-origin';
    frame.allowFullscreen = true;
    launch.replaceWith(frame);
    frame.focus();
  });
}());
