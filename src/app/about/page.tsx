import React from "react";
import Link from "next/link";
import {
  BookOpen,
  ExternalLink,
  Feather,
  Headphones,
  Newspaper,
  Phone,
  ShieldCheck,
} from "lucide-react";

const SPOTIFY_URL =
  "https://open.spotify.com/user/31lygcpwpx6g66kako3vx25pa4fu?si=2rDuJW9YSeWLWsdYnLVJ_w&utm_source=copy-link";

const LEADERSHIP = [
  {
    photo: "/media/team/ceo.jpg",
    title: "Founder & Chief Executive Officer",
    focus: "Vision, Strategy & Global Broadcast",
    bio: "Founded Literary Voices Network to give authors a live global stage. Leads the network's editorial vision, broadcast syndication across eight hubs, and long-term strategy.",
  },
  {
    photo: "/media/team/director-events.jpg",
    title: "Director of Events & Partnerships",
    focus: "Live Salons, Tours & Publisher Alliances",
    bio: "Builds the network's relationships with publishers, retailers, and festivals, and produces our live author events, reading salons, and international tours.",
  },
  {
    photo: "/media/team/literary-coordinator.jpg",
    title: "Literary Programming Coordinator",
    focus: "Author Interviews & Weekly Programming",
    bio: "Curates the weekly broadcast lineup, books author interviews and readings, and spotlights emerging voices across every show on the network.",
  },
];

const PILLARS = [
  {
    icon: BookOpen,
    title: "Curated Book Directory",
    desc: "Every submitted book is verified — ISBN, edition format, cover quality, and direct bookstore links.",
  },
  {
    icon: Newspaper,
    title: "Digital Literary Magazine",
    desc: "Thematic issues of critical essays, author interviews, reviews, and publishing craft guides.",
  },
  {
    icon: Headphones,
    title: "Broadcast Studio & Salons",
    desc: "Live author conversations, readings, and reading salons — streamed worldwide and on Spotify.",
  },
  {
    icon: ShieldCheck,
    title: "Rights & Attribution",
    desc: "Authors keep 100% of their copyright. Directory listing is always separate from manuscript distribution.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#060606] text-[#FAF8F3] py-20 border-b border-[#D4AF37]/30">
        <div className="absolute right-0 top-0 size-[28rem] rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <span className="animate-hero-1 inline-flex items-center gap-2 rounded-full bg-gold-gradient px-3.5 py-1 text-[10px] uppercase tracking-[0.2em] font-bold text-[#050505]">
            <Feather className="size-3.5" />
            About Us
          </span>
          <h1 className="animate-hero-2 font-serif-display text-4xl sm:text-6xl font-bold leading-tight max-w-4xl">
            A Literary Publication &amp; Broadcast Network{" "}
            <span className="text-gold-shimmer italic font-normal">for Every Voice</span>
          </h1>
          <p className="animate-hero-3 text-base sm:text-lg text-[#FAF8F3]/80 leading-relaxed max-w-3xl">
            Literary Voices Network connects writers, editors, independent presses, and readers
            through live broadcasts, a curated book directory, and a digital magazine.
          </p>
        </div>
      </section>

      {/* Leadership */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
            Leadership Team
          </p>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#080808] mt-1">
            The People Behind the Network
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {LEADERSHIP.map((p, i) => (
            <article
              key={p.title}
              className="animate-hero-3 group rounded-3xl bg-[#080808] text-[#FAF8F3] border-2 border-[#D4AF37]/40 overflow-hidden shadow-xl hover:border-[#F7DF8B] hover:-translate-y-2 transition-all duration-300"
              style={{ animationDelay: `${0.15 + i * 0.15}s` }}
            >
              <div className="relative aspect-[4/5] overflow-hidden">
                <img
                  src={p.photo}
                  alt={p.title}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
              </div>
              <div className="p-6 -mt-10 relative">
                <span className="inline-block rounded-full bg-gold-gradient px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#050505]">
                  {p.focus}
                </span>
                <h3 className="font-serif-display text-xl font-bold mt-3 group-hover:text-[#F7DF8B] transition-colors">
                  {p.title}
                </h3>
                <p className="text-sm text-[#FAF8F3]/75 mt-2 leading-relaxed">{p.bio}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Pillars */}
      <section className="bg-[#F3EFE4] border-y border-[#D4AF37]/30 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif-display text-3xl font-bold text-[#080808] mb-10">
            Both a Publication and a Publishing Platform
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="rounded-2xl bg-white border border-[#D4AF37]/35 p-6 hover:shadow-xl hover:-translate-y-1 transition-all"
              >
                <div className="size-11 rounded-xl bg-[#080808] border border-[#D4AF37]/50 flex items-center justify-center">
                  <Icon className="size-5 text-[#D4AF37]" />
                </div>
                <h3 className="font-serif-display text-lg font-bold text-[#080808] mt-4">{title}</h3>
                <p className="text-xs text-neutral-600 mt-2 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="rounded-3xl bg-[#080808] border-2 border-[#D4AF37]/45 p-10 text-center text-[#FAF8F3]">
          <h2 className="font-serif-display text-3xl font-bold">Talk to Our Team</h2>
          <p className="text-sm text-[#FAF8F3]/70 mt-2">
            Partnerships, events, author features, or press — we&apos;d love to hear from you.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href="tel:+13678481372"
              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-xs font-bold text-[#050505] hover:brightness-110"
            >
              <Phone className="size-4" /> +1 (367) 848-1372
            </a>
            <a
              href={SPOTIFY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/50 px-6 py-3 text-xs font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/15"
            >
              <Headphones className="size-4" /> Spotify <ExternalLink className="size-3" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3 text-xs font-semibold hover:border-[#F7DF8B]"
            >
              Contact Page
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
