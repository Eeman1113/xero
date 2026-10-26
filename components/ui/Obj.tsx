import type { CSSProperties } from "react";
import { OBJECTS, type ObjectName } from "@/lib/assets";
import { idleVars } from "@/lib/idle";

type Props = {
  name: ObjectName;
  className?: string;
  /** parallax depth: >1 nearer (moves more with the mouse), <1 farther */
  depth?: number;
  /** keep visible in the reduced-motion flow layout */
  keep?: boolean;
  style?: CSSProperties;
  eager?: boolean;
  /** idle float amplitude multiplier (0 = still) */
  idle?: number;
};

/**
 * One collage object = 3 nested planes:
 *  .obj   → scroll transforms (GSAP)
 *  .obj-m → mouse parallax (CSS transform) + idle float (CSS translate/rotate)
 *  img    → hover jiggle (anime.js) + paper-cutout shadow
 * Sized by CSS width only (height auto) so replacement art of any size works.
 */
export default function Obj({ name, className, depth = 1, keep, style, eager, idle = 1 }: Props) {
  const a = OBJECTS[name];
  return (
    <div className={`obj ${keep ? "keep" : ""} ${className ?? ""}`} style={{ ...style, ["--d" as string]: depth }} data-obj={name}>
      <div className={`obj-m ${idle ? "idle" : ""}`} style={idle ? idleVars(name, idle) : undefined}>
        <picture>
          <source srcSet={a.webp} type="image/webp" />
          <img src={a.src} alt={a.alt} className="obj-img" draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" />
        </picture>
      </div>
    </div>
  );
}
