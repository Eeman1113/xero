"use client";
import { useRef } from "react";
import { useScrollScene } from "@/lib/useScrollScene";
import { Ch06Layer, buildCh06 } from "../chapters/Ch06Wildcard";

/** Pinned scene 3: 06 WILDCARD */
export default function SceneWildcard() {
  const ref = useRef<HTMLElement>(null);
  useScrollScene(ref, {
    startPreset: "noise",
    build: (api) => {
      buildCh06(api, 0);
    },
  });
  return (
    <section ref={ref} className="scene scene-wildcard" id="wildcard">
      <div className="stage">
        <div className="stage-inner">
          <Ch06Layer />
        </div>
      </div>
    </section>
  );
}
