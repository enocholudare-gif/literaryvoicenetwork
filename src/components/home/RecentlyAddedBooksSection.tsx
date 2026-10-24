"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import type { Book } from "@/lib/db/types";

const FALLBACK_COVER = "/media/covers/the-glass-meridian.svg";

/**
 * Recently Added Books — cards rise in one after another when the section
 * scrolls into view, then gently float. Covers tilt and glow on hover.
 */
export function RecentlyAddedBooksSection({ books }: { books: Book[] }) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          obs.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden bg-[#080808] text-[#FAF8F3] border-y border-[#D4AF37]/30 py-20"
    >
      <div className="absolute -left-32 top-10 size-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37] inline-flex items-center gap-1.5">
              <Sparkles className="size-3.5" /> Fresh on the Shelf
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold mt-1">
              Recently Added Books
            </h2>
            <p className="text-sm text-[#FAF8F3]/70 mt-1">
              Submitted by our community — reviewed and approved by the editorial desk.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/publish"
              className="rounded-full bg-gold-gradient px-5 py-2.5 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
            >
              Publish Your Book
            </Link>
            <Link
              href="/community-books"
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F7DF8B] hover:underline"
            >
              View All <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-7">
          {books.map((book, i) => (
            <div
              key={book.id}
              className="transition-all duration-700 ease-out"
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "translateY(0)" : "translateY(48px)",
                transitionDelay: `${i * 150}ms`,
              }}
            >
              <Link
                href={`/books/${book.slug}`}
                className="animate-book-float group block"
                style={{ animationDelay: `${i * 450}ms` }}
              >
                <div className="relative aspect-[2/3] rounded-2xl overflow-hidden border-2 border-[#D4AF37]/40 shadow-[0_20px_45px_rgba(0,0,0,0.6)] group-hover:border-[#F7DF8B] group-hover:shadow-[0_24px_55px_rgba(212,175,55,0.3)] group-hover:[transform:rotate(-2deg)_scale(1.03)] transition-all duration-500">
                  <img
                    src={book.cover_url || FALLBACK_COVER}
                    alt={book.title}
                    onLoad={(e) => {
                      if ((e.currentTarget as HTMLImageElement).naturalWidth <= 1) {
                        (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                      }
                    }}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = FALLBACK_COVER;
                    }}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="absolute top-3 left-3 rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#050505]">
                    New · {book.genre}
                  </span>
                  <div className="absolute bottom-0 inset-x-0 p-4 translate-y-3 group-hover:translate-y-0 transition-transform duration-500">
                    <h3 className="font-serif-display text-lg font-bold text-[#FAF8F3] line-clamp-2">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#D4AF37] font-semibold mt-0.5">
                      {book.author_name || "LVN Author"}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-bold text-[#F7DF8B] opacity-0 group-hover:opacity-100 transition-opacity">
                      <BookOpen className="size-3.5" /> Read Excerpt →
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
