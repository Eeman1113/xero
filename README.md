# XERO: "A Life in Progress" (Season 2 site)

This is a scroll-driven parallax story for the XERO podcast. The neon contour lines from the cover stay on screen for the whole page, and the collage objects move through 8 chapters before the page ends on the real episodes.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # static export → ./out  (deploy the folder anywhere)
npm run typecheck
```

Requires Node 20 or later. Dependency versions are pinned: Next 16.4.3, React 19.3.1, GSAP 3.15.0, Lenis 1.3.27 and anime.js 4.5.0.

## How it works

- **Lenis** handles smooth scrolling. It is wired into GSAP's ticker in `components/Experience.tsx`.
- **GSAP + ScrollTrigger** drive the 4 long pinned scenes. Each scene has one scrubbed timeline, so objects can carry over from one chapter to the next. The scenes overlap by one viewport, which means there is no dead scroll between them.
- **anime.js v4** handles the smaller animations:
  - text reveals: character and word staggers, fired by scroll cues and reversed when you scroll back
  - the card flips
  - the contrail's SVG line drawing (`svg.createDrawable`), seeked by the scroll
  - the intro
  - the play-button pulse
  - the hover jiggles
  - the HUD label swap
- **ContourField** is a fixed canvas behind everything. It draws 40 lines (26 on mobile) with the pink→cyan gradient. Their shape comes from sine fields that react to scroll phase, idle drift and the mouse. Scenes change it by tweening presets in `lib/field.ts`, for example depth for ch3, ripple for ch5, the highlighted line plus the van for ch7, and converge for ch8.
- **Reduced motion** turns off pinning and scrubbing. Chapters become a normal page with simple fades, a static field and no grain animation.

## Structure

```
app/                layout (fonts, motion-mode script), page, globals.css
components/
  Experience.tsx    Lenis/GSAP wiring, mouse parallax vars, hover jiggle, page order
  ContourField.tsx  the neon line field (canvas, DPR capped)
  Grain.tsx Hud.tsx Intro.tsx
  scenes/           4 pinned scenes, each composing its chapters' layers + build fns
  chapters/         Ch01Signal … Ch08PressPlay: markup (Layer) + timeline (buildChXX)
  listen/           ListenSection (cover, episodes, links), AudioPlayer, Footer
  ui/               Reveal (split text), Prompter (long-form reveal-lines), Obj (3-plane object)
lib/
  useScrollScene.ts shared pinned-scene helper (chapters→HUD, cues, prompter, field presets)
  field.ts          shared field state + presets
  story.ts          ALL copy, verbatim from STORY.md
  assets.ts         assets manifest (every image/audio + where it's used) + listen links
```

## Where each asset is used

| Asset | Where |
|---|---|
| camera | 02 hero: floats forward, then "shutter" flash dissolves into polaroids; 07 collage |
| polaroid_photos | 02: scatters out of the camera (with 3 CSS polaroids cropped from the cover) |
| tablet, club, coffee_mug, headphones | 02 drifting fragments; club also in 06; headphones in 08 |
| airplane | 03: takes off across the screen **before** the text, with an anime.js contrail; 07 |
| sticky_notes | 03: "a suspicious number of passwords" (plus CSS password notes) |
| keyboard | 04: rises toward the viewer while CSS keycaps fly out; 07 |
| nokia, coffee_mug, microphone | 04 side objects; the mic appears at "back to the microphone"; mic again in 08 |
| robot_head (AI), ballot_box (GOVERNMENT), tower (ARCHITECTURE), controller (GAMES), headphones + coconut_oil + banana + nokia (CULTURE) | 05 main orbiting objects. Each one swells while its topic word is on screen. The knife orbits in the middle distance |
| mythbusters, alien_eye, apple, farcry, splatter, tablet, club, marker, cards, banana_bowl (original white line-art) | 05: small, dim, blurred background pieces (opacity 0.25–0.4); most also appear in the 07 collage |
| card_1 … card_4 (ace of spades, hearts, diamonds, clubs) | 06: a loose stack fans out, then each card flips to show E1, topics, topics, E2 (you can also click them) |
| van (faces right) | 07: drives left→right along the highlighted contour line, then lands in the collage |
| road_sign | 07: slides in from the right as the van approaches, then drifts off as the camera pulls back |
| cover_art.webp / .png | Listen section; polaroid crops in 02; OG image |
| e1_thumb.jpg, e2_thumb.jpg | 06 card backs; episode cards |
| e1_preview.mp3, e2_preview.mp3 | episode preview players; the big play button starts E1 |

All objects are sized by CSS width with auto height. You can swap any PNG for a new one with the **same filename** and the code doesn't need to change. For a quick visual retune, change the `width`/`clamp()` for that object in `globals.css`. The collage layout uses positions sampled from the cover (`COLLAGE` in `components/chapters/Ch07Journey.tsx`).

## To replace

- **Listen links**: `LISTEN_LINKS` in `lib/assets.ts` is currently `#` (marked TODO). Add the YouTube, Spotify and Apple Podcasts URLs there.
- **Domain**: `metadataBase` in `app/layout.tsx` (TODO).
- **Logo**: the wordmark is set in Anton (HUD, ch1 title, ch8 title, intro). To use the real XERO logo, put an SVG in `public/img/` and swap it in `components/Hud.tsx` and the `.c1-title` / `.c8-title` markup.
- **Episode titles**: `EPISODES` in `lib/assets.ts`. They currently read "Season 2 · Episode 1/2".
- **Art styles**: each object in `lib/assets.ts` is marked `neon` (new colour art, which gets a soft pink/cyan glow) or `lineart` (the original white cut-outs, used plainly with no glow). `microphone_lineart.png` is in `public/objects/` but not used.
- The question fragments in ch4 and the card-back labels in ch6 are UI flavour text, not STORY.md copy. Edit them in their chapter files.

## Auto episodes (YouTube RSS + Spotify)
- `lib/feed.ts` reads the XERO YouTube channel RSS (`channel_id=UCz0EupbaPGmmwxRclcM5j9Q`, @tothepower0) on the server.
- `app/page.tsx` is statically exported; the hourly Pages workflow re-reads the feed, so **new uploads appear on the site automatically**.
- Titles containing `S2E3`-style tags get an `S2 · E3` badge; the tag is stripped from the display title. Newest 6 uploads are shown; each card plays inline (youtube-nocookie) or opens YouTube.
- Spotify has no public RSS for a show link, so the Listen section embeds the official show player (`open.spotify.com/embed/show/2wdDWjS9Vyjejc6kXJt7Vv`), which always lists the newest episodes.
- If YouTube is unreachable, the section falls back to the bundled S2E1/S2E2 preview players.
- Hosted on **GitHub Pages** (static export): https://xeropodcast.online (custom domain via `public/CNAME`; DNS at Hostinger → GitHub Pages A/AAAA records, `www` CNAME → eeman1113.github.io). The feed is read at build time and `.github/workflows/deploy.yml` rebuilds + redeploys **every hour** (and on every push to `main`), so new YouTube uploads appear automatically. Run it manually from the repo's Actions tab → "Deploy to GitHub Pages" → Run workflow.
- Note: GitHub pauses scheduled workflows after 60 days with no repo activity — any push (or re-enabling the workflow) resumes them.

## Local dev
`npm run dev` → http://localhost:3000 (no base path). Production build like CI: `npm run build` → `out/`.
