import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Clock,
  Feather,
  Newspaper,
  Search,
  Sparkles,
} from "lucide-react";
import { ArticleCard } from "@/components/ui/Cards";
import { listCategories, listEditorialIssues } from "@/lib/services/platform";
import { listPublicArticles } from "@/lib/services/publishing";
import type { ArticleType } from "@/lib/db/types";

export const dynamic = "force-dynamic";

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
        {/* Featured Cover Story Spotlight when browsing unfiltered */}
        {coverStory && !search && articleType === "all" && !issueId && (
          <div className="rounded-3xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/35 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-5 relative min-h-[280px] bg-[#141414]">
              <img
                src={coverStory.cover_url || "/media/banners/editorial-desk.svg"}
                alt={coverStory.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-[#080808]">
                  <Sparkles className="w-3.5 h-3.5" />
                  Featured Cover Story
                </span>
              </div>
            </div>
            <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#F7DF8B]">
                  {coverStory.issue_number && (
                    <span className="font-bold uppercase tracking-wider">
                      Issue No. {coverStory.issue_number} · {coverStory.issue_title}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 text-[#FAF8F3]/70">
                    <Clock className="w-3.5 h-3.5" />
                    {coverStory.reading_time_minutes} min read
                  </span>
                </div>
                <Link href={`/magazine/${coverStory.slug}`}>
                  <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white hover:text-[#F7DF8B] transition-colors leading-tight">
                    {coverStory.title}
                  </h2>
                </Link>
                {coverStory.subtitle && (
                  <p className="font-serif text-lg text-[#F7DF8B] italic">
                    {coverStory.subtitle}
                  </p>
                )}
                <p className="text-sm text-[#FAF8F3]/80 leading-relaxed">
                  {coverStory.excerpt}
                </p>
              </div>

              <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <Link
                  href={`/authors/${coverStory.author_slug || "eleanor-vance"}`}
                  className="flex items-center gap-3 group"
                >
                  <img
                    src={coverStory.author_avatar || "/media/avatars/eleanor-vance.svg"}
                    alt={coverStory.author_name || "Author"}
                    className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                  />
                  <div>
                    <span className="text-xs text-[#FAF8F3]/60 block">By</span>
                    <span className="text-sm font-bold text-white group-hover:text-[#F7DF8B]">
                      {coverStory.author_name}
                    </span>
                  </div>
                </Link>

                <Link
                  href={`/magazine/${coverStory.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
                >
                  Read Cover Essay
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Articles Grid */}
        {remainingArticles.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#080808]/10 p-12 text-center space-y-3">
            <Newspaper className="w-10 h-10 text-[#D4AF37] mx-auto" />
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              No matching articles found
            </h2>
            <p className="text-sm text-[#080808]/70">
              Try resetting your search filters or exploring all editorial categories.
            </p>
            <Link
              href="/magazine"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-[#080808] text-white text-xs font-semibold"
            >
              View All Magazine Pieces
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

