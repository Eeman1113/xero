import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import Pic from "../ui/Pic";
import Kit from "../kits/Kit";
import { ChaiKit, GpuKit, LaptopKit, NeuralNet, RobotArm, ServerKit } from "../kits/Kits";
import { STORY } from "@/lib/story";
import type { ObjectName } from "@/lib/assets";
import type { SceneAPI } from "@/lib/useScrollScene";
import { field } from "@/lib/field";
import { gsap, ScrollTrigger } from "@/lib/gsap";

type Orbit = { name: ObjectName; r: number; a0: number; spin: number; depth: number; w: string; topic: number; mobile?: boolean; upright?: boolean };

/* Hero orbiters, each paired with a topic word (index into STORY.ch5.topics).
   r = radius (vmin), a0 = start angle (deg), spin = degrees travelled during the orbit */
const ORBITS: Orbit[] = [
  { name: "robot_head", r: 30, a0: -40, spin: 120, depth: 1.5, w: "clamp(90px, 10vw, 170px)", topic: 0, mobile: true },
  { name: "ballot_box_empty", r: 38, a0: 35, spin: 100, depth: 1.3, w: "clamp(120px, 12vw, 210px)", topic: 1, mobile: true, upright: true },
  { name: "glass_tower", r: 44, a0: 120, spin: 90, depth: 1.2, w: "clamp(80px, 9vw, 150px)", topic: 2, mobile: true },
  { name: "controller", r: 27, a0: 200, spin: 150, depth: 1.6, w: "clamp(110px, 12vw, 200px)", topic: 3, mobile: true },
  { name: "headphones", r: 40, a0: 260, spin: 110, depth: 1.25, w: "clamp(80px, 9vw, 150px)", topic: 4, mobile: true },
  { name: "coconut_oil", r: 48, a0: 300, spin: 85, depth: 1.05, w: "clamp(40px, 4.5vw, 72px)", topic: 4 },
  { name: "banana", r: 34, a0: 160, spin: 130, depth: 1.15, w: "clamp(80px, 9vw, 150px)", topic: 4 },
  { name: "earbuds", r: 22, a0: 80, spin: 180, depth: 1.4, w: "clamp(60px, 6vw, 100px)", topic: 4 },
  { name: "samosa", r: 52, a0: 10, spin: 70, depth: 0.95, w: "clamp(80px, 8vw, 130px)", topic: 4 },
];

/* culture spread during the long-form (left half on desktop, top half on phones) */
const CULTURE: { name: ObjectName; cls: string; d: number }[] = [
  { name: "vada_pav", cls: "cu1", d: 1.3 },
  { name: "samosa", cls: "cu2", d: 1.1 },
  { name: "coconut_oil", cls: "cu3", d: 0.9 },
  { name: "banana", cls: "cu4", d: 1.0 },
  { name: "earbuds", cls: "cu5", d: 1.4 },
];

const COLORS = ["#ff2a8c", "#ff9628", "#f0dc1e", "#28f03c", "#28e6f0"];

/** 05 — THE NOISE: the topics orbit; then the hosts' own worlds — the AI lab and the architect's table. */
export function Ch05Layer() {
  return (
    <div className="layer ch5" data-ch="05">
      <div className="c5-words" aria-hidden="true">
        {STORY.ch5.topics.map((t, i) => (
          <span key={t} className={`topic display tw${i}`} style={{ ["--c" as string]: COLORS[i] }}>{t}</span>
        ))}
      </div>
      <div className="c5-orbits">
        {ORBITS.map((o) => (
          <div key={o.name} className={`orb ${o.mobile ? "" : "desk-only"}`} data-r={o.r} data-a0={o.a0} data-spin={o.spin} data-upright={o.upright ? "1" : undefined}
            data-topic={o.topic} style={{ zIndex: Math.round(o.depth * 10) }}>
            <div className="orb-arm">
              {o.name === "ballot_box_empty" ? (
                // GOVERNMENT: a hand drops a slip into the ballot box (kit: box + hand, clipped at the slot)
                <Kit name="ballot" className="orb-item hero ballot" depth={o.depth} idle={0} style={{ width: o.w }} label="A ballot slip dropped into a ballot box">
                  <div className="bal-drop">
                    <div className="bal-hand">
                      <Pic name="ballot_hand" className="bal-hand-img" />
                    </div>
                  </div>
                  <Pic name="ballot_box_empty" className="bal-box" />
                </Kit>
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

      {/* ---------- the AI lab (Eeman — AI/ML engineer) ---------- */}
      <div className="beat c5-ai">
        <div className="beat-label">
          <span className="mono">05 · THE NOISE — AI</span>
          <h3 className="display">Eeman<span> · AI/ML engineer</span></h3>
        </div>
        <ServerKit className="ai-server" />
        <NeuralNet className="ai-nn" />
        <LaptopKit className="ai-laptop" />
        <GpuKit className="ai-gpu" />
        <Obj name="robot_head" className="ai-head desk-only" depth={1.2} />
        <div className="ai-floor" aria-hidden="true" />
        <div className="ai-chip ai-chip-table" aria-hidden="true">
          <span className="chip-glow" />
          <Pic name="ai_chip" />
        </div>
        <RobotArm className="ai-arm">
          <span className="ai-chip ai-chip-held"><span className="chip-glow" /><Pic name="ai_chip" /></span>
        </RobotArm>
        <div className="ai-chip ai-chip-drop" aria-hidden="true">
          <Pic name="ai_chip" />
        </div>
      </div>

      {/* ---------- the architect's table ---------- */}
      <div className="beat c5-arch">
        <div className="beat-label">
          <span className="mono">05 · THE NOISE — ARCHITECTURE</span>
          <h3 className="display">Adityavijayraj (Viju)<span> · Architect</span></h3>
        </div>
        <div className="ar-ground" aria-hidden="true" />
        <div className="ar-bld b1"><span className="dust" /><Obj name="chawl" depth={0.7} idle={0} /></div>
        <div className="ar-bld b2"><span className="dust" /><Obj name="brutalist" depth={0.8} idle={0} /></div>
        <div className="ar-bld b3"><span className="dust" /><Obj name="glass_tower" depth={0.75} idle={0} /></div>
        <div className="ar-sheet">
          <div className="ar-paper">
            <Pic name="blueprint_sheet" className="ar-sheet-img" />
            <svg className="ar-draw" viewBox="0 0 100 65" aria-hidden="true">
              <circle className="ar-circle" cx="58" cy="30" r="7.9" pathLength="1" />
            </svg>
          </div>
          <Obj name="blueprint_roll" className="ar-roll" depth={1.2} idle={0} />
          <Obj name="t_square" className="ar-tsq" depth={1.1} idle={0} />
          <Obj name="set_square" className="ar-set" depth={1.2} />
          <Obj name="scale_ruler" className="ar-ruler" depth={1.3} />
          <div className="ar-compass"><Obj name="compass" depth={1.4} idle={0} /></div>
        </div>
        <Obj name="scale_model" className="ar-model" depth={1.5} />
      </div>

      {/* ---------- culture, while the long-form plays ---------- */}
      <div className="c5-culture" aria-hidden="true">
        <ChaiKit className="cu0" />
        {CULTURE.map((c) => <Obj key={c.name} name={c.name} className={`cu ${c.cls}`} depth={c.d} idle={1.6} />)}
      </div>
      <Prompter className="c5-prompt side-right panel" text={STORY.ch5.long} />
    </div>
  );
}

const first = (q: (sel: string) => HTMLElement[], sel: string) => q(sel)[0] as HTMLElement | undefined;

/** arm poses (deg, relative to the art's rest pose): shoulder (lower) / elbow (upper) */
const POSE = {
  rest: { l: -8, u: -24 },
  grab: { l: 50, u: -10 },
  lift: { l: -22, u: -48 },
  drop: { l: -40, u: 22 },
};

export function buildCh05(api: SceneAPI, s: number): number {
  const { tl, q, one, small } = api;
  api.chapter("05", s);
  const layer = one(".ch5");
  api.layerIn(layer, s, 0.2);
  api.fieldTo("noise", s, 0.9);
  tl.fromTo(field, { rippleX: 0.3, rippleY: 0.4 }, { rippleX: 0.7, rippleY: 0.6, duration: 3.6, immediateRender: false }, s + 0.01);

  /* ================= A. the orbit ================= */
  const dur = 3.4;
  const scale = small ? 0.75 : 1;
  q(".orb").forEach((orb, i) => {
    const r = Number(orb.dataset.r) * scale;
    const a0 = Number(orb.dataset.a0);
    const spin = Number(orb.dataset.spin);
    const arm = orb.querySelector<HTMLElement>(".orb-arm")!;
    const item = orb.querySelector<HTMLElement>(".orb-item")!;
    tl.fromTo(orb, { rotation: a0 }, { rotation: a0 + spin, duration: dur + 0.6, immediateRender: false }, s);
    tl.fromTo(arm, { x: "130vmax" }, { x: `${r}vmin`, duration: 1.1, ease: "power3.out", immediateRender: false }, s + i * 0.05);
    const self = orb.dataset.upright ? 0 : i % 2 ? 40 : -40;
    tl.fromTo(item, { rotation: -a0, scale: 0.6 }, { rotation: -(a0 + spin) + self, scale: 1, duration: dur + 0.6, immediateRender: false }, s);
    tl.to(arm, { x: "140vmax", duration: 0.8, ease: "power2.in" }, s + dur - 0.1 + (i % 4) * 0.04);
  });

  // GOVERNMENT: the hand comes down, the slip slides into the slot (clipped), the box bounces
  const hand = first(q, ".bal-hand");
  const box = first(q, ".bal-box");
  if (hand && box) {
    const g = s + 0.9;
    tl.fromTo(hand, { yPercent: -150, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.35, ease: "power2.out", immediateRender: false }, g);
    tl.to(hand, { yPercent: 46, duration: 0.32, ease: "power1.in" }, g + 0.42);
    tl.fromTo(box, { scaleY: 1, scaleX: 1 }, { scaleY: 0.92, scaleX: 1.04, transformOrigin: "50% 100%", duration: 0.06, immediateRender: false }, g + 0.74);
    tl.to(box, { scaleY: 1, scaleX: 1, duration: 0.35, ease: "elastic.out(1, 0.35)" }, g + 0.8);
    tl.to(hand, { yPercent: -160, opacity: 0, duration: 0.4, ease: "power2.in" }, g + 0.9);
  }

  // topic words: each arrives with its object; the paired hero swells while its word is on stage
  q(".topic").forEach((w, i) => {
    const dir = i % 2 ? 1 : -1;
    const at = s + 0.15 + i * 0.36;
    tl.fromTo(w, { x: `${dir * 90}vw`, opacity: 0, rotation: dir * 4 },
      { x: `${-dir * 8}vw`, opacity: 1, rotation: -dir * 2, duration: 1.1, ease: "power2.out", immediateRender: false }, at);
    tl.to(w, { x: `${-dir * 110}vw`, opacity: 0, duration: 1, ease: "power1.in" }, at + 1.5);
    const heroes = q(`.orb[data-topic="${i}"] .orb-item`);
    if (heroes.length) {
      tl.fromTo(heroes, { "--hs": 1 }, { "--hs": 1.4, duration: 0.4, ease: "back.out(2)", immediateRender: false }, at + 0.6);
      tl.to(heroes, { "--hs": 1, duration: 0.5, ease: "power1.inOut" }, at + 1.5);
    }
  });

  const sticker = one(".c5-text .headline");
  tl.fromTo(sticker, { autoAlpha: 0, scale: 0.86, rotation: -7 },
    { autoAlpha: 1, scale: 1, rotation: 0, duration: 0.35, ease: "back.out(1.8)", immediateRender: false }, s + 0.55);
  api.reveal(sticker, s + 0.7);
  tl.to(sticker, { autoAlpha: 0, scale: 0.9, rotation: 4, duration: 0.3, ease: "power2.in" }, s + 2.75);

  /* ================= B. the AI lab ================= */
  const a = s + 3.6;
  const ai = one(".c5-ai");
  api.layerIn(ai, a, 0.25);
  api.fieldTo("lab", a, 0.8);
  const aiLabel = ai.querySelector(".beat-label")!;
  tl.fromTo(aiLabel, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, a + 0.05);

  const server = one(".ai-server");
  tl.fromTo(server, { x: "-34vw", rotation: -6 }, { x: 0, rotation: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, a + 0.05);
  const laptop = one(".ai-laptop");
  tl.fromTo(laptop, { y: "40vh", rotation: 6, scale: 0.8 }, { y: 0, rotation: 0, scale: 1, duration: 0.6, ease: "back.out(1.3)", immediateRender: false }, a + 0.15);
  const gpu = one(".ai-gpu");
  tl.fromTo(gpu, { y: "-50vh", rotation: -14 }, { y: 0, rotation: -4, duration: 0.6, ease: "back.out(1.4)", immediateRender: false }, a + 0.25);
  // fans spin up with the scroll (scrubbed rotation on top of the CSS idle spin)
  tl.fromTo(q(".ai-gpu .gpu-fan-img"), { rotation: 0 }, { rotation: 2600, duration: 3.3, ease: "power2.in", immediateRender: false }, a + 0.3);
  const head = first(q, ".ai-head");
  if (head) {
    tl.fromTo(head, { y: "-30vh", rotation: 0 }, { y: 0, rotation: -8, duration: 0.5, ease: "power3.out", immediateRender: false }, a + 0.35);
    tl.to(head, { rotation: 7, x: "1.2vw", duration: 1.4, ease: "sine.inOut" }, a + 1.0);
    tl.to(head, { rotation: -4, x: 0, duration: 1.1, ease: "sine.inOut" }, a + 2.4);
  }

  // training run: loss curve draws, counters tick
  const loss = ai.querySelector(".lap-loss")!;
  const ep = ai.querySelector(".lap-epoch")!;
  const lv = ai.querySelector(".lap-val")!;
  const run = { k: 0 };
  tl.fromTo(run, { k: 0 }, {
    k: 1, duration: 2.3, ease: "none", immediateRender: false,
    onUpdate: () => {
      ep.textContent = String(Math.round(run.k * 100));
      lv.textContent = (0.08 + 2.23 * Math.exp(-run.k * 4.2)).toFixed(3);
    },
  }, a + 0.6);
  tl.fromTo(loss, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 2.3, ease: "none", immediateRender: false }, a + 0.6);

  // neural net: graph pops in, then lights up layer by layer
  const nn = one(".ai-nn");
  tl.fromTo(nn, { scale: 0.6, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45, ease: "back.out(1.6)", immediateRender: false }, a + 0.45);
  q(".ai-nn .nn-l").forEach((g, i) => {
    const at = a + 0.9 + i * 0.4;
    tl.fromTo(g.querySelectorAll("circle"), { fill: "#0b0b0b" }, { fill: "#28f03c", duration: 0.18, stagger: 0.03, immediateRender: false }, at);
    tl.to(g.querySelectorAll("circle"), { fill: "#0b0b0b", duration: 0.3 }, at + 0.45);
    const e = ai.querySelector(`.nn-e${i}`);
    if (e) tl.fromTo(e, { opacity: 0.35 }, { opacity: 1, duration: 0.2, yoyo: true, repeat: 1, immediateRender: false }, at + 0.15);
  });

  // the robot arm reaches, picks up the AI chip, shows it off, and drops it
  const lower = one(".ai-arm .ra-lower");
  const upper = one(".ai-arm .ra-upper");
  const grip = one(".ai-arm .ra-grip");
  const chipT = one(".ai-chip-table");
  const chipH = one(".ai-chip-held");
  const chipD = one(".ai-chip-drop");
  const armKit = one(".ai-arm");
  const geo = { fall: 200 };
  const measure = () => {
    const lo = gsap.getProperty(lower, "rotation");
    const up = gsap.getProperty(upper, "rotation");
    // layout position of the arm (offsetLeft/Top ignore its entrance transform) + gripper offset
    const at = (p: { l: number; u: number }) => {
      gsap.set(lower, { rotation: p.l });
      gsap.set(upper, { rotation: p.u });
      const r = grip.getBoundingClientRect();
      const k = armKit.getBoundingClientRect();
      return { x: armKit.offsetLeft + r.left - k.left, y: armKit.offsetTop + r.top - k.top };
    };
    const g1 = at(POSE.grab);
    const g2 = at(POSE.drop);
    gsap.set(lower, { rotation: lo });
    gsap.set(upper, { rotation: up });
    chipT.style.left = `${g1.x}px`;
    chipT.style.top = `${g1.y}px`;
    chipD.style.left = `${g2.x}px`;
    chipD.style.top = `${g2.y}px`;
    geo.fall = Math.max(40, ai.clientHeight * 0.95 - chipD.offsetHeight / 2 - g2.y);
  };
  measure();
  ScrollTrigger.addEventListener("refreshInit", measure);
  api.cleanup(() => ScrollTrigger.removeEventListener("refreshInit", measure));

  tl.fromTo(armKit, { x: "40vw" }, { x: 0, duration: 0.6, ease: "power3.out", immediateRender: false }, a + 0.2);
  tl.fromTo([lower, upper], { rotation: (i: number) => (i ? POSE.rest.u : POSE.rest.l) },
    { rotation: (i: number) => (i ? POSE.grab.u : POSE.grab.l), duration: 0.7, ease: "power2.inOut", immediateRender: false }, a + 0.8);
  const grab = a + 1.5;
  tl.fromTo(chipT, { opacity: 1 }, { opacity: 0, duration: 0.01, immediateRender: false }, grab);
  tl.fromTo(chipH, { opacity: 0, scale: 1.12 }, { opacity: 1, scale: 1, duration: 0.12, immediateRender: false }, grab);
  tl.to(lower, { rotation: POSE.lift.l, duration: 0.6, ease: "power2.inOut" }, grab + 0.1);
  tl.to(upper, { rotation: POSE.lift.u, duration: 0.6, ease: "power2.inOut" }, grab + 0.15);
  tl.to(chipH.querySelector(".chip-glow"), { opacity: 1, scale: 1.6, duration: 0.3, yoyo: true, repeat: 1 }, grab + 0.6);
  tl.to(lower, { rotation: POSE.drop.l, duration: 0.5, ease: "power2.inOut" }, grab + 1.0);
  tl.to(upper, { rotation: POSE.drop.u, duration: 0.5, ease: "power2.inOut" }, grab + 1.0);
  const rel = grab + 1.55;
  tl.to(chipH, { opacity: 0, duration: 0.01 }, rel);
  tl.fromTo(chipD, { opacity: 0, y: 0, rotation: 0 }, { opacity: 1, duration: 0.01, immediateRender: false }, rel);
  tl.to(chipD, { y: () => geo.fall, rotation: 24, duration: 0.3, ease: "power2.in" }, rel + 0.01);
  tl.to(chipD, { y: () => geo.fall - 26, duration: 0.09, ease: "power1.out" }, rel + 0.31);
  tl.to(chipD, { y: () => geo.fall, rotation: 16, duration: 0.1, ease: "power1.in" }, rel + 0.4);
  tl.to([lower, upper], { rotation: (i: number) => (i ? POSE.rest.u : POSE.rest.l), duration: 0.5, ease: "power2.inOut" }, rel + 0.15);

  const aOut = a + 3.65;
  // the whole lab clears out together (label, arm and the dropped chip too)
  // before the architect's table arrives: no cross-fade of two beats
  tl.to([aiLabel, server, laptop, gpu, nn, armKit, chipD, ...(head ? [head] : [])], { y: "-12vh", opacity: 0, duration: 0.35, stagger: 0.025, ease: "power2.in" }, aOut - 0.1);
  api.layerOut(ai, aOut + 0.45, 0.05);

  /* ================= C. the architect ================= */
  const b = a + 3.8;
  const arch = one(".c5-arch");
  api.layerIn(arch, b, 0.25);
  api.fieldTo("drafting", b, 0.8);
  tl.fromTo(arch.querySelector(".beat-label")!, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, b + 0.05);

  // the roll unrolls across the table, the sheet is revealed behind it
  const paper = one(".ar-paper");
  const roll = one(".ar-roll");
  tl.fromTo(paper, { clipPath: "inset(0% 100% 0% 0%)" }, { clipPath: "inset(0% 0% 0% 0%)", duration: 0.7, ease: "power2.inOut", immediateRender: false }, b + 0.08);
  tl.fromTo(roll, { left: "-4%", rotation: 0, opacity: 1 }, { left: "96%", rotation: 540, duration: 0.7, ease: "power2.inOut", immediateRender: false }, b + 0.08);
  tl.to(roll, { opacity: 0, y: "-8vh", duration: 0.25, ease: "power2.in" }, b + 1.0);

  const tsq = one(".ar-tsq");
  tl.fromTo(tsq, { x: "-110vw", rotation: -90 }, { x: 0, rotation: -90, duration: 0.6, ease: "power3.out", immediateRender: false }, b + 0.85);
  tl.to(tsq, { x: "6vw", duration: 1.4, ease: "sine.inOut" }, b + 1.45);

  // compass drops in, then swings round its needle while the circle draws
  const comp = one(".ar-compass");
  tl.fromTo(comp, { y: "-60vh", opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power3.out", immediateRender: false }, b + 1.05);
  tl.fromTo(comp, { rotation: 0 }, { rotation: 330, duration: 1.0, ease: "sine.inOut", immediateRender: false }, b + 1.45);
  tl.fromTo(one(".ar-circle"), { strokeDashoffset: 1 }, { strokeDashoffset: 0.08, duration: 1.0, ease: "sine.inOut", immediateRender: false }, b + 1.45);
  tl.to(comp, { y: "-70vh", rotation: 380, duration: 0.4, ease: "power2.in" }, b + 2.55);

  tl.fromTo(one(".ar-set"), { y: "-70vh", rotation: -40 }, { y: 0, rotation: 8, duration: 0.45, ease: "bounce.out", immediateRender: false }, b + 1.5);
  tl.fromTo(one(".ar-ruler"), { y: "-70vh", rotation: 50 }, { y: 0, rotation: -12, duration: 0.45, ease: "bounce.out", immediateRender: false }, b + 1.7);

  // buildings RISE out of the ground line, each kicking up dust
  q(".ar-bld").forEach((bl, i) => {
    const at = b + 1.9 + i * 0.22;
    const o = bl.querySelector<HTMLElement>(".obj")!;
    tl.fromTo(o, { yPercent: 100 }, { yPercent: 0, duration: 0.55, ease: "power3.out", immediateRender: false }, at);
    const dust = bl.querySelector(".dust")!;
    tl.fromTo(dust, { opacity: 0, scale: 0.3 }, { opacity: 0.9, scale: 1, duration: 0.2, immediateRender: false }, at + 0.05);
    tl.to(dust, { opacity: 0, scale: 1.6, duration: 0.5, ease: "power1.out" }, at + 0.25);
  });
  const model = one(".ar-model");
  tl.fromTo(model, { y: "30vh", rotation: -14, scale: 0.7, opacity: 0 }, { y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.5)", immediateRender: false }, b + 2.5);
  tl.to(model, { rotation: 4, x: "1vw", duration: 1.0, ease: "sine.inOut" }, b + 3.1);

  const bOut = b + 3.9;
  tl.to([arch.querySelector(".beat-label")!, ...q(".ar-sheet, .ar-model, .ar-bld")], { y: "-10vh", opacity: 0, duration: 0.35, stagger: 0.04, ease: "power2.in" }, bOut - 0.1);
  api.layerOut(arch, bOut + 0.3, 0.05);

  /* ================= D. culture + the long-form ================= */
  const c = b + 4.0;
  api.fieldTo("noise", c, 0.6);
  const cu = q(".c5-culture > *");
  tl.fromTo(one(".c5-culture"), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, immediateRender: false }, c);
  cu.forEach((el, i) => {
    tl.fromTo(el, { y: "50vh", rotation: (i % 2 ? 1 : -1) * 30, scale: 0.6 },
      { y: 0, rotation: (i % 2 ? -1 : 1) * 6, scale: 1, duration: 0.55, ease: "back.out(1.6)", immediateRender: false }, c + 0.05 + i * 0.09);
    tl.to(el, { y: `${-6 - (i % 3) * 4}vh`, rotation: (i % 2 ? 1 : -1) * 8, duration: 2.2, ease: "sine.inOut" }, c + 0.7 + i * 0.05);
  });
  tl.to(one(".c5-words"), { opacity: 0, duration: 0.3 }, c);
  api.prompter(one(".c5-prompt"), c + 0.1, 2.6);
  const end = c + 2.95;
  // the snacks pop away where they float (never flying up across the HUD)
  tl.to(cu, { scale: 0, rotation: (i: number) => (i % 2 ? 40 : -40), duration: 0.3, stagger: 0.03, ease: "back.in(2)" }, end - 0.32);
  tl.to(one(".c5-prompt"), { opacity: 0, duration: 0.25 }, end - 0.25);
  api.layerOut(layer, end + 0.1, 0.03);
  return end;
}
