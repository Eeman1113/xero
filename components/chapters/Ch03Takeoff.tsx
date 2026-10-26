"use client";
import { animate, svg } from "animejs";
import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import Pic from "../ui/Pic";
import { STORY } from "@/lib/story";
import type { SceneAPI } from "@/lib/useScrollScene";

const STICKIES = ["sticky_1", "sticky_2", "sticky_3"] as const;

/** parallax clouds: depth → size, speed, opacity (far ones dim + slow, near ones big + fast) */
const CLOUDS = [
  { n: "cloud_2", d: 0.35, top: 14, w: 12, front: false },
  { n: "cloud_1", d: 0.55, top: 30, w: 17, front: false },
  { n: "cloud_2", d: 0.8, top: 58, w: 20, front: false },
  { n: "cloud_1", d: 1.25, top: 6, w: 22, front: true },
  { n: "cloud_2", d: 1.6, top: 70, w: 28, front: true },
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
        <path className="c3-trail-path" d="M -40 560 C 180 520, 320 430, 470 330 S 760 120, 1060 40" />
        <path className="c3-trail-path thin" d="M -40 585 C 170 548, 330 455, 480 352 S 770 145, 1060 66" />
      </svg>
      <div className="c3-clouds back" aria-hidden="true">
        {CLOUDS.filter((c) => !c.front).map((c, i) => (
          <Obj key={i} name={c.n} className="cld" depth={c.d} idle={0.6}
            style={{ top: `${c.top}%`, width: `${c.w}vw`, opacity: 0.2 + c.d * 0.35, ["--cd" as string]: c.d }} />
        ))}
      </div>
      <Obj name="airplane" className="c3-plane" depth={1.8} keep idle={0.8} />
      <div className="c3-clouds front" aria-hidden="true">
        {CLOUDS.filter((c) => c.front).map((c, i) => (
          <Obj key={i} name={c.n} className={`cld ${i ? "desk-only" : ""}`} depth={c.d} idle={0.6}
            style={{ top: `${c.top}%`, width: `${c.w}vw`, opacity: 0.92, ["--cd" as string]: c.d }} />
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

  // the plane takes off first — the words wait for it
  const plane = one(".c3-plane");
  // climbs, banks into the turn (rotation + a little roll via scaleY), levels off
  tl.fromTo(plane, { x: "-62vw", y: "38vh", scale: 0.55, rotation: 8, scaleY: 0.55, opacity: 0 },
    { x: "-20vw", y: "12vh", scale: 0.9, scaleY: 0.9, rotation: -10, opacity: 1, duration: 0.6, ease: "power1.in", immediateRender: false }, s + 0.15);
  tl.to(plane, { x: "18vw", y: "-14vh", scale: 1.05, scaleY: 0.94, rotation: -16, duration: 0.6, ease: "sine.inOut" }, s + 0.75);
  tl.to(plane, { x: "70vw", y: "-48vh", scale: 0.3, scaleY: 0.27, rotation: -4, opacity: 0.2, duration: 0.6, ease: "power1.out" }, s + 1.35);

  // clouds drift past at their own depth (near = faster); they stay for the whole chapter
  // (near clouds rush past with the plane and are gone before the long-form)
  q(".cld").forEach((c, i) => {
    const d = Number(c.style.getPropertyValue("--cd")) || 1;
    const near = d > 1;
    tl.fromTo(c, { x: `${60 + i * 9}vw` }, { x: `${-40 - 70 * d}vw`, duration: near ? 2.3 : 5.8, ease: "none", immediateRender: false }, s + 0.05 + (near ? (i % 2) * 0.25 : 0));
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
  // the plane comes back for a low pass… and its wake peels them off
  tl.set(plane, { x: "-75vw", y: "44vh", scale: 0.5, rotation: -6, opacity: 0 }, end - 1.0);
  tl.to(plane, { x: "80vw", y: "16vh", scale: 0.62, rotation: -9, opacity: 1, duration: 0.9, ease: "sine.in" }, end - 0.98);
  notes.forEach((n, i) => {
    const at = end - 0.72 + i * 0.09;
    // lift a corner first (peel), then flutter away on the wake
    tl.to(n, { skewY: -9, scaleY: 0.9, rotation: tilt[i] - 14, transformOrigin: "100% 0%", duration: 0.12, ease: "power1.out" }, at);
    tl.to(n, { x: `${32 + i * 10}vw`, y: `${-48 - i * 8}vh`, rotation: tilt[i] + (i % 2 ? 160 : -200), skewX: 18, skewY: 6, scale: 0.7, opacity: 0, duration: 0.65, ease: "power1.in" }, at + 0.12);
  });
  tl.to(one(".c3-prompt"), { opacity: 0, duration: 0.35 }, end - 0.55);
  api.layerOut(layer, end + 0.1, 0.1);
  return end;
}
