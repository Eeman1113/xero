/**
 * Assets manifest — every image / audio file the site uses.
 * Files live in /public with their original names, so they can be swapped
 * for new versions with the SAME filename at any time. Nothing here
 * hardcodes pixel dimensions: objects are sized with CSS (width + auto height).
 */

/** GitHub Pages serves the site under /xero — every public path gets this prefix. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type ObjectName =
  | "airplane"
  | "alien_eye"
  | "apple"
  | "banana_bowl"
  | "camera"
  | "card_1"
  | "card_2"
  | "card_3"
  | "card_4"
  | "cards"
  | "club"
  | "coconut_oil"
  | "farcry"
  | "keyboard"
  | "knife"
  | "marker"
  | "mythbusters"
  | "nokia"
  | "splatter"
  | "tablet"
  | "van"
  | "microphone"
  | "polaroid_photos"
  | "sticky_notes"
  | "coffee_mug"
  | "headphones"
  | "controller"
  | "robot_head"
  | "ballot_box"
  | "tower"
  | "banana"
  | "road_sign"
  // multi-part kits (animated in pieces)
  | "polaroid_1"
  | "polaroid_2"
  | "polaroid_3"
  | "polaroid_4"
  | "cassette_body"
  | "cassette_reel"
  | "van_body"
  | "van_wheel"
  | "ballot_box_empty"
  | "ballot_hand"
  | "keycap_x"
  | "keycap_e"
  | "keycap_r"
  | "keycap_o"
  | "keycap_esc"
  | "keycap_enter"
  | "sticky_1"
  | "sticky_2"
  | "sticky_3"
  | "bubble_1"
  | "bubble_2"
  | "bubble_3"
  | "bubble_4";

/** "neon" = new colour art (glowing contour fills); "lineart" = original white cut-outs from the cover */
export type ArtStyle = "neon" | "lineart";
/** `src` is the original PNG (fallback); `webp` is a generated, ~7x lighter copy (max 1200px) served first. */
type Entry = { src: string; webp: string; alt: string; usedIn: string[]; style: ArtStyle };

const LINEART = new Set<ObjectName>(["alien_eye", "apple", "banana_bowl", "cards", "club", "farcry", "marker", "mythbusters", "splatter", "tablet"]);

const o = (name: ObjectName, alt: string, usedIn: string[]): [ObjectName, Entry] => [
  name,
  { src: `${BASE}/objects/${name}.png`, webp: `${BASE}/objects/${name}.webp`, alt, usedIn, style: LINEART.has(name) ? "lineart" : "neon" },
];

export const OBJECTS: Record<ObjectName, Entry> = Object.fromEntries([
  o("airplane", "Line-art airplane", ["03 takeoff (crosses screen)", "07 collage"]),
  o("alien_eye", "Black blob creature with one eye", ["05 dim background fragment", "07 collage"]),
  o("apple", "Apple logo", ["05 dim background fragment", "07 collage"]),
  o("banana_bowl", "Bowl of bananas", ["05 dim background fragment"]),
  o("camera", "Instant camera", ["02 memories (hero)", "07 collage"]),
  o("card_1", "Ace of spades", ["06 card fan (1)"]),
  o("card_2", "Ace of hearts", ["06 card fan (2)"]),
  o("card_3", "Ace of diamonds", ["06 card fan (3)"]),
  o("card_4", "Ace of clubs", ["06 card fan (4)"]),
  o("cards", "Stack of ace playing cards", ["05 dim background fragment", "07 collage"]),
  o("club", "Club suit", ["02 fragment", "05 dim background fragment", "06 floating", "07 collage"]),
  o("coconut_oil", "Coconut oil bottle", ["05 hero orbit (CULTURE)", "07 collage"]),
  o("farcry", "Stacked FARCRY wordmarks", ["05 dim background fragment", "07 collage"]),
  o("keyboard", "Mechanical keyboard", ["04 machine (rises)", "07 collage"]),
  o("knife", "Butterfly knife", ["05 mid orbit", "07 collage"]),
  o("marker", "Paint marker", ["05 dim background fragment", "07 collage"]),
  o("mythbusters", "MYTHBUSTERS sign", ["05 dim background fragment", "07 collage"]),
  o("nokia", "Nokia 3310", ["04 machine (side)", "05 hero orbit (CULTURE)", "07 collage"]),
  o("splatter", "Ink splatter", ["05 dim background fragment", "07 collage"]),
  o("tablet", "Drawing tablet", ["02 fragment", "05 dim background fragment", "07 collage"]),
  o("van", "Maruti Omni van (faces right)", ["07 drives left→right along a contour line", "07 collage"]),
  o("microphone", "Microphone", ["04 machine (back to the mic)", "08 press play"]),
  o("polaroid_photos", "Polaroid photos", ["02 camera dissolves into these"]),
  o("sticky_notes", "Sticky notes with passwords", ["03 'suspicious number of passwords'"]),
  o("coffee_mug", "Coffee mug", ["02 fragment", "04 machine"]),
  o("controller", "Game controller", ["05 hero orbit (GAMES)"]),
  o("robot_head", "Robot head", ["05 hero orbit (AI)"]),
  o("ballot_box", "Ballot box", ["05 hero orbit (GOVERNMENT)"]),
  o("tower", "Tall tower building", ["05 hero orbit (ARCHITECTURE)"]),
  o("banana", "Bunch of bananas", ["05 hero orbit (CULTURE)", "07 collage"]),
  o("road_sign", "Highway sign with a winding-road arrow", ["07 slides in as the van approaches"]),
  o("headphones", "Headphones", ["02 fragment", "05 hero orbit (CULTURE)", "08 press play"]),
  // ---- multi-part kits ----
  o("polaroid_1", "Polaroid of a sunset city skyline", ["02 printed by the camera, flips to a caption"]),
  o("polaroid_2", "Polaroid of two friends on a rooftop at night", ["02 printed by the camera, flips to a caption"]),
  o("polaroid_3", "Polaroid of a game controller on a bed", ["02 printed by the camera, flips to a caption"]),
  o("polaroid_4", "Polaroid of a winding road at night", ["02 printed by the camera, flips to a caption"]),
  o("cassette_body", "Cassette tape", ["02 tape motif", "Listen section tape"]),
  o("cassette_reel", "Cassette reel", ["02 + Listen: spins behind the cassette windows"]),
  o("van_body", "Maruti Omni van body (faces right)", ["07 rides the contour line"]),
  o("van_wheel", "Van wheel", ["07 two wheels, rotate with distance travelled"]),
  o("ballot_box_empty", "Ballot box", ["05 GOVERNMENT orbit (receives the slip)"]),
  o("ballot_hand", "Hand dropping a ballot slip", ["05 GOVERNMENT: drops the slip into the slot"]),
  o("keycap_x", "X keycap", ["04 lands in the XERO row"]),
  o("keycap_e", "E keycap", ["04 lands in the XERO row"]),
  o("keycap_r", "R keycap", ["04 lands in the XERO row"]),
  o("keycap_o", "O keycap", ["04 lands in the XERO row"]),
  o("keycap_esc", "ESC keycap", ["04 floating accent"]),
  o("keycap_enter", "ENTER keycap", ["04 floating accent, pulses at 'back to the microphone'"]),
  o("sticky_1", "Pink sticky note", ["03 slaps on at 'passwords', peels off"]),
  o("sticky_2", "Yellow sticky note", ["03 slaps on at 'passwords', peels off"]),
  o("sticky_3", "Cyan sticky note", ["03 slaps on at 'passwords', peels off"]),
  o("bubble_1", "Round speech bubble", ["04 question bubble", "06 reaction"]),
  o("bubble_2", "Rounded-rectangle speech bubble", ["04 question bubble"]),
  o("bubble_3", "Spiky shout bubble", ["04 question bubble", "06 reaction"]),
  o("bubble_4", "Thought cloud bubble", ["04 question bubble", "06 reaction"]),
]) as Record<ObjectName, Entry>;

export const IMAGES = {
  cover: { src: `${BASE}/img/cover_art.webp`, fallback: `${BASE}/img/cover_art.png`, alt: "XERO Season 2 cover art", usedIn: ["02 polaroid crops", "Listen section"] },
  e1: { src: `${BASE}/img/e1_thumb.jpg`, alt: "Season 2 Episode 1 thumbnail", usedIn: ["06 card back", "Listen section"] },
  e2: { src: `${BASE}/img/e2_thumb.jpg`, alt: "Season 2 Episode 2 thumbnail", usedIn: ["06 card back", "Listen section"] },
} as const;

export const AUDIO = {
  e1: `${BASE}/audio/e1_preview.mp3`,
  e2: `${BASE}/audio/e2_preview.mp3`,
} as const;

export const EPISODES = [
  { id: "e1", season: 2, number: 1, title: "Season 2 · Episode 1", thumb: IMAGES.e1.src, audio: AUDIO.e1 },
  { id: "e2", season: 2, number: 2, title: "Season 2 · Episode 2", thumb: IMAGES.e2.src, audio: AUDIO.e2 },
] as const;

/* Listen links (the episode list itself is automatic — see lib/feed.ts). */
export const LISTEN_LINKS = [
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@tothepower0" },
  { id: "spotify", label: "Spotify", href: "https://open.spotify.com/show/2wdDWjS9Vyjejc6kXJt7Vv" },
] as const;
