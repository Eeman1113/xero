/**
 * Assets manifest — every image / audio file the site uses.
 * Files live in /public with their original names, so they can be swapped
 * for new versions with the SAME filename at any time. Nothing here
 * hardcodes pixel dimensions: objects are sized with CSS (width + auto height).
 */

/** Optional sub-path prefix for every public path (empty on xeropodcast.online). */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type ObjectName =
  | "ai_chip"
  | "airplane"
  | "auto_body"
  | "auto_wheel"
  | "auto_wheel_b"
  | "ballot_box_empty"
  | "ballot_hand"
  | "banana"
  | "blueprint_roll"
  | "blueprint_sheet"
  | "brutalist"
  | "bubble_1"
  | "bubble_2"
  | "bubble_3"
  | "bubble_4"
  | "camera_body"
  | "camera_button"
  | "camera_lens"
  | "camera_photo"
  | "card_1"
  | "card_2"
  | "card_3"
  | "card_4"
  | "cassette_body"
  | "cassette_reel"
  | "cassette_reel_b"
  | "chai"
  | "chawl"
  | "cloud_1"
  | "cloud_2"
  | "coconut_oil"
  | "coffee_mug"
  | "compass"
  | "controller"
  | "earbuds"
  | "glass_tower"
  | "gpu_body"
  | "gpu_fan"
  | "gpu_fan_b"
  | "headphones"
  | "highway_board"
  | "keyboard"
  | "keycap_e"
  | "keycap_enter"
  | "keycap_esc"
  | "keycap_o"
  | "keycap_r"
  | "keycap_space"
  | "keycap_x"
  | "laptop"
  | "mic_body"
  | "mic_cable"
  | "mic_popfilter"
  | "microphone"
  | "nokia"
  | "nokia_button"
  | "polaroid_1"
  | "polaroid_2"
  | "polaroid_3"
  | "polaroid_4"
  | "road_sign"
  | "robot_head"
  | "robotarm_base"
  | "robotarm_lower"
  | "robotarm_upper"
  | "samosa"
  | "scale_model"
  | "scale_ruler"
  | "server_rack"
  | "set_square"
  | "sticky_1"
  | "sticky_2"
  | "sticky_3"
  | "t_square"
  | "vada_pav"
  | "van_body"
  | "van_wheel"
  | "van_wheel_b";

/** `src` is the PNG fallback; `webp` is the lighter copy served first. */
type Entry = { src: string; webp: string; alt: string; usedIn: string };

/* Every object is a posterized photo cut-out (v3 art). Multi-part kits are
   assembled + animated per part (see components/kits). */
const o = (name: ObjectName, alt: string, usedIn: string): [ObjectName, Entry] => [
  name,
  { src: `${BASE}/objects/${name}.png`, webp: `${BASE}/objects/${name}.webp`, alt, usedIn },
];

export const OBJECTS: Record<ObjectName, Entry> = Object.fromEntries([
  o("ai_chip", "AI chip", "05 AI lab: picked up by the robot arm"),
  o("airplane", "Passenger airplane", "03 takeoff, 07 collage"),
  o("auto_body", "Mumbai auto-rickshaw", "07 overtakes on a contour line"),
  o("auto_wheel", "Auto-rickshaw wheel", "07 auto rear wheel"),
  o("auto_wheel_b", "Auto-rickshaw wheel", "07 auto front wheel"),
  o("ballot_box_empty", "Ballot box", "05 GOVERNMENT orbit"),
  o("ballot_hand", "Hand dropping a ballot slip", "05 GOVERNMENT drop"),
  o("banana", "Bunch of bananas", "05 culture, 07 collage"),
  o("blueprint_roll", "Rolled-up blueprint", "05 architect: unrolls"),
  o("blueprint_sheet", "Blueprint floor plan", "05 architect"),
  o("brutalist", "Brutalist concrete building", "05 architect: rises"),
  o("bubble_1", "Round speech bubble", "04 / 06 bubbles"),
  o("bubble_2", "Rounded speech bubble", "04 bubbles"),
  o("bubble_3", "Spiky shout bubble", "04 / 06 bubbles"),
  o("bubble_4", "Thought bubble", "04 / 06 bubbles"),
  o("camera_body", "Instant camera", "02 camera kit (lens hole is transparent)"),
  o("camera_button", "Camera shutter button", "02 presses before each print"),
  o("camera_lens", "Camera lens", "02 twists in the lens hole"),
  o("camera_photo", "Undeveloped instant photo", "02 prints, then develops"),
  o("card_1", "Ace of spades", "06 card fan"),
  o("card_2", "Ace of hearts", "06 card fan"),
  o("card_3", "Ace of diamonds", "06 card fan"),
  o("card_4", "Ace of clubs", "06 card fan"),
  o("cassette_body", "Cassette tape", "02 + Listen tape"),
  o("cassette_reel", "Cassette reel", "reel behind the left window"),
  o("cassette_reel_b", "Cassette reel", "reel behind the right window"),
  o("chai", "Cutting chai", "05 culture (coded steam)"),
  o("chawl", "Mumbai chawl building", "05 architect: rises"),
  o("cloud_1", "Cloud", "03 parallax clouds"),
  o("cloud_2", "Cloud", "03 parallax clouds"),
  o("coconut_oil", "Coconut oil bottle", "05 culture"),
  o("coffee_mug", "Coffee mug", "02 / 04 fragments"),
  o("compass", "Drafting compass", "05 architect: draws a circle"),
  o("controller", "Game controller", "02, 05 GAMES, 07 collage"),
  o("earbuds", "Wireless earbuds", "02, 05 culture"),
  o("glass_tower", "Glass office tower", "05 architect: rises"),
  o("gpu_body", "Graphics card", "05 AI lab (fan holes transparent)"),
  o("gpu_fan", "GPU fan", "05 AI lab"),
  o("gpu_fan_b", "GPU fan", "05 AI lab"),
  o("headphones", "Headphones", "02, 05, 08"),
  o("highway_board", "Highway direction board", "07 slides past"),
  o("keyboard", "Mechanical keyboard", "04 machine, 07 collage"),
  o("keycap_e", "E keycap", "04 XERO row"),
  o("keycap_enter", "ENTER keycap", "04 accent"),
  o("keycap_esc", "ESC keycap", "04 accent"),
  o("keycap_o", "O keycap", "04 XERO row"),
  o("keycap_r", "R keycap", "04 XERO row"),
  o("keycap_space", "Space bar keycap", "04 stamps down"),
  o("keycap_x", "X keycap", "04 XERO row"),
  o("laptop", "Laptop", "05 AI lab (screen shows a training run)"),
  o("mic_body", "Studio microphone on a stand", "04 + 08 mic kit"),
  o("mic_cable", "XLR cable", "04 + 08 mic kit"),
  o("mic_popfilter", "Pop filter", "04 + 08 mic kit"),
  o("microphone", "Studio microphone", "reference / reduced motion"),
  o("nokia", "Nokia 3310", "02 nokia kit (LCD overlay)"),
  o("nokia_button", "Nokia navigation key", "02 pressable"),
  o("polaroid_1", "Polaroid of the Mumbai skyline at sunset", "02 prints"),
  o("polaroid_2", "Polaroid of two friends on a rooftop at night", "02 prints"),
  o("polaroid_3", "Polaroid of a controller on a bed", "02 prints"),
  o("polaroid_4", "Polaroid of a coastal highway at dusk", "02 prints"),
  o("road_sign", "Winding-road sign", "07 slides past"),
  o("robot_head", "Robot head", "05 AI"),
  o("robotarm_base", "Robot arm base", "05 AI lab arm"),
  o("robotarm_lower", "Robot arm lower segment", "05 AI lab arm"),
  o("robotarm_upper", "Robot arm upper segment with gripper", "05 AI lab arm"),
  o("samosa", "Samosa", "05 culture"),
  o("scale_model", "Architectural scale model", "05 architect"),
  o("scale_ruler", "Scale ruler and pencil", "05 architect"),
  o("server_rack", "Server rack", "05 AI lab (coded status LEDs)"),
  o("set_square", "Set square", "05 architect"),
  o("sticky_1", "Pink sticky note", "03 slaps on, peels off"),
  o("sticky_2", "Yellow sticky note", "03 slaps on, peels off"),
  o("sticky_3", "Green sticky note", "03 slaps on, peels off"),
  o("t_square", "T-square", "05 architect"),
  o("vada_pav", "Vada pav", "05 culture"),
  o("van_body", "Maruti Omni van body (faces right)", "07 rides the contour line"),
  o("van_wheel", "Van wheel", "07 rear wheel"),
  o("van_wheel_b", "Van wheel", "07 front wheel"),
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
