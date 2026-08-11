/* ============================================================
   BRAND NEW DAY — motion layer (GSAP + ScrollTrigger)
   ------------------------------------------------------------
   Progressive enhancement. If GSAP is missing, or the visitor
   asks for reduced motion, this file does nothing and the CSS /
   IntersectionObserver reveals in site.js take over instead.

   <html class="gsap-on"> is set synchronously (before
   DOMContentLoaded) so site.js knows to stand down and the CSS
   transitions on [data-reveal] can be switched off.
   ============================================================ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!window.gsap || !window.ScrollTrigger || reduced) return;

  var gsap = window.gsap;
  var ST = window.ScrollTrigger;
  gsap.registerPlugin(ST);

  /* The menu uses the source component's custom curve when the plugin is
     present; otherwise everything falls back to the house ease. */
  if (window.CustomEase) {
    gsap.registerPlugin(window.CustomEase);
    if (!gsap.parseEase('main')) window.CustomEase.create('main', '0.65, 0.01, 0.05, 0.99');
  }
  var MENU_EASE = gsap.parseEase('main') ? 'main' : 'power3.inOut';

  document.documentElement.classList.add('gsap-on');

  var EASE = 'power3.out';

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }

  /* ---------- Reveal engine -------------------------------------
     ScrollTrigger.batch is driven by IntersectionObserver, so anything
     skipped in a single jump (scrollbar drag, End key, in-page anchor)
     never intersects and would stay at opacity 0 forever. Every hidden
     element is therefore tagged, and a sweep catches up whatever the
     observer missed.                                                */
  var pending = [];

  function revealGroup(items, hidden, opts) {
    if (!items.length) return;
    opts = opts || {};

    gsap.set(items, hidden);
    items.forEach(function (el) { el.__mHidden = hidden; pending.push(el); });

    function show(batch) {
      batch = batch.filter(function (el) { return el.__mHidden; });
      if (!batch.length) return;
      batch.forEach(function (el) { el.__mHidden = null; });
      gsap.to(batch, {
        opacity: 1, y: 0, x: 0, scale: 1,
        duration: opts.duration || 0.8,
        ease: EASE,
        stagger: opts.stagger || 0.08,
        overwrite: true
      });
    }

    ST.batch(items, { start: opts.start || 'top 90%', once: true, onEnter: show });
  }

  /* Reveal anything already on screen (or scrolled past) that the
     observer never got to fire for. */
  function sweep() {
    if (!pending.length) return;
    var vh = window.innerHeight;
    var due = [];

    pending = pending.filter(function (el) {
      if (!el.__mHidden) return false;
      if (el.getBoundingClientRect().top < vh * 0.96) { due.push(el); return false; }
      return true;
    });

    if (!due.length) return;
    due.forEach(function (el) { el.__mHidden = null; });
    gsap.to(due, { opacity: 1, y: 0, x: 0, scale: 1, duration: 0.7, ease: EASE, stagger: 0.05, overwrite: true });
  }

  function reveals() {
    revealGroup($$('[data-reveal]'), { opacity: 0, y: 28 }, { start: 'top 88%', duration: 0.85, stagger: 0.09 });
  }

  /* ---------- Hero ---------------------------------------------
     Entrance timeline, then the blades answer both the pointer and
     the scroll while the threat words get cut through.            */
  function hero() {
    var el = $('.hero');
    if (!el) return;

    /* If the loader is on screen the hero entrance would play behind it and
       be over before anyone saw it — hold until the curtain lifts. */
    var gated = !!document.querySelector('.loader');
    var tl = gsap.timeline({ defaults: { ease: EASE }, paused: gated });
    if (gated) {
      var go = function () { tl.play(); };
      window.addEventListener('camp:loaded', go, { once: true });
      setTimeout(go, 7000);   // never strand the hero if that event is missed
    }

    tl.from('.hero__org',   { opacity: 0, y: 18, duration: 0.7 })
      .from('.hero .kicker', { opacity: 0, y: 14, duration: 0.6 }, '-=0.45')
      .from('.hero__title span', { opacity: 0, y: 60, duration: 1.1, stagger: 0.13, ease: 'expo.out' }, '-=0.3')
      .from('.blade', {
        opacity: 0,
        x: function (i, t) { return t.getBoundingClientRect().left < window.innerWidth / 2 ? -140 : 140; },
        rotate: function (i, t) { return t.getBoundingClientRect().left < window.innerWidth / 2 ? -14 : 14; },
        duration: 1.15, stagger: 0.08, ease: 'expo.out'
      }, '-=0.85')
      .from('.hero__tagline', { opacity: 0, y: 16, duration: 0.65 }, '-=0.75')
      .from('.hero .verse-quote', { opacity: 0, y: 16, duration: 0.65 }, '-=0.5')
      .from('.hero .verse-ref',   { opacity: 0, y: 12, duration: 0.55 }, '-=0.5')
      .from('.facts__item',   { opacity: 0, y: 22, duration: 0.6, stagger: 0.08 }, '-=0.4')
      .from('.countdown__cell', { opacity: 0, y: 18, scale: 0.9, duration: 0.55, stagger: 0.06 }, '-=0.35')
      .from('.hero__actions .btn', { opacity: 0, y: 16, duration: 0.55, stagger: 0.09 }, '-=0.3')
      .from('.scroll-cue', { opacity: 0, duration: 0.6 }, '-=0.2')
      /* the blades land, and the words they were aimed at are struck out */
      .to('.threat', { '--cut': 1, duration: 0.4, stagger: 0.09, ease: 'power2.inOut' }, '-=0.35')
      .to('.threat', { opacity: 0.32, duration: 0.7 }, '-=0.15');

    /* Poster plate drifts slower than the copy on top of it */
    gsap.to('.hero__plate', {
      yPercent: 12, scale: 1.07, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });
    gsap.to('.hero__content', {
      yPercent: -8, opacity: 0.2, ease: 'none',
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.6 }
    });

    /* Blades drift out on scroll, each at its own depth */
    $$('.blade').forEach(function (b) {
      var d = parseFloat(b.dataset.depth || 20);
      gsap.to(b, {
        y: d * 5, x: d * 1.6, rotate: d * 0.14, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: 0.8 }
      });
    });

    /* ...and lean toward the pointer */
    var blades = $$('.blade').map(function (b) {
      return {
        el: b,
        d: parseFloat(b.dataset.depth || 20),
        qx: gsap.quickTo(b, 'xPercent', { duration: 0.9, ease: 'power3.out' }),
        qy: gsap.quickTo(b, 'yPercent', { duration: 0.9, ease: 'power3.out' })
      };
    });
    if (blades.length && window.matchMedia('(hover: hover)').matches) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var nx = (e.clientX - r.left) / r.width - 0.5;
        var ny = (e.clientY - r.top) / r.height - 0.5;
        blades.forEach(function (b) {
          b.qx(nx * b.d * 0.55);
          b.qy(ny * b.d * 0.45);
        });
      });
      el.addEventListener('mouseleave', function () {
        blades.forEach(function (b) { b.qx(0); b.qy(0); });
      });
    }
  }

  /* ---------- Full-screen menu ---------------------------------
     site.js owns the state and the markup; this owns the motion.
     window.onMenuToggle is the hand-off point.                    */
  function menu() {
    var wrap = $('.nav-overlay-wrapper');
    if (!wrap) return;

    var panel     = $('.menu-content', wrap);
    var overlay   = $('.overlay', wrap);
    var layers    = $$('.backdrop-layer', wrap);
    var links     = $$('.nav-link-text', wrap);
    var indices   = $$('.nav-link-index', wrap);
    var fades     = $$('[data-menu-fade]', wrap);
    var btn       = $('.nav-close-btn');
    var btnTexts  = btn ? btn.querySelectorAll('p') : [];
    var btnIcon   = btn ? btn.querySelector('.menu-button-icon') : null;

    var tl;

    window.onMenuToggle = function (open) {
      if (tl) tl.kill();
      tl = gsap.timeline({ defaults: { ease: MENU_EASE } });

      if (open) {
        tl.set(wrap, { display: 'block' })
          .set(panel, { xPercent: 0 })
          .fromTo(btnTexts, { yPercent: 0 }, { yPercent: -100, stagger: 0.12, duration: 0.5 }, 0)
          .fromTo(btnIcon, { rotate: 0 }, { rotate: 315, duration: 0.6 }, 0)
          .fromTo(overlay, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, 0)
          /* the three panels arrive one behind the other */
          .fromTo(layers, { xPercent: 101 }, { xPercent: 0, stagger: 0.12, duration: 0.575 }, 0)
          .fromTo(links, { yPercent: 140, rotate: 8 }, { yPercent: 0, rotate: 0, stagger: 0.05, duration: 0.7 }, 0.35)
          .fromTo(indices, { autoAlpha: 0 }, { autoAlpha: 1, stagger: 0.05, duration: 0.5 }, 0.45);

        if (fades.length) {
          tl.fromTo(fades, { autoAlpha: 0, yPercent: 50 },
            { autoAlpha: 1, yPercent: 0, stagger: 0.04, duration: 0.5, clearProps: 'all' }, 0.55);
        }
      } else {
        tl.to(overlay, { autoAlpha: 0, duration: 0.4 }, 0)
          .to(panel, { xPercent: 120, duration: 0.55 }, 0)
          .to(btnTexts, { yPercent: 0, duration: 0.4 }, 0)
          .to(btnIcon, { rotate: 0, duration: 0.45 }, 0)
          .set(wrap, { display: 'none' });
      }
    };

    /* Ambient artwork answering the hovered item */
    var shapesBox = $('.ambient-background-shapes', wrap);
    if (!shapesBox) return;

    $$('.menu-list-item[data-shape]', wrap).forEach(function (item) {
      var shape = shapesBox.querySelector('.bg-shape-' + item.getAttribute('data-shape'));
      if (!shape) return;
      var els = shape.querySelectorAll('.shape-element');

      item.addEventListener('mouseenter', function () {
        shapesBox.querySelectorAll('.bg-shape').forEach(function (s) { s.classList.remove('active'); });
        shape.classList.add('active');
        gsap.fromTo(els,
          { scale: 0.5, opacity: 0, rotate: -10 },
          { scale: 1, opacity: 1, rotate: 0, duration: 0.6, stagger: 0.08, ease: 'back.out(1.7)', overwrite: 'auto' });
      });

      item.addEventListener('mouseleave', function () {
        gsap.to(els, {
          scale: 0.8, opacity: 0, duration: 0.3, ease: 'power2.in', overwrite: 'auto',
          onComplete: function () { shape.classList.remove('active'); }
        });
      });
    });
  }

  /* ---------- Marquee ------------------------------------------
     Duplicate the track so it can loop seamlessly, then translate
     by exactly one copy's width.                                  */
  function marquees() {
    $$('[data-marquee]').forEach(function (wrap) {
      var track = $('.marquee__track', wrap);
      if (!track) return;

      var speed = parseFloat(wrap.dataset.speed || 40);   // px/sec, negative = rightward
      var original = track.innerHTML;

      /* enough copies to cover the viewport twice over */
      var copies = Math.max(2, Math.ceil((window.innerWidth * 2) / Math.max(track.scrollWidth, 1)) + 1);
      track.innerHTML = new Array(copies).fill(original).join('');

      var unit = track.scrollWidth / copies;
      if (!unit || !isFinite(unit)) return;

      gsap.set(track, { x: speed < 0 ? -unit : 0 });
      gsap.to(track, {
        x: speed < 0 ? 0 : -unit,
        duration: unit / Math.abs(speed),
        ease: 'none',
        repeat: -1
      });
    });
  }

  /* ---------- Section headings --------------------------------- */
  function headings() {
    /* skip anything reveals() already owns — two opacity tweens on one
       element leaves it stuck at whichever didn't fire */
    $$('.section-head, .banner h1')
      .filter(function (h) { return !h.hasAttribute('data-reveal'); })
      .forEach(function (h) {
        gsap.from(h, {
          opacity: 0, y: 30, duration: 0.9, ease: EASE,
          scrollTrigger: { trigger: h, start: 'top 90%', once: true }
        });
      });
  }

  /* ---------- Old → New ---------------------------------------- */
  function oldNew() {
    var wrap = $('.oldnew');
    if (!wrap) return;

    var olds = $$('.oldnew__old li', wrap);
    var news = $$('.oldnew__new li', wrap);
    var arrow = $('.oldnew__arrow', wrap);

    gsap.set(olds, { '--strike': 0 });

    gsap.timeline({ scrollTrigger: { trigger: wrap, start: 'top 76%', once: true } })
      .from(olds, { opacity: 0, x: -18, duration: 0.5, stagger: 0.07, ease: EASE })
      .to(olds,   { '--strike': 1, duration: 0.4, stagger: 0.1, ease: 'power2.inOut' }, '-=0.2')
      .to(olds,   { opacity: 0.4, duration: 0.5 }, '-=0.35')
      .from(arrow, { scale: 0, rotate: -180, duration: 0.6, ease: 'back.out(2)' }, '-=0.5')
      .from(news, { opacity: 0, x: 20, duration: 0.55, stagger: 0.09, ease: 'back.out(1.4)' }, '-=0.3');
  }

  /* ---------- Panels, plates, brackets -------------------------- */
  function panels() {
    var groups = [
      { sel: '.panel',        from: { opacity: 0, y: 36 } },
      { sel: '.plate',        from: { opacity: 0, y: 30, scale: 0.97 } },
      { sel: '.contact-bar a', from: { opacity: 0, y: 18 } },
      { sel: '.check-list li', from: { opacity: 0, x: -14 } }
    ];

    groups.forEach(function (g) {
      var items = $$(g.sel).filter(function (el) {
        return !el.hasAttribute('data-reveal') && !el.closest('[data-reveal]');
      });
      revealGroup(items, g.from, { start: 'top 92%', duration: 0.75, stagger: 0.07 });
    });

    /* corner brackets draw themselves outward */
    $$('.brackets').forEach(function (b) {
      gsap.fromTo(b, { '--bkt': 0 }, {
        '--bkt': 1, duration: 0.6, ease: EASE,
        scrollTrigger: { trigger: b, start: 'top 90%', once: true }
      });
    });
  }

  /* ---------- Slow zoom on full-bleed imagery ------------------- */
  function parallaxImages() {
    $$('[data-parallax-img] img, .plate[data-parallax-img] img').forEach(function (img) {
      gsap.fromTo(img, { yPercent: -8, scale: 1.12 }, {
        yPercent: 8, scale: 1.12, ease: 'none',
        scrollTrigger: { trigger: img.closest('[data-parallax-img]') || img, start: 'top bottom', end: 'bottom top', scrub: 0.7 }
      });
    });
  }

  /* ---------- Schedule ------------------------------------------ */
  function timeline() {
    var panelsEl = $('#day-panels');
    if (!panelsEl) return;

    function play() {
      var items = $$('.day-panel.is-active .tl-item');
      if (!items.length) return;
      gsap.killTweensOf(items);
      gsap.fromTo(items,
        { opacity: 0, x: -26 },
        { opacity: 1, x: 0, duration: 0.6, ease: EASE, stagger: 0.05, overwrite: true }
      );
      /* days differ in length — every trigger below just moved */
      ST.refresh();
    }

    var tabs = $('#day-tabs');
    if (tabs) tabs.addEventListener('click', function () { requestAnimationFrame(play); });
    var filters = $('#filters');
    if (filters) filters.addEventListener('click', function () { requestAnimationFrame(play); });

    play();
  }

  /* ---------- Songs --------------------------------------------- */
  function songs() {
    var list = $('#song-list');
    if (list) {
      var rows = $$('.song-row', list);
      if (rows.length) {
        ST.batch(rows, {
          start: 'top 93%',
          once: true,
          onEnter: function (b) {
            gsap.from(b, { opacity: 0, x: -22, duration: 0.55, ease: EASE, stagger: 0.045, overwrite: true });
          }
        });
      }
    }

    /* lyrics are re-rendered on every song change */
    var lyrics = $('#r-lyrics');
    if (!lyrics) return;
    new MutationObserver(function () {
      var blocks = $$('.lyric-block', lyrics);
      if (!blocks.length) return;
      gsap.fromTo(blocks,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: EASE, stagger: 0.06, overwrite: true }
      );
    }).observe(lyrics, { childList: true });
  }

  /* ---------- Gallery ------------------------------------------- */
  function gallery() {
    var grid = $('#gal-grid');
    if (grid) {
      var tiles = $$('.gal-item', grid);
      if (tiles.length) {
        ST.batch(tiles, {
          start: 'top 94%',
          once: true,
          onEnter: function (b) {
            gsap.from(b, { opacity: 0, y: 30, scale: 0.94, duration: 0.65, ease: EASE, stagger: 0.055, overwrite: true });
          }
        });
      }
    }

    var stage = $('#lb-stage');
    if (!stage) return;
    new MutationObserver(function () {
      var media = stage.firstElementChild;
      if (!media) return;
      gsap.fromTo(media, { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, duration: 0.4, ease: EASE, overwrite: true });
    }).observe(stage, { childList: true });
  }

  /* ---------- Boot ---------------------------------------------- */
  function boot() {
    /* Runs straight away, NOT inside requestAnimationFrame: rAF is frozen in a
       background or non-compositing tab, which would leave every [data-reveal]
       stuck at opacity 0. site.js has already called initPage() by now, so all
       the dynamic content exists. */
    hero();
    menu();
    marquees();
    reveals();
    headings();
    oldNew();
    panels();
    parallaxImages();
    timeline();
    songs();
    gallery();
    ST.refresh();

    /* Catch-up sweep: covers scrollbar drags, End, and #anchor jumps that
       skip past elements without ever intersecting them. */
    /* Throttled on a timestamp, not requestAnimationFrame: rAF is frozen in a
       background or non-compositing tab, which is exactly when a restored
       scroll position would need the catch-up. sweep() is a cheap no-op once
       everything has been revealed. */
    var last = 0;
    function onScroll() {
      var now = Date.now();
      if (now - last < 90) return;
      last = now;
      sweep();
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    ST.addEventListener('refresh', sweep);
    sweep();

    /* images finishing later shift everything below them */
    window.addEventListener('load', function () { ST.refresh(); sweep(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
