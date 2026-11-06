import React from "react";
import Link from "next/link";
import { ArrowRight, Award, BookOpen, Calendar, Clock, ExternalLink, Eye, Feather, Newspaper, Search } from "lucide-react";
import { listCategories, listEditorialIssues } from "@/lib/services/platform";
import { listPublicArticles, listPublicBooks } from "@/lib/services/publishing";
import { MagazineBookGrid } from "@/components/books/MagazineBookGrid";
import { MagazineArticlesSection } from "@/components/magazine/MagazineArticlesSection";
import type { ArticleType } from "@/lib/db/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

interface MagazinePageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
    category?: string;
    issue?: string;
  }>;
}

export default async function MagazinePage({ searchParams }: MagazinePageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const articleType = (params.type as ArticleType | "all") || "all";
  const categorySlug = params.category || "all";
  const issueId = params.issue || "";

  const result = listPublicArticles({
    search,
    articleType,
    categorySlug,
    issueId: issueId || undefined,
    excludePressReleases: articleType === "all",
    pageSize: 24,
  });

  const issues = listEditorialIssues();
  const { items: magazineBooks } = listPublicBooks({ genre: "Magazine", pageSize: 50 });
  const categories = listCategories().filter(
    (c) => c.category_scope === "magazine" || c.category_scope === "both"
  );

  const coverStory =
    result.items.find((a) => a.is_cover_story) || result.items[0] || null;
  const remainingArticles =
    coverStory && !search && articleType === "all" && categorySlug === "all" && !issueId
      ? result.items.filter((a) => a.id !== coverStory.id)
      : result.items;

  const typeFilters: Array<{ value: string; label: string }> = [
    { value: "all", label: "All Editorial Pieces" },
    { value: "cover_story", label: "Cover Stories" },
    { value: "interview", label: "Author Interviews" },
    { value: "review", label: "Book Reviews" },
    { value: "essay", label: "Literary Essays" },
    { value: "lifestyle", label: "Author Lifestyle" },
    { value: "spotlight", label: "Author Spotlights" },
    { value: "resource", label: "Publishing Craft" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Masthead */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Newspaper className="w-3.5 h-3.5" />
                The LVN Digital Magazine
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Literary Journalism, Reviews & Essays
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Long-form criticism, conversations with contemporary writers, translation notes, and publishing resources curated by the Literary Voices Network editorial board.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/editorial-calendar"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#D4AF37]/40 text-[#F7DF8B] font-semibold text-xs hover:bg-white/5 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5" />
                Editorial Calendar & Issues
              </Link>
              <Link
                href="/dashboard?tab=publications"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                <Feather className="w-3.5 h-3.5" />
                Submit Essay or Review
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <form
            action="/magazine"
            method="GET"
            className="mt-8 p-4 rounded-2xl bg-[#141414] border border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3"
          >
            <div className="lg:col-span-4 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search essays, reviews, or authors..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div className="lg:col-span-3">
              <select
                name="type"
                defaultValue={articleType}
                aria-label="Filter by article type"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {typeFilters.map((tf) => (
                  <option key={tf.value} value={tf.value}>
                    {tf.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-3">
              <select
                name="issue"
                defaultValue={issueId}
                aria-label="Filter by editorial issue"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="">All Editorial Issues</option>
                {issues.map((iss) => (
                  <option key={iss.id} value={iss.id}>
                    Issue #{iss.issue_number}: {iss.theme}
                  </option>
                ))}
              </select>
            </div>

            <div className="lg:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                Filter Issue
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">

        {/* Magazine Editions & Books Showcase */}
        {!search && articleType === "all" && (
          <MagazineBookGrid initialBooks={magazineBooks} />
        )}

        {/* Articles & Cover Story Section */}
        <MagazineArticlesSection
          initialArticles={remainingArticles}
          initialCoverStory={coverStory}
          search={search}
          articleType={articleType}
          issueId={issueId}
        />
      </div>
    </div>
  );
}

