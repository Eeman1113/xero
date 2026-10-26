/**
 * Shared, mutable state for the neon ContourField.
 * Scene timelines tween these numbers (scrubbed by scroll); the field's
 * render loop reads them every frame. Keep it plain numbers so GSAP can tween.
 */

export type FieldPreset = {
  /** small-wave amplitude */
  amp: number;
  /** small-wave frequency multiplier */
  freq: number;
  /** big S-curve "topographic" swirl strength (the cover's look) */
  swirl: number;
  /** vertical spread of the line stack */
  spread: number;
  /** 0 = flat stack, 1 = lines stretch into the distance (ground plane) */
  depth: number;
  /** ch5 ripple strength */
  ripple: number;
  /** 0..1 lines pinch / converge to the centre */
  converge: number;
  /** 0..1 how many lines are visible (from the centre outward) */
  reveal: number;
  /** global alpha */
  opacity: number;
  /** diagonal tilt of the stack */
  tilt: number;
  /** 0..1 emphasis on the highlighted line (others dim) */
  highlightAmt: number;
};

export const PRESETS = {
  signal0: { amp: 0.35, freq: 1, swirl: 0.35, spread: 1, depth: 0, ripple: 0, converge: 0, reveal: 0.22, opacity: 1, tilt: 0, highlightAmt: 0 },
  signal: { amp: 1, freq: 1, swirl: 1, spread: 1.05, depth: 0, ripple: 0, converge: 0, reveal: 1, opacity: 1, tilt: 0, highlightAmt: 0 },
  memories: { amp: 0.55, freq: 0.8, swirl: 0.7, spread: 1.45, depth: 0, ripple: 0, converge: 0, reveal: 1, opacity: 0.5, tilt: 0.1, highlightAmt: 0 },
  takeoff: { amp: 0.6, freq: 1, swirl: 0.35, spread: 1, depth: 1, ripple: 0, converge: 0, reveal: 1, opacity: 0.95, tilt: 0, highlightAmt: 0 },
  machine: { amp: 0.75, freq: 1.7, swirl: 0.5, spread: 1.15, depth: 0, ripple: 0, converge: 0, reveal: 1, opacity: 0.6, tilt: -0.3, highlightAmt: 0 },
  noise: { amp: 1.35, freq: 1.35, swirl: 1.2, spread: 1.1, depth: 0, ripple: 1, converge: 0, reveal: 1, opacity: 0.85, tilt: 0.05, highlightAmt: 0 },
  /** AI lab: calm, low, slightly tilted so the machines read */
  lab: { amp: 0.45, freq: 1.9, swirl: 0.3, spread: 1.3, depth: 0, ripple: 0, converge: 0, reveal: 1, opacity: 0.42, tilt: -0.15, highlightAmt: 0 },
  /** architect's table: near-flat drafting lines */
  drafting: { amp: 0.18, freq: 0.6, swirl: 0.15, spread: 1.5, depth: 0, ripple: 0, converge: 0, reveal: 1, opacity: 0.38, tilt: 0, highlightAmt: 0 },
  wildcard: { amp: 0.7, freq: 0.9, swirl: 0.8, spread: 1.2, depth: 0, ripple: 0, converge: 0, reveal: 1, opacity: 0.55, tilt: 0.2, highlightAmt: 0 },
  journey: { amp: 0.85, freq: 0.9, swirl: 0.9, spread: 1.25, depth: 0, ripple: 0, converge: 0, reveal: 1, opacity: 1, tilt: -0.1, highlightAmt: 1 },
  play: { amp: 0.55, freq: 1, swirl: 0.5, spread: 1.1, depth: 0, ripple: 0, converge: 1, reveal: 1, opacity: 1, tilt: 0, highlightAmt: 0 },
} satisfies Record<string, FieldPreset>;

export type PresetName = keyof typeof PRESETS;

export type Bend = { x: number; y: number; r: number; s: number };

export const field = {
  ...PRESETS.signal0,
  /** ripple origin, normalised */
  rippleX: 0.5,
  rippleY: 0.5,
  /** highlighted line, as fraction of the stack (0 top .. 1 bottom) */
  highlight: 0.62,
  /** up to 3 "objects" the lines part around. x/y normalised, r relative to min(w,h) */
  bends: [
    { x: 0.5, y: 0.5, r: 0.2, s: 0 },
    { x: 0.5, y: 0.5, r: 0.2, s: 0 },
    { x: 0.5, y: 0.5, r: 0.2, s: 0 },
  ] as Bend[],
  /** an element (the van) that rides the highlighted line. t: 0 left .. 1 right */
  follower: { el: null as HTMLElement | null, t: 0, on: 0 },
  /** a second rider (the auto-rickshaw) on another line: dl = line offset from the highlight */
  follower2: { el: null as HTMLElement | null, t: 0, on: 0, dl: 5 },
};

export type FieldState = typeof field;

/**
 * Preset ownership. Each pinned scene tweens its OWN copy of the preset
 * numbers; every frame the ContourField copies in the copy of the scene that
 * is on screen (greatest start <= scroll). Without this, a long jump makes
 * several scrubbed timelines finish in the same frames and whichever renders
 * last (often an earlier scene) wins, leaving the wrong field on screen.
 */
type Owner = { start: () => number; preset: FieldPreset };
const owners = new Set<Owner>();
export function registerFieldOwner(o: Owner) {
  owners.add(o);
  return () => {
    owners.delete(o);
  };
}
export function applyFieldOwner(scroll: number) {
  let best: Owner | null = null;
  let bestStart = -Infinity;
  owners.forEach((o) => {
    const st = o.start();
    if (st <= scroll + 2 && st > bestStart) {
      best = o;
      bestStart = st;
    }
  });
  if (best) Object.assign(field, (best as Owner).preset);
}
