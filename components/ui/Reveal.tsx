import { createElement, Fragment, type ElementType } from "react";

type Props = {
  text: string;
  as?: ElementType;
  mode?: "chars" | "words";
  className?: string;
};

/**
 * Splits text into animatable units (chars grouped in words, or whole words).
 * Animated by lib/reveal.ts (anime.js stagger) when a scroll cue fires.
 * Screen readers get the plain string via aria-label.
 */
export default function Reveal({ text, as = "p", mode = "words", className }: Props) {
  const words = text.split(" ");
  // the space must sit between the inline-block word boxes: trailing whitespace
  // inside an inline-block is collapsed away, which glued all the words together
  const children = words.map((w, wi) => (
    <Fragment key={wi}>
      <span className="rv-w" aria-hidden="true">
        {mode === "chars"
          ? Array.from(w).map((c, ci) => (
              <span className="rv-u" key={ci}>
                {c}
              </span>
            ))
          : <span className="rv-u">{w}</span>}
      </span>
      {wi < words.length - 1 ? " " : null}
    </Fragment>
  ));
  return createElement(
    as,
    { className: `rv ${className ?? ""}`, "data-reveal": "", "data-mode": mode, "aria-label": text },
    children,
  );
}
