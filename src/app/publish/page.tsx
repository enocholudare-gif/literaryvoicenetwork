import React from "react";
import Link from "next/link";
import { BookOpen, CheckCircle2, LayoutDashboard } from "lucide-react";

export default function PublishPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
            <BookOpen className="size-3.5 text-[#D4AF37]" />
            Community Book Publishing
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-4">
            Publish Your Book to the LVN Shelf
          </h1>
          <p className="text-base text-[#FAF8F3]/75 max-w-2xl mx-auto mt-3 leading-relaxed">
            Share your book with readers, critics, and show producers across the
            Literary Voices Network. Create drafts, attach cover art and retail
            links, and submit for editorial moderation in your Member Workspace.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3.5">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-7 py-3.5 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors"
            >
              <LayoutDashboard className="size-4" />
              Open Publishing Workspace
            </Link>
            <Link
              href="/submission-guidelines"
              className="rounded-full border border-white/25 px-6 py-3.5 text-xs font-semibold text-[#FAF8F3] hover:border-[#D4AF37] transition-colors"
            >
              Read Editorial Guidelines
            </Link>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            title: "1. Draft Your Book Listing",
            desc: "Enter your book title, subtitle, ISBN, jacket synopsis, sample excerpt, and retailer links (Amazon, Bookshop.org, Audible).",
          },
          {
            title: "2. Editorial Quality Review",
            desc: "Our editors verify bibliographic metadata, cover clarity, and excerpt formatting within 48 hours.",
          },
          {
            title: "3. Public Directory & Broadcast Eligibility",
            desc: "Approved books appear in the LVN Book Directory, Recently Added shelf, and become eligible for on-air author interviews.",
          },
        ].map((step) => (
          <div
            key={step.title}
            className="rounded-2xl bg-white border border-[#D4AF37]/30 p-6 shadow-xs"
          >
            <CheckCircle2 className="size-6 text-[#AA7C11]" />
            <h2 className="font-serif-display text-xl font-bold text-[#080808] mt-3">
              {step.title}
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              {step.desc}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
