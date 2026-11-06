"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Award, Clock, Newspaper } from "lucide-react";
import { ArticleCard } from "@/components/ui/Cards";
import type { Article } from "@/lib/db/types";

interface MagazineArticlesSectionProps {
  initialArticles: Article[];
  initialCoverStory: Article | null;
  search?: string;
  articleType?: string;
  issueId?: string;
}

export function MagazineArticlesSection({
  initialArticles,
  initialCoverStory,
  search = "",
  articleType = "all",
  issueId = "",
}: MagazineArticlesSectionProps) {
  const [deletedIds, setDeletedIds] = useState<string[]>([]);
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [coverStory, setCoverStory] = useState<Article | null>(initialCoverStory);

  useEffect(() => {
    const syncDeleted = () => {
      let dIds: string[] = [];
      try {
        dIds = JSON.parse(localStorage.getItem("lvn_deleted_article_ids") || "[]");
        setDeletedIds(dIds);
      } catch {}

      if (dIds.length > 0) {
        setArticles(
          initialArticles.filter(
            (a) =>
              !dIds.includes(a.id) &&
              !dIds.includes(a.slug) &&
              !dIds.includes((a.title || "").toLowerCase())
          )
        );
        if (
          initialCoverStory &&
          (dIds.includes(initialCoverStory.id) ||
            dIds.includes(initialCoverStory.slug) ||
            dIds.includes((initialCoverStory.title || "").toLowerCase()))
        ) {
          setCoverStory(null);
        } else {
          setCoverStory(initialCoverStory);
        }
      } else {
        setArticles(initialArticles);
        setCoverStory(initialCoverStory);
      }
    };

    syncDeleted();
    window.addEventListener("lvn-article-deleted", syncDeleted);
    window.addEventListener("storage", syncDeleted);
    return () => {
      window.removeEventListener("lvn-article-deleted", syncDeleted);
      window.removeEventListener("storage", syncDeleted);
    };
  }, [initialArticles, initialCoverStory]);

  const activeArticles = articles.filter(
    (a) =>
      !deletedIds.includes(a.id) &&
      !deletedIds.includes(a.slug) &&
      !deletedIds.includes((a.title || "").toLowerCase())
  );

  const activeCoverStory =
    coverStory &&
    !deletedIds.includes(coverStory.id) &&
    !deletedIds.includes(coverStory.slug) &&
    !deletedIds.includes((coverStory.title || "").toLowerCase())
      ? coverStory
      : null;

  return (
    <div className="space-y-12">
      {/* Featured Cover Story Spotlight when browsing unfiltered */}
      {activeCoverStory && !search && articleType === "all" && !issueId && (
        <div className="rounded-3xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/35 overflow-hidden shadow-xl grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-5 relative min-h-[280px] bg-[#141414]">
            <img
              src={activeCoverStory.cover_url || "/media/banners/editorial-desk.svg"}
              alt={activeCoverStory.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-[#080808]">
                <Award className="w-3.5 h-3.5" />
                Featured Cover Story
              </span>
            </div>
          </div>
          <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3 text-xs text-[#F7DF8B]">
                {activeCoverStory.issue_number && (
                  <span className="font-bold uppercase tracking-wider">
                    Issue No. {activeCoverStory.issue_number} · {activeCoverStory.issue_title}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-[#FAF8F3]/70">
                  <Clock className="w-3.5 h-3.5" />
                  {activeCoverStory.reading_time_minutes} min read
                </span>
              </div>
              <Link href={`/magazine/${activeCoverStory.slug}`}>
                <h2 className="font-serif text-2xl sm:text-4xl font-bold text-white hover:text-[#F7DF8B] transition-colors leading-tight">
                  {activeCoverStory.title}
                </h2>
              </Link>
              {activeCoverStory.subtitle && (
                <p className="font-serif text-lg text-[#F7DF8B] italic">
                  {activeCoverStory.subtitle}
                </p>
              )}
              <p className="text-sm text-[#FAF8F3]/80 leading-relaxed">
                {activeCoverStory.excerpt}
              </p>
            </div>

            <div className="mt-8 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <Link
                href={`/authors/${activeCoverStory.author_slug || "eleanor-vance"}`}
                className="flex items-center gap-3 group"
              >
                <img
                  src={activeCoverStory.author_avatar || "/media/avatars/eleanor-vance.svg"}
                  alt={activeCoverStory.author_name || "Author"}
                  className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]"
                />
                <div>
                  <span className="text-xs text-[#FAF8F3]/60 block">By</span>
                  <span className="text-sm font-bold text-white group-hover:text-[#F7DF8B]">
                    {activeCoverStory.author_name}
                  </span>
                </div>
              </Link>

              <Link
                href={`/magazine/${activeCoverStory.slug}`}
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
      {activeArticles.length === 0 ? (
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
          {activeArticles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

