import { gsap } from "./gsap";

/**
 * Shared, smoothed scroll velocity (px/s, signed: + scrolling down).
 * One ticker for every kit that reacts to scrolling (reels, pop filter…).
 */
let vel = 0;
let lastY = 0;
let started = false;

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  lastY = window.scrollY;
  gsap.ticker.add((_t, dtMs) => {
    const dt = Math.min(0.05, Math.max(0.001, dtMs / 1000));
    const y = window.scrollY;
    const v = (y - lastY) / dt;
    lastY = y;
    vel += (v - vel) * 0.12;
  });
}

export function scrollVelocity() {
  start();
  return vel;
}

/** true while the element's pinned scene is on (or next to) the screen */
export function isLive(el: Element | null) {
  const sc = el?.closest(".scene, .listen, .footer");
  return !sc || !sc.classList.contains("scene") || sc.classList.contains("is-live");
}
