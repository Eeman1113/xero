import Experience from "@/components/Experience";
import {
  getYouTubeEpisodes,
  cleanTitle,
  YOUTUBE_CHANNEL_URL,
  SPOTIFY_SHOW_URL,
  SPOTIFY_EMBED_URL,
} from "@/lib/feed";

// Static export for GitHub Pages: the YouTube feed is read at BUILD time, and the
// "deploy" GitHub Action rebuilds every hour, so new episodes appear automatically.
export const dynamic = "force-static";

export default async function Page() {
  const episodes = (await getYouTubeEpisodes()).map((e) => ({ ...e, displayTitle: cleanTitle(e.title) }));
  return (
    <Experience
      feed={{ episodes, youtubeUrl: YOUTUBE_CHANNEL_URL, spotifyUrl: SPOTIFY_SHOW_URL, spotifyEmbed: SPOTIFY_EMBED_URL }}
    />
  );
}
