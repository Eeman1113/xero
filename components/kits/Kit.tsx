import type { CSSProperties, ReactNode } from "react";
import { idleVars } from "@/lib/idle";

type Props = {
  name: string;
  className?: string;
  depth?: number;
  idle?: number;
  style?: CSSProperties;
  children: ReactNode;
  label?: string;
};

/**
 * A multi-part object. Same planes as <Obj>:
 *  .obj (GSAP scroll) → .obj-m (mouse + idle float) → .kit-j (hover jiggle) → parts
 * Parts inside are positioned in % of the kit box and animated individually.
 */
export default function Kit({ name, className, depth = 1, idle = 1, style, children, label }: Props) {
  return (
    <div className={`obj kit kit-${name} ${className ?? ""}`} style={{ ...style, ["--d" as string]: depth }} data-obj={name}
      role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <div className={`obj-m ${idle ? "idle" : ""}`} style={idle ? idleVars(name, idle) : undefined}>
        <div className="kit-j">{children}</div>
      </div>
    </div>
  );
}
