"use client";
/**
 * Keyboard path through the pinned story. Story layers are visibility:hidden
 * until their moment, so the browser can't Tab into them. Scenes register their
 * interactive pieces (polaroids, cards, the finale play button) with the scroll
 * position where they are on screen; Experience moves Tab focus along them,
 * scrolling the story there first.
 */
export type FocusStop = { el: HTMLElement; scroll: () => number; settle: () => void };

const stops = new Set<FocusStop>();

export function registerFocusStop(s: FocusStop) {
  stops.add(s);
  return () => {
    stops.delete(s);
  };
}

/** in story order (scroll position, then DOM order); pieces hidden by layout (display:none) are skipped */
export function focusStops(): FocusStop[] {
  return Array.from(stops)
    .filter((s) => s.el.getClientRects().length > 0 || getComputedStyle(s.el).display !== "none")
    .filter((s) => s.el.offsetParent !== null)
    .sort((a, b) => a.scroll() - b.scroll() || (a.el.compareDocumentPosition(b.el) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
}
