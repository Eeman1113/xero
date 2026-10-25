/**
 * All site copy, verbatim from 08_website/STORY.md.
 * Long-form paragraphs are kept intact here and only split into
 * reveal-lines at render time (see `toLines`).
 */

export type ChapterMeta = { id: string; name: string };

export const CHAPTERS: ChapterMeta[] = [
  { id: "01", name: "THE SIGNAL" },
  { id: "02", name: "THE MEMORIES" },
  { id: "03", name: "THE TAKEOFF" },
  { id: "04", name: "THE MACHINE" },
  { id: "05", name: "THE NOISE" },
  { id: "06", name: "THE WILDCARD" },
  { id: "07", name: "THE JOURNEY" },
  { id: "08", name: "PRESS PLAY" },
];

export const chapterName = (id: string) => CHAPTERS.find((c) => c.id === id)?.name ?? "";

export const STORY = {
  title: "XERO",
  subtitle: "A Life in Progress",
  ch1: {
    tagline: "Two friends. Too many thoughts. One microphone.",
    copy: "Every great conversation starts somewhere. Ours started with absolutely no idea what we were doing.",
  },
  ch2: {
    copy: "Before the jobs, the deadlines, and the existential crises, there were just two friends with too much to say.",
    long: "We started with a simple idea: talk about whatever the hell was on our minds. Back then, life was simpler. We had time to waste, dreams that made absolutely no sense, and opinions about things we barely understood. We talked about games, argued about random shit, imagined impossible futures, and somehow managed to turn every conversation into an entirely new conversation. We didn't know it then, but those conversations were the beginning of something.",
  },
  ch3: {
    copy: "Then we took off. Graduations, first jobs, new responsibilities. Turns out, becoming an adult is mostly improvisation with better clothes.",
    long: "Then life happened. We grew up. Graduated. Got jobs. Started showing up to offices, answering emails, sitting through meetings, and pretending we knew what we were doing. Suddenly, the future we'd spent so much time imagining was here, and it came with deadlines, responsibilities, and a suspicious number of passwords.",
  },
  ch4: {
    copy: "We built careers, learned new things, and watched technology change faster than we could keep up with it. Naturally, we had opinions.",
    long: "Somewhere between growing up and figuring out how to be adults, we realised something. We still had a lot to talk about. So we came back to the microphone. Not as the kids who started this thing, but as two best friends who have seen a little more of the world, learned a little more about themselves, and developed even more opinions than before. Unfortunately for everyone else, we've also become more consistent. Hopefully.",
  },
  ch5: {
    copy: "AI. Government. Architecture. Games. Culture. The things shaping our lives, the things we take for granted, and the things we probably think about way too much.",
    long: "Because the world has gotten weird. Artificial intelligence is changing how we work, create, and think. Governments are making decisions that affect millions of lives. Architecture is reshaping the places we call home. Video games are no longer just games; they're entire worlds, communities, economies, and occasionally the reason we haven't slept in thirty-six hours. And that's just the beginning.",
    topics: ["AI", "GOVERNMENT", "ARCHITECTURE", "GAMES", "CULTURE"],
  },
  ch6: {
    copy: "There is no script for where a conversation goes. One question leads to another. One disagreement becomes an hour-long debate. And sometimes the most interesting part is the bit nobody planned.",
    long: "One minute we're discussing the future of technology. The next, we're arguing about politics, dissecting a game, questioning the way cities are built, or getting distracted by something so incredibly stupid that it becomes the highlight of the episode. There's no master plan. No carefully rehearsed opinions. No pretending to have all the answers. Just two friends, a microphone, and the kind of conversations that happen when nobody wants to end the call.",
  },
  ch7: {
    copy: "We don't know exactly where this goes. That's kind of the point. We're here to explore, question, laugh, disagree, and keep moving.",
    long: "We'll probably disagree. We'll definitely go off-topic. We'll occasionally say something profound by accident. And somewhere in all that chaos, we hope you'll find something worth thinking about. Maybe you'll discover a new perspective. Maybe you'll disagree with everything we say. Maybe you'll just listen while commuting, working, gaming, or staring at the ceiling at two in the morning, wondering how the hell we got here. Whatever the case, you're welcome.",
  },
  ch8: {
    copy: "Two best friends. A world full of questions. One conversation at a time.",
    closer: "Because this was never really about having a podcast. It was about having a conversation. And now, you're part of it.",
    signoff: "XERO. Same friendship. New chapters. No shortage of things to talk about. Hit play. Let's see where this goes.",
  },
} as const;

/**
 * Split a paragraph into reveal-lines on sentence boundaries, merging very
 * short sentences with the next so the rhythm doesn't get too choppy.
 * Joining the result with " " reproduces the original paragraph exactly.
 */
export function toLines(text: string, minLen = 34): string[] {
  const sentences = text.match(/[^.!?]+[.!?]+["')\]]*(?=\s|$)/g)?.map((s) => s.trim()) ?? [text];
  const out: string[] = [];
  let buf = "";
  for (const s of sentences) {
    buf = buf ? `${buf} ${s}` : s;
    if (buf.length >= minLen) {
      out.push(buf);
      buf = "";
    }
  }
  if (buf) {
    if (out.length && buf.length < 14) out[out.length - 1] += ` ${buf}`;
    else out.push(buf);
  }
  return out;
}
