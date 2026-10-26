/** "Something is playing" signal (inline YouTube player opened / preview audio playing). */
export const PLAYING_EVENT = "xero:playing";

let playing = false;
let level = 0;
export const isPlaying = () => playing;
export function setPlaying(on: boolean) {
  playing = on;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(PLAYING_EVENT, { detail: on }));
}
/** 0..1 loudness of the preview audio (AnalyserNode), when one is available */
export const setLevel = (v: number) => {
  level = v;
};
/**
 * Current audio level. Real analyser data for the bundled previews; for the
 * YouTube embed (no audio access) a speech-like synthetic level while playing.
 */
export function audioLevel(t: number) {
  if (level > 0.01) return level;
  if (!playing) return 0;
  const s = Math.abs(Math.sin(t * 7.3) * Math.sin(t * 2.1 + 1) + 0.4 * Math.sin(t * 13.7));
  return Math.min(1, 0.15 + s * 0.55);
}
