/** Tiny pub/sub store for the HUD's current chapter. */
type Listener = (id: string) => void;
let current = "01";
const listeners = new Set<Listener>();

export const setChapter = (id: string) => {
  if (id === current) return;
  current = id;
  listeners.forEach((l) => l(id));
};
export const getChapter = () => current;
export const onChapter = (l: Listener) => {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
};

/**
 * Scroll regions: every scene (and the listen section) registers where it
 * starts and how to map a scroll position to a chapter. The HUD resolves the
 * chapter from the CURRENT scroll position every frame — so jumps, anchor
 * links and ScrollTrigger refreshes can't leave a stale "last writer" label.
 */
export type Region = {
  start: () => number;
  chapterAt: (scroll: number) => string;
};
const regions = new Set<Region>();

export const registerRegion = (r: Region) => {
  regions.add(r);
  return () => {
    regions.delete(r);
  };
};

/** the region with the greatest start ≤ scroll wins (scenes overlap end→start) */
export function resolveChapter(scroll: number) {
  let best: Region | null = null;
  let bestStart = -Infinity;
  regions.forEach((r) => {
    const s = r.start();
    if (s <= scroll + 2 && s > bestStart) {
      best = r;
      bestStart = s;
    }
  });
  setChapter(best ? (best as Region).chapterAt(scroll) : "01");
}
