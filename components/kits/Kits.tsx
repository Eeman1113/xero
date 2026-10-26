"use client";
/**
 * Multi-part object kits (v3 posterized photo cut-outs).
 * Each kit is assembled from separate PNG parts positioned in % of the kit box
 * (measured from the art: hole / arch / window centres), so every moving part
 * can be animated on its own — by the scene timelines (GSAP, scrubbed) or by
 * small per-kit tickers (scroll velocity, audio level).
 */
import { forwardRef, useEffect, useRef, type CSSProperties } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReduced } from "@/lib/motion";
import { scrollVelocity, isLive } from "@/lib/velocity";
import { audioLevel, isPlaying } from "@/lib/playing";
import { quadMatrix } from "@/lib/quad";
import Pic from "../ui/Pic";
import Kit from "./Kit";

/* ------------------------------------------------------------------ vehicles */

type VehicleKind = "van" | "auto";
/** body + 2 wheels in the arches; ContourField drives position, wheel spin + bob */
export const Vehicle = forwardRef<HTMLDivElement, { kind: VehicleKind; className?: string }>(function Vehicle({ kind, className }, ref) {
  const body = kind === "van" ? "van_body" : "auto_body";
  const w1 = kind === "van" ? "van_wheel" : "auto_wheel";
  const w2 = kind === "van" ? "van_wheel_b" : "auto_wheel_b";
  return (
    <div ref={ref} className={`veh veh-${kind} ${className ?? ""}`} data-anchor={kind === "van" ? 1.065 : 1.04} aria-hidden="true">
      <span className="veh-wheel w-rear"><Pic name={w1} /></span>
      <span className="veh-wheel w-front"><Pic name={w2} /></span>
      <div className="veh-bob">
        <Pic name={body} className="veh-body" />
      </div>
    </div>
  );
});

/* -------------------------------------------------------------------- camera */

/** camera_body with the lens BEHIND its transparent lens hole, a pressable shutter button and a flash */
export function CameraKit({ className }: { className?: string }) {
  return (
    <Kit name="camera" className={`keep ${className ?? ""}`} depth={1.6} idle={0.7} label="Instant camera">
      <div className="cam-box">
        <span className="cam-lens"><Pic name="camera_lens" /></span>
        <Pic name="camera_body" className="cam-body" />
        <span className="cam-btn" data-press=""><span className="press"><Pic name="camera_button" /></span></span>
        <span className="cam-flash" />
      </div>
    </Kit>
  );
}

/* ---------------------------------------------------------------- microphone */

/**
 * mic_body + pop filter on a coded gooseneck + coiled cable.
 * The pop filter swings with scroll velocity and, while something plays,
 * vibrates with the audio level (it "listens").
 */
export function MicKit({ className, depth = 1.2 }: { className?: string; depth?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReduced()) return;
    const pop = root.querySelector<HTMLElement>(".mic-pop");
    const cable = root.querySelector<HTMLElement>(".mic-cable");
    let ang = 0;
    let av = 0;
    const tick = (time: number) => {
      if (!isLive(root) || !pop) return;
      // damped spring towards a target set by scroll velocity
      const target = Math.max(-9, Math.min(9, -scrollVelocity() * 0.006));
      av += (target - ang) * 0.06;
      av *= 0.86;
      ang += av;
      const lv = audioLevel(time);
      const buzz = lv * (Math.sin(time * 61) * 1.4 + Math.sin(time * 37) * 0.8);
      pop.style.transform = `rotate(${(ang + buzz).toFixed(2)}deg) scale(${(1 + lv * 0.035).toFixed(3)})`;
      if (cable) cable.style.transform = `rotate(${(Math.sin(time * 0.9) * 1.2 + ang * 0.25).toFixed(2)}deg)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);
  return (
    <div ref={ref} className={`mic-wrap ${className ?? ""}`}>
      <Kit name="mic" depth={depth} idle={0.5} label="Studio microphone with a pop filter">
        <div className="mic-box">
          <span className="mic-cable"><Pic name="mic_cable" /></span>
          <svg className="mic-neck" viewBox="0 0 302 664" aria-hidden="true">
            <path d="M150 505 C 238 512, 312 430, 298 300" />
            <path className="ribs" d="M150 505 C 238 512, 312 430, 298 300" />
          </svg>
          <Pic name="mic_body" className="mic-body" />
          <span className="mic-pop"><Pic name="mic_popfilter" /></span>
        </div>
      </Kit>
    </div>
  );
}

/* --------------------------------------------------------------------- nokia */

/** Nokia 3310 with a coded LCD (typed message + Snake) and a pressable nav key */
export function NokiaKit({ className, msg = "kal recording? 8 baje" }: { className?: string; msg?: string }) {
  return (
    <Kit name="nokia" className={className} depth={1.1} idle={0.9} label="Nokia 3310 playing Snake">
      <div className="nk-box">
        <Pic name="nokia" className="nk-body" />
        <div className="nk-lcd" aria-hidden="true">
          <span className="nk-msg" style={{ ["--n" as string]: msg.length }}>{msg}</span>
          <svg className="nk-snake" viewBox="0 0 96 40">
            <rect className="nk-food" x="70" y="10" width="4" height="4" />
            <path pathLength="100" d="M4 30 H40 V14 H64 V30 H88 V6 H20 V22 H4 Z" />
          </svg>
        </div>
        <span className="nk-btn" data-press=""><span className="press"><Pic name="nokia_button" /></span></span>
      </div>
    </Kit>
  );
}

/* ------------------------------------------------------------------ cassette */

/**
 * Cassette: reel + reel_b BEHIND the body, showing through its transparent
 * windows. Idle spin, follows scroll velocity (reverses on scroll up), runs
 * at play speed while an episode is playing. Only ticks while on screen.
 */
export function CassetteKit({ className, label }: { className?: string; label?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = ref.current;
    if (!root || prefersReduced()) return;
    const reels = Array.from(root.querySelectorAll<HTMLElement>(".cs-reel"));
    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { rootMargin: "100px" });
    io.observe(root);
    let ang = 0;
    let boost = 0;
    const tick = (_t: number, dtMs: number) => {
      if (!visible || !isLive(root)) return;
      const dt = Math.min(0.05, dtMs / 1000);
      boost += ((isPlaying() ? 1 : 0) - boost) * 0.04;
      const speed = 24 + boost * 300 + Math.max(-900, Math.min(900, scrollVelocity() * 0.45));
      ang += speed * dt;
      reels[0].style.transform = `rotate(${ang.toFixed(2)}deg)`;
      reels[1].style.transform = `rotate(${(ang * 0.82 + 40).toFixed(2)}deg)`;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      io.disconnect();
    };
  }, []);
  return (
    <div ref={ref} className={`cassette ${className ?? ""}`} aria-hidden="true">
      <span className="cs-reel cs-l"><Pic name="cassette_reel" /></span>
      <span className="cs-reel cs-r"><Pic name="cassette_reel_b" /></span>
      <Pic name="cassette_body" className="cs-body" />
      {label ? <span className="cs-label mono">{label}</span> : null}
    </div>
  );
}

/* ----------------------------------------------------------------------- GPU */

/** GPU with both fans behind its fan holes: CSS idle spin × scrubbed spin-up (GSAP on .gpu-fan img) */
export function GpuKit({ className }: { className?: string }) {
  return (
    <Kit name="gpu" className={className} depth={1.2} idle={0.6} label="Graphics card with spinning fans">
      <div className="gpu-box">
        <span className="gpu-fan f-l"><span className="spin"><Pic name="gpu_fan" className="gpu-fan-img" /></span></span>
        <span className="gpu-fan f-r"><span className="spin rev"><Pic name="gpu_fan_b" className="gpu-fan-img" /></span></span>
        <Pic name="gpu_body" className="gpu-body" />
      </div>
    </Kit>
  );
}

/* --------------------------------------------------------------- server rack */

const LED_ROWS = 14;
/** server rack + coded status LEDs blinking at their own rates */
export function ServerKit({ className }: { className?: string }) {
  return (
    <Kit name="server" className={className} depth={0.9} idle={0.4} label="Server rack with blinking status lights">
      <div className="srv-box">
        <Pic name="server_rack" className="srv-body" />
        <div className="srv-leds" aria-hidden="true">
          {Array.from({ length: LED_ROWS * 3 }, (_, i) => (
            <i key={i} className={`led l${i % 3} ${i % 7 === 3 ? "amber" : ""}`}
              style={{ ["--b" as string]: `${(0.35 + ((i * 37) % 11) / 9).toFixed(2)}s`, ["--o" as string]: `${(-((i * 53) % 17) / 7).toFixed(2)}s` }} />
          ))}
        </div>
      </div>
    </Kit>
  );
}

/* -------------------------------------------------------------------- laptop */

/** noisy, descending training-loss curve (deterministic) */
function lossPath(n = 60) {
  let d = "";
  for (let i = 0; i <= n; i++) {
    const x = 18 + (i / n) * 172;
    const loss = 0.08 + 0.85 * Math.exp(-i / 13) + (Math.sin(i * 2.7) * 0.035 + Math.sin(i * 7.9) * 0.025) * (1 - i / (n * 1.4));
    d += `${i ? "L" : "M"}${x.toFixed(1)} ${(104 - loss * 86).toFixed(1)} `;
  }
  return d.trim();
}
const LOSS = lossPath();

/**
 * Laptop whose black screen runs a training job: loss curve draws (GSAP, scrubbed),
 * epoch / loss counters tick. The overlay is mapped onto the perspective screen
 * with a homography (measured corners of the art's screen).
 */
export function LaptopKit({ className }: { className?: string }) {
  const boxRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const box = boxRef.current;
    const scr = box?.querySelector<HTMLElement>(".lap-screen");
    if (!box || !scr) return;
    const fit = () => {
      const w = box.offsetWidth;
      const h = box.offsetHeight;
      if (!w) return;
      const P = (x: number, y: number): [number, number] => [x * w, y * h];
      scr.style.transform = quadMatrix(200, 120, P(0.432, 0.02), P(0.972, 0.078), P(0.882, 0.715), P(0.33, 0.552));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, []);
  return (
    <Kit name="laptop" className={className} depth={1} idle={0.5} label="Laptop running a model training job">
      <div ref={boxRef} className="lap-box">
        <Pic name="laptop" className="lap-body" />
        <div className="lap-screen" aria-hidden="true">
          <svg viewBox="0 0 200 120">
            <text x="10" y="12" className="lap-h">train.py — xero-net</text>
            <g className="lap-grid">
              {[30, 52, 74, 96].map((y) => <line key={y} x1="18" x2="192" y1={y} y2={y} />)}
            </g>
            <line className="lap-axis" x1="18" y1="18" x2="18" y2="106" />
            <line className="lap-axis" x1="18" y1="106" x2="192" y2="106" />
            <path className="lap-loss" pathLength="1" d={LOSS} />
            <text x="22" y="117" className="lap-t">epoch <tspan className="lap-epoch">0</tspan>/100</text>
            <text x="120" y="117" className="lap-t">loss <tspan className="lap-val">2.31</tspan></text>
          </svg>
        </div>
      </div>
    </Kit>
  );
}

/* ------------------------------------------------------------ neural network */

const NN = [3, 5, 5, 2];
/** small coded neural-net graph; layers light up in sequence (GSAP on .nn-l*) */
export function NeuralNet({ className }: { className?: string }) {
  const W = 260;
  const H = 150;
  const xs = NN.map((_, i) => 24 + (i * (W - 48)) / (NN.length - 1));
  const ys = (n: number) => Array.from({ length: n }, (_, j) => H / 2 + (j - (n - 1) / 2) * 28);
  return (
    <svg className={`nn ${className ?? ""}`} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      {NN.slice(0, -1).map((n, l) => (
        <g key={`e${l}`} className={`nn-e nn-e${l}`}>
          {ys(n).flatMap((y1, a) => ys(NN[l + 1]).map((y2, b) => (
            <line key={`${a}-${b}`} x1={xs[l]} y1={y1} x2={xs[l + 1]} y2={y2} />
          )))}
        </g>
      ))}
      {NN.map((n, l) => (
        <g key={`n${l}`} className={`nn-l nn-l${l}`}>
          {ys(n).map((y, j) => <circle key={j} cx={xs[l]} cy={y} r="7" />)}
        </g>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------------- robot arm */

/**
 * Robot arm from 3 parts with real joints: base → lower (shoulder pivot) →
 * upper (elbow pivot, carries the gripper). The upper segment is a CHILD of
 * the lower one, so rotating the shoulder carries the whole forearm.
 * Pivots measured from the art (disc centres).
 */
export function RobotArm({ className, children }: { className?: string; children?: React.ReactNode }) {
  return (
    <Kit name="robotarm" className={className} depth={1.1} idle={0} label="Robot arm">
      <div className="ra-box">
        <Pic name="robotarm_base" className="ra-base" />
        <div className="ra-lower">
          <Pic name="robotarm_lower" className="ra-img" />
          <div className="ra-upper">
            <Pic name="robotarm_upper" className="ra-img" />
            <span className="ra-grip">{children}</span>
          </div>
        </div>
      </div>
    </Kit>
  );
}

/* ----------------------------------------------------------------- chai steam */

/** cutting chai with coded steam wisps (transform/opacity loops) */
export function ChaiKit({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <Kit name="chai" className={className} depth={1.2} idle={0.8} style={style} label="Cutting chai">
      <div className="chai-box">
        <svg className="steam" viewBox="0 0 60 90" aria-hidden="true">
          <path className="w w1" d="M22 88 C 10 70, 34 58, 22 40 S 30 14, 22 2" />
          <path className="w w2" d="M32 88 C 44 72, 20 58, 34 42 S 26 16, 36 4" />
          <path className="w w3" d="M42 88 C 34 74, 50 60, 40 46 S 46 24, 40 10" />
        </svg>
        <Pic name="chai" className="chai-img" />
      </div>
    </Kit>
  );
}
