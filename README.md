# MIRAI Driving @ ACCV 2026 — Workshop Website

Website for **MIRAI Driving: Multimodal Intelligence and Reasoning for Autonomous and
Intelligent Driving**, a half-day invited workshop at the Asian Conference on Computer
Vision (ACCV 2026), Osaka, Japan.

- **Date:** Monday, 15 December 2026 (PM session)
- **Room:** 1007, Osaka International Convention Center (Grand Cube Osaka)
- **Format:** Half-day invited workshop — keynotes, invited talks, and a panel discussion (no call for papers)

## Files

```
index.html          Single-page site (all content)
assets/style.css    Sakura theme — palette taken from the workshop logo
assets/sakura.js    Falling-petal canvas animation, nav, scroll spy, reveal-on-scroll
assets/mirai-logo.jpg   Workshop logo
.nojekyll           Serve files as-is on GitHub Pages
```

## Local preview

```bash
cd website
python3 -m http.server 8000
# open http://localhost:8000
```

## Publishing to GitHub Pages

This directory is the repository root of
[mengsiwei/MIRAI_ACCV_Workshop](https://github.com/mengsiwei/MIRAI_ACCV_Workshop).
To publish an update:

```bash
git add -A
git commit -m "Describe the change"
git push
```

GitHub Pages must be switched on once, in **Settings → Pages**: set *Source* to
`Deploy from a branch`, branch `main`, folder `/ (root)`. The site is then served at

**https://mengsiwei.github.io/MIRAI_ACCV_Workshop/**

All asset paths are relative, so the site works at any base path — a project page,
a user page (`mengsiwei.github.io`), or a custom domain.

## Updating content

Everything lives in `index.html`; there is no build step.

- **Program** — the `<ol class="program-list">` block under `#program`.
- **Speakers** — `<article class="speaker-card">` blocks under `#speakers`.
- **Organizers** — `<article class="org-card">` blocks under `#organizers`.
- **Dates** — the `.timeline` block under `#dates`.

Organizer and speaker cards currently use kanji initials as placeholder avatars. To use
photographs instead, drop the image into `assets/` and replace the avatar `<div>` with:

```html
<img class="org-avatar" src="assets/name.jpg" alt="Name">
```

## Notes on the design

- **Sakura UX** — cherry-blossom petals drift down the page on a fixed canvas layer,
  each petal tumbling with a sway and flip so it reads as falling in three dimensions.
  The palette (blossom pink, twilight indigo, Osaka dusk lavender) is sampled from the
  workshop logo.
- **Accessibility** — the petal animation and all scroll reveals are disabled under
  `prefers-reduced-motion: reduce`; the animation also pauses when the tab is hidden.
- **Print** — a print stylesheet strips the animation, navigation, and backgrounds.
