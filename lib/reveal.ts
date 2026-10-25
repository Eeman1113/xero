"use client";
import { animate, stagger, type JSAnimation } from "animejs";
import { prefersReduced } from "./motion";

/**
 * anime.js text reveals. Elements rendered by <Reveal> contain `.rv-u` units
 * (characters or words). Reveals are fired by scroll cues (see useScrollScene)
 * and reversed when the user scrolls back past the cue.
 */

const running = new WeakMap<Element, JSAnimation>();

const units = (el: Element) => el.querySelectorAll<HTMLElement>(".rv-u");

export function revealIn(el: Element) {
  running.get(el)?.pause();
  const u = units(el);
  if (!u.length) return;
  el.classList.add("is-in");
  if (prefersReduced()) {
    running.set(el, animate(u, { opacity: 1, duration: 400, ease: "linear" }));
    return;
  }
  const isChars = el.getAttribute("data-mode") === "chars";
  running.set(
    el,
    animate(u, {
      opacity: [0, 1],
      y: [isChars ? "0.55em" : "0.8em", "0em"],
      rotate: [isChars ? 9 : 3, 0],
      duration: isChars ? 650 : 800,
      delay: stagger(isChars ? 16 : 38),
      ease: "outExpo",
    }),
  );
}

export function revealOut(el: Element) {
  running.get(el)?.pause();
  const u = units(el);
  if (!u.length) return;
  el.classList.remove("is-in");
  running.set(
    el,
    animate(u, {
      opacity: 0,
      y: "0.4em",
      duration: 260,
      delay: stagger(6, { from: "last" }),
      ease: "inQuad",
    }),
  );
}

/** Snap a reveal to its final state with no animation (used on reduced motion). */
export function revealSet(el: Element, visible: boolean) {
  units(el).forEach((u) => {
    u.style.opacity = visible ? "1" : "0";
    u.style.transform = "none";
  });
}
