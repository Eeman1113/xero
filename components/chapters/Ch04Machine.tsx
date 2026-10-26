import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import Pic from "../ui/Pic";
import { MicKit } from "../kits/Kits";
import { STORY } from "@/lib/story";
import type { ObjectName } from "@/lib/assets";
import type { SceneAPI } from "@/lib/useScrollScene";
import { field } from "@/lib/field";

const KEYS = ["W", "T", "?", "CTRL", "Z", "⌘", "ALT", "DEL", "!", "TAB"];

/** half-asked questions that just drift past (UI flavour text) */
const DRIFT = ["why is rent like that", "should we learn rust or just vibe", "is this a bug or a feature", "kya scene hai cloud ka?"];

/** questions that pop up INSIDE speech bubbles (UI flavour text) */
export const BUBBLES: { name: ObjectName; text: string }[] = [
  { name: "bubble_1", text: "bhai, is AI taking our jobs?" },
  { name: "bubble_2", text: "who approved this meeting??" },
  { name: "bubble_3", text: "reply-all. why. WHY." },
  { name: "bubble_4", text: "ctrl+z on adulthood?" },
];

const XERO_KEYS: ObjectName[] = ["keycap_x", "keycap_e", "keycap_r", "keycap_o"];

/** A speech bubble kit piece with its text set inside the (dark) interior. */
export function Bubble({ name, text, className }: { name: ObjectName; text: string; className?: string }) {
  return (
    <div className={`bub bub-${name} ${className ?? ""}`}>
      <Pic name={name} className="bub-img" />
      <span className="bub-t">{text}</span>
    </div>
  );
}

/** 04 — THE MACHINE: the keyboard rises at you; keycaps + half-asked questions fly past. */
export function Ch04Layer() {
  return (
    <div className="layer ch4" data-ch="04">
      <div className="c4-keys" aria-hidden="true">
        {KEYS.map((k, i) => (
          <span key={i} className={`keycap ${k.length > 2 ? "wide" : ""}`}>
            <span>{k}</span>
          </span>
        ))}
      </div>
      <div className="c4-qs" aria-hidden="true">
        {DRIFT.map((q, i) => (
          <span key={i} className={`q mono q${i}`}>{q}</span>
        ))}
      </div>
      <div className="c4-bubbles" aria-hidden="true">
        {BUBBLES.map((b, i) => (
          <Bubble key={b.name} name={b.name} text={b.text} className={`c4-b c4-b${i}`} />
        ))}
      </div>
      <div className="c4-kb-wrap">
        <Obj name="keyboard" className="c4-kb" depth={1.5} keep />
      </div>
      <div className="c4-xero" aria-label="XERO, typed in keycaps">
        {XERO_KEYS.map((k) => (
          <div key={k} className="xk" data-press="">
            <span className="xk-glow" aria-hidden="true" />
            <span className="xk-press"><Pic name={k} className="xk-img" /></span>
          </div>
        ))}
        <div className="xk-space" data-press="">
          <span className="xk-glow" aria-hidden="true" />
          <span className="xk-press"><Pic name="keycap_space" className="xk-img" /></span>
        </div>
      </div>
      <div className="xk-acc c4-esc desk-only" data-press="" aria-hidden="true">
        <span className="xk-press"><Pic name="keycap_esc" className="xk-img" /></span>
      </div>
      <div className="xk-acc c4-enter desk-only" data-press="" aria-hidden="true">
        <span className="xk-glow" />
        <span className="xk-press"><Pic name="keycap_enter" className="xk-img" /></span>
      </div>
      <MicKit className="c4-mic" depth={1.3} />
      <div className="copy-col c4-text">
        <Reveal as="h2" className="headline" text={STORY.ch4.copy} />
      </div>
      <Prompter className="c4-prompt side-left" text={STORY.ch4.long} />
    </div>
  );
}

/** elastic pop-in / quick pop-out for a bubble */
export function popBubble(api: SceneAPI, el: HTMLElement, at: number, out: number, tilt = -10) {
  const { tl } = api;
  tl.fromTo(el, { scale: 0, rotation: tilt, opacity: 0 },
    { scale: 1, rotation: 0, opacity: 1, duration: 0.42, ease: "elastic.out(1, 0.55)", immediateRender: false }, at);
  tl.to(el, { scale: 0.55, rotation: -tilt * 0.6, opacity: 0, duration: 0.18, ease: "power2.in" }, out);
}

export function buildCh04(api: SceneAPI, s: number): number {
  const { tl, q, one, small } = api;
  api.chapter("04", s);
  const layer = one(".ch4");
  api.layerIn(layer, s, 0.2);
  api.fieldTo("machine", s, 1);

  // the keyboard is the opening focal point: it rises out of the dark right away
  const kb = one(".c4-kb");
  tl.fromTo(kb, { y: "26vh", rotationX: 40, scale: 0.72, transformPerspective: 900 },
    { y: small ? "4vh" : "14vh", rotationX: 6, scale: small ? 1 : 1.12, duration: 1.0, ease: "power2.out", immediateRender: false }, s);
  tl.fromTo(kb, { opacity: 0 }, { opacity: 1, duration: 0.22, immediateRender: false }, s);
  tl.to(kb, { y: small ? "-14vh" : "8vh", x: small ? 0 : "18vw", rotationX: 2, rotationZ: -3, scale: small ? 0.8 : 1, duration: 1, ease: "sine.inOut" }, s + 1.7);

  // keycaps fly out of the keyboard toward (and past) the viewer
  const keys = q(".keycap");
  keys.forEach((k, i) => {
    const ang = (i / keys.length) * Math.PI * 2 + (i % 3) * 0.4;
    const dist = small ? 55 : 70;
    const tx = Math.cos(ang) * dist;
    const ty = Math.sin(ang) * dist * 0.75;
    // all of them are gone before the long-form starts (pAt = s + 2.4)
    const at = s + 0.3 + (i % 8) * 0.14;
    tl.fromTo(k, { x: `${tx * 0.08}vw`, y: `${ty * 0.08 + 10}vh`, scale: 0.15, opacity: 0, rotation: 0 },
      { x: `${tx}vw`, y: `${ty}vh`, scale: 1.7, opacity: 1, rotation: (i % 2 ? 1 : -1) * 35, duration: 1.15, ease: "power2.in", immediateRender: false }, at);
    tl.to(k, { opacity: 0, duration: 0.25 }, at + 0.9);
  });

  // half-asked questions drift across at different depths
  q(".c4-qs .q").forEach((el, i) => {
    const dir = i % 2 ? -1 : 1;
    const at = s + 0.4 + i * 0.25;
    tl.fromTo(el, { x: `${dir * 70}vw` }, { x: `${-dir * 70}vw`, duration: 1.9, immediateRender: false }, at);
    tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4, immediateRender: false }, at);
    tl.to(el, { opacity: 0, duration: 0.4 }, at + 1.4);
  });

  // …and the sharper ones pop up in speech bubbles
  const bubbleTimes = [
    [0.6, 1.6],
    [1.0, 2.1],
    [1.45, 2.35],
    [1.7, 2.4],
  ];
  q(".c4-b").forEach((b, i) => {
    const [a, o] = bubbleTimes[i];
    popBubble(api, b, s + a, s + o, i % 2 ? 12 : -12);
  });

  api.reveal(one(".c4-text .headline"), s + 0.9, s + 2.4);
  const pAt = s + 2.4;
  api.prompter(one(".c4-prompt"), pAt, 2.6);
  // half-asked questions are gone while the long-form is being read
  tl.to(one(".c4-qs"), { opacity: 0, duration: 0.3, ease: "sine.inOut" }, pAt - 0.2);

  // X E R O: four keys rain in from depth and land in a row, each one PRESSED as it lands
  const xks = q(".xk");
  xks.forEach((k, i) => {
    // they land only once the headline has gone (out at s + 2.4): nothing falls through the copy
    const land = s + 2.55 + i * 0.14;
    const img = k.querySelector<HTMLElement>(".xk-img")!;
    const glow = k.querySelector<HTMLElement>(".xk-glow")!;
    tl.fromTo(k, { y: "-48vh", x: `${(i - 1.5) * -6}vw`, scale: 3, rotation: (i % 2 ? 1 : -1) * 28, opacity: 0 },
      { y: 0, x: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.32, ease: "power3.in", immediateRender: false }, land - 0.32);
    tl.fromTo(img, { scaleY: 1, scaleX: 1 }, { scaleY: 0.78, scaleX: 1.1, transformOrigin: "50% 100%", duration: 0.05, ease: "power2.out", immediateRender: false }, land);
    tl.to(img, { scaleY: 1, scaleX: 1, duration: 0.3, ease: "elastic.out(1, 0.35)" }, land + 0.05);
    tl.fromTo(glow, { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.25, duration: 0.08, immediateRender: false }, land);
    tl.to(glow, { opacity: 0, scale: 1.5, duration: 0.45, ease: "power1.out" }, land + 0.08);
  });

  // the space bar SLAMS down under the word like a rubber stamp; the letters jump
  const space = one(".xk-space");
  const slam = s + 2.55 + 4 * 0.14 + 0.1;
  tl.fromTo(space, { y: "-30vh", scale: 2.4, rotation: -6, opacity: 0 },
    { y: 0, scale: 1, rotation: 0, opacity: 1, duration: 0.22, ease: "power4.in", immediateRender: false }, slam - 0.22);
  tl.fromTo(space.querySelector(".xk-img"), { scaleY: 1 }, { scaleY: 0.72, scaleX: 1.04, transformOrigin: "50% 100%", duration: 0.04, immediateRender: false }, slam);
  tl.to(space.querySelector(".xk-img"), { scaleY: 1, scaleX: 1, duration: 0.3, ease: "elastic.out(1, 0.3)" }, slam + 0.04);
  tl.fromTo(space.querySelector(".xk-glow"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1.3, duration: 0.05, immediateRender: false }, slam);
  tl.to(space.querySelector(".xk-glow"), { opacity: 0, scale: 1.7, duration: 0.4 }, slam + 0.05);
  // …and the slam sends a shockwave through the contour lines from under the word
  tl.fromTo(field, { rippleX: small ? 0.5 : 0.68, rippleY: small ? 0.52 : 0.88 }, { rippleX: small ? 0.5 : 0.68, rippleY: small ? 0.52 : 0.88, duration: 0.01, immediateRender: false }, slam - 0.02);
  tl.fromTo(api.field, { ripple: 0 }, { ripple: 1.4, duration: 0.05, ease: "power2.out", immediateRender: false }, slam);
  tl.to(api.field, { ripple: 0, duration: 0.7, ease: "power2.out" }, slam + 0.05);
  tl.to(xks, { y: -14, duration: 0.07, ease: "power2.out", stagger: 0.015 }, slam + 0.01);
  tl.to(xks, { y: 0, duration: 0.25, ease: "bounce.out", stagger: 0.015 }, slam + 0.09);

  // ESC + ENTER: playful floating accents (desktop)
  if (!small) {
    const esc = one(".c4-esc");
    tl.fromTo(esc, { x: "30vw", y: "-10vh", rotation: 40, opacity: 0 },
      { x: 0, y: 0, rotation: -14, opacity: 1, duration: 0.6, ease: "back.out(1.6)", immediateRender: false }, pAt + 0.05);
    tl.to(esc, { y: "-5vh", rotation: -6, duration: 2.0, ease: "sine.inOut" }, pAt + 0.65);
    const enter = one(".c4-enter");
    tl.fromTo(enter, { y: "40vh", rotation: 18, opacity: 0 },
      { y: 0, rotation: 6, opacity: 1, duration: 0.55, ease: "back.out(1.5)", immediateRender: false }, pAt + 0.15);
    // "So we came back to the microphone." — ENTER is pressed
    const eImg = enter.querySelector<HTMLElement>(".xk-img")!;
    const eGlow = enter.querySelector<HTMLElement>(".xk-glow")!;
    [pAt + 0.85, pAt + 1.2].forEach((t) => {
      tl.to(eImg, { scaleY: 0.8, scaleX: 1.06, transformOrigin: "50% 100%", duration: 0.05 }, t);
      tl.to(eImg, { scaleY: 1, scaleX: 1, duration: 0.28, ease: "elastic.out(1, 0.35)" }, t + 0.05);
      tl.fromTo(eGlow, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1.2, duration: 0.06, immediateRender: false }, t);
      tl.to(eGlow, { opacity: 0, scale: 1.5, duration: 0.3 }, t + 0.06);
    });
  }

  // "So we came back to the microphone."
  const mic = one(".c4-mic");
  tl.fromTo(mic, { y: "40vh", scale: 0.6, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.6)", immediateRender: false }, pAt + 0.6);

  const end = pAt + 3.1;
  // the machine powers off like an old CRT: the whole frame collapses into a
  // bright scan line, then a dot — one quick, deliberate exit instead of
  // half-faded objects drifting off the edges
  const off = end - 0.32;
  tl.fromTo(layer, { scaleY: 1, scaleX: 1, filter: "brightness(1)" },
    { scaleY: 0.004, filter: "brightness(2.6)", duration: 0.2, ease: "power3.in", transformOrigin: "50% 50%", immediateRender: false }, off);
  // autoAlpha (not opacity): scrolling back must also restore visibility after layerOut
  tl.to(layer, { scaleX: 0, autoAlpha: 0, duration: 0.12, ease: "power2.in" }, off + 0.2);
  api.layerOut(layer, end + 0.15, 0.1);
  return end;
}
