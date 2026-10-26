"use client";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { field, PRESETS, applyFieldOwner } from "@/lib/field";
import { prefersReduced, isSmall } from "@/lib/motion";

/**
 * The connective tissue of the site: ~40 stacked neon contour lines with a
 * horizontal pink→orange→yellow→green→cyan gradient, displaced by layered
 * sine fields. Everything is driven by the shared `field` state (tweened by
 * scroll timelines) + scroll phase + idle drift + a little mouse influence.
 * Fixed, full-screen, behind everything. Canvas 2D, DPR capped.
 */

const STOPS: [number, string][] = [
  [0, "#ff2a8c"],
  [0.26, "#ff9628"],
  [0.5, "#f0dc1e"],
  [0.74, "#28f03c"],
  [1, "#28e6f0"],
];

export default function ContourField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const reduced = prefersReduced();
    // reduced motion: no scrubbed field changes, so show the full calm field
    if (reduced) Object.assign(field, PRESETS.signal, { opacity: 0.55 });
    let small = isSmall();
    let W = 0;
    let H = 0;
    let dpr = 1;
    let N = 40;
    let SEG = 90;
    let grad: CanvasGradient | null = null;
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5, on: 0, ton: 0 };

    const resize = () => {
      small = isSmall();
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.25 : 1.5);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      N = small ? 26 : 40;
      SEG = small ? 46 : 90;
      grad = ctx.createLinearGradient(0, 0, W, 0);
      STOPS.forEach(([o, c]) => grad!.addColorStop(o, c));
    };
    resize();

    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / W;
      mouse.ty = e.clientY / H;
      mouse.ton = 1;
    };
    const onLeave = () => (mouse.ton = 0);
    if (!reduced) {
      window.addEventListener("pointermove", onMove, { passive: true });
      document.addEventListener("pointerleave", onLeave);
    }
    window.addEventListener("resize", resize);

    const PI = Math.PI;
    const ys = new Float32Array(200);

    /** y of line i at pixel x (shared by renderer + follower) */
    const lineY = (i: number, x: number, t: number, ph: number, out: { a: number; w: number }) => {
      const f = field;
      const v = i / (N - 1);
      const u = x / W;
      const minWH = Math.min(W, H);

      // flat stack
      const spacing = (H * 1.18 * f.spread) / N;
      const yFlat = H / 2 + (i - (N - 1) / 2) * spacing;

      // ground-plane perspective ("stretch into the distance")
      let yPersp = yFlat;
      let zScale = 1;
      let depthAlpha = 1;
      if (f.depth > 0.001) {
        const flow = ph * 0.45;
        const k = (((1 - v + flow) % 1) + 1) % 1; // 0 near .. 1 far
        const z = 0.55 + k * 9;
        const horizon = H * 0.36;
        yPersp = horizon + (H * 0.52) / z;
        zScale = 1.3 / z;
        depthAlpha = Math.min(1, k * 6) * Math.min(1, (1 - k) * 2.2) * (0.35 + 0.65 * Math.min(1, 2 / z));
        out.w = 1 + f.depth * (Math.min(2.6, 2.2 / z) - 1);
      } else {
        out.w = 1;
      }
      const dS = 1 + f.depth * (zScale - 1);
      let y = yFlat + (yPersp - yFlat) * f.depth;

      // displacement
      let d = 0;
      d +=
        f.swirl *
        H *
        0.16 *
        Math.sin(u * PI * 1.35 + v * 1.25 + t * 0.07 + ph * 0.55) *
        (0.62 + 0.38 * Math.sin(v * PI * 2 + t * 0.05 + ph * 0.3));
      d += f.amp * H * 0.034 * Math.sin(u * f.freq * 7 + v * 2.1 - t * 0.45 + ph * 1.2);
      d += f.amp * H * 0.017 * Math.sin(u * f.freq * 13.3 - v * 3.3 + t * 0.7 + ph * 0.8);
      d += f.tilt * (u - 0.5) * H * 0.45;
      d *= dS;

      const yy = y + d;
      if (f.ripple > 0.001) {
        const dx = x - f.rippleX * W;
        const dy = yy - f.rippleY * H;
        const dist = Math.sqrt(dx * dx + dy * dy);
        d += f.ripple * H * 0.04 * Math.sin(dist * 0.032 - t * 4.2) * Math.exp(-dist / (minWH * 0.55));
      }
      // bends + mouse part the lines around a point. The push is a smooth odd
      // function of the vertical offset (tanh, not a sign flip) so a line that
      // passes through the centre bends instead of jumping; d/d(dy) stays > -1,
      // so lines never cross and never kink, at any strength.
      for (let b = 0; b < 3; b++) {
        const bd = f.bends[b];
        if (bd.s < 0.001) continue;
        const r = bd.r * minWH;
        const dx = x - bd.x * W;
        if (dx * dx > r * r * 9) continue;
        const dy = yy - bd.y * H;
        const gx = Math.exp(-(dx * dx) / (r * r));
        const gy = Math.exp(-(dy * dy) / (r * r * 4));
        d += bd.s * r * 0.9 * Math.tanh(dy / (r * 0.35)) * gx * gy;
      }
      if (mouse.on > 0.01) {
        const dx = x - mouse.x * W;
        const dy = yy - mouse.y * H;
        const dist2 = dx * dx + dy * dy;
        d += mouse.on * 34 * Math.tanh(dy / 60) * Math.exp(-dist2 / (150 * 150));
      }
      y += d;

      // converge to the centre: a lens/pinch around the middle
      if (f.converge > 0.001) {
        const g = Math.exp(-Math.pow((u - 0.5) / 0.3, 2));
        const pinch = 1 - f.converge * (0.3 + 0.67 * g);
        y = H / 2 + (y - H / 2) * pinch;
      }

      out.a = depthAlpha;
      return y;
    };

    const meta = { a: 1, w: 1 };
    type Rider = { el: HTMLElement | null; wheels: HTMLElement[]; bob: HTMLElement | null; lastX: number; dist: number; anchor: number; shake: number };
    const mkRider = (shake: number): Rider => ({ el: null, wheels: [], bob: null, lastX: NaN, dist: 0, anchor: 1, shake });
    const van = mkRider(23);
    const auto = mkRider(31);
    let last = 0;
    let t = 0;

    const draw = (time: number) => {
      if (document.hidden) return;
      const dt = Math.min(0.05, time - last || 0.016);
      last = time;
      if (!reduced) t += dt;
      const ph = window.scrollY / Math.max(1, H) * 0.32;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      mouse.on += (mouse.ton * (small ? 0 : 1) - mouse.on) * 0.05;

      if (!reduced) applyFieldOwner(window.scrollY);
      const f = field;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.fillStyle = "#000";
      ctx.fillRect(0, 0, W, H);
      if (f.opacity < 0.005 || !grad) return;

      ctx.strokeStyle = grad;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      const hl = Math.round(f.highlight * (N - 1));
      const centre = (N - 1) / 2;
      const x0 = -W * 0.04;
      const dx = (W * 1.08) / SEG;

      for (let i = 0; i < N; i++) {
        // reveal from the centre outward
        const rv = Math.abs(i - centre) / (centre + 1);
        const reveal = Math.max(0, Math.min(1, (f.reveal * 1.25 - rv) * 4));
        if (reveal <= 0) continue;
        let alpha = f.opacity * reveal;
        if (i !== hl) alpha *= 1 - f.highlightAmt * 0.62;
        let lw = 0;
        for (let s = 0; s <= SEG; s++) {
          ys[s] = lineY(i, x0 + s * dx, t, ph, meta);
          lw = meta.w;
        }
        alpha *= meta.a;
        if (alpha < 0.01) continue;
        ctx.beginPath();
        ctx.moveTo(x0, ys[0]);
        for (let s = 1; s <= SEG; s++) ctx.lineTo(x0 + s * dx, ys[s]);
        if (i === hl && f.highlightAmt > 0.01) {
          ctx.globalAlpha = 0.16 * f.highlightAmt * f.opacity;
          ctx.lineWidth = 9;
          ctx.stroke();
          ctx.globalAlpha = f.opacity;
          ctx.lineWidth = 1.3 + 1.8 * f.highlightAmt;
          ctx.stroke();
        } else {
          ctx.globalAlpha = alpha;
          ctx.lineWidth = 1.25 * lw;
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // the riders (van + auto kits) follow contour lines; wheels roll by distance
      const ride = (fol: { el: HTMLElement | null; t: number; on: number }, v: Rider, line: number) => {
        if (!fol.el) return;
        if (fol.el !== v.el) {
          v.el = fol.el;
          v.wheels = Array.from(fol.el.querySelectorAll<HTMLElement>(".veh-wheel"));
          v.bob = fol.el.querySelector<HTMLElement>(".veh-bob");
          v.anchor = Number(fol.el.dataset.anchor) || 1;
          v.lastX = NaN;
        }
        if (fol.on > 0.01) {
          const x = -W * 0.1 + fol.t * W * 1.2;
          const y = lineY(line, x, t, ph, meta);
          const y2 = lineY(line, x + 12, t, ph, meta);
          const ang = Math.atan2(y2 - y, 12);
          fol.el.style.opacity = String(fol.on);
          fol.el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -${(v.anchor * 100).toFixed(1)}%) rotate(${ang.toFixed(3)}rad)`;
          // wheels roll exactly with the distance travelled: θ = d / (π·D) · 360°
          const dx = Number.isNaN(v.lastX) ? 0 : x - v.lastX;
          v.dist += dx;
          v.lastX = x;
          const D = Math.max(1, v.wheels[0]?.offsetWidth ?? 40);
          const deg = (v.dist / (Math.PI * D)) * 360;
          for (const w of v.wheels) w.style.transform = `rotate(${deg.toFixed(1)}deg)`;
          // suspension: bumps scale with speed, plus idle engine shake
          if (v.bob) {
            const speed = Math.min(1, Math.abs(dx) / 6);
            const bump = Math.sin(v.dist * 0.06) * 1.6 * (0.3 + speed) + Math.sin(t * v.shake) * 0.4;
            const pitch = Math.sin(v.dist * 0.035 + 1.3) * 0.7 * (0.3 + speed);
            v.bob.style.transform = `translateY(${bump.toFixed(2)}px) rotate(${pitch.toFixed(2)}deg)`;
          }
        } else if (fol.el.style.opacity !== "0") {
          fol.el.style.opacity = "0";
          v.lastX = NaN;
        }
      };
      if (!reduced) {
        ride(f.follower, van, hl);
        ride(f.follower2, auto, Math.max(0, Math.min(N - 1, hl + f.follower2.dl)));
      }
    };

    gsap.ticker.add(draw);
    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={ref} className="contour-field" aria-hidden="true" />;
}
