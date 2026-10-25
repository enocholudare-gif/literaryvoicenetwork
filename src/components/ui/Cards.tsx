"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  Calendar,
  Clock,
  ExternalLink,
  Heart,
  MapPin,
  Mic2,
  Play,
  Sparkles,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useAudioPlayer } from "../layout/AudioPlayerContext";
import type {
  Article,
  Book,
  Broadcast,
  LiteraryEvent,
  Profile,
} from "@/lib/db/types";

const FALLBACK_BOOK_COVER = "/media/covers/the-glass-meridian.jpg";
const FALLBACK_AVATAR = "/media/avatars/default-portrait.svg";

export function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    published: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    approved: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    accepted: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    open_for_submissions:
      "bg-amber-950/80 text-amber-300 border-amber-500/40",
    live: "bg-red-950/80 text-red-300 border-red-500/40",
    scheduled: "bg-amber-950/80 text-amber-300 border-amber-500/40",
    in_review: "bg-blue-950/80 text-blue-300 border-blue-500/40",
    submitted: "bg-indigo-950/80 text-indigo-300 border-indigo-500/40",
    revision_requested:
      "bg-orange-950/80 text-orange-300 border-orange-500/40",
    rejected: "bg-rose-950/80 text-rose-300 border-rose-500/40",
    declined: "bg-rose-950/80 text-rose-300 border-rose-500/40",
    draft: "bg-slate-800 text-slate-300 border-slate-600/40",
  };

  const badgeClass =
    styles[status] || "bg-slate-800 text-slate-200 border-slate-600/40";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function BookCard({
  book,
  initialFavourited = false,
}: {
  book: Book;
  initialFavourited?: boolean;
}) {
  const [favourited, setFavourited] = useState(initialFavourited);
  const [imgSrc, setImgSrc] = useState(
    book.cover_url || FALLBACK_BOOK_COVER
  );

  const handleToggleFav = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle-favourite",
        entityType: "book",
        entityId: book.id,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setFavourited(data.favourited);
    }
  };

  const retailers = book.retailer_links || {};
  const primaryBuyUrl =
    retailers.bookshop ||
    retailers.amazon ||
    retailers.publisherDirect ||
    "";

  return (
    <article className="group bg-white rounded-2xl border border-[#D4AF37]/25 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="relative aspect-[2/3] bg-[#080808] overflow-hidden">
        <Link href={`/books/${book.slug}`} className="block w-full h-full">
          <img
            src={imgSrc}
            alt={`Cover of ${book.title} by ${book.author_name || "LVN Author"}`}
            onLoad={(e) => {
              if ((e.currentTarget as HTMLImageElement).naturalWidth <= 1 && imgSrc !== FALLBACK_BOOK_COVER) {
                setImgSrc(FALLBACK_BOOK_COVER);
              }
            }}
            onError={() => setImgSrc(FALLBACK_BOOK_COVER)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="rounded-full bg-[#080808]/90 backdrop-blur-sm border border-[#D4AF37]/40 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#F7DF8B]">
            {book.genre}
          </span>
          {book.is_featured && (
            <span className="rounded-full bg-[#D4AF37] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#080808]">
              Featured
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={handleToggleFav}
          aria-label={
            favourited ? "Remove from reading list" : "Save to reading list"
          }
          className={`absolute top-3 right-3 size-8 rounded-full grid place-items-center backdrop-blur-md border transition-colors ${
            favourited
              ? "bg-[#D4AF37] border-[#D4AF37] text-[#080808]"
              : "bg-[#080808]/70 border-white/20 text-white hover:border-[#D4AF37]"
          }`}
        >
          <Heart className={`size-4 ${favourited ? "fill-current" : ""}`} />
        </button>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <p className="text-xs font-medium text-[#AA7C11] uppercase tracking-wider">
            By{" "}
            {book.author_slug ? (
              <Link
                href={`/authors/${book.author_slug}`}
                className="hover:underline font-semibold"
              >
                {book.author_name}
              </Link>
            ) : (
              <span>{book.author_name || "LVN Author"}</span>
            )}
          </p>
          <Link href={`/books/${book.slug}`} className="block mt-1">
            <h3 className="font-serif-display text-lg font-bold text-[#080808] group-hover:text-[#AA7C11] transition-colors line-clamp-2">
              {book.title}
            </h3>
          </Link>
          {book.subtitle && (
            <p className="text-xs italic text-slate-600 mt-0.5 line-clamp-1">
              {book.subtitle}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
            {book.description}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
          <Link
            href={`/books/${book.slug}`}
            className="font-semibold text-[#080808] hover:text-[#AA7C11] inline-flex items-center gap-1"
          >
            <BookOpen className="size-3.5 text-[#D4AF37]" />
            <span>Read Excerpt</span>
          </Link>
          {primaryBuyUrl && (
            <a
              href={primaryBuyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#080808] px-3 py-1 text-[11px] font-medium text-[#FAF8F3] hover:bg-[#D4AF37] hover:text-[#080808] transition-colors"
            >
              <span>Acquire</span>
              <ExternalLink className="size-3" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function ArticleCard({ article }: { article: Article }) {
  const [imgSrc, setImgSrc] = useState(
    article.cover_url || FALLBACK_BOOK_COVER
  );

  const typeBadgeMap: Record<string, string> = {
    essay: "Essay & Criticism",
    interview: "Author Interview",
    review: "Book Review",
    commentary: "Editorial Column",
    press_release: "Press Release",
    announcement: "Literary News",
  };

  return (
    <article className="group bg-white rounded-2xl border border-[#D4AF37]/20 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <Link
        href={`/magazine/${article.slug}`}
        className="relative aspect-[16/10] bg-[#080808] overflow-hidden block"
      >
        <img
          src={imgSrc}
          alt={article.title}
          onError={() => setImgSrc(FALLBACK_BOOK_COVER)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/85 via-transparent to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] text-[#FAF8F3]">
          <span className="rounded-full bg-[#D4AF37] px-2.5 py-0.5 font-bold uppercase tracking-wider text-[#080808] text-[10px]">
            {article.category_name ||
              typeBadgeMap[article.article_type] ||
              "Feature"}
          </span>
          <span className="inline-flex items-center gap-1 text-white/85">
            <Clock className="size-3 text-[#D4AF37]" />
            {article.reading_time_minutes} min read
          </span>
        </div>
      </Link>

      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          {article.issue_title && (
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AA7C11] mb-1">
              {article.issue_title}
            </p>
          )}
          <Link href={`/magazine/${article.slug}`}>
            <h3 className="font-serif-display text-xl font-bold text-[#080808] group-hover:text-[#AA7C11] transition-colors leading-snug line-clamp-2">
              {article.title}
            </h3>
          </Link>
          {article.subtitle && (
            <p className="text-xs italic text-slate-600 mt-1 line-clamp-1">
              {article.subtitle}
            </p>
          )}
          <p className="text-xs text-slate-600 mt-2.5 line-clamp-3 leading-relaxed">
            {article.excerpt}
          </p>
        </div>

        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            By{" "}
            {article.author_slug ? (
              <Link
                href={`/authors/${article.author_slug}`}
                className="font-semibold text-[#080808] hover:text-[#AA7C11]"
              >
                {article.author_name}
              </Link>
            ) : (
              <span className="font-semibold text-[#080808]">
                {article.author_name}
              </span>
            )}
          </div>
          {article.published_at && (
            <time dateTime={article.published_at}>
              {new Date(article.published_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
          )}
        </div>
      </div>
    </article>
  );
}

type AuthorProfileWithCounts = Profile & {
  book_count?: number;
  article_count?: number;
  follower_count?: number;
};

export function AuthorCard({
  profile,
  author,
  initialFollowing = false,
}: {
  profile?: AuthorProfileWithCounts;
  author?: AuthorProfileWithCounts;
  initialFollowing?: boolean;
}) {
  const item = (profile || author)!;
  const [following, setFollowing] = useState(initialFollowing);
  const [avatarSrc, setAvatarSrc] = useState(
    item.avatar_url || FALLBACK_AVATAR
  );

  const handleFollow = async (e: React.MouseEvent) => {
    e.preventDefault();
    const res = await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "toggle-follow",
        targetType: "author",
        targetId: item.id,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setFollowing(data.following);
    }
  };

  const genres = Array.isArray(item.genres) ? item.genres : [];

  return (
    <article className="bg-white rounded-2xl border border-[#D4AF37]/25 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-4">
          <Link
            href={`/authors/${item.slug}`}
            className="flex items-center gap-3.5 group"
          >
            <img
              src={avatarSrc}
              alt={item.display_name}
              onError={() => setAvatarSrc(FALLBACK_AVATAR)}
              className="size-16 rounded-full object-cover border-2 border-[#D4AF37]"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif-display text-lg font-bold text-[#080808] group-hover:text-[#AA7C11] transition-colors">
                  {item.display_name}
                </h3>
                {item.slug === "eleanor-vance" && (
                  <span
                    title="LVN Founding Publisher & Public Author"
                    className="inline-flex items-center rounded-full bg-[#080808] px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#F7DF8B]"
                  >
                    Publisher
                  </span>
                )}
              </div>
              {item.location && (
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <MapPin className="size-3 text-[#D4AF37]" />
                  {item.location}
                </p>
              )}
            </div>
          </Link>

          <button
            type="button"
            onClick={handleFollow}
            className={`rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1 border transition-colors ${
              following
                ? "bg-[#080808] text-[#F7DF8B] border-[#080808]"
                : "border-[#D4AF37]/50 text-[#080808] hover:bg-[#D4AF37]/15"
            }`}
          >
            {following ? (
              <>
                <UserCheck className="size-3.5" />
                <span>Following</span>
              </>
            ) : (
              <>
                <UserPlus className="size-3.5" />
                <span>Follow</span>
              </>
            )}
          </button>
        </div>

        <p className="text-xs font-semibold text-[#AA7C11] mt-4">
          {item.headline}
        </p>
        <p className="text-xs text-slate-600 mt-2 line-clamp-3 leading-relaxed">
          {item.bio}
        </p>

        {genres.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {genres.slice(0, 3).map((g) => (
              <span
                key={g}
                className="rounded-full bg-[#FAF8F3] border border-[#D4AF37]/30 px-2.5 py-0.5 text-[10px] font-medium text-[#080808]"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span>
            <strong className="text-[#080808]">{item.book_count ?? 0}</strong>{" "}
            Books
          </span>
          <span>
            <strong className="text-[#080808]">
              {item.article_count ?? 0}
            </strong>{" "}
            Articles
          </span>
        </div>
        <Link
          href={`/authors/${item.slug}`}
          className="font-semibold text-[#080808] hover:text-[#AA7C11]"
        >
          View Profile →
        </Link>
      </div>
    </article>
  );
}

export function BroadcastCard({
  episode,
  broadcast,
}: {
  episode?: Broadcast;
  broadcast?: Broadcast;
}) {
  const item = (episode || broadcast)!;
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const active = isPlaying && currentTrack?.id === item.id;

  const handlePlay = () => {
    playTrack({
      id: item.id,
      title: item.title,
      programmeName: item.programme_name,
      hostName: item.host_name,
      guestName: item.guest_name,
      audioUrl: item.audio_file_url || "/media/audio/lvn-studio-preview.wav",
      slug: item.slug,
      isLiveStream: item.is_live,
    });
  };

  return (
    <article className="bg-[#080808] text-[#FAF8F3] rounded-2xl border border-[#D4AF37]/30 p-6 shadow-md hover:border-[#D4AF37]/60 transition-all flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#F7DF8B]">
            <Mic2 className="size-3 text-[#D4AF37]" />
            {item.programme_name}
          </span>
          <span className="text-white/60 text-[11px]">
            {item.episode_number ? `Ep. ${item.episode_number} · ` : ""}
            {item.duration_minutes || 45} mins
          </span>
        </div>

        <Link href={`/broadcasts/${item.slug}`} className="block mt-3">
          <h3 className="font-serif-display text-xl font-bold text-[#FAF8F3] hover:text-[#F7DF8B] transition-colors leading-snug">
            {item.title}
          </h3>
        </Link>
        <p className="text-xs text-[#D4AF37] mt-1">
          Hosted by {item.host_name} · Guest: {item.guest_name}
        </p>
        <p className="text-xs text-white/75 mt-3 line-clamp-3 leading-relaxed">
          {item.description}
        </p>
      </div>

      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={handlePlay}
          className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-4 py-2 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors cursor-pointer"
        >
          <Play className="size-3.5 fill-current" />
          <span>{active ? "Playing in Studio…" : "Listen in Studio"}</span>
        </button>
        <Link
          href={`/broadcasts/${item.slug}`}
          className="text-xs font-medium text-[#F7DF8B] hover:underline"
        >
          Transcript &amp; Notes →
        </Link>
      </div>
    </article>
  );
}

export function EventCard({ event }: { event: LiteraryEvent }) {
  return (
    <article className="bg-white rounded-2xl border border-[#D4AF37]/25 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-full bg-[#080808] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#F7DF8B]">
            {event.event_type.replace("_", " ")}
          </span>
          <span className="text-xs font-semibold text-[#AA7C11] inline-flex items-center gap-1">
            <Calendar className="size-3.5" />
            {new Date(event.start_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>

        <Link href={`/events/${event.slug}`} className="block mt-3">
          <h3 className="font-serif-display text-xl font-bold text-[#080808] hover:text-[#AA7C11] transition-colors">
            {event.title}
          </h3>
        </Link>
        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
          <MapPin className="size-3.5 text-[#D4AF37]" />
          {event.venue_or_link} · Hosted by {event.host_name}
        </p>
        <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-500 inline-flex items-center gap-1">
          <Sparkles className="size-3.5 text-[#D4AF37]" />
          {event.registration_count ?? 0} Registered
        </span>
        <Link
          href={`/events/${event.slug}`}
          className="rounded-full bg-[#080808] px-4 py-1.5 font-semibold text-[#FAF8F3] hover:bg-[#D4AF37] hover:text-[#080808] transition-colors"
        >
          RSVP &amp; Details
        </Link>
      </div>
    </article>
  );
}
