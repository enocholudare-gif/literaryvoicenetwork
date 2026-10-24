import React from "react";
import Link from "next/link";
import { Calendar, Clock, Headphones, Mic2, Play, Radio } from "lucide-react";
import { BroadcastCard } from "@/components/ui/Cards";
import { listBroadcasts } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

const WEEKLY_SHOWS = [
  {
    id: "show-1",
    title: "The Meridian Conversation",
    host: "Eleanor Vance",
    schedule: "Mondays & Thursdays · 7:00 PM EST",
    genre: "Flagship Author Interviews",
    desc: "Long-form studio dialogues with novelists, translators, and historians on archival memory and contemporary craft.",
  },
  {
    id: "show-2",
    title: "First Editions Live",
    host: "Marcus Sterling",
    schedule: "Tuesdays · 6:00 PM EST",
    genre: "Debut Fiction & Criticism",
    desc: "Commissioning editor Marcus Sterling spotlights debut novels, university press releases, and critical essays.",
  },
  {
    id: "show-3",
    title: "Atlantic Archives & Memory",
    host: "Amara Osei",
    schedule: "Wednesdays · 8:00 PM EST",
    genre: "Diaspora & Historical Literature",
    desc: "Exploring multigenerational storytelling, oral history, and maritime archives across the Atlantic world.",
  },
  {
    id: "show-4",
    title: "The Reading Room",
    host: "Julian Thorne",
    schedule: "Fridays · 9:00 PM EST",
    genre: "Close Readings & Speculative Letters",
    desc: "Late-night live readings, manuscript excerpts, and conversations on speculative cartography.",
  },
  {
    id: "show-5",
    title: "Poetics in Translation",
    host: "Claire Moreau",
    schedule: "Saturdays · 4:00 PM EST",
    genre: "Bilingual Poetry & Lyric Essay",
    desc: "Monthly and weekly broadcasts dedicated to world poetry, translation craft, and polyphonic voice.",
  },
  {
    id: "show-6",
    title: "Nordic & Independent Letters",
    host: "Søren Lindqvist",
    schedule: "Sundays · 5:00 PM EST",
    genre: "Non-Fiction & Print Culture",
    desc: "Examining independent presses, biography, civic architecture, and European literary history.",
  },
];

export default function ShowsPage() {
  const episodes = listBroadcasts();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
            <Radio className="size-3.5 text-[#D4AF37]" />
            Program Schedule
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-4 max-w-3xl">
            Weekly Shows &amp; Global Broadcast Lineup
          </h1>
          <p className="text-base sm:text-lg text-[#FAF8F3]/75 max-w-2xl mt-3 leading-relaxed">
            Forty-two weekly programs broadcast across eight global studio hubs.
            Tune in live or stream full episodes on demand.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/live"
              className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors"
            >
              <Play className="size-3.5 fill-current" />
              Listen Live Now
            </Link>
            <Link
              href="/for-authors"
              className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-xs font-semibold text-[#FAF8F3] hover:border-[#D4AF37] hover:text-[#F7DF8B] transition-colors"
            >
              Pitch a Guest Appearance
            </Link>
          </div>
        </div>
      </section>

      {/* Weekly Shows Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
            Syndicated Lineup
          </p>
          <h2 className="font-serif-display text-3xl font-bold text-[#080808] mt-1">
            Flagship Programs
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {WEEKLY_SHOWS.map((show) => (
            <article
              key={show.id}
              className="bg-white rounded-2xl border border-[#D4AF37]/25 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <span className="inline-block rounded-full bg-[#FAF8F3] border border-[#D4AF37]/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#AA7C11]">
                  {show.genre}
                </span>
                <h3 className="font-serif-display text-xl font-bold text-[#080808] mt-3">
                  {show.title}
                </h3>
                <p className="text-xs font-semibold text-[#AA7C11] mt-1">
                  Hosted by {show.host}
                </p>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                  <Clock className="size-3.5 text-[#D4AF37]" />
                  {show.schedule}
                </p>
                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {show.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href="/live"
                  className="font-bold text-[#080808] hover:text-[#AA7C11] inline-flex items-center gap-1"
                >
                  <Headphones className="size-3.5 text-[#D4AF37]" />
                  Listen Live
                </Link>
                <Link
                  href="/broadcasts"
                  className="text-slate-500 hover:text-[#080808]"
                >
                  Past Episodes →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Recorded Episodes */}
      <section className="bg-[#F3EFE4]/60 border-t border-[#D4AF37]/20 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif-display text-3xl font-bold text-[#080808] mb-8">
            On-Demand Broadcast Archive
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {episodes.map((ep) => (
              <BroadcastCard key={ep.id} episode={ep} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
