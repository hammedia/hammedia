/* Enhance the existing nine-memory selection; navigation remains in main.js. */
(function () {
 'use strict';
 const exhibit = document.querySelector('.car-memory-exhibit');
 if (!exhibit) return;
 const photo = exhibit.querySelector('figure img');
 const figures = Array.from(document.querySelectorAll('#car-photo-room .room-house-photo'));
 if (!photo || !figures.length) return;
 const enlarge = document.createElement('a');
 enlarge.className = 'car-record-link car-exhibit-enlarge';
 enlarge.textContent = '선택한 사진과 기억 크게 보기';
 enlarge.dataset.roomReturnLabel = '보던 기억 선택으로 돌아가기';
 enlarge.id = 'car-exhibit-enlarge';
 exhibit.append(enlarge);
 function sync() {
  const source = new URL(photo.getAttribute('src'), location.href).pathname;
  const figure = figures.find(item => new URL(item.querySelector('img').getAttribute('src'), location.href).pathname === source);
  if (!figure) { enlarge.hidden = true; return; }
  enlarge.hidden = false;
  enlarge.href = '#' + figure.id;
  enlarge.dataset.roomPhotoTarget = figure.id;
 }
 exhibit.addEventListener('click', sync);
 sync();
})();
