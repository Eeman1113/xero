import type { FeedEpisode } from "./feed";

export type SiteEpisode = FeedEpisode & { displayTitle: string };
export type SiteFeed = {
  episodes: SiteEpisode[];
  youtubeUrl: string;
  spotifyUrl: string;
  spotifyEmbed: string;
};
