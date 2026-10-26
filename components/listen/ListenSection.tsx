"use client";
import { useEffect, useRef, useState } from "react";
import { animate, stagger } from "animejs";
import AudioPlayer from "./AudioPlayer";
import { CassetteKit as Cassette } from "../kits/Kits";
import { setPlaying as signalPlaying } from "@/lib/playing";
import Reveal from "../ui/Reveal";
import { EPISODES, IMAGES } from "@/lib/assets";
import { STORY } from "@/lib/story";
import { ScrollTrigger } from "@/lib/gsap";
import { revealIn } from "@/lib/reveal";
import { registerRegion } from "@/lib/hud";
import { prefersReduced } from "@/lib/motion";
import { PLAY_EVENT } from "../chapters/Ch08PressPlay";
import type { SiteEpisode, SiteFeed } from "@/lib/feedTypes";

const ICONS: Record<string, string> = {
  youtube: "M10 8.5v7l6-3.5-6-3.5Z",
  spotify: "M6 9.5c4-1.3 8.6-1 12 1M7 12.6c3.3-1 6.8-.7 9.6.9M8 15.5c2.5-.7 5-.5 7 .7",
};

const MAX_EPISODES = 6;

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/** One YouTube episode: thumbnail until clicked, then an inline (privacy-enhanced) player. */
function FeedEpisodeCard({ ep, anchor, latest }: { ep: SiteEpisode; anchor: string; latest: boolean }) {
  const [playing, setPlaying] = useState(false);
  // the Listen cassette's reels run at play speed once an episode is open
  useEffect(() => {
    if (playing) signalPlaying(true);
  }, [playing]);
  // the big ch8 play button asks for the latest episode
  useEffect(() => {
    if (!latest) return;
    const onPlay = (e: Event) => {
      if ((e as CustomEvent<string>).detail === "latest") setPlaying(true);
    };
    window.addEventListener(PLAY_EVENT, onPlay);
    return () => window.removeEventListener(PLAY_EVENT, onPlay);
  }, [latest]);
  const badge = ep.season && ep.episode ? `S${ep.season} · E${ep.episode}` : "XERO";
  return (
    <article className={`ep ${playing ? "is-playing" : ""}`} id={anchor}>
      <div className="ep-thumb">
        {playing ? (
          <iframe
            className="ep-yt"
            src={`https://www.youtube-nocookie.com/embed/${ep.videoId}?autoplay=1&rel=0`}
            title={ep.title}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button type="button" className="ep-play" onClick={() => setPlaying(true)} aria-label={`Play ${ep.title}`}>
            <img src={ep.thumb} alt="" loading="lazy" decoding="async" />
            <span className="ep-play-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M8 5.5v13l11-6.5-11-6.5Z" /></svg>
            </span>
          </button>
        )}
        <span className="ep-badge mono">{badge}</span>
      </div>
      <div className="ep-body">
        <div>
          <span className="ep-date mono">{fmtDate(ep.published)}</span>
          <h3 className="ep-title display">{ep.displayTitle}</h3>
        </div>
        <div className="ep-actions">
          <button type="button" className="ep-btn" onClick={() => setPlaying(true)}>
            ▶ Watch here
          </button>
          <a className="ep-btn ep-btn-ghost" href={ep.url} target="_blank" rel="noreferrer">
            YouTube ↗
          </a>
        </div>
      </div>
    </article>
  );
}

/**
 * Final "Press Play" area. Episodes come from the YouTube channel RSS (read on the
 * server, refreshed hourly — see lib/feed.ts), so new uploads appear automatically.
 * If the feed is unreachable we fall back to the bundled S2 preview players.
 */
export default function ListenSection({ feed }: { feed: SiteFeed }) {
  const ref = useRef<HTMLElement>(null);
  const episodes = feed.episodes.slice(0, MAX_EPISODES);
  // S2 episodes also answer to #ep-e1, #ep-e2 … (the ch6 card backs link there)
  const anchors = (() => {
    const used = new Set<string>();
    return episodes.map((ep) => {
      const nice = ep.season === 2 && ep.episode ? `ep-e${ep.episode}` : "";
      if (nice && !used.has(nice)) {
        used.add(nice);
        return nice;
      }
      return `ep-${ep.videoId}`;
    });
  })();
  const links = [
    { id: "youtube", label: "YouTube", href: feed.youtubeUrl },
    { id: "spotify", label: "Spotify", href: feed.spotifyUrl },
  ];

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const triggers: ScrollTrigger[] = [];
    const lt = ScrollTrigger.create({ trigger: root, start: "top 60%", end: "bottom top" });
    triggers.push(lt);
    const unreg = registerRegion({ start: () => lt.start, chapterAt: () => "08" });
    root.querySelectorAll("[data-reveal]").forEach((el) =>
      triggers.push(ScrollTrigger.create({ trigger: el, start: "top 88%", once: true, onEnter: () => revealIn(el) })),
    );
    const items = root.querySelectorAll(".ep, .ls-cover, .ls-btn, .ls-spotify");
    if (!prefersReduced()) {
      items.forEach((el) => ((el as HTMLElement).style.opacity = "0"));
      triggers.push(
        ScrollTrigger.create({
          trigger: root.querySelector(".ls-grid"),
          start: "top 80%",
          once: true,
          onEnter: () =>
            animate(items, { opacity: [0, 1], y: [60, 0], rotate: [() => (Math.random() - 0.5) * 8, 0], duration: 900, delay: stagger(90), ease: "outExpo" }),
        }),
      );
    }
    return () => {
      unreg();
      triggers.forEach((t) => t.kill());
    };
  }, []);

  return (
    <section ref={ref} id="listen" className="listen">
      <div className="ls-head">
        <div>
          <span className="mono ls-k">08 — PRESS PLAY · LATEST EPISODES</span>
          <Reveal as="h2" mode="chars" className="ls-title display" text="Hit play." />
        </div>
        <Cassette className="ls-cassette" label="TAPE 02 · SIDE B" />
      </div>
      <div className="ls-grid">
        <figure className="ls-cover">
          <picture>
            <source srcSet={IMAGES.cover.src} type="image/webp" />
            <img src={IMAGES.cover.fallback} alt={IMAGES.cover.alt} loading="lazy" decoding="async" />
          </picture>
          <figcaption className="mono">XERO · S2 · A LIFE IN PROGRESS</figcaption>
        </figure>
        <div className="ls-eps">
          {episodes.length
            ? episodes.map((ep, i) => <FeedEpisodeCard key={ep.videoId} ep={ep} anchor={anchors[i]} latest={i === 0} />)
            : EPISODES.map((ep) => (
                <article className="ep" id={`ep-${ep.id}`} key={ep.id}>
                  <div className="ep-thumb">
                    <img src={ep.thumb} alt={`${ep.title} thumbnail`} loading="lazy" decoding="async" />
                    <span className="ep-badge mono">S{ep.season} · E{ep.number}</span>
                  </div>
                  <div className="ep-body">
                    <h3 className="ep-title display">{ep.title}</h3>
                    <AudioPlayer id={ep.id} src={ep.audio} title={ep.title} latest={ep.id === EPISODES[EPISODES.length - 1].id} />
                  </div>
                </article>
              ))}
          <div className="ls-spotify">
            <span className="mono ls-k">ALSO ON SPOTIFY — ALWAYS THE LATEST</span>
            <iframe
              src={feed.spotifyEmbed}
              title="XERO on Spotify"
              width="100%"
              height="352"
              loading="lazy"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            />
          </div>
          <div className="ls-links">
            {links.map((l) => (
              <a key={l.id} className={`ls-btn ls-btn--${l.id}`} href={l.href} target="_blank" rel="noreferrer">
                <svg viewBox="0 0 24 24" aria-hidden="true"><path d={ICONS[l.id]} /></svg>
                <span>{l.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Reveal as="p" className="ls-closer" text={STORY.ch8.copy} />
    </section>
  );
}
