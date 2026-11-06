"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Eye, Headphones, Radio, Star } from "lucide-react";
import type { Book } from "@/lib/db/types";

interface PodcastBookGridProps {
  initialBooks?: Book[];
  theme?: "dark" | "light";
  title?: string;
  subtitle?: string;
}

export function PodcastBookGrid({
  initialBooks = [],
  theme = "dark",
  title = "Books Featured on LVN Podcasts & Audio",
  subtitle = "Author volumes, discussions, and literary editions spotlighted across our podcast broadcast lineup.",
}: PodcastBookGridProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks);

  useEffect(() => {
    const syncBooks = async () => {
      let merged = [...initialBooks];
      try {
        const res = await fetch("/api/publishing?scope=public-books&genre=Podcast&pageSize=100", {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.ok && Array.isArray(data.items)) {
          merged = data.items;
        }
      } catch {}

      try {
        const stored: any[] = JSON.parse(
          localStorage.getItem("lvn_custom_published_books") || "[]"
        );
        const podcastCustom = stored.filter(
          (b) =>
            (b.genre && b.genre.toLowerCase().includes("podcast")) ||
            (b.section && b.section.toLowerCase().includes("podcast")) ||
            (Array.isArray(b.secondary_genres) &&
              b.secondary_genres.some(
                (g: string) => typeof g === "string" && g.toLowerCase().includes("podcast")
              ))
        );
        if (podcastCustom.length > 0) {
          merged = [
            ...podcastCustom,
            ...merged.filter(
              (m) =>
                !podcastCustom.some(
                  (c) => c.id === m.id || c.title.toLowerCase() === m.title.toLowerCase()
                )
            ),
          ];
        }
      } catch {}

      setBooks(merged);
    };

    syncBooks();
    window.addEventListener("lvn-book-published", syncBooks);
    window.addEventListener("storage", syncBooks);
    return () => {
      window.removeEventListener("lvn-book-published", syncBooks);
      window.removeEventListener("storage", syncBooks);
    };
  }, [initialBooks]);

  if (books.length === 0) return null;

  const isDark = theme === "dark";

  return (
    <section
      className={`rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 ${
        isDark
          ? "bg-[#0c0c0c] border border-[#D4AF37]/35 text-[#FAF8F3]"
          : "bg-white border border-[#D4AF37]/35 text-[#080808]"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-gradient text-[#050505]">
            <Headphones className="size-3" />
            Podcast &amp; Audio Editions
          </span>
          <h2 className="font-serif-display text-2xl sm:text-3xl font-bold mt-2">
            {title}
          </h2>
          <p className={`text-xs mt-1 ${isDark ? "text-white/70" : "text-neutral-600"}`}>
            {subtitle}
          </p>
        </div>
        <span
          className={`rounded-full px-3.5 py-1 text-xs font-semibold self-start sm:self-auto ${
            isDark
              ? "bg-white/10 border border-white/20 text-[#F7DF8B]"
              : "bg-neutral-100 border border-neutral-300 text-neutral-700"
          }`}
        >
          {books.length} Verified {books.length === 1 ? "Book" : "Books"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {books.map((book) => {
          const cover =
            book.cover_url || (book as any).cover_image_url || "/media/books/default-cover.svg";
          const rating = (book as any).rating_avg
            ? Number((book as any).rating_avg).toFixed(1)
            : "5.0";
          const ratingCount = (book as any).rating_count || 18;
          const buyUrl =
            book.retailer_links?.amazon ||
            book.retailer_links?.bookshop ||
            book.retailer_links?.barnesAndNoble ||
            (book as any).buy_url;

          return (
            <div
              key={book.id}
              className={`group rounded-2xl border p-4 flex flex-col justify-between transition-all hover:shadow-xl ${
                isDark
                  ? "bg-[#141414] border-[#D4AF37]/30 text-[#FAF8F3] hover:border-[#D4AF37]"
                  : "bg-[#FAF8F3] border-[#D4AF37]/30 text-[#080808] hover:border-[#AA7C11]"
              }`}
            >
              <div>
                <div className="aspect-[3/4] w-full rounded-xl overflow-hidden mb-3 relative bg-neutral-900 border border-white/10">
                  <img
                    src={cover}
                    alt={book.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/media/books/default-cover.svg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {book.format && (
                    <span className="absolute top-2 left-2 rounded-full bg-[#080808]/90 border border-[#D4AF37]/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#D4AF37]">
                      {book.format}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-[#D4AF37] text-xs font-bold mb-1">
                  <Star className="size-3 fill-[#D4AF37]" />
                  <span>{rating}</span>
                  <span className={isDark ? "text-white/40 text-[10px]" : "text-neutral-400 text-[10px]"}>
                    ({ratingCount})
                  </span>
                </div>

                <h3
                  className={`font-serif font-bold text-sm line-clamp-2 transition-colors ${
                    isDark ? "text-white group-hover:text-[#D4AF37]" : "text-[#080808] group-hover:text-[#AA7C11]"
                  }`}
                >
                  {book.title}
                </h3>
                <p className={`text-xs line-clamp-1 mt-0.5 ${isDark ? "text-white/70" : "text-neutral-600"}`}>
                  by {book.author_name || "Author"}
                </p>

                {book.description && (
                  <p className={`text-[11px] line-clamp-2 mt-2 leading-relaxed ${isDark ? "text-white/60" : "text-neutral-500"}`}>
                    {book.description}
                  </p>
                )}
              </div>

              <div
                className={`pt-3 mt-3 border-t flex items-center justify-between text-xs ${
                  isDark ? "border-white/10" : "border-neutral-200"
                }`}
              >
                <Link
                  href={`/books/${book.slug || book.id}`}
                  className="inline-flex items-center gap-1 text-[#D4AF37] hover:text-[#F7DF8B] font-semibold text-[11px]"
                >
                  <Eye className="size-3" />
                  View Book
                </Link>

                {buyUrl ? (
                  <a
                    href={buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-gradient text-[10px] font-bold text-[#050505] hover:brightness-110 transition-all"
                  >
                    Buy <ExternalLink className="size-2.5" />
                  </a>
                ) : (
                  <Link
                    href={`/books/${book.slug || book.id}`}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gold-gradient text-[10px] font-bold text-[#050505] hover:brightness-110 transition-all"
                  >
                    Details
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
