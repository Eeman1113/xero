"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import { PLAY_EVENT } from "../chapters/Ch08PressPlay";
import { setPlaying as signalPlaying } from "@/lib/playing";

const STOP_OTHERS = "xero:stop-others";
const R = 26;
const C = 2 * Math.PI * R;

let audioCtx: AudioContext | null = null;

/**
 * Custom preview player: play/pause button inside a gradient progress ring,
 * plus a live mini waveform (Web Audio AnalyserNode → canvas).
 * Only one preview plays at a time.
 */
export default function AudioPlayer({ id, src, title, latest = false }: { id: string; src: string; title: string; latest?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const ringRef = useRef<SVGCircleElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const analyser = useRef<AnalyserNode | null>(null);
  const raf = useRef<number>(0);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState("0:00");

  const ensureGraph = () => {
    const a = audioRef.current;
    if (!a || analyser.current) return;
    try {
      const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      audioCtx = audioCtx ?? new Ctx();
      const srcNode = audioCtx.createMediaElementSource(a);
      const an = audioCtx.createAnalyser();
      an.fftSize = 64;
      an.smoothingTimeConstant = 0.75;
      srcNode.connect(an);
      an.connect(audioCtx.destination);
      analyser.current = an;
    } catch {
      /* no Web Audio → the waveform falls back to a synthetic wiggle */
    }
  };

  const draw = useCallback(() => {
    const cv = canvasRef.current;
    const a = audioRef.current;
    if (!cv || !a) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = cv.clientWidth;
    const h = cv.clientHeight;
    if (cv.width !== Math.round(w * dpr)) {
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
    }
    g.setTransform(dpr, 0, 0, dpr, 0, 0);
    g.clearRect(0, 0, w, h);
    const bars = 28;
    const data = new Uint8Array(32);
    if (analyser.current) analyser.current.getByteFrequencyData(data);
    const grad = g.createLinearGradient(0, 0, w, 0);
    ["#ff2a8c", "#ff9628", "#f0dc1e", "#28f03c", "#28e6f0"].forEach((c, i) => grad.addColorStop(i / 4, c));
    g.fillStyle = grad;
    const bw = w / bars;
    const t = performance.now() / 1000;
    for (let i = 0; i < bars; i++) {
      let v = analyser.current ? data[Math.min(31, Math.floor(i * 0.9) + 1)] / 255 : 0;
      if (!analyser.current && !a.paused) v = 0.35 + 0.3 * Math.sin(t * 7 + i * 0.7) * Math.sin(t * 3.1 + i * 0.3);
      if (a.paused) v = 0.06 + 0.04 * Math.sin(i * 0.9);
      const bh = Math.max(2, v * h);
      g.globalAlpha = a.paused ? 0.45 : 1;
      g.fillRect(i * bw + bw * 0.2, (h - bh) / 2, bw * 0.6, bh);
    }
    g.globalAlpha = 1;
    // progress ring
    const p = a.duration ? a.currentTime / a.duration : 0;
    if (ringRef.current) ringRef.current.style.strokeDashoffset = String(C * (1 - p));
    const s = Math.floor(a.currentTime);
    setTime(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`);
    if (!a.paused) raf.current = requestAnimationFrame(draw);
  }, []);

  const play = useCallback(async () => {
    const a = audioRef.current;
    if (!a) return;
    window.dispatchEvent(new CustomEvent(STOP_OTHERS, { detail: id }));
    ensureGraph();
    try {
      if (audioCtx?.state === "suspended") await audioCtx.resume();
      await a.play();
    } catch {
      /* autoplay blocked — user can press the button */
    }
  }, [id]);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) void play();
    else a.pause();
    if (btnRef.current) animate(btnRef.current, { scale: [0.86, 1], duration: 450, ease: "outElastic(1, .5)" });
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onPlay = () => {
      setPlaying(true);
      signalPlaying(true);
      cancelAnimationFrame(raf.current);
      raf.current = requestAnimationFrame(draw);
    };
    const onPause = () => {
      setPlaying(false);
      signalPlaying(false);
      draw();
    };
    const onStopOthers = (e: Event) => {
      if ((e as CustomEvent<string>).detail !== id) a.pause();
    };
    const onRequest = (e: Event) => {
      const d = (e as CustomEvent<string>).detail;
      if (d === id || (latest && d === "latest")) void play();
    };
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onPause);
    a.addEventListener("loadedmetadata", draw);
    window.addEventListener(STOP_OTHERS, onStopOthers);
    window.addEventListener(PLAY_EVENT, onRequest);
    draw();
    return () => {
      cancelAnimationFrame(raf.current);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onPause);
      a.removeEventListener("loadedmetadata", draw);
      window.removeEventListener(STOP_OTHERS, onStopOthers);
      window.removeEventListener(PLAY_EVENT, onRequest);
    };
  }, [draw, id, play, latest]);

  return (
    <div className={`player ${playing ? "is-playing" : ""}`}>
      <audio ref={audioRef} src={src} preload="metadata" />
      <button ref={btnRef} className="pl-btn" onClick={toggle} aria-label={`${playing ? "Pause" : "Play"} preview: ${title}`}>
        <svg viewBox="0 0 60 60" aria-hidden="true">
          <defs>
            <linearGradient id={`ring-${id}`} x1="0" x2="1" y1="0" y2="0">
              <stop offset="0" stopColor="#ff2a8c" />
              <stop offset="0.5" stopColor="#f0dc1e" />
              <stop offset="1" stopColor="#28e6f0" />
            </linearGradient>
          </defs>
          <circle cx="30" cy="30" r={R} className="pl-track" />
          <circle ref={ringRef} cx="30" cy="30" r={R} className="pl-ring" stroke={`url(#ring-${id})`}
            strokeDasharray={C} strokeDashoffset={C} transform="rotate(-90 30 30)" />
          {playing ? (
            <g fill="#fff"><rect x="22" y="20" width="5.5" height="20" rx="1" /><rect x="32.5" y="20" width="5.5" height="20" rx="1" /></g>
          ) : (
            <path d="M24 19 L42 30 L24 41 Z" fill="#fff" />
          )}
        </svg>
      </button>
      <canvas ref={canvasRef} className="pl-wave" aria-hidden="true" />
      <span className="pl-time mono">{time} / 0:45</span>
    </div>
  );
}
