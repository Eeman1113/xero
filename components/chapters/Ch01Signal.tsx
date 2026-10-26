import Reveal from "../ui/Reveal";
import { STORY } from "@/lib/story";
import type { SceneAPI } from "@/lib/useScrollScene";
import { gsap } from "@/lib/gsap";

/** 01 — THE SIGNAL: lines emerge, XERO fills in letter by letter. */
export function Ch01Layer() {
  const letters = STORY.title.split("");
  return (
    <div className="layer ch1" data-ch="01">
      <div className="c1-kicker mono">SEASON 02 — {STORY.subtitle.toUpperCase()}</div>
      <h1 className="c1-title display" aria-label={STORY.title}>
        {letters.map((l, i) => (
          <span className="c1-l" key={i} aria-hidden="true">
            <span className="c1-ghost">{l}</span>
            <span className="c1-fill">{l}</span>
          </span>
        ))}
      </h1>
      <Reveal as="p" mode="chars" className="c1-tag" text={STORY.ch1.tagline} />
      <Reveal as="p" className="c1-copy" text={STORY.ch1.copy} />
      <div className="c1-meta mono">
        <span>EST. NO IDEA WHAT WE WERE DOING</span>
        <span>HINGLISH · 2 FRIENDS · 1 MIC</span>
        <span>HOSTED BY EEMAN × VIJU</span>
      </div>
    </div>
  );
}

export function buildCh01(api: SceneAPI): number {
  const { tl, q, one, small } = api;
  const s = api.chapter("01", 0);
  const layer = one(".ch1");
  gsap.set(layer, { autoAlpha: 1 });

  const fills = q(".c1-fill");
  const ls = q(".c1-l");
  gsap.set(fills, { clipPath: "inset(100% 0% 0% 0%)" });

  api.fieldTo("signal", s + 0.05, 1.2);
  tl.to(fills, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, stagger: 0.06, ease: "power2.out" }, s + 0.05);
  tl.fromTo(one(".c1-kicker"), { opacity: 1 }, { opacity: 0.85, duration: 0.6 }, s + 0.2);
  api.reveal(one(".c1-tag"), s + 0.45);
  api.reveal(one(".c1-copy"), s + 0.95);

  // fly through the title
  const out = s + 1.55;
  tl.to(one(".c1-title"), { scale: small ? 1.8 : 2.6, opacity: 0, duration: 0.65, ease: "power2.in" }, out);
  tl.to(ls, { x: (i: number) => (i - 3) * (small ? 18 : 60), duration: 0.65, ease: "power2.in" }, out);
  tl.to([one(".c1-tag"), one(".c1-copy"), one(".c1-meta"), one(".c1-kicker")], { y: -80, opacity: 0, duration: 0.5, stagger: 0.04 }, out + 0.05);
  api.layerOut(layer, out + 0.6, 0.15);
  return out + 0.4;
}
