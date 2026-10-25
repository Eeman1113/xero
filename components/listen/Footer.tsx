"use client";
import { useEffect, useRef } from "react";
import Reveal from "../ui/Reveal";
import { STORY, toLines } from "@/lib/story";
import { ScrollTrigger } from "@/lib/gsap";
import { revealIn } from "@/lib/reveal";
import { scrollToTarget } from "@/lib/lenis";

/** Footer with the sign-off line. */
export default function Footer() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const ts = Array.from(root.querySelectorAll("[data-reveal]")).map((el, i) =>
      ScrollTrigger.create({ trigger: el, start: "top 92%", once: true, onEnter: () => window.setTimeout(() => revealIn(el), i * 120) }),
    );
    return () => ts.forEach((t) => t.kill());
  }, []);
  const lines = toLines(STORY.ch8.signoff, 1);
  return (
    <footer ref={ref} className="footer">
      <div className="ft-sign display">
        {lines.map((l, i) => (
          <Reveal key={i} as="p" className={`ft-l ft-l${i}`} text={l} />
        ))}
      </div>
      <div className="ft-meta mono">
        <span>© XERO — two best friends, one microphone</span>
        <span>made with too many opinions</span>
        <a href="#" onClick={(e) => { e.preventDefault(); scrollToTarget(0, 4); }}>back to the signal ↑</a>
      </div>
    </footer>
  );
}
