/* ============================================================
   BRAND NEW DAY — kinetic typography loader
   ------------------------------------------------------------
   Characters fly in from random points in 3D, hold, then fly out
   while the next word arrives. Runs only on the entry page.

   Safety: the markup lives in the HTML so there is no flash of
   unstyled content, and the CSS carries its own failsafe fade so
   a JS error can never leave a visitor staring at a locked
   screen. This file simply ends it sooner, once the page is up.
   ============================================================ */
(function () {
  'use strict';

  var loader = document.querySelector('.loader');
  if (!loader) return;

  var wordEl = loader.querySelector('.loader__word');
  var barEl = loader.querySelector('.loader__bar');
  var WORDS = ['Brand', 'New', 'Day'];
  var STAG = 0.035;    // per-character stagger, seconds
  var IN = 700;        // matches the CSS animation-duration
  var HOLD = 380;      // how long a finished word sits before leaving
  var OUT = 300;       // fly-out overlap
  /* The curtain waits for all three words rather than a fixed minimum —
     showing only "Brand" and cutting away was the whole complaint. */

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var timers = [];
  var i = 0;
  var finished = false;
  var spelled = false;   // all three words have played
  var pageUp = false;    // window.load has fired

  document.documentElement.style.overflow = 'hidden';

  function rand(n) { return (Math.random() - 0.5) * n; }

  function spell(word) {
    wordEl.innerHTML = '';
    return word.split('').map(function (ch, idx) {
      var span = document.createElement('span');
      span.className = 'char';
      span.textContent = ch;
      span.style.setProperty('--transform-from',
        'translate3d(' + rand(800).toFixed(0) + 'px,' + rand(800).toFixed(0) + 'px,' + rand(800).toFixed(0) + 'px)' +
        ' rotateX(' + rand(360).toFixed(0) + 'deg) rotateY(' + rand(360).toFixed(0) + 'deg)');
      span.style.animationName = 'fly-in';
      span.style.animationDelay = (idx * STAG) + 's';
      wordEl.appendChild(span);
      return span;
    });
  }

  function cycle() {
    if (finished) return;

    if (i >= WORDS.length) {          // the whole title has been spelled out
      spelled = true;
      maybeFinish();
      return;
    }

    var chars = spell(WORDS[i]);
    var inTime = reduced ? 0 : chars.length * STAG * 1000 + IN;

    timers.push(setTimeout(function () {
      if (finished) return;
      chars.forEach(function (span, idx) {
        span.style.setProperty('--transform-to',
          'translate3d(' + rand(800).toFixed(0) + 'px,' + rand(800).toFixed(0) + 'px,' + rand(800).toFixed(0) + 'px)' +
          ' rotateX(' + rand(360).toFixed(0) + 'deg) rotateY(' + rand(360).toFixed(0) + 'deg)');
        span.style.animationName = 'fly-out';
        span.style.animationDelay = ((chars.length - idx) * STAG) + 's';
      });
    }, inTime + HOLD));

    timers.push(setTimeout(function () {
      i += 1;
      cycle();
    }, inTime + HOLD + OUT));
  }

  /* Leave only once the title has finished AND the page is ready */
  function maybeFinish() {
    if (spelled && pageUp) done();
  }

  function done() {
    if (finished) return;
    finished = true;
    timers.forEach(clearTimeout);

    setTimeout(function () {
      loader.classList.add('is-done');
      document.documentElement.style.overflow = '';
      // hand the page its entrance now that the curtain is up
      document.documentElement.classList.add('is-loaded');
      window.dispatchEvent(new CustomEvent('camp:loaded'));
      setTimeout(function () {
        if (loader.parentNode) loader.parentNode.removeChild(loader);
      }, 800);
    }, 180);
  }

  /* progress hairline — real signal where we have it, eased where we don't */
  if (barEl) {
    var pct = 0;
    var creep = setInterval(function () {
      pct = Math.min(pct + Math.random() * 9, 92);
      barEl.style.width = pct + '%';
      if (finished) { clearInterval(creep); barEl.style.width = '100%'; }
    }, 180);
  }

  cycle();

  function ready() { pageUp = true; maybeFinish(); }
  if (document.readyState === 'complete') ready();
  else window.addEventListener('load', ready);

  /* hard ceiling — a stalled image must never hold the site hostage */
  setTimeout(done, 8000);
})();
