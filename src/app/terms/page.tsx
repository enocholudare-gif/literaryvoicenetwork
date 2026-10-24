import React from "react";
import { FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#FAF8F3] py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto rounded-3xl bg-white border border-[#080808]/12 p-8 sm:p-12 space-y-6">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#AA7C11]">
          <FileText className="w-4 h-4" />
          Publishing Terms & Copyright
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#080808]">
          Terms of Use & Author Rights
        </h1>
        <p className="text-xs text-[#080808]/60">Last Updated: October 2026</p>

        <div className="space-y-4 text-sm text-[#080808]/80 leading-relaxed">
          <h2 className="font-serif text-xl font-bold text-[#080808]">
            1. Author Copyright & Attribution
          </h2>
          <p>
            Authors and contributors retain full copyright and ownership of all books, excerpts, essays, stories, and reviews submitted to Literary Voices Network. By submitting content for publication, you grant LVN a non-exclusive license to display your approved listing or article with explicit attribution to your LVN author profile.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#080808] pt-2">
            2. Separation of Book Listing Approval & Manuscript Distribution
          </h2>
          <p>
            Approval of a book listing in the LVN Book Directory displays your cover image, bibliographic metadata, short excerpt, and retailer purchase links. Full-manuscript digital distribution is never enabled without separate, explicit authorization.
          </p>
          <h2 className="font-serif text-xl font-bold text-[#080808] pt-2">
            3. Editorial Moderation Standards
          </h2>
          <p>
            LVN editors reserve the right to request revisions, schedule publication dates, or decline submissions that do not meet our bibliographic or literary standards.
          </p>
        </div>
      </div>
    </div>
  );
}

