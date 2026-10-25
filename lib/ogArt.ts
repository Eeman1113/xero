/** Shared artwork for the generated icons / social images (next/og). */

export const NEON = ["#ff2a8c", "#ff9628", "#f0dc1e", "#28f03c", "#28e6f0"];

const stops = NEON.map((c, i) => `<stop offset="${i / (NEON.length - 1)}" stop-color="${c}"/>`).join("");

/** The neon "X" mark (same art as app/icon.svg) as an SVG string. */
export const markSvg = (size: number) => `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 64 64">
<defs><linearGradient id="g" x1="0" y1="0" x2="64" y2="0" gradientUnits="userSpaceOnUse">${stops}</linearGradient></defs>
<rect width="64" height="64" fill="#000"/>
<g fill="none" stroke="url(#g)" stroke-width="1.4" opacity=".45">
<path d="M-2 14 C 14 8, 26 22, 40 15 S 58 8, 66 12"/>
<path d="M-2 50 C 14 44, 26 58, 40 51 S 58 44, 66 48"/>
<path d="M-2 56 C 14 50, 26 64, 40 57 S 58 50, 66 54"/>
</g>
<path d="M17 13 h9.5 L32 25.5 L37.5 13 H47 L37 32 L47.5 51 H38 L32 38.5 L26 51 H16.5 L27 32 Z" fill="url(#g)"/>
</svg>`;

/** A stack of neon contour lines (the site's ContourField, frozen) as an SVG string. */
export function contourSvg(w: number, h: number, n = 34) {
  const paths: string[] = [];
  for (let i = 0; i < n; i++) {
    const v = i / (n - 1);
    const pts: string[] = [];
    for (let s = 0; s <= 60; s++) {
      const u = s / 60;
      const x = -20 + u * (w + 40);
      const yFlat = h / 2 + (i - (n - 1) / 2) * ((h * 1.25) / n);
      let d = h * 0.16 * Math.sin(u * Math.PI * 1.35 + v * 1.25 + 0.6) * (0.62 + 0.38 * Math.sin(v * Math.PI * 2));
      d += h * 0.03 * Math.sin(u * 7 + v * 2.1);
      // pinch toward the middle, like the "press play" converge preset
      const g = Math.exp(-Math.pow((u - 0.5) / 0.3, 2));
      const y = h / 2 + (yFlat + d - h / 2) * (1 - 0.55 * (0.3 + 0.67 * g));
      pts.push(`${s ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`);
    }
    const a = (0.35 + 0.65 * (1 - Math.abs(v - 0.5) * 2)).toFixed(2);
    paths.push(`<path d="${pts.join(" ")}" stroke-opacity="${a}"/>`);
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
<defs><linearGradient id="g" x1="0" y1="0" x2="${w}" y2="0" gradientUnits="userSpaceOnUse">${stops}</linearGradient>
<radialGradient id="v" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#000" stop-opacity=".8"/><stop offset=".55" stop-color="#000" stop-opacity=".45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>
<rect width="${w}" height="${h}" fill="#000"/>
<g fill="none" stroke="url(#g)" stroke-width="2">${paths.join("")}</g>
<rect width="${w}" height="${h}" fill="url(#v)"/>
</svg>`;
}

export const svgUri = (svg: string) => `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`;
