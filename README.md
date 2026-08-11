# Brand New Day — Youth Camp 2026

Website for **Christos Mar Thoma Yuvajana Sakhyam, Kakkanad**
Mar Thoma Meadows, Thekkady · 14–16 August 2026 · *2 Corinthians 5:17*

Phase 1 — static site, no build step, no registration, no fees shown anywhere.

## Run it

Any static server works. From this folder:

```bash
python -m http.server 5173
```

Then open <http://localhost:5173>. To publish, upload the whole folder to any static
host (GitHub Pages, Netlify, Firebase Hosting, cPanel) — there is nothing to compile.

## Pages

| File | What's on it |
|---|---|
| `index.html` | Poster hero, countdown, the theme, the message, songbook + timetable cards, speakers, what to bring, contact |
| `schedule.html` | Day tabs (Fri/Sat/Sun), colour-coded timeline, type filters, live "now" marker, per-item calendar download |
| `songs.html` | All 12 songs, search across titles *and* lyrics, session filters, full-screen reader with presentation mode, printable songbook |
| `gallery.html` | Masonry photo/video grid, filters, lightbox, phase-2 placeholder |

## Editing content

Everything editable lives in two data files — no HTML changes needed.

**`assets/js/data.js`**
- `SCHEDULE` — the three days and every timeline item
- `SPEAKERS` — the speaker cards
- `GALLERY` — photos and videos
- `GALLERY_PLACEHOLDERS` — how many "coming after camp" tiles to show

**`assets/js/songs-data.js`**
- `SONGS` — all 12 songs, block by block (`verse` / `chorus` / `bridge` / `note`)
- `SONG_ORDER` — the session-wise running order

Camp name, dates and venue are in `window.CAMP` at the top of `assets/js/site.js`.

### Adding photos and videos

Put files in `assets/img/gallery/` (or `assets/video/`), then add to `GALLERY`:

```js
{ type: 'photo', src: 'assets/img/gallery/campfire.jpg',
  cap: 'Campfire night', tag: 'Fellowship', size: 'tall' }

{ type: 'video', src: 'assets/video/talent-night.mp4',
  poster: 'assets/img/gallery/talent-night.jpg',
  cap: 'Talent night', tag: 'Fun' }
```

`size` is `'tall'`, `'wide'`, or omitted. Videos preview on hover and play in the lightbox.

## Animation

Motion is driven by **GSAP 3.15 + ScrollTrigger**, vendored into
`assets/vendor/` (117 KB, no CDN, no build step). All of it lives in one file,
`assets/js/motion.js`:

- hero entrance timeline and poster parallax
- scroll reveals, section headings, card and tile staggers
- the Old → New block, where a blade strikes through each old word in turn
- schedule timeline items, re-running when you switch day or filter
- lyric blocks staggering in each time you change song
- lightbox media

It is **progressive enhancement**. If GSAP fails to load, or the visitor has
"reduce motion" turned on, `motion.js` stands down and the CSS +
IntersectionObserver reveals in `site.js` take over — the site stays fully
usable either way.

Conventions and the traps specific to this design are written up in
`.claude/skills/camp-motion/SKILL.md`.

## Header & loader

The toolbar is **Cupertino** — the iOS Notes material, in camp colours: a
floating capsule of frosted glass (`blur(30px) saturate(180%)`), a hairline
highlight along the top edge, the Apple system font stack sentence-cased with
tight tracking, and an **iOS segmented control** whose selection is a raised
glass pill that slides between segments (measured in `site.js`, animated by CSS,
so it needs no GSAP).

`index.html` opens with a **kinetic typography curtain** — letters fly in from
random points in 3D, hold, then scatter as the next word lands. See the
loader notes in `.claude/skills/camp-motion/SKILL.md` for the failsafe and the
hero hand-off.

## Design

**Cinematic key art**, built to sit right next to the camp poster. The palette is
sampled straight off `b33e8b0c…png` rather than invented — a deep blood-red
*field*, not a neutral black one, which is what makes it read as the poster:

| | |
|---|---|
| `#170203` | page base |
| `#4B0401` | mid field |
| `#942315` | poster red |
| `#F03127` | accent |
| `#FF5A44` | hot highlight |
| `#F5EFEC` | bone |

Display type is **Anton**, condensed UI type is **Barlow Condensed**, body is
**Barlow**, and the marker labels (Fear, Doubt, Worry…) are **Permanent Marker**,
matching the poster. All tokens are CSS custom properties at the top of
`assets/css/style.css`.

Recurring motifs: a spider-web weave in the corners, sharp corners with drawn-on
corner brackets, floating steel, and scrolling marquee strips.

### Imagery

- `hero-plate.webp` — the cross / doorway / figure column cut from the 4K poster,
  with an elliptical alpha feather baked in so it melts into the red field.
  Deliberately **not** a wide crop: going wider drags the poster's printed marker
  words back in and doubles them with the animated ones.
- `bl-*.webp` — katanas and shuriken chroma-keyed out of the poster with real
  transparency, floated over the hero with pointer and scroll parallax.
- `web.svg` — the spider web, generated procedurally, so it stays sharp at any size.
- `ph-*.jpg` — 4K photography (Pexels, free licence, no attribution required)
  put through a **red duotone** so it lives in the poster's palette instead of
  fighting it.
- `poster.jpg` — the poster artwork, cropped above the details band so no fee or
  registration link appears anywhere on the site.

Regenerating any of these is a matter of re-running the crop/duotone steps against
the source posters in `F:\Camp2026\`.

## Phase 2 — face recognition

The gallery is deliberately data-driven so the planned "find my photos" feature can be
added without touching the rest of the site: each item is one object in `GALLERY`, so a
`faces: [...]` field plus a matching step in `assets/js/gallery.js` is all the grid needs.
`gallery.html` already carries the phase-2 notice.

## Keyboard shortcuts

**Song reader** — `←` `→` previous/next song · `+` `−` text size · `P` presentation mode · `Esc` close
**Gallery lightbox** — `←` `→` previous/next · `Esc` close

Both also respond to swipe on touch screens.
