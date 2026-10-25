"use client";
import { useRef } from "react";
import { useScrollScene } from "@/lib/useScrollScene";
import { Ch01Layer, buildCh01 } from "../chapters/Ch01Signal";
import { Ch02Layer, buildCh02 } from "../chapters/Ch02Memories";
import { Ch03Layer, buildCh03 } from "../chapters/Ch03Takeoff";

/** Pinned scene 1: 01 SIGNAL → 02 MEMORIES → 03 TAKEOFF */
export default function SceneOrigins() {
  const ref = useRef<HTMLElement>(null);
  useScrollScene(ref, {
    startPreset: "signal0",
    build: (api) => {
      const t1 = buildCh01(api);
      const t2 = buildCh02(api, t1);
      buildCh03(api, t2);
    },
  });
  return (
    <section ref={ref} className="scene scene-origins" id="origins">
      <div className="stage">
        <div className="stage-inner">
          <Ch01Layer />
          <Ch02Layer />
          <Ch03Layer />
        </div>
      </div>
    </section>
  );
}
