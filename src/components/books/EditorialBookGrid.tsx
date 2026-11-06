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
          (b) =>
            (b.genre && b.genre.toLowerCase().includes("editorial")) ||
            (b.section && b.section.toLowerCase().includes("editorial")) ||
            (Array.isArray(b.secondary_genres) &&
              b.secondary_genres.some(
                (g: string) => typeof g === "string" && g.toLowerCase().includes("editorial")
              ))
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
    window.addEventListener("storage", syncBooks);
    return () => {
      window.removeEventListener("lvn-book-published", syncBooks);
      window.removeEventListener("storage", syncBooks);
    };
  }, [initialBooks]);

  if (books.length === 0) {
    return (
      <div className="p-16 text-center rounded-3xl bg-white border border-[#D4AF37]/30 space-y-3">
        <BookOpen className="size-12 text-[#D4AF37] mx-auto" />
        <h3 className="font-serif text-xl font-bold text-[#080808]">
          No Editorial Books Found
        </h3>
        <p className="text-xs text-neutral-600 max-w-md mx-auto">
          Explore the full directory or check back as our editorial desk reviews and publishes new titles.
        </p>
        <div className="pt-2">
          <Link
            href="/books"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110"
          >
            Browse Full Catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => {
        const cover =
          book.cover_url || (book as any).cover_image_url || "/media/covers/the-first.jpg";
        const rating = (book as any).rating_avg
          ? Number((book as any).rating_avg).toFixed(1)
          : "5.0";
        const ratingCount = (book as any).rating_count || 12;
        const buyUrl =
          book.retailer_links?.amazon ||
          book.retailer_links?.bookshop ||
          book.retailer_links?.barnesAndNoble ||
          (book as any).buy_url;

        return (
          <div
            key={book.id}
            className="group rounded-3xl bg-white border border-[#D4AF37]/35 p-6 flex flex-col justify-between hover:border-[#AA7C11] hover:shadow-xl transition-all"
          >
            <div>
              <div className="aspect-[3/4] w-full rounded-2xl overflow-hidden mb-4 relative bg-neutral-900 border border-neutral-200">
                <img
                  src={cover}
                  alt={book.title}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      "/media/covers/the-first.jpg";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-3 left-3 rounded-full bg-gold-gradient px-2.5 py-0.5 text-[9px] font-bold text-[#050505] uppercase tracking-wider">
                  Editorial
                </span>
              </div>

              <div className="flex items-center gap-1 text-[#AA7C11] text-xs font-bold mb-1.5">
                <Star className="size-3.5 fill-[#AA7C11]" />
                <span>{rating}</span>
                <span className="text-neutral-400 text-[10px]">({ratingCount})</span>
              </div>

              <h3 className="font-serif font-bold text-lg text-[#080808] line-clamp-2 group-hover:text-[#AA7C11] transition-colors">
                {book.title}
              </h3>
              <p className="text-xs text-neutral-600 line-clamp-1 mt-0.5 font-medium">
                by {book.author_name || "Author"}
              </p>

              {book.description && (
                <p className="text-xs text-neutral-600 line-clamp-3 mt-2.5 leading-relaxed">
                  {book.description}
                </p>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
              <Link
                href={`/books/${book.slug || book.id}`}
                className="inline-flex items-center gap-1 font-bold text-[#080808] hover:text-[#AA7C11] text-xs"
              >
                <Eye className="size-3.5 text-[#AA7C11]" />
                View Details
              </Link>

              {buyUrl ? (
                <a
                  href={buyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 transition-all shadow-xs"
                >
                  Purchase <ExternalLink className="size-3" />
                </a>
              ) : (
                <Link
                  href={`/books/${book.slug || book.id}`}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 transition-all shadow-xs"
                >
                  Explore Title
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
