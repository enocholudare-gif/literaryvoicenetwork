import React from "react";
import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";
import { BookCard } from "@/components/ui/Cards";
import { listPublicBooks } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

export default function CommunityBooksPage() {
  const { items: books } = listPublicBooks();

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
              <Sparkles className="size-3.5 text-[#D4AF37]" />
              Fresh on the Shelf
            </span>
            <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-4">
              Recently Added Community Books
            </h1>
            <p className="text-base text-[#FAF8F3]/75 max-w-2xl mt-2">
              New releases and independent titles submitted by LVN authors and
              members — moderated and approved by our editorial desk.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/publish"
              className="rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors"
            >
              Publish Your Book
            </Link>
            <Link
              href="/my-books"
              className="rounded-full border border-white/25 px-6 py-3 text-xs font-semibold text-[#FAF8F3] hover:border-[#D4AF37] transition-colors"
            >
              My Books
            </Link>
          </div>
        </div>
      </section>

      {/* Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
