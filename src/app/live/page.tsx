import React from "react";
import Link from "next/link";
import { ArrowRight, Clock, ExternalLink, Headphones, Mic2, Radio } from "lucide-react";
import { BroadcastCard, EventCard } from "@/components/ui/Cards";
import { listBroadcasts, listEvents } from "@/lib/services/platform";

export const dynamic = "force-dynamic";

const SPOTIFY_URL =
  "https://open.spotify.com/user/31lygcpwpx6g66kako3vx25pa4fu?si=2rDuJW9YSeWLWsdYnLVJ_w&utm_source=copy-link";

export default function LiveBroadcastPage() {
  const broadcasts = listBroadcasts();
  const events = listEvents();

  // Only show a live state when a real live stream URL is configured and active
  const activeLiveBroadcast = broadcasts.find((b) => b.is_live && Boolean(b.live_stream_url));
  const scheduledBroadcasts = broadcasts.filter((b) => b.status === "scheduled");
  const archivedBroadcasts = broadcasts.filter((b) => b.status === "archived");
  const upcomingEvents = events.filter(
    (e) => e.status === "published" || e.status === "scheduled"
  );
  const next = scheduledBroadcasts[0];

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#060606] text-[#FAF8F3] py-20 border-b border-[#D4AF37]/30">
        <div className="absolute -right-20 -top-20 size-[26rem] rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <span className="animate-hero-1 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-[#050505]">
            <Radio className="size-3.5" /> Live Radio
          </span>
          <h1 className="animate-hero-2 font-serif-display text-4xl sm:text-6xl font-bold">
            Tune In to <span className="text-gold-shimmer italic font-normal">the Studio</span>
          </h1>
          <p className="animate-hero-3 text-base sm:text-lg text-[#FAF8F3]/75 max-w-2xl mx-auto">
            Live author conversations, scheduled shows, and on-demand replays.
          </p>
          <div className="animate-hero-4 flex flex-wrap justify-center gap-3 pt-2">
            <a
              href={SPOTIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-xs font-bold text-[#050505] hover:brightness-110"
            >
              <Headphones className="size-4" /> Listen on Spotify <ExternalLink className="size-3" />
            </a>
            <Link
              href="/broadcasts"
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 px-6 py-3 text-xs font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/15"
            >
              Full Archive
            </Link>
            <Link
              href="/for-authors"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs font-semibold hover:border-[#F7DF8B]"
            >
              <Mic2 className="size-4" /> Be a Guest
            </Link>
          </div>
        </div>

        {/* Status card */}
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          {activeLiveBroadcast ? (
            <BroadcastCard broadcast={activeLiveBroadcast} />
          ) : (
            <div className="animate-hero-5 rounded-3xl bg-[#121212] border-2 border-[#D4AF37]/40 p-6 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/40 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7DF8B]">
                  <Clock className="size-3" /> Off Air Right Now
                </span>
                <h2 className="font-serif-display text-2xl font-bold">Next show coming up</h2>
                <p className="text-sm text-[#FAF8F3]/70">
                  Catch a replay below while you wait.
                </p>
              </div>
              {next && (
                <div className="rounded-2xl bg-[#080808] border border-white/10 p-5 space-y-2">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4AF37]">
                    {new Date(next.scheduled_start).toLocaleString("en-US", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                  <h3 className="font-serif-display text-lg font-bold leading-snug">{next.title}</h3>
                  <p className="text-xs text-[#FAF8F3]/65">Host: {next.host_name}</p>
                  <Link
                    href={`/broadcasts/${next.slug}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#F7DF8B] hover:underline"
                  >
                    Details <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
        {scheduledBroadcasts.length > 0 && (
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">Schedule</p>
            <h2 className="font-serif-display text-3xl font-bold text-[#080808] mt-1 mb-8">
              Upcoming Broadcasts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {scheduledBroadcasts.map((bc) => (
                <BroadcastCard key={bc.id} broadcast={bc} />
              ))}
            </div>
          </section>
        )}

        {archivedBroadcasts.length > 0 && (
          <section>
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">On Demand</p>
                <h2 className="font-serif-display text-3xl font-bold text-[#080808] mt-1">
                  Replays
                </h2>
              </div>
              <Link
                href="/broadcasts"
                className="text-xs font-bold text-[#AA7C11] hover:underline inline-flex items-center gap-1"
              >
                View All <ArrowRight className="size-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {archivedBroadcasts.map((bc) => (
                <BroadcastCard key={bc.id} broadcast={bc} />
              ))}
            </div>
          </section>
        )}

        {upcomingEvents.length > 0 && (
          <section>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">Events</p>
            <h2 className="font-serif-display text-3xl font-bold text-[#080808] mt-1 mb-8">
              Live Readings &amp; Salons
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {upcomingEvents.slice(0, 3).map((evt) => (
                <EventCard key={evt.id} event={evt} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
