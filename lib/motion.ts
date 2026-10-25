export const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
export const SMALL_QUERY = "(max-width: 767px)";

export const prefersReduced = () =>
  typeof window !== "undefined" && window.matchMedia(REDUCED_QUERY).matches;

export const isSmall = () =>
  typeof window !== "undefined" && window.matchMedia(SMALL_QUERY).matches;
