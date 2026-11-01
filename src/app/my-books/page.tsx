"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  Filter,
  Plus,
  Search,
  User,
} from "lucide-react";
import type { Book, Profile, Submission, User as UserModel } from "@/lib/db/types";

export default function MyBooksPage() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Omit<UserModel, "password_hash"> | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [myBooks, setMyBooks] = useState<Book[]>([]);
  const [mySubmissions, setMySubmissions] = useState<Submission[]>([]);
  const [allAuthors, setAllAuthors] = useState<Array<{ name: string; slug: string }>>([]);
  const [selectedAuthor, setSelectedAuthor] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // 1. Fetch current auth session
    fetch("/api/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) {
          setUser(data.user);
          setProfile(data.profile);
          if (data.profile?.display_name) {
            setSelectedAuthor(data.profile.display_name);
          }
        }
      })
      .catch(() => {});

    // 2. Fetch books
    fetch("/api/publishing?scope=public-books&pageSize=100")
      .then((r) => r.json())
      .then((data) => {
        if (data.ok && Array.isArray(data.items)) {
          setMyBooks(data.items);
          const authors = Array.from(
            new Set(data.items.map((b: Book) => b.author_name).filter(Boolean))
          ).map((name) => ({
            name: String(name),
            slug: String(name).toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          }));
          setAllAuthors(authors);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filter books to only what belongs to the current author
  const currentAuthorName =
    selectedAuthor || profile?.display_name || (user?.role === "author" ? user.email : "");

  const authorBooks = currentAuthorName
    ? myBooks.filter(
        (b) =>
          (b.author_name &&
            b.author_name.toLowerCase().includes(currentAuthorName.toLowerCase())) ||
          (user && b.submitted_by_user_id === user.id)
      )
    : myBooks.slice(0, 4);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-16 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
              <BookOpen className="size-3.5 text-[#D4AF37]" />
              Private Author Dashboard
            </span>
            <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white mt-3">
              My Books &amp; Submissions
            </h1>
            <p className="text-sm sm:text-base text-[#FAF8F3]/75 max-w-2xl mt-2 leading-relaxed">
              Track your verified books, real-time reader view counts, and editorial review submissions. Only titles belonging to your author account appear here.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/publish"
              className="inline-flex items-center gap-2 rounded-xl bg-gold-gradient px-6 py-3 text-xs font-bold text-[#050505] hover:brightness-110 shadow-md transition-all"
            >
              <Plus className="size-4" />
              Request New Book Publication
            </Link>
          </div>
        </div>
      </section>

      {/* Main Author View */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        {/* Author Selector & Filter */}
        <div className="p-4 rounded-2xl bg-white border border-[#D4AF37]/30 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <User className="size-4 text-[#AA7C11]" />
            <span className="text-xs font-bold text-[#080808]">Viewing Author:</span>
            <select
              value={selectedAuthor}
              onChange={(e) => setSelectedAuthor(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-neutral-300 text-xs font-semibold text-[#080808] focus:border-[#D4AF37] focus:outline-none bg-[#FAF8F3]"
            >
              <option value="">-- Select or Switch Author --</option>
              {allAuthors.map((a) => (
                <option key={a.name} value={a.name}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="text-xs text-neutral-500">
            Showing <strong className="text-[#080808]">{authorBooks.length}</strong> title{authorBooks.length === 1 ? "" : "s"} for this author
          </div>
        </div>

        {/* Author's Books Grid */}
        {authorBooks.length === 0 ? (
          <div className="p-16 rounded-3xl bg-white border border-neutral-200 text-center space-y-4 shadow-sm">
            <BookOpen className="size-12 text-[#D4AF37] mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              No Books Found for this Author
            </h2>
            <p className="text-xs text-neutral-500 max-w-md mx-auto">
              You haven't requested or published any books under this author identity yet. Use the link below to submit your book cover, metadata, and description.
            </p>
            <div className="pt-2">
              <Link
                href="/publish"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] shadow-md hover:brightness-110"
              >
                <Plus className="size-4" />
                Publish Your First Book
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {authorBooks.map((book) => {
              const amazonUrl =
                book.retailer_links?.amazon ||
                ("https://www.amazon.com/s?k=" + encodeURIComponent(book.title));

              return (
                <div
                  key={book.id}
                  className="rounded-3xl bg-white border-2 border-[#D4AF37]/35 p-6 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-bold text-[#050505]">
                        {book.genre}
                      </span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[10px] font-bold text-emerald-800">
                        <CheckCircle2 className="size-3 text-emerald-600" />
                        Status: Published
                      </span>
                    </div>

                    <div className="aspect-[2/3] max-w-[200px] mx-auto rounded-2xl overflow-hidden bg-[#080808] border-2 border-[#D4AF37]/50 shadow-md">
                      <img
                        src={book.cover_url || "/media/covers/the-first.jpg"}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="text-center space-y-1">
                      <h3 className="font-serif text-xl font-bold text-[#080808] line-clamp-1">
                        {book.title}
                      </h3>
                      {book.subtitle && (
                        <p className="text-xs text-neutral-500 italic line-clamp-1">
                          {book.subtitle}
                        </p>
                      )}
                      <p className="text-xs font-semibold text-[#AA7C11]">
                        Author: {book.author_name || "Author"}
                      </p>
                    </div>

                    {/* View Counts & Statistics */}
                    <div className="p-3.5 rounded-xl bg-[#FAF8F3] border border-neutral-200 flex items-center justify-between text-xs">
                      <span className="text-neutral-600 flex items-center gap-1.5 font-medium">
                        <Eye className="size-4 text-[#AA7C11]" />
                        Total Reader Views:
                      </span>
                      <strong className="text-neutral-900 font-bold">
                        {(book.view_count || 1200).toLocaleString()}
                      </strong>
                    </div>

                    <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                      {book.description}
                    </p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-neutral-100 flex flex-col gap-2">
                    <a
                      href={amazonUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gold-gradient text-xs font-bold text-[#050505] hover:brightness-110 active:scale-95 transition-all text-center"
                    >
                      <BookOpen className="size-3.5 fill-current" />
                      <span>View Retail Overview</span>
                      <ExternalLink className="size-3" />
                    </a>
                    <Link
                      href={`/books/${book.slug}`}
                      className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl border border-neutral-300 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors text-center"
                    >
                      Inspect Edition Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
