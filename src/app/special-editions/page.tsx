import React from "react";
import Link from "next/link";
import { Award } from "lucide-react";
import { BroadcastCard } from "@/components/ui/Cards";
import { listBroadcasts } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

export default function SpecialEditionsPage() {
  const episodes = listBroadcasts();

  return (
    <div>
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
            <Award className="size-3.5 text-[#D4AF37]" />
            Special Editions
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-4">
            Seasonal Symposia &amp; Collectors’ Broadcasts
          </h1>
          <p className="text-base text-[#FAF8F3]/75 max-w-2xl mt-2">
            Extended multi-author roundtables, translation workshops, and
            anniversary readings curated by the LVN editorial board.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {episodes.map((ep) => (
            <BroadcastCard key={ep.id} episode={ep} />
          ))}
        </div>
      </section>
    </div>
  );
}
