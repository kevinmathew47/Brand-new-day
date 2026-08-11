---
name: camp-motion
description: Animation and reveal conventions for the Brand New Day camp site using the vendored GSAP + ScrollTrigger. Use when adding, changing or debugging any animation, scroll effect, reveal, parallax or transition on this site — including "make it more animated", "add a parallax", "this element is invisible/stuck", "the page is blank until I scroll", or "the animation doesn't fire after filtering".
---

# Camp site motion (GSAP)

All motion lives in **`assets/js/motion.js`**. Do not scatter `gsap.*` calls into
page scripts — `songs.js`, `schedule.js` and `gallery.js` stay animation-free so
they keep working if GSAP is absent.

## The contract

GSAP is **progressive enhancement**. `motion.js` bails out entirely when GSAP is
missing or `prefers-reduced-motion: reduce` is set, and the
IntersectionObserver reveals in `site.js` take over.

The handshake is one class:

```js
document.documentElement.classList.add('gsap-on');   // motion.js, at parse time
if (document.documentElement.classList.contains('gsap-on')) return;  // site.js initReveal
```

`.gsap-on` also switches off the CSS transition on `[data-reveal]` — a CSS
transition and a GSAP tween on the same property fight each other and stutter.

Script order in every page (motion.js must come after site.js so its
`DOMContentLoaded` handler runs after `initPage()` has rendered the content):

```html
<script src="assets/vendor/gsap.min.js"></script>
<script src="assets/vendor/ScrollTrigger.min.js"></script>
<script src="assets/js/data.js"></script>      <!-- or songs-data.js -->
<script src="assets/js/site.js"></script>
<script src="assets/js/motion.js"></script>
<script src="assets/js/<page>.js"></script>
```

## The reveal engine

Anything hidden-then-revealed goes through `revealGroup(items, hiddenVars, opts)`.
It tags each element (`el.__mHidden`), pushes it onto `pending`, and wires a
`ScrollTrigger.batch`. A separate `sweep()` reveals anything the observer never
fired for. **Add new reveal groups through `revealGroup`, never with a bare
`gsap.from` + `ScrollTrigger.batch`** — otherwise it will not be swept.

## Traps that have already bitten this site

**1. Never transform a child of a `background-clip: text` element.**
`.display` clips a gradient + crackle texture to the glyphs. A transformed
*descendant* loses that fill and renders invisible. Put `.display` on the element
you animate, not on its parent:

```html
<!-- right: each line owns its own clipped fill -->
<h1 class="hero__title"><span class="display">Brand</span><span class="display">New Day</span></h1>
```

Transforming the element that *has* `.display`, or an ancestor of it, is fine.

**2. One tween per property per element.**
`reveals()` owns everything with `[data-reveal]`. Other helpers must filter those
out — and their descendants — or the element gets two opacity tweens and sticks
at whichever didn't fire:

```js
$$(sel).filter(el => !el.hasAttribute('data-reveal') && !el.closest('[data-reveal]'))
```

**3. `requestAnimationFrame` is frozen in a non-compositing tab.**
Never put *setup* inside rAF. A background tab, or a hidden preview pane, never
fires it, so every `[data-reveal]` would stay at opacity 0 forever. `boot()`
runs synchronously and `sweep()` is throttled on `Date.now()`, not rAF. (Tween
*playback* still needs rAF — that is fine, it resumes when the tab is shown.)

**4. `ScrollTrigger.batch` misses jump-scrolls.**
It is IntersectionObserver-driven, so a scrollbar drag, the End key, or an
in-page `#anchor` can skip elements that then never intersect and never reveal.
That is what `sweep()` exists for. It runs on scroll, on `ST.refresh`, on
`load`, and once at boot.

**5. Refresh ScrollTrigger after anything that changes page height.**
Switching schedule days, filtering, and late-loading images all invalidate every
trigger below the change. Call `ST.refresh()` after each.

**6. Content rendered by `initPage()` doesn't exist at parse time.**
For anything re-rendered later (lyric blocks, lightbox media) use a
`MutationObserver` on the container rather than animating once at boot.

**7. `display: flex` on a list item shreds its sentence.**
Text runs either side of a `<b>` become separate flex items with gaps between
them. `.check-list li` uses block layout with an absolutely positioned marker
for exactly this reason.

## The full-screen menu

Ownership is split, and it matters:

- **`site.js`** injects the markup (once, so the four pages can't drift apart),
  owns the open/closed state on `[data-nav]`, the scroll lock, Escape, and
  overlay/link click-to-close.
- **`motion.js`** owns only the motion, via the `window.onMenuToggle(open)`
  hand-off that site.js calls.

So the menu still opens and closes with GSAP absent — `html:not(.gsap-on)`
rules drive it on CSS transitions instead.

`CustomEase` is vendored for this (`assets/vendor/CustomEase.min.js`) to get the
source component's `0.65, 0.01, 0.05, 0.99` curve. `MENU_EASE` falls back to
`power3.inOut` if the plugin is missing.

**Do not use `:last-of-type` for the backdrop panels.** It resolves against
*div* siblings, and `.ambient-background-shapes` is the last div in `.menu-bg`,
so it silently matches nothing. The third panel carries `.final` explicitly.

## The loading curtain

`assets/js/loader.js` runs on **index.html only**. Characters fly in from random
3D points, hold, then fly out as the next word arrives ("Brand" / "New" / "Day").

Three rules it must keep:

- **The markup is in the HTML, not injected**, so there is no flash of the page
  before the curtain drops.
- **CSS carries its own failsafe** (`@keyframes loader-failsafe`, 7s). A JS error
  must never leave a visitor staring at a locked screen. Verified with JavaScript
  fully disabled.
- **The hero entrance is gated on it.** `motion.js` builds the hero timeline
  `paused: true` when `.loader` is present and plays it on the `camp:loaded`
  event, with a 7s fallback — otherwise the whole entrance plays behind the
  curtain and is over before anyone sees it.

`MIN_SHOW` keeps the curtain up long enough for one full word cycle, so a fast
local load doesn't reduce it to a flicker.

## House style

- Ease `power3.out` for entrances, `back.out` for things that should land,
  `expo.out` for the hero title, `none` for scrub.
- Duration 0.5–0.9s. Stagger 0.05–0.09.
- `once: true` on reveals — nothing re-hides on scroll back up.
- Scroll-linked effects use `scrub: 0.6–0.8`, never a fixed duration.
- Pointer-follow uses `gsap.quickTo`, gated behind `(hover: hover)`.

## Checking your work

The preview pane cannot verify animation: it does not composite, so rAF — and
therefore GSAP's ticker — is frozen and no tween ever completes. Render with
headless Chrome instead.

The important test is a **single jump to the bottom**, not a gradual scroll:

```js
scrollTo(0, 99999)   // then wait ~2s
[...document.querySelectorAll('[data-reveal], .panel, .plate, .song-row, .gal-item, .tl-item')]
  .filter(e => getComputedStyle(e).display !== 'none'
            && parseFloat(getComputedStyle(e).opacity) < 0.05)
```

Must be empty. Test the fallback the same way with the `gsap.min.js` tag pointed
at a missing file — every `[data-reveal]` must still end up with `.is-in`.

## Updating GSAP

See `assets/vendor/README.md`. Files are vendored, not on a CDN, so the site
works offline and needs no build step.
