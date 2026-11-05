"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, ExternalLink, Eye, Star } from "lucide-react";
import type { Book } from "@/lib/db/types";

export function MagazineBookGrid({ initialBooks }: { initialBooks: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);

  useEffect(() => {
    const syncBooks = async () => {
      let merged = [...initialBooks];
      try {
        const res = await fetch("/api/publishing?scope=public-books&genre=Magazine&pageSize=100", {
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
        const magazineCustom = stored.filter(
          (b) =>
            (b.genre && b.genre.toLowerCase() === "magazine") ||
            (b.section && b.section.toLowerCase().includes("magazine"))
        );
        if (magazineCustom.length > 0) {
          merged = [
            ...magazineCustom,
            ...merged.filter(
              (m) =>
                !magazineCustom.some(
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

  if (books.length === 0) return null;

  return (
    <section className="rounded-3xl bg-white border border-[#D4AF37]/35 p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-gradient text-[#050505]">
            <BookOpen className="w-3.5 h-3.5" />
            Featured Magazine Books
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#080808] mt-2">
            Books Tagged Magazine
          </h2>
          <p className="text-xs text-neutral-600 mt-1">
            Poetry, essays, and literary volumes curated exclusively for the LVN Digital Magazine readership.
          </p>
        </div>
        <span className="rounded-full bg-neutral-100 border border-neutral-300 px-3.5 py-1 text-xs font-semibold text-neutral-700">
          {books.length} Verified {books.length === 1 ? "Volume" : "Volumes"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((mb) => {
          const amazonUrl =
            mb.retailer_links?.amazon ||
            "https://www.amazon.com/s?k=" + encodeURIComponent(mb.title);

          return (
            <div
              key={mb.id}
              className="group rounded-2xl bg-[#FAF8F3] border border-[#D4AF37]/30 p-5 flex flex-col justify-between hover:border-[#AA7C11] hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold text-[#050505]">
                    Magazine
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-neutral-700 border border-neutral-200">
                    <Eye className="size-3 text-[#AA7C11]" />
                    {(mb.view_count || 1340).toLocaleString()} Views
                  </span>
                </div>

                <div className="aspect-[2/3] max-w-[180px] mx-auto rounded-xl overflow-hidden bg-[#080808] border border-[#D4AF37]/40 shadow-sm mb-4">
                  <img
                    src={mb.cover_url || "/media/covers/maga1.jpg"}
                    alt={mb.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/media/covers/maga1.jpg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3 className="font-serif text-lg font-bold text-[#080808] text-center line-clamp-1">
                  {mb.title}
                </h3>
                {mb.subtitle && (
                  <p className="text-xs text-neutral-500 text-center italic mt-0.5">
                    {mb.subtitle}
                  </p>
                )}

                <div className="mt-2.5 text-center">
                  <Link
                    href={mb.author_slug ? `/authors/${mb.author_slug}` : "/authors"}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white border border-[#D4AF37]/35 px-3 py-1 text-xs hover:bg-[#D4AF37]/15 transition-colors"
                  >
                    <img
                      src={mb.author_avatar || "/media/avatars/lou-lipsitz.jpg"}
                      alt={mb.author_name || "Author"}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/media/avatars/default-portrait.svg";
                      }}
                      className="size-4 rounded-full object-cover"
                    />
                    <span className="font-semibold text-xs text-[#080808]">
                      By {mb.author_name}
                    </span>
                  </Link>
                </div>

                <p className="text-xs text-neutral-600 mt-3 line-clamp-3 leading-relaxed">
                  {mb.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-200 space-y-2">
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 shadow-xs transition-all"
                >
                  <span>Purchase on Amazon</span>
                  <ExternalLink className="size-3 text-[#050505]" />
                </a>
                <Link
                  href={mb.author_slug ? `/authors/${mb.author_slug}` : "/authors"}
                  className="w-full flex items-center justify-center gap-1 px-4 py-2 rounded-xl bg-white border border-[#D4AF37]/40 text-xs font-semibold text-[#080808] hover:bg-neutral-50 transition-colors"
                >
                  <span>Author Overview Profile</span>
                  <Star className="size-3 text-[#AA7C11]" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
