import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Headphones,
  Mic2,
  Radio,
} from "lucide-react";
import { BookCard, BroadcastCard } from "@/components/ui/Cards";
import { getBroadcastBySlug, listBroadcasts } from "@/lib/services/platform";
import { getBookByIdInternal } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

interface BroadcastDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BroadcastDetailPage({
  params,
}: BroadcastDetailPageProps) {
  const { slug } = await params;
  const broadcast = getBroadcastBySlug(slug);

  if (!broadcast) {
    notFound();
  }

  const featuredBook = broadcast.featured_book_id
    ? getBookByIdInternal(broadcast.featured_book_id)
    : null;

  const otherBroadcasts = listBroadcasts().filter((b) => b.id !== broadcast.id);

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/broadcasts"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F7DF8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Broadcast Archive
          </Link>

          <BroadcastCard broadcast={broadcast} />
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <div className="rounded-3xl bg-white border border-[#080808]/12 p-8 sm:p-10 shadow-xs space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
              Episode Show Notes & Studio Summary
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mt-1">
              About This Conversation
            </h2>
          </div>

          <p className="text-base text-[#080808]/85 leading-relaxed whitespace-pre-line">
            {broadcast.description}
          </p>

          {/* Direct HTML5 Audio Element Fallback */}
          <div className="p-5 rounded-2xl bg-[#FAF8F3] border border-[#080808]/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-[#080808]">
              <span className="flex items-center gap-2">
                <Headphones className="w-4 h-4 text-[#AA7C11]" />
                Direct Studio Audio Stream ({broadcast.provider})
              </span>
              <span>{broadcast.duration_minutes} min</span>
            </div>
            <audio
              controls
              preload="metadata"
              src={broadcast.audio_file_url || "/media/audio/lvn-studio-preview.wav"}
              className="w-full mt-2"
            >
              Your browser does not support the HTML5 audio element.
            </audio>
          </div>
        </div>

        {featuredBook && featuredBook.status === "published" && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#080808] mb-4">
              Featured Book Discussed on This Episode
            </h2>
            <div className="max-w-md">
              <BookCard book={featuredBook} />
            </div>
          </div>
        )}

        {otherBroadcasts.length > 0 && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#080808] mb-6">
              More Episodes from the Archive
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {otherBroadcasts.slice(0, 2).map((bc) => (
                <BroadcastCard key={bc.id} broadcast={bc} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

