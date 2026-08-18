# Vendored libraries

## GSAP 3.15.0

- `gsap.min.js` — core (73 KB)
- `ScrollTrigger.min.js` — scroll-driven animation plugin (45 KB)

Source: <https://github.com/greensock/GSAP> · <https://gsap.com>

Licence: GreenSock **Standard "no charge" licence** —
<https://gsap.com/standard-license>. Free to use for this site (a
non-commercial church youth-camp site). Since 2025 GSAP and all of its
plugins are free, including for commercial projects.

Files are copied unmodified from the npm package `gsap@3.15.0`
(`dist/gsap.min.js`, `dist/ScrollTrigger.min.js`).

### Updating

```bash
npm pack gsap@latest
tar -xzf gsap-*.tgz
cp package/dist/gsap.min.js package/dist/ScrollTrigger.min.js assets/vendor/
```

## three.js 0.185.1

Used by the gallery only (`gallery.html` + `assets/js/gallery.js`).

- `three/three.module.min.js` — ES module entry (366 KB)
- `three/three.core.min.js` — the rest of the library, imported by the entry
  file by relative path, so the two must stay side by side (386 KB)
- `three/addons/controls/OrbitControls.js` — drag / pinch / zoom camera

Source: <https://github.com/mrdoob/three.js> · Licence: **MIT**, see
`three/LICENSE`. Copied unmodified from the npm package `three@0.185.1`
(`build/`, `examples/jsm/`).

These are ES modules, so `gallery.html` resolves the bare `three` and
`three/addons/` specifiers with an import map rather than a bundler:

```html
<script type="importmap">
{ "imports": {
    "three": "./assets/vendor/three/three.module.min.js",
    "three/addons/": "./assets/vendor/three/addons/" } }
</script>
```

### Updating

```bash
npm pack three@latest
tar -xzf three-*.tgz
cp package/build/three.module.min.js package/build/three.core.min.js assets/vendor/three/
cp package/examples/jsm/controls/OrbitControls.js assets/vendor/three/addons/controls/
cp package/LICENSE assets/vendor/three/LICENSE
```

---

Everything here is vendored rather than loaded from a CDN so the site keeps
working offline and needs no build step.
