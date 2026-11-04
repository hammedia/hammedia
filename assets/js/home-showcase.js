/* One work at a time. Hash links remain usable when JavaScript is unavailable. */
(function () {
 'use strict';
 var root = document.querySelector('[data-showcase]'); if (!root) return;
 var list = root.querySelector('.showcase-tabs');
 var tabs = Array.from(list.querySelectorAll('a'));
 var panels = tabs.map(function (tab) { return document.getElementById(tab.hash.slice(1)); });
 list.setAttribute('role', 'tablist');
 tabs.forEach(function (tab, index) {
  tab.setAttribute('role', 'tab'); tab.setAttribute('aria-controls', panels[index].id);
  panels[index].setAttribute('role', 'tabpanel'); panels[index].setAttribute('aria-labelledby', tab.id); panels[index].tabIndex = 0;
  tab.addEventListener('click', function (event) {
   if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
   event.preventDefault(); select(index, true);
  });
  tab.addEventListener('keydown', function (event) {
   var next;
   if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
   if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
   if (event.key === 'Home') next = 0;
   if (event.key === 'End') next = tabs.length - 1;
   if (next !== undefined) { event.preventDefault(); tabs.forEach(function (tab, n) { tab.tabIndex = n === next ? 0 : -1; }); tabs[next].focus(); }
   if (event.key === ' ') { event.preventDefault(); select(index, true); }
  });
 });
 function select(index, rememberHistory) {
  panels.forEach(function (panel, n) {
   panel.hidden = n !== index;
   tabs[n].setAttribute('aria-selected', String(n === index)); tabs[n].tabIndex = n === index ? 0 : -1;
   if (n !== index) {
    panel.querySelectorAll('video').forEach(function (video) { video.pause(); });
    panel.querySelectorAll('iframe[src*="youtube"]').forEach(function (frame) {
     frame.contentWindow.postMessage(JSON.stringify({event:'command',func:'pauseVideo',args:[]}), 'https://www.youtube-nocookie.com');
    });
   }
  });
  if (rememberHistory && location.hash !== '#' + panels[index].id) history.pushState(Object.assign({}, history.state, {hamHomeWork:panels[index].id}), '', '#' + panels[index].id);
  document.dispatchEvent(new Event('ham:workchange'));
  try { sessionStorage.setItem('ham-home-showcase:' + location.pathname, panels[index].id); } catch (_) {}
 }
 function indexOf(id) { return panels.findIndex(function (panel) { return panel.id === id; }); }
 function hashChoice() { var index = indexOf(location.hash.slice(1)); if (index >= 0) select(index); return index; }
 var initial = indexOf(location.hash.slice(1));
 if (initial < 0) initial = indexOf(history.state && history.state.hamHomeWork);
 if (initial < 0) { try { initial = indexOf(sessionStorage.getItem('ham-home-showcase:' + location.pathname)); } catch (_) {} }
 if (initial < 0) initial = 0;
 select(initial);
 history.replaceState(Object.assign({}, history.state, {hamHomeWork:panels[initial].id}), '', location.href);
 window.addEventListener('hashchange', hashChoice);
 window.addEventListener('popstate', function () {
  var index = indexOf(location.hash.slice(1));
  if (index < 0) index = indexOf(history.state && history.state.hamHomeWork);
  select(index < 0 ? 0 : index);
 });
 root.dataset.showcaseReady = 'true';
})();
