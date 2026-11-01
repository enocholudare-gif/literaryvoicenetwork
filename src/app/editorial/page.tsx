import React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Eye, Feather, Search, Star } from "lucide-react";
import { listPublicBooks } from "@/lib/services/publishing";
import { EditorialBookGrid } from "@/components/books/EditorialBookGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface EditorialPageProps {
  searchParams: Promise<{
    q?: string;
    sort?: string;
  }>;
}

export default async function EditorialPage({ searchParams }: EditorialPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const sortBy = (params.sort as "newest" | "title" | "editorial") || "editorial";

  const result = listPublicBooks({
    search,
    genre: "Editorial",
    sortBy,
    pageSize: 36,
  });

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header Masthead */}
      <section className="bg-[#080808] text-[#FAF8F3] py-16 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Feather className="w-3.5 h-3.5" />
                LVN Editorial Desk
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Editorial Selections &amp; Verified Books
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Rigorous criticism, cultural non-fiction, thought leadership, and contemporary fiction chosen and verified by the Literary Voices Network editorial board.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/publish"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-gold-gradient text-[#050505] font-bold text-xs hover:brightness-110 transition-all shadow-md"
              >
                <BookOpen className="w-4 h-4" />
                Submit Book for Editorial Review
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form
            action="/editorial"
            method="GET"
            className="mt-8 p-3 rounded-2xl bg-[#141414] border border-white/10 flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#FAF8F3]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search editorial titles, authors, or subjects…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <select
              name="sort"
              defaultValue={sortBy}
              aria-label="Sort editorial books"
              className="px-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
            >
              <option value="editorial">Editorial Ranking</option>
              <option value="newest">Recently Published</option>
              <option value="title">Title (A–Z)</option>
            </select>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors shrink-0"
            >
              Filter Books
            </button>
          </form>
        </div>
      </section>

      {/* Books Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              Verified Editorial Books ({result.total})
            </h2>
            <p className="text-xs text-neutral-600 mt-0.5">
              Featuring verified author profiles, critical synopses, and direct bookstore links.
            </p>
          </div>
          <span className="rounded-full bg-amber-100 border border-amber-300 px-3 py-1 text-xs font-bold text-amber-950">
            Category: Editorial
          </span>
        </div>

        <EditorialBookGrid initialBooks={result.items} />
      </section>
    </div>
  );
}
