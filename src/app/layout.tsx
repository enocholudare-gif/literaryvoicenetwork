import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AudioPlayerProvider } from "@/components/layout/AudioPlayerContext";
import { SiteShellConditional } from "@/components/layout/SiteShellConditional";
import { getSiteSettings } from "@/lib/services/platform";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Literary Voices Network (LVN) | Modern Literary Publishing & Discovery Network",
    template: "%s | Literary Voices Network (LVN)",
  },
  description:
    "A modern literary publishing, broadcast, and discovery network connecting authors, readers, editors, and global literary culture.",
  keywords: [
    "Literary Voices Network",
    "LVN",
    "literary magazine",
    "author discovery",
    "book broadcasts",
    "literary publishing platform",
    "author interviews",
    "book reviews",
  ],
  openGraph: {
    title: "Literary Voices Network (LVN)",
    description:
      "A modern literary publishing and discovery network connecting authors, readers, editors, and literary culture.",
    type: "website",
    siteName: "Literary Voices Network",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = getSiteSettings();

  return (
    <html lang="en" className={`${playfair.variable} ${jakarta.variable}`}>
      <body className="min-h-screen bg-[#FAF8F3] text-[#080808] antialiased selection:bg-[#D4AF37]/30 selection:text-[#080808]">
        <AudioPlayerProvider>
          <SiteShellConditional settings={settings}>
            {children}
          </SiteShellConditional>
        </AudioPlayerProvider>
      </body>
    </html>
  );
}
