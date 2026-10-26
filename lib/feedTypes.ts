import type { FeedEpisode } from "./feed";

export type SiteEpisode = FeedEpisode & { displayTitle: string };
export type SiteFeed = {
  episodes: SiteEpisode[];
  youtubeUrl: string;
  spotifyUrl: string;
  spotifyEmbed: string;
};

/**
 * Only real episodes: uploads whose title carries an SxEy tag (S2E1 …). Old
 * trailers / channel intros are dropped. If nothing is tagged yet, the newest
 * upload stands in so the section is never empty. Input is newest-first.
 */
export function realEpisodes<T extends { season: number | null; episode: number | null }>(all: T[]): T[] {
  const tagged = all.filter((e) => e.season !== null && e.episode !== null);
  return tagged.length ? tagged : all.slice(0, 1);
}

/** Stable anchor ids for the Listen cards: S2 episodes answer to #ep-e1, #ep-e2 …, others to #ep-<videoId>. */
export function episodeAnchors(eps: { season: number | null; episode: number | null; videoId: string }[]) {
  const used = new Set<string>();
  return eps.map((ep) => {
    const nice = ep.season === 2 && ep.episode ? `ep-e${ep.episode}` : "";
    if (nice && !used.has(nice)) {
      used.add(nice);
      return nice;
    }
    return `ep-${ep.videoId}`;
  });
}
