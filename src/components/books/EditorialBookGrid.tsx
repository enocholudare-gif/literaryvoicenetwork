"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Eye, Star } from "lucide-react";
import type { Book } from "@/lib/db/types";

export function EditorialBookGrid({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);

  useEffect(() => {
    const syncBooks = async () => {
      let merged = [...initialBooks];
      try {
        const res = await fetch("/api/publishing?scope=public-books&genre=Editorial&pageSize=100", {
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
        const editorialCustom = stored.filter(
          (b) => !b.genre || b.genre.toLowerCase() === "editorial"
        );
        if (editorialCustom.length > 0) {
          merged = [
            ...editorialCustom,
            ...merged.filter(
              (m) =>
                !editorialCustom.some(
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
    return () => window.removeEventListener("lvn-book-published", syncBooks);
  }, [initialBooks]);

  if (books.length === 0) {
    return (
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
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {books.map((book) => {
        const amazonUrl =
          book.retailer_links?.amazon ||
          "https://www.amazon.com/s?k=" + encodeURIComponent(book.title);

        return (
          <div
            key={book.id}
            className="group flex flex-col justify-between rounded-3xl bg-white border border-[#D4AF37]/35 p-5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              {/* Cover */}
              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-neutral-100 border border-[#D4AF37]/30 shadow-md mb-4 group-hover:border-[#D4AF37] transition-all">
                <img
                  src={book.cover_url || "/media/covers/the-first.jpg"}
                  alt={book.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/media/covers/the-first.jpg";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <span className="absolute top-3 left-3 rounded-full bg-black/80 border border-[#D4AF37]/60 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F7DF8B]">
                  {book.genre || "Editorial"}
                </span>
                <span className="absolute top-3 right-3 rounded-full bg-black/80 border border-[#D4AF37]/60 px-2.5 py-0.5 text-[10px] font-bold text-[#F7DF8B] flex items-center gap-1">
                  <Eye className="size-3 text-[#D4AF37]" />
                  {(book.view_count || 1200).toLocaleString()}
                </span>
              </div>

              {/* Title & Author */}
              <h3 className="font-serif-display text-lg font-bold text-[#080808] group-hover:text-[#AA7C11] transition-colors line-clamp-1">
                {book.title}
              </h3>
              {book.subtitle && (
                <p className="text-xs text-neutral-500 italic line-clamp-1 mt-0.5">
                  {book.subtitle}
                </p>
              )}

              {/* Author Pill */}
              <div className="mt-3 flex items-center justify-between gap-2">
                <Link
                  href={
                    book.author_slug
                      ? `/authors/${book.author_slug}`
                      : "/authors"
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-100 border border-neutral-300 px-3 py-1 text-xs hover:border-[#D4AF37] hover:bg-neutral-200 transition-colors"
                >
                  <img
                    src={
                      book.author_avatar ||
                      "/media/avatars/default-portrait.svg"
                    }
                    alt={book.author_name || "Author"}
                    className="size-5 rounded-full object-cover border border-neutral-300"
                  />
                  <span className="font-semibold text-xs text-[#080808] truncate max-w-[130px]">
                    By {book.author_name || "Contributing Author"}
                  </span>
                </Link>

                <span className="inline-flex items-center gap-1 text-xs font-semibold text-neutral-600">
                  <Star className="size-3 fill-current text-[#D4AF37]" />
                  4.9
                </span>
              </div>

              {/* Description */}
              <p className="mt-3 text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                {book.description ||
                  "A verified title published through the Literary Voices Network editorial imprint."}
              </p>
            </div>

            {/* CTAs */}
            <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center gap-2">
              <a
                href={amazonUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (book.slug) {
                    fetch("/api/publishing", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        action: "increment-book-view",
                        slug: book.slug,
                      }),
                    }).catch(() => {});
                  }
                }}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-gold-gradient py-2.5 px-3 text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all shadow-sm"
              >
                <BookOpen className="size-3.5 fill-current" />
                <span>Book Overview</span>
                <ExternalLink className="size-3" />
              </a>
              <Link
                href={`/books/${book.slug}`}
                className="rounded-xl border border-neutral-300 px-3 py-2.5 text-xs font-semibold text-neutral-700 hover:border-[#D4AF37] hover:bg-neutral-50 transition-colors"
                title="View Full Book Details"
              >
                Details
              </Link>
            </div>
          </div>
        );
      })}
    </div>
  );
}
