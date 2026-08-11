/* ============================================================
   BRAND NEW DAY — gallery page
   Masonry grid, tag/type filters, lightbox with keyboard + swipe
   ============================================================ */
(function () {
  'use strict';

  var items = window.GALLERY || [];
  var grid, lb, stage, current = 0, visible = [];

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- Grid -------------------------------------------- */
  function render() {
    var tiles = items.map(function (it, i) {
      var size = it.size === 'tall' ? ' gal-item--tall' : (it.size === 'wide' ? ' gal-item--wide' : '');
      var media = it.type === 'video'
        ? '<video src="' + esc(it.src) + '"' + (it.poster ? ' poster="' + esc(it.poster) + '"' : '') +
          ' muted playsinline preload="metadata"></video>' +
          '<span class="gal-item__play"><svg><use href="#i-play"></use></svg></span>' +
          '<span class="gal-item__badge">Video</span>'
        : '<img src="' + esc(it.src) + '" alt="' + esc(it.cap || '') + '" loading="lazy">';

      return '<button class="gal-item' + size + '" data-i="' + i + '" data-type="' + it.type + '"' +
             ' data-tag="' + esc(it.tag || '') + '">' +
               media +
               '<span class="gal-item__overlay">' +
                 '<span class="gal-item__cap">' + esc(it.cap || '') + '</span>' +
                 '<span class="gal-item__tag">' + esc(it.tag || '') + '</span>' +
               '</span>' +
             '</button>';
    }).join('');

    /* "waiting for your photos" placeholders */
    var n = window.GALLERY_PLACEHOLDERS || 0;
    var holders = '';
    for (var k = 0; k < n; k++) {
      holders += '<div class="gal-item gal-item--empty" data-type="placeholder" data-tag="">' +
                   '<svg><use href="#i-camera"></use></svg>' +
                   '<span>Photos coming<br>after camp</span>' +
                 '</div>';
    }

    grid.innerHTML = tiles + holders;

    grid.querySelectorAll('.gal-item:not(.gal-item--empty)').forEach(function (el) {
      el.addEventListener('click', function () { openLB(+el.dataset.i); });
      var v = el.querySelector('video');
      if (v) {
        el.addEventListener('mouseenter', function () { v.play().catch(function () {}); });
        el.addEventListener('mouseleave', function () { v.pause(); v.currentTime = 0; });
      }
    });
  }

  function applyFilter(f) {
    var shown = 0;
    grid.querySelectorAll('.gal-item').forEach(function (el) {
      var ok = f === 'all' || el.dataset.type === f || el.dataset.tag === f;
      if (el.classList.contains('gal-item--empty')) ok = (f === 'all');
      el.hidden = !ok;
      if (ok && !el.classList.contains('gal-item--empty')) shown++;
    });
    document.getElementById('gal-empty').hidden = shown > 0;

    visible = Array.prototype.slice
      .call(grid.querySelectorAll('.gal-item:not([hidden]):not(.gal-item--empty)'))
      .map(function (el) { return +el.dataset.i; });
  }

  /* ---------- Lightbox ---------------------------------------- */
  function openLB(i) {
    current = visible.indexOf(i);
    if (current < 0) current = 0;
    paint();
    lb.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('lb-close').focus();
  }

  function closeLB() {
    lb.classList.remove('is-open');
    stage.innerHTML = '';
    document.body.style.overflow = '';
  }

  function paint() {
    var it = items[visible[current]];
    if (!it) return;

    stage.innerHTML = it.type === 'video'
      ? '<video src="' + esc(it.src) + '"' + (it.poster ? ' poster="' + esc(it.poster) + '"' : '') +
        ' controls autoplay playsinline></video>'
      : '<img src="' + esc(it.src) + '" alt="' + esc(it.cap || '') + '">';

    document.getElementById('lb-title').textContent = it.cap || '';
    document.getElementById('lb-count').textContent = (current + 1) + ' / ' + visible.length;
  }

  function step(d) {
    if (!visible.length) return;
    current = (current + d + visible.length) % visible.length;
    paint();
  }

  /* ---------- Boot -------------------------------------------- */
  window.initPage = function () {
    grid = document.getElementById('gal-grid');
    lb = document.getElementById('lightbox');
    stage = document.getElementById('lb-stage');
    if (!grid) return;

    render();
    applyFilter('all');

    document.querySelectorAll('#gal-filters .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('#gal-filters .chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        applyFilter(chip.dataset.filter);
      });
    });

    document.getElementById('lb-close').addEventListener('click', closeLB);
    document.getElementById('lb-prev').addEventListener('click', function () { step(-1); });
    document.getElementById('lb-next').addEventListener('click', function () { step(1); });

    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lightbox__stage')) closeLB();
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('is-open')) return;
      if (e.key === 'Escape') closeLB();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    });

    /* Swipe */
    var x0 = null;
    stage.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 60) step(dx < 0 ? 1 : -1);
      x0 = null;
    }, { passive: true });
  };
})();
