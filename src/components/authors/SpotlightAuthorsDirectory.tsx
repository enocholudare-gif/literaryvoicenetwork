"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Award, BookOpen, Feather, User, Users } from "lucide-react";
import type { Profile } from "@/lib/db/types";

interface AuthorWithStats extends Profile {
  book_count?: number;
  article_count?: number;
}

export function SpotlightAuthorsDirectory({
  initialAuthors = [],
}: {
  initialAuthors?: AuthorWithStats[];
}) {
  const [authors, setAuthors] = useState<AuthorWithStats[]>(initialAuthors);

  useEffect(() => {
    const syncAuthors = () => {
      let merged = [...initialAuthors];
      try {
        const storedAuthors: any[] = JSON.parse(
          localStorage.getItem("lvn_custom_spotlight_authors") || "[]"
        );
        const storedBooks: any[] = JSON.parse(
          localStorage.getItem("lvn_custom_published_books") || "[]"
        );

        // Extract author entries from published books
        const bookAuthors: any[] = storedBooks
          .filter((b) => b.author_name && b.author_name !== "Author")
          .map((b) => ({
            id: "auth-" + (b.author_slug || b.id),
            slug: b.author_slug || (b.author_name || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            display_name: b.author_name,
            headline: b.author_headline || "Published Author",
            bio: b.author_bio || b.description || "Contributing author on Literary Voices Network.",
            avatar_url: b.author_avatar || "/media/avatars/default-portrait.svg",
            book_count: 1,
            is_featured: 1,
          }));

        const combinedCustom = [...storedAuthors, ...bookAuthors];

        if (combinedCustom.length > 0) {
          const map = new Map<string, any>();
          for (const a of combinedCustom) {
            const key = (a.display_name || a.slug || "").toLowerCase().trim();
            if (key && !map.has(key)) {
              map.set(key, a);
            }
          }
          for (const m of merged) {
            const key = (m.display_name || m.slug || "").toLowerCase().trim();
            if (key && !map.has(key)) {
              map.set(key, m);
            }
          }
          merged = Array.from(map.values());
        }
      } catch {}

      // Filter out seed mock profiles
      merged = merged.filter((a) => {
        const id = a.id || "";
        const name = (a.display_name || "").toLowerCase();
        return (
          !id.startsWith("profile-") &&
          !name.includes("claire moreau") &&
          !name.includes("amara osei") &&
          !name.includes("ayn cates") &&
          !name.includes("caro claire") &&
          !name.includes("charlotte mcconaghy") &&
          !name.includes("david r. sheldon") &&
          !name.includes("stacey l. horn") &&
          !name.includes("erica m. elliott") &&
          !name.includes("graham wilson") &&
          !name.includes("jane austen") &&
          !name.includes("julian thorne") &&
          !name.includes("kathryn stockett") &&
          !name.includes("kenneth bliss") &&
          !name.includes("lou lipsitz") &&
          !name.includes("lynn slaughter") &&
          !name.includes("marie benedict") &&
          !name.includes("søren lindqvist") &&
          !name.includes("soren lindqvist") &&
          !name.includes("tayari jones") &&
          !name.includes("tony rebeiro") &&
          !name.includes("marcus sterling") &&
          !name.includes("executive founder & ceo")
        );
      });

      setAuthors(merged);
    };

    syncAuthors();
    window.addEventListener("lvn-book-published", syncAuthors);
    window.addEventListener("storage", syncAuthors);
    return () => {
      window.removeEventListener("lvn-book-published", syncAuthors);
      window.removeEventListener("storage", syncAuthors);
    };
  }, [initialAuthors]);

  if (authors.length === 0) {
    return (
      <section className="rounded-3xl bg-white border border-[#D4AF37]/30 p-8 sm:p-12 shadow-sm text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-[#080808] border border-[#D4AF37]/40 flex items-center justify-center mx-auto shadow-sm">
          <Users className="size-7 text-[#D4AF37]" />
        </div>
        <div className="space-y-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-gradient text-[#050505]">
            Network Author Directory
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808]">
            Curated Author Spotlight
          </h2>
          <p className="text-sm text-neutral-600 max-w-xl mx-auto leading-relaxed">
            Featured spotlights for celebrated writers, poets, and debut authors are curated weekly by the LVN editorial desk. Discover newly syndicated authors and published works across the network.
          </p>
        </div>
        <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/books"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 transition-all shadow-sm"
          >
            Explore Published Works
          </Link>
          <Link
            href="/for-authors"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#D4AF37]/40 text-xs font-semibold text-[#080808] hover:bg-[#080808] hover:text-[#F7DF8B] transition-all"
          >
            Author Broadcast Enquiries
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gold-gradient text-[#050505]">
            <Award className="size-3" />
            Spotlight Authors
          </span>
          <h2 className="font-serif text-2xl font-bold text-[#080808] mt-2">
            Spotlighted Authors &amp; Contributors ({authors.length})
          </h2>
        </div>
        <span className="rounded-full bg-neutral-100 border border-neutral-300 px-3.5 py-1 text-xs font-semibold text-neutral-700">
          {authors.length} Verified {authors.length === 1 ? "Author" : "Authors"}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {authors.map((author) => (
          <div
            key={author.id}
            className="group rounded-3xl bg-white border border-[#D4AF37]/35 p-6 flex flex-col justify-between hover:border-[#AA7C11] hover:shadow-lg transition-all"
          >
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="size-16 rounded-full overflow-hidden border-2 border-[#D4AF37]/60 shadow-sm shrink-0 bg-[#080808]">
                  <img
                    src={author.avatar_url || "/media/avatars/default-portrait.svg"}
                    alt={author.display_name}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = "/media/avatars/default-portrait.svg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#080808] group-hover:text-[#AA7C11] transition-colors">
                    {author.display_name}
                  </h3>
                  <p className="text-xs text-neutral-600 line-clamp-1">
                    {author.headline || "Featured Author"}
                  </p>
                </div>
              </div>

              {author.bio && (
                <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed mb-4">
                  {author.bio}
                </p>
              )}
            </div>

            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs">
              <span className="inline-flex items-center gap-1 font-semibold text-neutral-600">
                <BookOpen className="size-3.5 text-[#AA7C11]" />
                {author.book_count || 1} Published {author.book_count === 1 ? "Title" : "Titles"}
              </span>
              <Link
                href={`/authors/${author.slug}`}
                className="font-bold text-[#AA7C11] hover:underline"
              >
                View Profile &rarr;
              </Link>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
