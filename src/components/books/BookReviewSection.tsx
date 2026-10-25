"use client";

import React, { useState } from "react";
import { Star, MessageSquarePlus, CheckCircle2 } from "lucide-react";
import type { BookReview } from "@/lib/db/types";

interface Props {
  bookId: string;
  bookTitle: string;
  initialReviews: BookReview[];
  currentUserId?: string | null;
}

export function BookReviewSection({
  bookId,
  bookTitle,
  initialReviews,
  currentUserId,
}: Props) {
  const [reviews, setReviews] = useState<BookReview[]>(initialReviews);
  const [rating, setRating] = useState(5);
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/publishing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "add-book-review",
          bookId,
          rating,
          headline,
          content,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to submit review. You must be signed in.");
      } else {
        setReviews([data.review, ...reviews]);
        setHeadline("");
        setContent("");
        setSuccess(true);
        setShowForm(false);
      }
    } catch {
      setError("Network error while submitting review.");
    } finally {
      setLoading(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 border-t border-[#080808]/10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
            Reader &amp; Author Perspectives
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-1">
            Reviews &amp; Ratings ({reviews.length})
          </h2>
          {avgRating && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center text-[#D4AF37]">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`size-4 ${
                      s <= Math.round(Number(avgRating))
                        ? "fill-current"
                        : "opacity-30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-bold text-[#080808]">
                {avgRating} out of 5
              </span>
            </div>
          )}
        </div>

        <div>
          {currentUserId ? (
            <button
              type="button"
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gold-gradient text-[#050505] text-xs font-bold hover:brightness-110 transition-all shadow-sm"
            >
              <MessageSquarePlus className="size-4" />
              <span>{showForm ? "Close Form" : "Write a Review"}</span>
            </button>
          ) : (
            <a
              href="/auth?mode=login"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#D4AF37]/45 text-xs font-semibold text-[#080808] hover:bg-[#D4AF37]/15 transition-all"
            >
              Sign In to Review
            </a>
          )}
        </div>
      </div>

      {success && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium border border-emerald-200 flex items-center gap-2">
          <CheckCircle2 className="size-4 text-emerald-600" />
          <span>Your review for &ldquo;{bookTitle}&rdquo; has been published!</span>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-10 rounded-2xl bg-white border border-[#080808]/15 p-6 sm:p-8 shadow-sm space-y-4"
        >
          <h3 className="font-serif text-lg font-bold text-[#080808]">
            Drop Your Review for this Book
          </h3>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
              Rating
            </label>
            <div className="flex items-center gap-1.5 text-[#D4AF37]">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-125 transition-transform"
                >
                  <Star
                    className={`size-6 ${
                      star <= rating ? "fill-current" : "opacity-25"
                    }`}
                  />
                </button>
              ))}
              <span className="text-xs text-neutral-500 ml-2">
                ({rating} of 5 stars)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
              Review Headline (Optional)
            </label>
            <input
              type="text"
              value={headline}
              onChange={(e) => setHeadline(e.target.value)}
              placeholder="e.g. A masterful debut of memory and maritime history"
              className="w-full px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#080808] mb-1.5">
              Your Review &amp; Thoughts *
            </label>
            <textarea
              required
              rows={4}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share what moved you, what worked, or why you recommend this book to readers..."
              className="w-full px-4 py-2.5 rounded-xl border border-[#080808]/20 text-sm focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          {error && (
            <p className="text-xs text-rose-600 font-medium">{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-600 hover:text-black"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-xl bg-[#080808] text-white text-xs font-bold hover:bg-[#1f1f1f] transition-all disabled:opacity-50"
            >
              {loading ? "Publishing..." : "Publish Review"}
            </button>
          </div>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <div className="text-center py-10 rounded-2xl bg-white border border-[#080808]/10 text-neutral-500 text-sm">
            <p>No reviews yet for this title.</p>
            <p className="text-xs text-neutral-400 mt-1">
              Be the first reader or author to drop a review!
            </p>
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl bg-white border border-[#080808]/10 p-5 sm:p-6 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  <img
                    src={r.user_avatar || "/media/avatars/default-portrait.svg"}
                    alt={r.user_name}
                    className="size-9 rounded-full object-cover border border-[#D4AF37]/40"
                  />
                  <div>
                    <p className="text-xs font-bold text-[#080808]">
                      {r.user_name}
                    </p>
                    <div className="flex items-center text-[#D4AF37] mt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`size-3 ${
                            s <= r.rating ? "fill-current" : "opacity-25"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <span className="text-[11px] text-neutral-400">
                  {new Date(r.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              {r.headline && (
                <h4 className="font-serif text-base font-bold text-[#080808] pt-1">
                  {r.headline}
                </h4>
              )}

              <p className="text-sm text-neutral-700 leading-relaxed whitespace-pre-line">
                {r.content}
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
