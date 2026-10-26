"use client";
import { useEffect, useRef } from "react";
import { animate, stagger } from "animejs";
import Reveal from "../ui/Reveal";
import Obj from "../ui/Obj";
import { MicKit } from "../kits/Kits";
import { STORY } from "@/lib/story";
import type { SceneAPI } from "@/lib/useScrollScene";
import { scrollToTarget } from "@/lib/lenis";
import { prefersReduced } from "@/lib/motion";

export const PLAY_EVENT = "xero:play";

/** Start an episode preview (dispatch synchronously inside the click → counts as a user gesture). */
export function requestPlay(id: string) {
  window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: id }));
}

export function BigPlay({ onPress, label = "Play the latest XERO episode" }: { onPress: () => void; label?: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReduced()) return;
    const rings = el.querySelectorAll(".bp-ring");
    const a = animate(rings, {
      scale: [1, 1.45],
      opacity: [0.7, 0],
      duration: 2200,
      delay: stagger(730),
      loop: true,
      ease: "outQuad",
    });
    const b = animate(el.querySelector(".bp-core")!, {
      scale: [1, 1.045, 1],
      duration: 1100,
      loop: true,
      ease: "inOutSine",
    });
    return () => {
      a.pause();
      b.pause();
    };
  }, []);
  return (
    <button ref={ref} className="bigplay" onClick={onPress} aria-label={label}>
      <span className="bp-ring" />
      <span className="bp-ring" />
      <span className="bp-ring" />
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
        <BigPlay onPress={onPress} />
        <span className="mono c8-hint">PRESS PLAY · LATEST EPISODE</span>
      </div>
      <Obj name="headphones" className="c8-phones" depth={0.8} />
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
  tl.fromTo(one(".c8-hint"), { opacity: 0 }, { opacity: 1, duration: 0.3, immediateRender: false }, fin + 0.9);
  tl.fromTo(q(".c8-phones, .c8-mic"), { y: "40vh", opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power2.out", immediateRender: false }, fin + 0.4);
  // hold the final frame for a beat
  tl.to({}, { duration: 1 }, fin + 1.2);
  return fin + 2;
}
