/** "Something is playing" signal (inline YouTube player opened / preview audio playing). */
export const PLAYING_EVENT = "xero:playing";

let playing = false;
export const isPlaying = () => playing;
export function setPlaying(on: boolean) {
  playing = on;
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(PLAYING_EVENT, { detail: on }));
}
