export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
/** phones, plus portrait tablets (iPad-sized): both get the portrait layout. Keep in sync with globals.css */
export const SMALL_QUERY = "(max-width: 767px), (max-width: 1100px) and (orientation: portrait)";

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;

export const isSmall = () =>
  typeof window !== "undefined" && window.matchMedia(SMALL_QUERY).matches;
