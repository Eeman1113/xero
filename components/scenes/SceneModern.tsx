"use client";
import { useRef } from "react";
import { useScrollScene } from "@/lib/useScrollScene";
import { Ch04Layer, buildCh04 } from "../chapters/Ch04Machine";
import { Ch05Layer, buildCh05 } from "../chapters/Ch05Noise";

/** Pinned scene 2: 04 MACHINE → 05 NOISE */
export default function SceneModern() {
  const ref = useRef<HTMLElement>(null);
  useScrollScene(ref, {
    startPreset: "takeoff",
    build: (api) => {
      const t = buildCh04(api, 0);
      buildCh05(api, t);
    },
  });
  return (
    <section ref={ref} className="scene scene-modern" id="modern">
      <div className="stage">
        <div className="stage-inner">
          <Ch04Layer />
          <Ch05Layer />
        </div>
      </div>
    </section>
  );
}
