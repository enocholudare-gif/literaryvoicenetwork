import React from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Eye, Feather, Search, Star } from "lucide-react";
import { listPublicBooks } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

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

        {result.items.length === 0 ? (
          <div className="p-16 text-center rounded-3xl bg-white border border-[#D4AF37]/30 space-y-3">
            <BookOpen className="size-12 text-[#D4AF37] mx-auto" />
            <h3 className="font-serif text-xl font-bold text-[#080808]">
              No Editorial Books Found
            </h3>
            <p className="text-xs text-neutral-600 max-w-md mx-auto">
              No titles match your current search query. Try broadening your keywords or browse the full network library.
            </p>
            <div className="pt-2">
              <Link
                href="/editorial"
                className="inline-block px-5 py-2.5 rounded-full bg-[#080808] text-xs font-bold text-[#F7DF8B]"
              >
                Reset Search
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {result.items.map((book) => {
              const amazonUrl =
                book.retailer_links?.amazon ||
                ("https://www.amazon.com/s?k=" + encodeURIComponent(book.title));

              return (
                <div
                  key={book.id}
                  className="group flex flex-col justify-between rounded-3xl bg-white border border-[#D4AF37]/35 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div>
                    {/* Top Tag & Views */}
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold text-[#050505]">
                        Editorial
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                        <Eye className="size-3 text-[#AA7C11]" />
                        {(book.view_count || 1200).toLocaleString()} Views
                      </span>
                    </div>

                    {/* Book Cover */}
                    <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-[#080808] border-2 border-[#D4AF37]/40 shadow-md group-hover:border-[#AA7C11] transition-all">
                      <img
                        src={book.cover_url || "/media/covers/the-first.jpg"}
                        alt={book.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    </div>

                    {/* Title & Subtitle */}
                    <h3 className="font-serif text-lg font-bold text-[#080808] mt-4 line-clamp-1">
                      {book.title}
                    </h3>
                    {book.subtitle && (
                      <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1 italic">
                        {book.subtitle}
                      </p>
                    )}

                    {/* Author Overview Pill */}
                    <div className="mt-3">
                      <Link
                        href={book.author_slug ? `/authors/${book.author_slug}` : "/authors"}
                        className="inline-flex items-center gap-2 rounded-full bg-[#FAF8F3] border border-[#D4AF37]/40 px-3 py-1 text-xs hover:bg-[#D4AF37]/20 transition-colors"
                      >
                        <img
                          src={book.author_avatar || "/media/avatars/default-portrait.svg"}
                          alt={book.author_name || "Author"}
                          className="size-5 rounded-full object-cover border border-[#D4AF37]/60"
                        />
                        <span className="font-semibold text-xs text-[#080808] truncate max-w-[130px]">
                          By {book.author_name}
                        </span>
                        <ExternalLink className="size-3 text-[#AA7C11]" />
                      </Link>
                    </div>

                    {/* Synopsis */}
                    <p className="text-xs text-neutral-600 mt-3 leading-relaxed line-clamp-3">
                      {book.description}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 pt-3 border-t border-neutral-100 space-y-2">
                    <a
                      href={amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-xs cursor-pointer text-center"
                    >
                      <BookOpen className="size-3.5 fill-current" />
                      <span>View Book Overview</span>
                      <ExternalLink className="size-3" />
                    </a>
                    <Link
                      href={`/books/${book.slug}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors text-center"
                    >
                      <span>Read Excerpt &amp; Notes</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
