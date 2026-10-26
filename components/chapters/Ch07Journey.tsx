"use client";
import { useEffect, useRef } from "react";
import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import { Vehicle } from "../kits/Kits";
import { STORY } from "@/lib/story";
import type { ObjectName } from "@/lib/assets";
import type { SceneAPI } from "@/lib/useScrollScene";
import { field } from "@/lib/field";

/** the cover, re-collaged from the v3 cut-outs (centre x/y + width as fractions of the square) */
export const COLLAGE: { name: ObjectName; x: number; y: number; w: number; r?: number }[] = [
  { name: "airplane", x: 0.27, y: 0.17, w: 0.36, r: -8 },
  { name: "robot_head", x: 0.72, y: 0.2, w: 0.15, r: 6 },
  { name: "glass_tower", x: 0.88, y: 0.3, w: 0.16 },
  { name: "cassette_body", x: 0.52, y: 0.31, w: 0.22, r: -6 },
  { name: "polaroid_2", x: 0.17, y: 0.42, w: 0.15, r: -10 },
  { name: "banana", x: 0.78, y: 0.47, w: 0.14, r: 14 },
  { name: "keyboard", x: 0.48, y: 0.5, w: 0.36, r: 4 },
  { name: "nokia", x: 0.12, y: 0.66, w: 0.08, r: -12 },
  { name: "camera_body", x: 0.33, y: 0.68, w: 0.2, r: -4 },
  { name: "coconut_oil", x: 0.53, y: 0.7, w: 0.06, r: 8 },
  { name: "controller", x: 0.72, y: 0.69, w: 0.21, r: -8 },
  { name: "card_1", x: 0.9, y: 0.66, w: 0.09, r: 12 },
  { name: "chai", x: 0.2, y: 0.86, w: 0.07 },
  { name: "vada_pav", x: 0.4, y: 0.87, w: 0.13 },
  { name: "headphones", x: 0.6, y: 0.88, w: 0.12, r: -10 },
  { name: "coffee_mug", x: 0.8, y: 0.87, w: 0.1 },
];

/** 07 — THE JOURNEY: the van rides a neon line; the camera pulls back and the cover assembles. */
export function Ch07Layer() {
  const vanRef = useRef<HTMLDivElement>(null);
  const autoRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    field.follower.el = vanRef.current;
    field.follower2.el = autoRef.current;
    return () => {
      field.follower.el = null;
      field.follower2.el = null;
    };
  }, []);
  return (
    <div className="layer ch7" data-ch="07">
      <div className="c7-collage" aria-hidden="true">
        {COLLAGE.map((c, i) => (
          <div key={c.name} className={`col-item ci-${c.name}`} data-i={i}
            style={{ left: `${c.x * 100}%`, top: `${c.y * 100}%`, width: `${c.w * 100}%`, ["--r" as string]: `${c.r ?? 0}deg` }}>
            <Obj name={c.name} depth={0.6 + (i % 5) * 0.2} className="col-obj" />
          </div>
        ))}
      </div>
      {/* van + auto kits: wheels behind the bodies in their empty arches; ContourField
          rides them along contour lines, spins the wheels by distance and bobs the bodies */}
      <Vehicle ref={autoRef} kind="auto" className="c7-auto" />
      <Vehicle ref={vanRef} kind="van" className="c7-van" />
      <Obj name="highway_board" className="c7-board" depth={0.7} />
      <Obj name="road_sign" className="c7-sign" depth={1.3} />
      <div className="copy-col c7-text">
        <Reveal as="h2" className="headline" text={STORY.ch7.copy} />
      </div>
      <Prompter className="c7-prompt side-left panel" text={STORY.ch7.long} />
    </div>
  );
}

export function buildCh07(api: SceneAPI, s: number): number {
  const { tl, q, one, small } = api;
  api.chapter("07", s);
  const layer = one(".ch7");
  api.layerIn(layer, s, 0.2);
  api.fieldTo("journey", s, 0.8);

  // van: rides the highlighted contour line left → right (the art faces right)
  const fol = field.follower;
  tl.fromTo(fol, { on: 0, t: -0.02 }, { on: 1, t: 0.15, duration: 0.4, immediateRender: false }, s + 0.2);
  tl.to(fol, { t: 1.02, duration: 3.6, ease: "sine.inOut" }, s + 0.6);
  // the auto: starts behind on a nearer line and overtakes (Mumbai rules)
  const f2 = field.follower2;
  tl.fromTo(f2, { on: 0, t: -0.12 }, { on: 1, t: 0.0, duration: 0.3, immediateRender: false }, s + 0.5);
  tl.to(f2, { t: 1.12, duration: 2.1, ease: "power1.in" }, s + 0.8);
  tl.to(f2, { on: 0, duration: 0.2 }, s + 2.9);

  // roadside: the board passes far away (slow), the sign passes close (fast) — parallax
  const board = one(".c7-board");
  tl.fromTo(board, { x: "70vw" }, { x: "-80vw", duration: 3.6, ease: "none", immediateRender: false }, s + 0.4);
  const sign = one(".c7-sign");
  tl.fromTo(sign, { x: "60vw", rotation: 6 }, { x: "-30vw", rotation: -3, duration: 2.0, ease: "none", immediateRender: false }, s + 1.4);
  tl.to(sign, { x: "-110vw", rotation: -8, duration: 0.8, ease: "power1.in" }, s + 3.4);
  tl.to(fol, { on: 0, duration: 0.3 }, s + 4.0);

  // the collage assembles: objects come in from far away, then the camera pulls back
  const box = one(".c7-collage");
  const items = q(".col-item");
  tl.fromTo(box, { scale: 2.4, x: small ? 0 : "6vw" }, { scale: 1, x: small ? 0 : () => (window.innerWidth < 1200 ? "21vw" : "16vw"), duration: 3.4, ease: "power2.inOut", immediateRender: false }, s + 0.3);
  items.forEach((it, i) => {
    const cx = parseFloat(it.style.left) / 100 - 0.5;
    const cy = parseFloat(it.style.top) / 100 - 0.5;
    tl.fromTo(it, { x: `${cx * 260}%`, y: `${cy * 260}%`, opacity: 0, rotation: (i % 2 ? 1 : -1) * 25 },
      { x: 0, y: 0, opacity: 1, rotation: 0, duration: 1.2, ease: "power3.out", immediateRender: false },
      s + 0.5 + i * 0.13);
  });
  if (small) {
    // phones: the long-form owns the lower half, so the collage lifts out of its way
    tl.to(box, { y: "-17vh", scale: 0.74, duration: 0.9, ease: "sine.inOut" }, s + 1.7);
  } else {
    tl.to(box, { scale: 0.86, duration: 0.8, ease: "sine.inOut" }, s + 3.7);
  }

  api.reveal(one(".c7-text .headline"), s + 0.5, s + 2.0);
  api.prompter(one(".c7-prompt"), s + 1.9, 2.9);
  const end = s + 5.2;
  tl.to(one(".c7-prompt"), { opacity: 0, duration: 0.3 }, end - 0.35);
  return end;
}
