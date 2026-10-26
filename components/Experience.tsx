"use client";
import { useEffect, useLayoutEffect } from "react";
import Lenis from "lenis";
import { animate } from "animejs";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis, getLenis } from "@/lib/lenis";
import { focusStops, type FocusStop } from "@/lib/focusStops";
import { prefersReduced, isSmall } from "@/lib/motion";
import ContourField from "./ContourField";
import Grain from "./Grain";
import Hud from "./Hud";
import Intro from "./Intro";
import SceneOrigins from "./scenes/SceneOrigins";
import SceneModern from "./scenes/SceneModern";
import SceneWildcard from "./scenes/SceneWildcard";
import SceneRoad from "./scenes/SceneRoad";
import ListenSection from "./listen/ListenSection";
import Footer from "./listen/Footer";
import type { SiteFeed } from "@/lib/feedTypes";
import { FeedContext } from "@/lib/feedContext";

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

export default function Experience({ feed }: { feed: SiteFeed }) {
  // start at the top so the pinned story always begins at 01
  useIsoLayoutEffect(() => {
    // (the rm/motion class itself is set by an inline script in app/layout.tsx)
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);
  }, []);

  // Lenis smooth scroll wired into GSAP's ticker
  useEffect(() => {
    if (prefersReduced()) return;
    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // multi-part kits show as one piece: a kit stays hidden until EVERY part has
  // decoded, so a slow body image can never leave its lens / wheels / reels
  // floating on their own
  useEffect(() => {
    document.querySelectorAll<HTMLElement>(".kit, .veh, .cassette").forEach((kit) => {
      const imgs = Array.from(kit.querySelectorAll("img"));
      const pending = imgs.filter((i) => !(i.complete && i.naturalWidth));
      if (!pending.length) return;
      kit.dataset.loading = "";
      const done = () => delete kit.dataset.loading;
      Promise.all(imgs.map((i) => i.decode().catch(() => undefined))).then(done);
      // never keep a kit hidden forever (offline / blocked image)
      window.setTimeout(done, 15000);
    });
  }, []);

  // keyboard: Tab walks the story's interactive pieces in order, scrolling the
  // pinned scenes to each one first (hidden layers can't take focus natively)
  useEffect(() => {
    if (prefersReduced()) return;
    const go = (st: FocusStop) => {
      const y = Math.round(st.scroll());
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
      else window.scrollTo(0, y);
      ScrollTrigger.update();
      st.settle();
      st.el.focus({ preventScroll: true });
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey) return;
      const stops = focusStops();
      if (!stops.length) return;
      const ae = document.activeElement as HTMLElement | null;
      const i = stops.findIndex((s) => s.el === ae);
      if (i >= 0) {
        const j = i + (e.shiftKey ? -1 : 1);
        if (j < 0 || j >= stops.length) return; // leave the story: normal DOM order takes over
        e.preventDefault();
        go(stops[j]);
        return;
      }
      // entering the story forwards from the header (skip link / HUD)
      if (!e.shiftKey && ae && ae.closest(".hud, .skip-link") && ae === lastHudFocusable()) {
        e.preventDefault();
        go(stops[0]);
      }
    };
    const lastHudFocusable = () => {
      const all = Array.from(document.querySelectorAll<HTMLElement>(".skip-link, .hud a, .hud button")).filter(
        (el) => getComputedStyle(el).visibility !== "hidden",
      );
      return all[all.length - 1] ?? null;
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // refresh pin positions once fonts + images settle (art may be swapped any time)
  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    const t = window.setTimeout(refresh, 1500);
    return () => {
      window.removeEventListener("load", refresh);
      window.clearTimeout(t);
    };
  }, []);

  // mouse → CSS vars (--mx/--my in -1..1), smoothed; drives multi-plane parallax + stage tilt
  useEffect(() => {
    if (prefersReduced() || isSmall()) return;
    const root = document.documentElement;
    const p = { x: 0, y: 0 };
    const apply = () => {
      root.style.setProperty("--mx", p.x.toFixed(4));
      root.style.setProperty("--my", p.y.toFixed(4));
    };
    const toX = gsap.quickTo(p, "x", { duration: 1.1, ease: "power3.out", onUpdate: apply });
    const toY = gsap.quickTo(p, "y", { duration: 1.1, ease: "power3.out", onUpdate: apply });
    const onMove = (e: PointerEvent) => {
      toX((e.clientX / window.innerWidth) * 2 - 1);
      toY((e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // anime.js hover jiggle on any collage object
  useEffect(() => {
    if (prefersReduced()) return;
    const busy = new WeakSet<Element>();
    // keycap kit pieces get a "press" instead of a jiggle
    const press = (key: Element) => {
      const img = key.querySelector(".xk-press, .press");
      if (!img || busy.has(img)) return;
      busy.add(img);
      animate(img, {
        scaleY: [1, 0.8, 1],
        scaleX: [1, 1.07, 1],
        translateY: [0, 4, 0],
        duration: 420,
        ease: "outElastic(1, .45)",
        onComplete: () => busy.delete(img),
      });
    };
    const onDown = (e: PointerEvent) => {
      const key = (e.target as HTMLElement | null)?.closest?.("[data-press]");
      if (key) press(key);
    };
    const onOver = (e: PointerEvent) => {
      const key = (e.target as HTMLElement | null)?.closest?.("[data-press]");
      if (key) return press(key);
      // kits jiggle as a whole (.kit-j), single objects jiggle their image
      const o = (e.target as HTMLElement | null)?.closest?.(".obj");
      const img = o?.querySelector(":scope > .obj-m > .kit-j") ?? o?.querySelector(".obj-img");
      if (!img || busy.has(img)) return;
      busy.add(img);
      animate(img, {
        rotate: [0, -7, 6, -3, 1.5, 0],
        scale: [1, 1.06, 1],
        duration: 650,
        ease: "outQuad",
        onComplete: () => busy.delete(img),
      });
    };
    document.addEventListener("pointerover", onOver);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("pointerover", onOver);
      document.removeEventListener("pointerdown", onDown);
    };
  }, []);

  return (
    <FeedContext.Provider value={feed}>
      <a className="skip-link" href="#listen" onClick={(e) => {
        e.preventDefault();
        const ls = document.getElementById("listen");
        getLenis()?.scrollTo("#listen", { immediate: true, force: true });
        if (!getLenis()) ls?.scrollIntoView();
        (ls?.querySelector<HTMLElement>("button, a[href]"))?.focus({ preventScroll: true });
      }}>Skip to episodes</a>
      <Hud />
      <ContourField />
      <main className="story">
        <SceneOrigins />
        <SceneModern />
        <SceneWildcard />
        <SceneRoad />
        <ListenSection feed={feed} />
        <Footer />
      </main>
      <Grain />
      <Intro />
    </FeedContext.Provider>
  );
}
