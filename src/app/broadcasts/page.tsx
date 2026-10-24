import React from "react";
import Link from "next/link";
import { Headphones, Mic2, Radio, Search } from "lucide-react";
import { BroadcastCard } from "@/components/ui/Cards";
import { listBroadcasts } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

interface BroadcastsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    status?: string;
  }>;
}

export default async function BroadcastsArchivePage({ searchParams }: BroadcastsPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const broadcastType = params.type || "all";
  const status = params.status || "all";

  const broadcasts = listBroadcasts({
    search,
    broadcastType,
    status,
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Masthead */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Headphones className="w-3.5 h-3.5" />
                On-Demand Listening & Video
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Broadcast & Podcast Archive
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Stream full-length studio conversations, author interviews, and craft roundtables. Click “Play Episode” on any card to listen in the persistent studio player.
              </p>
            </div>
            <Link
              href="/live"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
            >
              <Radio className="w-4 h-4" />
              Live Broadcast Desk
            </Link>
          </div>

          <form
            action="/broadcasts"
            method="GET"
            className="mt-8 p-4 rounded-2xl bg-[#141414] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search by episode title, host, or guest author..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                name="type"
                defaultValue={broadcastType}
                aria-label="Filter by broadcast type"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="all">All Formats (Audio, Video & Podcast)</option>
                <option value="audio">Audio Studio Episodes</option>
                <option value="video">Video Broadcasts</option>
                <option value="podcast">Syndicated Podcasts</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                Filter
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {broadcasts.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#080808]/10 p-12 text-center space-y-3">
            <Mic2 className="w-10 h-10 text-[#D4AF37] mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              No matching broadcast episodes found
            </h2>
            <Link
              href="/broadcasts"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {broadcasts.map((bc) => (
              <BroadcastCard key={bc.id} broadcast={bc} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

