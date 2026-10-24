import React from "react";
import Link from "next/link";
import { Globe, Newspaper } from "lucide-react";
import { ArticleCard } from "@/components/ui/Cards";
import { listPublicArticles } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

const GLOBAL_DISPATCHES = [
  {
    id: "wn-1",
    region: "Europe · Frankfurt & London",
    date: "Oct 23, 2026",
    title: "Independent Translation Prizes Report Record Submissions Across 19 Languages",
    summary:
      "Small presses and university imprints lead a surge in translated fiction and lyric nonfiction across European book fairs.",
  },
  {
    id: "wn-2",
    region: "North America · New York & Chicago",
    date: "Oct 21, 2026",
    title: "Audio-First Literary Serialization Gains Momentum Among Commuter Readers",
    summary:
      "Evening radio broadcasts and serialized author readings are bringing long-form literary criticism to new global audiences.",
  },
  {
    id: "wn-3",
    region: "Africa · Accra & Nairobi",
    date: "Oct 19, 2026",
    title: "West & East African Maritime Archives Open Digital Fellowships for Historical Novelists",
    summary:
      "New cross-continental archival grants connect contemporary novelists with primary historical ledgers.",
  },
];

export default function WorldNewsPage() {
  const { items: articles } = listPublicArticles();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
            <Newspaper className="size-3.5 text-[#D4AF37]" />
            World News &amp; Dispatches
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-4 max-w-3xl">
            Global Literary &amp; Cultural Headlines
          </h1>
          <p className="text-base text-[#FAF8F3]/75 max-w-2xl mt-2">
            International publishing dispatches, translation awards, archival
            discoveries, and cultural reporting from our eight global hubs.
          </p>
        </div>
      </section>

      {/* Global Wire */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {GLOBAL_DISPATCHES.map((d) => (
            <article
              key={d.id}
              className="rounded-2xl bg-white border border-[#D4AF37]/30 p-6 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-[#AA7C11] font-bold uppercase tracking-wider">
                  <span>{d.region}</span>
                  <span>{d.date}</span>
                </div>
                <h2 className="font-serif-display text-xl font-bold text-[#080808] mt-3 leading-snug">
                  {d.title}
                </h2>
                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed">
                  {d.summary}
                </p>
              </div>
              <Link
                href="/press-releases"
                className="mt-4 inline-block text-xs font-bold text-[#080808] hover:text-[#AA7C11]"
              >
                Read Dispatch →
              </Link>
            </article>
          ))}
        </div>

        <h2 className="font-serif-display text-3xl font-bold text-[#080808] mb-8">
          Featured Magazine &amp; Cultural Reporting
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>
    </div>
  );
}
