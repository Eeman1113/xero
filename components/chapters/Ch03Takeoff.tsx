"use client";
import { animate, svg } from "animejs";
import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import Pic from "../ui/Pic";
import { STORY } from "@/lib/story";
import type { SceneAPI } from "@/lib/useScrollScene";

const STICKIES = ["sticky_1", "sticky_2", "sticky_3"] as const;

/** parallax clouds, all in the SKY band above the horizon of the ground plane.
 *  Far clouds fade in fully inside the frame and drift slowly (they come back
 *  on the left while the long-form is read); near clouds rush across the whole
 *  screen with the plane and are gone before the headline. */
const CLOUDS = [
  { n: "cloud_2", d: 0.35, top: 8, w: 10, front: false, a: [26, 14], b: [-44, -50] },
  { n: "cloud_1", d: 0.55, top: 17, w: 14, front: false, a: [12, -2], b: [-30, -38] },
  { n: "cloud_2", d: 0.8, top: 25, w: 12, front: false, a: [32, 20], b: [-14, -24] },
  { n: "cloud_1", d: 1.25, top: 3, w: 22, front: true, a: [56, -82], b: [0, 0] },
  { n: "cloud_2", d: 1.6, top: 22, w: 26, front: true, a: [60, -90], b: [0, 0] },
] as const;

/** 03 — THE TAKEOFF: the plane crosses BEFORE the words; lines stretch into the distance. */
export function Ch03Layer() {
  return (
    <div className="layer ch3" data-ch="03">
      <svg className="c3-trail" viewBox="0 0 1000 600" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="trail-grad" x1="0" x2="1000" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff2a8c" />
            <stop offset="0.5" stopColor="#f0dc1e" />
            <stop offset="1" stopColor="#28e6f0" />
          </linearGradient>
        </defs>
        <path className="c3-trail-path" d="M -60 590 C 100 530, 170 420, 250 365 S 520 200, 640 170 S 880 90, 1080 70" />
        <path className="c3-trail-path thin" d="M -60 612 C 100 552, 175 445, 255 390 S 525 225, 645 195 S 885 115, 1080 96" />
      </svg>
      <div className="c3-clouds back" aria-hidden="true">
        {CLOUDS.map((c, i) => (c.front ? null :
          <Obj key={i} name={c.n} className="cld far" depth={c.d} idle={0.6}
            style={{ top: `${c.top}%`, width: `${c.w}vw`, ["--ci" as string]: i }} />
        ))}
      </div>
      <Obj name="airplane" className="c3-plane" depth={1.8} keep idle={0.8} />
      <div className="c3-clouds front" aria-hidden="true">
        {CLOUDS.map((c, i) => (!c.front ? null :
          <Obj key={i} name={c.n} className={`cld near ${i > 3 ? "desk-only" : ""}`} depth={c.d} idle={0.6}
            style={{ top: `${c.top}%`, width: `${c.w}vw`, ["--ci" as string]: i }} />
        ))}
      </div>
      <div className="copy-col c3-text">
        <Reveal as="h2" className="headline" text={STORY.ch3.copy} />
      </div>
      <Prompter className="c3-prompt side-right" text={STORY.ch3.long} />
      <div className="c3-notes" aria-hidden="true">
        {STICKIES.map((n, i) => (
          <div key={n} className={`stk stk${i}`}>
            <Pic name={n} className="stk-img" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function buildCh03(api: SceneAPI, s: number): number {
  const { tl, q, one } = api;
  api.chapter("03", s);
  const layer = one(".ch3");
  api.layerIn(layer, s, 0.2);
  api.fieldTo("takeoff", s, 1.3);

  // the plane takes off first — the words wait for it. It leaves the ground
  // low-left (where the near contour lines are), climbs along the contrail
  // and is gone off the top-right into the sky before the headline arrives.
  const plane = one(".c3-plane");
  tl.fromTo(plane, { x: "-50vw", y: "34vh", scale: 0.4, rotation: 10, opacity: 1 },
    { x: "-26vw", y: "10vh", scale: 0.56, rotation: -8, duration: 0.6, ease: "power1.out", immediateRender: false }, s + 0.1);
  tl.to(plane, { x: "12vw", y: "-22vh", scale: 0.7, rotation: -14, duration: 0.55, ease: "none" }, s + 0.7);
  tl.to(plane, { x: "84vw", y: "-36vh", scale: 0.32, rotation: -12, duration: 0.55, ease: "power1.out" }, s + 1.25);

  // clouds: far ones fade in inside the frame and drift; near ones rush past
  q(".cld").forEach((c) => {
    const k = CLOUDS[Number(c.style.getPropertyValue("--ci"))];
    if (!k) return;
    if (k.front) {
      const at = s + 0.15 + (k.d > 1.4 ? 0.3 : 0);
      tl.fromTo(c, { x: `${k.a[0]}vw` }, { x: `${k.a[1]}vw`, duration: 1.15, ease: "none", immediateRender: false }, at);
      tl.set(c, { opacity: 0 }, at + 1.16);
      return;
    }
    const op = 0.5 + k.d * 0.4;
    // A: behind the climbing plane (right half of the sky), out before the headline
    tl.fromTo(c, { x: `${k.a[0]}vw` }, { x: `${k.a[1]}vw`, duration: 1.4, ease: "none", immediateRender: false }, s + 0.1);
    tl.fromTo(c, { opacity: 0 }, { opacity: op, duration: 0.3, immediateRender: false }, s + 0.1);
    tl.to(c, { opacity: 0, duration: 0.25 }, s + 1.25);
    // B: back on the left sky while the long-form plays (headline is gone by then)
    tl.set(c, { x: `${k.b[0]}vw` }, s + 2.95);
    tl.to(c, { opacity: op, duration: 0.35 }, s + 3.0);
    tl.to(c, { x: `${k.b[1]}vw`, duration: 2.8, ease: "none" }, s + 3.0);
    tl.to(c, { opacity: 0, duration: 0.3 }, api.small ? s + 4.3 : s + 5.55);
  });

  // contrail: anime.js drawable, seeked by the scrubbed GSAP playhead
  const drawables = svg.createDrawable(q(".c3-trail-path"));
  const trail = animate(drawables, { draw: ["0 0", "0 1", "1 1"], duration: 2000, autoplay: false, ease: "linear" });
  trail.seek(0);
  const p = { k: 0 };
  const seek = () => {
    trail.seek(p.k * 1000);
  };
  tl.fromTo(p, { k: 0 }, { k: 1, duration: 1.6, immediateRender: false, onUpdate: seek }, s + 0.2);
  tl.fromTo(p, { k: 1 }, { k: 2, duration: 1.2, immediateRender: false, onUpdate: seek }, s + 2.6);

  api.reveal(one(".c3-text .headline"), s + 1.55, s + 2.9);
  api.prompter(one(".c3-prompt"), s + 2.5, 2.4);

  // "...and a suspicious number of passwords." — three stickies SLAP on, one by one
  const notes = q(".stk");
  const end = s + 6.0;
  const tilt = [-9, 6, -4];
  notes.forEach((n, i) => {
    const at = s + 4.55 + i * 0.2;
    tl.fromTo(n, { scale: 2.3, rotation: tilt[i] * 3, opacity: 0, y: "-6vh" },
      { scale: 1, rotation: tilt[i], opacity: 1, y: 0, duration: 0.2, ease: "back.out(2.6)", immediateRender: false }, at);
  });
  // the plane comes back for a high pass across the sky… and its wake peels them off
  tl.set(plane, { x: "-72vw", y: "-26vh", scale: 0.28, rotation: -2, opacity: 1 }, end - 1.12);
  tl.to(plane, { x: "74vw", y: "-33vh", scale: 0.3, rotation: -6, duration: 0.9, ease: "sine.inOut" }, end - 1.1);
  notes.forEach((n, i) => {
    const at = end - 0.76 + i * 0.09;
    // lift a corner first (peel), then flutter up and away on the wake
    tl.to(n, { skewY: -9, scaleY: 0.9, rotation: tilt[i] - 14, transformOrigin: "100% 0%", duration: 0.12, ease: "power1.out" }, at);
    tl.to(n, { x: `${22 + i * 8}vw`, y: `${-62 - i * 6}vh`, rotation: tilt[i] + (i % 2 ? 160 : -200), skewX: 18, skewY: 6, scale: 0.6, opacity: 0, duration: 0.55, ease: "power1.in" }, at + 0.12);
  });
  tl.to(one(".c3-prompt"), { opacity: 0, duration: 0.3 }, end - 0.8);
  api.layerOut(layer, end + 0.1, 0.1);
  return end;
}
