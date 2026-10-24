import React from "react";
import Link from "next/link";
import { Feather, Search, Sparkles, Users } from "lucide-react";
import { AuthorCard } from "@/components/ui/Cards";
import { listPublicAuthors } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

interface AuthorsPageProps {
  searchParams: Promise<{
    q?: string;
    genre?: string;
  }>;
}

export default async function AuthorsDirectoryPage({ searchParams }: AuthorsPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const genre = params.genre || "All";

  const authors = listPublicAuthors({ search, genre });

  const genres = [
    "All",
    "Literary Fiction",
    "Historical Fiction",
    "Poetry",
    "Translation",
    "Essays & Criticism",
    "Biography & Literary History",
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Users className="w-3.5 h-3.5" />
                Voices of the Network
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Author & Contributor Directory
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Discover novelists, poets, translators, literary critics, and editorial contributors publishing original work on Literary Voices Network.
              </p>
            </div>
            <Link
              href="/auth?mode=register"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Create Author Profile
            </Link>
          </div>

          <form
            action="/authors"
            method="GET"
            className="mt-8 p-4 rounded-2xl bg-[#141414] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-7 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search by author name, biography, or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="sm:col-span-3">
              <select
                name="genre"
                defaultValue={genre}
                aria-label="Filter authors by genre"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {genres.map((g) => (
                  <option key={g} value={g}>
                    {g === "All" ? "All Literary Genres" : g}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                Filter Directory
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {authors.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#080808]/10 p-12 text-center space-y-3">
            <Feather className="w-10 h-10 text-[#D4AF37] mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              No matching author profiles found
            </h2>
            <p className="text-sm text-[#080808]/70">
              Try clearing your filter criteria to browse all verified LVN authors.
            </p>
            <Link
              href="/authors"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {authors.map((author) => (
              <AuthorCard key={author.id} author={author} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

