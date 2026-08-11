/* ============================================================
   BRAND NEW DAY — shared site behaviour
   Nav, SVG sprite, scroll reveal, countdown, toast
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Camp constants ---------------------------------- */
  window.CAMP = {
    name: 'Brand New Day',
    subtitle: 'Youth Camp 2026',
    org: 'Christos Mar Thoma Yuvajana Sakhyam, Kakkanad',
    venue: 'Mar Thoma Meadows, Thekkady',
    // Friday 14 Aug 2026, departure from church at 5:00 PM IST
    start: new Date(2026, 7, 14, 17, 0, 0),
    end: new Date(2026, 7, 16, 13, 0, 0),
    verse: 'Therefore, if anyone is in Christ, the new creation has come: the old has gone, the new is here!',
    verseRef: '2 Corinthians 5:17 (NIV)'
  };

  /* ---------- SVG sprite -------------------------------------- */
  var SPRITE = [
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">',

    // shield logo (simplified mark of the Yuvajana Sakhyam crest)
    '<symbol id="i-logo" viewBox="0 0 84 96">',
    '<path d="M42 2 78 12v42c0 22-16 33-36 40C22 87 6 76 6 54V12z" fill="#fff" stroke="#b71c1c" stroke-width="4"/>',
    '<path d="M42 9 71 17v37c0 18-13 27-29 33-16-6-29-15-29-33V17z" fill="#b71c1c"/>',
    '<path d="M42 15 66 21v33c0 15-11 23-24 28-13-5-24-13-24-28V21z" fill="#fff"/>',
    '<rect x="37" y="30" width="10" height="46" rx="1.5" fill="#8a6a3a"/>',
    '<rect x="21" y="42" width="42" height="9" rx="1.5" fill="#8a6a3a"/>',
    '<circle cx="42" cy="46.5" r="7" fill="#e8c25a" stroke="#8b0d12" stroke-width="2"/>',
    '<circle cx="42" cy="46.5" r="2.6" fill="#8b0d12"/>',
    '<path d="M20 74c0-3 3-5 6-5s6 2 6 5z" fill="#8a6a3a"/>',
    '<path d="M26 69c-1-3 1-4 0-6 2 1 3 4 0 6z" fill="#e0232a"/>',
    '<path d="M56 76c-4 0-7-2-7-5s3-4 7-4 7 1 7 4-3 5-7 5z" fill="#f2a6c0"/>',
    '</symbol>',

    // camp icon set (from the brand sheet)
    '<symbol id="i-calendar" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
    '<path d="M7.5 14h1.5M11.2 14h1.6M15 14h1.5M7.5 17.4h1.5M11.2 17.4h1.6"/></symbol>',

    '<symbol id="i-pin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M12 22s7.5-7.2 7.5-12.6A7.5 7.5 0 0 0 4.5 9.4C4.5 14.8 12 22 12 22z"/><circle cx="12" cy="9.4" r="2.8"/></symbol>',

    '<symbol id="i-book" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M12 6.5C10 4.8 7.4 4.2 4 4.4v13.2c3.4-.2 6 .4 8 2.1 2-1.7 4.6-2.3 8-2.1V4.4c-3.4-.2-6 .4-8 2.1z"/><path d="M12 6.5V19.7"/></symbol>',

    '<symbol id="i-clock" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<circle cx="12" cy="12" r="9"/><path d="M12 7v5.3l3.4 2"/></symbol>',

    '<symbol id="i-people" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<circle cx="9" cy="8" r="3.2"/><path d="M2.6 20c.5-3.5 3.2-5.6 6.4-5.6s5.9 2.1 6.4 5.6"/>',
    '<path d="M16.4 5.2a3.2 3.2 0 0 1 0 6.1M17.6 14.8c2.1.6 3.6 2.5 4 5.2"/></symbol>',

    '<symbol id="i-cross" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M12 2.6v18.8M6 8.2h12"/></symbol>',

    '<symbol id="i-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<circle cx="12" cy="12" r="4"/><path d="M12 2v2.4M12 19.6V22M2 12h2.4M19.6 12H22M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7"/></symbol>',

    '<symbol id="i-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M20.5 14.5A8.6 8.6 0 0 1 9.5 3.5a8.6 8.6 0 1 0 11 11z"/></symbol>',

    '<symbol id="i-search" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">',
    '<circle cx="10.6" cy="10.6" r="6.6"/><path d="M15.6 15.6 20 20"/></symbol>',

    '<symbol id="i-close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">',
    '<path d="M6 6l12 12M18 6 6 18"/></symbol>',

    '<symbol id="i-arrow-l" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M15 5l-7 7 7 7"/></symbol>',

    '<symbol id="i-arrow-r" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M9 5l7 7-7 7"/></symbol>',

    '<symbol id="i-play" viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.8 19 12 7 19.2z"/></symbol>',

    '<symbol id="i-plus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></symbol>',
    '<symbol id="i-minus" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 12h14"/></symbol>',

    '<symbol id="i-present" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="2.6" y="4" width="18.8" height="12.4" rx="1.6"/><path d="M12 16.4V20M8.6 20h6.8"/></symbol>',

    '<symbol id="i-scroll" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M12 4v13M8 13.4l4 4 4-4M4.5 20h15"/></symbol>',

    '<symbol id="i-download" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M12 3.5v11M8 11l4 4 4-4M4.5 19.5h15"/></symbol>',

    '<symbol id="i-print" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M7 8.5V3.5h10v5"/><rect x="3.5" y="8.5" width="17" height="7.5" rx="1.6"/><path d="M7 14h10v6.5H7z"/></symbol>',

    '<symbol id="i-face" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3"/>',
    '<circle cx="9.4" cy="10.4" r="1"/><circle cx="14.6" cy="10.4" r="1"/><path d="M9 14.6c1.8 1.5 4.2 1.5 6 0"/></symbol>',

    '<symbol id="i-camera" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2.7l1.3-2h6.9l1.3 2h2.8A1.5 1.5 0 0 1 21 8.5v9A1.5 1.5 0 0 1 19.5 19h-15A1.5 1.5 0 0 1 3 17.5z"/>',
    '<circle cx="12" cy="12.8" r="3.4"/></symbol>',

    '<symbol id="i-flame" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M12 2.5c3.5 4 6.5 6.4 6.5 11a6.5 6.5 0 0 1-13 0c0-2.6 1.3-4.3 2.6-6 .3 1.4 1.1 2.3 2.2 2.6C9.6 7.6 10.4 4.9 12 2.5z"/></symbol>',

    '<symbol id="i-shield" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M12 2.8 20 5.6v6c0 5-3.4 8.3-8 9.6-4.6-1.3-8-4.6-8-9.6v-6z"/><path d="M9.2 12.1l2 2 3.6-3.8"/></symbol>',

    '<symbol id="i-phone" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M8.4 3.5 10.2 7 8.5 9c1 2.2 2.7 3.9 5 5l2-1.7 3.5 1.8v3.3c0 1.1-.9 2-2 1.9C9.8 18.8 5.2 14.2 4.3 5.5a1.9 1.9 0 0 1 1.9-2z"/></symbol>',

    '<symbol id="i-mail" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="2.8" y="5" width="18.4" height="14" rx="2"/><path d="m3.4 6.6 8.6 6.4 8.6-6.4"/></symbol>',

    '<symbol id="i-instagram" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.4" cy="6.6" r="1" fill="currentColor" stroke="none"/></symbol>',

    '<symbol id="i-music" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M9 18V5.5l11-2V16"/><circle cx="6.4" cy="18" r="2.6"/><circle cx="17.4" cy="16" r="2.6"/></symbol>',

    '<symbol id="i-door" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">',
    '<path d="M4.5 21h15M7 21V4.2a1.2 1.2 0 0 1 1.4-1.2l7.2 1.2A1.2 1.2 0 0 1 17 5.4V21"/><circle cx="14.2" cy="12.4" r=".9" fill="currentColor" stroke="none"/></symbol>',

    // silhouette of the camper facing the open door (poster motif)
    '<symbol id="i-figure" viewBox="0 0 60 150" fill="currentColor">',
    '<ellipse cx="30" cy="16" rx="10.5" ry="12"/>',
    '<path d="M30 27c-9 0-15 5-16.5 14l-2 22c-.4 4 1.2 6 4 6.3l2.4.2 1.4 26c.2 3.4 1.6 5 4.2 5h1.6l1.6-24h6.6l1.6 24h1.6c2.6 0 4-1.6 4.2-5l1.4-26 2.4-.2c2.8-.3 4.4-2.3 4-6.3l-2-22C45 32 39 27 30 27z"/>',
    '<path d="M20 34h20c2.6 0 4 1.7 4 4.4v16c0 2.8-1.4 4.4-4 4.4H20c-2.6 0-4-1.6-4-4.4v-16c0-2.7 1.4-4.4 4-4.4z" opacity=".55"/>',
    '<path d="M18 100h9l-1.6 46h-5.8zM33 100h9l-1.6 46h-5.8z"/>',
    '</symbol>',

    // decorative katana
    '<symbol id="i-katana" viewBox="0 0 300 44">',
    '<path d="M8 22 250 8c6-.4 10 2 10 5.5S256 21 250 21L8 24z" fill="url(#gBlade)"/>',
    '<path d="M8 22 250 21c6 0 10 2.2 10 5.6S256 32 250 31.6L8 24z" fill="#8a8f96" opacity=".55"/>',
    '<rect x="255" y="4" width="7" height="36" rx="3" fill="#2a2c30"/>',
    '<rect x="262" y="14" width="34" height="16" rx="7" fill="#3a2018"/>',
    '<path d="M266 16h26M266 22h26M266 28h26" stroke="#1b0f0c" stroke-width="1.6"/>',
    '<defs><linearGradient id="gBlade" x1="0" y1="0" x2="1" y2="0">',
    '<stop offset="0" stop-color="#7f858c"/><stop offset=".45" stop-color="#eef1f4"/><stop offset="1" stop-color="#b9bfc6"/>',
    '</linearGradient></defs></symbol>',

    // decorative shuriken
    '<symbol id="i-shuriken" viewBox="0 0 120 120">',
    '<path d="M60 4 72 44l40-12-28 28 28 28-40-12-12 40-12-40-40 12 28-28-28-28 40 12z" fill="url(#gStar)" stroke="#5c6268" stroke-width="2"/>',
    '<circle cx="60" cy="60" r="10" fill="#0d0a0b" stroke="#5c6268" stroke-width="2"/>',
    '<defs><linearGradient id="gStar" x1="0" y1="0" x2="1" y2="1">',
    '<stop offset="0" stop-color="#f2f5f8"/><stop offset=".5" stop-color="#9aa1a8"/><stop offset="1" stop-color="#dfe4e8"/>',
    '</linearGradient></defs></symbol>',

    // decorative broken chain
    '<symbol id="i-chain" viewBox="0 0 320 80">',
    '<g fill="none" stroke="url(#gChain)" stroke-width="9" stroke-linecap="round">',
    '<ellipse cx="26" cy="40" rx="20" ry="12"/><ellipse cx="66" cy="40" rx="20" ry="12" transform="rotate(28 66 40)"/>',
    '<ellipse cx="108" cy="42" rx="20" ry="12"/><ellipse cx="150" cy="38" rx="20" ry="12" transform="rotate(-22 150 38)"/>',
    '<ellipse cx="196" cy="44" rx="20" ry="12"/><ellipse cx="242" cy="36" rx="20" ry="12" transform="rotate(34 242 36)"/>',
    '<path d="M282 30c8 6 12 12 12 18"/>',
    '</g>',
    '<defs><linearGradient id="gChain" x1="0" y1="0" x2="1" y2="0">',
    '<stop offset="0" stop-color="#6d4a3c"/><stop offset=".5" stop-color="#c9b3a6"/><stop offset="1" stop-color="#5a3a2e"/>',
    '</linearGradient></defs></symbol>',

    '</svg>'
  ].join('');

  function injectSprite() {
    var holder = document.createElement('div');
    holder.innerHTML = SPRITE;
    document.body.insertBefore(holder.firstChild, document.body.firstChild);
  }

  /* ---------- Full-screen menu --------------------------------
     Markup is injected once here rather than repeated in all four
     pages, so the menu can never drift out of sync between them.
     State lives on [data-nav]; CSS alone animates it, and motion.js
     takes over with the staggered timeline when GSAP is present.  */
  var MENU = [
    { href: 'index.html',          label: 'Home',     meta: 'Start here' },
    { href: 'index.html#theme',    label: 'Theme',    meta: '2 Corinthians 5:17' },
    { href: 'schedule.html',       label: 'Schedule', meta: 'Three days, hour by hour' },
    { href: 'songs.html',          label: 'Songs',    meta: '12 songs, 4 sessions' },
    { href: 'gallery.html',        label: 'Gallery',  meta: 'Photos & videos' },
    { href: 'index.html#contact',  label: 'Contact',  meta: 'Talk to the team' }
  ];

  /* Ambient artwork behind each menu item, in the camp's own motifs
     (web, cross, rings, sound bars, frames, chain) rather than generic blobs */
  var SHAPES = [
    '<g class="shape-element"><circle cx="200" cy="200" r="60" fill="none" stroke="rgba(240,49,39,.5)" stroke-width="2"/></g>' +
    '<g class="shape-element"><circle cx="200" cy="200" r="120" fill="none" stroke="rgba(240,49,39,.32)" stroke-width="2"/></g>' +
    '<g class="shape-element"><circle cx="200" cy="200" r="180" fill="none" stroke="rgba(240,49,39,.2)" stroke-width="2"/></g>' +
    '<g class="shape-element"><path d="M200 20V380M20 200H380M74 74l252 252M326 74L74 326" stroke="rgba(201,207,214,.22)" stroke-width="1.5"/></g>',

    '<g class="shape-element"><rect x="186" y="70" width="28" height="270" fill="rgba(240,49,39,.4)"/></g>' +
    '<g class="shape-element"><rect x="110" y="140" width="180" height="28" fill="rgba(240,49,39,.4)"/></g>' +
    '<g class="shape-element"><path d="M200 40v-24M120 70 106 50M280 70l14-20M60 190H32M340 190h28" stroke="rgba(255,90,68,.7)" stroke-width="4" stroke-linecap="round"/></g>',

    '<g class="shape-element"><circle cx="200" cy="200" r="150" fill="none" stroke="rgba(240,49,39,.35)" stroke-width="2"/></g>' +
    '<g class="shape-element"><path d="M200 200V90M200 200l78 52" stroke="rgba(255,90,68,.75)" stroke-width="6" stroke-linecap="round"/></g>' +
    '<g class="shape-element"><path d="M200 34v26M366 200h-26M200 366v-26M34 200h26" stroke="rgba(201,207,214,.4)" stroke-width="5" stroke-linecap="round"/></g>',

    '<g class="shape-element"><rect x="70"  y="170" width="26" height="60"  fill="rgba(240,49,39,.45)"/></g>' +
    '<g class="shape-element"><rect x="115" y="120" width="26" height="160" fill="rgba(255,90,68,.4)"/></g>' +
    '<g class="shape-element"><rect x="160" y="60"  width="26" height="280" fill="rgba(240,49,39,.5)"/></g>' +
    '<g class="shape-element"><rect x="205" y="130" width="26" height="140" fill="rgba(255,90,68,.4)"/></g>' +
    '<g class="shape-element"><rect x="250" y="90"  width="26" height="220" fill="rgba(240,49,39,.45)"/></g>' +
    '<g class="shape-element"><rect x="295" y="160" width="26" height="80"  fill="rgba(201,207,214,.3)"/></g>',

    '<g class="shape-element"><rect x="60"  y="80"  width="150" height="110" fill="none" stroke="rgba(240,49,39,.45)" stroke-width="3"/></g>' +
    '<g class="shape-element"><rect x="150" y="150" width="180" height="130" fill="none" stroke="rgba(255,90,68,.4)" stroke-width="3"/></g>' +
    '<g class="shape-element"><rect x="100" y="230" width="120" height="100" fill="none" stroke="rgba(201,207,214,.3)" stroke-width="3"/></g>' +
    '<g class="shape-element"><circle cx="290" cy="110" r="26" fill="rgba(240,49,39,.3)"/></g>',

    '<g class="shape-element"><ellipse cx="110" cy="200" rx="52" ry="30" fill="none" stroke="rgba(240,49,39,.45)" stroke-width="10"/></g>' +
    '<g class="shape-element"><ellipse cx="200" cy="200" rx="52" ry="30" fill="none" stroke="rgba(255,90,68,.4)" stroke-width="10" transform="rotate(24 200 200)"/></g>' +
    '<g class="shape-element"><ellipse cx="292" cy="200" rx="52" ry="30" fill="none" stroke="rgba(201,207,214,.28)" stroke-width="10"/></g>'
  ];

  function menuMarkup() {
    var shapes = SHAPES.map(function (inner, i) {
      return '<svg class="bg-shape bg-shape-' + (i + 1) + '" viewBox="0 0 400 400" fill="none" aria-hidden="true">' + inner + '</svg>';
    }).join('');

    var items = MENU.map(function (m, i) {
      return '<li class="menu-list-item" data-shape="' + (i + 1) + '">' +
               '<a href="' + m.href + '" class="nav-link">' +
                 '<span class="nav-link-index">' + String(i + 1).padStart(2, '0') + '</span>' +
                 '<p class="nav-link-text">' + m.label + '</p>' +
                 '<span class="nav-link-meta">' + m.meta + '</span>' +
                 '<span class="nav-link-hover-bg"></span>' +
               '</a>' +
             '</li>';
    }).join('');

    return '<div data-nav="closed" class="nav-overlay-wrapper">' +
             '<div class="overlay"></div>' +
             '<nav class="menu-content" aria-label="Menu">' +
               '<div class="menu-bg">' +
                 '<div class="backdrop-layer first"></div>' +
                 '<div class="backdrop-layer second"></div>' +
                 '<div class="backdrop-layer final"></div>' +
                 '<div class="ambient-background-shapes">' + shapes + '</div>' +
               '</div>' +
               '<div class="menu-content-wrapper">' +
                 '<ul class="menu-list">' + items + '</ul>' +
                 '<div class="menu-foot" data-menu-fade>' +
                   '<p>Mar Thoma Meadows, Thekkady &middot; 14&ndash;16 August 2026</p>' +
                   '<p><a href="mailto:cmykakkanad@gmail.com">cmykakkanad@gmail.com</a> &middot; ' +
                   '<a href="https://instagram.com/cmy_kakkanad" target="_blank" rel="noopener">@cmy_kakkanad</a></p>' +
                 '</div>' +
               '</div>' +
             '</nav>' +
           '</div>';
  }

  function initNav() {
    var nav = document.querySelector('.nav');
    if (nav) {
      var onScroll = function () { nav.classList.toggle('is-stuck', window.scrollY > 12); };
      window.addEventListener('scroll', onScroll, { passive: true });
      onScroll();
    }

    var holder = document.createElement('div');
    holder.innerHTML = menuMarkup();
    var wrap = holder.firstChild;
    document.body.appendChild(wrap);

    var toggle = document.querySelector('.nav-close-btn');
    var overlay = wrap.querySelector('.overlay');
    var open = false;

    window.setMenu = function (next) {
      if (next === open) return;
      open = next;
      wrap.setAttribute('data-nav', open ? 'open' : 'closed');
      if (toggle) {
        toggle.classList.toggle('is-open', open);
        toggle.setAttribute('aria-expanded', String(open));
      }
      document.body.style.overflow = open ? 'hidden' : '';
      // let motion.js run its timeline if it is driving
      if (typeof window.onMenuToggle === 'function') window.onMenuToggle(open);
    };

    if (toggle) toggle.addEventListener('click', function () { window.setMenu(!open); });
    if (overlay) overlay.addEventListener('click', function () { window.setMenu(false); });

    wrap.addEventListener('click', function (e) {
      if (e.target.closest('a')) window.setMenu(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) window.setMenu(false);
    });

    /* Mark the active link. Several entries point at index.html with
       different hashes, so the path alone is not enough to tell them
       apart — the hash has to agree too, or every anchor on the current
       page lights up at once. */
    /* Compare without the extension: hosts that serve "clean URLs"
       (Vercel, Netlify, GitHub Pages) turn /schedule.html into /schedule,
       which would otherwise match nothing and leave no link highlighted. */
    function key(p) { return p.replace(/\.html$/, '').replace(/^$|^index$/, 'index'); }

    var here = key((location.pathname.split('/').pop() || 'index.html').toLowerCase());
    var hash = location.hash.toLowerCase();

    document.querySelectorAll('.nav__link, .nav-link').forEach(function (a) {
      var raw = (a.getAttribute('href') || '').toLowerCase();
      var parts = raw.split('#');
      var path = key(parts[0] || here);
      var frag = parts[1] ? '#' + parts[1] : '';

      if (path !== here) return;
      if (frag ? frag === hash : !hash) a.classList.add('is-active');
    });

    initSegments();
  }

  /* iOS segmented control: one glass pill that slides to whichever
     segment is active, and follows the pointer on hover. Measured in
     JS, animated by CSS, so it works with or without GSAP. */
  function initSegments() {
    var bar = document.querySelector('.nav__links');
    if (!bar) return;

    var links = Array.prototype.slice.call(bar.querySelectorAll('.nav__link'));
    if (!links.length) return;

    var pill = document.createElement('span');
    pill.className = 'nav__seg';
    bar.insertBefore(pill, bar.firstChild);

    function moveTo(el) {
      if (!el) { pill.classList.remove('is-ready'); return; }
      pill.style.width = el.offsetWidth + 'px';
      pill.style.transform = 'translateX(' + el.offsetLeft + 'px)';
      pill.classList.add('is-ready');
    }

    function current() { return bar.querySelector('.nav__link.is-active'); }

    links.forEach(function (a) {
      a.addEventListener('mouseenter', function () { moveTo(a); });
      a.addEventListener('focus', function () { moveTo(a); });
    });
    bar.addEventListener('mouseleave', function () { moveTo(current()); });

    moveTo(current());
    /* fonts land late and change the segment widths */
    window.addEventListener('resize', function () { moveTo(current()); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { moveTo(current()); });
    }
  }

  /* ---------- Speaker cards -----------------------------------
     Rendered from one place so the home page and the schedule page
     can never fall out of step. Card layout follows the testimonial
     pattern: portrait, fade to black, quote, name, gradient role. */
  window.renderSpeakers = function (el) {
    if (!el || !window.SPEAKERS) return;

    function esc(s) {
      return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
      });
    }

    el.innerHTML = window.SPEAKERS.map(function (s) {
      var shot = s.photo
        ? '<img src="' + esc(s.photo) + '" alt="' + esc(s.name) + '" loading="lazy">'
        /* no photo yet — fall back to initials rather than a broken image */
        : '<span class="voice__initials">' +
            esc(s.name.replace(/^Rev\.\s*/, '').split(/\s+/).map(function (w) { return w[0]; }).join('').slice(0, 2)) +
          '</span>';

      return '<article class="voice">' +
               '<div class="voice__shot">' + shot + '<span class="voice__fade"></span></div>' +
               '<div class="voice__body">' +
                 '<p class="voice__quote">' + esc(s.note) + '</p>' +
                 '<p class="voice__name">&mdash; ' + esc(s.name) + '</p>' +
                 '<p class="voice__role">' + esc(s.role) + '</p>' +
               '</div>' +
             '</article>';
    }).join('');
  };

  /* ---------- Scroll reveal ----------------------------------- */
  function initReveal() {
    // motion.js (GSAP) takes over the reveals when it is active
    if (document.documentElement.classList.contains('gsap-on')) return;

    var items = document.querySelectorAll('[data-reveal]');
    if (!items.length) return;

    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        // isIntersecting covers normal scrolling; the top check catches a fast
        // jump-scroll that flew past an element without it ever intersecting.
        if (entry.isIntersecting || entry.boundingClientRect.top < 0) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

    items.forEach(function (el, i) {
      if (!el.style.getPropertyValue('--delay')) {
        el.style.setProperty('--delay', (i % 6) * 0.07 + 's');
      }
      io.observe(el);
    });
  }

  /* ---------- Reading progress -------------------------------- */
  function initProgress() {
    var bar = document.querySelector('.progress');
    if (!bar) return;
    var update = function () {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.width = (h > 0 ? (window.scrollY / h) * 100 : 0) + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---------- Hero: cut the threat words away ------------------ */
  function initThreats() {
    var hero = document.querySelector('.hero');
    if (!hero) return;
    setTimeout(function () { hero.classList.add('is-cleared'); }, 2200);
  }

  /* ---------- Countdown --------------------------------------- */
  function initCountdown() {
    var root = document.querySelector('[data-countdown]');
    if (!root) return;

    var cells = {
      days: root.querySelector('[data-cd="days"]'),
      hours: root.querySelector('[data-cd="hours"]'),
      mins: root.querySelector('[data-cd="mins"]'),
      secs: root.querySelector('[data-cd="secs"]')
    };

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      var now = Date.now();
      var diff = window.CAMP.start.getTime() - now;

      if (diff <= 0) {
        var live = now <= window.CAMP.end.getTime();
        root.innerHTML = '<div class="countdown__live">' +
          (live ? 'Camp is live &mdash; the new is here.' : 'Brand New Day 2026 &mdash; till we meet again.') +
          '</div>';
        clearInterval(timer);
        return;
      }
      var s = Math.floor(diff / 1000);
      cells.days.textContent = pad(Math.floor(s / 86400));
      cells.hours.textContent = pad(Math.floor(s / 3600) % 24);
      cells.mins.textContent = pad(Math.floor(s / 60) % 60);
      cells.secs.textContent = pad(s % 60);
    }

    tick();
    var timer = setInterval(tick, 1000);
  }

  /* ---------- Toast ------------------------------------------- */
  var toastEl, toastTimer;
  window.toast = function (msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.className = 'toast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    requestAnimationFrame(function () { toastEl.classList.add('is-show'); });
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('is-show'); }, 2400);
  };

  /* ---------- Calendar (.ics) --------------------------------- */
  function icsStamp(d) {
    return d.getUTCFullYear() +
      String(d.getUTCMonth() + 1).padStart(2, '0') +
      String(d.getUTCDate()).padStart(2, '0') + 'T' +
      String(d.getUTCHours()).padStart(2, '0') +
      String(d.getUTCMinutes()).padStart(2, '0') +
      String(d.getUTCSeconds()).padStart(2, '0') + 'Z';
  }

  window.downloadICS = function (title, start, end, description, filename) {
    var lines = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Brand New Day 2026//EN', 'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      'UID:' + Date.now() + '@brandnewday2026',
      'DTSTAMP:' + icsStamp(new Date()),
      'DTSTART:' + icsStamp(start),
      'DTEND:' + icsStamp(end),
      'SUMMARY:' + title.replace(/,/g, '\\,'),
      'LOCATION:' + window.CAMP.venue.replace(/,/g, '\\,'),
      'DESCRIPTION:' + (description || '').replace(/,/g, '\\,'),
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');

    var blob = new Blob([lines], { type: 'text/calendar;charset=utf-8' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = (filename || 'brand-new-day') + '.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
    window.toast('Added to your calendar');
  };

  /* ---------- Year stamp -------------------------------------- */
  function initYear() {
    document.querySelectorAll('[data-year]').forEach(function (el) {
      el.textContent = new Date().getFullYear();
    });
  }

  /* ---------- Boot -------------------------------------------- */
  function boot() {
    injectSprite();
    initNav();
    initReveal();
    initProgress();
    initThreats();
    initCountdown();
    initYear();
    if (typeof window.initPage === 'function') window.initPage();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
