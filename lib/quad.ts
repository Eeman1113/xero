/**
 * CSS matrix3d that maps an element of size w×h (transform-origin 0 0) onto
 * an arbitrary quad (tl, tr, br, bl in px) — used to "print" coded overlays
 * onto perspective screens (the laptop).
 */
type P = [number, number];

export function quadMatrix(w: number, h: number, tl: P, tr: P, br: P, bl: P) {
  // unit square → quad (Heckbert)
  const [x0, y0] = tl, [x1, y1] = tr, [x2, y2] = br, [x3, y3] = bl;
  const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1 || 1e-9;
  const g = (dx3 * dy2 - dx2 * dy3) / den;
  const hh = (dx1 * dy3 - dx3 * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + hh * x3, c = x0;
  const d = y1 - y0 + g * y1, e = y3 - y0 + hh * y3, f = y0;
  // pre-scale element px → unit square
  const A = a / w, B = b / h, D = d / w, E = e / h, G = g / w, H = hh / h;
  // CSS matrix3d is column-major
  const m = [A, D, 0, G, B, E, 0, H, 0, 0, 1, 0, c, f, 0, 1];
  return `matrix3d(${m.map((v) => +v.toFixed(8)).join(",")})`;
}
