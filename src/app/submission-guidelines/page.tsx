import React from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Feather,
  FileText,
  ShieldCheck,
} from "lucide-react";

export default function SubmissionGuidelinesPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      <section className="bg-[#080808] text-[#FAF8F3] py-14 border-b border-[#D4AF37]/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-[#D4AF37]">
            <FileText className="w-3.5 h-3.5" />
            Editorial Standards & Process
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-white">
            Submission & Editorial Guidelines
          </h1>
          <p className="text-base text-[#FAF8F3]/80 max-w-2xl">
            How to prepare and submit book listings, critical essays, short fiction, reviews, and broadcast interview pitches on Literary Voices Network.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div className="rounded-3xl bg-white border border-[#080808]/12 p-8 sm:p-10 space-y-6">
          <h2 className="font-serif text-2xl font-bold text-[#080808]">
            1. The LVN Publication Lifecycle
          </h2>
          <p className="text-sm text-[#080808]/80 leading-relaxed">
            Every member and author submission passes through a transparent seven-stage lifecycle enforced by our publishing engine:
          </p>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
            {[
              "1. Draft",
              "2. Submitted",
              "3. In Review",
              "4. Revision Requested / Approved",
              "5. Scheduled",
              "6. Published",
              "7. Archived",
            ].map((step) => (
              <span
                key={step}
                className="px-3 py-1.5 rounded-xl bg-[#F3EFE4] text-[#080808] border border-[#080808]/10"
              >
                {step}
              </span>
            ))}
          </div>
          <p className="text-xs text-[#080808]/70 leading-relaxed">
            Private drafts and internal editorial notes remain strictly confidential. Only items that have reached <strong>Published</strong> status appear in public directories, RSS feeds, or search results.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="rounded-3xl bg-white border border-[#080808]/12 p-8 space-y-4">
            <div className="flex items-center gap-2 font-serif text-xl font-bold text-[#080808]">
              <BookOpen className="w-5 h-5 text-[#AA7C11]" />
              Book Directory Submissions
            </div>
            <ul className="space-y-2.5 text-xs text-[#080808]/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11] shrink-0 mt-0.5" />
                <span>Include accurate title, subtitle, primary genre, and a 150–500 word synopsis.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11] shrink-0 mt-0.5" />
                <span>Provide a verified ISBN-13 and direct purchase links (Bookshop.org, publisher direct, or major retailers).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11] shrink-0 mt-0.5" />
                <span>Book listing approval is always distinct from full-manuscript hosting authorization.</span>
              </li>
            </ul>
            <Link
              href="/dashboard?tab=books"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA7C11] hover:underline pt-2"
            >
              Open Book Submission Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="rounded-3xl bg-white border border-[#080808]/12 p-8 space-y-4">
            <div className="flex items-center gap-2 font-serif text-xl font-bold text-[#080808]">
              <Feather className="w-5 h-5 text-[#AA7C11]" />
              Magazine Essays, Reviews & Stories
            </div>
            <ul className="space-y-2.5 text-xs text-[#080808]/80">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11] shrink-0 mt-0.5" />
                <span>Long-form essays and literary criticism: 1,200 to 4,500 words.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11] shrink-0 mt-0.5" />
                <span>Book reviews should engage deeply with style, form, and literary context.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#AA7C11] shrink-0 mt-0.5" />
                <span>Format headings, blockquotes, and emphasis cleanly using the LVN Rich-Text Studio.</span>
              </li>
            </ul>
            <Link
              href="/dashboard?tab=publications"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#AA7C11] hover:underline pt-2"
            >
              Open Article Studio <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

