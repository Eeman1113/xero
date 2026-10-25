"use client";
import { useEffect, useRef, useState } from "react";
import { animate, createTimeline, stagger, steps, svg, utils } from "animejs";
import { prefersReduced } from "@/lib/motion";

/** < 2s intro: neon lines draw in (anime svg.createDrawable) + a glitchy XERO. */
export default function Intro() {
  const ref = useRef<HTMLDivElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    document.documentElement.classList.add("is-intro");
    const finish = () => {
      document.documentElement.classList.remove("is-intro");
      setDone(true);
    };
    if (prefersReduced()) {
      animate(root, { opacity: 0, duration: 300, delay: 200, ease: "linear", onComplete: finish });
      return;
    }
    const paths = svg.createDrawable(root.querySelectorAll(".intro-line"));
    const letters = root.querySelectorAll(".intro-l");
    const tl = createTimeline({ onComplete: finish });
    tl.add(paths, { draw: ["0 0", "0 1"], duration: 900, delay: stagger(40), ease: "inOutQuad" }, 0)
      .add(letters, { opacity: [0, 1], y: ["40%", "0%"], duration: 380, delay: stagger(45), ease: "outExpo" }, 250)
      .add(letters, {
        x: () => [utils.random(-14, 14), 0],
        skewX: () => [utils.random(-25, 25), 0],
        duration: 260,
        delay: stagger(20, { from: "random" }),
        ease: steps(4),
      }, 820)
      .add(root.querySelector(".intro-word")!, { textShadow: ["4px 0 #ff2a8c, -4px 0 #28e6f0", "0px 0 #ff2a8c, 0px 0 #28e6f0"], duration: 300, ease: steps(3) }, 900)
      .add(paths, { draw: ["0 1", "1 1"], duration: 500, ease: "inQuad" }, 1150)
      .add(root, { opacity: [1, 0], duration: 450, ease: "inQuad" }, 1300);
    return () => {
      tl.pause();
    };
  }, []);

  if (done) return null;
  const colors = ["#ff2a8c", "#ff9628", "#f0dc1e", "#28f03c", "#28e6f0"];
  return (
    <div ref={ref} className="intro" aria-hidden="true">
      <svg className="intro-svg" viewBox="0 0 1200 600" preserveAspectRatio="none">
        <defs>
          <linearGradient id="intro-grad" x1="0" y1="0" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
            {colors.map((c, i) => (
              <stop key={c} offset={i / (colors.length - 1)} stopColor={c} />
            ))}
          </linearGradient>
        </defs>
        {Array.from({ length: 14 }, (_, i) => {
          const y = 60 + i * 34;
          const a = 26 + (i % 5) * 6;
          const d = `M -20 ${y} C 200 ${y - a}, 380 ${y + a * 1.6}, 600 ${y} S 1000 ${y - a * 1.4}, 1220 ${y + a * 0.4}`;
          return <path key={i} className="intro-line" d={d} stroke="url(#intro-grad)" />;
        })}
      </svg>
      <div className="intro-word">
        {"XERO".split("").map((c, i) => (
          <span key={i} className="intro-l">{c}</span>
        ))}
      </div>
    </div>
  );
}
