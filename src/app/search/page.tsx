import React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { ArticleCard, AuthorCard, BookCard, BroadcastCard } from "@/components/ui/Cards";
import { globalSearch, listBroadcasts } from "@/lib/services/platform";
import { listPublicArticles, listPublicBooks } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();

  const searchResults = q ? globalSearch(q) : null;
  const defaultBooks = !q ? listPublicBooks().items.slice(0, 4) : [];
  const defaultArticles = !q ? listPublicArticles().items.slice(0, 3) : [];
  const broadcasts = listBroadcasts();

  return (
    <div>
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
            Global Network Search
          </p>
          <h1 className="font-serif-display text-4xl font-bold mt-2">
            Search Books, Authors, Broadcasts &amp; Essays
          </h1>
          <form action="/search" method="GET" className="mt-6 flex gap-2 max-w-2xl mx-auto">
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder="Search by title, author, ISBN, genre, or topic…"
              className="flex-1 rounded-full bg-[#141414] border border-[#D4AF37]/40 px-5 py-3 text-sm text-[#FAF8F3] placeholder:text-white/45 focus:outline-none focus:border-[#D4AF37]"
            />
            <button
              type="submit"
              className="rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors inline-flex items-center gap-1.5"
            >
              <Search className="size-4" />
              Search
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-14">
        {q && searchResults ? (
          <>
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#080808] mb-6">
                Books Matching “{q}” ({searchResults.books.length})
              </h2>
              {searchResults.books.length === 0 ? (
                <p className="text-sm text-slate-500">No matching books found.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {searchResults.books.map((b) => (
                    <BookCard key={b.id} book={b} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#080808] mb-6">
                Authors Matching “{q}” ({searchResults.authors.length})
              </h2>
              {searchResults.authors.length === 0 ? (
                <p className="text-sm text-slate-500">No matching authors found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {searchResults.authors.map((a) => (
                    <AuthorCard key={a.id} profile={a} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#080808] mb-6">
                Magazine Articles Matching “{q}” ({searchResults.articles.length})
              </h2>
              {searchResults.articles.length === 0 ? (
                <p className="text-sm text-slate-500">No matching articles found.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {searchResults.articles.map((art) => (
                    <ArticleCard key={art.id} article={art} />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#080808] mb-6">
                Featured Books on the Shelf
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {defaultBooks.map((b) => (
                  <BookCard key={b.id} book={b} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#080808] mb-6">
                Recent Magazine Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {defaultArticles.map((art) => (
                  <ArticleCard key={art.id} article={art} />
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif-display text-2xl font-bold text-[#080808] mb-6">
                Broadcast Episodes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {broadcasts.map((ep) => (
                  <BroadcastCard key={ep.id} episode={ep} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
