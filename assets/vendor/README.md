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

They are vendored rather than loaded from a CDN so the site keeps working
offline and needs no build step.
