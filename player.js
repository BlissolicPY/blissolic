/* blissolic.com — "now playing" widget over a LOCAL audio file.

   The sibling sites drive a hidden YouTube iframe because they play commercial
   tracks that must not be re-hosted. This one plays Senkhi's own track from
   assets/, which changes the calculus completely: no embed policy to fight, no
   API for an adblocker to kill, no CORS, and real control over the element.

   Everything the YouTube version had to fake — duration, seeking, volume — is
   just the HTMLMediaElement API here, so this file is roughly half the size. */

(() => {
  "use strict";

  const FADE_MS = 1600;   // ramp on first play, so it never punches in

  /* Volume needs two separate things and they are easy to conflate.

     1. `audio.volume` is LINEAR AMPLITUDE, not loudness. Ears are roughly
        logarithmic, so a linear slider feels dead across its top half and then
        collapses at the very bottom. VOLUME_CURVE fixes the feel: the slider
        carries perceived loudness 0-100 and is raised to this power to get the
        amplitude the element wants.

     2. VOLUME_DEFAULT is a slider position, NOT an amplitude. 24 maps to about
        0.044 — quiet, because this is a background bed under a link page.

     Turn the whole page down by lowering VOLUME_DEFAULT alone.

     Was 28; taken down 15% to 24 on request (2026-07-29). Because of the curve
     that is a bigger cut than it looks: amplitude 0.0625 -> 0.0442, about 3 dB.
     Anyone who has already moved the slider keeps their own setting — it is
     stored per visitor, so this only changes the first-visit default. */
  const VOLUME_CURVE = 2.2;
  const VOLUME_DEFAULT = 24;

  const el = {
    root:  document.getElementById("player"),
    audio: document.getElementById("track"),
    pp:    document.getElementById("ppBtn"),
    seek:  document.getElementById("seek"),
    fill:  document.getElementById("fill"),
    knob:  document.getElementById("knob"),
    cur:   document.getElementById("tCur"),
    dur:   document.getElementById("tDur"),
    vol:   document.getElementById("vol"),
    mute:  document.getElementById("muteBtn"),
  };

  if (!el.root || !el.audio) return;

  const store = {
    get(k, fallback) {
      try {
        const v = localStorage.getItem("bl:" + k);
        return v === null ? fallback : v;
      } catch {
        return fallback;
      }
    },
    set(k, v) {
      try {
        localStorage.setItem("bl:" + k, String(v));
      } catch {
        /* nothing to remember it with */
      }
    },
  };

  const clamp = (n, lo, hi) => Math.min(hi, Math.max(lo, n));

  let volume = clamp(parseInt(store.get("vol", VOLUME_DEFAULT), 10) || VOLUME_DEFAULT, 0, 100);
  let muted = store.get("muted", "false") === "true";
  let scrubbing = false;
  let fadeId = null;

  // slider position (perceived loudness) -> the amplitude the element expects
  const amplitude = (pos) => Math.pow(clamp(pos, 0, 100) / 100, VOLUME_CURVE);

  function fmt(s) {
    if (!Number.isFinite(s) || s < 0) return "--:--";
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return m + ":" + String(r).padStart(2, "0");
  }

  /* ---------- paint ---------- */

  function paintVolume() {
    el.vol.value = String(volume);
    el.vol.style.setProperty("--vol", String(muted ? 0 : volume));
    el.root.dataset.muted = String(muted);
    el.mute.setAttribute("aria-label", muted ? "Unmute" : "Mute");
  }

  function paintProgress() {
    const d = el.audio.duration;
    const t = el.audio.currentTime;
    const pct = Number.isFinite(d) && d > 0 ? clamp((t / d) * 100, 0, 100) : 0;
    el.fill.style.width = pct + "%";
    el.knob.style.left = pct + "%";
    el.cur.textContent = fmt(t);
    el.dur.textContent = fmt(d);
    el.seek.setAttribute("aria-valuenow", String(Math.round(pct)));
    el.seek.setAttribute("aria-valuetext", fmt(t) + " of " + fmt(d));
  }

  /* ---------- volume ---------- */

  function applyVolume() {
    el.audio.muted = muted;
    el.audio.volume = amplitude(volume);
  }

  function cancelFade() {
    if (fadeId) cancelAnimationFrame(fadeId);
    fadeId = null;
  }

  function fadeIn() {
    cancelFade();
    if (muted) return applyVolume();
    const target = amplitude(volume);
    const start = performance.now();
    el.audio.muted = false;
    el.audio.volume = 0;
    const step = (now) => {
      const t = clamp((now - start) / FADE_MS, 0, 1);
      el.audio.volume = target * t;
      if (t < 1) fadeId = requestAnimationFrame(step);
      else fadeId = null;
    };
    fadeId = requestAnimationFrame(step);
  }

  /* ---------- transport ---------- */

  function play(withFade) {
    if (withFade) fadeIn();
    else applyVolume();
    // a rejected play() is not an error worth surfacing — the gate guarantees a
    // gesture, and if it still fails the controls are right there
    el.audio.play().catch(() => {});
    store.set("auto", "on");
  }

  function pause() {
    cancelFade();
    el.audio.pause();
    // a deliberate pause is remembered: the track won't ambush them next visit
    store.set("auto", "off");
  }

  el.audio.addEventListener("play", () => {
    el.root.dataset.playing = "true";
    el.pp.setAttribute("aria-label", "Pause");
  });

  el.audio.addEventListener("pause", () => {
    el.root.dataset.playing = "false";
    el.pp.setAttribute("aria-label", "Play");
  });

  el.audio.addEventListener("loadedmetadata", paintProgress);
  el.audio.addEventListener("timeupdate", () => {
    if (!scrubbing) paintProgress();
  });

  // a file that fails to load leaves no dead transport controls on the page
  el.audio.addEventListener("error", () => {
    el.root.hidden = true;
    console.warn("[player] audio failed to load");
  });

  /* ---------- seeking ---------- */

  const fractionFromEvent = (e) => {
    const r = el.seek.getBoundingClientRect();
    return clamp((e.clientX - r.left) / r.width, 0, 1);
  };

  function seekTo(f, commit) {
    const d = el.audio.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    if (commit) el.audio.currentTime = f * d;
    el.fill.style.width = f * 100 + "%";
    el.knob.style.left = f * 100 + "%";
    el.cur.textContent = fmt(f * d);
  }

  el.seek.addEventListener("pointerdown", (e) => {
    scrubbing = true;
    el.seek.setPointerCapture(e.pointerId);
    seekTo(fractionFromEvent(e), false);
  });

  el.seek.addEventListener("pointermove", (e) => {
    if (scrubbing) seekTo(fractionFromEvent(e), false);
  });

  el.seek.addEventListener("pointerup", (e) => {
    if (!scrubbing) return;
    scrubbing = false;
    el.seek.releasePointerCapture(e.pointerId);
    seekTo(fractionFromEvent(e), true);
  });

  el.seek.addEventListener("keydown", (e) => {
    const d = el.audio.duration;
    if (!Number.isFinite(d) || d <= 0) return;
    const jump = { ArrowLeft: -5, ArrowRight: 5, ArrowDown: -5, ArrowUp: 5 };
    if (e.key in jump) el.audio.currentTime = clamp(el.audio.currentTime + jump[e.key], 0, d);
    else if (e.key === "Home") el.audio.currentTime = 0;
    else if (e.key === "End") el.audio.currentTime = Math.max(0, d - 1);
    else return;
    e.preventDefault();
  });

  /* ---------- controls ---------- */

  el.pp.addEventListener("click", () => {
    if (el.audio.paused) play(false);
    else pause();
  });

  el.vol.addEventListener("input", () => {
    cancelFade(); // a hand on the slider outranks the intro ramp
    volume = clamp(parseInt(el.vol.value, 10) || 0, 0, 100);
    muted = volume === 0;
    store.set("vol", volume);
    store.set("muted", muted);
    paintVolume();
    applyVolume();
  });

  el.mute.addEventListener("click", () => {
    muted = !muted;
    if (!muted && volume === 0) volume = VOLUME_DEFAULT; // don't unmute into silence
    store.set("muted", muted);
    store.set("vol", volume);
    paintVolume();
    applyVolume();
  });

  /* ---------- entry ----------
     The gate guarantees a real user gesture before this fires, so there is no
     autoplay policy left to fight — audible playback after a click is simply
     allowed everywhere. */

  window.addEventListener(
    "mp:enter",
    () => {
      if (store.get("auto", "on") === "off") return; // they turned it off before
      if (muted) {
        applyVolume();
        el.audio.play().catch(() => {});
        return;
      }
      play(true);
    },
    { once: true }
  );

  paintVolume();
  paintProgress();
})();
