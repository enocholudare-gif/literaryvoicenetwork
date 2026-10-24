import React from "react";
import Link from "next/link";
import { Globe, Radio } from "lucide-react";

export default function SyndicationPage() {
  return (
    <div>
      <section className="bg-gradient-to-br from-[#050505] via-[#080808] to-[#141414] text-[#FAF8F3] border-b border-[#D4AF37]/25 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#D4AF37]/45 bg-[#D4AF37]/15 px-3.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#F7DF8B]">
            <Globe className="size-3.5 text-[#D4AF37]" />
            Global Broadcast Syndication
          </span>
          <h1 className="font-serif-display text-4xl sm:text-5xl font-bold mt-4 max-w-3xl">
            Carry LVN Programming on Your Station or Campus Network
          </h1>
          <p className="text-base text-[#FAF8F3]/75 max-w-2xl mt-2">
            Public radio stations, university broadcasters, and literary
            festivals can license and syndicate weekly LVN shows across 68
            countries.
          </p>
          <div className="mt-6">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-[#D4AF37] px-6 py-3 text-xs font-bold text-[#080808] hover:bg-[#F7DF8B] transition-colors"
            >
              <Radio className="size-4" />
              Request Syndication Feed
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
