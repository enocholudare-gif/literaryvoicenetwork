import React from "react";
import Link from "next/link";
import { Calendar, Search, Sparkles } from "lucide-react";
import { EventCard } from "@/components/ui/Cards";
import { listEvents } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

interface EventsPageProps {
  searchParams: Promise<{
    q?: string;
    type?: string;
  }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const search = params.q || "";
  const eventType = params.type || "all";

  const events = listEvents({ search, eventType });

  const upcomingEvents = events.filter(
    (e) => e.status === "published" || e.status === "scheduled"
  );
  const completedEvents = events.filter((e) => e.status === "completed");

  const eventTypes = [
    { value: "all", label: "All Event Types" },
    { value: "book_club", label: "Virtual Book Clubs" },
    { value: "book_launch", label: "Book Launches" },
    { value: "interview", label: "Live Author Interviews" },
    { value: "workshop", label: "Craft Workshops" },
    { value: "panel", label: "Literary Panels" },
    { value: "reading", label: "Readings" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Masthead */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Calendar className="w-3.5 h-3.5" />
                Salons, Readings & Book Clubs
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                Literary Events & Schedule
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Register for interactive book clubs, craft workshops, author roundtables, and live readings across the Literary Voices Network.
              </p>
            </div>
            <Link
              href="/dashboard?tab=events"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              My Event Registrations
            </Link>
          </div>

          <form
            action="/events"
            method="GET"
            className="mt-8 p-4 rounded-2xl bg-[#141414] border border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-6 relative">
              <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                name="q"
                defaultValue={search}
                placeholder="Search events by title, host, or speaker..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
            <div className="sm:col-span-4">
              <select
                name="type"
                defaultValue={eventType}
                aria-label="Filter by event type"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#080808] border border-white/15 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
              >
                {eventTypes.map((et) => (
                  <option key={et.value} value={et.value}>
                    {et.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-[#D4AF37] text-[#080808] font-bold text-xs hover:bg-[#F7DF8B] transition-colors"
              >
                Filter
              </button>
            </div>
          </form>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
        <section>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mb-6">
            Upcoming Literary Gatherings
          </h2>
          {upcomingEvents.length === 0 ? (
            <div className="rounded-2xl bg-white border border-[#080808]/10 p-10 text-center">
              <p className="text-sm text-[#080808]/70">
                No upcoming events match your current filter.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          )}
        </section>

        {completedEvents.length > 0 && (
          <section>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#080808] mb-6">
              Completed Events & Archival Recordings
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {completedEvents.map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

