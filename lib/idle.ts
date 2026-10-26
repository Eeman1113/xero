import type { CSSProperties } from "react";

/** deterministic per-object idle float parameters (so SSR and client agree) */
export function idleVars(seed: string, amp = 1): CSSProperties {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619);
  const r = (n: number) => ((h >>> (n * 3)) % 1000) / 1000;
  return {
    ["--ia" as string]: `${((4 + r(1) * 6) * amp).toFixed(1)}px`,
    ["--ir" as string]: `${((0.8 + r(2) * 2.2) * amp * (r(5) > 0.5 ? 1 : -1)).toFixed(2)}deg`,
    ["--id" as string]: `${(3.6 + r(3) * 2.8).toFixed(2)}s`,
    ["--io" as string]: `${(-r(4) * 6).toFixed(2)}s`,
  };
}
