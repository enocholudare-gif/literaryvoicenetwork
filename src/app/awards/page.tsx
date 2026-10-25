import React from "react";
import Link from "next/link";
import { Award, BookOpen, Star, Trophy, Users } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Awards & Recognition | Literary Voices Network",
  description:
    "Celebrating authors and literary works honoured through the Literary Voices Network's annual recognition programme.",
};

const AWARDS = [
  {
    year: "2026",
    category: "Author of the Year",
    icon: Trophy,
    winners: [
      {
        name: "Amara Osei",
        work: "The Saltwater Ledger",
        href: "/authors/amara-osei",
        citation:
          "For an extraordinary debut that weaves maritime history and generational memory with rare lyrical precision.",
      },
    ],
  },
  {
    year: "2026",
    category: "Best Literary Fiction",
    icon: BookOpen,
    winners: [
      {
        name: "Eleanor Vance",
        work: "The Glass Meridian",
        href: "/authors/eleanor-vance",
        citation:
          "A masterwork of historical imagination — fusing cartography, archival research, and intimate storytelling across two centuries.",
      },
    ],
  },
  {
    year: "2026",
    category: "Best Debut Author",
    icon: Star,
    winners: [
      {
        name: "Julian Thorne",
        work: "Atlas of Quiet Cities",
        href: "/authors/julian-thorne",
        citation:
          "A startling and original debut that locates the sublime in acoustic space and forgotten reading rooms.",
      },
    ],
  },
  {
    year: "2026",
    category: "Community Voice Award",
    icon: Users,
    winners: [
      {
        name: "Claire Moreau",
        work: "Winter Harmonics",
        href: "/authors/claire-moreau",
        citation:
          "For bilingual lyric sequences that bridge the French and English literary traditions with warmth and formal daring.",
      },
    ],
  },
  {
    year: "2025",
    category: "Author of the Year",
    icon: Trophy,
    winners: [
      {
        name: "Søren Lindqvist",
        work: "The Republic of Typesetters",
        href: "/authors/soren-lindqvist",
        citation:
          "A definitive history of Nordic printing culture that reads with the propulsive energy of the best literary non-fiction.",
      },
    ],
  },
];

const YEARS = [...new Set(AWARDS.map((a) => a.year))].sort((a, b) =>
  b.localeCompare(a)
);

export default function AwardsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#060606] text-[#FAF8F3] py-20 border-b border-[#D4AF37]/30">
        <div className="absolute right-0 top-0 size-[32rem] rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <span className="animate-hero-1 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-[#050505]">
            <Award className="size-3.5" />
            Awards &amp; Recognition
          </span>
          <h1 className="animate-hero-2 font-serif-display text-4xl sm:text-6xl font-bold leading-tight max-w-4xl">
            Honouring{" "}
            <span className="text-gold-shimmer italic font-normal">
              Literary Excellence
            </span>
          </h1>
          <p className="animate-hero-3 text-base sm:text-lg text-[#FAF8F3]/80 leading-relaxed max-w-3xl">
            Each year, Literary Voices Network recognises authors and works that
            have made an outstanding contribution to literature, storytelling,
            and literary culture — as heard and read across our global network.
          </p>
        </div>
      </section>

      {/* Awards by year */}
      {YEARS.map((year) => {
        const yearAwards = AWARDS.filter((a) => a.year === year);
        return (
          <section
            key={year}
            className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
          >
            <div className="flex items-center gap-4 mb-10">
              <div className="h-px flex-1 bg-[#D4AF37]/30" />
              <span className="font-serif-display text-3xl font-bold text-[#080808]">
                {year} Awards
              </span>
              <div className="h-px flex-1 bg-[#D4AF37]/30" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {yearAwards.map((award) => {
                const Icon = award.icon;
                return (
                  <div
                    key={`${award.year}-${award.category}`}
                    className="rounded-3xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/40 p-7 hover:border-[#F7DF8B] hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-5">
                      <div className="size-10 rounded-xl bg-gold-gradient flex items-center justify-center text-[#050505]">
                        <Icon className="size-5" />
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.2em] text-[#D4AF37] font-bold">
                          {award.year}
                        </p>
                        <h2 className="font-serif-display text-lg font-bold">
                          {award.category}
                        </h2>
                      </div>
                    </div>

                    {award.winners.map((w) => (
                      <div key={w.name} className="space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <Link
                              href={w.href}
                              className="font-serif-display text-xl font-bold text-[#F7DF8B] hover:underline"
                            >
                              {w.name}
                            </Link>
                            <p className="text-sm text-[#FAF8F3]/70 italic mt-0.5">
                              &ldquo;{w.work}&rdquo;
                            </p>
                          </div>
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-2.5 py-0.5 text-[10px] font-bold text-[#F7DF8B] shrink-0">
                            <Trophy className="size-3" /> Winner
                          </span>
                        </div>
                        <p className="text-sm text-[#FAF8F3]/70 leading-relaxed border-l-2 border-[#D4AF37]/40 pl-3">
                          {w.citation}
                        </p>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Nominate CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="rounded-3xl bg-[#080808] border-2 border-[#D4AF37]/45 p-10 text-center text-[#FAF8F3]">
          <Trophy className="size-10 text-[#D4AF37] mx-auto mb-4" />
          <h2 className="font-serif-display text-3xl font-bold">
            Nominate an Author
          </h2>
          <p className="text-sm text-[#FAF8F3]/70 mt-2 max-w-xl mx-auto">
            Know an author whose work deserves wider recognition? Submit a
            nomination to the LVN editorial committee for consideration in our
            next annual awards cycle.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
            >
              <Award className="size-4" />
              Submit a Nomination
            </Link>
            <Link
              href="/authors"
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 px-6 py-3 text-xs font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/15 transition-all"
            >
              Browse All Authors
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

