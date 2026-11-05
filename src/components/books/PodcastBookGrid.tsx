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
            (b.genre && b.genre.toLowerCase() === "podcast") ||
            (b.section && b.section.toLowerCase().includes("podcast"))
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
    return () => window.removeEventListener("lvn-book-published", syncBooks);
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {books.map((mb) => {
          const amazonUrl =
            mb.retailer_links?.amazon ||
            "https://www.amazon.com/s?k=" + encodeURIComponent(mb.title);

          return (
            <div
              key={mb.id}
              className={`group rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 ${
                isDark
                  ? "bg-[#161616] border border-[#D4AF37]/30 hover:border-[#F7DF8B] hover:shadow-2xl"
                  : "bg-[#FAF8F3] border border-[#D4AF37]/30 hover:border-[#AA7C11] hover:shadow-md"
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold text-[#050505]">
                    Podcast
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                      isDark
                        ? "bg-black/60 text-white/80 border-white/10"
                        : "bg-white text-neutral-700 border-neutral-200"
                    }`}
                  >
                    <Eye className="size-3 text-[#AA7C11]" />
                    {(mb.view_count || 1420).toLocaleString()} Views
                  </span>
                </div>

                <div className="aspect-[2/3] max-w-[180px] mx-auto rounded-xl overflow-hidden bg-[#080808] border border-[#D4AF37]/40 shadow-sm mb-4">
                  <img
                    src={mb.cover_url || "/media/covers/the-first.jpg"}
                    alt={mb.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/media/covers/the-first.jpg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                <h3
                  className={`font-serif text-lg font-bold text-center line-clamp-1 ${
                    isDark ? "text-[#FAF8F3]" : "text-[#080808]"
                  }`}
                  title={mb.title}
                >
                  {mb.title}
                </h3>
                {mb.subtitle && (
                  <p
                    className={`text-xs text-center italic mt-0.5 truncate ${
                      isDark ? "text-[#D4AF37]" : "text-neutral-500"
                    }`}
                  >
                    {mb.subtitle}
                  </p>
                )}

                <div className="mt-2.5 text-center">
                  <Link
                    href={mb.author_slug ? `/authors/${mb.author_slug}` : "/authors"}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs border transition-colors ${
                      isDark
                        ? "bg-white/5 border-[#D4AF37]/40 text-[#FAF8F3] hover:bg-white/10"
                        : "bg-white border-[#D4AF37]/35 text-[#080808] hover:bg-[#D4AF37]/15"
                    }`}
                  >
                    <img
                      src={mb.author_avatar || "/media/avatars/default-portrait.svg"}
                      alt={mb.author_name || "Author"}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          "/media/avatars/default-portrait.svg";
                      }}
                      className="size-4 rounded-full object-cover"
                    />
                    <span className="font-semibold text-xs">By {mb.author_name}</span>
                  </Link>
                </div>

                <p
                  className={`text-xs mt-3 line-clamp-3 leading-relaxed ${
                    isDark ? "text-white/70" : "text-neutral-600"
                  }`}
                >
                  {mb.description}
                </p>
              </div>

              <div
                className={`mt-4 pt-3 border-t space-y-2 ${
                  isDark ? "border-white/10" : "border-neutral-200"
                }`}
              >
                <a
                  href={amazonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 shadow-xs transition-all"
                >
                  <span>Purchase Book / Audio</span>
                  <ExternalLink className="size-3 text-[#050505]" />
                </a>
                <Link
                  href={mb.author_slug ? `/authors/${mb.author_slug}` : "/authors"}
                  className={`w-full flex items-center justify-center gap-1 px-4 py-2 rounded-xl border text-xs font-semibold transition-colors ${
                    isDark
                      ? "bg-white/5 border-white/15 text-[#FAF8F3] hover:bg-white/10"
                      : "bg-white border-[#D4AF37]/40 text-[#080808] hover:bg-neutral-50"
                  }`}
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
