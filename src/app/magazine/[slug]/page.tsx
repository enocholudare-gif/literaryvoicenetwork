import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Feather,
  Newspaper,
  ShieldCheck,
  Tag,
} from "lucide-react";
import { ArticleCard, BookCard, StatusBadge } from "@/components/ui/Cards";
import { getCurrentSession } from "@/lib/auth/session";
import {
  getArticleBySlugForViewer,
  getBookByIdInternal,
  listPublicArticles,
} from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

interface ArticleDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function ArticleDetailPage({ params }: ArticleDetailPageProps) {
  const { slug } = await params;
  const viewer = await getCurrentSession();
  const article = getArticleBySlugForViewer(slug, viewer);

  if (!article) {
    notFound();
  }

  const relatedBook = article.related_book_id
    ? getBookByIdInternal(article.related_book_id)
    : null;

  const relatedArticles = listPublicArticles({
    articleType: article.article_type,
    pageSize: 4,
  }).items.filter((a) => a.id !== article.id);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Non-published Draft Banner */}
      {article.status !== "published" && (
        <div className="bg-amber-950 text-amber-100 border-b border-amber-500/40 py-3 px-4">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <StatusBadge status={article.status} />
              <span>
                <strong>Private Preview Mode:</strong> This publication is currently in{" "}
                <code className="underline">{article.status}</code> status and is only visible to its author and LVN editors.
              </span>
            </div>
            <Link
              href="/dashboard?tab=publications"
              className="px-3 py-1 rounded-lg bg-amber-400 text-amber-950 font-bold"
            >
              Return to Editorial Studio
            </Link>
          </div>
        </div>
      )}

      {/* Article Header */}
      <header className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href={
              article.article_type === "press_release"
                ? "/press-releases"
                : "/magazine"
            }
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F7DF8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {article.article_type === "press_release"
              ? "Back to Newsroom & Press Releases"
              : "Back to Digital Magazine"}
          </Link>

          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#D4AF37] text-[#080808]">
              {article.article_type.replace(/_/g, " ")}
            </span>
            {article.category_name && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#F7DF8B]">
                {article.category_name}
              </span>
            )}
            {article.issue_number && (
              <Link
                href={`/magazine?issue=${article.issue_id}`}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-white hover:bg-white/15"
              >
                Issue No. {article.issue_number}: {article.issue_title}
              </Link>
            )}
            <span className="inline-flex items-center gap-1 text-xs text-[#FAF8F3]/70">
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              {article.reading_time_minutes} min read
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white leading-tight">
            {article.title}
          </h1>

          {article.subtitle && (
            <p className="font-serif text-xl sm:text-2xl text-[#F7DF8B] italic leading-relaxed">
              {article.subtitle}
            </p>
          )}

          {/* Author Byline Card */}
          <div className="pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-4">
            <Link
              href={`/authors/${article.author_slug || "eleanor-vance"}`}
              className="flex items-center gap-3.5 group"
            >
              <img
                src={article.author_avatar || "/media/avatars/eleanor-vance.svg"}
                alt={article.author_name || "Author"}
                className="w-12 h-12 rounded-full object-cover border border-[#D4AF37]"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-base text-white group-hover:text-[#F7DF8B] transition-colors">
                    {article.author_name}
                  </span>
                  {article.author_role === "admin" && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-[#D4AF37]/25 text-[#F7DF8B]">
                      Founding Editor & Author
                    </span>
                  )}
                </div>
                <span className="text-xs text-[#FAF8F3]/65 block">
                  {article.source_attribution} ·{" "}
                  {article.published_at
                    ? new Date(article.published_at).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Editorial Draft"}
                </span>
              </div>
            </Link>

            <Link
              href={`/authors/${article.author_slug || "eleanor-vance"}`}
              className="px-3.5 py-2 rounded-xl border border-[#D4AF37]/40 text-xs font-semibold text-[#F7DF8B] hover:bg-white/5"
            >
              View Author Profile
            </Link>
          </div>
        </div>
      </header>

      {/* Main Long-Form Reading Body */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white rounded-3xl border border-[#080808]/12 p-8 sm:p-14 shadow-xs">
          {/* Sanitized Long-form HTML Prose */}
          <div
            className="lvn-prose max-w-none"
            dangerouslySetInnerHTML={{ __html: article.body_html }}
          />

          {/* Tags & Press Contact Info */}
          {(article.tags && article.tags.length > 0) || article.media_contact_info ? (
            <div className="mt-10 pt-6 border-t border-[#080808]/10 space-y-4">
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-[#AA7C11]" />
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-xs font-medium bg-[#F3EFE4] text-[#080808]"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {article.media_contact_info && (
                <div className="p-4 rounded-xl bg-[#FAF8F3] border border-[#080808]/10 text-xs text-[#080808]/80">
                  <strong className="uppercase tracking-wider text-[#AA7C11] block mb-1">
                    Press & Media Enquiries
                  </strong>
                  {article.media_contact_info}
                </div>
              )}
            </div>
          ) : null}

          {/* Author Bio Footer */}
          <div className="mt-10 pt-8 border-t border-[#080808]/12 flex flex-col sm:flex-row gap-5 items-start bg-[#FAF8F3] p-6 rounded-2xl">
            <img
              src={article.author_avatar || "/media/avatars/eleanor-vance.svg"}
              alt={article.author_name || "Author"}
              className="w-16 h-16 rounded-2xl object-cover border border-[#D4AF37]"
            />
            <div className="space-y-2 flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#AA7C11]">
                    About the Author
                  </span>
                  <h3 className="font-serif text-xl font-bold text-[#080808]">
                    {article.author_name}
                  </h3>
                </div>
                <Link
                  href={`/authors/${article.author_slug || "eleanor-vance"}`}
                  className="text-xs font-bold text-[#AA7C11] hover:underline"
                >
                  Full Bibliography & Profile →
                </Link>
              </div>
              <p className="text-xs text-[#080808]/80 leading-relaxed">
                {article.author_bio ||
                  article.author_headline ||
                  "Published author and contributor on Literary Voices Network."}
              </p>
            </div>
          </div>
        </article>

        {/* Related Book if linked */}
        {relatedBook && relatedBook.status === "published" && (
          <div className="mt-12">
            <h2 className="font-serif text-2xl font-bold text-[#080808] mb-4">
              Featured Book in This Piece
            </h2>
            <div className="max-w-md">
              <BookCard book={relatedBook} />
            </div>
          </div>
        )}
      </main>

      {/* Related Articles */}
      {relatedArticles.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#080808]/10">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mb-6">
            Further Reading in the Magazine
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.slice(0, 3).map((art) => (
              <ArticleCard key={art.id} article={art} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

