"use client";
import type { MouseEvent } from "react";
import { animate } from "animejs";
import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import { Bubble, popBubble } from "./Ch04Machine";
import { STORY } from "@/lib/story";
import { IMAGES, OBJECTS } from "@/lib/assets";
import type { SceneAPI } from "@/lib/useScrollScene";
import { scrollToTarget } from "@/lib/lenis";
import { prefersReduced } from "@/lib/motion";

type Back =
  | { kind: "episode"; ep: "e1" | "e2"; label: string; thumb: string }
  | { kind: "topic"; label: string; lines: string[] };

const CARDS: { face: "card_1" | "card_2" | "card_3" | "card_4"; back: Back }[] = [
  { face: "card_1", back: { kind: "episode", ep: "e1", label: "Season 2 · Episode 1", thumb: IMAGES.e1.src } },
  { face: "card_2", back: { kind: "topic", label: "On the table", lines: ["AI", "Government", "Architecture"] } },
  { face: "card_3", back: { kind: "topic", label: "Also on the table", lines: ["Games", "Culture", "??? (unplanned)"] } },
  { face: "card_4", back: { kind: "episode", ep: "e2", label: "Season 2 · Episode 2", thumb: IMAGES.e2.src } },
];

/** reactions to the flips (UI flavour text) */
const REACTIONS = [
  { name: "bubble_3", text: "wait, what?" },
  { name: "bubble_1", text: "bhai, focus." },
  { name: "bubble_4", text: "…where were we?" },
] as const;

/** anime.js card flip; state lives on the element so scroll cues + clicks agree */
export function flipCard(card: Element, toBack: boolean) {
  const inner = card.querySelector<HTMLElement>(".card-inner");
  if (!inner) return;
  card.classList.toggle("is-flipped", toBack);
  if (prefersReduced()) {
    inner.style.transform = `rotateY(${toBack ? 180 : 0}deg)`;
    return;
  }
  animate(inner, {
    rotateY: toBack ? 180 : 0,
    scale: [{ to: 1.08, duration: 260 }, { to: 1, duration: 420 }],
    duration: 700,
    ease: "outBack(1.3)",
  });
}

/** 06 — THE WILDCARD: four aces fan out with the scroll, each flips to a topic or an episode. */
export function Ch06Layer() {
  const onCard = (e: MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const target = e.target as HTMLElement;
    if (target.closest("a")) return;
    flipCard(card, !card.classList.contains("is-flipped"));
  };
  return (
    <div className="layer ch6" data-ch="06">
      <Obj name="club" className="c6-club" depth={0.6} />
      <div className="copy-col c6-text">
        <Reveal as="h2" className="headline" text={STORY.ch6.copy} />
      </div>
      <div className="c6-fan">
        {CARDS.map((c, i) => (
          <div key={c.face} className={`card card${i}`} onClick={onCard} role="button" tabIndex={0}
            aria-label={c.back.kind === "episode" ? c.back.label : c.back.lines.join(", ")}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipCard(e.currentTarget, !e.currentTarget.classList.contains("is-flipped")); } }}>
            <div className="card-inner">
              <div className="card-face">
                <picture>
                  <source srcSet={OBJECTS[c.face].webp} type="image/webp" />
                  <img src={OBJECTS[c.face].src} alt="" draggable={false} loading="lazy" decoding="async" />
                </picture>
              </div>
              <div className="card-back">
                {c.back.kind === "episode" ? (
                  <>
                    <span className="mono cb-k">{c.back.label}</span>
                    <img src={c.back.thumb} alt="" className="cb-thumb" loading="lazy" />
                    <a className="cb-go" href={`#ep-${c.back.ep}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const el = document.getElementById(`ep-${(c.back as { ep: string }).ep}`);
                        scrollToTarget(el ?? "#listen", 3);
                      }}>
                      ▶ Listen
                    </a>
                  </>
                ) : (
                  <>
                    <span className="mono cb-k">{c.back.label}</span>
                    <ul className="cb-topics display">
                      {c.back.lines.map((l) => <li key={l}>{l}</li>)}
                    </ul>
                  </>
                )}
                <span className="cb-corner display">A</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="c6-bubbles desk-only" aria-hidden="true">
        {REACTIONS.map((r, i) => (
          <Bubble key={r.name} name={r.name} text={r.text} className={`c6-b c6-b${i}`} />
        ))}
      </div>
      <Prompter className="c6-prompt band" text={STORY.ch6.long} />
    </div>
  );
}

export function buildCh06(api: SceneAPI, s: number): number {
  const { tl, q, one, small } = api;
  api.chapter("06", s);
  const layer = one(".ch6");
  api.layerIn(layer, s, 0.2);
  api.fieldTo("wildcard", s, 0.8);

  const fan = one(".c6-fan");
  const cards = q(".card");
  tl.fromTo(fan, { y: "70vh", rotation: -12 }, { y: 0, rotation: 0, duration: 0.9, ease: "power2.out", immediateRender: false }, s + 0.05);

  const spreadX = small ? [-27, -9, 9, 27] : [-30, -10, 10, 30];
  const rot = [-16, -5, 5, 16];
  const lift = [5, 0, 0, 5];
  cards.forEach((c, i) => {
    tl.fromTo(c, { x: 0, y: 0, rotation: (i - 1.5) * 3 },
      { x: `${spreadX[i]}vw`, y: `${lift[i]}vh`, rotation: rot[i], duration: 1, ease: "power2.inOut", immediateRender: false }, s + 1.0 + i * 0.05);
    // each card flips (anime.js) when the scroll reaches it — and flips back if you scroll up
    api.cue(s + 2.0 + i * 0.4, () => flipCard(c, true), () => flipCard(c, false));
  });
  tl.fromTo(one(".c6-club"), { y: "30vh", rotation: -40, opacity: 0 }, { y: "-22vh", rotation: 60, opacity: 0.8, duration: 4.6, immediateRender: false }, s);
  tl.to(one(".c6-club"), { opacity: 0, duration: 0.4 }, s + 4.6);

  api.reveal(one(".c6-text .headline"), s + 0.3, s + 2.4);
  tl.to(fan, { y: small ? "-8vh" : "-10vh", scale: small ? 0.85 : 0.82, duration: 0.6, ease: "sine.inOut" }, s + 2.4);
  api.prompter(one(".c6-prompt"), s + 2.6, 2.6);

  // reactions pop up around the fan as the conversation derails
  if (!small) {
    const times = [
      [2.55, 3.35],
      [2.95, 3.85],
      [3.7, 4.65],
    ];
    q(".c6-b").forEach((b, i) => popBubble(api, b, s + times[i][0], s + times[i][1], i % 2 ? 14 : -14));
  }

  const end = s + 5.6;
  tl.to(cards, { x: 0, y: "-6vh", rotation: 0, duration: 0.5, ease: "power2.in" }, end - 0.6);
  tl.to(fan, { y: "-90vh", rotation: 10, duration: 0.5, ease: "power2.in" }, end - 0.15);
  tl.to(one(".c6-prompt"), { opacity: 0, duration: 0.3 }, end - 0.3);
  api.layerOut(layer, end + 0.35, 0.1);
  return end + 0.4;
}
