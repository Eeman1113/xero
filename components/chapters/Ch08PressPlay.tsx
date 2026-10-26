"use client";
import { useEffect, useRef } from "react";
import { animate } from "animejs";
import { gsap } from "@/lib/gsap";
import Reveal from "../ui/Reveal";
import Pic from "../ui/Pic";
import { MicKit } from "../kits/Kits";
import { audioLevel } from "@/lib/playing";
import type { ObjectName } from "@/lib/assets";
import { STORY } from "@/lib/story";
import type { SceneAPI } from "@/lib/useScrollScene";
import { scrollToTarget } from "@/lib/lenis";
import { prefersReduced } from "@/lib/motion";

export const PLAY_EVENT = "xero:play";

/** Start an episode preview (dispatch synchronously inside the click → counts as a user gesture). */
export function requestPlay(id: string) {
  window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
}

/** scrubbed by the ch8 timeline: 0 = the waveform ring is flat, 1 = fully grown */
export const WAVE = { k: 0 };

const BARS = 64;

/** the radial waveform around the play button: idles as a soft travelling wave, talks with the audio */
function waveD(k: number, t: number, lv: number) {
  let d = "";
  for (let i = 0; i < BARS; i++) {
    const a = (i / BARS) * Math.PI * 2 - Math.PI / 2;
    const idle = 2.5 + 5 * (0.5 + 0.5 * Math.sin(t * 2.2 + i * 0.49)) * (0.6 + 0.4 * Math.sin(t * 0.7 + i * 0.13));
    const talk = lv * 22 * (0.35 + 0.65 * Math.abs(Math.sin(i * 1.7 + t * 9.3)));
    const len = Math.max(0, k * (idle + talk));
    if (len < 0.05) continue;
    const r0 = 54;
    const c = Math.cos(a);
    const sn = Math.sin(a);
    d += `M${(c * r0).toFixed(2)} ${(sn * r0).toFixed(2)}L${(c * (r0 + len)).toFixed(2)} ${(sn * (r0 + len)).toFixed(2)}`;
  }
  return d || "M0 0";
}

export function BigPlay({ onPress, label = "Play the latest XERO episode" }: { onPress: () => void; label?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const path = el.querySelector<SVGPathElement>(".bp-wave path");
    if (!path) return;
    if (prefersReduced()) {
      path.setAttribute("d", waveD(1, 0, 0));
      return;
    }
    const core = animate(el.querySelector(".bp-core")!, {
      scale: [1, 1.045, 1],
      duration: 1100,
      loop: true,
      ease: "inOutSine",
    });
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(el);
    const tick = (time: number) => {
      if (!visible) return;
      path.setAttribute("d", waveD(WAVE.k, time, audioLevel(time)));
    };
    gsap.ticker.add(tick);
    return () => {
      core.pause();
      io.disconnect();
      gsap.ticker.remove(tick);
    };
  }, []);
  return (
    <button ref={ref} className="bigplay" onClick={onPress} aria-label={label}>
      <svg className="bp-wave" viewBox="-100 -100 200 200" aria-hidden="true">
        <defs>
          <linearGradient id="bp-wave-grad" x1="-90" x2="90" y1="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#ff2a8c" />
            <stop offset="0.3" stopColor="#ff9628" />
            <stop offset="0.5" stopColor="#f0dc1e" />
            <stop offset="0.75" stopColor="#28f03c" />
            <stop offset="1" stopColor="#28e6f0" />
          </linearGradient>
        </defs>
        <path d="M0 0" />
      </svg>
      <span className="bp-core">
        <svg viewBox="0 0 100 100" aria-hidden="true">
          <defs>
            <linearGradient id="bp-grad" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#ff2a8c" />
              <stop offset="0.3" stopColor="#ff9628" />
              <stop offset="0.5" stopColor="#f0dc1e" />
              <stop offset="0.75" stopColor="#28f03c" />
              <stop offset="1" stopColor="#28e6f0" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="47" fill="none" stroke="url(#bp-grad)" strokeWidth="2.5" />
          <path d="M40 31 L72 50 L40 69 Z" fill="#fff" />
        </svg>
      </span>
    </button>
  );
}

/** each host's world: a few of their pieces, snapped together beside the play button */
type Piece = { name: ObjectName; x: number; y: number; w: number; r: number; z?: number };
const WORLDS: { who: string; sig: string; side: "l" | "r"; pieces: Piece[] }[] = [
  {
    who: "eeman",
    sig: "Eeman",
    side: "l",
    pieces: [
      { name: "laptop", x: 44, y: 56, w: 70, r: -4 },
      { name: "robot_head", x: 80, y: 34, w: 34, r: 8, z: 2 },
      { name: "ai_chip", x: 16, y: 70, w: 20, r: -14, z: 3 },
    ],
  },
  {
    who: "viju",
    sig: "Viju",
    side: "r",
    pieces: [
      { name: "scale_model", x: 54, y: 56, w: 72, r: 3 },
      { name: "set_square", x: 18, y: 36, w: 30, r: -16, z: 2 },
      { name: "compass", x: 88, y: 70, w: 18, r: 18, z: 3 },
    ],
  },
];

function World({ w }: { w: (typeof WORLDS)[number] }) {
  return (
    <div className={`c8-world c8-world-${w.side}`} aria-hidden="true">
      <div className="c8-desk">
        {w.pieces.map((p) => (
          <span key={p.name} className="c8-piece" style={{ left: `${p.x}%`, top: `${p.y}%`, width: `${p.w}%`, zIndex: p.z ?? 1, ["--r" as string]: `${p.r}deg` }}>
            <Pic name={p.name} className="c8-piece-img" />
          </span>
        ))}
      </div>
      <span className="c8-sig">{w.sig}</span>
    </div>
  );
}

/** 08 — PRESS PLAY: lines converge, everything settles, title + huge play button. */
export function Ch08Layer() {
  const onPress = () => {
    requestPlay("latest");
    scrollToTarget("#listen", 2.6);
  };
  return (
    <div className="layer ch8" data-ch="08">
      <div className="c8-final">
        <Reveal as="p" className="c8-closer display" text={STORY.ch8.closer} />
        <h2 className="c8-title display" aria-label={STORY.title}>
          {STORY.title.split("").map((c, i) => (
            <span key={i} className="c8-l" aria-hidden="true">{c}</span>
          ))}
        </h2>
        <Reveal as="p" mode="chars" className="c8-copy" text={STORY.ch8.copy} />
        {/* Eeman's world × the play button × Viju's world */}
        <div className="c8-row">
          <World w={WORLDS[0]} />
          <div className="c8-x">
            <BigPlay onPress={onPress} />
          </div>
          <World w={WORLDS[1]} />
        </div>
        <span className="mono c8-hint">PRESS PLAY · LATEST EPISODE</span>
      </div>
      <MicKit className="c8-mic" depth={1.2} />
    </div>
  );
}

export function buildCh08(api: SceneAPI, s: number): number {
  const { tl, q, one, small } = api;
  api.chapter("08", s);
  const layer = one(".ch8");
  api.layerIn(layer, s, 0.2);
  api.fieldTo("play", s, 1.8, "power2.inOut");

  // the collage settles behind the title
  tl.to(one(".c7-collage"), { scale: small ? 0.6 : 0.5, x: 0, y: 0, duration: 1.2, ease: "power2.inOut" }, s);
  // …and is gone before the closing line reveals over it
  tl.to(one(".c7-collage"), { opacity: 0, duration: 0.4, ease: "power1.in" }, s);
  tl.to(one(".c7-text"), { opacity: 0, duration: 0.3 }, s);

  // closing line reveals first and stays as the headline above the title
  api.reveal(one(".c8-closer"), s + 0.35);
  tl.fromTo(one(".c8-closer"), { opacity: 1 }, { opacity: 0.75, duration: 0.4, immediateRender: false }, s + 1.5);

  const fin = s + 1.4;
  tl.fromTo(q(".c8-l"), { yPercent: 110, opacity: 0, rotation: 6 },
    { yPercent: 0, opacity: 1, rotation: 0, duration: 0.5, stagger: 0.05, ease: "power3.out", immediateRender: false }, fin);
  api.reveal(one(".c8-copy"), fin + 0.45);
  tl.fromTo(one(".bigplay"), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)", immediateRender: false }, fin + 0.6);
  // the contour lines have pinched into the centre… and come out as the waveform ring
  tl.fromTo(WAVE, { k: 0 }, { k: 1.7, duration: 0.35, ease: "power2.out", immediateRender: false }, fin + 0.75);
  tl.to(WAVE, { k: 1, duration: 0.4, ease: "power2.inOut" }, fin + 1.1);

  // the two hosts' worlds fly in from opposite edges and SNAP together around the play button
  const snap = fin + 1.08;
  q(".c8-world").forEach((world) => {
    const dir = world.classList.contains("c8-world-l") ? -1 : 1;
    world.querySelectorAll<HTMLElement>(".c8-piece").forEach((pc, i) => {
      const at = fin + 0.5 + i * 0.07;
      tl.fromTo(pc, { x: `${dir * (55 + i * 8)}vw`, y: `${(i - 1) * 14}vh`, rotation: dir * (90 + i * 40), opacity: 0 },
        { x: 0, y: 0, rotation: 0, opacity: 1, duration: snap - at, ease: "power3.in", immediateRender: false }, at);
    });
    // impact: the desk squashes and settles
    const desk = world.querySelector<HTMLElement>(".c8-desk")!;
    tl.fromTo(desk, { scaleX: 1, scaleY: 1 }, { scaleX: 1.08, scaleY: 0.9, transformOrigin: "50% 90%", duration: 0.05, immediateRender: false }, snap);
    tl.to(desk, { scaleX: 1, scaleY: 1, duration: 0.35, ease: "elastic.out(1, 0.4)" }, snap + 0.05);
    // …and the host signs it
    tl.fromTo(world.querySelector(".c8-sig"), { clipPath: "inset(-20% 100% -20% 0%)" }, { clipPath: "inset(-20% 0% -20% 0%)", duration: 0.35, ease: "power1.inOut", immediateRender: false }, snap + 0.12);
  });
  tl.fromTo(one(".c8-hint"), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, snap + 0.3);
  tl.fromTo(q(".c8-mic"), { y: "40vh", opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", immediateRender: false }, fin + 0.4);
  api.focusStop(one(".bigplay"), fin + 1.7);
  // hold the final frame for a beat
  tl.to({}, { duration: 1 }, fin + 1.6);
  return fin + 2.4;
}
