import React from "react";
import Link from "next/link";
import { BookOpen, Filter, Search, Sparkles } from "lucide-react";
import { BookCard } from "@/components/ui/Cards";
import { listPublicBooks } from "@/lib/services/publishing";
import type { BookFormat } from "@/lib/db/types";

export const dynamic = "force-dynamic";

interface BooksPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
    format?: string;
    sort?: string;
    page?: string;
  }>;
}

export default async function BooksDirectoryPage({ searchParams }: BooksPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const genre = params.genre || "All";
  const format = (params.format as BookFormat | "All") || "All";
  const sortBy = (params.sort as "newest" | "title" | "editorial") || "newest";
  const page = Number(params.page || 1);

  const result = listPublicBooks({
    search,
    genre,
    format,
    sortBy,
    page,
    pageSize: 12,
  });

  const formats = ["All", "Hardcover", "Paperback", "eBook", "Audiobook", "Multi-format"];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Page Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <BookOpen className="w-3.5 h-3.5" />
                Curated Literary Catalog
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Book Directory
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Explore editorially reviewed books, sample excerpts, verified ISBN metadata, and direct independent retailer links from Literary Voices Network authors.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard?tab=books"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                <Sparkles className="w-4 h-4" />
                Submit Your Book Listing
              </Link>
            </div>
          </div>

          {/* Search & Filter Form */}
          <form
            action="/books"
            method="GET"
            className="mt-8 p-4 rounded-2xl bg-[#141414] border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3"
          >
            <div className="lg:col-span-5 relative">
              <Search className="w-4 h-4 text-[#FAF8F3]/50 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search by title, author, ISBN, or subject..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                name="genre"
                defaultValue={genre}
                aria-label="Filter by genre"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="All">All Genres</option>
                {result.genres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <select
                name="format"
                defaultValue={format}
                aria-label="Filter by format"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {formats.map((f) => (
                  <option key={f} value={f}>
                    {f === "All" ? "All Formats" : f}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2 flex gap-2">
              <select
                name="sort"
                defaultValue={sortBy}
                aria-label="Sort books"
                className="w-full px-3 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="newest">Newest</option>
                <option value="editorial">Editorial Picks</option>
                <option value="title">Title (A–Z)</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors shrink-0"
              >
                Apply
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Results Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="text-xs font-medium text-[#080808]/70 flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-[#AA7C11]" />
            Showing <strong>{result.items.length}</strong> of <strong>{result.total}</strong>{" "}
            published titles
            {genre !== "All" && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#080808] text-[#F7DF8B]">
                Genre: {genre}
              </span>
            )}
            {search && (
              <span className="px-2.5 py-0.5 rounded-full bg-[#080808] text-[#F7DF8B]">
                Query: “{search}”
              </span>
            )}
          </div>
          {(genre !== "All" || format !== "All" || search) && (
            <Link
              href="/books"
              className="text-xs font-semibold text-[#AA7C11] hover:underline"
            >
              Reset all filters
            </Link>
          )}
        </div>

        {result.items.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#080808]/10 p-12 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-[#D4AF37] mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              No matching books found
            </h2>
            <p className="text-sm text-[#080808]/70 max-w-md mx-auto">
              Try clearing your search query or selecting a broader literary genre.
            </p>
            <div className="pt-2">
              <Link
                href="/books"
                className="inline-flex items-center px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
              >
                View All Published Books
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {result.items.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

