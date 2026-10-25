"use client";
import { useRef } from "react";
import { useScrollScene } from "@/lib/useScrollScene";
import { Ch07Layer, buildCh07 } from "../chapters/Ch07Journey";
import { Ch08Layer, buildCh08 } from "../chapters/Ch08PressPlay";

/** Pinned scene 4: 07 JOURNEY → 08 PRESS PLAY */
export default function SceneRoad() {
  const ref = useRef<HTMLElement>(null);
  useScrollScene(ref, {
    startPreset: "wildcard",
    build: (api) => {
      const t = buildCh07(api, 0);
      buildCh08(api, t);
    },
  });
  return (
    <section ref={ref} className="scene scene-road" id="road">
      <div className="stage">
        <div className="stage-inner">
          <Ch07Layer />
          <Ch08Layer />
        </div>
      </div>
    </section>
  );
}
