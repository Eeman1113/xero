"use client";
import { animate } from "animejs";
import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import Pic from "../ui/Pic";
import { CameraKit, CassetteKit as Cassette, NokiaKit } from "../kits/Kits";
import { STORY } from "@/lib/story";
import type { ObjectName } from "@/lib/assets";
import type { SceneAPI } from "@/lib/useScrollScene";
import { field } from "@/lib/field";
import { prefersReduced } from "@/lib/motion";

/** the camera prints these; each flips to a handwritten caption (UI flavour text) */
const POLAROIDS: { name: ObjectName; alt: string; cap: string; note: string }[] = [
  { name: "polaroid_1", alt: "Mumbai skyline at sunset", cap: "the first recording (lost)", note: "shehar, 7pm" },
  { name: "polaroid_2", alt: "Two friends on a rooftop at night", cap: "rooftop, 2am", note: "bas 5 min aur" },
  { name: "polaroid_3", alt: "A game controller on a bed", cap: "one more game", note: "(it was not one)" },
  { name: "polaroid_4", alt: "A coastal highway at dusk", cap: "road trip, probably", note: "kahan ja rahe the?" },
];

const TAPE = ["REC ●", "PLAY ▶ SP 00:07:21", "c. back then", "◀◀ REW", "TRACKING ▒▒▒░░"];

/** anime.js polaroid flip (same feel as the ch6 cards); reversible from scroll cues */
function flipPol(el: Element, toBack: boolean) {
  const inner = el.querySelector<HTMLElement>(".pol-inner");
  if (!inner) return;
  el.classList.toggle("is-flipped", toBack);
  if (prefersReduced()) {
    inner.style.transform = `rotateY(${toBack ? 180 : 0}deg)`;
    return;
  }
  animate(inner, {
    rotateY: toBack ? 180 : 0,
    scale: [{ to: 1.07, duration: 240 }, { to: 1, duration: 420 }],
    duration: 720,
    ease: "outBack(1.4)",
  });
}

/** 02 — THE MEMORIES: the camera floats forward, fragments drift, dissolves into polaroids. */
export function Ch02Layer() {
  return (
    <div className="layer ch2" data-ch="02">
      <div className="c2-scan" aria-hidden="true" />
      <div className="c2-tape desk-only">
        <Cassette className="c2-cassette" label="TAPE 01 · SIDE A" />
      </div>
      <div className="c2-frags" aria-hidden="true">
        <Obj name="controller" className="frag f1" depth={0.6} />
        <Obj name="earbuds" className="frag f2" depth={1.4} />
        <Obj name="coffee_mug" className="frag f3" depth={0.8} />
        <Obj name="headphones" className="frag f4" depth={1.2} />
        {TAPE.map((t, i) => (
          <span key={t} className={`tape mono t${i}`}>{t}</span>
        ))}
      </div>
      <div className="c2-pols">
        {POLAROIDS.map((p, i) => (
          <figure className={`pol pol${i}`} key={p.name} tabIndex={0} role="button" aria-label={`Flip the polaroid: ${p.alt}`}
            onClick={(e) => flipPol(e.currentTarget, !e.currentTarget.classList.contains("is-flipped"))}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); flipPol(e.currentTarget, !e.currentTarget.classList.contains("is-flipped")); } }}>
            <div className="pol-inner">
              <div className="pol-front">
                <Pic name={p.name} alt={p.alt} className="pol-pic" />
                {/* undeveloped print on top: fades out = the photo "develops" */}
                <Pic name="camera_photo" className="pol-dev" />
              </div>
              <div className="pol-back" aria-hidden="true">
                <span className="pol-cap">{p.cap}</span>
                <span className="pol-note">{p.note}</span>
                <span className="pol-stamp mono">XERO · TAPE 01</span>
              </div>
            </div>
            <figcaption className="pol-cap-rm">{p.cap}</figcaption>
          </figure>
        ))}
      </div>
      <NokiaKit className="c2-nokia" />
      <div className="c2-cam-wrap">
        <CameraKit className="c2-cam" />
      </div>
      <div className="c2-flash" aria-hidden="true" />
      <div className="copy-col c2-text">
        <Reveal as="h2" className="headline" text={STORY.ch2.copy} />
      </div>
      <Prompter className="c2-prompt side-right" text={STORY.ch2.long} />
    </div>
  );
}

export function buildCh02(api: SceneAPI, s: number): number {
  const { tl, q, one, small } = api;
  api.chapter("02", s);
  const layer = one(".ch2");
  api.layerIn(layer, s, 0.25);
  api.fieldTo("memories", s, 1);

  const cam = one(".c2-cam");
  const b = field.bends[0];
  // camera floats forward out of the dark
  tl.fromTo(cam, { scale: 0.18, opacity: 0, rotationY: -35, rotationX: 12, y: "8vh", transformPerspective: 900 },
    { scale: 1, opacity: 1, rotationY: 6, rotationX: 0, y: 0, duration: 1.3, ease: "power2.out", immediateRender: false }, s);
  tl.fromTo(b, { s: 0, x: 0.5, y: 0.5, r: 0.05 }, { s: 1, r: small ? 0.22 : 0.2, duration: 1.2, immediateRender: false }, s + 0.1);
  tl.fromTo(one(".c2-scan"), { opacity: 0 }, { opacity: 1, duration: 0.6, immediateRender: false }, s + 0.2);

  // fragments drift past at their own depth
  q(".c2-frags > *").forEach((el, i) => {
    const d = Number(getComputedStyle(el).getPropertyValue("--d")) || 0.6 + (i % 4) * 0.25;
    const at = s + 0.1 + i * 0.05;
    tl.fromTo(el, { y: `${40 * d}vh` }, { y: `${-45 * d}vh`, duration: 4.4, immediateRender: false }, at);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.6, ease: "power1.out", immediateRender: false }, at);
    // clear out before the shutter so nothing drifts under the HUD or into ch3
    // (on phones the long-form takes the lower half, so clear out before it starts)
    tl.to(el, { opacity: 0, duration: 0.4, ease: "power1.in" }, (small ? s + 1.5 : s + 1.75) + i * 0.03);
  });

  api.reveal(one(".c2-text .headline"), s + 0.8, s + 2.0);

  // camera slides aside for the long-form
  if (!small) {
    tl.to(cam, { x: "-20vw", rotationY: 18, scale: 0.9, duration: 1, ease: "sine.inOut" }, s + 1.6);
    tl.to(b, { x: 0.3, duration: 1, ease: "sine.inOut" }, s + 1.6);
  } else {
    tl.to(cam, { y: "-26vh", scale: 0.7, duration: 1, ease: "sine.inOut" }, s + 1.6);
    tl.to(b, { y: 0.24, duration: 1, ease: "sine.inOut" }, s + 1.6);
  }
  api.prompter(one(".c2-prompt"), s + 1.9, 2.4);

  // lens: focus twist while the camera floats in, and again while it hangs aside
  const lens = one(".cam-lens");
  tl.fromTo(lens, { rotation: -160, scale: 0.92 }, { rotation: 0, scale: 1, duration: 1.3, ease: "power2.out", immediateRender: false }, s);
  tl.to(lens, { rotation: 120, duration: 2.6, ease: "sine.inOut" }, s + 1.5);

  // nokia (back then): rises in on the left, LCD running, leaves before the shutter
  const nk = one(".c2-nokia");
  tl.fromTo(nk, { y: "60vh", rotation: -18 }, { y: "0vh", rotation: -8, duration: 1.1, ease: "power3.out", immediateRender: false }, s + 0.5);
  if (!small) tl.to(nk, { y: "-8vh", rotation: 4, duration: 2.0, ease: "sine.inOut" }, s + 1.6);
  // portrait: leaves sideways so it never crosses the headline at the top
  if (small) tl.to(nk, { x: "40vw", rotation: 24, duration: 0.5, ease: "power2.in" }, s + 1.4);
  else tl.to(nk, { y: "-90vh", rotation: 18, duration: 0.6, ease: "power2.in" }, s + 3.6);

  // cassette: drops in at the top, rides along, leaves before the shutter
  const tape = one(".c2-tape");
  if (!small) {
    tl.fromTo(tape, { y: "-30vh", rotation: -14, opacity: 0 }, { y: 0, rotation: -4, opacity: 1, duration: 0.7, ease: "back.out(1.5)", immediateRender: false }, s + 0.35);
    tl.to(tape, { y: "-4vh", rotation: 3, duration: 2.6, ease: "sine.inOut" }, s + 1.05);
    tl.to(tape, { y: "-34vh", rotation: 12, opacity: 0, duration: 0.5, ease: "power2.in" }, s + 3.75);
  }

  // shutter: the camera re-centres, then for EACH print: button press → flash → eject
  const shut = s + 4.6;
  const btn = one(".cam-btn");
  const camFlash = one(".cam-flash");
  tl.to(cam, { x: 0, y: small ? "-14vh" : "-8vh", scale: small ? 0.8 : 0.95, rotationY: 0, duration: 0.45, ease: "power2.inOut" }, shut);
  tl.to(lens, { rotation: 300, scale: 1.08, duration: 0.45, ease: "power2.inOut" }, shut);
  tl.to(b, { s: 0, x: 0.5, y: 0.5, duration: 0.5 }, shut);
  tl.to(one(".c2-prompt"), { opacity: 0, duration: 0.3 }, shut - 0.3);
  tl.fromTo(one(".c2-flash"), { opacity: 0 }, { opacity: 0.32, duration: 0.06, immediateRender: false }, shut + 0.5)
    .to(one(".c2-flash"), { opacity: 0, duration: 0.3 }, shut + 0.56);

  const pols = q(".pol");
  const camY = small ? -14 : -8;
  const fan = small
    ? [{ x: -23, y: -16, r: -8 }, { x: 23, y: -13, r: 6 }, { x: -22, y: 14, r: 5 }, { x: 23, y: 17, r: -6 }]
    : [{ x: -33, y: -3, r: -10 }, { x: -11, y: 4, r: 4 }, { x: 11, y: -3, r: -5 }, { x: 33, y: 4, r: 9 }];
  pols.forEach((p, i) => {
    const press = shut + 0.42 + i * 0.26;
    // the shutter button goes down… and springs back
    tl.to(btn, { scale: 0.82, y: "6%", duration: 0.05, ease: "power2.in" }, press);
    tl.to(btn, { scale: 1, y: 0, duration: 0.12, ease: "back.out(3)" }, press + 0.05);
    tl.fromTo(camFlash, { opacity: 0, scale: 0.4 }, { opacity: 1, scale: 1.4, duration: 0.04, immediateRender: false }, press + 0.05);
    tl.to(camFlash, { opacity: 0, scale: 2, duration: 0.12 }, press + 0.09);
    tl.to(cam, { rotation: i % 2 ? 1.6 : -1.6, duration: 0.05, yoyo: true, repeat: 1 }, press + 0.06);
    // eject: slides out of the slot (from under the camera body) and drops a touch
    const ej = press + 0.08;
    // the slot sits right of centre on the camera front
    tl.fromTo(p, { x: small ? "9vw" : "5.5vw", y: `${camY + 4}vh`, scale: 0.42, rotation: 0, opacity: 0 },
      { y: `${camY + 17}vh`, rotation: (i % 2 ? 1 : -1) * 4, opacity: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, ej);
    tl.to(p, { y: `${camY + 21}vh`, duration: 0.15, ease: "sine.out" }, ej + 0.3);
    // …and develops: the undeveloped print fades into the photo
    tl.fromTo(p.querySelector(".pol-dev"), { opacity: 1 }, { opacity: 0, duration: 0.7, ease: "sine.in", immediateRender: false }, ej + 0.25);
    // scatter into the fan
    const f = fan[i];
    tl.to(p, { x: `${f.x}vw`, y: `${f.y}vh`, rotation: f.r, scale: 1, duration: 0.7, ease: "back.out(1.3)" }, shut + 1.6 + i * 0.08);
    // flip to the caption (anime.js), and back if you scroll up
    api.cue(shut + 2.15 + i * 0.2, () => flipPol(p, true), () => flipPol(p, false));
    // then they float away
    tl.to(p, { y: `${f.y - 70}vh`, rotation: f.r * 2.4, opacity: 0, duration: 0.8, ease: "power1.in" }, shut + 3.15 + i * 0.06);
  });
  // keyboard: Tab visits each print while the fan is on screen
  pols.forEach((p) => api.focusStop(p, shut + 2.95));
  // the camera lifts away once it has printed everything
  tl.to(cam, { y: "-40vh", scale: 0.55, opacity: 0, duration: 0.55, ease: "power2.in" }, shut + 1.6);

  api.layerOut(layer, shut + 4.05, 0.1);
  // the next chapter starts once the prints have floated away
  return shut + 3.85;
}
