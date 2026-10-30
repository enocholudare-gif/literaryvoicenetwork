import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BookOpen, Calendar, ExternalLink, Eye, FileText, Globe, Layers, ShieldCheck, User } from "lucide-react";
import { BookReviewSection } from "@/components/books/BookReviewSection";
import { incrementBookView, listBookReviews } from "@/lib/services/publishing";
import { ArticleCard, BookCard, StatusBadge } from "@/components/ui/Cards";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getBookBySlugForViewer,
  listPublicArticles,
  listPublicBooks,
} from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

interface BookDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BookDetailPage({ params }: BookDetailPageProps) {
  const { slug } = await params;
  const viewer = await getCurrentSession();
  const book = getBookBySlugForViewer(slug, viewer);
  if (book) {
    incrementBookView(slug);
  }
  const reviews = book ? listBookReviews(book.id) : [];

  if (!book) {
    notFound();
  }

  const relatedArticles = listPublicArticles({
    relatedBookId: book.id,
    pageSize: 6,
  }).items;

  const relatedBooks = listPublicBooks({
    genre: book.genre,
    pageSize: 4,
  }).items.filter((b) => b.id !== book.id);

  const retailerEntries = Object.entries(book.retailer_links || {}).filter(
    ([, url]) => Boolean(url && url.trim())
  );

  const retailerLabels: Record<string, string> = {
    bookshop: "Bookshop.org (Independent Bookstores)",
    amazon: "Amazon Books",
    barnesAndNoble: "Barnes & Noble",
    goodreads: "Goodreads Catalog",
    appleBooks: "Apple Books",
    kobo: "Rakuten Kobo",
    audible: "Audible Audiobook",
    spotify: "Spotify Audiobooks",
    publisherDirect: "Publisher Direct Edition",
  };

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Preview Banner if viewing non-published draft */}
      {book.status !== "published" && (
        <div className="bg-amber-950 text-amber-100 border-b border-amber-500/40 py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <StatusBadge status={book.status} />
              <span>
                <strong>Private Preview Mode:</strong> This book listing is currently in{" "}
                <code className="underline">{book.status}</code> status and is only visible to its author and LVN editorial staff.
              </span>
            </div>
            <Link
              href="/dashboard?tab=books"
              className="px-3 py-1 rounded-lg bg-amber-400 text-amber-950 font-bold"
            >
              Return to Author Studio
            </Link>
          </div>
        </div>
      )}

      {/* Book Hero */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/books"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F7DF8B] hover:underline mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Book Directory
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            {/* Cover Column */}
            <div className="lg:col-span-4 flex flex-col items-center sm:items-start">
              <div className="w-64 sm:w-72 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border-2 border-[#D4AF37]/40 bg-[#141414]">
                <img
                  src={book.cover_url || "/media/covers/the-glass-meridian.svg"}
                  alt={`Cover of ${book.title}`}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Sample Excerpt / Authorized Manuscript Download */}
              <div className="mt-6 w-full max-w-xs space-y-2.5">
                <a
                  href="/media/excerpts/the-glass-meridian-sample.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Read Sample Chapter PDF
                </a>

                {book.manuscript_distribution_authorized && book.full_manuscript_url && (
                  <a
                    href={book.full_manuscript_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-300/50 bg-amber-950/60 text-emerald-200 font-semibold text-xs hover:bg-amber-950/60 transition-colors"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Authorized Full Digital Edition
                  </a>
                )}
              </div>
            </div>

            {/* Metadata & Synopsis Column */}
            <div className="lg:col-span-8 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37]/20 text-[#F7DF8B] border border-[#D4AF37]/40">
                  {book.genre}
                </span>
                {book.secondary_genres.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-[#FAF8F3]/80"
                  >
                    {g}
                  </span>
                ))}
                {book.editorial_recommendation && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-950 text-amber-300 border border-amber-500/40">
                    <Award className="w-3.5 h-3.5" />
                    LVN Editorial Selection
                  </span>
                )}
              </div>

              <div>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
                  {book.title}
                </h1>
                {book.subtitle && (
                  <p className="mt-2 font-serif text-xl text-[#F7DF8B] italic">
                    {book.subtitle}
                  </p>
                )}
              </div>

              {/* Author Attribution */}
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#141414] border border-white/10">
                <img
                  src={book.author_avatar || "/media/avatars/eleanor-vance.svg"}
                  alt={book.author_name || "Author"}
                  className="w-14 h-14 rounded-xl object-cover border border-[#D4AF37]"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs uppercase tracking-wider text-[#D4AF37] font-semibold">
                      Written by
                    </span>
                    {book.author_role === "admin" && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#D4AF37]/20 text-[#F7DF8B]">
                        LVN Founding Editor & Author
                      </span>
                    )}
                  </div>
                  <Link
                    href={`/authors/${book.author_slug || "eleanor-vance"}`}
                    className="font-serif text-lg font-bold text-white hover:text-[#F7DF8B] transition-colors block"
                  >
                    {book.author_name}
                  </Link>
                  {book.author_headline && (
                    <p className="text-xs text-[#FAF8F3]/70 truncate">
                      {book.author_headline}
                    </p>
                  )}
                </div>
                <Link
                  href={`/authors/${book.author_slug || "eleanor-vance"}`}
                  className="px-3.5 py-2 rounded-xl border border-[#D4AF37]/40 text-xs font-semibold text-[#F7DF8B] hover:bg-white/5 shrink-0"
                >
                  Author Profile
                </Link>
              </div>

              {/* Bibliographic Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div className="p-3.5 rounded-xl bg-[#141414]/80 border border-white/10">
                  <span className="text-[11px] text-[#FAF8F3]/55 block flex items-center gap-1"><Eye className="w-3 h-3 text-[#D4AF37]" /> Reader Views</span>
                  <span className="text-sm font-semibold text-[#F7DF8B]">{(book.view_count || 0) + 1} views</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141414]/80 border border-white/10">
                  <span className="text-[11px] text-[#FAF8F3]/55 block">Format</span>
                  <span className="text-sm font-semibold text-white">{book.format}</span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141414]/80 border border-white/10">
                  <span className="text-[11px] text-[#FAF8F3]/55 block">ISBN-13</span>
                  <span className="text-sm font-mono font-semibold text-[#F7DF8B]">
                    {book.isbn || "Catalog Pending"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141414]/80 border border-white/10">
                  <span className="text-[11px] text-[#FAF8F3]/55 block">Publisher / Imprint</span>
                  <span className="text-sm font-semibold text-white">
                    {book.publisher || "Independent Edition"}
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-[#141414]/80 border border-white/10">
                  <span className="text-[11px] text-[#FAF8F3]/55 block">Extent & Language</span>
                  <span className="text-sm font-semibold text-white">
                    {book.page_count ? `${book.page_count} pp.` : "Standard"} · {book.language}
                  </span>
                </div>
              </div>

              {/* Synopsis */}
              <div className="space-y-3 pt-2">
                <h2 className="text-xs uppercase tracking-[0.2em] font-bold text-[#D4AF37]">
                  Synopsis & Editorial Overview
                </h2>
                <p className="text-base text-[#FAF8F3]/90 leading-relaxed whitespace-pre-line">
                  {book.description}
                </p>
              </div>

              {/* Retailer Purchase Links */}
              {retailerEntries.length > 0 && (
                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold text-[#D4AF37] mb-3">
                    Acquire This Edition & Retailer Links
                  </h3>
                  <div className="flex flex-wrap gap-2.5">
                    {retailerEntries.map(([key, url]) => (
                      <a
                        key={key}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-[#D4AF37] hover:text-[#080808] text-white text-xs font-semibold transition-colors border border-white/15"
                      >
                        <span>{retailerLabels[key] || key}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <BookReviewSection bookId={book.id} bookTitle={book.title} initialReviews={reviews} currentUserId={viewer?.user.id} />

      {/* Excerpt Section */}
      {book.excerpt && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="rounded-3xl bg-white border border-[#080808]/12 p-8 sm:p-12 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-6 pb-4 border-b border-[#080808]/10">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
                  From the Pages of {book.title}
                </span>
                <h2 className="font-serif text-2xl font-bold text-[#080808] mt-1">
                  Featured Literary Excerpt
                </h2>
              </div>
              <BookOpen className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <blockquote className="font-serif text-lg sm:text-xl text-[#080808]/90 leading-relaxed italic">
              {book.excerpt}
            </blockquote>
            <div className="mt-6 pt-4 border-t border-[#080808]/10 flex items-center justify-between text-xs text-[#080808]/60">
              <span>Excerpted with permission of {book.author_name}</span>
              <span>{book.publisher}</span>
            </div>
          </div>
        </section>
      )}

      {/* Related Reviews, Interviews & Articles */}
      {relatedArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#080808]/10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mb-6">
            Editorial Coverage, Reviews & Conversations
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      )}

      {/* Related Books */}
      {relatedBooks.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#080808]/10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mb-6">
            More in {book.genre}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {relatedBooks.slice(0, 3).map((b) => (
              <BookCard key={b.id} book={b} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

