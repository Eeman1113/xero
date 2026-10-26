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
import { useFeed } from "@/lib/feedContext";
import { episodeAnchors } from "@/lib/feedTypes";

type Back =
  | { kind: "episode"; label: string; thumb: string; anchor: string; title: string }
  | { kind: "soon"; label: string }
  | { kind: "topic"; label: string; lines: string[] };

type Face = "card_1" | "card_2" | "card_3" | "card_4";

/** "Season 2 · Episode 1" that only ever breaks at the dot */
const epLabel = (season: number, episode: number) => `Season\u00a0${season} · Episode\u00a0${episode}`;

/** The two outer aces are episode cards, built from the same filtered feed as the
 *  Listen section: the latest real episode, then the one before it — or, if
 *  there isn't one yet, a "coming soon" card with no link. */
function useCards(): { face: Face; back: Back }[] {
  const feed = useFeed();
  const eps = feed?.episodes.slice(0, 6) ?? [];
  const anchors = episodeAnchors(eps);
  const epBack = (i: number): Back | null => {
    const e = eps[i];
    if (!e) return null;
    return {
      kind: "episode",
      label: e.season && e.episode ? epLabel(e.season, e.episode) : "Latest episode",
      thumb: e.thumb,
      anchor: anchors[i],
      title: e.displayTitle,
    };
  };
  let first: Back;
  let last: Back;
  if (eps.length) {
    first = epBack(0)!;
    const next = eps[0].season && eps[0].episode ? epLabel(eps[0].season, eps[0].episode + 1) : "Next episode";
    last = epBack(1) ?? { kind: "soon", label: next };
  } else {
    // feed unreachable at build time: the bundled S2 previews in the Listen section
    first = { kind: "episode", label: epLabel(2, 1), thumb: IMAGES.e1.src, anchor: "ep-e1", title: "Season 2 · Episode 1" };
    last = { kind: "episode", label: epLabel(2, 2), thumb: IMAGES.e2.src, anchor: "ep-e2", title: "Season 2 · Episode 2" };
  }
  return [
    { face: "card_1", back: first },
    { face: "card_2", back: { kind: "topic", label: "On the table", lines: ["AI", "Government", "Architecture"] } },
    { face: "card_3", back: { kind: "topic", label: "Also on the table", lines: ["Games", "Culture", "??? (unplanned)"] } },
    { face: "card_4", back: last },
  ];
}

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
  const cards = useCards();
  const aria = (b: Back) =>
    b.kind === "episode" ? `${b.label}: ${b.title}` : b.kind === "soon" ? `${b.label}, coming soon` : `${b.label}: ${b.lines.join(", ")}`;
  return (
    <div className="layer ch6" data-ch="06">
      <div className="copy-col c6-text">
        <Reveal as="h2" className="headline" text={STORY.ch6.copy} />
      </div>
      <div className="c6-fan">
        {cards.map((c, i) => (
          <div key={c.face} className={`card card${i}`} onClick={onCard} role="button" tabIndex={0}
            aria-label={`Flip card: ${aria(c.back)}`}
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
                    <a className="cb-go" href={`#${c.back.anchor}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        const el = document.getElementById((c.back as { anchor: string }).anchor);
                        scrollToTarget(el ?? "#listen", 3);
                      }}>
                      ▶ Listen
                    </a>
                  </>
                ) : c.back.kind === "soon" ? (
                  <>
                    <span className="mono cb-k">{c.back.label}</span>
                    <span className="cb-soon display">Coming<br />soon</span>
                    <span className="mono cb-soon-k">NEXT ON THE TAPE</span>
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
  api.layerIn(layer, s, 0.06);
  api.fieldTo("wildcard", s, 0.8);

  const fan = one(".c6-fan");
  const cards = q(".card");
  tl.fromTo(fan, { y: "48vh", rotation: -12 }, { y: 0, rotation: 0, duration: 0.8, ease: "power2.out", immediateRender: false }, s);

  // phones: spread wider than the card width so the flipped backs never cover each other
  const spreadX = small ? [-34, -11.5, 11.5, 34] : [-30, -10, 10, 30];
  const rot = [-16, -5, 5, 16];
  const lift = [5, 0, 0, 5];
  cards.forEach((c, i) => {
    tl.fromTo(c, { x: 0, y: 0, rotation: (i - 1.5) * 3 },
      { x: `${spreadX[i]}vw`, y: `${lift[i]}vh`, rotation: rot[i], duration: 1, ease: "power2.inOut", immediateRender: false }, s + 1.0 + i * 0.05);
    // each card flips (anime.js) when the scroll reaches it — and flips back if you scroll up
    // portrait: they flip once they have re-dealt into the 2×2 grid (below)
    const flipAt = small ? s + 2.75 + i * 0.3 : s + 2.0 + i * 0.4;
    api.cue(flipAt, () => flipCard(c, true), () => flipCard(c, false));
    // keyboard: each card (and its Listen link) once the whole hand is face-up
    const focusAt = small ? s + 3.8 : s + 3.4;
    api.focusStop(c, focusAt);
    const go = c.querySelector<HTMLElement>(".cb-go");
    if (go) api.focusStop(go, focusAt);
  });

  api.reveal(one(".c6-text .headline"), s + 0.08, s + 2.4);
  if (small) {
    // portrait: a one-row fan is too small to read once flipped, so as the
    // headline leaves the cards re-deal into a 2×2 grid at 1.5× size
    // sized so two rows fit between the HUD and the long-form band (12vh → 68vh)
    const k = () => Math.min(1.5, (0.27 * window.innerHeight) / Math.max(1, cards[0].offsetHeight));
    const gr = [-3, 2, 2, -3];
    cards.forEach((c, i) => {
      const col = i % 2 ? 1 : -1;
      const row = i < 2 ? -1 : 1;
      tl.to(c, {
        // offsets from the card's resting centre (53% down the stage)
        x: () => col * (cards[0].offsetWidth * k() * 0.5 + window.innerWidth * 0.02),
        y: () => window.innerHeight * -0.13 + row * (cards[0].offsetHeight * k() * 0.5 + window.innerHeight * 0.008),
        rotation: gr[i], scale: k, duration: 0.55, ease: "power2.inOut",
      }, s + 2.4 + i * 0.04);
    });
  } else {
    tl.to(fan, { y: "-10vh", scale: 0.82, duration: 0.6, ease: "sine.inOut" }, s + 2.4);
  }
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
  // the hand is gathered: every card turns face-down first, so no flipped back
  // ever slides under another one, then the deck is pocketed (shrinks + spins
  // into the centre: it never sweeps across the copy or the HUD)
  api.cue(end - 0.82, () => cards.forEach((c) => flipCard(c, false)), () => cards.forEach((c) => flipCard(c, true)));
  tl.to(cards, { x: 0, y: "-6vh", rotation: 0, scale: 1, duration: 0.42, ease: "power2.inOut" }, end - 0.72);
  tl.to(fan, { scale: 0.12, rotation: 24, duration: 0.34, ease: "power2.in" }, end - 0.32);
  tl.to(fan, { opacity: 0, duration: 0.1 }, end - 0.1);
  // the last line stays readable right up to the hand-off (no empty beat before ch7)
  tl.to(one(".c6-prompt"), { opacity: 0, duration: 0.12 }, end - 0.06);
  api.layerOut(layer, end + 0.06, 0.02);
  return end + 0.08;
}
