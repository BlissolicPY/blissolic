/* blissolic.com — the bat swarm on entry, and the bats that drift down after.

   Both hooked to the `mp:enter` event the inline gate script fires, never to a
   click handler of their own: the gate has to stay independent of every other
   file, and this is pure decoration — if it never runs, nothing breaks.

   The sibling sites blow leaves across (MangoPlayz) or jump to lightspeed
   (Senkhi). This one is bats, because the page is bats. Everything is transform
   + opacity so it all stays on the compositor. */

(() => {
  "use strict";

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* A bat silhouette with separated wings, so the flap reads at small sizes.
     Drawn as three paths rather than one: body, left wing, right wing — the
     wings are scaled independently by the flap animation, which is what makes
     it look like flight rather than a shape wobbling. */
  const BAT = `<svg viewBox="0 0 64 32" aria-hidden="true">
    <g fill="currentColor">
      <path class="bat__wing bat__wing--l" d="M32 16c-4-7-9-11-15-12-3 0-5 2-8 1 2 3 1 6-2 8 4 0 6 2 7 5 3-3 7-3 11-1 3 1 5 1 7-1z"/>
      <path class="bat__wing bat__wing--r" d="M32 16c4-7 9-11 15-12 3 0 5 2 8 1-2 3-1 6 2 8-4 0-6 2-7 5-3-3-7-3-11-1-3 1-5 1-7-1z"/>
      <path d="M32 9c1.6 0 2.8 1.2 3.2 2.8l1.4-1.6.2 2.4 1.8-.8-1 2.4c.8 2.6-.2 5.4-2.4 7.2L32 24l-3.2-2.6c-2.2-1.8-3.2-4.6-2.4-7.2l-1-2.4 1.8.8.2-2.4 1.4 1.6C29.2 10.2 30.4 9 32 9z"/>
    </g>
  </svg>`;

  const rand = (min, max) => min + Math.random() * (max - min);

  /* Two different jobs, so two different palettes.

     The SWARM crosses above the gate while the overlay is still fading, over
     whatever happens to be behind it — so those stay moonlit greys, which read
     anywhere.

     The DRIFT is the background layer and is meant to look like real bats over
     a night sky, so those are black. Black on a 59%-black page would normally
     vanish; what saves it is the rim — see the bone drop-shadow on .bat-fall in
     style.css. The silhouette stays dark, its EDGE catches the moon. */
  const SWARM_TINTS = ["#8F8475", "#979797", "#767676", "#A7977F"];
  const FALL_TINTS = ["#000000", "#050505", "#0B0B0B", "#131313"];

  /* ---------- the swarm that crosses on entry ---------- */

  const SWARM = 70;

  function swarm() {
    const frag = document.createDocumentFragment();

    for (let i = 0; i < SWARM; i++) {
      const bat = document.createElement("span");
      bat.className = "bat";
      bat.setAttribute("aria-hidden", "true");

      /* Three depth bands. The foreground ones are the whole effect: big, fast
         and blurred, they read as bats passing the camera rather than a flock
         pasted on the wallpaper. */
      const roll = Math.random();
      const size =
        roll < 0.16 ? rand(110, 210) :
        roll < 0.58 ? rand(48, 100)  :
                      rand(22, 46);

      const far = 1 - Math.min((size - 22) / 188, 1);

      bat.style.setProperty("--top", `${rand(-12, 100)}vh`);
      bat.style.setProperty("--size", `${size.toFixed(0)}px`);
      // near bats cross fast, distant ones lag — parallax, so the depth reads
      bat.style.setProperty("--dur", `${(rand(1.1, 1.6) + far * 1.2).toFixed(2)}s`);
      bat.style.setProperty("--delay", `${rand(0, 0.5).toFixed(2)}s`);
      bat.style.setProperty("--drift", `${rand(-24, 18)}vh`);
      bat.style.setProperty("--op", (0.96 - far * 0.35).toFixed(2));
      // the big ones blur for being past the focal plane, the small for distance
      bat.style.setProperty(
        "--blur",
        `${(far * 1.6 + Math.max(0, (size - 120) / 45)).toFixed(2)}px`
      );
      bat.style.setProperty("--tint", SWARM_TINTS[Math.floor(Math.random() * SWARM_TINTS.length)]);
      // heavier things flap slower; a 200px bat at 0.18s looks like a moth
      bat.style.setProperty("--flap", `${(0.16 + size / 900).toFixed(3)}s`);

      const bob = document.createElement("i");
      bob.style.setProperty("--bob", `${rand(14, 34) + size * 0.16}px`);
      bob.style.setProperty("--bobDur", `${rand(0.42, 0.9).toFixed(2)}s`);
      bob.innerHTML = BAT;

      bat.appendChild(bob);
      bat.addEventListener("animationend", () => bat.remove(), { once: true });
      frag.appendChild(bat);
    }

    document.body.appendChild(frag);
  }

  /* ---------- the few that keep drifting down afterwards ---------- */

  const FALL_MAX = 20;
  const FALL_EVERY = 700;
  let live = 0;
  let timer = null;

  function dropBat(initial) {
    if (live >= FALL_MAX) return;
    live++;

    const bat = document.createElement("span");
    bat.className = "bat-fall";
    bat.setAttribute("aria-hidden", "true");

    const size = rand(28, 70);

    /* Start part-way down the screen with a real offset and play from 0%, NOT
       with a negative animation delay — a negative delay drops each one into
       the middle of its timeline past the fade-in, and the whole first batch
       materialises at once. Duration scales with the distance still to travel
       so one starting low doesn't crawl. */
    const y0 = initial ? rand(0, 100) : 0;
    const base = rand(9, 16);

    bat.style.setProperty("--left", `${rand(-2, 100).toFixed(1)}vw`);
    bat.style.setProperty("--size", `${size.toFixed(0)}px`);
    bat.style.setProperty("--y0", `${y0.toFixed(1)}vh`);
    bat.style.setProperty("--dur", `${(base * ((124 - y0) / 124)).toFixed(1)}s`);
    bat.style.setProperty("--delay", initial ? `${rand(0, 1.8).toFixed(2)}s` : "0s");
    bat.style.setProperty("--drift", `${rand(-10, 10).toFixed(1)}vw`);
    bat.style.setProperty("--op", rand(0.62, 0.95).toFixed(2));
    bat.style.setProperty("--blur", `${rand(0, 0.8).toFixed(2)}px`);
    bat.style.setProperty("--tint", FALL_TINTS[Math.floor(Math.random() * FALL_TINTS.length)]);
    bat.style.setProperty("--flap", `${(0.2 + size / 700).toFixed(3)}s`);

    const bob = document.createElement("i");
    bob.style.setProperty("--bob", `${rand(18, 46)}px`);
    bob.style.setProperty("--bobDur", `${rand(1.4, 3).toFixed(1)}s`);
    bob.innerHTML = BAT;

    bat.appendChild(bob);
    bat.addEventListener(
      "animationend",
      () => {
        bat.remove();
        live--;
      },
      { once: true }
    );
    document.body.appendChild(bat);
  }

  function startFalling() {
    for (let i = 0; i < 9; i++) dropBat(true);
    timer = setInterval(() => dropBat(false), FALL_EVERY);
  }

  // a backgrounded tab has nobody looking at it
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearInterval(timer);
      timer = null;
    } else if (!timer) {
      timer = setInterval(() => dropBat(false), FALL_EVERY);
    }
  });

  window.addEventListener(
    "mp:enter",
    () => {
      swarm();
      // let the swarm be the whole picture first, then settle into the drift
      setTimeout(startFalling, 1700);
    },
    { once: true }
  );
})();
