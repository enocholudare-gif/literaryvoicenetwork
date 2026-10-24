import React from "react";
import Link from "next/link";
import { Mail, Megaphone, Newspaper } from "lucide-react";
import { ArticleCard } from "@/components/ui/Cards";
import { listPublicArticles } from "@/lib/services/publishing";

export const dynamic = "force-dynamic";

export default function PressReleasesPage() {
  const pressReleases = listPublicArticles({
    articleType: "press_release",
    pageSize: 30,
  }).items;

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Masthead */}
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
                <Megaphone className="w-3.5 h-3.5" />
                Official Network Dispatches
              </span>
              <h1 className="mt-2 font-serif text-3xl sm:text-5xl font-bold text-white">
                LVN Newsroom & Press Releases
              </h1>
              <p className="mt-2.5 text-sm sm:text-base text-[#FAF8F3]/80 max-w-2xl">
                Official announcements, broadcast season slates, open issue calls, and publishing advisories from Literary Voices Network.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-[#141414] border border-white/10 text-xs space-y-1">
              <span className="text-[#D4AF37] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                Media & Press Office
              </span>
              <p className="text-[#FAF8F3]/80">press@literaryvoicesnetwork.org</p>
              <Link
                href="/contact?type=partnership"
                className="text-[#F7DF8B] font-semibold hover:underline inline-block pt-1"
              >
                Submit Press Enquiry →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Press Releases Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {pressReleases.length === 0 ? (
          <div className="rounded-2xl bg-white border border-[#080808]/10 p-12 text-center">
            <Newspaper className="w-10 h-10 text-[#D4AF37] mx-auto mb-3" />
            <h2 className="font-serif text-2xl font-bold text-[#080808]">
              No press releases published yet
            </h2>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pressReleases.map((pr) => (
              <ArticleCard key={pr.id} article={pr} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

