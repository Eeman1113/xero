import type { CSSProperties } from "react";
import { OBJECTS, type ObjectName } from "@/lib/assets";

type Props = { name: ObjectName; className?: string; alt?: string; style?: CSSProperties; eager?: boolean };

/** A single kit part: WebP with PNG fallback, no parallax planes (the parent animates it). */
export default function Pic({ name, className, alt = "", style, eager }: Props) {
  const a = OBJECTS[name];
  return (
    <picture>
      <source srcSet={a.webp} type="image/webp" />
      <img src={a.src} alt={alt} className={className} style={style} draggable={false} loading={eager ? "eager" : "lazy"} decoding="async" />
    </picture>
  );
}
