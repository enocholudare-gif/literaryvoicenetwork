import React from "react";
import Link from "next/link";
import { BookOpen, LayoutDashboard } from "lucide-react";
import { BookCard } from "@/components/ui/Cards";
import { listPublicBooks } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

export default function MyBooksPage() {
  const { items: books } = listPublicBooks();

  return (
    <div>
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
              <BookOpen className="size-3.5 text-[#D4AF37]" />
              Author Shelf &amp; Submissions
            </span>
            <h1 className="font-serif-display text-4xl font-bold mt-4">
              My Books &amp; Submission Tracker
            </h1>
            <p className="text-sm sm:text-base text-[#FAF8F3]/75 max-w-2xl mt-2">
              Manage your published titles, private drafts, and editorial review
              feedback in your Author Workspace, or browse featured network
              editions below.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors"
            >
              <LayoutDashboard className="size-4" />
              Open My Workspace
            </Link>
            <Link
              href="/publish"
              className="rounded-full border border-white/25 px-6 py-3 text-xs font-semibold text-[#FAF8F3] hover:border-[#D4AF37] transition-colors"
            >
              Add New Book
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="font-serif-display text-2xl font-bold text-[#080808] mb-6">
          Verified Network Editions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      </section>
    </div>
  );
}
