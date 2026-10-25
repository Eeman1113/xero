import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Anton, Space_Grotesk, JetBrains_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { BASE } from "@/lib/assets";

const display = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display", display: "swap" });
const body = Space_Grotesk({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });
// handwritten captions (polaroid backs) — not needed for first paint
const hand = Caveat({ weight: ["600"], subsets: ["latin"], variable: "--font-hand", display: "swap", preload: false });

export const metadata: Metadata = {
  metadataBase: new URL("https://eeman1113.github.io/xero/"),
  title: "XERO — A Life in Progress · Season 2",
  description: "Two friends. Too many thoughts. One microphone. A Hinglish podcast by two best friends — Season 2 is live.",
  applicationName: "XERO",
  keywords: ["XERO", "podcast", "Hinglish podcast", "Season 2", "two best friends", "AI", "games", "culture"],
  openGraph: {
    type: "website",
    siteName: "XERO",
    title: "XERO — Season 2",
    description: "Two friends. Too many thoughts. One microphone.",
    locale: "en_IN",
    images: [{ url: "og.png", width: 1200, height: 630, alt: "XERO — Season 2. Two friends. Too many thoughts. One microphone." }],
  },
  twitter: {
    card: "summary_large_image",
    title: "XERO — Season 2",
    description: "Two friends. Too many thoughts. One microphone.",
    images: ["og.png"],
  },
  // og.png + apple-touch-icon.png are pre-rendered statics (sources in assets/og-source) — GitHub Pages
  // serves extensionless route output with the wrong MIME type, so they are real .png files.
  icons: { icon: [{ url: `${BASE}/favicon.svg`, type: "image/svg+xml" }], apple: `${BASE}/apple-touch-icon.png` },
};

export const viewport: Viewport = { themeColor: "#000000", colorScheme: "dark", width: "device-width", initialScale: 1 };

// decide motion mode before first paint (scenes build their timelines on mount)
const MODE_SCRIPT = `(function(){try{var r=window.matchMedia('(prefers-reduced-motion: reduce)').matches;document.documentElement.classList.add(r?'rm':'motion');}catch(e){}})();`;

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable} ${hand.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: MODE_SCRIPT }} />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
