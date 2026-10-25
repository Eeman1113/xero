"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import { chapterName, CHAPTERS } from "@/lib/story";
import { onChapter, resolveChapter } from "@/lib/hud";
import { getLenis, scrollToTarget } from "@/lib/lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";

/** Mono HUD: wordmark, "02 — THE MEMORIES" label, chapter ticks, gradient progress line. */
export default function Hud() {
  const [ch, setCh] = useState("01");
  const labelRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const listenRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => onChapter(setCh), []);

  useEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    animate(el.querySelectorAll(".hud-c"), {
      opacity: [0, 1],
      y: ["-0.6em", "0em"],
      duration: 420,
      delay: stagger(14),
      ease: "outQuad",
    });
  }, [ch]);

  useEffect(() => {
    const tick = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = getLenis()?.scroll ?? window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (hintRef.current) hintRef.current.style.opacity = String(Math.max(0, 1 - y / 300));
      resolveChapter(y);
      // the LISTEN shortcut is pointless (and in the way) once the episodes are on screen
      const ls = document.getElementById("listen");
      if (ls && listenRef.current) {
        const hide = ls.getBoundingClientRect().top < window.innerHeight * 0.75;
        listenRef.current.classList.toggle("is-hidden", hide);
      }
    };
    gsap.ticker.add(tick);
    ScrollTrigger.addEventListener("refresh", tick);
    return () => {
      gsap.ticker.remove(tick);
      ScrollTrigger.removeEventListener("refresh", tick);
    };
  }, []);

  const label = `${ch} — ${chapterName(ch)}`;

  return (
    <div className="hud">
      <button className="hud-mark" onClick={() => scrollToTarget(0)} aria-label="Back to top">
        XERO<span className="hud-s2">S2</span>
      </button>
      <div className="hud-ch" aria-live="polite">
        <span ref={labelRef} key={ch} className="hud-label">
          {Array.from(label).map((c, i) => (
            <span className="hud-c" key={i}>
              {c === " " ? " " : c}
            </span>
          ))}
        </span>
        <span className="hud-ticks">
          {CHAPTERS.map((c) => (
            <i key={c.id} className={c.id <= ch ? "on" : ""} />
          ))}
        </span>
      </div>
      <a ref={listenRef} className="hud-listen" href="#listen" onClick={(e) => { e.preventDefault(); scrollToTarget("#listen", 3); }}>
        ▶ LISTEN
      </a>
      <div ref={hintRef} className="hud-hint">SCROLL TO TUNE IN ↓</div>
      <div className="hud-progress"><div ref={barRef} className="hud-bar" /></div>
    </div>
  );
}
