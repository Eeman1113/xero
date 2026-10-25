"use client";
import { useEffect, useRef } from "react";
import Reveal from "../ui/Reveal";
import Prompter from "../ui/Prompter";
import Obj from "../ui/Obj";
import Pic from "../ui/Pic";
import { STORY } from "@/lib/story";
import type { ObjectName } from "@/lib/assets";
import type { SceneAPI } from "@/lib/useScrollScene";
import { field } from "@/lib/field";

/** positions sampled from the cover art (centre x/y + width, as fractions of the square) */
export const COLLAGE: { name: ObjectName; x: number; y: number; w: number; r?: number }[] = [
  { name: "alien_eye", x: 0.69, y: 0.2, w: 0.27 },
  { name: "marker", x: 0.54, y: 0.19, w: 0.045, r: 8 },
  { name: "airplane", x: 0.22, y: 0.28, w: 0.31 },
  { name: "mythbusters", x: 0.51, y: 0.29, w: 0.2 },
  { name: "banana", x: 0.49, y: 0.38, w: 0.15 },
  { name: "tablet", x: 0.25, y: 0.39, w: 0.12 },
  { name: "club", x: 0.36, y: 0.39, w: 0.04 },
  { name: "apple", x: 0.385, y: 0.435, w: 0.035 },
  { name: "farcry", x: 0.3, y: 0.5, w: 0.09 },
  { name: "keyboard", x: 0.44, y: 0.51, w: 0.22 },
  { name: "camera", x: 0.5, y: 0.6, w: 0.13 },
  { name: "coconut_oil", x: 0.34, y: 0.64, w: 0.1 },
  { name: "nokia", x: 0.61, y: 0.6, w: 0.08 },
  { name: "splatter", x: 0.7, y: 0.61, w: 0.11 },
  { name: "knife", x: 0.26, y: 0.73, w: 0.2 },
  { name: "cards", x: 0.64, y: 0.73, w: 0.21 },
];

/** 07 — THE JOURNEY: the van rides a neon line; the camera pulls back and the cover assembles. */
export function Ch07Layer() {
  const vanRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    field.follower.el = vanRef.current;
    return () => {
      field.follower.el = null;
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
      <div ref={vanRef} className="c7-van" aria-hidden="true">
        {/* van kit: wheels sit BEHIND the body in its empty arches; ContourField
            spins them by distance travelled and bobs the body on its suspension */}
        <Pic name="van_wheel" className="van-wheel w-rear" />
        <Pic name="van_wheel" className="van-wheel w-front" />
        <div className="van-bob">
          <Pic name="van_body" className="van-body" />
        </div>
      </div>
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

  // road sign slides in from the right as the van approaches it, then drifts off as the camera pulls back
  const sign = one(".c7-sign");
  tl.fromTo(sign, { x: "45vw", rotation: 8, opacity: 0 }, { x: 0, rotation: -2, opacity: 1, duration: 1, ease: "power3.out", immediateRender: false }, s + 1.5);
  tl.to(sign, { x: "-6vw", y: "-3vh", duration: 1.2 }, s + 2.5);
  tl.to(sign, { x: "40vw", opacity: 0, rotation: 10, duration: 0.6, ease: "power2.in" }, s + 3.8);
  tl.to(fol, { on: 0, duration: 0.3 }, s + 4.0);

  // the collage assembles: objects come in from far away, then the camera pulls back
  const box = one(".c7-collage");
  const items = q(".col-item");
  tl.fromTo(box, { scale: 2.4, x: small ? 0 : "6vw" }, { scale: 1, x: small ? 0 : "16vw", duration: 3.4, ease: "power2.inOut", immediateRender: false }, s + 0.3);
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
