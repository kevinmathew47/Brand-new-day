/* ============================================================
   BRAND NEW DAY — the gallery
   ------------------------------------------------------------
   Every camp photograph on a floating card, arranged over three
   nested shells in a star field. Drag to look around, tap a card
   to open it full size, download the original.

   The whole thing is one WebGL scene. Each card is a single
   textured plane whose texture is a canvas painted like the card
   itself — frame, photo, camp name — so a card is one draw call
   and, unlike a DOM overlay, it still works inside an AR session.

   Cards are built at the aspect ratio of their own photograph
   (gallery-data.js carries the real pixel size of each), scaled so
   every card covers the same area — a landscape frame is wider and
   shorter than a portrait one, never letterboxed or cropped.

   No GSAP in here: motion.js owns the page's reveals, this file
   owns the scene, and the two never animate the same thing.
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const DATA = window.GALLERY;
if (!DATA) throw new Error('gallery-data.js did not load');

/* ---------- Look ---------------------------------------------
   The source component was cyan on black; these are the camp's
   own poster colours so the gallery sits with the rest of the site. */
const ACCENT     = '#f03127';   // --red-200
const ACCENT_LIT = '#ff5a44';   // --red-100
const CARD_BG    = '#150a0b';
const BONE       = '#f5efec';

const CARD_TITLE = DATA.title;              // on every card
const PHOTO_PX   = 448;                     // long edge of the card texture
const PAD        = 18;                      // frame around the photo, px
const TITLE_H    = 54;                      // name strip below it, px
const CARD_AREA  = 16;                      // world units² — every card covers this

const SHELLS     = [13, 18.5, 24];          // the three radii cards sit on
const START_DIST = 36;                      // far enough back to see the whole thing
const AR_RADIUS  = 1.5;                     // metres — the shell you stand inside in AR

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Page furniture ----------------------------------- */
const el = {
  canvas:   document.getElementById('gal-canvas'),
  stage:    document.getElementById('stage'),
  hint:     document.getElementById('stage-hint'),
  load:     document.getElementById('stage-load'),
  loadFill: document.getElementById('stage-load-fill'),
  loadText: document.getElementById('stage-load-text'),
  fail:     document.getElementById('stage-fail'),
  grid:     document.getElementById('gal-grid'),
  count:    document.getElementById('photo-count'),

  lb:       document.getElementById('lightbox'),
  lbStage:  document.getElementById('lb-stage'),
  lbCard:   document.getElementById('lb-card'),
  lbTitle:  document.getElementById('lb-title'),
  lbPos:    document.getElementById('lb-pos'),
  lbClose:  document.getElementById('lb-close'),
  lbPrev:   document.getElementById('lb-prev'),
  lbNext:   document.getElementById('lb-next'),
  lbDl:     document.getElementById('lb-download'),
  lbFav:    document.getElementById('lb-fav'),

  arBtn:    document.getElementById('ar-enter'),
  arLabel:  document.getElementById('ar-label'),
  arWrap:   document.getElementById('ar-overlay'),
  arTag:    document.getElementById('ar-tag'),
  arExit:   document.getElementById('ar-exit'),
  arExitLbl: document.getElementById('ar-exit-label'),
  arPanel:  document.getElementById('ar-panel'),
  arImg:    document.getElementById('ar-img'),
  arDl:     document.getElementById('ar-download'),
  arPanelX: document.getElementById('ar-panel-close')
};

const photos = DATA.photos.map((p, i) => ({
  ...p,
  n: i + 1,
  aspect: p.w / p.h,
  card: DATA.cardDir + p.id + '.webp',
  full: DATA.fullDir + p.id + '.jpg',
  alt: CARD_TITLE + ' — photograph ' + (i + 1) + ' of ' + DATA.photos.length
}));

/* ============================================================
   1. Favourites
   ============================================================ */
const FAV_KEY = 'bnd-gallery-favs';

function favs() {
  try { return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || '[]')); }
  catch (e) { return new Set(); }
}

function toggleFav(id) {
  const set = favs();
  set.has(id) ? set.delete(id) : set.add(id);
  try { localStorage.setItem(FAV_KEY, JSON.stringify([...set])); } catch (e) { /* private mode */ }
  return set.has(id);
}

/* ============================================================
   2. Download
   Fetched as a blob so the file saves with a sensible name
   instead of opening in a new tab.
   ============================================================ */
async function download(photo) {
  const name = 'brand-new-day-2026-' + String(photo.n).padStart(2, '0') + '.jpg';
  try {
    const res = await fetch(photo.full);
    if (!res.ok) throw new Error(res.status);
    const url = URL.createObjectURL(await res.blob());
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (window.toast) window.toast('Saved ' + name);
  } catch (e) {
    /* blob download blocked (or offline) — hand the file to the browser */
    window.open(photo.full, '_blank', 'noopener');
  }
}

/* ============================================================
   3. The grid
   Built synchronously, before motion.js boots, so its ScrollTrigger
   batch finds the tiles. It is also the whole gallery for anyone
   whose device can't run WebGL.
   ============================================================ */
function buildGrid() {
  if (!el.grid) return;
  if (el.count) el.count.textContent = String(photos.length);

  const frag = document.createDocumentFragment();

  photos.forEach((p, i) => {
    const tile = document.createElement('figure');
    tile.className = 'gal-item';
    tile.style.setProperty('--ar', String(p.aspect));

    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'gal-item__open';
    open.setAttribute('aria-label', 'Open photograph ' + p.n);
    open.innerHTML =
      '<img src="' + p.card + '" alt="' + p.alt + '" loading="lazy" decoding="async" draggable="false">';
    open.addEventListener('click', () => openLightbox(i));

    const dl = document.createElement('button');
    dl.type = 'button';
    dl.className = 'gal-item__dl';
    dl.setAttribute('aria-label', 'Download photograph ' + p.n);
    dl.innerHTML = '<svg><use href="#i-download"></use></svg>';
    dl.addEventListener('click', (e) => { e.stopPropagation(); download(p); });

    const cap = document.createElement('figcaption');
    cap.className = 'gal-item__cap';
    cap.textContent = String(p.n).padStart(2, '0');

    tile.append(open, dl, cap);
    frag.appendChild(tile);
  });

  el.grid.appendChild(frag);
}

/* ============================================================
   4. Lightbox
   ============================================================ */
let lbIndex = -1;
let lastFocus = null;

function openLightbox(i) {
  lbIndex = (i + photos.length) % photos.length;
  const p = photos[lbIndex];

  lastFocus = document.activeElement;
  el.lb.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => el.lb.classList.add('is-open'));

  /* a fresh <img> each time — motion.js fades in whatever appears here */
  el.lbStage.innerHTML = '';
  const img = document.createElement('img');
  img.src = p.full;
  img.alt = p.alt;
  img.draggable = false;
  el.lbStage.appendChild(img);
  el.lbStage.style.setProperty('--ar', String(p.aspect));

  el.lbTitle.textContent = CARD_TITLE;
  el.lbPos.textContent = p.n + ' / ' + photos.length;

  const fav = favs().has(p.id);
  el.lbFav.setAttribute('aria-pressed', String(fav));
  el.lbFav.classList.toggle('is-on', fav);

  el.lbClose.focus();
}

function closeLightbox() {
  if (el.lb.hidden) return;
  el.lb.classList.remove('is-open');
  document.body.style.overflow = '';
  setTimeout(() => {
    el.lb.hidden = true;
    el.lbStage.innerHTML = '';           // stop a big JPEG sitting in memory
  }, 220);
  if (lastFocus && lastFocus.focus) lastFocus.focus();
  lbIndex = -1;
}

function stepLightbox(d) {
  if (lbIndex < 0) return;
  openLightbox(lbIndex + d);
}

function initLightbox() {
  el.lbClose.addEventListener('click', closeLightbox);
  el.lbPrev.addEventListener('click', () => stepLightbox(-1));
  el.lbNext.addEventListener('click', () => stepLightbox(1));
  el.lbDl.addEventListener('click', () => lbIndex >= 0 && download(photos[lbIndex]));

  el.lbFav.addEventListener('click', () => {
    if (lbIndex < 0) return;
    const on = toggleFav(photos[lbIndex].id);
    el.lbFav.setAttribute('aria-pressed', String(on));
    el.lbFav.classList.toggle('is-on', on);
  });

  /* click the backdrop, not the card */
  el.lb.addEventListener('click', (e) => { if (e.target === el.lb) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (el.lb.hidden) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') stepLightbox(-1);
    if (e.key === 'ArrowRight') stepLightbox(1);
  });

  /* the card leans toward the pointer, as in the source component */
  if (matchMedia('(hover: hover)').matches) {
    el.lbCard.addEventListener('mousemove', (e) => {
      const r = el.lbCard.getBoundingClientRect();
      const rx = (e.clientY - r.top - r.height / 2) / 24;
      const ry = (r.width / 2 - (e.clientX - r.left)) / 24;
      el.lbCard.style.transition = 'none';
      el.lbCard.style.transform = 'perspective(1000px) rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)';
    });
    el.lbCard.addEventListener('mouseleave', () => {
      el.lbCard.style.transition = 'transform 0.5s var(--ease)';
      el.lbCard.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
    });
  }

  /* swipe between photos on touch */
  let sx = 0, sy = 0;
  el.lb.addEventListener('touchstart', (e) => {
    sx = e.touches[0].clientX; sy = e.touches[0].clientY;
  }, { passive: true });
  el.lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - sx;
    const dy = e.changedTouches[0].clientY - sy;
    if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) stepLightbox(dx < 0 ? 1 : -1);
  }, { passive: true });
}

/* ============================================================
   5. The card face
   One canvas per card: rounded dark plate, the photograph, a hairline
   and the camp name. Painted empty first so a card exists in the scene
   straight away, then repainted when its picture arrives.
   ============================================================ */
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y,     x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x,     y + h, r);
  ctx.arcTo(x,     y + h, x,     y,     r);
  ctx.arcTo(x,     y,     x + w, y,     r);
  ctx.closePath();
}

function faceSize(aspect) {
  const pw = aspect >= 1 ? PHOTO_PX : Math.round(PHOTO_PX * aspect);
  const ph = aspect >= 1 ? Math.round(PHOTO_PX / aspect) : PHOTO_PX;
  return { pw, ph, cw: pw + PAD * 2, ch: ph + PAD * 2 + TITLE_H };
}

function paintFace(canvas, size, img) {
  const { pw, ph, cw, ch } = size;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, cw, ch);

  /* plate */
  roundRect(ctx, 0, 0, cw, ch, 20);
  ctx.fillStyle = CARD_BG;
  ctx.fill();

  /* photo, or an empty well until it loads */
  ctx.save();
  roundRect(ctx, PAD, PAD, pw, ph, 12);
  ctx.clip();
  if (img) {
    ctx.drawImage(img, PAD, PAD, pw, ph);
  } else {
    ctx.fillStyle = 'rgba(245,239,236,0.05)';
    ctx.fillRect(PAD, PAD, pw, ph);
  }
  ctx.restore();

  /* the camp name, on every card */
  const baseline = PAD + ph + TITLE_H * 0.62;
  ctx.fillStyle = ACCENT;
  ctx.fillRect(PAD, PAD + ph + 13, 22, 2);

  ctx.fillStyle = BONE;
  ctx.textBaseline = 'alphabetic';
  ctx.font = '600 21px "Barlow Condensed", "Arial Narrow", sans-serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '1.5px';
  ctx.fillText(CARD_TITLE.toUpperCase(), PAD + 30, baseline);
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';

  /* hairline edge */
  roundRect(ctx, 0.75, 0.75, cw - 1.5, ch - 1.5, 20);
  ctx.strokeStyle = 'rgba(245,239,236,0.16)';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

/* A soft rectangular bloom, drawn once and tinted per card. Sits just
   behind the plate and fades up on hover. */
function glowTexture() {
  const S = 128;
  const c = document.createElement('canvas');
  c.width = c.height = S;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(S / 2, S / 2, S * 0.16, S / 2, S / 2, S / 2);
  g.addColorStop(0, 'rgba(255,255,255,0.85)');
  g.addColorStop(0.45, 'rgba(255,255,255,0.30)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, S, S);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/* ============================================================
   6. The scene
   ============================================================ */
let renderer, scene, camera, controls, galaxy, stars, cards = [], raycaster, pointer;
let hovered = null;
let idleAt = 0;

const TMP = new THREE.Vector3();
const FACE_Q = new THREE.Quaternion();
const PARENT_Q = new THREE.Quaternion();

function fibonacci(i, n) {
  const golden = (1 + Math.sqrt(5)) / 2;
  const y = 1 - (i / (n - 1)) * 2;
  const r = Math.sqrt(Math.max(0, 1 - y * y));
  const theta = (2 * Math.PI * i) / golden;
  return new THREE.Vector3(Math.cos(theta) * r, y, Math.sin(theta) * r);
}

function buildScene() {
  renderer = new THREE.WebGLRenderer({
    canvas: el.canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(el.stage.clientWidth, el.stage.clientHeight, false);
  renderer.setClearColor(0x000000, 0);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x05010a);

  camera = new THREE.PerspectiveCamera(60, el.stage.clientWidth / el.stage.clientHeight, 0.05, 3000);
  camera.position.set(0, 0, START_DIST);

  /* ---- star field ---- */
  const starCount = 9000;
  const pos = new Float32Array(starCount * 3);
  for (let i = 0; i < starCount; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 2000;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 2000;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 2000;
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  stars = new THREE.Points(starGeo, new THREE.PointsMaterial({
    color: 0xfff4ef, size: 0.9, sizeAttenuation: true, transparent: true, opacity: 0.85
  }));
  scene.add(stars);

  /* ---- the shells everything hangs on ---- */
  galaxy = new THREE.Group();
  scene.add(galaxy);

  const shellSpec = [
    [2,          0x7a0d06, 0.16],
    [SHELLS[0],  0xf03127, 0.055],
    [SHELLS[1],  0xf03127, 0.04],
    [SHELLS[2],  0xff5a44, 0.028]
  ];
  shellSpec.forEach(([r, color, opacity]) => {
    galaxy.add(new THREE.Mesh(
      new THREE.SphereGeometry(r, 32, 24),
      new THREE.MeshBasicMaterial({ color, wireframe: true, transparent: true, opacity, depthWrite: false })
    ));
  });

  /* ---- one card per photograph ---- */
  const glow = glowTexture();

  photos.forEach((p, i) => {
    const size = faceSize(p.aspect);

    /* every card covers the same area, so a wide frame is wider and
       shorter rather than being cropped to a common shape */
    const photoW = Math.sqrt(CARD_AREA * p.aspect);
    const unit = photoW / size.pw;
    const fw = size.cw * unit;
    const fh = size.ch * unit;

    const canvas = document.createElement('canvas');
    canvas.width = size.cw;
    canvas.height = size.ch;
    paintFace(canvas, size, null);

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy());

    const group = new THREE.Group();
    const dir = fibonacci(i, photos.length);
    const radius = SHELLS[i % SHELLS.length];
    group.position.copy(dir).multiplyScalar(radius);

    const bloom = new THREE.Mesh(
      new THREE.PlaneGeometry(fw * 1.35, fh * 1.3),
      new THREE.MeshBasicMaterial({
        map: glow, color: new THREE.Color(ACCENT_LIT), transparent: true, opacity: 0,
        depthWrite: false, blending: THREE.AdditiveBlending
      })
    );
    bloom.position.z = -0.05;
    group.add(bloom);

    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(fw, fh),
      new THREE.MeshBasicMaterial({ map: tex, transparent: true, toneMapped: false })
    );
    group.add(face);

    galaxy.add(group);

    const card = { photo: p, index: i, group, face, bloom, canvas, tex, size, scale: 1, target: 1 };
    face.userData.card = card;
    cards.push(card);
  });

  /* ---- controls ---- */
  controls = new OrbitControls(camera, el.canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.06;
  controls.rotateSpeed = 0.5;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.minDistance = 4;
  controls.maxDistance = 70;
  controls.target.set(0, 0, 0);
  controls.autoRotate = !reduced;
  controls.autoRotateSpeed = 0.35;

  raycaster = new THREE.Raycaster();
  pointer = new THREE.Vector2(-2, -2);

  window.addEventListener('resize', resize);
  resize();
}

function resize() {
  if (!renderer || renderer.xr.isPresenting) return;
  const w = el.stage.clientWidth;
  const h = el.stage.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h, false);
}

/* ============================================================
   7. Loading the pictures
   ============================================================ */
function loadFaces() {
  let done = 0;

  const tick = () => {
    done++;
    const pct = Math.round((done / cards.length) * 100);
    if (el.loadFill) el.loadFill.style.width = pct + '%';
    if (el.loadText) el.loadText.textContent = done + ' of ' + cards.length + ' photos';
    if (done === cards.length && el.load) {
      el.load.classList.add('is-done');
      setTimeout(() => { el.load.hidden = true; }, 700);
    }
  };

  cards.forEach((card) => {
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      paintFace(card.canvas, card.size, img);
      card.tex.needsUpdate = true;
      tick();
    };
    img.onerror = tick;
    img.src = card.photo.card;
  });
}

/* ============================================================
   8. Pointer
   ============================================================ */
function setPointer(e) {
  const r = el.canvas.getBoundingClientRect();
  pointer.set(
    ((e.clientX - r.left) / r.width) * 2 - 1,
    -((e.clientY - r.top) / r.height) * 2 + 1
  );
}

function cardAtPointer() {
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(cards.map((c) => c.face), false)[0];
  return hit ? hit.object.userData.card : null;
}

function initPointer() {
  let downAt = null;

  el.canvas.addEventListener('pointermove', setPointer);
  el.canvas.addEventListener('pointerleave', () => pointer.set(-2, -2));

  el.canvas.addEventListener('pointerdown', (e) => {
    downAt = { x: e.clientX, y: e.clientY };
    controls.autoRotate = false;
  });

  el.canvas.addEventListener('pointerup', (e) => {
    idleAt = Date.now();
    if (!downAt) return;
    const moved = Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y);
    downAt = null;
    /* A drag is how you look around, so only a still press opens a photo.
       Distance is the whole test — orbiting needs movement, so however
       long someone rests on a card without moving, they meant to tap it. */
    if (moved > 6) return;

    /* raycast where the finger actually came up: a touch never hovered
       first, so the hover state cannot be trusted to know what was hit */
    setPointer(e);
    const card = cardAtPointer();
    if (card) openLightbox(card.index);
  });

  el.canvas.addEventListener('wheel', () => { controls.autoRotate = false; idleAt = Date.now(); }, { passive: true });
}

function updateHover() {
  if (renderer.xr.isPresenting) return;

  const next = cardAtPointer();

  if (next !== hovered) {
    if (hovered) hovered.target = 1;
    hovered = next;
    if (hovered) hovered.target = 1.15;
    el.canvas.style.cursor = hovered ? 'pointer' : 'grab';
  }
}

/* ============================================================
   9. AR
   WebXR where it exists (Android Chrome, headset browsers): the
   whole shell shrinks to something you can stand inside, and the
   DOM overlay keeps the download button working over the camera.
   Where it doesn't (iOS has no WebXR), the phone still becomes a
   window you move around — same scene, real motion, no camera pass
   through.
   ============================================================ */
let xrSession = null;
let reticle = null;
let hitSource = null;
let placed = false;
let arController = null;
const galaxyHome = { pos: new THREE.Vector3(), scale: 1 };

async function initAR() {
  let xrOK = false;
  try {
    xrOK = !!(navigator.xr && await navigator.xr.isSessionSupported('immersive-ar'));
  } catch (e) { xrOK = false; }

  if (xrOK) {
    el.arBtn.hidden = false;
    el.arLabel.textContent = 'View in AR';
    el.arBtn.addEventListener('click', enterAR);
    buildReticle();
    return;
  }

  /* No WebXR. If the device can report its own orientation, offer the
     look-around window instead — honestly labelled, since there is no
     camera pass-through behind it. */
  if (window.DeviceOrientationEvent && matchMedia('(pointer: coarse)').matches) {
    el.arBtn.hidden = false;
    el.arLabel.textContent = 'Look around';
    el.arBtn.addEventListener('click', enterGyro);
  }
}

function buildReticle() {
  reticle = new THREE.Mesh(
    new THREE.RingGeometry(0.09, 0.11, 32).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(ACCENT_LIT), transparent: true, opacity: 0.9 })
  );
  reticle.matrixAutoUpdate = false;
  reticle.visible = false;
  scene.add(reticle);
}

async function enterAR() {
  try {
    el.arWrap.hidden = false;
    xrSession = await navigator.xr.requestSession('immersive-ar', {
      optionalFeatures: ['hit-test', 'local-floor', 'dom-overlay'],
      domOverlay: { root: el.arWrap }
    });
  } catch (e) {
    el.arWrap.hidden = true;
    if (window.toast) window.toast('This device turned down the AR session');
    return;
  }

  closeLightbox();
  document.body.classList.add('is-xr');

  galaxyHome.pos.copy(galaxy.position);
  galaxyHome.scale = galaxy.scale.x;

  scene.background = null;              // the room is the background now
  stars.visible = false;
  controls.enabled = false;
  placed = false;
  el.arPanel.hidden = true;
  el.arExitLbl.textContent = 'Exit AR';
  el.arTag.textContent = 'Point at the floor, then tap to place the gallery';

  galaxy.scale.setScalar(AR_RADIUS / SHELLS[SHELLS.length - 1]);
  galaxy.visible = false;               // stays hidden until it is placed

  renderer.xr.enabled = true;
  renderer.xr.setReferenceSpaceType('local');
  await renderer.xr.setSession(xrSession);

  /* floor detection is optional — without it the gallery just lands
     a comfortable distance in front of wherever you are looking */
  try {
    const viewer = await xrSession.requestReferenceSpace('viewer');
    hitSource = await xrSession.requestHitTestSource({ space: viewer });
  } catch (e) {
    hitSource = null;
  }

  arController = renderer.xr.getController(0);
  arController.addEventListener('select', onARSelect);
  scene.add(arController);

  xrSession.addEventListener('end', onAREnd, { once: true });
}

function onARSelect() {
  if (!placed) {
    if (reticle && reticle.visible) {
      galaxy.position.setFromMatrixPosition(reticle.matrix);
      galaxy.position.y += AR_RADIUS * 0.95;      // stand inside it, not on top of it
    } else {
      /* no floor found — drop it in front of the viewer */
      const fwd = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
      galaxy.position.copy(camera.position).add(fwd.multiplyScalar(0.4));
    }
    galaxy.visible = true;
    if (reticle) reticle.visible = false;
    placed = true;
    el.arTag.textContent = 'Walk into it · tap a photo to open it';
    return;
  }

  /* already placed — a tap now picks a photograph */
  const m = new THREE.Matrix4().identity().extractRotation(arController.matrixWorld);
  raycaster.ray.origin.setFromMatrixPosition(arController.matrixWorld);
  raycaster.ray.direction.set(0, 0, -1).applyMatrix4(m);

  const hit = raycaster.intersectObjects(cards.map((c) => c.face), false)[0];
  if (!hit) { el.arPanel.hidden = true; return; }

  const card = hit.object.userData.card;
  el.arImg.src = card.photo.full;
  el.arImg.alt = card.photo.alt;
  el.arPanel.hidden = false;
  el.arDl.onclick = () => download(card.photo);
}

function onAREnd() {
  document.body.classList.remove('is-xr');
  el.arWrap.hidden = true;
  el.arPanel.hidden = true;

  if (arController) {
    arController.removeEventListener('select', onARSelect);
    scene.remove(arController);
    arController = null;
  }
  if (hitSource) { hitSource = null; }
  if (reticle) reticle.visible = false;

  renderer.xr.enabled = false;
  xrSession = null;
  placed = false;

  galaxy.position.copy(galaxyHome.pos);
  galaxy.scale.setScalar(galaxyHome.scale);
  galaxy.visible = true;
  scene.background = new THREE.Color(0x05010a);
  stars.visible = true;
  controls.enabled = true;

  resize();
}

/* ---------- Look-around fallback ------------------------------ */
let gyroOn = false;
const gyro = { alpha: 0, beta: 0, gamma: 0, orient: 0 };
const zee = new THREE.Vector3(0, 0, 1);
const gyroEuler = new THREE.Euler();
const q0 = new THREE.Quaternion();
const qFlip = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

function onDeviceOrientation(e) {
  if (e.alpha == null) return;
  gyro.alpha = THREE.MathUtils.degToRad(e.alpha);
  gyro.beta  = THREE.MathUtils.degToRad(e.beta || 0);
  gyro.gamma = THREE.MathUtils.degToRad(e.gamma || 0);
  gyro.orient = THREE.MathUtils.degToRad(window.orientation || 0);
}

async function enterGyro() {
  const DOE = window.DeviceOrientationEvent;
  if (DOE && typeof DOE.requestPermission === 'function') {
    try {
      if (await DOE.requestPermission() !== 'granted') {
        if (window.toast) window.toast('Motion access was declined');
        return;
      }
    } catch (e) {
      if (window.toast) window.toast('Motion access is unavailable here');
      return;
    }
  }

  gyroOn = true;
  document.body.classList.add('is-xr');
  el.arWrap.hidden = false;
  el.arPanel.hidden = true;
  /* not an AR session — say so rather than borrowing the label */
  el.arExitLbl.textContent = 'Exit';
  el.arTag.textContent = 'Move your phone to look around · tap a photo';

  controls.enabled = false;
  camera.position.set(0, 0, 0.01);
  window.addEventListener('deviceorientation', onDeviceOrientation);
  if (el.stage.requestFullscreen) el.stage.requestFullscreen().catch(() => {});
  resize();
}

function exitGyro() {
  gyroOn = false;
  document.body.classList.remove('is-xr');
  el.arWrap.hidden = true;
  window.removeEventListener('deviceorientation', onDeviceOrientation);
  controls.enabled = true;
  camera.position.set(0, 0, START_DIST);
  camera.quaternion.identity();
  controls.update();
  if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  resize();
}

function initAROverlay() {
  el.arExit.addEventListener('click', () => {
    if (xrSession) xrSession.end().catch(() => {});
    else if (gyroOn) exitGyro();
  });
  el.arPanelX.addEventListener('click', () => { el.arPanel.hidden = true; });
  document.addEventListener('fullscreenchange', () => {
    if (gyroOn && !document.fullscreenElement) exitGyro();
  });
}

/* ============================================================
   10. Frame
   ============================================================ */
let lastFrame = 0;

function frame(time, xrFrame) {
  const dt = lastFrame ? Math.min((time - lastFrame) / 1000, 0.05) : 0;
  lastFrame = time;

  if (!reduced && stars.visible) {
    stars.rotation.y += dt * 0.006;
    stars.rotation.x += dt * 0.003;
  }

  /* place-on-floor reticle */
  if (xrFrame && hitSource && !placed) {
    const space = renderer.xr.getReferenceSpace();
    const hits = xrFrame.getHitTestResults(hitSource);
    if (hits.length) {
      const pose = hits[0].getPose(space);
      reticle.visible = true;
      reticle.matrix.fromArray(pose.transform.matrix);
    } else {
      reticle.visible = false;
    }
  }

  if (gyroOn) {
    gyroEuler.set(gyro.beta, gyro.alpha, -gyro.gamma, 'YXZ');
    camera.quaternion.setFromEuler(gyroEuler);
    camera.quaternion.multiply(qFlip);
    camera.quaternion.multiply(q0.setFromAxisAngle(zee, -gyro.orient));
  } else if (!renderer.xr.isPresenting) {
    /* pick the drift back up once the visitor has stopped moving */
    if (!reduced && !controls.autoRotate && idleAt && Date.now() - idleAt > 4000) {
      controls.autoRotate = true;
    }
    updateHover();
    controls.update();
  }

  /* Every card turns to face whoever is looking, and the hovered one lifts
     toward them.

     The cards take the viewer's orientation rather than each aiming itself
     with lookAt(). Aiming works from outside the shell, but in AR and in the
     look-around view the viewer stands at its centre — and there lookAt has
     no way to orient a card directly overhead or underfoot, because the
     direction to the eye is parallel to the up vector it resolves roll
     against. Those cards come out rolled at random, some of them upside
     down. One shared orientation cannot degenerate. */
  const eye = renderer.xr.isPresenting ? renderer.xr.getCamera() : camera;
  eye.getWorldQuaternion(FACE_Q);
  galaxy.getWorldQuaternion(PARENT_Q);
  FACE_Q.premultiply(PARENT_Q.invert());

  for (const card of cards) {
    card.group.quaternion.copy(FACE_Q);
    if (card.scale !== card.target) {
      card.scale += (card.target - card.scale) * Math.min(1, dt * 12);
      if (Math.abs(card.target - card.scale) < 0.002) card.scale = card.target;
      card.group.scale.setScalar(card.scale);
      card.bloom.material.opacity = (card.scale - 1) / 0.15 * 0.9;
    }
  }

  renderer.render(scene, camera);
}

/* ============================================================
   11. Boot
   ============================================================ */
function fail(msg) {
  if (el.load) el.load.hidden = true;
  if (el.fail) {
    el.fail.hidden = false;
    if (msg) el.fail.textContent = msg;
  }
  el.stage.classList.add('is-flat');
  if (el.arBtn) el.arBtn.hidden = true;
}

/* the grid and the lightbox are the gallery even without WebGL, and they
   have to exist before motion.js boots — so they are wired up first */
buildGrid();
initLightbox();

try {
  buildScene();
} catch (e) {
  console.error('[gallery] WebGL unavailable', e);
  fail();
}

if (renderer) {
  initPointer();
  initAROverlay();

  /* the card name is drawn into a canvas, so the webfont has to be
     there before the faces are painted */
  const ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
  ready.catch(() => {}).then(() => {
    cards.forEach((c) => { paintFace(c.canvas, c.size, null); c.tex.needsUpdate = true; });
    loadFaces();
  });

  initAR();
  renderer.setAnimationLoop(frame);

  el.canvas.style.cursor = 'grab';
  if (matchMedia('(pointer: coarse)').matches && el.hint) {
    el.hint.textContent = 'Drag to look around · pinch to zoom · tap a photo';
  }
}
