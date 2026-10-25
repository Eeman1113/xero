/**
 * Film grain: an SVG feTurbulence tile, jittered with a stepped CSS
 * animation (cheap: one composited layer, no per-frame JS).
 */
const SVG = encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1.1 -.25'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`,
);

export default function Grain() {
  return (
    <div className="grain" aria-hidden="true">
      <div className="grain-tile" style={{ backgroundImage: `url("data:image/svg+xml,${SVG}")` }} />
      <div className="vignette" />
    </div>
  );
}
