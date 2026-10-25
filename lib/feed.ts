/**
 * Auto episode feed. Reads the XERO YouTube channel's public RSS on the server and
 * is read at build time; .github/workflows/deploy.yml rebuilds the site every hour,
 * so every new upload shows up on GitHub Pages by itself. Spotify has no public RSS for a show URL, so the
 * Spotify side is the official show embed (which always lists the newest episodes).
 */

export const YOUTUBE_CHANNEL_ID = "UCz0EupbaPGmmwxRclcM5j9Q";
export const YOUTUBE_CHANNEL_URL = "https://www.youtube.com/@tothepower0";
export const SPOTIFY_SHOW_ID = "2wdDWjS9Vyjejc6kXJt7Vv";
export const SPOTIFY_SHOW_URL = `https://open.spotify.com/show/${SPOTIFY_SHOW_ID}`;
export const SPOTIFY_EMBED_URL = `https://open.spotify.com/embed/show/${SPOTIFY_SHOW_ID}?utm_source=generator&theme=0`;

export type FeedEpisode = {
  videoId: string;
  title: string;
  published: string; // ISO
  description: string;
  thumb: string;
  url: string;
  season: number | null;
  episode: number | null;
};

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .trim();

const tag = (xml: string, name: string) => {
  const m = xml.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : "";
};

/** "S2E1", "S2 E1", "s02e01", "Season 2 Episode 1" → {season, episode} */
function parseNumbering(title: string): { season: number | null; episode: number | null } {
  const m =
    title.match(/\bS\s*0*(\d{1,2})\s*[·\-\s]?\s*E(?:P)?\s*0*(\d{1,3})\b/i) ??
    title.match(/season\s*0*(\d{1,2})\D{1,12}episode\s*0*(\d{1,3})/i);
  return m ? { season: Number(m[1]), episode: Number(m[2]) } : { season: null, episode: null };
}

/** Title without the trailing "S2E1" tag, for display. */
export function cleanTitle(title: string) {
  return title.replace(/\s*[|·\-–]?\s*\bS\s*\d{1,2}\s*[·\-\s]?\s*E(?:P)?\s*\d{1,3}\b\s*$/i, "").trim() || title;
}

export async function getYouTubeEpisodes(): Promise<FeedEpisode[]> {
  try {
    const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`, {
      cache: "force-cache",
    });
    if (!res.ok) throw new Error(`YouTube feed ${res.status}`);
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1).map((e) => e.split("</entry>")[0]);
    return entries
      .map((e) => {
        const videoId = tag(e, "yt:videoId");
        const title = tag(e, "title");
        return {
          videoId,
          title,
          published: tag(e, "published"),
          description: tag(e, "media:description"),
          thumb: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          ...parseNumbering(title),
        };
      })
      .filter((e) => e.videoId)
      .sort((a, b) => +new Date(b.published) - +new Date(a.published));
  } catch (err) {
    console.error("[feed] YouTube RSS failed — falling back to local episodes", err);
    return [];
  }
}
