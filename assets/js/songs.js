/* ============================================================
   BRAND NEW DAY — songbook page
   Index, live search, session filter, full-screen lyric reader
   with presentation mode, text sizing and keyboard nav
   ============================================================ */
(function () {
  'use strict';

  var songs = window.SONGS || [];
  var listEl, noResults, readerEl, current = -1;
  var query = '', filter = 'all';
  var lyricSize = 1.35, presentSize = 2.6, presenting = false;

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function plainText(song) {
    return (song.title + ' ' + (song.subtitle || '') + ' ' + song.lang + ' ' + song.session + ' ' +
      song.blocks.map(function (b) { return b.lines.join(' '); }).join(' ')).toLowerCase();
  }

  /* ---------- Index ------------------------------------------- */
  function renderList() {
    var q = query.trim().toLowerCase();

    var html = songs.map(function (s) {
      var matches = (filter === 'all' || s.session === filter) && (!q || plainText(s).indexOf(q) > -1);
      var sub = (s.subtitle ? s.subtitle + ' · ' : '') + s.lang;

      return '<button class="song-row' + (s.theme ? ' is-theme' : '') + '" data-no="' + s.no + '"' +
             (matches ? '' : ' hidden') + '>' +
               '<span class="song-row__no">' + String(s.no).padStart(2, '0') + '</span>' +
               '<span>' +
                 '<span class="song-row__title">' + esc(s.title) + '</span>' +
                 '<span class="song-row__sub">' + esc(sub) + '</span>' +
               '</span>' +
               '<span class="song-row__badge">' + esc(s.session) + '</span>' +
             '</button>';
    }).join('');

    listEl.innerHTML = html;
    var visible = listEl.querySelectorAll('.song-row:not([hidden])').length;
    noResults.hidden = visible > 0;

    listEl.querySelectorAll('.song-row').forEach(function (row) {
      row.addEventListener('click', function () { open(+row.dataset.no); });
    });
  }

  /* ---------- Running order ----------------------------------- */
  function renderOrder() {
    var grid = document.getElementById('order-grid');
    if (!grid || !window.SONG_ORDER) return;

    grid.innerHTML = window.SONG_ORDER.map(function (g) {
      var items = g.songs.map(function (no) {
        var s = songs.find(function (x) { return x.no === no; });
        if (!s) return '';
        return '<li><b>' + esc(s.title) + '</b> &mdash; ' + esc(s.lang) + '</li>';
      }).join('');
      return '<div class="panel brackets order-group">' +
               '<h3>' + esc(g.session) + '</h3>' +
               '<ol start="' + g.songs[0] + '">' + items + '</ol>' +
             '</div>';
    }).join('');

    grid.querySelectorAll('.order-group li b').forEach(function (b) {
      b.style.cursor = 'pointer';
      b.addEventListener('click', function () {
        var s = songs.find(function (x) { return x.title === b.textContent; });
        if (s) open(s.no);
      });
    });
  }

  /* ---------- Reader ------------------------------------------ */
  function open(no) {
    var i = songs.findIndex(function (s) { return s.no === no; });
    if (i < 0) return;
    current = i;
    paint();
    readerEl.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    document.getElementById('r-close').focus();
  }

  function close() {
    readerEl.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  function paint() {
    var s = songs[current];
    if (!s) return;

    document.getElementById('r-title').textContent = s.title;
    document.getElementById('r-sub').textContent =
      (s.subtitle ? s.subtitle + ' · ' : '') + s.lang + ' · ' + s.session;
    document.getElementById('r-pos').textContent = 'Song ' + s.no + ' of ' + songs.length;

    document.getElementById('r-lyrics').innerHTML = s.blocks.map(function (b) {
      var lines = b.lines.map(function (l) {
        return '<span>' + (l ? esc(l) : '&nbsp;') + '</span>';
      }).join('');
      return '<div class="lyric-block lyric-block--' + b.type + '">' +
               (b.label ? '<div class="lyric-block__label">' + esc(b.label) + '</div>' : '') +
               '<div class="lyric-block__lines">' + lines + '</div>' +
             '</div>';
    }).join('');

    document.getElementById('r-body').scrollTop = 0;
    document.getElementById('r-prev').disabled = current === 0;
    document.getElementById('r-next').disabled = current === songs.length - 1;
  }

  function step(d) {
    var next = current + d;
    if (next < 0 || next >= songs.length) return;
    current = next;
    paint();
  }

  function applySize() {
    document.getElementById('r-lyrics').style.setProperty(
      '--lyric-size', (presenting ? presentSize : lyricSize) + 'rem'
    );
  }

  function bump(d) {
    if (presenting) presentSize = Math.min(6, Math.max(1.4, presentSize + d));
    else lyricSize = Math.min(3.2, Math.max(0.95, lyricSize + d));
    applySize();
  }

  function togglePresent() {
    presenting = !presenting;
    readerEl.classList.toggle('is-present', presenting);
    var btn = document.getElementById('r-present');
    btn.classList.toggle('is-active', presenting);
    btn.setAttribute('aria-pressed', String(presenting));
    btn.querySelector('span').textContent = presenting ? 'Exit' : 'Present';
    applySize();

    if (presenting && document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(function () {});
    } else if (!presenting && document.fullscreenElement && document.exitFullscreen) {
      document.exitFullscreen().catch(function () {});
    }
  }

  /* ---------- Boot -------------------------------------------- */
  window.initPage = function () {
    listEl = document.getElementById('song-list');
    noResults = document.getElementById('no-results');
    readerEl = document.getElementById('reader');
    if (!listEl) return;

    renderList();
    renderOrder();
    applySize();

    /* Search */
    var input = document.getElementById('song-search');
    var clear = document.getElementById('search-clear');
    input.addEventListener('input', function () {
      query = input.value;
      clear.hidden = !query;
      renderList();
    });
    clear.addEventListener('click', function () {
      input.value = ''; query = ''; clear.hidden = true;
      renderList(); input.focus();
    });

    /* Session filter */
    document.querySelectorAll('#song-filters .chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        document.querySelectorAll('#song-filters .chip').forEach(function (c) { c.classList.remove('is-active'); });
        chip.classList.add('is-active');
        filter = chip.dataset.filter;
        renderList();
      });
    });

    /* Reader controls */
    document.getElementById('r-close').addEventListener('click', close);
    document.getElementById('r-prev').addEventListener('click', function () { step(-1); });
    document.getElementById('r-next').addEventListener('click', function () { step(1); });
    document.getElementById('r-bigger').addEventListener('click', function () { bump(0.18); });
    document.getElementById('r-smaller').addEventListener('click', function () { bump(-0.18); });
    document.getElementById('r-present').addEventListener('click', togglePresent);

    /* Keyboard */
    document.addEventListener('keydown', function (e) {
      if (!readerEl.classList.contains('is-open')) return;
      if (e.key === 'Escape') { presenting ? togglePresent() : close(); }
      else if (e.key === 'ArrowRight' || e.key === 'PageDown') { step(1); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { step(-1); }
      else if (e.key === '+' || e.key === '=') { bump(0.18); }
      else if (e.key === '-') { bump(-0.18); }
      else if (e.key.toLowerCase() === 'p') { togglePresent(); }
    });

    /* Swipe between songs on touch */
    var x0 = null, y0 = null;
    var body = document.getElementById('r-body');
    body.addEventListener('touchstart', function (e) {
      x0 = e.touches[0].clientX; y0 = e.touches[0].clientY;
    }, { passive: true });
    body.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0;
      var dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.6) step(dx < 0 ? 1 : -1);
      x0 = y0 = null;
    }, { passive: true });

    /* Print the whole book */
    var print = document.getElementById('print-book');
    if (print) {
      print.addEventListener('click', function () {
        var w = window.open('', '_blank');
        if (!w) { window.toast('Allow pop-ups to print'); return; }

        var body = songs.map(function (s) {
          var blocks = s.blocks.map(function (b) {
            return (b.label ? '<h3>' + esc(b.label) + '</h3>' : '') +
                   '<p>' + b.lines.map(esc).join('<br>') + '</p>';
          }).join('');
          return '<section><h2>' + s.no + '. ' + esc(s.title) + '</h2>' +
                 '<p class="m">' + esc((s.subtitle ? s.subtitle + ' · ' : '') + s.lang + ' · ' + s.session) + '</p>' +
                 blocks + '</section>';
        }).join('');

        w.document.write(
          '<!doctype html><html><head><meta charset="utf-8"><title>Brand New Day — Camp Songbook</title>' +
          '<style>' +
          'body{font:15px/1.55 Georgia,serif;max-width:42em;margin:2em auto;padding:0 1em;color:#111}' +
          'h1{font:700 30px/1.1 Arial,sans-serif;text-transform:uppercase;letter-spacing:.04em;margin:0}' +
          '.lead{color:#666;margin:.3em 0 2.4em}' +
          'section{page-break-inside:avoid;break-inside:avoid;margin-bottom:2.4em}' +
          'h2{font:700 19px/1.2 Arial,sans-serif;border-bottom:2px solid #b71c1c;padding-bottom:.2em;margin:0 0 .2em}' +
          'h3{font:700 10px/1 Arial,sans-serif;letter-spacing:.24em;text-transform:uppercase;color:#b71c1c;margin:1.2em 0 .3em}' +
          '.m{font:11px/1 Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#888;margin:0 0 .6em}' +
          'p{margin:0 0 .5em}' +
          '</style></head><body>' +
          '<h1>Brand New Day — Camp Songbook</h1>' +
          '<p class="lead">Christos Mar Thoma Yuvajana Sakhyam, Kakkanad · Youth Camp 2026 · ' +
          'Mar Thoma Meadows, Thekkady · 14–16 August 2026</p>' +
          body + '</body></html>'
        );
        w.document.close();
        w.focus();
        setTimeout(function () { w.print(); }, 400);
      });
    }

    /* Deep link: songs.html#song-4 */
    var m = /^#song-(\d+)$/.exec(location.hash);
    if (m) open(+m[1]);
  };
})();
