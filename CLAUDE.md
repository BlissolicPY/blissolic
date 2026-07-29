# Project Context

## Overview
Static linktree-style page for **Blissolic** (`youtube.com/@Blissolic`, ~25.7K subs), the user's own
channel. Destined for **blissolic.com** so it can go in his Discord bio. Sibling of the
`Jona Website` project and a deliberate port of it — same layout, same JS, same interactions,
palette re-derived from a different avatar.

No build step, no deps, no API keys — open `index.html` or serve the folder.

## Current State
Deployed and reachable. **Live at `https://blissolicpy.github.io/blissolic/`** (GitHub Pages, repo
`BlissolicPY/blissolic`, source `main` @ `/`, HTTPS enforced) — verified 200 on 2026-07-29. All
links resolve: `discord.gg/bliss` was verified live against Discord's invite API (guild "Blissolic's
Community", ~1,982 members, `expires_at: null` = permanent); X and TikTok resolve too.

Two things outstanding, both new on 2026-07-29:
1. **`blissolic.xyz` does not resolve** — DNS lookup fails and Pages reports `"cname": null`, yet
   `canonical`, `og:site_name` and the footer all already claim that domain (commit `8811e51`).
2. **A measured performance problem** — see "Performance" below. Not fixed.

(An earlier draft of this file said "unlike the Jona site, nothing blocks launch" — that was wrong.
The Jona site's "dead invite" blocker turned out to be a false premise and `discord.gg/jona` is also
live and permanent. Both sites are shippable.)

## Where We Left Off
2026-07-29 — a visitor reported the site "felt a little laggy" and that a tile's glow arrived late
while he was already hovering it. Diagnosed and confirmed; **no code was changed this session**.
Files touched: `CLAUDE.md` and `.claude/memory/` only.

2026-07-29 (later) — two visitor-facing changes, both applied and pushed:
- **Track replaced with a 0:38 segment of the same song** (`Notorious - Senkhi.mp3` off the user's
  Desktop). Stream-copied so there's no second-generation encode, Adobe XMP tag block stripped, and
  a Xing header written — the old file had none, so ffprobe had to estimate duration from bitrate.
  603KB down from 1.9MB. `src` is `assets/notorious.mp3?v=2`: the filename never changes, so
  without the query a browser and the Pages CDN both keep serving the old cut. **Bump it every time
  the file is replaced.** No gain applied — the two cuts are 0.5 dB apart (−13.1 vs −12.6 dB mean)
  and both peak at 0.0 dBFS, so any boost clips.
- **Tile text legibility.** See the entry under Decisions.
- **Tile order is the user's, not a design call**: YouTube, TikTok, X, Discord, business email.
  Moving a tile means moving its `--i:` too — that's the reveal stagger, and out of sequence the
  entrance animates in a different order than the eye reads.

Next concrete steps, in order:
1. Apply the perf fixes listed under "Performance" — the bats first, they're worth more than
   everything else combined.
2. Re-measure with the same harness to prove the fix rather than assume it.
3. Point `blissolic.xyz` at the Pages site (register/DNS + set the custom domain in Pages), or
   change `canonical`/`og:site_name`/footer back to the github.io URL until it exists.
4. The `blissolic.com` header comments in `main.js`, `player.js`, `bats.js`, `style.css` are stale
   — the domain is `.xyz` now.

Earlier: 2026-07-14 built from scratch as a port of `../Jona Website`; 2026-07-28 per-tile counts +
cursor trail + background photo; 2026-07-29 the noir rebuild and the page-view counter.

## Performance (measured 2026-07-29, NOT yet fixed)

Headed Chrome 150, 1920x889, CPU throttled 6x via CDP `Emulation.setCPUThrottlingRate` to stand in
for a weaker machine, pointer sweeping the tile stack. **Baseline 19.6 fps / 48.5 ms median frame**
— at 48 ms a frame, `:hover` lands 3+ frames late, which is precisely the reported symptom. One
suspect disabled at a time, same page, no reload:

| config | fps | median |
|---|---|---|
| baseline | 19.6 | 48.5 ms |
| no grain | 20.3 | 48.5 |
| no backdrop-filter | 23.2 | 36.3 |
| no scanlines+vignette | 29.7 | 30.3 |
| no `.photo` blur(2px) | 36.4 | 24.3 |
| no cursor glow | 37.0 | 24.3 |
| no auroras | 37.8 | 24.3 |
| **no bats** | **48.5** | **18.2** |
| everything off | 83.0 | 12.1 |

- **The bats dominate.** 20 `.bat-fall`, each an `<svg>` carrying `blur() + 2x drop-shadow()`, with
  the wing paths animating *inside* that filter — so all three filters re-rasterise on the main
  thread every flap frame, twenty times over, plus 20 promoted layers from `will-change`.
- **The costs do not sum.** Removing any single full-screen layer from `.bg` roughly doubles fps,
  because `.bg` is a 7-layer stack containing a 4x-viewport `mix-blend-mode: overlay` grain and the
  auroras animate forever, so the whole stack recomposites every frame. That's also why `grain` and
  `backdrop-filter` look cheap alone — they're carried by the stack, not separate from it.
- **The cursor glow is why it's worst while hovering.** `mix-blend-mode: screen` on a moving element
  forces the region beneath it to recomposite on every pointermove. 26px element, 1.9x frame cost.
- Never trust "works fine here": this machine is an RTX 3080 at 165 Hz and measures a flat 60+ fps
  unthrottled. Frame deltas quantise to 6.06 ms, so p50 48.5 ms is 8 dropped vsyncs, not noise.

Planned fixes (none applied): bake the bat rim/shadow into the SVG instead of CSS filters; cut the
aurora blur radius and drop its animated `scale`; pre-blur `bg.jpg` and drop `.photo`'s `blur(2px)`;
shrink `.grain` from `inset:-50%` to 1x viewport.

## Key Files
- `index.html` — the whole page; `og:image` absolute (YouTube CDN) and **no** `og:url`, both
  inherited from the Jona site on purpose (see Decisions).
- `main.js` — live sub-count fetch + `abbreviate()`.
- `style.css` — palette custom properties.
- `assets/pfp.jpg` — the 900x900 avatar the palette was derived from.

## The noir rebuild (2026-07-29)

Re-themed around bats at the user's request. New avatar (`assets/pfp.gif`, animated — Batman on a
rooftop), new background (`assets/bg.jpg`, a moon over stylised water), a local music track, an
intro gate, and bats replacing the sibling sites' leaves/warp.

- **The palette is greyscale because the sources are.** The background has **zero** chromatic
  pixels — 59.45% pure `#000000` and 37.02% near-white `#FAFAFA`, with nothing else above 1%. The
  avatar is 93% achromatic, and every chromatic pixel it has sits in one 10-degree bin, H190-199:
  the cold halo round the moon. So: greys, plus exactly two sampled accents — bone-cream moonlight
  (`#A7977F`) and that teal. Any other colour would be invented and would look it.

- **`brightness(0.42)` on the background, the most aggressive of any site here.** With 37% of the
  frame at L98, white text over the moon is unreadable at anything near full strength. Dimming it
  to a mid grey also turns the moon into a halo behind the avatar, which is the best thing the
  image does. No `saturate()` — there is nothing to desaturate and it would only tint JPEG noise.
  Measured: mean luma 15.2 (the family runs 33–40) and centre-to-corner range 31.8 (the highest of
  the five). Both are properties of a 59%-black source, not faults.

- **The bats are moonlit, not black.** First attempt painted them in the page's blacks on the logic
  that a bat is a silhouette — and they vanished, because a silhouette only reads against a *lit*
  sky and this page is mostly pure black. They are greys and bone now, with two drop-shadows doing
  opposite jobs: a dark one so they separate when crossing the moon, a bone glow so they read over
  the black. Wings are separate paths scaled independently around the body, which is what makes it
  read as flight rather than a shape wobbling.

- **The player drives a LOCAL file, not a YouTube iframe** — unlike every sibling site. The track
  is Senkhi's own (`assets/notorious.mp3`, a 0:38 segment since 2026-07-29; was the full 1:57), so
  there is no embed policy to fight, no API for
  an adblocker to kill, and real control over the element; `player.js` is about half the size of
  the YouTube version as a result. `preload="none"` keeps it off the wire until someone enters.
  Volume still uses the perceptual curve (`pos^2.2`), because `audio.volume` is linear amplitude
  exactly like YouTube's was.

## Decisions & Rationale

- **Tile text was measurably unreadable, not just "a bit dim" (fixed 2026-07-29).** The handle line
  (`.tile__sub`) sat on `--text-faint` = 0.34 alpha, weight 300, 12.5px. Sampled from a real
  screenshot — glyph core vs the tile substrate (mean sRGB 34.5) — that is **2.92:1**, against a
  4.5:1 WCAG AA minimum for small text. Three things were wrong at once, so all three moved: alpha
  crosses 4.5:1 at 0.47 and the new `--text-soft` = 0.72 measures **8.10:1** (AAA); weight 300 is
  spindly in Outfit at this size, now 400; 13.3px with +0.012em tracking, because small type wants
  slightly positive tracking while the 16px title above still tracks negative.
  - Hover on the handle now goes to full white. It was `--text-dim` (0.58), which against the new
    0.72 base would have been a step *down* — hovering would have dimmed the thing you're reading.
  - `--text-faint` is now glyph-only. The count moved to `--text-dim` at weight 600, the arrow to
    0.46 (4.3:1) — an affordance, not decoration, and next to a brighter handle 0.34 read as a smudge.
  - The email is the width constraint: 27 chars, no ellipsis wanted. It fits with 44px spare at a
    360px viewport, so the phone override only needed 0.74 → 0.80rem (0.74rem was 11.8px, under the
    ~12px floor where small type stops being comfortable).

- **Per-tile follower counts (added 2026-07-28).** YouTube 25.6K, Discord members, TikTok and X
  followers, live and on the same 5-minute timer as the hero pill.
  - Sources, all keyless: Discord's own invite API (`/api/v10/invites/bliss?with_counts=true` →
    `approximate_member_count`), and mixerno's `tiktok-user-counter` / `twitter-user-counter`.
    Identity was confirmed on each (`user.name = "Blissolic"`) rather than assumed from the handle.
  - **CORS must be tested from the page, not from a terminal.** Discord returns no
    `Access-Control-Allow-Origin` header to a PowerShell probe because that request carries no
    `Origin` — it looked dead and isn't. All four were re-verified with `fetch()` from the live
    origin.
  - **mixerno returns TikTok's count as a STRING** (`"1706"`). The existing `Number.isFinite`
    guard silently dropped it, so every reader now goes through `Number()` first.
  - **Under 10,000 prints in full with separators** (`1,875`), only larger counts get abbreviated.
    Abbreviating small numbers gives "1.02K" for 1,028, which reads worse than the real figure.
  - The YouTube tile reuses the hero pill's fetched number instead of requesting again, so the two
    can never disagree.
  - A source that is dead on first load hides its slot (`[data-state="dead"]`) rather than sitting
    on an em dash; one that rots mid-session keeps the last good number.

- **Cursor trail (`cursor.js`) leaves the native cursor visible.** Hiding it and drawing a dot is
  the fashionable version and it is worse — people lose the pointer, text-selection and link
  affordances vanish, and any frame drop makes the page feel broken. This is a lagging glow behind
  the real pointer instead.
  - The "motion blur" is **squash-and-stretch, not a blur filter**: the glow is rotated to face the
    direction of travel and stretched along it in proportion to speed, with `scaleY = 1/√scaleX` so
    the area stays roughly constant. A filter alone just looks out of focus.
  - Disabled entirely on `(pointer: coarse)` and `prefers-reduced-motion`, `pointer-events: none`
    so it can never eat a click, and the rAF loop **parks itself** once the glow settles so an idle
    tab costs nothing.
  - `mix-blend-mode: screen` so it lifts off the dark page instead of greying it.
  - Note: headless Chromium throttles rAF to ~1fps when nothing forces a paint, so this cannot be
    verified by evaluating transforms in Playwright — check it in a real browser.

- **Background photograph (`assets/bg.jpg`, added 2026-07-28)** — a ringed planet over mountains,
  supplied by the user, exported 1400x788 / q80 (130KB). Sampled the same way as the avatar and it
  needed **no accent changes at all**: 58.9% of its chromatic pixels fall in H240–269 against
  `--lilac-300` at H264, and its H320–339 magenta band is exactly where `--rose-300` already lived.
  Layers are `.photo` (the image) → auroras → `.scrim`, inside `.bg`.
  - `aurora--2` was **deleted** — it was doing the same job as the photo's own violet and only
    muddied it. `aurora--1` and the rose `aurora--3` survive at 0.22 / 0.12, just to keep some
    drift alive behind a still image.
  - Tiles lifted from `0.035 / 0.08` to `0.05 / 0.10`; they need more separation over a photograph
    than over a flat ambient (same finding as the Dewier build).
  - **Photo brightness is 0.92 here vs 0.66 on the Mango site** — the opposite problem: a huge
    unlit planet disk fills the middle of the crop, so identical darkening measured 12 points
    below this page's own baseline. Numbers: mean luma 33.3 (baseline 40.0), tile-to-gap delta
    52.1 (27.3), backdrop behind tiles 23.9 (18.4).
  - Scrim is **vertical and sized in `rem`, not `%`** — the card is 27.5rem at every viewport, so
    a percentage ellipse covers it on desktop and shrinks off it on a phone.

- **`style.css` is referenced as `style.css?v=2`.** Without it, browsers hold the old stylesheet
  and a redesign silently doesn't appear — this cost a wrong "the background isn't showing"
  diagnosis during the build. **Bump the number whenever style.css changes.**

- **Palette is sampled, not chosen.** Re-derived from `assets/pfp.jpg` with `System.Drawing`
  bucket quantisation (4 bits/channel, mean colour per bucket), measured over the **inscribed
  circle** — that's what viewers actually see, since YouTube crops avatars round. Plum `#654A6B`
  is the single most common bucket at 16.24%; `#150C16` is the darkest well-represented colour and
  became the page background. Don't retune by taste; re-derive if the avatar changes.

- **Rose is the spice, and that's measured.** A hue histogram over the circle put the rose family
  (H320–359) at **20.5% of all chromatic pixels** — a real second hue, the rim light. The coral
  blob on the left was only 0.77%, too rare to build on. So `--rose-300 #DBA6B7` plays exactly the
  role Jona's cyan fringe does.

- **The ambient is plum; the lilacs are accents only.** The first build washed the auroras in
  `--lilac-300` at 0.5 alpha and the page came out a flat mid-purple with the sub count barely
  separating from its background. Cause: this avatar has **no saturated mid-tone** — its mid-tones
  are desaturated mauve (S13–15 at L41–47) and all its chroma lives in the highlights (S55 at
  L70). Jona's ambient works because his greens are S31–43 *at* L46. So the plums (L32–35) carry
  the ambient and the lilacs are reserved for small bright elements. If the page ever looks flat,
  this is the knob — not the accent colours.

- **Sub count truncates, not rounds** (`25,673` → `25.6K`). Inherited from the Jona site: YouTube
  floors, so rounding would read as inflated next to the channel itself.

- **The fallback chain is NOT lossless here — unlike Jona's.** That claim was precision-dependent
  and does not carry over. At 109K the pill renders 0 decimals, so a ~950 spread between sources is
  invisible. At 25.7K it renders **1 decimal and moves every 100 subs**, so the sources visibly
  disagree: socialcounts returns 25700 (YouTube's own floored figure → matches the channel page
  exactly) while mixerno's live estimate 25673 renders `25.6K`, a notch low. socialcounts stays
  **first** for that reason. This stops mattering again above 100K.

- **`FALLBACK = 25_700`, not the live number.** It's YouTube's floored figure, so a fully dead
  chain still renders what the channel page shows. Seeding it with the live estimate would print
  `25.6K` forever.

- **`abbreviate()` floors in the integer domain** (`n * f / v`), not on the scaled float
  (`scaled * f`). The float path drops a whole notch whenever the scaled value lands just under an
  exact decimal — `1.13 * 100` is `112.99999999999999`, so it prints `1.12K` for 1130. Brute-forced
  1k–5M: 97 inputs disagree, all in the dp=2 bands (1K–9.99K and 1M+). **Zero** in the current
  10K–99.9K band, so this is latent today and bites at 1M. The Jona site still has the float
  version; it's harmless at 109K but worth porting back if that channel nears 1M.

- **The `> 0` guard on the count is load-bearing.** These scraper APIs rot: mixerno's `subscribers`
  silently went to `0` within hours during the Jona build. If the count looks broken, re-test each
  endpoint before touching code.

- **og:image is absolute (YouTube CDN) and og:url is omitted.** Crawlers don't resolve relative
  paths and don't run JS, so a self-hosted og:image breaks previews on every tunnel host before the
  domain is live; omitting og:url makes crawlers fall back to the requested URL, so embeds stay
  correct everywhere.

- **TikTok's tile is cyan `#25F4EE`, not its red `#FE2C55`.** The red collides with YouTube's tile
  two rows up and with the rose already in the palette. Cyan is the only tile accent that's
  distinct from everything else on the page.

## Gotchas
- **youtube.com/@handle serves a consent wall to this machine** ("Before you continue to YouTube"),
  and the `CONSENT`/`SOCS` cookies did not defeat it. Use the InnerTube API instead — that's how the
  channel ID here was resolved:
  ```
  POST https://www.youtube.com/youtubei/v1/navigation/resolve_url?key=AIzaSyAO_FJ2SlqU8Q4STEHLGCilw_Y9_11qcW8
  body: {"context":{"client":{"clientName":"WEB","clientVersion":"2.20240101.00.00","hl":"en","gl":"US"}},"url":"https://www.youtube.com/@Blissolic"}
  -> endpoint.browseEndpoint.browseId  = UC2KjRb9JQ9yAEIw8HMFUENg
  ```
  Swap `resolve_url` for `browse` with `{"browseId":"UC..."}` to get title, description and avatar.
