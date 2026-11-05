import React from "react";
import Link from "next/link";
import { ExternalLink, Headphones, Mic2, Radio, Search } from "lucide-react";
import { BroadcastCard } from "@/components/ui/Cards";
import { PodcastBookGrid } from "@/components/books/PodcastBookGrid";
import { listBroadcasts } from "@/lib/services/platform";
import { listPublicBooks } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface PodcastPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

const SPOTIFY_URL =
  "https://open.spotify.com/show/0UfO5D2gX6G6g2Z6yX9Z6x?si=literary-voices-network";

export default async function PodcastPage({ searchParams }: PodcastPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const type = params.type || "all";

  const broadcasts = listBroadcasts({
    search,
    broadcastType: type === "all" ? undefined : type,
    status: "published",
  });

  const { items: podcastBooks } = listPublicBooks({
    genre: "Podcast",
    pageSize: 50,
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header Masthead */}
      <section className="bg-[#080808] text-[#FAF8F3] py-16 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Headphones className="w-3.5 h-3.5" />
                LVN Audio &amp; Podcast Studio
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                The Podcast Network &amp; Audio Editions
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Stream in-depth author interviews, craft roundtables, and explore official books and audiobooks spotlighted on our syndicated podcast feeds.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={SPOTIFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs hover:brightness-110 transition-all shadow-md"
              >
                <span>Follow on Spotify</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <Link
                href="/live"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 border border-white/20 text-[#FAF8F3] font-bold text-xs hover:bg-white/20 transition-all"
              >
                <Radio className="w-4 h-4 text-[#D4AF37]" />
                Tune into 24/7 Live Radio
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form
            action="/podcast"
            method="GET"
            className="mt-8 p-3 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#FAF8F3]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search podcast episodes, guest authors, or topics…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <select
              name="type"
              defaultValue={type}
              aria-label="Filter by format"
              className="px-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="all">All Formats</option>
              <option value="podcast">Podcast Episodes</option>
              <option value="audio">Studio Audio</option>
              <option value="video">Video Broadcasts</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors shrink-0"
            >
              Filter Episodes
            </button>
          </form>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        {/* Books Tagged Podcast Showcase */}
        {!search && (
          <PodcastBookGrid
            initialBooks={podcastBooks}
            theme="light"
            title="Books Featured on LVN Podcasts"
            subtitle="Explore published literary works, memoirs, and audiobooks created by authors featured on our podcast programming."
          />
        )}

        {/* Podcast Broadcast Episodes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#AA7C11]">
                Episodes Archive
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-1">
                Studio Episodes &amp; Conversations ({broadcasts.length})
              </h2>
            </div>
            <Link
              href="/broadcasts"
              className="text-xs font-bold text-[#AA7C11] hover:underline"
            >
              Full Broadcast Archive →
            </Link>
          </div>

          {broadcasts.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white border border-neutral-200 space-y-3">
              <Mic2 className="size-10 text-[#D4AF37] mx-auto" />
              <h3 className="font-serif text-lg font-bold text-[#080808]">
                No Podcast Episodes Found
              </h3>
              <p className="text-xs text-neutral-500">
                Try resetting your search query or tune in to the 24/7 studio radio.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {broadcasts.map((bc) => (
                <BroadcastCard key={bc.id} broadcast={bc} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
