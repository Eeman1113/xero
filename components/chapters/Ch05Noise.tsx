import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import Pic from "../ui/Pic";
import { STORY } from "@/lib/story";
import type { ObjectName } from "@/lib/assets";
import type { SceneAPI } from "@/lib/useScrollScene";
import { field } from "@/lib/field";

type Orbit = { name: ObjectName; r: number; a0: number; spin: number; depth: number; w: string; topic: number; mobile?: boolean; upright?: boolean };

/* Hero orbiters (colour art), each paired with a topic word (index into STORY.ch5.topics).
   r = radius (vmin), a0 = start angle (deg), spin = degrees travelled during the chapter */
const ORBITS: Orbit[] = [
  { name: "robot_head", r: 30, a0: -40, spin: 140, depth: 1.5, w: "clamp(110px, 13vw, 210px)", topic: 0, mobile: true },
  { name: "ballot_box_empty", r: 38, a0: 35, spin: 115, depth: 1.3, w: "clamp(140px, 15vw, 250px)", topic: 1, mobile: true, upright: true },
  { name: "tower", r: 44, a0: 120, spin: 100, depth: 1.2, w: "clamp(80px, 9vw, 150px)", topic: 2, mobile: true },
  { name: "controller", r: 27, a0: 200, spin: 170, depth: 1.6, w: "clamp(120px, 14vw, 230px)", topic: 3, mobile: true },
  { name: "headphones", r: 40, a0: 260, spin: 120, depth: 1.25, w: "clamp(90px, 10vw, 170px)", topic: 4, mobile: true },
  { name: "coconut_oil", r: 48, a0: 300, spin: 95, depth: 1.05, w: "clamp(60px, 7vw, 120px)", topic: 4 },
  { name: "banana", r: 34, a0: 160, spin: 150, depth: 1.15, w: "clamp(100px, 12vw, 200px)", topic: 4 },
  { name: "nokia", r: 22, a0: 80, spin: 210, depth: 1.4, w: "clamp(50px, 5.5vw, 90px)", topic: 4 },
  { name: "knife", r: 52, a0: 10, spin: 80, depth: 0.95, w: "clamp(100px, 11vw, 180px)", topic: -1 },
];

/* original white line-art: small, dim, far-background depth fragments */
const BG: { name: ObjectName; x: number; y: number; w: string; o: number }[] = [
  { name: "mythbusters", x: 12, y: 18, w: "clamp(90px, 10vw, 160px)", o: 0.3 },
  { name: "alien_eye", x: 80, y: 14, w: "clamp(90px, 11vw, 170px)", o: 0.35 },
  { name: "apple", x: 30, y: 82, w: "clamp(28px, 3vw, 48px)", o: 0.3 },
  { name: "farcry", x: 88, y: 64, w: "clamp(50px, 5vw, 80px)", o: 0.25 },
  { name: "splatter", x: 52, y: 10, w: "clamp(60px, 6vw, 100px)", o: 0.3 },
  { name: "tablet", x: 6, y: 58, w: "clamp(70px, 8vw, 130px)", o: 0.28 },
  { name: "club", x: 68, y: 88, w: "clamp(24px, 2.6vw, 40px)", o: 0.4 },
  { name: "marker", x: 94, y: 36, w: "clamp(18px, 2vw, 32px)", o: 0.3 },
  { name: "cards", x: 20, y: 40, w: "clamp(80px, 9vw, 140px)", o: 0.25 },
  { name: "banana_bowl", x: 74, y: 46, w: "clamp(70px, 8vw, 120px)", o: 0.25 },
];

const COLORS = ["#ff2a8c", "#ff9628", "#f0dc1e", "#28f03c", "#28e6f0"];

/** 05 — THE NOISE: controlled chaos. Ten objects orbit at different depths; topic words collide. */
export function Ch05Layer() {
  return (
    <div className="layer ch5" data-ch="05">
      <div className="c5-words" aria-hidden="true">
        {STORY.ch5.topics.map((t, i) => (
          <span key={t} className={`topic display tw${i}`} style={{ ["--c" as string]: COLORS[i] }}>{t}</span>
        ))}
      </div>
      <div className="c5-bg" aria-hidden="true">
        {BG.map((b, i) => (
          <Obj key={b.name} name={b.name} className={`bgf ${i % 2 ? "desk-only" : ""}`} depth={0.3}
            style={{ left: `${b.x}%`, top: `${b.y}%`, width: b.w, opacity: b.o, translate: "-50% -50%" }} />
        ))}
      </div>
      <div className="c5-orbits">
        {ORBITS.map((o) => (
          <div key={o.name} className={`orb ${o.mobile ? "" : "desk-only"}`} data-r={o.r} data-a0={o.a0} data-spin={o.spin} data-upright={o.upright ? "1" : undefined}
            data-topic={o.topic} style={{ zIndex: Math.round(o.depth * 10) }}>
            <div className="orb-arm">
              {o.name === "ballot_box_empty" ? (
                // GOVERNMENT: a hand drops a slip into the ballot box (kit: box + hand, clipped at the slot)
                <div className="obj obj-neon orb-item hero ballot" style={{ width: o.w, ["--d" as string]: o.depth }} data-obj="ballot_box_empty">
                  <div className="obj-m">
                    <div className="bal-drop">
                      <div className="bal-hand">
                        <Pic name="ballot_hand" className="bal-hand-img" />
                      </div>
                    </div>
                    <Pic name="ballot_box_empty" alt="Ballot box" className="obj-img bal-box" />
                  </div>
                </div>
              ) : (
                <Obj name={o.name} className={`orb-item ${o.topic >= 0 ? "hero" : ""}`} depth={o.depth} style={{ width: o.w }} />
              )}
            </div>
          </div>
        ))}
      </div>
      <div className="copy-col c5-text">
        <Reveal as="h2" className="headline sticker" text={STORY.ch5.copy} />
      </div>
      <Prompter className="c5-prompt side-right panel" text={STORY.ch5.long} />
    </div>
  );
}

const root = (q: (sel: string) => HTMLElement[], sel: string) => q(sel)[0] as HTMLElement | undefined;

export function buildCh05(api: SceneAPI, s: number): number {
  const { tl, q, one, small } = api;
  api.chapter("05", s);
  const layer = one(".ch5");
  api.layerIn(layer, s, 0.2);
  api.fieldTo("noise", s, 0.9);
  tl.fromTo(field, { rippleX: 0.3, rippleY: 0.4 }, { rippleX: 0.7, rippleY: 0.6, duration: 4.6, immediateRender: false }, s + 0.01);

  const dur = 4.8;
  const scale = small ? 0.75 : 1;
  q(".orb").forEach((orb, i) => {
    const r = Number(orb.dataset.r) * scale;
    const a0 = Number(orb.dataset.a0);
    const spin = Number(orb.dataset.spin);
    const arm = orb.querySelector<HTMLElement>(".orb-arm")!;
    const item = orb.querySelector<HTMLElement>(".orb-item")!;
    // orbit: rotate the container, push the item out on the arm, counter-rotate + self spin
    tl.fromTo(orb, { rotation: a0 }, { rotation: a0 + spin, duration: dur, immediateRender: false }, s);
    tl.fromTo(arm, { x: "130vmax" }, { x: `${r}vmin`, duration: 1.1, ease: "power3.out", immediateRender: false }, s + i * 0.05);
    // counter-rotate + self spin (the ballot box stays upright so the drop reads)
    const self = orb.dataset.upright ? 0 : i % 2 ? 40 : -40;
    tl.fromTo(item, { rotation: -a0, scale: 0.6 }, { rotation: -(a0 + spin) + self, scale: 1, duration: dur, immediateRender: false }, s);
    tl.to(arm, { x: "140vmax", duration: 0.8, ease: "power2.in" }, s + dur - 0.3 + (i % 4) * 0.04);
  });

  // GOVERNMENT: the hand comes down, the slip slides into the slot (clipped), the box bounces
  const hand = root(q, ".bal-hand");
  const box = root(q, ".bal-box");
  if (hand && box) {
    const g = s + 1.1;
    tl.fromTo(hand, { yPercent: -150, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, g);
    tl.to(hand, { yPercent: 44, duration: 0.32, ease: "power1.in" }, g + 0.42);
    tl.fromTo(box, { scaleY: 1, scaleX: 1 }, { scaleY: 0.92, scaleX: 1.04, transformOrigin: "50% 100%", duration: 0.06, immediateRender: false }, g + 0.74);
    tl.to(box, { scaleY: 1, scaleX: 1, duration: 0.35, ease: "elastic.out(1, 0.35)" }, g + 0.8);
    tl.to(hand, { yPercent: -160, opacity: 0, duration: 0.4, ease: "power2.in" }, g + 0.9);
  }

  // far-background line-art: slow drift + rotation (barely there)
  q(".bgf").forEach((el, i) => {
    tl.fromTo(el, { y: "12vh", rotation: (i % 2 ? -1 : 1) * 10 },
      { y: "-14vh", rotation: (i % 2 ? 1 : -1) * 14, duration: dur, immediateRender: false }, s);
  });

  // each topic word arrives with its object: the paired hero swells + glows while its word is on stage
  const words = q(".topic");
  words.forEach((w, i) => {
    const dir = i % 2 ? 1 : -1;
    const at = s + 0.15 + i * 0.45;
    tl.fromTo(w, { x: `${dir * 90}vw`, opacity: 0, rotation: dir * 4 },
      { x: `${-dir * 8}vw`, opacity: 1, rotation: -dir * 2, duration: 1.2, ease: "power2.out", immediateRender: false }, at);
    tl.to(w, { x: `${-dir * 110}vw`, opacity: 0, duration: 1.1, ease: "power1.in" }, at + 1.75);
    const heroes = q(`.orb[data-topic="${i}"] .orb-item`);
    if (heroes.length) {
      tl.fromTo(heroes, { "--hs": 1 }, { "--hs": 1.45, duration: 0.45, ease: "back.out(2)", immediateRender: false }, at + 0.7);
      tl.to(heroes, { "--hs": 1, duration: 0.5, ease: "power1.inOut" }, at + 1.75);
    }
  });

  // the sticker card itself pops in / out with its text (never an empty box)
  const sticker = one(".c5-text .headline");
  tl.fromTo(sticker, { autoAlpha: 0, scale: 0.86, rotation: -7 },
    { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.35, ease: "back.out(1.8)", immediateRender: false }, s + 0.6);
  // no reveal-out: the card fades with its text still set (never an empty box)
  api.reveal(sticker, s + 0.75);
  tl.to(sticker, { autoAlpha: 0, scale: 0.9, rotation: 4, duration: 0.3, ease: "power2.in" }, s + 2.6);
  // the topic words step back so the long-form stays readable
  tl.to(one(".c5-words"), { opacity: 0.22, duration: 0.6, ease: "sine.inOut" }, s + 2.2);
  api.prompter(one(".c5-prompt"), s + 2.4, 2.4);
  // phones: the long-form shares the screen with the orbit, so the orbit steps back
  if (small) tl.to(q(".c5-orbits, .c5-bg"), { opacity: 0.3, duration: 0.5, ease: "sine.inOut" }, s + 2.3);
  const end = s + dur + 0.4;
  tl.to(one(".c5-prompt"), { opacity: 0, duration: 0.3 }, end - 0.4);
  api.layerOut(layer, end + 0.1, 0.1);
  return end;
}
