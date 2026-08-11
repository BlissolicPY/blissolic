# Project Context

## Overview
Static linktree-style page for **Blissolic** (`youtube.com/@Blissolic`, ~25.7K subs), the user's own
channel. Destined for **blissolic.com** so it can go in his Discord bio. Sibling of the
`Jona Website` project and a deliberate port of it — same layout, same JS, same interactions,
palette re-derived from a different avatar.

No build step, no deps, no API keys — open `index.html` or serve the folder.

## Current State
**Live at `https://blissolic.xyz/`** — the domain was registered at **Porkbun** on 2026-07-29 and
now serves the Pages site: four apex `A` records to `185.199.108-111.153`, the tracked `CNAME` file
holds `blissolic.xyz`, Pages `cname` is set and HTTPS is enforced with an approved certificate.
`http://` 301s to `https://`, and the old `blissolicpy.github.io/blissolic/` 301s to the apex, so
every link handed out before this still works. Verified in a real browser: 200, no failed requests,
CSS/atlas/audio all load, counts live.

- **`www.blissolic.xyz` is the one loose end**: it needs a `CNAME` record on host `www` pointing at
  `blissolicpy.github.io`. Porkbun refuses a CNAME on the root (RFC — the apex has A records), which
  is the mistake to avoid; the record goes on `www`, not on blank.
- The certificate took ~3.5 minutes after the domain was set to become usable. Before that, HTTPS
  fails with a trust error rather than a 404 — that is normal, not a misconfiguration.

Previously live at `https://blissolicpy.github.io/blissolic/` (GitHub Pages, repo
`BlissolicPY/blissolic`, source `main` @ `/`, HTTPS enforced) — verified 200 on 2026-07-29. All
links resolve: `discord.gg/bliss` was verified live against Discord's invite API (guild "Blissolic's
Community", ~1,982 members, `expires_at: null` = permanent); X and TikTok resolve too.

Both of the things that were outstanding earlier on 2026-07-29 are now **done**: the domain resolves
and serves (above), and the performance problem is fixed and measured (see "Performance"). The only
remaining item is the `www` CNAME record.

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
- **Tile order is the user's, not a design call**: YouTube, TikTok, X, Discord, business email,
  NameMC. Moving a tile means moving its `--i:` too — that's the reveal stagger, and out of
  sequence the entrance animates in a different order than the eye reads.

2026-07-29 (later still) — **the performance work is done and measured**; see "Performance" below.
`assets/bats.webp` and `assets/bg-baked.jpg` are new, `quality.js` is new.

2026-07-29 (last) — **`blissolic.xyz` is registered and live**, HTTPS enforced. See Current State.

2026-07-29 (after that) — five fixes off the back of using the live site:
1. **The phone bug**: tapping "click anywhere to enter" opened a random link. Cause and fix under
   Decisions; it was `pointer-events: none` on the leaving gate, and desktop could not reproduce it.
2. **Music down 15%** — `VOLUME_DEFAULT` 28 -> 24 in `player.js`. Because of the 2.2 curve that is
   amplitude 0.0608 -> 0.0433, i.e. **-2.95 dB / 29% quieter**, not 15% quieter. If 15% *quieter*
   was meant rather than 15% off the control, the value is 26. Nothing is written to storage until a
   visitor moves the slider, so returning visitors get the new default too.
3. **Link-preview text** is `All of Blissolic's links in one place.` on all three description tags.
   The page's own bio line still reads "interrogating and exposing" — only the embed changed.
4. **Embed accent bar** now the page's near-black via `theme-color`.
5. **Embed thumbnail** now the site's actual avatar, self-hosted at `assets/og.jpg`.

2026-08-11 — **a NameMC tile was added**, last in the list, on the same day and in the same shape
as the Senkhi and Delpog pages. See the entry under Decisions. The workspace folder was also renamed
back to `Blissolic Website`: a mis-escaped `mv` had left it as a literal `\`, so the backup repo saw
all 28 tracked files as deleted and the Delpog project doc recorded this site as "not present on
this Mac".

Next concrete steps, in order:
1. Add the `www` CNAME at Porkbun (host `www` → `blissolicpy.github.io`). Not on the root — Porkbun
   rejects that, correctly. The bare domain works either way; this only adds `www.`.
2. Repost the link in Discord with a query string (`https://blissolic.xyz/?1`) to confirm the new
   preview — Discord caches embeds per URL, so an already-posted link keeps the old thumbnail.
3. The `blissolic.com` header comments in `main.js`, `player.js`, `style.css` are stale — the domain
   is `.xyz` now. (`bats.js` and `quality.js` say `.xyz`.)
4. Open question worth a decision: the music default is now 15% off the *control* (28 → 24, about
   3 dB). If it should be 15% quieter in amplitude instead, the value is 26.
5. Nothing else is outstanding. Both sites are live, measured, and match on every shared decision
   except the effects each one actually has (bats vs leaves, email tile, one-screen layout).

Earlier: 2026-07-14 built from scratch as a port of `../Jona Website`; 2026-07-28 per-tile counts +
cursor trail + background photo; 2026-07-29 the noir rebuild and the page-view counter.

## Performance (diagnosed and FIXED 2026-07-29)

A visitor reported the page felt laggy and that a tile's glow arrived late. Real, reproduced, and
now fixed. The whole problem was one shape: **effects that re-rasterise every frame**, rather than
effects that are drawn once and then composited.

### Result

Headed Chrome, 1920x889, CPU throttled **8x** via CDP, pointer sweeping the tile stack for ~7s
after the swarm settles. Three passes per arm, alternating, medians reported. "before" is the
previous commit served from a pinned copy so both arms run under identical machine load:

| arm | fps | p50 | frames >25 ms |
|---|---|---|---|
| before | 11.8 | 78.8 ms | 100% |
| after, identical visuals (`?q=high`) | 18.2 | 54.5 ms | 99% |
| after, quality ladder deciding | **31.2** | **30.3 ms** | **59%** |

And unthrottled, measuring renderer CPU seconds burned per wall second (4 passes, medians; the
arms' ranges do not overlap): **0.808 -> 0.715**, an 11.5% cut in the work the page does at
identical visuals.

### What was actually wrong

- **The bats dominated.** 20 `.bat-fall`, each an `<svg>` carrying `blur() + 2x drop-shadow()`,
  with the wing paths animating *inside* that filter — so all three filters re-rasterised on the
  main thread every flap frame, twenty times over. Killing them outright took a 6x-throttled page
  from 53.8 to 107.4 fps, more than everything else combined.
- **A scaled blur cannot be reused.** The auroras animated `scale(1 -> 1.14)` on a `blur(90px)`
  element, and the cursor glow animated `scale()` on a `blur(6px)` one. Translating a rasterised
  layer is free; scaling it forces the blur to be recomputed at the new size every frame.
- **The `.bg` stack recomposited as a unit.** Seven full-screen layers, one of them a 4x-viewport
  `mix-blend-mode: overlay` grain, with the auroras animating forever underneath. That is why the
  original one-suspect-off table looked like everything was expensive — removing any single layer
  made the blend cheaper for all of them.
- **`mix-blend-mode: screen` on the cursor glow** forced the region beneath it to recomposite on
  every pointermove, which is why it felt worst *while hovering* — the reported symptom.

### What was done

1. **Bat frames are pre-rendered** into `assets/bats.webp` (6 flap phases across, 3 variants down,
   66KB), with the rim light and shadow already in the pixels. Playback is a `steps(6, jump-none)`
   animation on `background-position`, so a flap costs a repaint of one small box at the step
   boundaries instead of three filters re-rasterising every frame. See the header of `bats.js`.
2. **`.photo`'s filter is baked into the file.** `assets/bg-baked.jpg` carries the `brightness(0.42)`
   and the 2px blur; `assets/bg.jpg` stays as the source and is no longer loaded. Verified by mean
   luma: 18.489 baked vs 18.484 filtered.
3. **Auroras translate, they don't scale.** Grain went from `inset: -50%` (4x the viewport, all of
   it blended) to `-4%`, which is all the overhang its 2% shift ever needed.
4. **Scanlines and vignette merged into one element**, two background layers, one fewer full-screen
   layer in a stack that recomposites together.
5. **The cursor glow lost both its blend mode and its filter.** Over black, `screen` and normal
   compositing produce the same result, so the blend was pure cost; the 6px blur moved into the
   gradient stops with the box grown to match.
6. **`.photo` is pinned to its own layer** with `will-change: transform`. Baking the filter out also
   removed the composited layer the filter had been forcing for free, and without it the JPEG was
   rescaled into the `.bg` stack every time the grain shifted. This measured as the single largest
   change on the MangoPlayz build.
7. **The subscriber pill's dot is gone** (user's request, 2026-07-29) — and it was an infinite
   `box-shadow` animation, i.e. a repaint every frame, so it was also the cheapest win here.
8. **`quality.js`** — see below.

### Method notes (they cost time to re-learn)

- **Never trust "works fine here."** This machine is an RTX 3080 at 165 Hz and measures a flat 60+
  fps no matter what is broken. Everything above is CDP CPU throttling.
- **A single-pass one-suspect-off table is not trustworthy.** Re-running the original 6x table
  produced *monotonically worsening* numbers in the order the cases ran — "no cursor glow" appearing
  to be slower than baseline — because page state and machine load drift across a session. Only the
  bats survived as a real signal. Trustworthy comparisons need **alternating arms and medians of
  repeated passes**, which is what the result table above is.
- Frame deltas quantise to the refresh interval (6.06 ms at 165 Hz), so a p50 of 42 ms is seven
  dropped vsyncs, not a noisy average.
- `?q=high|mid|low` pins a quality tier, which is how each rung gets looked at and how before/after
  compare like with like.
- **fps was too noisy on this machine to resolve 10-20% effects** once several local servers and a
  headed Chrome were competing for cores; one bisect had the same arm swing 11 -> 20 fps between
  passes. The instrument that worked is **renderer CPU seconds per wall second** from CDP
  `Performance.getMetrics` (`ProcessTime` delta / `Timestamp` delta), unthrottled. It measures the
  work the page costs rather than what the machine happened to have spare, and its arm ranges came
  out disjoint where fps ranges overlapped completely.
- **Verify the stylesheet actually parsed.** A comment edit here left prose outside a `/* */` pair,
  which made Chrome drop the whole `.photo` rule — so the background image silently stopped
  rendering and a full round of "after" measurements was quietly measuring a page with one less
  full-screen layer. Two checks now exist: `/*` and `*/` counts must match in `style.css`, and
  `[...document.styleSheets].find(...).cssRules` must contain the selectors you edited.

## Adaptive quality (`quality.js`, added 2026-07-29)

Sets `data-q` on `<html>` to `high`, `mid` or `low` and fires `mp:quality` on change. CSS reads it
for the effects it owns; `bats.js` reads it for how many bats to spawn.

- **It measures rather than sniffs.** Static hints (`hardwareConcurrency <= 4`, `deviceMemory <= 4`,
  `pointer: coarse`) only choose a *starting* tier — `hardwareConcurrency` says nothing about the
  GPU and a phone with eight cores can be thermally throttled to a crawl. The real decision comes
  from the p50 of ~50 real frames, sampled 2.6s after entry and again at 11s.
- **p50, not mean**: one 300ms stall from a font swap would drag a mean under the threshold and
  condemn a machine that is fine.
- **It only ever goes down.** A page that quietly drops an effect reads as "this is how it looks";
  one that adds effects back mid-visit reads as broken, and a wrong upgrade oscillates.
- **The probe waits 2.6s.** The reveal and the 70-bat swarm are the heaviest two seconds the page
  ever has; judging on those would downgrade a machine that holds 60fps for the rest of the visit.
- Tiers: **mid** drops the grain and thins the backdrop blur to 8px, and halves the bats; **low**
  stops the auroras, drops backdrop-filter entirely (it re-blurs whenever anything moves behind it),
  kills the cursor trail and the drift bats, and lifts `--tile-bg` to give back the separation the
  glass was providing.

## Key Files
- `quality.js` — the adaptive quality tier. Load it FIRST; everything else reads `data-q`.
- `assets/bats.webp` — the pre-rendered flap atlas. Regenerate it if the silhouette or either glow
  changes; the generator is described in the header of `bats.js`, and the glow radii in it are baked
  per row for the size that row renders at (a baked glow scales with the sprite, a CSS one did not —
  getting this wrong turned the big foreground bats into glowing clouds on the first attempt).
- `assets/bg-baked.jpg` — the background with its filters already applied. `assets/bg.jpg` is the
  source; nothing loads it.
- `assets/og.jpg` — the link-preview thumbnail: frame one of `pfp.gif`, padded square. Regenerate it
  if the avatar changes, or every Discord/Twitter preview keeps showing the old one.
- `assets/notorious.mp3` — the track. `?v=` on its `<audio src>` must be bumped when it is replaced.
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

- **og:image is self-hosted now that the domain is live; og:url stays omitted.** It used to point at
  the YouTube CDN, because crawlers don't resolve relative paths and don't run JS, so an absolute URL
  on a domain that didn't answer would have broken every preview. That CDN still serves the **old**
  avatar, which is why Discord's thumbnail stopped matching the site after the noir rebuild. It is
  `https://blissolic.xyz/assets/og.jpg` now — frame one of `pfp.gif`, padded square in the page's own
  black (the GIF is 500x400, so scaling it square would have stretched it). Not the GIF itself: not
  every client animates one and some show a broken thumbnail instead.
  - Omitting og:url still stands — crawlers fall back to the requested URL, so embeds stay correct
    on preview hosts as well as the live domain.
  - **Discord caches embeds per URL.** A changed og:image will not appear on a link already posted;
    posting the URL with any query string (`?1`) forces a fresh fetch.

- **`theme-color` is the Discord embed's accent bar.** It was `#A7977F`, the bone accent, which read
  as a beige stripe against a dark embed. It is `#0B0B0B` now — the page's own near-black.

- **The intro gate must stay hit-testable while it fades.** `.gate.is-leaving` used to set
  `pointer-events: none`, and on a phone that made "tap anywhere to enter" open a random link: a tap
  fires `touchstart`, the gate dismisses, and the browser then synthesises the mouse/`click` from
  that same tap — by which point the gate no longer hit-tested, so the click fell through to
  whichever tile was under the finger. **Desktop never reproduced it**, which is why it shipped.
  Fixed two ways: the gate keeps `pointer-events` for its 0.6s fade, and the dismiss handler calls
  `preventDefault()` on touch input (with `passive: false`, or the call is ignored) so no
  compatibility click is generated at all. Reproduced and verified with CDP
  `Input.dispatchTouchEvent`: shipped build opened a YouTube tab on tap, fixed build opens nothing.

- **TikTok's tile is cyan `#25F4EE`, not its red `#FE2C55`.** The red collides with YouTube's tile
  two rows up and with the rose already in the palette. Cyan is the only tile accent that's
  distinct from everything else on the page.

- **NameMC's tile is Minecraft's UI gold `#FFAA00` and it sits last (added 2026-08-11).** His IGN is
  `blissolic` — the Mojang lookup returns it cased `Blissolic`, and namemc.com is case-insensitive,
  so the link is `namemc.com/profile/blissolic`. Three calls worth keeping. It goes **below the
  business email** because the owner's own framing was that NameMC is not that important. The accent
  is gold rather than the obvious grass green because gold was the one warm hue free in all three of
  the pages that got this tile — Senkhi's beam green is that page's single accent, and Delpog already
  carries Spotify's — so one colour serves the whole family instead of three near-greens. And the
  sub line reads `blissolic · Minecraft` rather than the bare name, because three other tiles here
  already have a sub that is some form of @blissolic. The glyph is a hand-built isometric block,
  three inset quads in one 24×24 fill path, matching the other brand marks' fill-not-stroke style.
  **namemc.com cannot be fetched to check the link** — it answers curl with a Cloudflare "Just a
  moment..." challenge. Verify an IGN with `api.mojang.com/users/profiles/minecraft/<name>`, which
  returns the UUID and the canonical casing.

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
