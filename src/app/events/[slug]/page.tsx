import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Globe,
  MapPin,
  Mic2,
  Users,
} from "lucide-react";
import { BookCard, EventCard } from "@/components/ui/Cards";
import { getEventBySlug } from "@/lib/services/platform";
import { getBookByIdInternal } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

interface EventDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  const featuredBook = event.featured_book_id
    ? getBookByIdInternal(event.featured_book_id)
    : null;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <Link
            href="/events"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#F7DF8B] hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Literary Events
          </Link>

          <div className="max-w-xl">
            <EventCard event={event} />
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="rounded-3xl bg-white border border-[#080808]/12 p-8 sm:p-10 shadow-xs space-y-6">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] font-bold text-[#AA7C11]">
              Session Program & Details
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#080808] mt-1">
              {event.title}
            </h1>
            {event.subtitle && (
              <p className="font-serif text-lg text-[#AA7C11] italic mt-1">
                {event.subtitle}
              </p>
            )}
          </div>

          <p className="text-base text-[#080808]/85 leading-relaxed whitespace-pre-line">
            {event.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-[#080808]/10 text-xs">
            <div className="p-4 rounded-2xl bg-[#FAF8F3]">
              <span className="text-[#080808]/60 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#AA7C11]" />
                Date & Timezone
              </span>
              <strong className="mt-1 block text-sm text-[#080808]">
                {new Date(event.start_at).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </strong>
              <span className="text-[#080808]/60">{event.timezone}</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3]">
              <span className="text-[#080808]/60 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#AA7C11]" />
                Venue / Stream Location
              </span>
              <strong className="mt-1 block text-sm text-[#080808]">
                {event.venue_or_link}
              </strong>
              <span className="text-[#080808]/60">
                {event.is_virtual ? "Online Virtual Salon" : "In-Person & Stream"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-[#FAF8F3]">
              <span className="text-[#080808]/60 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#AA7C11]" />
                Host & Panelists
              </span>
              <strong className="mt-1 block text-sm text-[#080808]">
                {event.host_name}
              </strong>
              {event.guest_names.length > 0 && (
                <span className="text-[#080808]/70">
                  With {event.guest_names.join(", ")}
                </span>
              )}
            </div>
          </div>
        </div>

        {featuredBook && featuredBook.status === "published" && (
          <div>
            <h2 className="font-serif text-2xl font-bold text-[#080808] mb-4">
              Featured Book for This Session
            </h2>
            <div className="max-w-md">
              <BookCard book={featuredBook} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

