"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { BookCard } from "@/components/ui/Cards";
import type { Book } from "@/lib/db/types";

export function BooksCatalogGrid({ initialBooks = [] }: { initialBooks?: Book[] }) {
  const [books, setBooks] = useState<Book[]>(initialBooks);

  useEffect(() => {
    const syncBooks = () => {
      let merged = [...initialBooks];
      try {
        const stored: any[] = JSON.parse(
          localStorage.getItem("lvn_custom_published_books") || "[]"
        );
        if (stored.length > 0) {
          merged = [
            ...stored,
            ...merged.filter(
              (m) =>
                !stored.some(
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
      <div className="rounded-2xl bg-white border border-[#080808]/10 p-12 text-center space-y-3">
        <BookOpen className="w-10 h-10 text-[#D4AF37] mx-auto" />
        <h2 className="font-serif text-2xl font-bold text-[#080808]">
          No matching books found
        </h2>
        <p className="text-sm text-[#080808]/70 max-w-md mx-auto">
          Try clearing your search query or selecting a broader literary genre.
        </p>
        <div className="pt-2">
          <Link
            href="/books"
            className="inline-flex items-center px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
          >
            View All Published Books
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} />
      ))}
    </div>
  );
}

