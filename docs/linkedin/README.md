# LinkedIn launch artifacts

Everything for the "1st Place + open source" post. Not part of the app.

## Files

| Path                            | What it is                                                                       |
| ------------------------------- | -------------------------------------------------------------------------------- |
| `post-draft-v2.md`              | **The post to publish.** Current draft (~2,050 chars).                           |
| `post-draft-v1.md`              | Earlier draft, kept for reference — longer, included the results-delay story.    |
| `kawan-linkedin-carousel.pdf`   | **The carousel as a document post.** 8 pages, 810×1013pt (4:5).                  |
| `png/kawan-carousel-{1..8}.png` | **The same 8 pages as images**, 1080×1350 — for a multi-image post.              |
| `build/build.py`                | Regenerates everything. Edit the `P1`–`P8` blocks and re-run.                    |
| `build/img/`                    | Source imagery — screenshot crops, partner logos, the generated photo, QR codes. |
| `build/fonts/`                  | Fredoka + Fraunces (SIL OFL).                                                    |

`build/carousel.html` and `build/preview/` are generated and git-ignored.

## Rebuilding

```bash
cd docs/linkedin/build && python3 build.py          # -> ../kawan-linkedin-carousel.pdf
cd .. && pdftoppm -png -scale-to-x 1080 -scale-to-y 1350 \
    kawan-linkedin-carousel.pdf png/kawan-carousel  # -> png/kawan-carousel-N.png
```

Needs `qrcode` + `Pillow`, and a Chromium (Playwright's or Puppeteer's — the script
finds it). Fonts and images are base64-inlined at build time, so the render itself
is offline and deterministic.

The QR codes are regenerated on every build from `LINKS` and use `ERROR_CORRECT_H`
because the centred eye logo occludes modules. All three were verified decodable
from the final 1080×1350 raster.

## Carousel pages

1. Hero — 1st Place, Corporate Track
2. The problem — "I'll ship it Friday."
3. The fix — one commitment, under 60 seconds
4. The guardrail — the AI can't move your goalposts
5. The companion — three Live2D characters, or bring your own
6. The verdict — it fetches the evidence itself
7. The brain — built on Chutes, five touchpoints
8. Close — repo, live app, demo

Format is 4:5 portrait because LinkedIn document posts letterbox 16:9 badly on
mobile — the pitch deck's own slides could not be used as-is.

## Known issues in source screenshots

- `REAME` (typo for README) is baked into the demo data on every populated
  screenshot in `kawan/docs/screenshots/` — including the ones in the public
  README. No source file contains the string; it was typed when the screenshots
  were recorded. Fixing it needs fresh captures.
- `flow-5-workspace.png` and `flow-7-completion.png` carry blur/dim overlays and
  are not usable as clean product shots.

The carousel avoids both — it uses only `flow-3-companion`, `flow-4-checkin`
(cropped above the chips) and `flow-1-compose` (empty form).
