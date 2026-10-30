import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Globe, Mic2, Sparkles } from "lucide-react";

const FOUNDER_FEATURES = [
  {
    id: "fs-1",
    num: "01",
    city: "Chicago & New York",
    company: "Vance & Meridian Imprints",
    founder: "Executive Founder & CEO",
    role: "Founding Publisher & CEO",
    sector: "Independent Literary Publishing & Broadcast Media",
    quote:
      "“Independent publishing thrives when editorial rigor meets the immediacy of live broadcast.”",
    story:
      "How Vance & Meridian connected forty regional presses with a 24/7 global broadcast network reaching 68 countries.",
  },
  {
    id: "fs-2",
    num: "02",
    city: "London",
    company: "Harbour & Loom Audio Studios",
    founder: "Marcus Sterling",
    role: "Managing Director",
    sector: "Spatial Audio & Literary Dramatization",
    quote:
      "“Every novel has an acoustic architecture waiting to be heard.”",
    story:
      "Inside the London studio producing binaural audiobook editions and live ensemble readings for translated literature.",
  },
  {
    id: "fs-3",
    num: "03",
    city: "Accra & Boston",
    company: "Gold Coast Archival Trust",
    founder: "Amara Osei",
    role: "Founder & Chief Archivist",
    sector: "Cultural Heritage & Digital Preservation",
    quote:
      "“When we preserve coastal ledgers and family letters, we give future novelists their primary sources.”",
    story:
      "Partnering with West African libraries and universities to digitize 18th- and 19th-century maritime correspondence.",
  },
  {
    id: "fs-4",
    num: "04",
    city: "Copenhagen",
    company: "Fjord & Folio Press",
    founder: "Søren Lindqvist",
    role: "Publisher & Master Printer",
    sector: "Artisanal Letterpress & Direct Reader Subscriptions",
    quote:
      "“Print is not retreating; it is becoming more deliberate, tactile, and collectible.”",
    story:
      "Blending Nordic sewn-binding craftsmanship with international reader club dispatches.",
  },
];

export default function FounderSpotlightPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
              <Compass className="size-3.5 text-[#D4AF37]" />
              Business &amp; Founder Spotlight
            </span>
            <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-4 max-w-3xl">
              Entrepreneurs on Companies, Challenges &amp; Innovation
            </h1>
            <p className="text-base text-[#FAF8F3]/75 max-w-2xl mt-2">
              In-depth conversations with founders, independent publishers, and
              cultural builders shaping the future of media, books, and
              creative commerce.
            </p>
          </div>
          <Link
            href="/founder-spotlight/submit"
            className="rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors shrink-0 self-start md:self-auto"
          >
            Pitch a Founder
          </Link>
        </div>
      </section>

      {/* Spotlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {FOUNDER_FEATURES.map((item) => (
            <article
              key={item.id}
              className="rounded-3xl bg-white border border-[#D4AF37]/30 p-8 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#AA7C11]">
                    {item.num} // {item.city}
                  </span>
                  <span className="rounded-full bg-[#FAF8F3] border border-[#D4AF37]/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#080808]">
                    {item.sector}
                  </span>
                </div>
                <h2 className="font-serif-display text-2xl font-bold text-[#080808] mt-4">
                  {item.company}
                </h2>
                <p className="text-xs font-semibold text-[#AA7C11] mt-1">
                  {item.founder} · {item.role}
                </p>
                <blockquote className="mt-4 border-l-2 border-[#D4AF37] pl-4 font-serif-display italic text-sm text-[#080808]">
                  {item.quote}
                </blockquote>
                <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                  {item.story}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <Link
                  href="/live"
                  className="font-bold text-[#080808] hover:text-[#AA7C11] inline-flex items-center gap-1.5"
                >
                  <Mic2 className="size-3.5 text-[#D4AF37]" />
                  Listen to Founder Interview
                </Link>
                <Link
                  href="/founder-spotlight/submit"
                  className="text-slate-500 hover:text-[#080808]"
                >
                  Apply for Spotlight →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
