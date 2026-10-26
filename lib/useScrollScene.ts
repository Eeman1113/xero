"use client";
import { useEffect, useLayoutEffect, type RefObject } from "react";
import { gsap, ScrollTrigger } from "./gsap";
import { field, PRESETS, registerFieldOwner, type FieldPreset, type PresetName } from "./field";
import { registerRegion } from "./hud";
import { revealIn, revealOut } from "./reveal";
import { REDUCED_QUERY, SMALL_QUERY } from "./motion";

function snapshotField() {
  const { bends, follower, follower2, ...rest } = field;
  return { rest: { ...rest }, bends: bends.map((b) => ({ ...b })), t: follower.t, on: follower.on, t2: follower2.t, on2: follower2.on };
}
function restoreField(s: ReturnType<typeof snapshotField>) {
  Object.assign(field, s.rest);
  s.bends.forEach((b, i) => Object.assign(field.bends[i], b));
  field.follower.t = s.t;
  field.follower.on = s.on;
  field.follower2.t = s.t2;
  field.follower2.on = s.on2;
}

const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

type Cue = { time: number; on: () => void; off: () => void; active: boolean };

export type SceneAPI = {
  tl: gsap.core.Timeline;
  /** scoped selector (within the scene root) */
  q: (selector: string) => HTMLElement[];
  /** first match of a scoped selector (throws if missing — catches typos early) */
  one: (selector: string) => HTMLElement;
  /** true on small screens */
  small: boolean;
  /** start a chapter at `at` (defaults to the end of the timeline); returns its start time */
  chapter: (id: string, at?: number) => number;
  /** this scene's own live preset copy (tween its numbers for one-off field accents) */
  field: FieldPreset;
  /** tween the shared ContourField to a preset */
  fieldTo: (name: PresetName, at: number, duration?: number, ease?: string) => void;
  /** fire an anime.js text reveal when the playhead passes `at` (reverses on scroll-back) */
  reveal: (el: Element, at: number, outAt?: number) => void;
  /** generic forward/backward cue */
  cue: (at: number, on: () => void, off: () => void) => void;
  /** teleprompter: scroll a long-form column so each line centres in turn */
  prompter: (root: HTMLElement, at: number, duration: number) => void;
  /** layer visibility helpers */
  layerIn: (el: Element, at: number, duration?: number) => void;
  layerOut: (el: Element, at: number, duration?: number) => void;
  /** run when the scene is torn down (matchMedia change / unmount) */
  cleanup: (fn: () => void) => void;
};

export type SceneOptions = {
  /** preset the ContourField has when this scene starts */
  startPreset: PresetName;
  /** viewport heights of scroll per timeline second */
  vhPerUnit?: number;
  build: (api: SceneAPI) => void;
  /** reduced-motion: called instead of build (optional) */
  buildReduced?: (root: HTMLElement) => void;
};

/**
 * Builds one long pinned scene: a paused GSAP timeline driven by a scrubbed,
 * pinned ScrollTrigger. Handles chapter labels → HUD, scroll cues for
 * anime.js reveals, prompters, field presets and cleanup (gsap.matchMedia).
 */
export function useScrollScene(ref: RefObject<HTMLElement | null>, opts: SceneOptions) {
  useIsoLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const stage = root.querySelector<HTMLElement>(".stage") ?? root;
    const mm = gsap.matchMedia();

    mm.add(
      // gsap.matchMedia only runs this callback when at least one condition matches,
      // so `any` (always true) guarantees desktop/full-motion builds too.
      { any: "all", reduce: REDUCED_QUERY, small: SMALL_QUERY },
      (ctx) => {
        const { reduce, small } = ctx.conditions as { reduce: boolean; small: boolean };

        if (reduce) {
          // Simple fades: every layer fades in as it enters; no pinning, no scrub.
          const unregs: (() => void)[] = [];
          root.querySelectorAll(".layer").forEach((layer) => {
            const id = layer.getAttribute("data-ch") ?? "01";
            const lt = ScrollTrigger.create({ trigger: layer, start: "top 60%", end: "bottom 40%" });
            unregs.push(registerRegion({ start: () => lt.start, chapterAt: () => id }));
            gsap.fromTo(
              layer,
              { autoAlpha: 0 },
              { autoAlpha: 1, duration: 0.8, ease: "power1.out", scrollTrigger: { trigger: layer, start: "top 75%" } },
            );
            layer.querySelectorAll("[data-reveal]").forEach((el) =>
              ScrollTrigger.create({ trigger: el, start: "top 85%", once: true, onEnter: () => revealIn(el) }),
            );
          });
          opts.buildReduced?.(root);
          return () => unregs.forEach((u) => u());
        }

        const tl = gsap.timeline({ paused: true, defaults: { ease: "none" } });
        const cues: Cue[] = [];
        const cleanups: (() => void)[] = [];
        const chapters: { id: string; time: number }[] = [];
        let preset: PresetName = opts.startPreset;
        const fieldPreset: FieldPreset = { ...PRESETS[opts.startPreset] };

        const q = (s: string) => Array.from(root.querySelectorAll<HTMLElement>(s));
        const one = (s: string) => {
          const el = root.querySelector<HTMLElement>(s);
          if (!el) throw new Error(`useScrollScene: missing ${s}`);
          return el;
        };

        const api: SceneAPI = {
          tl,
          q,
          one,
          small,
          field: fieldPreset,
          chapter: (id, at) => {
            const time = at ?? tl.duration();
            chapters.push({ id, time });
            tl.addLabel(`ch${id}`, time);
            return time;
          },
          fieldTo: (name, at, duration = 1, ease = "sine.inOut") => {
            // tweens this scene's own preset copy; ContourField reads the copy
            // of whichever scene is on screen (see registerFieldOwner)
            tl.fromTo(
              fieldPreset,
              { ...PRESETS[preset] },
              { ...PRESETS[name], duration, ease, immediateRender: false },
              Math.max(at, 0.002),
            );
            preset = name;
          },
          reveal: (el, at, outAt) => {
            cues.push({ time: at, on: () => revealIn(el), off: () => revealOut(el), active: false });
            if (outAt !== undefined) {
              cues.push({ time: outAt, on: () => revealOut(el), off: () => revealIn(el), active: false });
            }
          },
          cue: (at, on, off) => cues.push({ time: at, on, off, active: false }),
          prompter: (box, at, duration) => {
            const col = box.querySelector<HTMLElement>(".p-col");
            const lines = Array.from(box.querySelectorAll<HTMLElement>(".p-line"));
            if (!col || !lines.length) return;
            const n = lines.length;
            const step = duration / n;
            const centre = (l: HTMLElement) => l.offsetTop + l.offsetHeight / 2;
            const yFor = (i: number) => () => box.clientHeight * 0.5 - centre(lines[i]);
            tl.fromTo(col, { y: () => box.clientHeight * 1.04 - centre(lines[0]) }, { y: yFor(0), duration: step, immediateRender: false }, at);
            for (let i = 1; i < n; i++) {
              tl.to(col, { y: yFor(i), duration: step, ease: "sine.inOut" }, at + i * step);
            }
            lines.forEach((l, i) => {
              const c = at + (i + 1) * step;
              tl.fromTo(l, { opacity: 0.12 }, { opacity: 1, duration: step * 0.6, immediateRender: false }, c - step * 0.7);
              if (i < n - 1) tl.to(l, { opacity: 0.12, duration: step * 0.6 }, c + step * 0.35);
            });
          },
          layerIn: (el, at, duration = 0.3) => {
            tl.fromTo(el, { autoAlpha: 0 }, { autoAlpha: 1, duration, immediateRender: false }, at);
          },
          layerOut: (el, at, duration = 0.3) => {
            tl.to(el, { autoAlpha: 0, duration }, at);
          },
          cleanup: (fn) => cleanups.push(fn),
        };

        // CSS `translate: -50% -50%` centring: GSAP folds the individual
        // `translate` property into its own transform cache, sometimes as px
        // (stale after a resize) and sometimes into x/y — where the next x/y
        // tween silently overwrites the centring. Move every percentage
        // translate into xPercent/yPercent explicitly so x/y tweens compose.
        root.querySelectorAll<HTMLElement>("*").forEach((el) => {
          const tr = getComputedStyle(el).translate;
          if (!tr || tr === "none" || !tr.includes("%")) return;
          const [tx, ty = "0px"] = tr.split(/\s+/);
          const pct = (v: string) => (v.endsWith("%") ? parseFloat(v) : parseFloat(v) === 0 ? 0 : NaN);
          const xp = pct(tx);
          const yp = pct(ty);
          if (Number.isNaN(xp) || Number.isNaN(yp)) return;
          // clear the CSS translate BEFORE GSAP first parses the element,
          // otherwise it folds the resolved px into x/y as well (double offset)
          el.style.translate = "none";
          gsap.set(el, { xPercent: xp, yPercent: yp });
        });

        opts.build(api);
        cues.sort((a, b) => a.time - b.time);

        // GSAP reverts a fromTo(immediateRender:false) to the element's
        // pre-tween inline style when the playhead rewinds past its start, so
        // an element whose FIRST tween is such a fromTo would sit in its raw
        // CSS state (visible, un-transformed) until that tween begins. Write
        // each element's earliest "from" state inline first, so the revert
        // lands on it.
        const firstFrom = new Map<Element, gsap.TweenVars>();
        const seen = new Map<unknown, Set<string>>();
        const SKIP = new Set(["immediateRender", "duration", "ease", "stagger", "onUpdate", "startAt", "delay"]);
        (tl.getChildren(true, true, false) as gsap.core.Tween[])
          .sort((a, b) => a.startTime() - b.startTime())
          .forEach((tw) => {
            const from = tw.vars.startAt as gsap.TweenVars | undefined;
            const props = Object.keys(from ?? tw.vars).filter((k) => !SKIP.has(k));
            tw.targets().forEach((t) => {
              const done = seen.get(t) ?? new Set<string>();
              seen.set(t, done);
              props.forEach((k) => {
                if (done.has(k)) return;
                done.add(k);
                if (from && tw.vars.immediateRender === false && t instanceof Element) {
                  const v = firstFrom.get(t) ?? {};
                  v[k] = from[k];
                  firstFrom.set(t, v);
                }
              });
            });
          });

        // Render every tween's start state (end → start, so each element's
        // earliest tween wins) without touching the shared field, which
        // belongs to whichever scene is currently on screen. Re-run after
        // every ScrollTrigger refresh too: invalidateOnRefresh throws away
        // the recorded start values.
        const prime = () => {
          const snap = snapshotField();
          const p = tl.progress();
          firstFrom.forEach((from, el) => gsap.set(el, { ...from }));
          tl.progress(1, true).progress(0, true).progress(p, true);
          restoreField(snap);
        };
        prime();

        const vh = opts.vhPerUnit ?? (small ? 85 : 100);
        const syncCues = () => {
          const t = tl.time();
          for (const c of cues) {
            const should = t >= c.time;
            if (should !== c.active) {
              c.active = should;
              (should ? c.on : c.off)();
            }
          }
        };
        tl.eventCallback("onUpdate", syncCues);

        const st = ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: () => `+=${(tl.duration() * vh * window.innerHeight) / 100}`,
          pin: stage,
          pinSpacing: true,
          scrub: small ? 0.6 : 1,
          animation: tl,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: prime,
        });

        const unregField = registerFieldOwner({ start: () => st.start, preset: fieldPreset });

        // HUD: map the actual scroll position inside this pin to a chapter
        const unreg = registerRegion({
          start: () => st.start,
          chapterAt: (scroll) => {
            const span = Math.max(1, st.end - st.start);
            const t = Math.min(1, Math.max(0, (scroll - st.start) / span)) * tl.duration();
            let cur = chapters[0]?.id ?? "01";
            for (const c of chapters) if (t >= c.time - 0.05) cur = c.id;
            return cur;
          },
        });

        // looping (idle) animations inside this scene only run while it is near the screen
        const live = ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onToggle: (self) => root.classList.toggle("is-live", self.isActive),
        });
        root.classList.toggle("is-live", live.isActive);

        return () => {
          cleanups.forEach((f) => f());
          live.kill();
          unreg();
          unregField();
          st.kill();
          tl.kill();
        };
      },
      root,
    );

    return () => mm.revert();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
