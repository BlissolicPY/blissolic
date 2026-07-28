# Project Context

## Overview
Static linktree-style page for **Blissolic** (`youtube.com/@Blissolic`, ~25.7K subs), the user's own
channel. Destined for **blissolic.com** so it can go in his Discord bio. Sibling of the
`Jona Website` project and a deliberate port of it — same layout, same JS, same interactions,
palette re-derived from a different avatar.

No build step, no deps, no API keys — open `index.html` or serve the folder.

## Current State
Complete and working. **Nothing blocks launch**: `discord.gg/bliss` was verified live against
Discord's invite API (guild "Blissolic's Community", ~1,982 members, `expires_at: null` =
permanent). X and TikTok both resolve. Only step left is pointing blissolic.com at it.

(An earlier draft of this file said "unlike the Jona site, nothing blocks launch" — that was wrong.
The Jona site's "dead invite" blocker turned out to be a false premise and `discord.gg/jona` is also
live and permanent. Both sites are shippable.)

## Where We Left Off
2026-07-14 — built from scratch this session as a port of `../Jona Website`. Everything wired and
visually verified against the original at identical viewport size.

Next concrete step: deploy to blissolic.com. Nothing else outstanding.

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
  is Senkhi's own (`assets/notorious.mp3`, 1:57), so there is no embed policy to fight, no API for
  an adblocker to kill, and real control over the element; `player.js` is about half the size of
  the YouTube version as a result. `preload="none"` keeps 1.8MB off the wire until someone enters.
  Volume still uses the perceptual curve (`pos^2.2`), because `audio.volume` is linear amplitude
  exactly like YouTube's was.

## Decisions & Rationale

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
