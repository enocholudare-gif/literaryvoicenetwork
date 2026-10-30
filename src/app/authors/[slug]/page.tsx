import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Award, BookOpen, Calendar, ExternalLink, Feather, Globe, MapPin, Mic2, Newspaper, ShieldCheck, Users } from "lucide-react";
import {
  ArticleCard,
  BookCard,
  BroadcastCard,
  EventCard,
} from "@/components/ui/Cards";
import { getAuthorProfileBySlug } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

interface AuthorProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function AuthorProfilePage({ params }: AuthorProfilePageProps) {
  const { slug } = await params;
  const data = getAuthorProfileBySlug(slug);

  if (!data) {
    notFound();
  }

  const { profile, books, articles, broadcasts, events } = data;
  const socialEntries = Object.entries(profile.social_links || {}).filter(
    ([, url]) => Boolean(url && url.trim())
  );

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Profile Hero Banner */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link
            href="/authors"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F7DF8B] hover:underline mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Author Directory
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-3 flex flex-col items-center sm:items-start">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-3xl overflow-hidden border-2 border-[#D4AF37] shadow-2xl bg-[#141414]">
                <img
                  src={profile.avatar_url || "/media/avatars/eleanor-vance.svg"}
                  alt={profile.display_name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {profile.role === "admin" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#D4AF37] text-[#080808]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    LVN Founding Editor & Author
                  </span>
                )}
                {profile.role === "editor" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-[#D4AF37]/25 text-[#F7DF8B] border border-[#D4AF37]/40">
                    <Award className="w-3.5 h-3.5" />
                    LVN Commissioning Editor
                  </span>
                )}
              </div>
            </div>

            <div className="lg:col-span-9 space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                {profile.genres.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-[#F7DF8B] border border-white/10"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div>
                <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
                  {profile.display_name}
                </h1>
                {profile.pen_name && profile.pen_name !== profile.display_name && (
                  <p className="text-xs text-[#FAF8F3]/60 mt-1">
                    Pen Name: {profile.pen_name}
                  </p>
                )}
                {profile.headline && (
                  <p className="mt-2 font-serif text-xl text-[#F7DF8B]">
                    {profile.headline}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-5 text-xs text-[#FAF8F3]/75">
                {profile.location && (
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    {profile.location}
                  </span>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[#F7DF8B] hover:underline"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    Official Author Website
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <strong>{books.length}</strong> Published{" "}
                  {books.length === 1 ? "Book" : "Books"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Newspaper className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <strong>{articles.length}</strong> Magazine{" "}
                  {articles.length === 1 ? "Publication" : "Publications"}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <strong>{profile.follower_count}</strong> Network Followers
                </span>
              </div>

              <p className="text-base text-[#FAF8F3]/90 leading-relaxed max-w-3xl whitespace-pre-line">
                {profile.bio}
              </p>

              {socialEntries.length > 0 && (
                <div className="pt-2 flex flex-wrap gap-2.5">
                  {socialEntries.map(([key, url]) => (
                    <a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-[#D4AF37] hover:text-[#080808] text-xs font-semibold text-white transition-colors capitalize"
                    >
                      <span>{key}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Author Portfolio Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        {/* Published Books */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[#080808]/10">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
                Bibliography
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808]">
                Published Books by {profile.display_name}
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#080808]/60">
              {books.length} {books.length === 1 ? "Title" : "Titles"}
            </span>
          </div>

          {books.length === 0 ? (
            <p className="text-sm text-[#080808]/60 italic">
              No book listings published under this profile yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard key={book.id} book={book} />
              ))}
            </div>
          )}
        </section>

        {/* Published Magazine Articles, Essays, Reviews & Interviews */}
        <section>
          <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[#080808]/10">
            <div>
              <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
                Journalism, Criticism & Essays
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808]">
                Articles, Interviews & Spotlights
              </h2>
            </div>
            <span className="text-xs font-semibold text-[#080808]/60">
              {articles.length} {articles.length === 1 ? "Piece" : "Pieces"}
            </span>
          </div>

          {articles.length === 0 ? (
            <p className="text-sm text-[#080808]/60 italic">
              No magazine publications under this profile yet.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </section>

        {/* Broadcast Appearances */}
        {broadcasts.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[#080808]/10">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
                  On-Air Conversations
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808]">
                  Broadcast Episodes & Studio Sessions
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {broadcasts.map((bc) => (
                <BroadcastCard key={bc.id} broadcast={bc} />
              ))}
            </div>
          </section>
        )}

        {/* Literary Events */}
        {events.length > 0 && (
          <section>
            <div className="flex items-center justify-between gap-4 mb-6 pb-3 border-b border-[#080808]/10">
              <div>
                <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
                  Salons, Launches & Readings
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808]">
                  Literary Events & Appearances
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {events.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

