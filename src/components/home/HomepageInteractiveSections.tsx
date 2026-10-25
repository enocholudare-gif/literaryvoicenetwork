"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpen,
  Calendar,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Compass,
  ExternalLink,
  Feather,
  Globe,
  Headphones,
  MapPin,
  Mic2,
  Pause,
  Play,
  Radio,
  RefreshCw,
  RotateCw,
  Search,
  Sparkles,
  Star,
  Users,
  Video,
  X,
} from "lucide-react";
import { useAudioPlayer } from "../layout/AudioPlayerContext";
import type { Article, Book, Broadcast } from "@/lib/db/types";

const INTRO_VIDEO_URL = "/media/hero-video.mp4";
const COMPRESSED_LOOP_VIDEO_URL = "/media/lvn-hero-loop.mp4";
const SPOTIFY_URL =
  "https://open.spotify.com/user/31lygcpwpx6g66kako3vx25pa4fu?si=2rDuJW9YSeWLWsdYnLVJ_w&utm_source=copy-link";

export interface TrendingNetworkBook {
  id: string;
  rank: number;
  title: string;
  author: string;
  slug?: string;
  coverUrl: string;
  fallbackCover: string;
  rating: number;
  publisher: string;
  year: number;
  pages: number;
  genres: string[];
  description: string;
  links: {
    amazon: string;
    goodreads: string;
    spotify: string;
    audible: string;
    bookshop: string;
  };
}

const TRENDING_BOOKS_POOL: TrendingNetworkBook[] = [
  {
    id: "tb-1",
    rank: 1,
    title: "The Glass Meridian",
    author: "Eleanor Vance",
    slug: "the-glass-meridian",
    coverUrl: "/media/covers/the-glass-meridian.svg",
    fallbackCover: "/media/covers/the-glass-meridian.svg",
    rating: 4.9,
    publisher: "Meridian House Press",
    year: 2026,
    pages: 368,
    genres: ["Literary Fiction", "Historical", "Cartography"],
    description:
      "Set between an observatory in 1920s Edinburgh and a maritime archive in Bergen, two women separated by a century reconstruct a missing hydrographic atlas.",
    links: {
      amazon: "https://www.amazon.com/s?k=The+Glass+Meridian",
      goodreads: "https://www.goodreads.com/search?q=The+Glass+Meridian",
      spotify: SPOTIFY_URL,
      audible: "https://www.audible.com/search?keywords=The+Glass+Meridian",
      bookshop: "https://bookshop.org/search?keywords=The+Glass+Meridian",
    },
  },
  {
    id: "tb-2",
    rank: 2,
    title: "The Saltwater Ledger",
    author: "Amara Osei",
    slug: "the-saltwater-ledger",
    coverUrl: "/media/covers/the-saltwater-ledger.svg",
    fallbackCover: "/media/covers/the-saltwater-ledger.svg",
    rating: 4.9,
    publisher: "Harbour & Loom",
    year: 2026,
    pages: 412,
    genres: ["Historical Fiction", "Literary", "Diaspora"],
    description:
      "Three generations of women along the Gold Coast preserve a century-old maritime ledger that becomes the foundation for a clandestine literary movement.",
    links: {
      amazon: "https://www.amazon.com/s?k=The+Saltwater+Ledger",
      goodreads: "https://www.goodreads.com/search?q=The+Saltwater+Ledger",
      spotify: SPOTIFY_URL,
      audible: "https://www.audible.com/search?keywords=The+Saltwater+Ledger",
      bookshop: "https://bookshop.org/search?keywords=The+Saltwater+Ledger",
    },
  },
  {
    id: "tb-3",
    rank: 3,
    title: "Atlas of Quiet Cities",
    author: "Julian Thorne",
    slug: "atlas-of-quiet-cities",
    coverUrl: "/media/covers/atlas-of-quiet-cities.svg",
    fallbackCover: "/media/covers/atlas-of-quiet-cities.svg",
    rating: 4.8,
    publisher: "Northlight Editions",
    year: 2026,
    pages: 328,
    genres: ["Speculative Fiction", "Literary", "Architecture"],
    description:
      "An archivist catalogues acoustic sanctuaries and forgotten reading rooms across twelve winter capitals.",
    links: {
      amazon: "https://www.amazon.com/s?k=Atlas+of+Quiet+Cities",
      goodreads: "https://www.goodreads.com/search?q=Atlas+of+Quiet+Cities",
      spotify: SPOTIFY_URL,
      audible: "https://www.audible.com/search?keywords=Atlas+of+Quiet+Cities",
      bookshop: "https://bookshop.org/search?keywords=Atlas+of+Quiet+Cities",
    },
  },
  {
    id: "tb-4",
    rank: 4,
    title: "Winter Harmonics",
    author: "Claire Moreau",
    slug: "winter-harmonics",
    coverUrl: "/media/covers/winter-harmonics.svg",
    fallbackCover: "/media/covers/winter-harmonics.svg",
    rating: 4.8,
    publisher: "Atelier Boréal",
    year: 2026,
    pages: 196,
    genres: ["Poetry", "Translation", "Lyric Essay"],
    description:
      "Bilingual lyric sequences exploring Alpine glaciers, chamber music, and the acoustics of snow.",
    links: {
      amazon: "https://www.amazon.com/s?k=Winter+Harmonics",
      goodreads: "https://www.goodreads.com/search?q=Winter+Harmonics",
      spotify: SPOTIFY_URL,
      audible: "https://www.audible.com/search?keywords=Winter+Harmonics",
      bookshop: "https://bookshop.org/search?keywords=Winter+Harmonics",
    },
  },
  {
    id: "tb-5",
    rank: 5,
    title: "The Republic of Typesetters",
    author: "Søren Lindqvist",
    slug: "the-republic-of-typesetters",
    coverUrl: "/media/covers/republic-of-typesetters.svg",
    fallbackCover: "/media/covers/republic-of-typesetters.svg",
    rating: 4.9,
    publisher: "Fjord & Folio Press",
    year: 2026,
    pages: 448,
    genres: ["Non-Fiction", "History", "Publishing"],
    description:
      "How nineteenth-century Nordic printshops and cellar presses shaped modern European letters.",
    links: {
      amazon: "https://www.amazon.com/s?k=Republic+of+Typesetters",
      goodreads: "https://www.goodreads.com/search?q=Republic+of+Typesetters",
      spotify: SPOTIFY_URL,
      audible: "https://www.audible.com/search?keywords=Republic+of+Typesetters",
      bookshop: "https://bookshop.org/search?keywords=Republic+of+Typesetters",
    },
  },
  {
    id: "tb-6",
    rank: 6,
    title: "The Architecture of Memory",
    author: "LVN Literary Quarterly",
    slug: "the-glass-meridian",
    coverUrl: "/media/covers/issue-14.svg",
    fallbackCover: "/media/covers/issue-14.svg",
    rating: 4.9,
    publisher: "Grove Press",
    year: 2025,
    pages: 724,
    genres: ["Literary Fiction", "Family Saga", "Historical"],
    description:
      "Spanning 1900 to 1977 in Kerala, a magisterial epic of medicine, faith, and generational devotion.",
    links: {
      amazon: "https://www.amazon.com/s?k=The+Covenant+of+Water",
      goodreads: "https://www.goodreads.com/search?q=The+Covenant+of+Water",
      spotify: SPOTIFY_URL,
      audible: "https://www.audible.com/search?keywords=The+Covenant+of+Water",
      bookshop: "https://bookshop.org/search?keywords=The+Covenant+of+Water",
    },
  },
];

const GLOBAL_HUBS = [
  {
    id: "nyc",
    city: "New York",
    country: "United States",
    region: "North America",
    flagship: "The Meridian Conversation",
    listeners: "410+ weekly",
    coords: { x: 27, y: 36 },
  },
  {
    id: "chi",
    city: "Chicago",
    country: "United States",
    region: "North America",
    flagship: "First Drafts & Frequencies",
    listeners: "240+ weekly",
    coords: { x: 23, y: 38 },
  },
  {
    id: "lon",
    city: "London",
    country: "United Kingdom",
    region: "Europe",
    flagship: "First Editions Live",
    listeners: "380+ weekly",
    coords: { x: 48, y: 29 },
  },
  {
    id: "nai",
    city: "Nairobi",
    country: "Kenya",
    region: "East Africa",
    flagship: "Continental Voices",
    listeners: "190+ weekly",
    coords: { x: 58, y: 58 },
  },
  {
    id: "mum",
    city: "Mumbai",
    country: "India",
    region: "South Asia",
    flagship: "Monsoon Letters",
    listeners: "225+ weekly",
    coords: { x: 69, y: 47 },
  },
  {
    id: "sin",
    city: "Singapore",
    country: "Singapore",
    region: "Southeast Asia",
    flagship: "Pacific Folio",
    listeners: "175+ weekly",
    coords: { x: 77, y: 56 },
  },
  {
    id: "sao",
    city: "São Paulo",
    country: "Brazil",
    region: "South America",
    flagship: "Southern Cross Readings",
    listeners: "160+ weekly",
    coords: { x: 34, y: 71 },
  },
  {
    id: "syd",
    city: "Sydney",
    country: "Australia",
    region: "Oceania",
    flagship: "Harbour & Ink",
    listeners: "210+ weekly",
    coords: { x: 86, y: 76 },
  },
];

const HOSTS_DATA = [
  {
    id: "host-1",
    name: "Executive Founder & CEO",
    role: "Founder, Chief Executive Officer & Lead Anchor",
    show: "The Meridian Conversation",
    slug: "eleanor-vance",
    photo: "/media/team/ceo.jpg",
    avatar: "/media/avatars/eleanor-vance.svg",
    delay: "0ms",
    bio: "Visionary founder leading Literary Voices Network's global broadcast syndication, author discovery, and flagship studio dialogues.",
  },
  {
    id: "host-2",
    name: "Director of Events & Partnerships",
    role: "Director of Events, Tours & Global Partnerships",
    show: "First Editions Live",
    slug: "marcus-sterling",
    photo: "/media/team/director-events.jpg",
    avatar: "/media/avatars/marcus-sterling.svg",
    delay: "250ms",
    bio: "Architects international literary salons, publisher alliances, and live author tours across eight broadcast hubs.",
  },
  {
    id: "host-3",
    name: "Literary Programming Coordinator",
    role: "Literary Programming Coordinator & Studio Host",
    show: "Atlantic Archives & Voices",
    slug: "amara-osei",
    photo: "/media/team/literary-coordinator.jpg",
    avatar: "/media/avatars/amara-osei.svg",
    delay: "500ms",
    bio: "Curates weekly author interviews, reading room serializations, and emerging voice spotlights across the network.",
  },
  {
    id: "host-4",
    name: "Director of Digital Media & Technology",
    role: "Digital Platform, Streaming & Innovation Lead",
    show: "LVN Digital & Podcast Studio",
    slug: "",
    photo: "/media/team/digital.jpg",
    avatar: "/media/team/digital.jpg",
    delay: "750ms",
    bio: "Leads the LVN digital infrastructure — streaming platforms, audiobook distribution, digital magazine, and emerging technology integrations.",
  },
];

const UPCOMING_BROADCASTS = [
  {
    id: "up-1",
    dateBadge: "Fri, Nov 6 · 7:00 PM EST",
    show: "The Meridian Conversation",
    title: "The Architecture of Memory: Live with Amara Osei & Eleanor Vance",
    host: "Eleanor Vance",
    guest: "Amara Osei",
    videoUrl: COMPRESSED_LOOP_VIDEO_URL,
    delay: "0s",
    description:
      "An evening broadcast exploring how coastal archives, family ledgers, and oral memory shape contemporary historical fiction.",
  },
  {
    id: "up-2",
    dateBadge: "Tue, Nov 10 · 6:00 PM EST",
    show: "First Editions Live",
    title: "Translating the North: Claire Moreau & Søren Lindqvist in Dialogue",
    host: "Marcus Sterling",
    guest: "Claire Moreau & Søren Lindqvist",
    videoUrl: INTRO_VIDEO_URL,
    delay: "0.7s",
    description:
      "How bilingual poetics and independent Nordic print culture challenge monolingual publishing.",
  },
  {
    id: "up-3",
    dateBadge: "Thu, Nov 19 · 8:00 PM EST",
    show: "In the Hot Seat",
    title: "Speculative Cartographies & Silent Cities with Julian Thorne",
    host: "Eleanor Vance",
    guest: "Julian Thorne",
    videoUrl: COMPRESSED_LOOP_VIDEO_URL,
    delay: "1.4s",
    description:
      "Live audience Q&A and studio reading from 'Atlas of Quiet Cities'.",
  },
];

const PAST_BROADCASTS = [
  {
    id: "past-1",
    dateBadge: "Oct 18, 2026 · 58 Mins",
    show: "The Meridian Conversation · Ep. 43",
    title: "Why Rag Paper Outlasts Digital Memory",
    quote:
      "“To read an old sea chart is to read a record of vanished anxieties and enduring craft.”",
    host: "Eleanor Vance",
    guest: "Søren Lindqvist",
    slug: "the-meridian-conversation-ep-43-soren-lindqvist",
    banner:
      "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "past-2",
    dateBadge: "Oct 11, 2026 · 52 Mins",
    show: "The Meridian Conversation · Ep. 42",
    title: "Maritime Archives & Polyphonic Fiction with Amara Osei",
    quote:
      "“Every enduring literary movement began in a room small enough for everyone to hear the pages turn.”",
    host: "Eleanor Vance",
    guest: "Amara Osei",
    slug: "the-meridian-conversation-ep-42-amara-osei",
    banner:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "past-3",
    dateBadge: "Oct 4, 2026 · 47 Mins",
    show: "First Editions Live · Ep. 18",
    title: "Acoustic Sanctuaries & Forgotten Reading Rooms",
    quote:
      "“Translation is the closest form of reading we possess—an act of hospitality between tongues.”",
    host: "Marcus Sterling",
    guest: "Julian Thorne",
    slug: "first-editions-live-ep-18-julian-thorne",
    banner:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=1200&q=80",
  },
];

const GENRE_PILLS = [
  "All",
  "Literary Fiction",
  "Historical Fiction",
  "Speculative Fiction",
  "Poetry",
  "Essays & Criticism",
  "Non-Fiction",
];

const PARTNERS_LIST = [
  { name: "Spotify", tag: "Official Network Feed", url: SPOTIFY_URL },
  { name: "Amazon Books", tag: "Global Retail", url: "https://www.amazon.com" },
  { name: "Audible", tag: "Audiobooks", url: "https://www.audible.com" },
  { name: "Barnes & Noble", tag: "Bookseller", url: "https://www.barnesandnoble.com" },
  { name: "Bookshop.org", tag: "Indie Bookstores", url: "https://bookshop.org" },
  { name: "Apple Books", tag: "Digital Editions", url: "https://www.apple.com/apple-books/" },
  { name: "Google Books", tag: "Index & Preview", url: "https://books.google.com" },
  { name: "Rakuten Kobo", tag: "eReading", url: "https://www.kobo.com" },
  { name: "Goodreads", tag: "Reader Community", url: "https://www.goodreads.com" },
  { name: "Penguin Random House", tag: "Publishing House", url: "https://www.penguinrandomhouse.com" },
];

/* -------------------------------------------------------------------------- */
/* 1. DISMISSIBLE AUTHOR PROMOTION BANNER                                     */
/* -------------------------------------------------------------------------- */
export function AuthorPromoBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <section
      aria-label="Limited Author Promotion"
      className="bg-gradient-to-r from-[#060606] via-[#141109] to-[#060606] text-[#FAF8F3] border-b border-[#D4AF37]/35"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[#050505] shrink-0">
            <Sparkles className="size-3" />
            Limited Author Promotion
          </span>
          <p className="text-xs sm:text-sm font-medium text-[#FAF8F3]/90">
            <strong className="text-[#F7DF8B]">
              10% off for every author who broadcasts this season
            </strong>{" "}
            — Full on-air interview, global podcast syndication &amp; verified
            reader analytics.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <Link
            href="/for-authors"
            className="rounded-full bg-gold-gradient px-4 py-1.5 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
          >
            Claim 10% Off
          </Link>
          <Link
            href="/contact"
            className="rounded-full border border-[#D4AF37]/40 px-3.5 py-1.5 text-xs font-semibold text-[#FAF8F3]/85 hover:border-[#F7DF8B] hover:text-[#F7DF8B] transition-colors"
          >
            Ask the Team
          </Link>
          <button
            type="button"
            onClick={() => setDismissed(true)}
            aria-label="Dismiss promotion banner"
            className="p-1 text-white/50 hover:text-white transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 2. STEP INSIDE THE BROADCAST (INTRO VIDEO SHOWCASE)                        */
/* -------------------------------------------------------------------------- */
export function StepInsideBroadcastSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
            Welcome to LVN
          </p>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#080808] leading-tight">
            Step Inside the Broadcast
          </h2>
          <p className="text-sm sm:text-base text-neutral-600 leading-relaxed">
            Take a short look at who we are — the voices, the books, and the
            conversations that bring readers and authors together across the
            world.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <Link
              href="/live"
              className="inline-flex items-center gap-2 rounded-full bg-[#080808] px-5 py-2.5 text-xs font-bold text-[#F7DF8B] border border-[#D4AF37]/40 hover:bg-gold-gradient hover:text-[#050505] transition-all"
            >
              <Radio className="size-3.5 text-[#D4AF37]" />
              Enter Live Radio
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 rounded-full border border-[#080808]/25 px-5 py-2.5 text-xs font-semibold text-[#080808] hover:border-[#D4AF37] transition-colors"
            >
              Our Leadership &amp; Story <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative rounded-3xl overflow-hidden bg-[#050505] border-2 border-[#D4AF37]/45 shadow-[0_20px_50px_rgba(0,0,0,0.3)] aspect-video">
            <video
              controls
              playsInline
              preload="metadata"
              poster="/media/lvn-hero-poster.svg"
              src={INTRO_VIDEO_URL}
              className="w-full h-full object-cover"
            >
              <source src={INTRO_VIDEO_URL} type="video/mp4" />
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 3. MEET OUR HOSTS — BOUNCING ANIMATED IMAGE CARDS                          */
/* -------------------------------------------------------------------------- */
export function MeetOurHostsSection() {
  return (
    <section className="bg-[#080808] text-[#FAF8F3] border-y border-[#D4AF37]/30 py-20 sm:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
              Meet Our Hosts &amp; Leadership
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#FAF8F3] mt-1">
              The Voices Behind the Signal
            </h2>
          </div>
          <p className="text-sm text-[#FAF8F3]/70 max-w-md">
            Our executive leadership, literary coordinators, and seasoned hosts
            guiding every broadcast across the network.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-2">
          {HOSTS_DATA.map((host) => (
            <Link
              key={host.id}
              href={`/authors/${host.slug}`}
              style={{ animationDelay: host.delay }}
              className="animate-host-bounce group relative rounded-2xl overflow-hidden bg-[#121212] border-2 border-[#D4AF37]/45 aspect-[3/4] flex flex-col justify-end shadow-[0_18px_40px_rgba(212,175,55,0.15)] hover:border-[#F7DF8B] transition-all duration-300"
            >
              <img
                src={host.photo}
                alt={host.name}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = host.avatar;
                }}
                className="absolute inset-0 w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#040404] via-[#040404]/50 to-transparent" />

              <div className="relative z-10 p-5 text-[#FAF8F3]">
                <span className="inline-block rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#050505]">
                  {host.show}
                </span>
                <h3 className="font-serif-display text-xl font-bold mt-2 text-[#FAF8F3] group-hover:text-[#F7DF8B] transition-colors">
                  {host.name}
                </h3>
                <p className="text-xs text-[#D4AF37] font-semibold">
                  {host.role}
                </p>
                <p className="text-xs text-[#FAF8F3]/80 mt-2 line-clamp-2 leading-relaxed">
                  {host.bio}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 4. UPCOMING BROADCASTS — COMPRESSED VIDEO CARDS FLOWING IN AND OUT         */
/* -------------------------------------------------------------------------- */
export function UpcomingBroadcastsSection() {
  const [remindedIds, setRemindedIds] = useState<Record<string, boolean>>({});
  const [countdowns, setCountdowns] = useState<{
    days: number;
    hours: number;
    mins: number;
    secs: number;
  }>({ days: 13, hours: 6, mins: 42, secs: 19 });

  useEffect(() => {
    const tick = () => {
      const target = new Date("2026-11-06T23:00:00.000Z").getTime();
      const now = Date.now();
      const diff = Math.max(0, target - now);
      if (diff === 0) {
        setCountdowns({ days: 6, hours: 14, mins: 28, secs: 45 });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / (1000 * 60)) % 60);
      const secs = Math.floor((diff / 1000) % 60);
      setCountdowns({ days, hours, mins, secs });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
            Live Studio Video Schedule
          </p>
          <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#080808] mt-1">
            Upcoming Broadcasts
          </h2>
          <p className="text-sm text-neutral-600 mt-1">
            Compressed live video previews — flowing in and out of our studio
            schedule.
          </p>
        </div>
        <Link
          href="/shows"
          className="inline-flex items-center gap-1.5 rounded-full bg-[#080808] text-[#F7DF8B] border border-[#D4AF37]/40 px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-gold-gradient hover:text-[#050505] transition-all"
        >
          Full Program Schedule <ArrowRight className="size-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
        {UPCOMING_BROADCASTS.map((item, idx) => {
          const isReminded = Boolean(remindedIds[item.id]);
          return (
            <article
              key={item.id}
              style={{ animationDelay: item.delay }}
              className="animate-flow-in-out group bg-[#0A0A0A] text-[#FAF8F3] rounded-3xl border border-[#D4AF37]/40 overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Compressed Video Header instead of Static Image */}
                <div className="relative aspect-[16/10] bg-black overflow-hidden">
                  <video
                    src={item.videoUrl}
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    poster="/media/lvn-hero-poster.svg"
                    className="w-full h-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/25 to-transparent" />
                  <span className="absolute top-3 left-3 rounded-full bg-[#050505]/90 backdrop-blur-md border border-[#D4AF37]/50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#F7DF8B] inline-flex items-center gap-1.5">
                    <span className="size-1.5 rounded-full bg-[#D4AF37] animate-ping" />
                    {item.dateBadge}
                  </span>

                  {/* Live Countdown Strip */}
                  <div className="absolute bottom-3 left-3 right-3 grid grid-cols-4 gap-1.5 text-center bg-[#050505]/90 backdrop-blur-md rounded-xl p-2 border border-[#D4AF37]/30 text-[#FAF8F3]">
                    <div>
                      <p className="font-mono text-xs font-bold text-[#F7DF8B]">
                        {countdowns.days + idx * 3}
                      </p>
                      <p className="text-[9px] uppercase text-white/60">Days</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-[#F7DF8B]">
                        {countdowns.hours}
                      </p>
                      <p className="text-[9px] uppercase text-white/60">Hours</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-[#F7DF8B]">
                        {countdowns.mins}
                      </p>
                      <p className="text-[9px] uppercase text-white/60">Mins</p>
                    </div>
                    <div>
                      <p className="font-mono text-xs font-bold text-[#F7DF8B]">
                        {countdowns.secs}
                      </p>
                      <p className="text-[9px] uppercase text-white/60">Secs</p>
                    </div>
                  </div>
                </div>

                <div className="p-5">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-[#D4AF37]">
                    {item.show}
                  </p>
                  <h3 className="font-serif-display text-lg font-bold text-[#FAF8F3] mt-1 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-white/65 mt-1">
                    Host:{" "}
                    <strong className="text-[#F7DF8B]">{item.host}</strong> ·
                    Guest:{" "}
                    <strong className="text-[#F7DF8B]">{item.guest}</strong>
                  </p>
                  <p className="text-xs text-white/75 mt-2.5 leading-relaxed line-clamp-2">
                    {item.description}
                  </p>
                </div>
              </div>

              <div className="px-5 pb-5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setRemindedIds((prev) => ({
                      ...prev,
                      [item.id]: !prev[item.id],
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                    isReminded
                      ? "bg-[#D4AF37] text-[#050505]"
                      : "bg-gold-gradient text-[#050505] hover:brightness-110"
                  }`}
                >
                  {isReminded ? (
                    <>
                      <CheckCircle2 className="size-3.5" />
                      <span>Reminder Set</span>
                    </>
                  ) : (
                    <>
                      <Bell className="size-3.5" />
                      <span>Remind Me</span>
                    </>
                  )}
                </button>
                <Link
                  href="/events"
                  className="text-xs font-semibold text-[#F7DF8B] hover:underline"
                >
                  Event Details →
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 5. PAST BROADCASTS — SINGLE ANIMATED CAROUSEL                              */
/* -------------------------------------------------------------------------- */
export function PastBroadcastsSection({
  episodes,
}: {
  episodes: Broadcast[];
}) {
  const { playTrack } = useAudioPlayer();
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % PAST_BROADCASTS.length);
    }, 5200);
    return () => clearInterval(timer);
  }, []);

  const currentItem = PAST_BROADCASTS[activeIndex];
  const matchedEp = episodes[activeIndex] || episodes[0];

  const handlePrev = () => {
    setActiveIndex(
      (prev) => (prev - 1 + PAST_BROADCASTS.length) % PAST_BROADCASTS.length
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % PAST_BROADCASTS.length);
  };

  return (
    <section className="bg-[#060606] text-[#FAF8F3] py-20 border-y border-[#D4AF37]/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
              On-Demand Spotlight Carousel
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#FAF8F3] mt-1">
              Past Broadcasts Archive
            </h2>
            <p className="text-sm text-[#FAF8F3]/70 mt-1">
              Highlighting each recorded studio session — use the controls or
              watch it cycle automatically.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous broadcast"
              className="size-10 rounded-full border border-[#D4AF37]/45 bg-[#141414] flex items-center justify-center text-[#F7DF8B] hover:bg-gold-gradient hover:text-[#050505] transition-all"
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next broadcast"
              className="size-10 rounded-full border border-[#D4AF37]/45 bg-[#141414] flex items-center justify-center text-[#F7DF8B] hover:bg-gold-gradient hover:text-[#050505] transition-all"
            >
              <ChevronRight className="size-5" />
            </button>
            <Link
              href="/broadcasts"
              className="ml-2 inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#F7DF8B] hover:underline"
            >
              Full Archive <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        {/* Single Animated Carousel Stage */}
        <div
          key={currentItem.id}
          className="animate-hero-1 rounded-3xl bg-gradient-to-br from-[#121212] via-[#19150B] to-[#0D0D0D] border-2 border-[#D4AF37]/45 overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.75)] grid grid-cols-1 lg:grid-cols-12"
        >
          <div className="lg:col-span-6 relative aspect-[16/10] lg:aspect-auto bg-black overflow-hidden">
            <img
              src={currentItem.banner}
              alt={currentItem.title}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src =
                  "/media/banners/editorial-desk.svg";
              }}
              className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-[#121212]" />
            <span className="absolute top-4 left-4 rounded-full bg-[#050505]/90 border border-[#D4AF37]/50 px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-[#F7DF8B]">
              {currentItem.dateBadge}
            </span>
          </div>

          <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 px-3 py-1 font-bold uppercase tracking-wider text-[#F7DF8B]">
                  <Radio className="size-3.5 text-[#D4AF37]" />
                  {currentItem.show}
                </span>
                <span className="font-mono text-xs text-[#D4AF37]">
                  0{activeIndex + 1} / 0{PAST_BROADCASTS.length}
                </span>
              </div>

              <h3 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#FAF8F3] leading-snug pt-1">
                {currentItem.title}
              </h3>

              <p className="text-xs text-[#D4AF37] font-semibold">
                Hosted by {currentItem.host} · Guest: {currentItem.guest}
              </p>

              <blockquote className="border-l-2 border-[#D4AF37] pl-4 py-1 font-serif-display italic text-sm sm:text-base text-[#FAF8F3]/85 leading-relaxed">
                {currentItem.quote}
              </blockquote>
            </div>

            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() =>
                    playTrack({
                      id: matchedEp?.id || currentItem.id,
                      title: matchedEp?.title || currentItem.title,
                      programmeName:
                        matchedEp?.programme_name || currentItem.show,
                      hostName: matchedEp?.host_name || currentItem.host,
                      guestName: matchedEp?.guest_name || currentItem.guest,
                      audioUrl:
                        matchedEp?.audio_file_url ||
                        "/media/audio/lvn-studio-preview.wav",
                      slug: matchedEp?.slug || currentItem.slug,
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-xs font-bold text-[#050505] hover:brightness-110 transition-all cursor-pointer"
                >
                  <Play className="size-3.5 fill-current" />
                  <span>Watch Replay &amp; Listen</span>
                </button>
                <Link
                  href={`/broadcasts/${matchedEp?.slug || currentItem.slug}`}
                  className="text-xs font-semibold text-[#F7DF8B] hover:underline"
                >
                  Show Notes →
                </Link>
              </div>

              {/* Carousel Indicator Dots */}
              <div className="flex items-center gap-2">
                {PAST_BROADCASTS.map((b, i) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setActiveIndex(i)}
                    aria-label={`Show slide ${i + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      i === activeIndex
                        ? "w-7 bg-gold-gradient"
                        : "w-2 bg-white/25 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 6. LIVE VIDEO STAGE — CLEAN & UNSTUFFED                                    */
/* -------------------------------------------------------------------------- */
export function LiveVideoStageSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="rounded-3xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/40 p-6 sm:p-10 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-[#D4AF37]/35 bg-black aspect-video relative">
            <video
              controls
              muted
              loop
              playsInline
              poster="/media/lvn-hero-poster.svg"
              src={INTRO_VIDEO_URL}
              className="w-full h-full object-cover"
            >
              <source src={INTRO_VIDEO_URL} type="video/mp4" />
            </video>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/50 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F7DF8B]">
                <span className="size-2 rounded-full bg-[#D4AF37] animate-ping" />
                Live Broadcast Stage
              </span>
              <span className="text-xs text-[#F7DF8B]/80 font-medium">
                182 tuned in
              </span>
            </div>

            <h2 className="font-serif-display text-3xl font-bold text-[#FAF8F3] leading-tight">
              Live Now on the Network
            </h2>

            <p className="text-sm text-[#FAF8F3]/75 leading-relaxed">
              Stream our studio feed in high definition or step into the Live
              Radio Room to join listener Q&amp;As in real time.
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/live"
                className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-6 py-3 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
              >
                <Video className="size-4" />
                Enter Live Studio
              </Link>
              <a
                href={SPOTIFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/40 px-5 py-3 text-xs font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/15 transition-colors"
              >
                <Headphones className="size-4 text-[#D4AF37]" />
                Stream on Spotify
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 7. TRENDING BOOKS ON THE NETWORK — 3D FLIP CARDS                           */
/* -------------------------------------------------------------------------- */
export function TrendingBooksSection() {
  const [books, setBooks] = useState<TrendingNetworkBook[]>(
    TRENDING_BOOKS_POOL.slice(0, 6)
  );
  const [fallbackMap, setFallbackMap] = useState<Record<string, boolean>>({});
  const [flippedMap, setFlippedMap] = useState<Record<string, boolean>>({});

  const handleShuffle = () => {
    const shuffled = [...TRENDING_BOOKS_POOL]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6)
      .map((b, i) => ({ ...b, rank: i + 1 }));
    setBooks(shuffled);
    setFlippedMap({});
  };

  const toggleFlip = (id: string) => {
    setFlippedMap((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <section className="bg-[#F3EFE4] border-y border-[#D4AF37]/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
              On the Charts · Interactive 3D Shelf
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#080808] mt-1">
              Trending Books on the Network
            </h2>
            <p className="text-sm text-neutral-600 mt-1">
              Hover or tap any book cover to flip the card and inspect full
              edition details, synopsis, and retailer links.
            </p>
          </div>
          <button
            type="button"
            onClick={handleShuffle}
            className="inline-flex items-center gap-2 rounded-full bg-[#080808] border border-[#D4AF37]/50 px-5 py-2.5 text-xs font-bold text-[#F7DF8B] hover:bg-gold-gradient hover:text-[#050505] transition-all self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className="size-3.5" />
            Shuffle Picks
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {books.map((b) => {
            const useFallback = Boolean(fallbackMap[b.id]);
            const isFlipped = Boolean(flippedMap[b.id]);

            return (
              <div
                key={b.id}
                onClick={() => toggleFlip(b.id)}
                className="group perspective-1200 h-[430px] cursor-pointer select-none"
              >
                <div
                  className={`relative w-full h-full rounded-3xl transition-transform duration-700 preserve-3d shadow-xl ${
                    isFlipped
                      ? "rotate-y-180"
                      : "group-hover:rotate-y-180"
                  }`}
                >
                  {/* FRONT OF CARD: Book Cover Showcase */}
                  <div className="absolute inset-0 w-full h-full rounded-3xl bg-[#080808] border-2 border-[#D4AF37]/45 overflow-hidden backface-hidden flex flex-col justify-between p-6">
                    <div className="flex items-center justify-between z-10">
                      <span className="rounded-full bg-gold-gradient px-3 py-1 text-xs font-bold text-[#050505] shadow-md">
                        #{b.rank} on Chart
                      </span>
                      <span className="inline-flex items-center gap-1 rounded-full bg-black/75 border border-[#D4AF37]/40 px-2.5 py-1 text-xs font-bold text-[#F7DF8B]">
                        <Star className="size-3.5 fill-current text-[#D4AF37]" />
                        {b.rating.toFixed(1)}
                      </span>
                    </div>

                    <div className="my-auto flex justify-center py-2">
                      <div className="w-40 aspect-[2/3] rounded-xl overflow-hidden border border-[#D4AF37]/40 shadow-[0_16px_35px_rgba(0,0,0,0.75)]">
                        <img
                          src={useFallback ? b.fallbackCover : b.coverUrl}
                          alt={b.title}
                          onLoad={(e) => {
                            if ((e.currentTarget as HTMLImageElement).naturalWidth <= 1) {
                              setFallbackMap((prev) => ({
                                ...prev,
                                [b.id]: true,
                              }));
                            }
                          }}
                          onError={() =>
                            setFallbackMap((prev) => ({
                              ...prev,
                              [b.id]: true,
                            }))
                          }
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </div>

                    <div className="text-center z-10">
                      <h3 className="font-serif-display text-lg font-bold text-[#FAF8F3] line-clamp-1">
                        {b.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#D4AF37] mt-0.5">
                        {b.author}
                      </p>
                      <span className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-widest text-[#F7DF8B]/80">
                        <RotateCw className="size-3 text-[#D4AF37]" />
                        Hover or Tap to Flip for Details
                      </span>
                    </div>
                  </div>

                  {/* BACK OF CARD: Full Synopsis, Metadata & Retailer Links */}
                  <div className="absolute inset-0 w-full h-full rounded-3xl bg-gradient-to-br from-[#0E0E0E] via-[#17130A] to-[#080808] text-[#FAF8F3] border-2 border-[#D4AF37] p-6 backface-hidden rotate-y-180 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 pb-3 border-b border-white/10">
                        <span className="rounded-full bg-gold-gradient px-2.5 py-0.5 text-[10px] font-bold text-[#050505]">
                          #{b.rank} · {b.year} · {b.pages} Pages
                        </span>
                        <span className="text-xs text-[#F7DF8B] font-semibold">
                          ★ {b.rating.toFixed(1)}
                        </span>
                      </div>

                      <h3 className="font-serif-display text-xl font-bold text-[#FAF8F3] mt-3">
                        {b.title}
                      </h3>
                      <p className="text-xs font-semibold text-[#D4AF37] mt-0.5">
                        By {b.author} · {b.publisher}
                      </p>

                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {b.genres.map((g) => (
                          <span
                            key={g}
                            className="rounded-full bg-white/5 border border-[#D4AF37]/35 px-2.5 py-0.5 text-[10px] font-medium text-[#F7DF8B]"
                          >
                            {g}
                          </span>
                        ))}
                      </div>

                      <p className="text-xs text-[#FAF8F3]/85 mt-3.5 leading-relaxed line-clamp-4">
                        {b.description}
                      </p>
                    </div>

                    <div
                      className="space-y-3 pt-3 border-t border-white/10"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex flex-wrap gap-1.5">
                        <a
                          href={b.links.amazon}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-gold-gradient px-3 py-1 text-[10px] font-bold text-[#050505] hover:brightness-110"
                        >
                          Amazon
                        </a>
                        <a
                          href={b.links.bookshop}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#171717] border border-[#D4AF37]/40 px-3 py-1 text-[10px] font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/20"
                        >
                          Bookshop.org
                        </a>
                        <a
                          href={b.links.audible}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#171717] border border-[#D4AF37]/40 px-3 py-1 text-[10px] font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/20"
                        >
                          Audible
                        </a>
                        <a
                          href={b.links.spotify}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#171717] border border-[#D4AF37]/40 px-3 py-1 text-[10px] font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/20"
                        >
                          Spotify
                        </a>
                        <a
                          href={b.links.goodreads}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-[#171717] border border-[#D4AF37]/40 px-3 py-1 text-[10px] font-semibold text-[#F7DF8B] hover:bg-[#D4AF37]/20"
                        >
                          Goodreads
                        </a>
                      </div>

                      <div className="flex items-center justify-between text-xs">
                        <Link
                          href={b.slug ? `/books/${b.slug}` : "/books"}
                          className="font-bold text-[#F7DF8B] hover:underline inline-flex items-center gap-1"
                        >
                          <BookOpen className="size-3.5 text-[#D4AF37]" />
                          Read Sample Excerpt →
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 8. ON THE SHELF — REFINED INTERACTIVE BOOK DIRECTORY                       */
/* -------------------------------------------------------------------------- */
export function OnTheShelfDirectorySection({ books }: { books: Book[] }) {
  const [selectedGenre, setSelectedGenre] = useState("All");
  const [query, setQuery] = useState("");

  const filtered = books.filter((b) => {
    const matchesGenre =
      selectedGenre === "All" ||
      b.genre.toLowerCase().includes(selectedGenre.toLowerCase());
    const matchesQuery =
      !query.trim() ||
      b.title.toLowerCase().includes(query.toLowerCase()) ||
      (b.author_name || "").toLowerCase().includes(query.toLowerCase());
    return matchesGenre && matchesQuery;
  });

  const displayBooks = (filtered.length > 0 ? filtered : books).slice(0, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="rounded-3xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/40 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
              Curated Book Directory
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#FAF8F3] mt-1">
              On the Shelf
            </h2>
            <p className="text-sm text-[#FAF8F3]/70 mt-1">
              Every verified edition featured across our shows — filter by genre
              or search the stack.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="size-3.5 text-[#D4AF37] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search title or author…"
                className="rounded-full bg-[#141414] border border-[#D4AF37]/40 pl-9 pr-4 py-2 text-xs text-[#FAF8F3] placeholder:text-white/40 focus:outline-none focus:border-[#F7DF8B]"
              />
            </div>
            <Link
              href="/books"
              className="inline-flex items-center gap-1 rounded-full bg-gold-gradient px-4 py-2 text-xs font-bold text-[#050505] hover:brightness-110 shrink-0"
            >
              Full Directory <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>

        {/* Genre Filter Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {GENRE_PILLS.map((genre) => (
            <button
              key={genre}
              type="button"
              onClick={() => setSelectedGenre(genre)}
              className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                selectedGenre === genre
                  ? "bg-gold-gradient text-[#050505] font-bold"
                  : "bg-[#141414] border border-[#D4AF37]/30 text-[#FAF8F3]/80 hover:border-[#F7DF8B]"
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Refined 5-Column Book Showcase Shelf */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {displayBooks.map((book) => (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              className="group rounded-2xl bg-[#121212] border border-[#D4AF37]/35 p-4 hover:border-[#F7DF8B] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between shadow-lg"
            >
              <div>
                <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[#050505] mb-3.5 border border-[#D4AF37]/25 relative">
                  <img
                    src={
                      book.cover_url || "/media/covers/the-glass-meridian.svg"
                    }
                    alt={book.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/media/covers/the-glass-meridian.svg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                </div>
                <span className="inline-block rounded-full bg-[#D4AF37]/15 border border-[#D4AF37]/35 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#F7DF8B]">
                  {book.genre}
                </span>
                <h3 className="font-serif-display text-base font-bold text-[#FAF8F3] group-hover:text-[#F7DF8B] line-clamp-1 mt-2">
                  {book.title}
                </h3>
                <p className="text-xs text-[#D4AF37] font-medium truncate mt-0.5">
                  {book.author_name}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-[#FAF8F3]/70">
                <span>{book.format}</span>
                <span className="font-bold text-[#F7DF8B] group-hover:translate-x-0.5 transition-transform">
                  Inspect →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 9. THE PODCAST FEED & REFINED ANIMATED "IN THE HOT SEAT"                   */
/* -------------------------------------------------------------------------- */
export function PodcastAndHotSeatSection({
  episodes,
}: {
  episodes: Broadcast[];
}) {
  const { playTrack } = useAudioPlayer();

  return (
    <section className="bg-[#060606] text-[#FAF8F3] py-20 border-y border-[#D4AF37]/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Part A: The Podcast Feed */}
        <div>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                The Podcast Feed
              </p>
              <h2 className="font-serif-display text-3xl sm:text-4xl font-bold mt-1">
                Missed the Broadcast? Stream the Interview.
              </h2>
            </div>
            <div className="rounded-2xl bg-[#121212] border border-[#D4AF37]/40 px-5 py-3 flex items-center gap-4">
              <div>
                <p className="font-serif-display text-2xl font-bold text-[#F7DF8B]">
                  24,800+
                </p>
                <p className="text-[11px] text-[#FAF8F3]/65">
                  Subscribers on Spotify &amp; Radio
                </p>
              </div>
              <a
                href={SPOTIFY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-gold-gradient px-4 py-2 text-xs font-bold text-[#050505] hover:brightness-110 transition-all inline-flex items-center gap-1.5"
              >
                <span>Follow on Spotify</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {episodes.slice(0, 2).map((ep, idx) => (
              <div
                key={ep.id}
                className="rounded-2xl bg-[#121212] border border-[#D4AF37]/35 p-6 flex flex-col justify-between gap-4 hover:border-[#F7DF8B] transition-all"
              >
                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-sm font-bold text-[#D4AF37]">
                      0{idx + 1} // {ep.programme_name}
                    </span>
                    <span className="text-white/60">
                      {ep.duration_minutes || 45} mins
                    </span>
                  </div>
                  <h3 className="font-serif-display text-xl font-bold text-[#FAF8F3] mt-2">
                    {ep.title}
                  </h3>
                  <p className="text-xs text-[#F7DF8B] mt-1">
                    Host: {ep.host_name} · Guest: {ep.guest_name}
                  </p>
                  <p className="text-xs text-white/75 mt-2.5 leading-relaxed line-clamp-2">
                    {ep.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() =>
                      playTrack({
                        id: ep.id,
                        title: ep.title,
                        programmeName: ep.programme_name,
                        hostName: ep.host_name,
                        guestName: ep.guest_name,
                        audioUrl:
                          ep.audio_file_url ||
                          "/media/audio/lvn-studio-preview.wav",
                        slug: ep.slug,
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 py-2 text-xs font-bold text-[#050505] hover:brightness-110 transition-all cursor-pointer"
                  >
                    <Play className="size-3.5 fill-current" />
                    Stream Episode
                  </button>
                  <Link
                    href={`/broadcasts/${ep.slug}`}
                    className="text-xs text-[#F7DF8B] hover:underline"
                  >
                    Full Transcript →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Part B: Refined Modern Animated "In the Hot Seat" */}
        <div className="relative rounded-3xl bg-gradient-to-r from-[#0E0E0E] via-[#1B1508] to-[#0E0E0E] border-2 border-[#D4AF37]/50 p-8 sm:p-12 overflow-hidden shadow-[0_25px_70px_rgba(212,175,55,0.15)]">
          <div className="absolute -right-20 -top-20 size-96 rounded-full bg-[#D4AF37]/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7 space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-3.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#050505]">
                <Mic2 className="size-3.5" />
                Flagship Live Author Feature
              </span>
              <h3 className="font-serif-display text-3xl sm:text-5xl font-bold text-[#FAF8F3] leading-tight">
                In the{" "}
                <span className="text-gold-shimmer italic">Hot Seat</span>
              </h3>
              <p className="text-sm sm:text-base text-[#FAF8F3]/80 leading-relaxed max-w-xl">
                Every week we place a featured novelist, biographer, or poet in
                the hot seat — unscripted questions about the craft, the cuts,
                and the human stories behind the book.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs text-[#F7DF8B]">
                <div className="rounded-xl bg-black/50 border border-[#D4AF37]/30 p-3 flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0" />
                  <span>Live interactive audience Q&amp;A</span>
                </div>
                <div className="rounded-xl bg-black/50 border border-[#D4AF37]/30 p-3 flex items-center gap-2.5">
                  <CheckCircle2 className="size-4 text-[#D4AF37] shrink-0" />
                  <span>Simultaneous Spotify &amp; Studio stream</span>
                </div>
              </div>

              <div className="pt-3 flex flex-wrap gap-3.5">
                <Link
                  href="/events"
                  className="rounded-full bg-gold-gradient px-7 py-3 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
                >
                  Reserve Listener Seat
                </Link>
                <Link
                  href="/for-authors"
                  className="rounded-full border border-[#D4AF37]/50 bg-black/40 px-7 py-3 text-xs font-semibold text-[#F7DF8B] hover:border-[#F7DF8B] transition-colors"
                >
                  Apply for the Hot Seat
                </Link>
              </div>
            </div>

            {/* Animated Orbital Studio Emblem */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative size-64 sm:size-72 flex items-center justify-center">
                {/* Rotating Dashed Gold Orbit Ring */}
                <div className="animate-hotseat-orbit absolute inset-0 rounded-full border-2 border-dashed border-[#D4AF37]/45" />
                <div className="absolute inset-4 rounded-full border border-[#D4AF37]/25 bg-black/60 backdrop-blur-md" />

                <div className="relative z-10 text-center p-6 flex flex-col items-center">
                  <div className="animate-host-bounce size-16 rounded-2xl bg-gold-gradient flex items-center justify-center text-[#050505] shadow-[0_0_30px_rgba(212,175,55,0.5)] mb-3">
                    <Mic2 className="size-8" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
                    Studio A · Live Broadcast
                  </span>
                  <p className="font-serif-display text-xl font-bold text-[#FAF8F3] mt-1">
                    Fridays at 7:00 PM EST
                  </p>
                  <p className="text-xs text-[#F7DF8B]/75 mt-1">
                    Syndicated across 8 global hubs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 10. DIGITAL MAGAZINE SHOWCASE (ESSAYS, AUTHOR INTERVIEWS & REVIEWS)        */
/* -------------------------------------------------------------------------- */
export function DigitalMagazineShowcaseSection({
  articles,
}: {
  articles: Article[];
}) {
  const [activeTab, setActiveTab] = useState<
    "all" | "essay" | "interview" | "review"
  >("all");

  // Curated fallback + DB editorial pieces with high-res photography so it always looks rich
  const magazineItems = [
    {
      id: "mag-1",
      slug:
        articles[0]?.slug || "the-architecture-of-the-unhurried-sentence",
      type: "essay",
      badge: "Essay & Criticism",
      issue: "Issue No. 13 · Cartographies of Voice",
      title:
        articles[0]?.title || "The Architecture of the Unhurried Sentence",
      subtitle:
        "Why contemporary novelists are returning to archival notebooks, long cadence, and documentary form",
      excerpt:
        "In an era of algorithmic brevity, a new generation of novelists and essayists is reclaiming slow syntax, marginalia, and historical documents as instruments of emotional precision.",
      author: "Eleanor Vance",
      authorSlug: "eleanor-vance",
      readTime: "8 min read",
      date: "Oct 20, 2026",
      image:
        "https://images.unsplash.com/photo-1455390582262-044cdead277a?auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "mag-2",
      slug:
        articles[1]?.slug ||
        "author-spotlight-soren-lindqvist-and-the-craft-of-the-independent-press",
      type: "interview",
      badge: "Author Interview",
      issue: "Issue No. 13 · Cartographies of Voice",
      title:
        "Author Interview: Søren Lindqvist on the Living Legacy of Small Presses",
      subtitle:
        "Inside the Copenhagen archives that inspired ‘The Republic of Typesetters’",
      excerpt:
        "Historian and biographer Søren Lindqvist takes us inside the nineteenth-century cooperative printshops where typesetters doubled as poets, translators, and publishers.",
      author: "Marcus Sterling",
      authorSlug: "marcus-sterling",
      readTime: "6 min read",
      date: "Oct 16, 2026",
      image:
        "https://images.unsplash.com/photo-1507842229356-51c61504d3ab?auto=format&fit=crop&w=1000&q=80",
    },
    {
      id: "mag-3",
      slug:
        articles[2]?.slug ||
        "review-the-saltwater-ledger-amara-osei-masterwork-of-coastal-memory",
      type: "review",
      badge: "Critical Book Review",
      issue: "Issue No. 14 · The Architecture of Memory",
      title:
        "Critical Review: ‘The Saltwater Ledger’ Is a Masterwork of Coastal Memory",
      subtitle:
        "Amara Osei’s sweeping Gold Coast chronicle transforms commercial shipping registers into polyphonic literature",
      excerpt:
        "Few contemporary historical novels achieve both architectural grandeur and lyric intimacy. Osei’s portrait of three generations along the Atlantic coast is an instant classic.",
      author: "Eleanor Vance",
      authorSlug: "eleanor-vance",
      readTime: "7 min read",
      date: "Oct 12, 2026",
      image:
        "https://images.unsplash.com/photo-1476275466078-4007374efbbe?auto=format&fit=crop&w=1000&q=80",
    },
  ];

  const visibleItems =
    activeTab === "all"
      ? magazineItems
      : magazineItems.filter((item) => item.type === activeTab);

  return (
    <section id="lvn-digital-magazine" className="bg-[#FAF8F3] border-b border-[#D4AF37]/30 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
              LVN Digital Magazine
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#080808] mt-1">
              Essays, Author Interviews &amp; Critical Reviews
            </h2>
            <p className="text-sm text-neutral-600 mt-1 max-w-2xl">
              Long-form literary journalism, in-depth author conversations, and
              rigorous critical reviews commissioned by our editorial desk.
            </p>
          </div>

          {/* Interactive Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Dispatches" },
              { id: "essay", label: "Essays" },
              { id: "interview", label: "Author Interviews" },
              { id: "review", label: "Critical Reviews" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() =>
                  setActiveTab(
                    tab.id as "all" | "essay" | "interview" | "review"
                  )
                }
                className={`rounded-full px-4 py-2 text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-[#080808] text-[#F7DF8B] border border-[#D4AF37]"
                    : "bg-white border border-[#D4AF37]/35 text-[#080808] hover:border-[#080808]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {visibleItems.map((item) => (
            <article
              key={item.id}
              className="group bg-white rounded-3xl border border-[#D4AF37]/35 overflow-hidden shadow-md hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <Link
                  href={`/magazine/${item.slug}`}
                  className="relative aspect-[16/10] bg-[#080808] overflow-hidden block"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src =
                        "/media/covers/issue-13.svg";
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <span className="rounded-full bg-gold-gradient px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#050505]">
                      {item.badge}
                    </span>
                    <span className="text-[#FAF8F3]/90 text-[11px] inline-flex items-center gap-1">
                      <Clock className="size-3 text-[#D4AF37]" />
                      {item.readTime}
                    </span>
                  </div>
                </Link>

                <div className="p-6">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#AA7C11]">
                    {item.issue}
                  </p>
                  <Link href={`/magazine/${item.slug}`}>
                    <h3 className="font-serif-display text-xl font-bold text-[#080808] group-hover:text-[#AA7C11] transition-colors mt-1.5 leading-snug">
                      {item.title}
                    </h3>
                  </Link>
                  <p className="text-xs italic text-neutral-600 mt-1.5 line-clamp-2">
                    {item.subtitle}
                  </p>
                  <p className="text-xs text-neutral-600 mt-3 leading-relaxed line-clamp-3">
                    {item.excerpt}
                  </p>
                </div>
              </div>

              <div className="px-6 pb-5 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                <span>
                  By{" "}
                  <Link
                    href={`/authors/${item.authorSlug}`}
                    className="font-bold text-[#080808] hover:text-[#AA7C11]"
                  >
                    {item.author}
                  </Link>
                </span>
                <Link
                  href={`/magazine/${item.slug}`}
                  className="font-bold text-[#AA7C11] hover:underline"
                >
                  Read Article →
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/magazine"
            className="inline-flex items-center gap-2 rounded-full bg-[#080808] border border-[#D4AF37]/50 px-7 py-3 text-xs font-bold text-[#F7DF8B] hover:bg-gold-gradient hover:text-[#050505] transition-all"
          >
            <Feather className="size-3.5" />
            Explore Full Digital Magazine Archive
          </Link>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 11. EXPLORE BY GENRE + BUSINESS & FOUNDER SPOTLIGHT                        */
/* -------------------------------------------------------------------------- */
export function GenreAndFounderSpotlightSection() {
  const founders = [
    {
      num: "01",
      city: "Chicago",
      name: "Vance & Meridian Imprints",
      founder: "Eleanor Vance",
      sector: "Independent Literary Publishing",
      summary:
        "Building a hybrid print-and-broadcast house that brings archival criticism and contemporary fiction to 68 countries.",
    },
    {
      num: "02",
      city: "London",
      name: "Harbour & Loom Audio",
      founder: "Marcus Sterling",
      sector: "Spatial Audiobook Production",
      summary:
        "How bespoke studio dramatizations are transforming independent literary translation.",
    },
    {
      num: "03",
      city: "Accra & Boston",
      name: "Gold Coast Archival Trust",
      founder: "Amara Osei",
      sector: "Cultural Heritage & Digital Archives",
      summary:
        "Digitizing three centuries of West African coastal correspondence for novelists and historians.",
    },
    {
      num: "04",
      city: "Copenhagen",
      name: "Fjord & Folio Press",
      founder: "Søren Lindqvist",
      sector: "Artisanal Letterpress & Distribution",
      summary:
        "Pairing Scandinavian craft bookbinding with global direct-to-reader subscriptions.",
    },
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 space-y-20">
      {/* Explore by Genre Pill Cloud */}
      <div className="text-center max-w-4xl mx-auto">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
          Browse
        </p>
        <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#080808] mt-1">
          Explore by Genre
        </h2>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          {[
            "Literary Fiction",
            "Historical Fiction",
            "Non-Fiction",
            "Biography & Memoir",
            "Speculative Fiction",
            "Mystery & Suspense",
            "Poetry",
            "Essays & Criticism",
            "Translation",
            "Business & Culture",
            "History",
            "Science & Philosophy",
          ].map((genre) => (
            <Link
              key={genre}
              href={`/books?genre=${encodeURIComponent(genre)}`}
              className="rounded-full bg-white border border-[#D4AF37]/40 px-5 py-2.5 text-xs font-semibold text-[#080808] hover:bg-[#080808] hover:text-[#F7DF8B] hover:border-[#D4AF37] transition-all shadow-xs"
            >
              {genre}
            </Link>
          ))}
        </div>
      </div>

      {/* Business & Founder Spotlight Bento */}
      <div className="rounded-3xl bg-[#080808] text-[#FAF8F3] border border-[#D4AF37]/40 p-6 sm:p-10 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-8 border-b border-white/10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
              Business &amp; Founder Spotlight
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold mt-1">
              Entrepreneurs on Companies, Challenges &amp; Innovation
            </h2>
            <p className="text-sm text-[#FAF8F3]/75 mt-1 max-w-2xl">
              Beyond books — our studio sits down with founders, executives, and
              cultural builders to talk about the companies they are building.
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <Link
              href="/founder-spotlight"
              className="rounded-full bg-gold-gradient px-4 py-2 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
            >
              Explore All Spotlights
            </Link>
            <Link
              href="/founder-spotlight/submit"
              className="rounded-full border border-[#D4AF37]/40 px-4 py-2 text-xs font-semibold text-[#FAF8F3] hover:border-[#F7DF8B] hover:text-[#F7DF8B] transition-colors"
            >
              Pitch a Founder
            </Link>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {founders.map((f) => (
            <Link
              key={f.num}
              href="/founder-spotlight"
              className="rounded-2xl bg-[#121212] border border-[#D4AF37]/30 p-5 hover:border-[#F7DF8B] transition-all flex flex-col justify-between"
            >
              <div>
                <p className="font-mono text-xs text-[#D4AF37]">
                  {f.num} // {f.city}
                </p>
                <span className="inline-block mt-2 rounded-full bg-[#D4AF37]/15 px-2.5 py-0.5 text-[10px] font-semibold text-[#F7DF8B]">
                  {f.sector}
                </span>
                <h3 className="font-serif-display text-lg font-bold text-[#FAF8F3] mt-2">
                  {f.name}
                </h3>
                <p className="text-xs text-[#D4AF37] mt-0.5">
                  Founded by {f.founder}
                </p>
                <p className="text-xs text-white/70 mt-2.5 leading-relaxed">
                  {f.summary}
                </p>
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-[#F7DF8B]">
                Read &amp; Listen <ArrowRight className="size-3.5" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 12. WORLDWIDE SIGNAL MAP ("WHERE THE NETWORK IS HEARD")                    */
/* -------------------------------------------------------------------------- */
export function WorldwideSignalMapSection() {
  const [activeHub, setActiveHub] = useState(GLOBAL_HUBS[0]);

  return (
    <section className="bg-[#050505] text-[#FAF8F3] py-16 sm:py-20 border-y border-[#D4AF37]/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
              Worldwide Signal
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold mt-1">
              Where the Network Is Heard
            </h2>
            <p className="text-sm text-[#FAF8F3]/70 mt-1">
              From New York and London to Nairobi, Mumbai, and Sydney — select a
              hub to explore local programming.
            </p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {GLOBAL_HUBS.map((hub) => (
              <button
                key={hub.id}
                type="button"
                onClick={() => setActiveHub(hub)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeHub.id === hub.id
                    ? "bg-gold-gradient text-[#050505] font-bold"
                    : "bg-[#141414] text-[#FAF8F3]/75 border border-white/10 hover:border-[#D4AF37]"
                }`}
              >
                {hub.city}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Interactive Stylized World Map */}
          <div className="lg:col-span-8 relative rounded-3xl bg-[#0D0D0D] border border-[#D4AF37]/35 p-6 aspect-[16/9] overflow-hidden flex items-center justify-center">
            <svg
              viewBox="0 0 1000 520"
              className="w-full h-full opacity-35"
              aria-hidden="true"
            >
              <g stroke="#D4AF37" strokeWidth="0.7" fill="none" opacity="0.35">
                <line x1="0" y1="130" x2="1000" y2="130" strokeDasharray="4 6" />
                <line x1="0" y1="260" x2="1000" y2="260" />
                <line x1="0" y1="390" x2="1000" y2="390" strokeDasharray="4 6" />
                <line x1="250" y1="0" x2="250" y2="520" strokeDasharray="4 6" />
                <line x1="500" y1="0" x2="500" y2="520" />
                <line x1="750" y1="0" x2="750" y2="520" strokeDasharray="4 6" />
              </g>
              <path
                d="M120,110 Q210,85 290,150 T260,260 Q190,240 130,190 Z"
                fill="#D4AF37"
                fillOpacity="0.18"
                stroke="#D4AF37"
                strokeWidth="1.2"
              />
              <path
                d="M280,295 Q340,305 370,380 T315,475 Q275,410 280,295 Z"
                fill="#D4AF37"
                fillOpacity="0.18"
                stroke="#D4AF37"
                strokeWidth="1.2"
              />
              <path
                d="M445,105 Q535,90 585,155 T510,210 Q460,190 445,105 Z"
                fill="#D4AF37"
                fillOpacity="0.18"
                stroke="#D4AF37"
                strokeWidth="1.2"
              />
              <path
                d="M470,225 Q575,215 610,320 T535,435 Q480,360 470,225 Z"
                fill="#D4AF37"
                fillOpacity="0.18"
                stroke="#D4AF37"
                strokeWidth="1.2"
              />
              <path
                d="M605,120 Q775,95 855,210 T745,315 Q645,275 605,120 Z"
                fill="#D4AF37"
                fillOpacity="0.18"
                stroke="#D4AF37"
                strokeWidth="1.2"
              />
              <path
                d="M785,355 Q875,345 905,415 T815,445 Z"
                fill="#D4AF37"
                fillOpacity="0.18"
                stroke="#D4AF37"
                strokeWidth="1.2"
              />
            </svg>

            {GLOBAL_HUBS.map((hub) => {
              const selected = activeHub.id === hub.id;
              return (
                <button
                  key={hub.id}
                  type="button"
                  onClick={() => setActiveHub(hub)}
                  style={{
                    left: `${hub.coords.x}%`,
                    top: `${hub.coords.y}%`,
                  }}
                  aria-label={`Select ${hub.city} broadcast hub`}
                  className="absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer"
                >
                  <span
                    className={`animate-ping absolute inline-flex h-6 w-6 -top-1.5 -left-1.5 rounded-full opacity-75 ${
                      selected ? "bg-[#D4AF37]" : "bg-[#F7DF8B]/50"
                    }`}
                  />
                  <span
                    className={`relative inline-flex rounded-full size-3.5 border-2 transition-transform ${
                      selected
                        ? "bg-[#D4AF37] border-white scale-125"
                        : "bg-[#050505] border-[#D4AF37] group-hover:scale-110"
                    }`}
                  />
                  <span
                    className={`ml-2 px-2 py-0.5 rounded text-[10px] font-bold whitespace-nowrap transition-opacity ${
                      selected
                        ? "bg-gold-gradient text-[#050505]"
                        : "bg-[#050505]/90 text-[#FAF8F3]/85"
                    }`}
                  >
                    {hub.city}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Hub Details Card */}
          <div className="lg:col-span-4 rounded-3xl bg-[#121212] border border-[#D4AF37]/40 p-6 sm:p-7 space-y-5">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/45 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#F7DF8B]">
                <span className="size-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
                Active Hub
              </span>
              <span className="text-xs text-[#F7DF8B] font-mono">
                {activeHub.region}
              </span>
            </div>

            <div>
              <h3 className="font-serif-display text-2xl font-bold text-[#FAF8F3]">
                {activeHub.city}, {activeHub.country}
              </h3>
              <p className="text-xs text-[#D4AF37] mt-1">
                Flagship Program: <strong>{activeHub.flagship}</strong>
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="rounded-xl bg-[#080808] p-3 border border-white/10">
                <p className="text-[10px] uppercase text-white/55">
                  Weekly Listeners
                </p>
                <p className="font-serif-display text-lg font-bold text-[#F7DF8B] mt-0.5">
                  {activeHub.listeners}
                </p>
              </div>
              <div className="rounded-xl bg-[#080808] p-3 border border-white/10">
                <p className="text-[10px] uppercase text-white/55">
                  Broadcast Feed
                </p>
                <p className="font-serif-display text-lg font-bold text-[#F7DF8B] mt-0.5">
                  24/7 Live HD
                </p>
              </div>
            </div>

            <Link
              href="/live"
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-gold-gradient px-5 py-3 text-xs font-bold text-[#050505] hover:brightness-110 transition-all"
            >
              <Radio className="size-4" />
              Tune In to {activeHub.city} Feed
            </Link>
          </div>
        </div>

        {/* 4 Global Stats Bar */}
        <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="font-serif-display text-3xl font-bold text-[#F7DF8B]">
              68
            </p>
            <p className="text-xs text-white/65 mt-1">Countries reached</p>
          </div>
          <div>
            <p className="font-serif-display text-3xl font-bold text-[#F7DF8B]">
              8
            </p>
            <p className="text-xs text-white/65 mt-1">Broadcast hubs</p>
          </div>
          <div>
            <p className="font-serif-display text-3xl font-bold text-[#F7DF8B]">
              1,240+
            </p>
            <p className="text-xs text-white/65 mt-1">Weekly listeners</p>
          </div>
          <div>
            <p className="font-serif-display text-3xl font-bold text-[#F7DF8B]">
              12
            </p>
            <p className="text-xs text-white/65 mt-1">Languages</p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* 13. BECOME A MEMBER, NEWSLETTER, PARTNERS MARQUEE & BOTTOM CTA             */
/* -------------------------------------------------------------------------- */
export function MembershipNewsletterPartnersCtaSection() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    await fetch("/api/platform", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-enquiry",
        enquiryData: {
          enquiryType: "newsletter",
          name: "Homepage Subscriber",
          email: email.trim(),
          subject: "Homepage Newsletter Signup",
          message: "Subscribed from homepage newsletter card.",
        },
      }),
    }).catch(() => {});
    setSubscribed(true);
    setEmail("");
  };

  return (
    <div className="space-y-20 py-16 sm:py-20">
      {/* 1. Become a Member */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-[#D4AF37]/35 p-8 sm:p-12 shadow-md">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
              Membership
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold text-[#080808] mt-1">
              Become a Member of the Network
            </h2>
            <p className="text-sm sm:text-base text-neutral-600 mt-2 leading-relaxed">
              Join a community of authors, publishers, and devoted readers. A
              free account unlocks book publishing, submission tracking, and
              priority consideration for on-air features.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#D4AF37]/30 p-5">
              <BookOpen className="size-6 text-[#AA7C11]" />
              <h3 className="font-serif-display text-lg font-bold text-[#080808] mt-3">
                Publish Your Book
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Submit your book to our community shelf with cover art, ISBN,
                and direct purchase links.
              </p>
            </div>
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#D4AF37]/30 p-5">
              <Mic2 className="size-6 text-[#AA7C11]" />
              <h3 className="font-serif-display text-lg font-bold text-[#080808] mt-3">
                Get On Air
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Pitch your title for live interviews, readings, and seasonal
                author showcases.
              </p>
            </div>
            <div className="rounded-2xl bg-[#FAF8F3] border border-[#D4AF37]/30 p-5">
              <Users className="size-6 text-[#AA7C11]" />
              <h3 className="font-serif-display text-lg font-bold text-[#080808] mt-3">
                Join the Community
              </h3>
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                Save favourite books, follow authors, and receive early
                invitations to live broadcast events.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/auth?mode=register"
              className="rounded-full bg-[#080808] px-6 py-3 text-xs font-bold text-[#F7DF8B] border border-[#D4AF37]/40 hover:bg-gold-gradient hover:text-[#050505] transition-all"
            >
              Create Your Free Account
            </Link>
            <Link
              href="/auth"
              className="rounded-full border border-[#080808]/25 px-6 py-3 text-xs font-semibold text-[#080808] hover:border-[#D4AF37] transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Newsletter Split Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-[#080808] via-[#141108] to-[#080808] text-[#FAF8F3] border border-[#D4AF37]/40 p-8 sm:p-12 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-3">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#D4AF37]">
              Newsletter
            </p>
            <h2 className="font-serif-display text-3xl sm:text-4xl font-bold">
              Never Miss an Episode or a New Book
            </h2>
            <p className="text-sm text-[#FAF8F3]/75 leading-relaxed max-w-xl">
              Get weekly show schedules, featured books, and upcoming live
              author events delivered straight to your inbox.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-[#F7DF8B]">
              <span>✓ Weekly broadcast schedule</span>
              <span>✓ Hand-picked reading lists</span>
              <span>✓ Early access to live author Q&amp;As</span>
            </div>
          </div>

          <div className="lg:col-span-5">
            {subscribed ? (
              <div className="rounded-2xl bg-[#141414] border border-[#D4AF37] p-6 text-center">
                <CheckCircle2 className="size-8 text-[#D4AF37] mx-auto mb-2" />
                <p className="font-serif-display text-lg font-bold text-white">
                  You’re on the Dispatch List
                </p>
                <p className="text-xs text-white/75 mt-1">
                  Watch your inbox this Friday for the next broadcast schedule.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubscribe}
                className="rounded-2xl bg-[#050505]/90 border border-[#D4AF37]/35 p-6 space-y-3"
              >
                <label className="block text-xs font-semibold text-[#F7DF8B]">
                  Subscribe to the Weekly Dispatch
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-full bg-[#141414] border border-[#D4AF37]/35 px-4 py-3 text-sm text-[#FAF8F3] placeholder:text-white/40 focus:outline-none focus:border-[#F7DF8B]"
                />
                <button
                  type="submit"
                  className="w-full rounded-full bg-gold-gradient py-3 text-xs font-bold text-[#050505] hover:brightness-110 transition-all cursor-pointer"
                >
                  Subscribe Free
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 3. Partners Marquee */}
      <section className="overflow-hidden py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#AA7C11]">
              Partners
            </p>
            <h2 className="font-serif-display text-2xl sm:text-3xl font-bold text-[#080808]">
              Trusted by the World’s Book &amp; Audio Platforms
            </h2>
          </div>
          <Link
            href="/partners"
            className="text-xs font-bold uppercase tracking-wider text-[#080808] hover:text-[#AA7C11] inline-flex items-center gap-1"
          >
            Become a Partner <ArrowRight className="size-3.5" />
          </Link>
        </div>

        <div className="relative w-full overflow-hidden py-2">
          <div className="animate-marquee gap-4 px-4">
            {[...PARTNERS_LIST, ...PARTNERS_LIST].map((p, i) => (
              <a
                key={`${p.name}-${i}`}
                href={p.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 rounded-2xl bg-white border border-[#D4AF37]/35 px-6 py-4 shadow-xs hover:border-[#D4AF37] transition-all flex items-center gap-3"
              >
                <div className="size-9 rounded-xl bg-[#080808] text-[#F7DF8B] border border-[#D4AF37]/40 font-serif-display font-bold text-sm flex items-center justify-center">
                  {p.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#080808]">{p.name}</p>
                  <p className="text-[10px] uppercase tracking-wider text-[#AA7C11]">
                    {p.tag}
                  </p>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Bottom Get Your Book Heard CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="rounded-3xl bg-gradient-to-r from-[#060606] via-[#17130A] to-[#060606] text-[#FAF8F3] border-2 border-[#D4AF37]/50 p-10 sm:p-14 shadow-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gold-gradient px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#050505]">
            For Authors &amp; Publishers
          </span>
          <h2 className="font-serif-display text-3xl sm:text-5xl font-bold mt-4">
            Get Your Book Heard
          </h2>
          <p className="text-sm sm:text-base text-[#FAF8F3]/75 max-w-xl mx-auto mt-3 leading-relaxed">
            Are you an author or publisher? Submit your title for on-air
            interviews, live readings, and editorial review consideration.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/for-authors"
              className="rounded-full bg-gold-gradient px-7 py-3.5 text-sm font-bold text-[#050505] hover:brightness-110 transition-all"
            >
              Submit Your Book
            </Link>
            <Link
              href="/publish"
              className="rounded-full border border-[#D4AF37]/45 px-7 py-3.5 text-sm font-semibold text-[#F7DF8B] hover:border-[#F7DF8B] transition-colors"
            >
              Publish to Community Shelf
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
