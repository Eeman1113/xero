import type { CSSProperties } from "react";
import { OBJECTS, type ObjectName } from "@/lib/assets";

type Props = {
  name: ObjectName;
  className?: string;
  /** parallax depth: >1 nearer (moves more with the mouse), <1 farther */
  depth?: number;
  /** keep visible in the reduced-motion flow layout */
  keep?: boolean;
  style?: CSSProperties;
  eager?: boolean;
};

/**
 * One collage object = 3 nested planes:
 *  .obj   → scroll transforms (GSAP)
 *  .obj-m → mouse parallax (CSS vars --mx/--my × --d)
 *  img    → hover jiggle (anime.js) + glow
 * Sized by CSS width only (height auto) so replacement art of any size works.
 */
export default function Obj({ name, className, depth = 1, keep, style, eager }: Props) {
  const a = OBJECTS[name];
  return (
    <div className={`obj obj-${a.style} ${keep ? "keep" : ""} ${className ?? ""}`} style={{ ...style, ["--d" as string]: depth }} data-obj={name}>
      <div className="obj-m">
        <picture>
          <source srcSet={a.webp} type="image/webp" />
          <img src={a.src} alt={a.alt} className="obj-img" draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" />
        </picture>
      </div>
    </div>
  );
}
