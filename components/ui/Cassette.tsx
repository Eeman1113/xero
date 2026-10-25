"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReduced } from "@/lib/motion";
import { isPlaying } from "@/lib/playing";
import Pic from "./Pic";

/**
 * Cassette kit: two reels BEHIND the body, showing through its transparent
 * windows. Reels idle-spin slowly, follow scroll velocity (reverse when you
 * scroll up) and run at "play" speed while an episode is playing.
 * Only animates while on screen.
 */
export default function Cassette({ className, label }: { className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReduced()) return;
    const reels = Array.from(root.querySelectorAll<HTMLElement>(".cs-reel"));
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(root);

    let lastY = window.scrollY;
    let vel = 0;
    let ang = 0;
    let boost = 0;
    const tick = (_t: number, dtMs: number) => {
      const dt = Math.min(0.05, dtMs / 1000);
      const y = window.scrollY;
      const v = dt > 0 ? (y - lastY) / dt : 0;
      lastY = y;
      if (!visible) return;
      vel += (v - vel) * 0.12;
      boost += ((isPlaying() ? 1 : 0) - boost) * 0.04;
      // deg/s: slow idle drift + scroll velocity (signed) + playback
      const speed = 24 + boost * 300 + Math.max(-900, Math.min(900, vel * 0.45));
      ang += speed * dt;
      reels[0].style.transform = `rotate(${ang.toFixed(2)}deg)`;
      // the take-up reel turns a touch slower (it holds more tape)
      reels[1].style.transform = `rotate(${(ang * 0.82 + 40).toFixed(2)}deg)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);

  return (
    <div ref={ref} className={`cassette ${className ?? ""}`} aria-hidden="true">
      <Pic name="cassette_reel" className="cs-reel cs-l" />
      <Pic name="cassette_reel" className="cs-reel cs-r" />
      <Pic name="cassette_body" className="cs-body" />
      {label ? <span className="cs-label mono">{label}</span> : null}
    </div>
  );
}
