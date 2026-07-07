# Axamo Studio V2 — studio skeleton + Axamo colors only

The approved 1:1 layout/motion skeleton from `../studio-namma-clone/` with ONLY
the Axamo color world applied. Typography, type scale, tracking, line-heights,
and radii are the studio original's, untouched. Structure and every animation
are identical to the verified clone.

## Run it

```bash
cd axamo-studio-v2 && python3 -m http.server 8124
# open http://localhost:8124  (clone runs on 8123 for side-by-side)
```

## What is Axamo here (colors + brand content only)

- Canvas `#f0f0eb` with the dot-grid texture; text `#252525` / `#333` / muted `#999`.
- Brand terracotta `#c84b30` (+ dark `#93321d`, tint `#eabebe`) on the cursor
  dot, transition veil, menu hover visuals, and all media placeholder tints
  (terracotta / tint / charcoal / cream / one navy `#002855`).
- Dark theme: `#252525` / `#1a1a1a`, dimmed dots, brand unchanged.
- Brand content: nav "Axamo (R) Studio", client wordmarks (Oracle, Vanta, Zoho,
  Flosum, ColdIQ), giant stretched "AXAMO" footer wordmark, page title.

## What stayed the studio original (everything typographic)

- Archivo variable (display `wdth` 62, weight 800, uppercase; body `wdth` 100),
  IBM Plex Mono 300 labels, Pixelify Sans clock/preloader counter, via the
  same Google Fonts link as the clone.
- All original sizes, line-heights (13rem/10.5rem down the bands), and
  letter-spacings (-0.6rem h1 desktop, band overrides intact).
- Original radii: 0.4rem / 0.3rem / 0.25rem per band.
- No italic serif accents, no orange accent words: single-color headlines.

## Real imagery (2026-07-06)

All media slots are filled with Axamo's own assets, downloaded from axamo.co +
axamo.co/site-to-close into `assets/img/` (self-contained, no CDN hotlinks):

- **Project cards** → the 4 featured case-study covers: Flosum, Coverbase,
  Abacai, ColdIQ (`proj-*.jpg`).
- **Client row** → real logos: Oracle, Vanta, Zoho, Flosum, ColdIQ
  (`client-*`), grayscale-muted, full color on hover, inverted in dark mode.
- **Real logo** → Axamo star mark (`axamo-star.svg`, orange, both themes) in
  the nav; real `axamo-wordmark.svg` as the giant footer wordmark (inverts in dark).
- **Ambient slots** (hero follow-visual, video block, 11 intro floaters, 6
  footer tiles, 7 nav-menu hover thumbs, 8 service previews) → cycled across the
  8 crisp large assets (4 covers + `pr1/pr2/pr3` + `tablet`). The tiny
  Design_bg gradients were dropped (too low-res to scale).
- Mechanism: `<img class="g_visual_img">` nested in each wrapper +
  `.placeholder-media.is-img::before{display:none}`; services via CSS
  `nth-of-type` background-image. All motion untouched.

## Preloader → Osmo "Number Loader in 3 Steps"

Replaces the old pixel counter. Kept in its **exact resource colors** (#ff4c24
progress, #E2E1DF bg) per Eldar; only two integration adaptations: z-index
13000 (covers the fixed nav) and the number font mapped to the studio display
face (PP Neue Corp Tight is a paid font we can't ship). The resource's global
`gsap.defaults` was scoped to the loader timeline so it doesn't leak ease/
duration onto the rest of the page; on completion it slides up and hands control
to the existing hero-intro/reveal boot flow. `prefers-reduced-motion` skips it.

## Verified (2026-07-06)

Playwright 1440 light + dark: loader animates (orange bar + rolling numbers) and
reveals; 4 real project covers, 5 real client logos, real nav star + footer
wordmark, all ambient slots populated. Zero console errors; every `assets/img/*`
request returns 200. Motion intact (follow-visual, card hover, menu, services).

## Next passes (manual, Eldar)

1. Final copy (all text is still placeholder).
2. Swap any covers for higher-res exports if desired.
3. Deploy: public GitHub repo + Vercel dashboard import, `studio.axamo.co` DNS.
